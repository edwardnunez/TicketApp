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

  // Calcular entradas disponibles
  const availableTickets = useMemo(() => {
    if (!event) return 0;
    
    const capacity = event.capacity || 0;
    const soldTickets = event.soldTickets || 0;
    
    return Math.max(0, capacity - soldTickets);
  }, [event?.capacity, event?.soldTickets]);

  // Verificar si el evento está agotado
  const isSoldOut = useMemo(() => {
    return availableTickets <= 0;
  }, [availableTickets]);

  // Calcular el máximo de tickets que se pueden seleccionar
  const maxSelectableTickets = useMemo(() => {
    return Math.min(6, availableTickets); // Máximo 6 o las disponibles, lo que sea menor
  }, [availableTickets]);

  const requiresSeatMap = useCallback(() => {
    if (!event?.type) return false;
    
    // Si el evento tiene seatMapId configurado, requiere mapa
    if (event?.location?.seatMapId) return true;
    
    // Los conciertos pueden tener o no mapa según la configuración
    if (event.type.toLowerCase() === 'concert' || event.type.toLowerCase() === 'concierto') {
      return !!event?.location?.seatMapId;
    }
    
    // Otros tipos que siempre requieren mapa
    const eventToSeatMapType = {
      'cinema': 'cinema',
      'theater': 'theater', 
      'theatre': 'theater',
      'football': 'football',
      'soccer': 'football',
      'sports': 'football',
      'stadium': 'football'
    };
    
    return Object.keys(eventToSeatMapType).includes(event.type.toLowerCase());
  }, [event?.type, event?.location?.seatMapId]);

  const validateSeatMapCompatibility = useCallback((seatMapData, eventType) => {
    if (!seatMapData || !eventType) {
      return false;
    }

    const seatMapType = seatMapData.type?.toLowerCase();
    const normalizedEventType = eventType.toLowerCase();

    // Define compatibility mappings
    const compatibilityMappings = {
      cinema: ['cinema'],
      theater: ['theater', 'theatre'],
      theatre: ['theater', 'theatre'],
      stadium: ['football', 'soccer', 'sports', 'stadium'],
      football: ['football', 'soccer', 'sports', 'stadium'],
      sports: ['football', 'soccer', 'sports', 'stadium', 'basketball', 'tennis'],
      arena: ['concert', 'arena'],
      concert: ['concert', 'arena'],
    };

    if (compatibilityMappings[seatMapType]) {
      return compatibilityMappings[seatMapType].includes(normalizedEventType);
    }

    if (seatMapType === normalizedEventType) {
      return true;
    }

    const specialCases = [
      (seatMapType === 'theater' && ['theatre', 'concert', 'concierto'].includes(normalizedEventType)),
      (seatMapType === 'theatre' && ['theater', 'concert', 'concierto'].includes(normalizedEventType)),
      (seatMapType === 'football' && ['soccer', 'sports'].includes(normalizedEventType)),
      (seatMapType === 'soccer' && ['football', 'sports'].includes(normalizedEventType)),
      (seatMapType === 'concert' && ['concert', 'music'].includes(normalizedEventType)),
      (seatMapType === 'arena' && ['concert', 'music'].includes(normalizedEventType))
    ];

    return specialCases.some(condition => condition);
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
    // Limitar la selección según disponibilidad
    const limitedSeats = seats.slice(0, maxSelectableTickets);
    
    const seatsWithFullInfo = limitedSeats.map(seat => ({
        ...seat,
        id: seat.id || `${seat.section}-${seat.row}-${seat.seat}`,
        seatId: seat.seatId || `${seat.section}-${seat.row}-${seat.seat}`,
        price: seat.price || 0,
        section: seat.section,
        row: seat.row,
        seat: seat.seat
      }));
      
      onSeatSelect(seatsWithFullInfo);
      setQuantity(seatsWithFullInfo.length);
    }, [onSeatSelect, setQuantity, maxSelectableTickets]);

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

  useEffect(() => {
    const needsMap = requiresSeatMap();
    
    if (!needsMap && ticketTypes.length > 0 && !selectedTicketType) {
      setSelectedTicketType(ticketTypes[0].key);
    }
  }, [requiresSeatMap, ticketTypes, selectedTicketType, setSelectedTicketType]);

  // Ajustar cantidad si excede las disponibles
  useEffect(() => {
    if (quantity > maxSelectableTickets) {
      setQuantity(maxSelectableTickets);
    }
  }, [quantity, maxSelectableTickets, setQuantity]);

  const renderAvailabilityAlert = () => {
    if (isSoldOut) {
      return (
        <Alert
          message="Evento agotado"
          description="Lo sentimos, este evento ya no tiene entradas disponibles."
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      );
    }

    if (availableTickets <= 10) {
      return (
        <Alert
          message="¡Últimas entradas!"
          description={`Solo quedan ${availableTickets} entrada${availableTickets !== 1 ? 's' : ''} disponible${availableTickets !== 1 ? 's' : ''}.`}
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      );
    }

    return (
      <div style={{ 
        marginBottom: '24px', 
        padding: '12px', 
        backgroundColor: COLORS.neutral.grey1, 
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text style={{ color: COLORS.neutral.grey4 }}>
          Entradas disponibles:
        </Text>
        <Text strong style={{ color: COLORS.primary.main }}>
          {availableTickets}
        </Text>
      </div>
    );
  };

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
        maxSeats={maxSelectableTickets}
        occupiedSeats={occupiedSeats}
        blockedSeats={blockedSeats}
        blockedSections={blockedSections}
        formatPrice={formatPrice}
        event={event} // Pasar el evento para el cálculo de precios
      />
    );
  }, [loading, error, seatMapData, selectedSeats, handleSeatSelection, occupiedSeats, blockedSeats, blockedSections, formatPrice, event, maxSelectableTickets]);

  // Memoize the selected ticket type data
  const selectedTicketData = useMemo(() => {
    return ticketTypes.find(t => t.key === selectedTicketType);
  }, [ticketTypes, selectedTicketType]);

  // Check if seat map is required
  const needsSeatMap = requiresSeatMap();

  // Si el evento está agotado, mostrar solo el mensaje de agotado
  if (isSoldOut) {
    return (
      <>
        {renderAvailabilityAlert()}
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Title level={3} style={{ color: COLORS.neutral.grey4 }}>
            Evento agotado
          </Title>
          <Text style={{ color: COLORS.neutral.grey4 }}>
            Te recomendamos que revises otros eventos disponibles
          </Text>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Mostrar información de disponibilidad */}
      {renderAvailabilityAlert()}

      {/* Mostrar selección de tipo de ticket cuando NO hay mapa de asientos */}
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
                          {ticket.label}
                        </Title>
                        <Text style={{ color: COLORS.neutral.grey4 }}>
                          Entrada general
                        </Text>
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

      {/* Mostrar mapa de asientos cuando se requiere */}
      {needsSeatMap ? (
        <>
          <Alert
            message="Selección de asientos"
            description={`Haz clic en los asientos que deseas comprar. Puedes seleccionar hasta ${maxSelectableTickets} asientos. ${selectedSeats.length > 0 ? `Total: ${formatPrice(totalFromSeats)}` : ''}`}
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
                        <Text strong>{seat.section}</Text><br />
                        <Text style={{ color: COLORS.neutral.grey4 }}>
                          {seat.row != null && seat.seat != null
                            ? `Fila ${seat.row}, Asiento ${seat.seat}`
                            : `Entrada general`}
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ color: COLORS.primary.main }}>
                          {formatPrice(seat.price || 0)}
                        </Text><br />
                        <Button 
                          size="small" 
                          type="link" 
                          danger 
                          onClick={() => {
                            const newSeats = selectedSeats.filter(s => s.id !== seat.id);
                            onSeatSelect(newSeats);
                            setQuantity(newSeats.length);
                          }}
                        >
                          Quitar
                        </Button>
                      </div>
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
        /* Pantalla alternativa para eventos sin mapa de asientos */
        <Card>
          <Title level={4} style={{ color: COLORS.neutral.darker, marginBottom: '16px' }}>
            Cantidad de tickets
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text>Cantidad:</Text>
            <InputNumber
              min={1}
              max={maxSelectableTickets}
              value={quantity}
              onChange={setQuantity}
              size="large"
              style={{ width: '120px' }}
            />
            <Text style={{ color: COLORS.neutral.grey4 }}>
              (Máximo {maxSelectableTickets} tickets por compra)
            </Text>
          </div>

          {selectedTicketData && (
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
                {formatPrice(selectedTicketData.price * quantity || 0)}
              </Title>
            </div>
          )}
        </Card>
      )}
    </>
  );
}