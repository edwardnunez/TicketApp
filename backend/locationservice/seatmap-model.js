import mongoose from 'mongoose';

// Precio por fila dentro de una sección
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

// Asiento individual
const seatSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  label: { type: String },
  priceOverride: { type: Number, min: 0 }
}, { _id: false });

// Fila dentro de una sección
const rowSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  label: { type: String },
  seats: { type: [seatSchema], default: [] }
}, { _id: false });

// Sección dentro del SeatMap
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

// Métodos de ayuda en sección
sectionSchema.methods.getRowPrice = function(rowNumber) {
  if (!this.hasNumberedSeats) {
    return this.defaultPrice;
  }
  const rp = this.rowPricing?.find(r => r.row === rowNumber);
  return rp ? rp.price : this.defaultPrice;
};

sectionSchema.methods.getPriceRange = function() {
  if (!this.hasNumberedSeats) {
    return { min: this.defaultPrice, max: this.defaultPrice };
  }
  const prices = (this.rowPricing || []).map(rp => rp.price);
  prices.push(this.defaultPrice);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

// Capacidad calculada
sectionSchema.methods.getComputedCapacity = function() {
  if (this.hasNumberedSeats) {
    if (Array.isArray(this.rows) && this.rows.length > 0) {
      return this.rows.reduce((sum, row) => sum + (row.seats?.length || 0), 0);
    }
    return 0;
  }
  return this.totalCapacity || 0;
};

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

// Capacidad total del mapa de asientos
seatMapSchema.methods.getTotalCapacity = function() {
  return this.sections.reduce((total, section) => total + section.getComputedCapacity(), 0);
};

// Método para verificar si es compatible con un tipo de evento
seatMapSchema.methods.isCompatibleWithEventType = function(eventType) {
  return this.compatibleEventTypes.includes(eventType);
};

// Método para obtener secciones con asientos numerados
seatMapSchema.methods.getNumberedSeatSections = function() {
  return this.sections.filter(section => section.hasNumberedSeats);
};

// Método para obtener secciones de entrada general
seatMapSchema.methods.getGeneralAdmissionSections = function() {
  return this.sections.filter(section => !section.hasNumberedSeats);
};

const SeatMap = mongoose.model('SeatMap', seatMapSchema);

export default SeatMap;