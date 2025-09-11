import React, { useState, useMemo } from 'react';
import { Card, Button, Typography, Space, Row, Col, Badge, Progress, Tooltip, Collapse } from 'antd';
import { COLORS } from '../../../../components/colorscheme';
import SeatRenderer from '../renderers/SeatRenderer';
import useDeviceDetection from '../../../../hooks/useDeviceDetection';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const AlternativeViewRenderer = ({
  seatMapData,
  selectedSeats,
  onSeatSelect,
  maxSeats,
  occupiedSeats,
  blockedSeats,
  blockedSections,
  formatPrice,
  event,
  calculateSeatPrice,
  viewMode = 'blocks' // 'blocks', 'simplified', 'list'
}) => {
  const deviceInfo = useDeviceDetection();
  const [expandedSections, setExpandedSections] = useState(new Set());

  if (!seatMapData) return null;

  const { sections } = seatMapData;

  // Calcular estadísticas de secciones
  const sectionStats = useMemo(() => {
    return sections.map(section => {
      const sectionOccupiedSeats = occupiedSeats?.filter(seatId => seatId.startsWith(section.id)) || [];
      const sectionBlockedSeats = blockedSeats?.filter(seatId => seatId.startsWith(section.id)) || [];
      const isSectionBlocked = blockedSections?.includes(section.id);
      
      let totalSeats = 0;
      let availableSeats = 0;
      
      if (section.hasNumberedSeats) {
        totalSeats = section.rows * section.seatsPerRow;
        availableSeats = totalSeats - sectionOccupiedSeats.length - sectionBlockedSeats.length;
      } else {
        totalSeats = section.totalCapacity || 0;
        availableSeats = Math.max(0, totalSeats - sectionOccupiedSeats.length);
      }
      
      if (isSectionBlocked) {
        availableSeats = 0;
      }
      
      const occupancyRate = totalSeats > 0 ? ((totalSeats - availableSeats) / totalSeats) * 100 : 0;
      
      return {
        ...section,
        totalSeats,
        availableSeats,
        occupiedSeats: sectionOccupiedSeats.length,
        blockedSeats: sectionBlockedSeats.length,
        isSectionBlocked,
        occupancyRate
      };
    });
  }, [sections, occupiedSeats, blockedSeats, blockedSections]);

  const handleSeatSelect = (seatData) => {
    if (onSeatSelect) {
      onSeatSelect(seatData);
    }
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Renderizar vista de bloques
  const renderBlocksView = () => {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: deviceInfo.isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        padding: '20px'
      }}>
        {sectionStats.map(section => (
          <Card
            key={section.id}
            style={{
              border: section.isSectionBlocked ? '2px dashed #d9d9d9' : `2px solid ${section.color}`,
              borderRadius: '12px',
              backgroundColor: section.isSectionBlocked ? '#f5f5f5' : 'white',
              opacity: section.isSectionBlocked ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}
            hoverable={!section.isSectionBlocked}
          >
            {/* Header de la sección */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: section.isSectionBlocked ? '#d9d9d9' : section.color,
                  borderRadius: '50%'
                }} />
                <Title level={5} style={{ margin: 0, color: section.isSectionBlocked ? '#999' : 'inherit' }}>
                  {section.name}
                </Title>
                {!section.hasNumberedSeats && (
                  <Badge count="GA" style={{ backgroundColor: '#10B981', fontSize: '10px' }} />
                )}
              </div>
              
              {section.isSectionBlocked && (
                <Badge count="BLOQUEADA" style={{ backgroundColor: '#ff4d4f', fontSize: '10px' }} />
              )}
            </div>

            {/* Información de la sección */}
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Text style={{ fontSize: '12px', color: COLORS.neutral.grey4 }}>
                    {section.hasNumberedSeats 
                      ? `${section.rows} filas × ${section.seatsPerRow} asientos`
                      : `Capacidad: ${section.totalCapacity}`
                    }
                  </Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text strong style={{ color: COLORS.primary.main }}>
                    {formatPrice(section.defaultPrice || 0)}
                  </Text>
                </Col>
              </Row>
            </div>

            {/* Barra de ocupación */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <Text style={{ fontSize: '12px' }}>Ocupación</Text>
                <Text style={{ fontSize: '12px' }}>
                  {section.availableSeats} / {section.totalSeats} disponibles
                </Text>
              </div>
              <Progress
                percent={section.occupancyRate}
                strokeColor={section.occupancyRate > 80 ? '#ff4d4f' : section.occupancyRate > 60 ? '#faad14' : '#52c41a'}
                size="small"
                showInfo={false}
              />
            </div>

            {/* Botón de acción */}
            <Button
              type="primary"
              block
              disabled={section.isSectionBlocked || section.availableSeats === 0}
              onClick={() => {
                if (section.hasNumberedSeats) {
                  toggleSection(section.id);
                } else {
                  // Manejar entrada general
                  const sectionData = {
                    id: `${section.id}-GA-${Date.now()}`,
                    section: section.name,
                    sectionId: section.id,
                    price: section.defaultPrice || 0,
                    isGeneralAdmission: true
                  };
                  handleSeatSelect([...selectedSeats, sectionData]);
                }
              }}
              style={{
                backgroundColor: section.isSectionBlocked ? '#d9d9d9' : section.color,
                borderColor: section.isSectionBlocked ? '#d9d9d9' : section.color
              }}
            >
              {section.isSectionBlocked ? 'Sección Bloqueada' :
               section.availableSeats === 0 ? 'Agotado' :
               section.hasNumberedSeats ? 'Ver Asientos' : 'Seleccionar'}
            </Button>

            {/* Vista expandida de asientos numerados */}
            {section.hasNumberedSeats && expandedSections.has(section.id) && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <SeatRenderer
                  sectionId={section.id}
                  rows={section.rows}
                  seatsPerRow={section.seatsPerRow}
                  price={section.defaultPrice || 0}
                  color={section.color}
                  name={section.name}
                  selectedSeats={selectedSeats}
                  occupiedSeats={occupiedSeats?.filter(seatId => seatId.startsWith(section.id)) || []}
                  blockedSeats={blockedSeats?.filter(seatId => seatId.startsWith(section.id)) || []}
                  sectionBlocked={section.isSectionBlocked}
                  maxSeats={maxSeats}
                  onSeatSelect={handleSeatSelect}
                  formatPrice={formatPrice}
                  event={event}
                  calculateSeatPrice={calculateSeatPrice}
                  compactMode={true}
                  responsiveMode={deviceInfo.isMobile}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  // Renderizar vista simplificada
  const renderSimplifiedView = () => {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: deviceInfo.isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {sectionStats.map(section => (
            <Card
              key={section.id}
              size="small"
              style={{
                border: `1px solid ${section.isSectionBlocked ? '#d9d9d9' : section.color}`,
                borderRadius: '8px',
                backgroundColor: section.isSectionBlocked ? '#f5f5f5' : 'white',
                opacity: section.isSectionBlocked ? 0.6 : 1
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: section.isSectionBlocked ? '#d9d9d9' : section.color,
                  borderRadius: '50%',
                  margin: '0 auto 8px'
                }} />
                <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                  {section.name}
                </Text>
                <Text style={{ fontSize: '12px', color: COLORS.neutral.grey4, display: 'block', marginBottom: '8px' }}>
                  {section.availableSeats} disponibles
                </Text>
                <Text strong style={{ color: COLORS.primary.main, fontSize: '16px' }}>
                  {formatPrice(section.defaultPrice || 0)}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar vista de lista
  const renderListView = () => {
    return (
      <div style={{ padding: '20px' }}>
        <Collapse
          activeKey={Array.from(expandedSections)}
          onChange={(keys) => setExpandedSections(new Set(keys))}
        >
          {sectionStats.map(section => (
            <Panel
              key={section.id}
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: section.isSectionBlocked ? '#d9d9d9' : section.color,
                      borderRadius: '50%'
                    }} />
                    <Text strong>{section.name}</Text>
                    {!section.hasNumberedSeats && (
                      <Badge count="GA" style={{ backgroundColor: '#10B981', fontSize: '10px' }} />
                    )}
                    {section.isSectionBlocked && (
                      <Badge count="BLOQUEADA" style={{ backgroundColor: '#ff4d4f', fontSize: '10px' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Text style={{ color: COLORS.neutral.grey4 }}>
                      {section.availableSeats} / {section.totalSeats}
                    </Text>
                    <Text strong style={{ color: COLORS.primary.main }}>
                      {formatPrice(section.defaultPrice || 0)}
                    </Text>
                  </div>
                </div>
              }
            >
              <div style={{ padding: '16px 0' }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div style={{ marginBottom: '16px' }}>
                      <Text style={{ fontSize: '12px', color: COLORS.neutral.grey4 }}>
                        {section.hasNumberedSeats 
                          ? `${section.rows} filas × ${section.seatsPerRow} asientos`
                          : `Capacidad total: ${section.totalCapacity} personas`
                        }
                      </Text>
                    </div>
                    
                    <Progress
                      percent={section.occupancyRate}
                      strokeColor={section.occupancyRate > 80 ? '#ff4d4f' : section.occupancyRate > 60 ? '#faad14' : '#52c41a'}
                      size="small"
                    />
                  </Col>
                </Row>
              </div>
            </Panel>
          ))}
        </Collapse>
      </div>
    );
  };

  // Renderizar según el modo
  switch (viewMode) {
    case 'blocks':
      return renderBlocksView();
    case 'simplified':
      return renderSimplifiedView();
    case 'list':
      return renderListView();
    default:
      return renderBlocksView();
  }
};

export default AlternativeViewRenderer;
