import React, { useState, useMemo } from 'react';
import { Card, Select, InputNumber, Button, Typography, Alert, List, Tag, Space, notification } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { COLORS } from '../../../../components/colorscheme';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Componente de selección manual de asientos mediante formulario
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.seatMapData - Datos del mapa de asientos
 * @param {Array} props.selectedSeats - Asientos actualmente seleccionados
 * @param {Function} props.onSeatSelect - Función para actualizar asientos seleccionados
 * @param {number} props.maxSeats - Número máximo de asientos seleccionables
 * @param {Array} props.occupiedSeats - Lista de IDs de asientos ocupados
 * @param {Array} props.blockedSeats - Lista de IDs de asientos bloqueados
 * @param {Array} props.blockedSections - Lista de IDs de secciones bloqueadas
 * @param {Function} props.formatPrice - Función para formatear precios
 * @param {Object} props.event - Datos del evento
 */
const ManualSeatSelection = ({
  seatMapData,
  selectedSeats = [],
  onSeatSelect,
  maxSeats,
  occupiedSeats = [],
  blockedSeats = [],
  blockedSections = [],
  formatPrice,
  event
}) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState(null);

  // Obtener información de la sección seleccionada
  const currentSection = useMemo(() => {
    if (!seatMapData || !selectedSection) return null;
    return seatMapData.sections.find(s => s.id === selectedSection);
  }, [selectedSection, seatMapData]);

  // Calcular total
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
  }, [selectedSeats]);

  if (!seatMapData) return null;

  const { sections } = seatMapData;

  // Verificar si la sección está bloqueada
  const isSectionBlocked = (sectionId) => {
    return blockedSections && blockedSections.includes(sectionId);
  };

  // Obtener precio del asiento
  const getSeatPrice = (section, row) => {
    if (!section) return 0;

    // Si el evento usa pricing por secciones
    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const sectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);

      if (sectionPricing) {
        // Si usa pricing por filas y la fila está especificada
        if (event.usesRowPricing && row && sectionPricing.rowPricing && sectionPricing.rowPricing.length > 0) {
          const rowPrice = sectionPricing.rowPricing.find(rp => rp.row === row);
          if (rowPrice) {
            return rowPrice.price;
          }
        }
        // Si no hay precio específico por fila, usar defaultPrice de la sección
        return sectionPricing.defaultPrice || section.defaultPrice || 0;
      }
    }

    // Fallback al precio por defecto de la sección
    return section.defaultPrice || 0;
  };

  // Validar disponibilidad del asiento
  const isSeatAvailable = (sectionId, row, seat) => {
    const seatId = `${sectionId}-${row}-${seat}`;

    // Verificar si la sección está bloqueada
    if (isSectionBlocked(sectionId)) return false;

    // Verificar si el asiento está ocupado
    if (occupiedSeats.includes(seatId)) return false;

    // Verificar si el asiento está bloqueado
    if (blockedSeats.includes(seatId)) return false;

    // Verificar si ya está seleccionado
    if (selectedSeats.some(s => s.id === seatId)) return false;

    return true;
  };

  // Manejar cambio de sección
  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    setSelectedRow(null);
    setSelectedSeatNumber(null);
  };

  // Agregar asiento seleccionado
  const handleAddSeat = () => {
    if (!currentSection) {
      notification.warning({
        message: 'Selección incompleta',
        description: 'Por favor, selecciona una sección.',
        placement: 'topRight'
      });
      return;
    }

    // Si es entrada general
    if (!currentSection.hasNumberedSeats) {
      // Verificar capacidad disponible
      const sectionOccupiedCount = occupiedSeats.filter(seatId =>
        seatId.startsWith(currentSection.id)
      ).length;

      const totalCapacity = currentSection.totalCapacity || 0;
      const remainingCapacity = totalCapacity - sectionOccupiedCount;

      if (remainingCapacity <= 0 || isSectionBlocked(currentSection.id)) {
        notification.error({
          message: 'Sección no disponible',
          description: 'Esta sección está completa o bloqueada.',
          placement: 'topRight'
        });
        return;
      }

      // Verificar límite de selección
      if (selectedSeats.length >= maxSeats) {
        notification.warning({
          message: 'Límite alcanzado',
          description: `Solo puedes seleccionar hasta ${maxSeats} asientos.`,
          placement: 'topRight'
        });
        return;
      }

      const price = getSeatPrice(currentSection, null);
      const seatData = {
        id: `${currentSection.id}-GA-${Date.now()}`,
        section: currentSection.name,
        sectionId: currentSection.id,
        price: price,
        isGeneralAdmission: true
      };

      onSeatSelect([...selectedSeats, seatData]);
      notification.success({
        message: 'Asiento agregado',
        description: `${currentSection.name} - Entrada General`,
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

    // Validar disponibilidad
    if (!isSeatAvailable(currentSection.id, selectedRow, selectedSeatNumber)) {
      notification.error({
        message: 'Asiento no disponible',
        description: 'Este asiento ya está ocupado, bloqueado o seleccionado.',
        placement: 'topRight'
      });
      return;
    }

    // Verificar límite de selección
    if (selectedSeats.length >= maxSeats) {
      notification.warning({
        message: 'Límite alcanzado',
        description: `Solo puedes seleccionar hasta ${maxSeats} asientos.`,
        placement: 'topRight'
      });
      return;
    }

    const price = getSeatPrice(currentSection, selectedRow);
    const seatId = `${currentSection.id}-${selectedRow}-${selectedSeatNumber}`;
    const seatData = {
      id: seatId,
      section: currentSection.name,
      sectionId: currentSection.id,
      row: selectedRow,
      seat: selectedSeatNumber,
      price: price
    };

    onSeatSelect([...selectedSeats, seatData]);
    notification.success({
      message: 'Asiento agregado',
      description: `${currentSection.name} - Fila ${selectedRow}, Asiento ${selectedSeatNumber}`,
      placement: 'topRight'
    });

    // Resetear selección de fila y asiento
    setSelectedRow(null);
    setSelectedSeatNumber(null);
  };

  // Eliminar asiento de la selección
  const handleRemoveSeat = (seatId) => {
    const newSeats = selectedSeats.filter(s => s.id !== seatId);
    onSeatSelect(newSeats);
    notification.info({
      message: 'Asiento eliminado',
      description: 'El asiento ha sido eliminado de tu selección.',
      placement: 'topRight'
    });
  };

  return (
    <div style={{
      padding: '12px',
      maxWidth: '100%',
      width: '100%',
      margin: '0 auto',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <Title level={3} style={{
        marginBottom: '16px',
        textAlign: 'center',
        fontSize: 'clamp(18px, 4vw, 24px)',
        wordWrap: 'break-word'
      }}>
        Selección manual de asientos
      </Title>

      <Alert
        message="Instrucciones"
        description="Selecciona la sección, fila y asiento deseado. Para entrada general, solo necesitas seleccionar la sección."
        type="info"
        showIcon
        style={{
          marginBottom: '16px',
          fontSize: 'clamp(12px, 2vw, 14px)'
        }}
      />

      {/* Formulario de selección */}
      <Card
        style={{
          marginBottom: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
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
              {sections.map(section => {
                const blocked = isSectionBlocked(section.id);
                return (
                  <Option
                    key={section.id}
                    value={section.id}
                    disabled={blocked}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      overflow: 'hidden'
                    }}>
                      <span style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginRight: '8px'
                      }}>
                        {section.name}
                        {!section.hasNumberedSeats && ' (Entrada General)'}
                      </span>
                      {blocked && <Tag color="red" style={{ flexShrink: 0 }}>Bloqueada</Tag>}
                    </div>
                  </Option>
                );
              })}
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

          {/* Información de precio */}
          {currentSection && (
            <div style={{
              padding: '16px',
              backgroundColor: COLORS.neutral.grey1,
              borderRadius: '8px',
              marginTop: '8px'
            }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Sección seleccionada:</Text>
                  <Text strong>{currentSection.name}</Text>
                </div>
                {currentSection.hasNumberedSeats && selectedRow && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Precio:</Text>
                    <Text strong style={{ color: COLORS.primary.main }}>
                      {formatPrice(getSeatPrice(currentSection, selectedRow))}
                    </Text>
                  </div>
                )}
                {!currentSection.hasNumberedSeats && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Precio:</Text>
                    <Text strong style={{ color: COLORS.primary.main }}>
                      {formatPrice(getSeatPrice(currentSection, null))}
                    </Text>
                  </div>
                )}
              </Space>
            </div>
          )}

          {/* Botón agregar */}
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddSeat}
            disabled={!currentSection || (currentSection.hasNumberedSeats && (!selectedRow || !selectedSeatNumber)) || selectedSeats.length >= maxSeats}
            block
          >
            Agregar asiento
          </Button>
        </Space>
      </Card>

      {/* Lista de asientos seleccionados */}
      {selectedSeats.length > 0 && (
        <Card
          title={
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <span style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
                Asientos seleccionados ({selectedSeats.length}/{maxSeats})
              </span>
              <Text strong style={{
                color: COLORS.primary.main,
                fontSize: 'clamp(14px, 3vw, 18px)',
                whiteSpace: 'nowrap'
              }}>
                Total: {formatPrice(totalPrice)}
              </Text>
            </div>
          }
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: `2px solid ${COLORS.primary.main}`,
            overflow: 'hidden'
          }}
        >
          <List
            dataSource={selectedSeats}
            renderItem={(seat) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveSeat(seat.id)}
                  >
                    Eliminar
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ fontSize: '24px', color: COLORS.primary.main }} />}
                  title={
                    <Space>
                      <Text strong>{seat.section}</Text>
                      {seat.isGeneralAdmission && <Tag color="green">Entrada General</Tag>}
                    </Space>
                  }
                  description={
                    seat.isGeneralAdmission
                      ? 'Entrada General'
                      : `Fila ${seat.row}, Asiento ${seat.seat}`
                  }
                />
                <Text strong style={{ color: COLORS.primary.main }}>
                  {formatPrice(seat.price)}
                </Text>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Mensaje si no hay asientos seleccionados */}
      {selectedSeats.length === 0 && (
        <Alert
          message="No hay asientos seleccionados"
          description="Usa el formulario anterior para agregar asientos a tu selección."
          type="warning"
          showIcon
        />
      )}
    </div>
  );
};

export default ManualSeatSelection;
