import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, Alert, Divider, message, Row, Col, Tooltip } from 'antd';
import { SwapRightOutlined, CopyOutlined, CalculatorOutlined, SettingOutlined } from '@ant-design/icons';
import { COMMON_STYLES, COLORS } from '../styles/styleConstants';

const { Text } = Typography;

const AddPrefixes2Expression: React.FC = () => {
  const [inputStr, setInputStr] = useState('');
  const [resultStr, setResultStr] = useState('');

  const [prefix, setPrefix] = useState('DONG_DU_LIEU');

  const handleTransform = () => {
    if (!inputStr) {
      setResultStr('');
      return;
    }

    if (!/^[\d\s+-]+$/.test(inputStr)) {
      message.error("Input contains invalid characters. Only numbers, +, and - are allowed.");
      setResultStr('');
      return;
    }

    const parts = inputStr.split(/([+-])/);

    const transformedParts = parts.map(part => {
      const trimmed = part.trim();
      if (!trimmed) return '';

      if (trimmed === '+' || trimmed === '-') {
        return ` ${trimmed} `;
      }

      if (/^\d+$/.test(trimmed)) {

        const currentPrefix = prefix.trim() ? `${prefix.trim()}_` : '';
        return `${currentPrefix}${trimmed}`;
      }

      return trimmed;
    });

    setResultStr(transformedParts.join('').trim());
  };

  const handleCopy = () => {
    if (resultStr) {
      navigator.clipboard.writeText(resultStr);
      message.success("Copied to clipboard!");
    }
  };

  return (
    <div style={COMMON_STYLES.pageContainer}>
      <Card
        title={
          <Space>
            <CalculatorOutlined style={{ ...COMMON_STYLES.titleIcon, color: COLORS.primary }} />
            <Text strong>Add Prefix to Expression</Text>
          </Space>
        }
        bordered={false}
        style={COMMON_STYLES.mainCard}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card size="small" type="inner" style={COMMON_STYLES.sectionCard}>
            <Row gutter={24}>
              <Col span={8}>
                <Text strong><SettingOutlined /> Prefix (Tiền tố)</Text>
                <Input
                  placeholder="e.g. DONG_DU_LIEU"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  style={{ marginTop: 8, borderRadius: 8 }}
                />
              </Col>
              <Col span={16}>
                <Text strong>Input Sequence</Text>
                <Input
                  placeholder="e.g. 1+2-3"
                  value={inputStr}
                  onChange={(e) => setInputStr(e.target.value)}
                  onPressEnter={handleTransform}
                  style={{ marginTop: 8, borderRadius: 8 }}
                />
              </Col>
            </Row>
          </Card>

          <Button
            type="primary"
            icon={<SwapRightOutlined />}
            onClick={handleTransform}
            style={COMMON_STYLES.primaryButton}
            block
          >
            Generate
          </Button>

          {resultStr && (
            <>
              <Divider />
              <div style={{ position: 'relative' }}>
                <Text strong style={{ fontSize: 16 }}>Result</Text>
                <Alert
                  message={
                    <Text code style={{ fontSize: 18, display: 'block', padding: 8 }}>
                      {resultStr}
                    </Text>
                  }
                  type="success"
                  style={{
                    marginTop: 8,
                    borderRadius: 12,
                    border: `1px solid ${COLORS.success}`,
                    background: '#f6ffed'
                  }}
                />
                <Tooltip title="Copy to clipboard">
                  <Button
                    type="default"
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 42
                    }}
                  >
                    Copy
                  </Button>
                </Tooltip>
              </div>
            </>
          )}
        </Space>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 24, color: COLORS.textSecondary }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Tùy chỉnh tiền tố và tự động định dạng khoảng cách toán tử.
        </Text>
      </div>
    </div>
  );
};

export default AddPrefixes2Expression;