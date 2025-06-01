import { Card, Radio, Space, Tag, InputNumber, Typography, Alert } from "antd";
import { COLORS } from "../../components/colorscheme";

import  { 
  FootballSeatMap1, 
  FootballSeatMap2,
  FootballSeatMap3
} from "./seatmaps/FootballSeatmaps";

import { 
  CinemaSeatMap1,
  CinemaSeatMap2,
  CinemaSeatMap3
} from "./seatmaps/CinemaSeatmaps";

import { 
  TheaterSeatMap1,
  TheaterSeatMap2,
  TheaterSeatMap3
} from "./seatmaps/TheaterSeatmaps";

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
  const requiresSeatMap = () => {
    if (!event?.type) return false;

    const categoriesWithSeats = ['cinema', 'theater', 'football', 'sports'];
    return categoriesWithSeats.includes(event.type.toLowerCase());
  };

  const getTotalFromSeats = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleSeatSelection = (seats) => {
    onSeatSelect(seats);
    setQuantity(seats.length);
  };

  const renderSeatMap = () => {
    const seatMapId = event?.location?.seatMapId;

    const seatMapProps = {
      selectedSeats,
      onSeatSelect: handleSeatSelection,
      maxSeats: 6,
      occupiedSeats,
      formatPrice,
    };

    switch (seatMapId) {
      case 'football1':
        return <FootballSeatMap1 {...seatMapProps} />;
      case 'football2':
        return <FootballSeatMap2 {...seatMapProps} />;
      case 'football3':
        return <FootballSeatMap3 {...seatMapProps} />;
      
      case 'cinema1':
        return <CinemaSeatMap1 {...seatMapProps} />;
      case 'cinema2':
        return <CinemaSeatMap2 {...seatMapProps} />;
      case 'cinema3':
        return <CinemaSeatMap3 {...seatMapProps} />;

      case 'theater1':
        return <TheaterSeatMap1 {...seatMapProps} />;
      case 'theater2':
        return <TheaterSeatMap2 {...seatMapProps} />;
      case 'theater3':
        return <TheaterSeatMap3 {...seatMapProps} />;
      
      default:
        return <div>No hay un mapa de asientos para esta ubicación.</div>;
    }
  };

  return (
    <>
      {/* Solo mostrar selección de tipos de tickets cuando NO hay mapa de asientos */}
      {!requiresSeatMap() && (
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

      {requiresSeatMap() ? (
        <>
          <Alert
            message="Selección de asientos"
            description={`Haz clic en los asientos que deseas comprar. Puedes seleccionar hasta 6 asientos. ${selectedSeats.length > 0 ? `Total: ${formatPrice(getTotalFromSeats())}` : ''}`}
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
                  {formatPrice(getTotalFromSeats())}
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
              {formatPrice(ticketTypes.find(t => t.key === selectedTicketType)?.price * quantity)}
            </Title>
          </div>
        </Card>
      )}
    </>
  );
}