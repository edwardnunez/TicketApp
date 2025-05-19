import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Layout, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Button, 
  DatePicker, 
  Input,
  Skeleton, 
  Empty, 
  Tag, 
  Carousel, 
  Tabs, 
  Space, 
  Tooltip,
  notification
} from "antd";
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  SearchOutlined, 
  FireOutlined,
  StarOutlined,
  TagOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  PictureOutlined
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

// Importamos el esquema de colores
import { COLORS } from "../components/colorscheme";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Meta } = Card;
const { TabPane } = Tabs;

const FEATURED_CATEGORIES = [
  { name: "Conciertos", color: COLORS.categories.conciertos },
  { name: "Teatro", color: COLORS.categories.teatro },
  { name: "Deportes", color: COLORS.categories.deportes },
  { name: "Festivales", color: COLORS.categories.festivales },
  { name: "Cine", color: COLORS.categories.cine }
];

const FEATURED_EVENTS = [
  {
    _id: "feat1",
    name: "Festival de Música Indie",
    date: dayjs().add(7, 'day').format("YYYY-MM-DD"),
    location: "Estadio Principal",
    image: "/images/featured-1.jpg",
    category: "Festivales",
    price: "45€",
    featured: true
  },
  {
    _id: "feat2",
    name: "Obra de Teatro 'La Tempestad'",
    date: dayjs().add(14, 'day').format("YYYY-MM-DD"),
    location: "Teatro Nacional",
    image: "/images/featured-2.jpg",
    category: "Teatro",
    price: "32€",
    featured: true
  },
  {
    _id: "feat3",
    name: "Partido Final de Temporada",
    date: dayjs().add(5, 'day').format("YYYY-MM-DD"),
    location: "Arena Deportiva",
    image: "/images/featured-3.jpg",
    category: "Deportes",
    price: "70€",
    featured: true
  }
];

