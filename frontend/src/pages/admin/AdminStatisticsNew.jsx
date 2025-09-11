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
  Space, 
  Tag, 
  Alert, 
  Spin,
  Progress
} from 'antd';
import { 
  BarChartOutlined, 
  DollarOutlined, 
  FileTextOutlined, 
  CalendarOutlined,
  FilterOutlined,
  ClearOutlined,
  UserOutlined,
  EyeOutlined,
  ArrowLeftOutlined
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
    status: 'all',
    dateRange: null
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
      
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.append('dateFrom', filters.dateRange[0].format('YYYY-MM-DD'));
        params.append('dateTo', filters.dateRange[1].format('YYYY-MM-DD'));
      }

      const response = await axios.get(`${gatewayUrl}/tickets/admin/statistics?${params.toString()}`);
      setStatistics(response.data.statistics);
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

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  const clearFilters = () => {
    setFilters({
      eventType: 'all',
      status: 'all',
      dateRange: null
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

  const { general, byEvent, byType } = statistics || {};

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
              Volver al Dashboard
            </Button>
          </div>
          <Title level={2} style={{ margin: 0, color: COLORS?.primary?.main || '#1890ff' }}>
            <BarChartOutlined style={{ marginRight: '8px' }} />
            Estadísticas de Ventas
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
            <Col xs={24} sm={8} md={6}>
              <Text strong>Tipo de Evento:</Text>
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
            <Col xs={24} sm={8} md={6}>
              <Text strong>Estado:</Text>
              <Select
                value={filters.status}
                onChange={handleStatusChange}
                style={{ width: '100%', marginTop: '4px' }}
                placeholder="Todos los estados"
              >
                <Option value="all">Todos los estados</Option>
                <Option value="paid">Pagados</Option>
                <Option value="pending">Pendientes</Option>
                <Option value="cancelled">Cancelados</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <Text strong>Rango de Fechas:</Text>
              <RangePicker
                value={filters.dateRange}
                onChange={handleDateRangeChange}
                style={{ width: '100%', marginTop: '4px' }}
                placeholder={['Fecha inicio', 'Fecha fin']}
              />
            </Col>
            <Col xs={24} sm={24} md={4}>
              <Button
                icon={<ClearOutlined />}
                onClick={clearFilters}
                style={{ width: '100%', marginTop: '24px' }}
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
                title="Total Tickets Vendidos"
                value={general?.paidTickets || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: COLORS?.status?.success || '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Recaudación Total"
                value={general?.paidRevenue || 0}
                formatter={(value) => formatCurrency(value)}
                prefix={<DollarOutlined />}
                valueStyle={{ color: COLORS?.status?.success || '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Transacciones"
                value={general?.totalTransactions || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: COLORS?.primary?.main || '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tickets Pendientes"
                value={general?.pendingTickets || 0}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: COLORS?.status?.warning || '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabla de Eventos */}
        <Card>
          <Title level={4} style={{ marginBottom: '16px' }}>
            <EyeOutlined style={{ marginRight: '8px' }} />
            Estadísticas por Evento
          </Title>
          <Table
            dataSource={byEvent || []}
            columns={[
              {
                title: 'Evento',
                dataIndex: ['event', 'name'],
                key: 'eventName',
                render: (text) => (
                  <Text strong>{text || 'Evento no disponible'}</Text>
                ),
              },
              {
                title: 'Tipo',
                dataIndex: ['event', 'type'],
                key: 'eventType',
                render: (type) => (
                  <Tag color={getEventTypeColor(type)}>
                    {getEventTypeLabel(type)}
                  </Tag>
                ),
              },
              {
                title: 'Tickets Vendidos',
                dataIndex: 'paidTickets',
                key: 'paidTickets',
                render: (value) => (
                  <Text strong>{value}</Text>
                ),
              },
              {
                title: 'Recaudación',
                dataIndex: 'paidRevenue',
                key: 'paidRevenue',
                render: (value) => (
                  <Text strong style={{ color: COLORS?.status?.success || '#52c41a' }}>
                    {formatCurrency(value)}
                  </Text>
                ),
              },
            ]}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} eventos`
            }}
            rowKey="_id"
            loading={loading}
            scroll={{ x: 800 }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default AdminStatistics;
