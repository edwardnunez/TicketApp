import React, { useState, useEffect } from 'react';
import SeatMapContainer from '../containers/SeatMapContainer';
import { COLORS, getSectionTextColor, getContrastTextColor, getSectionLabelColor } from '../../../../components/colorscheme';
import { Typography, notification, Card } from 'antd';
import '../styles/SeatMapAnimations.css';

const { Text } = Typography;

/**
 * Generic seat map renderer component for standard seat map display
 * @param {Object} props - Component props
 * @param {Object} props.seatMapData - Seat map data object
 * @param {Array} props.selectedSeats - Currently selected seats
 * @param {Function} props.onSeatSelect - Seat selection handler
 * @param {number} props.maxSeats - Maximum number of selectable seats
 * @param {Array} props.occupiedSeats - List of occupied seat IDs
 * @param {Array} props.blockedSeats - List of blocked seat IDs
 * @param {Array} props.blockedSections - List of blocked section IDs
 * @param {Function} props.formatPrice - Price formatting function
 * @param {Object} props.event - Event data object
 * @param {Function} props.calculateSeatPrice - Seat price calculation function
 * @returns {JSX.Element} Generic seat map renderer using enhanced container
 */
const GenericSeatRenderer = ({
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
  if (!seatMapData) return null;

  // Usar el nuevo contenedor mejorado
  return (
    <SeatMapContainer
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
};

/**
 * General admission renderer component for non-numbered seating sections
 * @param {Object} props - Component props
 * @param {Object} props.section - Section data object
 * @param {Array} props.selectedSeats - Currently selected seats
 * @param {Function} props.onSeatSelect - Seat selection handler
 * @param {number} props.maxSeats - Maximum number of selectable seats
 * @param {Array} props.occupiedSeats - List of occupied seat IDs
 * @param {Array} props.blockedSeats - List of blocked seat IDs
 * @param {Array} props.blockedSections - List of blocked section IDs
 * @param {Function} props.formatPrice - Price formatting function
 * @param {Object} props.event - Event data object
 * @param {Function} props.calculateSeatPrice - Seat price calculation function
 * @returns {JSX.Element} General admission renderer with quantity selection
 */
const GeneralAdmissionRenderer = ({ 
  section, 
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
  const [quantity, setQuantity] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const price = calculateSeatPrice ? calculateSeatPrice(section, null) : (section.defaultPrice || 0);
  const isBlocked = blockedSections && blockedSections.includes(section.id);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderSectionTitle = (section) => {
    const price = calculateSeatPrice ? calculateSeatPrice(section, null) : (section.defaultPrice || 0);
    const isBlocked = blockedSections && blockedSections.includes(section.id);
    
    return (
      <Text 
        style={{ 
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: 'bold',
          color: getSectionLabelColor(section.color, isBlocked),
          textDecoration: isBlocked ? 'line-through' : 'none'
        }}
      >
        {section.name} - {formatPrice(price)}
        {!section.hasNumberedSeats && ' (Entrada General)'}
      </Text>
    );
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 0) return;
    if (newQuantity > maxSeats) {
      notification.warning({
        message: 'Límite de Asientos',
        description: `Solo puedes seleccionar hasta ${maxSeats} asiento(s).`,
        duration: 3,
      });
      return;
    }

    setQuantity(newQuantity);
    
    // Simular selección de asientos para entrada general
    const generalSeats = Array.from({ length: newQuantity }, (_, i) => `${section.id}-general-${i + 1}`);
    onSeatSelect(generalSeats);
  };

  return (
    <Card
      title={renderSectionTitle(section)}
      style={{
        marginBottom: '16px',
        opacity: isBlocked ? 0.5 : 1,
        border: isBlocked ? `2px solid ${COLORS.neutral.grey3}` : `2px solid ${section.color || COLORS.primary.main}`,
        borderRadius: '12px',
        boxShadow: isBlocked ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
      className="section-card"
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Text style={{ 
            color: getContrastTextColor(section.color, 0.8, isBlocked),
            fontSize: '14px',
            display: 'block',
            marginBottom: '8px'
          }}>
            Entrada General - Sin asientos numerados
          </Text>
          <Text style={{ 
            color: getSectionTextColor(section.color, isBlocked),
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Precio: {formatPrice(price)}
          </Text>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 0 || isBlocked}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `2px solid ${COLORS.primary.main}`,
                backgroundColor: quantity > 0 && !isBlocked ? COLORS.primary.main : 'transparent',
                color: quantity > 0 && !isBlocked ? 'white' : COLORS.primary.main,
                cursor: quantity > 0 && !isBlocked ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              -
            </button>
            
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold',
              minWidth: '30px',
              textAlign: 'center',
              color: getSectionTextColor(section.color, isBlocked)
            }}>
              {quantity}
            </span>
            
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxSeats || isBlocked}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `2px solid ${COLORS.primary.main}`,
                backgroundColor: quantity < maxSeats && !isBlocked ? COLORS.primary.main : 'transparent',
                color: quantity < maxSeats && !isBlocked ? 'white' : COLORS.primary.main,
                cursor: quantity < maxSeats && !isBlocked ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              +
            </button>
          </div>
          
          {quantity > 0 && (
            <div style={{ 
              textAlign: 'right',
              minWidth: '120px'
            }}>
              <Text style={{ 
                fontSize: '14px',
                color: getContrastTextColor(section.color, 0.8, isBlocked)
              }}>
                Total:
              </Text>
              <Text style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                color: getSectionTextColor(section.color, isBlocked),
                display: 'block'
              }}>
                {formatPrice(price * quantity)}
              </Text>
            </div>
          )}
        </div>
      </div>
      
      {isBlocked && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: COLORS.neutral.grey1,
          borderRadius: '6px',
          border: `1px solid ${COLORS.neutral.grey3}`
        }}>
          <Text style={{ 
            color: getContrastTextColor(section.color, 0.6, isBlocked),
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            Esta sección está bloqueada y no está disponible para la venta.
          </Text>
        </div>
      )}
    </Card>
  );
};

export default GenericSeatRenderer;
export { GeneralAdmissionRenderer };
