import { Typography, Card, Row, Col, Statistic, Space, Button, Divider, Image, Alert } from "antd";
import { CheckCircleOutlined, QrcodeOutlined, DownloadOutlined } from "@ant-design/icons";
const { Title, Paragraph, Text} = Typography;

export default function Confirmation({ 
  ticketInfo, 
  event, 
  formatPrice, 
  navigate, 
  COLORS,
  selectedSeats,
  quantity,
  selectedTicketType,
  ticketTypes,
  requiresSeatMap,
  getTotalPrice,
  getCorrectPrice
}) {

  // Calcular la cantidad de tickets correctamente
  const getTicketQuantity = () => {
    if (requiresSeatMap() && selectedSeats && selectedSeats.length > 0) {
      return selectedSeats.length;
    }
    return quantity;
  };

  // Función para descargar el QR
  const downloadQR = (qrCode, ticketNumber) => {
    const link = document.createElement('a');
    link.download = `ticket-qr-${ticketNumber}.png`;
    link.href = qrCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <CheckCircleOutlined style={{ 
        fontSize: '72px', 
        color: COLORS.status.success,
        marginBottom: '24px'
      }} />
      
      <Title level={2} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
        ¡Compra exitosa!
      </Title>
      
      <Paragraph style={{ 
        fontSize: '16px', 
        color: COLORS.neutral.grey4,
        marginBottom: '32px',
        maxWidth: '500px',
        margin: '0 auto 32px'
      }}>
        Tus tickets han sido comprados exitosamente. Guarda o descarga el código QR de tu entrada, 
        lo necesitarás para ingresar al evento.
      </Paragraph>
      
      {ticketInfo && (
        <div style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
          {/* Información general de la compra */}
          <Card style={{ marginBottom: '24px', textAlign: 'left' }}>
            <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
              Detalles de la compra
            </Title>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="ID de compra"
                  value={ticketInfo.ticketId}
                  valueStyle={{ color: COLORS.primary.main }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Número de ticket"
                  value={ticketInfo.ticket?.ticketNumber}
                  valueStyle={{ color: COLORS.neutral.darker }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Cantidad"
                  value={getTicketQuantity()}
                  suffix="tickets"
                  valueStyle={{ color: COLORS.neutral.darker }}
                />
              </Col>
            </Row>

            <Divider />

            {/* Detalles de los tickets */}
            <div style={{ marginBottom: '16px' }}>
              <Title level={5} style={{ color: COLORS.neutral.darker, marginBottom: '8px' }}>
                Tickets comprados:
              </Title>
              {requiresSeatMap() && selectedSeats && selectedSeats.length > 0 ? (
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  {selectedSeats.map((seat, index) => {
                    const seatPrice = seat.price || 0;
                    
                    return (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: COLORS.neutral.grey1,
                        borderRadius: '4px'
                      }}>
                        <Text>{seat.section} - Fila {seat.row}, Asiento {seat.seat}</Text>
                        <Text strong>{formatPrice(seatPrice)}</Text>
                      </div>
                    );
                  })}
                </Space>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: COLORS.neutral.grey1,
                  borderRadius: '4px'
                }}>
                  <Text>{quantity} x {ticketTypes.find(t => t.key === selectedTicketType)?.label || selectedTicketType}</Text>
                  <Text strong>{formatPrice(getCorrectPrice(selectedTicketType) * quantity)}</Text>
                </div>
              )}
            </div>

            <div style={{ 
              borderTop: `1px solid ${COLORS.neutral.grey2}`,
              paddingTop: '16px'
            }}>
              <Statistic
                title="Total pagado"
                value={formatPrice(getTotalPrice())}
                valueStyle={{ color: COLORS.status.success, fontSize: '24px', fontWeight: 'bold' }}
              />
            </div>
          </Card>

          {/* Código QR del ticket */}
          {ticketInfo.qrCode && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrcodeOutlined style={{ color: COLORS.primary.main }} />
                  <span>Tu entrada digital</span>
                </div>
              }
              style={{ textAlign: 'center' }}
            >
              <Alert
                message="Importante"
                description="Guarda este código QR en tu teléfono. Lo necesitarás para ingresar al evento."
                type="info"
                showIcon
                style={{ marginBottom: '24px', textAlign: 'left' }}
              />

              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: `2px solid ${COLORS.neutral.grey2}`,
                  display: 'inline-block'
                }}>
                  <Image
                    src={ticketInfo.qrCode}
                    alt="Código QR del ticket"
                    width={200}
                    height={200}
                    style={{ 
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    preview={{
                      mask: 'Ver código QR completo'
                    }}
                  />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                    Ticket: {ticketInfo.ticket?.ticketNumber}
                  </Text>
                  <Button
                    type="default"
                    icon={<DownloadOutlined />}
                    onClick={() => downloadQR(ticketInfo.qrCode, ticketInfo.ticket?.ticketNumber)}
                    style={{
                      borderColor: COLORS.primary.main,
                      color: COLORS.primary.main
                    }}
                  >
                    Descargar QR
                  </Button>
                </div>
              </div>

              <Divider />

              <div style={{ textAlign: 'left' }}>
                <Title level={5} style={{ color: COLORS.neutral.darker, marginBottom: '8px' }}>
                  Información del evento:
                </Title>
                <Space direction="vertical" size={4}>
                  <Text><strong>Evento:</strong> {event.name}</Text>
                  <Text><strong>Fecha:</strong> {new Date(event.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</Text>
                  <Text><strong>Ubicación:</strong> {event.location.name}</Text>
                  <Text><strong>Estado:</strong> <Text style={{ color: COLORS.status.success }}>Pagado</Text></Text>
                </Space>
              </div>
            </Card>
          )}
        </div>
      )}
      
      <Space size={16}>
        <Button 
          type="primary" 
          size="large"
          onClick={() => navigate(`/event/${event._id}`)}
          style={{
            backgroundColor: COLORS.primary.main,
            borderColor: COLORS.primary.main
          }}
        >
          Ver evento
        </Button>
        <Button size="large" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
        <Button 
          size="large" 
          onClick={() => navigate('/profile/tickets')}
          style={{
            borderColor: COLORS.primary.main,
            color: COLORS.primary.main
          }}
        >
          Mis tickets
        </Button>
      </Space>

      <div style={{ 
        marginTop: '32px', 
        padding: '16px',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '32px auto 0'
      }}>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          <strong>Recordatorio:</strong> También puedes acceder a tus tickets y códigos QR 
          desde tu perfil en cualquier momento. Se ha enviado una copia de confirmación a tu correo electrónico.
        </Text>
      </div>
    </div>
  );
}