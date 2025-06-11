import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  Alert, 
  Spin, 
  Space, 
  Switch, 
  message,
  Modal,
  Divider,
  Tag,
  Row,
  Col
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  LockOutlined, 
  UnlockOutlined,
  EyeOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { COLORS } from '../../components/colorscheme';
import GenericSeatMapRenderer from '../steps/seatmaps/GenericSeatRenderer';
import EditableSeatRenderer from './EditableSeatRenderer';
import axios from 'axios';

const { Title, Text } = Typography;

const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

const EventSeatMapEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventData, selectedLocation } = location.state || {};

  const [locationData, setLocationData] = useState(selectedLocation || null);
  const [seatMapData, setSeatMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [blockedSeats, setBlockedSeats] = useState([]);
  const [blockedSections, setBlockedSections] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Verificar si tenemos datos del evento
  useEffect(() => {
    if (!eventData) {
      message.error('No se encontraron datos del evento');
      navigate('/admin');
    }
  }, [eventData, navigate]);

  const requiresSeatMap = useCallback(() => {
    if (!eventData?.type) return false;
    const seatMapTypes = ['cinema', 'theater', 'theatre', 'football', 'soccer', 'sports', 'stadium'];
    return seatMapTypes.includes(eventData.type.toLowerCase());
  }, [eventData?.type]);

  // Cargar datos de la ubicación si no los tenemos
  useEffect(() => {
    const loadLocationData = async () => {
      if (locationData || !eventData?.location) return;

      console.log('Loading location data for:', eventData.location);
      setLoading(true);
      
      try {
        const response = await axios.get(`${gatewayUrl}/locations/${eventData.location}`);
        console.log('Location data loaded:', response.data);
        setLocationData(response.data);
      } catch (err) {
        console.error('Error loading location:', err);
        setError('No se pudo cargar los datos de la ubicación');
      } finally {
        setLoading(false);
      }
    };

    loadLocationData();
  }, [eventData, locationData]);

  // Cargar datos del mapa de asientos
  useEffect(() => {
    const loadSeatMapData = async () => {
      if (!requiresSeatMap() || !locationData?.seatMapId) {
        console.log('Not loading seatmap:', { 
          requiresSeatMap: requiresSeatMap(), 
          seatMapId: locationData?.seatMapId 
        });
        return;
      }

      console.log('Loading seatmap for ID:', locationData.seatMapId);
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${gatewayUrl}/seatmaps/${locationData.seatMapId}`);
        console.log('Seatmap data loaded:', response.data);
        setSeatMapData(response.data);
      } catch (err) {
        console.error('Error loading seatmap:', err);
        setError('No se pudo cargar el mapa de asientos');
      } finally {
        setLoading(false);
      }
    };

    loadSeatMapData();
  }, [locationData, requiresSeatMap]);

  // Manejar bloqueo/desbloqueo de asientos individuales
  const handleSeatToggle = useCallback((seatId) => {
    setBlockedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  }, []);

  // Manejar bloqueo/desbloqueo de secciones completas
  const handleSectionToggle = useCallback((sectionId) => {
    setBlockedSections(prev => {
      if (prev.includes(sectionId)) {
        // Desbloquear sección y todos sus asientos
        const sectionSeats = getAllSeatsInSection(sectionId);
        setBlockedSeats(currentBlocked => 
          currentBlocked.filter(seatId => !sectionSeats.includes(seatId))
        );
        return prev.filter(id => id !== sectionId);
      } else {
        // Bloquear sección y todos sus asientos
        const sectionSeats = getAllSeatsInSection(sectionId);
        setBlockedSeats(currentBlocked => 
          [...new Set([...currentBlocked, ...sectionSeats])]
        );
        return [...prev, sectionId];
      }
    });
  }, [seatMapData]);

  // Obtener todos los asientos de una sección
  const getAllSeatsInSection = useCallback((sectionId) => {
    if (!seatMapData) return [];
    
    const section = seatMapData.sections.find(s => s.id === sectionId);
    if (!section) return [];

    const seats = [];
    for (let row = 0; row < section.rows; row++) {
      for (let seat = 0; seat < section.seatsPerRow; seat++) {
        seats.push(`${sectionId}-${row}-${seat}`);
      }
    }
    return seats;
  }, [seatMapData]);

  // Guardar evento con configuración de asientos bloqueados
  const handleSaveEvent = async () => {
    setSaving(true);
    try {
      const eventPayload = {
        ...eventData,
        // Asegurarnos de que location tenga los datos completos
        location: locationData || eventData.location,
        blockedSeats: blockedSeats,
        blockedSections: blockedSections,
        seatMapConfiguration: {
          seatMapId: locationData?.seatMapId,
          blockedSeats: blockedSeats,
          blockedSections: blockedSections,
          configuredAt: new Date().toISOString()
        }
      };

      await axios.post(`${gatewayUrl}/event`, eventPayload);
      
      message.success('Evento creado exitosamente');
      navigate('/admin');
    } catch (err) {
      console.error('Error saving event:', err);
      message.error('Error al guardar el evento');
    } finally {
      setSaving(false);
      setShowConfirmModal(false);
    }
  };

  // Funciones de utilidad
  const getTotalSeats = () => {
    if (!seatMapData) return 0;
    return seatMapData.sections.reduce((total, section) => 
      total + (section.rows * section.seatsPerRow), 0
    );
  };

  const getBlockedSeatsCount = () => blockedSeats.length;
  const getAvailableSeatsCount = () => getTotalSeats() - getBlockedSeatsCount();

  if (!eventData) {
    return null;
  }

  if (!requiresSeatMap()) {
    // Si el evento no requiere mapa de asientos, crear directamente
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={3}>Este tipo de evento no requiere configuración de asientos</Title>
            <Text>El evento se creará automáticamente con la configuración de tickets estándar.</Text>
            <div style={{ marginTop: '24px' }}>
              <Space>
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate(-1)}
                >
                  Volver
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSaveEvent}
                  style={{ 
                    backgroundColor: COLORS?.primary?.main || "#1890ff",
                    borderColor: COLORS?.primary?.main || "#1890ff"
                  }}
                >
                  Crear Evento
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: COLORS?.neutral?.darker }}>
              Configurar Mapa de Asientos
            </Title>
            <Text style={{ color: COLORS?.neutral?.grey4 }}>
              Evento: {eventData.name}
            </Text>
            {locationData && (
              <div style={{ marginTop: '4px' }}>
                <Text style={{ color: COLORS?.neutral?.grey4, fontSize: '12px' }}>
                  Ubicación: {locationData.name} | SeatMapID: {locationData.seatMapId || 'No definido'}
                </Text>
              </div>
            )}
          </div>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
            <Switch
              checkedChildren={<EyeOutlined />}
              unCheckedChildren="Editar"
              checked={previewMode}
              onChange={setPreviewMode}
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => setShowConfirmModal(true)}
              disabled={!seatMapData && requiresSeatMap()}
              style={{ 
                backgroundColor: COLORS?.primary?.main || "#1890ff",
                borderColor: COLORS?.primary?.main || "#1890ff"
              }}
            >
              Crear evento
            </Button>
          </Space>
        </div>
      </Card>

      {/* Estadísticas */}
      {seatMapData && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ color: COLORS?.primary?.main, margin: 0 }}>
                  {getTotalSeats()}
                </Title>
                <Text>Total de asientos</Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                  {getAvailableSeatsCount()}
                </Title>
                <Text>Asientos disponibles</Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ color: '#ff4d4f', margin: 0 }}>
                  {getBlockedSeatsCount()}
                </Title>
                <Text>Asientos bloqueados</Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Controles de secciones */}
      {!previewMode && seatMapData && (
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4}>Control de secciones</Title>
          <Text style={{ color: COLORS?.neutral?.grey4, marginBottom: '16px', display: 'block' }}>
            Bloquea secciones completas para eventos especiales o mantenimiento
          </Text>
          <Space wrap>
            {seatMapData.sections.map(section => (
              <Tag
                key={section.id}
                color={blockedSections.includes(section.id) ? 'red' : section.color}
                style={{ 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  fontSize: '14px'
                }}
                onClick={() => handleSectionToggle(section.id)}
                icon={blockedSections.includes(section.id) ? <LockOutlined /> : <UnlockOutlined />}
              >
                {section.name}
                {blockedSections.includes(section.id) && ' (Bloqueada)'}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* Instrucciones */}
      {!previewMode && seatMapData && (
        <Alert
          message="Modo de edición activo"
          description="Haz clic en los asientos para bloquearlos/desbloquearlos individualmente, o usa los controles de sección arriba para bloquear secciones completas."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Mapa de asientos */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Cargando datos...</Text>
            </div>
          </div>
        ) : error ? (
          <Alert
            message="Error al cargar el mapa de asientos"
            description={error}
            type="error"
            showIcon
          />
        ) : requiresSeatMap() && !locationData?.seatMapId ? (
          <Alert
            message="Mapa de asientos no configurado"
            description="Esta ubicación no tiene un mapa de asientos configurado. Por favor, configura uno primero en la sección de ubicaciones."
            type="warning"
            showIcon
          />
        ) : seatMapData ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {previewMode ? (
              <GenericSeatMapRenderer
                seatMapData={seatMapData}
                selectedSeats={[]}
                onSeatSelect={() => {}}
                maxSeats={0}
                occupiedSeats={blockedSeats}
                formatPrice={(price) => `$${price}`}
              />
            ) : (
              <EditableSeatRenderer
                seatMapData={seatMapData}
                blockedSeats={blockedSeats}
                blockedSections={blockedSections}
                onSeatToggle={handleSeatToggle}
                onSectionToggle={handleSectionToggle}
              />
            )}
          </div>
        ) : requiresSeatMap() ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Preparando mapa de asientos...</Text>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Modal de confirmación */}
      <Modal
        title="Confirmar Creación del Evento"
        open={showConfirmModal}
        onOk={handleSaveEvent}
        onCancel={() => setShowConfirmModal(false)}
        confirmLoading={saving}
        okText="Crear Evento"
        cancelText="Cancelar"
        okButtonProps={{
          style: {
            backgroundColor: COLORS?.primary?.main || "#1890ff",
            borderColor: COLORS?.primary?.main || "#1890ff"
          }
        }}
      >
        <div>
          <Text>¿Estás seguro de que quieres crear el evento con la siguiente configuración?</Text>
          <Divider />
          <div style={{ marginBottom: '12px' }}>
            <Text strong>Evento:</Text> {eventData.name}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <Text strong>Fecha:</Text> {new Date(eventData.date).toLocaleDateString()}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <Text strong>Asientos bloqueados:</Text> {getBlockedSeatsCount()}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <Text strong>Secciones bloqueadas:</Text> {blockedSections.length}
          </div>
          {(getBlockedSeatsCount() > 0 || blockedSections.length > 0) && (
            <Alert
              message="Configuración de bloqueos aplicada"
              description="Los asientos y secciones bloqueados no estarán disponibles para la venta"
              type="warning"
              showIcon
              style={{ marginTop: '12px' }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EventSeatMapEditor;