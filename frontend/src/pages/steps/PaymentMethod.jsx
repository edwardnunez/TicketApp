import { Card, Typography, Alert, Divider, Space } from "antd";
import { CreditCardOutlined, SafetyOutlined } from "@ant-design/icons";
import { COLORS } from "../../components/colorscheme";
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
  getTotalPrice
}) {

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      <Card style={{ flex: 1, minWidth: "300px" }}>
        <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
          <CreditCardOutlined style={{ marginRight: '8px' }} />
          Método de pago
        </Title>

        <Alert
          message="Demo de compra"
          description="Esta es una simulación. Próximamente se incluirá un procesador de pagos."
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