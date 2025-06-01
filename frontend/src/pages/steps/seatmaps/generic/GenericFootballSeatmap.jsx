import React from 'react';
import { Typography, Card } from 'antd';
import SeatRenderer from '../SeatRenderer';

const { Text } = Typography;

// Componente genérico que recibe dimensiones como parámetros
const FootballSeatMap = ({ 
  // Dimensiones de cada sección
  tribunaNorte = { rows: 8, seatsPerRow: 17 },
  tribunaEste = { rows: 6, seatsPerRow: 15 },
  tribunaOeste = { rows: 6, seatsPerRow: 15 },
  tribunaSur = { rows: 8, seatsPerRow: 17 },
  vip = null, // Si es null, no se renderiza la sección VIP
  
  // Props del componente original
  selectedSeats, 
  onSeatSelect, 
  maxSeats, 
  occupiedSeats, 
  formatPrice,
  
  // Configuraciones opcionales
  stadiumName = 'Estadio de fútbol'
}) => {

  // Configuración de precios y colores por defecto
  const defaultConfig = {
    tribunaNorte: { price: 50000, color: '#4CAF50', name: 'Tribuna Norte' },
    tribunaEste: { price: 75000, color: '#2196F3', name: 'Tribuna Este' },
    tribunaOeste: { price: 75000, color: '#2196F3', name: 'Tribuna Oeste' },
    tribunaSur: { price: 50000, color: '#4CAF50', name: 'Tribuna Sur' },
    vip: { price: 150000, color: '#FF9800', name: 'Palcos VIP' }
  };

  // Crear configuraciones de secciones
  const sections = {
    norte: tribunaNorte ? {
      id: 'tribuna-norte',
      name: defaultConfig.tribunaNorte.name,
      rows: tribunaNorte.rows,
      seatsPerRow: tribunaNorte.seatsPerRow,
      price: defaultConfig.tribunaNorte.price,
      color: defaultConfig.tribunaNorte.color
    } : null,
    
    este: tribunaEste ? {
      id: 'tribuna-este',
      name: defaultConfig.tribunaEste.name,
      rows: tribunaEste.rows,
      seatsPerRow: tribunaEste.seatsPerRow,
      price: defaultConfig.tribunaEste.price,
      color: defaultConfig.tribunaEste.color
    } : null,
    
    oeste: tribunaOeste ? {
      id: 'tribuna-oeste',
      name: defaultConfig.tribunaOeste.name,
      rows: tribunaOeste.rows,
      seatsPerRow: tribunaOeste.seatsPerRow,
      price: defaultConfig.tribunaOeste.price,
      color: defaultConfig.tribunaOeste.color
    } : null,
    
    sur: tribunaSur ? {
      id: 'tribuna-sur',
      name: defaultConfig.tribunaSur.name,
      rows: tribunaSur.rows,
      seatsPerRow: tribunaSur.seatsPerRow,
      price: defaultConfig.tribunaSur.price,
      color: defaultConfig.tribunaSur.color
    } : null,
    
    vip: vip ? {
      id: 'vip',
      name: defaultConfig.vip.name,
      rows: vip.rows,
      seatsPerRow: vip.seatsPerRow,
      price: defaultConfig.vip.price,
      color: defaultConfig.vip.color
    } : null
  };

  const filterOccupiedBySection = (sectionId) => {
    if (!occupiedSeats || !occupiedSeats.length) return [];
    return occupiedSeats.filter(seatId => seatId.startsWith(sectionId));
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 30, 
      minWidth: 800, 
      minHeight: 600 
    }}>
      {/* Tribuna Norte */}
      {sections.norte && (
        <div style={{ textAlign: 'center' }}>
          <Text strong>{sections.norte.name}</Text>
          <Card style={{ padding: 10, margin: 5 }}>
            <SeatRenderer
              {...sections.norte}
              selectedSeats={selectedSeats}
              occupiedSeats={filterOccupiedBySection(sections.norte.id)}
              maxSeats={maxSeats}
              onSeatSelect={onSeatSelect}
              formatPrice={formatPrice}
              sectionId={sections.norte.id}
            />
          </Card>
        </div>
      )}

      {/* Fila central horizontal: Tribuna Oeste | Campo | Tribuna Este */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%', 
        gap: 40 
      }}>
        {/* Tribuna Oeste - Rotada 90 grados */}
        {sections.oeste && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            minWidth: 120, 
            justifyContent: 'center' 
          }}>
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
              {sections.oeste.name}
            </Text>
            <Card style={{ padding: 8, borderRadius: 8, transform: 'rotate(-90deg)' }}>
              <SeatRenderer
                {...sections.oeste}
                selectedSeats={selectedSeats}
                occupiedSeats={filterOccupiedBySection(sections.oeste.id)}
                maxSeats={maxSeats}
                onSeatSelect={onSeatSelect}
                formatPrice={formatPrice}
                sectionId={sections.oeste.id}
              />
            </Card>
          </div>
        )}

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
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: 80, 
            height: 80, 
            border: '2px solid white', 
            borderRadius: '50%' 
          }}></div>
          CAMPO
        </div>

        {/* Tribuna Este - Rotada 90 grados */}
        {sections.este && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            minWidth: 120, 
            justifyContent: 'center' 
          }}>
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
              {sections.este.name}
            </Text>
            <Card style={{ padding: 8, borderRadius: 8, transform: 'rotate(90deg)' }}>
              <SeatRenderer
                {...sections.este}
                selectedSeats={selectedSeats}
                occupiedSeats={filterOccupiedBySection(sections.este.id)}
                maxSeats={maxSeats}
                onSeatSelect={onSeatSelect}
                formatPrice={formatPrice}
                sectionId={sections.este.id}
              />
            </Card>
          </div>
        )}
      </div>

      {/* Tribuna Sur */}
      {sections.sur && (
        <div style={{ textAlign: 'center' }}>
          <Card style={{ padding: 10, margin: 5 }}>
            <SeatRenderer
              {...sections.sur}
              selectedSeats={selectedSeats}
              occupiedSeats={filterOccupiedBySection(sections.sur.id)}
              maxSeats={maxSeats}
              onSeatSelect={onSeatSelect}
              formatPrice={formatPrice}
              sectionId={sections.sur.id}
            />
          </Card>
          <Text strong>{sections.sur.name}</Text>
        </div>
      )}

      {/* VIP */}
      {sections.vip && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Text strong>{sections.vip.name}</Text>
          <Card style={{ 
            border: '2px solid #FF9800', 
            padding: 10, 
            borderRadius: 8, 
            margin: 5, 
            backgroundColor: '#FFF3E0' 
          }}>
            <SeatRenderer
              {...sections.vip}
              selectedSeats={selectedSeats}
              occupiedSeats={filterOccupiedBySection(sections.vip.id)}
              maxSeats={maxSeats}
              onSeatSelect={onSeatSelect}
              formatPrice={formatPrice}
              sectionId={sections.vip.id}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default FootballSeatMap;