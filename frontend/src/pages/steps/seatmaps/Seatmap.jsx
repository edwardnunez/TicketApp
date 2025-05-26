import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Tag, Tooltip, Modal, Row, Col } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { COLORS } from '../../../components/colorscheme';

const { Title, Text } = Typography;

// Configuraciones de mapas por tipo de evento
const VENUE_CONFIGS = {
  football: {
    name: 'Estadio de Fútbol',
    sections: [
      { id: 'tribuna-norte', name: 'Tribuna Norte', rows: 20, seatsPerRow: 30, price: 50000, color: '#4CAF50' },
      { id: 'tribuna-sur', name: 'Tribuna Sur', rows: 20, seatsPerRow: 30, price: 50000, color: '#4CAF50' },
      { id: 'tribuna-este', name: 'Tribuna Este', rows: 15, seatsPerRow: 25, price: 75000, color: '#2196F3' },
      { id: 'tribuna-oeste', name: 'Tribuna Oeste', rows: 15, seatsPerRow: 25, price: 75000, color: '#2196F3' },
      { id: 'vip', name: 'Palcos VIP', rows: 5, seatsPerRow: 10, price: 150000, color: '#FF9800' }
    ]
  },
  cinema: {
    name: 'Sala de Cine',
    sections: [
      { id: 'front', name: 'Delanteras', rows: 3, seatsPerRow: 16, price: 8000, color: '#4CAF50' },
      { id: 'middle', name: 'Centrales', rows: 5, seatsPerRow: 16, price: 12000, color: '#2196F3' },
      { id: 'back', name: 'Traseras', rows: 4, seatsPerRow: 16, price: 10000, color: '#FF9800' }
    ]
  },
  theater: {
    name: 'Teatro',
    sections: [
      { id: 'orchestra', name: 'Platea', rows: 15, seatsPerRow: 20, price: 45000, color: '#4CAF50' },
      { id: 'mezzanine', name: 'Entresuelo', rows: 8, seatsPerRow: 18, price: 35000, color: '#2196F3' },
      { id: 'balcony', name: 'Balcón', rows: 6, seatsPerRow: 16, price: 25000, color: '#FF9800' }
    ]
  }
};

