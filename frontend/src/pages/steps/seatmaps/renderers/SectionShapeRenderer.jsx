import React from 'react';
import { COLORS } from '../../../../components/colorscheme';

/**
 * Section shape renderer component for different venue section types
 * @param {Object} props - Component props
 * @param {string} props.sectionType - Type of section (grada-alta, pista, vip, etc.)
 * @param {number} props.rows - Number of rows in section
 * @param {number} props.seatsPerRow - Number of seats per row
 * @param {React.ReactNode} props.children - Child components to render inside shape
 * @param {boolean} [props.isMobile=false] - Whether in mobile view
 * @param {boolean} [props.sectionBlocked=false] - Whether section is blocked
 * @param {string} [props.sectionColor] - Custom section color
 * @returns {JSX.Element} Section shape renderer with venue-specific layouts
 */
const SectionShapeRenderer = ({
  sectionType,
  rows,
  seatsPerRow,
  children,
  isMobile = false,
  sectionBlocked = false,
  sectionColor
}) => {
  const getSectionShape = () => {
    switch (sectionType) {
      case 'grada-alta':
        return renderHighTierShape();
      case 'grada-media':
        return renderMidTierShape();
      case 'grada-baja':
        return renderLowTierShape();
      case 'pista':
        return renderPitShape();
      case 'lateral':
        return renderSideShape();
      case 'vip':
        return renderVIPShape();
      case 'orchestra':
        return renderOrchestraShape();
      case 'mezzanine':
        return renderMezzanineShape();
      case 'balcony':
        return renderBalconyShape();
      default:
        return renderDefaultShape();
    }
  };

  const renderHighTierShape = () => (
    <div
      className="high-tier-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${sectionColor || COLORS.categories.conciertos} 0%, ${sectionColor || COLORS.categories.conciertos} 100%)`,
        borderRadius: '20px 20px 8px 8px',
        padding: isMobile ? '8px' : '12px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.categories.conciertos)}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
        marginBottom: '8px',
        width: 'fit-content',
        maxWidth: 'none',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );

  const renderMidTierShape = () => (
    <div
      className="mid-tier-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${sectionColor || COLORS.categories.teatro} 0%, ${sectionColor || COLORS.categories.teatro} 100%)`,
        borderRadius: '16px',
        padding: isMobile ? '8px' : '12px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.categories.teatro)}`,
        boxShadow: `0 6px 16px rgba(0,0,0,0.12)`,
        marginBottom: '6px',
        width: 'fit-content',
        maxWidth: 'none',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );

  const renderLowTierShape = () => (
    <div
      className="low-tier-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${sectionColor || COLORS.categories.deportes} 0%, ${sectionColor || COLORS.categories.deportes} 100%)`,
        borderRadius: '12px 12px 20px 20px',
        padding: isMobile ? '8px' : '12px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.categories.deportes)}`,
        boxShadow: `0 8px 20px rgba(102, 187, 106, 0.2)`,
        marginBottom: '4px',
        width: 'fit-content',
        maxWidth: 'none',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );

  const renderPitShape = () => {
    // Función para extraer RGB de un color hex
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 220, g: 38, b: 38 }; // Fallback color
    };

    const color = sectionColor || COLORS.secondary.main;
    const rgb = hexToRgb(color);

    return (
      <div
        className="pit-section"
        style={{
          position: 'relative',
          background: `linear-gradient(135deg, ${color}E6 0%, ${color}D9 100%)`,
          borderRadius: '24px',
          padding: isMobile ? '16px' : '20px',
          border: `3px solid ${sectionBlocked ? COLORS.neutral.grey300 : color}`,
          boxShadow: `0 8px 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
          width: 'fit-content',
          maxWidth: 'none',
          minHeight: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible'
        }}
      >
        {children}
      </div>
    );
  };

  const renderSideShape = () => (
    <div
      className="side-section"
      style={{
        position: 'relative',
        background: `linear-gradient(45deg, ${sectionColor || COLORS.categories.festivales} 0%, ${sectionColor || COLORS.categories.festivales} 100%)`,
        borderRadius: '8px 20px 20px 8px',
        padding: isMobile ? '8px' : '12px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.categories.festivales)}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.08)`,
        marginBottom: '6px',
        width: 'fit-content',
        maxWidth: 'none',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );

  const renderVIPShape = () => (
    <div
      className="vip-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${sectionColor || COLORS.accent.gold} 0%, ${sectionColor || COLORS.accent.bronze} 100%)`,
        borderRadius: '24px',
        padding: isMobile ? '12px' : '16px',
        border: `3px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.accent.gold)}`,
        boxShadow: `0 12px 32px rgba(245, 158, 11, 0.4)`,
        overflow: 'visible',
        width: 'fit-content',
        maxWidth: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Efecto de brillo VIP */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
          animation: 'vipShimmer 3s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  );

  const renderOrchestraShape = () => (
    <div
      className="orchestra-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${sectionColor || COLORS.accent.gold} 0%, ${sectionColor || COLORS.accent.bronze} 100%)`,
        borderRadius: '16px 16px 4px 4px',
        padding: isMobile ? '8px' : '12px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.accent.gold)}`,
        boxShadow: `0 6px 16px rgba(245, 158, 11, 0.2)`,
        marginBottom: '8px',
        width: 'fit-content',
        maxWidth: 'none',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );

  const renderMezzanineShape = () => (
    <div
      className="mezzanine-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${sectionColor || COLORS.categories.cine} 0%, ${sectionColor || COLORS.categories.cine} 100%)`,
        borderRadius: '12px',
        padding: isMobile ? '8px' : '12px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.categories.cine)}`,
        boxShadow: `0 4px 12px rgba(77, 182, 172, 0.2)`,
        marginBottom: '6px',
        width: 'fit-content',
        maxWidth: 'none',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );

  const renderBalconyShape = () => (
    <div
      className="balcony-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${sectionColor || COLORS.primary.light} 0%, ${sectionColor || COLORS.primary.light} 100%)`,
        borderRadius: '20px 20px 8px 8px',
        padding: isMobile ? '8px' : '12px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.primary.light)}`,
        boxShadow: `0 6px 16px rgba(0,0,0,0.1)`,
        marginBottom: '10px',
        width: 'fit-content',
        maxWidth: 'none',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );

  const renderDefaultShape = () => (
    <div
      className="default-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${sectionColor || COLORS.primary.main} 0%, ${sectionColor || COLORS.primary.main} 100%)`,
        borderRadius: '12px',
        padding: isMobile ? '8px' : '12px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.primary.main)}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.08)`,
        marginBottom: '6px',
        width: 'fit-content',
        maxWidth: 'none',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );

  return getSectionShape();
};

export default SectionShapeRenderer;
