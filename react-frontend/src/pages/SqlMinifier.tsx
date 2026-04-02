import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, Divider, message, Tooltip } from 'antd';
import { CopyOutlined, ClearOutlined, CompressOutlined, DatabaseOutlined } from '@ant-design/icons';
import { COMMON_STYLES, COLORS } from '../styles/styleConstants';

const { Text } = Typography;
const { TextArea } = Input;

const SqlMinifier: React.FC = () => {
  const [sqlInput, setSqlInput] = useState('');
  const [result, setResult] = useState('');

  const handleMinify = () => {
    let input = sqlInput.trim();
    if (!input) {
      message.warning('Vui lòng nhập SQL query!');
      return;
    }

    try {
      let minified = input;
      
      minified = minified.replace(/\/\*[\s\S]*?\*\//gm, '');
      minified = minified.replace(/--.*$/gm, '');         

      minified = minified
        .replace(/\s+/g, ' ')       
        .replace(/\s*([,;()=<>!+*/-])\s*/g, '$1')
        .trim();

      setResult(minified);
      message.success('Đã nén SQL thành công!');
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi xử lý SQL!');
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      message.success('Đã copy kết quả vào clipboard!');
    }
  };

  const handleClear = () => {
    setSqlInput('');
    setResult('');
  };

  return (
    <div style={COMMON_STYLES.pageContainer}>
      <Card
        title={
          <Space>
            <DatabaseOutlined style={{ ...COMMON_STYLES.titleIcon, color: COLORS.primary }} />
            <Text strong>SQL Minifier (Compressor)</Text>
          </Space>
        }
        bordered={false}
        style={COMMON_STYLES.mainCard}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 12,
              alignItems: 'center'
            }}>
              <Text strong>Nhập SQL Query của bạn:</Text>
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
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="SELECT * FROM users WHERE id = 1; -- example comment"
              style={COMMON_STYLES.codeTextArea}
            />
          </div>

          <Button
            type="primary"
            icon={<CompressOutlined />}
            size="large"
            block
            onClick={handleMinify}
            disabled={!sqlInput.trim()}
            style={COMMON_STYLES.primaryButton}
          >
            Minify SQL
          </Button>

          {result && (
            <div style={{ marginTop: 8 }}>
              <Divider>Kết quả nén</Divider>
              <div style={{ position: 'relative' }}>
                <div style={{ ...COMMON_STYLES.codeDisplay, wordBreak: 'break-all', minHeight: '60px' }}>
                  {result}
                </div>
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
          Công cụ nén SQL tự động loại bỏ comment, khoảng trắng thừa và xuống dòng để tối ưu hóa query.
        </Text>
      </div>
    </div>
  );
};

export default SqlMinifier;