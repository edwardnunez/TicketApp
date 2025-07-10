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
  notification,
  Skeleton,
  Alert,
  Divider,
  Image,
  Table,
  Tooltip,
  Badge
} from "antd";
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  TeamOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
  TagOutlined,
  FireOutlined,
  PictureOutlined,
  EuroOutlined,
  TableOutlined,
  StopOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";

// Importamos el esquema de colores
import { COLORS } from "../components/colorscheme";

// Configurar dayjs en español
dayjs.locale('es');

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

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
          // Usar imageUrl si está disponible, sino usar image por compatibilidad
          image: res.data.imageUrl || res.data.image || "/event-images/default.jpg",
          // Mapear tipo de evento a categoría para consistencia con Home
          category: mapEventTypeToCategory(res.data.type)
        };
        
        setEvent(eventData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading event details:", err);
        setError("No se pudo cargar la información del evento");
        setLoading(false);
        api.error({
          message: 'Error',
          description: 'No se pudieron cargar los detalles del evento. Por favor, inténtalo de nuevo más tarde.',
          placement: 'top',
        });
      });
  }, [id, gatewayUrl, api]);

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
      case 'activo': return COLORS.status.success;
      case 'proximo': return COLORS.status.warning;
      case 'finalizado': return COLORS.neutral.grey4;
      case 'cancelado': return COLORS.status.error;
      default: return COLORS.neutral.grey4;
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
      case "Conciertos": return COLORS.categories.conciertos;
      case "Teatro": return COLORS.categories.teatro;
      case "Deportes": return COLORS.categories.deportes;
      case "Festivales": return COLORS.categories.festivales;
      case "Cine": return COLORS.categories.cine;
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
              <TableOutlined style={{ marginRight: '4px', color: COLORS.neutral.grey4 }} />
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

  const renderBlockingStats = () => {
    if (!event?.blockingStats?.hasBlocks) return null;

    return (
      <Card style={{ 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginTop: '24px',
        borderLeft: `4px solid ${COLORS.status.warning}`
      }}>
        <Title level={5} style={{ 
          color: COLORS.neutral.darker,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <StopOutlined style={{ 
            marginRight: '8px', 
            color: COLORS.status.warning 
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
      {contextHolder}
      
      <Content>
        {/* Breadcrumb y botón de regreso */}
        <div style={{ 
          backgroundColor: COLORS.neutral.grey1, 
          padding: '16px 0',
          borderBottom: `1px solid ${COLORS.neutral.grey2}`
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
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
                <div style={{ 
                  position: 'relative',
                  width: '100%',
                  height: '400px',
                  overflow: 'hidden'
                }}>
                  <Image 
                    alt={event.name}
                    src={event.image}
                    width="100%"
                    height="100%"
                    style={{ 
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    preview={{
                      mask: (
                        <div style={{ color: COLORS.neutral.white }}>
                          <PictureOutlined /> Ver imagen completa
                        </div>
                      )
                    }}
                  />
                </div>
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
                  {isEventAvailable() ? (
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
                      <ClockCircleOutlined /> {getStateText(event.state)}
                    </Button>
                  )}
                  
                  <Text style={{ 
                    display: 'block', 
                    textAlign: 'center', 
                    marginTop: '8px',
                    color: COLORS.neutral.grey4,
                    fontSize: '14px'
                  }}>
                    {isEventAvailable() ? 'Reserva tu lugar ahora' : `Este evento está ${event.state}`}
                  </Text>
                </div>
              </Space>
            </Col>
          </Row>

          {/* Información de precios detallada */}
          {renderPricingInfo()}

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