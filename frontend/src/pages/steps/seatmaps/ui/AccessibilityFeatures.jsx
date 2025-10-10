import React, { useState, useEffect, useCallback } from 'react';
import { Button, Tooltip, Switch, Space, Typography } from 'antd';
import { 
  EyeOutlined, 
  SoundOutlined, 
  BulbOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { COLORS } from '../../../../components/colorscheme';

const { Text } = Typography;

const AccessibilityFeatures = ({
  onHighContrastToggle,
  onKeyboardNavigationToggle,
  onTooltipToggle,
  isHighContrast = false,
  isKeyboardNavigationEnabled = false,
  showTooltips = true,
  isMobile = false
}) => {
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  // Función para anunciar mensajes a lectores de pantalla
  const announce = useCallback((message) => {
    const announcement = {
      id: Date.now(),
      message: message
    };
    setAnnouncements(prev => [...prev, announcement]);
    
    // Limpiar anuncios antiguos después de 3 segundos
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 3000);
  }, []);

  // Manejar navegación por teclado
  useEffect(() => {
    if (!isKeyboardNavigationEnabled) return;

    const handleKeyDown = (e) => {
      // Navegación con flechas
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const focusableElements = document.querySelectorAll(
          '.professional-seat, .general-admission, button, [tabindex]:not([tabindex="-1"])'
        );
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        let nextIndex = currentIndex;
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        break;
      default:
        return;
        }
        
        focusableElements[nextIndex]?.focus();
        announce(`Navegando a elemento ${nextIndex + 1} de ${focusableElements.length}`);
      }
      
      // Selección con Enter o Espacio
      if (['Enter', ' '].includes(e.key) && 
          (e.target.classList.contains('professional-seat') || 
           e.target.classList.contains('general-admission'))) {
        e.preventDefault();
        e.target.click();
        announce('Asiento seleccionado');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isKeyboardNavigationEnabled, announce]);

  const accessibilityFeatures = [
    {
      key: 'high-contrast',
      label: 'Alto Contraste',
      description: 'Mejora la visibilidad de los elementos',
      icon: <EyeOutlined />,
      enabled: isHighContrast,
      onChange: onHighContrastToggle
    },
    {
      key: 'keyboard-nav',
      label: 'Navegación por Teclado',
      description: 'Navegar con flechas y seleccionar con Enter',
      icon: <BulbOutlined />,
      enabled: isKeyboardNavigationEnabled,
      onChange: onKeyboardNavigationToggle
    },
    {
      key: 'tooltips',
      label: 'Tooltips',
      description: 'Información adicional al pasar el cursor',
      icon: <InfoCircleOutlined />,
      enabled: showTooltips,
      onChange: onTooltipToggle
    }
  ];

  return (
    <>
      {/* Botón de accesibilidad */}
      <div 
        className="accessibility-toggle"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000
        }}
      >
        <Tooltip title="Configuración de accesibilidad">
          <Button
            type="primary"
            shape="circle"
            icon={<QuestionCircleOutlined />}
            onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
            style={{
              backgroundColor: COLORS.accent.purple,
              borderColor: COLORS.accent.purple,
              boxShadow: COLORS.shadows.lg
            }}
            size={isMobile ? 'small' : 'middle'}
          />
        </Tooltip>
      </div>

      {/* Panel de accesibilidad */}
      {showAccessibilityPanel && (
        <div 
          className="accessibility-panel"
          style={{
            position: 'fixed',
            top: '80px',
            left: '20px',
            width: isMobile ? '280px' : '320px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: COLORS.shadows.xl,
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out forwards'
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '16px', color: COLORS.neutral.grey800 }}>
              Configuración de Accesibilidad
            </Text>
          </div>

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {accessibilityFeatures.map(feature => (
              <div 
                key={feature.key}
                className="accessibility-feature"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: feature.enabled ? COLORS.primary.main + '10' : 'transparent',
                  borderRadius: '8px',
                  border: feature.enabled ? `1px solid ${COLORS.primary.main}30` : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{ 
                      color: feature.enabled ? COLORS.primary.main : COLORS.neutral.grey500,
                      fontSize: '16px'
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <Text 
                      strong 
                      style={{ 
                        fontSize: '14px',
                        color: feature.enabled ? COLORS.primary.main : COLORS.neutral.grey700
                      }}
                    >
                      {feature.label}
                    </Text>
                    <div>
                      <Text 
                        style={{ 
                          fontSize: '12px',
                          color: COLORS.neutral.grey500
                        }}
                      >
                        {feature.description}
                      </Text>
                    </div>
                  </div>
                </div>
                
                <Switch
                  checked={feature.enabled}
                  onChange={(checked) => {
                    feature.onChange(checked);
                    announce(`${feature.label} ${checked ? 'activado' : 'desactivado'}`);
                  }}
                  size={isMobile ? 'small' : 'default'}
                />
              </div>
            ))}
          </Space>

          {/* Información adicional */}
          <div 
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: COLORS.neutral.grey50,
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}
          >
            <Text style={{ fontSize: '12px', color: COLORS.neutral.grey600 }}>
              💡 <strong>Consejo:</strong> Usa las teclas de flecha para navegar y Enter para seleccionar asientos.
            </Text>
          </div>
        </div>
      )}

      {/* Anuncios para lectores de pantalla */}
      <div 
        className="screen-reader-announcements"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {announcements.map(announcement => (
          <div key={announcement.id}>
            {announcement.message}
          </div>
        ))}
      </div>

      {/* Estilos para alto contraste */}
      {isHighContrast && (
        <style>
          {`
            .professional-seat {
              border-width: 3px !important;
              border-color: #000000 !important;
            }
            
            .general-admission {
              border-width: 3px !important;
              border-color: #000000 !important;
            }
            
            .professional-section {
              border-width: 2px !important;
              border-color: #000000 !important;
            }
            
            .seatmap-header {
              background: #000000 !important;
              color: #FFFFFF !important;
            }
            
            .professional-seatmap-legend {
              background: #FFFFFF !important;
              border: 2px solid #000000 !important;
              color: #000000 !important;
            }
            
            .zoom-controls {
              background: #FFFFFF !important;
              border: 2px solid #000000 !important;
            }
            
            .accessibility-panel {
              background: #FFFFFF !important;
              border: 2px solid #000000 !important;
              color: #000000 !important;
            }
          `}
        </style>
      )}

      {/* Estilos para movimiento reducido */}
      <style>
        {`
          @media (prefers-reduced-motion: reduce) {
            .professional-seat,
            .general-admission,
            .professional-section,
            .seatmap-transform {
              transition: none !important;
            }
            
            .professional-seat:hover,
            .general-admission:hover,
            .professional-section:hover {
              transform: none !important;
            }
            
            .stage-lights,
            .cinema-lights,
            .shimmer-effect,
            .pulse-effect,
            .glow-effect {
              animation: none !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default AccessibilityFeatures;
