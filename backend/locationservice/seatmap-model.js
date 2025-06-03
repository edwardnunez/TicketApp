
import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true 
  }, // 'tribuna-norte', 'front', 'orchestra', etc.
  name: { 
    type: String, 
    required: true 
  }, // 'Tribuna Norte', 'Delanteras', etc.
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
  }, // 'north', 'east', 'front', 'orchestra', etc.
  order: { 
    type: Number, 
    default: 0 
  } // Para ordenar las secciones
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
    enum: ['football', 'cinema', 'theater'], 
    required: true 
  },
  sections: [sectionSchema],
  // Configuraciones específicas por tipo
  config: {
    // Para estadios de fútbol
    stadiumName: String,
    fieldDimensions: {
      width: Number,
      height: Number
    },
    // Para cines
    cinemaName: String,
    screenWidth: Number,
    // Para teatros
    theaterName: String,
    stageWidth: Number
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

const SeatMap = mongoose.model('SeatMap', seatMapSchema);

export default SeatMap;