import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  rows: { 
    type: Number, 
    required: true 
  },
  seatsPerRow: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  color: { 
    type: String, 
    required: true 
  }, // Color hex
  position: { 
    type: String, 
    required: true 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  hasNumberedSeats: {
    type: Boolean,
    default: true
  },
  totalCapacity: {
    type: Number,
    min: 0
  }
});

// Middleware para calcular capacidad automáticamente
sectionSchema.pre('save', function(next) {
  // Si tiene asientos numerados, calcular capacidad por filas x asientos
  if (this.hasNumberedSeats) {
    if (!this.totalCapacity) {
      this.totalCapacity = this.rows * this.seatsPerRow;
    }
  } else {
    // Si no tiene asientos numerados, totalCapacity debe estar especificada
    if (!this.totalCapacity) {
      return next(new Error('totalCapacity is required for sections without numbered seats'));
    }
      this.rows = 1;
      this.seatsPerRow = this.totalCapacity;
  }
  next();
});

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
    enum: ['football', 'cinema', 'concert', 'theater', 'festival']
  },
  description: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Método para obtener la capacidad total del mapa de asientos
seatMapSchema.methods.getTotalCapacity = function() {
  return this.sections.reduce((total, section) => {
    return total + (section.totalCapacity || (section.rows * section.seatsPerRow));
  }, 0);
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