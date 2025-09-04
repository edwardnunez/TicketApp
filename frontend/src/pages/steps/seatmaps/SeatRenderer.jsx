import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { 
  CheckOutlined, 
  UserOutlined,
  LockOutlined
} from '@ant-design/icons';
import { COLORS } from '../../../components/colorscheme';

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

  const getSeatId = (row, seat) => `${sectionId}-${row + 1}-${seat + 1}`;
  
  const isSeatOccupied = (seatId) => occupiedSeats?.includes(seatId) || false;
  const isSeatSelected = (seatId) => selectedSeats?.some(s => s.id === seatId) || false;
  const isSeatBlocked = (seatId) => {
    // Si toda la sección está bloqueada, todos los asientos están bloqueados
    if (sectionBlocked) return true;
    // Verificar si el asiento específico está bloqueado
    return blockedSeats?.includes(seatId) || false;
  };

  const getSeatPrice = (row, seat) => {
    // Si el evento usa pricing por secciones, calcular dinámicamente
    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const sectionPricing = event.sectionPricing.find(sp => sp.sectionId === sectionId);
      
      if (sectionPricing) {
        // Si usa pricing por filas, buscar precio específico para la fila
        if (event.usesRowPricing && sectionPricing.rowPricing && sectionPricing.rowPricing.length > 0) {
          const rowNumber = row + 1;
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
      return calculateSeatPrice(sectionId, row, { sections: [{ id: sectionId, price }] }, event);
    }
    
    // Fallback al precio de la sección del seatMap
    const fallbackPrice = price || 0;
    return fallbackPrice;
  };

  const handleSeatClick = (row, seat) => {
    const seatId = getSeatId(row, seat);
    
    // No permitir interacción si el asiento está ocupado, bloqueado, o la sección está bloqueada
    if (isSeatOccupied(seatId) || isSeatBlocked(seatId) || sectionBlocked) return;

    const seatPrice = getSeatPrice(row, seat);
    const seatData = {
      id: seatId,
      section: sectionName,
      sectionId,
      row: row + 1,
      seat: seat + 1,
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
        content: `${sectionName} - Fila ${row + 1}, Asiento ${seat + 1}`,
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
        content: `${sectionName} - Fila ${row + 1}, Asiento ${seat + 1}`,
        color: '#DC2626'
      };
    }
    
    return {
      title: `${sectionName} - Fila ${row + 1}, Asiento ${seat + 1}`,
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
    const seatPrice = getSeatPrice(row, seat);

    // Determinar el icono a mostrar
    const getSeatIcon = () => {
      if (selected) {
        return <CheckOutlined style={{ fontSize: seatSize.fontSize, fontWeight: 'bold' }} />;
      }
      if (occupied) {
        return <UserOutlined style={{ fontSize: seatSize.fontSize * 0.8 }} />;
      }
      if (blocked || sectionBlocked) {
        return <LockOutlined style={{ fontSize: seatSize.fontSize * 0.8 }} />;
      }
      // Asiento disponible - mostrar número del asiento
      return (
        <span style={{ 
          fontSize: seatSize.fontSize * 0.7, 
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
            width: seatSize.width,
            height: seatSize.height,
            margin: seatSize.margin,
            border: `2px solid ${seatStyle.borderColor}`,
            borderRadius: seatSize.borderRadius,
            backgroundColor: seatStyle.backgroundColor,
            cursor: seatStyle.cursor,
            opacity: seatStyle.opacity,
            transform: seatStyle.transform,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: seatSize.fontSize,
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
          {!occupied && !blocked && !sectionBlocked && seatPrice > (price * 1.5) && (
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
          color: sectionBlocked ? '#9CA3AF' : (COLORS?.neutral?.grey4 || '#6B7280'),
          backgroundColor: sectionBlocked ? '#F3F4F6' : 'transparent',
          borderRadius: '4px',
          padding: '2px 4px',
          marginRight: '8px',
          border: sectionBlocked ? '1px solid #E5E7EB' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        {row + 1}
      </div>
      
      {/* Contenedor de asientos con separación visual */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '1px',
        position: 'relative'
      }}>
        {Array.from({ length: seatsPerRow }).map((_, seat) => renderSeat(row, seat))}
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

  const containerWidth = getContainerWidth();

  return (
    <div 
      style={{ 
        position: 'relative', 
        opacity: sectionBlocked ? 0.6 : 1, 
        padding: responsiveMode && isMobile ? '8px' : '12px',
        overflowX: responsiveMode ? 'auto' : undefined,
        WebkitOverflowScrolling: responsiveMode ? 'touch' : undefined,
        width: responsiveMode ? containerWidth : 'auto',
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
        {Array.from({ length: rows }).map((_, row) => renderRow(row))}
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
            color: '#DC2626' 
          }}>
            SECCIÓN BLOQUEADA
          </span>
        </div>
      )}
    </div>
  );
};

export default SeatRenderer;