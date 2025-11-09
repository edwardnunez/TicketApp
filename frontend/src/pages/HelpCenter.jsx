import React, { useState } from 'react';
import { 
  Layout, 
  Card, 
  Typography, 
  Collapse, 
  Input, 
  Button, 
  Space, 
  Row,
  Col,
  Divider,
  Alert
} from 'antd';
import { 
  QuestionCircleOutlined, 
  SearchOutlined,
  MailOutlined,
  MessageOutlined,
  BookOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { COLORS } from '../components/colorscheme';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Help center page component with FAQ and support information
 * @returns {JSX.Element} Help center page with searchable FAQ and contact options
 */
const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const faqData = [
    {
      key: '1',
      label: '¿Cómo puedo comprar tickets?',
      children: (
        <div>
          <Paragraph>
            Para comprar tickets, sigue estos pasos:
          </Paragraph>
          <ol>
            <li>Navega a la página de eventos</li>
            <li>Selecciona el evento que te interesa</li>
            <li>Haz clic en "Comprar tickets"</li>
            <li>Selecciona tus asientos preferidos</li>
            <li>Completa la información de pago</li>
            <li>Confirma tu compra</li>
          </ol>
        </div>
      ),
    },
    {
      key: '2',
      label: '¿Puedo cancelar mi compra?',
      children: (
        <div>
          <Paragraph>
            Las políticas de cancelación varían según el evento. En general:
          </Paragraph>
          <ul>
            <li>Cancelaciones hasta 48 horas antes: Reembolso completo</li>
            <li>Cancelaciones entre 24-48 horas: Reembolso del 50%</li>
            <li>Cancelaciones menos de 24 horas: Sin reembolso</li>
          </ul>
          <Text type="secondary">
            Contacta con nuestro soporte para casos especiales.
          </Text>
        </div>
      ),
    },
    {
      key: '3',
      label: '¿Cómo puedo cambiar mi perfil?',
      children: (
        <div>
          <Paragraph>
            Para modificar tu perfil:
          </Paragraph>
          <ol>
            <li>Haz clic en tu avatar en la esquina superior derecha</li>
            <li>Selecciona "Perfil"</li>
            <li>Haz clic en "Editar perfil"</li>
            <li>Modifica la información que desees</li>
            <li>Guarda los cambios</li>
          </ol>
        </div>
      ),
    },
    {
      key: '4',
      label: '¿Qué métodos de pago aceptan?',
      children: (
        <div>
          <Paragraph>
            Aceptamos los siguientes métodos de pago:
          </Paragraph>
          <ul>
            <li>Tarjetas de crédito (Visa, MasterCard, American Express)</li>
            <li>Tarjetas de débito</li>
            <li>PayPal</li>
            <li>Transferencia bancaria</li>
          </ul>
        </div>
      ),
    },
    {
      key: '5',
      label: '¿Cómo contacto con soporte técnico?',
      children: (
        <div>
          <Paragraph>
            Puedes contactar con nuestro equipo de soporte:
          </Paragraph>
          <ul>
            <li>Email: soporte@ticketapp.com</li>
            <li>Teléfono: +34 900 123 456</li>
            <li>Formulario de contacto (abajo)</li>
          </ul>
        </div>
      ),
    },
  ];

  const filteredFAQ = faqData.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.children.props.children.some(child => 
      typeof child === 'string' ? child.toLowerCase().includes(searchTerm.toLowerCase()) : false
    )
  );

  const handleContactSubmit = () => {
    if (contactMessage.trim()) {
      setContactMessage('');
    }
  };

  return (
    <Content style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Title level={2} style={{ marginBottom: '24px', color: COLORS?.primary?.main || '#1890ff' }}>
          <QuestionCircleOutlined style={{ marginRight: '8px' }} />
          Centro de ayuda
        </Title>

        {/* Búsqueda */}
        <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>¿En qué podemos ayudarte?</Title>
            <Input
              placeholder="Buscar en preguntas frecuentes..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              style={{ borderRadius: '6px' }}
            />
          </Space>
        </Card>

        {/* Preguntas frecuentes */}
        <Card 
          title={
            <span>
              <BookOutlined style={{ marginRight: '8px' }} />
              Preguntas Frecuentes
            </span>
          }
          style={{ marginBottom: '24px', borderRadius: '8px' }}
        >
          <Collapse
            items={filteredFAQ}
            expandIconPosition="right"
            size="large"
          />
        </Card>

        {/* Información de contacto */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card 
              title={
                <span>
                  <MessageOutlined style={{ marginRight: '8px' }} />
                  Contacta con nosotros
                </span>
              }
              style={{ borderRadius: '8px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Email:</Text>
                  <br />
                  <Text copyable>soporte@ticketapp.com</Text>
                </div>
                <Divider />
                <div>
                  <Text strong>Teléfono:</Text>
                  <br />
                  <Text copyable>+34 900 123 456</Text>
                </div>
                <Divider />
                <div>
                  <Text strong>Horario de atención:</Text>
                  <br />
                  <Text>Lunes a Viernes: 9:00 - 18:00</Text>
                  <br />
                  <Text>Sábados: 10:00 - 14:00</Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              title={
                <span>
                  <MailOutlined style={{ marginRight: '8px' }} />
                  Envíanos un mensaje
                </span>
              }
              style={{ borderRadius: '8px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <TextArea
                  placeholder="Describe tu consulta o problema..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={4}
                  style={{ borderRadius: '6px' }}
                />
                <Button 
                  type="primary" 
                  onClick={handleContactSubmit}
                  disabled={!contactMessage.trim()}
                  style={{ borderRadius: '6px' }}
                >
                  Enviar mensaje
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Alertas informativas */}
        <Alert
          message="¿Necesitas ayuda inmediata?"
          description="Si tienes un problema urgente con tu compra, contacta con nosotros por teléfono para una atención más rápida."
          type="info"
          icon={<ExclamationCircleOutlined />}
          style={{ marginTop: '24px', borderRadius: '8px' }}
        />
      </div>
    </Content>
  );
};

export default HelpCenter;
