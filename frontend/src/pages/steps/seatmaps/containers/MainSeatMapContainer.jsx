import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Typography, Button, Space, notification } from 'antd';
import {
  FullscreenOutlined,
  CompressOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { COLORS, getVenueColors } from '../../../../components/colorscheme';
import ProSeatRenderer from '../renderers/ProSeatRenderer';
import AltSeatMapLegend from '../ui/AltSeatMapLegend';
import VenueStageRenderer from '../renderers/VenueStageRenderer';
import ZoomControls from '../ui/ZoomControls';
import AccessibilityFeatures from '../ui/AccessibilityFeatures';
import useAdvancedZoomPan from '../../../../hooks/useAdvancedZoomPan';
import '../styles/SeatMapAnimations.css';
import '../styles/SeatMapLayouts.css';

const { Title, Text } = Typography;

/**
 * Top bar component for seat selection with summary and controls
 * @param {Object} props - Component props
 * @param {Array} props.selectedSeats - Currently selected seats
 * @param {number} props.maxSeats - Maximum number of selectable seats
 * @param {Function} props.formatPrice - Price formatting function
 * @param {Object} props.event - Event data object
 * @param {boolean} props.showLegend - Whether legend is visible
 * @param {Function} props.setShowLegend - Legend visibility setter
 * @param {boolean} props.isFullscreen - Whether in fullscreen mode
 * @param {Function} props.toggleFullscreen - Fullscreen toggle function
 * @returns {JSX.Element} Selection top bar with seat summary and controls
 */
const SelectionTopBar = ({ selectedSeats, maxSeats, formatPrice, event, showLegend, setShowLegend, isFullscreen, toggleFullscreen }) => {
  const totalPrice = selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: isMobile ? '10px 12px' : '12px 16px',
        borderBottom: `1px solid ${COLORS.neutral.grey2}`,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '10px' : '0'
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '4px' : '12px',
        minWidth: 0,
        flex: isMobile ? 'none' : 1
      }}>
        <Title level={4} style={{
          margin: 0,
          color: COLORS.neutral.darker,
          fontSize: isMobile ? '16px' : '20px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          Selección de asientos
        </Title>
        <Text style={{
          color: COLORS.neutral.grey4,
          fontSize: isMobile ? '11px' : '12px',
          whiteSpace: isMobile ? 'normal' : 'nowrap',
          lineHeight: '1.3'
        }}>
          Selecciona hasta {maxSeats} asiento(s) para continuar
        </Text>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: isMobile ? '8px' : '16px',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        justifyContent: isMobile ? 'space-between' : 'flex-end',
        width: isMobile ? '100%' : 'auto'
      }}>
        {/* Información de selección */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '16px',
          flex: isMobile ? '1 1 auto' : 'none'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Text style={{
              fontSize: isMobile ? '10px' : '12px',
              color: COLORS.neutral.grey4,
              display: 'block',
              whiteSpace: 'nowrap'
            }}>
              Asientos
            </Text>
            <Text style={{
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 'bold',
              color: COLORS.primary.main,
              whiteSpace: 'nowrap'
            }}>
              {selectedSeats.length} / {maxSeats}
            </Text>
          </div>

          {selectedSeats.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <Text style={{
                fontSize: isMobile ? '10px' : '12px',
                color: COLORS.neutral.grey4,
                display: 'block',
                whiteSpace: 'nowrap'
              }}>
                Total
              </Text>
              <Text style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 'bold',
                color: COLORS.primary.main,
                whiteSpace: 'nowrap'
              }}>
                {formatPrice(totalPrice)}
              </Text>
            </div>
          )}
        </div>

        {/* Botones de control */}
        {!isMobile && (
          <Space>
            <Button
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => setShowLegend(!showLegend)}
              type={showLegend ? 'primary' : 'default'}
            >
              Leyenda
            </Button>
            <Button
              size="small"
              icon={isFullscreen ? <CompressOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? 'Salir' : 'Pantalla completa'}
            </Button>
          </Space>
        )}
        {/* En móvil, solo mostrar iconos sin texto */}
        {isMobile && (
          <Space size="small">
            <Button
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => setShowLegend(!showLegend)}
              type={showLegend ? 'primary' : 'default'}
            />
            <Button
              size="small"
              icon={isFullscreen ? <CompressOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
            />
          </Space>
        )}
      </div>
    </div>
  );
};

