import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Collapse, Badge, Tooltip, notification } from 'antd';
import { DownOutlined, UpOutlined, CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
import { COLORS } from '../../../components/colorscheme';
import SeatRenderer from './SeatRenderer';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ResponsiveStyleRenderer = ({
  seatMapData,
  selectedSeats,
  onSeatSelect,
  maxSeats,
  occupiedSeats,
  blockedSeats,
  blockedSections,
  formatPrice,
  event,
  calculateSeatPrice
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [hoveredSection, setHoveredSection] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!seatMapData) return null;

  const { sections, config, type, name } = seatMapData;

  const filterOccupiedBySection = (sectionId) => {
    if (!occupiedSeats || !occupiedSeats.length) return [];
    return occupiedSeats.filter(seatId => seatId.startsWith(sectionId));
  };

  const filterBlockedBySection = (sectionId) => {
    if (!blockedSeats || !blockedSeats.length) return [];
    return blockedSeats.filter(seatId => seatId.startsWith(sectionId));
  };

  const isSectionBlocked = (sectionId) => {
    return blockedSections && blockedSections.includes(sectionId);
  };

  const getSectionCapacityFromPricing = (sectionId) => {
    if (!event?.sectionPricing) return null;
    const pricing = event.sectionPricing.find(p => p.sectionId === sectionId);
    return pricing ? pricing.capacity : null;
  };

  const getSectionPrice = (section) => {
    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
      if (eventSectionPricing) {
        return eventSectionPricing.defaultPrice || section.defaultPrice;
      }
    }
    return section.defaultPrice;
  };

  const getSectionAvailability = (section) => {
    const sectionOccupiedSeats = filterOccupiedBySection(section.id);
    const pricingCapacity = getSectionCapacityFromPricing(section.id);
    const totalCapacity = pricingCapacity || (section.hasNumberedSeats ? section.rows * section.seatsPerRow : section.totalCapacity) || 0;
    const occupiedCount = sectionOccupiedSeats.length;
    const remainingCapacity = Math.max(totalCapacity - occupiedCount, 0);
    const capacityPercentage = totalCapacity > 0 ? ((totalCapacity - remainingCapacity) / totalCapacity) * 100 : 0;

    return {
      totalCapacity,
      occupiedCount,
      remainingCapacity,
      capacityPercentage,
      isFullyBooked: isSectionBlocked(section.id) || remainingCapacity <= 0,
      isNearCapacity: capacityPercentage > 80
    };
  };

  const handleSectionToggle = (sectionId) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
  };

  const renderSectionButton = (section) => {
    const availability = getSectionAvailability(section);
    const sectionPrice = getSectionPrice(section);
    const isExpanded = expandedSections.has(section.id);
    const sectionSelectedSeats = selectedSeats.filter(s => s.sectionId === section.id);
    const hasSelectedSeats = sectionSelectedSeats.length > 0;

    return (
      <Card
        key={section.id}
        style={{
          marginBottom: '16px',
          border: hasSelectedSeats 
            ? `2px solid ${COLORS.primary.main}` 
            : `1px solid ${COLORS.neutral.grey2}`,
          borderRadius: '12px',
          backgroundColor: hasSelectedSeats ? `${COLORS.primary.light}10` : COLORS.neutral.white,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          opacity: availability.isFullyBooked ? 0.6 : 1,
          transform: hoveredSection === section.id ? 'scale(1.02)' : 'scale(1)',
          boxShadow: hoveredSection === section.id 
            ? '0 8px 24px rgba(0,0,0,0.12)' 
            : '0 2px 8px rgba(0,0,0,0.08)'
        }}
        onMouseEnter={() => setHoveredSection(section.id)}
        onMouseLeave={() => setHoveredSection(null)}
        onClick={() => {
          if (!availability.isFullyBooked) {
            handleSectionToggle(section.id);
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Title level={5} style={{ 
                margin: 0, 
                color: availability.isFullyBooked ? COLORS.neutral.grey4 : COLORS.neutral.darker,
                textDecoration: availability.isFullyBooked ? 'line-through' : 'none'
              }}>
                {section.name}
                {availability.isFullyBooked && ' (AGOTADO)'}
                {!section.hasNumberedSeats && ' (Entrada General)'}
              </Title>
              
              {hasSelectedSeats && (
                <Badge 
                  count={sectionSelectedSeats.length} 
                  style={{ 
                    backgroundColor: COLORS.primary.main,
                    color: 'white'
                  }} 
                />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                {section.hasNumberedSeats 
                  ? `${section.rows} filas × ${section.seatsPerRow} asientos`
                  : `Capacidad: ${availability.totalCapacity} personas`
                }
              </Text>
              
              <Text style={{ 
                color: availability.isNearCapacity ? '#ff4d4f' : COLORS.neutral.grey4, 
                fontSize: '12px' 
              }}>
                {availability.remainingCapacity} disponibles
                {availability.isNearCapacity && !availability.isFullyBooked && ' (¡Pocas quedan!)'}
              </Text>
            </div>

            {/* Barra de disponibilidad */}
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: COLORS.neutral.grey2,
              borderRadius: '2px',
              marginTop: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${availability.capacityPercentage}%`,
                backgroundColor: availability.isNearCapacity ? '#ff4d4f' : COLORS.primary.main,
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end', 
            gap: '8px',
            marginLeft: '16px'
          }}>
            <Title level={4} style={{ 
              margin: 0, 
              color: COLORS.primary.main,
              fontSize: '18px'
            }}>
              {formatPrice(sectionPrice)}
            </Title>
            
            <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
              por {section.hasNumberedSeats ? 'asiento' : 'entrada'}
            </Text>

            <Button
              type="text"
              icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
              size="small"
              style={{
                color: COLORS.neutral.grey4,
                padding: '4px 8px',
                height: 'auto',
                minHeight: 'auto'
              }}
            />
          </div>
        </div>

        {/* Contenido expandible */}
        {isExpanded && !availability.isFullyBooked && (
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: `1px solid ${COLORS.neutral.grey2}` 
          }}>
            {section.hasNumberedSeats ? (
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                overflowX: 'auto',
                padding: '8px',
                backgroundColor: COLORS.neutral.grey1,
                borderRadius: '8px',
                // Hacer que el contenedor se ajuste al contenido
                width: 'fit-content',
                minWidth: '100%'
              }}>
                <SeatRenderer
                  sectionId={section.id}
                  rows={section.rows}
                  seatsPerRow={section.seatsPerRow}
                  price={sectionPrice}
                  color={section.color}
                  name={section.name}
                  selectedSeats={selectedSeats}
                  occupiedSeats={filterOccupiedBySection(section.id)}
                  blockedSeats={filterBlockedBySection(section.id)}
                  sectionBlocked={isSectionBlocked(section.id)}
                  maxSeats={maxSeats}
                  onSeatSelect={onSeatSelect}
                  formatPrice={formatPrice}
                  event={event}
                  calculateSeatPrice={calculateSeatPrice}
                  sectionPricing={section.sectionPricing}
                  compactMode={true} // Modo compacto para móviles
                  responsiveMode={true} // Nuevo prop para indicar que está en modo responsive
                />
              </div>
            ) : (
              <GeneralAdmissionRenderer
                section={section}
                sectionBlocked={isSectionBlocked(section.id)}
                occupiedSeats={filterOccupiedBySection(section.id)}
                formatPrice={formatPrice}
                selectedSeats={selectedSeats}
                onSeatSelect={onSeatSelect}
                maxSeats={maxSeats}
                event={event}
                sectionCapacityFromPricing={getSectionCapacityFromPricing(section.id)}
              />
            )}
          </div>
        )}
      </Card>
    );
  };

  const renderLayout = () => {
    const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px',
        minHeight: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, color: COLORS.neutral.darker }}>
            {config?.venueName || name}
          </Title>
          <Text style={{ color: COLORS.neutral.grey4 }}>
            Selecciona una sección para ver los asientos disponibles
          </Text>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {sortedSections.map(section => renderSectionButton(section))}
        </div>

        {selectedSeats.length > 0 && (
          <Card style={{ 
            marginTop: '24px', 
            backgroundColor: COLORS.neutral.white,
            border: `2px solid ${COLORS.primary.main}`
          }}>
            <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
              Resumen de selección ({selectedSeats.length} asiento{selectedSeats.length !== 1 ? 's' : ''})
            </Title>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {selectedSeats.map(seat => (
                <div key={seat.id} style={{
                  padding: '12px',
                  backgroundColor: COLORS.neutral.grey1,
                  borderRadius: '8px',
                  border: `1px solid ${COLORS.neutral.grey2}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{seat.section}</Text><br />
                      <Text style={{ color: COLORS.neutral.grey4 }}>
                        {seat.row != null && seat.seat != null
                          ? `Fila ${seat.row}, Asiento ${seat.seat}`
                          : `Entrada general`}
                      </Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text strong style={{ color: COLORS.primary.main }}>
                        {formatPrice(seat.price || 0)}
                      </Text><br />
                      <Button 
                        size="small" 
                        type="link" 
                        danger 
                        onClick={() => {
                          const newSeats = selectedSeats.filter(s => s.id !== seat.id);
                          onSeatSelect(newSeats);
                        }}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ 
              marginTop: '16px', 
              padding: '16px', 
              backgroundColor: COLORS.primary.light + '20',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Title level={4} style={{ color: COLORS.neutral.darker, margin: 0 }}>
                Total:
              </Title>
              <Title level={3} style={{ color: COLORS.primary.main, margin: 0 }}>
                {formatPrice(selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0))}
              </Title>
            </div>
          </Card>
        )}
      </div>
    );
  };

  return renderLayout();
};

// Componente para entrada general (reducido en tamaño)
const GeneralAdmissionRenderer = ({ 
  section, 
  sectionBlocked, 
  formatPrice, 
  selectedSeats, 
  occupiedSeats = [],
  onSeatSelect, 
  maxSeats,
  event,
  sectionCapacityFromPricing
}) => {
  const sameSectionSelected = selectedSeats.filter(s => s.sectionId === section.id);
  const isSelected = sameSectionSelected.length > 0;

  // Capacidad
  const pricingCapacity = sectionCapacityFromPricing;
  const occupiedCount = occupiedSeats.filter(seatId => seatId.startsWith(section.id)).length;
  const totalCapacity = pricingCapacity || section.totalCapacity || 0;
  const remainingCapacity = Math.max(totalCapacity - occupiedCount, 0);
  const capacityPercentage = totalCapacity > 0 ? ((totalCapacity - remainingCapacity) / totalCapacity) * 100 : 0;

  const isFullyBooked = sectionBlocked || remainingCapacity <= 0;
  const isNearCapacity = capacityPercentage > 80;

  const handleSectionClick = () => {
    if (isFullyBooked) return;

    const sameSectionSelected = selectedSeats.filter(s => s.sectionId === section.id);

    if (sameSectionSelected.length >= remainingCapacity) {
      notification.warning({
        message: 'Capacidad insuficiente',
        description: `Solo quedan ${remainingCapacity} entradas disponibles en esta sección.`,
        placement: 'topRight',
        style: {
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      });
      return;
    }

    // Obtener el precio correcto del evento si está disponible
    let correctPrice = section.defaultPrice;
    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
      if (eventSectionPricing) {
        correctPrice = eventSectionPricing.defaultPrice || section.defaultPrice;
      }
    }

    const sectionData = {
      id: `${section.id}-GA-${Date.now()}`,
      section: section.name,
      sectionId: section.id,
      price: correctPrice,
      isGeneralAdmission: true
    };

    if (selectedSeats.length < maxSeats) {
      onSeatSelect([...selectedSeats, sectionData]);
    }
  };

  if (isFullyBooked) {
    return (
      <div style={{
        padding: '16px',
        textAlign: 'center',
        color: '#999',
        fontSize: '12px'
      }}>
        <div style={{ fontSize: '16px', marginBottom: '6px' }}>⚠️</div>
        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>AGOTADO</div>
        <div style={{ fontSize: '10px' }}>No hay entradas disponibles</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minWidth: '160px',
        padding: '16px',
        background: isSelected 
          ? `linear-gradient(135deg, ${section.color} 0%, ${section.color}dd 100%)`
          : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        border: `2px solid ${isSelected ? section.color : section.color + '40'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isSelected 
          ? `0 6px 24px ${section.color}30, 0 0 0 3px ${section.color}20`
          : '0 3px 12px rgba(0,0,0,0.08)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={handleSectionClick}
    >
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          fontSize: '18px', 
          marginBottom: '6px',
          filter: isSelected ? 'brightness(0) invert(1)' : 'none'
        }}>
          {isSelected ? '✓' : '🎫'}
        </div>
        
        <Text strong style={{ 
          color: isSelected ? 'white' : section.color,
          display: 'block',
          marginBottom: '6px',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {isSelected ? 'SELECCIONADO' : 'ENTRADA GENERAL'}
        </Text>

        <div style={{
          width: '100%',
          height: '3px',
          backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : section.color + '20',
          borderRadius: '2px',
          marginBottom: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${capacityPercentage}%`,
            backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : (isNearCapacity ? '#ff4d4f' : section.color),
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        
        <Text style={{ 
          color: isSelected ? 'rgba(255,255,255,0.9)' : '#666',
          fontSize: '10px',
          display: 'block',
          marginBottom: '8px'
        }}>
          {remainingCapacity} de {totalCapacity} disponibles
          {isNearCapacity && !isSelected && (
            <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>
              (¡Pocas quedan!)
            </span>
          )}
        </Text>

        <div style={{
          padding: '6px 12px',
          background: isSelected ? 'rgba(255,255,255,0.2)' : section.color + '10',
          borderRadius: '16px',
          display: 'inline-block'
        }}>
          <Text style={{ 
            color: isSelected ? 'white' : section.color,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {(() => {
              let correctPrice = section.defaultPrice;
              if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
                const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
                if (eventSectionPricing) {
                  correctPrice = eventSectionPricing.defaultPrice || section.defaultPrice;
                }
              }
              return formatPrice(correctPrice);
            })()}
          </Text>
        </div>

        {sameSectionSelected.length > 1 && (
          <div style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '20px',
            height: '20px',
            backgroundColor: section.color,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            {sameSectionSelected.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveStyleRenderer;