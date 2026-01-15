import React, { useState } from 'react';
import { Button, message, Radio, Space, Typography } from 'antd';
import { SwapOutlined, BranchesOutlined } from '@ant-design/icons';
import PageContainer from '../components/PageContainer';
import SectionCard from '../components/SectionCard';
import CodeInput from '../components/CodeInput';
import CodeDisplay from '../components/CodeDisplay';

const { Text } = Typography;

const JsonUnescape: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'unescape' | 'escape'>('unescape');

  const handleConvert = () => {
    if (!inputData.trim()) {
      message.warning('Vui lòng nhập dữ liệu!');
      return;
    }

    try {
      if (mode === 'unescape') {
        let processed = inputData;

        // Try to unescape multiple levels of escaping
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
          try {
            const parsed = JSON.parse(processed);
            // Check if it's still a string that could be parsed more
            if (typeof parsed === 'string') {
              processed = parsed;
              attempts++;
            } else {
              // Re-stringify to get clean JSON output
              setResult(JSON.stringify(parsed, null, 2));
              message.success(`Đã unescape thành công (${attempts + 1} cấp)!`);
              return;
            }
          } catch {
            // Already at lowest level, try to format if valid JSON
            try {
              const parsed = JSON.parse(processed);
              setResult(JSON.stringify(parsed, null, 2));
              message.success('Đã unescape và format JSON!');
              return;
            } catch {
              // Not valid JSON, try single unescape
              try {
                const unescaped = JSON.parse(`"${processed}"`);
                setResult(typeof unescaped === 'string' ? unescaped : JSON.stringify(unescaped, null, 2));
                message.success('Đã unescape!');
                return;
              } catch {
                message.error('Dữ liệu không hợp lệ để unescape!');
                return;
              }
            }
            return;
          }
        }

        // If we get here, we might have a circular reference or too deep
        try {
          const parsed = JSON.parse(processed);
          setResult(JSON.stringify(parsed, null, 2));
        } catch {
          setResult(processed);
        }
        message.success('Đã xử lý!');
      } else {
        // Escape mode - convert pure JSON to escaped string
        try {
          const parsed = JSON.parse(inputData);
          const escaped = JSON.stringify(JSON.stringify(parsed));
          setResult(escaped);
          message.success('Đã escape JSON!');
        } catch {
          // If not valid JSON, just escape the string itself
          const escaped = JSON.stringify(inputData);
          setResult(escaped);
          message.success('Đã escape string!');
        }
      }
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi xử lý!');
    }
  };

  return (
    <PageContainer
      title="JSON Escape/Unescape"
      icon={<BranchesOutlined />}
      footerText="Chuyển đổi JSON có escape (chuỗi escaped) thành JSON thuần và ngược lại."
    >
      <SectionCard>
        <Radio.Group
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setResult('');
          }}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="unescape">
            <SwapOutlined style={{ marginRight: 8 }} />
            Unescape (Escape → Pure)
          </Radio.Button>
          <Radio.Button value="escape">
            <SwapOutlined style={{ marginRight: 8, rotate: '180deg' }} />
            Escape (Pure → Escaped)
          </Radio.Button>
        </Radio.Group>
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          {mode === 'unescape'
            ? 'Chuyển chuỗi JSON có escape (vd: [{\"key\":\"value\"}]) thành JSON thuần (vd: [{"key":"value"}])'
            : 'Chuyển JSON thuần thành chuỗi có escape (vd: [{\"key\":\"value\"}]) để sử dụng trong code'}
        </Text>
      </SectionCard>

      <CodeInput
        label={mode === 'unescape' ? 'Nhập JSON có escape:' : 'Nhập JSON thuần:'}
        value={inputData}
        onChange={setInputData}
        onClear={() => {
          setInputData('');
          setResult('');
        }}
        placeholder={mode === 'unescape'
          ? '[{\"cap\":1,\"STT\":\"A\"}]'
          : '[{"cap":1,"STT":"A"}]'
        }
      />

      <Button
        type="primary"
        icon={<SwapOutlined />}
        size="large"
        block
        onClick={handleConvert}
        disabled={!inputData.trim()}
        style={{ marginTop: 16, marginBottom: 16 }}
      >
        {mode === 'unescape' ? 'Unescape JSON' : 'Escape JSON'}
      </Button>

      <CodeDisplay
        title={mode === 'unescape' ? 'JSON thuần (Pure JSON)' : 'JSON đã escape'}
        content={result}
        isPre
      />
    </PageContainer>
  );
};

export default JsonUnescape;
