import { useState } from "react";
import { Layout, Typography, Form, Input, Button, Space, Alert, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import { COLORS } from "../components/colorscheme";

const { Content } = Layout;
const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState({});
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  // Validadores frontend personalizados

  const validateName = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Por favor ingresa tu nombre completo"));
    }
    return Promise.resolve();
  };

  const validateSurname = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Por favor ingresa tus apellidos"));
    }
    return Promise.resolve();
  };

  const validateUsername = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Por favor ingresa un nombre de usuario"));
    }
    return Promise.resolve();
  };

  const validateEmail = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Por favor ingresa tu email"));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Por favor ingresa un email válido"));
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Por favor ingresa tu contraseña"));
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (passwordRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(
      new Error("La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número")
    );
  };

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value) {
        return Promise.reject(new Error("Por favor confirma tu contraseña"));
      }
      if (value === getFieldValue("password")) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Las contraseñas no coinciden"));
    },
  });

  const onFinish = async (values) => {
    setLoading(true);
    setRegisterError({});
    try {
      const response = await axios.post(gatewayUrl + "/adduser", values);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("roleToken", response.data.roleToken);
      localStorage.setItem("username", response.data.username);
      message.success("¡Registro exitoso! Bienvenido.");
      navigate("/");
    } catch (error) {
      setLoading(false);
      if (error.response?.data) {
        const { error: errorMessage, field } = error.response.data;
        if (field) {
          setRegisterError({ [field]: errorMessage });
        } else {
          setRegisterError({ general: errorMessage || "¡Algo salió mal! Inténtalo de nuevo." });
        }
      } else {
        setRegisterError({ general: "Error de conexión. Por favor, inténtalo de nuevo." });
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
          padding: "40px 20px",
          textAlign: "center",
          color: COLORS.neutral.white,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Title level={1} style={{ color: COLORS.neutral.white, marginBottom: "16px" }}>
            Crea tu cuenta
          </Title>
          <Text
            style={{
              fontSize: "18px",
              maxWidth: "700px",
              margin: "0 auto 16px",
              color: "rgba(255, 255, 255, 0.85)",
            }}
          >
            Únete para descubrir y reservar los mejores eventos
          </Text>
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
              <Text style={{ color: COLORS.neutral.grey4 }}>Crea tu cuenta para acceder a todos los beneficios</Text>
            </div>

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="name"
                rules={[{ validator: validateName }]}
                validateStatus={registerError["name"] ? "error" : ""}
                help={registerError["name"]}
              >
                <Input prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} placeholder="Nombre completo" style={{ borderRadius: "6px" }} />
              </Form.Item>

              <Form.Item
                name="surname"
                rules={[{ validator: validateSurname }]}
                validateStatus={registerError["surname"] ? "error" : ""}
                help={registerError["surname"]}
              >
                <Input prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} placeholder="Apellidos" style={{ borderRadius: "6px" }} />
              </Form.Item>

              <Form.Item
                name="username"
                rules={[{ validator: validateUsername }]}
                validateStatus={registerError["username"] ? "error" : ""}
                help={registerError["username"]}
              >
                <Input prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />} placeholder="Nombre de usuario" style={{ borderRadius: "6px" }} />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[{ validator: validateEmail }]}
                validateStatus={registerError["email"] ? "error" : ""}
                help={registerError["email"]}
              >
                <Input prefix={<MailOutlined style={{ color: COLORS.neutral.grey4 }} />} placeholder="Email" style={{ borderRadius: "6px" }} />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ validator: validatePassword }]}
                validateStatus={registerError["password"] ? "error" : ""}
                help={registerError["password"]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: COLORS.neutral.grey4 }} />} placeholder="Contraseña" style={{ borderRadius: "6px" }} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[validateConfirmPassword]}
                validateStatus={registerError["confirmPassword"] ? "error" : ""}
                help={registerError["confirmPassword"]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: COLORS.neutral.grey4 }} />} placeholder="Confirmar contraseña" style={{ borderRadius: "6px" }} />
              </Form.Item>

              {registerError["general"] && (
                <Alert
                  message="Error de registro"
                  description={registerError["general"]}
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
