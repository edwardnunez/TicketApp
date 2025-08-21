import { useState, useEffect } from "react";
import { Layout, Typography, Form, Input, Button, message, Space, Alert } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { setAuthSession, ensureAuthFreshness, scheduleAuthExpiryTimer } from "../utils/authSession";

import { COLORS } from "../components/colorscheme";

const { Content } = Layout;
const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState({});
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Limpiar si está expirado al entrar en Login
    ensureAuthFreshness();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validateUsername = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Por favor ingresa tu nombre de usuario"));
    }
    return Promise.resolve();
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Por favor ingresa tu contraseña"));
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    setLoading(true);
    setLoginError({});
    try {
      const response = await axios.post(gatewayUrl + "/login", values);
      setAuthSession({
        token: response.data.token,
        roleToken: response.data.roleToken,
        username: response.data.username,
        expiryMs: 60 * 60 * 1000,
      });
      scheduleAuthExpiryTimer();
      message.success("Login successful!");
      navigate("/");
    } catch (error) {
      setLoading(false);
      if (error.response?.data) {
        const { error: errorMessage, field } = error.response.data;
        if (error.response.status === 401) {
          setLoginError({
            general: "Credenciales inválidas. Verifica tu nombre de usuario y contraseña."
          });
        } else {
          if (field) {
            setLoginError({ [field]: errorMessage });
          } else {
            setLoginError({ general: errorMessage || "¡Algo salió mal! Inténtalo de nuevo más tarde." });
          }
        }
      } else {
        setLoginError({ general: "Error de conexión. Por favor, inténtalo de nuevo." });
      }
    }
  };

  const onFinishFailed = (errorInfo) => {
    setLoading(false);
  };

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.grey1, minHeight: "100vh" }}>
      <div
        style={{
          background: COLORS.gradients.primary,
          padding: isMobile ? "24px 8px" : "40px 20px",
          textAlign: "center",
          color: COLORS.neutral.white,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Title level={isMobile ? 2 : 1} style={{ color: COLORS.neutral.white, marginBottom: isMobile ? "10px" : "16px", fontSize: isMobile ? "1.5rem" : undefined }}>
            Accede a tu cuenta
          </Title>
          <Text style={{ fontSize: isMobile ? "15px" : "18px", maxWidth: "700px", margin: "0 auto 16px", color: "rgba(255, 255, 255, 0.85)" }}>
            Inicia sesión para descubrir y reservar eventos increíbles
          </Text>
        </div>
      </div>

      <Content style={{ padding: isMobile ? "24px 8px" : "40px 20px" }}>
        <div
          style={{
            maxWidth: isMobile ? "100%" : "460px",
            margin: "0 auto",
            backgroundColor: COLORS.neutral.white,
            padding: isMobile ? "18px 8px" : "30px",
            borderRadius: "8px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          }}
        >
          <Space direction="vertical" size={isMobile ? 16 : 24} style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <LoginOutlined style={{ fontSize: isMobile ? "24px" : "32px", color: COLORS.primary.main, marginBottom: "8px" }} />
              <Title level={isMobile ? 4 : 3} style={{ margin: "0 0 8px 0", color: COLORS.neutral.dark, fontSize: isMobile ? "1.1rem" : undefined }}>
                Iniciar sesión
              </Title>
              <Text style={{ color: COLORS.neutral.grey4, fontSize: isMobile ? "13px" : undefined }}>Accede a tu cuenta para gestionar tus eventos</Text>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ validator: validateUsername }]}
                validateStatus={loginError["username"] ? "error" : ""}
                help={loginError["username"]}
              >
                <Input prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} placeholder="Nombre de usuario" style={{ borderRadius: "6px" }} />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ validator: validatePassword }]}
                validateStatus={loginError["password"] ? "error" : ""}
                help={loginError["password"]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: COLORS.neutral.grey4 }} />} placeholder="Contraseña" style={{ borderRadius: "6px" }} />
              </Form.Item>

              {loginError["general"] && (
                <Alert
                  message="Error de inicio de sesión"
                  description={loginError["general"]}
                  type="error"
                  showIcon
                  style={{ marginBottom: "16px" }}
                />
              )}

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
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
