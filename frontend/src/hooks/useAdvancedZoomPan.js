import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook avanzado para zoom y pan con soporte completo para gestos táctiles
 * Incluye pinch-to-zoom, touch drag, mouse wheel zoom, y mouse drag
 *
 * @param {Object} options - Opciones de configuración
 * @param {number} options.minZoom - Nivel mínimo de zoom (default: 0.3)
 * @param {number} options.maxZoom - Nivel máximo de zoom (default: 2.5)
 * @param {number} options.initialZoom - Nivel inicial de zoom (default: 0.7)
 * @param {number} options.zoomStep - Paso de zoom para botones (default: 0.2)
 * @param {boolean} options.enableMouseWheel - Habilitar zoom con rueda del mouse (default: true)
 * @param {boolean} options.enablePinch - Habilitar pinch-to-zoom (default: true)
 * @param {boolean} options.enablePan - Habilitar pan/drag (default: true)
 * @returns {Object} Estado y funciones de control
 */
const useAdvancedZoomPan = ({
  minZoom = 0.3,
  maxZoom = 2.5,
  initialZoom = 0.7,
  zoomStep = 0.2,
  enableMouseWheel = true,
  enablePinch = true,
  enablePan = true
} = {}) => {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isTouching, setIsTouching] = useState(false);

  // Referencias para almacenar el estado de los gestos
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchDistanceRef = useRef(0);
  const lastTouchesRef = useRef([]);
  const dragStartRef = useRef({ x: 0, y: 0 });

  /**
   * Calcula la distancia entre dos puntos táctiles
   */
  const getTouchDistance = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  /**
   * Calcula el punto medio entre dos puntos táctiles
   */
  const getTouchMidpoint = useCallback((touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }, []);

  /**
   * Limita el nivel de zoom entre min y max
   */
  const clampZoom = useCallback((zoom) => {
    return Math.max(minZoom, Math.min(maxZoom, zoom));
  }, [minZoom, maxZoom]);

  /**
   * Zoom in (aumentar)
   */
  const zoomIn = useCallback(() => {
    setZoomLevel(prev => clampZoom(prev + zoomStep));
  }, [clampZoom, zoomStep]);

  /**
   * Zoom out (disminuir)
   */
  const zoomOut = useCallback(() => {
    setZoomLevel(prev => clampZoom(prev - zoomStep));
  }, [clampZoom, zoomStep]);

  /**
   * Reset zoom y pan a valores iniciales
   */
  const reset = useCallback(() => {
    setZoomLevel(initialZoom);
    setPanOffset({ x: 0, y: 0 });
  }, [initialZoom]);

  /**
   * Ajustar zoom a un nivel específico
   */
  const setZoom = useCallback((zoom) => {
    setZoomLevel(clampZoom(zoom));
  }, [clampZoom]);

  /**
   * Handler para zoom con mouse wheel
   */
  const handleWheel = useCallback((e) => {
    if (!enableMouseWheel) return;

    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => clampZoom(prev + delta));
  }, [enableMouseWheel, clampZoom]);

  /**
   * Handler para inicio de touch
   */
  const handleTouchStart = useCallback((e) => {
    if (!enablePinch && !enablePan) return;

    const touches = Array.from(e.touches);
    lastTouchesRef.current = touches;

    if (touches.length === 1) {
      // Single touch - pan
      if (enablePan) {
        setIsTouching(true);
        touchStartRef.current = {
          x: touches[0].clientX - panOffset.x,
          y: touches[0].clientY - panOffset.y
        };
      }
    } else if (touches.length === 2) {
      // Two finger touch - pinch to zoom
      if (enablePinch) {
        setIsTouching(true);
        touchDistanceRef.current = getTouchDistance(touches[0], touches[1]);
      }
    }
  }, [enablePan, enablePinch, panOffset, getTouchDistance]);

  /**
   * Handler para movimiento de touch
   */
  const handleTouchMove = useCallback((e) => {
    if (!isTouching) return;

    e.preventDefault();

    const touches = Array.from(e.touches);

    if (touches.length === 1 && enablePan) {
      // Single touch - pan
      setPanOffset({
        x: touches[0].clientX - touchStartRef.current.x,
        y: touches[0].clientY - touchStartRef.current.y
      });
    } else if (touches.length === 2 && enablePinch) {
      // Two finger touch - pinch to zoom
      const currentDistance = getTouchDistance(touches[0], touches[1]);
      const previousDistance = touchDistanceRef.current;

      if (previousDistance > 0) {
        const scale = currentDistance / previousDistance;
        setZoomLevel(prev => clampZoom(prev * scale));
      }

      touchDistanceRef.current = currentDistance;

      // También permitir pan mientras se hace pinch (con el punto medio)
      if (enablePan && lastTouchesRef.current.length === 2) {
        const currentMidpoint = getTouchMidpoint(touches[0], touches[1]);
        const previousMidpoint = getTouchMidpoint(
          lastTouchesRef.current[0],
          lastTouchesRef.current[1]
        );

        setPanOffset(prev => ({
          x: prev.x + (currentMidpoint.x - previousMidpoint.x),
          y: prev.y + (currentMidpoint.y - previousMidpoint.y)
        }));
      }
    }

    lastTouchesRef.current = touches;
  }, [isTouching, enablePan, enablePinch, getTouchDistance, getTouchMidpoint, clampZoom]);

  /**
   * Handler para fin de touch
   */
  const handleTouchEnd = useCallback((e) => {
    const touches = Array.from(e.touches);

    if (touches.length === 0) {
      setIsTouching(false);
      touchDistanceRef.current = 0;
      lastTouchesRef.current = [];
    } else if (touches.length === 1) {
      // Si queda un dedo, reiniciar para pan
      touchStartRef.current = {
        x: touches[0].clientX - panOffset.x,
        y: touches[0].clientY - panOffset.y
      };
      touchDistanceRef.current = 0;
    }

    lastTouchesRef.current = touches;
  }, [panOffset]);

  /**
   * Handler para inicio de mouse drag
   */
  const handleMouseDown = useCallback((e) => {
    if (!enablePan) return;

    // Solo permitir drag con botón izquierdo
    if (e.button !== 0) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    };
  }, [enablePan, panOffset]);

  /**
   * Handler para movimiento de mouse drag
   */
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  }, [isDragging]);

  /**
   * Handler para fin de mouse drag
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Event listeners para mouse drag (global)
   */
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    // Estado
    zoomLevel,
    panOffset,
    isDragging,
    isTouching,
    isInteracting: isDragging || isTouching,

    // Funciones de control
    zoomIn,
    zoomOut,
    reset,
    setZoom,

    // Event handlers
    handlers: {
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
    },

    // Configuración
    config: {
      minZoom,
      maxZoom,
      zoomStep
    }
  };
};

export default useAdvancedZoomPan;
