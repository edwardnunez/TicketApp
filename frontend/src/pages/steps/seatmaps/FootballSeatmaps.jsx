import React from 'react';
import FootballSeatMap from './generic/GenericFootballSeatmap';

// FootballSeatMap1 - Tu configuración original
export const FootballSeatMap1 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => (
  <FootballSeatMap
    tribunaNorte={{ rows: 8, seatsPerRow: 17 }}
    tribunaEste={{ rows: 6, seatsPerRow: 15 }}
    tribunaOeste={{ rows: 6, seatsPerRow: 15 }}
    tribunaSur={{ rows: 8, seatsPerRow: 17 }}
    vip={{ rows: 2, seatsPerRow: 12 }}
    selectedSeats={selectedSeats}
    onSeatSelect={onSeatSelect}
    maxSeats={maxSeats}
    occupiedSeats={occupiedSeats}
    formatPrice={formatPrice}
    stadiumName="Estadio Municipal"
  />
);

// FootballSeatMap2 - Estadio más grande
export const FootballSeatMap2 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => (
  <FootballSeatMap
    tribunaNorte={{ rows: 10, seatsPerRow: 20 }}
    tribunaEste={{ rows: 8, seatsPerRow: 17 }}
    tribunaOeste={{ rows: 10, seatsPerRow: 17 }}
    tribunaSur={{ rows: 8, seatsPerRow: 20 }}
    vip={{ rows: 3, seatsPerRow: 16 }}
    selectedSeats={selectedSeats}
    onSeatSelect={onSeatSelect}
    maxSeats={maxSeats}
    occupiedSeats={occupiedSeats}
    formatPrice={formatPrice}
    stadiumName="Estadio Metropolitano"
  />
);

// FootballSeatMap3 - Estadio pequeño
export const FootballSeatMap3 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => (
  <FootballSeatMap
    tribunaNorte={{ rows: 5, seatsPerRow: 12 }}
    tribunaEste={{ rows: 4, seatsPerRow: 10 }}
    tribunaOeste={{ rows: 4, seatsPerRow: 10 }}
    tribunaSur={{ rows: 5, seatsPerRow: 12 }}
    vip={null} // Sin sección VIP
    selectedSeats={selectedSeats}
    onSeatSelect={onSeatSelect}
    maxSeats={maxSeats}
    occupiedSeats={occupiedSeats}
    formatPrice={formatPrice}
    stadiumName="Estadio Juvenil"
  />
);

export default FootballSeatMap1;