import { useState, useEffect, useMemo } from 'react';
import useDeviceDetection from './useDeviceDetection';

const useSeatMapViability = (seatMapData, containerDimensions = null) => {
  const deviceInfo = useDeviceDetection();
  const [viability, setViability] = useState({
    isViable: true,
    reason: null,
    recommendedView: 'full',
    scaleFactor: 1,
    hasOverlaps: false,
    overlapCount: 0,
    minRequiredWidth: 0,
    minRequiredHeight: 0
  });

  // Calcular dimensiones requeridas para el mapa
  const calculateRequiredDimensions = useMemo(() => {
    if (!seatMapData?.sections) return { width: 0, height: 0 };

    const { sections, type } = seatMapData;
    let totalWidth = 0;
    let totalHeight = 0;

    switch (type) {
      case 'stadium': {
        // Layout de estadio: tribunas alrededor del campo
        const fieldWidth = 400;
        const fieldHeight = 260;
        const tribunaWidth = Math.max(...sections.map(s => s.seatsPerRow * 24 + 100));
        const tribunaHeight = Math.max(...sections.map(s => s.rows * 24 + 100));

        totalWidth = fieldWidth + (tribunaWidth * 2) + 160; // Campo + 2 tribunas + espaciado
        totalHeight = fieldHeight + (tribunaHeight * 2) + 120; // Campo + 2 tribunas + espaciado
        break;
      }

      case 'cinema': {
        // Layout de cine: secciones apiladas verticalmente
        const screenWidth = 400;
        const sectionWidth = Math.max(...sections.map(s => s.seatsPerRow * 24 + 100));
        const totalSectionsHeight = sections.reduce((acc, s) => acc + (s.rows * 24 + 100), 0);

        totalWidth = Math.max(screenWidth, sectionWidth) + 100;
        totalHeight = totalSectionsHeight + 200; // Secciones + pantalla + espaciado
        break;
      }

      case 'theater': {
        // Layout de teatro: similar al cine pero con más espaciado
        const stageWidth = 350;
        const theaterSectionWidth = Math.max(...sections.map(s => s.seatsPerRow * 24 + 100));
        const totalTheaterHeight = sections.reduce((acc, s) => acc + (s.rows * 24 + 120), 0);

        totalWidth = Math.max(stageWidth, theaterSectionWidth) + 120;
        totalHeight = totalTheaterHeight + 250;
        break;
      }

      case 'concert': {
        // Layout de concierto: escenario central con secciones alrededor
        const stageWidth = 300;
        const stageHeight = 80;
        const concertSectionWidth = Math.max(...sections.map(s => s.seatsPerRow * 24 + 100));
        const concertSectionHeight = Math.max(...sections.map(s => s.rows * 24 + 100));

        totalWidth = stageWidth + (concertSectionWidth * 2) + 200;
        totalHeight = stageHeight + (concertSectionHeight * 2) + 150;
        break;
      }

      default: {
        // Layout genérico: grid de secciones
        const maxSeatsPerRow = Math.max(...sections.map(s => s.seatsPerRow));
        const maxRows = Math.max(...sections.map(s => s.rows));
        const sectionWidth = maxSeatsPerRow * 24 + 100;
        const sectionHeight = maxRows * 24 + 100;

        // Calcular grid
        const cols = Math.ceil(Math.sqrt(sections.length));
        const rows = Math.ceil(sections.length / cols);

        totalWidth = (sectionWidth * cols) + (20 * (cols - 1)) + 100;
        totalHeight = (sectionHeight * rows) + (20 * (rows - 1)) + 100;
        break;
      }
    }

    return { width: totalWidth, height: totalHeight };
  }, [seatMapData]);

  // Detectar colisiones entre secciones
  const detectOverlaps = useMemo(() => {
    if (!seatMapData?.sections) return { hasOverlaps: false, overlapCount: 0 };

    const { sections, type } = seatMapData;
    let overlaps = 0;

    // Para layouts específicos, verificar superposiciones lógicas
    if (type === 'stadium') {
      const tribunas = sections.filter(s => 
        s.position === 'north' || s.position === 'south' || 
        s.position === 'east' || s.position === 'west'
      );
      
      // Verificar si hay demasiadas tribunas para el espacio disponible
      if (tribunas.length > 4) {
        overlaps += tribunas.length - 4;
      }
    }

    // Verificar secciones con dimensiones excesivas
    sections.forEach(section => {
      const sectionArea = section.rows * section.seatsPerRow;
      const maxReasonableArea = 500; // Área máxima razonable para una sección
      
      if (sectionArea > maxReasonableArea) {
        overlaps += 1;
      }
    });

    return {
      hasOverlaps: overlaps > 0,
      overlapCount: overlaps
    };
  }, [seatMapData]);

  // Calcular factor de escala necesario
  const calculateScaleFactor = useMemo(() => {
    const { width: requiredWidth, height: requiredHeight } = calculateRequiredDimensions;
    const availableWidth = containerDimensions?.width || deviceInfo.screenWidth;
    const availableHeight = containerDimensions?.height || deviceInfo.screenHeight - 200; // Restar espacio para UI

    const scaleX = availableWidth / requiredWidth;
    const scaleY = availableHeight / requiredHeight;
    const scale = Math.min(scaleX, scaleY, 1); // No escalar más allá del 100%

    return Math.max(scale, 0.1); // Mínimo 10% para mantener visibilidad
  }, [calculateRequiredDimensions, containerDimensions, deviceInfo]);

  // Determinar la viabilidad y vista recomendada
  const determineViability = useMemo(() => {
    const { width: requiredWidth, height: requiredHeight } = calculateRequiredDimensions;
    const availableWidth = containerDimensions?.width || deviceInfo.screenWidth;
    const availableHeight = containerDimensions?.height || deviceInfo.screenHeight - 200;
    
    const { hasOverlaps, overlapCount } = detectOverlaps;
    const scaleFactor = calculateScaleFactor;

    // Criterios de viabilidad
    const isTooSmall = scaleFactor < 0.3; // Menos del 30% de escala
    const hasTooManyOverlaps = overlapCount > 2;
    const isMobileAndComplex = deviceInfo.isMobile && (requiredWidth > 600 || requiredHeight > 400);
    const isTabletAndVeryComplex = deviceInfo.isTablet && (requiredWidth > 1000 || requiredHeight > 600);

    let isViable = true;
    let reason = null;
    let recommendedView = 'full';

    if (isTooSmall) {
      isViable = false;
      reason = 'El mapa es demasiado pequeño para ser legible';
      recommendedView = 'list';
    } else if (hasTooManyOverlaps) {
      isViable = false;
      reason = 'Demasiadas superposiciones entre secciones';
      recommendedView = 'simplified';
    } else if (isMobileAndComplex) {
      isViable = false;
      reason = 'Mapa demasiado complejo para pantalla móvil';
      recommendedView = 'list';
    } else if (isTabletAndVeryComplex) {
      isViable = false;
      reason = 'Mapa muy complejo para tablet';
      recommendedView = 'blocks';
    } else if (scaleFactor < 0.6) {
      // Mapa viable pero con zoom recomendado
      recommendedView = 'zoomed';
    }

    return {
      isViable,
      reason,
      recommendedView,
      scaleFactor,
      hasOverlaps,
      overlapCount,
      minRequiredWidth: requiredWidth,
      minRequiredHeight: requiredHeight
    };
  }, [calculateRequiredDimensions, detectOverlaps, calculateScaleFactor, deviceInfo, containerDimensions]);

  // Actualizar viabilidad cuando cambien las dependencias
  useEffect(() => {
    setViability(determineViability);
  }, [determineViability]);

  return viability;
};

export default useSeatMapViability;
