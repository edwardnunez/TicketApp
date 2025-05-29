import React, { useState } from 'react';
import { Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
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
  maxSeats,
  onSeatSelect,
  formatPrice
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const getSeatId = (row, seat) => `${sectionId}-${row}-${seat}`;
  const isSeatOccupied = (seatId) => occupiedSeats?.includes(seatId) || false;
  const isSeatSelected = (seatId) => selectedSeats?.some(s => s.id === seatId) || false;

  const handleSeatClick = (row, seat) => {
    const seatId = getSeatId(row, seat);
    if (isSeatOccupied(seatId)) return;

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
    if (isSeatSelected(seatId)) return COLORS.primary.main;
    return color;
  };

  const renderSeat = (row, seat) => {
    const seatId = getSeatId(row, seat);
    const occupied = isSeatOccupied(seatId);
    const selected = isSeatSelected(seatId);
    const hovered = hoveredSeat === seatId;

    return (
      <Tooltip
        key={seatId}
        title={
          occupied
            ? 'Asiento ocupado'
            : `${sectionName} - Fila ${row + 1}, Asiento ${seat + 1} - ${formatPrice ? formatPrice(price) : price}`
        }
      >
        <button
          style={{
            width: 24,
            height: 24,
            margin: 1,
            border: 'none',
            borderRadius: 4,
            backgroundColor: getSeatColor(seatId),
            cursor: occupied ? 'not-allowed' : 'pointer',
            opacity: occupied ? 0.3 : hovered ? 0.8 : 1,
            transform: selected ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: 'white',
          }}
          onClick={() => handleSeatClick(row, seat)}
          onMouseEnter={() => setHoveredSeat(seatId)}
          onMouseLeave={() => setHoveredSeat(null)}
          disabled={occupied}
        >
          {selected && <CheckOutlined style={{ fontSize: 8 }} />}
          {occupied && <CloseOutlined style={{ fontSize: 8 }} />}
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
          color: COLORS?.neutral?.grey4 || '#666',
        }}
      >
        {row + 1}
      </div>
      {Array.from({ length: seatsPerRow }).map((_, seat) => renderSeat(row, seat))}
    </div>
  );

  return <>{Array.from({ length: rows }).map((_, row) => renderRow(row))}</>;
};

export default SeatRenderer;