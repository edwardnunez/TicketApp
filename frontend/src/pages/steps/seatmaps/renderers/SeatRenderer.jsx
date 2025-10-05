import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { 
  CheckOutlined, 
  UserOutlined,
  LockOutlined
} from '@ant-design/icons';
import { COLORS, getRowLabelColor, getContrastInfoBackground, getContrastBorderColor } from '../../../../components/colorscheme';

/**
 * Individual seat renderer component for numbered seating sections
 * @param {Object} props - Component props
 * @param {string} props.sectionId - Section identifier
 * @param {number} props.rows - Number of rows in section
 * @param {number} props.seatsPerRow - Number of seats per row
 * @param {number} props.price - Base price for seats in section
 * @param {string} props.color - Section color
 * @param {string} props.name - Section name
 * @param {Array} props.selectedSeats - Currently selected seats
 * @param {Array} props.occupiedSeats - List of occupied seat IDs
 * @param {Array} [props.blockedSeats=[]] - List of blocked seat IDs
 * @param {boolean} [props.sectionBlocked=false] - Whether entire section is blocked
 * @param {number} props.maxSeats - Maximum number of selectable seats
 * @param {Function} props.onSeatSelect - Seat selection handler
 * @param {Function} props.formatPrice - Price formatting function
 * @param {Object} props.event - Event data object
 * @param {Function} props.calculateSeatPrice - Seat price calculation function
 * @param {boolean} [props.compactMode=false] - Whether in compact display mode
 * @param {boolean} [props.responsiveMode=false] - Whether in responsive mode
 * @returns {JSX.Element} Seat renderer with interactive seat grid
 */
