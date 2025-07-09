import mongoose from 'mongoose';

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

  imageData: {
    data: String, // Base64 string de la imagen
    contentType: String, // Tipo MIME (image/jpeg, image/png, etc.)
    filename: String, // Nombre original del archivo
    size: Number, // Tamaño en bytes
    uploadedAt: { type: Date, default: Date.now }
  },
  hasCustomImage: { type: Boolean, default: false } 
  
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

eventSchema.methods.getImageDataUrl = function() {
  if (this.imageData && this.imageData.data && this.imageData.contentType) {
    return `data:${this.imageData.contentType};base64,${this.imageData.data}`;
  }
  return null;
};

// Método para verificar si tiene imagen personalizada
eventSchema.methods.hasImage = function() {
  return this.hasCustomImage && this.imageData && this.imageData.data;
};

// Método para calcular el precio de un asiento específico
eventSchema.methods.getSeatPrice = function(sectionId, row, seat) {
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

// Método para obtener el precio máximo del evento
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