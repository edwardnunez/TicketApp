import React from "react";
import { Button, Typography, Layout, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { FrownOutlined, HomeOutlined } from "@ant-design/icons";

// Importamos el esquema de colores (asumiendo que está disponible)
import { COLORS } from "../components/colorscheme";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ backgroundColor: COLORS?.neutral?.white || "#fff", minHeight: "100vh" }}>
      <Content>
        {/* Hero Section con gradiente como en Home */}
        <div style={{ 
          background: COLORS?.gradients?.primary || "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
          padding: '60px 20px',
          textAlign: 'center',
          color: "#fff",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{ 
            background: "#fff", 
            borderRadius: '12px', 
            padding: '40px',
            maxWidth: '500px',
            width: "90%",
            margin: '0 auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            textAlign: "center"
          }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <FrownOutlined style={{ 
                fontSize: '72px', 
                color: COLORS?.status?.error || "#ff4d4f" 
              }} />
              
              <Title level={1} style={{ 
                marginBottom: '8px',
                color: COLORS?.neutral?.darker || "#000" 
              }}>
                ¡Oops! Página no encontrada
              </Title>
              
              <Paragraph style={{ 
                fontSize: '16px',
                color: COLORS?.neutral?.grey4 || "#8c8c8c",
                marginBottom: '24px'
              }}>
                Lo sentimos, la página que estás buscando no existe o ha sido movida.
              </Paragraph>
              
              <Button 
                type="primary" 
                size="large"
                icon={<HomeOutlined />}
                onClick={() => navigate("/")} 
                style={{
                  backgroundColor: COLORS?.primary?.main || "#1890ff",
                  borderColor: COLORS?.primary?.main || "#1890ff",
                  height: "46px",
                  borderRadius: "8px",
                  fontSize: "16px"
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