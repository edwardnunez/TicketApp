import React from 'react';
import { COLORS } from '../../../../components/colorscheme';

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
        padding: isMobile ? '12px' : '16px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.categories.conciertos)}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
        // transform: 'perspective(100px) rotateX(5deg)',
        // transformOrigin: 'bottom center',
        marginBottom: '8px'
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
        padding: isMobile ? '12px' : '16px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.categories.teatro)}`,
        boxShadow: `0 6px 16px rgba(0,0,0,0.12)`,
        marginBottom: '6px'
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
        padding: isMobile ? '12px' : '16px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.categories.deportes)}`,
        boxShadow: `0 8px 20px rgba(102, 187, 106, 0.2)`,
        // transform: 'perspective(100px) rotateX(-3deg)',
        // transformOrigin: 'top center',
        marginBottom: '4px'
      }}
    >
      {children}
    </div>
  );

  const renderPitShape = () => (
    <div
      className="pit-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${sectionColor || COLORS.secondary.light} 0%, ${sectionColor || COLORS.secondary.main} 100%)`,
        borderRadius: '50%',
        padding: isMobile ? '20px' : '24px',
        border: `3px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.secondary.dark)}`,
        boxShadow: `0 8px 24px rgba(220, 38, 38, 0.3)`,
        minWidth: isMobile ? '280px' : '400px',
        minHeight: isMobile ? '160px' : '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {children}
    </div>
  );

  const renderSideShape = () => (
    <div
      className="side-section"
      style={{
        position: 'relative',
        background: `linear-gradient(45deg, ${sectionColor || COLORS.categories.festivales} 0%, ${sectionColor || COLORS.categories.festivales} 100%)`,
        borderRadius: '8px 20px 20px 8px',
        padding: isMobile ? '10px' : '14px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.categories.festivales)}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.08)`,
        // transform: 'skewY(-2deg)',
        marginBottom: '6px',
        maxWidth: isMobile ? '300px' : '350px',
        minWidth: isMobile ? '150px' : '200px'
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
        padding: isMobile ? '16px' : '20px',
        border: `3px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.accent.gold)}`,
        boxShadow: `0 12px 32px rgba(245, 158, 11, 0.4)`,
        overflow: 'hidden'
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
          pointerEvents: 'none'
        }}
      />
      {children}
    </div>
  );

  const renderOrchestraShape = () => (
    <div
      className="orchestra-section"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${sectionColor || COLORS.accent.gold} 0%, ${sectionColor || COLORS.accent.bronze} 100%)`,
        borderRadius: '16px 16px 4px 4px',
        padding: isMobile ? '12px' : '16px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.accent.gold)}`,
        boxShadow: `0 6px 16px rgba(245, 158, 11, 0.2)`,
        marginBottom: '8px'
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
        padding: isMobile ? '10px' : '14px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.categories.cine)}`,
        boxShadow: `0 4px 12px rgba(77, 182, 172, 0.2)`,
        marginBottom: '6px'
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
        padding: isMobile ? '10px' : '14px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.primary.light)}`,
        boxShadow: `0 6px 16px rgba(0,0,0,0.1)`,
        // transform: 'perspective(120px) rotateX(8deg)',
        // transformOrigin: 'bottom center',
        marginBottom: '10px'
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
        padding: isMobile ? '12px' : '16px',
        border: `2px solid ${sectionBlocked ? COLORS.neutral.grey300 : (sectionColor || COLORS.primary.main)}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.08)`,
        marginBottom: '6px'
      }}
    >
      {children}
    </div>
  );

  return getSectionShape();
};

export default SectionShapeRenderer;
