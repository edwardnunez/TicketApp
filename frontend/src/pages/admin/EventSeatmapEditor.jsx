import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Alert,
  Spin,
  Space,
  message,
  Modal,
  Divider,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { COLORS } from '../../components/colorscheme';
import AdminSeatMapRenderer from './AdminSeatMapRenderer';
import axios from 'axios';
import { authenticatedPost, authenticatedPut } from '../../utils/api';

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
  const [generalAdmissionCapacities, setGeneralAdmissionCapacities] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

    if (!eventData) {
      message.error('No se encontraron datos del evento');
      navigate('/admin');
    }
  }, [eventData, navigate, location.state, selectedLocation]);

  useEffect(() => {
    if (eventData?.seatMapConfiguration) {
      setBlockedSeats(eventData.seatMapConfiguration.blockedSeats || []);
      setBlockedSections(eventData.seatMapConfiguration.blockedSections || []);
      setGeneralAdmissionCapacities(eventData.seatMapConfiguration.generalAdmissionCapacities || {});
    }
  }, [eventData?.seatMapConfiguration]);

  const requiresSeatMap = useCallback(() => {

    if (!eventData?.type) return false;
    const seatMapTypes = ['football', 'cinema', 'concert', 'theater'];
    const requires = seatMapTypes.includes(eventData.type.toLowerCase());
    return requires;
  }, [eventData?.type]);

  useEffect(() => {
    const loadLocationData = async () => {
      if (locationData || !eventData?.location) return;

      setLoading(true);

      try {
        const response = await axios.get(`${gatewayUrl}/locations/${eventData.location}`);
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

  useEffect(() => {
    const loadSeatMapData = async () => {
      if (!requiresSeatMap() || !locationData?.seatMapId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${gatewayUrl}/seatmaps/${locationData.seatMapId}`);
        setSeatMapData(response.data);

        const initialCapacities = {};
        response.data.sections.forEach(section => {
          if (!section.hasNumberedSeats && section.totalCapacity) {
            initialCapacities[section.id] = section.totalCapacity;
          }
        });
        setGeneralAdmissionCapacities(initialCapacities);

      } catch (err) {
        console.error('Error loading seatmap:', err);
        setError('No se pudo cargar el mapa de asientos');
      } finally {
        setLoading(false);
      }
    };

    loadSeatMapData();
  }, [locationData, requiresSeatMap]);

  const handleSeatToggle = useCallback((seatId) => {
    setBlockedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  }, []);

  const handleCapacityChange = useCallback((sectionId, newCapacity) => {
    setGeneralAdmissionCapacities(prev => ({
      ...prev,
      [sectionId]: newCapacity
    }));
  }, []);

  // Move getAllSeatsInSection BEFORE handleSectionToggle
  const getAllSeatsInSection = useCallback((sectionId) => {
    if (!seatMapData) return [];

    const section = seatMapData.sections.find(s => s.id === sectionId);
    if (!section || !section.hasNumberedSeats) return [];

    const seats = [];
    for (let row = 0; row < section.rows; row++) {
      for (let seat = 0; seat < section.seatsPerRow; seat++) {
        seats.push(`${sectionId}-${row + 1}-${seat + 1}`);
      }
    }
    return seats;
  }, [seatMapData]);

  const handleSectionToggle = useCallback((sectionId) => {
    const section = seatMapData?.sections.find(s => s.id === sectionId);
    if (!section) return;

    setBlockedSections(prev => {
      if (prev.includes(sectionId)) {
        if (section.hasNumberedSeats) {
          const sectionSeats = getAllSeatsInSection(sectionId);
          setBlockedSeats(currentBlocked =>
            currentBlocked.filter(seatId => !sectionSeats.includes(seatId))
          );
        } else {
          setGeneralAdmissionCapacities(current => ({
            ...current,
            [sectionId]: section.totalCapacity
          }));
        }
        return prev.filter(id => id !== sectionId);
      } else {
        if (section.hasNumberedSeats) {
          const sectionSeats = getAllSeatsInSection(sectionId);
          setBlockedSeats(currentBlocked =>
            [...new Set([...currentBlocked, ...sectionSeats])]
          );
        } else {
          setGeneralAdmissionCapacities(current => ({
            ...current,
            [sectionId]: 0
          }));
        }
        return [...prev, sectionId];
      }
    });
  }, [seatMapData, getAllSeatsInSection]);

  const handleSaveEvent = async () => {
    setSaving(true);
    try {
      const eventPayload = {
        ...eventData,
        location: locationData || eventData.location,
        blockedSeats: blockedSeats,
        blockedSections: blockedSections,
        generalAdmissionCapacities: generalAdmissionCapacities,
        seatMapConfiguration: {
          seatMapId: locationData?.seatMapId,
          blockedSeats: blockedSeats,
          blockedSections: blockedSections,
          generalAdmissionCapacities: generalAdmissionCapacities,
          configuredAt: new Date().toISOString()
        }
      };

      if (eventData._id) {
        await authenticatedPut(`/events/${eventData._id}`, eventPayload);
        message.success('Mapa de asientos guardado exitosamente');
      } else {
        await authenticatedPost('/events', eventPayload);
        message.success('Evento creado exitosamente');
      }

      navigate('/admin');
    } catch (err) {
      console.error('Error saving event:', err);
      message.error('Error al guardar el evento');
    } finally {
      setSaving(false);
      setShowConfirmModal(false);
    }
  };

  const getTotalSeats = () => {
    if (!seatMapData) return 0;
    return seatMapData.sections.reduce((total, section) => {
      if (section.hasNumberedSeats) {
        return total + (section.rows * section.seatsPerRow);
      } else {
        return total + (generalAdmissionCapacities[section.id] || section.totalCapacity || 0);
      }
    }, 0);
  };

  const getBlockedSeatsCount = () => {
    let blockedCount = blockedSeats.length;

    seatMapData?.sections.forEach(section => {
      if (!section.hasNumberedSeats && blockedSections.includes(section.id)) {
        blockedCount += (section.totalCapacity || 0);
      }
    });

    return blockedCount;
  };

  const getAvailableSeatsCount = () => getTotalSeats() - getBlockedSeatsCount();

  const isConcertVenue = () => {
    return seatMapData?.type === 'concert';
  };

  const hasGeneralAdmissionSections = () => {
    return seatMapData?.sections.some(section => !section.hasNumberedSeats);
  };

  if (!eventData) {
    return null;
  }

  if (!requiresSeatMap()) {
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
    <div style={{ backgroundColor: COLORS.neutral.grey1, minHeight: "100vh", padding: isMobile ? "18px 4px" : "40px 20px" }}>
      <div style={{ maxWidth: isMobile ? "100%" : "1200px", margin: "0 auto" }}>
        {/* Header */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2} style={{ margin: 0, color: COLORS?.neutral?.darker }}>
                {isConcertVenue() ? 'Configurar concierto' : 'Configurar mapa de asientos'}
              </Title>
              <Text style={{ color: COLORS?.neutral?.grey4 }}>
                Evento: {eventData.name}
                {isConcertVenue() && (
                  <Tag color="purple" style={{ marginLeft: '8px' }}>
                    <TeamOutlined /> Concierto
                  </Tag>
                )}
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
                  <Text>{isConcertVenue() ? 'Capacidad total' : 'Total de asientos'}</Text>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                    {getAvailableSeatsCount()}
                  </Title>
                  <Text>{isConcertVenue() ? 'Entradas disponibles' : 'Asientos disponibles'}</Text>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#ff4d4f', margin: 0 }}>
                    {getBlockedSeatsCount()}
                  </Title>
                  <Text>{isConcertVenue() ? 'Entradas bloqueadas' : 'Asientos bloqueados'}</Text>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Instrucciones */}
        {seatMapData && (
          <Alert
            message={isConcertVenue() ? "Modo de edición - Concierto" : "Modo de edición"}
            description={
              isConcertVenue()
                ? "Ajusta las capacidades de entrada general, bloquea secciones completas, o haz clic en asientos numerados para bloquearlos individualmente. Usa los controles de zoom para navegar por el mapa."
                : "Haz clic en los asientos para bloquearlos/desbloquearlos individualmente, o usa los controles de sección para bloquear secciones completas. Usa los controles de zoom para navegar por el mapa."
            }
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
              <AdminSeatMapRenderer
                seatMapData={seatMapData}
                blockedSeats={blockedSeats}
                blockedSections={blockedSections}
                generalAdmissionCapacities={generalAdmissionCapacities}
                onSeatToggle={handleSeatToggle}
                onSectionToggle={handleSectionToggle}
                onCapacityChange={handleCapacityChange}
              />
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
          title="Confirmar creación del evento"
          open={showConfirmModal}
          onOk={handleSaveEvent}
          onCancel={() => setShowConfirmModal(false)}
          confirmLoading={saving}
          okText="Crear evento"
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
              <Text strong>Tipo:</Text> {isConcertVenue() ? 'Concierto' : eventData.type}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Capacidad total:</Text> {getTotalSeats()}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text strong>{isConcertVenue() ? 'Entradas bloqueadas:' : 'Asientos bloqueados:'}</Text> {getBlockedSeatsCount()}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Secciones bloqueadas:</Text> {blockedSections.length}
            </div>
            {hasGeneralAdmissionSections() && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Secciones de entrada general:</Text>
                <div style={{ marginTop: '4px' }}>
                  {seatMapData.sections
                    .filter(section => !section.hasNumberedSeats)
                    .map(section => (
                      <Tag key={section.id} style={{ margin: '2px' }}>
                        {section.name}: {generalAdmissionCapacities[section.id] || section.totalCapacity}
                      </Tag>
                    ))}
                </div>
              </div>
            )}
            {(getBlockedSeatsCount() > 0 || blockedSections.length > 0) && (
              <Alert
                message="Configuración de bloqueos aplicada"
                description={
                  isConcertVenue()
                    ? "Las secciones y entradas bloqueadas no estarán disponibles para la venta"
                    : "Los asientos y secciones bloqueados no estarán disponibles para la venta"
                }
                type="warning"
                showIcon
                style={{ marginTop: '12px' }}
              />
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default EventSeatMapEditor;
