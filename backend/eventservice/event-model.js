import mongoose from 'mongoose';

// Schema para el pricing por sección con pricing por filas
const sectionPricingSchema = new mongoose.Schema({
  sectionId: { 
    type: String, 
    required: true 
  },
  sectionName: { 
    type: String, 
    required: true 
  },
  // Precio base de la sección (fila más alejada)
  basePrice: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  // Precio variable que se suma por cada fila hacia adelante
  variablePrice: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  capacity: { 
    type: Number, 
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
  // Dirección de numeración de filas (true = fila 1 es la más cara, false = fila 1 es la más barata)
  frontRowFirst: { 
    type: Boolean, 
    default: true 
  }
});

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
  
  // Flag para indicar si el evento usa pricing por secciones con filas
  usesSectionPricing: { 
    type: Boolean, 
    default: false 
  },
  
  usesRowPricing: { 
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

// Método para calcular el precio de un asiento específico
eventSchema.methods.getSeatPrice = function(sectionId, row, seat) {
  if (!this.usesSectionPricing || !this.usesRowPricing) {
    return this.price;
  }
  
  const section = this.sectionPricing.find(s => s.sectionId === sectionId);
  if (!section) {
    return this.price;
  }
  
  // Si no usa pricing por filas, devolver precio base de la sección
  if (!section.variablePrice || section.variablePrice === 0) {
    return section.basePrice || section.price || this.price;
  }
  
  // Calcular precio basado en la fila
  let rowMultiplier;
  if (section.frontRowFirst) {
    // Fila 1 es la más cara (más cerca del campo/escenario)
    rowMultiplier = section.rows - row + 1;
  } else {
    // Fila 1 es la más barata (más lejos del campo/escenario)
    rowMultiplier = row;
  }
  
  return section.basePrice + (section.variablePrice * (rowMultiplier - 1));
};

// Método para obtener el precio mínimo del evento (considerando todas las filas)
eventSchema.methods.getMinPrice = function() {
  if (!this.usesSectionPricing || !this.sectionPricing || this.sectionPricing.length === 0) {
    return this.price;
  }
  
  if (!this.usesRowPricing) {
    // Lógica anterior para compatibilidad
    return Math.min(...this.sectionPricing.map(section => section.price || section.basePrice || this.price));
  }
  
  let minPrice = Infinity;
  
  this.sectionPricing.forEach(section => {
    if (!section.variablePrice || section.variablePrice === 0) {
      // Sección sin pricing por filas
      minPrice = Math.min(minPrice, section.basePrice || section.price || this.price);
    } else {
      // Sección con pricing por filas - el mínimo es el precio base
      minPrice = Math.min(minPrice, section.basePrice);
    }
  });
  
  return minPrice === Infinity ? this.price : minPrice;
};

// Método para obtener el precio máximo del evento (considerando todas las filas)
eventSchema.methods.getMaxPrice = function() {
  if (!this.usesSectionPricing || !this.sectionPricing || this.sectionPricing.length === 0) {
    return this.price;
  }
  
  if (!this.usesRowPricing) {
    // Lógica anterior para compatibilidad
    return Math.max(...this.sectionPricing.map(section => section.price || section.basePrice || this.price));
  }
  
  let maxPrice = 0;
  
  this.sectionPricing.forEach(section => {
    if (!section.variablePrice || section.variablePrice === 0) {
      // Sección sin pricing por filas
      maxPrice = Math.max(maxPrice, section.basePrice || section.price || this.price);
    } else {
      // Sección con pricing por filas - el máximo es basePrice + (variablePrice * (rows - 1))
      const sectionMaxPrice = section.basePrice + (section.variablePrice * (section.rows - 1));
      maxPrice = Math.max(maxPrice, sectionMaxPrice);
    }
  });
  
  return maxPrice;
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

// Método para obtener información detallada de precios por sección
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
      seatsPerRow: section.seatsPerRow
    };
    
    if (this.usesRowPricing && section.variablePrice && section.variablePrice > 0) {
      // Pricing por filas
      info.pricingType = 'row';
      info.basePrice = section.basePrice;
      info.variablePrice = section.variablePrice;
      info.minPrice = section.basePrice;
      info.maxPrice = section.basePrice + (section.variablePrice * (section.rows - 1));
      info.frontRowFirst = section.frontRowFirst;
      info.priceRange = `€${info.minPrice} - €${info.maxPrice}`;
    } else {
      // Pricing fijo por sección
      info.pricingType = 'section';
      info.price = section.basePrice || section.price || this.price;
      info.priceRange = `€${info.price}`;
    }
    
    return info;
  });
};

// Método para verificar si un asiento está bloqueado
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
  
  // Fallback a las propiedades legacy
  if (this.blockedSeats && this.blockedSeats.includes(seatId)) {
    return true;
  }
  
  if (this.blockedSections && this.blockedSections.length > 0) {
    const sectionId = seatId.split('-')[0];
    return this.blockedSections.includes(sectionId);
  }
  
  return false;
};

const Event = mongoose.model("Event", eventSchema);

export default Event;