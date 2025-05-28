import React from 'react';
import { Typography, Card } from 'antd';
import SeatRenderer from './SeatRenderer';

const { Text } = Typography;

const cinemaConfig = {
  name: 'Sala de Cine',
  sections: [
    { id: 'front', name: 'Delanteras', rows: 3, seatsPerRow: 16, price: 8000, color: '#4CAF50' },
    { id: 'middle', name: 'Centrales', rows: 5, seatsPerRow: 16, price: 12000, color: '#2196F3' },
    { id: 'back', name: 'Traseras', rows: 4, seatsPerRow: 16, price: 10000, color: '#FF9800' }
  ]
};

const CinemaSeatMap1 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => {
  const { sections } = cinemaConfig;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 300,
          height: 20,
          backgroundColor: '#333',
          borderRadius: '10px 10px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 12,
          marginBottom: 20,
        }}
      >
        PANTALLA
      </div>

      {sections.map(section => (
        <div key={section.id} style={{ textAlign: 'center', marginBottom: 15 }}>
          <Text strong style={{ color: section.color }}>{section.name}</Text>
          <Card style={{ padding: 10, borderRadius: 8, margin: 5 }}>
            <SeatRenderer
              {...section}
              selectedSeats={selectedSeats}
              occupiedSeats={occupiedSeats}
              maxSeats={maxSeats}
              onSeatSelect={onSeatSelect}
              formatPrice={formatPrice}
            />
          </Card>
        </div>
      ))}
    </div>
  );
};

export default CinemaSeatMap1;
