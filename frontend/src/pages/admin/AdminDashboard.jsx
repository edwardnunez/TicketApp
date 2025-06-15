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
  Input,
  Select,
  DatePicker,
  Dropdown,
  Menu
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
  StopOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

// Importamos el esquema de colores (asumiendo que está disponible)
import { COLORS } from "../../components/colorscheme";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    searchText: '',
    category: 'all',
    state: 'all',
    dateRange: null
  });

  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  useEffect(() => {
    setLoading(true);
    setErrorMessage(null);
    axios.get(gatewayUrl + "/events")
      .then(res => {
        const eventsWithCategories = res.data.map(event => ({
          ...event,
          category: event.category || mapEventTypeToCategory(event.type),
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

  // Función para obtener categorías únicas
  const getUniqueCategories = () => {
    const categories = [...new Set(events.map(event => event.category))];
    return categories.sort();
  };

  // Función para obtener estados únicos
  const getUniqueStates = () => {
    const states = [...new Set(events.map(event => event.state))];
    return states.sort();
  };

  // Función principal de filtrado
  const getFilteredEvents = () => {
    return events.filter(event => {
      // Filtro por texto de búsqueda
      const matchesSearch = event.name.toLowerCase().includes(filters.searchText.toLowerCase());
      
      // Filtro por categoría
      const matchesCategory = filters.category === 'all' || event.category === filters.category;
      
      // Filtro por estado
      const matchesState = filters.state === 'all' || event.state === filters.state;
      
      // Filtro por rango de fechas
      let matchesDate = true;
      if (filters.dateRange && filters.dateRange.length === 2) {
        const eventDate = dayjs(event.date);
        const [startDate, endDate] = filters.dateRange;
        matchesDate = eventDate.isAfter(startDate.startOf('day')) && eventDate.isBefore(endDate.endOf('day'));
      }
      
      return matchesSearch && matchesCategory && matchesState && matchesDate;
    });
  };

  const filteredEvents = getFilteredEvents();

  // Funciones para manejar cambios en filtros
  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      searchText: e.target.value
    }));
  };

  const handleCategoryChange = (value) => {
    setFilters(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleStateChange = (value) => {
    setFilters(prev => ({
      ...prev,
      state: value
    }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({
      ...prev,
      dateRange: dates
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchText: '',
      category: 'all',
      state: 'all',
      dateRange: null
    });
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = () => {
    return filters.searchText !== '' || 
           filters.category !== 'all' || 
           filters.state !== 'all' || 
           filters.dateRange !== null;
  };

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

  // Dashboard stats actualizadas con los eventos filtrados
  const stats = [
    { 
      title: 'Total de Eventos', 
      value: filteredEvents.length, 
      icon: <AppstoreOutlined />, 
      color: COLORS?.primary?.main || "#1890ff" 
    },
    { 
      title: 'Eventos Activos', 
      value: filteredEvents.filter(e => e.state === 'activo').length, 
      icon: <CheckCircleOutlined />, 
      color: COLORS?.status?.success || "#52c41a"
    },
    { 
      title: 'Próximos Eventos', 
      value: filteredEvents.filter(e => e.state === 'proximo').length, 
      icon: <ClockCircleOutlined />, 
      color: COLORS?.status?.info || "#1890ff"
    },
    { 
      title: 'Finalizados', 
      value: filteredEvents.filter(e => e.state === 'finalizado').length, 
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

          {/* Filtros mejorados */}
          <Card 
            style={{ 
              marginBottom: '24px', 
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <FilterOutlined style={{ marginRight: '8px' }} />
                  Filtros de búsqueda
                </span>
                {hasActiveFilters() && (
                  <Button 
                    size="small" 
                    icon={<ClearOutlined />} 
                    onClick={clearAllFilters}
                    style={{ color: COLORS?.status?.error || "#ff4d4f" }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <Input
                  placeholder="Buscar eventos..."
                  prefix={<SearchOutlined style={{ color: COLORS?.neutral?.grey3 || "#d9d9d9" }} />}
                  allowClear
                  value={filters.searchText}
                  onChange={handleSearchChange}
                  style={{ borderRadius: '6px' }}
                  size="large"
                />
              </Col>
              <Col xs={24} md={5}>
                <Select
                  placeholder="Categoría"
                  style={{ width: '100%' }}
                  size="large"
                  value={filters.category}
                  onChange={handleCategoryChange}
                >
                  <Option value="all">Todas las categorías</Option>
                  {getUniqueCategories().map(category => (
                    <Option key={category} value={category}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: getCategoryColor(category),
                          marginRight: '8px'
                        }}></span>
                        {category}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={5}>
                <Select
                  placeholder="Estado"
                  style={{ width: '100%' }}
                  size="large"
                  value={filters.state}
                  onChange={handleStateChange}
                >
                  <Option value="all">Todos los estados</Option>
                  {getUniqueStates().map(state => (
                    <Option key={state} value={state}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getStateIcon(state)}
                        <span style={{ marginLeft: '8px' }}>
                          {getStateLabel(state)}
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={8}>
                <RangePicker
                  placeholder={['Fecha inicio', 'Fecha fin']}
                  style={{ width: '100%' }}
                  size="large"
                  value={filters.dateRange}
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                />
              </Col>
            </Row>
            
            {/* Indicador de filtros activos */}
            {hasActiveFilters() && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                <Space wrap>
                  <Text type="secondary">Filtros activos:</Text>
                  {filters.searchText && (
                    <Tag closable onClose={() => setFilters(prev => ({ ...prev, searchText: '' }))}>
                      Búsqueda: "{filters.searchText}"
                    </Tag>
                  )}
                  {filters.category !== 'all' && (
                    <Tag closable onClose={() => setFilters(prev => ({ ...prev, category: 'all' }))}>
                      Categoría: {filters.category}
                    </Tag>
                  )}
                  {filters.state !== 'all' && (
                    <Tag closable onClose={() => setFilters(prev => ({ ...prev, state: 'all' }))}>
                      Estado: {getStateLabel(filters.state)}
                    </Tag>
                  )}
                  {filters.dateRange && (
                    <Tag closable onClose={() => setFilters(prev => ({ ...prev, dateRange: null }))}>
                      Fechas: {filters.dateRange[0].format('DD/MM/YYYY')} - {filters.dateRange[1].format('DD/MM/YYYY')}
                    </Tag>
                  )}
                </Space>
              </div>
            )}
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
              <Space>
                <Text type="secondary">
                  Mostrando: {filteredEvents.length} de {events.length} eventos
                </Text>
                {hasActiveFilters() && (
                  <Tag color="blue">Filtrado</Tag>
                )}
              </Space>
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