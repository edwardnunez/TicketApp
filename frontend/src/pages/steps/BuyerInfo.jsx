import { useState, useEffect } from "react";
import { Card, Typography, Radio, Form, Input, Row, Col, Space, Divider } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { COLORS } from "../../components/colorscheme";
const { Title, Text } = Typography;

export default function BuyerInfo({ 
  form, 
  useAccountData, setUseAccountData, 
  userData, 
  quantity, 
  formatPrice,
  selectedSeats,
  event,
  getTotalPrice,
  requiresSeatMap
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

  const validatePhoneNumber = (_, value) => {
    if (!value) return Promise.resolve();
    const regex = /^[0-9]+$/;
    if (regex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('El teléfono solo puede contener números.'));
  };

  return (
    <Row gutter={[isMobile ? 8 : 24, isMobile ? 8 : 24]}>
      <Col xs={24} lg={16}>
        <Card style={{ padding: isMobile ? '12px 4px' : undefined }}>
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
                    data-cy="name-input"
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
                data-cy="email-input"
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
                data-cy="phone-input"
                prefix={<PhoneOutlined style={{ color: COLORS.neutral.grey4 }} />}
                placeholder="Solo números"
                maxLength={15}
              />
            </Form.Item>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card style={{ position: 'sticky', top: '20px' }} data-cy="purchase-summary">
          <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
            Resumen de compra
          </Title>

          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {requiresSeatMap() && selectedSeats && selectedSeats.length > 0 ? (
              <>
                <div data-cy="selected-seats-count">
                  <Text>{selectedSeats.length} asientos seleccionados</Text>
                </div>
                {selectedSeats.map((seat, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ color: COLORS.neutral.grey4 }}>
                      {seat.row != null && seat.seat != null
                        ? `${seat.section} -  Fila ${seat.row}, Asiento ${seat.seat}`
                        : `${seat.section} - Entrada general`}
                    </Text>
                    <Text></Text>
                    <Text strong>{formatPrice(seat.price || 0)}</Text>
                  </div>
                ))}
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Title level={4} style={{ color: COLORS.neutral.darker }}>
                    Total:
                  </Title>
                  <Title level={4} style={{ color: COLORS.primary.main }} data-cy="total-price">
                    {formatPrice(getTotalPrice())}
                  </Title>
                </div>
              </>
            ) : (
              <>
                {/* Mostrar resumen por tipo de ticket cuando no hay mapa de asientos */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }} data-cy="selected-seats-count">
                  <Text>Tickets:</Text>
                  <Text strong>{quantity}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Precio unitario:</Text>
                  <Text strong>{formatPrice(event?.price || 0)}</Text>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Title level={4} style={{ color: COLORS.neutral.darker }}>
                    Total:
                  </Title>
                  <Title level={4} style={{ color: COLORS.primary.main }} data-cy="total-price">
                    {formatPrice(getTotalPrice())}
                  </Title>
                </div>
              </>
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
