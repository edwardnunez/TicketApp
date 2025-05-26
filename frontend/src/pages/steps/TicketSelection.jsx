import { Card, Radio, Space, Tag, InputNumber, Typography, Alert } from "antd";
import { COLORS } from "../../components/colorscheme";
import SeatMap from "./seatmaps/Seatmap";
const { Title, Text } = Typography;

export default function SelectTickets({ 
  selectedTicketType, setSelectedTicketType, 
  quantity, setQuantity, 
  ticketTypes, formatPrice,
  //para el mapa de asientos
  event,
  selectedSeats = [],
  onSeatSelect,
  occupiedSeats = []
}) {
  // Determinar si el evento requiere mapa de asientos
  const requiresSeatMap = () => {
    if (!event?.category) return false;
    
    const categoriesWithSeats = ['cinema', 'theater', 'football', 'sports'];
    return categoriesWithSeats.includes(event.category.toLowerCase());
  };

  // Determinar el tipo de venue para el mapa
  const getVenueType = () => {
    const category = event?.category?.toLowerCase();
    switch (category) {
      case 'cinema':
      case 'movie':
        return 'cinema';
      case 'theater':
      case 'teatro':
      case 'musical':
        return 'theater';
      case 'football':
      case 'soccer':
      case 'futbol':
        return 'football';
      case 'sports':
      case 'deportes':
        return 'football'; // Por defecto usamos el layout de estadio
      default:
        return 'cinema'; // Por defecto
    }
  };

  // Calcular precio total cuando hay asientos seleccionados
  const getTotalFromSeats = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  // Manejar cambio en la selección de asientos
  const handleSeatSelection = (seats) => {
    onSeatSelect(seats);
    // Actualizar cantidad basada en asientos seleccionados
    setQuantity(seats.length);
  };

  return (
    <>
      {/* Selección de tipo de ticket (solo si no hay mapa de asientos o hay opciones múltiples) */}
      {(!requiresSeatMap() || ticketTypes.length > 1) && (
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

      {/* Mapa de asientos o selector de cantidad */}
      {requiresSeatMap() ? (
        <>
          <Alert
            message="Selección de asientos"
            description={`Haz clic en los asientos que deseas comprar. Puedes seleccionar hasta 6 asientos. ${selectedSeats.length > 0 ? `Total: ${formatPrice(getTotalFromSeats())}` : ''}`}
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />
          
          <SeatMap
            venueType={getVenueType()}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelection}
            maxSeats={6}
            occupiedSeats={occupiedSeats}
            formatPrice={formatPrice}
          />
          
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
                  {formatPrice(getTotalFromSeats())}
                </Title>
              </div>
            </Card>
          )}
        </>
      ) : (
        // Selector tradicional de cantidad para eventos sin asientos numerados
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
              {formatPrice(ticketTypes.find(t => t.key === selectedTicketType)?.price * quantity)}
            </Title>
          </div>
        </Card>
      )}
    </>
  );
}