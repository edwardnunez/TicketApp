import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
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
  blockedSeats = [], // Asientos bloqueados individualmente
  sectionBlocked = false, // Si toda la sección está bloqueada
  maxSeats,
  onSeatSelect,
  formatPrice,
  event, // Nuevo: objeto del evento
  calculateSeatPrice, // Nuevo: función para calcular precio por asiento
  sectionPricing // Nuevo: configuración de precios de la sección
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

  const getSeatColor = (seatId) => {
    if (isSeatOccupied(seatId)) return '#ccc';
    if (isSeatBlocked(seatId) || sectionBlocked) return '#ff4d4f'; // Rojo para bloqueados
    if (isSeatSelected(seatId)) return COLORS.primary.main;
    return color;
  };

  const getSeatTooltip = (row, seat, seatId) => {
    if (isSeatOccupied(seatId)) {
      return 'Asiento ocupado';
    }
    if (sectionBlocked) {
      return 'Sección bloqueada - No disponible';
    }
    if (isSeatBlocked(seatId)) {
      return 'Asiento bloqueado - No disponible';
    }
    
    const seatPrice = getSeatPrice(row, seat);
    const formattedPrice = formatPrice ? formatPrice(seatPrice) : `€${seatPrice}`;
    
    return `${sectionName} - Fila ${row + 1}, Asiento ${seat + 1} - ${formattedPrice}`;
  };

  const renderSeat = (row, seat) => {
    const seatId = getSeatId(row, seat);
    const occupied = isSeatOccupied(seatId);
    const blocked = isSeatBlocked(seatId);
    const selected = isSeatSelected(seatId);
    const hovered = hoveredSeat === seatId;
    const isInteractable = !occupied && !blocked && !sectionBlocked;

    return (
      <Tooltip
        key={seatId}
        title={getSeatTooltip(row, seat, seatId)}
      >
        <button
          style={{
            width: 24,
            height: 24,
            margin: 1,
            border: 'none',
            borderRadius: 4,
            backgroundColor: getSeatColor(seatId),
            cursor: isInteractable ? 'pointer' : 'not-allowed',
            opacity: occupied ? 0.3 : (blocked || sectionBlocked) ? 0.4 : hovered ? 0.8 : 1,
            transform: selected ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: 'white',
            position: 'relative',
          }}
          onClick={() => handleSeatClick(row, seat)}
          onMouseEnter={() => setHoveredSeat(seatId)}
          onMouseLeave={() => setHoveredSeat(null)}
          disabled={!isInteractable}
        >
          {selected && <CheckOutlined style={{ fontSize: 8 }} />}
          {occupied && <CloseOutlined style={{ fontSize: 8 }} />}
          {(blocked || sectionBlocked) && !occupied && <StopOutlined style={{ fontSize: 8 }} />}
        </button>
      </Tooltip>
    );
  };

  const renderRow = (row) => (
    <div key={`row-${row}`} style={{ display: 'flex', marginBottom: 2 }}>
      <div
        style={{
          width: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: sectionBlocked ? '#999' : (COLORS?.neutral?.grey4 || '#666'),
        }}
      >
        {row + 1}
      </div>
      {Array.from({ length: seatsPerRow }).map((_, seat) => renderSeat(row, seat))}
    </div>
  );

  return (
    <div style={{ position: 'relative', opacity: sectionBlocked ? 0.5 : 1, padding: isMobile ? '4px' : undefined, overflowX: isMobile ? 'auto' : undefined, WebkitOverflowScrolling: isMobile ? 'touch' : undefined }}>
      {Array.from({ length: rows }).map((_, row) => renderRow(row))}
    </div>
  );
};

export default SeatRenderer;