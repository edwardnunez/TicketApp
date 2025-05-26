import { Card, Typography, Radio, Form, Input, Row, Col, Space, Divider } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { COLORS } from "../../components/colorscheme";
const { Title, Text } = Typography;

export default function BuyerInfo({ 
  form, 
  useAccountData, setUseAccountData, 
  userData, 
  ticketTypes, 
  selectedTicketType, 
  quantity, 
  formatPrice 
}) {
  // Validación teléfono (igual que en original)
  const validatePhoneNumber = (_, value) => {
    if (!value) return Promise.resolve();
    const regex = /^[0-9]+$/;
    if (regex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('El teléfono solo puede contener números.'));
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={16}>
        <Card>
          <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
            Información del comprador
          </Title>

          <Radio.Group
            onChange={e => setUseAccountData(e.target.value === "account")}
            value={useAccountData ? "account" : "manual"}
            style={{ marginBottom: 24 }}
            disabled={!userData} // si no hay datos, no puede elegir cuenta
          >
            <Radio value="manual">Introducir datos manualmente</Radio>
            <Radio value="account" disabled={!userData}>Usar datos de mi cuenta</Radio>
          </Radio.Group>

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="firstName"
                  label="Nombre"
                  rules={[{ required: true, message: 'Por favor ingresa tu nombre' }]}
                >
                  <Input
                    size="large"
                    prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />}
                    placeholder="Tu nombre"
                    disabled={useAccountData}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="lastName"
                  label="Apellido"
                  rules={[{ required: true, message: 'Por favor ingresa tu apellido' }]}
                >
                  <Input
                    size="large"
                    prefix={<UserOutlined style={{ color: COLORS.neutral.grey4 }} />}
                    placeholder="Tu apellido"
                    disabled={useAccountData}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label="Correo electrónico"
              rules={[
                { required: true, message: 'Por favor ingresa tu correo' },
                { type: 'email', message: 'Por favor ingresa un correo válido' }
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined style={{ color: COLORS.neutral.grey4 }} />}
                placeholder="tu@email.com"
                disabled={useAccountData}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Teléfono (opcional)"
              rules={[{ validator: validatePhoneNumber }]}
            >
              <Input
                size="large"
                prefix={<PhoneOutlined style={{ color: COLORS.neutral.grey4 }} />}
                placeholder="Solo números"
                maxLength={15}
              />
            </Form.Item>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card style={{ position: 'sticky', top: '20px' }}>
          <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
            Resumen de compra
          </Title>

          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Tickets {ticketTypes.find(t => t.key === selectedTicketType)?.name}:</Text>
              <Text strong>{quantity}</Text>
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
      </Col>
    </Row>
  );
}
