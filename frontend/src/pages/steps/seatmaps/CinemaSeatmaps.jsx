
import React from 'react';
import CinemaSeatMap from './generic/GenericCinemaSeatmap';

export const CinemaSeatMap1 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => (
  <CinemaSeatMap
    front={{ rows: 3, seatsPerRow: 16 }}
    middle={{ rows: 5, seatsPerRow: 16 }}
    back={{ rows: 4, seatsPerRow: 16 }}
    premium={null} // Sin sección premium
    selectedSeats={selectedSeats}
    onSeatSelect={onSeatSelect}
    maxSeats={maxSeats}
    occupiedSeats={occupiedSeats}
    formatPrice={formatPrice}
    cinemaName="Sala Estándar"
    screenWidth={300}
  />
);

// CinemaSeatMap2 - Sala grande con premium
export const CinemaSeatMap2 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => (
  <CinemaSeatMap
    front={{ rows: 4, seatsPerRow: 20 }}
    middle={{ rows: 6, seatsPerRow: 20 }}
    back={{ rows: 5, seatsPerRow: 20 }}
    premium={{ rows: 2, seatsPerRow: 12, price: 25000 }}
    selectedSeats={selectedSeats}
    onSeatSelect={onSeatSelect}
    maxSeats={maxSeats}
    occupiedSeats={occupiedSeats}
    formatPrice={formatPrice}
    cinemaName="Sala Premium"
    screenWidth={400}
  />
);

// CinemaSeatMap3 - Sala pequeña/íntima
export const CinemaSeatMap3 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => (
  <CinemaSeatMap
    front={{ rows: 2, seatsPerRow: 10 }}
    middle={{ rows: 3, seatsPerRow: 12 }}
    back={{ rows: 3, seatsPerRow: 10 }}
    premium={null}
    selectedSeats={selectedSeats}
    onSeatSelect={onSeatSelect}
    maxSeats={maxSeats}
    occupiedSeats={occupiedSeats}
    formatPrice={formatPrice}
    cinemaName="Sala Íntima"
    screenWidth={200}
  />
);

export default CinemaSeatMap1;