import React, { useState } from 'react';
import { Input, Button, message, Row, Col, Typography } from 'antd';
import { SwapRightOutlined, CalculatorOutlined, SettingOutlined } from '@ant-design/icons';
import { COMMON_STYLES } from '../styles/styleConstants';
import PageContainer from '../components/PageContainer';
import SectionCard from '../components/SectionCard';
import CodeDisplay from '../components/CodeDisplay';

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

  return (
    <PageContainer
      title="Add Prefix to Expression"
      icon={<CalculatorOutlined />}
      footerText="Tùy chỉnh tiền tố và tự động định dạng khoảng cách toán tử."
    >
      <SectionCard>
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
      </SectionCard>

      <Button
        type="primary"
        icon={<SwapRightOutlined />}
        onClick={handleTransform}
        style={COMMON_STYLES.primaryButton}
        block
      >
        Generate
      </Button>

      {resultStr && <CodeDisplay title="Result" content={resultStr} type="alert" />}
    </PageContainer>
  );
};

export default AddPrefixes2Expression;