const SeatRenderer = ({
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
  compactMode = false,
  responsiveMode = false, // Nueva prop para modo responsive
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to get the correct row number based on section position
  const getRowNumber = (rowIndex) => {
    // Determine section position based on name
    const sectionNameLower = sectionName.toLowerCase();
    
    if (sectionNameLower.includes('norte') || sectionNameLower.includes('north')) {
      // North: numbering from bottom to top (1, 2, 3, 4, 5...)
      return rowIndex + 1;
    } else if (sectionNameLower.includes('sur') || sectionNameLower.includes('south')) {
      // Sur: numeración de arriba hacia abajo (5, 4, 3, 2, 1...)
      return rows - rowIndex;
    } else {
      // Este, Oeste, VIP, Gradas: numeración normal (1, 2, 3, 4, 5...)
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
    // Si toda la sección está bloqueada, todos los asientos están bloqueados
    if (sectionBlocked) return true;
    // Verificar si el asiento específico está bloqueado
    return blockedSeats?.includes(seatId) || false;
  };

  const getSeatPrice = (row, seat) => {
    const dimensions = getSectionDimensions();
    let actualRow;
    
    if (dimensions.isInverted) {
      // Para secciones laterales: usar las coordenadas invertidas
      actualRow = seat;
    } else {
      // Para secciones normales: usar las coordenadas originales
      actualRow = row;
    }

    // Si el evento usa pricing por secciones, calcular dinámicamente
    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const sectionPricing = event.sectionPricing.find(sp => sp.sectionId === sectionId);
      
      if (sectionPricing) {
        // Si usa pricing por filas, buscar precio específico para la fila
        if (event.usesRowPricing && sectionPricing.rowPricing && sectionPricing.rowPricing.length > 0) {
          const rowNumber = getRowNumber(actualRow);
          const rowPrice = sectionPricing.rowPricing.find(rp => rp.row === rowNumber);
          if (rowPrice) {
            return rowPrice.price;
          }
        }
        
        // Si no hay precio específico por fila, usar defaultPrice
        const defaultPrice = sectionPricing.defaultPrice || price || event.price;
        return defaultPrice;
      }
    }
    
    // Si tiene función de cálculo externa, usarla
    if (calculateSeatPrice && event) {
      return calculateSeatPrice(sectionId, actualRow, { sections: [{ id: sectionId, price }] }, event);
    }
    
    // Fallback al precio de la sección del seatMap
    const fallbackPrice = price || 0;
    return fallbackPrice;
  };

  const handleSeatClick = (row, seat) => {
    const seatId = getSeatId(row, seat);
    
    // No permitir interacción si el asiento está ocupado, bloqueado, o la sección está bloqueada
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

  const getSeatStyle = (seatId) => {
    const occupied = isSeatOccupied(seatId);
    const blocked = isSeatBlocked(seatId) || sectionBlocked;
    const selected = isSeatSelected(seatId);
    const hovered = hoveredSeat === seatId;

    if (occupied) {
      return {
        backgroundColor: '#E5E7EB',
        borderColor: '#D1D5DB',
        color: '#9CA3AF',
        cursor: 'not-allowed',
        opacity: 0.6,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      };
    }

    if (blocked) {
      return {
        backgroundColor: '#FEE2E2',
        borderColor: '#FCA5A5',
        color: '#DC2626',
        cursor: 'not-allowed',
        opacity: 0.7,
        boxShadow: 'inset 0 2px 4px rgba(220,38,38,0.2)'
      };
    }

    if (selected) {
      return {
        backgroundColor: COLORS.primary.main,
        borderColor: COLORS.primary.dark || '#1D4ED8',
        color: 'white',
        cursor: 'pointer',
        opacity: 1,
        boxShadow: `0 4px 12px ${COLORS.primary.main}40, 0 0 0 2px ${COLORS.primary.main}20`,
        transform: 'scale(1.05)'
      };
    }

    // Asiento disponible
    const baseColor = color || COLORS.primary.main;
    return {
      backgroundColor: hovered ? `${baseColor}15` : 'white',
      borderColor: hovered ? baseColor : `${baseColor}40`,
      color: baseColor,
      cursor: 'pointer',
      opacity: 1,
      boxShadow: hovered 
        ? `0 4px 12px ${baseColor}30, 0 0 0 1px ${baseColor}20`
        : '0 2px 8px rgba(0,0,0,0.08)',
      transform: hovered ? 'scale(1.02)' : 'scale(1)'
    };
  };

  const getSeatTooltip = (row, seat, seatId) => {
    const seatPrice = getSeatPrice(row, seat);
    const formattedPrice = formatPrice ? formatPrice(seatPrice) : `€${seatPrice}`;
    
    if (isSeatOccupied(seatId)) {
      return {
        title: 'Asiento Ocupado',
        content: `${sectionName} - Fila ${getRowNumber(row)}, Asiento ${seat + 1}`,
        color: '#9CA3AF'
      };
    }
    
    if (sectionBlocked) {
      return {
        title: 'Sección Bloqueada',
        content: 'Esta sección no está disponible para la venta',
        color: '#DC2626'
      };
    }
    
    if (isSeatBlocked(seatId)) {
      return {
        title: 'Asiento Bloqueado',
        content: `${sectionName} - Fila ${getRowNumber(row)}, Asiento ${seat + 1}`,
        color: '#DC2626'
      };
    }
    
    return {
      title: `${sectionName} - Fila ${getRowNumber(row)}, Asiento ${seat + 1}`,
      content: `Precio: ${formattedPrice}`,
      color: color || COLORS.primary.main
    };
  };

  // Calcular tamaños dinámicamente basado en el modo
  const getSeatSize = () => {
    if (responsiveMode) {
      // En modo responsive, hacer los asientos más pequeños
      if (isMobile) {
        return {
          width: 16,
          height: 16,
          margin: 0.5,
          fontSize: 6,
          borderRadius: 2
        };
      } else {
        return {
          width: 20,
          height: 20,
          margin: 0.5,
          fontSize: 8,
          borderRadius: 3
        };
      }
    } else if (compactMode) {
      return {
        width: 20,
        height: 20,
        margin: 1,
        fontSize: 8,
        borderRadius: 3
      };
    } else {
      // Tamaño normal
      return {
        width: 24,
        height: 24,
        margin: 1,
        fontSize: 10,
        borderRadius: 4
      };
    }
  };

  const getRowLabelWidth = () => {
    if (responsiveMode && isMobile) {
      return 20;
    } else if (responsiveMode || compactMode) {
      return 25;
    } else {
      return 30;
    }
  };

  const seatSize = getSeatSize();
  const rowLabelWidth = getRowLabelWidth();

  const renderSeat = (row, seat) => {
    const seatId = getSeatId(row, seat);
    const occupied = isSeatOccupied(seatId);
    const blocked = isSeatBlocked(seatId);
    const selected = isSeatSelected(seatId);
    const isInteractable = !occupied && !blocked && !sectionBlocked;
    const seatStyle = getSeatStyle(seatId);
    const tooltipInfo = getSeatTooltip(row, seat, seatId);
    const currentSeatSize = adaptiveSeatSize;

    // Determinar el icono a mostrar
    const getSeatIcon = () => {
      if (selected) {
        return <CheckOutlined style={{ fontSize: currentSeatSize.fontSize, fontWeight: 'bold' }} />;
      }
      if (occupied) {
        return <UserOutlined style={{ fontSize: currentSeatSize.fontSize * 0.8 }} />;
      }
      if (blocked || sectionBlocked) {
        return <LockOutlined style={{ fontSize: currentSeatSize.fontSize * 0.8 }} />;
      }
      // Asiento disponible - mostrar número del asiento
      return (
        <span style={{ 
          fontSize: currentSeatSize.fontSize * 0.7, 
          fontWeight: '600',
          lineHeight: 1
        }}>
          {seat + 1}
        </span>
      );
    };

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
        <button
          style={{
            width: currentSeatSize.width,
            height: currentSeatSize.height,
            margin: currentSeatSize.margin,
            border: `2px solid ${seatStyle.borderColor}`,
            borderRadius: currentSeatSize.borderRadius,
            backgroundColor: seatStyle.backgroundColor,
            cursor: seatStyle.cursor,
            opacity: seatStyle.opacity,
            transform: seatStyle.transform,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: currentSeatSize.fontSize,
            color: seatStyle.color,
            position: 'relative',
            boxShadow: seatStyle.boxShadow,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            outline: 'none',
            // Efecto de profundidad
            background: selected 
              ? `linear-gradient(135deg, ${seatStyle.backgroundColor} 0%, ${seatStyle.backgroundColor}dd 100%)`
              : `linear-gradient(135deg, ${seatStyle.backgroundColor} 0%, ${seatStyle.backgroundColor}f0 100%)`,
          }}
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
        >
          {getSeatIcon()}
          
          {/* Indicador de premium/VIP si aplica */}
          {!occupied && !blocked && !sectionBlocked && (sectionName.toLowerCase().includes('premium') || sectionName.toLowerCase().includes('vip')) && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              backgroundColor: '#FFD700',
              borderRadius: '50%',
              border: '1px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
          )}
        </button>
      </Tooltip>
    );
  };

  const renderRow = (row) => (
    <div 
      key={`row-${row}`} 
      style={{ 
        display: 'flex', 
        alignItems: 'center',
        marginBottom: responsiveMode && isMobile ? 2 : 4,
        padding: '2px 0',
        position: 'relative'
      }}
    >
      {/* Etiqueta de fila mejorada */}
      <div
        style={{
          width: rowLabelWidth,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: responsiveMode && isMobile ? 10 : 12,
          fontWeight: '600',
          color: getRowLabelColor(color, sectionBlocked),
          backgroundColor: getContrastInfoBackground(color, sectionBlocked),
          borderRadius: '4px',
          padding: '2px 4px',
          marginRight: '8px',
          border: `1px solid ${getContrastBorderColor(color, sectionBlocked)}`,
          transition: 'all 0.2s ease'
        }}
      >
        {getRowNumber(row)}
      </div>
      
      {/* Contenedor de asientos con separación visual */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '1px',
        position: 'relative',
        overflowX: 'auto',
        maxWidth: '100%'
      }}>
        {Array.from({ length: Math.min(dimensions.displaySeatsPerRow, 25) }).map((_, seat) => renderSeat(row, seat))}
        {dimensions.displaySeatsPerRow > 25 && (
          <div style={{
            padding: '0 8px',
            fontSize: '10px',
            color: '#6B7280',
            fontStyle: 'italic'
          }}>
            +{dimensions.displaySeatsPerRow - 25} más
          </div>
        )}
      </div>
      
      {/* Línea de separación sutil entre filas */}
      {row < rows - 1 && (
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          left: rowLabelWidth + 8,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, #E5E7EB 20%, #E5E7EB 80%, transparent 100%)',
          opacity: 0.5
        }} />
      )}
    </div>
  );

  // Calcular el ancho total del contenedor basado en el contenido
  const getContainerWidth = () => {
    if (responsiveMode) {
      const seatTotalWidth = (seatSize.width + (seatSize.margin * 2)) * seatsPerRow;
      const labelWidth = rowLabelWidth;
      return seatTotalWidth + labelWidth;
    }
    return 'auto';
  };

  // Calcular el ancho máximo permitido para evitar overflow
  const getMaxWidth = () => {
    const maxSeatsPerRow = Math.min(seatsPerRow, 25); // Límite máximo de 25 asientos por fila
    const seatTotalWidth = (seatSize.width + (seatSize.margin * 2)) * maxSeatsPerRow;
    const labelWidth = rowLabelWidth;
    return seatTotalWidth + labelWidth + 32; // 32px de padding extra
  };

  // Función para calcular el tamaño de asiento adaptativo para gradas
  const getAdaptiveSeatSize = () => {
    const baseSize = getSeatSize();
    
    // Para gradas, hacer los asientos más pequeños si hay muchas filas
    if (rows > 15) {
      return {
        ...baseSize,
        width: Math.max(baseSize.width * 0.8, 16),
        height: Math.max(baseSize.height * 0.8, 16),
        fontSize: Math.max(baseSize.fontSize * 0.8, 8)
      };
    }
    
    return baseSize;
  };

  const containerWidth = getContainerWidth();
  const maxWidth = getMaxWidth();
  const adaptiveSeatSize = getAdaptiveSeatSize();
  const dimensions = getSectionDimensions();

  return (
    <div 
      style={{ 
        position: 'relative', 
        opacity: sectionBlocked ? 0.6 : 1, 
        padding: responsiveMode && isMobile ? '8px' : '12px',
        overflowX: responsiveMode ? 'auto' : 'hidden',
        WebkitOverflowScrolling: responsiveMode ? 'touch' : undefined,
        width: responsiveMode ? containerWidth : 'auto',
        maxWidth: maxWidth,
        minWidth: responsiveMode ? 'fit-content' : undefined,
        backgroundColor: sectionBlocked ? '#F9FAFB' : 'white',
        borderRadius: '8px',
        border: sectionBlocked ? '2px dashed #D1D5DB' : '1px solid #E5E7EB',
        boxShadow: sectionBlocked 
          ? 'inset 0 2px 4px rgba(0,0,0,0.06)' 
          : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header de la sección con información */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: sectionBlocked ? '#D1D5DB' : (color || COLORS.primary.main),
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }} />
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: sectionBlocked ? '#9CA3AF' : (COLORS?.neutral?.darker || '#1F2937')
          }}>
            {sectionName}
          </span>
        </div>
        
        <div style={{
          fontSize: '12px',
          color: sectionBlocked ? '#9CA3AF' : (COLORS?.neutral?.grey4 || '#6B7280'),
          backgroundColor: sectionBlocked ? '#F3F4F6' : '#F9FAFB',
          padding: '2px 8px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB'
        }}>
          {rows} filas × {seatsPerRow} asientos
        </div>
      </div>

      {/* Contenedor de asientos */}
      <div style={{
        position: 'relative',
        padding: '8px 0'
      }}>
        {Array.from({ length: dimensions.displayRows }).map((_, row) => renderRow(row))}
      </div>

      {/* Indicador de estado de la sección */}
      {sectionBlocked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <LockOutlined style={{ color: '#DC2626', fontSize: '16px' }} />
          <span style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#000000' // Negro fijo para "SECCIÓN BLOQUEADA" 
          }}>
            SECCIÓN BLOQUEADA
          </span>
        </div>
      )}
    </div>
  );
};

export default SeatRenderer;