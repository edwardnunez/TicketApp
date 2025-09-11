import React, { memo, useMemo, useCallback } from 'react';
import { COLORS, getSectionTextColor, getContrastTextColor, getContrastInfoBackground, getSectionLabelColor, getSectionDimensionColor, getRowLabelColor } from '../../../components/colorscheme';

/**
 * Componente memoizado para renderizar filas de asientos
 * Optimiza el rendimiento evitando re-renders innecesarios
 */
const MemoizedSeatRow = memo(({
  row,
  seatsPerRow,
  sectionId,
  sectionName,
  sectionBlocked,
  selectedSeats,
  occupiedSeats,
  blockedSeats,
  onSeatClick,
  getSeatState,
  getSeatPrice,
  getSeatStyle,
  getSeatIcon,
  getSeatTooltip,
  seatSize,
  isMobile,
  showTooltips,
  TooltipComponent
}) => {
  const renderSeat = useCallback((seat) => {
    // Función para obtener el número de fila correcto según la posición de la sección
    const getRowNumber = (rowIndex) => {
      // Determinar la posición de la sección basada en el nombre
      const sectionNameLower = sectionName.toLowerCase();
      
      if (sectionNameLower.includes('norte') || sectionNameLower.includes('north')) {
        // Norte: numeración de abajo hacia arriba (1, 2, 3, 4, 5...)
        return rowIndex + 1;
      } else if (sectionNameLower.includes('sur') || sectionNameLower.includes('south')) {
        // Sur: numeración de arriba hacia abajo (5, 4, 3, 2, 1...)
        return section.rows - rowIndex;
      } else {
        // Este, Oeste, VIP, Gradas: numeración normal (1, 2, 3, 4, 5...)
        return rowIndex + 1;
      }
    };

    const seatId = `${sectionId}-${getRowNumber(row)}-${seat + 1}`;
    const state = getSeatState(seatId, sectionId);
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
        onClick={() => onSeatClick(row, seat, sectionId, sectionName)}
        disabled={!isInteractable}
        className="professional-seat"
        aria-label={`Asiento ${seat + 1} de la fila ${getRowNumber(row)}, ${tooltipInfo.title}`}
        role="button"
        tabIndex={isInteractable ? 0 : -1}
      >
        {getSeatIcon(seatId)}
        
        {/* Indicador premium */}
        {isPremium && state === 'available' && (
          <div 
            className="premium-indicator"
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '8px',
              height: '8px',
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
              bottom: '-3px',
              left: '-3px',
              width: '8px',
              height: '8px',
              backgroundColor: COLORS.accent.green,
              borderRadius: '50%',
              border: '1px solid white',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
            }} 
          />
        )}
      </button>
    );

    if (showTooltips && TooltipComponent) {
      return (
        <TooltipComponent
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
        </TooltipComponent>
      );
    }

    return seatElement;
  }, [
    row, sectionId, sectionName, sectionBlocked, selectedSeats, occupiedSeats, blockedSeats,
    onSeatClick, getSeatState, getSeatPrice, getSeatStyle, getSeatIcon, getSeatTooltip,
    seatSize, isMobile, showTooltips, TooltipComponent
  ]);

  const rowLabelWidth = isMobile ? 20 : 30;

  return (
    <div 
      className="seat-row"
      style={{ 
        display: 'flex', 
        alignItems: 'center',
        marginBottom: isMobile ? '2px' : '4px',
        padding: '2px 0',
        position: 'relative'
      }}
    >
      {/* Etiqueta de fila */}
      <div
        className="row-label"
        style={{
          width: rowLabelWidth,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '10px' : '12px',
          fontWeight: '600',
          color: getRowLabelColor(section.color, sectionBlocked),
          backgroundColor: getContrastInfoBackground(section.color, sectionBlocked),
          borderRadius: '4px',
          padding: '2px 4px',
          marginRight: '8px',
          border: sectionBlocked ? `1px solid ${COLORS.neutral.grey200}` : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        {getRowNumber(row)}
      </div>
      
      {/* Contenedor de asientos */}
      <div 
        className="seats-container"
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '1px',
          position: 'relative',
          overflowX: 'auto',
          maxWidth: '100%'
        }}
      >
        {Array.from({ length: Math.min(seatsPerRow, 25) }).map((_, seat) => renderSeat(seat))}
        {seatsPerRow > 25 && (
          <div style={{
            padding: '0 8px',
            fontSize: '10px',
            color: getContrastTextColor(section.color, 0.6, sectionBlocked),
            fontStyle: 'italic'
          }}>
            +{seatsPerRow - 25} más
          </div>
        )}
      </div>
      
      {/* Línea de separación entre filas */}
      {row < (seatsPerRow > 0 ? Math.ceil(seatsPerRow / 25) : 0) - 1 && (
        <div 
          className="row-separator"
          style={{
            position: 'absolute',
            bottom: '-2px',
            left: rowLabelWidth + 8,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.neutral.grey200} 20%, ${COLORS.neutral.grey200} 80%, transparent 100%)`,
            opacity: 0.5
          }} 
        />
      )}
    </div>
  );
});

MemoizedSeatRow.displayName = 'MemoizedSeatRow';

/**
 * Componente memoizado para renderizar secciones completas
 */
const MemoizedSeatSection = memo(({
  section,
  sectionBlocked,
  selectedSeats,
  occupiedSeats,
  blockedSeats,
  onSeatClick,
  getSeatState,
  getSeatPrice,
  getSeatStyle,
  getSeatIcon,
  getSeatTooltip,
  seatSize,
  isMobile,
  showTooltips,
  TooltipComponent,
  color
}) => {
  const renderRow = useCallback((row) => (
    <MemoizedSeatRow
      key={`row-${row}`}
      row={row}
      seatsPerRow={section.seatsPerRow}
      sectionId={section.id}
      sectionName={section.name}
      sectionBlocked={sectionBlocked}
      selectedSeats={selectedSeats}
      occupiedSeats={occupiedSeats}
      blockedSeats={blockedSeats}
      onSeatClick={onSeatClick}
      getSeatState={getSeatState}
      getSeatPrice={getSeatPrice}
      getSeatStyle={getSeatStyle}
      getSeatIcon={getSeatIcon}
      getSeatTooltip={getSeatTooltip}
      seatSize={seatSize}
      isMobile={isMobile}
      showTooltips={showTooltips}
      TooltipComponent={TooltipComponent}
    />
  ), [
    section.seatsPerRow, section.id, section.name, sectionBlocked,
    selectedSeats, occupiedSeats, blockedSeats, onSeatClick,
    getSeatState, getSeatPrice, getSeatStyle, getSeatIcon, getSeatTooltip,
    seatSize, isMobile, showTooltips, TooltipComponent
  ]);

  const getMaxWidth = useCallback(() => {
    const maxSeatsPerRow = Math.min(section.seatsPerRow, 25);
    const seatTotalWidth = (seatSize.width + 2) * maxSeatsPerRow;
    const labelWidth = isMobile ? 20 : 30;
    return seatTotalWidth + labelWidth + 32;
  }, [section.seatsPerRow, seatSize.width, isMobile]);

  return (
    <div 
      className="professional-seat-section"
      style={{ 
        position: 'relative', 
        opacity: sectionBlocked ? 0.6 : 1, 
        padding: isMobile ? '8px' : '12px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        width: 'auto',
        maxWidth: getMaxWidth(),
        minWidth: 'fit-content',
        backgroundColor: sectionBlocked ? COLORS.neutral.grey50 : 'white',
        borderRadius: '12px',
        border: sectionBlocked ? `2px dashed ${COLORS.neutral.grey300}` : `1px solid ${COLORS.neutral.grey200}`,
        boxShadow: sectionBlocked 
          ? COLORS.shadows.inner 
          : COLORS.shadows.base,
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header de la sección */}
      <div 
        className="section-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: `1px solid ${COLORS.neutral.grey100}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            className="section-color-indicator"
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: sectionBlocked ? COLORS.neutral.grey300 : (color || COLORS.primary.main),
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: COLORS.shadows.sm
            }} 
          />
          <span 
            className="section-name"
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: getSectionLabelColor(section.color, sectionBlocked)
            }}
          >
            {section.name}
          </span>
        </div>
        
        <div 
          className="section-info"
          style={{
            fontSize: '12px',
            color: sectionBlocked ? COLORS.neutral.grey400 : COLORS.neutral.grey500,
            backgroundColor: sectionBlocked ? COLORS.neutral.grey100 : COLORS.neutral.grey50,
            padding: '2px 8px',
            borderRadius: '12px',
            border: `1px solid ${COLORS.neutral.grey200}`
          }}
        >
          {section.rows} filas × {section.seatsPerRow} asientos
        </div>
      </div>

      {/* Contenedor de asientos */}
      <div 
        className="seats-grid"
        style={{
          position: 'relative',
          padding: '8px 0'
        }}
      >
        {Array.from({ length: section.rows }).map((_, row) => renderRow(row))}
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
            padding: '8px 16px',
            borderRadius: '8px',
            border: `1px solid ${COLORS.neutral.grey200}`,
            boxShadow: COLORS.shadows.lg,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: COLORS.secondary.main 
          }}>
            SECCIÓN BLOQUEADA
          </span>
        </div>
      )}
    </div>
  );
});

