import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Layout, 
  Typography,
  Row, 
  Col, 
  Button,
  Space, 
  notification,
  Skeleton,
  Alert,
  Steps,
  Form
} from "antd";
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  ArrowLeftOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  UserOutlined,
  TagOutlined
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

import SelectTickets from "./steps/TicketSelection";
import BuyerInfo from "./steps/BuyerInfo";
import PaymentMethod from "./steps/PaymentMethod";
import Confirmation from "./steps/PurchaseConfirmation";

import { COLORS } from "../components/colorscheme";

const { Content } = Layout;
const { Title, Text} = Typography;

/**
 * Ticket purchase page component with multi-step checkout process
 * @returns {JSX.Element} Multi-step ticket purchase flow
 */
const TicketPurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  // Estados para manejo de asientos con persistencia
  const [selectedSeats, setSelectedSeats] = useState(() => {
    // Intentar recuperar del sessionStorage al inicializar
    const saved = sessionStorage.getItem(`selectedSeats_${id}`);
    const timestamp = sessionStorage.getItem(`selectedSeats_${id}_timestamp`);

    // Verificar si han pasado más de 1 hora
    if (saved && timestamp) {
      const oneHourInMs = 60 * 60 * 1000;
      const elapsed = Date.now() - parseInt(timestamp, 10);

      if (elapsed > oneHourInMs) {
        // Limpiar cache si ha pasado más de 1 hora
        sessionStorage.removeItem(`selectedSeats_${id}`);
        sessionStorage.removeItem(`selectedSeats_${id}_timestamp`);
        return [];
      }
      return JSON.parse(saved);
    }
    return saved ? JSON.parse(saved) : [];
  });
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  // Inicializar quantity basado en los asientos guardados
  const [quantity, setQuantity] = useState(() => {
    const saved = sessionStorage.getItem(`selectedSeats_${id}`);
    const timestamp = sessionStorage.getItem(`selectedSeats_${id}_timestamp`);

    if (saved && timestamp) {
      const oneHourInMs = 60 * 60 * 1000;
      const elapsed = Date.now() - parseInt(timestamp, 10);

      if (elapsed > oneHourInMs) {
        sessionStorage.removeItem(`selectedSeats_${id}`);
        sessionStorage.removeItem(`selectedSeats_${id}_timestamp`);
        return 1;
      }

      const seats = JSON.parse(saved);
      return seats.length > 0 ? seats.length : 1;
    }
    return 1;
  });

  const [userData, setUserData] = useState(null); // datos reales del usuario
  const [useAccountData, setUseAccountData] = useState(false);
  
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

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
          image: res.data.imageUrl || res.data.image || "/event-images/default.jpg",
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

  // Limpiar sessionStorage cuando se completa la compra
  useEffect(() => {
    if (purchaseComplete) {
      sessionStorage.removeItem(`selectedSeats_${id}`);
      sessionStorage.removeItem(`selectedSeats_${id}_timestamp`);
    }
  }, [id, purchaseComplete]);

  // Limpiar sessionStorage si el usuario sale de la compra del evento
  useEffect(() => {
    return () => {
      // Se ejecuta cuando el componente se desmonta
      if (!purchaseComplete) {
        sessionStorage.removeItem(`selectedSeats_${id}`);
        sessionStorage.removeItem(`selectedSeats_${id}_timestamp`);
      }
    };
  }, [id, purchaseComplete]);

  // Escuchar cambios en la autenticación y limpiar cache si se cierra sesión
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // El usuario cerró sesión, limpiar todos los asientos guardados
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('selectedSeats_')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Limpieza automática después de 1 hora
  useEffect(() => {
    const timestamp = sessionStorage.getItem(`selectedSeats_${id}_timestamp`);
    if (timestamp) {
      const oneHourInMs = 60 * 60 * 1000;
      const elapsed = Date.now() - parseInt(timestamp, 10);
      const remaining = oneHourInMs - elapsed;

      if (remaining > 0) {
        const timerId = setTimeout(() => {
          sessionStorage.removeItem(`selectedSeats_${id}`);
          sessionStorage.removeItem(`selectedSeats_${id}_timestamp`);
          setSelectedSeats([]);
          setQuantity(1);
        }, remaining);

        return () => clearTimeout(timerId);
      }
    }
  }, [id]);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if (username && token) {
      axios.get(`${gatewayUrl}/users/search`, {
        params: { username },
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        lastName: userData.surname || '',
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
  }, [event, gatewayUrl]);

  // Función para manejar la selección de asientos con persistencia
  const handleSeatSelect = (seats) => {
    setSelectedSeats(seats);
    setQuantity(seats.length);
    // Guardar en sessionStorage con timestamp para mantener la selección entre navegaciones
    sessionStorage.setItem(`selectedSeats_${id}`, JSON.stringify(seats));
    sessionStorage.setItem(`selectedSeats_${id}_timestamp`, String(Date.now()));
  };

  const requiresSeatMap = () => {
    if (!event?.type) return false;
    
    // Si el evento tiene seatMapId configurado, requiere mapa
    if (event?.location?.seatMapId) return true;
    
    // Los conciertos pueden tener o no mapa según la configuración
    if (event.type.toLowerCase() === 'concert' || event.type.toLowerCase() === 'concierto') {
      return !!event?.location?.seatMapId;
    }
    
    // Otros tipos que siempre requieren mapa
    const eventToSeatMapType = {
      'cinema': 'cinema',
      'theater': 'theater', 
      'theatre': 'theater',
      'football': 'football',
      'soccer': 'football',
      'sports': 'football',
      'stadium': 'football'
    };
    
    return Object.keys(eventToSeatMapType).includes(event.type.toLowerCase());
  };


  const getTotalPrice = () => {
    // Si requiere mapa de asientos Y hay asientos seleccionados, usar el precio de los asientos
    if (requiresSeatMap() && selectedSeats.length > 0) {
      return selectedSeats.reduce((total, seat) => total + seat.price, 0);
    }
    
    // Si no requiere mapa de asientos O no hay asientos seleccionados, usar precio del evento
    return event?.price * quantity || 0;
  };



  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'EUR'
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
        // Permitir múltiples asientos de pista
        if (selectedSeats.length > 6) {
          api.warning({
            message: 'Límite excedido',
            description: 'Puedes seleccionar máximo 6 asientos.',
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



  const isEventActive = () => {
    if (!event) return false;
    const eventDate = dayjs(event.date);
    const now = dayjs();
    return eventDate.isAfter(now);
  };

  const handlePayPalSuccess = async (paypalDetails, paypalData) => {
    try {
      setProcessing(true);
      
      const formData = form.getFieldsValue();
      const username = localStorage.getItem("username");
      
      let userId = null;
      const token = localStorage.getItem('token');
      if (username && token) {
        try {
          const userResponse = await axios.get(`${gatewayUrl}/users/search`, {
            params: { username },
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          userId = userResponse.data._id;
        } catch (error) {
          console.error("Error obteniendo datos del usuario:", error);
        }
      }

      const usesSpecificSeats = requiresSeatMap() && selectedSeats.length > 0;
      
      const finalQuantity = usesSpecificSeats ? selectedSeats.length : quantity;
      const totalPrice = getTotalPrice();
      const unitPrice = totalPrice / finalQuantity;

      // Preparar selectedSeats - siempre se envía
      let validSelectedSeats = [];
      
      if (usesSpecificSeats && selectedSeats.length > 0) {
        validSelectedSeats = selectedSeats.map(seat => {
          if (seat.seat !== undefined && seat.row !== undefined && 
              seat.seat !== null && seat.row !== null) {
            return seat;
          } else {
            return {
              ...seat,
              row: null,
              seat: null
            };
          }
        });
      }

              const ticketData = {
          userId: userId,
          eventId: id,
          quantity: finalQuantity,
          price: unitPrice,
          totalPrice: totalPrice,
          selectedSeats: validSelectedSeats,
          usesSpecificSeats: usesSpecificSeats,
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
          },
          // Información de PayPal para referencia
          paymentInfo: {
            paypalOrderId: paypalData.orderID,
            paypalPayerId: paypalDetails.payer.payer_id,
            paypalTransactionId: paypalDetails.purchase_units[0].payments.captures[0].id,
            paymentMethod: 'paypal',
            paymentStatus: 'completed'
          }
        };

      console.log('Enviando datos del ticket con PayPal:', ticketData);

      const response = await axios.post(`${gatewayUrl}/tickets/purchase`, ticketData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setTicketInfo({
           id: response.data.ticketId,
           ticketId: response.data.ticketId,
           ticket: response.data.ticket,
           eventName: event.name,
           quantity: finalQuantity,
           unitPrice: unitPrice,
           totalPrice: totalPrice,
           purchaseDate: new Date(),
           qrCode: response.data.ticket.qrCode,
           selectedSeats: validSelectedSeats,
           usesSpecificSeats: usesSpecificSeats,
           paymentInfo: ticketData.paymentInfo
         });
        
        setPurchaseComplete(true);
        setCurrentStep(3);
        
        api.success({
          message: 'Compra exitosa',
          description: '¡Tus tickets han sido comprados exitosamente con PayPal!',
          placement: 'top',
        });
      }
      
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      
      let errorMessage = 'Hubo un problema al procesar tu compra. Por favor intenta nuevamente.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details;
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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
              <Link to={`/event/${id}`}>
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
             quantity={quantity}
             setQuantity={setQuantity}
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
             quantity={quantity}
             formatPrice={formatPrice}
             event={event}
             getTotalPrice={getTotalPrice}
             selectedSeats={selectedSeats}
             requiresSeatMap={requiresSeatMap}
           />
        );
      case 2:
        return (
                     <PaymentMethod
             event={event}
             form={form}
             quantity={quantity}
             formatPrice={formatPrice}
             getTotalPrice={getTotalPrice}
             selectedSeats={selectedSeats}
             requiresSeatMap={requiresSeatMap}
             onPaymentSuccess={handlePayPalSuccess} 
           />
        );
      case 3:
        return (
                     <Confirmation
             ticketInfo={ticketInfo}
             event={event}
             form={form}
             quantity={quantity}
             formatPrice={formatPrice}
             navigate={navigate}
             COLORS={COLORS}
             selectedSeats={selectedSeats}
             requiresSeatMap={requiresSeatMap}
             getTotalPrice={getTotalPrice}
           />
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ backgroundColor: COLORS.neutral.grey1, minHeight: "100vh" }}>
      {contextHolder}
      
      <Content style={{ padding: isMobile ? "18px 4px" : "40px 20px" }}>
        <div style={{ maxWidth: isMobile ? "100%" : "1200px", margin: "0 auto" }}>
          <Link to={`/event/${id}`}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              style={{ color: COLORS.primary.dark, marginBottom: '16px' }}
            >
              Volver al evento
            </Button>
          </Link>
          
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={18}>
              <Title level={2} style={{ 
                color: COLORS.neutral.darker, 
                marginBottom: '8px',
                fontSize: '28px',
                lineHeight: '1.2'
              }}>
                {event.name}
              </Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarOutlined style={{ color: COLORS.primary.main }} />
                  <Text style={{ color: COLORS.neutral.grey600 }}>
                    {dayjs(event.date).format("dddd, DD [de] MMMM [de] YYYY")}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <EnvironmentOutlined style={{ color: COLORS.primary.main }} />
                  <Text style={{ color: COLORS.neutral.grey600 }}>
                    {typeof event.location === 'string' ? event.location : event.location?.name || 'Ubicación no especificada'}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
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
        <div style={{ maxWidth: 'none', margin: '0 auto', padding: '0 20px 40px', width: '100%' }}>
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
                    data-cy="continue-button"
                    style={{
                      backgroundColor: COLORS.primary.main,
                      borderColor: COLORS.primary.main
                    }}
                  >
                    Siguiente
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