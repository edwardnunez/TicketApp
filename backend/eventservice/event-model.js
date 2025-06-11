import mongoose from 'mongoose';

// Schema para el pricing por sección
const sectionPricingSchema = new mongoose.Schema({
  sectionId: { 
    type: String, 
    required: true 
  },
  sectionName: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  capacity: { 
    type: Number, 
    required: true 
  } // Capacidad de esta sección (rows * seatsPerRow)
});

const seatMapConfigurationSchema = new mongoose.Schema({
  seatMapId: {
    type: String,
    required: true
  },
  blockedSeats: [{
    type: String // IDs de asientos bloqueados (formato: "sectionId-row-seat")
  }],
  blockedSections: [{
    type: String // IDs de secciones completamente bloqueadas
  }],
  configuredAt: {
    type: Date,
    default: Date.now
  }
});

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
  
  // Nuevo: Pricing por secciones
  sectionPricing: [sectionPricingSchema],
  
  // Flag para indicar si el evento usa pricing por secciones
  usesSectionPricing: { 
    type: Boolean, 
    default: false 
  },

  seatMapConfiguration: seatMapConfigurationSchema,
  
  image: { type: String, default: "/images/default.jpg" }
}, { timestamps: true });

// Middleware para calcular capacidad total basada en sectionPricing
eventSchema.pre('save', function(next) {
  if (this.usesSectionPricing && this.sectionPricing && this.sectionPricing.length > 0) {
    // Calcular capacidad total sumando todas las secciones
    this.capacity = this.sectionPricing.reduce((total, section) => {
      return total + section.capacity;
    }, 0);
  }
  next();
});

// Método para obtener el precio mínimo del evento
eventSchema.methods.getMinPrice = function() {
  if (!this.usesSectionPricing || !this.sectionPricing || this.sectionPricing.length === 0) {
    return this.price;
  }
  
  return Math.min(...this.sectionPricing.map(section => section.price));
};

// Método para obtener el precio máximo del evento
eventSchema.methods.getMaxPrice = function() {
  if (!this.usesSectionPricing || !this.sectionPricing || this.sectionPricing.length === 0) {
    return this.price;
  }
  
  return Math.max(...this.sectionPricing.map(section => section.price));
};

// Método para obtener el rango de precios como string
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

eventSchema.methods.isSeatBlocked = function(seatId) {
  // Verificar si el asiento está bloqueado individualmente
  if (this.blockedSeats && this.blockedSeats.includes(seatId)) {
    return true;
  }
  
  // Verificar si la sección del asiento está bloqueada
  if (this.blockedSections && this.blockedSections.length > 0) {
    const sectionId = seatId.split('-')[0]; // Extraer sectionId del formato "sectionId-row-seat"
    return this.blockedSections.includes(sectionId);
  }
  
  return false;
};

const Event = mongoose.model("Event", eventSchema);

export default Event;