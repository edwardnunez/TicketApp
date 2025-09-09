import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Typography, Button, Space, notification } from 'antd';
import { 
  FullscreenOutlined,
  CompressOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { COLORS, getVenueColors } from '../../../components/colorscheme';
import ProfessionalSeatRenderer from './ProfessionalSeatRenderer';
import ProfessionalSeatMapLegend from './ProfessionalSeatMapLegend';
import VenueStageRenderer from './VenueStageRenderer';
import ZoomControls from './ZoomControls';
import AccessibilityFeatures from './AccessibilityFeatures';
import './ProfessionalSeatMapAnimations.css';
import './ProfessionalSeatMapLayouts.css';

const { Title, Text } = Typography;

const ProfessionalSeatMapRenderer = ({
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
  const [isTablet, setIsTablet] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.7);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [hoveredSection, setHoveredSection] = useState(null);
  
  // Estados de accesibilidad
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isKeyboardNavigationEnabled, setIsKeyboardNavigationEnabled] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);
  
  const containerRef = useRef(null);
  const seatMapRef = useRef(null);

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

  // Manejar zoom con rueda del mouse
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  // Manejar arrastre del mapa
  const handleMouseDown = useCallback((e) => {
    if (e.target === seatMapRef.current || seatMapRef.current?.contains(e.target)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners para arrastre
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Controles de zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(3, prev + 0.2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.5, prev - 0.2));
  };

  const handleResetZoom = () => {
    setZoomLevel(0.7);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!seatMapData) return null;

  const { sections, config, type, name } = seatMapData;
  const venueColors = getVenueColors(type);

  // Filtrar asientos ocupados y bloqueados por sección
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
          <ProfessionalSeatRenderer
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
    const pistaSection = sections.find(s => 
      !s.hasNumberedSeats || 
      s.id.includes('pista') || s.name.toLowerCase().includes('pista') ||
      s.id.includes('general') || s.name.toLowerCase().includes('general')
    );
    
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
    const vipSection = sections.find(s => s.id.includes('vip') || s.name.toLowerCase().includes('vip'));

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

        {/* VIP */}
        {vipSection && (
          <div className="vip-section">
            {renderProfessionalSection(vipSection, { gridArea: 'vip' })}
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
    const gradas = sections.filter(s => s.hasNumberedSeats && !s.id.includes('vip'));
    const vipSection = sections.find(s => s.id.includes('vip'));

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

        {/* VIP */}
        {vipSection && (
          <div className="vip-section">
            {renderProfessionalSection(vipSection)}
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
    <>
      {/* Características de accesibilidad */}
      <AccessibilityFeatures
        onHighContrastToggle={setIsHighContrast}
        onScreenReaderToggle={setIsScreenReaderEnabled}
        onKeyboardNavigationToggle={setIsKeyboardNavigationEnabled}
        onTooltipToggle={setShowTooltips}
        isHighContrast={isHighContrast}
        isScreenReaderEnabled={isScreenReaderEnabled}
        isKeyboardNavigationEnabled={isKeyboardNavigationEnabled}
        showTooltips={showTooltips}
        isMobile={isMobile}
      />

      <div 
        ref={containerRef}
        className={`professional-seatmap-container ${isFullscreen ? 'fullscreen' : ''} ${isHighContrast ? 'high-contrast' : ''}`}
        style={{
          position: 'relative',
          width: '100%',
          height: isFullscreen ? '100vh' : 'auto',
          minHeight: isMobile ? '400px' : '600px',
          backgroundColor: COLORS.neutral.grey50,
          borderRadius: isFullscreen ? '0' : '16px',
          overflow: 'hidden',
          boxShadow: isFullscreen ? 'none' : COLORS.shadows.xl
        }}
      >
      {/* Header del mapa */}
      <div className="seatmap-header">
        <div className="header-content">
          <Title level={3} className="venue-title">
            {config?.venueName || config?.stadiumName || config?.cinemaName || config?.theaterName || name}
          </Title>
          <Text className="venue-type">
            {type.charAt(0).toUpperCase() + type.slice(1)} Venue
          </Text>
        </div>
        
        <div className="header-controls">
          <Space>
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => setShowLegend(!showLegend)}
              type={showLegend ? 'primary' : 'default'}
              size="small"
            >
              Leyenda
            </Button>
            <Button
              icon={isFullscreen ? <CompressOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
              size="small"
            />
          </Space>
        </div>
      </div>

      {/* Controles de zoom */}
      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetZoom}
        isMobile={isMobile}
      />

      {/* Contenedor principal del mapa */}
      <div 
        ref={seatMapRef}
        className="seatmap-content"
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100% - 80px)',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <div
          className="seatmap-transform"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.3s ease',
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
          {renderVenueLayout()}
        </div>
      </div>

      {/* Leyenda */}
      {showLegend && (
        <div className="seatmap-legend">
          <ProfessionalSeatMapLegend
            venueType={type}
            showPremium={true}
            showAccessible={true}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Información de selección */}
      {selectedSeats.length > 0 && (
        <div className="selection-info">
          <Text strong>
            {selectedSeats.length} asiento{selectedSeats.length !== 1 ? 's' : ''} seleccionado{selectedSeats.length !== 1 ? 's' : ''}
          </Text>
          <Text>
            Total: {formatPrice(selectedSeats.reduce((sum, seat) => sum + seat.price, 0))}
          </Text>
        </div>
      )}
      </div>
    </>
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

export default ProfessionalSeatMapRenderer;
