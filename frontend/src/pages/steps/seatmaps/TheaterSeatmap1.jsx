import React from 'react';
import { Typography, Card } from 'antd';
import SeatRenderer from './SeatRenderer';
import { COLORS } from '../../../components/colorscheme';

const { Text } = Typography;

const theaterConfig = {
  name: 'Teatro',
  sections: [
    { id: 'orchestra', name: 'Platea', rows: 15, seatsPerRow: 20, price: 45000, color: '#4CAF50' },
    { id: 'mezzanine', name: 'Entresuelo', rows: 8, seatsPerRow: 18, price: 35000, color: '#2196F3' },
    { id: 'balcony', name: 'Balcón', rows: 6, seatsPerRow: 16, price: 25000, color: '#FF9800' }
  ]
};

const TheaterSeatMap = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => {
  const { sections } = theaterConfig;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>
      <div
        style={{
          width: 250,
          height: 30,
          backgroundColor: '#8B4513',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        ESCENARIO
      </div>

      {sections.map(section => (
        <div key={section.id} style={{ textAlign: 'center', marginBottom: 10 }}>
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

export default TheaterSeatMap;
