import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Select, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  Slider, 
  Switch, 
  Tooltip,
  Badge,
  Divider
} from 'antd';
import { 
  FilterOutlined, 
  StarOutlined, 
  DollarOutlined, 
  TeamOutlined,
  EyeOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { COLORS } from './colorscheme';

const { Title, Text } = Typography;
const { Option } = Select;

const SmartSeatFilters = ({
  sections = [],
  selectedSeats = [],
  onFilterChange,
  onSmartSelect,
  formatPrice,
  event = null,
  style = {}
}) => {
  const [filters, setFilters] = useState({
    section: 'all',
    priceRange: [0, 1000],
    sortBy: 'price', // 'price', 'proximity', 'availability'
    sortOrder: 'asc',
    showOnlyAvailable: true,
    showOnlyAccessible: false,
    groupSize: 1
  });

  const [smartSelectMode, setSmartSelectMode] = useState(null);
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Función para obtener el precio correcto de la sección
  const getSectionPrice = (section) => {
    if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
      const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
      if (eventSectionPricing) {
        return eventSectionPricing.defaultPrice || section.defaultPrice || 0;
      }
    }
    return section.defaultPrice || 0;
  };

  // Calcular estadísticas de secciones
  const sectionStats = useMemo(() => {
    return sections.map(section => {
      const totalSeats = section.hasNumberedSeats 
        ? (section.rows * section.seatsPerRow)
        : (section.totalCapacity || 0);
      
      const occupiedSeats = section.occupiedSeats || 0;
      const blockedSeats = section.blockedSeats || 0;
      const availableSeats = Math.max(0, totalSeats - occupiedSeats - blockedSeats);
      
      const correctPrice = getSectionPrice(section);
      
      return {
        ...section,
        totalSeats,
        occupiedSeats,
        blockedSeats,
        availableSeats,
        occupancyRate: totalSeats > 0 ? ((occupiedSeats + blockedSeats) / totalSeats) * 100 : 0,
        isFullyOccupied: availableSeats === 0,
        isBlocked: section.isBlocked || false,
        defaultPrice: correctPrice,
        priceRange: section.priceRange || [correctPrice, correctPrice]
      };
    });
  }, [sections]);

  // Calcular rangos de precios
  const priceRanges = useMemo(() => {
    const allPrices = sectionStats.flatMap(section => [
      section.defaultPrice || 0,
      ...(section.priceRange || [])
    ]);
    
    if (allPrices.length === 0) return [0, 100];
    
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    
    return [minPrice, maxPrice];
  }, [sectionStats]);

  // Aplicar filtros solo cuando estén aplicados
  const filteredSections = useMemo(() => {
    if (!filtersApplied) {
      return sectionStats; // Mostrar todas las secciones si no se han aplicado filtros
    }

    let filtered = sectionStats;

    // Filtro por sección
    if (filters.section !== 'all') {
      filtered = filtered.filter(section => section.id === filters.section);
    }

    // Filtro por rango de precios
    filtered = filtered.filter(section => {
      const sectionPrice = section.defaultPrice || 0;
      return sectionPrice >= filters.priceRange[0] && sectionPrice <= filters.priceRange[1];
    });

    // Filtro por disponibilidad
    if (filters.showOnlyAvailable) {
      filtered = filtered.filter(section => section.availableSeats > 0 && !section.isBlocked);
    }

    // Filtro por accesibilidad
    if (filters.showOnlyAccessible) {
      filtered = filtered.filter(section => section.accessible || false);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'price':
          comparison = (a.defaultPrice || 0) - (b.defaultPrice || 0);
          break;
        case 'proximity':
          comparison = (a.proximity || 0) - (b.proximity || 0);
          break;
        case 'availability':
          comparison = b.availableSeats - a.availableSeats;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [sectionStats, filters, filtersApplied]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleSmartSelect = (mode) => {
    setSmartSelectMode(mode);
    if (onSmartSelect) {
      onSmartSelect(mode, filteredSections);
    }
  };

  const applyFilters = () => {
    setFiltersApplied(true);
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  const clearFilters = () => {
    setFiltersApplied(false);
    const defaultFilters = {
      section: 'all',
      priceRange: priceRanges,
      sortBy: 'price',
      sortOrder: 'asc',
      showOnlyAvailable: true,
      showOnlyAccessible: false,
      groupSize: 1
    };
    setFilters(defaultFilters);
    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
  };

  const resetFilters = () => {
    clearFilters();
  };

  const getSectionStatus = (section) => {
    if (section.isBlocked) return { status: 'blocked', text: 'Bloqueada', color: '#ff4d4f' };
    if (section.isFullyOccupied) return { status: 'soldout', text: 'Agotada', color: '#faad14' };
    if (section.occupancyRate > 80) return { status: 'limited', text: 'Pocas disponibles', color: '#faad14' };
    return { status: 'available', text: 'Disponible', color: '#52c41a' };
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FilterOutlined />
          <span>Filtros Inteligentes</span>
          <Badge count={filteredSections.length} style={{ backgroundColor: COLORS.primary.main }} />
        </div>
      }
      style={{ marginBottom: '16px', ...style }}
      extra={
        <Button 
          size="small" 
          icon={<ReloadOutlined />} 
          onClick={resetFilters}
        >
          Reset
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Filtros básicos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Filtro por sección */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: '4px' }}>Sección</Text>
            <Select
              value={filters.section}
              onChange={(value) => handleFilterChange('section', value)}
              style={{ width: '100%' }}
            >
              <Option value="all">Todas las secciones</Option>
              {sectionStats.map(section => {
                const status = getSectionStatus(section);
                return (
                  <Option key={section.id} value={section.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: status.color,
                        borderRadius: '50%'
                      }} />
                      <span>{section.name}</span>
                      <Tag size="small" color={status.color}>
                        {section.availableSeats}
                      </Tag>
                    </div>
                  </Option>
                );
              })}
            </Select>
          </div>

          {/* Filtro por precio */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: '4px' }}>
              Rango de Precios: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
            </Text>
            <Slider
              range
              min={priceRanges[0]}
              max={priceRanges[1]}
              value={filters.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
              marks={{
                [priceRanges[0]]: formatPrice(priceRanges[0]),
                [priceRanges[1]]: formatPrice(priceRanges[1])
              }}
            />
          </div>

          {/* Ordenar por */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: '4px' }}>Ordenar por</Text>
            <Select
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
              style={{ width: '100%' }}
            >
              <Option value="price">
                <DollarOutlined /> Precio
              </Option>
              <Option value="proximity">
                <EyeOutlined /> Proximidad al escenario
              </Option>
              <Option value="availability">
                <TeamOutlined /> Disponibilidad
              </Option>
            </Select>
          </div>

          {/* Orden */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: '4px' }}>Orden</Text>
            <Button.Group>
              <Button
                type={filters.sortOrder === 'asc' ? 'primary' : 'default'}
                icon={<SortAscendingOutlined />}
                onClick={() => handleFilterChange('sortOrder', 'asc')}
              >
                Ascendente
              </Button>
              <Button
                type={filters.sortOrder === 'desc' ? 'primary' : 'default'}
                icon={<SortDescendingOutlined />}
                onClick={() => handleFilterChange('sortOrder', 'desc')}
              >
                Descendente
              </Button>
            </Button.Group>
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Filtros avanzados */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Switch
              checked={filters.showOnlyAvailable}
              onChange={(checked) => handleFilterChange('showOnlyAvailable', checked)}
            />
            <Text>Solo disponibles</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Switch
              checked={filters.showOnlyAccessible}
              onChange={(checked) => handleFilterChange('showOnlyAccessible', checked)}
            />
            <Text>Accesibles</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text>Grupo de:</Text>
            <Select
              value={filters.groupSize}
              onChange={(value) => handleFilterChange('groupSize', value)}
              style={{ width: '80px' }}
            >
              {[1, 2, 3, 4, 5, 6].map(size => (
                <Option key={size} value={size}>{size}</Option>
              ))}
            </Select>
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Botones de acción */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Selección Inteligente</Text>
            <Space wrap>
              <Tooltip title="Encuentra el asiento más barato disponible">
                <Button
                  type={smartSelectMode === 'cheapest' ? 'primary' : 'default'}
                  icon={<DollarOutlined />}
                  onClick={() => handleSmartSelect('cheapest')}
                >
                  Más Barato
                </Button>
              </Tooltip>

              <Tooltip title="Encuentra el mejor asiento según proximidad al escenario">
                <Button
                  type={smartSelectMode === 'best' ? 'primary' : 'default'}
                  icon={<StarOutlined />}
                  onClick={() => handleSmartSelect('best')}
                >
                  Mejor Vista
                </Button>
              </Tooltip>

              <Tooltip title="Encuentra asientos contiguos para tu grupo">
                <Button
                  type={smartSelectMode === 'group' ? 'primary' : 'default'}
                  icon={<TeamOutlined />}
                  onClick={() => handleSmartSelect('group')}
                >
                  Asientos Juntos
                </Button>
              </Tooltip>
            </Space>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={applyFilters}
              disabled={filtersApplied}
              style={{ backgroundColor: COLORS.primary.main, borderColor: COLORS.primary.main }}
            >
              Buscar
            </Button>
            <Button
              onClick={clearFilters}
              disabled={!filtersApplied}
            >
              Limpiar
            </Button>
          </div>
        </div>

        {/* Resumen de resultados */}
        <div style={{ 
          padding: '12px', 
          backgroundColor: filtersApplied ? COLORS.primary.light + '20' : COLORS.neutral.grey1, 
          borderRadius: '8px',
          border: filtersApplied ? `1px solid ${COLORS.primary.main}40` : '1px solid transparent',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Text>
              <strong>{filteredSections.length}</strong> secciones {filtersApplied ? 'filtradas' : 'disponibles'}
            </Text>
            {filtersApplied && (
              <div style={{ marginTop: '4px' }}>
                <Tag color="blue" size="small">
                  Filtros aplicados
                </Tag>
              </div>
            )}
          </div>
          <Text style={{ color: COLORS.neutral.grey4 }}>
            {filteredSections.reduce((total, section) => total + section.availableSeats, 0)} asientos disponibles
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default SmartSeatFilters;