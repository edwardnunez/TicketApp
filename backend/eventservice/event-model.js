/**
 * @file Modelo de datos de Evento para MongoDB con configuración de precios y mapa de asientos
 * @module models/Event
 */

import mongoose from 'mongoose';

/**
 * Schema para precios individuales por fila dentro de una sección
 * @typedef {Object} RowPricingSchema
 * @property {number} row - Número de fila
 * @property {number} price - Precio para esta fila específica (mínimo 0)
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
});

/**
 * Schema para configuración de precios por sección
 * @typedef {Object} SectionPricingSchema
 * @property {string} sectionId - Identificador único de la sección
 * @property {string} sectionName - Nombre para mostrar de la sección
 * @property {RowPricingSchema[]} rowPricing - Array de precios específicos por fila
 * @property {number} defaultPrice - Precio por defecto para filas no configuradas
 * @property {number} capacity - Capacidad total de la sección
 * @property {number} rows - Número de filas en la sección
 * @property {number} seatsPerRow - Número de asientos por fila
 */
const sectionPricingSchema = new mongoose.Schema({
  sectionId: { 
    type: String, 
    required: true 
  },
  sectionName: { 
    type: String, 
    required: true 
  },
  rowPricing: [rowPricingSchema],
  
  // Precio por defecto para filas no configuradas
  defaultPrice: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  
  capacity: { type: Number, required: true },
  rows: { type: Number, required: true },
  seatsPerRow: { type: Number, required: true },

});

/**
 * Schema para configuración del mapa de asientos incluyendo asientos y secciones bloqueadas
 * @typedef {Object} SeatMapConfigurationSchema
 * @property {string} seatMapId - Referencia al diseño del mapa de asientos
 * @property {string[]} blockedSeats - Array de IDs de asientos bloqueados
 * @property {string[]} blockedSections - Array de IDs de secciones bloqueadas
 * @property {Date} configuredAt - Fecha y hora de configuración
 */
const seatMapConfigurationSchema = new mongoose.Schema({
  seatMapId: {
    type: String,
    required: true
  },
  blockedSeats: [{
    type: String
  }],
  blockedSections: [{
    type: String
  }],
  configuredAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Schema principal del evento con todos los detalles, precios y configuración
 * @typedef {Object} EventSchema
 * @property {string} name - Nombre del evento
 * @property {string} type - Tipo de evento (football, cinema, concert, theater, festival)
 * @property {string} description - Descripción del evento
 * @property {Date} date - Fecha y hora del evento
 * @property {mongoose.Schema.Types.ObjectId} location - Referencia al modelo Location
 * @property {string} state - Estado del evento (activo, proximo, finalizado, cancelado)
 * @property {number} capacity - Capacidad total del evento
 * @property {number} price - Precio base (para compatibilidad hacia atrás)
 * @property {SectionPricingSchema[]} sectionPricing - Configuración de precios por sección
 * @property {boolean} usesSectionPricing - Bandera que indica si el evento usa precios por sección
 * @property {boolean} usesRowPricing - Bandera que indica si el evento usa precios por fila
 * @property {SeatMapConfigurationSchema} seatMapConfiguration - Configuración de bloqueo del mapa de asientos
 * @property {Object} imageData - Datos de imagen del evento
 * @property {boolean} hasCustomImage - Bandera que indica si el evento tiene imagen personalizada
 * @property {string} createdBy - ID del administrador que creó el evento
 */
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['football', 'cinema', 'concert', 'theater', 'festival'],
    required: true
  },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true 
  },
  state: { 
    type: String, 
    enum: ['activo', 'proximo', 'finalizado', 'cancelado'],
    required: true,
    default: 'proximo'
  },
  capacity: { type: Number, required: true },
  
  // Precio base (para compatibilidad hacia atrás)
  price: { type: Number, required: true, min: 0 },
  
  sectionPricing: [sectionPricingSchema],
  
  // Bandera para indicar si el evento usa precios por secciones con filas
  usesSectionPricing: {
    type: Boolean,
    default: false
  },
  
  usesRowPricing: { 
    type: Boolean, 
    default: false 
  },

  seatMapConfiguration: seatMapConfigurationSchema,

  imageData: {
    data: String, // Cadena Base64 de la imagen
    contentType: String, // Tipo MIME (image/jpeg, image/png, etc.)
    filename: String, // Nombre original del archivo
    size: Number, // Tamaño en bytes
    uploadedAt: { type: Date, default: Date.now }
  },
  hasCustomImage: { type: Boolean, default: false },
  createdBy: { type: String, required: true }, // ID del admin creador
  
}, { timestamps: true });

/**
 * Middleware pre-guardado para calcular la capacidad total basada en precios por sección
 * @function
 * @param {Function} next - Función de retorno para continuar al siguiente middleware
 */
eventSchema.pre('save', function(next) {
  if (this.usesSectionPricing && this.sectionPricing && this.sectionPricing.length > 0) {
    // Calcular capacidad total sumando todas las secciones
    this.capacity = this.sectionPricing.reduce((total, section) => {
      return total + section.capacity;
    }, 0);
  }
  next();
});

/**
 * Obtiene la URL de datos para la imagen del evento
 * @method
 * @returns {string|null} Cadena de URL de datos o null si no existe imagen
 */
eventSchema.methods.getImageDataUrl = function() {
  if (this.imageData && this.imageData.data && this.imageData.contentType) {
    return `data:${this.imageData.contentType};base64,${this.imageData.data}`;
  }
  return null;
};

/**
 * Verifica si el evento tiene una imagen personalizada
 * @method
 * @returns {boolean} Verdadero si el evento tiene datos de imagen personalizada
 */
eventSchema.methods.hasImage = function() {
  return this.hasCustomImage && this.imageData && this.imageData.data;
};