MemoizedSeatSection.displayName = 'MemoizedSeatSection';

/**
 * Componente principal de optimización de rendimiento
 */
const PerformanceOptimizer = ({
  sections,
  selectedSeats,
  occupiedSeats,
  blockedSeats,
  blockedSections,
  onSeatClick,
  getSeatState,
  getSeatPrice,
  getSeatStyle,
  getSeatIcon,
  getSeatTooltip,
  seatSize,
  isMobile,
  showTooltips,
  TooltipComponent,
  color
}) => {
  // Memoizar secciones para evitar re-renders innecesarios
  const memoizedSections = useMemo(() => {
    return sections.map(section => ({
      ...section,
      isBlocked: blockedSections?.includes(section.id) || false,
      occupiedSeats: occupiedSeats?.filter(seatId => seatId.startsWith(section.id)) || [],
      blockedSeats: blockedSeats?.filter(seatId => seatId.startsWith(section.id)) || []
    }));
  }, [sections, blockedSections, occupiedSeats, blockedSeats]);

  return (
    <div className="performance-optimized-seats">
      {memoizedSections.map(section => (
        <MemoizedSeatSection
          key={section.id}
          section={section}
          sectionBlocked={section.isBlocked}
          selectedSeats={selectedSeats}
          occupiedSeats={section.occupiedSeats}
          blockedSeats={section.blockedSeats}
          onSeatClick={onSeatClick}
          getSeatState={getSeatState}
          getSeatPrice={getSeatPrice}
          getSeatStyle={getSeatStyle}
          getSeatIcon={getSeatIcon}
          getSeatTooltip={getSeatTooltip}
          seatSize={seatSize}
          isMobile={isMobile}
          showTooltips={showTooltips}
          TooltipComponent={TooltipComponent}
          color={color}
        />
      ))}
    </div>
  );
};

export default PerformanceOptimizer;

