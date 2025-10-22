import React from 'react';
import { Button, Tooltip } from 'antd';
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  ReloadOutlined,
  FullscreenOutlined,
  CompressOutlined
} from '@ant-design/icons';
import { COLORS } from '../../../../components/colorscheme';

/**
 * Zoom controls component for seat map navigation
 * @param {Object} props - Component props
 * @param {number} props.zoomLevel - Current zoom level
 * @param {Function} props.onZoomIn - Zoom in handler
 * @param {Function} props.onZoomOut - Zoom out handler
 * @param {Function} props.onReset - Reset zoom handler
 * @param {Function} props.onFullscreen - Fullscreen toggle handler
 * @param {boolean} [props.isFullscreen=false] - Whether in fullscreen mode
 * @param {boolean} [props.isMobile=false] - Whether in mobile view
 * @returns {JSX.Element} Zoom controls with navigation buttons
 */
const ZoomControls = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
  isFullscreen = false,
  isMobile = false
}) => {
  const controls = [
    {
      key: 'zoom-out',
      icon: <ZoomOutOutlined />,
      onClick: onZoomOut,
      disabled: zoomLevel <= 0.5,
      tooltip: 'Alejar'
    },
    {
      key: 'zoom-in',
      icon: <ZoomInOutlined />,
      onClick: onZoomIn,
      disabled: zoomLevel >= 3,
      tooltip: 'Acercar'
    },
    {
      key: 'reset',
      icon: <ReloadOutlined />,
      onClick: onReset,
      tooltip: 'Restablecer vista'
    },
    {
      key: 'fullscreen',
      icon: isFullscreen ? <CompressOutlined /> : <FullscreenOutlined />,
      onClick: onFullscreen,
      tooltip: isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
    }
  ];

  return (
    <div
      className="zoom-controls"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* Indicador de zoom */}
      <div 
        className="zoom-indicator"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: '600',
          color: COLORS.neutral.grey700,
          textAlign: 'center',
          boxShadow: COLORS.shadows.sm,
          backdropFilter: 'blur(10px)'
        }}
      >
        {Math.round(zoomLevel * 100)}%
      </div>

      {/* Controles */}
      <div 
        className="controls-container"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '8px',
          boxShadow: COLORS.shadows.lg,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          gap: '4px'
        }}
      >
        {controls.map(control => (
          <Tooltip
            key={control.key}
            title={control.tooltip}
            placement={isMobile ? 'top' : 'left'}
          >
            <Button
              icon={control.icon}
              onClick={control.onClick}
              disabled={control.disabled}
              size={isMobile ? 'middle' : 'middle'}
              style={{
                minWidth: isMobile ? '44px' : '40px', // Botones más grandes en móvil para mejor touch
                height: isMobile ? '44px' : '40px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                backgroundColor: control.disabled ? COLORS.neutral.grey100 : 'white',
                color: control.disabled ? COLORS.neutral.grey400 : COLORS.neutral.grey700,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Mejoras para touch
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
              onMouseEnter={(e) => {
                if (!control.disabled && !isMobile) {
                  e.currentTarget.style.borderColor = COLORS.primary.main;
                  e.currentTarget.style.boxShadow = `0 2px 8px ${COLORS.primary.main}20`;
                }
              }}
              onMouseLeave={(e) => {
                if (!control.disabled && !isMobile) {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            />
          </Tooltip>
        ))}
      </div>

      {/* Instrucciones de uso */}
      <div
        className="usage-instructions"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: isMobile ? '6px 10px' : '8px 12px',
          fontSize: isMobile ? '9px' : '10px',
          color: COLORS.neutral.grey600,
          textAlign: 'center',
          boxShadow: COLORS.shadows.sm,
          backdropFilter: 'blur(10px)',
          maxWidth: isMobile ? '100px' : '120px'
        }}
      >
        <div style={{ fontWeight: '600', marginBottom: '2px' }}>
          {isMobile ? 'Gestos' : 'Controles'}
        </div>
        {isMobile ? (
          <>
            <div>Pellizca: Zoom</div>
            <div>Arrastra: Mover</div>
          </>
        ) : (
          <>
            <div>Rueda: Zoom</div>
            <div>Arrastra: Mover</div>
          </>
        )}
      </div>
    </div>
  );
};

export default ZoomControls;
