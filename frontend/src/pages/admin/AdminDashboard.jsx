import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Typography, 
  Button, 
  Row, 
  Col, 
  Table, 
  Alert, 
  Card, 
  Space, 
  Statistic, 
  Tag, 
  Tooltip, 
  Breadcrumb,
  Input
} from 'antd';
import { 
  PlusOutlined, 
  CalendarOutlined, 
  AppstoreOutlined, 
  EnvironmentOutlined, 
  EyeOutlined,
  DashboardOutlined,
  SearchOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

// Importamos el esquema de colores (asumiendo que está disponible)
import { COLORS } from "../../components/colorscheme";

const { Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchText, setSearchText] = useState('');
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    setLoading(true);
    setErrorMessage(null);
    axios.get(gatewayUrl + "/events")
      .then(res => {
        // Asignar categoría aleatoria para demo si no existe
        const eventsWithCategories = res.data.map(event => ({
          ...event,
          category: event.category || getRandomCategory(),
          // El estado ahora viene del backend
        }));
        setEvents(eventsWithCategories);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading events", err);
        setErrorMessage("Failed to load events. Please try again.");
        setLoading(false);
      });
  }, [gatewayUrl]);

  const getRandomCategory = () => {
    const categories = ["Conciertos", "Teatro", "Deportes", "Festivales", "Cine"];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  const getCategoryColor = (categoryName) => {
    switch(categoryName) {
      case "Conciertos": return COLORS?.categories?.conciertos || "#1890ff";
      case "Teatro": return COLORS?.categories?.teatro || "#722ed1";
      case "Deportes": return COLORS?.categories?.deportes || "#52c41a";
      case "Festivales": return COLORS?.categories?.festivales || "#fa8c16";
      case "Cine": return COLORS?.categories?.cine || "#eb2f96";
      default: return COLORS?.primary?.main || "#1890ff";
    }
  };

  const getStateColor = (state) => {
    switch(state) {
      case "activo": return COLORS?.status?.success || "#52c41a";
      case "proximo": return COLORS?.status?.info || "#1890ff";
      case "finalizado": return COLORS?.neutral?.grey4 || "#8c8c8c";
      case "cancelado": return COLORS?.status?.error || "#ff4d4f";
      default: return COLORS?.neutral?.grey3 || "#d9d9d9";
    }
  };

  const getStateIcon = (state) => {
    switch(state) {
      case "activo": return <CheckCircleOutlined />;
      case "proximo": return <ClockCircleOutlined />;
      case "finalizado": return <StopOutlined />;
      case "cancelado": return <StopOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getStateLabel = (state) => {
    switch(state) {
      case "activo": return "Activo";
      case "proximo": return "Próximo";
      case "finalizado": return "Finalizado";
      case "cancelado": return "Cancelado";
      default: return "Desconocido";
    }
  };

  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Nombre del evento',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: getCategoryColor(record.category),
            marginRight: '8px'
          }}></span>
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: (text) => (
        <Space>
          <CalendarOutlined style={{ color: COLORS?.primary?.main || "#1890ff" }} />
          <span>{dayjs(text).format('DD MMM YYYY HH:mm')}</span>
        </Space>
      ),
    },
    {
      title: 'Ubicación',
      key: 'location',
      render: (text, record) => (
        <Space>
          <EnvironmentOutlined style={{ color: COLORS?.neutral?.grey4 || "#8c8c8c" }} />
          <span>{record.location?.name || 'Desconocido'}</span>
        </Space>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)} style={{ borderRadius: '4px' }}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <Tag 
          color={getStateColor(state)} 
          icon={getStateIcon(state)}
          style={{ 
            borderRadius: '4px',
            fontWeight: '500',
            padding: '4px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {getStateLabel(state)}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (text, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Link to={`/event/${record._id}`}>
              <Button 
                type="primary" 
                icon={<EyeOutlined />} 
                size="small"
                style={{ 
                  backgroundColor: COLORS?.primary?.main || "#1890ff",
                  borderColor: COLORS?.primary?.main || "#1890ff"
                }}
              >
                Ver
              </Button>
            </Link>
          </Tooltip>
          <Tooltip title="Editar evento">
            <Button 
              icon={<AppstoreOutlined />}
              size="small"
              style={{ borderColor: COLORS?.neutral?.grey3 || "#d9d9d9" }}
            >
              Editar
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Dashboard stats actualizadas con los nuevos estados
  const stats = [
    { 
      title: 'Total de Eventos', 
      value: events.length, 
      icon: <AppstoreOutlined />, 
      color: COLORS?.primary?.main || "#1890ff" 
    },
    { 
      title: 'Eventos Activos', 
      value: events.filter(e => e.state === 'activo').length, 
      icon: <CheckCircleOutlined />, 
      color: COLORS?.status?.success || "#52c41a"
    },
    { 
      title: 'Próximos Eventos', 
      value: events.filter(e => e.state === 'proximo').length, 
      icon: <ClockCircleOutlined />, 
      color: COLORS?.status?.info || "#1890ff"
    },
    { 
      title: 'Finalizados', 
      value: events.filter(e => e.state === 'finalizado').length, 
      icon: <BarChartOutlined />, 
      color: COLORS?.neutral?.grey4 || "#8c8c8c"
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: COLORS?.neutral?.white || "#ffffff" }}>
      <Content style={{ padding: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header with breadcrumb */}
          <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
            <Col>
              <Breadcrumb 
                items={[
                  { title: 'Inicio' },
                  { title: 'Administración' }
                ]}
                style={{ marginBottom: '8px' }}
              />
              <Title 
                level={2} 
                style={{ 
                  margin: 0, 
                  color: COLORS?.neutral?.darker || "#262626",
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <DashboardOutlined style={{ marginRight: '12px', color: COLORS?.primary?.main || "#1890ff" }} />
                Panel de Administración
              </Title>
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => window.location.href = '/create-event'}
                style={{ 
                  backgroundColor: COLORS?.primary?.main || "#1890ff",
                  borderColor: COLORS?.primary?.main || "#1890ff",
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)'
                }}
              >
                Crear nuevo evento
              </Button>
            </Col>
          </Row>

          {/* Error message */}
          {errorMessage && (
            <Alert
              message="Error"
              description={errorMessage}
              type="error"
              showIcon
              style={{ marginBottom: 24, borderRadius: '6px' }}
            />
          )}

          {/* Stats cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card 
                  hoverable 
                  style={{ 
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.07)',
                    height: '100%'
                  }}
                >
                  <Statistic
                    title={
                      <Text style={{ fontSize: '14px', color: COLORS?.neutral?.grey4 || "#8c8c8c", fontWeight: '500' }}>
                        {stat.title}
                      </Text>
                    }
                    value={stat.value}
                    valueStyle={{ color: stat.color, fontSize: '28px', fontWeight: 'bold' }}
                    prefix={
                      <span style={{ 
                        backgroundColor: `${stat.color}15`, // 15% opacity
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        {React.cloneElement(stat.icon, { style: { fontSize: '20px', color: stat.color } })}
                      </span>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Search and filters */}
          <Card 
            style={{ 
              marginBottom: '24px', 
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
            }}
          >
            <Row gutter={16} justify="space-between" align="middle">
              <Col xs={24} md={8}>
                <Input
                  placeholder="Buscar eventos..."
                  prefix={<SearchOutlined style={{ color: COLORS?.neutral?.grey3 || "#d9d9d9" }} />}
                  allowClear
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ borderRadius: '6px' }}
                  size="large"
                />
              </Col>
              <Col xs={24} md={16} style={{ textAlign: 'right' }}>
                <Space wrap>
                  <Button 
                    icon={<CalendarOutlined />} 
                    style={{ borderRadius: '6px' }}
                  >
                    Fecha
                  </Button>
                  <Button 
                    icon={<AppstoreOutlined />} 
                    style={{ borderRadius: '6px' }}
                  >
                    Categoría
                  </Button>
                  <Button 
                    icon={<CheckCircleOutlined />} 
                    style={{ borderRadius: '6px' }}
                  >
                    Estado
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    style={{ 
                      backgroundColor: COLORS?.primary?.main || "#1890ff",
                      borderColor: COLORS?.primary?.main || "#1890ff",
                      borderRadius: '6px'
                    }}
                  >
                    Buscar
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Events table */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AppstoreOutlined style={{ 
                  color: COLORS?.primary?.main || "#1890ff", 
                  marginRight: '8px', 
                  fontSize: '20px' 
                }} />
                <span style={{ fontSize: '18px', fontWeight: '600' }}>Lista de Eventos</span>
              </div>
            }
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.07)'
            }}
            extra={
              <Text type="secondary">Total: {filteredEvents.length} eventos</Text>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredEvents}
              rowKey="_id"
              loading={loading}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} elementos`,
                style: {
                  marginTop: '16px'
                }
              }}
              style={{ 
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              rowClassName={(record) => {
                // Añadir clase especial para eventos cancelados
                return record.state === 'cancelado' ? 'cancelled-event-row' : '';
              }}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminDashboard;