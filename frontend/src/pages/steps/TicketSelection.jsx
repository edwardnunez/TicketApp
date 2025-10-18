import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, InputNumber, Typography, Alert, Spin, Button } from "antd";
import { COLORS } from "../../components/colorscheme";
import GenericSeatRenderer from "./seatmaps/renderers/GenericSeatRenderer";
import ResponsiveSeatRenderer from "./seatmaps/renderers/ResponsiveSeatRenderer";
import axios from 'axios';

const { Title, Text } = Typography;

// CSS para la animación del spinner
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inyectar CSS si no existe
if (!document.getElementById('spin-animation-ticket-selection')) {
  const style = document.createElement('style');
  style.id = 'spin-animation-ticket-selection';
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

export default function SelectTickets({ 
  quantity, setQuantity, 
  formatPrice,
  event,
  selectedSeats = [],
  onSeatSelect,
  occupiedSeats
}) {
  const [seatMapData, setSeatMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [ticketAvailability, setTicketAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const memoizedEvent = useMemo(() => event, [event]);
  
  // Ref para trackear el evento anterior y evitar limpiezas innecesarias
  const previousEventId = useRef(null);
  
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  // Hook para detectar si es móvil o tablet
  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024); // 1024px como breakpoint para tablet
    };
    
    handleResize(); // Ejecutar al montar
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para obtener disponibilidad de tickets
  const fetchTicketAvailability = async () => {
    if (!memoizedEvent?._id) return;
    
    setAvailabilityLoading(true);
    try {
      const response = await axios.get(`${gatewayUrl}/tickets/event/${memoizedEvent._id}`);
      const ticketStats = response.data.statistics || [];
      
      // Procesar estadísticas para obtener disponibilidad
      let soldTickets = 0;
      let pendingTickets = 0;
      
      ticketStats.forEach(stat => {
        if (stat._id === 'paid') {
          soldTickets = stat.totalTickets || 0;
        } else if (stat._id === 'pending') {
          pendingTickets = stat.totalTickets || 0;
        }
      });

      const totalCapacity = memoizedEvent?.capacity || 0;
      const availableTickets = Math.max(0, totalCapacity - soldTickets - pendingTickets);
      const isSoldOut = availableTickets <= 0;
      const salesPercentage = totalCapacity > 0 ? Math.round(((soldTickets + pendingTickets) / totalCapacity) * 100) : 0;

      setTicketAvailability({
        eventId: memoizedEvent._id,
        totalCapacity,
        soldTickets,
        pendingTickets,
        availableTickets,
        isSoldOut,
        salesPercentage,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching ticket availability:", error);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Calcular entradas disponibles usando datos en tiempo real
  const availableTickets = useMemo(() => {
    if (ticketAvailability) {
      return ticketAvailability.availableTickets || 0;
    }
    
    // Fallback a datos del evento si no hay disponibilidad en tiempo real
    if (!memoizedEvent) return 0;
    const capacity = memoizedEvent.capacity || 0;
    const soldTickets = memoizedEvent.soldTickets || 0;
    
    return Math.max(0, capacity - soldTickets);
  }, [memoizedEvent, ticketAvailability]);

  // Verificar si el evento está agotado
  const isSoldOut = useMemo(() => {
    return availableTickets <= 0;
  }, [availableTickets]);

  // Calcular el máximo de tickets que se pueden seleccionar
  const maxSelectableTickets = useMemo(() => {
    return Math.min(6, availableTickets); // Máximo 6 o las disponibles, lo que sea menor
  }, [availableTickets]);

  const requiresSeatMap = useCallback(() => {
    if (!memoizedEvent?.type) return false;
    
    // Si el evento tiene seatMapId configurado, requiere mapa
    if (memoizedEvent?.location?.seatMapId) return true;
    
    // Los conciertos pueden tener o no mapa según la configuración
    if (memoizedEvent.type.toLowerCase() === 'concert' || memoizedEvent.type.toLowerCase() === 'concierto') {
      return !!memoizedEvent?.location?.seatMapId;
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
    
    return Object.keys(eventToSeatMapType).includes(memoizedEvent.type.toLowerCase());
  }, [memoizedEvent?.type, memoizedEvent?.location?.seatMapId]);

  const validateSeatMapCompatibility = useCallback((seatMapData, eventType) => {
    if (!seatMapData || !eventType) {
      return false;
    }

    const seatMapType = seatMapData.type?.toLowerCase();
    const normalizedEventType = eventType.toLowerCase();

    // Define compatibility mappings
    const compatibilityMappings = {
      cinema: ['cinema'],
      theater: ['theater', 'theatre', 'concert', 'concierto'],
      theatre: ['theater', 'theatre', 'concert', 'concierto'],
      stadium: ['football', 'soccer', 'sports', 'stadium', 'concert', 'concierto'],
      football: ['football', 'soccer', 'sports', 'stadium', 'concert', 'concierto'],
      sports: ['football', 'soccer', 'sports', 'stadium', 'basketball', 'tennis', 'concert', 'concierto'],
      arena: ['concert', 'arena', 'concierto'],
      concert: ['concert', 'arena', 'concierto'],
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
      (seatMapType === 'football' && ['soccer', 'sports', 'concert', 'concierto'].includes(normalizedEventType)),
      (seatMapType === 'soccer' && ['football', 'sports', 'concert', 'concierto'].includes(normalizedEventType)),
      (seatMapType === 'concert' && ['concert', 'music', 'concierto'].includes(normalizedEventType)),
      (seatMapType === 'arena' && ['concert', 'music', 'concierto'].includes(normalizedEventType))
    ];

    return specialCases.some(condition => condition);
  }, []);

  // Extraer asientos y secciones bloqueados del evento
  const blockedSeats = useMemo(() => {
    return memoizedEvent?.seatMapConfiguration?.blockedSeats || [];
  }, [memoizedEvent?.seatMapConfiguration?.blockedSeats]);

  const blockedSections = useMemo(() => {
    return memoizedEvent?.seatMapConfiguration?.blockedSections || [];
  }, [memoizedEvent?.seatMapConfiguration?.blockedSections]);

  // Memoize the total calculation
  const totalFromSeats = useMemo(() => {
    return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
  }, [selectedSeats]);

  const handleSeatSelection = useCallback((seats) => {
    console.log('🎯 handleSeatSelection called with:', seats);
    console.log('🎯 maxSelectableTickets:', maxSelectableTickets);
    
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
      
      console.log('🎯 Calling onSeatSelect with:', seatsWithFullInfo);
      onSeatSelect(seatsWithFullInfo);
      setQuantity(seatsWithFullInfo.length);
    }, [onSeatSelect, setQuantity, maxSelectableTickets]);

  // Load seatmap data with proper dependencies
  useEffect(() => {
    const loadSeatMapData = async () => {
      const needsSeatMap = requiresSeatMap();
      const seatMapId = memoizedEvent?.location?.seatMapId;
      
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
        if (!validateSeatMapCompatibility(seatMapData, memoizedEvent.type)) {
          setError(`El mapa de asientos tipo "${seatMapData.type}" no es compatible con eventos de tipo "${memoizedEvent.type}"`);
          setSeatMapData(null);
          return;
        }
        
        // Aplicar precios del evento si están disponibles
        let updatedSeatMapData = { ...seatMapData };
        
        if (memoizedEvent.usesSectionPricing && memoizedEvent.sectionPricing?.length > 0) {
          updatedSeatMapData.sections = seatMapData.sections.map(section => {
            const eventSectionPricing = memoizedEvent.sectionPricing.find(sp => sp.sectionId === section.id);
            
            if (eventSectionPricing) {
              // Usar el precio por defecto de la sección
              const displayPrice = eventSectionPricing.defaultPrice || section.defaultPrice;
              
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
        
        // Log para depuración
        console.log('TicketSelection - Event pricing debug:', {
          eventId: memoizedEvent._id,
          usesSectionPricing: memoizedEvent.usesSectionPricing,
          usesRowPricing: memoizedEvent.usesRowPricing,
          sectionPricing: memoizedEvent.sectionPricing,
          updatedSeatMapData: updatedSeatMapData
        });
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
  }, [memoizedEvent, requiresSeatMap, validateSeatMapCompatibility, gatewayUrl]);

  // FIXED: Solo limpiar asientos cuando realmente cambia el evento, no cuando cambia la selección
  useEffect(() => {
    const currentEventId = memoizedEvent?._id;

    // Solo limpiar si el evento realmente cambió
    if (currentEventId && currentEventId !== previousEventId.current) {
      console.log('🔄 Event changed, clearing selected seats');
      onSeatSelect([]);
      setQuantity(0);
      previousEventId.current = currentEventId;

      // Cargar disponibilidad de tickets cuando cambia el evento
      fetchTicketAvailability();
    }
  }, [memoizedEvent?._id, memoizedEvent?.usesRowPricing, onSeatSelect, setQuantity]);

  // Configurar actualización automática de disponibilidad cada 30 segundos
  useEffect(() => {
    if (!memoizedEvent?._id) return;

    const interval = setInterval(() => {
      fetchTicketAvailability();
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [memoizedEvent?._id]);



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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text style={{ color: COLORS.neutral.grey4 }}>
            Entradas disponibles:
          </Text>
          {availabilityLoading && (
            <div style={{ 
              width: '12px', 
              height: '12px', 
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #1890ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginLeft: '8px'
            }} />
          )}
        </div>
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

    // Determinar qué renderer usar basado en el tamaño de pantalla
    const SeatMapComponent = isMobileOrTablet ? ResponsiveSeatRenderer : GenericSeatRenderer;

    return (
      <SeatMapComponent
        seatMapData={seatMapData}
        selectedSeats={selectedSeats}
        onSeatSelect={handleSeatSelection}
        maxSeats={maxSelectableTickets}
        occupiedSeats={occupiedSeats}
        blockedSeats={blockedSeats}
        blockedSections={blockedSections}
        formatPrice={formatPrice}
        event={memoizedEvent} // Pasar el evento para el cálculo de precios
      />
    );
  }, [loading, error, seatMapData, selectedSeats, handleSeatSelection, occupiedSeats, blockedSeats, blockedSections, formatPrice, memoizedEvent, maxSelectableTickets, isMobileOrTablet]);



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

          {/* Mostrar resumen de asientos seleccionados solo en desktop cuando no usa ResponsiveSeatRenderer */}
          {!isMobileOrTablet && selectedSeats.length > 0 && (
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
              {formatPrice(event?.price * quantity || 0)}
            </Title>
          </div>
        </Card>
      )}
    </>
  );
}