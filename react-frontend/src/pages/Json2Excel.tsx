import React, { useState } from 'react';
import { Button, Card, message, Typography, Space, Input, Row, Tooltip } from 'antd';
import { DownloadOutlined, ClearOutlined, FormatPainterOutlined, FileExcelOutlined } from '@ant-design/icons';
import { callAPI } from '../api/apiService';
import { ENDPOINT } from '../api/apiConfig';
import { COMMON_STYLES, COLORS } from '../styles/styleConstants';

const { Text } = Typography;
const { TextArea } = Input;

const Json2Excel: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFormatJson = () => {
    try {
      if (!jsonInput.trim()) return;
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      message.success('Đã format JSON!');
    } catch (error) {
      message.error('JSON không hợp lệ!');
    }
  };

  const handleClear = () => {
    setJsonInput('');
  };

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

      const url = window.URL.createObjectURL(new Blob([response]));
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
    <div style={COMMON_STYLES.pageContainer}>
      <Card
        title={
          <Space>
            <FileExcelOutlined style={{ ...COMMON_STYLES.titleIcon, color: COLORS.primary }} />
            <Text strong>JSON To Excel Converter</Text>
          </Space>
        }
        bordered={false}
        style={COMMON_STYLES.mainCard}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Nhập JSON (Array of Objects) vào bên dưới:</Text>
            <Space>
              <Tooltip title="Format code">
                <Button
                  type="default"
                  icon={<FormatPainterOutlined />}
                  onClick={handleFormatJson}
                  style={{ borderRadius: 6 }}
                >
                  Format JSON
                </Button>
              </Tooltip>
              <Tooltip title="Clear input">
                <Button
                  type="primary"
                  danger
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                  style={{ borderRadius: 6 }}
                >
                  Xóa
                </Button>
              </Tooltip>
            </Space>
          </div>

          <TextArea
            rows={15}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[ {"name": "A", "age": 20}, {"name": "B", "age": 25} ]'
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
              Chuyển đổi & Download Excel
            </Button>
          </Row>

        </Space>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 24, color: COLORS.textSecondary }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Dán một mảng JSON các đối tượng để tự động tạo tệp Excel với các cột tương ứng với key của JSON.
        </Text>
      </div>
    </div>
  );
};

export default Json2Excel;
