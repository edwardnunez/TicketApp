import { Card, Radio, Space, Tag, InputNumber, Typography } from "antd";
import { COLORS } from "../../components/colorscheme";
const { Title, Text } = Typography;

export default function SelectTickets({ 
  selectedTicketType, setSelectedTicketType, 
  quantity, setQuantity, 
  ticketTypes, formatPrice 
}) {
  return (
    <>
      <Card style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
          Selecciona tu tipo de ticket
        </Title>
        <Radio.Group 
          value={selectedTicketType} 
          onChange={(e) => setSelectedTicketType(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {ticketTypes.map(ticket => (
              <Radio key={ticket.key} value={ticket.key} style={{ width: '100%' }}>
                <Card 
                  size="small"
                  style={{ 
                    marginLeft: '8px',
                    border: selectedTicketType === ticket.key ? `2px solid ${COLORS.primary.main}` : `1px solid ${COLORS.neutral.grey2}`,
                    backgroundColor: selectedTicketType === ticket.key ? `${COLORS.primary.light}10` : COLORS.neutral.white
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Title level={5} style={{ marginBottom: '4px', color: COLORS.neutral.darker }}>
                        {ticket.name}
                      </Title>
                      <Text style={{ color: COLORS.neutral.grey4, marginBottom: '8px', display: 'block' }}>
                        {ticket.description}
                      </Text>
                      <Space wrap>
                        {ticket.features.map((feature, index) => (
                          <Tag key={index} color={COLORS.primary.light}>
                            {feature}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                      <Title level={4} style={{ color: COLORS.primary.main, marginBottom: '4px' }}>
                        {formatPrice(ticket.price)}
                      </Title>
                      <Text style={{ color: COLORS.neutral.grey4 }}>por ticket</Text>
                    </div>
                  </div>
                </Card>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Card>

      <Card>
        <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
          Cantidad de tickets
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Text>Cantidad:</Text>
          <InputNumber
            min={1}
            max={6}
            value={quantity}
            onChange={setQuantity}
            size="large"
            style={{ width: '120px' }}
          />
          <Text style={{ color: COLORS.neutral.grey4 }}>
            (Máximo 6 tickets por compra)
          </Text>
        </div>
      </Card>
    </>
  );
}
