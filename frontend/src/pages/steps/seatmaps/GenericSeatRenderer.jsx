import React, { useState, useEffect } from 'react';
import SeatRenderer from './SeatRenderer';
import SeatMapLegend from './SeatMapLegend';
import { COLORS } from '../../../components/colorscheme';
import { Typography, notification, Card } from 'antd';
import './SeatMapAnimations.css';

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
  const [isMobile, setIsMobile] = useState(false);
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
                                  price={section.defaultPrice || 0}
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
        gap: 24, 
        minWidth: isMobile ? 700 : 1000,
        minHeight: 700,
        padding: '32px 24px',
        background: 'linear-gradient(135deg, #1a4d1a 0%, #2d5a2d 50%, #1a4d1a 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '2px solid #4a7c59',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Efecto de césped en el fondo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(76, 175, 80, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0
        }} />
        
        <Title level={3} style={{ 
          margin: 0, 
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.7)',
          fontSize: '24px',
          fontWeight: '700',
          zIndex: 2,
          position: 'relative'
        }}>
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

          {/* Campo de fútbol mejorado */}
          <div
            style={{
              width: config?.fieldDimensions?.width || 400,
              height: config?.fieldDimensions?.height || 260,
              background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #4CAF50 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)',
              border: '4px solid #2E7D32',
              position: 'relative',
              flexShrink: 0,
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              zIndex: 2
            }}
          >
            {/* Líneas del campo */}
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              width: '90%', 
              height: '80%', 
              border: '3px solid white', 
              borderRadius: '8px',
              opacity: 0.8
            }} />
            
            {/* Círculo central */}
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              width: 60, 
              height: 60, 
              border: '3px solid white', 
              borderRadius: '50%',
              opacity: 0.8
            }} />
            
            {/* Línea central */}
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '0', 
              right: '0', 
              height: '3px', 
              backgroundColor: 'white',
              opacity: 0.8
            }} />
            
            {/* Áreas de portería */}
            <div style={{ 
              position: 'absolute', 
              top: '20%', 
              left: '5%', 
              width: '15%', 
              height: '60%', 
              border: '3px solid white', 
              borderRadius: '8px',
              opacity: 0.8
            }} />
            <div style={{ 
              position: 'absolute', 
              top: '20%', 
              right: '5%', 
              width: '15%', 
              height: '60%', 
              border: '3px solid white', 
              borderRadius: '8px',
              opacity: 0.8
            }} />
            
            <span style={{ 
              position: 'relative', 
              zIndex: 3,
              fontSize: '18px',
              fontWeight: '700'
            }}>
              CAMPO
            </span>
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

        {/* Leyenda de colores del estadio */}
        <SeatMapLegend 
          theme="stadium" 
          showPremium={true}
          showAccessible={false}
          className="depth-3"
          style={{ marginTop: '24px', zIndex: 2, position: 'relative' }}
        />
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

    // Buscar gradas para layout de concierto
    const gradaBaja = sections.find(s => s.name.toLowerCase().includes('grada baja') || s.position?.toLowerCase().includes('grada-baja'));
    const gradaMedia = sections.find(s => s.name.toLowerCase().includes('grada media') || s.position?.toLowerCase().includes('grada-media'));
    const gradaAlta = sections.find(s => s.name.toLowerCase().includes('grada alta') || s.position?.toLowerCase().includes('grada-alta'));

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
        minWidth: isMobile ? 700 : 1200,
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

        {/* Gradas apiladas verticalmente */}
        {(gradaAlta || gradaMedia || gradaBaja) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            {gradaAlta && (
              <div style={{ textAlign: 'center' }}>
                {renderSectionHeader(gradaAlta)}
                {renderSectionCard(gradaAlta)}
              </div>
            )}
            {gradaMedia && (
              <div style={{ textAlign: 'center' }}>
                {renderSectionHeader(gradaMedia)}
                {renderSectionCard(gradaMedia)}
              </div>
            )}
            {gradaBaja && (
              <div style={{ textAlign: 'center' }}>
                {renderSectionHeader(gradaBaja)}
                {renderSectionCard(gradaBaja)}
              </div>
            )}
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
                    width: (config?.stageWidth || 300) + 120,
                    height: (config?.stageHeight || 80) + 120,
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
        minWidth: isMobile ? 700 : 800,
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
        gap: 16,
        minWidth: isMobile ? 700 : 500,
        padding: '32px 24px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '1px solid #404040',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Efecto de luces del cine */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #ff6b35, #f7931e, #ffd23f, #f7931e, #ff6b35)',
          animation: 'cinemaLights 3s ease-in-out infinite'
        }} />
        
        <Title level={3} style={{ 
          margin: 0, 
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          fontSize: '24px',
          fontWeight: '700'
        }}>
          {config?.cinemaName || name}
        </Title>

        {/* Pantalla mejorada con efectos */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div
            style={{
              width: config?.screenWidth || 400,
              height: 24,
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffd700',
              fontSize: 14,
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: '2px solid #333',
              textShadow: '0 0 8px rgba(255,215,0,0.5)',
              position: 'relative'
            }}
          >
            PANTALLA
            {/* Efecto de brillo en la pantalla */}
            <div style={{
              position: 'absolute',
              top: '2px',
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              borderRadius: '1px'
            }} />
          </div>
          
          {/* Marco de la pantalla */}
          <div style={{
            position: 'absolute',
            top: '-4px',
            left: '-8px',
            right: '-8px',
            bottom: '4px',
            border: '3px solid #666',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #444 0%, #222 100%)',
            zIndex: -1,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
          }} />
        </div>

        {/* Secciones de asientos con mejor espaciado */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12,
          width: '100%',
          maxWidth: '600px'
        }}>
          {sortedSections.map((section, index) => (
            <div key={section.id} style={{ 
              textAlign: 'center',
              position: 'relative',
              transform: `perspective(1000px) rotateX(${index * 2}deg)`,
              transformOrigin: 'center bottom'
            }}>
              {renderSectionHeader(section)}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                borderRadius: '12px',
                padding: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                {renderSectionCard(section, {
                  ...(section.id === 'premium' && !isSectionBlocked(section.id) && {
                    border: '2px solid #9C27B0',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    boxShadow: '0 4px 16px rgba(156, 39, 176, 0.3)'
                  })
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Leyenda de colores */}
        <SeatMapLegend 
          theme="cinema" 
          showPremium={true}
          showAccessible={false}
          className="depth-2"
          style={{ marginTop: '20px' }}
        />
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
        gap: 20,
        minWidth: isMobile ? 700 : 500,
        padding: '32px 24px',
        background: 'linear-gradient(135deg, #2c1810 0%, #3d2817 50%, #2c1810 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '2px solid #8B4513',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Efecto de cortinas laterales */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '60px',
          height: '100%',
          background: 'linear-gradient(90deg, #8B0000 0%, #A52A2A 50%, #8B0000 100%)',
          clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '100%',
          background: 'linear-gradient(90deg, #8B0000 0%, #A52A2A 50%, #8B0000 100%)',
          clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)',
          zIndex: 1
        }} />
        
        <Title level={3} style={{ 
          margin: 0, 
          color: '#FFD700',
          textShadow: '0 2px 4px rgba(0,0,0,0.7)',
          fontSize: '24px',
          fontWeight: '700',
          zIndex: 2,
          position: 'relative'
        }}>
          {config?.theaterName || name}
        </Title>

        {/* Escenario mejorado con efectos teatrales */}
        <div style={{ position: 'relative', marginBottom: '32px', zIndex: 2 }}>
          <div
            style={{
              width: config?.stageWidth || 350,
              height: 40,
              background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFD700',
              fontSize: 16,
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
              border: '3px solid #654321',
              textShadow: '0 0 8px rgba(255,215,0,0.5)',
              position: 'relative'
            }}
          >
            ESCENARIO
            {/* Luces del escenario */}
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '20%',
              right: '20%',
              height: '4px',
              background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)',
              borderRadius: '2px',
              boxShadow: '0 0 12px rgba(255, 215, 0, 0.8)'
            }} />
          </div>
          
          {/* Proscenio */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '-12px',
            right: '-12px',
            bottom: '6px',
            border: '4px solid #654321',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
            zIndex: -1,
            boxShadow: '0 6px 24px rgba(0,0,0,0.5)'
          }} />
        </div>

        {/* Secciones de asientos con perspectiva teatral */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 16,
          width: '100%',
          maxWidth: '600px',
          zIndex: 2,
          position: 'relative'
        }}>
          {sortedSections.map((section, index) => (
            <div key={section.id} style={{ 
              textAlign: 'center',
              position: 'relative',
              transform: `perspective(1200px) rotateX(${index * 1.5}deg)`,
              transformOrigin: 'center bottom'
            }}>
              {renderSectionHeader(section)}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid rgba(255,215,0,0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
              }}>
                {renderSectionCard(section, {
                  ...(section.id === 'boxes' && !isSectionBlocked(section.id) && {
                    border: '2px solid #9C27B0',
                    backgroundColor: 'rgba(156, 39, 176, 0.15)',
                    boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)'
                  })
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Leyenda de colores teatral */}
        <SeatMapLegend 
          theme="theater" 
          showPremium={true}
          showAccessible={false}
          className="depth-3"
          style={{ marginTop: '24px', zIndex: 2, position: 'relative' }}
        />
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
                      {formatPrice(section.defaultPrice || 0)}
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
                      price={section.defaultPrice || 0}
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
    let correctPrice = section.defaultPrice || 0;
    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
      if (eventSectionPricing) {
        correctPrice = eventSectionPricing.defaultPrice || section.defaultPrice || 0;
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
              let correctPrice = section.defaultPrice || 0;
              if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
                const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
                if (eventSectionPricing) {
                  correctPrice = eventSectionPricing.defaultPrice || section.defaultPrice || 0;
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