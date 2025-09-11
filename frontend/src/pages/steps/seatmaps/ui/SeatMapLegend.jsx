import React from 'react';
import { COLORS } from '../../../../components/colorscheme';

const SeatMapLegend = ({ 
  theme = 'default', // 'default', 'cinema', 'theater', 'stadium', 'concert'
  showPremium = true,
  showAccessible = false,
  className = ''
}) => {
  const getThemeStyles = () => {
    switch (theme) {
      case 'cinema':
        return {
          container: {
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          },
          textColor: 'white'
        };
      case 'theater':
        return {
          container: {
            background: 'rgba(139, 69, 19, 0.3)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          },
          textColor: '#FFD700'
        };
      case 'stadium':
        return {
          container: {
            background: 'rgba(76, 175, 80, 0.2)',
            border: '1px solid rgba(76, 175, 80, 0.4)',
            backdropFilter: 'blur(10px)'
          },
          textColor: 'white'
        };
      case 'concert':
        return {
          container: {
            background: 'rgba(255, 107, 53, 0.2)',
            border: '1px solid rgba(255, 107, 53, 0.4)',
            backdropFilter: 'blur(10px)'
          },
          textColor: 'white'
        };
      default:
        return {
          container: {
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid #E5E7EB',
            backdropFilter: 'blur(10px)'
          },
          textColor: '#374151'
        };
    }
  };

  const themeStyles = getThemeStyles();

  const legendItems = [
    {
      color: 'white',
      border: '1px solid #ddd',
      label: 'Disponible',
      description: 'Asiento libre'
    },
    {
      color: COLORS.primary.main,
      border: 'none',
      label: 'Seleccionado',
      description: 'Tu selección'
    },
    {
      color: '#E5E7EB',
      border: 'none',
      label: 'Ocupado',
      description: 'No disponible'
    }
  ];

  if (showPremium) {
    legendItems.push({
      color: '#9C27B0',
      border: 'none',
      label: 'VIP/Premium',
      description: 'Asiento premium'
    });
  }

  if (showAccessible) {
    legendItems.push({
      color: '#4CAF50',
      border: 'none',
      label: 'Accesible',
      description: 'Para personas con movilidad reducida'
    });
  }

  return (
    <div 
      className={`smooth-transition ${className}`}
      style={{
        display: 'flex',
        gap: '16px',
        padding: '12px 20px',
        borderRadius: '12px',
        ...themeStyles.container,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {legendItems.map((item, index) => (
        <div 
          key={index}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.05)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div 
            style={{ 
              width: '14px', 
              height: '14px', 
              backgroundColor: item.color, 
              borderRadius: '3px', 
              border: item.border,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
          >
            {/* Indicador especial para VIP */}
            {item.label.includes('VIP') && (
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '6px',
                height: '6px',
                backgroundColor: '#FFD700',
                borderRadius: '50%',
                border: '1px solid white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }} />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ 
              color: themeStyles.textColor, 
              fontSize: '12px', 
              fontWeight: '600',
              lineHeight: 1
            }}>
              {item.label}
            </span>
            <span style={{ 
              color: themeStyles.textColor, 
              fontSize: '10px', 
              opacity: 0.8,
              lineHeight: 1
            }}>
              {item.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeatMapLegend;
