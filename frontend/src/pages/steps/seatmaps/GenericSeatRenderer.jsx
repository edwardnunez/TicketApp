import React from 'react';
import { Typography, Card } from 'antd';
import SeatRenderer from './SeatRenderer';
import { COLORS } from '../../../components/colorscheme';

const { Title, Text } = Typography;

const GenericSeatMapRenderer = ({
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

  const renderSectionCard = (section, additionalStyles = {}) => {
    const sectionBlocked = isSectionBlocked(section.id);
    
    return (
      <Card 
        style={{ 
          padding: 10, 
          margin: 5,
          opacity: sectionBlocked ? 0.5 : 1,
          backgroundColor: sectionBlocked ? '#f5f5f5' : 'white',
          border: sectionBlocked ? '2px dashed #ccc' : '1px solid #d9d9d9',
          position: 'relative',
          ...additionalStyles
        }}
      >
        {sectionBlocked && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            borderRadius: 6
          }}>
            <Text strong style={{ color: '#999', fontSize: 12 }}>SECCIÓN BLOQUEADA</Text>
          </div>
        )}
        
        {section.hasNumberedSeats ? (
          <SeatRenderer
            sectionId={section.id}
            rows={section.rows}
            seatsPerRow={section.seatsPerRow}
            price={section.price}
            color={section.color}
            name={section.name}
            selectedSeats={selectedSeats}
            occupiedSeats={filterOccupiedBySection(section.id)}
            blockedSeats={filterBlockedBySection(section.id)}
            sectionBlocked={sectionBlocked}
            maxSeats={maxSeats}
            onSeatSelect={onSeatSelect}
            formatPrice={formatPrice}
            event={event}
            calculateSeatPrice={calculateSeatPrice}
            sectionPricing={section.sectionPricing}
          />
        ) : (
          <GeneralAdmissionRenderer
            section={section}
            sectionBlocked={sectionBlocked}
            formatPrice={formatPrice}
            selectedSeats={selectedSeats}
            onSeatSelect={onSeatSelect}
            maxSeats={maxSeats}
          />
        )}
      </Card>
    );
  };

  const renderSectionHeader = (section) => {
    const sectionBlocked = isSectionBlocked(section.id);
    return (
      <Text 
        strong 
        style={{ 
          color: sectionBlocked ? '#999' : section.color,
          textDecoration: sectionBlocked ? 'line-through' : 'none',
          display: 'block',
          marginBottom: '8px'
        }}
      >
        {section.name} {sectionBlocked && '(BLOQUEADA)'}
        {!section.hasNumberedSeats && ' (Entrada General)'}
      </Text>
    );
  };

  const renderFootballLayout = () => {
    const tribunaNorte = sections.find(s => s.id.includes('norte') || s.name.toLowerCase().includes('norte'));
    const tribunaEste = sections.find(s => s.id.includes('este') || s.name.toLowerCase().includes('este'));
    const tribunaOeste = sections.find(s => s.id.includes('oeste') || s.name.toLowerCase().includes('oeste'));
    const tribunaSur = sections.find(s => s.id.includes('sur') || s.name.toLowerCase().includes('sur'));
    const vipSection = sections.find(s => s.id.includes('vip') || s.name.toLowerCase().includes('vip') || s.name.toLowerCase().includes('palco'));

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 30, 
        minWidth: 1000,
        minHeight: 700,
        padding: '30px',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.stadiumName || config?.venueName || name}
        </Title>

        {/* Tribuna Norte */}
        {tribunaNorte && (
          <div style={{ textAlign: 'center' }}>
            {renderSectionHeader(tribunaNorte)}
            {renderSectionCard(tribunaNorte)}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          gap: 80
        }}>
          {/* Tribuna Oeste */}
          {tribunaOeste && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              minWidth: 200,
              justifyContent: 'center',
              position: 'relative',
              marginRight: 40
            }}>
              <div style={{
                position: 'absolute',
                top: -60,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                zIndex: 2
              }}>
                {renderSectionHeader(tribunaOeste)}
              </div>
              {renderSectionCard(tribunaOeste, { 
                transform: 'rotate(-90deg)',
                marginTop: 50
              })}
            </div>
          )}

          {/* Campo o Escenario */}
          <div
            style={{
              width: config?.fieldDimensions?.width || config?.stageDimensions?.width || 400,
              height: config?.fieldDimensions?.height || config?.stageDimensions?.height || 260,
              backgroundColor: event?.type === 'concert' ? '#8B4513' : '#4CAF50',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              border: event?.type === 'concert' ? '3px solid #654321' : '3px solid #2E7D32',
              position: 'relative',
              flexShrink: 0,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {event?.type === 'concert' ? (
              <>
                <div style={{ 
                  position: 'absolute', 
                  top: '20%', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  width: '80%', 
                  height: 20, 
                  backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                  borderRadius: '4px' 
                }}></div>
                ESCENARIO
              </>
            ) : (
              <>
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  width: 80, 
                  height: 80, 
                  border: '2px solid white', 
                  borderRadius: '50%' 
                }}></div>
                CAMPO
              </>
            )}
          </div>

          {/* Tribuna Este */}
          {tribunaEste && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              minWidth: 200,
              justifyContent: 'center',
              position: 'relative',
              marginLeft: 40
            }}>
              <div style={{
                position: 'absolute',
                top: -60,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                zIndex: 2
              }}>
                {renderSectionHeader(tribunaEste)}
              </div>
              {renderSectionCard(tribunaEste, { 
                transform: 'rotate(90deg)',
                marginTop: 50
              })}
            </div>
          )}
        </div>

        {/* Tribuna Sur */}
        {tribunaSur && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            {renderSectionCard(tribunaSur)}
            {renderSectionHeader(tribunaSur)}
          </div>
        )}

        {/* VIP */}
        {vipSection && (
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            {renderSectionHeader(vipSection)}
            {renderSectionCard(vipSection, {
              border: `2px solid ${isSectionBlocked(vipSection.id) ? '#ccc' : vipSection.color}`,
              backgroundColor: isSectionBlocked(vipSection.id) ? '#f5f5f5' : vipSection.color + '20'
            })}
          </div>
        )}
      </div>
    );
  };

  const renderArenaLayout = () => {
    // Encontrar secciones específicas del arena
    const pistaSection = sections.find(s => s.id.includes('pista') || s.name.toLowerCase().includes('pista'));
    const lowerSections = sections.filter(s => 
      (s.id.includes('lower') || s.name.toLowerCase().includes('bajo') || s.name.toLowerCase().includes('lower')) &&
      !s.id.includes('pista')
    );
    const upperSections = sections.filter(s => 
      s.id.includes('upper') || s.name.toLowerCase().includes('alto') || s.name.toLowerCase().includes('upper')
    );
    const vipSections = sections.filter(s => 
      s.id.includes('vip') || s.name.toLowerCase().includes('vip') || s.name.toLowerCase().includes('palco')
    );

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 20, 
        minWidth: 800,
        minHeight: 600,
        padding: '30px',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.venueName || name}
        </Title>

        {/* Secciones VIP (arriba) */}
        {vipSections.length > 0 && (
          <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', justifyContent: 'center' }}>
            {vipSections.map(section => (
              <div key={section.id} style={{ textAlign: 'center' }}>
                {renderSectionHeader(section)}
                {renderSectionCard(section, {
                  border: `2px solid ${isSectionBlocked(section.id) ? '#ccc' : section.color}`,
                  backgroundColor: isSectionBlocked(section.id) ? '#f5f5f5' : section.color + '20'
                })}
              </div>
            ))}
          </div>
        )}

        {/* Secciones superiores */}
        {upperSections.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {upperSections.map(section => (
              <div key={section.id} style={{ textAlign: 'center', flex: '0 1 200px' }}>
                {renderSectionHeader(section)}
                {renderSectionCard(section)}
              </div>
            ))}
          </div>
        )}

        {/* Escenario */}
        <div
          style={{
            width: config?.stageDimensions?.width || 300,
            height: config?.stageDimensions?.height || 40,
            backgroundColor: '#8B4513',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            border: '3px solid #654321',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            margin: '10px 0'
          }}
        >
          ESCENARIO
        </div>

        {/* Pista (si existe) */}
        {pistaSection && (
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            {renderSectionHeader(pistaSection)}
            {renderSectionCard(pistaSection, {
              border: `3px solid ${isSectionBlocked(pistaSection.id) ? '#ccc' : pistaSection.color}`,
              backgroundColor: isSectionBlocked(pistaSection.id) ? '#f5f5f5' : pistaSection.color + '15',
              minHeight: 100
            })}
          </div>
        )}

        {/* Secciones inferiores */}
        {lowerSections.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {lowerSections.map(section => (
              <div key={section.id} style={{ textAlign: 'center', flex: '0 1 200px' }}>
                {renderSectionHeader(section)}
                {renderSectionCard(section)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCinemaLayout = () => {
    const sortedSections = [...sections].sort((a, b) => {
      const order = { premium: 0, front: 1, middle: 2, back: 3 };
      const aOrder = order[a.id] !== undefined ? order[a.id] : 999;
      const bOrder = order[b.id] !== undefined ? order[b.id] : 999;
      return aOrder - bOrder;
    });

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 10,
        minWidth: 400,
        padding: '20px',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.cinemaName || name}
        </Title>

        <div
          style={{
            width: config?.screenWidth || 300,
            height: 20,
            backgroundColor: '#333',
            borderRadius: '10px 10px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
            marginBottom: 20,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          PANTALLA
        </div>

        {sortedSections.map(section => (
          <div key={section.id} style={{ textAlign: 'center', marginBottom: 15 }}>
            {renderSectionHeader(section)}
            {renderSectionCard(section, {
              ...(section.id === 'premium' && !isSectionBlocked(section.id) && {
                border: '2px solid #9C27B0',
                backgroundColor: '#F3E5F5'
              })
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderTheaterLayout = () => {
    const sortedSections = [...sections].sort((a, b) => {
      const order = { boxes: 0, orchestra: 1, mezzanine: 2, balcony: 3 };
      const aOrder = order[a.id] !== undefined ? order[a.id] : 999;
      const bOrder = order[b.id] !== undefined ? order[b.id] : 999;
      return aOrder - bOrder;
    });

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 15,
        minWidth: 400,
        padding: '20px',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.theaterName || name}
        </Title>

        <div
          style={{
            width: config?.stageWidth || 250,
            height: 30,
            backgroundColor: '#8B4513',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 14,
            marginBottom: 20,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            border: '2px solid #654321'
          }}
        >
          ESCENARIO
        </div>

        {sortedSections.map(section => (
          <div key={section.id} style={{ textAlign: 'center', marginBottom: 15 }}>
            {renderSectionHeader(section)}
            {renderSectionCard(section, {
              ...(section.id === 'boxes' && !isSectionBlocked(section.id) && {
                border: '2px solid #9C27B0',
                backgroundColor: '#F3E5F5'
              })
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderGenericLayout = () => {
    const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {name}
        </Title>

        <div style={{ width: '100%', maxWidth: '800px' }}>
          {sortedSections.map(section => {
            const sectionBlocked = isSectionBlocked(section.id);
            return (
              <div key={section.id} style={{ marginBottom: '24px', position: 'relative' }}>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: sectionBlocked ? '#f5f5f5' : section.color + '20',
                  borderLeft: `4px solid ${sectionBlocked ? '#ccc' : section.color}`,
                  marginBottom: '12px',
                  borderRadius: '4px',
                  opacity: sectionBlocked ? 0.6 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={5} style={{ 
                      margin: 0, 
                      color: sectionBlocked ? '#999' : COLORS.neutral.darker,
                      textDecoration: sectionBlocked ? 'line-through' : 'none'
                    }}>
                      {section.name} {sectionBlocked && '(BLOQUEADA)'}
                      {!section.hasNumberedSeats && ' (Entrada General)'}
                    </Title>
                    <Typography.Text strong style={{ 
                      color: sectionBlocked ? '#999' : section.color 
                    }}>
                      {formatPrice(section.price)}
                    </Typography.Text>
                  </div>
                  <Typography.Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                    {section.hasNumberedSeats 
                      ? `${section.rows} filas × ${section.seatsPerRow} asientos por fila`
                      : `Capacidad: ${section.totalCapacity} personas`
                    }
                  </Typography.Text>
                </div>
                <div style={{ position: 'relative' }}>
                  {sectionBlocked && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                      borderRadius: 6
                    }}>
                      <Text strong style={{ color: '#999', fontSize: 14 }}>SECCIÓN BLOQUEADA</Text>
                    </div>
                  )}
                  {section.hasNumberedSeats ? (
                    <SeatRenderer
                      sectionId={section.id}
                      rows={section.rows}
                      seatsPerRow={section.seatsPerRow}
                      price={section.price}
                      color={section.color}
                      name={section.name}
                      selectedSeats={selectedSeats}
                      occupiedSeats={filterOccupiedBySection(section.id)}
                      blockedSeats={filterBlockedBySection(section.id)}
                      sectionBlocked={sectionBlocked}
                      maxSeats={maxSeats}
                      onSeatSelect={onSeatSelect}
                      formatPrice={formatPrice}
                      event={event}
                      calculateSeatPrice={calculateSeatPrice}
                      sectionPricing={section.sectionPricing}
                    />
                  ) : (
                    <GeneralAdmissionRenderer
                      section={section}
                      sectionBlocked={sectionBlocked}
                      formatPrice={formatPrice}
                      selectedSeats={selectedSeats}
                      onSeatSelect={onSeatSelect}
                      maxSeats={maxSeats}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar según el tipo
  switch (type) {
    case 'football':
      return renderFootballLayout();
    case 'arena':
      return renderArenaLayout();
    case 'cinema':
      return renderCinemaLayout();
    case 'theater':
      return renderTheaterLayout();
    default:
      return renderGenericLayout();
  }
};

// Componente para secciones de entrada general (sin asientos numerados)
const GeneralAdmissionRenderer = ({ 
  section, 
  sectionBlocked, 
  formatPrice, 
  selectedSeats, 
  onSeatSelect, 
  maxSeats 
}) => {
  const isSelected = selectedSeats.some(s => s.sectionId === section.id);

  const handleSectionClick = () => {
    if (sectionBlocked) return;

    const sectionData = {
      id: `${section.id}-GA`,
      section: section.name,
      sectionId: section.id,
      price: section.price,
      isGeneralAdmission: true
    };

    if (isSelected) {
      onSeatSelect(selectedSeats.filter(s => s.sectionId !== section.id));
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect([...selectedSeats, sectionData]);
    }
  };

  return (
    <div
      style={{
        minHeight: 80,
        backgroundColor: sectionBlocked ? '#f5f5f5' : (isSelected ? section.color : section.color + '30'),
        border: `2px ${isSelected ? 'solid' : 'dashed'} ${sectionBlocked ? '#ccc' : section.color}`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: sectionBlocked ? 'not-allowed' : 'pointer',
        opacity: sectionBlocked ? 0.5 : 1,
        transition: 'all 0.2s ease'
      }}
      onClick={handleSectionClick}
    >
      <div style={{ textAlign: 'center', padding: '10px' }}>
        <Text strong style={{ 
          color: sectionBlocked ? '#999' : (isSelected ? 'white' : section.color),
          display: 'block',
          marginBottom: 4
        }}>
          ENTRADA GENERAL
        </Text>
        <Text style={{ 
          color: sectionBlocked ? '#999' : (isSelected ? 'white' : '#666'),
          fontSize: 12
        }}>
          Capacidad: {section.totalCapacity}
        </Text>
        <Text style={{ 
          color: sectionBlocked ? '#999' : (isSelected ? 'white' : section.color),
          fontSize: 14,
          fontWeight: 'bold',
          display: 'block',
          marginTop: 4
        }}>
          {formatPrice(section.price)}
        </Text>
      </div>
    </div>
  );
};

export default GenericSeatMapRenderer;