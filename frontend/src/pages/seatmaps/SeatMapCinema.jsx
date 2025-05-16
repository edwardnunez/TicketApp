import React, { useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

const SeatMap = () => {
  // Definimos filas y asientos por fila (por simplicidad 5 filas, 8 asientos)
  const rows = 5;
  const seatsPerRow = 8;

  // Estado de asientos seleccionados: guardamos IDs únicos como "fila-asiento"
  const [selectedSeats, setSelectedSeats] = useState(new Set());

  // Función para toggle selección de asiento
  const toggleSeat = (seatId) => {
    const newSelectedSeats = new Set(selectedSeats);
    if (newSelectedSeats.has(seatId)) {
      newSelectedSeats.delete(seatId);
    } else {
      newSelectedSeats.add(seatId);
    }
    setSelectedSeats(newSelectedSeats);
  };

  // Dimensiones de cada asiento (rectángulo)
  const seatSize = 30;
  const seatGap = 10;

  return (
    <Stage width={600} height={300}>
      <Layer>
        {Array.from({ length: rows }).map((_, rowIndex) => {
          return Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
            const seatId = `${rowIndex + 1}-${seatIndex + 1}`;
            const isSelected = selectedSeats.has(seatId);

            return (
              <React.Fragment key={seatId}>
                <Rect
                  x={seatIndex * (seatSize + seatGap) + 50}
                  y={rowIndex * (seatSize + seatGap) + 50}
                  width={seatSize}
                  height={seatSize}
                  fill={isSelected ? 'green' : 'lightgray'}
                  stroke="black"
                  strokeWidth={1}
                  cornerRadius={5}
                  onClick={() => toggleSeat(seatId)}
                  style={{ cursor: 'pointer' }}
                />
                <Text
                  x={seatIndex * (seatSize + seatGap) + 50}
                  y={rowIndex * (seatSize + seatGap) + 50 + seatSize / 4}
                  width={seatSize}
                  align="center"
                  text={seatIndex + 1}
                  fontSize={14}
                  fill="black"
                  pointerEvents="none"
                />
              </React.Fragment>
            );
          });
        })}
      </Layer>
    </Stage>
  );
};

export default SeatMap;