// Paleta de colores profesional con tema verde menta
const PRIMARY = {
  main: '#00BFA5',
  light: '#5DF2D6',
  dark: '#008E76',
  contrast: '#FFFFFF'
};

const SECONDARY = {
  main: '#DC2626', // Rojo para acciones importantes
  light: '#EF4444',
  dark: '#B91C1C',
  contrast: '#FFFFFF'
};

const CATEGORIES = {
  conciertos: '#00ACC1',
  teatro: '#26A69A', // Verde menta variante
  deportes: '#66BB6A', // Verde que armoniza
  festivales: '#00897B', // Verde-azulado
  cine: '#4DB6AC', // Verde menta claro
};

const STATUS = {
  success: '#00BFA5', // Mismo color principal
  info: '#4DD0E1', // Azul claro compatible
  warning: '#FFC107', // Amarillo ámbar
  error: '#F44336', // Rojo para errores
};

const ACCENT = {
  gold: '#F59E0B', // Dorado para VIP/Premium
  silver: '#6B7280', // Plata para secciones medias
  bronze: '#D97706', // Bronce para secciones básicas
  green: '#10B981', // Verde para disponible
  red: '#EF4444', // Rojo para ocupado
  blue: '#3B82F6', // Azul para seleccionado
  purple: '#8B5CF6', // Púrpura para accesible
  orange: '#F97316' // Naranja para entrada general
};

const NEUTRAL = {
  white: '#FFFFFF',
  grey1: '#F5F5F5',
  grey2: '#E0E0E0',
  grey3: '#BDBDBD',
  grey4: '#757575',
  dark: '#424242', // Gris oscuro
  darker: '#212121',
  black: '#000000'
};

// Colores específicos para secciones de venues
const VENUE_SECTIONS = {
  // Estadios de fútbol
  football: {
    field: '#22C55E', // Verde césped
    tribuna: '#3B82F6', // Azul tribuna
    vip: '#F59E0B', // Dorado VIP
    general: '#6B7280' // Gris entrada general
  },
  // Conciertos
  concert: {
    stage: '#1F2937', // Negro escenario
    pista: '#DC2626', // Rojo pista
    grada: '#8B5CF6', // Púrpura gradas
    vip: '#F59E0B', // Dorado VIP
    premium: '#EC4899' // Rosa premium
  },
  // Cines
  cinema: {
    screen: '#000000', // Negro pantalla
    premium: '#8B5CF6', // Púrpura premium
    standard: '#3B82F6', // Azul estándar
    economy: '#6B7280' // Gris económico
  },
  // Teatros
  theater: {
    stage: '#8B4513', // Marrón escenario
    orchestra: '#F59E0B', // Dorado orquesta
    mezzanine: '#8B5CF6', // Púrpura mezzanine
    balcony: '#6B7280', // Gris balcón
    boxes: '#EC4899' // Rosa palcos
  },
  // Arenas
  arena: {
    floor: '#374151', // Gris pista
    lower: '#3B82F6', // Azul inferior
    upper: '#6B7280', // Gris superior
    vip: '#F59E0B', // Dorado VIP
    premium: '#8B5CF6' // Púrpura premium
  }
};

// Estados de asientos
const SEAT_STATES = {
  available: {
    background: '#FFFFFF',
    border: '#D1D5DB',
    color: '#374151',
    hover: '#F3F4F6'
  },
  selected: {
    background: '#00BFA5',
    border: '#008E76',
    color: '#FFFFFF',
    shadow: '0 4px 12px rgba(0, 191, 165, 0.3)'
  },
  occupied: {
    background: '#F3F4F6',
    border: '#D1D5DB',
    color: '#9CA3AF',
    opacity: 0.6
  },
  blocked: {
    background: '#FEE2E2',
    border: '#FCA5A5',
    color: '#DC2626',
    opacity: 0.7
  },
  premium: {
    background: '#FEF3C7',
    border: '#F59E0B',
    color: '#92400E',
    indicator: '#F59E0B'
  },
  accessible: {
    background: '#ECFDF5',
    border: '#10B981',
    color: '#065F46',
    indicator: '#10B981'
  }
};

// Gradientes profesionales
const GRADIENTS = {
  primary: 'linear-gradient(135deg, #00BFA5 0%, #008E76 100%)', // Degradado verde menta
  header: 'linear-gradient(90deg, #424242 0%, #212121 100%)', // Degradado gris oscuro
  footer: 'linear-gradient(180deg, #f9f9f9 0%, #f0f2f5 100%)', // Mantener sutil para footer
  secondary: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
  gold: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  silver: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
  field: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
  stage: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  darkGlass: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)'
};

// Sombras profesionales
const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glow: '0 0 20px rgba(0, 191, 165, 0.3)',
  glowGold: '0 0 20px rgba(245, 158, 11, 0.4)',
  glowRed: '0 0 20px rgba(220, 38, 38, 0.3)'
};

// Breakpoints responsivos
const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Espaciado consistente
const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px'
};

// Tipografía
const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace']
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  }
};

// Bordes redondeados
const BORDER_RADIUS = {
  none: '0',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px'
};

