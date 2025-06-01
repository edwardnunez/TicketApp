import React from 'react';
import { Typography, Card } from 'antd';
import SeatRenderer from '../SeatRenderer';

const { Text } = Typography;

// Componente genérico que recibe dimensiones como parámetros
const TheaterSeatMap = ({ 
  // Configuración de secciones - cada una puede ser null para no renderizarla
  orchestra = null,   // { rows: 15, seatsPerRow: 20 } - Platea
  mezzanine = null,   // { rows: 8, seatsPerRow: 18 } - Entresuelo
  balcony = null,     // { rows: 6, seatsPerRow: 16 } - Balcón
  boxes = null,       // { rows: 2, seatsPerRow: 4 } - Palcos especiales
  
  // Props del componente original
  selectedSeats, 
  onSeatSelect, 
  maxSeats, 
  occupiedSeats, 
  formatPrice,
  
  // Configuraciones opcionales
  theaterName = 'Teatro',
  stageWidth = 250
}) => {

  // Configuración de precios y colores por defecto
  const defaultConfig = {
    orchestra: { price: 45000, color: '#4CAF50', name: 'Platea' },
    mezzanine: { price: 35000, color: '#2196F3', name: 'Entresuelo' },
    balcony: { price: 25000, color: '#FF9800', name: 'Balcón' },
    boxes: { price: 65000, color: '#9C27B0', name: 'Palcos VIP' }
  };

  // Crear configuraciones de secciones
  const sections = {
    orchestra: orchestra ? {
      id: 'orchestra',
      name: defaultConfig.orchestra.name,
      rows: orchestra.rows,
      seatsPerRow: orchestra.seatsPerRow,
      price: orchestra.price || defaultConfig.orchestra.price,
      color: orchestra.color || defaultConfig.orchestra.color
    } : null,
    
    mezzanine: mezzanine ? {
      id: 'mezzanine',
      name: defaultConfig.mezzanine.name,
      rows: mezzanine.rows,
      seatsPerRow: mezzanine.seatsPerRow,
      price: mezzanine.price || defaultConfig.mezzanine.price,
      color: mezzanine.color || defaultConfig.mezzanine.color
    } : null,
    
    balcony: balcony ? {
      id: 'balcony',
      name: defaultConfig.balcony.name,
      rows: balcony.rows,
      seatsPerRow: balcony.seatsPerRow,
      price: balcony.price || defaultConfig.balcony.price,
      color: balcony.color || defaultConfig.balcony.color
    } : null,
    
    boxes: boxes ? {
      id: 'boxes',
      name: defaultConfig.boxes.name,
      rows: boxes.rows,
      seatsPerRow: boxes.seatsPerRow,
      price: boxes.price || defaultConfig.boxes.price,
      color: boxes.color || defaultConfig.boxes.color
    } : null
  };

  const filterOccupiedBySection = (sectionId) => {
    if (!occupiedSeats || !occupiedSeats.length) return [];
    return occupiedSeats.filter(seatId => seatId.startsWith(sectionId));
  };

  // Renderizar sección
  const renderSection = (section) => {
    if (!section) return null;
    
    return (
      <div key={section.id} style={{ textAlign: 'center', marginBottom: 15 }}>
        <Text strong style={{ color: section.color, marginBottom: 8, display: 'block' }}>
          {section.name}
        </Text>
        <Card style={{ 
          padding: 10, 
          borderRadius: 8, 
          margin: 5,
          ...(section.id === 'boxes' && {
            border: '2px solid #9C27B0',
            backgroundColor: '#F3E5F5'
          })
        }}>
          <SeatRenderer
            {...section}
            selectedSeats={selectedSeats}
            occupiedSeats={filterOccupiedBySection(section.id)}
            maxSeats={maxSeats}
            onSeatSelect={onSeatSelect}
            formatPrice={formatPrice}
            sectionId={section.id}
          />
        </Card>
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 15,
      minWidth: 400
    }}>
      {/* Escenario */}
      <div
        style={{
          width: stageWidth,
          height: 30,
          backgroundColor: '#8B4513',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 14,
          marginBottom: 20,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          border: '2px solid #654321'
        }}
      >
        ESCENARIO
      </div>

      {/* Palcos VIP (si existen, van primero - más cerca del escenario) */}
      {renderSection(sections.boxes)}

      {/* Secciones en orden desde cerca del escenario hacia atrás */}
      {renderSection(sections.orchestra)}
      {renderSection(sections.mezzanine)}
      {renderSection(sections.balcony)}
    </div>
  );
};

export default TheaterSeatMap;