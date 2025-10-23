import React, { useState, useMemo } from 'react';
import { Card, Select, InputNumber, Button, Typography, Alert, Tag, Space, notification, Switch } from 'antd';
import { LockOutlined, UnlockOutlined, StopOutlined } from '@ant-design/icons';
import { COLORS } from '../../../components/colorscheme';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Componente de bloqueo manual de asientos mediante formulario
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.seatMapData - Datos del mapa de asientos
 * @param {Array} props.blockedSeats - Asientos actualmente bloqueados
 * @param {Array} props.blockedSections - Secciones actualmente bloqueadas
 * @param {Function} props.onSeatToggle - Función para bloquear/desbloquear asientos
 * @param {Function} props.onSectionToggle - Función para bloquear/desbloquear secciones
 */
const ManualBlockingSelection = ({
  seatMapData,
  blockedSeats = [],
  blockedSections = [],
  onSeatToggle,
  onSectionToggle
}) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState(null);
  const [blockingMode, setBlockingMode] = useState('seat'); // 'seat' o 'section'

  // Obtener información de la sección seleccionada
  const currentSection = useMemo(() => {
    if (!seatMapData || !selectedSection) return null;
    return seatMapData.sections.find(s => s.id === selectedSection);
  }, [selectedSection, seatMapData]);

  if (!seatMapData) return null;

  const { sections } = seatMapData;

  // Verificar si la sección está bloqueada
  const isSectionBlocked = (sectionId) => {
    return blockedSections && blockedSections.includes(sectionId);
  };

  // Verificar si el asiento está bloqueado
  const isSeatBlocked = (sectionId, row, seat) => {
    const seatId = `${sectionId}-${row}-${seat}`;
    return blockedSeats.includes(seatId);
  };

  // Manejar cambio de sección
  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    setSelectedRow(null);
    setSelectedSeatNumber(null);
  };

  // Bloquear/Desbloquear asiento
  const handleToggleSeat = () => {
    if (!currentSection) {
      notification.warning({
        message: 'Selección incompleta',
        description: 'Por favor, selecciona una sección.',
        placement: 'topRight'
      });
      return;
    }

    // Si es entrada general, usar el handler de sección
    if (!currentSection.hasNumberedSeats) {
      notification.info({
        message: 'Entrada General',
        description: 'Para secciones de entrada general, usa el modo "Bloquear sección completa".',
        placement: 'topRight'
      });
      return;
    }

    // Para asientos numerados
    if (!selectedRow || !selectedSeatNumber) {
      notification.warning({
        message: 'Selección incompleta',
        description: 'Por favor, selecciona fila y asiento.',
        placement: 'topRight'
      });
      return;
    }

    const seatId = `${currentSection.id}-${selectedRow}-${selectedSeatNumber}`;
    const isCurrentlyBlocked = blockedSeats.includes(seatId);

    onSeatToggle(seatId);

    notification.success({
      message: isCurrentlyBlocked ? 'Asiento desbloqueado' : 'Asiento bloqueado',
      description: `${currentSection.name} - Fila ${selectedRow}, Asiento ${selectedSeatNumber}`,
      placement: 'topRight',
      icon: isCurrentlyBlocked ? <UnlockOutlined style={{ color: '#52c41a' }} /> : <LockOutlined style={{ color: '#ff4d4f' }} />
    });

    // Resetear selección de fila y asiento
    setSelectedRow(null);
    setSelectedSeatNumber(null);
  };

  // Bloquear/Desbloquear sección completa
  const handleToggleSection = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    const isCurrentlyBlocked = isSectionBlocked(sectionId);

    onSectionToggle(sectionId);

    notification.success({
      message: isCurrentlyBlocked ? 'Sección desbloqueada' : 'Sección bloqueada',
      description: `${section.name} - ${isCurrentlyBlocked ? 'Ahora disponible' : 'Ahora bloqueada'}`,
      placement: 'topRight',
      icon: isCurrentlyBlocked ? <UnlockOutlined style={{ color: '#52c41a' }} /> : <StopOutlined style={{ color: '#ff4d4f' }} />
    });
  };

  return (
    <div style={{ padding: '20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: '24px', textAlign: 'center', color: COLORS.neutral.darker }}>
        Control de bloqueo de asientos
      </Title>

      <Alert
        message="Instrucciones"
        description="Puedes bloquear asientos individuales o secciones completas. Los asientos bloqueados no estarán disponibles para la venta."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      {/* Modo de bloqueo */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Text strong>Modo de bloqueo:</Text>
          <Space>
            <Tag color={blockingMode === 'seat' ? 'blue' : 'default'}>Asientos individuales</Tag>
            <Switch
              checked={blockingMode === 'section'}
              onChange={(checked) => setBlockingMode(checked ? 'section' : 'seat')}
            />
            <Tag color={blockingMode === 'section' ? 'blue' : 'default'}>Secciones completas</Tag>
          </Space>
        </div>

        {/* Vista de bloqueo de asientos individuales */}
        {blockingMode === 'seat' && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Selector de sección */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Sección <span style={{ color: '#ff4d4f' }}>*</span>
              </Text>
              <Select
                placeholder="Selecciona una sección"
                style={{ width: '100%' }}
                value={selectedSection}
                onChange={handleSectionChange}
                size="large"
              >
                {sections.map(section => (
                  <Option
                    key={section.id}
                    value={section.id}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        {section.name}
                        {!section.hasNumberedSeats && ' (Entrada General)'}
                      </span>
                      {isSectionBlocked(section.id) && <Tag color="red">Bloqueada</Tag>}
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            {/* Selectores de fila y asiento (solo para asientos numerados) */}
            {currentSection && currentSection.hasNumberedSeats && (
              <>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    Fila <span style={{ color: '#ff4d4f' }}>*</span>
                  </Text>
                  <InputNumber
                    placeholder="Número de fila"
                    style={{ width: '100%' }}
                    min={1}
                    max={currentSection.rows}
                    value={selectedRow}
                    onChange={setSelectedRow}
                    size="large"
                  />
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Rango válido: 1 - {currentSection.rows}
                  </Text>
                </div>

                <div>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    Asiento <span style={{ color: '#ff4d4f' }}>*</span>
                  </Text>
                  <InputNumber
                    placeholder="Número de asiento"
                    style={{ width: '100%' }}
                    min={1}
                    max={currentSection.seatsPerRow}
                    value={selectedSeatNumber}
                    onChange={setSelectedSeatNumber}
                    size="large"
                  />
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Rango válido: 1 - {currentSection.seatsPerRow}
                  </Text>
                </div>
              </>
            )}

            {/* Información de estado */}
            {currentSection && currentSection.hasNumberedSeats && selectedRow && selectedSeatNumber && (
              <div style={{
                padding: '16px',
                backgroundColor: isSeatBlocked(currentSection.id, selectedRow, selectedSeatNumber)
                  ? 'rgba(255, 77, 79, 0.1)'
                  : 'rgba(82, 196, 26, 0.1)',
                borderRadius: '8px',
                marginTop: '8px',
                border: `2px solid ${isSeatBlocked(currentSection.id, selectedRow, selectedSeatNumber) ? '#ff4d4f' : '#52c41a'}`
              }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>Estado actual:</Text>
                    <Tag color={isSeatBlocked(currentSection.id, selectedRow, selectedSeatNumber) ? 'red' : 'green'} icon={isSeatBlocked(currentSection.id, selectedRow, selectedSeatNumber) ? <LockOutlined /> : <UnlockOutlined />}>
                      {isSeatBlocked(currentSection.id, selectedRow, selectedSeatNumber) ? 'BLOQUEADO' : 'DISPONIBLE'}
                    </Tag>
                  </div>
                </Space>
              </div>
            )}

            {/* Botón bloquear/desbloquear */}
            <Button
              type="primary"
              size="large"
              danger={currentSection && currentSection.hasNumberedSeats && selectedRow && selectedSeatNumber && !isSeatBlocked(currentSection.id, selectedRow, selectedSeatNumber)}
              icon={currentSection && currentSection.hasNumberedSeats && selectedRow && selectedSeatNumber && isSeatBlocked(currentSection.id, selectedRow, selectedSeatNumber) ? <UnlockOutlined /> : <LockOutlined />}
              onClick={handleToggleSeat}
              disabled={!currentSection || (currentSection.hasNumberedSeats && (!selectedRow || !selectedSeatNumber))}
              block
            >
              {currentSection && currentSection.hasNumberedSeats && selectedRow && selectedSeatNumber && isSeatBlocked(currentSection.id, selectedRow, selectedSeatNumber)
                ? 'Desbloquear asiento'
                : 'Bloquear asiento'}
            </Button>
          </Space>
        )}

        {/* Vista de bloqueo de secciones completas */}
        {blockingMode === 'section' && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Haz clic en una sección para bloquearla o desbloquearla completamente:
            </Text>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
              marginTop: '12px'
            }}>
              {sections.map(section => {
                const isBlocked = isSectionBlocked(section.id);
                return (
                  <Button
                    key={section.id}
                    size="large"
                    type={isBlocked ? "primary" : "default"}
                    danger={isBlocked}
                    icon={isBlocked ? <UnlockOutlined /> : <LockOutlined />}
                    onClick={() => handleToggleSection(section.id)}
                    style={{
                      borderColor: isBlocked ? '#ff4d4f' : section.color,
                      color: isBlocked ? '#fff' : '#fff',
                      height: '60px',
                      ...(isBlocked ? {} : {
                        backgroundColor: section.color
                      })
                    }}
                    block
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>{section.name}</span>
                      {isBlocked && <span style={{ fontSize: '11px' }}>(Bloqueada)</span>}
                    </div>
                  </Button>
                );
              })}
            </div>
          </Space>
        )}
      </Card>

      {/* Resumen de bloqueos */}
      <Card
        title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>Resumen de bloqueos</span>}
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: '24px'
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: blockedSections.length > 0 ? '24px' : '0'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            backgroundColor: COLORS.neutral.grey1,
            borderRadius: '8px',
            border: `2px solid ${COLORS.neutral.grey2}`
          }}>
            <Text type="secondary" style={{ marginBottom: '8px' }}>Secciones bloqueadas</Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: '24px', color: COLORS.neutral.darker }}>
                {blockedSections.length}
              </Text>
              <Text type="secondary">de {sections.length}</Text>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            backgroundColor: COLORS.neutral.grey1,
            borderRadius: '8px',
            border: `2px solid ${COLORS.neutral.grey2}`
          }}>
            <Text type="secondary" style={{ marginBottom: '8px' }}>Asientos bloqueados</Text>
            <Text strong style={{ fontSize: '24px', color: COLORS.neutral.darker }}>
              {blockedSeats.length}
            </Text>
          </div>
        </div>

        {blockedSections.length > 0 && (
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(255, 77, 79, 0.05)',
            borderRadius: '8px',
            border: `1px solid rgba(255, 77, 79, 0.2)`
          }}>
            <Text strong style={{ display: 'block', marginBottom: '12px', color: COLORS.neutral.darker }}>
              Secciones bloqueadas activas:
            </Text>
            <Space wrap size="small">
              {blockedSections.map(sectionId => {
                const section = sections.find(s => s.id === sectionId);
                return section ? (
                  <Tag
                    key={sectionId}
                    color="red"
                    closable
                    onClose={() => handleToggleSection(sectionId)}
                    style={{ fontSize: '13px', padding: '4px 8px' }}
                  >
                    <LockOutlined /> {section.name}
                  </Tag>
                ) : null;
              })}
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManualBlockingSelection;
