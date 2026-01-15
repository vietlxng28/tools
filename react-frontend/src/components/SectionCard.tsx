import React from 'react';
import type { ReactNode } from 'react';
import { Card, Space, Typography } from 'antd';
import type { CSSProperties } from 'react';
import { COMMON_STYLES } from '../styles/styleConstants';

const { Text } = Typography;

interface SectionCardProps {
  title?: string;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, extra, children, style }) => {
  return (
    <Card 
      size="small" 
      type="inner" 
      style={{ ...COMMON_STYLES.sectionCard, ...style }}
      title={title ? (
        <Space>
          {icon} 
          <Text strong>{title}</Text>
        </Space>
      ) : undefined}
      extra={extra}
    >
      {children}
    </Card>
  );
};

export default SectionCard;
