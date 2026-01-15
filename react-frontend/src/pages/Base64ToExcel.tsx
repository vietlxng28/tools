import React, { useState } from 'react';
import { Button, Card, message, Typography, Space, Input, Row, Tooltip } from 'antd';
import { DownloadOutlined, ClearOutlined, FileExcelOutlined } from '@ant-design/icons';
import { COMMON_STYLES, COLORS } from '../styles/styleConstants';

const { Text } = Typography;
const { TextArea } = Input;

const Base64ToExcel: React.FC = () => {
  const [base64Input, setBase64Input] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleClear = () => {
    setBase64Input('');
  };

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
    <div style={COMMON_STYLES.pageContainer}>
      <Card
        title={
          <Space>
            <FileExcelOutlined style={{ ...COMMON_STYLES.titleIcon, color: COLORS.success }} />
            <Text strong>Base64 To Excel Converter</Text>
          </Space>
        }
        bordered={false}
        style={COMMON_STYLES.mainCard}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Nhập chuỗi Base64 vào bên dưới:</Text>
            <Tooltip title="Clear input">
              <Button
                type="primary"
                danger
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClear}
                style={{ borderRadius: 6 }}
              >
                Xóa
              </Button>
            </Tooltip>
          </div>

          <TextArea
            rows={15}
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder='Nhập nội dung Base64 tại đây...'
            style={COMMON_STYLES.codeTextArea}
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

        </Space>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 24, color: COLORS.textSecondary }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Dán nội dung Base64 của tệp Excel để khôi phục lại định dạng .xlsx.
        </Text>
      </div>
    </div>
  );
};

export default Base64ToExcel;
