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
  Modal,
  notification
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
  ClearOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
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

  // Hook para notificaciones y modales
  const [api, contextHolder] = notification.useNotification();
  const [modal, modalContextHolder] = Modal.useModal();

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

  const [currentUserId, setCurrentUserId] = useState(null);
  const username = localStorage.getItem('username');
  useEffect(() => {
    if (!username) return;
    axios.get(`${gatewayUrl}/users/search?username=${username}`)
      .then(res => {
        console.log('User data from search:', res.data);
        setCurrentUserId(res.data._id);
      })
      .catch(() => setCurrentUserId(null));
  }, [username, gatewayUrl]);

  const cancelEvent = async (eventId, eventName) => {
    modal.confirm({
      title: '¿Estás seguro de cancelar este evento?',
      icon: <ExclamationCircleOutlined style={{ color: COLORS?.status?.error || "#ff4d4f" }} />,
      content: (
        <div style={{ marginTop: '16px' }}>
          <p style={{ marginBottom: '12px' }}>
            Se cancelará el evento: <strong style={{ color: COLORS?.neutral?.darker || "#262626" }}>{eventName}</strong>
          </p>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fff2f0', 
            border: '1px solid #ffccc7',
            borderRadius: '6px',
            marginTop: '12px'
          }}>
            <p style={{ 
              color: COLORS?.status?.error || "#ff4d4f", 
              margin: 0,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ⚠️ También se eliminarán todos los tickets asociados a este evento. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      ),
      okText: 'Sí, cancelar',
      okType: 'danger',
      cancelText: 'No',
      okButtonProps: {
        style: {
          backgroundColor: COLORS?.status?.error || "#ff4d4f",
          borderColor: COLORS?.status?.error || "#ff4d4f",
          color: "#ffffff"
        }
      },
      cancelButtonProps: {
        style: {
          borderColor: COLORS?.neutral?.grey3 || "#d9d9d9"
        }
      },
      onOk: async () => {
        try {
          setLoading(true);
          await axios.delete(`${gatewayUrl}/events/${eventId}/cancel`, { data: { adminId: currentUserId } });
          setEvents(prevEvents => prevEvents.map(event => event._id === eventId ? { ...event, state: 'cancelado' } : event));
          api.success({
            message: 'Evento cancelado',
            description: 'El evento ha sido cancelado y todos sus tickets eliminados.',
            placement: 'top',
            duration: 4
          });
        } catch (error) {
          console.error("Error cancelando evento:", error);
          api.error({
            message: 'Error al cancelar',
            description: 'No se pudo cancelar el evento. Por favor, inténtalo de nuevo.',
            placement: 'top',
            duration: 4
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const deleteEvent = async (eventId, eventName) => {
    modal.confirm({
      title: '¿Estás seguro de eliminar este evento de la base de datos?',
      icon: <ExclamationCircleOutlined style={{ color: COLORS?.status?.error || "#ff4d4f" }} />,
      content: (
        <div style={{ marginTop: '16px' }}>
          <p style={{ marginBottom: '12px' }}>
            Se eliminará completamente el evento: <strong style={{ color: COLORS?.neutral?.darker || "#262626" }}>{eventName}</strong>
          </p>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fff2f0', 
            border: '1px solid #ffccc7',
            borderRadius: '6px',
            marginTop: '12px'
          }}>
            <p style={{ 
              color: COLORS?.status?.error || "#ff4d4f", 
              margin: 0,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ⚠️ Esta acción eliminará el evento y todos sus tickets asociados de la base de datos. No se puede deshacer.
            </p>
          </div>
        </div>
      ),
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'No',
      okButtonProps: {
        style: {
          backgroundColor: COLORS?.status?.error || "#ff4d4f",
          borderColor: COLORS?.status?.error || "#ff4d4f",
          color: "#ffffff"
        }
      },
      cancelButtonProps: {
        style: {
          borderColor: COLORS?.neutral?.grey3 || "#d9d9d9"
        }
      },
      onOk: async () => {
        try {
          setLoading(true);
          await axios.delete(`${gatewayUrl}/events/${eventId}?forceDelete=true`);
          setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
          api.success({
            message: 'Evento eliminado',
            description: 'El evento y todos sus tickets han sido eliminados de la base de datos.',
            placement: 'top',
            duration: 4
          });
        } catch (error) {
          console.error("Error eliminando evento:", error);
          api.error({
            message: 'Error al eliminar',
            description: 'No se pudo eliminar el evento. Por favor, inténtalo de nuevo.',
            placement: 'top',
            duration: 4
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const [usernamesById, setUsernamesById] = useState({});

  useEffect(() => {
    if (events.length === 0) return;
    // Obtener ids únicos de creadores
    const creatorIds = Array.from(new Set(events.map(e => e.createdBy)));
    // Solo buscar los que no tengamos ya
    const idsToFetch = creatorIds.filter(id => id && !usernamesById[id]);
    if (idsToFetch.length === 0) return;
    Promise.all(idsToFetch.map(id =>
      axios.get(`${gatewayUrl}/users/search?userId=${id}`)
        .then(res => ({ 
          id, 
          username: res.data.username
        }))
        .catch(() => ({ id, username: id }))
    )).then(results => {
      const newMap = { ...usernamesById };
      console.log('Fetched usernames:', results);
      results.forEach(({ id, username }) => { newMap[id] = username; });
      console.log('Fetched newMap:', newMap);
      setUsernamesById(newMap);
    });
  // eslint-disable-next-line
  }, [events]);

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
      title: 'Creado por',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy) => (
        <span>{usernamesById[createdBy] || createdBy}</span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (text, record) => {
        console.log('Record createdBy:', record.createdBy, 'CurrentUserId:', currentUserId, 'Comparison:', String(record.createdBy) === String(currentUserId));
        return (
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
            {String(record.createdBy) === String(currentUserId) && record.state !== 'cancelado' && (
              <Tooltip title="Cancelar evento">
                <Button 
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => cancelEvent(record._id, record.name)}
                  style={{ 
                    borderColor: COLORS?.status?.error || "#ff4d4f",
                    color: COLORS?.status?.error || "#ff4d4f"
                  }}
                >
                  Cancelar
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Eliminar evento de la base de datos">
              <Button 
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => deleteEvent(record._id, record.name)}
                style={{ 
                  borderColor: COLORS?.status?.error || "#ff4d4f",
                  color: COLORS?.status?.error || "#ff4d4f",
                  backgroundColor: '#fff0f0'
                }}
              >
                Eliminar
              </Button>
            </Tooltip>
          </Space>
        );
      },
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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.grey1, minHeight: "100vh" }}>
      {/* Agregamos los context holders para que funcionen las notificaciones y modales */}
      {contextHolder}
      {modalContextHolder}
      
      <Content style={{ padding: isMobile ? "18px 4px" : "40px 20px" }}>
        <div style={{ maxWidth: isMobile ? "100%" : "1200px", margin: "0 auto" }}>
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
              <Space>
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
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => window.location.href = '/create-location'}
                  style={{ 
                    backgroundColor: COLORS?.primary?.main || "#1890ff",
                    borderColor: COLORS?.primary?.main || "#1890ff",
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)'
                  }}
                >
                  Crear nueva ubicación
                </Button>
              </Space>
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