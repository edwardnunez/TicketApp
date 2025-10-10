import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Modal, Form, Input, InputNumber, ColorPicker, Select, Switch, Popconfirm, message, Tooltip, Row, Col, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, EyeOutlined, EyeInvisibleOutlined, SettingOutlined } from '@ant-design/icons';
import { COLORS } from '../../../../components/colorscheme';
import SeatRenderer from './SeatRenderer';
import SeatMapLegend from '../ui/SeatMapLegend';
import useDeviceDetection from '../../../../hooks/useDeviceDetection';
import '../styles/SeatMapAnimations.css';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Editable seat renderer component for seat map creation and editing
 * @param {Object} props - Component props
 * @param {Object} props.seatMapData - Seat map data object
 * @param {Function} props.onSeatMapUpdate - Seat map update handler
 * @param {Object} [props.initialData=null] - Initial seat map data
 * @param {boolean} [props.readOnly=false] - Whether in read-only mode
 * @returns {JSX.Element} Editable seat renderer with section management
 */
const EditableSeatRenderer = ({ seatMapData, onSeatMapUpdate, initialData = null, readOnly = false }) => {
  const deviceInfo = useDeviceDetection();
  const [form] = Form.useForm();
  
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [seatMapConfig, setSeatMapConfig] = useState({ name: '', type: 'generic', venueName: '', description: '' });

  useEffect(() => {
    if (initialData) {
      setSections(initialData.sections || []);
      setSeatMapConfig(initialData.config || {});
    } else if (seatMapData) {
      setSections(seatMapData.sections || []);
      setSeatMapConfig(seatMapData.config || {});
    }
  }, [initialData, seatMapData]);

  const addSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      name: `Sección ${sections.length + 1}`,
      position: 'center',
      rows: 5,
      seatsPerRow: 10,
      color: COLORS.primary.main,
      defaultPrice: 0,
      hasNumberedSeats: true,
      totalCapacity: 50,
      order: sections.length + 1
    };
    setSections([...sections, newSection]);
    message.success('Sección añadida');
  };

  const editSection = (section) => {
    setSelectedSection(section);
    form.setFieldsValue(section);
    setSectionModalVisible(true);
  };

  const deleteSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId));
    message.success('Sección eliminada');
  };

  const handleSectionSave = () => {
    form.validateFields().then(values => {
      const updatedSections = sections.map(section => 
        section.id === selectedSection.id ? { ...section, ...values } : section
      );
      setSections(updatedSections);
      setSectionModalVisible(false);
      setSelectedSection(null);
      message.success('Sección actualizada');
    });
  };

  const handleSave = () => {
    const updatedData = { ...seatMapData, sections, config: seatMapConfig, updatedAt: new Date().toISOString() };
    if (onSeatMapUpdate) onSeatMapUpdate(updatedData);
    message.success('Mapa de asientos guardado');
  };

  const formatPrice = (price) => `€${price}`;

  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Editor de Mapa de Asientos</Title>
            <Text style={{ color: COLORS.neutral.grey4 }}>{seatMapConfig.name || 'Mapa sin nombre'}</Text>
          </div>
          {!readOnly && (
            <Space>
              <Button icon={showPreview ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={() => setShowPreview(!showPreview)} />
              <Button icon={<SettingOutlined />} onClick={() => setSettingsModalVisible(true)} />
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>Guardar</Button>
            </Space>
          )}
        </div>
      </Card>

      {!readOnly && (
        <Card style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>Secciones ({sections.length})</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={addSection}>Añadir Sección</Button>
          </div>
        </Card>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: deviceInfo.isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {sections.map(section => (
          <Card
            key={section.id}
            style={{
              margin: '8px',
              border: selectedSection?.id === section.id ? `2px solid ${COLORS.primary.main}` : '1px solid #E5E7EB',
              borderRadius: '12px',
              backgroundColor: selectedSection?.id === section.id ? `${COLORS.primary.main}05` : 'white',
              transition: 'all 0.3s ease'
            }}
            hoverable={!readOnly}
            onClick={() => !readOnly && setSelectedSection(section)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: section.color, borderRadius: '50%' }} />
                <Text strong>{section.name}</Text>
                {!section.hasNumberedSeats && <Badge count="GA" style={{ backgroundColor: '#10B981', fontSize: '10px' }} />}
              </div>
              {!readOnly && (
                <Space>
                  <Tooltip title="Editar">
                    <Button type="text" icon={<EditOutlined />} size="small" onClick={(e) => { e.stopPropagation(); editSection(section); }} />
                  </Tooltip>
                  <Popconfirm title="¿Eliminar sección?" description="Esta acción no se puede deshacer" onConfirm={() => deleteSection(section.id)} okText="Sí" cancelText="No">
                    <Tooltip title="Eliminar">
                      <Button type="text" icon={<DeleteOutlined />} size="small" danger onClick={(e) => e.stopPropagation()} />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              )}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Text style={{ fontSize: '12px', color: COLORS.neutral.grey4 }}>
                    {section.hasNumberedSeats ? `${section.rows} filas × ${section.seatsPerRow} asientos` : `Capacidad: ${section.totalCapacity}`}
                  </Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong style={{ color: COLORS.primary.main }}>{formatPrice(section.defaultPrice)}</Text>
                </Col>
              </Row>
            </div>
            {showPreview && (
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '8px', border: '1px solid #E5E7EB' }}>
                <SeatRenderer
                  sectionId={section.id}
                  rows={section.rows}
                  seatsPerRow={section.seatsPerRow}
                  price={section.defaultPrice}
                  color={section.color}
                  name={section.name}
                  selectedSeats={[]}
                  occupiedSeats={[]}
                  blockedSeats={[]}
                  sectionBlocked={false}
                  maxSeats={0}
                  onSeatSelect={() => {}}
                  formatPrice={formatPrice}
                  compactMode={true}
                  responsiveMode={deviceInfo.isMobile}
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      <SeatMapLegend theme="default" showPremium={true} showAccessible={false} className="depth-2" />

      <Modal title="Editar Sección" open={sectionModalVisible} onOk={handleSectionSave} onCancel={() => { setSectionModalVisible(false); setSelectedSection(null); }} width={600} okText="Guardar" cancelText="Cancelar">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Nombre de la sección" rules={[{ required: true, message: 'El nombre es requerido' }]}>
                <Input placeholder="Ej: Tribuna Norte" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="Posición" rules={[{ required: true, message: 'La posición es requerida' }]}>
                <Select placeholder="Seleccionar posición">
                  <Option value="north">Norte</Option>
                  <Option value="south">Sur</Option>
                  <Option value="east">Este</Option>
                  <Option value="west">Oeste</Option>
                  <Option value="center">Centro</Option>
                  <Option value="vip">VIP</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="color" label="Color de la sección" rules={[{ required: true, message: 'El color es requerido' }]}>
                <ColorPicker showText format="hex" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="defaultPrice" label="Precio por defecto" rules={[{ required: true, message: 'El precio es requerido' }]}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="hasNumberedSeats" label="Tipo de asientos" valuePropName="checked">
            <Switch checkedChildren="Numerados" unCheckedChildren="Entrada General" />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.hasNumberedSeats !== currentValues.hasNumberedSeats}>
            {({ getFieldValue }) => {
              const hasNumberedSeats = getFieldValue('hasNumberedSeats');
              return hasNumberedSeats ? (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="rows" label="Número de filas" rules={[{ required: true, message: 'El número de filas es requerido' }]}>
                      <InputNumber min={1} max={50} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="seatsPerRow" label="Asientos por fila" rules={[{ required: true, message: 'El número de asientos por fila es requerido' }]}>
                      <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              ) : (
                <Form.Item name="totalCapacity" label="Capacidad total" rules={[{ required: true, message: 'La capacidad es requerida' }]}>
                  <InputNumber min={1} max={10000} style={{ width: '100%' }} />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item name="order" label="Orden de visualización">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Configuración del Mapa" open={settingsModalVisible} onOk={() => setSettingsModalVisible(false)} onCancel={() => setSettingsModalVisible(false)} width={500} okText="Guardar" cancelText="Cancelar">
        <Form layout="vertical" initialValues={seatMapConfig}>
          <Form.Item name="name" label="Nombre del mapa" rules={[{ required: true, message: 'El nombre es requerido' }]}>
            <Input placeholder="Ej: Estadio Principal" />
          </Form.Item>
          <Form.Item name="type" label="Tipo de venue" rules={[{ required: true, message: 'El tipo es requerido' }]}>
            <Select placeholder="Seleccionar tipo">
              <Option value="stadium">Estadio</Option>
              <Option value="theater">Teatro</Option>
              <Option value="cinema">Cine</Option>
              <Option value="concert">Concierto</Option>
              <Option value="arena">Arena</Option>
              <Option value="generic">Genérico</Option>
            </Select>
          </Form.Item>
          <Form.Item name="venueName" label="Nombre del venue">
            <Input placeholder="Ej: Estadio Santiago Bernabéu" />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={3} placeholder="Descripción del mapa de asientos..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EditableSeatRenderer;
