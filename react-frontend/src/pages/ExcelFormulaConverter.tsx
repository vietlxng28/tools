import React, { useState } from 'react';
import { Upload, Button, message, Typography, Space, Spin, Select, Row, Col, Alert } from 'antd';
import { FileExcelOutlined, InboxOutlined, SettingOutlined, SwapOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { callAPI } from '../api/apiService';
import { ENDPOINT } from '../api/apiConfig';
import { COLORS, COMMON_STYLES } from '../styles/styleConstants';
import PageContainer from '../components/PageContainer';
import SectionCard from '../components/SectionCard';

const { Text, Paragraph } = Typography;
const { Dragger } = Upload;

const ExcelFormulaConverter: React.FC = () => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [processing, setProcessing] = useState<boolean>(false);

    const [sourceCol, setSourceCol] = useState<string>('');
    const [targetCol, setTargetCol] = useState<string>('');
    const [formulaCol, setFormulaCol] = useState<string>('');

    const parseHeadersLocally = async (file: File) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const data = await callAPI(ENDPOINT.UPLOAD_EXCEL, formData);
            if (data && data.length > 0) {
                const keys = Object.keys(data[0]);
                setHeaders(keys);

                const lowerKeys = keys.map(k => k.toLowerCase());

                const srcIdx = lowerKeys.findIndex(k => k.includes('ma_chi_tieu_hien_thi'));
                if (srcIdx !== -1) setSourceCol(keys[srcIdx]);

                const tgtIdx = lowerKeys.findIndex(k => k.includes('ma_hang'));
                if (tgtIdx !== -1) setTargetCol(keys[tgtIdx]);

                let formIdx = lowerKeys.findIndex(k => k.includes('cong_thuc_tn'));

                if (formIdx === -1) {
                    formIdx = lowerKeys.findIndex(k => k.includes('cong_thuc'));
                }

                if (formIdx !== -1) setFormulaCol(keys[formIdx]);
            } else {
                message.warning('File Excel trống hoặc không đọc được tiêu đề!');
            }
        } catch (error: any) {
            console.error(error);
            message.error('Không thể đọc danh sách cột từ file Excel!');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFile = () => {
        setFileList([]);
        setHeaders([]);
        setSourceCol('');
        setTargetCol('');
        setFormulaCol('');
    };

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        fileList,
        disabled: loading || processing,
        showUploadList: false,
        beforeUpload: (file) => {
            const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
            if (!isExcel) {
                message.error('Bạn chỉ có thể upload file Excel (.xlsx hoặc .xls)!');
                return Upload.LIST_IGNORE;
            }

            setFileList([file]);
            parseHeadersLocally(file);
            return false;
        },
    };

    const handleConvert = async () => {
        if (fileList.length === 0) {
            message.warning('Vui lòng chọn file Excel trước!');
            return;
        }
        if (!sourceCol || !targetCol || !formulaCol) {
            message.warning('Vui lòng chọn đầy đủ 3 cột cấu hình: Cột Mã nguồn, Cột Mã đích và Cột Công thức!');
            return;
        }

        setProcessing(true);
        const file = (fileList[0].originFileObj || fileList[0]) as File;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sourceCol', sourceCol);
        formData.append('targetCol', targetCol);
        formData.append('formulaCol', formulaCol);

        try {
            const response = await callAPI(
                { ...ENDPOINT.UPDATE_EXCEL_FORMULA, responseType: 'blob' } as any,
                formData
            );

            const url = window.URL.createObjectURL(new Blob([response as any]));
            const link = document.createElement('a');
            link.href = url;

            const outputFilename = file.name.replace(/\.xlsx?$/, '_updated.xlsx');
            link.setAttribute('download', outputFilename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            message.success('Chuyển đổi công thức và Tải file Excel thành công!');
        } catch (error: any) {
            console.error(error);
            message.error(error.message || 'Lỗi xảy ra trong quá trình xử lý công thức!');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <PageContainer
            title="Excel Formula Converter"
            icon={<SwapOutlined />}
            iconColor={COLORS.primary}
            footerText="Thay thế các mã trong cột công thức (CONG_THUC_TN) dựa trên bản đồ ánh xạ linh hoạt."
        >
            <Alert
                title="Hướng dẫn sử dụng"
                description={
                    <Paragraph style={{ margin: 0 }}>
                        Công cụ này hỗ trợ đọc file Excel, xây dựng bản đồ ánh xạ từ <b>Cột Mã nguồn</b> (ví dụ: MA_CHI_TIEU_HIEN_THI) sang <b>Cột Mã đích</b> (ví dụ: MA_HANG).
                        Sau đó, ứng dụng sẽ quét <b>Cột Công thức</b> (ví dụ: CONG_THUC_TN), tự động thay thế các mã nguồn thành mã đích tương ứng và lưu kết quả vào một cột mới tên là <b>&lt;Tên cột công thức&gt;_NEW</b>.
                    </Paragraph>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24, borderRadius: 8 }}
            />

            <Spin spinning={loading} tip="Đang đọc danh sách cột từ file Excel...">
                {fileList.length === 0 ? (
                    <Dragger
                        {...uploadProps}
                        style={{
                            padding: '32px',
                            background: COLORS.bgInput,
                            border: `2px dashed ${COLORS.border}`,
                            borderRadius: 12
                        }}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ color: COLORS.primary, fontSize: '48px' }} />
                        </p>
                        <p className="ant-upload-text" style={{ fontSize: '16px', fontWeight: 500 }}>
                            Kéo thả hoặc click để upload file Excel
                        </p>
                        <p className="ant-upload-hint" style={{ color: COLORS.textSecondary }}>
                            Hỗ trợ định dạng .xlsx hoặc .xls
                        </p>
                    </Dragger>
                ) : (
                    <SectionCard title="Tệp đã chọn">
                        <Row align="middle" justify="space-between">
                            <Col>
                                <Space size="large">
                                    <FileExcelOutlined style={{ fontSize: '32px', color: COLORS.success }} />
                                    <Space orientation="vertical" size={0}>
                                        <Text strong style={{ fontSize: '16px' }}>{fileList[0].name}</Text>
                                        <Text type="secondary">Sẵn sàng để cấu hình và xử lý</Text>
                                    </Space>
                                </Space>
                            </Col>
                            <Col>
                                <Button
                                    type="default"
                                    danger
                                    onClick={handleRemoveFile}
                                    disabled={processing}
                                    style={{ borderRadius: 6 }}
                                >
                                    Chọn file khác
                                </Button>
                            </Col>
                        </Row>
                    </SectionCard>
                )}
            </Spin>

            {headers.length > 0 && (
                <SectionCard
                    title="Cấu hình ánh xạ & Cột xử lý"
                    icon={<SettingOutlined />}
                    style={{ marginTop: 24 }}
                >
                    <Row gutter={[24, 16]}>
                        <Col xs={24} md={8}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>1. Cột Mã nguồn (Cũ):</Text>
                            <Select
                                placeholder="Chọn cột chứa mã cũ (ví dụ: MA_CHI_TIEU_HIEN_THI)"
                                value={sourceCol || undefined}
                                onChange={setSourceCol}
                                style={{ width: '100%' }}
                            >
                                {headers.map(h => (
                                    <Select.Option key={h} value={h}>{h}</Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} md={8}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>2. Cột Mã đích (Mới):</Text>
                            <Select
                                placeholder="Chọn cột chứa mã mới thay thế (ví dụ: MA_HANG)"
                                value={targetCol || undefined}
                                onChange={setTargetCol}
                                style={{ width: '100%' }}
                            >
                                {headers.map(h => (
                                    <Select.Option key={h} value={h}>{h}</Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} md={8}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>3. Cột Công thức:</Text>
                            <Select
                                placeholder="Chọn cột chứa công thức (ví dụ: CONG_THUC_TN)"
                                value={formulaCol || undefined}
                                onChange={setFormulaCol}
                                style={{ width: '100%' }}
                            >
                                {headers.map(h => (
                                    <Select.Option key={h} value={h}>{h}</Select.Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>

                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        size="large"
                        block
                        loading={processing}
                        disabled={!sourceCol || !targetCol || !formulaCol}
                        onClick={handleConvert}
                        style={{ ...COMMON_STYLES.primaryButton, marginTop: 24 }}
                    >
                        Thực hiện Chuyển đổi & Tải xuống Excel
                    </Button>
                </SectionCard>
            )}
        </PageContainer>
    );
};

export default ExcelFormulaConverter;
