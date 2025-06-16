import { useState, useEffect } from 'react';
import { 
  Layout, 
  Form, 
  Input, 
  Button, 
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
  InputNumber,
  Modal,
  Table,
  Popconfirm,
  ColorPicker
} from 'antd';
import { 
  EnvironmentOutlined, 
  TagOutlined, 
  SaveOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  FormOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  GlobalOutlined,
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import { COLORS } from "../../components/colorscheme";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const LocationCreation = () => {
  const [loading, setLoading] = useState(false);
  const [seatMaps, setSeatMaps] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  // Estados para el modal de SeatMap
  const [seatMapModalVisible, setSeatMapModalVisible] = useState(false);
  const [seatMapForm] = Form.useForm();
  const [seatMapLoading, setSeatMapLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [locationName, setLocationName] = useState('');
  const [createdSeatMapId, setCreatedSeatMapId] = useState(null);
  
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  const categoryColors = {
    stadium: COLORS?.categories?.deportes || "#52c41a",
    cinema: COLORS?.categories?.cine || "#eb2f96",
    concert: COLORS?.categories?.conciertos || "#1890ff",
    theater: COLORS?.categories?.teatro || "#fa8c16",
    festival: COLORS?.categories?.festivales || "#722ed1"
  };

  const categoryInfo = {
    stadium: {
      label: 'Estadio',
      description: 'Recinto deportivo para partidos de fútbol y otros eventos deportivos',
      icon: '⚽',
      seatMapTypes: ['football'],
      requiresCapacity: true,
      requiresSeatMap: true // Nuevo campo
    },
    cinema: {
      label: 'Cine',
      description: 'Sala de cine para proyección de películas',
      icon: '🎬',
      seatMapTypes: ['cinema'],
      requiresCapacity: true,
      requiresSeatMap: true // Nuevo campo
    },
    concert: {
      label: 'Concierto',
      description: 'Venue para conciertos y espectáculos musicales',
      icon: '🎵',
      seatMapTypes: ['theater', 'football'],
      requiresCapacity: false,
      requiresSeatMap: true // Nuevo campo
    },
    theater: {
      label: 'Teatro',
      description: 'Teatro para obras teatrales y espectáculos',
      icon: '🎭',
      seatMapTypes: ['theater'],
      requiresCapacity: true,
      requiresSeatMap: true // Nuevo campo
    },
    festival: {
      label: 'Festival',
      description: 'Espacio para festivales y eventos al aire libre',
      icon: '🎪',
      seatMapTypes: [],
      requiresCapacity: false,
      requiresSeatMap: false // No requiere seatmap
    }
  };

  const seatMapTypeInfo = {
    football: {
      label: 'Estadio de Fútbol',
      description: 'Configuración para estadios deportivos',
      defaultSections: [
        { name: 'Tribuna Norte', position: 'north', color: '#4CAF50', rows: 8, seatsPerRow: 15, price: 50000 },
        { name: 'Tribuna Este', position: 'east', color: '#2196F3', rows: 6, seatsPerRow: 14, price: 75000 },
        { name: 'Tribuna Oeste', position: 'west', color: '#2196F3', rows: 6, seatsPerRow: 14, price: 75000 },
        { name: 'Tribuna Sur', position: 'south', color: '#4CAF50', rows: 8, seatsPerRow: 15, price: 50000 }
      ]
    },
    cinema: {
      label: 'Sala de Cine',
      description: 'Configuración para salas de cine',
      defaultSections: [
        { name: 'Delanteras', position: 'front', color: '#4CAF50', rows: 3, seatsPerRow: 16, price: 8000 },
        { name: 'Centrales', position: 'middle', color: '#2196F3', rows: 5, seatsPerRow: 16, price: 12000 },
        { name: 'Traseras', position: 'back', color: '#FF9800', rows: 4, seatsPerRow: 16, price: 10000 }
      ]
    },
    theater: {
      label: 'Teatro',
      description: 'Configuración para teatros y auditorios',
      defaultSections: [
        { name: 'Platea', position: 'orchestra', color: '#4CAF50', rows: 15, seatsPerRow: 20, price: 45000 },
        { name: 'Entresuelo', position: 'mezzanine', color: '#2196F3', rows: 8, seatsPerRow: 18, price: 35000 },
        { name: 'Balcón', position: 'balcony', color: '#FF9800', rows: 6, seatsPerRow: 16, price: 25000 }
      ]
    }
  };

  // Obtener seatmaps disponibles
  useEffect(() => {
    const fetchSeatMaps = async () => {
      try {
        const response = await axios.get(`${gatewayUrl}/seatmaps`);
        setSeatMaps(response.data);
      } catch (error) {
        console.error("Error obteniendo seatmaps:", error);
        setErrorMessage("Error al cargar los mapas de asientos disponibles");
      }
    };
    fetchSeatMaps();
  }, [gatewayUrl]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    form.setFieldsValue({ 
      seatMapId: undefined,
      capacity: undefined
    });
    setCreatedSeatMapId(null);
  };

  const handleLocationNameChange = (e) => {
    const name = e.target.value;
    setLocationName(name);
    
    // Si hay un seatmap creado, actualizar su nombre
    if (createdSeatMapId) {
      seatMapForm.setFieldsValue({ name: name });
    }
  };

  const onFinish = async (values) => {
    // Validar que se requiere seatmap
    if (selectedCategory && categoryInfo[selectedCategory].requiresSeatMap && !createdSeatMapId) {
      setErrorMessage('Debe crear un mapa de asientos para esta categoría');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const locationData = {
        name: values.name,
        category: values.category,
        address: values.address,
        capacity: values.capacity || null,
        seatMapId: createdSeatMapId || null
      };

      console.log('Creating location with data:', locationData);

      const response = await axios.post(`${gatewayUrl}/location`, locationData);
      
      if (response.status === 201 || response.status === 200) {
        setSuccessMessage('Ubicación creada exitosamente');
        message.success('Ubicación creada exitosamente');
        
        form.resetFields();
        setSelectedCategory(null);
        setCreatedSeatMapId(null);
        setLocationName('');
        
        setTimeout(() => {
          navigate('/admin/locations');
        }, 2000);
      }
      
    } catch (error) {
      console.error("Error creando ubicación:", error);
      
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.status === 400) {
        setErrorMessage('Datos inválidos. Por favor revise los campos ingresados.');
      } else if (error.response?.status === 409) {
        setErrorMessage('Ya existe una ubicación con este nombre.');
      } else {
        setErrorMessage('Error al crear la ubicación. Por favor intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Funciones para el modal de SeatMap
  const openSeatMapModal = () => {
    if (!selectedCategory) {
      message.warning('Primero seleccione una categoría para la ubicación');
      return;
    }

    if (!locationName.trim()) {
      message.warning('Primero ingrese el nombre de la ubicación');
      return;
    }

    const allowedTypes = categoryInfo[selectedCategory].seatMapTypes;
    if (allowedTypes.length === 0) {
      message.info('Esta categoría no utiliza mapas de asientos');
      return;
    }

    setSeatMapModalVisible(true);
    setSections([]);
    seatMapForm.setFieldsValue({ name: locationName }); // Pre-llenar con el nombre de la ubicación
  };

  const handleSeatMapTypeChange = (type) => {
    if (seatMapTypeInfo[type]) {
      const defaultSections = seatMapTypeInfo[type].defaultSections.map((section, index) => ({
        ...section,
        id: section.position,
        order: index + 1,
        key: `section_${index}`
      }));
      setSections(defaultSections);
    }
  };

  const addSection = () => {
    const newSection = {
      key: `section_${Date.now()}`,
      id: `seccion_${sections.length + 1}`,
      name: `Sección ${sections.length + 1}`,
      position: `position_${sections.length + 1}`,
      rows: 5,
      seatsPerRow: 10,
      price: 10000,
      color: '#1890ff',
      order: sections.length + 1
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (key, field, value) => {
    setSections(sections.map(section => 
      section.key === key ? { ...section, [field]: value } : section
    ));
  };

  const removeSection = (key) => {
    setSections(sections.filter(section => section.key !== key));
  };

  const onSeatMapFinish = async (values) => {
    if (sections.length === 0) {
      message.error('Debe agregar al menos una sección');
      return;
    }

    setSeatMapLoading(true);
    
    try {
      const totalCapacity = sections.reduce((total, section) => 
        total + (section.rows * section.seatsPerRow), 0
      );

      const seatMapData = {
        id: `${values.type}_${Date.now()}`,
        name: values.name, // Usar el mismo nombre que la ubicación
        type: values.type,
        sections: sections.map(({ key, ...section }) => section),
        config: {
          ...(values.type === 'football' && {
            stadiumName: values.name,
            fieldDimensions: { width: 400, height: 260 }
          }),
          ...(values.type === 'cinema' && {
            cinemaName: values.name,
            screenWidth: 300
          }),
          ...(values.type === 'theater' && {
            theaterName: values.name,
            stageWidth: 250
          })
        },
        isActive: true
      };

      const response = await axios.post(`${gatewayUrl}/seatmaps`, seatMapData);
      
      if (response.status === 201 || response.status === 200) {
        message.success('Mapa de asientos creado exitosamente');
        
        // Actualizar la lista de seatmaps
        const updatedSeatMaps = [...seatMaps, response.data];
        setSeatMaps(updatedSeatMaps);
        
        // Guardar el ID del seatmap creado y establecer la capacidad
        setCreatedSeatMapId(response.data.id);
        form.setFieldsValue({ 
          seatMapId: response.data.id,
          capacity: totalCapacity
        });
        
        // Cerrar modal
        setSeatMapModalVisible(false);
        seatMapForm.resetFields();
        setSections([]);
      }
      
    } catch (error) {
      console.error("Error creando seatmap:", error);
      message.error('Error al crear el mapa de asientos');
    } finally {
      setSeatMapLoading(false);
    }
  };

  const sectionColumns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      render: (text, record) => (
        <Input 
          value={text} 
          onChange={(e) => updateSection(record.key, 'name', e.target.value)}
          placeholder="Nombre de la sección"
        />
      )
    },
    {
      title: 'Posición',
      dataIndex: 'position',
      render: (text, record) => (
        <Input 
          value={text} 
          onChange={(e) => updateSection(record.key, 'position', e.target.value)}
          placeholder="north, south, front..."
        />
      )
    },
    {
      title: 'Filas',
      dataIndex: 'rows',
      render: (text, record) => (
        <InputNumber 
          value={text} 
          onChange={(value) => updateSection(record.key, 'rows', value)}
          min={1}
          max={50}
        />
      )
    },
    {
      title: 'Asientos/Fila',
      dataIndex: 'seatsPerRow',
      render: (text, record) => (
        <InputNumber 
          value={text} 
          onChange={(value) => updateSection(record.key, 'seatsPerRow', value)}
          min={1}
          max={100}
        />
      )
    },
    {
      title: 'Precio por defecto (€)',
      dataIndex: 'price',
      render: (text, record) => (
        <InputNumber 
          value={text} 
          onChange={(value) => updateSection(record.key, 'price', value)}
          min={0}
          step={1000}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
        />
      )
    },
    {
      title: 'Color',
      dataIndex: 'color',
      render: (text, record) => (
        <ColorPicker 
          value={text}
          onChange={(color) => updateSection(record.key, 'color', color.toHexString())}
          showText
        />
      )
    },
    {
      title: 'Total',
      render: (_, record) => (
        <Tag color="blue">
          {(record.rows * record.seatsPerRow).toLocaleString()} asientos
        </Tag>
      )
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        <Popconfirm
          title="¿Eliminar esta sección?"
          onConfirm={() => removeSection(record.key)}
          okText="Sí"
          cancelText="No"
        >
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  const totalSeatMapCapacity = sections.reduce((total, section) => 
    total + (section.rows * section.seatsPerRow), 0
  );

  const requiresSeatMap = selectedCategory && categoryInfo[selectedCategory].requiresSeatMap;

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: COLORS?.neutral?.white || '#ffffff' }}>
      <Content style={{ padding: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header with breadcrumb */}
          <Row style={{ marginBottom: '24px' }}>
            <Col span={24}>
              <Breadcrumb 
                items={[
                  { title: <Link to="/admin">Administración</Link> },
                  { title: <Link to="/admin/locations">Ubicaciones</Link> },
                  { title: 'Crear ubicación' }
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
                <HomeOutlined style={{ marginRight: '12px', color: COLORS?.primary?.main || "#1890ff" }} />
                Crear nueva ubicación
              </Title>
              <Paragraph type="secondary" style={{ marginTop: '8px' }}>
                Complete los detalles a continuación para crear una nueva ubicación en el sistema
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

          {successMessage && (
            <Alert
              message="¡Éxito!"
              description={successMessage}
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              style={{ marginBottom: 24, borderRadius: '6px' }}
              closable
              onClose={() => setSuccessMessage(null)}
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
              name="create_location"
              onFinish={onFinish}
              layout="vertical"
              requiredMark="optional"
              onValuesChange={() => {
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    label="Nombre de la ubicación"
                    name="name"
                    rules={[
                      { required: true, message: 'Por favor ingrese el nombre de la ubicación' },
                      { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                      { max: 100, message: 'El nombre no puede exceder los 100 caracteres' }
                    ]}
                  >
                    <Input 
                      placeholder="Ej: Estadio Santiago Bernabéu, Teatro Real, Cines Callao..." 
                      size="large" 
                      prefix={<AppstoreOutlined style={{ color: COLORS?.neutral?.grey3 || '#d9d9d9' }} />}
                      onChange={handleLocationNameChange}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Categoría"
                    name="category"
                    rules={[{ required: true, message: 'Por favor seleccione la categoría de la ubicación' }]}
                  >
                    <Select
                      placeholder="Seleccionar categoría"
                      onChange={handleCategoryChange}
                      size="large"
                      suffixIcon={<TagOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />}
                    >
                      {Object.entries(categoryInfo).map(([key, info]) => (
                        <Option key={key} value={key}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Tag color={categoryColors[key]} style={{ marginRight: '8px' }}>
                              {info.icon}
                            </Tag>
                            {info.label}
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span>
                          Mapa de asientos 
                          {requiresSeatMap && <span style={{ color: 'red' }}>*</span>}
                        </span>
                        {requiresSeatMap && (
                          <Button 
                            type="primary" 
                            size="small" 
                            icon={<PlusOutlined />}
                            onClick={openSeatMapModal}
                            style={{ padding: '0 8px' }}
                            disabled={!locationName.trim()}
                          >
                            {createdSeatMapId ? 'Editar mapa' : 'Crear mapa'}
                          </Button>
                        )}
                      </div>
                    }
                    name="seatMapId"
                    rules={requiresSeatMap ? [{ required: true, message: 'Debe crear un mapa de asientos para esta categoría' }] : []}
                  >
                    <Input
                      placeholder={requiresSeatMap ? "Debe crear un mapa de asientos" : "No se requiere mapa de asientos"}
                      size="large"
                      disabled={true}
                      value={createdSeatMapId ? `Mapa creado: ${locationName}` : ''}
                      suffix={createdSeatMapId ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <LockOutlined style={{ color: '#d9d9d9' }} />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    label="Dirección"
                    name="address"
                    rules={[
                      { required: true, message: 'Por favor ingrese la dirección de la ubicación' },
                      { min: 10, message: 'La dirección debe tener al menos 10 caracteres' },
                      { max: 200, message: 'La dirección no puede exceder los 200 caracteres' }
                    ]}
                  >
                    <Input 
                      placeholder="Ej: Av. de Concha Espina, 1, 28036 Madrid" 
                      size="large"
                      prefix={<EnvironmentOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    label="Capacidad"
                    name="capacity"
                    rules={[
                      { type: 'number', min: 1, message: 'La capacidad debe ser al menos 1' },
                      { type: 'number', max: 200000, message: 'La capacidad no puede exceder los 200,000 asientos' }
                    ]}
                  >
                    <InputNumber
                      placeholder="Se calculará automáticamente desde el mapa de asientos"
                      style={{ width: '100%' }}
                      size="large"
                      min={1}
                      max={200000}
                      disabled={createdSeatMapId} // Bloquear si hay seatmap
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter={
                        <Tooltip title={createdSeatMapId ? "Capacidad determinada por el mapa de asientos" : "Número máximo de personas que puede albergar la ubicación"}>
                          <Space>
                            {createdSeatMapId && <LockOutlined />}
                            <TeamOutlined />
                            asientos
                          </Space>
                        </Tooltip>
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Preview de la categoría seleccionada */}
              {selectedCategory && (
                <Alert
                  message={`Categoría seleccionada: ${categoryInfo[selectedCategory].label}`}
                  description={
                    <div>
                      <p>{categoryInfo[selectedCategory].description}</p>
                      {categoryInfo[selectedCategory].requiresSeatMap ? (
                        <p><strong>Esta categoría requiere un mapa de asientos obligatorio</strong></p>
                      ) : (
                        <p><strong>Esta categoría no requiere mapa de asientos</strong></p>
                      )}
                      {categoryInfo[selectedCategory].seatMapTypes.length > 0 && (
                        <p><strong>Tipos de mapas disponibles:</strong> {categoryInfo[selectedCategory].seatMapTypes.join(', ')}</p>
                      )}
                      {categoryInfo[selectedCategory].requiresCapacity && (
                        <p><strong>Se recomienda especificar la capacidad para esta categoría</strong></p>
                      )}
                    </div>
                  }
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  style={{ 
                    marginBottom: 24, 
                    borderRadius: '6px',
                    backgroundColor: `${categoryColors[selectedCategory]}10`,
                    borderColor: `${categoryColors[selectedCategory]}30`
                  }}
                />
              )}

              {/* Información del seatmap creado */}
              {createdSeatMapId && (
                <Alert
                  message="Mapa de asientos creado exitosamente"
                  description={
                    <div>
                      <p><strong>Nombre:</strong> {locationName}</p>
                      <p><strong>Capacidad calculada:</strong> {form.getFieldValue('capacity')?.toLocaleString()} asientos</p>
                      <p><strong>Estado:</strong> <Tag color="green">Listo para usar</Tag></p>
                    </div>
                  }
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  style={{ marginBottom: 24, borderRadius: '6px' }}
                />
              )}

              <Divider />

              <Row gutter={16} justify="space-between">
                <Col>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/admin/locations')}
                    style={{ borderRadius: '6px' }}
                  >
                    Cancelar
                  </Button>
                </Col>
                <Col>
                  <Space>
                    <Button 
                      type="default" 
                      onClick={() => {
                        form.resetFields();
                        setSelectedCategory(null);
                        setCreatedSeatMapId(null);
                        setLocationName('');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      style={{ borderRadius: '6px' }}
                    >
                      Limpiar
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={loading} 
                      icon={<SaveOutlined />}
                      disabled={requiresSeatMap && !createdSeatMapId}
                      style={{ 
                        backgroundColor: COLORS?.primary?.main, 
                        borderColor: COLORS?.primary?.main || "#1890ff", 
                        borderRadius: '6px' 
                      }}
                    >
                      Crear ubicación
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </div>   
        
        {/* Modal para crear SeatMap */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />
              <span>Crear mapa de asientos para: {locationName}</span>
            </div>
          }
          open={seatMapModalVisible}
          onCancel={() => {
            setSeatMapModalVisible(false);
            seatMapForm.resetFields();
            setSections([]);
          }}
          footer={null}
          width={1000}
          centered
          maskClosable={false}
        >
          <Form
            form={seatMapForm}
            layout="vertical"
            onFinish={onSeatMapFinish}
            style={{ marginTop: '16px' }}
            initialValues={{ name: locationName }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Nombre del mapa"
                  rules={[{ required: true, message: 'Ingrese el nombre del mapa' }]}
                >
                  <Input 
                    placeholder="Nombre del mapa" 
                    disabled={true}
                    suffix={<LockOutlined style={{ color: '#d9d9d9' }} />}
                  />
                </Form.Item>
                </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Tipo de mapa"
                  rules={[{ required: true, message: 'Seleccione el tipo de mapa' }]}
                >
                  <Select
                    placeholder="Seleccionar tipo"
                    onChange={handleSeatMapTypeChange}
                    disabled={!selectedCategory}
                  >
                    {selectedCategory && categoryInfo[selectedCategory].seatMapTypes.map(type => (
                      <Option key={type} value={type}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <AppstoreOutlined style={{ marginRight: '8px' }} />
                          {seatMapTypeInfo[type].label}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {sections.length > 0 && (
              <>
                <Divider />
                <div style={{ marginBottom: '16px' }}>
                  <Title level={4}>Configuración de secciones</Title>
                  <Text type="secondary">
                    Configure las secciones del mapa de asientos. Capacidad total: {totalSeatMapCapacity.toLocaleString()} asientos
                  </Text>
                </div>

                <Table
                  columns={sectionColumns}
                  dataSource={sections}
                  pagination={false}
                  size="small"
                  bordered
                  scroll={{ x: 800 }}
                  style={{ marginBottom: '16px' }}
                />

                <Button
                  type="dashed"
                  onClick={addSection}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: '16px' }}
                >
                  Agregar sección
                </Button>
              </>
            )}

            <Row justify="space-between" style={{ marginTop: '24px' }}>
              <Col>
                <Button
                  onClick={() => {
                    setSeatMapModalVisible(false);
                    seatMapForm.resetFields();
                    setSections([]);
                  }}
                >
                  Cancelar
                </Button>
              </Col>
              <Col>
                <Space>
                  <Text strong>
                    Total: {totalSeatMapCapacity.toLocaleString()} asientos
                  </Text>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={seatMapLoading}
                    disabled={sections.length === 0}
                    icon={<SaveOutlined />}
                  >
                    Crear mapa de asientos
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default LocationCreation;