const MainSeatMapContainer = ({
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
  isAdminMode = false,
  isPreviewMode = false
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);

  // Estados de accesibilidad
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isKeyboardNavigationEnabled, setIsKeyboardNavigationEnabled] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);

  const containerRef = useRef(null);
  const seatMapRef = useRef(null);

  // Hook avanzado de zoom y pan con soporte táctil completo
  const {
    zoomLevel,
    panOffset,
    isDragging,
    isTouching,
    isInteracting,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    reset: handleResetZoom,
    handlers: zoomPanHandlers
  } = useAdvancedZoomPan({
    minZoom: 0.15,
    maxZoom: 2.5,
    initialZoom: isMobile ? 0.25 : 0.7, // Zoom inicial más bajo en móvil para ver todo el mapa amplio
    zoomStep: 0.15,
    enableMouseWheel: true,
    enablePinch: true,
    enablePan: true
  });

  // Detectar tipo de dispositivo
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para alternar pantalla completa
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Manejar cambios de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!seatMapData) return null;

  const { sections, config, type } = seatMapData;
  const venueColors = getVenueColors(type);

  // Filtrar asientos ocupados y bloqueados por sección
  const filterOccupiedBySection = (sectionId) => {
    if (!occupiedSeats || !occupiedSeats.length) return [];
    return occupiedSeats.filter(seatId => seatId && typeof seatId === 'string' && seatId.startsWith(sectionId));
  };

  const filterBlockedBySection = (sectionId) => {
    if (!blockedSeats || !blockedSeats.length) return [];
    return blockedSeats.filter(seatId => seatId && typeof seatId === 'string' && seatId.startsWith(sectionId));
  };

  const isSectionBlocked = (sectionId) => {
    return blockedSections && blockedSections.includes(sectionId);
  };

  const getSectionCapacityFromPricing = (sectionId) => {
    if (!event?.sectionPricing) return null;
    const pricing = event.sectionPricing.find(p => p.sectionId === sectionId);
    return pricing ? pricing.capacity : null;
  };

  // Renderizar sección profesional
  const renderProfessionalSection = (section, customProps = {}) => {
    const sectionBlocked = isSectionBlocked(section.id);
    
    return (
      <div
        key={section.id}
        className="professional-section"
        style={{
          position: 'relative',
          margin: '8px',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: hoveredSection === section.id ? 'scale(1.02)' : 'scale(1)',
          ...customProps
        }}
        onMouseEnter={() => setHoveredSection(section.id)}
        onMouseLeave={() => setHoveredSection(null)}
      >
        {section.hasNumberedSeats ? (
          <ProSeatRenderer
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
            venueType={type}
            isAdminMode={isAdminMode}
            isMobile={isMobile}
            isTablet={isTablet}
            showTooltips={showTooltips}
            isHighContrast={isHighContrast}
          />
        ) : (
          <ProfessionalGeneralAdmissionRenderer
            section={section}
            sectionBlocked={sectionBlocked}
            occupiedSeats={filterOccupiedBySection(section.id)}
            formatPrice={formatPrice}
            selectedSeats={selectedSeats}
            onSeatSelect={onSeatSelect}
            maxSeats={maxSeats}
            event={event}
            sectionCapacityFromPricing={getSectionCapacityFromPricing(section.id)}
            venueType={type}
            showTooltips={showTooltips}
            isHighContrast={isHighContrast}
          />
        )}
      </div>
    );
  };

  // Renderizar layout específico por tipo de venue
  const renderVenueLayout = () => {
    switch (type) {
      case 'football':
        return renderFootballStadiumLayout();
      case 'concert':
        return renderConcertVenueLayout();
      case 'cinema':
        return renderCinemaLayout();
      case 'theater':
        return renderTheaterLayout();
      case 'arena':
        return renderArenaLayout();
      default:
        return renderGenericLayout();
    }
  };

  // Layout para estadio de fútbol
  const renderFootballStadiumLayout = () => {
    const tribunaNorte = sections.find(s => 
      s.id.includes('norte') || s.name.toLowerCase().includes('norte') ||
      s.id.includes('north') || s.name.toLowerCase().includes('north')
    );
    const tribunaEste = sections.find(s => 
      s.id.includes('este') || s.name.toLowerCase().includes('este') ||
      s.id.includes('east') || s.name.toLowerCase().includes('east')
    );
    const tribunaOeste = sections.find(s => 
      s.id.includes('oeste') || s.name.toLowerCase().includes('oeste') ||
      s.id.includes('west') || s.name.toLowerCase().includes('west')
    );
    const tribunaSur = sections.find(s => 
      s.id.includes('sur') || s.name.toLowerCase().includes('sur') ||
      s.id.includes('south') || s.name.toLowerCase().includes('south')
    );
    const vipSection = sections.find(s => s.id.includes('vip') || s.name.toLowerCase().includes('vip'));

    return (
      <div className="football-stadium-layout">
        {/* Tribuna Norte */}
        {tribunaNorte && (
          <div className="tribuna-norte">
            {renderProfessionalSection(tribunaNorte, {
              gridArea: 'north'
            })}
          </div>
        )}

        {/* Tribuna Oeste */}
        {tribunaOeste && (
          <div className="tribuna-oeste">
            {renderProfessionalSection(tribunaOeste, {
              gridArea: 'west'
            })}
          </div>
        )}

        {/* Campo central */}
        <div className="field-container" style={{ gridArea: 'center' }}>
          <VenueStageRenderer
            type="football"
            config={config}
            venueColors={venueColors}
          />
        </div>

        {/* Tribuna Este */}
        {tribunaEste && (
          <div className="tribuna-este">
            {renderProfessionalSection(tribunaEste, {
              gridArea: 'east'
            })}
          </div>
        )}

        {/* Tribuna Sur */}
        {tribunaSur && (
          <div className="tribuna-sur">
            {renderProfessionalSection(tribunaSur, {
              gridArea: 'south'
            })}
          </div>
        )}

        {/* VIP */}
        {vipSection && (
          <div className="vip-section">
            {renderProfessionalSection(vipSection, {
              gridArea: 'vip'
            })}
          </div>
        )}
      </div>
    );
  };

  // Layout para venue de concierto
  const renderConcertVenueLayout = () => {
    
    // Detectar si es un concierto tipo estadio o tipo teatro
    const hasDirectionalSections = sections.some(s => 
      s.id.includes('norte') || s.id.includes('sur') || s.id.includes('este') || s.id.includes('oeste') ||
      s.name.toLowerCase().includes('norte') || s.name.toLowerCase().includes('sur') ||
      s.name.toLowerCase().includes('este') || s.name.toLowerCase().includes('oeste')
    );

    if (hasDirectionalSections) {
      // Layout tipo estadio para conciertos
      return renderConcertStadiumLayout();
    } else {
      // Layout tipo teatro para conciertos
      return renderConcertTheaterLayout();
    }
  };

  // Layout de concierto tipo estadio
  const renderConcertStadiumLayout = () => {
    const tribunaNorte = sections.find(s =>
      s.id.includes('norte') || s.name.toLowerCase().includes('norte') ||
      s.id.includes('north') || s.name.toLowerCase().includes('north')
    );
    const tribunaEste = sections.find(s =>
      s.id.includes('este') || s.name.toLowerCase().includes('este') ||
      s.id.includes('east') || s.name.toLowerCase().includes('east')
    );
    const tribunaOeste = sections.find(s =>
      s.id.includes('oeste') || s.name.toLowerCase().includes('oeste') ||
      s.id.includes('west') || s.name.toLowerCase().includes('west')
    );
    const tribunaSur = sections.find(s =>
      s.id.includes('sur') || s.name.toLowerCase().includes('sur') ||
      s.id.includes('south') || s.name.toLowerCase().includes('south')
    );
    const pistaSection = sections.find(s =>
      !s.hasNumberedSeats ||
      s.id.includes('pista') || s.name.toLowerCase().includes('pista') ||
      s.id.includes('general') || s.name.toLowerCase().includes('general')
    );
    const vipPremiumSections = sections.filter(s =>
      s.id.includes('vip') || s.name.toLowerCase().includes('vip') ||
      s.id.includes('palco') || s.name.toLowerCase().includes('palco') ||
      s.id.includes('premium') || s.name.toLowerCase().includes('premium')
    );

    return (
      <div className="concert-stadium-layout">
        {/* Tribuna Norte */}
        {tribunaNorte && (
          <div className="tribuna-norte">
            {renderProfessionalSection(tribunaNorte, { gridArea: 'north' })}
          </div>
        )}

        {/* Tribuna Oeste */}
        {tribunaOeste && (
          <div className="tribuna-oeste">
            {renderProfessionalSection(tribunaOeste, { gridArea: 'west' })}
          </div>
        )}

        {/* Escenario central */}
        <div className="stage-container" style={{ gridArea: 'center' }}>
          <VenueStageRenderer
            type="concert"
            config={config}
            venueColors={venueColors}
          />
        </div>

        {/* Pista */}
        {pistaSection && (
          <div className="pit-area">
            {renderProfessionalSection(pistaSection)}
          </div>
        )}

        {/* Tribuna Este */}
        {tribunaEste && (
          <div className="tribuna-este">
            {renderProfessionalSection(tribunaEste, { gridArea: 'east' })}
          </div>
        )}

        {/* Tribuna Sur */}
        {tribunaSur && (
          <div className="tribuna-sur">
            {renderProfessionalSection(tribunaSur, { gridArea: 'south' })}
          </div>
        )}

        {/* VIP y Palcos Premium */}
        {vipPremiumSections.length > 0 && (
          <div className="vip-premium-sections">
            {vipPremiumSections.map(section => (
              <div key={section.id} className="vip-section">
                {renderProfessionalSection(section, { gridArea: 'vip' })}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Layout de concierto tipo teatro
  const renderConcertTheaterLayout = () => {
    const pistaSection = sections.find(s =>
      !s.hasNumberedSeats ||
      s.id.includes('pista') || s.name.toLowerCase().includes('pista') ||
      s.id.includes('general') || s.name.toLowerCase().includes('general')
    );
    const vipPremiumSections = sections.filter(s =>
      s.id.includes('vip') || s.name.toLowerCase().includes('vip') ||
      s.id.includes('palco') || s.name.toLowerCase().includes('palco') ||
      s.id.includes('premium') || s.name.toLowerCase().includes('premium')
    );
    const gradas = sections.filter(s =>
      s.hasNumberedSeats &&
      !s.id.includes('vip') &&
      !s.id.includes('palco') &&
      !s.id.includes('premium') &&
      !s.name.toLowerCase().includes('vip') &&
      !s.name.toLowerCase().includes('palco') &&
      !s.name.toLowerCase().includes('premium')
    );

    return (
      <div className="concert-theater-layout">
        {/* Escenario */}
        <div className="stage-container">
          <VenueStageRenderer
            type="concert"
            config={config}
            venueColors={venueColors}
          />
        </div>

        {/* Pista */}
        {pistaSection && (
          <div className="pista-section">
            {renderProfessionalSection(pistaSection)}
          </div>
        )}

        {/* Gradas */}
        <div className="gradas-container">
          {gradas.map(section => renderProfessionalSection(section))}
        </div>

        {/* VIP y Palcos Premium */}
        {vipPremiumSections.length > 0 && (
          <div className="vip-premium-sections">
            {vipPremiumSections.map(section => (
              <div key={section.id} className="vip-section">
                {renderProfessionalSection(section)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Layout para cine
  const renderCinemaLayout = () => {
    const premiumSection = sections.find(s => 
      s.id.includes('premium') || s.name.toLowerCase().includes('premium')
    );
    const frontSection = sections.find(s => 
      s.id.includes('front') || s.name.toLowerCase().includes('front') ||
      s.id.includes('delante') || s.name.toLowerCase().includes('delante')
    );
    const middleSection = sections.find(s => 
      s.id.includes('middle') || s.name.toLowerCase().includes('middle') ||
      s.id.includes('medio') || s.name.toLowerCase().includes('medio')
    );
    const backSection = sections.find(s => 
      s.id.includes('back') || s.name.toLowerCase().includes('back') ||
      s.id.includes('atrás') || s.name.toLowerCase().includes('atrás') ||
      s.id.includes('atras') || s.name.toLowerCase().includes('atras')
    );
    const vipSection = sections.find(s => s.id.includes('vip') || s.name.toLowerCase().includes('vip'));

    return (
      <div className="cinema-layout">
        {/* Pantalla */}
        <div className="screen-container">
          <VenueStageRenderer
            type="cinema"
            config={config}
            venueColors={venueColors}
          />
        </div>

        {/* VIP (si existe) */}
        {vipSection && (
          <div className="vip-section">
            {renderProfessionalSection(vipSection)}
          </div>
        )}

        {/* Premium (si existe) */}
        {premiumSection && (
          <div className="premium-section">
            {renderProfessionalSection(premiumSection)}
          </div>
        )}

        {/* Fila delantera */}
        {frontSection && (
          <div className="front-section">
            {renderProfessionalSection(frontSection)}
          </div>
        )}

        {/* Fila media */}
        {middleSection && (
          <div className="middle-section">
            {renderProfessionalSection(middleSection)}
          </div>
        )}

        {/* Fila trasera */}
        {backSection && (
          <div className="back-section">
            {renderProfessionalSection(backSection)}
          </div>
        )}
      </div>
    );
  };

  // Layout para teatro
  const renderTheaterLayout = () => {
    const orchestraSection = sections.find(s => 
      s.id.includes('orchestra') || s.name.toLowerCase().includes('orchestra') ||
      s.id.includes('orquesta') || s.name.toLowerCase().includes('orquesta')
    );
    const mezzanineSection = sections.find(s => 
      s.id.includes('mezzanine') || s.name.toLowerCase().includes('mezzanine') ||
      s.id.includes('mezanine') || s.name.toLowerCase().includes('mezanine')
    );
    const balconySection = sections.find(s => 
      s.id.includes('balcony') || s.name.toLowerCase().includes('balcony') ||
      s.id.includes('balcón') || s.name.toLowerCase().includes('balcón')
    );
    const boxesSection = sections.find(s => 
      s.id.includes('boxes') || s.name.toLowerCase().includes('boxes') ||
      s.id.includes('palcos') || s.name.toLowerCase().includes('palcos')
    );
    const vipSection = sections.find(s => s.id.includes('vip') || s.name.toLowerCase().includes('vip'));

    return (
      <div className="theater-layout">
        {/* Escenario */}
        <div className="stage-container">
          <VenueStageRenderer
            type="theater"
            config={config}
            venueColors={venueColors}
          />
        </div>

        {/* Palcos (si existen) */}
        {boxesSection && (
          <div className="boxes-section">
            {renderProfessionalSection(boxesSection)}
          </div>
        )}

        {/* Orquesta */}
        {orchestraSection && (
          <div className="orchestra-section">
            {renderProfessionalSection(orchestraSection)}
          </div>
        )}

        {/* Mezzanine */}
        {mezzanineSection && (
          <div className="mezzanine-section">
            {renderProfessionalSection(mezzanineSection)}
          </div>
        )}

        {/* Balcón */}
        {balconySection && (
          <div className="balcony-section">
            {renderProfessionalSection(balconySection)}
          </div>
        )}

        {/* VIP */}
        {vipSection && (
          <div className="vip-section">
            {renderProfessionalSection(vipSection)}
          </div>
        )}
      </div>
    );
  };

  // Layout para arena
  const renderArenaLayout = () => {
    const pistaSection = sections.find(s => s.id.includes('pista'));
    const lowerSections = sections.filter(s => s.id.includes('lower'));
    const upperSections = sections.filter(s => s.id.includes('upper'));
    const vipSections = sections.filter(s => s.id.includes('vip'));

    return (
      <div className="arena-layout">
        {/* VIP */}
        {vipSections.length > 0 && (
          <div className="vip-container">
            {vipSections.map(section => renderProfessionalSection(section))}
          </div>
        )}

        {/* Secciones superiores */}
        {upperSections.length > 0 && (
          <div className="upper-sections">
            {upperSections.map(section => renderProfessionalSection(section))}
          </div>
        )}

        {/* Escenario */}
        <div className="stage-container">
          <VenueStageRenderer
            type="arena"
            config={config}
            venueColors={venueColors}
          />
        </div>

        {/* Pista */}
        {pistaSection && (
          <div className="pista-section">
            {renderProfessionalSection(pistaSection)}
          </div>
        )}

        {/* Secciones inferiores */}
        {lowerSections.length > 0 && (
          <div className="lower-sections">
            {lowerSections.map(section => renderProfessionalSection(section))}
          </div>
        )}
      </div>
    );
  };

  // Layout genérico
  const renderGenericLayout = () => {
    const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
      <div className="generic-layout">
        {sortedSections.map(section => renderProfessionalSection(section))}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`professional-seatmap-container ${isFullscreen ? 'fullscreen' : ''} ${isHighContrast ? 'high-contrast' : ''}`}
      style={{
        position: 'relative',
        maxWidth: isPreviewMode ? '100%' : (isFullscreen ? '100%' : '2400px'),
        minHeight: isPreviewMode ? '600px' : (isMobile ? '80vh' : '150vh'),
        backgroundColor: COLORS.neutral.grey50,
        borderRadius: isFullscreen ? '0' : (isPreviewMode ? '0' : '16px'),
        overflow: 'hidden', // Cambiar a hidden para contener el contenido
        boxShadow: isFullscreen ? 'none' : (isPreviewMode ? 'none' : COLORS.shadows.xl),
        margin: isPreviewMode ? '0' : '0 auto'
      }}
    >
      {/* Barra superior de selección de asientos - Solo en modo usuario y no en vista previa */}
      {!isAdminMode && !isPreviewMode && (
        <SelectionTopBar 
          selectedSeats={selectedSeats}
          maxSeats={maxSeats}
          formatPrice={formatPrice}
          event={event}
          showLegend={showLegend}
          setShowLegend={setShowLegend}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />
      )}
      
      {/* Características de accesibilidad */}
      <AccessibilityFeatures
        onHighContrastToggle={setIsHighContrast}
        onKeyboardNavigationToggle={setIsKeyboardNavigationEnabled}
        onTooltipToggle={setShowTooltips}
        isHighContrast={isHighContrast}
        isKeyboardNavigationEnabled={isKeyboardNavigationEnabled}
        showTooltips={showTooltips}
        isMobile={isMobile}
      />
        {/* Controles de zoom */}
        <div style={{
          position: 'absolute',
          top: isAdminMode ? '250px' : ((!isAdminMode && !isPreviewMode) ? '70px' : '10px'),
          right: isAdminMode ? '120px' : '10px',
          zIndex: 150
        }}>
          <ZoomControls
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleResetZoom}
            onFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            isMobile={isMobile}
          />
        </div>

        {/* Contenedor principal del mapa */}
        <div
          ref={seatMapRef}
          className="seatmap-content"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: isMobile ? 'auto' : 'hidden', // En móvil permitir scroll, en desktop usar pan
            cursor: !isMobile && isInteracting ? 'grabbing' : (isMobile ? 'auto' : 'grab'),
            display: 'flex',
            justifyContent: isMobile ? 'flex-start' : 'center',
            alignItems: isMobile ? 'flex-start' : 'center',
            padding: 0,
            flex: 1,
            touchAction: isMobile ? 'pan-x pan-y pinch-zoom' : 'none', // En móvil permitir scroll nativo + pinch zoom
            WebkitUserSelect: 'none',
            userSelect: 'none',
            WebkitOverflowScrolling: 'touch', // Scroll suave en iOS
            minHeight: isMobile ? 'calc(80vh - 100px)' : '100%' // Restar espacio para top bar en móvil
          }}
          onWheel={!isMobile ? zoomPanHandlers.onWheel : undefined}
          onMouseDown={!isMobile ? zoomPanHandlers.onMouseDown : undefined}
          onTouchStart={zoomPanHandlers.onTouchStart}
          onTouchMove={zoomPanHandlers.onTouchMove}
          onTouchEnd={zoomPanHandlers.onTouchEnd}
        >
          <div
            className="seatmap-transform"
            style={{
              transform: isMobile ? `scale(${zoomLevel})` : `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: isMobile ? 'top left' : 'center center',
              transition: isInteracting ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              width: 'fit-content',
              height: 'fit-content',
              position: 'relative',
              minWidth: isMobile ? '1400px' : 'auto', // En móvil mantener tamaño AMPLIO para evitar apelotonamiento
              minHeight: 'auto',
              maxWidth: 'none',
              maxHeight: 'none',
              willChange: isInteracting ? 'transform' : 'auto'
            }}
          >
            {renderVenueLayout()}
          </div>
        </div>

        {/* Leyenda - No mostrar en modo de vista previa */}
        {showLegend && !isPreviewMode && (
          <div 
            className="seatmap-legend"
            style={{
              position: 'absolute',
              top: !isAdminMode ? '70px' : '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            <AltSeatMapLegend
              venueType={type}
              showPremium={true}
              showAccessible={true}
              isMobile={isMobile}
            />
          </div>
        )}

    </div>
  );
};

// Componente para entrada general profesional
const ProfessionalGeneralAdmissionRenderer = ({
  section,
  sectionBlocked,
  formatPrice,
  selectedSeats,
  occupiedSeats = [],
  onSeatSelect,
  maxSeats,
  event,
  sectionCapacityFromPricing,
  venueType,
  showTooltips = true,
  isHighContrast = false
}) => {
  const sameSectionSelected = selectedSeats.filter(s => s.sectionId === section.id);
  const isSelected = sameSectionSelected.length > 0;

  const pricingCapacity = sectionCapacityFromPricing;
  const occupiedCount = occupiedSeats.filter(seatId => seatId.startsWith(section.id)).length;
  const totalCapacity = pricingCapacity || section.totalCapacity || 0;
  const remainingCapacity = Math.max(totalCapacity - occupiedCount, 0);
  const capacityPercentage = totalCapacity > 0 ? ((totalCapacity - remainingCapacity) / totalCapacity) * 100 : 0;

  const isFullyBooked = sectionBlocked || remainingCapacity <= 0;
  const isNearCapacity = capacityPercentage > 80;

  const handleSectionClick = () => {
    if (isFullyBooked) return;

    if (sameSectionSelected.length >= remainingCapacity) {
      notification.warning({
        message: 'Capacidad insuficiente',
        description: `Solo quedan ${remainingCapacity} entradas disponibles en esta sección.`,
        placement: 'topRight'
      });
      return;
    }

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
      <div className="general-admission-blocked">
        <div className="blocked-icon">⚠️</div>
        <div className="blocked-text">AGOTADO</div>
        <div className="blocked-subtext">No hay entradas disponibles</div>
      </div>
    );
  }

  return (
    <div
      className={`general-admission ${isSelected ? 'selected' : ''}`}
      onClick={handleSectionClick}
    >
      <div className="ga-icon">
        {isSelected ? '✓' : '🎫'}
      </div>
      
      <div className="ga-title">
        {isSelected ? 'SELECCIONADO' : 'ENTRADA GENERAL'}
      </div>

      <div className="capacity-bar">
        <div 
          className="capacity-fill"
          style={{ width: `${capacityPercentage}%` }}
        />
      </div>
      
      <div className="capacity-info">
        {remainingCapacity} de {totalCapacity} disponibles
        {isNearCapacity && !isSelected && (
          <span className="capacity-warning"> (¡Pocas quedan!)</span>
        )}
      </div>

      <div className="ga-price">
        {(() => {
          let correctPrice = section.defaultPrice || 0;
          if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
            const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
            if (eventSectionPricing) {
              correctPrice = eventSectionPricing.defaultPrice || section.defaultPrice || 0;
            }
          }
          return formatPrice(correctPrice);
        })()}
      </div>

      {sameSectionSelected.length > 1 && (
        <div className="selection-count">
          {sameSectionSelected.length}
        </div>
      )}
    </div>
  );
};

export default MainSeatMapContainer;
