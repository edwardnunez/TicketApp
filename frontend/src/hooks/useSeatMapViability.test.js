import { renderHook } from '@testing-library/react';
import useSeatMapViability from './useSeatMapViability';

// Mock del hook useDeviceDetection
jest.mock('./useDeviceDetection');
import useDeviceDetection from './useDeviceDetection';

describe('useSeatMapViability', () => {
  beforeEach(() => {
    // Mock por defecto para dispositivo desktop
    useDeviceDetection.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1920,
      screenHeight: 1080,
      deviceType: 'desktop'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('debe retornar valores por defecto cuando no hay seatMapData', () => {
    const { result } = renderHook(() => useSeatMapViability(null));

    expect(result.current.isViable).toBe(true);
    expect(result.current.minRequiredWidth).toBe(0);
    expect(result.current.minRequiredHeight).toBe(0);
  });

  test('debe calcular dimensiones para un mapa de cine', () => {
    const seatMapData = {
      type: 'cinema',
      sections: [
        { id: 'section1', rows: 10, seatsPerRow: 15 },
        { id: 'section2', rows: 8, seatsPerRow: 12 }
      ]
    };

    const { result } = renderHook(() => useSeatMapViability(seatMapData));

    expect(result.current.minRequiredWidth).toBeGreaterThan(0);
    expect(result.current.minRequiredHeight).toBeGreaterThan(0);
    expect(result.current.isViable).toBe(true);
  });

  test('debe calcular dimensiones para un estadio', () => {
    const seatMapData = {
      type: 'stadium',
      sections: [
        { id: 'norte', rows: 20, seatsPerRow: 30 },
        { id: 'sur', rows: 20, seatsPerRow: 30 },
        { id: 'este', rows: 15, seatsPerRow: 20 },
        { id: 'oeste', rows: 15, seatsPerRow: 20 }
      ]
    };

    const { result } = renderHook(() => useSeatMapViability(seatMapData));

    expect(result.current.minRequiredWidth).toBeGreaterThan(0);
    expect(result.current.minRequiredHeight).toBeGreaterThan(0);
  });

  test('debe detectar cuando el mapa es inviable en móvil', () => {
    // Simular dispositivo móvil
    useDeviceDetection.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      screenWidth: 375,
      screenHeight: 667,
      deviceType: 'mobile'
    });

    const seatMapData = {
      type: 'stadium',
      sections: [
        { id: 'section1', rows: 30, seatsPerRow: 40 },
        { id: 'section2', rows: 30, seatsPerRow: 40 },
        { id: 'section3', rows: 30, seatsPerRow: 40 },
        { id: 'section4', rows: 30, seatsPerRow: 40 }
      ]
    };

    const { result } = renderHook(() => useSeatMapViability(seatMapData));

    expect(result.current.isViable).toBe(false);
    expect(result.current.reason).toBeTruthy();
    expect(result.current.recommendedView).toBe('list');
  });

  test('debe recomendar vista de bloques para tablet con mapa complejo', () => {
    // Simular tablet
    useDeviceDetection.mockReturnValue({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      screenWidth: 768,
      screenHeight: 1024,
      deviceType: 'tablet'
    });

    const seatMapData = {
      type: 'stadium',
      sections: Array(8).fill(null).map((_, i) => ({
        id: `section${i}`,
        rows: 20,
        seatsPerRow: 22
      }))
    };

    const { result } = renderHook(() => useSeatMapViability(seatMapData));

    if (!result.current.isViable) {
      expect(result.current.recommendedView).toBe('blocks');
    }
  });

  test('debe calcular el factor de escala correctamente', () => {
    const seatMapData = {
      type: 'cinema',
      sections: [
        { id: 'section1', rows: 10, seatsPerRow: 15 }
      ]
    };

    const { result } = renderHook(() => useSeatMapViability(seatMapData));

    expect(result.current.scaleFactor).toBeGreaterThan(0);
    expect(result.current.scaleFactor).toBeLessThanOrEqual(1);
  });

  test('debe detectar superposiciones en secciones muy grandes', () => {
    const seatMapData = {
      type: 'cinema',
      sections: [
        { id: 'section1', rows: 50, seatsPerRow: 50 } // Área = 2500 > 500 (máximo razonable)
      ]
    };

    const { result } = renderHook(() => useSeatMapViability(seatMapData));

    expect(result.current.hasOverlaps).toBe(true);
    expect(result.current.overlapCount).toBeGreaterThan(0);
  });

  test('debe recomendar vista zoomed para escala menor a 0.6', () => {
    // Simular pantalla pequeña
    useDeviceDetection.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 800,
      screenHeight: 600,
      deviceType: 'desktop'
    });

    const seatMapData = {
      type: 'stadium',
      sections: [
        { id: 'section1', rows: 20, seatsPerRow: 30 },
        { id: 'section2', rows: 20, seatsPerRow: 30 }
      ]
    };

    const { result } = renderHook(() => useSeatMapViability(seatMapData));

    if (result.current.scaleFactor < 0.6 && result.current.scaleFactor >= 0.3) {
      expect(result.current.recommendedView).toBe('zoomed');
    }
  });

  test('debe usar dimensiones del contenedor si se proporcionan', () => {
    const seatMapData = {
      type: 'cinema',
      sections: [
        { id: 'section1', rows: 10, seatsPerRow: 15 }
      ]
    };

    const containerDimensions = { width: 1200, height: 800 };

    const { result } = renderHook(() =>
      useSeatMapViability(seatMapData, containerDimensions)
    );

    expect(result.current.scaleFactor).toBeGreaterThan(0);
  });

  test('debe manejar mapas genéricos correctamente', () => {
    const seatMapData = {
      type: 'generic',
      sections: [
        { id: 'section1', rows: 10, seatsPerRow: 12 },
        { id: 'section2', rows: 8, seatsPerRow: 10 },
        { id: 'section3', rows: 12, seatsPerRow: 14 }
      ]
    };

    const { result } = renderHook(() => useSeatMapViability(seatMapData));

    expect(result.current.minRequiredWidth).toBeGreaterThan(0);
    expect(result.current.minRequiredHeight).toBeGreaterThan(0);
  });

  test('debe detectar cuando la escala es demasiado pequeña', () => {
    // Simular pantalla muy pequeña
    useDeviceDetection.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      screenWidth: 320,
      screenHeight: 568,
      deviceType: 'mobile'
    });

    const seatMapData = {
      type: 'stadium',
      sections: Array(8).fill(null).map((_, i) => ({
        id: `section${i}`,
        rows: 30,
        seatsPerRow: 40
      }))
    };

    const { result } = renderHook(() => useSeatMapViability(seatMapData));

    if (result.current.scaleFactor < 0.3) {
      expect(result.current.isViable).toBe(false);
      expect(result.current.reason).toContain('pequeño');
    }
  });
});
