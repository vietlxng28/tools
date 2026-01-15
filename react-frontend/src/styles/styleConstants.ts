import type { CSSProperties } from 'react';

export const COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  text: '#262626',
  textSecondary: '#8c8c8c',
  border: '#d9d9d9',
  bgContainer: '#ffffff',
  bgLayout: '#f0f2f5',
  bgCode: '#282c34',
  textCode: '#abb2bf',
  bgInput: '#fafafa',
};

export const COMMON_STYLES: { [key: string]: CSSProperties } = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  mainCard: {
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    borderRadius: '16px',
    border: 'none',
    background: COLORS.bgContainer,
  },
  sectionCard: {
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    background: '#fff',
  },
  primaryButton: {
    height: '48px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    boxShadow: '0 4px 10px rgba(24, 144, 255, 0.2)',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  secondaryButton: {
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },
  codeTextArea: {
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: '14px',
    borderRadius: '8px',
    backgroundColor: COLORS.bgInput,
    border: `1px solid ${COLORS.border}`,
    transition: 'all 0.3s',
  },
  codeDisplay: {
    maxHeight: '400px',
    overflow: 'auto',
    backgroundColor: COLORS.bgCode,
    color: COLORS.textCode,
    padding: '16px',
    borderRadius: '8px',
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  titleIcon: {
    fontSize: '20px',
    marginRight: '8px',
  }
};
