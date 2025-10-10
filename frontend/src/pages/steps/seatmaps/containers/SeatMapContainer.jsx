import React, { useRef } from 'react';
import { Typography } from 'antd';
import { COLORS } from '../../../../components/colorscheme';
import MainSeatMapContainer from './MainSeatMapContainer';

const { Text } = Typography;

/**
 * Enhanced seat map container with professional rendering capabilities
 * @param {Object} props - Component props
 * @param {Object} props.seatMapData - Seat map data object
 * @param {Array} [props.selectedSeats=[]] - Currently selected seats
 * @param {Function} props.onSeatSelect - Seat selection handler
 * @param {number} props.maxSeats - Maximum number of selectable seats
 * @param {Array} [props.occupiedSeats=[]] - List of occupied seat IDs
 * @param {Array} [props.blockedSeats=[]] - List of blocked seat IDs
 * @param {Array} [props.blockedSections=[]] - List of blocked section IDs
 * @param {Function} props.formatPrice - Price formatting function
 * @param {Object} props.event - Event data object
 * @param {Function} props.calculateSeatPrice - Seat price calculation function
 * @returns {JSX.Element} Enhanced seat map container with professional rendering
 */
const SeatMapContainer = ({
  seatMapData,
  selectedSeats = [],
  onSeatSelect,
  maxSeats,
  occupiedSeats = [],
  blockedSeats = [],
  blockedSections = [],
  formatPrice,
  event,
  calculateSeatPrice
}) => {
  const containerRef = useRef(null);


  if (!seatMapData) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: COLORS.neutral.grey4 
      }}>
        <Text>No hay datos del mapa de asientos disponibles</Text>
      </div>
    );
  }


  return (
    <div
      ref={containerRef}
      className="enhanced-seatmap-container"
      style={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        minHeight: '150vh',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px',
        overflow: 'visible',
        border: `2px solid ${COLORS.neutral.grey2}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header con controles - ELIMINADO */}

      {/* Contenedor principal del mapa */}
      <div
        className="seatmap-content"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '140vh',
          paddingTop: '20px',
          overflow: 'visible'
        }}
      >
        <ProfessionalSeatMapRenderer
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
          isPreviewMode={false}
        />
      </div>

      {/* Información de selección */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          color: COLORS.neutral.grey6,
          zIndex: 50
        }}
      >
        <div>Asientos seleccionados: {selectedSeats.length} de {maxSeats}</div>
        {selectedSeats.length > 0 && (
          <div style={{ color: COLORS.primary.main, fontWeight: 'bold' }}>
            Total: {formatPrice ? formatPrice(selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0)) : `$${selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0)}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatMapContainer;

