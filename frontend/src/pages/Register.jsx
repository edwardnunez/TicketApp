import { useState } from "react";
import { Layout, Typography, Form, Input, Button, Space, Alert } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Importamos el esquema de colores
import { COLORS } from "../components/colorscheme";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [registerError, setRegisterError] = useState({});
  const navigate = useNavigate();
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  const onFinish = async (values) => {
    setLoading(true);
    setRegisterError({}); // Reset errors
    try {
      const response = await axios.post(gatewayUrl + "/adduser", values);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("roleToken", response.data.roleToken);
      localStorage.setItem("username", response.data.username);
      navigate("/");
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.error || "Something went wrong!";

      // Detectamos errores específicos
      if (msg.toLowerCase().includes("username")) {
        setRegisterError({ field: "username", message: msg });
      } else if (msg.toLowerCase().includes("email")) {
        setRegisterError({ field: "email", message: msg });
      } else if (msg.toLowerCase().includes("passwords")) {
        setRegisterError({ field: "confirmPassword", message: msg });
      } else {
        setRegisterError({ field: "general", message: msg });
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
            Crea tu cuenta
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            maxWidth: '700px', 
            margin: '0 auto 16px',
            color: 'rgba(255, 255, 255, 0.85)'
          }}>
            Únete para descubrir y reservar los mejores eventos
          </Paragraph>
        </div>
      </div>

      <Content style={{ padding: "40px 20px" }}>
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            backgroundColor: COLORS.neutral.white,
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          }}
        >
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <UserAddOutlined style={{ fontSize: "32px", color: COLORS.primary.main, marginBottom: "8px" }} />
              <Title level={3} style={{ margin: "0 0 8px 0", color: COLORS.neutral.dark }}>
                Registro de usuario
              </Title>
              <Text style={{ color: COLORS.neutral.grey4 }}>
                Crea tu cuenta para acceder a todos los beneficios
              </Text>
            </div>

            <Form 
              form={form} 
              name="register" 
              onFinish={onFinish} 
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Por favor ingresa tu nombre completo" }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                  placeholder="Nombre completo" 
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item
                name="username"
                rules={[{ required: true, message: "Por favor ingresa un nombre de usuario" }]}
                validateStatus={registerError.field === "username" ? "error" : ""}
                help={registerError.field === "username" ? registerError.message : ""}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                  placeholder="Nombre de usuario" 
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[{ required: true, type: "email", message: "Por favor ingresa un email válido" }]}
                validateStatus={registerError.field === "email" ? "error" : ""}
                help={registerError.field === "email" ? registerError.message : ""}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                  placeholder="Email" 
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    pattern: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
                    message: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número",
                  }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                  placeholder="Contraseña" 
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Por favor confirma tu contraseña" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Las contraseñas no coinciden'));
                    },
                  }),
                ]}
                validateStatus={registerError.field === "confirmPassword" ? "error" : ""}
                help={registerError.field === "confirmPassword" ? registerError.message : ""}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: COLORS.neutral.grey4 }} />} 
                  placeholder="Confirmar contraseña" 
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              {registerError.field === "general" && (
                <Alert
                  message="Error"
                  description={registerError.message}
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
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  Registrarse
                </Button>
              </Form.Item>

              <div style={{ textAlign: "center" }}>
                <Text style={{ color: COLORS.neutral.grey4 }}>
                  ¿Ya tienes cuenta?{" "}
                  <Link to="/login" style={{ color: COLORS.primary.main, fontWeight: "500" }}>
                    Inicia sesión
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

export default Register;
