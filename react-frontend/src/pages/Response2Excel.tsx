import React, { useState } from 'react';
import { Button, Card, message, Typography, Space, Input, Row, Col } from 'antd';
import { DownloadOutlined, ClearOutlined, SettingOutlined, FileSearchOutlined } from '@ant-design/icons';
import { COMMON_STYLES, COLORS } from '../styles/styleConstants';

const { Text } = Typography;
const { TextArea } = Input;

const Response2Excel: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [dataKey, setDataKey] = useState<string>('data');
  const [nameKey, setNameKey] = useState<string>('fileName');

  const handleClear = () => {
    setJsonInput('');
  };

  const handleDownload = () => {
    const rawInput = jsonInput.trim();
    if (!rawInput) {
      message.warning('Vui lòng nhập nội dung JSON response!');
      return;
    }
    setLoading(true);
    try {
      const parsedResponse = JSON.parse(rawInput);
      let base64Str = parsedResponse[dataKey];
      let fileName = parsedResponse[nameKey] || 'download_data';
      if (!base64Str) {
        throw new Error(`Không tìm thấy key "${dataKey}" trong JSON!`);
      }
      if (base64Str.startsWith('data:')) {
        const parts = base64Str.split(',');
        if (parts.length > 1) base64Str = parts[1];
      }
      base64Str = base64Str.replace(/\s/g, '');
      const byteCharacters = atob(base64Str);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const finalFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
      link.setAttribute('download', finalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Chuyển đổi và tải file thành công!');
    } catch (error: any) {
      console.error(error);
      message.error(error.message || 'JSON không hợp lệ hoặc lỗi cấu trúc Base64!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={COMMON_STYLES.pageContainer}>
      <Card
        title={
          <Space>
            <FileSearchOutlined style={{ ...COMMON_STYLES.titleIcon, color: COLORS.primary }} />
            <Text strong>Response To Excel Converter</Text>
          </Space>
        }
        bordered={false}
        style={COMMON_STYLES.mainCard}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>

          <Card
            size="small"
            type="inner"
            title={<Space><SettingOutlined /> <Text strong>Cấu hình Key Mapping</Text></Space>}
            style={COMMON_STYLES.sectionCard}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Text strong>Key chứa Base64:</Text>
                <Input
                  value={dataKey}
                  onChange={e => setDataKey(e.target.value)}
                  placeholder="e.g. data, content, base64"
                  style={{ marginTop: 8, borderRadius: 8 }}
                />
              </Col>
              <Col span={12}>
                <Text strong>Key chứa Tên file:</Text>
                <Input
                  value={nameKey}
                  onChange={e => setNameKey(e.target.value)}
                  placeholder="e.g. fileName, title, name"
                  style={{ marginTop: 8, borderRadius: 8 }}
                />
              </Col>
            </Row>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <Text strong>Dán JSON Response vào đây:</Text>
            <Button
              type="primary"
              danger
              icon={<ClearOutlined />}
              onClick={handleClear}
              size="small"
              style={{ borderRadius: 6 }}
            >
              Xóa sạch
            </Button>
          </div>

          <TextArea
            rows={12}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{ \n  "${dataKey}": "base64_string_here...", \n  "${nameKey}": "report_2026" \n}`}
            style={COMMON_STYLES.codeTextArea}
          />

          <Row justify="end">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              onClick={handleDownload}
              loading={loading}
              disabled={!jsonInput.trim()}
              style={COMMON_STYLES.primaryButton}
            >
              Trích xuất & Tải Excel
            </Button>
          </Row>
        </Space>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 24, color: COLORS.textSecondary }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Công cụ giúp parse trực tiếp kết quả từ API (JSON) có chứa nội dung tệp ở định dạng Base64.
        </Text>
      </div>
    </div>
  );
};

export default Response2Excel;