import React, { useState, useMemo, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Tag, 
  Badge, 
  Row,
  Col,
  Progress,
  Empty
} from 'antd';
import { 
  DownOutlined, 
  RightOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { COLORS } from './colorscheme';

const { Title, Text } = Typography;

const OptimizedSeatNavigation = ({
  sections = [],
  selectedSeats = [],
  onSeatSelect,
  onSectionSelect,
  formatPrice,
  maxSeats = 6,
  event = null,
  style = {}
}) => {
  const [expandedSections, setExpandedSections] = useState(new Set());

  // Función para obtener el precio correcto de la sección
  const getSectionPrice = useCallback((section) => {
    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
      if (eventSectionPricing) {
        return eventSectionPricing.defaultPrice || section.defaultPrice || 0;
      }
    }
    return section.defaultPrice || 0;
  }, [event]);

  // Calcular estadísticas agregadas
  const sectionStats = useMemo(() => {
    return sections.map(section => {
      const totalSeats = section.hasNumberedSeats 
        ? (section.rows * section.seatsPerRow)
        : (section.totalCapacity || 0);
      
      const occupiedSeats = Array.isArray(section.occupiedSeats) ? section.occupiedSeats.length : (section.occupiedSeats || 0);
      const blockedSeats = Array.isArray(section.blockedSeats) ? section.blockedSeats.length : (section.blockedSeats || 0);
      const availableSeats = Math.max(0, totalSeats - occupiedSeats - blockedSeats);
      
      const correctPrice = getSectionPrice(section);
      
      return {
        ...section,
        totalSeats,
        occupiedSeats,
        blockedSeats,
        availableSeats,
        occupancyRate: totalSeats > 0 ? ((occupiedSeats + blockedSeats) / totalSeats) * 100 : 0,
        isFullyOccupied: availableSeats === 0,
        isBlocked: section.isBlocked || false,
        defaultPrice: correctPrice,
        priceRange: section.priceRange || [correctPrice, correctPrice],
        selectedCount: selectedSeats.filter(seat => seat.sectionId === section.id).length
      };
    });
  }, [sections, selectedSeats, getSectionPrice]);

  // Generar asientos para una sección
  const generateSeatsForSection = (section) => {
    if (!section.hasNumberedSeats) {
      // Entrada general
      return [{
        id: `${section.id}-GA`,
        sectionId: section.id,
        sectionName: section.name,
        type: 'general',
        price: getSectionPrice(section),
        isSelected: selectedSeats.some(seat => seat.sectionId === section.id),
        isAvailable: !section.isBlocked && section.availableSeats > 0,
        totalCapacity: section.totalCapacity || 0,
        availableCount: section.availableSeats
      }];
    }

    // Asientos numerados - solo mostrar algunos ejemplos
    const seats = [];
    const maxSeatsToShow = 20; // Limitar para no saturar la interfaz
    let seatCount = 0;

    for (let row = 1; row <= section.rows && seatCount < maxSeatsToShow; row++) {
      for (let seat = 1; seat <= section.seatsPerRow && seatCount < maxSeatsToShow; seat++) {
        const seatId = `${section.id}-${row}-${seat}`;
        const isSelected = selectedSeats.some(s => s.id === seatId);
        const isOccupied = Array.isArray(section.occupiedSeats) ? section.occupiedSeats.includes(seatId) : false;
        const isBlocked = Array.isArray(section.blockedSeats) ? section.blockedSeats.includes(seatId) : section.isBlocked || false;
        
        seats.push({
          id: seatId,
          sectionId: section.id,
          sectionName: section.name,
          row,
          seat,
          type: 'numbered',
          price: getSectionPrice(section),
          isSelected,
          isOccupied,
          isBlocked,
          isAvailable: !isOccupied && !isBlocked
        });
        
        seatCount++;
      }
    }

    return seats;
  };

  const getSectionStatus = (section) => {
    if (section.isBlocked) {
      return { 
        status: 'blocked', 
        text: 'Bloqueada', 
        color: '#ff4d4f', 
        icon: <LockOutlined />,
        description: 'Esta sección no está disponible para la venta'
      };
    }
    if (section.isFullyOccupied) {
      return { 
        status: 'soldout', 
        text: 'Agotada', 
        color: '#faad14', 
        icon: <ExclamationCircleOutlined />,
        description: 'No hay asientos disponibles en esta sección'
      };
    }
    if (section.occupancyRate > 80) {
      return { 
        status: 'limited', 
        text: 'Pocas disponibles', 
        color: '#faad14', 
        icon: <ExclamationCircleOutlined />,
        description: `Solo quedan ${section.availableSeats} asientos disponibles`
      };
    }
    return { 
      status: 'available', 
      text: 'Disponible', 
      color: '#52c41a', 
      icon: <CheckCircleOutlined />,
      description: `${section.availableSeats} asientos disponibles`
    };
  };

  const handleSeatClick = (seat) => {
    if (!seat.isAvailable) return;

    if (seat.isSelected) {
      // Deseleccionar
      const newSeats = selectedSeats.filter(s => s.id !== seat.id);
      onSeatSelect(newSeats);
    } else if (selectedSeats.length < maxSeats) {
      // Seleccionar
      const seatData = {
        id: seat.id,
        section: seat.sectionName,
        sectionId: seat.sectionId,
        row: seat.row,
        seat: seat.seat,
        price: seat.price,
        isGeneralAdmission: seat.type === 'general'
      };
      onSeatSelect([...selectedSeats, seatData]);
    }
  };

  const handleSectionToggle = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderSeatItem = (seat) => {
    const isSelected = seat.isSelected;
    const isAvailable = seat.isAvailable;
    
    return (
      <div
        key={seat.id}
        style={{
          padding: '8px 12px',
          margin: '4px',
          borderRadius: '6px',
          border: `2px solid ${isSelected ? COLORS.primary.main : isAvailable ? '#d9d9d9' : '#ff4d4f'}`,
          backgroundColor: isSelected ? COLORS.primary.main : isAvailable ? 'white' : '#f5f5f5',
          cursor: isAvailable ? 'pointer' : 'not-allowed',
          opacity: isAvailable ? 1 : 0.6,
          transition: 'all 0.2s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => handleSeatClick(seat)}
      >
        <div>
          <Text style={{ 
            color: isSelected ? 'white' : isAvailable ? 'inherit' : '#999',
            fontWeight: '500'
          }}>
            {seat.type === 'general' 
              ? `Entrada General (${seat.availableCount} disponibles)`
              : `Fila ${seat.row}, Asiento ${seat.seat}`
            }
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text style={{ 
            color: isSelected ? 'white' : COLORS.primary.main,
            fontWeight: 'bold'
          }}>
            {formatPrice(seat.price)}
          </Text>
          {isSelected && <CheckCircleOutlined style={{ color: 'white' }} />}
        </div>
      </div>
    );
  };

  const renderSectionCard = (section) => {
    const status = getSectionStatus(section);
    const isExpanded = expandedSections.has(section.id);
    const seats = generateSeatsForSection(section);

    return (
      <Card
        key={section.id}
        style={{
          marginBottom: '12px',
          border: `2px solid ${status.color}`,
          borderRadius: '12px',
          opacity: section.isBlocked ? 0.7 : 1
        }}
      >
        {/* Header de la sección */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: status.color,
              borderRadius: '50%'
            }} />
            <div>
              <Title level={5} style={{ margin: 0, color: status.color }}>
                {section.name}
              </Title>
              <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                {status.description}
              </Text>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag color={status.color} icon={status.icon}>
              {status.text}
            </Tag>
            <Text strong style={{ color: COLORS.primary.main }}>
              {formatPrice(section.defaultPrice || 0)}
            </Text>
          </div>
        </div>

        {/* Barra de ocupación */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <Text style={{ fontSize: '12px' }}>Ocupación</Text>
            <Text style={{ fontSize: '12px' }}>
              {section.availableSeats} / {section.totalSeats} disponibles
            </Text>
          </div>
          <Progress
            percent={section.occupancyRate}
            strokeColor={status.color}
            size="small"
            showInfo={false}
          />
        </div>

        {/* Información de la sección */}
        <Row gutter={[8, 8]} style={{ marginBottom: '12px' }}>
          <Col span={12}>
            <Text style={{ fontSize: '12px', color: COLORS.neutral.grey4 }}>
              {section.hasNumberedSeats 
                ? `${section.rows} filas × ${section.seatsPerRow} asientos`
                : `Capacidad: ${section.totalCapacity} personas`
              }
            </Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            {section.selectedCount > 0 && (
              <Badge count={section.selectedCount} style={{ backgroundColor: COLORS.primary.main }} />
            )}
          </Col>
        </Row>

        {/* Botón para expandir/contraer */}
        <Button
          type="text"
          block
          icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
          onClick={() => handleSectionToggle(section.id)}
          disabled={section.isBlocked || section.isFullyOccupied}
          style={{ 
            color: status.color,
            border: `1px solid ${status.color}`,
            borderRadius: '6px'
          }}
        >
          {isExpanded ? 'Ocultar asientos' : 'Ver asientos disponibles'}
        </Button>

        {/* Asientos expandidos */}
        {isExpanded && (
          <div style={{ marginTop: '12px', maxHeight: '300px', overflowY: 'auto' }}>
            {seats.length === 0 ? (
              <Empty 
                description="No hay asientos disponibles" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {seats.map(seat => renderSeatItem(seat))}
              </div>
            )}
            
            {seats.length >= 20 && (
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                  Mostrando los primeros 20 asientos. Usa el mapa para ver todos.
                </Text>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  if (sectionStats.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px' }}>
        <Empty 
          description="No hay secciones disponibles" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div style={style}>
      {/* Resumen general */}
      <Card style={{ marginBottom: '16px', backgroundColor: COLORS.neutral.grey1 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ margin: 0, color: COLORS.primary.main }}>
                {sectionStats.length}
              </Title>
              <Text>Secciones</Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                {sectionStats.reduce((total, section) => total + section.availableSeats, 0)}
              </Title>
              <Text>Asientos disponibles</Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ margin: 0, color: COLORS.primary.main }}>
                {formatPrice(Math.min(...sectionStats.map(s => s.defaultPrice || 0)))}
              </Title>
              <Text>Precio desde</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Lista de secciones */}
      <div>
        {sectionStats.map(section => renderSectionCard(section))}
      </div>
    </div>
  );
};

export default OptimizedSeatNavigation;