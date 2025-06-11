import React, { useState } from 'react';
import { Tooltip } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { COLORS } from '../../components/colorscheme';

const EditableSeatGrid = ({
  sectionId,
  rows,
  seatsPerRow,
  color,
  name: sectionName,
  blockedSeats,
  sectionBlocked,
  onSeatToggle
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const getSeatId = (row, seat) => `${sectionId}-${row}-${seat}`;
  const isSeatBlocked = (seatId) => blockedSeats?.includes(seatId) || false;

  const handleSeatClick = (row, seat) => {
    // Si la sección está bloqueada, no permitir cambios individuales
    if (sectionBlocked) return;
    
    const seatId = getSeatId(row, seat);
    onSeatToggle(seatId);
  };

  const getSeatColor = (seatId) => {
    if (sectionBlocked) return '#ff4d4f'; // Rojo para sección bloqueada
    if (isSeatBlocked(seatId)) return '#ff7875'; // Rojo claro para asiento bloqueado individualmente
    return color; // Color original de la sección
  };

  const getSeatOpacity = (seatId) => {
    if (sectionBlocked) return 0.6;
    if (isSeatBlocked(seatId)) return 0.8;
    if (hoveredSeat === seatId) return 0.7;
    return 1;
  };

  const getSeatIcon = (seatId) => {
    if (sectionBlocked || isSeatBlocked(seatId)) {
      return <LockOutlined style={{ fontSize: 8, color: 'white' }} />;
    }
    return null;
  };

  const getTooltipText = (row, seat) => {
    const seatId = getSeatId(row, seat);
    if (sectionBlocked) {
      return `${sectionName} - Fila ${row + 1}, Asiento ${seat + 1} - Sección bloqueada`;
    }
    if (isSeatBlocked(seatId)) {
      return `${sectionName} - Fila ${row + 1}, Asiento ${seat + 1} - Asiento bloqueado (click para desbloquear)`;
    }
    return `${sectionName} - Fila ${row + 1}, Asiento ${seat + 1} - Click para bloquear`;
  };

  const renderSeat = (row, seat) => {
    const seatId = getSeatId(row, seat);
    const blocked = isSeatBlocked(seatId);
    const hovered = hoveredSeat === seatId;

    return (
      <Tooltip
        key={seatId}
        title={getTooltipText(row, seat)}
      >
        <button
          style={{
            width: 24,
            height: 24,
            margin: 1,
            border: sectionBlocked || blocked ? '2px solid #ff4d4f' : '1px solid #d9d9d9',
            borderRadius: 4,
            backgroundColor: getSeatColor(seatId),
            cursor: sectionBlocked ? 'not-allowed' : 'pointer',
            opacity: getSeatOpacity(seatId),
            transform: (blocked || sectionBlocked) ? 'scale(1.05)' : hovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: 'white',
            position: 'relative',
            boxShadow: (blocked || sectionBlocked) ? '0 2px 4px rgba(255, 77, 79, 0.3)' : 'none'
          }}
          onClick={() => handleSeatClick(row, seat)}
          onMouseEnter={() => !sectionBlocked && setHoveredSeat(seatId)}
          onMouseLeave={() => setHoveredSeat(null)}
          disabled={sectionBlocked}
        >
          {getSeatIcon(seatId)}
          {/* Indicador visual adicional para asientos bloqueados */}
          {(blocked || sectionBlocked) && (
            <div
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ff4d4f',
                borderRadius: '50%',
                border: '1px solid white'
              }}
            />
          )}
        </button>
      </Tooltip>
    );
  };

  const renderRow = (row) => (
    <div key={`row-${row}`} style={{ display: 'flex', marginBottom: 2, alignItems: 'center' }}>
      <div
        style={{
          width: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: sectionBlocked ? '#ff4d4f' : COLORS?.neutral?.grey4 || '#666',
          fontWeight: sectionBlocked ? 'bold' : 'normal'
        }}
      >
        {row + 1}
      </div>
      <div style={{ display: 'flex' }}>
        {Array.from({ length: seatsPerRow }).map((_, seat) => renderSeat(row, seat))}
      </div>
    </div>
  );

  return (
    <div style={{ 
      padding: '8px',
      backgroundColor: sectionBlocked ? '#fff2f0' : 'transparent',
      borderRadius: '4px',
      border: sectionBlocked ? '1px dashed #ff4d4f' : 'none'
    }}>
      {/* Leyenda específica para la sección si está bloqueada */}
      {sectionBlocked && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '8px',
          padding: '4px',
          backgroundColor: '#ff4d4f20',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#ff4d4f'
        }}>
          <LockOutlined style={{ marginRight: '4px' }} />
          Sección completa bloqueada
        </div>
      )}
      
      {/* Grid de asientos */}
      <div>
        {Array.from({ length: rows }).map((_, row) => renderRow(row))}
      </div>
      
      {/* Estadísticas de la sección */}
      <div style={{ 
        marginTop: '8px', 
        textAlign: 'center', 
        fontSize: '11px', 
        color: COLORS?.neutral?.grey4 || '#999'
      }}>
        {sectionBlocked ? (
          <span style={{ color: '#ff4d4f' }}>
            Todos los asientos bloqueados ({rows * seatsPerRow})
          </span>
        ) : (
          <span>
            Bloqueados: {blockedSeats?.length || 0} / {rows * seatsPerRow}
          </span>
        )}
      </div>
    </div>
  );
};

export default EditableSeatGrid;