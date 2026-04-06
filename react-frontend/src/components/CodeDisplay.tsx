import React from 'react';
import { Button, Divider, Tooltip, message, Alert, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { COMMON_STYLES } from '../styles/styleConstants';

const { Text } = Typography;

interface CodeDisplayProps {
  title?: string;
  content: string;
  isPre?: boolean;
  type?: 'default' | 'alert';
  copyContent?: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ title = 'Kết quả', content, isPre = false, type = 'default', copyContent }) => {
  const handleCopy = () => {
    const textToCopy = copyContent !== undefined ? copyContent : content;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      message.success('Đã copy kết quả!');
    }
  };

  if (!content) return null;

  if (type === 'alert') {
    return (
      <div style={COMMON_STYLES.marginTop8}>
        <Divider />
        <div style={COMMON_STYLES.relativeContainer}>
          {title && <Text strong style={{ fontSize: 16 }}>{title}</Text>}
          <Alert
            message={
              <Text code style={{ fontSize: 18, display: 'block', padding: 8 }}>
                {content}
              </Text>
            }
            type="success"
            style={COMMON_STYLES.alertBlock}
          />
          <Tooltip title="Copy to clipboard">
            <Button
              type="default"
              icon={<CopyOutlined />}
              onClick={handleCopy}
              style={title ? COMMON_STYLES.copyButtonAlertWithTitle : COMMON_STYLES.copyButtonAlertNoTitle}
            >
              Copy
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div style={COMMON_STYLES.marginTop8}>
      <Divider>{title}</Divider>
      <div style={COMMON_STYLES.relativeContainer}>
        {isPre ? (
          <pre style={COMMON_STYLES.codeDisplayPre}>
            {content}
          </pre>
        ) : (
          <div style={COMMON_STYLES.codeDisplayDiv}>
            {content}
          </div>
        )}
        <Tooltip title="Copy kết quả">
          <Button
            type="default"
            icon={<CopyOutlined />}
            onClick={handleCopy}
            style={COMMON_STYLES.copyButton}
          >
            Copy
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default CodeDisplay;
