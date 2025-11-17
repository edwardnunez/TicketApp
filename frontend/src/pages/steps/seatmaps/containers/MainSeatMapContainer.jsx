import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Typography, Button, Space, notification } from 'antd';
import {
  FullscreenOutlined,
  CompressOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { COLORS, getVenueColors, getContrastColor } from '../../../../components/colorscheme';
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
          color: COLORS.neutral.grey600,
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
              color: COLORS.neutral.grey600,
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
                color: COLORS.neutral.grey600,
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
  isPreviewMode = false,
  onSectionToggle = null
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

  // Centrar el scroll en móvil cuando se carga el mapa o cambia el zoom
  useEffect(() => {
    if (isMobile && seatMapRef.current) {
      const centerScroll = () => {
        const container = seatMapRef.current;
        if (container) {
          const scrollWidth = container.scrollWidth;
          const clientWidth = container.clientWidth;
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;

          const centerX = (scrollWidth - clientWidth) / 2;
          const centerY = (scrollHeight - clientHeight) / 2;

          container.scrollTo({
            left: centerX,
            top: centerY,
            behavior: 'auto'
          });
        }
      };

      // Centrar después de un breve delay para asegurar que el DOM esté actualizado
      const timer = setTimeout(centerScroll, 50);
      return () => clearTimeout(timer);
    }
  }, [isMobile, seatMapData, zoomLevel]);

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
            onSectionToggle={onSectionToggle}
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
    // Crear un mapa de secciones por área para evitar búsquedas ambiguas
    const sectionsByArea = new Map();
    
    sections.forEach(s => {
      const pos = (s.position || '').toLowerCase();

      if (pos.includes('north') || pos.includes('fondo-norte')) {
        sectionsByArea.set('norte', s);

      } else if (pos.includes('south') || pos.includes('fondo-sur')) {
        sectionsByArea.set('sur', s);

      } else if (pos.includes('east') || pos.includes('lateral-este')) {
        sectionsByArea.set('este', s);

      } else if (pos.includes('west') || pos.includes('lateral-oeste')) {
        sectionsByArea.set('oeste', s);

      } else if (pos.includes('vip')) {
        if (!sectionsByArea.has('vip-premium')) {
          sectionsByArea.set('vip-premium', []);
        }
        sectionsByArea.get('vip-premium').push(s);
      }
    });
    
    return (
      <div className="football-stadium-layout">
        {/* Tribuna Norte */}
        {sectionsByArea.has('norte') && (
          <div className="tribuna-norte">
            {renderProfessionalSection(sectionsByArea.get('norte'), {
              gridArea: 'north'
            })}
          </div>
        )}

        {/* Tribuna Oeste */}
        {sectionsByArea.has('oeste') && (
          <div className="tribuna-oeste">
            {renderProfessionalSection(sectionsByArea.get('oeste'), {
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
        {sectionsByArea.has('este') && (
          <div className="tribuna-este">
            {renderProfessionalSection(sectionsByArea.get('este'), {
              gridArea: 'east'
            })}
          </div>
        )}

        {/* Tribuna Sur */}
        {sectionsByArea.has('sur') && (
          <div className="tribuna-sur">
            {renderProfessionalSection(sectionsByArea.get('sur'), {
              gridArea: 'south'
            })}
          </div>
        )}

        {/* VIP */}
        {sectionsByArea.has('vip') && (
          <div className="vip-section">
            {renderProfessionalSection(sectionsByArea.get('vip'), {
              gridArea: 'vip'
            })}
          </div>
        )}
      </div>
    );
  };

  const renderConcertVenueLayout = () => {
    // Detectar si es un concierto tipo estadio o tipo teatro
    const hasDirectionalSections = sections.some(s => {
      const nameLC = (s.name || '').toLowerCase();
      const idLC = (s.id || '').toLowerCase();
      
      return (
        nameLC.includes('norte') || idLC.includes('norte') ||
        nameLC.includes('north') || idLC.includes('north') ||
        nameLC.includes('sur') || idLC.includes('sur') ||
        nameLC.includes('south') || idLC.includes('south') ||
        nameLC.includes('este') || idLC.includes('este') ||
        nameLC.includes('east') || idLC.includes('east') ||
        nameLC.includes('oeste') || idLC.includes('oeste') ||
        nameLC.includes('west') || idLC.includes('west')
      );
    });

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
    const sectionsByArea = new Map();
    
    sections.forEach(s => {
      const pos = (s.position || '').toLowerCase();

      if (pos.includes('north') || pos.includes('fondo-norte')) {
        sectionsByArea.set('norte', s);

      } else if (pos.includes('south') || pos.includes('fondo-sur')) {
        sectionsByArea.set('sur', s);

      } else if (pos.includes('east') || pos.includes('lateral-este')) {
        sectionsByArea.set('este', s);

      } else if (pos.includes('west') || pos.includes('lateral-oeste')) {
        sectionsByArea.set('oeste', s);

      } else if (pos.includes('vip')) {
        if (!sectionsByArea.has('vip-premium')) {
          sectionsByArea.set('vip-premium', []);
        }
        sectionsByArea.get('vip-premium').push(s);
      }
    });

    return (
      <div className="concert-stadium-layout">
        {/* Tribuna Norte */}
        {sectionsByArea.has('norte') && (
          <div className="tribuna-norte">
            {renderProfessionalSection(sectionsByArea.get('norte'), { gridArea: 'north' })}
          </div>
        )}

        {/* Tribuna Oeste */}
        {sectionsByArea.has('oeste') && (
          <div className="tribuna-oeste">
            {renderProfessionalSection(sectionsByArea.get('oeste'), { gridArea: 'west' })}
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
        {sectionsByArea.has('pista') && (
          <div className="pit-area">
            {renderProfessionalSection(sectionsByArea.get('pista'))}
          </div>
        )}

        {/* Tribuna Este */}
        {sectionsByArea.has('este') && (
          <div className="tribuna-este">
            {renderProfessionalSection(sectionsByArea.get('este'), { gridArea: 'east' })}
          </div>
        )}

        {/* Tribuna Sur */}
        {sectionsByArea.has('sur') && (
          <div className="tribuna-sur">
            {renderProfessionalSection(sectionsByArea.get('sur'), { gridArea: 'south' })}
          </div>
        )}

        {/* VIP y Palcos Premium */}
        {sectionsByArea.has('vip-premium') && sectionsByArea.get('vip-premium').length > 0 && (
          <div className="vip-premium-sections">
            {sectionsByArea.get('vip-premium').map(section => (
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
    const sectionsByArea = new Map();
    const gradasList = [];
    
    sections.forEach(s => {
      const nameLC = (s.name || '').toLowerCase();
      const idLC = (s.id || '').toLowerCase();
      
      if (nameLC.includes('pista') || idLC.includes('pista') || nameLC.includes('general') || idLC.includes('general')) {
        sectionsByArea.set('pista', s);
      } else if (nameLC.includes('vip') || idLC.includes('vip') || nameLC.includes('palco') || idLC.includes('palco') || nameLC.includes('premium') || idLC.includes('premium')) {
        if (!sectionsByArea.has('vip-premium')) {
          sectionsByArea.set('vip-premium', []);
        }
        sectionsByArea.get('vip-premium').push(s);
      } else {
        // Todas las demás son gradas
        gradasList.push(s);
      }
    });

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
        {sectionsByArea.has('pista') && (
          <div className="pista-section">
            {renderProfessionalSection(sectionsByArea.get('pista'))}
          </div>
        )}

        {/* Gradas */}
        {gradasList.length > 0 && (
          <div className="gradas-container">
            {gradasList.map(section => renderProfessionalSection(section))}
          </div>
        )}

        {/* VIP y Palcos Premium */}
        {sectionsByArea.has('vip-premium') && sectionsByArea.get('vip-premium').length > 0 && (
          <div className="vip-premium-sections">
            {sectionsByArea.get('vip-premium').map(section => (
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
    const sectionsByArea = new Map();
    
    sections.forEach(s => {
      const nameLC = (s.name || '').toLowerCase();
      const idLC = (s.id || '').toLowerCase();
      
      if (nameLC.includes('premium') || idLC.includes('premium')) {
        sectionsByArea.set('premium', s);
      } else if (nameLC.includes('front') || idLC.includes('front') || nameLC.includes('delante') || idLC.includes('delante')) {
        sectionsByArea.set('front', s);
      } else if (nameLC.includes('middle') || idLC.includes('middle') || nameLC.includes('medio') || idLC.includes('medio')) {
        sectionsByArea.set('middle', s);
      } else if (nameLC.includes('back') || idLC.includes('back') || nameLC.includes('atrás') || idLC.includes('atrás') || nameLC.includes('atras') || idLC.includes('atras')) {
        sectionsByArea.set('back', s);
      } else if (nameLC.includes('vip') || idLC.includes('vip')) {
        sectionsByArea.set('vip', s);
      }
    });

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
        {sectionsByArea.has('vip') && (
          <div className="vip-section">
            {renderProfessionalSection(sectionsByArea.get('vip'))}
          </div>
        )}

        {/* Premium (si existe) */}
        {sectionsByArea.has('premium') && (
          <div className="premium-section">
            {renderProfessionalSection(sectionsByArea.get('premium'))}
          </div>
        )}

        {/* Fila delantera */}
        {sectionsByArea.has('front') && (
          <div className="front-section">
            {renderProfessionalSection(sectionsByArea.get('front'))}
          </div>
        )}

        {/* Fila media */}
        {sectionsByArea.has('middle') && (
          <div className="middle-section">
            {renderProfessionalSection(sectionsByArea.get('middle'))}
          </div>
        )}

        {/* Fila trasera */}
        {sectionsByArea.has('back') && (
          <div className="back-section">
            {renderProfessionalSection(sectionsByArea.get('back'))}
          </div>
        )}
      </div>
    );
  };

  // Layout para teatro
  const renderTheaterLayout = () => {
    const sectionsByArea = new Map();
    
    sections.forEach(s => {
      const nameLC = (s.name || '').toLowerCase();
      const idLC = (s.id || '').toLowerCase();
      
      if (nameLC.includes('orchestra') || idLC.includes('orchestra') || nameLC.includes('orquesta') || idLC.includes('orquesta')) {
        sectionsByArea.set('orchestra', s);
      } else if (nameLC.includes('mezzanine') || idLC.includes('mezzanine') || nameLC.includes('mezanine') || idLC.includes('mezanine')) {
        sectionsByArea.set('mezzanine', s);
      } else if (nameLC.includes('balcony') || idLC.includes('balcony') || nameLC.includes('balcón') || idLC.includes('balcón')) {
        sectionsByArea.set('balcony', s);
      } else if (nameLC.includes('boxes') || idLC.includes('boxes') || nameLC.includes('palcos') || idLC.includes('palcos')) {
        sectionsByArea.set('boxes', s);
      } else if ((nameLC.includes('vip') || idLC.includes('vip')) && !nameLC.includes('boxes') && !idLC.includes('boxes') && !nameLC.includes('palcos') && !idLC.includes('palcos')) {
        sectionsByArea.set('vip', s);
      }
    });

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
        {sectionsByArea.has('boxes') && (
          <div className="boxes-section">
            {renderProfessionalSection(sectionsByArea.get('boxes'))}
          </div>
        )}

        {/* Orquesta */}
        {sectionsByArea.has('orchestra') && (
          <div className="orchestra-section">
            {renderProfessionalSection(sectionsByArea.get('orchestra'))}
          </div>
        )}

        {/* Mezzanine */}
        {sectionsByArea.has('mezzanine') && (
          <div className="mezzanine-section">
            {renderProfessionalSection(sectionsByArea.get('mezzanine'))}
          </div>
        )}

        {/* Balcón */}
        {sectionsByArea.has('balcony') && (
          <div className="balcony-section">
            {renderProfessionalSection(sectionsByArea.get('balcony'))}
          </div>
        )}

        {/* VIP */}
        {sectionsByArea.has('vip') && (
          <div className="vip-section">
            {renderProfessionalSection(sectionsByArea.get('vip'))}
          </div>
        )}
      </div>
    );
  };

  // Layout para arena
  const renderArenaLayout = () => {
    const sectionsByArea = new Map();
    const lowerSections = [];
    const upperSections = [];
    const vipSections = [];
    
    sections.forEach(s => {
      const nameLC = (s.name || '').toLowerCase();
      const idLC = (s.id || '').toLowerCase();
      
      if (nameLC.includes('pista') || idLC.includes('pista')) {
        sectionsByArea.set('pista', s);
      } else if (nameLC.includes('lower') || idLC.includes('lower')) {
        lowerSections.push(s);
      } else if (nameLC.includes('upper') || idLC.includes('upper')) {
        upperSections.push(s);
      } else if (nameLC.includes('vip') || idLC.includes('vip')) {
        vipSections.push(s);
      }
    });

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
        {sectionsByArea.has('pista') && (
          <div className="pista-section">
            {renderProfessionalSection(sectionsByArea.get('pista'))}
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
          top: isAdminMode ? (isMobile ? '10px' : '250px') : ((!isAdminMode && !isPreviewMode) ? '70px' : '10px'),
          right: isMobile ? '10px' : (isAdminMode ? '120px' : '10px'),
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
            display: isMobile ? 'block' : 'flex',
            justifyContent: isMobile ? 'initial' : 'center',
            alignItems: isMobile ? 'initial' : 'center',
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
          {isMobile ? (
            // En móvil: wrapper adicional para centrado con scroll
            <div
              style={{
                display: 'inline-block',
                minWidth: '100%',
                minHeight: '100%',
                textAlign: 'center',
                padding: '50vh 50vw', // Padding para permitir centrado con scroll
                boxSizing: 'content-box'
              }}
            >
              <div
                className="seatmap-transform"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: isInteracting ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'inline-block',
                  width: 'fit-content',
                  height: 'fit-content',
                  position: 'relative',
                  minWidth: '1400px',
                  willChange: isInteracting ? 'transform' : 'auto'
                }}
              >
                {renderVenueLayout()}
              </div>
            </div>
          ) : (
            // En desktop: comportamiento normal con pan
            <div
              className="seatmap-transform"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isInteracting ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                width: 'fit-content',
                height: 'fit-content',
                position: 'relative',
                minWidth: 'auto',
                minHeight: 'auto',
                maxWidth: 'none',
                maxHeight: 'none',
                willChange: isInteracting ? 'transform' : 'auto'
              }}
            >
              {renderVenueLayout()}
            </div>
          )}
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
  const selectedCount = sameSectionSelected.length;

  const pricingCapacity = sectionCapacityFromPricing;
  const occupiedCount = occupiedSeats.filter(seatId => seatId.startsWith(section.id)).length;
  const totalCapacity = pricingCapacity || section.totalCapacity || 0;
  const remainingCapacity = Math.max(totalCapacity - occupiedCount, 0);
  const capacityPercentage = totalCapacity > 0 ? ((totalCapacity - remainingCapacity) / totalCapacity) * 100 : 0;

  const isFullyBooked = sectionBlocked || remainingCapacity <= 0;
  const isNearCapacity = capacityPercentage > 80;

  // Obtener el color de la sección o usar un color por defecto
  const sectionColor = section.color || COLORS.primary.main;

  // Calcular el color de texto con buen contraste sobre el fondo de la sección
  const textColor = getContrastColor(sectionColor, COLORS.neutral.white, COLORS.neutral.darker);

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
      <div
        style={{
          minWidth: '380px',
          padding: '40px',
          background: '#F3F4F6',
          border: '3px dashed #D1D5DB',
          borderRadius: '20px',
          textAlign: 'center',
          color: '#9CA3AF',
          opacity: 0.7
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
        <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '6px' }}>AGOTADO</div>
        <div style={{ fontSize: '16px' }}>No hay entradas disponibles</div>
      </div>
    );
  }

  return (
    <div
      onClick={handleSectionClick}
      style={{
        minWidth: '420px',
        maxWidth: '480px',
        padding: '36px 44px',
        background: `linear-gradient(135deg, ${sectionColor}E6 0%, ${sectionColor}D9 100%)`,
        border: `3px solid ${sectionColor}`,
        borderRadius: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: selectedCount > 0
          ? `0 8px 32px ${sectionColor}40, 0 0 0 4px ${sectionColor}20`
          : `0 4px 16px rgba(0,0,0,0.08)`,
        transform: selectedCount > 0 ? 'scale(1.02)' : 'scale(1)',
        position: 'relative',
        overflow: 'visible'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${sectionColor}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = selectedCount > 0 ? 'scale(1.02)' : 'scale(1)';
        e.currentTarget.style.boxShadow = selectedCount > 0
          ? `0 8px 32px ${sectionColor}40, 0 0 0 4px ${sectionColor}20`
          : `0 4px 16px rgba(0,0,0,0.08)`;
      }}
    >
      {/* Indicador de color de sección */}
      <div style={{
        width: '32px',
        height: '32px',
        backgroundColor: sectionColor,
        borderRadius: '50%',
        margin: '0 auto 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        boxShadow: `0 4px 12px ${sectionColor}60`
      }}>
        🎫
      </div>

      {/* Nombre de la sección */}
      <div style={{
        fontSize: '18px',
        fontWeight: '700',
        color: textColor,
        textAlign: 'center',
        marginBottom: '20px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {section.name}
      </div>

      {/* Contador de entradas seleccionadas */}
      {selectedCount > 0 && (
        <div style={{
          backgroundColor: `${sectionColor}`,
          color: '#FFFFFF',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          textAlign: 'center',
          boxShadow: `0 6px 20px ${sectionColor}50`
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: '900',
            lineHeight: '1',
            marginBottom: '8px'
          }}>
            {selectedCount}
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            opacity: 0.95
          }}>
            {selectedCount === 1 ? 'Entrada seleccionada' : 'Entradas seleccionadas'}
          </div>
        </div>
      )}

      {/* Barra de capacidad */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: `${sectionColor}40`,
        borderRadius: '4px',
        marginBottom: '12px',
        overflow: 'hidden'
      }}>
        <div
          style={{
            height: '100%',
            width: `${capacityPercentage}%`,
            backgroundColor: sectionColor,
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Información de capacidad */}
      <div style={{
        fontSize: '15px',
        color: textColor,
        textAlign: 'center',
        marginBottom: '20px',
        fontWeight: '500',
        opacity: 0.9
      }}>
        {remainingCapacity} de {totalCapacity} disponibles
        {isNearCapacity && (
          <div style={{
            color: '#EF4444',
            fontSize: '13px',
            marginTop: '4px',
            fontWeight: '600'
          }}>
            ¡Pocas quedan!
          </div>
        )}
      </div>

      {/* Precio */}
      <div style={{
        padding: '14px 28px',
        background: `${sectionColor}`,
        borderRadius: '12px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: '700',
        color: '#FFFFFF',
        boxShadow: `0 4px 12px ${sectionColor}40`
      }}>
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

      {/* Indicador de "Click para seleccionar" */}
      {selectedCount === 0 && (
        <div style={{
          marginTop: '16px',
          fontSize: '13px',
          color: textColor,
          textAlign: 'center',
          fontWeight: '600',
          opacity: 0.8
        }}>
          Click para añadir entrada
        </div>
      )}
    </div>
  );
};

export default MainSeatMapContainer;