export const COLORS = {
  primary: PRIMARY,
  secondary: SECONDARY,
  categories: CATEGORIES,
  status: STATUS,
  accent: ACCENT,
  neutral: NEUTRAL,
  venueSections: VENUE_SECTIONS,
  seatStates: SEAT_STATES,
  gradients: GRADIENTS,
  shadows: SHADOWS,
  breakpoints: BREAKPOINTS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  borderRadius: BORDER_RADIUS
};

// Utilidades para obtener colores por tipo de venue
export const getVenueColors = (venueType) => {
  return VENUE_SECTIONS[venueType] || VENUE_SECTIONS.concert;
};

// Utilidades para obtener colores por estado de asiento
export const getSeatStateColors = (state) => {
  return SEAT_STATES[state] || SEAT_STATES.available;
};

// Utilidades para generar gradientes dinámicos
export const createGradient = (color1, color2, direction = '135deg') => {
  return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
};

// Utilidades para generar sombras dinámicas
export const createShadow = (color, opacity = 0.1, blur = 10) => {
  return `0 4px ${blur}px rgba(${hexToRgb(color)}, ${opacity})`;
};

// Función auxiliar para convertir hex a rgb
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '0, 0, 0';
};

// Funciones para calcular contraste de colores
export const hexToRgbValues = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const getLuminance = (r, g, b) => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const getContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgbValues(color1);
  const rgb2 = hexToRgbValues(color2);
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

export const getContrastColor = (backgroundColor, lightColor = '#FFFFFF', darkColor = '#000000') => {
  const lightContrast = getContrastRatio(backgroundColor, lightColor);
  const darkContrast = getContrastRatio(backgroundColor, darkColor);
  
  // WCAG AA requiere un ratio mínimo de 4.5:1 para texto normal
  // Si ambos colores tienen buen contraste, preferir el que tenga mejor ratio
  if (lightContrast >= 4.5 && darkContrast >= 4.5) {
    return lightContrast > darkContrast ? lightColor : darkColor;
  }
  
  // Si solo uno tiene buen contraste, usar ese
  if (lightContrast >= 4.5) return lightColor;
  if (darkContrast >= 4.5) return darkColor;
  
  // Si ninguno tiene buen contraste, usar el que tenga mejor ratio
  return lightContrast > darkContrast ? lightColor : darkColor;
};

export const getSectionTextColor = (sectionColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey400;
  }
  
  if (!sectionColor) {
    return NEUTRAL.grey800;
  }
  
  return getContrastColor(sectionColor, NEUTRAL.white, NEUTRAL.darker);
};

// Función para obtener color de texto con contraste para fondos con transparencia
export const getContrastTextColor = (backgroundColor, opacity = 1, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey400;
  }
  
  if (!backgroundColor) {
    return NEUTRAL.grey800;
  }
  
  // Si el fondo tiene transparencia, ajustar el contraste
  if (opacity < 1) {
    // Para fondos semi-transparentes, usar un color más neutro
    return getContrastColor(backgroundColor, NEUTRAL.grey100, NEUTRAL.grey700);
  }
  
  return getContrastColor(backgroundColor, NEUTRAL.white, NEUTRAL.darker);
};

// Función para obtener color de borde con contraste
export const getContrastBorderColor = (backgroundColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey200;
  }
  
  if (!backgroundColor) {
    return NEUTRAL.grey200;
  }
  
  // Para bordes, usar una versión más clara del color de contraste
  const contrastColor = getContrastColor(backgroundColor, NEUTRAL.white, NEUTRAL.darker);
  return contrastColor === NEUTRAL.white ? `${backgroundColor}40` : `${backgroundColor}60`;
};

// Función para obtener color de fondo con contraste para elementos de información
export const getContrastInfoBackground = (sectionColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey100;
  }
  
  if (!sectionColor) {
    return NEUTRAL.grey50;
  }
  
  // Usar una versión muy clara del color de la sección
  return `${sectionColor}20`;
};

// Función específica para etiquetas de secciones que siempre usa blanco cuando el fondo no es blanco
export const getSectionLabelColor = (sectionColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey400;
  }
  
  if (!sectionColor) {
    return NEUTRAL.grey800;
  }
  
  // Siempre usar blanco para etiquetas de secciones cuando hay un color de fondo
  return NEUTRAL.white;
};

// Función específica para dimensiones de secciones que siempre usa blanco cuando el fondo no es blanco
export const getSectionDimensionColor = (sectionColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey400;
  }
  
  if (!sectionColor) {
    return NEUTRAL.grey600;
  }
  
  // Siempre usar blanco para dimensiones de secciones cuando hay un color de fondo
  return NEUTRAL.white;
};

// Función específica para etiquetas de filas que siempre usa blanco cuando el fondo no es blanco
export const getRowLabelColor = (sectionColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey400;
  }
  
  if (!sectionColor) {
    return NEUTRAL.grey600;
  }
  
  // Siempre usar blanco para etiquetas de filas cuando hay un color de fondo
  return NEUTRAL.white;
};