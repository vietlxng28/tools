import React, { useState } from 'react';
import { Button, Card, message, Typography, Space, Input, Row, Col, Divider, Tooltip } from 'antd';
import { CopyOutlined, ClearOutlined, FormatPainterOutlined, CompressOutlined, CodeOutlined } from '@ant-design/icons';
import { COMMON_STYLES, COLORS } from '../styles/styleConstants';

const { Text } = Typography;
const { TextArea } = Input;

const JsonStringify: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const getParsedData = (input: string) => {
    try {
      if (!input.trim()) return null;
      return JSON.parse(input);
    } catch (e) {
      message.error('JSON không hợp lệ! Vui lòng kiểm tra lại.');
      return null;
    }
  };

  const handleFormat = () => {
    const parsed = getParsedData(jsonInput);
    if (parsed) {
      setResult(JSON.stringify(parsed, null, 2));
      message.success('Đã Format JSON!');
    }
  };

  const handleStringify = () => {
    const parsed = getParsedData(jsonInput);
    if (parsed) {
      setResult(JSON.stringify(parsed));
      message.success('Đã nén JSON thành 1 dòng!');
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      message.success('Đã copy kết quả!');
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setResult('');
  };

  return (
    <div style={COMMON_STYLES.pageContainer}>
      <Card
        title={
          <Space>
            <CodeOutlined style={{ ...COMMON_STYLES.titleIcon, color: COLORS.primary }} />
            <Text strong>JSON Stringify & Format</Text>
          </Space>
        }
        bordered={false}
        style={COMMON_STYLES.mainCard}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
              <Text strong>Nhập nội dung JSON:</Text>
              <Button
                type="primary"
                danger
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClear}
                style={{ borderRadius: 6 }}
              >
                Xóa sạch
              </Button>
            </div>
            <TextArea
              rows={12}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"key": "value"}'
              style={COMMON_STYLES.codeTextArea}
            />
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Button
                type="default"
                icon={<FormatPainterOutlined />}
                size="large"
                block
                onClick={handleFormat}
                disabled={!jsonInput.trim()}
                style={{ ...COMMON_STYLES.secondaryButton, height: 48, fontWeight: 500 }}
              >
                Format (Làm đẹp)
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                icon={<CompressOutlined />}
                size="large"
                block
                onClick={handleStringify}
                disabled={!jsonInput.trim()}
                style={COMMON_STYLES.primaryButton}
              >
                Stringify (Nén)
              </Button>
            </Col>
          </Row>

          {result && (
            <div style={{ marginTop: 8 }}>
              <Divider>Kết quả</Divider>
              <div style={{ position: 'relative' }}>
                <pre style={COMMON_STYLES.codeDisplay}>
                  {result}
                </pre>
                <Tooltip title="Copy kết quả">
                  <Button
                    type="default"
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                    style={{ position: 'absolute', right: 12, top: 12, borderRadius: 6 }}
                  >
                    Copy
                  </Button>
                </Tooltip>
              </div>
            </div>
          )}
        </Space>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 24, color: COLORS.textSecondary }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Dùng <b>Format</b> để dàn hàng JSON, <b>Stringify</b> để nén gọn toàn bộ thành 1 dòng duy nhất.
        </Text>
      </div>
    </div>
  );
};

export default JsonStringify;