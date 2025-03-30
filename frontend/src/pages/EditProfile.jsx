import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout, Typography, Form, Input, Button, Avatar, message, Radio, Space } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";

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
  const [userData, setUserData] = useState({ name: "", email: "", username: "" });
  const [userId, setUserId] = useState(null);
  
  const gatewayUrl = process.env.REACT_API_ENDPOINT || "http://localhost:8000";
  
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  // Fetch user data on component mount
  useEffect(() => {
    if (username && token) {
      axios.get(gatewayUrl+`/users`)
      .then((res) => {
        
      })
      .catch(err => console.error("Error al cargar el usuario:", err));
      axios
        .get(gatewayUrl+`/users`)
        .then((res) => {
          const u = res.data.find(u => u.username === username);

          setUserData({
            name: u.name,
            email: u.email,
            username: u.username,
          });
          setUserId(u._id);  
          setSelectedAvatar(u.avatar || avatars[0]);
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
          message.error("Failed to load user data.");
        });
    }
  }, [username, token, gatewayUrl]);

  // Handle avatar selection
  const handleAvatarChange = (e) => {
    setSelectedAvatar(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (values) => {
    const updatedUser = { ...values, avatar: selectedAvatar };

    axios
      .put(gatewayUrl+`/edit-user/${userId}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        message.success("Profile updated successfully!");
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
        message.error("Failed to update profile.");
      });
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
        <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={userData}>
          <Form.Item
            name="username"
            label="Username"
            initialValue={userData.username}
            rules={[{ required: true, message: "Please enter your username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder={userData.username}/>
          </Form.Item>

          <Form.Item
            name="name"
            label="Full name"
            initialValue={userData.name}
            rules={[{ required: true, message: "Please enter your name!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder={userData.name} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            initialValue={userData.email}
            rules={[{ required: true, type: "email", message: "Please enter a valid email!" }]}
          >
            <Input prefix={<MailOutlined />} placeholder={userData.email} />
          </Form.Item>

          <Form.Item
            name="password"
            label="New Password"
            rules={[{ min: 6, message: "Password must be at least 6 characters long!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
          </Form.Item>
          <Link to="/profile">
            <Button type="primary" htmlType="submit" block>
              Save changes
            </Button>
            </Link>
        </Form>
      </Content>
    </Layout>
  );
};

export default EditProfile;
