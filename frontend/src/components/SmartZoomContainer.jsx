import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Slider, Typography, Space, Tooltip } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined, FullscreenOutlined } from '@ant-design/icons';
import { COLORS } from './colorscheme';

const { Text } = Typography;

const SmartZoomContainer = ({
  children,
  minScale = 0.1,
  maxScale = 2.0,
  defaultScale = 1.0,
  showControls = true,
  enablePan = true,
  enableWheelZoom = true,
  onScaleChange = null,
  style = {},
  className = ''
}) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(defaultScale);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Actualizar tamaño del contenedor
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Manejar zoom con rueda del mouse
  const handleWheel = useCallback((e) => {
    if (!enableWheelZoom) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));
    setScale(newScale);
    
    if (onScaleChange) {
      onScaleChange(newScale);
    }
  }, [scale, minScale, maxScale, enableWheelZoom, onScaleChange]);

  // Manejar arrastre para pan
  const handleMouseDown = useCallback((e) => {
    if (!enablePan) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan, enablePan]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !enablePan) return;
    
    const newPan = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    setPan(newPan);
  }, [isDragging, dragStart, enablePan]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Controles de zoom
  const zoomIn = () => {
    const newScale = Math.min(maxScale, scale + 0.2);
    setScale(newScale);
    if (onScaleChange) onScaleChange(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(minScale, scale - 0.2);
    setScale(newScale);
    if (onScaleChange) onScaleChange(newScale);
  };

  const resetZoom = () => {
    setScale(defaultScale);
    setPan({ x: 0, y: 0 });
    if (onScaleChange) onScaleChange(defaultScale);
  };

  const fitToScreen = () => {
    // Calcular escala para ajustar al contenedor
    const newScale = Math.min(1.0, Math.min(
      containerSize.width / 800, // Asumiendo ancho base de 800px
      containerSize.height / 600  // Asumiendo alto base de 600px
    ));
    setScale(newScale);
    setPan({ x: 0, y: 0 });
    if (onScaleChange) onScaleChange(newScale);
  };

  // const toggleFullscreen = () => {
  //   if (!document.fullscreenElement) {
  //     containerRef.current?.requestFullscreen();
  //     setIsFullscreen(true);
  //   } else {
  //     document.exitFullscreen();
  //     setIsFullscreen(false);
  //   }
  // };

  // Manejar cambio de pantalla completa
  // useEffect(() => {
  //   const handleFullscreenChange = () => {
  //     setIsFullscreen(!!document.fullscreenElement);
  //   };

  //   document.addEventListener('fullscreenchange', handleFullscreenChange);
  //   return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  // }, []);

  // Estilos del contenedor
  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    border: '1px solid #d9d9d9',
    cursor: isDragging ? 'grabbing' : (enablePan ? 'grab' : 'default'),
    ...style
  };

  const contentStyle = {
    transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
    transformOrigin: 'top left',
    transition: isDragging ? 'none' : 'transform 0.2s ease',
    minWidth: '100%',
    minHeight: '100%'
  };

  return (
    <div className={className}>
      {/* Controles de zoom */}
      {showControls && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <Space direction="vertical" size="small">
            {/* Botones de zoom */}
            <Space size="small">
              <Tooltip title="Zoom In">
                <Button
                  type="text"
                  icon={<ZoomInOutlined style={{ color: COLORS?.neutral?.darker || '#262626' }} />}
                  onClick={zoomIn}
                  disabled={scale >= maxScale}
                  size="small"
                  style={{
                    color: COLORS?.neutral?.darker || '#262626',
                    border: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent !important'
                  }}
                />
              </Tooltip>
              <Tooltip title="Zoom Out">
                <Button
                  type="text"
                  icon={<ZoomOutOutlined style={{ color: COLORS?.neutral?.darker || '#262626' }} />}
                  onClick={zoomOut}
                  disabled={scale <= minScale}
                  size="small"
                  style={{
                    color: COLORS?.neutral?.darker || '#262626',
                    border: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent !important'
                  }}
                />
              </Tooltip>
              <Tooltip title="Reset">
                <Button
                  type="text"
                  icon={<ReloadOutlined style={{ color: COLORS?.neutral?.darker || '#262626' }} />}
                  onClick={resetZoom}
                  size="small"
                  style={{
                    color: COLORS?.neutral?.darker || '#262626',
                    border: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent !important'
                  }}
                />
              </Tooltip>
              <Tooltip title="Fit to Screen">
                <Button
                  type="text"
                  icon={<FullscreenOutlined style={{ color: COLORS?.neutral?.darker || '#262626' }} />}
                  onClick={fitToScreen}
                  size="small"
                  style={{
                    color: COLORS?.neutral?.darker || '#262626',
                    border: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent !important'
                  }}
                />
              </Tooltip>
            </Space>

            {/* Slider de zoom */}
            <div style={{ width: '120px' }}>
              <Slider
                min={minScale * 100}
                max={maxScale * 100}
                value={scale * 100}
                onChange={(value) => {
                  const newScale = value / 100;
                  setScale(newScale);
                  if (onScaleChange) onScaleChange(newScale);
                }}
                tooltip={{ formatter: (value) => `${value}%` }}
                size="small"
              />
            </div>

            {/* Indicador de escala */}
            <Text style={{ fontSize: '11px', color: COLORS.neutral.grey4 }}>
              {Math.round(scale * 100)}%
            </Text>
          </Space>
        </div>
      )}

      {/* Contenedor principal */}
      <div
        ref={containerRef}
        style={containerStyle}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={contentStyle}>
          {children}
        </div>
      </div>

      {/* Overlay de información */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        color: COLORS.neutral.grey4,
        backdropFilter: 'blur(10px)'
      }}>
        {enablePan && 'Arrastra para mover • Rueda para zoom'}
      </div>
    </div>
  );
};

export default SmartZoomContainer;
