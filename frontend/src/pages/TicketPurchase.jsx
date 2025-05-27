import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Layout, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Button, 
  Tag, 
  Space, 
  notification,
  Skeleton,
  Alert,
  Divider,
  Image,
  InputNumber,
  Radio,
  Steps,
  Form,
  Input,
  Modal,
  Statistic
} from "antd";
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  TagOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

import SelectTickets from "./steps/TicketSelection";
import BuyerInfo from "./steps/BuyerInfo";
import PaymentMethod from "./steps/PaymentMethod";
import Confirmation from "./steps/PurchaseConfirmation";

// Importamos el esquema de colores
import { COLORS } from "../components/colorscheme";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const TicketPurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTicketType, setSelectedTicketType] = useState('general');
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  // Estados para manejo de asientos
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  const [userData, setUserData] = useState(null); // datos reales del usuario
  const [useAccountData, setUseAccountData] = useState(false);
  
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  // Precios por tipo de ticket
  const ticketPrices = {
    general: 50000,
    vip: 120000
  };

  const ticketTypes = [
    {
      key: 'general',
      name: 'General',
      price: ticketPrices.general,
      description: 'Acceso general al evento',
      features: ['Acceso al evento', 'Ubicación general']
    },
    {
      key: 'vip',
      name: 'VIP',
      price: ticketPrices.vip,
      description: 'Experiencia premium',
      features: ['Acceso preferencial', 'Mejores ubicaciones', 'Servicio especial', 'Área VIP']
    }
  ];

  useEffect(() => {
    if (!id) {
      setError("No se especificó un ID de evento válido");
      setLoading(false);
      return;
    }

    setLoading(true);
    axios.get(`${gatewayUrl}/events/${id}`)
      .then((res) => {
        const eventData = {
          ...res.data,
          date: dayjs(res.data.date).format("YYYY-MM-DD"),
          image: res.data.image || "/images/default.jpg"
        };
        
        setEvent(eventData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading event details:", err);
        setError("No se pudo cargar la información del evento");
        setLoading(false);
        api.error({
          message: 'Error',
          description: 'No se pudieron cargar los detalles del evento.',
          placement: 'top',
        });
      });
  }, [id, gatewayUrl, api]);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      axios.get(`${gatewayUrl}/users/search`, {
        params: { username }
      }).then(res => {
        setUserData(res.data);
      }).catch(err => {
        console.error("Error fetching user data:", err);
      });
    }
  }, [gatewayUrl]);

  useEffect(() => {
    if (useAccountData && userData) {
      form.setFieldsValue({
        firstName: userData.name || '',
        lastName: '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
    } else {
      form.resetFields(["firstName", "lastName", "email", "phone"]);
    }
  }, [useAccountData, userData, form]);

  useEffect(() => {
    if (!event) return;

    axios.get(`${gatewayUrl}/tickets/occupied/${event._id}`)
      .then(res => {
        if (res.data.success) {
          setOccupiedSeats(res.data.occupiedSeats);
        }
      })
      .catch(err => {
        console.error("Error obteniendo asientos ocupados:", err);
      });
  }, [event]);

  // Función para manejar la selección de asientos
  const handleSeatSelect = (seats) => {
    setSelectedSeats(seats);
    setQuantity(seats.length);
  };

  // Función para verificar si el evento requiere selección de asientos
  const requiresSeatMap = () => {
    if (!event?.type) return false;
    const categoriesWithSeats = ['cinema', 'theater', 'football', 'sports'];
    return categoriesWithSeats.includes(event.type.toLowerCase());
  };

  // Validación teléfono solo números, teléfono opcional
  const validatePhoneNumber = (_, value) => {
    if (!value) return Promise.resolve();
    const regex = /^[0-9]+$/;
    if (regex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('El teléfono solo puede contener números.'));
  };

  const getTotalPrice = () => {
    // Si requiere mapa de asientos, usar el precio de los asientos seleccionados
    if (requiresSeatMap() && selectedSeats.length > 0) {
      return selectedSeats.reduce((total, seat) => total + seat.price, 0);
    }
    // Si no, usar el precio del tipo de ticket por la cantidad
    return ticketPrices[selectedTicketType] * quantity;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Validar según si requiere mapa de asientos o no
      if (requiresSeatMap()) {
        if (selectedSeats.length === 0) {
          api.warning({
            message: 'Selección requerida',
            description: 'Debes seleccionar al menos un asiento.',
            placement: 'top',
          });
          return;
        }
      } else {
        if (quantity < 1 || quantity > 6) {
          api.warning({
            message: 'Cantidad inválida',
            description: 'Debes seleccionar entre 1 y 6 tickets.',
            placement: 'top',
          });
          return;
        }
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      form.validateFields().then(() => {
        setCurrentStep(2);
      }).catch(() => {
        api.warning({
          message: 'Formulario incompleto',
          description: 'Por favor completa todos los campos requeridos.',
          placement: 'top',
        });
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePurchase = async () => {
    try {
        setProcessing(true);
        
        const formData = form.getFieldsValue();
        const username = localStorage.getItem("username");
        
        let userId = null;
        if (username) {
        try {
            const userResponse = await axios.get(`${gatewayUrl}/users/search`, {
            params: { username }
            });
            userId = userResponse.data._id;
        } catch (error) {
            console.error("Error obteniendo datos del usuario:", error);
        }
        }

        const ticketData = {
        userId: userId,
        eventId: id,
        ticketType: selectedTicketType,
        quantity: requiresSeatMap() ? selectedSeats.length : quantity,
        price: requiresSeatMap() ? 
          selectedSeats.reduce((total, seat) => total + seat.price, 0) / selectedSeats.length :
          ticketPrices[selectedTicketType],
        selectedSeats: requiresSeatMap() ? selectedSeats : undefined,
        customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
        },
        paymentInfo: {
            method: 'demo', // En producción: 'stripe', 'paypal', etc.
            transactionId: `TXN-${Date.now()}`
        },
        metadata: {
            ipAddress: '127.0.0.1', // En producción obtendrías la IP real
            userAgent: navigator.userAgent,
            referrer: document.referrer
        }
        };

        const response = await axios.post(`${gatewayUrl}/tickets/purchase`, ticketData);
        
        if (response.data.success) {
        setTicketInfo({
            id: response.data.ticketId,
            eventName: event.name,
            type: selectedTicketType,
            quantity: requiresSeatMap() ? selectedSeats.length : quantity,
            totalPrice: getTotalPrice(),
            purchaseDate: new Date(),
            qrCode: response.data.ticket.qrCode,
            selectedSeats: requiresSeatMap() ? selectedSeats : undefined
        });
        
        setPurchaseComplete(true);
        setCurrentStep(3);
        
        api.success({
            message: 'Compra exitosa',
            description: '¡Tus tickets han sido comprados exitosamente!',
            placement: 'top',
        });
        }
        
    } catch (error) {
        console.error('Error purchasing tickets:', error);
        
        let errorMessage = 'Hubo un problema al procesar tu compra. Por favor intenta nuevamente.';
        
        if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        }
        
        api.error({
        message: 'Error en la compra',
        description: errorMessage,
        placement: 'top',
        });
    } finally {
        setProcessing(false);
    }
    };

  const isEventActive = () => {
    if (!event) return false;
    const eventDate = dayjs(event.date);
    const now = dayjs();
    return eventDate.isAfter(now);
  };

  if (loading) {
    return (
      <Layout style={{ backgroundColor: COLORS.neutral.white, minHeight: "100vh" }}>
        <Content style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Content>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout style={{ backgroundColor: COLORS.neutral.white, minHeight: "100vh" }}>
        <Content style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <Alert
            message="Error"
            description={error || "Evento no encontrado"}
            type="error"
            showIcon
            action={
              <Link to="/">
                <Button size="small" type="primary">
                  Volver al inicio
                </Button>
              </Link>
            }
          />
        </Content>
      </Layout>
    );
  }

  if (!isEventActive()) {
    return (
      <Layout style={{ backgroundColor: COLORS.neutral.white, minHeight: "100vh" }}>
        <Content style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <Alert
            message="Evento no disponible"
            description="Este evento ya ha finalizado o no está disponible para la compra de tickets."
            type="warning"
            showIcon
            action={
              <Link to={`/events/${id}`}>
                <Button size="small" type="primary">
                  Ver detalles del evento
                </Button>
              </Link>
            }
          />
        </Content>
      </Layout>
    );
  }

  const renderStepContent = () => {
  switch (currentStep) {
    case 0:
      return (
        <SelectTickets
          selectedTicketType={selectedTicketType}
          setSelectedTicketType={setSelectedTicketType}
          quantity={quantity}
          setQuantity={setQuantity}
          ticketTypes={ticketTypes}
          formatPrice={formatPrice}
          event={event}
          selectedSeats={selectedSeats}
          onSeatSelect={handleSeatSelect}
          occupiedSeats={occupiedSeats}
        />
      );
    case 1:
      return (
        <BuyerInfo
          form={form}
          useAccountData={useAccountData}
          setUseAccountData={setUseAccountData}
          userData={userData}
          ticketTypes={ticketTypes}
          selectedTicketType={selectedTicketType}
          quantity={quantity}
          formatPrice={formatPrice}
        />
      );
    case 2:
      return (
        <PaymentMethod
          event={event}
          form={form}
          quantity={quantity}
          selectedTicketType={selectedTicketType}
          ticketTypes={ticketTypes}
          formatPrice={formatPrice}
        />
      );
    case 3:
      return (
        <Confirmation
          ticketInfo={ticketInfo}
          event={event}
          form={form}
          quantity={quantity}
          selectedTicketType={selectedTicketType}
          ticketTypes={ticketTypes}
          formatPrice={formatPrice}
          navigate={navigate}
          COLORS={COLORS}
        />
      );
    default:
      return null;
    }
  };

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.white, minHeight: "100vh" }}>
      {contextHolder}
      
      <Content>
        <div style={{ 
          backgroundColor: COLORS.neutral.grey1, 
          padding: '24px 0',
          borderBottom: `1px solid ${COLORS.neutral.grey2}`
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <Link to={`/event/${id}`}>
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />}
                style={{ color: COLORS.primary.main, marginBottom: '16px' }}
              >
                Volver al evento
              </Button>
            </Link>
            
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={4}>
                <Image 
                  src={event.image}
                  alt={event.name}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  preview={false}
                />
              </Col>
              <Col xs={24} sm={20}>
                <Title level={3} style={{ 
                  color: COLORS.neutral.darker, 
                  marginBottom: '4px' 
                }}>
                  {event.name}
                </Title>
                <Space split={<Divider type="vertical" />}>
                  <Text style={{ color: COLORS.neutral.grey4 }}>
                    <CalendarOutlined style={{ marginRight: '4px' }} />
                    {dayjs(event.date).format("DD/MM/YYYY HH:mm")}
                  </Text>
                  <Text style={{ color: COLORS.neutral.grey4 }}>
                    <EnvironmentOutlined style={{ marginRight: '4px' }} />
                    {event.location?.name}
                  </Text>
                </Space>
              </Col>
            </Row>
          </div>
        </div>

        {/* Steps */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 0' }}>
          <Steps
            current={currentStep}
            style={{ marginBottom: '40px' }}
            items={[
              {
                title: 'Seleccionar tickets',
                icon: <TagOutlined />
              },
              {
                title: 'Información',
                icon: <UserOutlined />
              },
              {
                title: 'Pago',
                icon: <CreditCardOutlined />
              },
              {
                title: 'Confirmación',
                icon: <CheckCircleOutlined />
              }
            ]}
          />
        </div>

        {/* Contenido principal */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
          {renderStepContent()}
          
          {/* Botones de navegación */}
          {!purchaseComplete && (
            <div style={{ 
              marginTop: '32px', 
              textAlign: 'center',
              borderTop: `1px solid ${COLORS.neutral.grey2}`,
              paddingTop: '24px'
            }}>
              <Space size={16}>
                {currentStep > 0 && (
                  <Button 
                    size="large"
                    onClick={handlePrevious}
                    disabled={processing}
                  >
                    Anterior
                  </Button>
                )}
                
                {currentStep < 2 && (
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={handleNext}
                    style={{
                      backgroundColor: COLORS.primary.main,
                      borderColor: COLORS.primary.main
                    }}
                  >
                    Siguiente
                  </Button>
                )}
                
                {currentStep === 2 && (
                  <Button 
                    type="primary" 
                    size="large"
                    loading={processing}
                    onClick={handlePurchase}
                    icon={<ShoppingCartOutlined />}
                    style={{
                      backgroundColor: COLORS.primary.main,
                      borderColor: COLORS.primary.main
                    }}
                  >
                    {processing ? 'Procesando...' : 'Procesar pago'}
                  </Button>
                )}
              </Space>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default TicketPurchase;