const SeatMap = ({ 
  venueType = 'football', 
  selectedSeats = [], 
  onSeatSelect, 
  maxSeats = 6,
  occupiedSeats = [],
  formatPrice 
}) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  
  const venueConfig = VENUE_CONFIGS[venueType];
  
  if (!venueConfig) {
    return <div>Configuración de venue no encontrada</div>;
  }

  // Generar ID único para un asiento
  const getSeatId = (sectionId, row, seat) => {
    return `${sectionId}-${row}-${seat}`;
  };

  // Verificar si un asiento está ocupado
  const isSeatOccupied = (seatId) => {
    return occupiedSeats.includes(seatId);
  };

  // Verificar si un asiento está seleccionado
  const isSeatSelected = (seatId) => {
    return selectedSeats.some(s => s.id === seatId);
  };

  // Manejar click en asiento
  const handleSeatClick = (sectionId, row, seat, section) => {
    const seatId = getSeatId(sectionId, row, seat);
    
    if (isSeatOccupied(seatId)) return;
    
    const seatData = {
      id: seatId,
      section: section.name,
      sectionId: sectionId,
      row: row + 1,
      seat: seat + 1,
      price: section.price
    };

    if (isSeatSelected(seatId)) {
      // Deseleccionar asiento
      onSeatSelect(selectedSeats.filter(s => s.id !== seatId));
    } else {
      // Seleccionar asiento si no se ha alcanzado el máximo
      if (selectedSeats.length < maxSeats) {
        onSeatSelect([...selectedSeats, seatData]);
      }
    }
  };

  // Obtener color del asiento
  const getSeatColor = (seatId, section) => {
    if (isSeatOccupied(seatId)) return '#ccc';
    if (isSeatSelected(seatId)) return COLORS.primary.main;
    return section.color;
  };

  // Renderizar asiento individual
  const renderSeat = (sectionId, row, seat, section) => {
    const seatId = getSeatId(sectionId, row, seat);
    const isOccupied = isSeatOccupied(seatId);
    const isSelected = isSeatSelected(seatId);
    const isHovered = hoveredSeat === seatId;
    
    return (
      <Tooltip
        key={seatId}
        title={
          isOccupied 
            ? 'Asiento ocupado' 
            : `${section.name} - Fila ${row + 1}, Asiento ${seat + 1} - ${formatPrice(section.price)}`
        }
      >
        <button
          style={{
            width: '24px',
            height: '24px',
            margin: '1px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: getSeatColor(seatId, section),
            cursor: isOccupied ? 'not-allowed' : 'pointer',
            opacity: isOccupied ? 0.3 : (isHovered ? 0.8 : 1),
            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white'
          }}
          onClick={() => handleSeatClick(sectionId, row, seat, section)}
          onMouseEnter={() => setHoveredSeat(seatId)}
          onMouseLeave={() => setHoveredSeat(null)}
          disabled={isOccupied}
        >
          {isSelected && <CheckOutlined style={{ fontSize: '8px' }} />}
          {isOccupied && <CloseOutlined style={{ fontSize: '8px' }} />}
        </button>
      </Tooltip>
    );
  };

  // Renderizar sección
  const renderSection = (section) => {
    const seats = [];
    for (let row = 0; row < section.rows; row++) {
      const rowSeats = [];
      for (let seat = 0; seat < section.seatsPerRow; seat++) {
        rowSeats.push(renderSeat(section.id, row, seat, section));
      }
      seats.push(
        <div key={`${section.id}-row-${row}`} style={{ display: 'flex', marginBottom: '2px' }}>
          <div style={{ 
            width: '30px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '12px',
            color: COLORS.neutral.grey4
          }}>
            {row + 1}
          </div>
          {rowSeats}
        </div>
      );
    }
    return seats;
  };

  // Layout específico por tipo de venue
  const renderVenueLayout = () => {
    switch (venueType) {
      case 'football':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Tribuna Norte */}
            <div style={{ textAlign: 'center' }}>
              <Text strong>{venueConfig.sections[0].name}</Text>
              <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', margin: '5px' }}>
                {renderSection(venueConfig.sections[0])}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              {/* Tribuna Oeste */}
              <div style={{ textAlign: 'center', transform: 'rotate(-90deg)' }}>
                <div style={{ transform: 'rotate(90deg)', marginBottom: '10px' }}>
                  <Text strong>{venueConfig.sections[3].name}</Text>
                </div>
                <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
                  {renderSection(venueConfig.sections[3])}
                </div>
              </div>
              
              {/* Campo */}
              <div style={{
                width: '200px',
                height: '120px',
                backgroundColor: '#4CAF50',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                CAMPO
              </div>
              
              {/* Tribuna Este */}
              <div style={{ textAlign: 'center', transform: 'rotate(90deg)' }}>
                <div style={{ transform: 'rotate(-90deg)', marginBottom: '10px' }}>
                  <Text strong>{venueConfig.sections[2].name}</Text>
                </div>
                <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
                  {renderSection(venueConfig.sections[2])}
                </div>
              </div>
            </div>
            
            {/* Tribuna Sur */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', margin: '5px' }}>
                {renderSection(venueConfig.sections[1])}
              </div>
              <Text strong>{venueConfig.sections[1].name}</Text>
            </div>
            
            {/* VIP */}
            <div style={{ textAlign: 'center' }}>
              <Text strong>{venueConfig.sections[4].name}</Text>
              <div style={{ border: '2px solid #FF9800', padding: '10px', borderRadius: '8px', margin: '5px' }}>
                {renderSection(venueConfig.sections[4])}
              </div>
            </div>
          </div>
        );
        
      case 'cinema':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            {/* Pantalla */}
            <div style={{
              width: '300px',
              height: '20px',
              backgroundColor: '#333',
              borderRadius: '10px 10px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              marginBottom: '20px'
            }}>
              PANTALLA
            </div>
            
            {venueConfig.sections.map((section, index) => (
              <div key={section.id} style={{ textAlign: 'center', marginBottom: '15px' }}>
                <Text strong style={{ color: section.color }}>{section.name}</Text>
                <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', margin: '5px' }}>
                  {renderSection(section)}
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'theater':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            {/* Escenario */}
            <div style={{
              width: '250px',
              height: '30px',
              backgroundColor: '#8B4513',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              ESCENARIO
            </div>
            
            {venueConfig.sections.map((section, index) => (
              <div key={section.id} style={{ textAlign: 'center', marginBottom: '10px' }}>
                <Text strong style={{ color: section.color }}>{section.name}</Text>
                <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', margin: '5px' }}>
                  {renderSection(section)}
                </div>
              </div>
            ))}
          </div>
        );
        
      default:
        return <div>Layout no disponible</div>;
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={4} style={{ color: COLORS.neutral.darker, margin: 0 }}>
          Selecciona tus asientos
        </Title>
        <Button onClick={() => setShowLegend(true)}>
          Ver leyenda
        </Button>
      </div>
      
      {/* Información de selección */}
      {selectedSeats.length > 0 && (
        <div style={{ 
          backgroundColor: COLORS.neutral.grey1, 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px' 
        }}>
          <Text strong>Asientos seleccionados ({selectedSeats.length}/{maxSeats}):</Text>
          <div style={{ marginTop: '8px' }}>
            {selectedSeats.map(seat => (
              <Tag key={seat.id} color={COLORS.primary.main} style={{ margin: '2px' }}>
                {seat.section} - Fila {seat.row}, Asiento {seat.seat}
              </Tag>
            ))}
          </div>
        </div>
      )}
      
      {/* Mapa de asientos */}
      <div style={{ 
        overflowX: 'auto', 
        overflowY: 'auto',
        maxHeight: '600px',
        padding: '20px',
        border: '1px solid #f0f0f0',
        borderRadius: '8px'
      }}>
        {renderVenueLayout()}
      </div>
      
      {/* Modal de leyenda */}
      <Modal
        title="Leyenda del mapa"
        open={showLegend}
        onCancel={() => setShowLegend(false)}
        footer={[
          <Button key="close" onClick={() => setShowLegend(false)}>
            Cerrar
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#4CAF50', borderRadius: '4px' }}></div>
            <Text>Asiento disponible</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: COLORS.primary.main, borderRadius: '4px' }}></div>
            <Text>Asiento seleccionado</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#ccc', borderRadius: '4px' }}></div>
            <Text>Asiento ocupado</Text>
          </div>
        </Space>
        
        <div style={{ marginTop: '16px' }}>
          <Title level={5}>Precios por sección:</Title>
          {venueConfig.sections.map(section => (
            <div key={section.id} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <Text style={{ color: section.color }}>{section.name}</Text>
              <Text strong>{formatPrice(section.price)}</Text>
            </div>
          ))}
        </div>
      </Modal>
    </Card>
  );
};

export default SeatMap;