import React from 'react';
import SeatRenderer from './SeatRenderer';
import { COLORS } from '../../../components/colorscheme';
import { Typography, notification, Card } from 'antd';

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

  
  const getSectionCapacityFromPricing = (sectionId) => {
    if (!event?.sectionPricing) return null;
    const pricing = event.sectionPricing.find(p => p.sectionId === sectionId);
    console.log(`Section ${sectionId} pricing:`, pricing);
    console.log(`Capacity for section ${sectionId}:`, pricing ? pricing.capacity : null);
    return pricing ? pricing.capacity : null;
  };

  const renderSectionCard = (section = {}) => {
    const sectionBlocked = isSectionBlocked(section.id);
    
    return (
      <Card 
        style={{ 
          padding: 10, 
          margin: 5,
          opacity: sectionBlocked ? 0.5 : 1,
          backgroundColor: sectionBlocked ? '#f5f5f5' : 'white',
          border: sectionBlocked ? '2px dashed #ccc' : '1px solid #d9d9d9',
          position: 'relative'
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
            occupiedSeats={filterOccupiedBySection(section.id)}
            formatPrice={formatPrice}
            selectedSeats={selectedSeats}
            onSeatSelect={onSeatSelect}
            maxSeats={maxSeats}
            event={event}
            sectionCapacityFromPricing={getSectionCapacityFromPricing(section.id)}
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
              top: -80,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              zIndex: 2
            }}>
              {renderSectionHeader(tribunaOeste)}
            </div>
            
            {/* Contenedor rotado */}
            <div style={{ 
              transform: 'rotate(-90deg)',
              transformOrigin: 'center center',
              marginTop: 60
            }}>
              {renderSectionCard(tribunaOeste)}
            </div>
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
              top: -80,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              zIndex: 2
            }}>
              {renderSectionHeader(tribunaEste)}
            </div>
            
            <div style={{ 
              transform: 'rotate(90deg)',
              transformOrigin: 'center center',
              marginTop: 60
            }}>
              {renderSectionCard(tribunaEste)}
            </div>
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

  const renderConcertLayout = () => {
    // Identificar secciones por nombres comunes en conciertos
    const sectionNorth = sections.find(s => 
      s.id.includes('north') || s.name.toLowerCase().includes('north') ||
      s.id.includes('norte') || s.name.toLowerCase().includes('norte') ||
      s.name.toLowerCase().includes('fondo') || s.name.toLowerCase().includes('back')
    );
    
    const sectionEast = sections.find(s => 
      s.id.includes('east') || s.name.toLowerCase().includes('east') ||
      s.id.includes('este') || s.name.toLowerCase().includes('este') ||
      s.name.toLowerCase().includes('right') || s.name.toLowerCase().includes('derecha')
    );
    
    const sectionWest = sections.find(s => 
      s.id.includes('west') || s.name.toLowerCase().includes('west') ||
      s.id.includes('oeste') || s.name.toLowerCase().includes('oeste') ||
      s.name.toLowerCase().includes('left') || s.name.toLowerCase().includes('izquierda')
    );
    
    const sectionSouth = sections.find(s => 
      s.id.includes('south') || s.name.toLowerCase().includes('south') ||
      s.id.includes('sur') || s.name.toLowerCase().includes('sur') ||
      s.name.toLowerCase().includes('front') || s.name.toLowerCase().includes('frente')
    );

    // Secciones de entrada general sin asientos numerados (PISTA)
    const pistaSection = sections.find(s => 
      s.hasNumberedSeats === false || 
      s.name.toLowerCase().includes('general') ||
      s.name.toLowerCase().includes('pista')
    );

    // Sección VIP (puede estar separada)
    const vipSection = sections.find(s => 
      s.id.includes('vip') || s.name.toLowerCase().includes('vip') ||
      s.name.toLowerCase().includes('premium') || s.name.toLowerCase().includes('palco')
    );

    // Resto de secciones que no coincidan con las anteriores
    const otherSections = sections.filter(s => 
      s !== sectionNorth && s !== sectionEast && s !== sectionWest && 
      s !== sectionSouth && s !== vipSection && s !== pistaSection
    );

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 30, 
        minWidth: 1200,
        minHeight: 800,
        padding: '30px',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.venueName || name}
        </Title>

        {/* Sección Norte/Fondo */}
        {sectionNorth && (
          <div style={{ textAlign: 'center' }}>
            {renderSectionHeader(sectionNorth)}
            {renderSectionCard(sectionNorth)}
          </div>
        )}

        {/* Fila central horizontal: Sección Oeste | Escenario+Pista | Sección Este */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          gap: 60
        }}>
          {/* Sección Oeste/Izquierda */}
          {sectionWest && (
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
                top: -70,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                zIndex: 2
              }}>
                {renderSectionHeader(sectionWest)}
              </div>
              <div style={{ transform: 'rotate(-90deg)', marginTop: 50 }}>
                {renderSectionCard(sectionWest)}
              </div>
            </div>
          )}

          {/* Área central: Escenario + Pista */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '16px',
            position: 'relative'
          }}>
            {/* Escenario */}
            <div
              style={{
                width: config?.stageWidth || 300,
                height: config?.stageHeight || 80,
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 20,
                fontWeight: 'bold',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                border: '3px solid #E55A00',
                position: 'relative',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                zIndex: 2
              }}
            >
              {/* Luces del escenario */}
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '20%',
                right: '20%',
                height: '4px',
                background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)',
                borderRadius: '2px',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
              }}></div>
              
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>
                ESCENARIO
              </div>
            </div>

            
{pistaSection && (
                <div style={{ 
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  {/* Header de la sección pista */}
                  <div style={{ marginBottom: '12px' }}>
                    <Text 
                      strong 
                      style={{ 
                        color: isSectionBlocked(pistaSection.id) ? '#999' : pistaSection.color,
                        textDecoration: isSectionBlocked(pistaSection.id) ? 'line-through' : 'none',
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}
                    >
                      {pistaSection.name} {isSectionBlocked(pistaSection.id) && '(BLOQUEADA)'}
                      {!pistaSection.hasNumberedSeats && ' (Entrada General)'}
                    </Text>
                  </div>
                  
                  {/* Contenedor de la pista MÁS GRANDE */}
                  <div style={{
                    width: (config?.stageWidth || 300) + 120, // CAMBIADO: de +80 a +120
                    height: (config?.stageHeight || 80) + 120, // CAMBIADO: de +80 a +120
                    position: 'relative',
                    margin: '0 auto'
                  }}>
                    {/* Área de la pista simplificada */}
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: isSectionBlocked(pistaSection.id) 
                        ? 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
                        : `linear-gradient(135deg, ${pistaSection.color}08 0%, ${pistaSection.color}15 50%, ${pistaSection.color}08 100%)`,
                      border: `3px solid ${isSectionBlocked(pistaSection.id) ? '#ccc' : pistaSection.color}`,
                      borderRadius: '12px',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isSectionBlocked(pistaSection.id) 
                        ? '0 4px 12px rgba(0,0,0,0.1)'
                        : `0 8px 24px ${pistaSection.color}20`,
                      transition: 'all 0.3s ease'
                    }}>
                      {/* Overlay de bloqueo */}
                      {isSectionBlocked(pistaSection.id) && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(255,255,255,0.8)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 3,
                          borderRadius: '9px'
                        }}>
                          <div style={{
                            fontSize: '20px',
                            marginBottom: '4px',
                            opacity: 0.6
                          }}>🚫</div>
                          <Text strong style={{ 
                            color: '#999', 
                            fontSize: '12px'
                          }}>
                            PISTA BLOQUEADA
                          </Text>
                        </div>
                      )}

                      {/* Componente de entrada general */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2
                      }}>
                        <GeneralAdmissionRenderer
                          section={pistaSection}
                          sectionBlocked={isSectionBlocked(pistaSection.id)}
                          formatPrice={formatPrice}
                          selectedSeats={selectedSeats}
                          occupiedSeats={filterOccupiedBySection(pistaSection.id)}
                          onSeatSelect={onSeatSelect}
                          maxSeats={maxSeats}
                          event={event}
                          sectionCapacityFromPricing={getSectionCapacityFromPricing(pistaSection.id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Sección Este/Derecha */}
          {sectionEast && (
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
                top: -70,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                zIndex: 2
              }}>
                {renderSectionHeader(sectionEast)}
              </div>
              <div style={{ transform: 'rotate(90deg)', marginTop: 50 }}>
                {renderSectionCard(sectionEast)}
              </div>
            </div>
          )}
        </div>

        {/* Sección Sur/Frente */}
        {sectionSouth && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            {renderSectionCard(sectionSouth)}
            {renderSectionHeader(sectionSouth)}
          </div>
        )}

        {/* Sección VIP */}
        {vipSection && (
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            {renderSectionHeader(vipSection)}
            {renderSectionCard(vipSection, {
              border: `2px solid ${isSectionBlocked(vipSection.id) ? '#ccc' : vipSection.color}`,
              backgroundColor: isSectionBlocked(vipSection.id) ? '#f5f5f5' : vipSection.color + '20',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            })}
          </div>
        )}

        {/* Otras secciones adicionales */}
        {otherSections.length > 0 && (
          <div style={{ marginTop: 30, display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
            {otherSections.map(section => (
              <div key={section.id} style={{ textAlign: 'center' }}>
                {renderSectionHeader(section)}
                {renderSectionCard(section)}
              </div>
            ))}
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
                      ? (() => {
                          const pricingCapacity = getSectionCapacityFromPricing(section.id);
                          const displayCapacity = pricingCapacity || (section.rows * section.seatsPerRow);
                          const displayRows = event?.sectionPricing?.find(p => p.sectionId === section.id)?.rows || section.rows;
                          const displaySeatsPerRow = event?.sectionPricing?.find(p => p.sectionId === section.id)?.seatsPerRow || section.seatsPerRow;
                          return `${displayRows} filas × ${displaySeatsPerRow} asientos por fila (${displayCapacity} total)`;
                        })()
                      : (() => {
                          const pricingCapacity = getSectionCapacityFromPricing(section.id);
                          const displayCapacity = pricingCapacity || section.totalCapacity;
                          return `Capacidad: ${displayCapacity} personas`;
                        })()
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
                      occupiedSeats={filterOccupiedBySection(section.id)}
                      selectedSeats={selectedSeats}
                      onSeatSelect={onSeatSelect}
                      maxSeats={maxSeats}
                      event={event}
                      sectionCapacityFromPricing={getSectionCapacityFromPricing(section.id)}
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
    case 'concert':
      return renderConcertLayout();
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
    let correctPrice = section.price;
    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
      if (eventSectionPricing) {
        correctPrice = eventSectionPricing.defaultPrice || section.price;
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
        padding: '20px',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px'
      }}>
        <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠️</div>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>AGOTADO</div>
        <div style={{ fontSize: '12px' }}>No hay entradas disponibles</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minWidth: '200px',
        padding: '20px',
        background: isSelected 
          ? `linear-gradient(135deg, ${section.color} 0%, ${section.color}dd 100%)`
          : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        border: `2px solid ${isSelected ? section.color : section.color + '40'}`,
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isSelected 
          ? `0 8px 32px ${section.color}30, 0 0 0 4px ${section.color}20`
          : '0 4px 16px rgba(0,0,0,0.08)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={handleSectionClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.target.style.transform = 'scale(1.02)';
          e.target.style.boxShadow = `0 8px 24px ${section.color}20`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
        }
      }}
    >
      {/* Efecto de brillo para seleccionado */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `linear-gradient(45deg, transparent 30%, ${section.color}20 50%, transparent 70%)`,
          animation: 'shimmer 2s infinite',
          pointerEvents: 'none'
        }}></div>
      )}

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Icono y estado */}
        <div style={{ 
          fontSize: '24px', 
          marginBottom: '8px',
          filter: isSelected ? 'brightness(0) invert(1)' : 'none'
        }}>
          {isSelected ? '✓' : '🎫'}
        </div>
        
        {/* Título */}
        <Text strong style={{ 
          color: isSelected ? 'white' : section.color,
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {isSelected ? 'SELECCIONADO' : 'ENTRADA GENERAL'}
        </Text>

        {/* Barra de capacidad */}
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : section.color + '20',
          borderRadius: '2px',
          marginBottom: '8px',
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
        
        {/* Información de capacidad */}
        <Text style={{ 
          color: isSelected ? 'rgba(255,255,255,0.9)' : '#666',
          fontSize: '11px',
          display: 'block',
          marginBottom: '12px'
        }}>
          {remainingCapacity} de {totalCapacity} disponibles
          {isNearCapacity && !isSelected && (
            <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>
              (¡Pocas quedan!)
            </span>
          )}
        </Text>

        {/* Precio destacado */}
        <div style={{
          padding: '8px 16px',
          background: isSelected ? 'rgba(255,255,255,0.2)' : section.color + '10',
          borderRadius: '20px',
          display: 'inline-block'
        }}>
          <Text style={{ 
            color: isSelected ? 'white' : section.color,
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {(() => {
              // Obtener el precio correcto del evento si está disponible
              let correctPrice = section.price;
              if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
                const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
                if (eventSectionPricing) {
                  correctPrice = eventSectionPricing.defaultPrice || section.price;
                }
              }
              return formatPrice(correctPrice);
            })()}
          </Text>
        </div>

        {/* Indicador de selección múltiple */}
        {sameSectionSelected.length > 1 && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '24px',
            height: '24px',
            backgroundColor: section.color,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            {sameSectionSelected.length}
          </div>
        )}
      </div>
    </div>
  );
};


export default GenericSeatMapRenderer;