import React from 'react';
import TheaterSeatMap from './generic/GenericTheaterSeatmap';

// TheaterSeatMap1 - Configuración original (teatro clásico)
export const TheaterSeatMap1 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => (
  <TheaterSeatMap
    orchestra={{ rows: 15, seatsPerRow: 20 }}
    mezzanine={{ rows: 8, seatsPerRow: 18 }}
    balcony={{ rows: 6, seatsPerRow: 16 }}
    boxes={null} // Sin palcos especiales
    selectedSeats={selectedSeats}
    onSeatSelect={onSeatSelect}
    maxSeats={maxSeats}
    occupiedSeats={occupiedSeats}
    formatPrice={formatPrice}
    theaterName="Teatro Clásico"
    stageWidth={250}
  />
);

// TheaterSeatMap4 - Teatro moderno con solo platea y palcos
export const TheaterSeatMap2 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => (
  <TheaterSeatMap
    orchestra={{ rows: 12, seatsPerRow: 16, price: 55000 }}
    mezzanine={null} // Sin entresuelo
    balcony={null} // Sin balcón
    boxes={{ rows: 3, seatsPerRow: 4, price: 95000 }}
    selectedSeats={selectedSeats}
    onSeatSelect={onSeatSelect}
    maxSeats={maxSeats}
    occupiedSeats={occupiedSeats}
    formatPrice={formatPrice}
    theaterName="Teatro Moderno"
    stageWidth={280}
  />
);

// TheaterSeatMap5 - Teatro de ópera (todas las secciones)
export const TheaterSeatMap3 = ({ selectedSeats, onSeatSelect, maxSeats, occupiedSeats, formatPrice }) => (
  <TheaterSeatMap
    orchestra={{ rows: 20, seatsPerRow: 26, price: 65000 }}
    mezzanine={{ rows: 12, seatsPerRow: 24, price: 50000 }}
    balcony={{ rows: 10, seatsPerRow: 22, price: 35000 }}
    boxes={{ rows: 2, seatsPerRow: 8, price: 120000 }}
    selectedSeats={selectedSeats}
    onSeatSelect={onSeatSelect}
    maxSeats={maxSeats}
    occupiedSeats={occupiedSeats}
    formatPrice={formatPrice}
    theaterName="Teatro de Ópera"
    stageWidth={400}
  />
);

// Exportación por defecto para compatibilidad
export default TheaterSeatMap1;