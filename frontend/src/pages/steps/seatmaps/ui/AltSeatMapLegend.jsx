import React from 'react';
import { COLORS, getVenueColors } from '../../../../components/colorscheme';

const AltSeatMapLegend = ({ 
  venueType = 'concert',
  showPremium = true,
  showAccessible = true,
  isMobile = false
}) => {
  const venueColors = getVenueColors(venueType);

  const getThemeStyles = () => {
    switch (venueType) {
      case 'cinema':
        return {
          container: {
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white'
          }
        };
      case 'theater':
        return {
          container: {
            background: 'rgba(139, 69, 19, 0.8)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            color: '#FFD700'
          }
        };
      case 'football':
        return {
          container: {
            background: 'rgba(34, 197, 94, 0.8)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            backdropFilter: 'blur(10px)',
            color: 'white'
          }
        };
      case 'concert':
        return {
          container: {
            background: 'rgba(220, 38, 38, 0.8)',
            border: '1px solid rgba(220, 38, 38, 0.4)',
            backdropFilter: 'blur(10px)',
            color: 'white'
          }
        };
      case 'arena':
        return {
          container: {
            background: 'rgba(55, 65, 81, 0.8)',
            border: '1px solid rgba(55, 65, 81, 0.4)',
            backdropFilter: 'blur(10px)',
            color: 'white'
          }
        };
      default:
        return {
          container: {
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid #E5E7EB',
            backdropFilter: 'blur(10px)',
            color: '#374151'
          }
        };
    }
  };

  const themeStyles = getThemeStyles();

  const legendItems = [
    {
      color: COLORS.seatStates.available.background,
      border: `2px solid ${COLORS.seatStates.available.border}`,
      label: 'Disponible',
      description: 'Asiento libre',
      icon: '🪑'
    },
    {
      color: COLORS.seatStates.selected.background,
      border: `2px solid ${COLORS.seatStates.selected.border}`,
      label: 'Seleccionado',
      description: 'Tu selección',
      icon: '✓'
    },
    {
      color: COLORS.seatStates.occupied.background,
      border: `2px solid ${COLORS.seatStates.occupied.border}`,
      label: 'Ocupado',
      description: 'No disponible',
      icon: '👤'
    },
    {
      color: COLORS.seatStates.blocked.background,
      border: `2px solid ${COLORS.seatStates.blocked.border}`,
      label: 'Bloqueado',
      description: 'No disponible',
      icon: '🔒'
    }
  ];

  if (showPremium) {
    legendItems.push({
      color: COLORS.seatStates.premium.background,
      border: `2px solid ${COLORS.seatStates.premium.border}`,
      label: 'Premium/VIP',
      description: 'Asiento premium',
      icon: '⭐',
      indicator: COLORS.accent.gold
    });
  }

  if (showAccessible) {
    legendItems.push({
      color: COLORS.seatStates.accessible.background,
      border: `2px solid ${COLORS.seatStates.accessible.border}`,
      label: 'Accesible',
      description: 'Movilidad reducida',
      icon: '♿',
      indicator: COLORS.accent.green
    });
  }

  return (
    <div 
      className="professional-seatmap-legend"
      style={{
        display: 'flex',
        gap: isMobile ? '8px' : '16px',
        padding: isMobile ? '8px 12px' : '12px 20px',
        borderRadius: '12px',
        ...themeStyles.container,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '16px auto',
        maxWidth: '100%',
        boxShadow: COLORS.shadows.lg
      }}
    >
      {legendItems.map((item, index) => (
        <div 
          key={index}
          className="legend-item"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? '6px' : '8px',
            padding: isMobile ? '4px 6px' : '6px 10px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div 
            className="legend-seat"
            style={{ 
              width: isMobile ? '16px' : '20px', 
              height: isMobile ? '16px' : '20px', 
              backgroundColor: item.color, 
              borderRadius: '4px', 
              border: item.border,
              boxShadow: COLORS.shadows.sm,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? '8px' : '10px'
            }}
          >
            {item.icon}
            
            {/* Indicador especial para premium */}
            {item.indicator && (
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '6px',
                height: '6px',
                backgroundColor: item.indicator,
                borderRadius: '50%',
                border: '1px solid white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }} />
            )}
          </div>
          
          <div 
            className="legend-text"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              minWidth: isMobile ? '60px' : '80px'
            }}
          >
            <span style={{ 
              color: themeStyles.color, 
              fontSize: isMobile ? '10px' : '12px', 
              fontWeight: '600',
              lineHeight: 1,
              marginBottom: '2px'
            }}>
              {item.label}
            </span>
            <span style={{ 
              color: themeStyles.color, 
              fontSize: isMobile ? '8px' : '10px', 
              opacity: 0.8,
              lineHeight: 1
            }}>
              {item.description}
            </span>
          </div>
        </div>
      ))}

      {/* Información adicional del venue */}
      <div 
        className="venue-info"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          borderRadius: '6px',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
          marginLeft: '8px'
        }}
      >
        <div 
          className="venue-type-indicator"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: venueColors[Object.keys(venueColors)[0]] || COLORS.primary.main,
            borderRadius: '50%',
            boxShadow: '0 0 4px rgba(0,0,0,0.3)'
          }}
        />
        <span style={{
          color: themeStyles.color,
          fontSize: isMobile ? '8px' : '10px',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {venueType}
        </span>
      </div>
    </div>
  );
};

export default AltSeatMapLegend;




