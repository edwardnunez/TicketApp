import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Space } from 'antd';
import { 
  FullscreenOutlined,
  CompressOutlined,
  LockOutlined,
  UnlockOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { COLORS } from '../../components/colorscheme';
import ProfessionalSeatMapRenderer from '../steps/seatmaps/containers/ProfessionalSeatMapRenderer';
import '../steps/seatmaps/styles/ProfessionalSeatMapAnimations.css';
import '../steps/seatmaps/styles/ProfessionalSeatMapLayouts.css';

const { Title, Text } = Typography;

const ProfessionalAdminSeatMapRenderer = ({
  seatMapData,
  blockedSeats = [],
  blockedSections = [],
  onSeatToggle,
  onSectionToggle,
  generalAdmissionCapacities = {},
  onCapacityChange
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const containerRef = useRef(null);

  // Función para manejar clic en asiento (adaptada para administración)
  const handleAdminSeatClick = (seatData) => {
    const seat = Array.isArray(seatData) ? seatData[0] : seatData;
    if (onSeatToggle && seat && seat.id) {
      onSeatToggle(seat.id);
    }
  };

  // Función para manejar clic en sección (para bloquear secciones completas)
  const handleSectionClick = (sectionId) => {
    if (onSectionToggle) {
      onSectionToggle(sectionId);
    }
  };


  // Función para alternar pantalla completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Manejar cambios de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!seatMapData) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: COLORS.neutral.grey4 
      }}>
        <Text>No hay datos del mapa de asientos disponibles</Text>
      </div>
    );
  }

  const { name } = seatMapData;

  return (
    <div
      ref={containerRef}
      className="professional-admin-seatmap-container"
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : 'auto',
        minHeight: '150vh',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px',
        overflow: 'visible',
        border: `2px solid ${COLORS.neutral.grey2}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header con controles */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px',
          borderBottom: `1px solid ${COLORS.neutral.grey2}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Title level={4} style={{ margin: 0, color: COLORS.neutral.darker }}>
            {name} - Modo Administración
          </Title>
          <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
            Haz clic en asientos o usa los botones para bloquear secciones completas
          </Text>
        </div>
        
        <Space>
          <Button
            size="small"
            icon={isFullscreen ? <CompressOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? 'Salir' : 'Pantalla completa'}
          </Button>
        </Space>
      </div>

      {/* Controles de sección */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          zIndex: 90,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px',
          borderBottom: `1px solid ${COLORS.neutral.grey2}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <Text style={{ color: COLORS.neutral.grey6, fontSize: '12px', fontWeight: 'bold' }}>
          Control de Secciones:
        </Text>
        <Space wrap size="small">
          {seatMapData.sections.map(section => (
            <Button
              key={section.id}
              size="small"
              type={blockedSections.includes(section.id) ? "primary" : "default"}
              danger={blockedSections.includes(section.id)}
              icon={blockedSections.includes(section.id) ? <UnlockOutlined /> : <LockOutlined />}
              onClick={() => handleSectionClick(section.id)}
              style={{
                borderColor: blockedSections.includes(section.id) ? '#ff4d4f' : section.color,
                color: blockedSections.includes(section.id) ? '#fff' : '#fff',
                ...(blockedSections.includes(section.id) ? {} : {
                  backgroundColor: section.color
                })
              }}
            >
              {section.name}
              {blockedSections.includes(section.id) && ' (Bloqueada)'}
            </Button>
          ))}
        </Space>
      </div>


      {/* Contenedor principal del mapa - Usar exactamente el mismo renderizador que los compradores */}
      <div
        className="seatmap-content"
        style={{
          position: 'absolute',
          top: '140px', // Ajustado para dar espacio a los controles de sección
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden'
        }}
      >
        <ProfessionalSeatMapRenderer
          seatMapData={seatMapData}
          selectedSeats={[]} // No hay asientos seleccionados en modo admin
          onSeatSelect={handleAdminSeatClick}
          maxSeats={999} // Sin límite en modo admin
          occupiedSeats={[]} // No hay asientos ocupados en modo admin
          blockedSeats={blockedSeats.filter(id => id && typeof id === 'string')} // Los IDs ya están en el formato correcto
          blockedSections={blockedSections}
          formatPrice={() => ''} // Sin precio en modo admin
          event={null}
          calculateSeatPrice={null}
          isAdminMode={true} // Indicar que es modo admin
        />
      </div>

      {/* Información de estadísticas */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          color: COLORS.neutral.grey6,
          zIndex: 50
        }}
      >
        <div>Secciones bloqueadas: {blockedSections.length} de {seatMapData.sections.length}</div>
        <div>Asientos bloqueados: {blockedSeats.length}</div>
      </div>
    </div>
  );
};

export default ProfessionalAdminSeatMapRenderer;
