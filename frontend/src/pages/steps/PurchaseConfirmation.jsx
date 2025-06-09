import { Typography, Card, Row, Col, Statistic, Space, Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
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
        Tus tickets han sido comprados exitosamente. Recibirás un correo de confirmación 
        con los detalles de tu compra y los códigos QR de tus entradas.
      </Paragraph>
      
      {ticketInfo && (
        <Card style={{ maxWidth: '600px', margin: '0 auto 32px', textAlign: 'left' }}>
          <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
            Detalles de la compra
          </Title>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Statistic
                title="ID de compra"
                value={ticketInfo.id}
                valueStyle={{ color: COLORS.primary.main }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Cantidad"
                value={getTicketQuantity()}
                suffix="tickets"
                valueStyle={{ color: COLORS.neutral.darker }}
              />
            </Col>
            <Col xs={24}>
              <div style={{ marginBottom: '16px' }}>
                <Title level={5} style={{ color: COLORS.neutral.darker, marginBottom: '8px' }}>
                  Tickets comprados:
                </Title>
                {requiresSeatMap() && selectedSeats && selectedSeats.length > 0 ? (
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    {selectedSeats.map((seat, index) => {
                      // Obtener el precio directamente del asiento
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
            </Col>
            <Col xs={24}>
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
            </Col>
          </Row>
        </Card>
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
      </Space>
    </div>
  );
}