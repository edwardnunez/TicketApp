/**
 * @file Modelo de datos de Mapa de Asientos para MongoDB con configuración compleja de secciones y precios
 * @module models/SeatMap
 */

import mongoose from 'mongoose';

/**
 * Schema para precios por fila dentro de una sección
 * @typedef {Object} RowPricingSchema
 * @property {number} row - Número de fila
 * @property {number} price - Precio para esta fila (mínimo 0)
 */
const rowPricingSchema = new mongoose.Schema({
  row: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

/**
 * Schema para configuración de asiento individual
 * @typedef {Object} SeatSchema
 * @property {number} number - Número de asiento
 * @property {string} label - Etiqueta personalizada del asiento (opcional)
 * @property {number} priceOverride - Precio personalizado para este asiento específico (opcional)
 */
const seatSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  label: { type: String },
  priceOverride: { type: Number, min: 0 }
}, { _id: false });

/**
 * Schema para una fila dentro de una sección
 * @typedef {Object} RowSchema
 * @property {number} index - Índice/número de fila
 * @property {string} label - Etiqueta personalizada de la fila (opcional)
 * @property {SeatSchema[]} seats - Array de asientos en esta fila
 */
const rowSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  label: { type: String },
  seats: { type: [seatSchema], default: [] }
}, { _id: false });

/**
 * Schema para una sección del lugar
 * @typedef {Object} SectionSchema
 * @property {string} id - Identificador único de la sección
 * @property {string} name - Nombre para mostrar de la sección
 * @property {RowSchema[]} rows - Array de filas con configuración explícita de asientos
 * @property {number} defaultPrice - Precio por defecto para asientos sin precio específico
 * @property {RowPricingSchema[]} rowPricing - Array de precios específicos por fila
 * @property {string} color - Color de la sección para visualización
 * @property {string} position - Posición de la sección en el lugar
 * @property {number} order - Orden de visualización
 * @property {boolean} hasNumberedSeats - Bandera para asientos numerados vs entrada general
 * @property {number} totalCapacity - Capacidad total para secciones de entrada general
 */
const sectionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  // Nueva arquitectura: filas explícitas con asientos
  rows: { type: [rowSchema], default: [] },
  // Pricing
  defaultPrice: {
    type: Number,
    required: true,
    min: 0
  },
  rowPricing: { type: [rowPricingSchema], default: [] },
  // Presentación/metadata
  color: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  // Compatibilidad con secciones de entrada general
  hasNumberedSeats: { type: Boolean, default: true },
  totalCapacity: { type: Number, min: 0 }
});

/**
 * Obtiene el precio para una fila específica en la sección
 * @method
 * @param {number} rowNumber - Número de fila para obtener el precio
 * @returns {number} Precio para la fila especificada
 */
sectionSchema.methods.getRowPrice = function(rowNumber) {
  if (!this.hasNumberedSeats) {
    return this.defaultPrice;
  }
  const rp = this.rowPricing?.find(r => r.row === rowNumber);
  return rp ? rp.price : this.defaultPrice;
};

/**
 * Obtiene el rango de precios para la sección
 * @method
 * @returns {{min: number, max: number}} Objeto con precios mínimo y máximo
 */
sectionSchema.methods.getPriceRange = function() {
  if (!this.hasNumberedSeats) {
    return { min: this.defaultPrice, max: this.defaultPrice };
  }
  const prices = (this.rowPricing || []).map(rp => rp.price);
  prices.push(this.defaultPrice);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

/**
 * Calcula la capacidad total de la sección
 * @method
 * @returns {number} Capacidad total basada en asientos o campo totalCapacity
 */
sectionSchema.methods.getComputedCapacity = function() {
  if (this.hasNumberedSeats) {
    if (Array.isArray(this.rows) && this.rows.length > 0) {
      return this.rows.reduce((sum, row) => sum + (row.seats?.length || 0), 0);
    }
    return 0;
  }
  return this.totalCapacity || 0;
};

/**
 * Schema principal del mapa de asientos con configuración del lugar
 * @typedef {Object} SeatMapSchema
 * @property {string} id - Identificador único del mapa de asientos
 * @property {string} name - Nombre del mapa de asientos
 * @property {string} type - Tipo de lugar (football, cinema, theater, concert, arena)
 * @property {string} subtype - Subtipo de lugar (opcional)
 * @property {SectionSchema[]} sections - Array de secciones del lugar
 * @property {Object} config - Configuración específica por tipo
 * @property {boolean} isActive - Bandera que indica si el mapa de asientos está activo
 * @property {string[]} compatibleEventTypes - Array de tipos de eventos compatibles
 * @property {string} description - Descripción del mapa de asientos
 */
const seatMapSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    unique: true 
  }, // 'football1', 'cinema1', etc.
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['football', 'cinema', 'theater', 'concert', 'arena'], // Agregados 'concert' y 'arena'
    required: true 
  },
  subtype: {
    type: String,
    enum: ['stadium', 'indoor_arena', 'outdoor_venue', 'general_admission', 'concert_hall', 'pavilion'],
    required: false
  },
  sections: [sectionSchema],
  // Configuraciones específicas por tipo
  config: {
    // Configuración flexible que puede variar según el tipo
    stadiumName: String,
    fieldDimensions: {
      width: Number,
      height: Number
    },
    cinemaName: String,
    screenWidth: Number,
    theaterName: String,
    stageWidth: Number,
    venueName: String,
    stagePosition: {
      type: String,
      enum: ['center', 'north', 'south', 'east', 'west'],
      default: 'center'
    },
    stageDimensions: {
      width: Number,
      height: Number
    },
    allowsGeneralAdmission: {
      type: Boolean,
      default: false
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  compatibleEventTypes: {
    type: [String],
    enum: ['football', 'cinema', 'concert', 'theater', 'festival', 'arena']
  },
  description: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

/**
 * Calcula la capacidad total de todas las secciones
 * @method
 * @returns {number} Capacidad total de todo el lugar
 */
seatMapSchema.methods.getTotalCapacity = function() {
  return this.sections.reduce((total, section) => total + section.getComputedCapacity(), 0);
};

/**
 * Verifica si el mapa de asientos es compatible con un tipo de evento específico
 * @method
 * @param {string} eventType - Tipo de evento para verificar compatibilidad
 * @returns {boolean} Verdadero si es compatible con el tipo de evento
 */
seatMapSchema.methods.isCompatibleWithEventType = function(eventType) {
  return this.compatibleEventTypes.includes(eventType);
};

/**
 * Obtiene todas las secciones con asientos numerados
 * @method
 * @returns {Array} Array de secciones con asientos numerados
 */
seatMapSchema.methods.getNumberedSeatSections = function() {
  return this.sections.filter(section => section.hasNumberedSeats);
};

/**
 * Obtiene todas las secciones de entrada general
 * @method
 * @returns {Array} Array de secciones de entrada general
 */
seatMapSchema.methods.getGeneralAdmissionSections = function() {
  return this.sections.filter(section => !section.hasNumberedSeats);
};

/**
 * Modelo de Mapa de Asientos para operaciones de base de datos
 * @type {mongoose.Model}
 */
const SeatMap = mongoose.model('SeatMap', seatMapSchema);

export default SeatMap;