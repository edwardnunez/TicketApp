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
  UploadOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

import { COLORS } from "../../components/colorscheme";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const EventCreation = () => {
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().add(2, 'day'));
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  const categoryColors = {
    football: COLORS?.categories?.deportes || "#52c41a",
    cinema: COLORS?.categories?.cine || "#eb2f96",
    concert: COLORS?.categories?.conciertos || "#1890ff"
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

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(gatewayUrl + "/locations");
        setLocations(response.data);
      } catch (error) {
        console.error("Error obteniendo ubicaciones:", error);
        setErrorMessage("Error al cargar las ubicaciones");
      }
    };
    fetchLocations();
  }, [gatewayUrl]);

  useEffect(() => {
    if (eventType) {
      const filteredLocations = locations.filter(location => {
        if (eventType === 'football') {
          return location.category === 'stadium';
        } else if (eventType === 'cinema') {
          return location.category === 'cinema';
        } else if (eventType === 'concert') {
          return location.category === 'concert';
        }
        return false;
      });
      setLocationOptions(filteredLocations);
    } else {
      setLocationOptions(locations);
    }
  }, [eventType, locations]);

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

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('date', values.date.valueOf());
      formData.append('location', values.location);
      formData.append('eventType', values.eventType);
      formData.append('description', values.description);
      formData.append('capacity', values.capacity);
      formData.append('price', values.price);
      formData.append('state', 'proximo');

      // Extraemos el archivo de la subida si existe
      if (values.image && values.image.file.originFileObj) {
        formData.append('image', values.image.file.originFileObj);
      }

      await axios.post(gatewayUrl + "/event", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      message.success({
        content: 'Evento creado exitosamente',
        icon: <CheckCircleOutlined style={{ color: COLORS?.status?.success || 'green' }} />
      });
      navigate('/admin');
    } catch (error) {
      console.error("Error creando el evento:", error);
      setErrorMessage(error.response?.data?.error || 'Hubo un error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeLabel = (type) => {
    switch(type) {
      case 'football': return 'Partido de fútbol';
      case 'cinema': return 'Cine';
      case 'concert': return 'Concierto';
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

  // Props para el Upload: evitar upload automático, solo seleccionar archivo y mantenerlo en el formulario
  const uploadProps = {
    beforeUpload: file => {
      return false;
    },
    maxCount: 1,
    accept: 'image/*'
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
                    title: 'Crear Evento' 
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
                    name="eventType"
                    rules={[{ required: true, message: 'Por favor seleccione el tipo de evento' }]}
                  >
                    <Select
                      placeholder="Seleccionar tipo de evento"
                      onChange={(value) => setEventType(value)}
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
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Fecha y hora"
                    name="date"
                    rules={[
                      { required: true, message: 'Por favor seleccione la fecha y hora del evento' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.reject('Por favor seleccione la fecha y hora del evento');
                          const now = dayjs();

                          if (value.isSameOrBefore(now, 'day')) {
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

                <Col xs={24} md={8}>
                  <Form.Item
                    label="Ubicación"
                    name="location"
                    rules={[{ required: true, message: 'Por favor seleccione la ubicación del evento' }]}
                  >
                    <Select 
                      placeholder="Seleccionar ubicación"
                      size="large"
                      suffixIcon={<EnvironmentOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />}
                      disabled={!eventType}
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={
                        !eventType ? 
                          <div style={{ textAlign: 'center', padding: '8px' }}>
                            <InfoCircleOutlined style={{ marginRight: '8px' }} />
                            Por favor seleccione primero un tipo de evento
                          </div> : 
                          <div style={{ textAlign: 'center', padding: '8px' }}>
                            No se encontraron ubicaciones
                          </div>
                      }
                    >
                      {locationOptions.map((location) => (
                        <Option key={location._id} value={location._id}>
                          {location.name}
                        </Option>
                      ))}
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
                      placeholder="Ingrese la capacidad" 
                      suffix={<span style={{ color: COLORS?.neutral?.grey3 || '#d9d9d9' }}>asientos</span>} 
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Precio"
                    name="price"
                    rules={[
                      { required: true, message: 'Por favor ingrese el precio' },
                      { type: 'number', min: 0, message: 'El precio debe ser al menos 0', transform: (value) => Number(value) }
                    ]}
                  >
                    <Input 
                      type="number"
                      placeholder="Ingrese el precio" 
                      prefix="€" 
                      suffix={
                        <Tooltip title="Precio base por entrada">
                          <InfoCircleOutlined style={{ color: COLORS?.neutral?.grey3 || '#d9d9d9' }} />
                        </Tooltip>
                      } 
                    />
                  </Form.Item>
                </Col>
              </Row>
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

              <Divider />

              {/* Preview of selected event type and state */}
              {(eventType || form.getFieldValue('state')) && (
                <Row style={{ marginBottom: '24px' }}>
                  <Col span={24}>
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      {eventType && (
                        <div style={{ 
                          padding: '16px', 
                          backgroundColor: `${categoryColors[eventType]}10`, 
                          borderRadius: '8px',
                          border: `1px solid ${categoryColors[eventType]}30`
                        }}>
                          <Space align="start">
                            <div style={{ 
                              backgroundColor: categoryColors[eventType], 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: COLORS?.neutral?.white || '#ffffff'
                            }}>
                              {eventType === 'football' && <i className="fas fa-futbol"></i>}
                              {eventType === 'cinema' && <i className="fas fa-film"></i>}
                              {eventType === 'concert' && <i className="fas fa-music"></i>}
                            </div>
                            <div>
                              <Text strong style={{ fontSize: '16px' }}>
                                Tipo de evento seleccionado: {getEventTypeLabel(eventType)}
                              </Text>
                              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                {eventType === 'football' && 'Los partidos de fútbol requieren ubicaciones de estadio y tienen asientos designados.'}
                                {eventType === 'cinema' && 'Los eventos de cine requieren ubicaciones de cine y tienen capacidad limitada basada en la sala de proyección.'}
                                {eventType === 'concert' && 'Los conciertos pueden realizarse en varios lugares con arreglos de asientos o de pie.'}
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