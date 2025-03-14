import { useState } from "react";
import { Layout, Typography, Form, Input, Button, Avatar, message, Radio, Space } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title } = Typography;

// Predefined avatars
const avatars = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
];

const EditProfile = () => {
  const [form] = Form.useForm();
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]); // Default avatar
  const [showAvatarSelection, setShowAvatarSelection] = useState(false); // Toggle avatar selection

  const handleAvatarChange = (e) => {
    setSelectedAvatar(e.target.value);
  };

  const handleSubmit = (values) => {
    console.log("Updated Profile:", { ...values, avatar: selectedAvatar });
    message.success("Profile updated successfully!");
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
        <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>Edit profile</Title>

        {/* Avatar Section */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Avatar size={100} src={selectedAvatar} />
          <br />
          <Button type="link" onClick={() => setShowAvatarSelection(!showAvatarSelection)}>
            {showAvatarSelection ? "Hide Avatars" : "Choose an Avatar"}
          </Button>
        </div>

        {/* Avatar Selection (Hidden until Button is Clicked) */}
        {showAvatarSelection && (
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Title level={5}>Select an Avatar</Title>
            <Radio.Group value={selectedAvatar} onChange={handleAvatarChange}>
              <Space>
                {avatars.map((avatar, index) => (
                  <Radio key={index} value={avatar}>
                    <Avatar size={50} src={avatar} />
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
        )}

        {/* Profile Edit Form */}
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter your name!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Enter your name" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Please enter a valid email!" }]}>
            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item name="password" label="New Password" rules={[{ min: 6, message: "Password must be at least 6 characters long!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Save changes
          </Button>
        </Form>
      </Content>
    </Layout>
  );
};

export default EditProfile;

