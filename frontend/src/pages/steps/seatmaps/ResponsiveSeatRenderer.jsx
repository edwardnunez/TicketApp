import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Collapse, Badge, notification, Switch } from 'antd';
import {
  DownOutlined,
  UpOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { COLORS, getSectionTextColor, getContrastTextColor, getContrastInfoBackground, getSectionLabelColor, getSectionDimensionColor } from '../../../components/colorscheme';
import SeatRenderer from './SeatRenderer';
import SeatMapLegend from './SeatMapLegend';
import MobileSeatList from './MobileSeatList';
import SmartSeatFilters from '../../../components/SmartSeatFilters';
import OptimizedSeatNavigation from '../../../components/OptimizedSeatNavigation';
import PersistentViewSwitcher from '../../../components/PersistentViewSwitcher';
import useDeviceDetection from '../../../hooks/useDeviceDetection';
import './ProfessionalSeatMapAnimations.css';

const { Title, Text } = Typography;

const ResponsiveSeatRenderer = ({
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
  const deviceInfo = useDeviceDetection();
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [hoveredSection, setHoveredSection] = useState(null);
  const [currentView, setCurrentView] = useState(deviceInfo.isMobile ? 'navigation' : 'map');
  const [previousView, setPreviousView] = useState(null);
  const [filters, setFilters] = useState({});

  if (!seatMapData) return null;

  const { sections, config, name } = seatMapData;

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

  const getSectionPrice = (section) => {
    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
      if (eventSectionPricing) {
        return eventSectionPricing.defaultPrice || section.defaultPrice || 0;
      }
    }
    return section.defaultPrice || 0;
  };

  const getSectionAvailability = (section) => {
    if (section.hasNumberedSeats) {
      const totalSeats = section.rows * section.seatsPerRow;
      const occupiedCount = filterOccupiedBySection(section.id).length;
      const blockedCount = filterBlockedBySection(section.id).length;
      const availableSeats = Math.max(0, totalSeats - occupiedCount - blockedCount);
      
      return {
        totalSeats,
        occupiedSeats: occupiedCount,
        blockedSeats: blockedCount,
        availableSeats,
        isFullyBooked: availableSeats === 0 || isSectionBlocked(section.id),
        occupancyRate: totalSeats > 0 ? ((occupiedCount + blockedCount) / totalSeats) * 100 : 0
      };
    } else {
      // Entrada general
      const totalCapacity = section.totalCapacity || 0;
      const occupiedCount = filterOccupiedBySection(section.id).length;
      const availableSeats = Math.max(0, totalCapacity - occupiedCount);
      
      return {
        totalSeats: totalCapacity,
        occupiedSeats: occupiedCount,
        blockedSeats: 0,
        availableSeats,
        isFullyBooked: availableSeats === 0 || isSectionBlocked(section.id),
        occupancyRate: totalCapacity > 0 ? (occupiedCount / totalCapacity) * 100 : 0
      };
    }
  };

  const handleSectionToggle = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderSectionCard = (section) => {
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
                color: availability.isFullyBooked ? COLORS.neutral.grey4 : getSectionLabelColor(section.color, availability.isFullyBooked),
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
              <Text style={{ color: getContrastTextColor(section.color, 0.8, availability.isFullyBooked), fontSize: '12px' }}>
                {section.hasNumberedSeats 
                  ? `${section.rows} filas × ${section.seatsPerRow} asientos`
                  : `Capacidad: ${section.totalCapacity} personas`
                }
              </Text>
              
              <Text strong style={{ color: getSectionTextColor(section.color, availability.isFullyBooked) }}>
                {formatPrice(sectionPrice)}
              </Text>
              
              <Text style={{ 
                color: availability.isFullyBooked ? '#ff4d4f' : '#52c41a',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {availability.availableSeats} disponibles
              </Text>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isExpanded ? <UpOutlined /> : <DownOutlined />}
          </div>
        </div>

        {isExpanded && !availability.isFullyBooked && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
            {section.hasNumberedSeats ? (
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
                responsiveMode={true}
              />
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
              />
            )}
          </div>
        )}
      </Card>
    );
  };

  const renderLayout = () => {
    const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Vista de navegación optimizada (móvil y tablet)
    if (currentView === 'navigation') {
      return (
        <OptimizedSeatNavigation
          sections={sortedSections}
          selectedSeats={selectedSeats}
          onSeatSelect={onSeatSelect}
          formatPrice={formatPrice}
          maxSeats={maxSeats}
          event={event}
        />
      );
    }

    // Vista de filtros inteligentes
    if (currentView === 'filters') {
      return (
        <div>
          <SmartSeatFilters
            sections={sortedSections}
            selectedSeats={selectedSeats}
            onFilterChange={setFilters}
            onSmartSelect={(mode, filteredSections) => {
              // Implementar selección inteligente
              console.log('Smart select:', mode, filteredSections);
            }}
            formatPrice={formatPrice}
            event={event}
          />
          <OptimizedSeatNavigation
            sections={sortedSections}
            selectedSeats={selectedSeats}
            onSeatSelect={onSeatSelect}
            formatPrice={formatPrice}
            maxSeats={maxSeats}
            event={event}
          />
        </div>
      );
    }

    // Vista de lista tradicional (fallback)
    if (currentView === 'list') {
      return (
        <MobileSeatList
          seatMapData={seatMapData}
          selectedSeats={selectedSeats}
          onSeatSelect={onSeatSelect}
          maxSeats={maxSeats}
          occupiedSeats={occupiedSeats}
          blockedSeats={blockedSeats}
          blockedSections={blockedSections}
          formatPrice={formatPrice}
          event={event}
          calculateSeatPrice={calculateSeatPrice}
        />
      );
    }

    // Vista de mapa (por defecto)
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
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: deviceInfo.isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {sortedSections.map(section => renderSectionCard(section))}
        </div>
      </div>
    );
  };

  return (
    <div className="responsive-seatmap-container">
      {/* Conmutador persistente */}
      <PersistentViewSwitcher
        currentView={currentView}
        onViewChange={(newView) => {
          if (newView !== currentView) {
            setPreviousView(currentView);
            setCurrentView(newView);
          }
        }}
        previousView={previousView}
        availableViews={deviceInfo.isMobile ? ['navigation', 'filters'] : ['map', 'navigation', 'filters']}
        showCounts={true}
        mapCount={sections.length}
        listCount={sections.reduce((total, section) => total + (section.rows * section.seatsPerRow), 0)}
      />

      {/* Contenido principal */}
      <div style={{ 
        padding: '20px',
        backgroundColor: COLORS.neutral.grey1,
        minHeight: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, color: getContrastTextColor('#FFFFFF', 1, false) }}>
            {config?.venueName || name}
          </Title>
          <Text style={{ color: getContrastTextColor('#FFFFFF', 0.8, false) }}>
            {currentView === 'map' ? 'Selecciona una sección para ver los asientos disponibles' :
             currentView === 'navigation' ? 'Navega por las secciones y selecciona tus asientos' :
             currentView === 'filters' ? 'Usa los filtros para encontrar los mejores asientos' :
             'Selecciona tus asientos preferidos'}
          </Text>
        </div>

        {/* Leyenda (solo para vista de mapa) */}
        {currentView === 'map' && (
          <SeatMapLegend 
            theme={seatMapData.type || 'generic'}
            showPremium={true}
            showAccessible={true}
            className="depth-2"
            style={{ marginBottom: '16px' }}
          />
        )}

        {/* Contenido según la vista seleccionada */}
        {renderLayout()}
      </div>
    </div>
  );
};

// Componente para entrada general
const GeneralAdmissionRenderer = ({ 
  section, 
  sectionBlocked, 
  formatPrice, 
  selectedSeats, 
  occupiedSeats = [],
  onSeatSelect, 
  maxSeats,
  event
}) => {
  const sameSectionSelected = selectedSeats.filter(s => s.sectionId === section.id);
  const isSelected = sameSectionSelected.length > 0;

  // Capacidad
  const occupiedCount = occupiedSeats.filter(seatId => seatId.startsWith(section.id)).length;
  const totalCapacity = section.totalCapacity || 0;
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
          color: isSelected ? 'white' : getSectionTextColor(section.color),
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
            color: isSelected ? 'white' : getSectionTextColor(section.color),
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

        {/* Indicador de selección múltiple */}
        {sameSectionSelected.length > 1 && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
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

export default ResponsiveSeatRenderer;