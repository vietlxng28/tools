import React, { useState } from 'react';
import { Upload, Button, message, Typography, Space, Tooltip, Spin, Input, Row, Col } from 'antd';
import { FileExcelOutlined, InboxOutlined, SettingOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { callAPI } from '../api/apiService';
import { ENDPOINT } from '../api/apiConfig';
import { COLORS } from '../styles/styleConstants';
import PageContainer from '../components/PageContainer';
import SectionCard from '../components/SectionCard';
import CodeDisplay from '../components/CodeDisplay';

const { Text } = Typography;
const { Dragger } = Upload;

const Excel2Json: React.FC = () => {
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [colIndexesStr, setColIndexesStr] = useState<string>('');
  const [customKeysStr, setCustomKeysStr] = useState<string>('');

  const handleUpload = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    let keysCount = 0;
    if (customKeysStr.trim()) {
      const keys = customKeysStr.split(/[,;]+/).filter(Boolean);
      keysCount = keys.length;
      keys.forEach(key => formData.append('customKeys', key.trim()));
    }

    if (colIndexesStr.trim()) {
      const normalizedStr = colIndexesStr.replace(/->/g, '-').replace(/\s*-\s*/g, '-');
      const tokens = normalizedStr.split(/[,;\s]+/).filter(Boolean);
      const indexes: string[] = [];
      tokens.forEach(token => {
        if (token.includes('-')) {
          const [startStr, endStr] = token.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
              indexes.push(i.toString());
            }
          }
        } else {
          const num = parseInt(token, 10);
          if (!isNaN(num)) indexes.push(num.toString());
        }
      });
      Array.from(new Set(indexes)).forEach(idx => formData.append('columnIndexes', idx));
    } else if (keysCount > 0) {
      for (let i = 0; i < keysCount; i++) {
        formData.append('columnIndexes', i.toString());
      }
    }

    try {
      const data = await callAPI(ENDPOINT.UPLOAD_EXCEL, formData);
      setJsonData(data);
      message.success('Đã xử lý dữ liệu thành công!');
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data || error.message || 'Có lỗi xảy ra khi upload!');
      setJsonData(null);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleReload = () => {
    if (fileList.length === 0) {
      message.warning('Chưa có file nào được upload!');
      return;
    }
    const currentFile = fileList[0] as unknown as File;
    const actualFile = (fileList[0].originFileObj || currentFile) as File;

    if (actualFile) {
      handleUpload(actualFile);
    }
  };

  const handleRemoveFile = () => {
    setFileList([]);
    setJsonData(null);
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    disabled: loading,
    showUploadList: false,
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isExcel) {
        message.error('Bạn chỉ có thể upload file Excel (.xlsx)!');
        return Upload.LIST_IGNORE;
      }

      setJsonData(null);
      setFileList([file]);
      handleUpload(file);
      return false;
    },
  };

  return (
    <PageContainer
      title="Excel To JSON Parser"
      icon={<FileExcelOutlined />}
      iconColor={COLORS.success}
      footerText="Đảm bảo file Excel có định dạng tiêu chuẩn. Công cụ hỗ trợ trích lọc cột và đặt tên key tùy chỉnh."
    >
      <SectionCard 
        title="Cấu hình Mapping" 
        icon={<SettingOutlined />}
        extra={
          <Tooltip title="Áp dụng cấu hình mới cho file hiện tại">
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={handleReload}
              disabled={fileList.length === 0 || loading}
              style={{ borderRadius: 6 }}
            >
              Áp dụng & Parse lại
            </Button>
          </Tooltip>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Text strong>1. Chỉ lấy các cột (Index từ 0):</Text>
              <Input
                style={{ marginTop: '8px', borderRadius: 8 }}
                placeholder="VD: 0, 1, 4, hoặc 0 -> 9 (để trống lấy tất cả)"
                value={colIndexesStr}
                onChange={e => setColIndexesStr(e.target.value)}
                onPressEnter={handleReload}
                allowClear
                disabled={loading}
              />
            </Col>
            <Col xs={24} md={12}>
              <Text strong>2. Đặt tên key JSON (tương ứng thứ tự):</Text>
              <Input
                style={{ marginTop: '8px', borderRadius: 8 }}
                placeholder="VD: fullName, age, email"
                value={customKeysStr}
                onChange={e => setCustomKeysStr(e.target.value)}
                onPressEnter={handleReload}
                allowClear
                disabled={loading}
              />
            </Col>
          </Row>
        </Space>
      </SectionCard>

      <Spin spinning={loading} tip="Đang xử lý file...">
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
              Hỗ trợ định dạng .xlsx. File sẽ được parse sang JSON tự động.
            </p>
          </Dragger>
        ) : (
          <SectionCard>
            <Row align="middle" justify="space-between">
              <Col>
                <Space size="large">
                  <FileExcelOutlined style={{ fontSize: '32px', color: COLORS.success }} />
                  <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: '16px' }}>{fileList[0].name}</Text>
                    <Text type="secondary">Đã upload thành công</Text>
                  </Space>
                </Space>
              </Col>
              <Col>
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveFile}
                  style={{ borderRadius: 6 }}
                >
                  Xóa & Chọn file khác
                </Button>
              </Col>
            </Row>
          </SectionCard>
        )}
      </Spin>

      {jsonData && (
        <SectionCard 
          title={`Kết quả JSON (${jsonData.length} records)`} 
          icon={<FileExcelOutlined style={{ color: COLORS.success }} />}
        >
          <CodeDisplay content={JSON.stringify(jsonData, null, 2)} isPre title="" />
        </SectionCard>
      )}
    </PageContainer>
  );
};

export default Excel2Json;