import React, { useState, useEffect } from 'react';
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
  Upload,
  Table,
  Popconfirm,
  InputNumber
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
  CloseCircleOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  LockOutlined,
  EuroOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { COLORS } from "../../components/colorscheme";
import ImageCropperModal from "../../components/ImageCropperModal";
import FramedImage from "../../components/FramedImage";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

/**
 * Optimized component for row pricing table
 * @param {Object} props - Component props
 * @param {Object} props.section - Section data with pricing information
 * @param {Function} props.updateRowPrice - Function to update row price
 * @param {Function} props.removeRowPrice - Function to remove row price
 * @param {Function} props.addRowPrice - Function to add new row price
 * @returns {JSX.Element} Row pricing table component
 */
const RowPricingTable = React.memo(({ section, updateRowPrice, removeRowPrice, addRowPrice }) => {
  const columns = [
    {
      title: 'Fila',
      dataIndex: 'row',
      key: 'row',
      width: 80,
      render: (text, record, index) => (
        <InputNumber
          min={1}
          max={section.rows}
          value={text}
          onChange={(value) => updateRowPrice(section.sectionId, index, 'row', value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Precio (€)',
      dataIndex: 'price',
      key: 'price',
      render: (text, record, index) => (
        <InputNumber
          min={0}
          step={0.01}
          value={text}
          onChange={(value) => updateRowPrice(section.sectionId, index, 'price', value)}
          style={{ width: '100%' }}
          prefix="€"
        />
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 80,
      render: (_, record, index) => (
        <Popconfirm
          title="¿Eliminar este precio por fila?"
          onConfirm={() => removeRowPrice(section.sectionId, index)}
          okText="Sí"
          cancelText="No"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            size="small"
          />
        </Popconfirm>
      )
    }
  ];

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <Text strong>Precios específicos por fila:</Text>
        <Button 
          type="dashed" 
          size="small" 
          icon={<PlusOutlined />}
          onClick={() => addRowPrice(section.sectionId)}
        >
          Añadir fila
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={section.rowPricing || []}
        pagination={false}
        size="small"
        rowKey={(record, index) => index}
        locale={{
          emptyText: 'No hay precios específicos por fila configurados'
        }}
      />
    </div>
  );
});

/**
 * Event creation component for administrators
 * Handles event creation with location, pricing, and image management
 * @returns {JSX.Element} Event creation form component
 */
const EventCreation = () => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [seatMaps, setSeatMaps] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
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
  const [uploadLoading] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [eventDataToSave, setEventDataToSave] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const [showConflictModal, setShowConflictModal] = useState(false);
  const [, setConflictEventInfo] = useState(null);

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Obtener el ID del usuario actual
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

  /**
   * Determines automatic event state based on date
   * @param {string|Date} date - Event date
   * @returns {string} Event state ('activo', 'proximo', 'finalizado')
   */
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

  /**
   * Handles section capacity updates
   * @param {string} sectionId - Section identifier
   * @param {string|number} newCapacity - New capacity value
   */
  const handleSectionCapacity = (sectionId, newCapacity) => {
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
  };

  /**
   * Handles section default price updates
   * @param {string} sectionId - Section identifier
   * @param {string|number} newPrice - New price value
   */
  const handleSectionDefaultPrice = (sectionId, newPrice) => {
    setSectionPricing(prevPricing => 
      prevPricing.map(section => 
        section.sectionId === sectionId 
          ? { 
              ...section, 
              defaultPrice: newPrice === '' ? '' : Math.round((parseFloat(newPrice) || 0) * 100) / 100 
            }
          : section
      )
    );
  };

  /**
   * Adds a new row price entry for a section
   * @param {string} sectionId - Section identifier
   */
  const addRowPrice = (sectionId) => {
    setSectionPricing(prevPricing => 
      prevPricing.map(section => 
        section.sectionId === sectionId 
          ? { 
              ...section, 
              rowPricing: [
                ...(section.rowPricing || []),
                { row: 1, price: 0 }
              ]
            }
          : section
      )
    );
  };

  const removeRowPrice = (sectionId, index) => {
    setSectionPricing(prevPricing => 
      prevPricing.map(section => 
        section.sectionId === sectionId 
          ? { 
              ...section, 
              rowPricing: section.rowPricing.filter((_, i) => i !== index)
            }
          : section
      )
    );
  };

  const updateRowPrice = (sectionId, index, field, value) => {
    setSectionPricing(prevPricing => 
      prevPricing.map(section => 
        section.sectionId === sectionId 
          ? { 
              ...section, 
              rowPricing: section.rowPricing.map((rowPrice, i) => 
                i === index 
                  ? { ...rowPrice, [field]: value }
                  : rowPrice
              )
            }
          : section
      )
    );
  };

  const getCapacityFromSeatMap = async (seatMapId) => {
    try {
      const response = await axios.get(`${gatewayUrl}/seatmaps/${seatMapId}`);
      const seatMap = response.data;
      
      if (seatMap.sections && seatMap.sections.length > 0) {
        const totalCapacity = seatMap.sections.reduce((total, section) => {
          if (section.hasNumberedSeats === false) {
            // Para secciones sin asientos numerados (como pistas), usar totalCapacity
            return total + (section.totalCapacity || section.capacity || 0);
          } else {
            // Para secciones con asientos numerados, calcular filas * asientos por fila
            return total + (section.rows * section.seatsPerRow);
          }
        }, 0);
        
        return totalCapacity;
      }
      
      return 0;
    } catch (error) {
      console.error("Error obteniendo capacidad del seatmap:", error);
      return 0;
    }
  };

  const handleLocationChange = async (locationId) => {
    const location = locations.find(loc => loc._id === locationId);
    setSelectedLocation(location);
    
    if (location && location.seatMapId) {
      await fetchLocationSections(locationId);
      const capacity = await getCapacityFromSeatMap(location.seatMapId);
      // Store the seatmap capacity in the location object for validation
      location.seatMapCapacity = capacity;
      form.setFieldsValue({ capacity: capacity });
      setIsCapacityLocked(true);
    } else {
      setLocationSections([]);
      setSectionPricing([]);
      setUsesSectionPricing(false);
      setUsesRowPricing(false);
      form.setFieldsValue({ capacity: undefined });
      setIsCapacityLocked(false);
    }
  };

  const handleTypeChange = (value) => {
    setType(value);
    setSelectedLocation(null);
    setLocationSections([]);
    setSectionPricing([]);
    setUsesSectionPricing(false);
    setUsesRowPricing(false);
    form.setFieldsValue({ 
      location: undefined, 
      capacity: undefined,
      price: undefined 
    });
    setIsCapacityLocked(false);
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
        
        // Inicializar pricing por secciones con defaultPrice y rowPricing
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
          defaultPrice: '',
          rowPricing: [],
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
      
      // Validaciones adicionales
      if (!file.type.startsWith('image/')) {
        message.error('Solo se permiten archivos de imagen');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        message.error('La imagen no puede ser mayor a 5MB');
        return;
      }
      
      // Abrir recorte con preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropSrc(e.target.result);
        setIsCropOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Función no utilizada - comentada para evitar warnings de linting
  // const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  //   return new Promise((resolve) => {
  //     const canvas = document.createElement('canvas');
  //     const ctx = canvas.getContext('2d');
  //     const img = new Image();
      
  //     img.onload = () => {
  //       // Calcular nuevas dimensiones manteniendo proporción
  //       let { width, height } = img;
        
  //       if (width > height) {
  //         if (width > maxWidth) {
  //           height = (height * maxWidth) / width;
  //           width = maxWidth;
  //         }
  //       } else {
  //         if (height > maxHeight) {
  //           width = (width * maxHeight) / height;
  //           height = maxHeight;
  //         }
  //       }
        
  //       canvas.width = width;
  //       canvas.height = height;
        
  //       // Dibujar imagen redimensionada
  //       ctx.drawImage(img, 0, 0, width, height);
        
  //       // Convertir a blob
  //       canvas.toBlob(resolve, file.type, quality);
  //     };
      
  //     img.src = URL.createObjectURL(file);
  //   });
  // };

  // Transforma la imagen a un lienzo fijo (contain) para que se vea entera en un marco 16:9
  const processImageToFixedCanvas = (file, targetWidth = 1280, targetHeight = 720, background = '#111', quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Escalar modo contain
        const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
        const drawWidth = Math.round(img.width * scale);
        const drawHeight = Math.round(img.height * scale);
        const offsetX = Math.floor((targetWidth - drawWidth) / 2);
        const offsetY = Math.floor((targetHeight - drawHeight) / 2);

        // Fondo del marco
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        // Imagen centrada y escalada
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Mantener el tipo original si es posible
        const mimeType = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
        canvas.toBlob(resolve, mimeType, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const convertFileToBase64 = async (file) => {
    try {
      // Normalizar SIEMPRE la imagen a un marco fijo 16:9 para mantener dimensiones uniformes
      // Elegimos 1280x720 para buena calidad; se puede ajustar si prefieres otro tamaño.
      const processedFile = await processImageToFixedCanvas(file, 1280, 720, '#111', 0.8);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result.split(',')[1];
          resolve({
            data: base64String,
            contentType: processedFile.type || file.type,
            filename: file.name,
            size: processedFile.size || file.size
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(processedFile);
      });
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  const handleConfirmSaveEvent = async () => {
    setSaving(true);
    
    try {
      // Crear el evento (solo para eventos sin seatmap)
      await axios.post(`${gatewayUrl}/events`, eventDataToSave);
      
      message.success('Evento creado correctamente');
      setShowConfirmModal(false);

      // Navegar a la lista de eventos (eventos sin seatmap)
      navigate('/admin');
      
    } catch (error) {
      
      if (error.response) {
        console.error('Server error:', error.response.data);
        if (error.response?.data?.error?.includes("Ya existe un evento en esta ubicación")) {
          setConflictEventInfo(error.response.data.conflictEvent);
          setShowConflictModal(true);
          setShowConfirmModal(false);
          setSaving(false);
          return;
        }
        else {
          setErrorMessage(`Error del servidor: ${error.response.data.error || error.response.statusText}`);
        }
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

  /**
   * Handles form submission for event creation
   * @param {Object} values - Form values from the event creation form
   */
  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    
    // Usar selectedLocation directamente ya que tiene toda la información
    const locationObj = selectedLocation;
    
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
        const hasInvalidDefaultPrices = sectionPricing.some(section => 
          section.defaultPrice === '' || section.defaultPrice === null || section.defaultPrice === undefined || 
          isNaN(parseFloat(section.defaultPrice)) || parseFloat(section.defaultPrice) < 0
        );

        const hasInvalidRowPricing = sectionPricing.some(section => {
          if (!section.rowPricing || section.rowPricing.length === 0) return false;
          
          return section.rowPricing.some(rowPrice => 
            rowPrice.row === undefined || rowPrice.row === null || rowPrice.row === '' ||
            rowPrice.price === undefined || rowPrice.price === null || rowPrice.price === '' ||
            isNaN(parseInt(rowPrice.row)) || parseInt(rowPrice.row) <= 0 ||
            isNaN(parseFloat(rowPrice.price)) || parseFloat(rowPrice.price) < 0
          );
        });

        const hasDuplicateRows = sectionPricing.some(section => {
          if (!section.rowPricing || section.rowPricing.length === 0) return false;
          
          const rows = section.rowPricing.map(rp => rp.row);
          return new Set(rows).size !== rows.length;
        });
        
        const hasInvalidCapacities = values.type === 'concert' && sectionPricing.some(section => 
          !section.hasNumberedSeats && (
            section.customCapacity === '' || section.customCapacity === null || section.customCapacity === undefined ||
            isNaN(parseInt(section.customCapacity)) || parseInt(section.customCapacity) <= 0 ||
            (section.maxCapacity && parseInt(section.customCapacity) > section.maxCapacity)
          )
        );

        // Validar que la capacidad total no exceda la capacidad del seatmap
        const totalCapacity = sectionPricing.reduce((total, section) => {
          if (!section.hasNumberedSeats && values.type === 'concert') {
            return total + (parseInt(section.customCapacity) || 0);
          }
          return total + (section.capacity || 0);
        }, 0);

        const seatMapCapacity = await getCapacityFromSeatMap(selectedLocation?.seatMapId);
        const exceedsSeatMapCapacity = seatMapCapacity > 0 && totalCapacity > seatMapCapacity;

        if (hasInvalidDefaultPrices || hasInvalidRowPricing || hasDuplicateRows || hasInvalidCapacities || exceedsSeatMapCapacity) {
          let errorMsg = '';
          if (hasInvalidDefaultPrices) {
            errorMsg += 'Todos los precios por defecto deben ser números válidos y mayores o iguales a 0. ';
          }
          if (hasInvalidRowPricing) {
            errorMsg += 'Todos los precios por fila deben tener números de fila válidos y precios mayores o iguales a 0. ';
          }
          if (hasDuplicateRows) {
            errorMsg += 'No puede haber filas duplicadas en la configuración de precios por fila. ';
          }
          if (hasInvalidCapacities) {
            errorMsg += 'Para conciertos con pistas, debe especificar una capacidad válida dentro del límite máximo. ';
          }
          if (exceedsSeatMapCapacity) {
            errorMsg += `La capacidad total (${totalCapacity}) no puede exceder la capacidad del mapa de asientos (${seatMapCapacity}). `;
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
          defaultPrice: Math.round((parseFloat(section.defaultPrice) || 0) * 100) / 100,
          rowPricing: (section.rowPricing || []).map(rowPrice => ({
            row: parseInt(rowPrice.row),
            price: Math.round((parseFloat(rowPrice.price) || 0) * 100) / 100
          }))
        }));
        
        console.log('EventCreation - Section pricing prepared:', eventData.sectionPricing);

        // Capacidad se calcula automáticamente en el backend
        eventData.capacity = sectionPricing.reduce((total, section) => {
          if (!section.hasNumberedSeats && values.type === 'concert') {
            return total + (parseInt(section.customCapacity) || 0);
          }
          return total + (section.capacity || 0);
        }, 0);

        // El precio base será el mínimo de todas las secciones (redondeado)
        const allPrices = sectionPricing.flatMap(section => {
          const prices = [section.defaultPrice || 0];
          if (section.rowPricing) {
            prices.push(...section.rowPricing.map(rp => rp.price || 0));
          }
          return prices;
        });
        eventData.price = Math.round((Math.min(...allPrices) * 100)) / 100;
        
      } else {
        // Pricing tradicional
        if (!values.price || !values.capacity) {
          setErrorMessage('El precio y la capacidad son obligatorios cuando no hay pricing por secciones');
          setLoading(false);
          return;
        }

        // Validar que la capacidad no exceda la capacidad de la ubicación
        const locationCapacity = selectedLocation?.capacity || 0;
        const requestedCapacity = parseInt(values.capacity);
        
        if (locationCapacity > 0 && requestedCapacity > locationCapacity) {
          setErrorMessage(`La capacidad solicitada (${requestedCapacity}) no puede exceder la capacidad de la ubicación (${locationCapacity})`);
          setLoading(false);
          return;
        }
        
        eventData.usesSectionPricing = false;
        eventData.usesRowPricing = false;
        eventData.capacity = requestedCapacity;
        eventData.price = parseFloat(values.price);
      }

      eventData.createdBy = currentUserId || 'Anonymous admin';

      console.log('Event data prepared:', eventData);
      console.log('LocationObj:', locationObj);
      console.log('LocationObj.seatMapId:', locationObj?.seatMapId);
      console.log('Condition check:', locationObj && locationObj.seatMapId);

      if (imageFile) {
        try {
          console.log('Procesando imagen...');
          const imageData = await convertFileToBase64(imageFile);
          eventData.imageData = imageData;
          console.log('Imagen procesada, tamaño final:', imageData.size);
        } catch (error) {
          console.error('Error al procesar imagen:', error);
          message.warning('Error al procesar la imagen, el evento se creará sin imagen');
        }
      }
      
      if (locationObj && locationObj.seatMapId) {
        // Si tiene seatmap, crear el evento directamente y redirigir a configuración
        try {
          console.log('Creating event with seatmap, redirecting to configuration...');
          
          // Crear el evento
          const createEventResponse = await axios.post(`${gatewayUrl}/events`, eventData);
          const createdEvent = createEventResponse.data;
          
          // Redirigir a la página de configuración del seatmap
          navigate('/admin/event-seatmap-config', { 
            state: { 
              eventData: {
                ...eventData,
                _id: createdEvent._id,
                imagePath: createdEvent.image
              },
              selectedLocation: locationObj
            } 
          });
        } catch (error) {
          console.error('Error creando evento:', error);

          if (error.response) {
            console.error('Server error:', error.response.data);
            if (error.response?.data?.error?.includes("Ya existe un evento en esta ubicación")) {
              setConflictEventInfo(error.response.data.conflictEvent);
              setShowConflictModal(true);
              setShowConfirmModal(false);
              return;
            }
            else if (error.response?.status === 413) {
              message.error('La imagen es demasiado grande. Intenta con una imagen más pequeña.');
            }
            else {
              setErrorMessage(`Error del servidor: ${error.response.data.error || error.response.statusText}`);
            }
          } else if (error.request) {
            console.error('Network error:', error.request);
            setErrorMessage('Error de conexión. Verifica tu conexión a internet.');
          } else {
            console.error('Error:', error.message);
            setErrorMessage('Hubo un error al crear el evento');
          }
          
        } finally {
          setLoading(false);
        }
      } else {
        // Si no tiene seatmap, mostrar modal de confirmación
        setEventDataToSave(eventData);
        setShowConfirmModal(true);
      }
      
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
    if (date) {
      const autoState = getAutoState(date);
      form.setFieldsValue({ state: autoState });
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Solo puedes subir archivos de imagen!');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('La imagen debe ser menor a 5MB!');
        return false;
      }
      
      // Advertir si la imagen es muy grande
      if (file.size > 500 * 1024) {
        message.info('Imagen grande detectada, se optimizará automáticamente');
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

  const renderSectionPricing = () => {
    if (!usesSectionPricing || locationSections.length === 0) return null;

    const calculatePriceRange = (section) => {
      const defaultPrice = parseFloat(section.defaultPrice) || 0;
      
      if (defaultPrice <= 0) {
        return 'Precio no configurado';
      }
      
      if (!section.hasNumberedSeats) {
        return `€${defaultPrice.toFixed(2)}`;
      }
      
      if (!section.rowPricing || section.rowPricing.length === 0) {
        return `€${defaultPrice.toFixed(2)} (por defecto)`;
      }
      
      const prices = section.rowPricing.map(rp => parseFloat(rp.price) || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
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
        !isNaN(parseFloat(section.defaultPrice)) && parseFloat(section.defaultPrice) >= 0
      );
      
      if (validSections.length === 0) return 'Precios no configurados';
      
      let minPrice = Infinity;
      let maxPrice = 0;
      
      validSections.forEach(section => {
        const defaultPrice = parseFloat(section.defaultPrice) || 0;
        
        if (section.rowPricing && section.rowPricing.length > 0) {
          const prices = section.rowPricing.map(rp => parseFloat(rp.price) || 0);
          const sectionMin = Math.min(...prices);
          const sectionMax = Math.max(...prices);
          
          minPrice = Math.min(minPrice, sectionMin);
          maxPrice = Math.max(maxPrice, sectionMax);
        } else {
          minPrice = Math.min(minPrice, defaultPrice);
          maxPrice = Math.max(maxPrice, defaultPrice);
        }
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
          description="Esta ubicación tiene un mapa de asientos con secciones y filas definidas. Configure el precio por defecto y los precios específicos por fila para cada sección."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
        <Card 
          size="small" 
          style={{ 
            marginBottom: '16px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #91d5ff'
          }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong style={{ color: '#1890ff' }}>
              <InfoCircleOutlined style={{ marginRight: '8px' }} />
              ¿Cómo funciona el sistema de precios por filas?
            </Text>
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              <p><strong>1. Precio por defecto:</strong> Establece un precio base para todas las filas de la sección.</p>
              <p><strong>2. Precios específicos por fila:</strong> Añade filas individuales con precios personalizados. Las filas que no configures mantendrán el precio por defecto.</p>
              <p><strong>3. Ejemplo:</strong> Si tienes 10 filas con precio por defecto de €25, y configuras la Fila 1 a €50, entonces: Fila 1 = €50, Filas 2-10 = €25.</p>
              <p><strong>4. Ventaja:</strong> Puedes crear precios premium para las mejores ubicaciones sin configurar todas las filas.</p>
            </div>
          </Space>
        </Card>
        
        <Row gutter={[16, 16]}>
          {sectionPricing.map((section, index) => {
            const locationSection = locationSections.find(ls => ls.sectionId === section.sectionId);
            const isNumberedSeats = section.hasNumberedSeats !== false;
            
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
                      label={isNumberedSeats ? "Precio por defecto (filas no configuradas)" : "Precio único"}
                      style={{ margin: 0 }}
                      required
                      validateStatus={
                        section.defaultPrice === '' || 
                        isNaN(parseFloat(section.defaultPrice)) || 
                        parseFloat(section.defaultPrice) < 0 
                          ? 'error' 
                          : 'success'
                      }
                      help={
                        section.defaultPrice === '' ? 'El precio por defecto es obligatorio' :
                        isNaN(parseFloat(section.defaultPrice)) || parseFloat(section.defaultPrice) < 0 ? 'Debe ser un precio mayor o igual a 0' :
                        null
                      }
                    >
                      <Input
                        type="number"
                        value={section.defaultPrice || 0}
                        onChange={(e) => handleSectionDefaultPrice(section.sectionId, e.target.value)}
                        prefix={<EuroOutlined />}
                        placeholder="Ej: 25"
                        min={0}
                        step={0.01}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    {isNumberedSeats && (
                      <>
                        <RowPricingTable 
                          section={section} 
                          updateRowPrice={updateRowPrice}
                          removeRowPrice={removeRowPrice}
                          addRowPrice={addRowPrice}
                        />
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
                      {isNumberedSeats && section.rowPricing && section.rowPricing.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <Text type="secondary">
                            Filas configuradas: {section.rowPricing.length} de {section.rows} | 
                            Precio por defecto: €{(section.defaultPrice || 0).toFixed(2)}
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
          <Card 
            size="small" 
            style={{ 
              marginTop: '16px',
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f'
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Capacidad total:</strong> {getTotalCapacity()} asientos</p>
                <p><strong>Rango de precios:</strong> {getOverallPriceRange()}</p>
                {selectedLocation?.seatMapId && (
                  <p style={{ 
                    color: getTotalCapacity() > (selectedLocation.seatMapCapacity || 0) ? '#ff4d4f' : '#52c41a',
                    fontWeight: 'bold'
                  }}>
                    Capacidad del seatmap: {selectedLocation.seatMapCapacity || 'No disponible'}
                  </p>
                )}
              </Col>
              <Col span={12}>
                <p><strong>Número de secciones:</strong> {sectionPricing.length}</p>
                <p><strong>Secciones con precios por fila:</strong> {sectionPricing.filter(s => s.rowPricing && s.rowPricing.length > 0).length}</p>
              </Col>
            </Row>
          </Card>
        )}
      </Card>
    );
  };

  const renderImagePreview = () => {
    if (!imagePreview) return null;
    
    return (
      <Card 
        title={
          <Space>
            <UploadOutlined style={{ color: COLORS?.primary?.main || '#1890ff' }} />
            Vista previa de la imagen
          </Space>
        }
        style={{ 
          marginBottom: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.07)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: '100%', margin: '0 auto' }}>
            <FramedImage 
              src={imagePreview}
              alt="Preview"
              backgroundColor={COLORS.neutral.grey1}
              borderRadius={8}
              aspectRatio={16/9}
              maxHeight={220}
            />
          </div>
          <div style={{ marginTop: '8px' }}>
            <Text type="secondary">
              {imageFile?.name} ({(imageFile?.size / 1024 / 1024).toFixed(2)} MB)
            </Text>
          </div>
        </div>
      </Card>
    );
  };

  const onCropComplete = async (blob) => {
    // blob -> File para seguir flujo actual
    const fileFromBlob = new File([blob], imageFile?.name || 'cropped.jpg', { type: blob.type || 'image/jpeg' });
    setImageFile(fileFromBlob);
    setIsCropOpen(false);
    // Mostrar preview recortada
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(fileFromBlob);
  };

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.grey1, minHeight: "100vh" }}>
      <Content style={{ padding: isMobile ? "18px 4px" : "40px 20px" }}>
        <div style={{
          maxWidth: isMobile ? "100%" : "1200px",
          margin: "0 auto",
          overflowX: isMobile ? "auto" : undefined,
          WebkitOverflowScrolling: isMobile ? "touch" : undefined
        }}>
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
              {renderSectionPricing()}

              {/* Pricing tradicional - solo se muestra si no hay secciones */}
              {!usesSectionPricing && (
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Capacidad"
                      name="capacity"
                      rules={[
                        { required: true, message: 'Por favor ingrese la capacidad' },
                        { type: 'number', min: 1, message: 'La capacidad debe ser al menos 1', transform: (value) => Number(value) },
                        {
                          validator: (_, value) => {
                            if (!value || !selectedLocation) return Promise.resolve();
                            const locationCapacity = selectedLocation.capacity || 0;
                            if (locationCapacity > 0 && parseInt(value) > locationCapacity) {
                              return Promise.reject(`La capacidad no puede exceder ${locationCapacity} (capacidad de la ubicación)`);
                            }
                            return Promise.resolve();
                          }
                        }
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
                    {selectedLocation && selectedLocation.capacity > 0 && !isCapacityLocked && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: COLORS?.neutral?.grey4 || '#8c8c8c',
                        marginTop: '-8px',
                        marginBottom: '16px'
                      }}>
                        Capacidad máxima de la ubicación: {selectedLocation.capacity} personas
                      </div>
                    )}
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
                    {renderImagePreview()}
                    <ImageCropperModal
                      open={isCropOpen}
                      src={cropSrc}
                      onCancel={() => setIsCropOpen(false)}
                      onComplete={onCropComplete}
                      aspect={16/9}
                    />
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
        okText="Crear evento"
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
            
            <Alert
              message="Evento sin mapa de asientos"
              description="Este evento se creará sin configuración de mapa de asientos. Una vez creado, podrás gestionarlo desde la lista de eventos."
              type="info"
              showIcon
              style={{ marginTop: '12px' }}
            />
          </div>
        )}
      </Modal>

      <Modal
        title="Conflicto de horarios"
        open={showConflictModal}
        onOk={() => setShowConflictModal(false)}
        onCancel={() => setShowConflictModal(false)}
        okText="Entendido"
        cancelButtonProps={{ style: { display: 'none' } }}
        width={500}
      >
        <div>
          <p>Ya existe un evento en esta ubicación con menos de 24 horas de diferencia.</p>
          <p style={{ marginTop: '12px', color: '#666' }}>
            Por favor, selecciona una fecha diferente o una ubicación distinta.
          </p>
        </div>
      </Modal>
    </Layout>
  );
};

export default EventCreation;