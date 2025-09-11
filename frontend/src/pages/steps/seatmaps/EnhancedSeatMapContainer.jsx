import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Space } from 'antd';
import { 
  FullscreenOutlined,
  CompressOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { COLORS } from '../../../components/colorscheme';
import ProfessionalSeatMapRenderer from './ProfessionalSeatMapRenderer';

const { Title, Text } = Typography;

const EnhancedSeatMapContainer = ({
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const containerRef = useRef(null);

  // Función para alternar pantalla completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Manejar cambios de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  const { name } = seatMapData;

  return (
    <div
      ref={containerRef}
      className="enhanced-seatmap-container"
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : 'auto',
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

export default EnhancedSeatMapContainer;

