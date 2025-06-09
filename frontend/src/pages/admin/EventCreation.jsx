
import { useState, useEffect } from 'react';
import { 
  Layout, 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  Select, 
  message, 
  Alert,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Breadcrumb,
  Tooltip,
  Tag,
  Upload
} from 'antd';
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  TagOutlined, 
  SaveOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  FormOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  LockOutlined,
  EuroOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { COLORS } from "../../components/colorscheme";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const EventCreation = () => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [seatMaps, setSeatMaps] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().add(2, 'day'));
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isCapacityLocked, setIsCapacityLocked] = useState(false);
  const [form] = Form.useForm();
  const [sectionPricing, setSectionPricing] = useState([]);
  const [locationSections, setLocationSections] = useState([]);
  const [usesSectionPricing, setUsesSectionPricing] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const navigate = useNavigate();
  
  // URLs de los microservicios
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  dayjs.extend(isSameOrBefore);

  const categoryColors = {
    football: COLORS?.categories?.deportes || "#52c41a",
    cinema: COLORS?.categories?.cine || "#eb2f96",
    concert: COLORS?.categories?.conciertos || "#1890ff",
    theater: COLORS?.categories?.teatro || "#fa8c16",
    festival: COLORS?.categories?.festivales || "#722ed1"
  };

  const stateColors = {
    activo: COLORS?.status?.success || "#52c41a",
    proximo: COLORS?.status?.info || "#1890ff",
    finalizado: COLORS?.neutral?.grey4 || "#8c8c8c",
    cancelado: COLORS?.status?.error || "#ff4d4f"
  };

  const stateIcons = {
    activo: <PlayCircleOutlined />,
    proximo: <ClockCircleOutlined />,
    finalizado: <StopOutlined />,
    cancelado: <ExclamationCircleOutlined />
  };

  const stateLabels = {
    activo: 'Activo',
    proximo: 'Próximo',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado'
  };

  // Función para obtener locations y seatmaps
  useEffect(() => {
    const fetchData = async () => {
      try {
        const locationsUrl = `${gatewayUrl}/locations`;
        const seatMapsUrl = `${gatewayUrl}/seatmaps`;
        
        const [locationsResponse, seatMapsResponse] = await Promise.all([
          axios.get(locationsUrl),
          axios.get(seatMapsUrl)
        ]);
        
        setLocations(locationsResponse.data);
        setSeatMaps(seatMapsResponse.data);
      } catch (error) {
        console.error("Error obteniendo datos:", error);
        setErrorMessage("Error al cargar las ubicaciones y mapas de asientos");
      }
    };
    fetchData();
  }, [gatewayUrl]);

  useEffect(() => {
    if (type) {
      const filteredLocations = locations.filter(location => {
        if (type === 'football') {
          return location.category === 'stadium';
        } else if (type === 'cinema') {
          return location.category === 'cinema';
        } else if (type === 'concert') {
          return location.category === 'concert';
        } else if (type === 'theater') {
          return location.category === 'theater';
        } else if (type === 'festival') {
          return location.category === 'festival';
        }
        return false;
      });
      setLocationOptions(filteredLocations);
    } else {
      setLocationOptions(locations);
    }
  }, [type, locations]);

  const getAutoState = (date) => {
    if (!date) return 'proximo';
    const now = dayjs();
    const eventDate = dayjs(date);
    if (eventDate.isBefore(now, 'day')) {
      return 'finalizado';
    } else if (eventDate.isSame(now, 'day')) {
      return 'activo';
    } else {
      return 'proximo';
    }
  };

  // Función actualizada para obtener la capacidad del seatmap
  const getCapacityFromSeatMap = async (seatMapId) => {
    try {
      const seatMapUrl = `${gatewayUrl}/seatmaps/${seatMapId}`;
      
      const response = await axios.get(seatMapUrl);
      const seatMap = response.data;
      
      // Calcular la capacidad total sumando todas las secciones
      if (seatMap.sections && seatMap.sections.length > 0) {
        const totalCapacity = seatMap.sections.reduce((total, section) => {
          return total + (section.rows * section.seatsPerRow);
        }, 0);
        return totalCapacity;
      }
      
      return null;
    } catch (error) {
      console.error("Error obteniendo capacidad del seatmap:", error);
      return null;
    }
  };

  const handleLocationChange = async (locationId) => {
    const location = locations.find(loc => loc._id === locationId);
    setSelectedLocation(location);
    
    // Resetear estados de secciones
    setLocationSections([]);
    setSectionPricing([]);
    setUsesSectionPricing(false);
    
    if (location && location.seatMapId) {
      // Obtener secciones para pricing por secciones
      await fetchLocationSections(locationId);
      
      // Si la ubicación tiene un seatMapId, obtener la capacidad del seatmap
      setLoading(true);
      try {
        const capacity = await getCapacityFromSeatMap(location.seatMapId);
        if (capacity) {
          setIsCapacityLocked(true);
          form.setFieldsValue({ capacity: capacity });
        } else if (location.capacity && location.capacity > 0) {
          setIsCapacityLocked(true);
          form.setFieldsValue({ capacity: location.capacity });
        } else {
          setIsCapacityLocked(false);
          form.setFieldsValue({ capacity: undefined });
        }
      } catch (error) {
        console.error("Error obteniendo capacidad:", error);
        if (location.capacity && location.capacity > 0) {
          setIsCapacityLocked(true);
          form.setFieldsValue({ capacity: location.capacity });
        } else {
          setIsCapacityLocked(false);
          form.setFieldsValue({ capacity: undefined });
        }
      } finally {
        setLoading(false);
      }
    } else if (location && location.capacity && location.capacity > 0) {
      setIsCapacityLocked(true);
      form.setFieldsValue({ capacity: location.capacity });
    } else {
      setIsCapacityLocked(false);
      form.setFieldsValue({ capacity: undefined });
    }
  };

  const handleSectionPriceChange = (sectionId, newPrice) => {
    setSectionPricing(prevPricing => 
      prevPricing.map(section => 
        section.sectionId === sectionId 
          ? { ...section, price: newPrice === '' ? '' : parseFloat(newPrice) || 0 }
          : section
      )
    );
  };

  const handleTypeChange = (value) => {
    setType(value);
    // Resetear la ubicación seleccionada cuando cambia el tipo
    setSelectedLocation(null);
    setIsCapacityLocked(false);
    setLocationSections([]);
    setSectionPricing([]);
    setUsesSectionPricing(false);
    form.setFieldsValue({ 
      location: undefined,
      capacity: undefined,
      price: undefined
    });
  };

  const fetchLocationSections = async (locationId) => {
    if (!locationId) return;
    
    setLoadingSections(true);
    try {
      const response = await axios.get(`${gatewayUrl}/location/${locationId}/sections`);
      const data = response.data;
      
      if (data.sections && data.sections.length > 0) {
        setLocationSections(data.sections);
        setUsesSectionPricing(true);
        
        // Inicializar pricing por secciones con precios base o 0
        const initialPricing = data.sections.map(section => ({
          sectionId: section.sectionId,
          sectionName: section.sectionName,
          capacity: section.capacity,
          price: section.basePrice || 0
        }));
        
        setSectionPricing(initialPricing);
        
        // Ocultar el campo de precio tradicional ya que usaremos pricing por secciones
        form.setFieldsValue({ price: undefined });
      } else {
        setLocationSections([]);
        setSectionPricing([]);
        setUsesSectionPricing(false);
      }
    } catch (error) {
      console.error("Error obteniendo secciones:", error);
      setLocationSections([]);
      setSectionPricing([]);
      setUsesSectionPricing(false);
    } finally {
      setLoadingSections(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    
    console.log('Form values:', values);
    
    try {
      const eventData = {
        name: values.name,
        date: values.date.toISOString(),
        location: values.location,
        type: values.type,
        description: values.description,
        state: values.state || 'proximo'
      };

      // Añadir pricing según el tipo
      if (usesSectionPricing && sectionPricing.length > 0) {
        // Validar que todos los precios sean válidos
        const hasInvalidPrices = sectionPricing.some(section => 
          section.price === '' || isNaN(parseFloat(section.price)) || parseFloat(section.price) < 0
        );
        
        if (hasInvalidPrices) {
          setErrorMessage('Todos los precios de las secciones deben ser números válidos y no negativos');
          return;
        }
        
        eventData.usesSectionPricing = true;
        eventData.sectionPricing = sectionPricing.map(section => ({
        ...section,
        price: parseFloat(section.price) || 0
      }));
        
        // Capacidad se calcula automáticamente en el backend
        eventData.capacity = sectionPricing.reduce((total, section) => total + section.capacity, 0);
        
        // El precio base será el mínimo de las secciones
        eventData.price = Math.min(...sectionPricing.map(s => s.price));
      } else {
        // Pricing tradicional
        if (!values.price || !values.capacity) {
          setErrorMessage('El precio y la capacidad son obligatorios cuando no hay pricing por secciones');
          return;
        }
        
        eventData.usesSectionPricing = false;
        eventData.capacity = parseInt(values.capacity);
        eventData.price = parseFloat(values.price);
      }

      console.log('Sending event data:', eventData);

      await axios.post(gatewayUrl + "/event", eventData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      message.success({
        content: 'Evento creado exitosamente',
        icon: <CheckCircleOutlined style={{ color: COLORS?.status?.success || 'green' }} />
      });
      navigate('/admin');
    } catch (error) {
      console.error("Error creando el evento:", error);
      console.error("Error response:", error.response?.data);
      setErrorMessage(error.response?.data?.error || 'Hubo un error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'football': return 'Partido de fútbol';
      case 'cinema': return 'Cine';
      case 'concert': return 'Concierto';
      case 'theater': return 'Teatro';
      case 'festival': return 'Festival';
      default: return type;
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const autoState = getAutoState(date);
      form.setFieldsValue({ state: autoState });
    }
  };

  const uploadProps = {
    beforeUpload: file => {
      return false;
    },
    maxCount: 1,
    accept: 'image/*'
  };

  // Función para obtener información del seatmap
  const getSeatMapInfo = (seatMapId) => {
    const seatMap = seatMaps.find(sm => sm.id === seatMapId);
    return seatMap;
  };

  const SectionPricingComponent = () => {
    if (!usesSectionPricing || locationSections.length === 0) return null;

    return (
      <Card 
        title={
          <Space>
            <TagOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />
            Configuración de precios por sección
          </Space>
        }
        style={{ 
          marginBottom: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
        }}
        loading={loadingSections}
      >
        <Alert
          message="Pricing por secciones activado"
          description="Esta ubicación tiene un mapa de asientos con secciones definidas. Configure el precio para cada sección individualmente."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
        <Row gutter={[16, 16]}>
          {sectionPricing.map((section, index) => {
            const locationSection = locationSections.find(ls => ls.sectionId === section.sectionId);
            
            return (
              <Col xs={24} sm={12} md={8} key={section.sectionId}>
                <Card 
                  size="small"
                  style={{
                    borderLeft: `4px solid ${locationSection?.color || '#1890ff'}`,
                    height: '100%'
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Text strong style={{ fontSize: '14px' }}>
                      {section.sectionName}
                    </Text>
                    
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Capacidad: {section.capacity} asientos
                    </Text>
                    
                    <Form.Item
                      label="Precio por entrada"
                      style={{ margin: 0 }}
                      required
                      rules={[
                        { required: true, message: 'Precio requerido' },
                        { type: 'number', min: 0, message: 'El precio debe ser mayor o igual a 0' }
                      ]}
                    >
                      <Input
                        type="number"
                        value={section.price === 0 ? '' : section.price}
                        onChange={(e) => handleSectionPriceChange(section.sectionId, e.target.value)}
                        prefix={<EuroOutlined />}
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
        
        {sectionPricing.length > 0 && (
          <Alert
            style={{ marginTop: '16px' }}
            message="Resumen de precios"
            description={
              <div>
                <p><strong>Precio mínimo:</strong> €{Math.min(...sectionPricing.map(s => s.price))}</p>
                <p><strong>Precio máximo:</strong> €{Math.max(...sectionPricing.map(s => s.price))}</p>
                <p><strong>Precio promedio:</strong> €{(sectionPricing.reduce((sum, s) => sum + s.price, 0) / sectionPricing.length).toFixed(2)}</p>
                <p><strong>Capacidad total:</strong> {sectionPricing.reduce((total, s) => total + s.capacity, 0)} asientos</p>
              </div>
            }
            type="success"
            showIcon
          />
        )}
      </Card>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: COLORS?.neutral?.white || '#ffffff' }}>
      <Content style={{ padding: '40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header with breadcrumb */}
          <Row style={{ marginBottom: '24px' }}>
            <Col span={24}>
              <Breadcrumb 
                items={[
                  { 
                    title: <Link to="/admin">Administración</Link> 
                  },
                  { 
                    title: 'Crear evento' 
                  }
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
                <FormOutlined style={{ marginRight: '12px', color: COLORS?.primary?.main || "#1890ff" }} />
                Crear nuevo evento
              </Title>
              <Paragraph type="secondary" style={{ marginTop: '8px' }}>
                Complete los detalles a continuación para crear un nuevo evento en el sistema
              </Paragraph>
            </Col>
          </Row>

          {errorMessage && (
            <Alert
              message="Error"
              description={errorMessage}
              type="error"
              showIcon
              icon={<CloseCircleOutlined />}
              style={{ marginBottom: 24, borderRadius: '6px' }}
              closable
              onClose={() => setErrorMessage(null)}
            />
          )}

          <Card 
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.07)'
            }}
          >
            <Form
              form={form}
              name="create_event"
              onFinish={onFinish}
              layout="vertical"
              requiredMark="optional"
              onValuesChange={() => setErrorMessage(null)}
              initialValues={{
                date: dayjs().add(2, 'day'),
                state: 'proximo'
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={16}>
                  <Form.Item
                    label="Nombre del evento"
                    name="name"
                    rules={[{ required: true, message: 'Por favor ingrese el nombre del evento' }]}
                  >
                    <Input 
                      placeholder="Ingrese el nombre del evento" 
                      size="large" 
                      prefix={<AppstoreOutlined style={{ color: COLORS?.neutral?.grey3 || '#d9d9d9' }} />} 
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Tipo de evento"
                    name="type"
                    rules={[{ required: true, message: 'Por favor seleccione el tipo de evento' }]}
                  >
                    <Select
                      placeholder="Seleccionar tipo de evento"
                      onChange={handleTypeChange}
                      size="large"
                      suffixIcon={<TagOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />}
                    >
                      <Option value="football">
                        <Tag color={categoryColors.football} style={{ marginRight: '8px' }}>
                          Fútbol
                        </Tag>
                        Partido de fútbol
                      </Option>
                      <Option value="cinema">
                        <Tag color={categoryColors.cinema} style={{ marginRight: '8px' }}>
                          Cine
                        </Tag>
                        Cine
                      </Option>
                      <Option value="concert">
                        <Tag color={categoryColors.concert} style={{ marginRight: '8px' }}>
                          Concierto
                        </Tag>
                        Concierto
                      </Option>
                      <Option value="theater">
                        <Tag color={categoryColors.theater} style={{ marginRight: '8px' }}>
                          Teatro
                        </Tag>
                        Teatro
                      </Option>
                      <Option value="festival">
                        <Tag color={categoryColors.festival} style={{ marginRight: '8px' }}>
                          Festival
                        </Tag>
                        Festival
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Fecha y hora"
                    name="date"
                    rules={[
                      { required: true, message: 'Por favor seleccione la fecha y hora del evento' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.reject('Por favor seleccione la fecha y hora del evento');
                          const now = dayjs();
                          const dateValue = dayjs(value);

                          if (dateValue.isSameOrBefore(now, 'day')) {
                            return Promise.reject('La fecha del evento debe ser al menos un día después de hoy');
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <DatePicker 
                      showTime 
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: '100%' }} 
                      size="large"
                      suffixIcon={<CalendarOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />}
                      onChange={handleDateChange}
                      placeholder="Seleccionar fecha y hora"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Ubicación"
                    name="location"
                    rules={[{ required: true, message: 'Por favor seleccione la ubicación del evento' }]}
                  >
                    <Select 
                      placeholder="Seleccionar ubicación"
                      size="large"
                      suffixIcon={<EnvironmentOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />}
                      disabled={!type}
                      showSearch
                      onChange={handleLocationChange}
                      value={selectedLocation?._id}
                      filterOption={(input, option) =>
                        option.children.props.children[0].props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={
                        !type ? 
                          <div style={{ textAlign: 'center', padding: '8px' }}>
                            <InfoCircleOutlined style={{ marginRight: '8px' }} />
                            Por favor seleccione primero un tipo de evento
                          </div> : 
                          <div style={{ textAlign: 'center', padding: '8px' }}>
                            No se encontraron ubicaciones
                          </div>
                      }
                    >
                      {locationOptions.map((location) => {
                        const seatMapInfo = location.seatMapId ? getSeatMapInfo(location.seatMapId) : null;
                        
                        return (
                          <Option key={location._id} value={location._id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ flex: 1 }}>{location.name}</span>
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                {location.capacity && location.capacity > 0 && (
                                  <Tag 
                                    color="green" 
                                    size="small" 
                                    style={{ fontSize: '10px', margin: 0 }}
                                  >
                                    Cap: {location.capacity}
                                  </Tag>
                                )}
                                {seatMapInfo && (
                                  <Tooltip title={`Mapa: ${seatMapInfo.name} (${seatMapInfo.type})`}>
                                    <Tag 
                                      color="blue" 
                                      size="small" 
                                      style={{ fontSize: '10px', margin: 0 }}
                                    >
                                      {seatMapInfo.type}
                                    </Tag>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24}>
                  <Form.Item
                    label="Descripción"
                    name="description"
                    rules={[{ required: true, message: 'Por favor ingrese la descripción del evento' }]}
                  >
                    <Input.TextArea 
                      placeholder="Ingrese la descripción del evento" 
                      autoSize={{ minRows: 4, maxRows: 6 }} 
                      showCount 
                      maxLength={500} 
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Componente de pricing por secciones */}
              <SectionPricingComponent />

              {/* Pricing tradicional - solo se muestra si no hay secciones */}
              {!usesSectionPricing && (
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Capacidad"
                      name="capacity"
                      rules={[
                        { required: true, message: 'Por favor ingrese la capacidad' },
                        { type: 'number', min: 1, message: 'La capacidad debe ser al menos 1', transform: (value) => Number(value) }
                      ]}
                    >
                      <Input 
                        type="number" 
                        placeholder={isCapacityLocked ? "Capacidad establecida por el mapa de asientos" : "Ingrese la capacidad"}
                        disabled={isCapacityLocked}
                        prefix={isCapacityLocked ? <LockOutlined style={{ color: COLORS?.neutral?.grey3 || '#d9d9d9' }} /> : null}
                        suffix={
                          <span style={{ color: COLORS?.neutral?.grey3 || '#d9d9d9' }}>
                            asientos
                            {isCapacityLocked && selectedLocation && (
                              <Tooltip title={`Capacidad ${selectedLocation.seatMapId ? 'calculada desde el mapa de asientos' : 'fija'} de ${selectedLocation.name}`}>
                                <InfoCircleOutlined style={{ marginLeft: '4px' }} />
                              </Tooltip>
                            )}
                          </span>
                        }
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Precio por entrada"
                      name="price"
                      rules={[
                        { required: true, message: 'Por favor ingrese el precio' },
                        { type: 'number', min: 0, message: 'El precio debe ser al menos 0', transform: (value) => Number(value) }
                      ]}
                    >
                      <Input 
                        type="number"
                        placeholder="Ingrese el precio" 
                        prefix={<EuroOutlined />}
                        suffix={
                          <Tooltip title="Precio base por entrada">
                            <InfoCircleOutlined style={{ color: COLORS?.neutral?.grey3 || '#d9d9d9' }} />
                          </Tooltip>
                        } 
                        step={0.01}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              <Row gutter={24}>
                <Col xs={24}>
                  <Form.Item
                    label="Imagen del evento"
                    name="image"
                    valuePropName="file"
                    getValueFromEvent={e => e && e.fileList && e.fileList.length > 0 ? e : null}
                  >
                    <Upload {...uploadProps} listType="picture" maxCount={1}>
                      <Button icon={<UploadOutlined />}>Seleccionar imagen</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              {/* Información mejorada de la ubicación seleccionada */}
              {selectedLocation && (
                <Alert
                  message={`Ubicación seleccionada: ${selectedLocation.name}`}
                  description={
                    <div>
                      <p><strong>Dirección:</strong> {selectedLocation.address}</p>
                      <p><strong>Categoría:</strong> {selectedLocation.category}</p>
                      {selectedLocation.seatMapId && (
                        <p><strong>Mapa de asientos:</strong> {getSeatMapInfo(selectedLocation.seatMapId)?.name || selectedLocation.seatMapId}</p>
                      )}
                      {isCapacityLocked && (
                        <p><strong>Capacidad:</strong> {form.getFieldValue('capacity')} asientos (automática)</p>
                      )}
                    </div>
                  }
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  style={{ marginBottom: 24, borderRadius: '6px' }}
                />
              )}

              <Divider />

              {/* Preview sections remain the same */}
              {(type || form.getFieldValue('state')) && (
                <Row style={{ marginBottom: '24px' }}>
                  <Col span={24}>
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      {type && (
                        <div style={{ 
                          padding: '16px', 
                          backgroundColor: `${categoryColors[type]}10`, 
                          borderRadius: '8px',
                          border: `1px solid ${categoryColors[type]}30`
                        }}>
                          <Space align="start">
                            <div style={{ 
                              backgroundColor: categoryColors[type], 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: COLORS?.neutral?.white || '#ffffff'
                            }}>
                              {type === 'football' && <i className="fas fa-futbol"></i>}
                              {type === 'cinema' && <i className="fas fa-film"></i>}
                              {type === 'concert' && <i className="fas fa-music"></i>}
                              {type === 'theater' && <i className="fas fa-theater"></i>}
                              {type === 'festival' && <i className="fas fa-festival"></i>}
                            </div>
                            <div>
                              <Text strong style={{ fontSize: '16px' }}>
                                Tipo de evento seleccionado: {getTypeLabel(type)}
                              </Text>
                              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                {type === 'football' && 'Los partidos de fútbol requieren ubicaciones de estadio y tienen asientos designados.'}
                                {type === 'cinema' && 'Los eventos de cine requieren ubicaciones de cine y tienen capacidad limitada basada en la sala de proyección.'}
                                {type === 'concert' && 'Los conciertos pueden realizarse en varios lugares con arreglos de asientos o de pie.'}
                                {type === 'theater' && 'Las obras de teatro suelen realizarse en teatros con asientos asignados que ofrecen una experiencia cercana e íntima.'}
                                {type === 'festival' && 'Los festivales son eventos al aire libre o en grandes recintos que combinan música, arte y cultura, con entradas no numeradas y sin asientos'}
                              </Paragraph>
                            </div>
                          </Space>
                        </div>
                      )}

                      {form.getFieldValue('state') && (
                        <div style={{ 
                          padding: '16px', 
                          backgroundColor: `${stateColors[form.getFieldValue('state')]}10`, 
                          borderRadius: '8px',
                          border: `1px solid ${stateColors[form.getFieldValue('state')]}30`
                        }}>
                          <Space align="start">
                            <div style={{ 
                              backgroundColor: stateColors[form.getFieldValue('state')], 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: COLORS?.neutral?.white || '#ffffff'
                            }}>
                              {stateIcons[form.getFieldValue('state')]}
                            </div>
                            <div>
                              <Text strong style={{ fontSize: '16px' }}>
                                Estado del Evento: {stateLabels[form.getFieldValue('state')]}
                              </Text>
                              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                {form.getFieldValue('state') === 'activo' && 'El evento está actualmente activo y se pueden comprar entradas.'}
                                {form.getFieldValue('state') === 'proximo' && 'El evento está próximo y disponible para la venta de entradas.'}
                                {form.getFieldValue('state') === 'finalizado' && 'El evento ha concluido y las entradas ya no están disponibles.'}
                                {form.getFieldValue('state') === 'cancelado' && 'El evento ha sido cancelado y se pueden procesar reembolsos.'}
                              </Paragraph>
                            </div>
                          </Space>
                        </div>
                      )}
                    </Space>
                  </Col>
                </Row>
              )}

              <Row gutter={16} justify="space-between">
                <Col>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/admin')}
                    style={{ borderRadius: '6px' }}
                  >
                    Cancelar
                  </Button>
                </Col>
                <Col>
                  <Space>
                    <Button 
                      type="default" 
                      onClick={() => form.resetFields()}
                      style={{ borderRadius: '6px' }}
                    >
                      Restablecer
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading} 
                      icon={<SaveOutlined />}
                      style={{ 
                        backgroundColor: COLORS?.primary?.main || "#1890ff",
                        borderColor: COLORS?.primary?.main || "#1890ff",
                        borderRadius: '6px'
                      }}
                    >
                      Crear Evento
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default EventCreation;