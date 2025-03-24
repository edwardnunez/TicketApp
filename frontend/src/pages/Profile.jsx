import { useEffect, useState } from "react";
import { Layout, Typography, Card, Avatar, Button, Row, Col, Divider } from "antd";
import { UserOutlined, MailOutlined, EditOutlined, CalendarOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const gatewayUrl = process.env.REACT_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    if (!username || !token) return;

    // Obtener usuario
    axios.get(gatewayUrl+`/users`)
      .then((res) => {
        const u = res.data.find(u => u.username === username);
        if (u) {
          setUser(u);
          setUserId(u._id);
        }
      })
      .catch(err => console.error("Error al cargar el usuario:", err));

    // Obtener entradas del usuario
    axios.get(gatewayUrl+`tickets/user/${userId}/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setTickets(res.data))
      .catch(err => console.error("Error al cargar las entradas:", err));
  }, [userId, token]);

  if (!user) return <p>Cargando perfil...</p>;

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
          <Avatar size={100} src="/avatars/avatar1.png" icon={<UserOutlined />} />
          <Title level={2} style={{ marginTop: "10px" }}>{user.name}</Title>
          <Text type="secondary"><MailOutlined /> {user.email}</Text><br />
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
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <Card key={ticket._id} style={{ marginBottom: "10px", border: "1px solid #1890ff" }}>
              <Text strong>{ticket.event?.name || "Evento desconocido"}</Text><br />
              <Text><CalendarOutlined /> {dayjs(ticket.event?.date).format("MMMM D, YYYY")} - {ticket.event?.location}</Text><br />
              <Text>🎫 {ticket.quantity} Ticket(s) - 💲{ticket.price * ticket.quantity}</Text>
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
