import { renderHook, act } from '@testing-library/react';
import useDeviceDetection from './useDeviceDetection';

describe('useDeviceDetection', () => {
  // Guardar el innerWidth/innerHeight original
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  // Helper para simular resize
  const resizeWindow = (width, height) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  };

  afterEach(() => {
    // Restaurar valores originales
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  test('debe inicializar con los valores correctos', () => {
    resizeWindow(1024, 768);
    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.screenWidth).toBe(1024);
    expect(result.current.screenHeight).toBe(768);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.deviceType).toBe('desktop');
  });

  test('debe detectar dispositivo móvil (< 768px)', () => {
    resizeWindow(375, 667);
    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.deviceType).toBe('mobile');
    expect(result.current.screenWidth).toBe(375);
    expect(result.current.screenHeight).toBe(667);
  });

  test('debe detectar tablet (768px - 1023px)', () => {
    resizeWindow(768, 1024);
    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.deviceType).toBe('tablet');
    expect(result.current.screenWidth).toBe(768);
  });

  test('debe detectar desktop (>= 1024px)', () => {
    resizeWindow(1920, 1080);
    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.deviceType).toBe('desktop');
    expect(result.current.screenWidth).toBe(1920);
    expect(result.current.screenHeight).toBe(1080);
  });

  test('debe actualizar al redimensionar la ventana', () => {
    resizeWindow(1024, 768);
    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.deviceType).toBe('desktop');

    // Redimensionar a móvil
    act(() => {
      resizeWindow(375, 667);
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.deviceType).toBe('mobile');
    expect(result.current.screenWidth).toBe(375);
  });

  test('debe manejar el breakpoint exacto de 768px como tablet', () => {
    resizeWindow(768, 1024);
    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });

  test('debe manejar el breakpoint exacto de 1024px como desktop', () => {
    resizeWindow(1024, 768);
    const { result } = renderHook(() => useDeviceDetection());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  test('debe limpiar el event listener al desmontar', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useDeviceDetection());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
