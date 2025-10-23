import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detección de dispositivo y comportamiento responsive
 * @returns {Object} Objeto con información del dispositivo
 * @returns {boolean} isMobile - Si el dispositivo es móvil (< 768px)
 * @returns {boolean} isTablet - Si el dispositivo es tablet (768px - 1023px)
 * @returns {boolean} isDesktop - Si el dispositivo es escritorio (>= 1024px)
 * @returns {number} screenWidth - Ancho actual de la pantalla
 * @returns {number} screenHeight - Alto actual de la pantalla
 * @returns {string} deviceType - Tipo de dispositivo ('mobile', 'tablet', 'desktop')
 */
const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    deviceType: 'desktop'
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Breakpoints basados en estándares modernos
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      let deviceType = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        deviceType
      });
    };

    // Ejecutar al montar
    updateDeviceInfo();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', updateDeviceInfo);

    // Cleanup
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
};

export default useDeviceDetection;
