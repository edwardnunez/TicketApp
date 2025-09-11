import React, { useState } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Typography, 
  Space, 
  Badge, 
  Input, 
  Select, 
  Tag,
  Collapse,
  notification
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  SortAscendingOutlined,
  SortDescendingOutlined,
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
  StarOutlined
} from '@ant-design/icons';
import { COLORS } from '../../../../components/colorscheme';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const MobileSeatList = ({
  seatMapData,
  selectedSeats,
  onSeatSelect,
  maxSeats,
  occupiedSeats,
  blockedSeats,
  blockedSections,
  formatPrice,
  event,
  calculateSeatPrice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('section'); // 'section', 'price', 'availability'
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'available', 'occupied', 'blocked'
  const [expandedSections, setExpandedSections] = useState(new Set());

  if (!seatMapData) return null;

  const { sections } = seatMapData;

  // Generar lista de asientos individuales
  const generateSeatList = () => {
    const seatList = [];
    
    sections.forEach(section => {
      const sectionBlocked = blockedSections?.includes(section.id);
      const sectionOccupiedSeats = occupiedSeats?.filter(seatId => seatId.startsWith(section.id)) || [];
      const sectionBlockedSeats = blockedSeats?.filter(seatId => seatId.startsWith(section.id)) || [];
      
      if (section.hasNumberedSeats) {
        // Función para obtener el número de fila correcto según la posición de la sección
        const getRowNumber = (rowIndex) => {
          // Determinar la posición de la sección basada en el nombre
          const sectionNameLower = section.name.toLowerCase();
          
          if (sectionNameLower.includes('norte') || sectionNameLower.includes('north')) {
            // Norte: numeración de abajo hacia arriba (1, 2, 3, 4, 5...)
            return rowIndex;
          } else if (sectionNameLower.includes('sur') || sectionNameLower.includes('south')) {
            // Sur: numeración de arriba hacia abajo (5, 4, 3, 2, 1...)
            return section.rows - rowIndex + 1;
          } else {
            // Este, Oeste, VIP, Gradas: numeración normal (1, 2, 3, 4, 5...)
            return rowIndex;
          }
        };

        // Asientos numerados
        for (let row = 1; row <= section.rows; row++) {
          for (let seat = 1; seat <= section.seatsPerRow; seat++) {
            const actualRowNumber = getRowNumber(row);
            const seatId = `${section.id}-${actualRowNumber}-${seat}`;
            const isOccupied = sectionOccupiedSeats.includes(seatId);
            const isBlocked = sectionBlockedSeats.includes(seatId) || sectionBlocked;
            const isSelected = selectedSeats?.some(s => s.id === seatId);
            
            // Calcular precio
            let seatPrice = section.defaultPrice;
            if (event && event.usesSectionPricing && event.sectionPricing?.length > 0) {
              const eventSectionPricing = event.sectionPricing.find(sp => sp.sectionId === section.id);
              if (eventSectionPricing) {
                if (event.usesRowPricing && eventSectionPricing.rowPricing?.length > 0) {
                  const rowPrice = eventSectionPricing.rowPricing.find(rp => rp.row === actualRowNumber);
                  if (rowPrice) {
                    seatPrice = rowPrice.price;
                  }
                } else {
                  seatPrice = eventSectionPricing.defaultPrice || section.defaultPrice;
                }
              }
            }
            
            seatList.push({
              id: seatId,
              sectionId: section.id,
              sectionName: section.name,
              sectionColor: section.color,
              sectionDefaultPrice: section.defaultPrice,
              row: actualRowNumber,
              seat: seat, // seat ya viene como 1, 2, 3... desde el bucle
              price: seatPrice,
              isOccupied,
              isBlocked,
              isSelected,
              isSectionBlocked: sectionBlocked,
              type: 'numbered'
            });
          }
        }
      } else {
        // Entrada general
        const totalCapacity = section.totalCapacity || 100;
        const occupiedCount = sectionOccupiedSeats.length;
        const availableCount = Math.max(totalCapacity - occupiedCount, 0);
        
        seatList.push({
          id: `${section.id}-GA`,
          sectionId: section.id,
          sectionName: section.name,
          sectionColor: section.color,
          sectionDefaultPrice: section.defaultPrice,
          row: null,
          seat: null,
          price: section.defaultPrice,
          isOccupied: false,
          isBlocked: sectionBlocked,
          isSelected: selectedSeats?.some(s => s.sectionId === section.id),
          isSectionBlocked: sectionBlocked,
          type: 'general',
          totalCapacity,
          occupiedCount,
          availableCount
        });
      }
    });
    
    return seatList;
  };

  const seatList = generateSeatList();

  // Filtrar y ordenar asientos
  const filteredAndSortedSeats = seatList
    .filter(seat => {
      // Filtro por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          seat.sectionName.toLowerCase().includes(searchLower) ||
          (seat.type === 'numbered' && (
            `fila ${seat.row}`.includes(searchLower) ||
            `asiento ${seat.seat}`.includes(searchLower)
          ))
        );
      }
      
      // Filtro por estado
      switch (filterBy) {
        case 'available':
          return !seat.isOccupied && !seat.isBlocked && !seat.isSectionBlocked;
        case 'occupied':
          return seat.isOccupied;
        case 'blocked':
          return seat.isBlocked || seat.isSectionBlocked;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'section':
          comparison = a.sectionName.localeCompare(b.sectionName);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'availability':
          if (a.isOccupied !== b.isOccupied) {
            comparison = a.isOccupied ? 1 : -1;
          } else if (a.isBlocked !== b.isBlocked) {
            comparison = a.isBlocked ? 1 : -1;
          } else {
            comparison = a.sectionName.localeCompare(b.sectionName);
          }
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Agrupar asientos por sección
  const groupedSeats = filteredAndSortedSeats.reduce((groups, seat) => {
    const sectionId = seat.sectionId;
    if (!groups[sectionId]) {
      groups[sectionId] = {
        section: {
          id: seat.sectionId,
          name: seat.sectionName,
          color: seat.sectionColor,
          isBlocked: seat.isSectionBlocked
        },
        seats: []
      };
    }
    groups[sectionId].seats.push(seat);
    return groups;
  }, {});

  const handleSeatClick = (seat) => {
    if (seat.isOccupied || seat.isBlocked || seat.isSectionBlocked) {
      notification.warning({
        message: 'Asiento no disponible',
        description: 'Este asiento no está disponible para selección.',
        placement: 'topRight'
      });
      return;
    }

    if (seat.isSelected) {
      // Deseleccionar
      const newSeats = selectedSeats.filter(s => s.id !== seat.id);
      onSeatSelect(newSeats);
    } else {
      // Seleccionar
      if (selectedSeats.length >= maxSeats) {
        notification.warning({
          message: 'Límite de asientos alcanzado',
          description: `Puedes seleccionar máximo ${maxSeats} asientos.`,
          placement: 'topRight'
        });
        return;
      }

      const seatData = {
        id: seat.id,
        section: seat.sectionName,
        sectionId: seat.sectionId,
        row: seat.row,
        seat: seat.seat,
        price: seat.price,
        isGeneralAdmission: seat.type === 'general'
      };

      onSeatSelect([...selectedSeats, seatData]);
    }
  };

  const getSeatStatus = (seat) => {
    if (seat.isSectionBlocked) return { status: 'blocked', text: 'Sección bloqueada', color: '#DC2626' };
    if (seat.isBlocked) return { status: 'blocked', text: 'Bloqueado', color: '#DC2626' };
    if (seat.isOccupied) return { status: 'occupied', text: 'Ocupado', color: '#9CA3AF' };
    if (seat.isSelected) return { status: 'selected', text: 'Seleccionado', color: COLORS.primary.main };
    return { status: 'available', text: 'Disponible', color: '#10B981' };
  };

  const getSeatIcon = (seat) => {
    if (seat.isSelected) return <CheckOutlined style={{ color: 'white' }} />;
    if (seat.isOccupied) return <CloseOutlined style={{ color: 'white' }} />;
    if (seat.isBlocked || seat.isSectionBlocked) return <LockOutlined style={{ color: 'white' }} />;
    if (seat.sectionDefaultPrice && seat.price > (seat.sectionDefaultPrice * 1.5)) return <StarOutlined style={{ color: 'white' }} />;
    return null;
  };

  const renderSeatItem = (seat) => {
    const status = getSeatStatus(seat);
    const isInteractable = !seat.isOccupied && !seat.isBlocked && !seat.isSectionBlocked;
    
    return (
      <List.Item
        key={seat.id}
        style={{
          padding: '12px 16px',
          backgroundColor: seat.isSelected ? `${COLORS.primary.main}10` : 'white',
          border: seat.isSelected ? `2px solid ${COLORS.primary.main}` : '1px solid #E5E7EB',
          borderRadius: '8px',
          marginBottom: '8px',
          cursor: isInteractable ? 'pointer' : 'not-allowed',
          opacity: isInteractable ? 1 : 0.6,
          transition: 'all 0.2s ease'
        }}
        onClick={() => handleSeatClick(seat)}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Indicador de estado */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: status.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {getSeatIcon(seat)}
            </div>
            
            {/* Información del asiento */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Text strong style={{ fontSize: '14px' }}>
                  {seat.sectionName}
                </Text>
                {seat.type === 'general' && (
                  <Badge count="GA" style={{ backgroundColor: '#10B981', fontSize: '10px' }} />
                )}
                {seat.sectionDefaultPrice && seat.price > (seat.sectionDefaultPrice * 1.5) && (
                  <StarOutlined style={{ color: '#FFD700', fontSize: '12px' }} />
                )}
              </div>
              
              <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                {seat.type === 'numbered' 
                  ? `Fila ${seat.row}, Asiento ${seat.seat}`
                  : `Entrada general (${seat.availableCount}/${seat.totalCapacity} disponibles)`
                }
              </Text>
            </div>
          </div>
          
          {/* Precio y estado */}
          <div style={{ textAlign: 'right' }}>
            <Text strong style={{ 
              fontSize: '16px', 
              color: COLORS.primary.main 
            }}>
              {formatPrice(seat.price)}
            </Text>
            <div style={{ marginTop: '4px' }}>
              <Tag 
                color={status.status === 'available' ? 'green' : 
                      status.status === 'selected' ? 'blue' : 
                      status.status === 'occupied' ? 'default' : 'red'}
                style={{ fontSize: '10px', margin: 0 }}
              >
                {status.text}
              </Tag>
            </div>
          </div>
        </div>
      </List.Item>
    );
  };


  return (
    <div style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>
          Seleccionar Asientos
        </Title>
        <Text style={{ color: COLORS.neutral.grey4 }}>
          {selectedSeats.length} de {maxSeats} asientos seleccionados
        </Text>
      </div>

      {/* Filtros y búsqueda */}
      <Card style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Search
            placeholder="Buscar por sección, fila o asiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
          />
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Select
              value={filterBy}
              onChange={setFilterBy}
              style={{ minWidth: '120px' }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Todos</Option>
              <Option value="available">Disponibles</Option>
              <Option value="occupied">Ocupados</Option>
              <Option value="blocked">Bloqueados</Option>
            </Select>
            
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ minWidth: '120px' }}
            >
              <Option value="section">Sección</Option>
              <Option value="price">Precio</Option>
              <Option value="availability">Disponibilidad</Option>
            </Select>
            
            <Button
              icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              size="small"
            />
          </div>
        </Space>
      </Card>

      {/* Lista de asientos agrupados por sección */}
      <Collapse
        activeKey={Array.from(expandedSections)}
        onChange={(keys) => {
          if (keys.length > 0) {
            setExpandedSections(new Set(keys));
          } else {
            setExpandedSections(new Set());
          }
        }}
        style={{ marginBottom: '16px' }}
      >
        {Object.values(groupedSeats).map(({ section, seats }) => (
          <Panel
            key={section.id}
            header={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: section.isBlocked ? '#D1D5DB' : section.color,
                    borderRadius: '50%'
                  }} />
                  <Text strong>{section.name}</Text>
                  <Badge count={seats.length} style={{ backgroundColor: section.color }} />
                </div>
                <Text style={{ color: COLORS.neutral.grey4, fontSize: '12px' }}>
                  {seats.filter(s => !s.isOccupied && !s.isBlocked && !s.isSectionBlocked).length} disponibles
                </Text>
              </div>
            }
          >
            <List
              dataSource={seats}
              renderItem={renderSeatItem}
              style={{ backgroundColor: 'transparent' }}
            />
          </Panel>
        ))}
      </Collapse>

      {/* Resumen de selección */}
      {selectedSeats.length > 0 && (
        <Card style={{ 
          backgroundColor: COLORS.primary.light + '10',
          border: `2px solid ${COLORS.primary.main}`
        }}>
          <Title level={5} style={{ margin: 0, marginBottom: '12px' }}>
            Resumen de Selección ({selectedSeats.length} asientos)
          </Title>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Total:</Text>
            <Text strong style={{ fontSize: '18px', color: COLORS.primary.main }}>
              {formatPrice(selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0))}
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MobileSeatList;
