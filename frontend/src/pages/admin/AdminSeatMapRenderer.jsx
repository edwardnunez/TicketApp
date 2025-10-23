import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Space, Collapse } from 'antd';
import {
  FullscreenOutlined,
  CompressOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { COLORS } from '../../components/colorscheme';
import MainSeatMapContainer from '../steps/seatmaps/containers/MainSeatMapContainer';
import BlockingViewSwitcher from './components/BlockingViewSwitcher';
import ManualBlockingSelection from './components/ManualBlockingSelection';
import '../steps/seatmaps/styles/SeatMapAnimations.css';
import '../steps/seatmaps/styles/SeatMapLayouts.css';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const AdminSeatMapRenderer = ({
  seatMapData,
  blockedSeats = [],
  blockedSections = [],
  onSeatToggle,
  onSectionToggle,
  generalAdmissionCapacities = {},
  onCapacityChange
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentView, setCurrentView] = useState('map'); // 'map' o 'manual'
  const containerRef = useRef(null);

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        minHeight: isFullscreen ? '100vh' : (isMobile ? '100vh' : '800px'),
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: isFullscreen ? '0' : '12px',
        overflow: 'hidden',
        border: isFullscreen ? 'none' : `2px solid ${COLORS.neutral.grey2}`,
        boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header con controles */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: isMobile ? '10px 12px' : '12px 16px',
          borderBottom: `1px solid ${COLORS.neutral.grey2}`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '10px' : '0',
          flexShrink: 0
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '4px' : '12px'
        }}>
          <Title level={4} style={{
            margin: 0,
            color: COLORS.neutral.darker,
            fontSize: isMobile ? '16px' : '20px'
          }}>
            {name} - Modo Administración
          </Title>
          <Text style={{
            color: COLORS.neutral.grey4,
            fontSize: isMobile ? '11px' : '12px'
          }}>
            {currentView === 'map'
              ? 'Haz clic en asientos o usa los botones para bloquear secciones'
              : 'Usa el formulario para bloquear asientos o secciones'}
          </Text>
        </div>

        {!isMobile && (
          <Space>
            <Button
              size="small"
              icon={isFullscreen ? <CompressOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? 'Salir' : 'Pantalla completa'}
            </Button>
          </Space>
        )}
      </div>

      {/* Switcher de vistas - visible siempre */}
      <div style={{ padding: isMobile ? '12px' : '16px', flexShrink: 0 }}>
        <BlockingViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {/* Controles de sección - solo en vista de mapa y en desktop */}
      {currentView === 'map' && !isMobile && (
        <Collapse
          defaultActiveKey={['1']}
          ghost
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderBottom: `1px solid ${COLORS.neutral.grey2}`,
            flexShrink: 0
          }}
          expandIconPosition="end"
        >
          <Panel
            header={
              <Text style={{ color: COLORS.neutral.darker, fontSize: '13px', fontWeight: 'bold' }}>
                Control de secciones ({blockedSections.length} bloqueadas)
              </Text>
            }
            key="1"
          >
            <Space wrap size="small" style={{ padding: '0 16px 12px 16px' }}>
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
          </Panel>
        </Collapse>
      )}

      {/* Renderizar vista según selección */}
      {currentView === 'map' ? (
        <>
          {/* Contenedor principal del mapa */}
          <div
            className="seatmap-content"
            style={{
              position: 'relative',
              flex: 1,
              overflow: 'hidden',
              display: 'flex'
            }}
          >
            <MainSeatMapContainer
              seatMapData={seatMapData}
              selectedSeats={[]}
              onSeatSelect={handleAdminSeatClick}
              maxSeats={999}
              occupiedSeats={[]}
              blockedSeats={blockedSeats.filter(id => id && typeof id === 'string')}
              blockedSections={blockedSections}
              formatPrice={() => ''}
              event={null}
              calculateSeatPrice={null}
              isAdminMode={true}
            />
          </div>

          {/* Información de estadísticas - solo en desktop */}
          {!isMobile && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: COLORS.neutral.darker,
                zIndex: 50,
                backdropFilter: 'blur(10px)'
              }}
            >
              <div>Secciones bloqueadas: {blockedSections.length} de {seatMapData.sections.length}</div>
              <div>Asientos bloqueados: {blockedSeats.length}</div>
            </div>
          )}
        </>
      ) : (
        /* Vista de formulario manual */
        <div style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: COLORS.neutral.white
        }}>
          <ManualBlockingSelection
            seatMapData={seatMapData}
            blockedSeats={blockedSeats}
            blockedSections={blockedSections}
            onSeatToggle={onSeatToggle}
            onSectionToggle={onSectionToggle}
          />
        </div>
      )}
    </div>
  );
};

export default AdminSeatMapRenderer;
