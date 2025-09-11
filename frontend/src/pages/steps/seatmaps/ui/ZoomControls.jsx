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
        position: 'absolute',
        top: '120px', /* Mover más abajo para evitar superposición con header */
        right: '16px',
        zIndex: 1000,
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
              size={isMobile ? 'small' : 'middle'}
              style={{
                minWidth: isMobile ? '32px' : '40px',
                height: isMobile ? '32px' : '40px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: control.disabled ? COLORS.neutral.grey100 : 'white',
                color: control.disabled ? COLORS.neutral.grey400 : COLORS.neutral.grey700,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!control.disabled) {
                  e.target.style.backgroundColor = COLORS.primary.main;
                  e.target.style.color = 'white';
                  e.target.style.borderColor = COLORS.primary.main;
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!control.disabled) {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = COLORS.neutral.grey700;
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            />
          </Tooltip>
        ))}
      </div>

      {/* Instrucciones de uso */}
      {!isMobile && (
        <div 
          className="usage-instructions"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '10px',
            color: COLORS.neutral.grey600,
            textAlign: 'center',
            boxShadow: COLORS.shadows.sm,
            backdropFilter: 'blur(10px)',
            maxWidth: '120px'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '2px' }}>
            Controles
          </div>
          <div>
            Rueda: Zoom
          </div>
          <div>
            Arrastra: Mover
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoomControls;
