import React, { useState } from 'react';
import { Button, message, Row } from 'antd';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { COMMON_STYLES } from '../styles/styleConstants';
import { callAPI } from '../api/apiService';
import { ENDPOINT } from '../api/apiConfig';
import PageContainer from '../components/PageContainer';
import CodeInput from '../components/CodeInput';

const Json2Excel: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleDownload = async () => {
    if (!jsonInput.trim()) {
      message.warning('Vui lòng nhập JSON!');
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData)) {
        message.warning('JSON phải là một mảng các đối tượng (Array of Objects)!');
        return;
      }
    } catch (error) {
      message.error('JSON không đúng định dạng!');
      return;
    }

    setLoading(true);
    try {
      const response = await callAPI(
        { ...ENDPOINT.JSON_TO_EXCEL, responseType: 'blob' } as any,
        parsedData
      );

      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Download thành công!');
    } catch (error: any) {
      console.error(error);
      message.error(error.message || 'Có lỗi xảy ra khi download!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="JSON To Excel Converter"
      icon={<FileExcelOutlined />}
      footerText="Dán một mảng JSON các đối tượng để tự động tạo tệp Excel với các cột tương ứng với key của JSON."
    >
      <CodeInput
        label="Nhập JSON (Array of Objects) vào bên dưới:"
        value={jsonInput}
        onChange={setJsonInput}
        onClear={() => setJsonInput('')}
        placeholder='[ {"name": "A", "age": 20}, {"name": "B", "age": 25} ]'
        rows={15}
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
          Chuyển đổi & Download Excel
        </Button>
      </Row>
    </PageContainer>
  );
};

export default Json2Excel;
