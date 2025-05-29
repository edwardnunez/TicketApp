import React from 'react';
import { Typography, Card } from 'antd';
import SeatRenderer from '../SeatRenderer';

const { Text } = Typography;

// Componente genérico que recibe dimensiones como parámetros
const CinemaSeatMap = ({ 
  // Configuración de secciones - cada una puede ser null para no renderizarla
  front = null,    // { rows: 3, seatsPerRow: 16 }
  middle = null,   // { rows: 5, seatsPerRow: 16 }
  back = null,     // { rows: 4, seatsPerRow: 16 }
  premium = null,  // { rows: 2, seatsPerRow: 12 } - asientos premium/VIP
  
  // Props del componente original
  selectedSeats, 
  onSeatSelect, 
  maxSeats, 
  occupiedSeats, 
  formatPrice,
  
  // Configuraciones opcionales
  cinemaName = 'Sala de Cine',
  screenWidth = 300
}) => {

  // Configuración de precios y colores por defecto
  const defaultConfig = {
    front: { price: 8000, color: '#4CAF50', name: 'Delanteras' },
    middle: { price: 12000, color: '#2196F3', name: 'Centrales' },
    back: { price: 10000, color: '#FF9800', name: 'Traseras' },
    premium: { price: 18000, color: '#9C27B0', name: 'Premium' }
  };

  // Crear configuraciones de secciones
  const sections = {
    front: front ? {
      id: 'front',
      name: defaultConfig.front.name,
      rows: front.rows,
      seatsPerRow: front.seatsPerRow,
      price: front.price || defaultConfig.front.price,
      color: front.color || defaultConfig.front.color
    } : null,
    
    middle: middle ? {
      id: 'middle',
      name: defaultConfig.middle.name,
      rows: middle.rows,
      seatsPerRow: middle.seatsPerRow,
      price: middle.price || defaultConfig.middle.price,
      color: middle.color || defaultConfig.middle.color
    } : null,
    
    back: back ? {
      id: 'back',
      name: defaultConfig.back.name,
      rows: back.rows,
      seatsPerRow: back.seatsPerRow,
      price: back.price || defaultConfig.back.price,
      color: back.color || defaultConfig.back.color
    } : null,
    
    premium: premium ? {
      id: 'premium',
      name: defaultConfig.premium.name,
      rows: premium.rows,
      seatsPerRow: premium.seatsPerRow,
      price: premium.price || defaultConfig.premium.price,
      color: premium.color || defaultConfig.premium.color
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
          ...(section.id === 'premium' && {
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
      gap: 10,
      minWidth: 400
    }}>
      {/* Pantalla */}
      <div
        style={{
          width: screenWidth,
          height: 20,
          backgroundColor: '#333',
          borderRadius: '10px 10px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 12,
          marginBottom: 20,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        PANTALLA
      </div>

      {/* Sección Premium (si existe, va primera - más cerca de la pantalla) */}
      {renderSection(sections.premium)}

      {/* Secciones en orden desde delante hacia atrás */}
      {renderSection(sections.front)}
      {renderSection(sections.middle)}
      {renderSection(sections.back)}
    </div>
  );
};

export default CinemaSeatMap;