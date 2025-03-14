import { Layout, Typography, Card, Avatar, Button, Row, Col, Divider } from "antd";
import { UserOutlined, MailOutlined, EditOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile = () => {
  // Example user data
  const user = {
    name: "John Doe",
    email: "johndoe@example.com",
    avatar: null, // You can change this to a real image URL
    tickets: [
      { id: 1, event: "Rock Concert", date: "2025-06-15" },
      { id: 2, event: "Jazz Festival", date: "2025-07-20" },
    ],
  };

  return (
    <Layout style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "40px" }}>
      <Content style={{ maxWidth: "600px", margin: "auto", backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Avatar size={100} icon={<UserOutlined />} src={user.avatar} />
          <Title level={2} style={{ marginTop: "10px" }}>{user.name}</Title>
          <Text type="secondary"><MailOutlined /> {user.email}</Text>
        </div>

        <Divider />

        {/* Personal Information */}
        <Row gutter={16} justify="center">
          <Col span={24} style={{ textAlign: "center" }}>
            <Button type="primary" icon={<EditOutlined />} size="large">
              Edit Profile
            </Button>
          </Col>
        </Row>

        <Divider />

        {/* Purchased Tickets Section */}
        <Title level={3} style={{ color: "#52c41a" }}>🎟️ My tickets</Title>
        {user.tickets.length > 0 ? (
          user.tickets.map((ticket) => (
            <Card key={ticket.id} style={{ marginBottom: "10px", border: "1px solid #1890ff" }}>
              <Text strong>{ticket.event}</Text> - <Text>{ticket.date}</Text>
            </Card>
          ))
        ) : (
          <Text>You haven't purchased any tickets yet.</Text>
        )}
      </Content>
    </Layout>
  );
};

export default Profile;

