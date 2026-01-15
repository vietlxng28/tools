import React from 'react';
import type { ReactNode } from 'react';
import { Card, Space, Typography } from 'antd';
import { COMMON_STYLES, COLORS } from '../styles/styleConstants';

const { Text } = Typography;

interface PageContainerProps {
  title: string;
  icon: ReactNode;
  iconColor?: string;
  footerText?: string;
  children: ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ title, icon, iconColor = COLORS.primary, footerText, children }) => {
  return (
    <div style={COMMON_STYLES.pageContainer}>
      <Card
        title={
          <Space>
            {React.isValidElement(icon) ? React.cloneElement(icon, { style: { ...COMMON_STYLES.titleIcon, color: iconColor } } as any) : icon}
            <Text strong>{title}</Text>
          </Space>
        }
        bordered={false}
        style={COMMON_STYLES.mainCard}
      >
        <Space direction="vertical" size="large" style={COMMON_STYLES.fullWidth}>
          {children}
        </Space>
      </Card>
      {footerText && (
        <div style={COMMON_STYLES.footerContainer}>
          <Text type="secondary" style={COMMON_STYLES.footerText}>
            {footerText}
          </Text>
        </div>
      )}
    </div>
  );
};

export default PageContainer;
