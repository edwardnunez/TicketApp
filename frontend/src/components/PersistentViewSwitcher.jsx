import React from 'react';
import { Button, Space, Typography, Tooltip, Badge } from 'antd';
import { 
  AppstoreOutlined, 
  UnorderedListOutlined,
  FilterOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { COLORS } from './colorscheme';

const { Text } = Typography;

const PersistentViewSwitcher = ({
  currentView = 'map',
  onViewChange,
  availableViews = ['map', 'list', 'filters'],
  showCounts = true,
  mapCount = 0,
  listCount = 0,
  previousView = null,
  style = {}
}) => {
  const getViewIcon = (view) => {
    switch (view) {
      case 'map':
        return <AppstoreOutlined />;
      case 'list':
        return <UnorderedListOutlined />;
      case 'filters':
        return <FilterOutlined />;
      default:
        return <EyeOutlined />;
    }
  };

  const getViewLabel = (view) => {
    switch (view) {
      case 'map':
        return 'Mapa';
      case 'list':
        return 'Lista';
      case 'filters':
        return 'Filtros';
      default:
        return 'Vista';
    }
  };

  const getViewTooltip = (view) => {
    switch (view) {
      case 'map':
        return 'Vista de mapa interactivo';
      case 'list':
        return 'Vista de lista optimizada';
      case 'filters':
        return 'Vista con filtros avanzados';
      default:
        return 'Cambiar vista';
    }
  };

  const getViewCount = (view) => {
    switch (view) {
      case 'map':
        return mapCount;
      case 'list':
        return listCount;
      default:
        return 0;
    }
  };

  return (
    <div style={{
      position: 'sticky',
      top: '0',
      zIndex: 1000,
      backgroundColor: 'white',
      borderBottom: '1px solid #f0f0f0',
      padding: '12px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      ...style
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Título */}
        <div>
          <Text strong style={{ fontSize: '16px' }}>
            Selección de Asientos
          </Text>
          <Text style={{ 
            marginLeft: '8px', 
            color: COLORS.neutral.grey4,
            fontSize: '12px'
          }}>
            Cambia entre diferentes vistas
          </Text>
        </div>

        {/* Botones de vista */}
        <Space>
          {availableViews.map(view => {
            const isActive = currentView === view;
            const count = getViewCount(view);
            
            return (
              <Tooltip key={view} title={getViewTooltip(view)}>
                <Button
                  type={isActive ? 'primary' : 'default'}
                  icon={getViewIcon(view)}
                  onClick={() => {
                    // Si ya está activo y hay una vista anterior, volver a la anterior
                    if (isActive && previousView && previousView !== view) {
                      onViewChange(previousView);
                    } else {
                      onViewChange(view);
                    }
                  }}
                  style={{
                    backgroundColor: isActive ? COLORS.primary.main : undefined,
                    borderColor: isActive ? COLORS.primary.main : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {getViewLabel(view)}
                  {showCounts && count > 0 && (
                    <Badge 
                      count={count} 
                      style={{ 
                        backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : COLORS.primary.main,
                        color: isActive ? 'white' : 'white',
                        fontSize: '10px',
                        minWidth: '16px',
                        height: '16px',
                        lineHeight: '16px'
                      }} 
                    />
                  )}
                </Button>
              </Tooltip>
            );
          })}
        </Space>
      </div>
    </div>
  );
};

export default PersistentViewSwitcher;