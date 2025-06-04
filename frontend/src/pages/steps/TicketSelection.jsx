import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Radio, Space, Tag, InputNumber, Typography, Alert, Spin, Button } from "antd";
import { COLORS } from "../../components/colorscheme";
import SeatRenderer from "./seatmaps/SeatRenderer";
import GenericSeatMapRenderer from "./seatmaps/GenericSeatRenderer";
import axios from 'axios';

const { Title, Text } = Typography;

const LOCATION_SERVICE_URL = process.env.REACT_APP_LOCATION_SERVICE_URL || "http://localhost:8004";

export default function SelectTickets({ 
  selectedTicketType, setSelectedTicketType, 
  quantity, setQuantity, 
  ticketTypes, formatPrice,
  event,
  selectedSeats = [],
  onSeatSelect,
  occupiedSeats
}) {
  const [seatMapData, setSeatMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requiresSeatMap = useCallback(() => {
    if (!event?.type) return false;
    // Mapear tipos de eventos a categorías de seatmap
    const eventToSeatMapType = {
      'cinema': 'cinema',
      'theater': 'theater', 
      'theatre': 'theater', // variante en inglés
      'football': 'football',
      'soccer': 'football',
      'sports': 'football', // asumir football por defecto para sports
      'stadium': 'football'
    };
    return Object.keys(eventToSeatMapType).includes(event.type.toLowerCase());
  }, [event?.type]);

  const validateSeatMapCompatibility = useCallback((seatMapData, eventType) => {
    if (!seatMapData || !eventType) return false;
    
    const compatibilityMap = {
      'cinema': ['cinema'],
      'theater': ['theater'],
      'theatre': ['theater'],
      'football': ['football'],
      'soccer': ['football'],
      'sports': ['football'],
      'stadium': ['football']
    };
    
    const allowedTypes = compatibilityMap[eventType.toLowerCase()] || [];
    return allowedTypes.includes(seatMapData.type);
  }, []);

  // Memoize the total calculation
  const totalFromSeats = useMemo(() => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }, [selectedSeats]);

  // Stable reference for handleSeatSelection
  const handleSeatSelection = useCallback((seats) => {
    onSeatSelect(seats);
    setQuantity(seats.length);
  }, [onSeatSelect, setQuantity]);

  // Load seatmap data with proper dependencies
  useEffect(() => {
    const loadSeatMapData = async () => {
      const needsSeatMap = requiresSeatMap();
      const seatMapId = event?.location?.seatMapId;
      
      if (!needsSeatMap || !seatMapId) {
        setSeatMapData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${LOCATION_SERVICE_URL}/seatmaps/${seatMapId}`);
        const seatMapData = response.data;
        
        // Validar compatibilidad
        if (!validateSeatMapCompatibility(seatMapData, event.type)) {
          setError(`El mapa de asientos tipo "${seatMapData.type}" no es compatible con eventos de tipo "${event.type}"`);
          setSeatMapData(null);
          return;
        }
        
        setSeatMapData(seatMapData);
      } catch (err) {
        console.error('Error loading seatmap:', err);
        if (err.response?.status === 404) {
          setError('El mapa de asientos no existe o no está disponible');
        } else if (err.response?.status >= 500) {
          setError('Error del servidor. Por favor, inténtalo más tarde');
        } else {
          setError('No se pudo cargar el mapa de asientos');
        }
        setSeatMapData(null);
      } finally {
        setLoading(false);
      }
    };

    loadSeatMapData();
  }, [event?.location?.seatMapId, event?.type, requiresSeatMap, validateSeatMapCompatibility]);

  useEffect(() => {
    // Limpiar asientos seleccionados cuando cambia el evento
    if (selectedSeats.length > 0) {
      onSeatSelect([]);
      setQuantity(0);
    }
  }, [event?.id]); // Solo cuando cambia el ID del evento


  const renderSeatMapSection = useCallback((section) => {
    const seatMapProps = {
      sectionId: section.id,
      rows: section.rows,
      seatsPerRow: section.seatsPerRow,
      price: section.price,
      color: section.color,
      name: section.name,
      selectedSeats,
      occupiedSeats,
      maxSeats: 6,
      onSeatSelect: handleSeatSelection,
      formatPrice,
    };

    return (
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
            <Text strong style={{ color: section.color }}>
              {formatPrice(section.price)}
            </Text>
          </div>
          <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
            {section.rows} filas × {section.seatsPerRow} asientos por fila
          </Text>
        </div>
        <SeatRenderer {...seatMapProps} />
      </div>
    );
  }, [selectedSeats, occupiedSeats, handleSeatSelection, formatPrice]);

  const renderSeatMap = useCallback(() => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Cargando mapa de asientos...</Text>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Error al cargar el mapa de asientos"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          }
        />
      );
    }

    if (!seatMapData) {
      return (
        <Alert
          message="Mapa de asientos no disponible"
          description="Este evento requiere selección de asientos, pero no hay un mapa configurado."
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      );
    }

    // Usar el GenericSeatMapRenderer que ya tienes
    return (
      <GenericSeatMapRenderer
        seatMapData={seatMapData}
        selectedSeats={selectedSeats}
        onSeatSelect={handleSeatSelection}
        maxSeats={6}
        occupiedSeats={occupiedSeats}
        formatPrice={formatPrice}
      />
    );
  }, [loading, error, seatMapData, selectedSeats, handleSeatSelection, occupiedSeats, formatPrice]);

  const renderSeatSelectionInfo = () => {
    const maxSeats = 6;
    const remainingSeats = maxSeats - selectedSeats.length;
    
    return (
      <Alert
        message="Selección de asientos"
        description={
          <div>
            <p>Haz clic en los asientos que deseas comprar.</p>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Máximo {maxSeats} asientos por compra</li>
              <li>Asientos seleccionados: {selectedSeats.length}</li>
              <li>Puedes seleccionar {remainingSeats} asientos más</li>
              {selectedSeats.length > 0 && (
                <li><strong>Total: {formatPrice(totalFromSeats)}</strong></li>
              )}
            </ul>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />
    );
  };


  // Memoize the selected ticket type data
  const selectedTicketData = useMemo(() => {
    return ticketTypes.find(t => t.key === selectedTicketType);
  }, [ticketTypes, selectedTicketType]);

  // Check if seat map is required
  const needsSeatMap = requiresSeatMap();

  return (
    <>
      {/* Only show ticket type selection when there's NO seat map */}
      {!needsSeatMap && (
        <Card style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
            Selecciona tu tipo de ticket
          </Title>
          <Radio.Group 
            value={selectedTicketType} 
            onChange={(e) => setSelectedTicketType(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {ticketTypes.map(ticket => (
                <Radio key={ticket.key} value={ticket.key} style={{ width: '100%' }}>
                  <Card 
                    size="small"
                    style={{ 
                      marginLeft: '8px',
                      border: selectedTicketType === ticket.key ? `2px solid ${COLORS.primary.main}` : `1px solid ${COLORS.neutral.grey2}`,
                      backgroundColor: selectedTicketType === ticket.key ? `${COLORS.primary.light}10` : COLORS.neutral.white
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Title level={5} style={{ marginBottom: '4px', color: COLORS.neutral.darker }}>
                          {ticket.name}
                        </Title>
                        <Text style={{ color: COLORS.neutral.grey4, marginBottom: '8px', display: 'block' }}>
                          {ticket.description}
                        </Text>
                        <Space wrap>
                          {ticket.features.map((feature, index) => (
                            <Tag key={index} color={COLORS.primary.light}>
                              {feature}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                        <Title level={4} style={{ color: COLORS.primary.main, marginBottom: '4px' }}>
                          {formatPrice(ticket.price)}
                        </Title>
                        <Text style={{ color: COLORS.neutral.grey4 }}>por ticket</Text>
                      </div>
                    </div>
                  </Card>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Card>
      )}

      {needsSeatMap ? (
        <>
          <Alert
            message="Selección de asientos"
            description={`Haz clic en los asientos que deseas comprar. Puedes seleccionar hasta 6 asientos. ${selectedSeats.length > 0 ? `Total: ${formatPrice(totalFromSeats)}` : ''}`}
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          {renderSeatMap()}

          {selectedSeats.length > 0 && (
            <Card style={{ marginTop: '24px', backgroundColor: COLORS.neutral.grey1 }}>
              <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
                Resumen de asientos seleccionados
              </Title>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                {selectedSeats.map(seat => (
                  <div key={seat.id} style={{
                    padding: '12px',
                    backgroundColor: COLORS.neutral.white,
                    borderRadius: '8px',
                    border: `1px solid ${COLORS.neutral.grey2}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>{seat.section}</Text>
                        <br />
                        <Text style={{ color: COLORS.neutral.grey4 }}>
                          Fila {seat.row}, Asiento {seat.seat}
                        </Text>
                      </div>
                      <Text strong style={{ color: COLORS.primary.main }}>
                        {formatPrice(seat.price)}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ 
                marginTop: '16px', 
                padding: '16px', 
                backgroundColor: COLORS.primary.light + '20',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Title level={4} style={{ color: COLORS.neutral.darker, margin: 0 }}>
                  Total:
                </Title>
                <Title level={3} style={{ color: COLORS.primary.main, margin: 0 }}>
                  {formatPrice(totalFromSeats)}
                </Title>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
            Cantidad de tickets
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text>Cantidad:</Text>
            <InputNumber
              min={1}
              max={6}
              value={quantity}
              onChange={setQuantity}
              size="large"
              style={{ width: '120px' }}
            />
            <Text style={{ color: COLORS.neutral.grey4 }}>
              (Máximo 6 tickets por compra)
            </Text>
          </div>

          <div style={{ 
            marginTop: '24px',
            padding: '16px',
            backgroundColor: COLORS.neutral.grey1,
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <Text>Subtotal ({quantity} ticket{quantity !== 1 ? 's' : ''}):</Text>
            </div>
            <Title level={4} style={{ color: COLORS.primary.main, margin: 0 }}>
              {formatPrice(selectedTicketData?.price * quantity || 0)}
            </Title>
          </div>
        </Card>
      )}
    </>
  );
}