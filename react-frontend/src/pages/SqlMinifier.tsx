import React, { useState } from 'react';
import { Button, message } from 'antd';
import { CompressOutlined } from '@ant-design/icons';
import { COMMON_STYLES } from '../styles/styleConstants';
import PageContainer from '../components/PageContainer';
import CodeInput from '../components/CodeInput';
import CodeDisplay from '../components/CodeDisplay';

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

  return (
    <PageContainer
      title="SQL Minifier (Compressor)"
      icon={<CompressOutlined />} 
      footerText="Công cụ nén SQL tự động loại bỏ comment, khoảng trắng thừa và xuống dòng để tối ưu hóa query."
    >
      <CodeInput
        label="Nhập SQL Query của bạn:"
        value={sqlInput}
        onChange={setSqlInput}
        onClear={() => {
          setSqlInput('');
          setResult('');
        }}
        placeholder="SELECT * FROM users WHERE id = 1; -- example comment"
      />

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

      <CodeDisplay title="Kết quả nén" content={result} />
    </PageContainer>
  );
};

export default SqlMinifier;