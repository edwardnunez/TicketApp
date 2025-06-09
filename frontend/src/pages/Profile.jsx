import { useEffect, useState } from "react";
import { Layout, Typography, Card, Avatar, Button, Divider, Skeleton, Empty, Space, Tag, Tabs, Spin, Alert, Modal } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  EditOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined,
  TagOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import 'dayjs/locale/es';

import { COLORS } from "../components/colorscheme";

dayjs.locale('es');

const { Content } = Layout;
const { Title, Text } = Typography;
const { confirm } = Modal;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const gatewayUrl = process.env.REACT_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userRes = await axios.get(`${gatewayUrl}/users/search?username=${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(userRes.data);

        if (userRes.data._id) {
          await loadUserTickets(userRes.data._id);
        }
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err);
        if (err.response?.status === 404) {
          setError("Usuario no encontrado");
        } else if (err.response?.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente");
        } else {
          setError("Error al cargar los datos del perfil");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!token || !username) {
      setLoading(false);
      setError("No se encontraron credenciales de usuario");
      return;
    }

    loadUserData();
  }, [token, username, gatewayUrl]);

  const loadUserTickets = async (userId) => {
    try {
      setTicketsLoading(true);
      
      // Obtener tickets del usuario
      const ticketsRes = await axios.get(`${gatewayUrl}/tickets/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const userTickets = ticketsRes.data.tickets || [];
      setTickets(userTickets);
      
      // Obtener información de los eventos
      const eventIds = [...new Set(userTickets.map(ticket => ticket.eventId))];
      const eventsData = {};
      
      for (const eventId of eventIds) {
        try {
          const eventRes = await axios.get(`${gatewayUrl}/events/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          eventsData[eventId] = eventRes.data;
        } catch (eventErr) {
          console.warn(`No se pudo cargar el evento ${eventId}:`, eventErr);
          eventsData[eventId] = {
            name: "Evento no disponible",
            date: null,
            location: "Ubicación no disponible",
            image: null
          };
        }
      }
      
      setEvents(eventsData);
    } catch (err) {
      console.error("Error al cargar tickets:", err);
      setError("Error al cargar las entradas");
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleCancelTicket = (ticketId) => {
    confirm({
      title: '¿Estás seguro de que quieres cancelar esta entrada?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer. Se procesará la devolución según nuestras políticas.',
      okText: 'Sí, cancelar',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.delete(`${gatewayUrl}/tickets/${ticketId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Recargar tickets
          if (user?._id) {
            await loadUserTickets(user._id);
          }
        } catch (err) {
          console.error("Error al cancelar ticket:", err);
          Modal.error({
            title: 'Error',
            content: 'No se pudo cancelar la entrada. Inténtalo de nuevo.',
          });
        }
      },
    });
  };

  const getTicketStatusTag = (status) => {
    const statusConfig = {
      paid: { color: 'success', text: 'Pagado' },
      pending: { color: 'warning', text: 'Pendiente' },
      cancelled: { color: 'error', text: 'Cancelado' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: 'Desconocido' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatTicketId = (ticketId) => {
    return `TKT-${ticketId.slice(-8).toUpperCase()}`;
  };

  const filterTicketsByStatus = (tickets, status) => {
    switch (status) {
      case 'active':
        return tickets.filter(ticket => ticket.status === 'paid');
      case 'pending':
        return tickets.filter(ticket => ticket.status === 'pending');
      case 'cancelled':
        return tickets.filter(ticket => ticket.status === 'cancelled');
      default:
        return tickets;
    }
  };

  const renderTicket = (ticket) => {
    const event = events[ticket.eventId] || {};
    const isExpired = event.date && dayjs(event.date).isBefore(dayjs());
    const canCancel = ticket.status === 'paid' && !isExpired;

    // Helper function to safely get location name
    const getLocationDisplay = (location) => {
      if (!location) return "Ubicación no disponible";
      if (typeof location === 'string') return location;
      if (typeof location === 'object') {
        return location.name || location.address || "Ubicación no disponible";
      }
      return "Ubicación no disponible";
    };

    return (
      <Card 
        key={ticket._id} 
        hoverable
        style={{ 
          marginBottom: "16px", 
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          transition: "all 0.3s ease",
        }}
        bodyStyle={{ padding: "20px" }}
        actions={[
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => {
              Modal.info({
                title: 'Detalles de la Entrada',
                width: 600,
                content: (
                  <div style={{ marginTop: 16 }}>
                    <p><strong>ID:</strong> {formatTicketId(ticket._id)}</p>
                    <p><strong>Evento:</strong> {event.name || "Evento no disponible"}</p>
                    <p><strong>Fecha:</strong> {event.date ? dayjs(event.date).format('DD [de] MMMM [de] YYYY, HH:mm') : 'No disponible'}</p>
                    <p><strong>Ubicación:</strong> {getLocationDisplay(event.location)}</p>
                    <p><strong>Tipo:</strong> {ticket.ticketType}</p>
                    <p><strong>Cantidad:</strong> {ticket.quantity}</p>
                    <p><strong>Precio total:</strong> {(ticket.price * ticket.quantity).toFixed(2)}€</p>
                    <p><strong>Estado:</strong> {getTicketStatusTag(ticket.status)}</p>
                    <p><strong>Comprado:</strong> {dayjs(ticket.purchasedAt).format('DD/MM/YYYY HH:mm')}</p>
                    {ticket.selectedSeats && ticket.selectedSeats.length > 0 && (
                      <p><strong>Asientos:</strong> {ticket.selectedSeats.map(seat => seat.id).join(', ')}</p>
                    )}
                  </div>
                ),
              });
            }}
          >
            Ver detalles
          </Button>,
          canCancel && (
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleCancelTicket(ticket._id)}
            >
              Cancelar
            </Button>
          )
        ].filter(Boolean)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            {/* Imagen del evento */}
            {event.image && (
              <img 
                src={event.image} 
                alt={event.name || "Evento"}
                style={{ 
                  width: "60px", 
                  height: "60px", 
                  borderRadius: "8px", 
                  objectFit: "cover",
                  marginBottom: "12px"
                }}
              />
            )}
            
            <Text 
              strong 
              style={{ 
                fontSize: "18px", 
                color: COLORS.neutral.darker,
                display: "block",
                marginBottom: "8px"
              }}
            >
              {event.name || "Evento no disponible"}
            </Text>
            
            <Space direction="vertical" size={4} style={{ marginBottom: "12px" }}>
              <Text style={{ color: COLORS.neutral.grey4, display: "flex", alignItems: "center" }}>
                <CalendarOutlined style={{ marginRight: "8px", color: COLORS.neutral.grey4 }} /> 
                {event.date ? dayjs(event.date).format("DD [de] MMMM [de] YYYY, HH:mm") : "Fecha no disponible"}
              </Text>
              
              <Text style={{ color: COLORS.neutral.grey4, display: "flex", alignItems: "center" }}>
                <EnvironmentOutlined style={{ marginRight: "8px", color: COLORS.neutral.grey4 }} /> 
                {getLocationDisplay(event.location)}
              </Text>

              <Text style={{ color: COLORS.neutral.grey4, display: "flex", alignItems: "center" }}>
                <TagOutlined style={{ marginRight: "8px", color: COLORS.neutral.grey4 }} /> 
                ID: {formatTicketId(ticket._id)}
              </Text>
            </Space>

            {isExpired && ticket.status === 'paid' && (
              <Tag color="orange" style={{ marginBottom: "8px" }}>Evento finalizado</Tag>
            )}
          </div>
          
          <Space direction="vertical" align="end" style={{ textAlign: 'right' }}>
            {getTicketStatusTag(ticket.status)}
            
            <Tag color={'blue'}>
              {ticket.ticketType}
            </Tag>
            
            <Tag color={COLORS.primary.main}>
              <TagOutlined /> {ticket.quantity} {ticket.quantity > 1 ? "Entradas" : "Entrada"}
            </Tag>
            
            <Text style={{ fontWeight: "600", color: COLORS.primary.dark, fontSize: "16px" }}>
              {(ticket.price * ticket.quantity).toFixed(2)}€
            </Text>
            
            <Text style={{ color: COLORS.neutral.grey4, fontSize: "12px" }}>
              Comprado el {dayjs(ticket.purchasedAt).format('DD/MM/YY')}
            </Text>
          </Space>
        </div>
      </Card>
    );
  };

  const renderTicketsSection = () => {
    if (ticketsLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: COLORS.neutral.grey4 }}>
            Cargando tus entradas...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Error al cargar las entradas"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      );
    }

    const activeTickets = filterTicketsByStatus(tickets, 'active');
    const pendingTickets = filterTicketsByStatus(tickets, 'pending');
    const cancelledTickets = filterTicketsByStatus(tickets, 'cancelled');

    return (
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'active',
            label: `Activas (${activeTickets.length})`,
            children: activeTickets.length > 0 ? (
              activeTickets.map(renderTicket)
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No tienes entradas activas"
              >
                <Link to="/">
                  <Button type="primary" style={{ backgroundColor: COLORS.primary.main }}>
                    Explorar eventos
                  </Button>
                </Link>
              </Empty>
            )
          },
          {
            key: 'pending',
            label: `Pendientes (${pendingTickets.length})`,
            children: pendingTickets.length > 0 ? (
              pendingTickets.map(renderTicket)
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No tienes entradas pendientes"
              />
            )
          },
          {
            key: 'cancelled',
            label: `Canceladas (${cancelledTickets.length})`,
            children: cancelledTickets.length > 0 ? (
              cancelledTickets.map(renderTicket)
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No tienes entradas canceladas"
              />
            )
          }
        ]}
      />
    );
  };

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.grey1, minHeight: "100vh" }}>
      <Content style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
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
                  background: COLORS.gradients?.primary || `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.dark} 100%)`,
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
                  {user.name} {user.surname}
                </Title>
                
                <Text style={{ color: COLORS.neutral.grey4, display: "flex", alignItems: "center" }}>
                  <MailOutlined style={{ marginRight: "6px" }} /> {user.email}
                </Text>
                
                <Text style={{ color: COLORS.neutral.grey4, display: "flex", alignItems: "center", marginTop: "4px" }}>
                  <ClockCircleOutlined style={{ marginRight: "6px" }} /> 
                  Miembro desde {dayjs(user.createdAt).format("MMMM [de] YYYY")}
                </Text>
                
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ display: 'block', fontSize: '20px', color: COLORS.primary.main }}>
                      {tickets.filter(t => t.status === 'paid').length}
                    </Text>
                    <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                      Entradas activas
                    </Text>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ display: 'block', fontSize: '20px', color: COLORS.primary.main }}>
                      {tickets.filter(t => t.status === 'paid').reduce((sum, t) => sum + (t.price * t.quantity), 0).toFixed(0)}€
                    </Text>
                    <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                      Total gastado
                    </Text>
                  </div>
                </div>
                
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
                  <span style={{ color: COLORS.neutral.darker }}>Mis Entradas</span>
                </div>
              }
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              {renderTicketsSection()}
            </Card>
          </Space>
        ) : (
          <Card style={{ textAlign: "center", borderRadius: "12px" }}>
            <Empty
              description={
                <div>
                  <Text style={{ color: COLORS.neutral.grey4, display: "block", marginBottom: "16px" }}>
                    {error || "No se pudo cargar el perfil del usuario"}
                  </Text>
                  <Link to="/login">
                    <Button type="primary">
                      Iniciar sesión
                    </Button>
                  </Link>
                </div>
              }
            />
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default Profile;