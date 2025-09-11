import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Divider, Alert, notification, Row, Col, Tag } from 'antd';
import { PlayCircleOutlined, EditOutlined, EyeOutlined, BugOutlined } from '@ant-design/icons';
import { COLORS } from '../../../components/colorscheme';
import AdaptiveSeatMapRenderer from './AdaptiveSeatMapRenderer';

const { Title, Text, Paragraph } = Typography;

const SeatMapExample = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [seatMapData, setSeatMapData] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Datos de ejemplo para un estadio
  const exampleSeatMapData = {
    id: 'stadium_example',
    name: 'Estadio de Ejemplo',
    type: 'stadium',
    config: {
      venueName: 'Estadio Santiago Bernabéu',
      stadiumName: 'Estadio Santiago Bernabéu',
      fieldDimensions: {
        width: 400,
        height: 260
      }
    },
    sections: [
      {
        id: 'tribuna_norte',
        name: 'Tribuna Norte',
        position: 'north',
        rows: 8,
        seatsPerRow: 25,
        color: '#1890ff',
        defaultPrice: 50,
        hasNumberedSeats: true,
        order: 1
      },
      {
        id: 'tribuna_sur',
        name: 'Tribuna Sur',
        position: 'south',
        rows: 8,
        seatsPerRow: 25,
        color: '#52c41a',
        defaultPrice: 45,
        hasNumberedSeats: true,
        order: 2
      },
      {
        id: 'tribuna_este',
        name: 'Tribuna Este',
        position: 'east',
        rows: 6,
        seatsPerRow: 30,
        color: '#fa8c16',
        defaultPrice: 40,
        hasNumberedSeats: true,
        order: 3
      },
      {
        id: 'tribuna_oeste',
        name: 'Tribuna Oeste',
        position: 'west',
        rows: 6,
        seatsPerRow: 30,
        color: '#eb2f96',
        defaultPrice: 40,
        hasNumberedSeats: true,
        order: 4
      },
      {
        id: 'vip_section',
        name: 'Sección VIP',
        position: 'vip',
        rows: 4,
        seatsPerRow: 15,
        color: '#722ed1',
        defaultPrice: 150,
        hasNumberedSeats: true,
        order: 5
      }
    ]
  };

  // Datos de ejemplo para un cine
  const cinemaSeatMapData = {
    id: 'cinema_example',
    name: 'Cine de Ejemplo',
    type: 'cinema',
    config: {
      venueName: 'Cine Gran Vía',
      cinemaName: 'Cine Gran Vía',
      screenWidth: 400
    },
    sections: [
      {
        id: 'premium',
        name: 'Premium',
        position: 'front',
        rows: 3,
        seatsPerRow: 20,
        color: '#722ed1',
        defaultPrice: 15,
        hasNumberedSeats: true,
        order: 1
      },
      {
        id: 'front',
        name: 'Frente',
        position: 'front',
        rows: 5,
        seatsPerRow: 25,
        color: '#1890ff',
        defaultPrice: 12,
        hasNumberedSeats: true,
        order: 2
      },
      {
        id: 'middle',
        name: 'Centro',
        position: 'middle',
        rows: 6,
        seatsPerRow: 30,
        color: '#52c41a',
        defaultPrice: 10,
        hasNumberedSeats: true,
        order: 3
      },
      {
        id: 'back',
        name: 'Atrás',
        position: 'back',
        rows: 4,
        seatsPerRow: 25,
        color: '#fa8c16',
        defaultPrice: 8,
        hasNumberedSeats: true,
        order: 4
      }
    ]
  };

  // Datos de ejemplo para un concierto
  const concertSeatMapData = {
    id: 'concert_example',
    name: 'Concierto de Ejemplo',
    type: 'concert',
    config: {
      venueName: 'Palacio de los Deportes',
      stageWidth: 300,
      stageHeight: 80
    },
    sections: [
      {
        id: 'pista',
        name: 'Pista',
        position: 'center',
        rows: 0,
        seatsPerRow: 0,
        color: '#ff4d4f',
        defaultPrice: 80,
        hasNumberedSeats: false,
        totalCapacity: 500,
        order: 1
      },
      {
        id: 'grada_baja',
        name: 'Grada Baja',
        position: 'front',
        rows: 8,
        seatsPerRow: 20,
        color: '#1890ff',
        defaultPrice: 60,
        hasNumberedSeats: true,
        order: 2
      },
      {
        id: 'grada_media',
        name: 'Grada Media',
        position: 'middle',
        rows: 6,
        seatsPerRow: 25,
        color: '#52c41a',
        defaultPrice: 45,
        hasNumberedSeats: true,
        order: 3
      },
      {
        id: 'grada_alta',
        name: 'Grada Alta',
        position: 'back',
        rows: 4,
        seatsPerRow: 30,
        color: '#fa8c16',
        defaultPrice: 30,
        hasNumberedSeats: true,
        order: 4
      }
    ]
  };

  useEffect(() => {
    // Cargar datos de ejemplo
    setSeatMapData(exampleSeatMapData);
  }, []);

  const handleSeatSelect = (seats) => {
    setSelectedSeats(seats);
    console.log('Asientos seleccionados:', seats);
  };

  const handleSeatMapUpdate = (updatedData) => {
    setSeatMapData(updatedData);
    notification.success({
      message: 'Mapa actualizado',
      description: 'Los cambios se han guardado correctamente'
    });
  };

  const formatPrice = (price) => `$${price}`;

  const loadExample = (type) => {
    switch (type) {
      case 'stadium':
        setSeatMapData(exampleSeatMapData);
        break;
      case 'cinema':
        setSeatMapData(cinemaSeatMapData);
        break;
      case 'concert':
        setSeatMapData(concertSeatMapData);
        break;
      default:
        setSeatMapData(exampleSeatMapData);
    }
    setSelectedSeats([]);
    setEditMode(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card style={{ marginBottom: '20px' }}>
        <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
          Sistema de Mapas de Asientos Adaptativo
        </Title>
        <Paragraph style={{ color: COLORS.neutral.grey4, margin: 0 }}>
          Demostración del sistema completo de mapas de asientos con adaptabilidad total a dispositivos móviles, 
          tablets y escritorios, incluyendo modo de edición profesional.
        </Paragraph>
      </Card>

      {/* Controles de ejemplo */}
      <Card style={{ marginBottom: '20px' }}>
        <Title level={4} style={{ margin: 0, marginBottom: '16px' }}>
          Ejemplos de Mapas
        </Title>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={() => loadExample('stadium')}
          >
            Estadio
          </Button>
          <Button 
            icon={<PlayCircleOutlined />}
            onClick={() => loadExample('cinema')}
          >
            Cine
          </Button>
          <Button 
            icon={<PlayCircleOutlined />}
            onClick={() => loadExample('concert')}
          >
            Concierto
          </Button>
        </Space>
        
        <Divider />
        
        <Space>
          <Button 
            type={editMode ? 'primary' : 'default'}
            icon={<EditOutlined />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Salir del Editor' : 'Modo de Edición'}
          </Button>
          <Button 
            icon={<EyeOutlined />}
            onClick={() => {
              notification.info({
                message: 'Información del mapa',
                description: `Tipo: ${seatMapData?.type || 'N/A'}, Secciones: ${seatMapData?.sections?.length || 0}`
              });
            }}
          >
            Ver Info
          </Button>
          <Button 
            icon={<BugOutlined />}
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            type={showDebugInfo ? 'primary' : 'default'}
          >
            {showDebugInfo ? 'Ocultar Debug' : 'Mostrar Debug'}
          </Button>
        </Space>
      </Card>

      {/* Información de selección */}
      {selectedSeats.length > 0 && !editMode && (
        <Alert
          message={`${selectedSeats.length} asientos seleccionados`}
          description={`Total: ${formatPrice(selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0))}`}
          type="success"
          showIcon
          style={{ marginBottom: '20px' }}
          action={
            <Button 
              size="small" 
              onClick={() => setSelectedSeats([])}
            >
              Limpiar
            </Button>
          }
        />
      )}

      {/* Renderer principal */}
      <AdaptiveSeatMapRenderer
        seatMapData={seatMapData}
        selectedSeats={selectedSeats}
        onSeatSelect={handleSeatSelect}
        maxSeats={6}
        occupiedSeats={[]}
        blockedSeats={[]}
        blockedSections={[]}
        formatPrice={formatPrice}
        event={null}
        calculateSeatPrice={null}
        editMode={editMode}
        onSeatMapUpdate={handleSeatMapUpdate}
        initialData={null}
        readOnly={false}
      />

      {/* Información adicional */}
      <Card style={{ marginTop: '20px' }}>
        <Title level={4}>Características del Sistema v2.0</Title>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <Title level={5}>📱 Adaptabilidad Inteligente</Title>
            <ul>
              <li>Detección automática de viabilidad</li>
              <li>Escalado inteligente con zoom dinámico</li>
              <li>Modos alternativos automáticos</li>
              <li>Sin superposiciones garantizadas</li>
            </ul>
          </div>
          <div>
            <Title level={5}>🎨 Diseño Profesional</Title>
            <ul>
              <li>Estilos consistentes con apps comerciales</li>
              <li>Efectos visuales y animaciones</li>
              <li>Leyendas adaptativas por tema</li>
              <li>Estados claros de asientos</li>
            </ul>
          </div>
          <div>
            <Title level={5}>🛠️ Modo de Edición Avanzado</Title>
            <ul>
              <li>Editor visual sin limitaciones</li>
              <li>Gestión completa de secciones</li>
              <li>Vista previa en tiempo real</li>
              <li>Herramientas de reorganización</li>
            </ul>
          </div>
          <div>
            <Title level={5}>🎯 Modos de Vista</Title>
            <ul>
              <li>Completo (con zoom y pan)</li>
              <li>Bloques (grid organizado)</li>
              <li>Simplificado (cards compactas)</li>
              <li>Lista (navegación eficiente)</li>
            </ul>
          </div>
        </div>
        
        <Divider />
        
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5}>🚀 Nuevas Funcionalidades v2.0</Title>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <Title level={5} style={{ color: '#52c41a', margin: 0 }}>✅ Sin Superposiciones</Title>
              <Text style={{ fontSize: '12px' }}>
                Detección automática y resolución de problemas de superposición
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}>
              <Title level={5} style={{ color: '#1890ff', margin: 0 }}>🔍 Zoom Inteligente</Title>
              <Text style={{ fontSize: '12px' }}>
                Sistema de zoom dinámico con pan y controles avanzados
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
              <Title level={5} style={{ color: '#fa8c16', margin: 0 }}>📱 Vistas Alternativas</Title>
              <Text style={{ fontSize: '12px' }}>
                Modos automáticos cuando el mapa no es viable
              </Text>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SeatMapExample;
