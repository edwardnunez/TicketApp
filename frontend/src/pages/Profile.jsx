import { useEffect, useState } from "react";
import { Layout, Typography, Card, Avatar, Button, Divider, Skeleton, Empty, Space, Tag, Tabs, Spin, Alert, Modal, Collapse, Badge, Row, Col, Image } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  EditOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined,
  TagOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
  UpOutlined,
  TeamOutlined,
  EuroOutlined,
  QrcodeOutlined
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
const { Panel } = Collapse;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  
  // Estados para el modal QR
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Estados para el modal de cancelación
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const gatewayUrl = process.env.REACT_API_ENDPOINT || "http://localhost:8000";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleShowQR = (ticket) => {
    setSelectedTicket(ticket);
    setShowQRModal(true);
  };

  const handleCancelTicket = (ticket) => {
    setTicketToCancel(ticket);
    setShowCancelModal(true);
  };

  const handleConfirmCancelTicket = async () => {
    if (!ticketToCancel) return;
    
    setCancelling(true);
    
    try {
      await axios.delete(`${gatewayUrl}/tickets/${ticketToCancel._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Recargar tickets
      if (user?._id) {
        await loadUserTickets(user._id);
      }
      
      // Cerrar modal y mostrar mensaje de éxito
      setShowCancelModal(false);
      setTicketToCancel(null);
      
      Modal.success({
        title: 'Entrada cancelada',
        content: 'La entrada ha sido cancelada exitosamente. Se procesará la devolución según nuestras políticas.',
        okText: 'Entendido'
      });
    } catch (err) {
      console.error("Error al cancelar ticket:", err);
      Modal.error({
        title: 'Error al cancelar',
        content: 'No se pudo cancelar la entrada. Por favor, inténtalo de nuevo o contacta con soporte.',
        okText: 'Entendido'
      });
    } finally {
      setCancelling(false);
    }
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

  // Agrupar tickets por evento
  const groupTicketsByEvent = (tickets) => {
    const grouped = {};
    tickets.forEach(ticket => {
      const eventId = ticket.eventId;
      if (!grouped[eventId]) {
        grouped[eventId] = {
          event: events[eventId] || {},
          tickets: []
        };
      }
      grouped[eventId].tickets.push(ticket);
    });
    return grouped;
  };

  const getLocationDisplay = (location) => {
    if (!location) return "Ubicación no disponible";
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      return location.name || location.address || "Ubicación no disponible";
    }
    return "Ubicación no disponible";
  };

  const renderSeatsList = (seats) => {
    if (!seats || seats.length === 0) return null;
    
    return (
      <div style={{ marginTop: '8px' }}>
        <Text style={{ color: COLORS.neutral.grey4, fontSize: '13px' }}>
          <strong>Asientos:</strong>
        </Text>
        <ul style={{ 
          margin: '4px 0 0 16px', 
          padding: 0,
          color: COLORS.neutral.grey4,
          fontSize: '13px'
        }}>
          {seats.map((seat, index) => (
            <li key={index} style={{ marginBottom: '2px' }}>
              Sección {seat.sectionId}, Fila {seat.row}, Asiento {seat.seat}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTicketDetail = (ticket, isExpired) => {
    const canCancel = ticket.status === 'paid' && !isExpired;
    
    return (
      <div key={ticket._id} style={{ 
        padding: '16px', 
        border: `1px solid ${COLORS.neutral.grey2}`, 
        borderRadius: '8px',
        marginBottom: '12px',
        backgroundColor: COLORS.neutral.white
      }}>
        <Row gutter={[16, 8]} align="middle">
          <Col span={18}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text strong style={{ color: COLORS.neutral.darker }}>
                  ID: {formatTicketId(ticket._id)}
                </Text>
                {getTicketStatusTag(ticket.status)}
              </div>
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Tag color="blue" icon={<TagOutlined />}>
                  {ticket.ticketType}
                </Tag>
                <Tag color="purple" icon={<TeamOutlined />}>
                  {ticket.quantity} {ticket.quantity > 1 ? "Entradas" : "Entrada"}
                </Tag>
                <Tag color="green" icon={<EuroOutlined />}>
                  {(ticket.price * ticket.quantity).toFixed(2)}€
                </Tag>
              </div>

              {renderSeatsList(ticket.selectedSeats)}
              
              <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                Comprado el {dayjs(ticket.purchasedAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            </Space>
          </Col>
          
          <Col span={6} style={{ textAlign: 'right' }}>
            <Space direction="vertical" size={8}>
              {ticket.status === 'paid' && (
                <Button 
                  type="text" 
                  size="small"
                  icon={<QrcodeOutlined />} 
                  onClick={() => handleShowQR(ticket)}
                  style={{ 
                    color: COLORS.primary.main,
                    borderColor: COLORS.primary.main
                  }}
                >
                  Ver QR
                </Button>
              )}
              {canCancel && (
                <Button 
                  type="text" 
                  danger 
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleCancelTicket(ticket)}
                >
                  Cancelar
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>
    );
  };

  const renderEventGroup = (eventId, eventGroup) => {
    const { event, tickets: eventTickets } = eventGroup;
    const isExpired = event.date && dayjs(event.date).isBefore(dayjs());
    
    const totalTickets = eventTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const totalPrice = eventTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
    const uniqueTypes = [...new Set(eventTickets.map(t => t.ticketType))];

    return (
      <Card 
        key={eventId}
        hoverable
        style={{ 
          marginBottom: "20px", 
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          transition: "all 0.3s ease",
        }}
        bodyStyle={{ padding: "20px" }}
      >
        <div style={{ display: "flex", gap: "20px", marginBottom: "16px" }}>
          {/* Imagen del evento */}
          {event.image && (
            <img 
              src={event.image} 
              alt={event.name || "Evento"}
              style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "8px", 
                objectFit: "cover",
                flexShrink: 0
              }}
            />
          )}
          
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <Text 
                  strong 
                  style={{ 
                    fontSize: "20px", 
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
                </Space>

                {isExpired && (
                  <Tag color="orange" style={{ marginBottom: "8px" }}>Evento finalizado</Tag>
                )}
              </div>
              
              <Space direction="vertical" align="end" style={{ textAlign: 'right' }}>
                <Badge count={eventTickets.length} color={COLORS.primary.main}>
                  <Tag color="blue" style={{ margin: 0 }}>
                    {eventTickets.length} {eventTickets.length > 1 ? 'Compras' : 'Compra'}
                  </Tag>
                </Badge>
                
                <Tag color="purple">
                  <TeamOutlined /> {totalTickets} {totalTickets > 1 ? "Entradas" : "Entrada"}
                </Tag>
                
                <Text style={{ fontWeight: "600", color: COLORS.primary.dark, fontSize: "18px" }}>
                  {totalPrice.toFixed(2)}€
                </Text>
                
                <Text style={{ color: COLORS.neutral.grey4, fontSize: "12px" }}>
                  Total del evento
                </Text>
              </Space>
            </div>
          </div>
        </div>

        {/* Resumen de tipos de entrada */}
        <div style={{ marginBottom: "16px" }}>
          <Text style={{ color: COLORS.neutral.grey4, fontSize: "13px", marginRight: "8px" }}>
            Tipos de entrada:
          </Text>
          {uniqueTypes.map(type => (
            <Tag key={type} size="small" style={{ margin: "2px" }}>
              {type}
            </Tag>
          ))}
        </div>

        {/* Collapse con detalles de cada ticket */}
        <Collapse 
          size="small"
          expandIcon={({ isActive }) => 
            isActive ? <UpOutlined /> : <DownOutlined />
          }
          style={{
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          <Panel 
            header={
              <Text style={{ color: COLORS.primary.main, fontWeight: 500 }}>
                Ver detalles de {eventTickets.length} {eventTickets.length > 1 ? 'compras' : 'compra'}
              </Text>
            } 
            key="details"
            style={{
              backgroundColor: COLORS.neutral.grey1,
              border: `1px solid ${COLORS.neutral.grey2}`,
              borderRadius: '6px'
            }}
          >
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {eventTickets.map(ticket => renderTicketDetail(ticket, isExpired))}
            </div>
          </Panel>
        </Collapse>
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

    const renderTicketTab = (ticketsList, emptyMessage) => {
      if (ticketsList.length === 0) {
        return (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={emptyMessage}
          >
            {emptyMessage.includes('activas') && (
              <Link to="/">
                <Button type="primary" style={{ backgroundColor: COLORS.primary.main }}>
                  Explorar eventos
                </Button>
              </Link>
            )}
          </Empty>
        );
      }

      const groupedTickets = groupTicketsByEvent(ticketsList);
      return Object.entries(groupedTickets).map(([eventId, eventGroup]) => 
        renderEventGroup(eventId, eventGroup)
      );
    };

    return (
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'active',
            label: `Activas (${activeTickets.length})`,
            children: renderTicketTab(activeTickets, "No tienes entradas activas")
          },
          {
            key: 'pending',
            label: `Pendientes (${pendingTickets.length})`,
            children: renderTicketTab(pendingTickets, "No tienes entradas pendientes")
          },
          {
            key: 'cancelled',
            label: `Canceladas (${cancelledTickets.length})`,
            children: renderTicketTab(cancelledTickets, "No tienes entradas canceladas")
          }
        ]}
      />
    );
  };

  // Función para mostrar el nombre completo del usuario
  const getFullName = (user) => {
    if (!user) return "";
    const parts = [];
    if (user.name) parts.push(user.name);
    if (user.surname) parts.push(user.surname);
    return parts.join(' ') || user.username || "Usuario";
  };

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.grey1, minHeight: "100vh" }}>
      <Content style={{ padding: isMobile ? "18px 4px" : "40px 20px" }}>
        <div style={{ maxWidth: isMobile ? "100%" : "900px", margin: "0 auto" }}>
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
                    {getFullName(user)}
                  </Title>
                  
                  <Text style={{ color: COLORS.neutral.grey4, display: "flex", alignItems: "center", marginBottom: "4px" }}>
                    <UserOutlined style={{ marginRight: "6px" }} /> @{user.username}
                  </Text>
                  
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

          {/* Modal QR Code */}
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrcodeOutlined style={{ color: COLORS.primary.main }} />
                <span>Código QR de la entrada</span>
              </div>
            }
            open={showQRModal}
            onCancel={() => setShowQRModal(false)}
            footer={[
              <Button key="close" onClick={() => setShowQRModal(false)}>
                Cerrar
              </Button>
            ]}
            width={400}
            centered
          >
            {selectedTicket && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                {/* Información del ticket */}
                <div style={{ marginBottom: '24px' }}>
                  <Text strong style={{ display: 'block', fontSize: '16px', marginBottom: '8px' }}>
                    {formatTicketId(selectedTicket._id)}
                  </Text>
                  <Text style={{ color: COLORS.neutral.grey4, display: 'block', marginBottom: '4px' }}>
                    {events[selectedTicket.eventId]?.name || "Evento"}
                  </Text>
                  <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                    {selectedTicket.quantity} entrada{selectedTicket.quantity > 1 ? 's' : ''}
                  </Text>
                </div>

                <Divider />
                {/* QR Code */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginBottom: '16px',
                  padding: '20px',
                  backgroundColor: COLORS.neutral.white,
                  borderRadius: '8px',
                  border: `1px solid ${COLORS.neutral.grey2}`
                }}>
                  <Image
                      src={selectedTicket.qrCode}
                      alt="Código QR del ticket"
                      width={200}
                      height={200}
                      style={{ 
                        border: 'none',
                        borderRadius: '8px'
                      }}
                      preview={{
                        mask: 'Ver código QR completo'
                      }}
                    />
                </div>

                {/* Instrucciones */}
                <Alert
                  message="Instrucciones de uso"
                  description="Presenta este código QR en la entrada del evento para acceder. Asegúrate de que la pantalla esté limpia y con buen brillo."
                  type="info"
                  showIcon
                  style={{ textAlign: 'left' }}
                />
              </div>
            )}
          </Modal>

          {/* Modal de confirmación de cancelación */}
          <Modal
            title="Confirmar cancelación de entrada"
            open={showCancelModal}
            onOk={handleConfirmCancelTicket}
            onCancel={() => setShowCancelModal(false)}
            confirmLoading={cancelling}
            okText="Sí, cancelar"
            cancelText="No"
            okButtonProps={{
              style: {
                backgroundColor: COLORS?.status?.error || "#ff4d4f",
                borderColor: COLORS?.status?.error || "#ff4d4f"
              }
            }}
            width={600}
          >
            {ticketToCancel && (
              <div>
                <Text>¿Estás seguro de que quieres cancelar esta entrada?</Text>
                <Divider />
                
                <div style={{ marginBottom: '12px' }}>
                  <Text strong>Evento:</Text> {events[ticketToCancel.eventId]?.name || "Evento no disponible"}
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <Text strong>ID de entrada:</Text> {formatTicketId(ticketToCancel._id)}
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <Text strong>Cantidad:</Text> {ticketToCancel.quantity} entrada{ticketToCancel.quantity > 1 ? 's' : ''}
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <Text strong>Importe a devolver:</Text> 
                  <Text style={{ color: COLORS?.primary?.main || "#1890ff", fontWeight: '600', marginLeft: '8px' }}>
                    {(ticketToCancel.price * ticketToCancel.quantity).toFixed(2)}€
                  </Text>
                </div>
                
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#fff2f0', 
                  border: '1px solid #ffccc7',
                  borderRadius: '6px',
                  marginTop: '16px'
                }}>
                  <Text style={{ 
                    color: COLORS?.status?.error || "#ff4d4f", 
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ⚠️ Esta acción no se puede deshacer. Se procesará la devolución según nuestras políticas de cancelación.
                  </Text>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default Profile;