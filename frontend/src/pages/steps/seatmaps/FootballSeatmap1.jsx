import React from 'react';
import { Typography, Card } from 'antd';
import SeatRenderer from './SeatRenderer';

const { Text } = Typography;

const footballConfig = {
  name: 'Estadio de fútbol',
  sections: [
    { id: 'tribuna-norte', name: 'Tribuna Norte', rows: 8, seatsPerRow: 17, price: 50000, color: '#4CAF50' },
    { id: 'tribuna-este', name: 'Tribuna Este', rows: 6, seatsPerRow: 15, price: 75000, color: '#2196F3' },
    { id: 'tribuna-oeste', name: 'Tribuna Oeste', rows: 6, seatsPerRow: 15, price: 75000, color: '#2196F3' },
    { id: 'tribuna-sur', name: 'Tribuna Sur', rows: 8, seatsPerRow: 17, price: 50000, color: '#4CAF50' },
    { id: 'vip', name: 'Palcos VIP', rows: 2, seatsPerRow: 12, price: 150000, color: '#FF9800' }
  ]
};

const FootballSeatMap1 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => {
  const { sections } = footballConfig;

  const filterOccupiedBySection = (sectionId) => {
    if (!occupiedSeats || !occupiedSeats.length) return [];
    return occupiedSeats.filter(seatId => seatId.startsWith(sectionId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, minWidth: 800, minHeight: 600 }}>
      {/* Tribuna Norte */}
      <div style={{ textAlign: 'center' }}>
        <Text strong>{sections[0].name}</Text>
        <Card style={{ padding: 10, margin: 5 }}>
          <SeatRenderer
            {...sections[0]}
            selectedSeats={selectedSeats}
            occupiedSeats={filterOccupiedBySection(sections[0].id)}
            maxSeats={maxSeats}
            onSeatSelect={onSeatSelect}
            formatPrice={formatPrice}
            sectionId={sections[0].id}
          />
        </Card>
      </div>

      {/* Fila central horizontal: Tribuna Oeste | Campo | Tribuna Este */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 40 }}>
        {/* Tribuna Oeste - Rotada 90 grados */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120, justifyContent: 'center' }}>
          <Text
            strong
            style={{
              marginBottom: 15,
              transform: 'rotate(-90deg)',
              transformOrigin: 'left bottom',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            {sections[2].name}
          </Text>
          <Card style={{ padding: 8, borderRadius: 8, transform: 'rotate(-90deg)' }}>
            <SeatRenderer
              {...sections[2]}
              selectedSeats={selectedSeats}
              occupiedSeats={filterOccupiedBySection(sections[2].id)}
              maxSeats={maxSeats}
              onSeatSelect={onSeatSelect}
              formatPrice={formatPrice}
              sectionId={sections[2].id}
            />
          </Card>
        </div>

        {/* Campo */}
        <div
          style={{
            width: 400,
            height: 260,
            backgroundColor: '#4CAF50',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 24,
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            border: '3px solid #2E7D32',
            position: 'relative',
            flexShrink: 0
          }}
        >
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 80, height: 80, border: '2px solid white', borderRadius: '50%' }}></div>
          CAMPO
        </div>

        {/* Tribuna Este - Rotada 90 grados */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120, justifyContent: 'center' }}>
          <Text
            strong
            style={{
              marginBottom: 15,
              transform: 'rotate(90deg)',
              transformOrigin: 'right bottom',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            {sections[1].name}
          </Text>
          <Card style={{ padding: 8, borderRadius: 8, transform: 'rotate(90deg)' }}>
            <SeatRenderer
              {...sections[1]}
              selectedSeats={selectedSeats}
              occupiedSeats={filterOccupiedBySection(sections[1].id)}
              maxSeats={maxSeats}
              onSeatSelect={onSeatSelect}
              formatPrice={formatPrice}
              sectionId={sections[1].id}
            />
          </Card>
        </div>
      </div>

      {/* Tribuna Sur */}
      <div style={{ textAlign: 'center' }}>
        <Card style={{ padding: 10, margin: 5 }}>
          <SeatRenderer
            {...sections[3]}
            selectedSeats={selectedSeats}
            occupiedSeats={filterOccupiedBySection(sections[3].id)}
            maxSeats={maxSeats}
            onSeatSelect={onSeatSelect}
            formatPrice={formatPrice}
            sectionId={sections[3].id}
          />
        </Card>
        <Text strong>{sections[3].name}</Text>
      </div>

      {/* VIP */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Text strong>{sections[4].name}</Text>
        <Card style={{ border: '2px solid #FF9800', padding: 10, borderRadius: 8, margin: 5, backgroundColor: '#FFF3E0' }}>
          <SeatRenderer
            {...sections[4]}
            selectedSeats={selectedSeats}
            occupiedSeats={filterOccupiedBySection(sections[4].id)}
            maxSeats={maxSeats}
            onSeatSelect={onSeatSelect}
            formatPrice={formatPrice}
            sectionId={sections[4].id}
          />
        </Card>
      </div>
    </div>
  );
};

export default FootballSeatMap1;