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
  ColorPicker,
  Result
} from 'antd';
import { 
  EnvironmentOutlined, 
  TagOutlined, 
  SaveOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  HomeOutlined,
  PlusOutlined,
  DeleteOutlined,
  LockOutlined,
  CalendarOutlined,
  ReloadOutlined
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

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdLocationName, setCreatedLocationName] = useState('');
  
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
      requiresSeatMap: true
    },
    cinema: {
      label: 'Cine',
      description: 'Sala de cine para proyección de películas',
      icon: '🎬',
      seatMapTypes: ['cinema'],
      requiresCapacity: true,
      requiresSeatMap: true
    },
    concert: {
      label: 'Concierto',
      description: 'Venue para conciertos y espectáculos musicales',
      icon: '🎵',
      seatMapTypes: ['concert', 'arena'],
      requiresCapacity: true,
      requiresSeatMap: false,
      allowOptionalSeatMap: true
    },
    theater: {
      label: 'Teatro',
      description: 'Teatro para obras teatrales y espectáculos',
      icon: '🎭',
      seatMapTypes: ['theater'],
      requiresCapacity: true,
      requiresSeatMap: true
    },
    festival: {
      label: 'Festival',
      description: 'Espacio para festivales y eventos al aire libre',
      icon: '🎪',
      seatMapTypes: [],
      requiresCapacity: false,
      requiresSeatMap: false
    }
  };

  const seatMapTypeInfo = {
    football: {
      label: 'Estadio de fútbol',
      description: 'Configuración para estadios deportivos',
      availablePositions: ['north', 'east', 'west', 'south', 'vip'],
      defaultSections: [
        { name: 'Tribuna norte', position: 'north', color: '#4CAF50', rows: 8, seatsPerRow: 15, defaultPrice:0 },
        { name: 'Tribuna este', position: 'east', color: '#2196F3', rows: 6, seatsPerRow: 14, defaultPrice:0},
        { name: 'Tribuna oeste', position: 'west', color: '#2196F3', rows: 6, seatsPerRow: 14, defaultPrice:0},
        { name: 'Tribuna sur', position: 'south', color: '#4CAF50', rows: 8, seatsPerRow: 15, defaultPrice:0}
      ],
      limits: {
        north: { maxRows: 15, maxSeatsPerRow: 25 },
        east: { maxRows: 12, maxSeatsPerRow: 20 },
        west: { maxRows: 12, maxSeatsPerRow: 20 },
        south: { maxRows: 15, maxSeatsPerRow: 25 },
        vip: { maxRows: 5, maxSeatsPerRow: 15 }
      }
    },
    cinema: {
      label: 'Sala de cine',
      description: 'Configuración para salas de cine',
      availablePositions: ['front', 'middle', 'back', 'premium'],
      defaultSections: [
        { name: 'Delanteras', position: 'front', color: '#4CAF50', rows: 3, seatsPerRow: 16, defaultPrice:0},
        { name: 'Centrales', position: 'middle', color: '#2196F3', rows: 5, seatsPerRow: 16, defaultPrice:0},
        { name: 'Traseras', position: 'back', color: '#FF9800', rows: 4, seatsPerRow: 16, defaultPrice:0}
      ],
      limits: {
        front: { maxRows: 5, maxSeatsPerRow: 20 },
        middle: { maxRows: 8, maxSeatsPerRow: 20 },
        back: { maxRows: 6, maxSeatsPerRow: 20 },
        premium: { maxRows: 3, maxSeatsPerRow: 12 }
      }
    },
    theater: {
      label: 'Teatro',
      description: 'Configuración para teatros y auditorios',
      availablePositions: ['orchestra', 'mezzanine', 'balcony', 'boxes'],
      defaultSections: [
        { name: 'Platea', position: 'orchestra', color: '#4CAF50', rows: 15, seatsPerRow: 20, defaultPrice:0},
        { name: 'Entresuelo', position: 'mezzanine', color: '#2196F3', rows: 8, seatsPerRow: 18, defaultPrice:0},
        { name: 'Balcón', position: 'balcony', color: '#FF9800', rows: 6, seatsPerRow: 16, defaultPrice:0}
      ],
      limits: {
        orchestra: { maxRows: 20, maxSeatsPerRow: 30 },
        mezzanine: { maxRows: 10, maxSeatsPerRow: 25 },
        balcony: { maxRows: 8, maxSeatsPerRow: 20 },
        boxes: { maxRows: 4, maxSeatsPerRow: 8 }
      }
    },
    'concert': {
      label: 'Concierto (gradas)',
      description: 'Pista, grada baja, grada media, grada alta y VIP',
      availablePositions: ['pista', 'grada-baja', 'grada-media', 'grada-alta', 'vip'],
      defaultSections: [
        { name: 'Pista', position: 'pista', color: '#FF5722', rows: 1, seatsPerRow: 1, hasNumberedSeats: false, totalCapacity: 300 },
        { name: 'Grada Baja', position: 'grada-baja', color: '#4CAF50', rows: 7, seatsPerRow: 10, defaultPrice:0},
        { name: 'Grada Media', position: 'grada-media', color: '#2196F3', rows: 5, seatsPerRow: 8, defaultPrice:0},
        { name: 'Grada Alta', position: 'grada-alta', color: '#FF9800', rows: 6, seatsPerRow: 11, defaultPrice:0},
        { name: 'VIP', position: 'vip', color: '#9C27B0', rows: 2, seatsPerRow: 8, defaultPrice:0}
      ],
      limits: {
        pista: { maxRows: 1, maxSeatsPerRow: 1 },
        'grada-baja': { maxRows: 10, maxSeatsPerRow: 15 },
        'grada-media': { maxRows: 8, maxSeatsPerRow: 12 },
        'grada-alta': { maxRows: 10, maxSeatsPerRow: 15 },
        vip: { maxRows: 3, maxSeatsPerRow: 10 }
      }
    },
    'arena': {
      label: 'Concierto (arenas)',
      description: 'Pista, laterales este y oeste, fondos norte y sur y VIP',
      availablePositions: ['pista', 'lateral-este', 'lateral-oeste', 'fondo-norte', 'fondo-sur', 'vip'],
      defaultSections: [
        { name: 'Pista', position: 'pista', color: '#FF5722', rows: 1, seatsPerRow: 1, hasNumberedSeats: false, totalCapacity: 300 },
        { name: 'Lateral Este', position: 'lateral-este', color: '#2196F3', rows: 6, seatsPerRow: 14, defaultPrice:0},
        { name: 'Lateral Oeste', position: 'lateral-oeste', color: '#2196F3', rows: 6, seatsPerRow: 14, defaultPrice:0},
        { name: 'Fondo Norte', position: 'fondo-norte', color: '#4CAF50', rows: 8, seatsPerRow: 15, defaultPrice:0},
        { name: 'Fondo Sur', position: 'fondo-sur', color: '#4CAF50', rows: 8, seatsPerRow: 15, defaultPrice:0},
        { name: 'VIP', position: 'vip', color: '#9C27B0', rows: 2, seatsPerRow: 8, defaultPrice:0}
      ],
      limits: {
        pista: { maxRows: 1, maxSeatsPerRow: 1 },
        'lateral-este': { maxRows: 12, maxSeatsPerRow: 20 },
        'lateral-oeste': { maxRows: 12, maxSeatsPerRow: 20 },
        'fondo-norte': { maxRows: 10, maxSeatsPerRow: 15 },
        'fondo-sur': { maxRows: 10, maxSeatsPerRow: 15 },
        vip: { maxRows: 3, maxSeatsPerRow: 10 }
      }
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
        setCreatedLocationName(values.name);
        setSuccessModalVisible(true);
        message.success('Ubicación creada exitosamente');
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
    seatMapForm.setFieldsValue({ name: locationName });
  };

  const handleSeatMapTypeChange = (type) => {
    if (seatMapTypeInfo[type]) {
      const defaultSections = seatMapTypeInfo[type].defaultSections.map((section, index) => ({
        ...section,
        id: section.position,
        order: index + 1,
        key: `section_${index}`,
        // Determinar automáticamente el tipo basado en la posición
        hasNumberedSeats: section.position === 'pista' ? false : true
      }));
      setSections(defaultSections);
    }
  };

  const addSection = () => {
    const currentType = seatMapForm.getFieldValue('type');
    
    if (!currentType || !seatMapTypeInfo[currentType]) {
      message.warning('Primero seleccione un tipo de mapa');
      return;
    }
    
    // Obtener posiciones ya usadas
    const usedPositions = sections.map(section => section.position);
    const availablePositions = seatMapTypeInfo[currentType].availablePositions;
    const unusedPositions = availablePositions.filter(pos => !usedPositions.includes(pos));
    
    if (unusedPositions.length === 0) {
      message.warning('No hay más tipos de sección disponibles para este tipo de mapa');
      return;
    }
    
    // Usar la primera posición disponible
    const newPosition = unusedPositions[0];
    
    const newSection = {
      key: `section_${Date.now()}`,
      id: `seccion_${sections.length + 1}`,
      name: `Sección ${sections.length + 1}`,
      position: newPosition,
      rows: 5,
      seatsPerRow: 10,
      color: '#1890ff',
      defaultPrice: 0,
      order: sections.length + 1,
      hasNumberedSeats: newPosition === 'pista' ? false : true // Determinar automáticamente basado en posición
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (key, field, value) => {
    if (field === 'position') {
      // Verificar que la posición no esté ya en uso por otra sección
      const isPositionTaken = sections.some(section => 
        section.key !== key && section.position === value
      );
      
      if (isPositionTaken) {
        message.warning('Esta posición ya está siendo utilizada por otra sección');
        return;
      }
      
      // Actualizar automáticamente el tipo de asientos basado en la posición
      const newHasNumberedSeats = value === 'pista' ? false : true;
      setSections(sections.map(section => 
        section.key === key ? { ...section, [field]: value, hasNumberedSeats: newHasNumberedSeats } : section
      ));
      return;
    }
    
    // Validar límites cuando se cambian filas o asientos por fila
    if (field === 'rows' || field === 'seatsPerRow') {
      const currentType = seatMapForm.getFieldValue('type');
      const section = sections.find(s => s.key === key);
      
      if (section && currentType) {
        const limits = getSectionLimits(currentType, section.position);
        
        if (field === 'rows' && value > limits.maxRows) {
          message.warning(`El máximo de filas para esta posición es ${limits.maxRows}`);
          return;
        }
        
        if (field === 'seatsPerRow' && value > limits.maxSeatsPerRow) {
          message.warning(`El máximo de asientos por fila para esta posición es ${limits.maxSeatsPerRow}`);
          return;
        }
      }
    }
    
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
      const totalCapacity = sections.reduce((total, section) => {
        if (section.hasNumberedSeats === false && section.totalCapacity) {
          return total + section.totalCapacity; // Usar totalCapacity para entrada general
        }
        return total + (section.rows * section.seatsPerRow);
      }, 0);

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
          }),
          ...(values.type === 'concert' && {
            venueName: values.name,
            stagePosition: 'center',
            stageDimensions: { width: 80, height: 50 },
            allowsGeneralAdmission: true
          }),
          ...(values.type === 'arena' && {
            venueName: values.name,
            stagePosition: 'center',
            stageDimensions: { width: 80, height: 50 },
            allowsGeneralAdmission: true
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

  const getAvailablePositionsCount = () => {
    const currentType = seatMapForm.getFieldValue('type');
    if (!currentType || !seatMapTypeInfo[currentType]) return 0;
    
    const usedPositions = sections.map(section => section.position);
    const availablePositions = seatMapTypeInfo[currentType].availablePositions;
    return availablePositions.filter(pos => !usedPositions.includes(pos)).length;
  };

  const getSectionLimits = (mapType, position) => {
    if (!seatMapTypeInfo[mapType] || !seatMapTypeInfo[mapType].limits) {
      return { maxRows: 50, maxSeatsPerRow: 100 }; // Límites por defecto
    }
    
    return seatMapTypeInfo[mapType].limits[position] || { maxRows: 50, maxSeatsPerRow: 100 };
  };

  const handleGoToEvents = () => {
    setSuccessModalVisible(false);
    navigate('/admin');
    };

    const handleCreateAnother = () => {
    setSuccessModalVisible(false);
    form.resetFields();
    setSelectedCategory(null);
    setCreatedSeatMapId(null);
    setLocationName('');
    setCreatedLocationName('');
    setErrorMessage(null);
    setSuccessMessage(null);
    };

  // Modificar la definición de sectionColumns para la tabla de secciones
  const sectionColumns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 200,
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
      width: 140,
      render: (text, record) => {
        const currentType = seatMapForm.getFieldValue('type');
        const availablePositions = currentType ? seatMapTypeInfo[currentType]?.availablePositions || [] : [];
        // Obtener posiciones ya usadas por otras secciones (excluyendo la actual)
        const usedPositions = sections
          .filter(section => section.key !== record.key)
          .map(section => section.position);
        // Filtrar solo las posiciones disponibles
        const selectablePositions = availablePositions.filter(pos =>
          !usedPositions.includes(pos) || pos === text
        );
        return (
          <Select 
            value={text} 
            onChange={(value) => updateSection(record.key, 'position', value)}
            placeholder="Seleccionar posición"
            style={{ width: '100%' }}
          >
            {selectablePositions.map(position => (
              <Option key={position} value={position}>
                {position}
              </Option>
            ))}
          </Select>
        );
      }
    },
    {
      title: 'Filas',
      dataIndex: 'rows',
      width: 60,
      render: (text, record) => (
        <InputNumber 
          min={1} 
          max={getSectionLimits(seatMapForm.getFieldValue('type'), record.position).maxRows}
          value={text}
          onChange={(value) => updateSection(record.key, 'rows', value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Asientos/fila',
      dataIndex: 'seatsPerRow',
      width: 80,
      render: (text, record) => (
        <InputNumber 
          min={1} 
          max={getSectionLimits(seatMapForm.getFieldValue('type'), record.position).maxSeatsPerRow}
          value={text}
          onChange={(value) => updateSection(record.key, 'seatsPerRow', value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Tipo',
      render: (_, record) => {
        // Determinar el tipo basado en la posición
        const isGeneralAdmission = record.position === 'pista';
        
        return (
          <div style={{  
            backgroundColor: isGeneralAdmission ? '#fff7e6' : '#f6ffed',
            border: `1px solid ${isGeneralAdmission ? '#ffd591' : '#b7eb8f'}`,
            borderRadius: '6px',
            textAlign: 'center',
            minWidth: '120px',
            whiteSpace: 'nowrap'
          }}>
            <Text style={{ 
              color: isGeneralAdmission ? '#d46b08' : '#389e0d',
              fontWeight: '500',
              fontSize: '11.5px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {isGeneralAdmission ? 'Entrada general' : 'Asientos numerados'}
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Capacidad (si entrada general)',
      render: (_, record) => (
        record.hasNumberedSeats === false ? (
          <InputNumber
            value={record.totalCapacity}
            onChange={(value) => updateSection(record.key, 'totalCapacity', value)}
            min={1}
            max={1000}
            placeholder="Capacidad"
          />
        ) : null
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
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      )
    }
  ];

  const totalSeatMapCapacity = sections.reduce((total, section) => {
    if (section.hasNumberedSeats === false && section.totalCapacity) {
      return total + section.totalCapacity;
    }
    return total + (section.rows * section.seatsPerRow);
  }, 0);

  const requiresSeatMap = selectedCategory && categoryInfo[selectedCategory].requiresSeatMap;
  const allowsOptionalSeatMap = selectedCategory && categoryInfo[selectedCategory].allowOptionalSeatMap;

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
      <Content style={{ padding: isMobile ? "18px 4px" : "40px 20px" }}>
        <div style={{ maxWidth: isMobile ? "100%" : "1200px", margin: "0 auto" }}>
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
                          {allowsOptionalSeatMap && <span style={{ color: '#1890ff', fontSize: '12px' }}> (opcional)</span>}
                        </span>
                        {(requiresSeatMap || allowsOptionalSeatMap) && (
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
                      placeholder={
                        requiresSeatMap 
                          ? "Debe crear un mapa de asientos" 
                          : allowsOptionalSeatMap 
                            ? "Mapa de asientos opcional - puede dejarlo vacío"
                            : "No se requiere mapa de asientos"
                      }
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
                      ) : categoryInfo[selectedCategory].allowOptionalSeatMap ? (
                        <p><strong>Esta categoría permite crear un mapa de asientos opcional</strong></p>
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
                  scroll={{ x: 1000 }}
                  style={{ marginBottom: '16px' }}
                />

                <Button
                  type="dashed"
                  onClick={addSection}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: '16px' }}
                  disabled={getAvailablePositionsCount() === 0}
                >
                  {getAvailablePositionsCount() === 0 
                    ? 'No hay más tipos de sección disponibles'
                    : `Agregar sección (${getAvailablePositionsCount()} tipos disponibles)`
                  }
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
        <Modal
            title={null}
            open={successModalVisible}
            onCancel={() => setSuccessModalVisible(false)}
            footer={null}
            width={500}
            centered
            maskClosable={false}
            >
            <Result
                status="success"
                title="¡Ubicación creada exitosamente!"
                subTitle={
                <div>
                    <p>La ubicación <strong>"{createdLocationName}"</strong> ha sido creada correctamente.</p>
                    <p>¿Qué desea hacer a continuación?</p>
                </div>
                }
                extra={[
                <Button 
                    key="events" 
                    type="primary" 
                    icon={<CalendarOutlined />}
                    onClick={handleGoToEvents}
                    style={{ 
                    backgroundColor: COLORS?.primary?.main, 
                    borderColor: COLORS?.primary?.main || "#1890ff",
                    marginRight: '8px'
                    }}
                >
                    Ir a Eventos
                </Button>,
                <Button 
                    key="another" 
                    icon={<ReloadOutlined />}
                    onClick={handleCreateAnother}
                >
                    Crear otra ubicación
                </Button>
                ]}
            />
            </Modal>
    </Layout>
  );
};

export default LocationCreation;