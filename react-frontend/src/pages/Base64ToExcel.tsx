import React, { useState } from 'react';
import { Button, message, Row } from 'antd';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { COMMON_STYLES, COLORS } from '../styles/styleConstants';
import PageContainer from '../components/PageContainer';
import CodeInput from '../components/CodeInput';

const Base64ToExcel: React.FC = () => {
  const [base64Input, setBase64Input] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleDownload = () => {
    let inputStr = base64Input.trim();
    if (!inputStr) {
      message.warning('Vui lòng nhập chuỗi Base64!');
      return;
    }

    if (inputStr.startsWith('data:')) {
      const parts = inputStr.split(',');
      if (parts.length > 1) {
        inputStr = parts[1];
      }
    }

    inputStr = inputStr.replace(/\s/g, '');

    setLoading(true);
    try {
      const byteCharacters = atob(inputStr);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = window.URL.createObjectURL(blob);
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
      message.error(error.message || 'Chuỗi Base64 không hợp lệ hoặc có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Base64 To Excel Converter"
      icon={<FileExcelOutlined />}
      iconColor={COLORS.success}
      footerText="Dán nội dung Base64 của tệp Excel để khôi phục lại định dạng .xlsx."
    >
      <CodeInput
        label="Nhập chuỗi Base64 vào bên dưới:"
        value={base64Input}
        onChange={setBase64Input}
        onClear={() => setBase64Input('')}
        placeholder="Nhập nội dung Base64 tại đây..."
        rows={15}
      />

      <Row justify="end">
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size="large"
          onClick={handleDownload}
          loading={loading}
          disabled={!base64Input.trim()}
          style={COMMON_STYLES.primaryButton}
        >
          Chuyển đổi & Download Excel
        </Button>
      </Row>
    </PageContainer>
  );
};

export default Base64ToExcel;
