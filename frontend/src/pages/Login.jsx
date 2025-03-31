import { useState } from "react";
import { Layout, Typography, Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title } = Typography;

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
          Login
        </Title>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter your username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ marginTop: "10px" }}
          >
            Log in
          </Button>
        </Form>
      </Content>
    </Layout>
  );
};

export default Login;
