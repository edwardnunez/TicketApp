import React, { useEffect, useState, useCallback } from 'react';
import { 
  Layout, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Select, 
  DatePicker, 
  Button, 
  Tag, 
  Alert, 
  Spin,
  Progress,
  Input
} from 'antd';
import { 
  BarChartOutlined, 
  DollarOutlined, 
  CalendarOutlined,
  FilterOutlined,
  ClearOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  PercentageOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { COLORS } from '../../components/colorscheme';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    eventType: 'all',
    eventState: 'all',
    dateRange: null,
    search: ''
  });

  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  // Cargar estadísticas
  const loadStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.eventType !== 'all') {
        params.append('eventType', filters.eventType);
      }
      
      if (filters.eventState !== 'all') {
        params.append('eventState', filters.eventState);
      }
      
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.append('dateFrom', filters.dateRange[0].format('YYYY-MM-DD'));
        params.append('dateTo', filters.dateRange[1].format('YYYY-MM-DD'));
      }

      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }

      const response = await axios.get(`${gatewayUrl}/events/admin/statistics?${params.toString()}`);
      setStatistics(response.data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError('Error al cargar las estadísticas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filters, gatewayUrl]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Manejadores de filtros
  const handleEventTypeChange = (value) => {
    setFilters(prev => ({ ...prev, eventType: value }));
  };

  const handleEventStateChange = (value) => {
    setFilters(prev => ({ ...prev, eventState: value }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({
      eventType: 'all',
      eventState: 'all',
      dateRange: null,
      search: ''
    });
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Función para obtener color por tipo de evento
  const getEventTypeColor = (type) => {
    const typeMap = {
      'concert': '#1890ff',
      'football': '#52c41a',
      'cinema': '#eb2f96',
      'festival': '#fa8c16',
      'theater': '#722ed1'
    };
    return typeMap[type] || '#8c8c8c';
  };

  // Función para obtener etiqueta de tipo de evento
  const getEventTypeLabel = (type) => {
    const typeMap = {
      'concert': 'Concierto',
      'football': 'Fútbol',
      'cinema': 'Cine',
      'festival': 'Festival',
      'theater': 'Teatro'
    };
    return typeMap[type] || type;
  };

  // Función para obtener color por estado de evento
  const getEventStateColor = (state) => {
    const stateMap = {
      'activo': '#52c41a',
      'proximo': '#1890ff',
      'finalizado': '#8c8c8c',
      'cancelado': '#ff4d4f'
    };
    return stateMap[state] || '#8c8c8c';
  };

  // Función para obtener etiqueta de estado de evento
  const getEventStateLabel = (state) => {
    const stateMap = {
      'activo': 'Activo',
      'proximo': 'Próximo',
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado'
    };
    return stateMap[state] || state;
  };

  if (loading && !statistics) {
    return (
      <Layout style={{ padding: '24px' }}>
        <Content>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Cargando estadísticas...</Text>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ padding: '24px' }}>
        <Content>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={loadStatistics}>
                Reintentar
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  const { events, generalStats } = statistics || {};

  return (
    <Layout style={{ padding: '24px' }}>
      <Content>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.location.href = '/admin'}
              style={{ 
                marginRight: '12px',
                color: COLORS?.primary?.main || '#1890ff'
              }}
            >
              Volver al dashboard
            </Button>
          </div>
          <Title level={2} style={{ margin: 0, color: COLORS?.primary?.main || '#1890ff' }}>
            <BarChartOutlined style={{ marginRight: '8px' }} />
            Estadísticas de ventas
          </Title>
          <Text type="secondary">
            Análisis detallado de tickets vendidos y recaudaciones
          </Text>
        </div>

        {/* Filtros */}
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>
            <FilterOutlined style={{ marginRight: '8px' }} />
            Filtros
          </Title>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Text strong>Buscar evento:</Text>
              <Input
                placeholder="Buscar por nombre..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={handleSearchChange}
                style={{ marginTop: '4px' }}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text strong>Tipo de evento:</Text>
              <Select
                value={filters.eventType}
                onChange={handleEventTypeChange}
                style={{ width: '100%', marginTop: '4px' }}
                placeholder="Todos los tipos"
              >
                <Option value="all">Todos los tipos</Option>
                <Option value="concert">Conciertos</Option>
                <Option value="football">Fútbol</Option>
                <Option value="cinema">Cine</Option>
                <Option value="festival">Festivales</Option>
                <Option value="theater">Teatro</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text strong>Estado del evento:</Text>
              <Select
                value={filters.eventState}
                onChange={handleEventStateChange}
                style={{ width: '100%', marginTop: '4px' }}
                placeholder="Todos los estados"
              >
                <Option value="all">Todos los estados</Option>
                <Option value="activo">Activo</Option>
                <Option value="proximo">Próximo</Option>
                <Option value="finalizado">Finalizado</Option>
                <Option value="cancelado">Cancelado</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Text strong>Rango de Fechas:</Text>
              <RangePicker
                value={filters.dateRange}
                onChange={handleDateRangeChange}
                style={{ width: '100%', marginTop: '4px' }}
                placeholder={['Fecha inicio', 'Fecha fin']}
              />
            </Col>
            <Col xs={24} sm={24} md={24}>
              <Button
                icon={<ClearOutlined />}
                onClick={clearFilters}
                style={{ marginTop: '8px' }}
              >
                Limpiar Filtros
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Estadísticas Generales */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total de Eventos"
                value={generalStats?.totalEvents || 0}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: COLORS?.primary?.main || '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tickets Vendidos"
                value={generalStats?.totalSoldTickets || 0}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: COLORS?.status?.success || '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Recaudación total"
                value={generalStats?.totalRevenue || 0}
                formatter={(value) => formatCurrency(value)}
                prefix={<DollarOutlined />}
                valueStyle={{ color: COLORS?.status?.success || '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Promedio de ventas"
                value={generalStats?.averageSalesPercentage || 0}
                suffix="%"
                prefix={<PercentageOutlined />}
                valueStyle={{ color: COLORS?.status?.warning || '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabla de Eventos */}
        <Card>
          <Title level={4} style={{ marginBottom: '16px' }}>
            <EyeOutlined style={{ marginRight: '8px' }} />
            Lista de eventos con estadísticas de ventas
          </Title>
          <Table
            dataSource={events || []}
            columns={[
              {
                title: 'Evento',
                dataIndex: 'name',
                key: 'eventName',
                render: (text, record) => (
                  <div>
                    <Text strong style={{ fontSize: '14px' }}>{text || 'Evento no disponible'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <CalendarOutlined style={{ marginRight: '4px' }} />
                      {dayjs(record.date).format('DD MMM YYYY HH:mm')}
                    </Text>
                    {record.location && (
                      <div style={{ marginTop: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          <EnvironmentOutlined style={{ marginRight: '4px' }} />
                          {record.location.name}
                        </Text>
                      </div>
                    )}
                  </div>
                ),
                width: 250,
              },
              {
                title: 'Tipo',
                dataIndex: 'type',
                key: 'eventType',
                render: (type) => (
                  <Tag color={getEventTypeColor(type)}>
                    {getEventTypeLabel(type)}
                  </Tag>
                ),
                width: 100,
              },
              {
                title: 'Estado',
                dataIndex: 'state',
                key: 'eventState',
                render: (state) => (
                  <Tag color={getEventStateColor(state)}>
                    {getEventStateLabel(state)}
                  </Tag>
                ),
                width: 100,
              },
              {
                title: 'Capacidad',
                dataIndex: 'capacity',
                key: 'capacity',
                render: (capacity) => (
                  <Text strong>{capacity || 0}</Text>
                ),
                width: 80,
                align: 'center',
              },
              {
                title: 'Tickets vendidos',
                dataIndex: ['ticketStats', 'soldTickets'],
                key: 'soldTickets',
                render: (value) => (
                  <Text strong style={{ color: COLORS?.status?.success || '#52c41a' }}>
                    {value || 0}
                  </Text>
                ),
                width: 120,
                align: 'center',
              },
              {
                title: 'Porcentaje de ventas',
                key: 'salesPercentage',
                render: (_, record) => {
                  const percentage = record.salesPercentage || 0;
                  const status = percentage >= 80 ? 'success' : percentage >= 50 ? 'normal' : 'exception';
                  return (
                    <div style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        size={60}
                        percent={percentage}
                        status={status}
                        format={(percent) => `${percent}%`}
                      />
                    </div>
                  );
                },
                width: 100,
                align: 'center',
              },
              {
                title: 'Recaudación',
                dataIndex: ['ticketStats', 'soldRevenue'],
                key: 'soldRevenue',
                render: (value) => (
                  <Text strong style={{ color: COLORS?.status?.success || '#52c41a' }}>
                    {formatCurrency(value || 0)}
                  </Text>
                ),
                width: 120,
                align: 'right',
              },
              {
                title: 'Tickets disponibles',
                key: 'availableTickets',
                render: (_, record) => {
                  const available = record.availableTickets || 0;
                  const total = record.capacity || 0;
                  return (
                    <div>
                      <Text strong style={{ 
                        color: available > 0 ? COLORS?.status?.success || '#52c41a' : COLORS?.status?.error || '#ff4d4f' 
                      }}>
                        {available}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        de {total}
                      </Text>
                    </div>
                  );
                },
                width: 120,
                align: 'center',
              },
            ]}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} eventos`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            rowKey="_id"
            loading={loading}
            scroll={{ x: 1000 }}
            size="middle"
            bordered
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default AdminStatistics;