/**
 * Calcula el precio para un asiento específico
 * @method
 * @param {string} sectionId - Identificador de la sección
 * @param {number} row - Número de fila
 * @param {number} seat - Número de asiento
 * @returns {number} Precio para el asiento especificado
 */
eventSchema.methods.getSeatPrice = function(sectionId, row) {
  if (!this.usesSectionPricing) {
    return this.price;
  }
  
  const section = this.sectionPricing.find(s => s.sectionId === sectionId);
  if (!section) {
    return this.price;
  }
  
  // Buscar precio específico para la fila
  const rowPricing = section.rowPricing?.find(rp => rp.row === row);
  if (rowPricing) {
    return rowPricing.price;
  }
  
  // Si no hay precio específico, usar defaultPrice de la sección
  return section.defaultPrice || this.price;
};

/**
 * Obtiene el precio mínimo del evento
 * @method
 * @returns {number} Precio mínimo entre todas las secciones y filas
 */
eventSchema.methods.getMinPrice = function() {
  if (!this.usesSectionPricing || !this.sectionPricing || this.sectionPricing.length === 0) {
    return this.price;
  }
  
  let minPrice = Infinity;
  
  this.sectionPricing.forEach(section => {
    // Precio mínimo entre rowPricing y defaultPrice
    if (section.rowPricing && section.rowPricing.length > 0) {
      const sectionMinPrice = Math.min(...section.rowPricing.map(rp => rp.price));
      minPrice = Math.min(minPrice, sectionMinPrice);
    }
    
    // Considerar también defaultPrice
    if (section.defaultPrice !== undefined && section.defaultPrice !== null) {
      minPrice = Math.min(minPrice, section.defaultPrice);
    }
  });
  
  return minPrice === Infinity ? this.price : minPrice;
};

/**
 * Obtiene el precio máximo del evento
 * @method
 * @returns {number} Precio máximo entre todas las secciones y filas
 */
eventSchema.methods.getMaxPrice = function() {
  if (!this.usesSectionPricing || !this.sectionPricing || this.sectionPricing.length === 0) {
    return this.price;
  }
  
  let maxPrice = 0;
  
  this.sectionPricing.forEach(section => {
    // Precio máximo entre rowPricing y defaultPrice
    if (section.rowPricing && section.rowPricing.length > 0) {
      const sectionMaxPrice = Math.max(...section.rowPricing.map(rp => rp.price));
      maxPrice = Math.max(maxPrice, sectionMaxPrice);
    }
    
    // Considerar también defaultPrice
    if (section.defaultPrice !== undefined && section.defaultPrice !== null) {
      maxPrice = Math.max(maxPrice, section.defaultPrice);
    }
  });
  
  return maxPrice;
};

/**
 * Obtiene el rango de precios como una cadena formateada
 * @method
 * @returns {string} Cadena de rango de precios (ej: "€20" o "€20 - €50")
 */
eventSchema.methods.getPriceRange = function() {
  if (!this.usesSectionPricing || !this.sectionPricing || this.sectionPricing.length === 0) {
    return `€${this.price}`;
  }
  
  const minPrice = this.getMinPrice();
  const maxPrice = this.getMaxPrice();
  
  if (minPrice === maxPrice) {
    return `€${minPrice}`;
  }
  
  return `€${minPrice} - €${maxPrice}`;
};

/**
 * Obtiene información detallada de precios para todas las secciones
 * @method
 * @returns {Array<Object>} Array de objetos con información de precios por sección
 */
eventSchema.methods.getSectionPricingInfo = function() {
  if (!this.usesSectionPricing || !this.sectionPricing) {
    return [];
  }
  
  return this.sectionPricing.map(section => {
    const info = {
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      capacity: section.capacity,
      rows: section.rows,
      seatsPerRow: section.seatsPerRow,
      defaultPrice: section.defaultPrice,
      pricingType: 'row-individual'
    };
    
    // Agregar información de precios por fila
    if (section.rowPricing && section.rowPricing.length > 0) {
      info.rowPricing = section.rowPricing.map(rp => ({
        row: rp.row,
        price: rp.price
      }));
      
      const prices = section.rowPricing.map(rp => rp.price);
      info.minPrice = Math.min(...prices, section.defaultPrice);
      info.maxPrice = Math.max(...prices, section.defaultPrice);
    } else {
      info.minPrice = section.defaultPrice;
      info.maxPrice = section.defaultPrice;
    }
    
    info.priceRange = info.minPrice === info.maxPrice 
      ? `€${info.minPrice}` 
      : `€${info.minPrice} - €${info.maxPrice}`;
    
    return info;
  });
};

/**
 * Verifica si un asiento específico está bloqueado
 * @method
 * @param {string} seatId - Identificador del asiento en formato "sectionId-row-seat"
 * @returns {boolean} Verdadero si el asiento está bloqueado individualmente o por bloqueo de sección
 */
eventSchema.methods.isSeatBlocked = function(seatId) {
  // Verificar si el asiento está bloqueado individualmente
  if (this.seatMapConfiguration && this.seatMapConfiguration.blockedSeats && 
      this.seatMapConfiguration.blockedSeats.includes(seatId)) {
    return true;
  }
  
  // Verificar si la sección del asiento está bloqueada
  if (this.seatMapConfiguration && this.seatMapConfiguration.blockedSections && 
      this.seatMapConfiguration.blockedSections.length > 0) {
    const sectionId = seatId.split('-')[0]; // Extraer sectionId del formato "sectionId-row-seat"
    return this.seatMapConfiguration.blockedSections.includes(sectionId);
  }

  return false;
};

/**
 * Modelo de Evento para operaciones de base de datos
 * @type {mongoose.Model}
 */
const Event = mongoose.model("Event", eventSchema);

export default Event;