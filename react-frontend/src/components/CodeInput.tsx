import React from 'react';
import { Button, Typography, Input } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { COMMON_STYLES } from '../styles/styleConstants';

const { Text } = Typography;
const { TextArea } = Input;

interface CodeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  rows?: number;
}

const CodeInput: React.FC<CodeInputProps> = ({ label, value, onChange, onClear, placeholder, rows = 12 }) => {
  return (
    <div>
      <div style={COMMON_STYLES.flexBetweenCenter}>
        <Text strong>{label}</Text>
        <Button
          type="primary"
          danger
          size="small"
          icon={<ClearOutlined />}
          onClick={onClear}
          style={COMMON_STYLES.borderRadius6}
        >
          Xóa sạch
        </Button>
      </div>
      <TextArea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={COMMON_STYLES.codeTextArea}
      />
    </div>
  );
};

export default CodeInput;
