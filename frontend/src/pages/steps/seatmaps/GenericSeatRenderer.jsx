import React from 'react';
import { Typography, Card } from 'antd';
import SeatRenderer from './SeatRenderer';
import { COLORS } from '../../../components/colorscheme';

const { Title, Text } = Typography;

const GenericSeatMapRenderer = ({
  seatMapData,
  selectedSeats,
  onSeatSelect,
  maxSeats,
  occupiedSeats,
  formatPrice
}) => {
  if (!seatMapData) return null;

  const { sections, config, type, name } = seatMapData;

  const filterOccupiedBySection = (sectionId) => {
    if (!occupiedSeats || !occupiedSeats.length) return [];
    return occupiedSeats.filter(seatId => seatId.startsWith(sectionId));
  };

  const renderFootballLayout = () => {
    // Encontrar las secciones específicas del fútbol
    const tribunaNorte = sections.find(s => s.id.includes('norte') || s.name.toLowerCase().includes('norte'));
    const tribunaEste = sections.find(s => s.id.includes('este') || s.name.toLowerCase().includes('este'));
    const tribunaOeste = sections.find(s => s.id.includes('oeste') || s.name.toLowerCase().includes('oeste'));
    const tribunaSur = sections.find(s => s.id.includes('sur') || s.name.toLowerCase().includes('sur'));
    const vipSection = sections.find(s => s.id.includes('vip') || s.name.toLowerCase().includes('vip') || s.name.toLowerCase().includes('palco'));

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 30, 
        minWidth: 800, 
        minHeight: 600,
        padding: '20px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.stadiumName || name}
        </Title>

        {/* Tribuna Norte */}
        {tribunaNorte && (
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ color: tribunaNorte.color }}>{tribunaNorte.name}</Text>
            <Card style={{ padding: 10, margin: 5 }}>
              <SeatRenderer
                sectionId={tribunaNorte.id}
                rows={tribunaNorte.rows}
                seatsPerRow={tribunaNorte.seatsPerRow}
                price={tribunaNorte.price}
                color={tribunaNorte.color}
                name={tribunaNorte.name}
                selectedSeats={selectedSeats}
                occupiedSeats={filterOccupiedBySection(tribunaNorte.id)}
                maxSeats={maxSeats}
                onSeatSelect={onSeatSelect}
                formatPrice={formatPrice}
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
          {tribunaOeste && (
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
                  color: tribunaOeste.color
                }}
              >
                {tribunaOeste.name}
              </Text>
              <Card style={{ padding: 8, borderRadius: 8, transform: 'rotate(-90deg)' }}>
                <SeatRenderer
                  sectionId={tribunaOeste.id}
                  rows={tribunaOeste.rows}
                  seatsPerRow={tribunaOeste.seatsPerRow}
                  price={tribunaOeste.price}
                  color={tribunaOeste.color}
                  name={tribunaOeste.name}
                  selectedSeats={selectedSeats}
                  occupiedSeats={filterOccupiedBySection(tribunaOeste.id)}
                  maxSeats={maxSeats}
                  onSeatSelect={onSeatSelect}
                  formatPrice={formatPrice}
                />
              </Card>
            </div>
          )}

          {/* Campo */}
          <div
            style={{
              width: config?.fieldDimensions?.width || 400,
              height: config?.fieldDimensions?.height || 260,
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
              flexShrink: 0,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
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
          {tribunaEste && (
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
                  color: tribunaEste.color
                }}
              >
                {tribunaEste.name}
              </Text>
              <Card style={{ padding: 8, borderRadius: 8, transform: 'rotate(90deg)' }}>
                <SeatRenderer
                  sectionId={tribunaEste.id}
                  rows={tribunaEste.rows}
                  seatsPerRow={tribunaEste.seatsPerRow}
                  price={tribunaEste.price}
                  color={tribunaEste.color}
                  name={tribunaEste.name}
                  selectedSeats={selectedSeats}
                  occupiedSeats={filterOccupiedBySection(tribunaEste.id)}
                  maxSeats={maxSeats}
                  onSeatSelect={onSeatSelect}
                  formatPrice={formatPrice}
                />
              </Card>
            </div>
          )}
        </div>

        {/* Tribuna Sur */}
        {tribunaSur && (
          <div style={{ textAlign: 'center' }}>
            <Card style={{ padding: 10, margin: 5 }}>
              <SeatRenderer
                sectionId={tribunaSur.id}
                rows={tribunaSur.rows}
                seatsPerRow={tribunaSur.seatsPerRow}
                price={tribunaSur.price}
                color={tribunaSur.color}
                name={tribunaSur.name}
                selectedSeats={selectedSeats}
                occupiedSeats={filterOccupiedBySection(tribunaSur.id)}
                maxSeats={maxSeats}
                onSeatSelect={onSeatSelect}
                formatPrice={formatPrice}
              />
            </Card>
            <Text strong style={{ color: tribunaSur.color }}>{tribunaSur.name}</Text>
          </div>
        )}

        {/* VIP */}
        {vipSection && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Text strong style={{ color: vipSection.color }}>{vipSection.name}</Text>
            <Card style={{ 
              border: `2px solid ${vipSection.color}`, 
              padding: 10, 
              borderRadius: 8, 
              margin: 5, 
              backgroundColor: vipSection.color + '20'
            }}>
              <SeatRenderer
                sectionId={vipSection.id}
                rows={vipSection.rows}
                seatsPerRow={vipSection.seatsPerRow}
                price={vipSection.price}
                color={vipSection.color}
                name={vipSection.name}
                selectedSeats={selectedSeats}
                occupiedSeats={filterOccupiedBySection(vipSection.id)}
                maxSeats={maxSeats}
                onSeatSelect={onSeatSelect}
                formatPrice={formatPrice}
              />
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderCinemaLayout = () => {
    // Ordenar secciones por orden (premium primero, luego front, middle, back)
    const sortedSections = [...sections].sort((a, b) => {
      const order = { premium: 0, front: 1, middle: 2, back: 3 };
      const aOrder = order[a.id] !== undefined ? order[a.id] : 999;
      const bOrder = order[b.id] !== undefined ? order[b.id] : 999;
      return aOrder - bOrder;
    });

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 10,
        minWidth: 400,
        padding: '20px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.cinemaName || name}
        </Title>

        {/* Pantalla */}
        <div
          style={{
            width: config?.screenWidth || 300,
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

        {/* Renderizar secciones en orden */}
        {sortedSections.map(section => (
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
                sectionId={section.id}
                rows={section.rows}
                seatsPerRow={section.seatsPerRow}
                price={section.price}
                color={section.color}
                name={section.name}
                selectedSeats={selectedSeats}
                occupiedSeats={filterOccupiedBySection(section.id)}
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

  const renderTheaterLayout = () => {
    // Ordenar secciones por orden (boxes primero, luego orchestra, mezzanine, balcony)
    const sortedSections = [...sections].sort((a, b) => {
      const order = { boxes: 0, orchestra: 1, mezzanine: 2, balcony: 3 };
      const aOrder = order[a.id] !== undefined ? order[a.id] : 999;
      const bOrder = order[b.id] !== undefined ? order[b.id] : 999;
      return aOrder - bOrder;
    });

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 15,
        minWidth: 400,
        padding: '20px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {config?.theaterName || name}
        </Title>

        {/* Escenario */}
        <div
          style={{
            width: config?.stageWidth || 250,
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

        {/* Renderizar secciones en orden */}
        {sortedSections.map(section => (
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
                sectionId={section.id}
                rows={section.rows}
                seatsPerRow={section.seatsPerRow}
                price={section.price}
                color={section.color}
                name={section.name}
                selectedSeats={selectedSeats}
                occupiedSeats={filterOccupiedBySection(section.id)}
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

  const renderGenericLayout = () => {
    // Ordenar secciones por el campo order
    const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px'
      }}>
        <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
          {name}
        </Title>

        <div style={{ width: '100%', maxWidth: '800px' }}>
          {sortedSections.map(section => (
            <div key={section.id} style={{ marginBottom: '24px' }}>
              <div style={{
                padding: '12px 16px',
                backgroundColor: section.color + '20',
                borderLeft: `4px solid ${section.color}`,
                marginBottom: '12px',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={5} style={{ margin: 0, color: COLORS.neutral.darker }}>
                    {section.name}
                  </Title>
                  <Typography.Text strong style={{ color: section.color }}>
                    {formatPrice(section.price)}
                  </Typography.Text>
                </div>
                <Typography.Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                  {section.rows} filas × {section.seatsPerRow} asientos por fila
                </Typography.Text>
              </div>
              <SeatRenderer
                sectionId={section.id}
                rows={section.rows}
                seatsPerRow={section.seatsPerRow}
                price={section.price}
                color={section.color}
                name={section.name}
                selectedSeats={selectedSeats}
                occupiedSeats={filterOccupiedBySection(section.id)}
                maxSeats={maxSeats}
                onSeatSelect={onSeatSelect}
                formatPrice={formatPrice}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar según el tipo
  switch (type) {
    case 'football':
      return renderFootballLayout();
    case 'cinema':
      return renderCinemaLayout();
    case 'theater':
      return renderTheaterLayout();
    default:
      return renderGenericLayout();
  }
};

export default GenericSeatMapRenderer;