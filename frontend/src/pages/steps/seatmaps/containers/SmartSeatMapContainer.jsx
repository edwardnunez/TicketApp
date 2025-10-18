import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Switch, message, Alert, Select, Tooltip } from 'antd';
import { 
  EditOutlined, 
  EyeOutlined, 
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { COLORS } from '../../../../components/colorscheme';
import GenericSeatRenderer from '../renderers/GenericSeatRenderer';
import ResponsiveSeatRenderer from '../renderers/ResponsiveSeatRenderer';
import EditableSeatRenderer from '../renderers/EditableSeatRenderer';
import FallbackViewContainer from './FallbackViewContainer';
import SmartZoomContainer from './SmartZoomContainer';
import useDeviceDetection from '../../../../hooks/useDeviceDetection';
import useViewportManager from '../../../../hooks/useViewportManager';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Adaptive seat map renderer component that automatically selects the best rendering approach
 * @param {Object} props - Component props
 * @param {Object} props.seatMapData - Seat map data object
 * @param {Array} props.selectedSeats - Currently selected seats
 * @param {Function} props.onSeatSelect - Seat selection handler
 * @param {number} props.maxSeats - Maximum number of selectable seats
 * @param {Array} props.occupiedSeats - List of occupied seat IDs
 * @param {Array} props.blockedSeats - List of blocked seat IDs
 * @param {Array} props.blockedSections - List of blocked section IDs
 * @param {Function} props.formatPrice - Price formatting function
 * @param {Object} props.event - Event data object
 * @param {Function} props.calculateSeatPrice - Seat price calculation function
 * @param {boolean} [props.editMode=false] - Whether in edit mode
 * @param {Function} [props.onSeatMapUpdate] - Seat map update handler
 * @param {Object} [props.initialData=null] - Initial seat map data
 * @param {boolean} [props.readOnly=false] - Whether in read-only mode
 * @returns {JSX.Element} Adaptive seat map renderer with automatic view selection
 */
const SmartSeatMapContainer = ({
  seatMapData,
  selectedSeats,
  onSeatSelect,
  maxSeats,
  occupiedSeats,
  blockedSeats,
  blockedSections,
  formatPrice,
  event,
  calculateSeatPrice,
  // Props para modo de edición
  editMode = false,
  onSeatMapUpdate,
  initialData = null,
  readOnly = false
}) => {
  const deviceInfo = useDeviceDetection();
  const containerRef = useRef(null);
  const viewportManager = useViewportManager(seatMapData, containerRef);
  
  const [isEditMode, setIsEditMode] = useState(editMode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [manualViewMode, setManualViewMode] = useState(null);

  // Determinar el modo de vista actual
  const currentViewMode = manualViewMode || viewportManager.viewMode;

  // Determinar qué renderer usar basado en el dispositivo y modo
  const getRenderer = () => {
    // Si está en modo de edición, usar el editor
    if (isEditMode) {
      return (
        <EditableSeatRenderer
          seatMapData={seatMapData}
          onSeatMapUpdate={(updatedData) => {
            if (onSeatMapUpdate) {
              onSeatMapUpdate(updatedData);
            }
            setHasUnsavedChanges(false);
          }}
          initialData={initialData}
          readOnly={readOnly}
        />
      );
    }

    // Usar vista alternativa si el mapa no es viable o se selecciona manualmente
    if (currentViewMode === 'blocks' || currentViewMode === 'simplified' || currentViewMode === 'list') {
      return (
        <FallbackViewContainer
          seatMapData={seatMapData}
          selectedSeats={selectedSeats}
          onSeatSelect={onSeatSelect}
          maxSeats={maxSeats}
          occupiedSeats={occupiedSeats}
          blockedSeats={blockedSeats}
          blockedSections={blockedSections}
          formatPrice={formatPrice}
          event={event}
          calculateSeatPrice={calculateSeatPrice}
          viewMode={currentViewMode}
        />
      );
    }

    // Para vista completa con zoom
    if (currentViewMode === 'zoomed' || currentViewMode === 'full') {
      const renderer = deviceInfo.isMobile ? ResponsiveSeatRenderer : GenericSeatRenderer;
      
      return (
        <SmartZoomContainer
          minScale={0.2}
          maxScale={2.0}
          defaultScale={viewportManager.viewport.scale}
          onScaleChange={viewportManager.setScale}
          style={{ height: '600px' }}
        >
          {React.createElement(renderer, {
            seatMapData,
            selectedSeats,
            onSeatSelect,
            maxSeats,
            occupiedSeats,
            blockedSeats,
            blockedSections,
            formatPrice,
            event,
            calculateSeatPrice
          })}
        </SmartZoomContainer>
      );
    }

    // Fallback: usar renderer responsive
    return (
      <ResponsiveSeatRenderer
        seatMapData={seatMapData}
        selectedSeats={selectedSeats}
        onSeatSelect={onSeatSelect}
        maxSeats={maxSeats}
        occupiedSeats={occupiedSeats}
        blockedSeats={blockedSeats}
        blockedSections={blockedSections}
        formatPrice={formatPrice}
        event={event}
        calculateSeatPrice={calculateSeatPrice}
      />
    );
  };

  const handleEditModeToggle = () => {
    if (hasUnsavedChanges) {
      message.warning('Tienes cambios sin guardar. Guarda antes de cambiar de modo.');
      return;
    }
    setIsEditMode(!isEditMode);
  };

  const handleSeatMapUpdate = (updatedData) => {
    setHasUnsavedChanges(true);
    if (onSeatMapUpdate) {
      onSeatMapUpdate(updatedData);
    }
  };

  if (!seatMapData) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px' }}>
        <Title level={3} style={{ color: COLORS.neutral.grey4 }}>
          No hay mapa de asientos disponible
        </Title>
        <Text style={{ color: COLORS.neutral.grey4 }}>
          {editMode ? 'Crea un nuevo mapa de asientos' : 'Este evento no tiene un mapa de asientos configurado'}
        </Text>
      </Card>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Header con controles */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3} style={{ margin: 0, color: COLORS.neutral.darker }}>
              {seatMapData.config?.venueName || seatMapData.name || 'Mapa de Asientos'}
            </Title>
            <Text style={{ color: COLORS.neutral.grey4 }}>
              {isEditMode ? 'Modo de edición' : `${deviceInfo.deviceType} - ${deviceInfo.screenWidth}px`}
            </Text>
          </div>
          
          {/* Controles de modo */}
          <Space>
            {!readOnly && (
              <Switch
                checkedChildren={<EditOutlined />}
                unCheckedChildren={<EyeOutlined />}
                checked={isEditMode}
                onChange={handleEditModeToggle}
                style={{ backgroundColor: isEditMode ? COLORS.primary.main : undefined }}
              />
            )}
            
            {hasUnsavedChanges && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => {
                  setHasUnsavedChanges(false);
                  message.success('Cambios guardados');
                }}
                style={{ 
                  backgroundColor: '#FF6B35',
                  borderColor: '#FF6B35'
                }}
              >
                Guardar Cambios
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Alertas de viabilidad */}
      {!isEditMode && !viewportManager.viability.isViable && (
        <Alert
          message="Vista optimizada automáticamente"
          description={viewportManager.viability.reason}
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
          action={
            <Button size="small" onClick={() => setManualViewMode('full')}>
              Forzar Vista Completa
            </Button>
          }
        />
      )}

      {/* Controles de vista */}
      {!isEditMode && (
        <Card style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Modo de Vista:</Text>
              <Text style={{ marginLeft: '8px', color: COLORS.neutral.grey4 }}>
                {currentViewMode === 'auto' ? 'Automático' : 
                 currentViewMode === 'full' ? 'Completo' :
                 currentViewMode === 'zoomed' ? 'Con Zoom' :
                 currentViewMode === 'blocks' ? 'Bloques' :
                 currentViewMode === 'simplified' ? 'Simplificado' :
                 currentViewMode === 'list' ? 'Lista' : 'Desconocido'}
              </Text>
            </div>
            
            <Space>
              <Select
                value={manualViewMode || 'auto'}
                onChange={(value) => {
                  if (value === 'auto') {
                    setManualViewMode(null);
                  } else {
                    setManualViewMode(value);
                  }
                }}
                style={{ minWidth: '120px' }}
              >
                <Option value="auto">Automático</Option>
                <Option value="full">Completo</Option>
                <Option value="zoomed">Con Zoom</Option>
                <Option value="blocks">Bloques</Option>
                <Option value="simplified">Simplificado</Option>
                <Option value="list">Lista</Option>
              </Select>
              
              <Tooltip title="Resetear vista">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setManualViewMode(null);
                    viewportManager.resetViewport();
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        </Card>
      )}

      {/* Información del dispositivo y viabilidad */}
      {!isEditMode && (
        <Card style={{ marginBottom: '20px', backgroundColor: COLORS.neutral.grey1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <Text strong>Dispositivo:</Text>
              <Text style={{ marginLeft: '8px', textTransform: 'capitalize' }}>
                {deviceInfo.deviceType} ({deviceInfo.screenWidth} × {deviceInfo.screenHeight}px)
              </Text>
            </div>
            <div>
              <Text strong>Viabilidad:</Text>
              <Text style={{ 
                marginLeft: '8px', 
                color: viewportManager.viability.isViable ? '#52c41a' : '#ff4d4f' 
              }}>
                {viewportManager.viability.isViable ? 'Viable' : 'No viable'}
              </Text>
            </div>
            <div>
              <Text strong>Escala:</Text>
              <Text style={{ marginLeft: '8px' }}>
                {Math.round(viewportManager.viewport.scale * 100)}%
              </Text>
            </div>
            <div>
              <Text strong>Dimensiones requeridas:</Text>
              <Text style={{ marginLeft: '8px' }}>
                {viewportManager.viability.minRequiredWidth} × {viewportManager.viability.minRequiredHeight}px
              </Text>
            </div>
          </div>
        </Card>
      )}

      {/* Renderer principal */}
      <div 
        ref={containerRef}
        style={{ 
          minHeight: '400px',
          backgroundColor: isEditMode ? 'transparent' : COLORS.neutral.grey1,
          borderRadius: isEditMode ? '0' : '12px',
          padding: isEditMode ? '0' : '20px'
        }}
      >
        {getRenderer()}
      </div>

      {/* Información adicional para desarrolladores */}
      {process.env.NODE_ENV === 'development' && (
        <Card style={{ marginTop: '20px', backgroundColor: '#f0f0f0' }}>
          <Title level={5}>Debug Info</Title>
          <pre style={{ fontSize: '12px', margin: 0 }}>
            {JSON.stringify({
              deviceInfo,
              viewportManager: {
                viewport: viewportManager.viewport,
                viewMode: viewportManager.viewMode,
                viability: viewportManager.viability
              },
              currentViewMode,
              manualViewMode,
              isEditMode,
              hasUnsavedChanges,
              seatMapDataKeys: Object.keys(seatMapData || {}),
              sectionsCount: seatMapData?.sections?.length || 0
            }, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};

export default SmartSeatMapContainer;
