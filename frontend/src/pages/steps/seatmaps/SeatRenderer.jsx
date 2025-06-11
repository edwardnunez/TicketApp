
import React, { useState } from 'react';
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
  formatPrice
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const getSeatId = (row, seat) => `${sectionId}-${row}-${seat}`;
  
  const isSeatOccupied = (seatId) => occupiedSeats?.includes(seatId) || false;
  const isSeatSelected = (seatId) => selectedSeats?.some(s => s.id === seatId) || false;
  const isSeatBlocked = (seatId) => {
    // Si toda la sección está bloqueada, todos los asientos están bloqueados
    if (sectionBlocked) return true;
    // Verificar si el asiento específico está bloqueado
    return blockedSeats?.includes(seatId) || false;
  };

  const handleSeatClick = (row, seat) => {
    const seatId = getSeatId(row, seat);
    
    // No permitir interacción si el asiento está ocupado, bloqueado, o la sección está bloqueada
    if (isSeatOccupied(seatId) || isSeatBlocked(seatId) || sectionBlocked) return;

    const seatData = {
      id: seatId,
      section: sectionName,
      sectionId,
      row: row + 1,
      seat: seat + 1,
      price
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
    return `${sectionName} - Fila ${row + 1}, Asiento ${seat + 1} - ${formatPrice ? formatPrice(price) : price}`;
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
    <div style={{ 
      position: 'relative',
      opacity: sectionBlocked ? 0.5 : 1
    }}>
      {Array.from({ length: rows }).map((_, row) => renderRow(row))}
    </div>
  );
};

export default SeatRenderer;