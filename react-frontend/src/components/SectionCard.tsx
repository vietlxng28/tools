import React from 'react';
import type { ReactNode } from 'react';
import { Card, Space, Typography } from 'antd';
import { COMMON_STYLES } from '../styles/styleConstants';

const { Text } = Typography;

interface SectionCardProps {
  title?: string;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, extra, children }) => {
  return (
    <Card 
      size="small" 
      type="inner" 
      style={COMMON_STYLES.sectionCard}
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
