import { Card, Typography, Alert, Divider, Space } from "antd";
import { CreditCardOutlined, SafetyOutlined } from "@ant-design/icons";
import { COLORS } from "../../components/colorscheme";
const { Title, Text } = Typography;

export default function PaymentMethod({ event, form, quantity, selectedTicketType, ticketTypes, formatPrice }) {
  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      <Card style={{ flex: 1, minWidth: "300px" }}>
        <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
          <CreditCardOutlined style={{ marginRight: '8px' }} />
          Método de pago
        </Title>

        <Alert
          message="Demo de compra"
          description="Esta es una demostración. En un entorno real, aquí integrarías con un procesador de pagos como Stripe, PayPal, o Transbank."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <div style={{ 
          padding: '24px', 
          backgroundColor: COLORS.neutral.grey1, 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <SafetyOutlined style={{ 
            fontSize: '48px', 
            color: COLORS.primary.main,
            marginBottom: '16px'
          }} />
          <Title level={5} style={{ color: COLORS.neutral.darker }}>
            Pago seguro simulado
          </Title>
          <Text style={{ color: COLORS.neutral.grey4 }}>
            Haz clic en "Procesar pago" para simular la compra
          </Text>
        </div>
      </Card>

      <Card style={{ flex: "0 0 300px", position: 'sticky', top: '20px', height: 'fit-content' }}>
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
            <Text>{quantity} x {ticketTypes.find(t => t.key === selectedTicketType)?.name}</Text>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4} style={{ color: COLORS.neutral.darker }}>
              Total:
            </Title>
            <Title level={4} style={{ color: COLORS.primary.main }}>
              {formatPrice(ticketTypes.find(t => t.key === selectedTicketType)?.price * quantity)}
            </Title>
          </div>
        </Space>
      </Card>
    </div>
  );
}
