import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import {
  CheckOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  StarOutlined,
  StopOutlined
} from '@ant-design/icons';
import { COLORS, getSeatStateColors, getContrastBorderColor, getContrastInfoBackground, getSectionLabelColor, getSectionDimensionColor, getRowLabelColor } from '../../../../components/colorscheme';
import SectionShapeRenderer from './SectionShapeRenderer';

const ProSeatRenderer = ({
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
  isAdminMode = false,
  onSectionToggle = null
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [seatSize, setSeatSize] = useState({ width: 48, height: 48, fontSize: 16 });

  // Calcular tamaño de asiento basado en número de asientos
  // Mantenemos tamaños más consistentes entre dispositivos
  // El zoom se encarga de la adaptación visual
  useEffect(() => {
    const calculateSeatSize = () => {
      const totalSeats = rows * seatsPerRow;
      let baseSize = 56;
      let fontSize = 18;

      // Ajuste basado en densidad de asientos, no en tipo de dispositivo
      // Esto mantiene la misma apariencia visual en todos los dispositivos
      if (totalSeats > 300) {
        baseSize = 48;
        fontSize = 16;
      } else if (totalSeats > 200) {
        baseSize = 52;
        fontSize = 17;
      } else if (totalSeats > 100) {
        baseSize = 56;
        fontSize = 18;
      } else if (totalSeats > 50) {
        baseSize = 60;
        fontSize = 19;
      } else {
        baseSize = 64;
        fontSize = 20;
      }

      // Ajuste mínimo para touch en móviles (pero mantener proporciones similares)
      if (isMobile) {
        // Solo reducción ligera para móviles, el zoom hace el resto
        baseSize = Math.max(40, baseSize - 6);
        fontSize = Math.max(14, fontSize - 2);
      } else if (isTablet) {
        baseSize = Math.max(44, baseSize - 4);
        fontSize = Math.max(15, fontSize - 2);
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
      // Para secciones laterales: invertir filas y columnas para rotar 90 grados
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
      // Para secciones laterales: las coordenadas están invertidas
      // row representa la fila original, seat representa el asiento original
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
    let actualRow;
    
    if (dimensions.isInverted) {
      // Para secciones laterales: usar las coordenadas invertidas
      actualRow = seat;
    } else {
      // Para secciones normales: usar las coordenadas originales
      actualRow = row;
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

    // En modo administrador: permitir toggle de asientos (bloquear/desbloquear)
    if (isAdminMode) {
      // En modo admin, incluso los asientos bloqueados se pueden hacer clic
      // para desbloquearlos. Solo los ocupados no se pueden modificar.
      if (isSeatOccupied(seatId)) return;

      // Crear el objeto del asiento para pasar al handler
      const dimensions = getSectionDimensions();
      let actualRow, actualSeat;

      if (dimensions.isInverted) {
        actualRow = seat;
        actualSeat = row;
      } else {
        actualRow = row;
        actualSeat = seat;
      }

      const seatData = {
        id: seatId,
        section: sectionName,
        sectionId,
        row: getRowNumber(actualRow),
        seat: actualSeat + 1,
        price: 0 // Sin precio en modo admin
      };

      // El AdminSeatMapRenderer se encargará del toggle
      onSeatSelect(seatData);
      return;
    }

    // Modo usuario: comportamiento normal
    // Permitir deseleccionar asientos ya seleccionados
    if (isSeatSelected(seatId)) {
      onSeatSelect(selectedSeats.filter(s => s.id !== seatId));
      return;
    }

    // Bloquear asientos ocupados o bloqueados
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

    // Solo agregar si no se excede el máximo
    if (selectedSeats.length < maxSeats) {
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
    // Determinar categoría basada en el nombre de la sección, no en el precio

    // Aumentar área de touch en móviles para mejor interacción
    const touchPadding = isMobile ? 3 : 2;

    const baseStyle = {
      width: `${seatSize.width}px`,
      height: `${seatSize.height}px`,
      minWidth: `${seatSize.width}px`,
      minHeight: `${seatSize.height}px`,
      border: `3px solid ${stateColors.border}`,
      borderRadius: isMobile ? '10px' : '8px', // Bordes más redondeados
      backgroundColor: stateColors.background,
      color: stateColors.color,
      cursor: isAdminMode
        ? (state === 'occupied' ? 'not-allowed' : 'pointer')
        : ((state === 'available' || state === 'selected') ? 'pointer' : 'not-allowed'),
      opacity: stateColors.opacity || 1,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${seatSize.fontSize}px`,
      fontWeight: '600',
      position: 'relative',
      boxShadow: state === 'selected' ? stateColors.shadow : '0 2px 6px rgba(0,0,0,0.15)',
      transform: hovered && state === 'available' ? 'scale(1.05)' : 'scale(1)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      outline: 'none',
      margin: `${touchPadding}px`,
      // Mejoras para touch en móviles
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation'
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
    } else if (isAdminMode && state === 'blocked' && hovered) {
      // En modo admin, los asientos bloqueados tienen hover feedback
      baseStyle.transform = 'scale(1.05)';
      baseStyle.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.3)';
    }

    return baseStyle;
  };

  const getSeatIcon = (seatId, row, seat) => {
    const state = getSeatState(seatId);

    switch (state) {
      case 'selected':
        return <CheckOutlined style={{ fontSize: `${seatSize.fontSize}px`, fontWeight: 'bold' }} />;
      case 'occupied':
        return <UserOutlined style={{ fontSize: `${seatSize.fontSize * 0.8}px` }} />;
      case 'blocked':
        return <LockOutlined style={{ fontSize: `${seatSize.fontSize * 0.8}px` }} />;
      default:
        // Asiento disponible - mostrar número o icono especial
        if (false) { // isPremium not defined, using false for now
          return <StarOutlined style={{ fontSize: `${seatSize.fontSize * 0.8}px` }} />;
        }
        
        // Calcular el número correcto del asiento según el tipo de sección
        const dimensions = getSectionDimensions();
        let seatNumber;
        if (dimensions.isInverted) {
          // Para secciones laterales: el número del asiento es row + 1 (porque está invertido)
          seatNumber = row + 1;
        } else {
          // Para secciones normales: el número del asiento es seat + 1
          seatNumber = seat + 1;
        }
        
        return (
          <span style={{
            fontSize: `${seatSize.fontSize * 1.1}px`,
            fontWeight: '700',
            lineHeight: 1
          }}>
            {seatNumber}
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

    const rowNumber = getRowNumber(actualRow);
    const seatNumber = actualSeat + 1;

    const tooltips = {
      occupied: {
        title: sectionName,
        content: `Fila ${rowNumber}, Asiento ${seatNumber}`,
        subtitle: 'Ocupado',
        color: COLORS.neutral.grey500
      },
      blocked: {
        title: sectionName,
        content: sectionBlocked ? 'Sección bloqueada' : `Fila ${rowNumber}, Asiento ${seatNumber}`,
        subtitle: isAdminMode ? 'Click para desbloquear' : 'Bloqueado',
        color: COLORS.secondary.main
      },
      selected: {
        title: sectionName,
        content: `Fila ${rowNumber}, Asiento ${seatNumber}`,
        subtitle: isAdminMode ? 'Seleccionado' : `${formattedPrice} - Seleccionado`,
        color: COLORS.primary.main
      },
      available: {
        title: sectionName,
        content: `Fila ${rowNumber}, Asiento ${seatNumber}`,
        subtitle: isAdminMode ? 'Click para bloquear' : (isPremium ? `${formattedPrice} (Premium)` : formattedPrice),
        color: isPremium ? COLORS.accent.gold : (color || COLORS.primary.main)
      }
    };

    return tooltips[state];
  };

  const renderSeat = (row, seat) => {
    const seatId = getSeatId(row, seat);
    const state = getSeatState(seatId);
    const isInteractable = isAdminMode
      ? state !== 'occupied'
      : (state === 'available' || state === 'selected');
    const seatStyle = getSeatStyle(seatId);
    const tooltipInfo = getSeatTooltip(row, seat, seatId);

    return (
      <div
        key={seatId}
        style={{
          position: 'relative',
          display: 'inline-block'
        }}
      >
        <button
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
          data-tooltip-title={showTooltips ? tooltipInfo.title : undefined}
          data-tooltip-content={showTooltips ? tooltipInfo.content : undefined}
          data-tooltip-color={showTooltips ? tooltipInfo.color : undefined}
        >
          {getSeatIcon(seatId, row, seat)}

          {/* Indicador premium */}
          {false && state === 'available' && ( // isPremium not defined, using false for now
            <div
              className="premium-indicator"
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '10px',
                height: '10px',
                backgroundColor: COLORS.accent.gold,
                borderRadius: '50%',
                border: '2px solid white',
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
                bottom: '-3px',
                left: '-3px',
                width: '10px',
                height: '10px',
                backgroundColor: COLORS.accent.green,
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)'
              }}
            />
          )}
        </button>

        {/* Tooltip CSS personalizado - sin ARIA */}
        {showTooltips && hoveredSeat === seatId && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-12px)',
              backgroundColor: 'rgba(0, 0, 0, 0.87)',
              color: 'white',
              padding: '18px 26px',
              borderRadius: '12px',
              fontSize: '18px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              zIndex: 9999,
              pointerEvents: 'none',
              width: 'max-content',
              maxWidth: '380px',
              minWidth: '240px',
              textAlign: 'center',
              animation: 'tooltipFadeIn 0.2s ease-in-out',
              whiteSpace: 'normal',
              wordWrap: 'break-word'
            }}
          >
            {/* Título: Nombre de la sección */}
            <div style={{
              fontWeight: 'bold',
              marginBottom: '10px',
              fontSize: '20px',
              color: 'white',
              lineHeight: '1.3'
            }}>
              {tooltipInfo.title}
            </div>

            {/* Contenido: Fila y Asiento */}
            <div style={{
              fontSize: '17px',
              opacity: 0.95,
              lineHeight: '1.4',
              marginBottom: tooltipInfo.subtitle ? '8px' : '0'
            }}>
              {tooltipInfo.content}
            </div>

            {/* Subtítulo: Precio o estado */}
            {tooltipInfo.subtitle && (
              <div style={{
                fontSize: '16px',
                opacity: 0.85,
                lineHeight: '1.3',
                fontStyle: 'italic'
              }}>
                {tooltipInfo.subtitle}
              </div>
            )}

            {/* Flecha del tooltip */}
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid rgba(0, 0, 0, 0.87)'
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderRow = (row) => {
    const dimensions = getSectionDimensions();
    // Calcular el ancho exacto necesario para los asientos
    const seatTotalWidth = (seatSize.width + 4) * dimensions.displaySeatsPerRow;
    const labelWidth = isMobile ? 36 : 48;

    return (
      <div
        key={`row-${row}`}
        className="seat-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: isMobile ? '2px' : '4px',
          width: '100%',
          minHeight: `${seatSize.height + 8}px`,
          position: 'relative',
          overflow: 'visible'
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
            fontSize: `${isMobile ? 14 : 16}px`,
            fontWeight: '600',
            // Detección automática: texto negro para fondos claros, blanco para fondos oscuros
            color: getRowLabelColor(color, sectionBlocked),
            backgroundColor: getContrastInfoBackground(color, sectionBlocked),
            borderRadius: '4px',
            marginRight: '8px',
            border: `2px solid ${getContrastBorderColor(color, sectionBlocked)}`,
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
            gap: '2px',
            alignItems: 'center',
            justifyContent: 'start',
            width: 'fit-content',
            minWidth: `${seatTotalWidth}px`,
            position: 'relative',
            overflow: 'visible'
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
      sectionColor={color}
    >
      {/* Header de la sección - Ahora arriba y centrado */}
      <div
        className="section-header"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: `3px solid ${COLORS.neutral.grey100}`,
          width: '100%',
          position: 'relative'
        }}
      >
        {/* Nombre de la sección con indicador de color */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div
            className="section-color-indicator"
            style={{
              width: '18px',
              height: '18px',
              backgroundColor: sectionBlocked ? COLORS.neutral.grey300 : (color || COLORS.primary.main),
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: COLORS.shadows.sm
            }}
          />
          <span
            className="section-name"
            style={{
              fontSize: `${seatSize.fontSize * 1.6}px`,
              fontWeight: '700',
              color: getSectionLabelColor(color, sectionBlocked),
              textAlign: 'center'
            }}
          >
            {sectionName}
          </span>

          {/* Botón de bloqueo de sección - Solo en modo admin */}
          {isAdminMode && onSectionToggle && (
            <Button
              type={sectionBlocked ? "primary" : "default"}
              danger={sectionBlocked}
              size="small"
              icon={sectionBlocked ? <UnlockOutlined /> : <StopOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onSectionToggle(sectionId);
              }}
              style={{
                fontSize: `${seatSize.fontSize * 1.1}px`,
                height: 'auto',
                padding: '2px 8px',
                marginLeft: '8px'
              }}
            >
              {sectionBlocked ? 'Desbloquear' : 'Bloquear'} sección
            </Button>
          )}
        </div>

        {/* Info de dimensiones - Ahora debajo del nombre */}
        <div
          className="section-info"
          style={{
            fontSize: `${seatSize.fontSize * 1.3}px`,
            fontWeight: '600',
            color: getSectionDimensionColor(color, sectionBlocked),
            backgroundColor: getContrastInfoBackground(color, sectionBlocked),
            padding: '6px 16px',
            borderRadius: '14px',
            border: `2px solid ${getContrastBorderColor(color, sectionBlocked)}`,
            textAlign: 'center'
          }}
        >
          {dimensions.displayRows} filas × {dimensions.displaySeatsPerRow} asientos
        </div>
      </div>

      {/* Contenedor principal de asientos - Optimizado sin padding innecesario */}
      <div
        className="section-seats-container"
        style={{
          position: 'relative',
          padding: '0',
          width: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isMobile ? '3px' : '5px',
          backgroundColor: 'transparent',
          borderRadius: '0',
          overflow: 'visible',
          margin: '0 auto'
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
            color: '#000000' // Negro fijo para "SECCIÓN BLOQUEADA"
          }}>
            SECCIÓN BLOQUEADA
          </span>
        </div>
      )}
    </SectionShapeRenderer>
  );
};

export default ProSeatRenderer;