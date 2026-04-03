import React, { useState } from 'react';
import { Button, message, Row, Col } from 'antd';
import { FormatPainterOutlined, CompressOutlined, CodeOutlined } from '@ant-design/icons';
import { COMMON_STYLES } from '../styles/styleConstants';
import PageContainer from '../components/PageContainer';
import CodeInput from '../components/CodeInput';
import CodeDisplay from '../components/CodeDisplay';

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

  return (
    <PageContainer
      title="JSON Stringify & Format"
      icon={<CodeOutlined />}
      footerText={<span>Dùng <b>Format</b> để dàn hàng JSON, <b>Stringify</b> để nén gọn toàn bộ thành 1 dòng duy nhất.</span> as any}
    >
      <CodeInput
        label="Nhập nội dung JSON:"
        value={jsonInput}
        onChange={setJsonInput}
        onClear={() => {
          setJsonInput('');
          setResult('');
        }}
        placeholder='{"key": "value"}'
      />

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

      <CodeDisplay title="Kết quả" content={result} isPre />
    </PageContainer>
  );
};

export default JsonStringify;