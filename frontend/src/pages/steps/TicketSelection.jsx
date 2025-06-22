import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Radio, Space, Tag, InputNumber, Typography, Alert, Spin, Button } from "antd";
import { COLORS } from "../../components/colorscheme";
import GenericSeatMapRenderer from "./seatmaps/GenericSeatRenderer";
import axios from 'axios';

const { Title, Text } = Typography;

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
  
  const gatewayUrl = process.env.REACT_API_ENDPOINT || "http://localhost:8000";

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

  // Extraer asientos y secciones bloqueados del evento
  const blockedSeats = useMemo(() => {
    return event?.seatMapConfiguration?.blockedSeats || [];
  }, [event?.seatMapConfiguration?.blockedSeats]);

  const blockedSections = useMemo(() => {
    return event?.seatMapConfiguration?.blockedSections || [];
  }, [event?.seatMapConfiguration?.blockedSections]);

  // Memoize the total calculation
  const totalFromSeats = useMemo(() => {
    return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
  }, [selectedSeats]);

  // Simplified handleSeatSelection - just pass through the seats with their prices
  const handleSeatSelection = useCallback((seats) => {
    // Los asientos ya vienen con el precio correcto calculado desde SeatRenderer
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
        const response = await axios.get(`${gatewayUrl}/seatmaps/${seatMapId}`);
        const seatMapData = response.data;
        
        // Validar compatibilidad
        if (!validateSeatMapCompatibility(seatMapData, event.type)) {
          setError(`El mapa de asientos tipo "${seatMapData.type}" no es compatible con eventos de tipo "${event.type}"`);
          setSeatMapData(null);
          return;
        }
        
        // Aplicar precios del evento si están disponibles
        let updatedSeatMapData = { ...seatMapData };
        
        if (event.usesSectionPricing && event.sectionPricing?.length > 0) {
          updatedSeatMapData.sections = seatMapData.sections.map(section => {
            const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
            
            if (eventSectionPricing) {
              // Si usa pricing por filas, usar el precio base como referencia
              const displayPrice = event.usesRowPricing && eventSectionPricing.variablePrice > 0
                ? eventSectionPricing.basePrice
                : eventSectionPricing.basePrice || eventSectionPricing.price || section.price;
              
              return { 
                ...section, 
                price: displayPrice,
                // Agregar información adicional para el cálculo de precios por fila
                sectionPricing: eventSectionPricing
              };
            }
            
            return section;
          });
        }
        
        setSeatMapData(updatedSeatMapData);
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
  }, [event?.location?.seatMapId, event?.type, event?.usesSectionPricing, event?.sectionPricing, requiresSeatMap, validateSeatMapCompatibility]);

  useEffect(() => {
    // Limpiar asientos seleccionados cuando cambia el evento
    if (selectedSeats.length > 0) {
      onSeatSelect([]);
      setQuantity(0);
    }
  }, [event?.id]); // Solo cuando cambia el ID del evento

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

    // Usar el GenericSeatMapRenderer pasando los asientos y secciones bloqueados
    return (
      <GenericSeatMapRenderer
        seatMapData={seatMapData}
        selectedSeats={selectedSeats}
        onSeatSelect={handleSeatSelection}
        maxSeats={6}
        occupiedSeats={occupiedSeats}
        blockedSeats={blockedSeats}
        blockedSections={blockedSections}
        formatPrice={formatPrice}
        event={event} // Pasar el evento para el cálculo de precios
      />
    );
  }, [loading, error, seatMapData, selectedSeats, handleSeatSelection, occupiedSeats, blockedSeats, blockedSections, formatPrice, event]);


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
                        {formatPrice(seat.price || 0)}
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