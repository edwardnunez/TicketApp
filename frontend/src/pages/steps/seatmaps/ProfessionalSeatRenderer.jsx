import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { 
  CheckOutlined, 
  UserOutlined,
  LockOutlined,
  StarOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { COLORS, getSeatStateColors } from '../../../components/colorscheme';
import SectionShapeRenderer from './SectionShapeRenderer';

const ProfessionalSeatRenderer = ({
  sectionId,
  rows,
  seatsPerRow,
  price,
  color,
  name: sectionName,
  selectedSeats,
  occupiedSeats,
  blockedSeats = [],
  sectionBlocked = false,
  maxSeats,
  onSeatSelect,
  formatPrice,
  event,
  calculateSeatPrice,
  sectionPricing,
  venueType,
  isMobile = false,
  isTablet = false,
  showTooltips = true,
  isHighContrast = false,
  isAdminMode = false
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [seatSize, setSeatSize] = useState({ width: 24, height: 24, fontSize: 10 });

  // Calcular tamaño de asiento basado en dispositivo y número de asientos
  useEffect(() => {
    const calculateSeatSize = () => {
      const totalSeats = rows * seatsPerRow;
      let baseSize = 24;
      let fontSize = 10;

      if (isMobile) {
        baseSize = totalSeats > 100 ? 14 : 18;
        fontSize = totalSeats > 100 ? 7 : 8;
      } else if (isTablet) {
        baseSize = totalSeats > 150 ? 16 : 20;
        fontSize = totalSeats > 150 ? 8 : 9;
      } else {
        baseSize = totalSeats > 200 ? 18 : 22;
        fontSize = totalSeats > 200 ? 9 : 10;
      }

      setSeatSize({ width: baseSize, height: baseSize, fontSize });
    };

    calculateSeatSize();
  }, [rows, seatsPerRow, isMobile, isTablet]);

  // Función para obtener el número de fila correcto según la posición de la sección
  const getRowNumber = (rowIndex) => {
    // Determinar la posición de la sección basada en el nombre
    const sectionNameLower = sectionName.toLowerCase();
    
    // Todas estas secciones tienen numeración inversa (de arriba hacia abajo)
    if (sectionNameLower.includes('sur') || 
        sectionNameLower.includes('south') ||
        sectionNameLower.includes('tribuna sur') ||
        sectionNameLower.includes('grada alta') ||
        sectionNameLower.includes('grada media') ||
        sectionNameLower.includes('grada baja') ||
        sectionNameLower.includes('alta') ||
        sectionNameLower.includes('media') ||
        sectionNameLower.includes('baja')) {
      // Numeración inversa: la primera fila (índice 0) será la más alta numericamente
      return rows - rowIndex;
    } else if (sectionNameLower.includes('norte') || sectionNameLower.includes('north')) {
      // Norte: numeración de abajo hacia arriba (1, 2, 3, 4, 5...)
      return rowIndex + 1;
    } else {
      // Este, Oeste, VIP, otras secciones: numeración normal (1, 2, 3, 4, 5...)
      return rowIndex + 1;
    }
  };

  // Función para determinar si es una sección lateral (este u oeste)
  const isLateralSection = () => {
    const sectionNameLower = sectionName.toLowerCase();
    return sectionNameLower.includes('este') || 
           sectionNameLower.includes('east') ||
           sectionNameLower.includes('oeste') || 
           sectionNameLower.includes('west') ||
           sectionNameLower.includes('tribuna este') ||
           sectionNameLower.includes('tribuna oeste');
  };

  // Función para obtener las dimensiones correctas según el tipo de sección
  const getSectionDimensions = () => {
    if (isLateralSection()) {
      // Para secciones laterales: invertir filas y columnas
      return {
        displayRows: seatsPerRow,    // Las columnas se convierten en filas
        displaySeatsPerRow: rows,    // Las filas se convierten en columnas
        isInverted: true
      };
    } else {
      // Para secciones normales: mantener filas y columnas originales
      return {
        displayRows: rows,
        displaySeatsPerRow: seatsPerRow,
        isInverted: false
      };
    }
  };

  const getSeatId = (row, seat) => {
    const dimensions = getSectionDimensions();
    if (dimensions.isInverted) {
      // Para secciones laterales: el asiento real está en la posición invertida
      return `${sectionId}-${getRowNumber(seat)}-${row + 1}`;
    } else {
      // Para secciones normales: mantener la lógica original
      return `${sectionId}-${getRowNumber(row)}-${seat + 1}`;
    }
  };
  
  const isSeatOccupied = (seatId) => occupiedSeats?.includes(seatId) || false;
  const isSeatSelected = (seatId) => selectedSeats?.some(s => s.id === seatId) || false;
  const isSeatBlocked = (seatId) => {
    if (sectionBlocked) return true;
    return blockedSeats?.includes(seatId) || false;
  };

  const getSeatPrice = (row, seat) => {
    const dimensions = getSectionDimensions();
    let actualRow, actualSeat;
    
    if (dimensions.isInverted) {
      // Para secciones laterales: usar las coordenadas invertidas
      actualRow = seat;
      actualSeat = row;
    } else {
      // Para secciones normales: usar las coordenadas originales
      actualRow = row;
      actualSeat = seat;
    }

    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const sectionPricing = event.sectionPricing.find(sp => sp.sectionId === sectionId);
      
      if (sectionPricing) {
        if (event.usesRowPricing && sectionPricing.rowPricing && sectionPricing.rowPricing.length > 0) {
          const rowNumber = getRowNumber(actualRow);
          const rowPrice = sectionPricing.rowPricing.find(rp => rp.row === rowNumber);
          if (rowPrice) {
            return rowPrice.price;
          }
        }
        
        const defaultPrice = sectionPricing.defaultPrice || price || event.price;
        return defaultPrice;
      }
    }
    
    if (calculateSeatPrice && event) {
      return calculateSeatPrice(sectionId, actualRow, { sections: [{ id: sectionId, price }] }, event);
    }
    
    return price || 0;
  };

  const handleSeatClick = (row, seat) => {
    const seatId = getSeatId(row, seat);
    
    if (isSeatOccupied(seatId) || isSeatBlocked(seatId) || sectionBlocked) return;

    const dimensions = getSectionDimensions();
    let actualRow, actualSeat;
    
    if (dimensions.isInverted) {
      // Para secciones laterales: usar las coordenadas invertidas
      actualRow = seat;
      actualSeat = row;
    } else {
      // Para secciones normales: usar las coordenadas originales
      actualRow = row;
      actualSeat = seat;
    }

    const seatPrice = getSeatPrice(row, seat);
    const seatData = {
      id: seatId,
      section: sectionName,
      sectionId,
      row: getRowNumber(actualRow),
      seat: actualSeat + 1,
      price: seatPrice
    };

    if (isSeatSelected(seatId)) {
      onSeatSelect(selectedSeats.filter(s => s.id !== seatId));
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect([...selectedSeats, seatData]);
    }
  };

  const getSeatState = (seatId) => {
    if (isSeatOccupied(seatId)) return 'occupied';
    if (isSeatBlocked(seatId) || sectionBlocked) return 'blocked';
    if (isSeatSelected(seatId)) return 'selected';
    return 'available';
  };

  const getSeatStyle = (seatId) => {
    const state = getSeatState(seatId);
    const stateColors = getSeatStateColors(state);
    const hovered = hoveredSeat === seatId;
    const seatPrice = getSeatPrice(
      parseInt(seatId.split('-')[1]) - 1,
      parseInt(seatId.split('-')[2]) - 1
    );

    // Determinar categoría basada en el nombre de la sección, no en el precio
    const isPremium = sectionName.toLowerCase().includes('premium') || 
                     sectionName.toLowerCase().includes('vip');
    const isAccessible = sectionName.toLowerCase().includes('accesible') || 
                        sectionName.toLowerCase().includes('accessible');

    const baseStyle = {
      width: `${seatSize.width}px`,
      height: `${seatSize.height}px`,
      minWidth: `${seatSize.width}px`,
      minHeight: `${seatSize.height}px`,
      border: `2px solid ${stateColors.border}`,
      borderRadius: '4px',
      backgroundColor: stateColors.background,
      color: stateColors.color,
      cursor: state === 'available' ? 'pointer' : 'not-allowed',
      opacity: stateColors.opacity || 1,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${seatSize.fontSize}px`,
      fontWeight: '600',
      position: 'relative',
      boxShadow: state === 'selected' ? stateColors.shadow : '0 1px 3px rgba(0,0,0,0.1)',
      transform: hovered && state === 'available' ? 'scale(1.05)' : 'scale(1)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      outline: 'none',
      margin: '1px'
    };

    // Efectos especiales para estados
    if (state === 'selected') {
      baseStyle.background = COLORS.gradients.primary;
      baseStyle.borderColor = COLORS.primary.dark;
      baseStyle.color = COLORS.primary.contrast;
      baseStyle.boxShadow = COLORS.shadows.glow;
    } else if (state === 'available' && hovered) {
      baseStyle.backgroundColor = stateColors.hover || stateColors.background;
      baseStyle.borderColor = color || COLORS.primary.main;
      baseStyle.boxShadow = `0 4px 12px ${color || COLORS.primary.main}30`;
    }

    return baseStyle;
  };

  const getSeatIcon = (seatId, row, seat) => {
    const state = getSeatState(seatId);
    const seatPrice = getSeatPrice(row, seat);
    const isPremium = sectionName.toLowerCase().includes('premium') || 
                     sectionName.toLowerCase().includes('vip');

    const dimensions = getSectionDimensions();
    let actualSeat;
    
    if (dimensions.isInverted) {
      // Para secciones laterales: el número de asiento sigue siendo la columna (seat)
      actualSeat = seat;
    } else {
      // Para secciones normales: el número de asiento es la columna actual
      actualSeat = seat;
    }

    switch (state) {
      case 'selected':
        return <CheckOutlined style={{ fontSize: `${seatSize.fontSize}px`, fontWeight: 'bold' }} />;
      case 'occupied':
        return <UserOutlined style={{ fontSize: `${seatSize.fontSize * 0.8}px` }} />;
      case 'blocked':
        return <LockOutlined style={{ fontSize: `${seatSize.fontSize * 0.8}px` }} />;
      default:
        // Asiento disponible - mostrar número o icono especial
        if (isPremium) {
          return <StarOutlined style={{ fontSize: `${seatSize.fontSize * 0.8}px` }} />;
        }
        return (
          <span style={{ 
            fontSize: `${seatSize.fontSize * 0.7}px`, 
            fontWeight: '600',
            lineHeight: 1
          }}>
            {actualSeat + 1}
          </span>
        );
    }
  };

  const getSeatTooltip = (row, seat, seatId) => {
    const seatPrice = getSeatPrice(row, seat);
    const formattedPrice = isAdminMode ? '' : (formatPrice ? formatPrice(seatPrice) : `€${seatPrice}`);
    const state = getSeatState(seatId);
    const isPremium = sectionName.toLowerCase().includes('premium') || 
                     sectionName.toLowerCase().includes('vip');
    
    const dimensions = getSectionDimensions();
    let actualRow, actualSeat;
    
    if (dimensions.isInverted) {
      // Para secciones laterales: usar las coordenadas invertidas
      actualRow = seat;
      actualSeat = row;
    } else {
      // Para secciones normales: usar las coordenadas originales
      actualRow = row;
      actualSeat = seat;
    }
    
    const tooltips = {
      occupied: {
        title: 'Asiento Ocupado',
        content: `${sectionName} - Fila ${getRowNumber(actualRow)}, Asiento ${actualSeat + 1}`,
        color: COLORS.neutral.grey500
      },
      blocked: {
        title: sectionBlocked ? 'Sección Bloqueada' : 'Asiento Bloqueado',
        content: sectionBlocked ? 'Esta sección no está disponible' : `${sectionName} - Fila ${getRowNumber(actualRow)}, Asiento ${actualSeat + 1}`,
        color: COLORS.secondary.main
      },
      selected: {
        title: 'Asiento Seleccionado',
        content: `${sectionName} - Fila ${getRowNumber(actualRow)}, Asiento ${actualSeat + 1}${isAdminMode ? '' : ` - ${formattedPrice}`}`,
        color: COLORS.primary.main
      },
      available: {
        title: isPremium ? 'Asiento Premium' : `${sectionName} - Fila ${getRowNumber(actualRow)}, Asiento ${actualSeat + 1}`,
        content: isAdminMode ? (isPremium ? 'Asiento Premium' : 'Disponible') : `Precio: ${formattedPrice}${isPremium ? ' (Premium)' : ''}`,
        color: isPremium ? COLORS.accent.gold : (color || COLORS.primary.main)
      }
    };

    return tooltips[state];
  };

  const renderSeat = (row, seat) => {
    const seatId = getSeatId(row, seat);
    const state = getSeatState(seatId);
    const isInteractable = state === 'available';
    const seatStyle = getSeatStyle(seatId);
    const tooltipInfo = getSeatTooltip(row, seat, seatId);
    const seatPrice = getSeatPrice(row, seat);
    const isPremium = sectionName.toLowerCase().includes('premium') || 
                     sectionName.toLowerCase().includes('vip');

    const seatElement = (
      <button
        key={seatId}
        style={seatStyle}
        onClick={() => handleSeatClick(row, seat)}
        onMouseEnter={() => setHoveredSeat(seatId)}
        onMouseLeave={() => setHoveredSeat(null)}
        disabled={!isInteractable}
        onFocus={(e) => {
          if (isInteractable) {
            e.target.style.outline = `2px solid ${color || COLORS.primary.main}`;
            e.target.style.outlineOffset = '2px';
          }
        }}
        onBlur={(e) => {
          e.target.style.outline = 'none';
        }}
        className="professional-seat"
        aria-label={`${sectionName} Fila ${getRowNumber(row)} Asiento ${seat + 1} ${state}`}
      >
        {getSeatIcon(seatId, row, seat)}
        
        {/* Indicador premium */}
        {isPremium && state === 'available' && (
          <div 
            className="premium-indicator"
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '6px',
              height: '6px',
              backgroundColor: COLORS.accent.gold,
              borderRadius: '50%',
              border: '1px solid white',
              boxShadow: COLORS.shadows.glowGold
            }} 
          />
        )}

        {/* Indicador accesible */}
        {(sectionName.toLowerCase().includes('accesible') || 
          sectionName.toLowerCase().includes('accessible')) && 
          state === 'available' && (
          <div 
            className="accessible-indicator"
            style={{
              position: 'absolute',
              bottom: '-2px',
              left: '-2px',
              width: '6px',
              height: '6px',
              backgroundColor: COLORS.accent.green,
              borderRadius: '50%',
              border: '1px solid white',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
            }} 
          />
        )}
      </button>
    );

    if (showTooltips) {
      return (
        <Tooltip
          key={seatId}
          title={
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '4px',
                color: tooltipInfo.color 
              }}>
                {tooltipInfo.title}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                {tooltipInfo.content}
              </div>
            </div>
          }
          placement="top"
          overlayStyle={{ 
            maxWidth: '200px',
            borderRadius: '8px'
          }}
        >
          {seatElement}
        </Tooltip>
      );
    }

    return seatElement;
  };

  const renderRow = (row) => {
    const dimensions = getSectionDimensions();
    // Calcular el ancho exacto necesario para los asientos
    const seatTotalWidth = (seatSize.width + 2) * dimensions.displaySeatsPerRow;
    const labelWidth = isMobile ? 20 : 28;
    
    return (
      <div 
        key={`row-${row}`} 
        className="seat-row"
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: isMobile ? '1px' : '2px',
          width: '100%',
          minHeight: `${seatSize.height + 4}px`,
          position: 'relative'
        }}
      >
        {/* Etiqueta de fila */}
        <div
          className="row-label"
          style={{
            width: `${labelWidth}px`,
            minWidth: `${labelWidth}px`,
            height: `${seatSize.height}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${isMobile ? 9 : 11}px`,
            fontWeight: '600',
            color: sectionBlocked ? COLORS.neutral.grey400 : COLORS.neutral.grey600,
            backgroundColor: sectionBlocked ? COLORS.neutral.grey100 : COLORS.neutral.grey50,
            borderRadius: '3px',
            marginRight: '4px',
            border: `1px solid ${sectionBlocked ? COLORS.neutral.grey200 : COLORS.neutral.grey100}`,
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          {getRowNumber(row)}
        </div>
        
        {/* Grid de asientos - Mejorado para secciones laterales */}
        <div 
          className="seats-grid"
          style={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(${dimensions.displaySeatsPerRow}, ${seatSize.width}px)`,
            gridTemplateRows: `${seatSize.height}px`,
            gap: '1px',
            alignItems: 'center',
            justifyContent: 'start',
            width: 'fit-content', // Cambiado de 'auto' a 'fit-content'
            minWidth: `${seatTotalWidth}px`,
            position: 'relative',
            overflow: 'visible' // Asegurar que no se corte
          }}
        >
          {Array.from({ length: dimensions.displaySeatsPerRow }).map((_, seat) => renderSeat(row, seat))}
        </div>
      </div>
    );
  };

  // Determinar el tipo de sección basado en el nombre
  const getSectionType = () => {
    const name = sectionName.toLowerCase();
    if (name.includes('vip') || name.includes('premium')) return 'vip';
    if (name.includes('grada alta') || name.includes('alta')) return 'grada-alta';
    if (name.includes('grada media') || name.includes('media')) return 'grada-media';
    if (name.includes('grada baja') || name.includes('baja')) return 'grada-baja';
    if (name.includes('pista') || name.includes('general')) return 'pista';
    if (name.includes('lateral') || name.includes('side')) return 'lateral';
    if (name.includes('orchestra') || name.includes('orquesta')) return 'orchestra';
    if (name.includes('mezzanine') || name.includes('mezanine')) return 'mezzanine';
    if (name.includes('balcony') || name.includes('balcón')) return 'balcony';
    return 'default';
  };

  const sectionType = getSectionType();
  const dimensions = getSectionDimensions();

  return (
    <SectionShapeRenderer
      sectionType={sectionType}
      rows={dimensions.displayRows}
      seatsPerRow={dimensions.displaySeatsPerRow}
      isMobile={isMobile}
      sectionBlocked={sectionBlocked}
    >
      {/* Header de la sección */}
      <div 
        className="section-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          paddingBottom: '6px',
          borderBottom: `1px solid ${COLORS.neutral.grey100}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div 
            className="section-color-indicator"
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: sectionBlocked ? COLORS.neutral.grey300 : (color || COLORS.primary.main),
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: COLORS.shadows.sm
            }} 
          />
          <span 
            className="section-name"
            style={{
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: '600',
              color: sectionBlocked ? COLORS.neutral.grey400 : COLORS.neutral.grey800
            }}
          >
            {sectionName}
          </span>
        </div>
        
        <div 
          className="section-info"
          style={{
            fontSize: isMobile ? '10px' : '11px',
            color: sectionBlocked ? COLORS.neutral.grey400 : COLORS.neutral.grey500,
            backgroundColor: sectionBlocked ? COLORS.neutral.grey100 : COLORS.neutral.grey50,
            padding: '2px 6px',
            borderRadius: '8px',
            border: `1px solid ${COLORS.neutral.grey200}`
          }}
        >
          {dimensions.displayRows}×{dimensions.displaySeatsPerRow}
        </div>
      </div>

      {/* Contenedor principal de asientos - Mejorado para secciones laterales */}
      <div 
        className="section-seats-container"
        style={{
          position: 'relative',
          padding: '4px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1px',
          backgroundColor: sectionBlocked ? 'rgba(0,0,0,0.02)' : 'transparent',
          borderRadius: '6px',
          overflow: 'visible', // Cambiado de 'hidden' a 'visible'
          minWidth: 'fit-content' // Asegurar que el contenedor se ajuste al contenido
        }}
      >
        {Array.from({ length: dimensions.displayRows }).map((_, row) => renderRow(row))}
      </div>

      {/* Overlay de bloqueo */}
      {sectionBlocked && (
        <div 
          className="section-blocked-overlay"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.neutral.grey200}`,
            boxShadow: COLORS.shadows.lg,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <LockOutlined style={{ color: COLORS.secondary.main, fontSize: '14px' }} />
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            color: COLORS.secondary.main 
          }}>
            SECCIÓN BLOQUEADA
          </span>
        </div>
      )}
    </SectionShapeRenderer>
  );
};

export default ProfessionalSeatRenderer;