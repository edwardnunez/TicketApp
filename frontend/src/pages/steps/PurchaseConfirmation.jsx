import { Typography, Card, Row, Col, Statistic, Space, Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
const { Title, Paragraph, Text } = Typography;

export default function Confirmation({ 
  ticketInfo, event, form, quantity, selectedTicketType, ticketTypes, formatPrice, navigate, COLORS 
}) {
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
                value={ticketInfo.quantity}
                suffix="tickets"
                valueStyle={{ color: COLORS.neutral.darker }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Tipo"
                value={ticketInfo.type.toUpperCase()}
                valueStyle={{ color: COLORS.neutral.darker }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Total pagado"
                value={formatPrice(ticketInfo.totalPrice)}
                valueStyle={{ color: COLORS.status.success }}
              />
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
