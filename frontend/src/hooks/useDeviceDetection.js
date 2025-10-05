import { useState, useEffect } from 'react';

/**
 * Custom hook for device detection and responsive behavior
 * @returns {Object} Device information object
 * @returns {boolean} isMobile - Whether device is mobile (< 768px)
 * @returns {boolean} isTablet - Whether device is tablet (768px - 1023px)
 * @returns {boolean} isDesktop - Whether device is desktop (>= 1024px)
 * @returns {number} screenWidth - Current screen width
 * @returns {number} screenHeight - Current screen height
 * @returns {string} deviceType - Device type ('mobile', 'tablet', 'desktop')
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
