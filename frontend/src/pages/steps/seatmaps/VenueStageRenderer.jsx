import React from 'react';
import { COLORS } from '../../../components/colorscheme';

const VenueStageRenderer = ({ type, config, venueColors }) => {
  const renderFootballField = () => (
    <div 
      className="football-field"
      style={{
        width: config?.fieldDimensions?.width || 400,
        height: config?.fieldDimensions?.height || 260,
        background: COLORS.gradients.field,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        fontWeight: 'bold',
        boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3), inset 0 2px 4px rgba(255,255,255,0.1)',
        border: '4px solid #16A34A',
        position: 'relative',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        overflow: 'hidden'
      }}
    >
      {/* Efecto de césped */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(76, 175, 80, 0.05) 0%, transparent 50%)
        `,
        zIndex: 1
      }} />
      
      {/* Líneas del campo */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        width: '90%', 
        height: '80%', 
        border: '3px solid white', 
        borderRadius: '8px',
        opacity: 0.8,
        zIndex: 2
      }} />
      
      {/* Círculo central */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        width: 60, 
        height: 60, 
        border: '3px solid white', 
        borderRadius: '50%',
        opacity: 0.8,
        zIndex: 2
      }} />
      
      {/* Línea central */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '0', 
        right: '0', 
        height: '3px', 
        backgroundColor: 'white',
        opacity: 0.8,
        zIndex: 2
      }} />
      
      {/* Áreas de portería */}
      <div style={{ 
        position: 'absolute', 
        top: '20%', 
        left: '5%', 
        width: '15%', 
        height: '60%', 
        border: '3px solid white', 
        borderRadius: '8px',
        opacity: 0.8,
        zIndex: 2
      }} />
      <div style={{ 
        position: 'absolute', 
        top: '20%', 
        right: '5%', 
        width: '15%', 
        height: '60%', 
        border: '3px solid white', 
        borderRadius: '8px',
        opacity: 0.8,
        zIndex: 2
      }} />
      
      <span style={{ 
        position: 'relative', 
        zIndex: 3,
        fontSize: '18px',
        fontWeight: '700'
      }}>
        CAMPO
      </span>
    </div>
  );

  const renderConcertStage = () => (
    <div
      className="concert-stage"
      style={{
        width: config?.stageWidth || 400,
        height: config?.stageHeight || 100,
        background: COLORS.gradients.stage,
        borderRadius: '20px 20px 8px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 2px 8px rgba(255,255,255,0.1)',
        border: '4px solid #374151',
        position: 'relative',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        overflow: 'hidden'
      }}
    >
      {/* Sistema de luces del escenario */}
      <div style={{
        position: 'absolute',
        top: '-12px',
        left: '10%',
        right: '10%',
        height: '8px',
        background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700, #FFA500, #FFD700)',
        borderRadius: '4px',
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.9), 0 4px 8px rgba(255, 215, 0, 0.3)',
        animation: 'stageLights 3s ease-in-out infinite'
      }} />
      
      {/* Parrillas de luces laterales */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '-8px',
        width: '6px',
        height: '60%',
        background: 'linear-gradient(180deg, #FFD700, #FFA500, #FFD700)',
        borderRadius: '3px',
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.7)'
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-8px',
        width: '6px',
        height: '60%',
        background: 'linear-gradient(180deg, #FFD700, #FFA500, #FFD700)',
        borderRadius: '3px',
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.7)'
      }} />
      
      {/* Textura del escenario */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 50%),
          linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.02) 49%, rgba(255,255,255,0.02) 51%, transparent 52%)
        `,
        borderRadius: '16px 16px 4px 4px'
      }} />
      
      <div style={{ 
        fontSize: '20px', 
        marginBottom: '4px',
        position: 'relative',
        zIndex: 2,
        letterSpacing: '2px'
      }}>
        ESCENARIO
      </div>
      
      {/* Indicador de sonido */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '12px',
        width: '20px',
        height: '12px',
        background: 'linear-gradient(45deg, #00ff00, #00cc00)',
        borderRadius: '2px',
        boxShadow: '0 0 8px rgba(0, 255, 0, 0.6)'
      }} />
    </div>
  );

  const renderCinemaScreen = () => (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <div
        className="cinema-screen"
        style={{
          width: config?.screenWidth || 400,
          height: 24,
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffd700',
          fontSize: 14,
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '2px solid #333',
          textShadow: '0 0 8px rgba(255,215,0,0.5)',
          position: 'relative'
        }}
      >
        PANTALLA
        {/* Efecto de brillo en la pantalla */}
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          borderRadius: '1px'
        }} />
      </div>
      
      {/* Marco de la pantalla */}
      <div style={{
        position: 'absolute',
        top: '-4px',
        left: '-8px',
        right: '-8px',
        bottom: '4px',
        border: '3px solid #666',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #444 0%, #222 100%)',
        zIndex: -1,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
      }} />
    </div>
  );

  const renderTheaterStage = () => (
    <div style={{ position: 'relative', marginBottom: '32px' }}>
      <div
        className="theater-stage"
        style={{
          width: config?.stageWidth || 350,
          height: 40,
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFD700',
          fontSize: 16,
          fontWeight: 'bold',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
          border: '3px solid #654321',
          textShadow: '0 0 8px rgba(255,215,0,0.5)',
          position: 'relative'
        }}
      >
        ESCENARIO
        {/* Luces del escenario */}
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '20%',
          right: '20%',
          height: '4px',
          background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)',
          borderRadius: '2px',
          boxShadow: '0 0 12px rgba(255, 215, 0, 0.8)'
        }} />
      </div>
      
      {/* Proscenio */}
      <div style={{
        position: 'absolute',
        top: '-6px',
        left: '-12px',
        right: '-12px',
        bottom: '6px',
        border: '4px solid #654321',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
        zIndex: -1,
        boxShadow: '0 6px 24px rgba(0,0,0,0.5)'
      }} />
    </div>
  );

  const renderArenaStage = () => (
    <div
      className="arena-stage"
      style={{
        width: config?.stageDimensions?.width || 300,
        height: config?.stageDimensions?.height || 40,
        backgroundColor: '#374151',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        border: '3px solid #4B5563',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        margin: '10px 0'
      }}
    >
      ESCENARIO
    </div>
  );

  const renderStage = () => {
    switch (type) {
      case 'football':
        return renderFootballField();
      case 'concert':
        return renderConcertStage();
      case 'cinema':
        return renderCinemaScreen();
      case 'theater':
        return renderTheaterStage();
      case 'arena':
        return renderArenaStage();
      default:
        return renderConcertStage();
    }
  };

  return (
    <div className="venue-stage-container">
      {renderStage()}
    </div>
  );
};

export default VenueStageRenderer;
