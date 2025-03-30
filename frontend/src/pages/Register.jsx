import { useState } from "react";
import { Layout, Typography, Form, Input, Button } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title } = Typography;

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
    <Layout style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "40px" }}>
      <Content
        style={{
          maxWidth: "600px",
          margin: "auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>
          Register
        </Title>

        <Form form={form} name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="name"
            label="Full name"
            rules={[{ required: true, message: "Please input your full name!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
            validateStatus={registerError.field === "username" ? "error" : ""}
            help={registerError.field === "username" ? registerError.message : ""}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter your username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Please input a valid email!" }]}
            validateStatus={registerError.field === "email" ? "error" : ""}
            help={registerError.field === "email" ? registerError.message : ""}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                pattern: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
                message: "Password must be at least 8 characters, include one uppercase letter and one number.",
              }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            dependencies={['password']}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
            validateStatus={registerError.field === "confirmPassword" ? "error" : ""}
            help={registerError.field === "confirmPassword" ? registerError.message : ""}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" />
          </Form.Item>

          {registerError.field === "general" && (
            <Form.Item>
              <div style={{ color: "red", textAlign: "center" }}>{registerError.message}</div>
            </Form.Item>
          )}

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ marginTop: "10px" }}
          >
            Register
          </Button>
        </Form>
      </Content>
    </Layout>
  );
};

export default Register;
