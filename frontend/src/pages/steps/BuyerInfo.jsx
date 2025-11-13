import { useState, useEffect } from "react";
import { Card, Typography, Radio, Form, Input, Row, Col, Space, Divider, Select } from "antd";
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
  requiresSeatMap,
  onPhonePrefixChange
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState('+34');

  const handlePrefixChange = (value) => {
    setPhonePrefix(value);
    if (onPhonePrefixChange) {
      onPhonePrefixChange(value);
    }
  };

  // Lista de prefijos de países comunes
  const countryPrefixes = [
    { value: '+34', label: '+34 (España)', flag: '🇪🇸' },
    { value: '+1', label: '+1 (EE.UU./Canadá)', flag: '🇺🇸' },
    { value: '+44', label: '+44 (Reino Unido)', flag: '🇬🇧' },
    { value: '+33', label: '+33 (Francia)', flag: '🇫🇷' },
    { value: '+49', label: '+49 (Alemania)', flag: '🇩🇪' },
    { value: '+39', label: '+39 (Italia)', flag: '🇮🇹' },
    { value: '+351', label: '+351 (Portugal)', flag: '🇵🇹' },
    { value: '+52', label: '+52 (México)', flag: '🇲🇽' },
    { value: '+54', label: '+54 (Argentina)', flag: '🇦🇷' },
    { value: '+55', label: '+55 (Brasil)', flag: '🇧🇷' },
    { value: '+56', label: '+56 (Chile)', flag: '🇨🇱' },
    { value: '+57', label: '+57 (Colombia)', flag: '🇨🇴' },
  ];

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
    // Eliminar espacios para validación
    const cleanValue = value.replace(/\s+/g, '');
    const regex = /^[0-9]+$/;
    if (regex.test(cleanValue) && cleanValue.length >= 9 && cleanValue.length <= 10) {
      return Promise.resolve();
    }
    if (!regex.test(cleanValue)) {
      return Promise.reject(new Error('El teléfono solo puede contener números.'));
    }
    return Promise.reject(new Error('El teléfono debe tener entre 9 y 10 dígitos.'));
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    // Solo permitir números
    const phoneNumber = value.replace(/[^\d]/g, '');

    // Formatear el número con espacios cada 3 dígitos
    // Ej: 912345678 -> 912 345 678
    const formatted = phoneNumber.match(/.{1,3}/g)?.join(' ') || phoneNumber;
    return formatted;
  };

  const prefixSelector = (
    <Select
      value={phonePrefix}
      onChange={handlePrefixChange}
      style={{ width: 140 }}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    >
      {countryPrefixes.map(country => (
        <Select.Option key={country.value} value={country.value} label={country.label}>
          <span style={{ marginRight: 8 }}>{country.flag}</span>
          {country.value}
        </Select.Option>
      ))}
    </Select>
  );

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
                    maxLength={50}
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
                    maxLength={100}
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
                maxLength={100}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Teléfono (opcional)"
              rules={[{ validator: validatePhoneNumber }]}
              normalize={formatPhoneNumber}
            >
              <Input
                size="large"
                data-cy="phone-input"
                addonBefore={prefixSelector}
                prefix={<PhoneOutlined style={{ color: COLORS.neutral.grey4 }} />}
                placeholder="912 345 678"
                maxLength={13}
                type="tel"
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
