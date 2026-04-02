import React, { useState } from 'react';
import { Layout, Menu, theme, Button } from 'antd';
import { UploadOutlined, CalculatorOutlined, MenuUnfoldOutlined, MenuFoldOutlined, FileExcelOutlined, CodeOutlined, FileSearchOutlined, DatabaseOutlined, ScissorOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <UploadOutlined />,
      label: 'Excel2Json',
    },
    {
      key: '/json2excel',
      icon: <FileExcelOutlined />,
      label: 'Json2Excel',
    },
    {
      key: '/stringify',
      icon: <CodeOutlined />,
      label: 'JSON Stringify',
    },
    {
      key: '/b64toexcel',
      icon: <FileExcelOutlined />,
      label: 'Base642Excel',
    },
    {
      key: '/resp2excel',
      icon: <FileSearchOutlined />,
      label: 'Response2Excel',
    },
    {
      key: '/ap2e',
      icon: <CalculatorOutlined />,
      label: 'DDL',
    },
    {
      key: '/sqlmin',
      icon: <DatabaseOutlined />,
      label: 'SQL Minify',
    },
    {
      key: '/cleaner',
      icon: <ScissorOutlined />,
      label: 'Data Cleaner',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" width={250} style={{
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        zIndex: 10,
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ fontSize: '1rem', fontWeight: 500 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s', minHeight: '100vh' }}>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>

          </div>
        </Header>
        <Content
          style={{
            margin: '0',
            padding: '16px',
            minHeight: 'calc(100vh - 64px)',
            background: '#f0f2f5',
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
