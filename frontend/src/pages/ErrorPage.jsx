import React, { useState, useEffect } from "react";
import { Button, Typography, Layout, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { FrownOutlined, HomeOutlined } from "@ant-design/icons";

import { COLORS } from "../components/colorscheme";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

/**
 * Error page component for handling 404 and other error states
 * @returns {JSX.Element} Error page with navigation options
 */
const ErrorPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ backgroundColor: COLORS?.neutral?.white || "#fff", minHeight: "100vh" }}>
      <Content>
        {/* Hero Section con gradiente como en Home */}
        <div style={{ 
          background: COLORS?.gradients?.primary || "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
          padding: isMobile ? '32px 8px' : '60px 20px',
          textAlign: 'center',
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{ 
            background: "#fff", 
            borderRadius: '12px', 
            padding: isMobile ? '20px' : '40px',
            maxWidth: isMobile ? '100%' : '500px',
            width: "90%",
            margin: '0 auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            textAlign: "center"
          }}>
            <Space direction="vertical" size={isMobile ? "middle" : "large"} style={{ width: "100%" }}>
              <FrownOutlined style={{ 
                fontSize: isMobile ? '48px' : '72px', 
                color: COLORS?.status?.error || "#ff4d4f" 
              }} />
              
              <Title level={isMobile ? 2 : 1} style={{ 
                marginBottom: isMobile ? '4px' : '8px',
                color: COLORS?.neutral?.darker || "#000" 
              }}>
                ¡Oops! Página no encontrada
              </Title>
              
              <Paragraph style={{ 
                fontSize: isMobile ? '14px' : '16px',
                color: COLORS?.neutral?.grey4 || "#8c8c8c",
                marginBottom: isMobile ? '16px' : '24px'
              }}>
                Lo sentimos, la página que estás buscando no existe o ha sido movida.
              </Paragraph>
              
              <Button 
                type="primary" 
                size={isMobile ? "middle" : "large"}
                icon={<HomeOutlined />}
                onClick={() => navigate("/")} 
                style={{
                  backgroundColor: COLORS?.primary?.main || "#1890ff",
                  borderColor: COLORS?.primary?.main || "#1890ff",
                  height: isMobile ? "38px" : "46px",
                  borderRadius: "8px",
                  fontSize: isMobile ? "14px" : "16px"
                }}
              >
                Volver al inicio
              </Button>
            </Space>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ErrorPage;