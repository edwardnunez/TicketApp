import React, { useState, useEffect } from 'react';
import SeatRenderer from './SeatRenderer';
import SeatMapLegend from './SeatMapLegend';
import ProfessionalSeatMapRenderer from './ProfessionalSeatMapRenderer';
import { COLORS } from '../../../components/colorscheme';
import { Typography, notification, Card } from 'antd';
import './SeatMapAnimations.css';

const { Title, Text } = Typography;

const GenericSeatMapRenderer = ({
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
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (!event) return section.defaultPrice || 0;
    
    if (event.usesSectionPricing && event.sectionPricing) {
      const sectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
      if (sectionPricing) {
        return sectionPricing.price;
      }
    }
    
    return section.defaultPrice || 0;
  };

  const getSeatPrice = (row, seat) => {
    if (!event) return getSectionPrice(row);
    
    if (event.usesRowPricing && event.rowPricing) {
      const rowPricing = event.rowPricing.find(rp => rp.sectionId === row.sectionId && rp.rowNumber === row.rowNumber);
      if (rowPricing) {
        return rowPricing.price;
      }
    }
    
    return getSectionPrice(row);
  };

  const handleSeatClick = (row, seat) => {
    if (isSectionBlocked(row.sectionId)) {
      notification.warning({
        message: 'Sección Bloqueada',
        description: 'Esta sección no está disponible para la venta.',
        duration: 3,
      });
      return;
    }

    const seatId = `${row.sectionId}-${row.rowNumber}-${seat.seatNumber}`;
    const isOccupied = occupiedSeats && occupiedSeats.includes(seatId);
    const isBlocked = blockedSeats && blockedSeats.includes(seatId);
    
    if (isOccupied || isBlocked) {
      notification.warning({
        message: 'Asiento No Disponible',
        description: 'Este asiento ya está ocupado o bloqueado.',
        duration: 3,
      });
      return;
    }

    const isSelected = selectedSeats.includes(seatId);
    
    if (isSelected) {
      onSeatSelect(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= maxSeats) {
        notification.warning({
          message: 'Límite de Asientos',
          description: `Solo puedes seleccionar hasta ${maxSeats} asiento(s).`,
          duration: 3,
        });
        return;
      }
      onSeatSelect([...selectedSeats, seatId]);
    }
  };

  const renderSectionTitle = (section) => {
    const price = getSectionPrice(section);
    const isBlocked = isSectionBlocked(section.id);
    
    return (
      <Text 
        style={{ 
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: 'bold',
          color: isBlocked ? COLORS.neutral.grey4 : COLORS.neutral.dark,
          textDecoration: isBlocked ? 'line-through' : 'none'
        }}
      >
        {section.name} - {formatPrice(price)}
        {!section.hasNumberedSeats && ' (Entrada General)'}
      </Text>
    );
  };

  // Usar el nuevo renderizador profesional
  return (
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
  );
};

// Componente para entrada general (mantenido para compatibilidad)
const GeneralAdmissionRenderer = ({ 
  section, 
  selectedSeats, 
  onSeatSelect, 
  maxSeats, 
  occupiedSeats, 
  blockedSeats, 
  formatPrice, 
  event,
  calculateSeatPrice 
}) => {
  const [quantity, setQuantity] = useState(0);
  const price = calculateSeatPrice ? calculateSeatPrice(section, null) : (section.defaultPrice || 0);
  const isBlocked = blockedSections && blockedSections.includes(section.id);

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
            color: COLORS.neutral.grey6,
            fontSize: '14px',
            display: 'block',
            marginBottom: '8px'
          }}>
            Entrada General - Sin asientos numerados
          </Text>
          <Text style={{ 
            color: COLORS.neutral.dark,
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
              color: isBlocked ? COLORS.neutral.grey4 : COLORS.neutral.dark
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
                color: COLORS.neutral.grey6
              }}>
                Total:
              </Text>
              <Text style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                color: COLORS.primary.main,
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
            color: COLORS.neutral.grey5,
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

export default GenericSeatMapRenderer;
export { GeneralAdmissionRenderer };




