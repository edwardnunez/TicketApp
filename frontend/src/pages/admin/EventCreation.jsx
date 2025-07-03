import { useState, useEffect, useCallback, useRef  } from 'react';
import { 
  Layout, 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  Select, 
  message, 
  Modal,
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
  const [usesRowPricing, setUsesRowPricing] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [eventDataToSave, setEventDataToSave] = useState(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  
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
          return location.category === 'concert' || location.category === 'stadium';
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

  const handleSectionCapacity = useCallback((sectionId, newCapacity) => {
    setSectionPricing(prevPricing => 
      prevPricing.map(section => 
        section.sectionId === sectionId 
          ? { 
              ...section, 
              customCapacity: newCapacity === '' ? '' : Math.max(0, parseInt(newCapacity) || 0),
              capacity: newCapacity === '' ? 0 : Math.max(0, parseInt(newCapacity) || 0)
            }
          : section
      )
    );
  }, []);

  const handleSectionBasePrice = useCallback((sectionId, newPrice) => {
    setSectionPricing(prevPricing => 
      prevPricing.map(section => 
        section.sectionId === sectionId 
          ? { 
              ...section, 
              basePrice: newPrice === '' ? '' : Math.round((parseFloat(newPrice) || 0) * 100) / 100 
            }
          : section
      )
    );
  }, []);

  const handleSectionVariablePrice = useCallback((sectionId, newPrice) => {
    setSectionPricing(prevPricing => 
      prevPricing.map(section => 
        section.sectionId === sectionId 
          ? { 
              ...section, 
              variablePrice: newPrice === '' ? '' : Math.round((parseFloat(newPrice) || 0) * 100) / 100 
            }
          : section
      )
    );
  }, []);

  const handleFrontRowFirstChange = (sectionId, frontRowFirst) => {
    setSectionPricing(prevPricing => 
      prevPricing.map(section => 
        section.sectionId === sectionId 
          ? { ...section, frontRowFirst }
          : section
      )
    );
  };

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
    setUsesRowPricing(false); // Resetear también pricing por filas
    
    if (location && location.seatMapId) {
      await fetchLocationSections(locationId);
      
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

  const handleTypeChange = (value) => {
    setType(value);
    setSelectedLocation(null);
    setIsCapacityLocked(false);
    setLocationSections([]);
    setSectionPricing([]);
    setUsesSectionPricing(false);
    setUsesRowPricing(false);
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
        setUsesRowPricing(true);
        console.log("Secciones obtenidas:", data.sections);
        // Inicializar pricing por secciones con basePrice y variablePrice
        const initialPricing = data.sections.map(section => ({
        sectionId: section.sectionId,
        sectionName: section.sectionName,
        capacity: section.hasNumberedSeats === false
          ? section.capacity
          : section.rows * section.seatsPerRow,
        maxCapacity: section.hasNumberedSeats === false ? section.totalCapacity : null,
        rows: section.hasNumberedSeats === false ? 1 : section.rows,
        seatsPerRow: section.hasNumberedSeats === false ? section.capacity : section.seatsPerRow,
        hasNumberedSeats: section.hasNumberedSeats !== false,
        basePrice: '',
        variablePrice: '',
        frontRowFirst: true,
        customCapacity: section.hasNumberedSeats === false ? '' : null
      }));

        
        setSectionPricing(initialPricing);
        form.setFieldsValue({ price: undefined });
      } else {
        setLocationSections([]);
        setSectionPricing([]);
        setUsesSectionPricing(false);
        setUsesRowPricing(false);
      }
    } catch (error) {
      console.error("Error obteniendo secciones:", error);
      setLocationSections([]);
      setSectionPricing([]);
      setUsesSectionPricing(false);
      setUsesRowPricing(false);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleImageChange = (info) => {
    const { fileList } = info;
    
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      setImageFile(file);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1]; // Remover el prefijo data:...;base64,
        resolve({
          data: base64String,
          contentType: file.type,
          filename: file.name,
          size: file.size
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleConfirmSaveEvent = async () => {
    setSaving(true);
    
    try {
      console.log('Creating event with data:', eventDataToSave);
      
      // Crear el evento
      const createEventResponse = await axios.post(`${gatewayUrl}/events`, eventDataToSave);
      const createdEvent = createEventResponse.data;
      
      message.success('Evento creado correctamente');
      setShowConfirmModal(false);

      // Si tiene mapa de asientos, navegar a configuración
      if (selectedLocation && selectedLocation.seatMapId) {
        navigate('/admin/event-seatmap-config', { 
          state: { 
            ...eventDataToSave,
            _id: createdEvent._id,
            imagePath: createdEvent.image
          } 
        });
      } else {
        // Si no tiene mapa de asientos, navegar a la lista de eventos
        navigate('/admin');
      }
      
    } catch (error) {
      console.error("Error creando el evento:", error);
      
      if (error.response) {
        console.error('Server error:', error.response.data);
        setErrorMessage(`Error del servidor: ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        console.error('Network error:', error.request);
        setErrorMessage('Error de conexión. Verifica tu conexión a internet.');
      } else {
        console.error('Error:', error.message);
        setErrorMessage('Hubo un error al crear el evento');
      }
    } finally {
      setSaving(false);
    }
  };

  const getEventTypeLabel = (type) => {
    const typeLabels = {
      'football': 'Partido de fútbol',
      'cinema': 'Cine',
      'concert': 'Concierto',
      'theater': 'Teatro',
      'festival': 'Festival'
    };
    return typeLabels[type] || type;
  };


  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    
    console.log('Form values:', values);
    
    try {
      const eventData = {
        name: values.name,
        date: values.date.toISOString(),
        location: values.location?._id || values.location,
        type: values.type,
        description: values.description,
        state: values.state || 'proximo'
      };

      console.log('Event data before pricing:', eventData);

      // Añadir pricing según el tipo
      if (usesSectionPricing && usesRowPricing && sectionPricing.length > 0) {
        const hasInvalidBasePrices = sectionPricing.some(section => 
          section.basePrice === '' || section.basePrice === null || section.basePrice === undefined || 
          isNaN(parseFloat(section.basePrice)) || parseFloat(section.basePrice) <= 0
        );

        const hasInvalidVariablePrices = sectionPricing.some(section => 
          section.hasNumberedSeats !== false && (
            section.variablePrice === '' || section.variablePrice === null || section.variablePrice === undefined ||
            isNaN(parseFloat(section.variablePrice)) || parseFloat(section.variablePrice) < 0
          )
        );
        
        const hasInvalidCapacities = type === 'concert' && sectionPricing.some(section => 
          !section.hasNumberedSeats && (
            section.customCapacity === '' || section.customCapacity === null || section.customCapacity === undefined ||
            isNaN(parseInt(section.customCapacity)) || parseInt(section.customCapacity) <= 0 ||
            (section.maxCapacity && parseInt(section.customCapacity) > section.maxCapacity)
          )
        );

        if (hasInvalidBasePrices || hasInvalidVariablePrices || hasInvalidCapacities) {
          let errorMsg = '';
          if (hasInvalidBasePrices) {
            errorMsg += 'Todos los precios base deben ser números válidos y mayores que 0. ';
          }
          if (hasInvalidVariablePrices) {
            errorMsg += 'Para secciones con asientos numerados, el precio variable debe ser un número válido (puede ser 0). ';
          }
          if (hasInvalidCapacities) {
            errorMsg += 'Para conciertos con pistas, debe especificar una capacidad válida dentro del límite máximo. ';
          }
          setErrorMessage(errorMsg.trim());
          setLoading(false);
          return;
        }
        
        eventData.usesSectionPricing = true;
        eventData.usesRowPricing = true;
        eventData.sectionPricing = sectionPricing.map(section => ({
          sectionId: section.sectionId,
          sectionName: section.sectionName,
          capacity: section.hasNumberedSeats 
            ? section.capacity 
            : parseInt(section.customCapacity) || section.capacity,
          rows: section.hasNumberedSeats ? section.rows : 1,
          seatsPerRow: section.hasNumberedSeats 
            ? section.seatsPerRow 
            : parseInt(section.customCapacity) || section.capacity,
          hasNumberedSeats: section.hasNumberedSeats !== false,
          basePrice: Math.round((parseFloat(section.basePrice) || 0) * 100) / 100,
          variablePrice: Math.round((parseFloat(section.variablePrice) || 0) * 100) / 100,
          frontRowFirst: section.frontRowFirst !== undefined ? section.frontRowFirst : true
        }));

        // Capacidad se calcula automáticamente en el backend
        eventData.capacity = sectionPricing.reduce((total, section) => {
          if (!section.hasNumberedSeats && type === 'concert') {
            return total + (parseInt(section.customCapacity) || 0);
          }
          return total + (section.capacity || 0);
        }, 0);

        // El precio base será el mínimo de todas las secciones (redondeado)
        eventData.price = Math.round((Math.min(...sectionPricing.map(s => s.basePrice || 0)) * 100)) / 100;
        
      } else {
        // Pricing tradicional
        if (!values.price || !values.capacity) {
          setErrorMessage('El precio y la capacidad son obligatorios cuando no hay pricing por secciones');
          setLoading(false);
          return;
        }
        
        eventData.usesSectionPricing = false;
        eventData.usesRowPricing = false;
        eventData.capacity = parseInt(values.capacity);
        eventData.price = parseFloat(values.price);
      }

      console.log('Event data prepared:', eventData);

      if (imageFile) {
        try {
          const imageData = await convertFileToBase64(imageFile);
          eventData.imageData = imageData;
          console.log('Image converted to base64, size:', imageData.size);
        } catch (error) {
          console.error('Error converting image to base64:', error);
          message.warning('Error al procesar la imagen, el evento se creará sin imagen');
        }
      }

      // Guardar los datos y mostrar modal de confirmación
      setEventDataToSave(eventData);
      setShowConfirmModal(true);
      
    } catch (error) {
      console.error("Error preparando el evento:", error);
      setErrorMessage('Hubo un error al procesar los datos del evento');
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
    beforeUpload: (file) => {
      // Validar tipo de archivo
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Solo puedes subir archivos de imagen!');
        return false;
      }
      
      // Validar tamaño (máximo 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('La imagen debe ser menor a 5MB!');
        return false;
      }
      
      return false; // Prevenir subida automática
    },
    onChange: handleImageChange,
    onRemove: () => {
      setImageFile(null);
      setImagePreview(null);
    },
    maxCount: 1,
    accept: 'image/*',
    fileList: imageFile ? [{
      uid: '-1',
      name: imageFile.name,
      status: 'done',
      url: imagePreview,
    }] : []
  };

  const getSeatMapInfo = (seatMapId) => {
    const seatMap = seatMaps.find(sm => sm.id === seatMapId);
    if (seatMap && type) {
      // Verificar compatibilidad con el tipo de evento
      const isCompatible = seatMap.compatibleEventTypes?.includes(type) || 
                          seatMap.type === type ||
                          (type === 'concert' && seatMap.type === 'football'); // Conciertos pueden usar mapas de estadio
      return { ...seatMap, isCompatible };
    }
    return seatMap;
  };

  const SectionPricingComponent = () => {
      if (!usesSectionPricing || locationSections.length === 0) return null;

      const calculatePriceRange = (section) => {
        const basePrice = parseFloat(section.basePrice) || 0;
        const variablePrice = parseFloat(section.variablePrice) || 0;
        
        if (basePrice <= 0) {
          return 'Precio no configurado';
        }
        
        if (!section.hasNumberedSeats) {
          return `€${basePrice.toFixed(2)}`;
        }
        
        if (variablePrice === 0) {
          return `€${basePrice.toFixed(2)}`;
        }
        
        const minPrice = Math.round((basePrice * 100)) / 100;
        const maxPrice = Math.round(((minPrice + (variablePrice * (section.rows - 1))) * 100)) / 100;
        
        return minPrice === maxPrice ? `€${minPrice.toFixed(2)}` : `€${minPrice.toFixed(2)} - €${maxPrice.toFixed(2)}`;
      };

      const getTotalCapacity = () => {
        return sectionPricing.reduce((total, section) => {
          if (!section.hasNumberedSeats && type === 'concert') {
            return total + (parseInt(section.customCapacity) || 0);
          }
          return total + (section.capacity || 0);
        }, 0);
      };

      const getOverallPriceRange = () => {
        if (sectionPricing.length === 0) return '€0.00';
        
        const validSections = sectionPricing.filter(section => 
          !isNaN(parseFloat(section.basePrice)) && parseFloat(section.basePrice) > 0
        );
        
        if (validSections.length === 0) return 'Precios no configurados';
        
        let minPrice = Infinity;
        let maxPrice = 0;
        
        validSections.forEach(section => {
          const sectionMin = Math.round(((parseFloat(section.basePrice) || 0) * 100)) / 100;
          const variablePrice = parseFloat(section.variablePrice) || 0;
          const sectionMax = variablePrice > 0 && section.hasNumberedSeats
            ? Math.round(((sectionMin + (variablePrice * (section.rows - 1))) * 100)) / 100
            : sectionMin;
          
          minPrice = Math.min(minPrice, sectionMin);
          maxPrice = Math.max(maxPrice, sectionMax);
        });
        
        return minPrice === maxPrice ? `€${minPrice.toFixed(2)}` : `€${minPrice.toFixed(2)} - €${maxPrice.toFixed(2)}`;
      };

      return (
        <Card 
          title={
            <Space>
              <TagOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />
              Configuración de precios por filas
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
            message="Pricing por filas activado"
            description="Esta ubicación tiene un mapa de asientos con secciones y filas definidas. Configure el precio base y el incremento por fila para cada sección."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Row gutter={[16, 16]}>
            {sectionPricing.map((section, index) => {
              const locationSection = locationSections.find(ls => ls.sectionId === section.sectionId);
              const isNumberedSeats = section.hasNumberedSeats !== false;
              console.log(`Section ${index + 1}:`, section);
              console.log(section.hasNumberedSeats, section.rows, section.seatsPerRow);
              console.log("variable" +isNumberedSeats);
              
              return (
                <Col xs={24} lg={12} key={section.sectionId}>
                  <Card 
                    size="small"
                    style={{
                      borderLeft: `4px solid ${locationSection?.color || '#1890ff'}`,
                      height: '100%'
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ fontSize: '16px' }}>
                          {section.sectionName}
                        </Text>
                        <Tag color={isNumberedSeats ? "blue" : "orange"} style={{ fontSize: '11px' }}>
                          {isNumberedSeats ? 
                            `${section.rows} filas × ${section.seatsPerRow} asientos` : 
                            'Entrada general'
                          }
                        </Tag>
                      </div>
                      
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Capacidad total: {section.capacity} {isNumberedSeats ? 'asientos' : 'personas'}
                      </Text>
                      
                      <Divider style={{ margin: '8px 0' }} />
                      
                      <Form.Item
                        label={isNumberedSeats ? "Precio base (fila más alejada)" : "Precio único"}
                        style={{ margin: 0 }}
                        required
                        validateStatus={
                          section.basePrice === '' || 
                          isNaN(parseFloat(section.basePrice)) || 
                          parseFloat(section.basePrice) <= 0 
                            ? 'error' 
                            : 'success'
                        }
                        help={
                          section.basePrice === '' ? 'El precio base es obligatorio' :
                          isNaN(parseFloat(section.basePrice)) || parseFloat(section.basePrice) <= 0 ? 'Debe ser un precio mayor que 0' :
                          null
                        }
                      >
                        <Input
                          type="number"
                          value={section.basePrice || 0}
                          onChange={(e) => handleSectionBasePrice(section.sectionId, e.target.value)}
                          prefix={<EuroOutlined />}
                          placeholder="Ej: 25"
                          min={0}
                          step={0.01}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>

                      {isNumberedSeats && (
                        <>
                          <Form.Item
                            label="Incremento por fila hacia adelante"
                            style={{ margin: 0 }}
                            required
                            validateStatus={
                              section.variablePrice === '' || 
                              isNaN(parseFloat(section.variablePrice)) || 
                              parseFloat(section.variablePrice) < 0 
                                ? 'error' 
                                : 'success'
                            }
                            help={
                              section.variablePrice === '' ? 'El incremento por fila es obligatorio' :
                              isNaN(parseFloat(section.variablePrice)) || parseFloat(section.variablePrice) < 0 ? 'Debe ser un número mayor o igual a 0' :
                              null
                            }
                          >
                            <Input
                              type="number"
                              value={section.variablePrice || 0}
                              onChange={(e) => handleSectionVariablePrice(section.sectionId, e.target.value)}
                              prefix={<EuroOutlined />}
                              placeholder="Ej: 5.00"
                              min={0}
                              step={0.01}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                          
                          <Form.Item
                            label="Numeración de filas"
                            style={{ margin: 0 }}
                          >
                            <Select
                              value={section.frontRowFirst}
                              onChange={(value) => handleFrontRowFirstChange(section.sectionId, value)}
                              style={{ width: '100%' }}
                            >
                              <Option value={true}>Fila 1 = Más cara (más cerca)</Option>
                              <Option value={false}>Fila 1 = Más barata (más lejos)</Option>
                            </Select>
                          </Form.Item>
                        </>
                      )}

                      {!isNumberedSeats && type === 'concert' && (
                        <Form.Item
                          label={`Capacidad de la pista (máx: ${section.maxCapacity || 'sin límite'})`}
                          style={{ margin: 0 }}
                          required
                          validateStatus={
                            section.customCapacity === '' || 
                            isNaN(parseInt(section.customCapacity)) || 
                            parseInt(section.customCapacity) <= 0 ||
                            (section.maxCapacity && parseInt(section.customCapacity) > section.maxCapacity)
                              ? 'error' 
                              : 'success'
                          }
                          help={
                            section.customCapacity === '' ? 'La capacidad es obligatoria' :
                            isNaN(parseInt(section.customCapacity)) || parseInt(section.customCapacity) <= 0 ? 'Debe ser un número mayor que 0' :
                            (section.maxCapacity && parseInt(section.customCapacity) > section.maxCapacity) ? `No puede exceder ${section.maxCapacity}` :
                            null
                          }
                        >
                          <Input
                            type="number"
                            value={section.customCapacity}
                            onChange={(e) => handleSectionCapacity(section.sectionId, e.target.value)}
                            placeholder={`Máx: ${section.maxCapacity || 'sin límite'}`}
                            min={1}
                            max={section.maxCapacity || undefined}
                            style={{ width: '100%' }}
                            suffix="personas"
                          />
                        </Form.Item>
                      )}
                      
                      <div style={{ 
                        marginTop: '8px', 
                        padding: '8px', 
                        backgroundColor: '#fafafa', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        <Text strong>
                          {isNumberedSeats ? 'Rango de precios: ' : 'Precio: '}
                        </Text>
                        <Text type="success">{calculatePriceRange(section)}</Text>
                        {isNumberedSeats && section.variablePrice > 0 && (
                          <div style={{ marginTop: '4px' }}>
                            <Text type="secondary">
                              Fila más barata: €{(section.basePrice || 0).toFixed(2)} | 
                              Fila más cara: €{Math.round(((((section.basePrice || 0) + (section.variablePrice * (section.rows - 1))) * 100)) / 100).toFixed(2)}
                            </Text>
                          </div>
                        )}
                      </div>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
          
          {sectionPricing.length > 0 && (
            <Alert
              style={{ marginTop: '16px' }}
              message="Resumen general del evento"
              description={
                <div>
                  <p><strong>Rango de precios total:</strong> {getOverallPriceRange()}</p>
                  <p><strong>Capacidad total:</strong> {getTotalCapacity()} asientos</p>
                  <p><strong>Número de secciones:</strong> {sectionPricing.length}</p>
                </div>
              }
              type="success"
              showIcon
            />
          )}
        </Card>
      );
    };

    const ImagePreviewComponent = () => {
      if (!imagePreview) return null;
      
      return (
        <div style={{ marginTop: '16px' }}>
          <Text strong>Vista previa de la imagen:</Text>
          <div style={{ 
            marginTop: '8px',
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            padding: '8px',
            backgroundColor: '#fafafa'
          }}>
            <img 
              src={imagePreview}
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px', 
                borderRadius: '4px',
                objectFit: 'cover'
              }} 
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              {imageFile && (
                <>
                  <div>Nombre: {imageFile.name}</div>
                  <div>Tamaño: {(imageFile.size / 1024).toFixed(2)} KB</div>
                  <div>Tipo: {imageFile.type}</div>
                </>
              )}
            </div>
          </div>
        </div>
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
                            No se encontraron ubicaciones compatibles
                          </div>
                      }
                    >
                      {locationOptions.map((location) => {
                        const seatMapInfo = location.seatMapId ? getSeatMapInfo(location.seatMapId) : null;
                        const hasCompatibleSeatMap = seatMapInfo?.isCompatible !== false;
                        
                        return (
                          <Option key={location._id} value={location._id} disabled={seatMapInfo && !hasCompatibleSeatMap}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ 
                                flex: 1,
                                opacity: seatMapInfo && !hasCompatibleSeatMap ? 0.5 : 1 
                              }}>
                                {location.name}
                              </span>
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
                                {!location.seatMapId && type === 'concert' && (
                                  <Tag 
                                    color="orange" 
                                    size="small" 
                                    style={{ fontSize: '10px', margin: 0 }}
                                  >
                                    Entrada general
                                  </Tag>
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
                            personas
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
                    help="Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB"
                  >
                    <Upload {...uploadProps} listType="picture">
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={uploadLoading}
                        disabled={loading}
                      >
                        {imageFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                      </Button>
                    </Upload>
                    <ImagePreviewComponent />
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
                                {type === 'concert' && 'Los conciertos pueden realizarse en estadios, venues especializados o ubicaciones con entrada general, ofreciendo flexibilidad en el tipo de experiencia.'}
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
                      style={{ backgroundColor: COLORS?.primary?.main || "#1890ff", borderColor: COLORS?.primary?.main || "#1890ff", borderRadius: '6px' }}
                    >
                      Siguiente
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </div>
      </Content>

      {/* Modal de confirmación */}
      <Modal
        title="Confirmar creación del evento"
        open={showConfirmModal}
        onOk={handleConfirmSaveEvent}
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
        width={600}
      >
        {eventDataToSave && (
          <div>
            <Text>¿Estás seguro de que quieres crear el evento con la siguiente configuración?</Text>
            <Divider />
            
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Evento:</Text> {eventDataToSave.name}
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Fecha:</Text> {new Date(eventDataToSave.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Tipo:</Text> {getEventTypeLabel(eventDataToSave.type)}
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Ubicación:</Text> {selectedLocation?.name}
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Capacidad total:</Text> {eventDataToSave.capacity} personas
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <Text strong>Precio{eventDataToSave.usesSectionPricing ? ' desde' : ''}:</Text> €{eventDataToSave.price?.toFixed(2)}
            </div>
            
            {eventDataToSave.usesSectionPricing && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Secciones configuradas:</Text> {eventDataToSave.sectionPricing?.length || 0}
              </div>
            )}
            
            {imageFile && (
              <div style={{ marginBottom: '12px' }}>
                <Text strong>Imagen:</Text> {imageFile.name}
              </div>
            )}
            
            {!selectedLocation?.seatMapId && (
              <Alert
                message="Evento sin mapa de asientos"
                description="Este evento se creará sin configuración de mapa de asientos. Una vez creado, podrás gestionarlo desde la lista de eventos."
                type="info"
                showIcon
                style={{ marginTop: '12px' }}
              />
            )}
            
            {selectedLocation?.seatMapId && (
              <Alert
                message="Configuración de mapa de asientos"
                description="Después de crear el evento, podrás configurar el mapa de asientos y bloquear secciones específicas."
                type="info"
                showIcon
                style={{ marginTop: '12px' }}
              />
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default EventCreation;