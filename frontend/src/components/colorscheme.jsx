// Professional color palette with mint green theme
const PRIMARY = {
  main: '#00BFA5',
  light: '#5DF2D6',
  dark: '#008E76',
  contrast: '#FFFFFF'
};

const SECONDARY = {
  main: '#DC2626', // Red for important actions
  light: '#EF4444',
  dark: '#B91C1C',
  contrast: '#FFFFFF'
};

const CATEGORIES = {
  conciertos: '#00ACC1',
  teatro: '#26A69A', // Mint green variant
  deportes: '#66BB6A', // Harmonizing green
  festivales: '#00897B', // Green-blue
  cine: '#4DB6AC', // Light mint green
};

const STATUS = {
  success: '#00BFA5', // Same as primary color
  info: '#4DD0E1', // Compatible light blue
  warning: '#FFC107', // Amber yellow
  error: '#F44336', // Red for errors
};

const ACCENT = {
  gold: '#F59E0B', // Gold for VIP/Premium
  silver: '#6B7280', // Silver for mid-tier sections
  bronze: '#D97706', // Bronze for basic sections
  green: '#10B981', // Green for available
  red: '#EF4444', // Red for occupied
  blue: '#3B82F6', // Blue for selected
  purple: '#8B5CF6', // Purple for accessible
  orange: '#F97316' // Orange for general admission
};

const NEUTRAL = {
  white: '#FFFFFF',
  grey1: '#F5F5F5',
  grey2: '#E0E0E0',
  grey3: '#BDBDBD',
  grey4: '#757575',
  dark: '#424242', // Dark grey
  darker: '#212121',
  black: '#000000'
};

// Specific colors for venue sections
const VENUE_SECTIONS = {
  // Football stadiums
  football: {
    field: '#22C55E', // Grass green
    tribuna: '#3B82F6', // Blue stands
    vip: '#F59E0B', // Gold VIP
    general: '#6B7280' // Grey general admission
  },
  // Concerts
  concert: {
    stage: '#1F2937', // Black stage
    pista: '#DC2626', // Red floor
    grada: '#8B5CF6', // Purple stands
    vip: '#F59E0B', // Gold VIP
    premium: '#EC4899' // Pink premium
  },
  // Cinemas
  cinema: {
    screen: '#000000', // Black screen
    premium: '#8B5CF6', // Purple premium
    standard: '#3B82F6', // Blue standard
    economy: '#6B7280' // Grey economy
  },
  // Theaters
  theater: {
    stage: '#8B4513', // Brown stage
    orchestra: '#F59E0B', // Gold orchestra
    mezzanine: '#8B5CF6', // Purple mezzanine
    balcony: '#6B7280', // Grey balcony
    boxes: '#EC4899' // Pink boxes
  },
  // Arenas
  arena: {
    floor: '#374151', // Grey floor
    lower: '#3B82F6', // Blue lower
    upper: '#6B7280', // Grey upper
    vip: '#F59E0B', // Gold VIP
    premium: '#8B5CF6' // Purple premium
  }
};

// Seat states
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

// Typography
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

// Utilities for generating dynamic gradients
export const createGradient = (color1, color2, direction = '135deg') => {
  return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
};

// Utilities for generating dynamic shadows
export const createShadow = (color, opacity = 0.1, blur = 10) => {
  return `0 4px ${blur}px rgba(${hexToRgb(color)}, ${opacity})`;
};

// Helper function to convert hex to rgb
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
  
  // WCAG AA requires a minimum ratio of 4.5:1 for normal text
  // If both colors have good contrast, prefer the one with better ratio
  if (lightContrast >= 4.5 && darkContrast >= 4.5) {
    return lightContrast > darkContrast ? lightColor : darkColor;
  }
  
  // If only one has good contrast, use that one
  if (lightContrast >= 4.5) return lightColor;
  if (darkContrast >= 4.5) return darkColor;
  
  // If none have good contrast, use the one with better ratio
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

// Function to get text color with contrast for backgrounds with transparency
export const getContrastTextColor = (backgroundColor, opacity = 1, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey400;
  }
  
  if (!backgroundColor) {
    return NEUTRAL.grey800;
  }
  
  // If background has transparency, adjust contrast
  if (opacity < 1) {
    // For semi-transparent backgrounds, use a more neutral color
    return getContrastColor(backgroundColor, NEUTRAL.grey100, NEUTRAL.grey700);
  }
  
  return getContrastColor(backgroundColor, NEUTRAL.white, NEUTRAL.darker);
};

// Function to get border color with contrast
export const getContrastBorderColor = (backgroundColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey200;
  }
  
  if (!backgroundColor) {
    return NEUTRAL.grey200;
  }
  
  // For borders, use a lighter version of the contrast color
  const contrastColor = getContrastColor(backgroundColor, NEUTRAL.white, NEUTRAL.darker);
  return contrastColor === NEUTRAL.white ? `${backgroundColor}40` : `${backgroundColor}60`;
};

// Function to get background color with contrast for information elements
export const getContrastInfoBackground = (sectionColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey100;
  }
  
  if (!sectionColor) {
    return NEUTRAL.grey50;
  }
  
  // Use a very light version of the section color
  return `${sectionColor}20`;
};

// Specific function for section labels that always uses white when background is not white
export const getSectionLabelColor = (sectionColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey400;
  }
  
  if (!sectionColor) {
    return NEUTRAL.grey800;
  }
  
  // Always use white for section labels when there's a background color
  return NEUTRAL.white;
};

// Specific function for section dimensions that always uses white when background is not white
export const getSectionDimensionColor = (sectionColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey400;
  }
  
  if (!sectionColor) {
    return NEUTRAL.grey600;
  }
  
  // Always use white for section dimensions when there's a background color
  return NEUTRAL.white;
};

// Specific function for row labels that always uses white when background is not white
export const getRowLabelColor = (sectionColor, isBlocked = false) => {
  if (isBlocked) {
    return NEUTRAL.grey400;
  }
  
  if (!sectionColor) {
    return NEUTRAL.grey600;
  }
  
  // Always use white for row labels when there's a background color
  return NEUTRAL.white;
};