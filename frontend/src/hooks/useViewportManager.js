import { useState, useEffect, useCallback, useRef } from 'react';
import useDeviceDetection from './useDeviceDetection';
import useSeatMapViability from './useSeatMapViability';

const useViewportManager = (seatMapData, containerRef = null) => {
  const deviceInfo = useDeviceDetection();
  const viability = useSeatMapViability(seatMapData);
  const [viewport, setViewport] = useState({
    scale: 1,
    panX: 0,
    panY: 0,
    width: 0,
    height: 0,
    isFullscreen: false
  });
  
  const [viewMode, setViewMode] = useState('auto'); // 'auto', 'full', 'zoomed', 'blocks', 'simplified', 'list'
  const [isInitialized, setIsInitialized] = useState(false);
  const animationFrameRef = useRef(null);

  // Calcular dimensiones del contenedor
  const updateContainerDimensions = useCallback(() => {
    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setViewport(prev => ({
        ...prev,
        width: rect.width,
        height: rect.height
      }));
    } else {
      setViewport(prev => ({
        ...prev,
        width: deviceInfo.screenWidth,
        height: deviceInfo.screenHeight - 200 // Restar espacio para UI
      }));
    }
  }, [containerRef, deviceInfo]);

  // Determinar el modo de vista óptimo
  const determineOptimalViewMode = useCallback(() => {
    if (!viability.isViable) {
      return viability.recommendedView;
    }

    // Si el mapa es viable pero necesita zoom
    if (viability.scaleFactor < 0.8) {
      return 'zoomed';
    }

    // Para dispositivos móviles, preferir vista de bloques si hay muchas secciones
    if (deviceInfo.isMobile && seatMapData?.sections?.length > 4) {
      return 'blocks';
    }

    // Para tablets con mapas complejos
    if (deviceInfo.isTablet && viability.scaleFactor < 0.9) {
      return 'blocks';
    }

    // Vista completa para desktop
    return 'full';
  }, [viability, deviceInfo, seatMapData]);

  // Calcular escala óptima
  const calculateOptimalScale = useCallback(() => {
    if (viewMode === 'full' || viewMode === 'auto') {
      return Math.max(0.3, Math.min(1.0, viability.scaleFactor));
    }
    
    if (viewMode === 'zoomed') {
      return Math.max(0.5, viability.scaleFactor);
    }
    
    return 1.0; // Para vistas alternativas
  }, [viewMode, viability.scaleFactor]);

  // Centrar el contenido en el viewport
  const centerContent = useCallback((scale = viewport.scale) => {
    if (!seatMapData || !viability.minRequiredWidth || !viability.minRequiredHeight) {
      return { x: 0, y: 0 };
    }

    const scaledWidth = viability.minRequiredWidth * scale;
    const scaledHeight = viability.minRequiredHeight * scale;
    
    const centerX = (viewport.width - scaledWidth) / 2;
    const centerY = (viewport.height - scaledHeight) / 2;
    
    return {
      x: Math.max(0, centerX),
      y: Math.max(0, centerY)
    };
  }, [viewport, viability, seatMapData]);

  // Ajustar viewport automáticamente
  const adjustViewport = useCallback(() => {
    const optimalViewMode = determineOptimalViewMode();
    const optimalScale = calculateOptimalScale();
    const center = centerContent(optimalScale);

    setViewMode(optimalViewMode);
    setViewport(prev => ({
      ...prev,
      scale: optimalScale,
      panX: center.x,
      panY: center.y
    }));
  }, [determineOptimalViewMode, calculateOptimalScale, centerContent]);

  // Inicializar viewport
  useEffect(() => {
    if (!isInitialized && seatMapData) {
      updateContainerDimensions();
      adjustViewport();
      setIsInitialized(true);
    }
  }, [seatMapData, isInitialized, updateContainerDimensions, adjustViewport]);

  // Actualizar cuando cambien las dimensiones del dispositivo
  useEffect(() => {
    const handleResize = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        updateContainerDimensions();
        adjustViewport();
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateContainerDimensions, adjustViewport]);

  // Actualizar cuando cambie la viabilidad
  useEffect(() => {
    if (isInitialized) {
      adjustViewport();
    }
  }, [viability, isInitialized, adjustViewport]);

  // Funciones de control del viewport
  const setScale = useCallback((newScale) => {
    const clampedScale = Math.max(0.1, Math.min(2.0, newScale));
    const center = centerContent(clampedScale);
    
    setViewport(prev => ({
      ...prev,
      scale: clampedScale,
      panX: center.x,
      panY: center.y
    }));
  }, [centerContent]);

  const setPan = useCallback((x, y) => {
    setViewport(prev => ({
      ...prev,
      panX: x,
      panY: y
    }));
  }, []);

  const setViewMode = useCallback((mode) => {
    setViewMode(mode);
    if (mode !== 'auto') {
      adjustViewport();
    }
  }, [adjustViewport]);

  const resetViewport = useCallback(() => {
    adjustViewport();
  }, [adjustViewport]);

  const fitToScreen = useCallback(() => {
    const optimalScale = Math.min(1.0, Math.min(
      viewport.width / viability.minRequiredWidth,
      viewport.height / viability.minRequiredHeight
    ));
    setScale(optimalScale);
  }, [viewport, viability, setScale]);

  // Detectar si está en pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setViewport(prev => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return {
    viewport,
    viewMode,
    viability,
    isInitialized,
    setScale,
    setPan,
    setViewMode,
    resetViewport,
    fitToScreen,
    centerContent,
    adjustViewport
  };
};

export default useViewportManager;
