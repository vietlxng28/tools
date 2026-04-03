import React, { useState } from 'react';
import { Button, message, Checkbox, Row, Col, Typography } from 'antd';
import { ScissorOutlined } from '@ant-design/icons';
import { COMMON_STYLES } from '../styles/styleConstants';
import PageContainer from '../components/PageContainer';
import SectionCard from '../components/SectionCard';
import CodeInput from '../components/CodeInput';
import CodeDisplay from '../components/CodeDisplay';

const { Text } = Typography;

const CLEANING_OPTIONS = [
  { label: '1. Gộp nhiều dòng trống liên tiếp', value: 'mergeEmptyLines' },
  { label: '2. Xóa citation [cite:1,2,3]', value: 'removeCitation' },
  { label: '3. Xóa toàn bộ dòng trống', value: 'removeAllEmptyLines' },
  { label: '4. Xóa khoảng trắng cuối dòng', value: 'removeTrailingSpaces' },
  { label: '5. Xóa comment Java/JS (Tất cả)', value: 'removeJavaJsComments' },
  { label: '6. Xóa comment JS (Dòng đơn)', value: 'removeJsSingleLineComments' },
  { label: '7. Xóa JSX comment {} ', value: 'removeJsxComments' },
  { label: '8. Xóa console.* (JS)', value: 'removeConsoleLogs' },
  { label: '9. Xóa comment SQL', value: 'removeSqlComments' },
  { label: '10. Xóa comment HTML/XML', value: 'removeHtmlXmlComments' },
  { label: '11. Xóa comment YAML', value: 'removeYamlComments' },
  { label: '12. Xóa Emoji sinh ra bởi LLM', value: 'removeEmojis' }
];

const DataCleaner: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleClean = () => {
    let processed = inputData;
    if (!processed) {
      message.warning('Vui lòng nhập dữ liệu!');
      return;
    }

    if (!selectedOptions.length) {
      message.warning('Vui lòng chọn ít nhất một tác vụ!');
      return;
    }

    try {

      if (selectedOptions.includes('removeConsoleLogs')) {
        processed = processed.replace(/console\.(log|error|warn|info|debug|table|assert|clear|group|groupEnd|groupCollapsed)\s*\([\s\S]*?\)\s*;?/g, '');
      }

      if (selectedOptions.includes('removeJavaJsComments')) {
        processed = processed.replace(/(^|\s)\/\/(?!\s*https?:\/\/).*/gm, '$1').replace(/\/\*[\s\S]*?\*\//g, '');
      } else if (selectedOptions.includes('removeJsSingleLineComments')) {
        processed = processed.replace(/(\s*)\/\/(?!\s*https?:\/\/).*?$/gm, '$1');
      }

      if (selectedOptions.includes('removeJsxComments')) {
        processed = processed.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
      }

      if (selectedOptions.includes('removeSqlComments')) {
        processed = processed.replace(/(--.*$)|(\/\*[\s\S]*?\*\/)/gm, '');
      }

      if (selectedOptions.includes('removeHtmlXmlComments')) {
        processed = processed.replace(/<!--[\s\S]*?-->/g, '');
      }

      if (selectedOptions.includes('removeYamlComments')) {
        processed = processed.replace(/\s*#.*/g, '');
      }

      if (selectedOptions.includes('removeCitation')) {
        processed = processed.replace(/\[cite:\s*(\d+\s*,\s*)*\d+\]/g, '');
      }

      if (selectedOptions.includes('removeEmojis')) {
        processed = processed.replace(/(?:\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*)|(?:\p{Regional_Indicator}{2})|(?:[0-9#*]\uFE0F?\u20E3)/gu, '');
      }

      if (selectedOptions.includes('removeTrailingSpaces')) {
        processed = processed.replace(/[ \t]+$/gm, '');
      }

      if (selectedOptions.includes('mergeEmptyLines')) {
        processed = processed.replace(/\n(\s*\n)+/g, '\n\n');
      }

      if (selectedOptions.includes('removeAllEmptyLines')) {
        processed = processed.replace(/^\s*$\r?\n/gm, '');
      }

      setResult(processed);
      message.success('Đã định dạng và làm sạch dữ liệu!');
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi xử lý Regex!');
    }
  };

  return (
    <PageContainer
      title="Data Cleaner & Formatter"
      icon={<ScissorOutlined />}
      footerText="Công cụ làm sạch văn bản, tối lưu lượng code và văn bản thô theo các mẫu Regex biểu thức chuẩn hóa."
    >
      <SectionCard>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>Chọn các tác vụ làm sạch:</Text>
        <Checkbox.Group
          style={{ width: '100%' }}
          value={selectedOptions}
          onChange={(checkedValues) => setSelectedOptions(checkedValues as string[])}
        >
          <Row gutter={[16, 12]}>
            {CLEANING_OPTIONS.map(option => (
              <Col span={12} key={option.value}>
                <Checkbox value={option.value}>{option.label}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </SectionCard>

      <CodeInput
        label="Nhập văn bản cần xử lý:"
        value={inputData}
        onChange={setInputData}
        onClear={() => {
          setInputData('');
          setResult('');
        }}
        placeholder="Dán nội dung vào đây..."
      />

      <Button
        type="primary"
        icon={<ScissorOutlined />}
        size="large"
        block
        onClick={handleClean}
        disabled={!inputData.trim() || selectedOptions.length === 0}
        style={COMMON_STYLES.primaryButton}
      >
        Clean & Format Data
      </Button>

      <CodeDisplay title="Kết quả sau khi làm sạch" content={result} isPre />
    </PageContainer>
  );
};

export default DataCleaner;