const Home = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {

    // Cargar todos los eventos
    setLoading(true);
    axios.get(`${gatewayUrl}/events`)
      .then((res) => {
        const events = res.data.map(event => ({
          ...event,
          date: dayjs(event.date).format("YYYY-MM-DD"),
          image: event.image || "/images/default.jpg",
          // Asignar categoría aleatoria para demo
          category: FEATURED_CATEGORIES[Math.floor(Math.random() * FEATURED_CATEGORIES.length)].name
        }));

        // Añadir eventos destacados para demo
        const allEventsWithFeatured = [...FEATURED_EVENTS, ...events];
        
        setAllEvents(allEventsWithFeatured);
        setFilteredEvents(allEventsWithFeatured);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading events", err);
        setLoading(false);
        api.error({
          message: 'Error',
          description: 'No se pudieron cargar los eventos. Por favor, inténtalo de nuevo más tarde.',
          placement: 'top',
        });
      });
  }, [gatewayUrl, api]);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterEvents(searchTerm, activeCategory);
  };

  const handleDateFilter = (dates) => {
    if (!dates) {
      return filterEvents('', activeCategory);
    }
    
    const [start, end] = dates;
    setFilteredEvents(
      allEvents.filter((event) => {
        const matchesCategory = !activeCategory || event.category === activeCategory;
        const matchesDate = dayjs(event.date).isBetween(start, end, null, "[]");
        return matchesCategory && matchesDate;
      })
    );
  };

  const filterEvents = (searchTerm = '', category = null) => {
    setActiveCategory(category);
    
    setFilteredEvents(
      allEvents.filter((event) => {
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !category || event.category === category;
        return matchesSearch && matchesCategory;
      })
    );
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

  // Componente de tarjeta de evento reutilizable
  const EventCard = ({ event, featured = false }) => (
    <Card
      hoverable
      className="event-card"
      cover={
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
          {event.image ? (
            <img 
              alt={event.name} 
              src={event.image} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }} 
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              backgroundColor: COLORS.neutral.grey1
            }}>
              <PictureOutlined style={{ fontSize: '48px', color: COLORS.neutral.grey3 }} />
            </div>
          )}
          {featured && (
            <Tag color={COLORS.status.warning} style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px',
              padding: '0 8px'
            }}>
              <FireOutlined /> Destacado
            </Tag>
          )}
          <Tag color={getCategoryColor(event.category)} style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '10px' 
          }}>
            {event.category}
          </Tag>
        </div>
      }
      actions={[
        <Link to={`/event/${event._id}`}>
          <Button type="text" icon={<ArrowRightOutlined />}>Ver detalles</Button>
        </Link>
      ]}
      bodyStyle={{ padding: '16px' }}
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 1px 2px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.07), 0 4px 8px rgba(0,0,0,0.07)',
        border: featured ? `1px solid ${getCategoryColor(event.category)}` : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Meta
        title={
          <Tooltip title={event.name}>
            <div style={{ 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              fontSize: '16px',
              fontWeight: '600',
              color: COLORS.neutral.darker
            }}>
              {event.name}
            </div>
          </Tooltip>
        }
        description={
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ display: 'flex', alignItems: 'center', color: COLORS.neutral.grey4 }}>
                <CalendarOutlined style={{ marginRight: '5px', color: COLORS.neutral.grey4 }} /> 
                {dayjs(event.date).format("DD MMM YYYY")}
              </Text>
              {event.price && (
                <Tag color={COLORS.primary.main}>{event.price}</Tag>
              )}
            </div>
            <Text style={{ display: 'flex', alignItems: 'center', color: COLORS.neutral.grey4 }}>
              <EnvironmentOutlined style={{ marginRight: '5px', color: COLORS.neutral.grey4 }} /> 
              <Tooltip title={event.location.name}>
                <span style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  maxWidth: '180px',
                  display: 'inline-block'
                }}>
                  {event.location.name}
                </span>
              </Tooltip>
            </Text>
          </Space>
        }
      />
    </Card>
  );

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.white, minHeight: "100vh" }}>
      {contextHolder} {/* Para las notificaciones */}
      
      <Content>
        {/* Hero Section - usando el gradiente principal */}
        <div style={{ 
          background: COLORS.gradients.primary,
          padding: '60px 20px',
          textAlign: 'center',
          color: COLORS.neutral.white
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={1} style={{ color: COLORS.neutral.white, marginBottom: '16px' }}>
              Descubre eventos increíbles
            </Title>
            <Paragraph style={{ 
              fontSize: '18px', 
              maxWidth: '700px', 
              margin: '0 auto 32px',
              color: 'rgba(255, 255, 255, 0.85)'
            }}>
              Encuentra y reserva entradas para los mejores conciertos, obras de teatro, 
              eventos deportivos y mucho más.
            </Paragraph>
            
            <div style={{ 
              background: COLORS.neutral.white, 
              borderRadius: '8px', 
              padding: '24px',
              maxWidth: '800px',
              margin: '0 auto',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}>
              <Row gutter={16} align="middle">
                <Col xs={24} sm={12} md={14}>
                  <Input
                    size="large"
                    placeholder="Buscar eventos..."
                    prefix={<SearchOutlined style={{ color: COLORS.neutral.grey4 }} />}
                    onChange={handleSearch}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={10}>
                  <RangePicker 
                    size="large"
                    onChange={handleDateFilter}
                    style={{ width: '100%' }}
                    placeholder={['Desde', 'Hasta']}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </div>

        {/* Categorías destacadas */}
        <div style={{ maxWidth: '1200px', margin: '40px auto 20px', padding: '0 20px' }}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <div>
              <Title level={4} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: COLORS.neutral.dark }}>
                <TagOutlined style={{ marginRight: '8px', color: COLORS.primary.main }} />
                Categorías Destacadas
              </Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <Button 
                  type={activeCategory === null ? 'primary' : 'default'}
                  onClick={() => filterEvents('', null)}
                  style={{
                    backgroundColor: activeCategory === null ? COLORS.primary.main : '',
                    borderColor: activeCategory === null ? COLORS.primary.main : ''
                  }}
                >
                  Todos
                </Button>
                {FEATURED_CATEGORIES.map(category => (
                  <Button
                    key={category.name}
                    type={activeCategory === category.name ? 'primary' : 'default'}
                    style={{ 
                      borderColor: category.color,
                      color: activeCategory === category.name ? COLORS.neutral.white : category.color,
                      backgroundColor: activeCategory === category.name ? category.color : 'transparent'
                    }}
                    onClick={() => filterEvents('', category.name)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Eventos destacados - Carrusel */}
            <div>
              <Title level={4} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', color: COLORS.neutral.dark }}>
                <FireOutlined style={{ marginRight: '8px', color: COLORS.status.warning }} />
                Eventos Destacados
              </Title>
              
              <Carousel 
                autoplay 
                effect="fade"
                autoplaySpeed={5000}
                style={{ 
                  marginBottom: '24px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {FEATURED_EVENTS.map(event => (
                  <div key={event._id}>
                    <div style={{ 
                      position: 'relative', 
                      height: '300px',
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url(${event.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '30px'
                    }}>
                      <div style={{ color: COLORS.neutral.white, maxWidth: '600px' }}>
                        <Tag color={getCategoryColor(event.category)} style={{ marginBottom: '10px' }}>
                          {event.category}
                        </Tag>
                        <Title level={2} style={{ color: COLORS.neutral.white, margin: '0 0 8px 0' }}>
                          {event.name}
                        </Title>
                        <Space>
                          <Text style={{ color: COLORS.neutral.white }}>
                            <CalendarOutlined style={{ marginRight: '5px' }} />
                            {dayjs(event.date).format("DD MMM YYYY")}
                          </Text>
                          <Text style={{ color: COLORS.neutral.white }}>
                            <EnvironmentOutlined style={{ marginRight: '5px' }} />
                            {event.location}
                          </Text>
                        </Space>
                        <div style={{ marginTop: '16px' }}>
                          <Link to={`/event/${event._id}`}>
                            <Button 
                              type="primary" 
                              size="large"
                              style={{
                                backgroundColor: COLORS.primary.main,
                                borderColor: COLORS.primary.main
                              }}
                            >
                              Ver evento
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>

            {/* Contenido principal con tabs */}
            <Tabs 
              defaultActiveKey="1" 
              type="card"
              style={{
                '& .ant-tabs-nav .ant-tabs-tab-active': {
                  color: COLORS.primary.main,
                }
              }}
            >
              <TabPane 
                tab={
                  <span>
                    <StarOutlined style={{ color: COLORS.primary.main }} />
                    Próximos eventos
                  </span>
                } 
                key="1"
              >
                {loading ? (
                  <Row gutter={[24, 24]}>
                    {[...Array(8)].map((_, i) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={i}>
                        <Card>
                          <Skeleton active avatar paragraph={{ rows: 2 }} />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  filteredEvents.length > 0 ? (
                    <Row gutter={[24, 24]}>
                      {filteredEvents.map((event) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={event._id}>
                          <EventCard event={event} featured={event.featured} />
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span style={{ color: COLORS.neutral.grey4 }}>
                          No se encontraron eventos con los filtros seleccionados
                        </span>
                      }
                    >
                      <Button 
                        type="primary" 
                        onClick={() => filterEvents('', null)}
                        style={{
                          backgroundColor: COLORS.primary.main,
                          borderColor: COLORS.primary.main
                        }}
                      >
                        Ver todos los eventos
                      </Button>
                    </Empty>
                  )
                )}
              </TabPane>
              <TabPane 
                tab={
                  <span>
                    <TeamOutlined style={{ color: COLORS.primary.dark }} />
                    Populares
                  </span>
                } 
                key="3"
              >
                <Row gutter={[24, 24]}>
                  {FEATURED_EVENTS.map((event) => (
                    <Col xs={24} sm={12} md={8} lg={8} key={event._id}>
                      <EventCard event={event} featured={true} />
                    </Col>
                  ))}
                </Row>
              </TabPane>
            </Tabs>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};
export default Home;