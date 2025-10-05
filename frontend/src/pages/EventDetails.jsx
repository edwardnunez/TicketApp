import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; 
import { 
  Layout, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Button, 
  Tag, 
  Space,
  Skeleton,
  Alert,
  Divider,
  Table
} from "antd";
import { notification } from 'antd';
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  TeamOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
  TagOutlined,
  BarsOutlined,
  PictureOutlined,
  EuroOutlined,
  StopOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";

// Import color scheme
import { COLORS } from "../components/colorscheme";
import FramedImage from "../components/FramedImage";

// Configure dayjs in Spanish
dayjs.locale('es');

// CSS for spinner animation
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject CSS if it doesn't exist
if (!document.getElementById('spin-animation')) {
  const style = document.createElement('style');
  style.id = 'spin-animation';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

/**
 * Event details page component displaying comprehensive event information
 * @returns {JSX.Element} Event details page with information and purchase options
 */
const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketAvailability, setTicketAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const showNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: 'top',
    });
  };
  
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Robust calculation of total event capacity
  const computeEventCapacity = (evt) => {
    if (!evt) return 0;
    // If detailed section information is available, sum capacities
    if (evt.usesSectionPricing && Array.isArray(evt.sectionPricingInfo) && evt.sectionPricingInfo.length > 0) {
      return evt.sectionPricingInfo.reduce((sum, s) => sum + (Number(s.capacity) || 0), 0);
    }
    // Fallbacks
    if (typeof evt.capacity === 'number' && evt.capacity > 0) return evt.capacity;
    if (evt.location && typeof evt.location.capacity === 'number') return evt.location.capacity || 0;
    return 0;
  };

  // Function to get ticket availability
  const fetchTicketAvailability = async (evtParam) => {
    if (!id) return;
    const currentEvent = evtParam || event;
    
    setAvailabilityLoading(true);
    try {
      const response = await axios.get(`${gatewayUrl}/tickets/event/${id}`);
      const ticketStats = response.data.statistics || [];
      
      // Process statistics to get availability
      let soldTickets = 0;
      let pendingTickets = 0;
      
      ticketStats.forEach(stat => {
        if (stat._id === 'paid') {
          soldTickets = stat.totalTickets || 0;
        } else if (stat._id === 'pending') {
          pendingTickets = stat.totalTickets || 0;
        }
      });

      const totalCapacity = computeEventCapacity(currentEvent);
      const availableTickets = Math.max(0, totalCapacity - soldTickets - pendingTickets);
      const isSoldOut = availableTickets <= 0;
      const salesPercentage = totalCapacity > 0 ? Math.round(((soldTickets + pendingTickets) / totalCapacity) * 100) : 0;

      setTicketAvailability({
        eventId: id,
        totalCapacity,
        soldTickets,
        pendingTickets,
        availableTickets,
        isSoldOut,
        salesPercentage,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching ticket availability:", error);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("No se especificó un ID de evento válido");
      setLoading(false);
      return;
    }

    setLoading(true);
    axios.get(`${gatewayUrl}/events/${id}`)
      .then((res) => {
        const eventData = {
          ...res.data,
          date: res.data.date,
          image: res.data.imageUrl || "/event-images/default.jpg",
          // Map event type to category for consistency with Home
          category: mapEventTypeToCategory(res.data.type)
        };
        
        setEvent(eventData);
        setLoading(false);
        
        // Load availability using the newly obtained event to avoid capacity 0
        fetchTicketAvailability(eventData);
      })
      .catch((err) => {
        console.error("Error loading event details:", err);
        setError("No se pudo cargar la información del evento");
        setLoading(false);
        showNotification('error', 'Error', 'No se pudieron cargar los detalles del evento. Por favor, inténtalo de nuevo más tarde.');
      });
      }, [id, gatewayUrl]);

  // Configure automatic availability update every 30 seconds
  useEffect(() => {
    if (!event) return;

    const interval = setInterval(() => {
      fetchTicketAvailability();
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [event]);

  // Refrescar disponibilidad inmediatamente cuando el evento cambia
  useEffect(() => {
    if (event) {
      fetchTicketAvailability();
    }
  }, [event]);

  const mapEventTypeToCategory = (type) => {
    const typeMap = {
      'concert': 'Conciertos',
      'football': 'Deportes', 
      'cinema': 'Cine',
      'festival': 'Festivales',
      'theater': 'Teatro'
    };
    return typeMap[type] || 'Evento';
  };

  const getStateColor = (state) => {
    switch(state) {
      case 'activo': return COLORS.accent.green;
      case 'proximo': return COLORS.accent.gold;
      case 'finalizado': return COLORS.neutral.grey400;
      case 'cancelado': return COLORS.secondary.main;
      default: return COLORS.neutral.grey400;
    }
  };

  const getStateText = (state) => {
    switch(state) {
      case 'activo': return 'En venta';
      case 'proximo': return 'Próximamente';
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      default: return state;
    }
  };

  const getCategoryColor = (categoryName) => {
    switch(categoryName) {
      case "Conciertos": return COLORS.accent.purple;
      case "Teatro": return COLORS.accent.gold;
      case "Deportes": return COLORS.accent.green;
      case "Festivales": return COLORS.secondary.main;
      case "Cine": return COLORS.primary.main;
      default: return COLORS.primary.main;
    }
  };

  const handleBuyTickets = () => {
    navigate(`/event/purchase/${id}`);
  };

  const isEventAvailable = () => {
    return event?.state === 'activo' || event?.state === 'proximo';
  };

  const isEventActive = () => {
    return event?.state === 'activo';
  };

  const renderPricingInfo = () => {
    if (!event) return null;

    // Si usa pricing por secciones, mostrar tabla de precios
    if (event.usesSectionPricing && event.sectionPricingInfo) {
      const columns = [
        {
          title: 'Sección',
          dataIndex: 'sectionName',
          key: 'sectionName',
          render: (text) => <strong>{text}</strong>
        },
        {
          title: 'Capacidad',
          dataIndex: 'capacity',
          key: 'capacity',
          render: (value) => (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <TeamOutlined style={{ marginRight: '4px', color: COLORS.neutral.grey4 }} />
              {value}
            </span>
          )
        },
        {
          title: 'Precio',
          dataIndex: 'priceRange',
          key: 'priceRange',
          render: (text, record) => (
            <div>
              <Text strong style={{ color: COLORS.primary.main }}>
                {text}
              </Text>
              {record.pricingType === 'row' && (
                <div style={{ fontSize: '12px', color: COLORS.neutral.grey4 }}>
                  {record.frontRowFirst ? 'Fila 1 más cara' : 'Fila 1 más barata'}
                </div>
              )}
            </div>
          )
        },
        {
          title: 'Filas',
          dataIndex: 'rows',
          key: 'rows',
          render: (value) => (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <BarsOutlined style={{ marginRight: '4px', color: COLORS.neutral.grey4 }} />
              {value}
            </span>
          )
        }
      ];

      return (
        <Card style={{ 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          marginTop: '24px'
        }}>
          <Title level={4} style={{ 
            color: COLORS.neutral.darker,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <EuroOutlined style={{ 
              marginRight: '8px', 
              color: COLORS.primary.main 
            }} />
            Precios por sección
          </Title>
          
          <Table 
            dataSource={event.sectionPricingInfo}
            columns={columns}
            pagination={false}
            rowKey="sectionId"
            size="middle"
          />

          {event.usesRowPricing && (
            <Alert
              message="Pricing variable por filas"
              description="Los precios pueden variar según la fila y la sección."
              type="info"
              style={{ marginTop: '16px' }}
              showIcon
            />
          )}
        </Card>
      );
    }

    // Pricing simple
    return (
      <Card style={{ 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginTop: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EuroOutlined style={{ 
            fontSize: '24px',
            color: COLORS.primary.main,
            marginRight: '8px' 
          }} />
          <Title level={2} style={{ 
            color: COLORS.primary.main,
            margin: 0 
          }}>
            €{event.price}
          </Title>
        </div>
      </Card>
    );
  };

  const renderTicketAvailability = () => {
    if (!ticketAvailability) return null;

    const { availableTickets, totalCapacity, soldTickets, isSoldOut, salesPercentage, lastUpdated } = ticketAvailability;
    
    return (
      <Card style={{ 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginTop: '24px',
        borderLeft: `4px solid ${isSoldOut ? COLORS.secondary.main : COLORS.accent.green}`
      }}>
        <Title level={5} style={{ 
          color: COLORS.neutral.grey800,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <TeamOutlined style={{ 
            marginRight: '8px', 
            color: isSoldOut ? COLORS.secondary.main : COLORS.accent.green 
          }} />
          Disponibilidad de entradas
          {availabilityLoading && (
            <div style={{ marginLeft: '8px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #1890ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
        </Title>
        
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: isSoldOut ? COLORS.secondary.main : COLORS.accent.green
              }}>
                {availableTickets}
              </Text>
              <br />
              <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                Disponibles
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.neutral.grey4 }}>
                {soldTickets}
              </Text>
              <br />
              <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                Vendidas
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.neutral.grey4 }}>
                {totalCapacity}
              </Text>
              <br />
              <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                Capacidad total
              </Text>
            </div>
          </Col>
        </Row>
        
        {totalCapacity > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: COLORS.neutral.grey2,
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${salesPercentage}%`,
                height: '100%',
                backgroundColor: isSoldOut ? COLORS.secondary.main : COLORS.accent.green,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <Text style={{ 
              fontSize: '12px', 
              color: COLORS.neutral.grey4,
              marginTop: '4px',
              display: 'block'
            }}>
              {salesPercentage}% vendido
            </Text>
          </div>
        )}
        
        <Text style={{ 
          fontSize: '10px', 
          color: COLORS.neutral.grey3,
          marginTop: '8px',
          display: 'block'
        }}>
          Última actualización: {dayjs(lastUpdated).format('HH:mm:ss')}
        </Text>
      </Card>
    );
  };

  const renderBlockingStats = () => {
    if (!event?.blockingStats?.hasBlocks) return null;

    return (
      <Card style={{ 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginTop: '24px',
        borderLeft: `4px solid ${COLORS.accent.gold}`
      }}>
        <Title level={5} style={{ 
          color: COLORS.neutral.grey800,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <StopOutlined style={{ 
            marginRight: '8px', 
            color: COLORS.accent.gold 
          }} />
          Restricciones de disponibilidad
        </Title>
        
        <Row gutter={[16, 8]}>
          {event.blockingStats.blockedSeats > 0 && (
            <Col xs={24} sm={12}>
              <Text style={{ color: COLORS.neutral.grey4 }}>
                <strong>Asientos bloqueados:</strong> {event.blockingStats.blockedSeats}
              </Text>
            </Col>
          )}
          {event.blockingStats.blockedSections > 0 && (
            <Col xs={24} sm={12}>
              <Text style={{ color: COLORS.neutral.grey4 }}>
                <strong>Secciones bloqueadas:</strong> {event.blockingStats.blockedSections}
              </Text>
            </Col>
          )}
        </Row>
      </Card>
    );
  };

  if (loading) {
    return (
      <Layout style={{ backgroundColor: COLORS.neutral.white, minHeight: "100vh" }}>
        <Content style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Content>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout style={{ backgroundColor: COLORS.neutral.white, minHeight: "100vh" }}>
        <Content style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <Alert
            message="Error"
            description={error || "Evento no encontrado"}
            type="error"
            showIcon
            action={
              <Link to="/">
                <Button size="small" type="primary">
                  Volver al inicio
                </Button>
              </Link>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.white, minHeight: "100vh" }}>
      <Content style={{ padding: isMobile ? "18px 4px" : "40px 20px" }}>
        <div style={{ maxWidth: isMobile ? "100%" : "1000px", margin: "0 auto" }}>
          {/* Breadcrumb y botón de regreso */}
          <div style={{ 
            backgroundColor: COLORS.neutral.grey1, 
            padding: '16px 0',
            borderBottom: `1px solid ${COLORS.neutral.grey2}`,
            marginBottom: '32px'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
              <Link to="/">
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />}
                  style={{ color: COLORS.primary.main }}
                >
                  Volver a eventos
                </Button>
              </Link>
            </div>
          </div>

          {/* Sección principal del evento */}
          <Row gutter={[32, 32]}>
            {/* Imagen del evento */}
            <Col xs={24} lg={12}>
              <Card 
                bodyStyle={{ padding: 0 }}
                style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
              {event.image ? (
                <FramedImage 
                  src={event.image}
                  alt={event.name}
                  backgroundColor={COLORS.neutral.grey1}
                  borderRadius={12}
                  aspectRatio={isMobile ? 16/9 : 4/3}
                  maxHeight={isMobile ? 320 : 500}
                  objectFit="smart"
                />
              ) : (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '400px',
                    backgroundColor: COLORS.neutral.grey1
                  }}>
                    <PictureOutlined style={{ fontSize: '64px', color: COLORS.neutral.grey3, marginBottom: '16px' }} />
                    <Text style={{ color: COLORS.neutral.grey4 }}>Sin imagen disponible</Text>
                  </div>
                )}
              </Card>
            </Col>

            {/* Información del evento */}
            <Col xs={24} lg={12}>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                {/* Título y categoría */}
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <Tag 
                      color={getCategoryColor(event.category)}
                      style={{ fontSize: '14px', padding: '4px 12px' }}
                    >
                      <TagOutlined style={{ marginRight: '4px' }} />
                      {event.category}
                    </Tag>
                    
                    <Tag 
                      color={getStateColor(event.state)}
                      style={{ fontSize: '14px', padding: '4px 12px', marginLeft: '8px' }}
                    >
                      {isEventActive() ? (
                        <CheckCircleOutlined style={{ marginRight: '4px' }} />
                      ) : (
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                      )}
                      {getStateText(event.state)}
                    </Tag>
                  </div>
                  
                  <Title level={1} style={{ 
                    color: COLORS.neutral.darker,
                    marginBottom: '8px',
                    fontSize: '32px',
                    lineHeight: '1.2'
                  }}>
                    {event.name}
                  </Title>
                </div>

                {/* Información clave */}
                <Card style={{ 
                  backgroundColor: COLORS.neutral.grey1,
                  border: 'none'
                }}>
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarOutlined style={{ 
                        fontSize: '18px', 
                        color: COLORS.primary.main,
                        marginRight: '12px'
                      }} />
                      <div>
                        <Text style={{ fontSize: '16px', fontWeight: '600', color: COLORS.neutral.dark }}>
                          {dayjs(event.date).format("dddd, DD [de] MMMM [de] YYYY")}
                        </Text>
                        <br />
                        <Text style={{ color: COLORS.neutral.grey4 }}>
                          {dayjs(event.date).format("HH:mm")} hrs
                        </Text>
                      </div>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <EnvironmentOutlined style={{ 
                        fontSize: '18px', 
                        color: COLORS.primary.main,
                        marginRight: '12px',
                        marginTop: '2px'
                      }} />
                      <div style={{ flex: 1 }}>
                        <Text style={{ fontSize: '16px', fontWeight: '600', color: COLORS.neutral.dark }}>
                          {event.location?.name || 'Ubicación no disponible'}
                        </Text>
                        <br />
                        <Text style={{ color: COLORS.neutral.grey4 }}>
                          {event.location?.address || 'Dirección no disponible'}
                        </Text>
                        {event.capacity && (
                          <>
                            <br />
                            <Text style={{ color: COLORS.neutral.grey4, display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                              <TeamOutlined style={{ marginRight: '4px' }} />
                              Capacidad: {event.capacity.toLocaleString()} personas
                            </Text>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rango de precios */}
                    {event.priceRange && (
                      <>
                        <Divider style={{ margin: '12px 0' }} />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <EuroOutlined style={{ 
                            fontSize: '18px', 
                            color: COLORS.primary.main,
                            marginRight: '12px'
                          }} />
                          <div>
                            <Text style={{ fontSize: '16px', fontWeight: '600', color: COLORS.neutral.dark }}>
                              Precios desde
                            </Text>
                            <br />
                            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.primary.main }}>
                              {event.priceRange.display}
                            </Text>
                          </div>
                        </div>
                      </>
                    )}
                  </Space>
                </Card>

                {/* Botón de compra */}
                <div>
                  {isEventAvailable() && (!ticketAvailability || !ticketAvailability.isSoldOut) ? (
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleBuyTickets}
                      style={{
                        width: '100%',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '600',
                        backgroundColor: COLORS.primary.main,
                        borderColor: COLORS.primary.main,
                        boxShadow: `0 4px 8px ${COLORS.primary.light}40`
                      }}
                    >
                      Comprar Entradas
                    </Button>
                  ) : (
                    <Button
                      size="large"
                      disabled
                      style={{
                        width: '100%',
                        height: '48px',
                        fontSize: '16px'
                      }}
                    >
                      {ticketAvailability?.isSoldOut ? (
                        <>
                          <StopOutlined /> Agotado
                        </>
                      ) : (
                        <>
                          <ClockCircleOutlined /> {getStateText(event.state)}
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Text style={{ 
                    display: 'block', 
                    textAlign: 'center', 
                    marginTop: '8px',
                    color: COLORS.neutral.grey4,
                    fontSize: '14px'
                  }}>
                    {ticketAvailability?.isSoldOut ? 'No hay entradas disponibles' : 
                     isEventAvailable() ? 'Reserva tu lugar ahora' : 
                     `Este evento está ${event.state}`}
                  </Text>
                </div>
              </Space>
            </Col>
          </Row>

          {/* Información de precios detallada */}
          {renderPricingInfo()}

          {/* Disponibilidad de tickets en tiempo real */}
          {renderTicketAvailability()}

          {/* Estadísticas de bloqueos */}
          {renderBlockingStats()}

          {/* Descripción del evento */}
          <Row style={{ marginTop: '48px' }}>
            <Col span={24}>
              <Card style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <Title level={3} style={{ 
                  color: COLORS.neutral.darker,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <InfoCircleOutlined style={{ 
                    marginRight: '8px', 
                    color: COLORS.primary.main 
                  }} />
                  Descripción del evento
                </Title>
                
                <Paragraph style={{ 
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: COLORS.neutral.dark,
                  marginBottom: 0
                }}>
                  {event.description || 'No hay descripción disponible para este evento.'}
                </Paragraph>

                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: COLORS.neutral.grey1, borderRadius: '8px' }}>
                  <Title level={5} style={{ color: COLORS.neutral.darker, marginBottom: '12px' }}>
                    Información adicional
                  </Title>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12}>
                      <Text style={{ color: COLORS.neutral.grey4 }}>
                        <strong>Tipo de evento:</strong> {mapEventTypeToCategory(event.type)}
                      </Text>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text style={{ color: COLORS.neutral.grey4 }}>
                        <strong>Estado:</strong> {getStateText(event.state)}
                      </Text>
                    </Col>
                    {event.location?.category && (
                      <Col xs={24} sm={12}>
                        <Text style={{ color: COLORS.neutral.grey4 }}>
                          <strong>Tipo de venue:</strong> {event.location.category}
                        </Text>
                      </Col>
                    )}
                    {event.usesSectionPricing && (
                      <Col xs={24} sm={12}>
                        <Text style={{ color: COLORS.neutral.grey4 }}>
                          <strong>Sistema de precios:</strong> {event.usesRowPricing ? 'Por secciones y filas' : 'Por secciones'}
                        </Text>
                      </Col>
                    )}
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default EventDetails;