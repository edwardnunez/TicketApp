import { useState } from "react";
import { Layout, Typography, Form, Input, Button, message, Space } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Importamos el esquema de colores
import { COLORS } from "../components/colorscheme";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(gatewayUrl + "/login", values);
      console.log(response);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("roleToken", response.data.roleToken);
      localStorage.setItem("username", response.data.username);
      message.success("Login successful!");
      navigate("/");
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 401) {
        message.error("Invalid credentials! Please check your username and password.");
      } else {
        message.error("Something went wrong! Please try again later.");
      }
    }
  };

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.grey1, minHeight: "100vh" }}>
      {/* Hero Section - usando el gradiente principal */}
      <div style={{ 
        background: COLORS.gradients.primary,
        padding: '40px 20px',
        textAlign: 'center',
        color: COLORS.neutral.white
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={1} style={{ color: COLORS.neutral.white, marginBottom: '16px' }}>
            Accede a tu cuenta
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            maxWidth: '700px', 
            margin: '0 auto 16px',
            color: 'rgba(255, 255, 255, 0.85)'
          }}>
            Inicia sesión para descubrir y reservar eventos increíbles
          </Paragraph>
        </div>
      </div>

      <Content style={{ padding: "40px 20px" }}>
        <div
          style={{
            maxWidth: "460px",
            margin: "0 auto",
            backgroundColor: COLORS.neutral.white,
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          }}
        >
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <LoginOutlined style={{ fontSize: "32px", color: COLORS.primary.main, marginBottom: "8px" }} />
              <Title level={3} style={{ margin: "0 0 8px 0", color: COLORS.neutral.dark }}>
                Iniciar sesión
              </Title>
              <Text style={{ color: COLORS.neutral.grey4 }}>
                Accede a tu cuenta para gestionar tus eventos
              </Text>
            </div>

            <Form 
              name="login" 
              onFinish={onFinish} 
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: "Por favor ingresa tu nombre de usuario" }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                  placeholder="Nombre de usuario" 
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Por favor ingresa tu contraseña" }]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                  placeholder="Contraseña" 
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{ 
                    height: "44px", 
                    borderRadius: "6px",
                    backgroundColor: COLORS.primary.main,
                    borderColor: COLORS.primary.main,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  Iniciar sesión
                </Button>
              </Form.Item>

              <div style={{ textAlign: "center" }}>
                <Text style={{ color: COLORS.neutral.grey4 }}>
                  ¿No tienes cuenta?{" "}
                  <Link to="/register" style={{ color: COLORS.primary.main, fontWeight: "500" }}>
                    Regístrate
                  </Link>
                </Text>
              </div>
            </Form>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default Login;