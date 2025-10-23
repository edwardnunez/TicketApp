import { useState, useEffect } from 'react';
import { Button, Space } from 'antd';
import { EnvironmentOutlined, FormOutlined } from '@ant-design/icons';
import { COLORS } from '../../../components/colorscheme';

/**
 * Componente para alternar entre vista de mapa y formulario manual para bloqueo de asientos
 * @param {Object} props - Propiedades del componente
 * @param {string} props.currentView - Vista actual ('map' o 'manual')
 * @param {Function} props.onViewChange - Función para cambiar de vista
 */
const BlockingViewSwitcher = ({ currentView, onViewChange }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? '8px 12px' : '12px 20px',
        backgroundColor: COLORS.neutral.grey1,
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${COLORS.neutral.grey2}`
      }}
    >
      <Space
        size={isMobile ? 'small' : 'middle'}
        direction={isMobile ? 'vertical' : 'horizontal'}
        style={{ width: isMobile ? '100%' : 'auto' }}
      >
        <Button
          type={currentView === 'map' ? 'primary' : 'default'}
          icon={<EnvironmentOutlined />}
          onClick={() => onViewChange('map')}
          size={isMobile ? 'middle' : 'large'}
          block={isMobile}
          style={{
            borderRadius: '8px',
            fontWeight: currentView === 'map' ? 'bold' : 'normal',
            minWidth: isMobile ? 'auto' : '180px'
          }}
        >
          Vista de mapa
        </Button>
        <Button
          type={currentView === 'manual' ? 'primary' : 'default'}
          icon={<FormOutlined />}
          onClick={() => onViewChange('manual')}
          size={isMobile ? 'middle' : 'large'}
          block={isMobile}
          style={{
            borderRadius: '8px',
            fontWeight: currentView === 'manual' ? 'bold' : 'normal',
            minWidth: isMobile ? 'auto' : '180px'
          }}
        >
          Bloqueo por formulario
        </Button>
      </Space>
    </div>
  );
};

export default BlockingViewSwitcher;
