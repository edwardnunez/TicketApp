import React from 'react';
import { Typography, Card, Button, Space, Divider } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import EditableSeatGrid from './EditableSeatGrid';
import { COLORS } from '../../components/colorscheme';

const { Title, Text } = Typography;

const EditableSeatRenderer = ({
  seatMapData,
  blockedSeats,
  blockedSections,
  onSeatToggle,
  onSectionToggle
}) => {
  if (!seatMapData) return null;

  const { sections, config, type, name } = seatMapData;

  const filterBlockedBySection = (sectionId) => {
    if (!blockedSeats || !blockedSeats.length) return [];
    return blockedSeats.filter(seatId => seatId.startsWith(sectionId));
  };

  const isSectionBlocked = (sectionId) => {
    return blockedSections.includes(sectionId);
  };

  // Controles de sección unificados
  const renderSectionControls = () => (
    <Card style={{ 
      marginBottom: '20px',
      backgroundColor: COLORS.neutral.grey1,
      border: `1px solid ${COLORS.neutral.grey3}`
    }}>
      <Title level={5} style={{ margin: '0 0 12px 0', color: COLORS.neutral.darker }}>
        Control de Secciones
      </Title>
      <Text style={{ 
        color: COLORS.neutral.grey4, 
        fontSize: '13px',
        display: 'block',
        marginBottom: '16px'
      }}>
        Bloquea o desbloquea secciones completas. Los asientos individuales se pueden modificar después.
      </Text>
      <Space wrap size="small">
        {sections.map(section => (
          <Button
            key={section.id}
            size="small"
            type={isSectionBlocked(section.id) ? "primary" : "default"}
            danger={isSectionBlocked(section.id)}
            icon={isSectionBlocked(section.id) ? <UnlockOutlined /> : <LockOutlined />}
            onClick={() => onSectionToggle(section.id)}
            style={{
              borderColor: isSectionBlocked(section.id) ? '#ff4d4f' : section.color,
              color: isSectionBlocked(section.id) ? '#fff' : section.color,
              ...(isSectionBlocked(section.id) ? {} : {
                backgroundColor: section.color + '10'
              })
            }}
          >
            {section.name}
            {isSectionBlocked(section.id) && ' (Bloqueada)'}
          </Button>
        ))}
      </Space>
      <Divider style={{ margin: '16px 0 8px 0' }} />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: '12px',
        color: COLORS.neutral.grey4
      }}>
        <span>
          Secciones bloqueadas: {blockedSections.length} de {sections.length}
        </span>
        <span>
          Asientos bloqueados individualmente: {blockedSeats.length}
        </span>
      </div>
    </Card>
  );

  // Función para renderizar tarjetas de sección (similar al GenericSeatRenderer)
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
        <EditableSeatGrid
          sectionId={section.id}
          rows={section.rows}
          seatsPerRow={section.seatsPerRow}
          color={section.color}
          name={section.name}
          blockedSeats={filterBlockedBySection(section.id)}
          sectionBlocked={sectionBlocked}
          onSeatToggle={onSeatToggle}
        />
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
          textDecoration: sectionBlocked ? 'line-through' : 'none'
        }}
      >
        {section.name} {sectionBlocked && '(BLOQUEADA)'}
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
        padding: '30px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.stadiumName || name} - Modo Edición
        </Title>

        {/* Controles de sección */}
        {renderSectionControls()}

        {/* Tribuna Norte */}
        {tribunaNorte && (
          <div style={{ textAlign: 'center' }}>
            {renderSectionHeader(tribunaNorte)}
            {renderSectionCard(tribunaNorte)}
          </div>
        )}

        {/* Fila central horizontal: Tribuna Oeste | Campo | Tribuna Este */}
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
                top: -70,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                zIndex: 2
              }}>
                <Text
                  strong
                  style={{
                    color: isSectionBlocked(tribunaOeste.id) ? '#999' : tribunaOeste.color,
                    textDecoration: isSectionBlocked(tribunaOeste.id) ? 'line-through' : 'none',
                    fontSize: '14px'
                  }}
                >
                  {tribunaOeste.name} {isSectionBlocked(tribunaOeste.id) && '(BLOQUEADA)'}
                </Text>
              </div>
              {renderSectionCard(tribunaOeste, { 
                transform: 'rotate(-90deg)',
                marginTop: 50
              })}
            </div>
          )}

          {/* Campo */}
          <div
            style={{
              width: config?.fieldDimensions?.width || 400,
              height: config?.fieldDimensions?.height || 260,
              backgroundColor: '#4CAF50',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              border: '3px solid #2E7D32',
              position: 'relative',
              flexShrink: 0,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
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
                top: -70,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                zIndex: 2
              }}>
                <Text
                  strong
                  style={{
                    color: isSectionBlocked(tribunaEste.id) ? '#999' : tribunaEste.color,
                    textDecoration: isSectionBlocked(tribunaEste.id) ? 'line-through' : 'none',
                    fontSize: '14px'
                  }}
                >
                  {tribunaEste.name} {isSectionBlocked(tribunaEste.id) && '(BLOQUEADA)'}
                </Text>
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
        padding: '20px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.cinemaName || name} - Modo Edición
        </Title>

        {/* Controles de sección */}
        {renderSectionControls()}

        {/* Pantalla */}
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

        {/* Renderizar secciones en orden */}
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
        padding: '20px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.theaterName || name} - Modo Edición
        </Title>

        {/* Controles de sección */}
        {renderSectionControls()}

        {/* Escenario */}
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

        {/* Renderizar secciones en orden */}
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
        borderRadius: '12px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {name} - Modo Edición
        </Title>

        {/* Controles de sección */}
        {renderSectionControls()}

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
                    </Title>
                  </div>
                  <Typography.Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                    {section.rows} filas × {section.seatsPerRow} asientos por fila
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
                  <EditableSeatGrid
                    sectionId={section.id}
                    rows={section.rows}
                    seatsPerRow={section.seatsPerRow}
                    color={section.color}
                    name={section.name}
                    blockedSeats={filterBlockedBySection(section.id)}
                    sectionBlocked={sectionBlocked}
                    onSeatToggle={onSeatToggle}
                  />
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
    case 'cinema':
      return renderCinemaLayout();
    case 'theater':
      return renderTheaterLayout();
    default:
      return renderGenericLayout();
  }
};

export default EditableSeatRenderer;