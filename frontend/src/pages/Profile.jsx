import { Layout, Typography, Card, Avatar, Button, Row, Col, Divider } from "antd";
import { UserOutlined, MailOutlined, EditOutlined, CalendarOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile = () => {
  // Example user data (Replace with API response)
  const user = {
    name: "John Doe",
    email: "johndoe@example.com",
    avatar: "/avatars/avatar1.png", // Selected avatar
    createdAt: "2024-03-10T14:30:00Z", // Example creation date
    tickets: [
      { id: 1, eventName: "Rock Concert", date: "2025-06-15", location: "Madrid", price: 50, quantity: 2 },
      { id: 2, eventName: "Jazz Festival", date: "2025-07-20", location: "Barcelona", price: 40, quantity: 1 },
    ],
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
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Avatar size={100} src={user.avatar} />
          <Title level={2} style={{ marginTop: "10px" }}>{user.name}</Title>
          <Text type="secondary"><MailOutlined /> {user.email}</Text>
          <br />
          <Text type="secondary">
            <CalendarOutlined /> Member since {dayjs(user.createdAt).format("MMMM D, YYYY")}
          </Text>
        </div>

        <Divider />

        {/* Edit Profile Button */}
        <Row gutter={16} justify="center">
          <Col span={24} style={{ textAlign: "center" }}>
            <Link to="/edit-profile">
              <Button type="primary" icon={<EditOutlined />} size="large">
                Edit Profile
              </Button>
            </Link>
          </Col>
        </Row>

        <Divider />

        {/* Purchased Tickets Section */}
        <Title level={3} style={{ color: "#52c41a" }}>🎟️ My tickets</Title>
        {user.tickets.length > 0 ? (
            user.tickets.map((ticket) => (
                <Card key={ticket._id} style={{ marginBottom: "10px", border: "1px solid #1890ff" }}>
                <Text strong>{ticket.event.name}</Text>
                <br />
                <Text><CalendarOutlined /> {dayjs(ticket.event.date).format("MMMM D, YYYY")} - {ticket.event.location}</Text>
                <br />
                <Text>🎫 {ticket.quantity} Ticket(s) - 💲 {ticket.price * ticket.quantity}</Text>
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
