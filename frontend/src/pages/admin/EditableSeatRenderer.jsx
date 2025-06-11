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

  // Header simplificado para secciones (solo título, sin botones)
  const renderSectionHeader = (section) => (
    <div style={{
      padding: '8px 12px',
      backgroundColor: isSectionBlocked(section.id) ? '#ff4d4f20' : section.color + '20',
      borderLeft: `4px solid ${isSectionBlocked(section.id) ? '#ff4d4f' : section.color}`,
      marginBottom: '8px',
      borderRadius: '4px'
    }}>
      <Text strong style={{ color: COLORS.neutral.darker }}>
        {section.name}
      </Text>
      <Text style={{ 
        color: COLORS.neutral.grey4, 
        fontSize: '12px',
        marginLeft: '8px'
      }}>
        ({section.rows} filas × {section.seatsPerRow} asientos)
        {isSectionBlocked(section.id) && (
          <span style={{ color: '#ff4d4f', marginLeft: '8px' }}>
            - Sección bloqueada
          </span>
        )}
      </Text>
    </div>
  );

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
        gap: 20,
        padding: '20px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.stadiumName || name} - Modo Edición
        </Title>

        {/* Controles de sección */}
        {renderSectionControls()}

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 30, 
          minWidth: 800, 
          minHeight: 600
        }}>
          {/* Tribuna Norte */}
          {tribunaNorte && (
            <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
              {renderSectionHeader(tribunaNorte)}
              <Card style={{ padding: 10, margin: 5 }}>
                <EditableSeatGrid
                  sectionId={tribunaNorte.id}
                  rows={tribunaNorte.rows}
                  seatsPerRow={tribunaNorte.seatsPerRow}
                  color={tribunaNorte.color}
                  name={tribunaNorte.name}
                  blockedSeats={filterBlockedBySection(tribunaNorte.id)}
                  sectionBlocked={isSectionBlocked(tribunaNorte.id)}
                  onSeatToggle={onSeatToggle}
                />
              </Card>
            </div>
          )}

          {/* Fila central horizontal */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'center', 
            width: '100%', 
            gap: 40 
          }}>
            {/* Tribuna Oeste */}
            {tribunaOeste && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                minWidth: 120 
              }}>
                <div style={{ marginBottom: '12px', width: '200px' }}>
                  {renderSectionHeader(tribunaOeste)}
                </div>
                <Card style={{ padding: 8, borderRadius: 8, transform: 'rotate(-90deg)' }}>
                  <EditableSeatGrid
                    sectionId={tribunaOeste.id}
                    rows={tribunaOeste.rows}
                    seatsPerRow={tribunaOeste.seatsPerRow}
                    color={tribunaOeste.color}
                    name={tribunaOeste.name}
                    blockedSeats={filterBlockedBySection(tribunaOeste.id)}
                    sectionBlocked={isSectionBlocked(tribunaOeste.id)}
                    onSeatToggle={onSeatToggle}
                  />
                </Card>
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
                minWidth: 120 
              }}>
                <div style={{ marginBottom: '12px', width: '200px' }}>
                  {renderSectionHeader(tribunaEste)}
                </div>
                <Card style={{ padding: 8, borderRadius: 8, transform: 'rotate(90deg)' }}>
                  <EditableSeatGrid
                    sectionId={tribunaEste.id}
                    rows={tribunaEste.rows}
                    seatsPerRow={tribunaEste.seatsPerRow}
                    color={tribunaEste.color}
                    name={tribunaEste.name}
                    blockedSeats={filterBlockedBySection(tribunaEste.id)}
                    sectionBlocked={isSectionBlocked(tribunaEste.id)}
                    onSeatToggle={onSeatToggle}
                  />
                </Card>
              </div>
            )}
          </div>

          {/* Tribuna Sur */}
          {tribunaSur && (
            <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
              <Card style={{ padding: 10, margin: 5 }}>
                <EditableSeatGrid
                  sectionId={tribunaSur.id}
                  rows={tribunaSur.rows}
                  seatsPerRow={tribunaSur.seatsPerRow}
                  color={tribunaSur.color}
                  name={tribunaSur.name}
                  blockedSeats={filterBlockedBySection(tribunaSur.id)}
                  sectionBlocked={isSectionBlocked(tribunaSur.id)}
                  onSeatToggle={onSeatToggle}
                />
              </Card>
              {renderSectionHeader(tribunaSur)}
            </div>
          )}

          {/* VIP */}
          {vipSection && (
            <div style={{ textAlign: 'center', marginTop: 20, width: '100%', maxWidth: '400px' }}>
              {renderSectionHeader(vipSection)}
              <Card style={{ 
                border: `2px solid ${vipSection.color}`, 
                padding: 10, 
                borderRadius: 8, 
                margin: 5, 
                backgroundColor: vipSection.color + '20'
              }}>
                <EditableSeatGrid
                  sectionId={vipSection.id}
                  rows={vipSection.rows}
                  seatsPerRow={vipSection.seatsPerRow}
                  color={vipSection.color}
                  name={vipSection.name}
                  blockedSeats={filterBlockedBySection(vipSection.id)}
                  sectionBlocked={isSectionBlocked(vipSection.id)}
                  onSeatToggle={onSeatToggle}
                />
              </Card>
            </div>
          )}
        </div>
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
        gap: 20,
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.cinemaName || name} - Modo Edición
        </Title>

        {/* Controles de sección */}
        {renderSectionControls()}

        {/* Pantalla */}
        <div
          style={{
            width: '100%',
            maxWidth: config?.screenWidth || 600,
            height: 30,
            backgroundColor: '#333',
            borderRadius: '15px 15px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 30,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            border: '2px solid #222'
          }}
        >
          PANTALLA
        </div>

        {/* Renderizar secciones en orden */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          {sortedSections.map(section => (
            <div key={section.id} style={{ 
              width: '100%', 
              maxWidth: '700px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              {renderSectionHeader(section)}
              <Card style={{ 
                padding: 12, 
                borderRadius: 8, 
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                ...(section.id === 'premium' && {
                  border: '2px solid #9C27B0',
                  backgroundColor: '#F3E5F520'
                })
              }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <EditableSeatGrid
                    sectionId={section.id}
                    rows={section.rows}
                    seatsPerRow={section.seatsPerRow}
                    color={section.color}
                    name={section.name}
                    blockedSeats={filterBlockedBySection(section.id)}
                    sectionBlocked={isSectionBlocked(section.id)}
                    onSeatToggle={onSeatToggle}
                  />
                </div>
              </Card>
            </div>
          ))}
        </div>
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
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.theaterName || name} - Modo Edición
        </Title>

        {/* Controles de sección */}
        {renderSectionControls()}

        {/* Escenario */}
        <div
          style={{
            width: '100%',
            maxWidth: config?.stageWidth || 500,
            height: 40,
            backgroundColor: '#8B4513',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 30,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            border: '3px solid #654321'
          }}
        >
          ESCENARIO
        </div>

        {/* Renderizar secciones en orden */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 25, alignItems: 'center' }}>
          {sortedSections.map(section => (
            <div key={section.id} style={{ 
              width: '100%', 
              maxWidth: section.id === 'boxes' ? '400px' : '800px',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              {renderSectionHeader(section)}
              <Card style={{ 
                padding: 15, 
                borderRadius: 8, 
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                ...(section.id === 'boxes' && {
                  border: '2px solid #9C27B0',
                  backgroundColor: '#F3E5F520'
                })
              }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <EditableSeatGrid
                    sectionId={section.id}
                    rows={section.rows}
                    seatsPerRow={section.seatsPerRow}
                    color={section.color}
                    name={section.name}
                    blockedSeats={filterBlockedBySection(section.id)}
                    sectionBlocked={isSectionBlocked(section.id)}
                    onSeatToggle={onSeatToggle}
                  />
                </div>
              </Card>
            </div>
          ))}
        </div>
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

        <div style={{ width: '100%' }}>
          {sortedSections.map(section => (
            <div key={section.id} style={{ marginBottom: '24px' }}>
              {renderSectionHeader(section)}
              <Card style={{ 
                padding: 15, 
                borderRadius: 8, 
                display: 'flex', 
                justifyContent: 'center' 
              }}>
                <EditableSeatGrid
                  sectionId={section.id}
                  rows={section.rows}
                  seatsPerRow={section.seatsPerRow}
                  color={section.color}
                  name={section.name}
                  blockedSeats={filterBlockedBySection(section.id)}
                  sectionBlocked={isSectionBlocked(section.id)}
                  onSeatToggle={onSeatToggle}
                />
              </Card>
            </div>
          ))}
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