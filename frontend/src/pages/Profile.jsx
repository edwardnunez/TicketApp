import { useEffect, useState } from "react";
import { Layout, Typography, Card, Avatar, Button, Divider, Skeleton, Empty, Space, Tag } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  EditOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined,
  TagOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

import { COLORS } from "../components/colorscheme";

const { Content } = Layout;
const { Title, Text } = Typography;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const gatewayUrl = process.env.REACT_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    if (!token) return;
    
    setLoading(true);
    
    // Obtener usuario por ObjectId
    axios
      .get(gatewayUrl + `/users/search?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setUserId(res.data._id);
      })
      .catch((err) => console.error("Error al cargar el usuario:", err))
      .finally(() => {
        setLoading(false);
      });
  
    // Obtener entradas del usuario
    if (userId) {
      axios
        .get(gatewayUrl + `/tickets/user/${userId}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setTickets(res.data))
        .catch((err) => console.error("Error al cargar las entradas:", err));
    }
  }, [userId, token, gatewayUrl]);

  // Función para renderizar cada ticket con el nuevo estilo
  const renderTicket = (ticket) => (
    <Card 
      key={ticket._id} 
      hoverable
      style={{ 
        marginBottom: "16px", 
        borderRadius: "8px",
        border: "none",
        boxShadow: "0 1px 2px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.07)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Text 
            strong 
            style={{ 
              fontSize: "16px", 
              color: COLORS.neutral.darker,
              display: "block",
              marginBottom: "8px"
            }}
          >
            {ticket.event?.name || "Evento desconocido"}
          </Text>
          
          <Space direction="vertical" size={4} style={{ marginBottom: "8px" }}>
            <Text style={{ color: COLORS.neutral.grey4, display: "flex", alignItems: "center" }}>
              <CalendarOutlined style={{ marginRight: "8px", color: COLORS.neutral.grey4 }} /> 
              {dayjs(ticket.event?.date).format("DD MMM YYYY")}
            </Text>
            
            <Text style={{ color: COLORS.neutral.grey4, display: "flex", alignItems: "center" }}>
              <EnvironmentOutlined style={{ marginRight: "8px", color: COLORS.neutral.grey4 }} /> 
              {ticket.event?.location || "Ubicación no disponible"}
            </Text>
          </Space>
        </div>
        
        <Space direction="vertical" align="end">
          <Tag color={COLORS.primary.main}>
            <TagOutlined /> {ticket.quantity} {ticket.quantity > 1 ? "Entradas" : "Entrada"}
          </Tag>
          <Text style={{ fontWeight: "600", color: COLORS.primary.dark }}>
            {ticket.price * ticket.quantity}€
          </Text>
        </Space>
      </div>
    </Card>
  );

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.grey1, minHeight: "100vh" }}>
      <Content style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
        {loading ? (
          <Card 
            style={{ 
              borderRadius: "12px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "none"
            }}
          >
            <Skeleton active avatar={{ size: 100, shape: "circle" }} paragraph={{ rows: 4 }} />
          </Card>
        ) : user ? (
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            {/* Profile Header Card */}
            <Card
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              {/* Hero Banner */}
              <div
                style={{
                  height: "120px",
                  background: COLORS.gradients.primary,
                  margin: "-24px -24px 0",
                }}
              />
              
              {/* Profile Info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: "-60px",
                  textAlign: "center",
                }}
              >
                <Avatar
                  size={120}
                  src={user.avatar || "/avatars/avatar1.png"}
                  icon={<UserOutlined />}
                  style={{
                    border: `4px solid ${COLORS.neutral.white}`,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                />
                
                <Title level={2} style={{ marginTop: "16px", marginBottom: "4px", color: COLORS.neutral.darker }}>
                  {user.name}
                </Title>
                
                <Text style={{ color: COLORS.neutral.grey4, display: "flex", alignItems: "center" }}>
                  <MailOutlined style={{ marginRight: "6px" }} /> {user.email}
                </Text>
                
                <Text style={{ color: COLORS.neutral.grey4, display: "flex", alignItems: "center", marginTop: "4px" }}>
                  <ClockCircleOutlined style={{ marginRight: "6px" }} /> 
                  Miembro desde {dayjs(user.createdAt).format("MMMM YYYY")}
                </Text>
                
                <Divider style={{ margin: "24px 0 16px" }} />
                
                {/* Edit Profile Button */}
                <Link to="/edit-profile">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    style={{
                      backgroundColor: COLORS.primary.main,
                      borderColor: COLORS.primary.main,
                      borderRadius: "6px",
                      boxShadow: "0 2px 0 rgba(0, 0, 0, 0.045)",
                    }}
                  >
                    Editar perfil
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Tickets Section */}
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TagOutlined style={{ color: COLORS.primary.main, marginRight: "8px" }} />
                  <span style={{ color: COLORS.neutral.darker }}>My Tickets</span>
                </div>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
              }}
              bodyStyle={{ padding: tickets.length ? "16px" : "24px" }}
            >
              {tickets.length > 0 ? (
                tickets.map(renderTicket)
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text style={{ color: COLORS.neutral.grey4 }}>
                      Aún no tienes entradas compradas
                    </Text>
                  }
                >
                  <Link to="/">
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: COLORS.primary.main,
                        borderColor: COLORS.primary.main,
                      }}
                    >
                      Ver eventos
                    </Button>
                  </Link>
                </Empty>
              )}
            </Card>
          </Space>
        ) : (
          <Card style={{ textAlign: "center", borderRadius: "12px" }}>
            <Text>Por favor, inicia sesión para ver tu perfil</Text>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default Profile;