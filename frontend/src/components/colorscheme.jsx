const PRIMARY = {
  main: '#00BFA5',
  light: '#5DF2D6',
  dark: '#008E76',
};

const NEUTRAL = {
  white: '#FFFFFF',
  grey1: '#F5F5F5',
  grey2: '#E0E0E0',
  grey3: '#BDBDBD',
  grey4: '#757575',
  dark: '#424242', // Gris oscuro
  darker: '#212121',
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

const GRADIENTS = {
  primary: 'linear-gradient(135deg, #00BFA5 0%, #008E76 100%)', // Degradado verde menta
  header: 'linear-gradient(90deg, #424242 0%, #212121 100%)', // Degradado gris oscuro
  footer: 'linear-gradient(180deg, #f9f9f9 0%, #f0f2f5 100%)', // Mantener sutil para footer
};

export const COLORS = {
  primary: PRIMARY,
  neutral: NEUTRAL,
  categories: CATEGORIES,
  status: STATUS,
  gradients: GRADIENTS,
};