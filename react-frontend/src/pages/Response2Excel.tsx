import React, { useState } from 'react';
import { Button, message, Input, Row, Col, Typography } from 'antd';
import { DownloadOutlined, FileSearchOutlined, SettingOutlined } from '@ant-design/icons';
import { COMMON_STYLES } from '../styles/styleConstants';
import PageContainer from '../components/PageContainer';
import SectionCard from '../components/SectionCard';
import CodeInput from '../components/CodeInput';

const { Text } = Typography;

const Response2Excel: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [dataKey, setDataKey] = useState<string>('data');
  const [nameKey, setNameKey] = useState<string>('fileName');

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
    <PageContainer
      title="Response To Excel Converter"
      icon={<FileSearchOutlined />}
      footerText="Công cụ giúp parse trực tiếp kết quả từ API (JSON) có chứa nội dung tệp ở định dạng Base64."
    >
      <SectionCard title="Cấu hình Key Mapping" icon={<SettingOutlined />}>
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
      </SectionCard>

      <CodeInput
        label="Dán JSON Response vào đây:"
        value={jsonInput}
        onChange={setJsonInput}
        onClear={() => setJsonInput('')}
        placeholder={`{ \n  "${dataKey}": "base64_string_here...", \n  "${nameKey}": "report_2026" \n}`}
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
    </PageContainer>
  );
};

export default Response2Excel;