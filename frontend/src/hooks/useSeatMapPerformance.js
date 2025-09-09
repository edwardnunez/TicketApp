import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Hook personalizado para optimizar el rendimiento de los mapas de asientos
 */
export const useSeatMapPerformance = ({
  seatMapData,
  selectedSeats,
  occupiedSeats,
  blockedSeats,
  blockedSections,
  isMobile = false,
  isTablet = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [renderCount, setRenderCount] = useState(0);
  const lastUpdateRef = useRef(Date.now());
  const debounceTimeoutRef = useRef(null);

  // Memoizar datos procesados para evitar recálculos innecesarios
  const processedData = useMemo(() => {
    if (!seatMapData) return null;

    const { sections, config, type, name } = seatMapData;
    
    // Procesar secciones con datos optimizados
    const processedSections = sections.map(section => ({
      ...section,
      // Pre-calcular capacidades
      computedCapacity: section.hasNumberedSeats 
        ? (section.rows * section.seatsPerRow)
        : (section.totalCapacity || 0),
      // Pre-calcular estados
      isBlocked: blockedSections?.includes(section.id) || false,
      // Pre-filtrar asientos ocupados y bloqueados
      occupiedSeats: occupiedSeats?.filter(seatId => seatId.startsWith(section.id)) || [],
      blockedSeats: blockedSeats?.filter(seatId => seatId.startsWith(section.id)) || []
    }));

    return {
      sections: processedSections,
      config,
      type,
      name,
      totalCapacity: processedSections.reduce((sum, section) => sum + section.computedCapacity, 0)
    };
  }, [seatMapData, occupiedSeats, blockedSeats, blockedSections]);

  // Memoizar configuración de renderizado basada en dispositivo
  const renderConfig = useMemo(() => {
    const baseConfig = {
      seatSize: { width: 24, height: 24, fontSize: 10 },
      maxSeatsPerRow: 25,
      enableAnimations: true,
      enableHoverEffects: true
    };

    if (isMobile) {
      return {
        ...baseConfig,
        seatSize: { width: 16, height: 16, fontSize: 8 },
        maxSeatsPerRow: 15,
        enableAnimations: false,
        enableHoverEffects: false
      };
    } else if (isTablet) {
      return {
        ...baseConfig,
        seatSize: { width: 20, height: 20, fontSize: 9 },
        maxSeatsPerRow: 20,
        enableAnimations: true,
        enableHoverEffects: true
      };
    }

    return baseConfig;
  }, [isMobile, isTablet]);

  // Función optimizada para verificar estado de asiento
  const getSeatState = useCallback((seatId, sectionId) => {
    const isOccupied = occupiedSeats?.includes(seatId) || false;
    const isBlocked = blockedSeats?.includes(seatId) || false;
    const isSectionBlocked = blockedSections?.includes(sectionId) || false;
    const isSelected = selectedSeats?.some(s => s.id === seatId) || false;

    if (isOccupied) return 'occupied';
    if (isBlocked || isSectionBlocked) return 'blocked';
    if (isSelected) return 'selected';
    return 'available';
  }, [occupiedSeats, blockedSeats, blockedSections, selectedSeats]);

  // Función optimizada para manejar clics en asientos
  const handleSeatClick = useCallback((row, seat, sectionId, sectionName, onSeatSelect, maxSeats, getSeatPrice) => {
    const seatId = `${sectionId}-${row + 1}-${seat + 1}`;
    const state = getSeatState(seatId, sectionId);
    
    if (state !== 'available') return;

    const seatPrice = getSeatPrice(row, seat);
    const seatData = {
      id: seatId,
      section: sectionName,
      sectionId,
      row: row + 1,
      seat: seat + 1,
      price: seatPrice
    };

    if (selectedSeats?.some(s => s.id === seatId)) {
      onSeatSelect(selectedSeats.filter(s => s.id !== seatId));
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect([...selectedSeats, seatData]);
    }
  }, [getSeatState, selectedSeats]);

  // Debounce para actualizaciones frecuentes
  const debouncedUpdate = useCallback((callback, delay = 100) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      callback();
      lastUpdateRef.current = Date.now();
    }, delay);
  }, []);

  // Optimizar re-renders con throttling
  const throttledRender = useCallback((callback, limit = 16) => {
    const now = Date.now();
    if (now - lastUpdateRef.current >= limit) {
      callback();
      lastUpdateRef.current = now;
    }
  }, []);

  // Memoizar estadísticas del mapa
  const mapStats = useMemo(() => {
    if (!processedData) return null;

    const totalSeats = processedData.totalCapacity;
    const occupiedCount = occupiedSeats?.length || 0;
    const selectedCount = selectedSeats?.length || 0;
    const blockedCount = blockedSeats?.length || 0;
    const availableCount = totalSeats - occupiedCount - blockedCount;

    return {
      totalSeats,
      occupiedCount,
      selectedCount,
      blockedCount,
      availableCount,
      occupancyRate: totalSeats > 0 ? (occupiedCount / totalSeats) * 100 : 0,
      availabilityRate: totalSeats > 0 ? (availableCount / totalSeats) * 100 : 0
    };
  }, [processedData, occupiedSeats, selectedSeats, blockedSeats]);

  // Memoizar secciones agrupadas por tipo
  const groupedSections = useMemo(() => {
    if (!processedData) return {};

    const groups = {
      numbered: [],
      general: [],
      vip: [],
      accessible: []
    };

    processedData.sections.forEach(section => {
      if (section.hasNumberedSeats) {
        if (section.name.toLowerCase().includes('vip') || section.name.toLowerCase().includes('premium')) {
          groups.vip.push(section);
        } else if (section.name.toLowerCase().includes('accesible') || section.name.toLowerCase().includes('accessible')) {
          groups.accessible.push(section);
        } else {
          groups.numbered.push(section);
        }
      } else {
        groups.general.push(section);
      }
    });

    return groups;
  }, [processedData]);

  // Efecto para manejar carga inicial
  useEffect(() => {
    setIsLoading(true);
    
    // Simular tiempo de carga para animaciones suaves
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      setRenderCount(prev => prev + 1);
    }, 100);

    return () => clearTimeout(loadTimer);
  }, [seatMapData]);

  // Efecto para limpiar timeouts
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Función para obtener información de rendimiento
  const getPerformanceInfo = useCallback(() => {
    return {
      renderCount,
      lastUpdate: lastUpdateRef.current,
      isLoading,
      processedSectionsCount: processedData?.sections.length || 0,
      totalSeats: mapStats?.totalSeats || 0,
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    };
  }, [renderCount, isLoading, processedData, mapStats]);

  return {
    // Datos procesados
    processedData,
    renderConfig,
    mapStats,
    groupedSections,
    
    // Estados
    isLoading,
    renderCount,
    
    // Funciones optimizadas
    getSeatState,
    handleSeatClick,
    debouncedUpdate,
    throttledRender,
    getPerformanceInfo,
    
    // Utilidades
    isHighPerformance: !isMobile && !isTablet,
    shouldOptimize: isMobile || (mapStats?.totalSeats > 500)
  };
};

export default useSeatMapPerformance;




