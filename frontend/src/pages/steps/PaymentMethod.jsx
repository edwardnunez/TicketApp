import { useState, useEffect } from "react";
import { Card, Typography, Alert, Divider, Space, message } from "antd";
import { CreditCardOutlined, SafetyOutlined } from "@ant-design/icons";
import { COLORS } from "../../components/colorscheme";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
const { Title, Text } = Typography;

export default function PaymentMethod({ 
  event, 
  form, 
  quantity, 
  selectedTicketType, 
  ticketTypes, 
  formatPrice,
  selectedSeats,
  requiresSeatMap,
  getTotalPrice,
  onPaymentSuccess
}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const paypalOptions = {
    // Use PayPal's demo client ID for testing, or your actual sandbox client ID
    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "AYpqOVhiMKXGmKSH2Y6peiiNbli_pBvXC2Z6t39wniR1wdcil1378moLgNsKlgvACVUxY2zfgtNICerw",
    currency: "EUR",
    intent: "capture",
    // Remove disable-funding to allow more payment methods during testing
    components: "buttons",
    // Add debug mode for better error reporting
    debug: true
  };

  const handlePayPalSuccess = (details, data) => {
    console.log('PayPal payment successful:', details);
    
    // Aquí manejas el éxito del pago
    message.success('¡Pago procesado exitosamente!');
    
    // Llama a la función para completar la compra
    if (onPaymentSuccess) {
      onPaymentSuccess(details, data);
    }
  };

  const handlePayPalError = (error) => {
    console.error('PayPal payment error:', error);
    message.error('Error al procesar el pago. Inténtalo nuevamente.');
  };

  const handlePayPalCancel = (data) => {
    console.log('PayPal payment cancelled:', data);
    message.warning('Pago cancelado por el usuario.');
  };

  const handlePayPalScriptLoadError = (error) => {
    console.error('PayPal script load error:', error);
    message.error('Error al cargar PayPal. Verifica tu conexión a internet.');
  };

  return (
    <div style={{ display: isMobile ? "block" : "flex", gap: isMobile ? "12px" : "24px", flexWrap: "wrap" }}>
      <Card style={{ flex: 1, minWidth: isMobile ? "100%" : "300px" }}>
        <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
          <CreditCardOutlined style={{ marginRight: '8px' }} />
          Método de pago
        </Title>

        <Alert
          message="Entorno de pruebas"
          description="Esta aplicación usa el entorno Sandbox de PayPal. No se realizarán cobros reales."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ color: COLORS.neutral.darker, marginBottom: '12px' }}>
            Pagar con PayPal
          </Title>
          
          <PayPalScriptProvider 
            options={paypalOptions}
            onLoadError={handlePayPalScriptLoadError}
          >
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "blue",
                shape: "rect",
                label: "paypal"
              }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: getTotalPrice().toFixed(2),
                        currency_code: "EUR"
                      },
                      description: `Tickets para ${event.name}`,
                      custom_id: event._id,
                      invoice_id: `ticket-${Date.now()}`
                    }
                  ],
                  application_context: {
                    shipping_preference: "NO_SHIPPING"
                  }
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then((details) => {
                  handlePayPalSuccess(details, data);
                });
              }}
              onError={handlePayPalError}
              onCancel={handlePayPalCancel}
            />
          </PayPalScriptProvider>
        </div>

        {/* Información adicional para testing */}
        <div style={{ 
          padding: '16px', 
          backgroundColor: COLORS.neutral.grey1, 
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <Text strong style={{ color: COLORS.neutral.darker, display: 'block', marginBottom: '12px' }}>
            💡 Datos de prueba para pagos:
          </Text>
          
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ color: COLORS.neutral.darker, display: 'block', marginBottom: '4px' }}>
              🔐 Cuenta PayPal (Comprador):
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • Email: sb-ce6rg44665018@personal.example.com
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • Contraseña: yW1.{'('}tim
            </Text>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ color: COLORS.neutral.darker, display: 'block', marginBottom: '4px' }}>
              💳 Tarjetas de prueba exitosas:
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • Tarjeta general: 4032034831407245
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • Visa 3DS: 4868 7194 6070 7704
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • Mastercard 3DS: 5329 8797 8623 4393
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • Fecha: Cualquiera | CVC: Cualquiera
            </Text>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ color: COLORS.neutral.darker, display: 'block', marginBottom: '4px' }}>
              🚫 Tarjetas de prueba con errores:
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • Visa falla firma: 4868 7191 1551 4992
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • Mastercard falla firma: 5329 8797 8516 0250
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • Fecha: 01/2025 | CVC: 123
            </Text>
          </div>

          <div>
            <Text strong style={{ color: COLORS.neutral.darker, display: 'block', marginBottom: '4px' }}>
              ℹ️ Códigos de error disponibles:
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • CCREJECT-SF (9500): Tarjeta fraudulenta
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • CCREJECT-BANK_ERROR (5100): Tarjeta rechazada
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • CCREJECT-CVV_F (00N7): Fallo verificación CVC
            </Text>
            <Text style={{ color: COLORS.neutral.grey4, display: 'block' }}>
              • CCREJECT-EC (5400): Tarjeta expirada
            </Text>
          </div>
        </div>
      </Card>

      <Card style={{ flex: isMobile ? 'unset' : "0 0 300px", position: isMobile ? 'static' : 'sticky', top: isMobile ? undefined : '20px', height: isMobile ? 'auto' : 'fit-content', minWidth: isMobile ? '100%' : undefined }}>
        <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
          Confirmación final
        </Title>

        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <div>
            <Text strong style={{ color: COLORS.neutral.darker }}>Evento:</Text>
            <br />
            <Text>{event.name}</Text>
          </div>

          <div>
            <Text strong style={{ color: COLORS.neutral.darker }}>Fecha:</Text>
            <br />
            <Text>{event.date}</Text>
          </div>

          <div>
            <Text strong style={{ color: COLORS.neutral.darker }}>Comprador:</Text>
            <br />
            <Text>{form.getFieldValue('firstName')} {form.getFieldValue('lastName')}</Text>
          </div>

          <div>
            <Text strong style={{ color: COLORS.neutral.darker }}>Tickets:</Text>
            <br />
            {requiresSeatMap() && selectedSeats && selectedSeats.length > 0 ? (
              <>
                {selectedSeats.map((seat, index) => (
                  <div key={index}>
                    <Text style={{ color: COLORS.neutral.grey4 }}>
                      {seat.row != null && seat.seat != null
                        ? `${seat.section} -  Fila ${seat.row}, Asiento ${seat.seat}`
                        : `${seat.section} - Entrada general`}
                    </Text>
                  </div>
                ))}
              </>
            ) : (
              <Text>{quantity} x {ticketTypes.find(t => t.key === selectedTicketType)?.label}</Text>
            )}
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4} style={{ color: COLORS.neutral.darker }}>
              Total:
            </Title>
            <Title level={4} style={{ color: COLORS.primary.main }}>
              {formatPrice(getTotalPrice())}
            </Title>
          </div>
        </Space>
      </Card>
    </div>
  );
}