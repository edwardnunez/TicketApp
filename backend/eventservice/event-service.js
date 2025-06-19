import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Event from './event-model.js';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import EventStateService from './event-state-service.js';

const app = express();
const port = 8003;

app.use(express.json());
app.use(cors());

const mongoUriEvents = process.env.MONGODB_URI || "mongodb://localhost:27017/eventdb";
const locationServiceUrl = process.env.LOCATION_SERVICE_URL || "http://localhost:8004";
const ticketServiceUrl = process.env.TICKET_SERVICE_URL || "http://localhost:8002";

const eventDbConnection = mongoose.createConnection(mongoUriEvents, { useNewUrlParser: true, useUnifiedTopology: true });

eventDbConnection.on('connected', () => {
  console.log('Conectado a la base de datos de eventos');
});

eventDbConnection.on('error', (error) => {
  console.error('Error en la conexión de eventos:', error);
});

const EventModel = eventDbConnection.model('Event', Event.schema);

const stateService = new EventStateService();
stateService.setEventModel(EventModel);

// Configuración de almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/events');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use('/images/events', express.static('images/events'));

const getSeatMapInfo = async (seatMapId) => {
  try {
    const response = await axios.get(`${locationServiceUrl}/seatmaps/${seatMapId}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo seatmap ${seatMapId}:`, error);
    return null;
  }
};

// Función auxiliar para crear sectionPricing con información de filas del seatmap
const createSectionPricing = (seatMapInfo, pricingData) => {
  if (!seatMapInfo || !seatMapInfo.sections || !pricingData) {
    return [];
  }
  
  return seatMapInfo.sections.map(section => {
    const sectionPricing = pricingData.find(p => p.sectionId === section.id);
    
    if (!sectionPricing) {
      // Sección sin pricing específico, usar valores por defecto
      return {
        sectionId: section.id,
        sectionName: section.name,
        basePrice: section.price || 0,
        variablePrice: 0,
        capacity: section.rows * section.seatsPerRow,
        rows: section.rows,
        seatsPerRow: section.seatsPerRow,
        frontRowFirst: true
      };
    }
    
    return {
      sectionId: section.id,
      sectionName: section.name,
      basePrice: sectionPricing.basePrice || sectionPricing.price || section.price || 0,
      variablePrice: sectionPricing.variablePrice || 0,
      capacity: section.rows * section.seatsPerRow,
      rows: section.rows,
      seatsPerRow: section.seatsPerRow,
      frontRowFirst: sectionPricing.frontRowFirst !== undefined ? sectionPricing.frontRowFirst : true
    };
  });
};

// Actualizar la ruta para crear un evento
app.post("/event", async (req, res) => {
  try {
    const { 
      name, 
      date, 
      location, 
      type, 
      description, 
      capacity, 
      price, 
      state,
      sectionPricing,
      usesSectionPricing,
      usesRowPricing, // Nuevo parámetro
      blockedSeats,
      blockedSections,
      seatMapConfiguration
    } = req.body;

    // Verificar si faltan campos obligatorios
    if (!name || !date || !location || !type) {
      return res.status(400).json({ 
        error: "Missing required fields: name, date, location, type",
        received: req.body
      });
    }

    const eventDescription = description || `Evento de ${type}`;
    const eventDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    let initialState = state || 'proximo';
    if (!state) {
      if (eventDay < today) {
        initialState = 'finalizado';
      } else if (eventDay.getTime() === today.getTime()) {
        initialState = 'activo';
      }
    }

    let eventData = {
      name,
      date: eventDate,
      location: location._id,
      type,
      description: eventDescription,
      state: initialState,
      image: '/images/default.jpg'
    };

    // Manejo del pricing por secciones y filas
    if (usesSectionPricing && sectionPricing && sectionPricing.length > 0) {
      // Validar datos de sectionPricing
      for (const section of sectionPricing) {
        if (!section.sectionId || !section.sectionName || section.basePrice === undefined) {
          return res.status(400).json({ 
            error: "Invalid section pricing data. All sections must have sectionId, sectionName, and basePrice" 
          });
        }
        
        if (section.basePrice < 0 || (section.variablePrice && section.variablePrice < 0)) {
          return res.status(400).json({ 
            error: `Prices for section ${section.sectionName} cannot be negative` 
          });
        }
      }

      // Si hay seatMapId, obtener información del seatmap para completar los datos
      let finalSectionPricing = sectionPricing;
      if (location.seatMapId) {
        const seatMapInfo = await getSeatMapInfo(location.seatMapId);
        if (seatMapInfo) {
          finalSectionPricing = createSectionPricing(seatMapInfo, sectionPricing);
        }
      }

      eventData.sectionPricing = finalSectionPricing;
      eventData.usesSectionPricing = true;
      eventData.usesRowPricing = usesRowPricing || false;
      eventData.capacity = finalSectionPricing.reduce((total, section) => total + section.capacity, 0);
      eventData.price = Math.min(...finalSectionPricing.map(section => section.basePrice || section.price || 0));
    } else {
      eventData.capacity = capacity || location.capacity || 100;
      eventData.price = price || 0;
      eventData.usesSectionPricing = false;
      eventData.usesRowPricing = false;
    }

    // Configuración de asientos bloqueados
    if (location.seatMapId && (blockedSeats || blockedSections || seatMapConfiguration)) {
      const seatMapConfig = seatMapConfiguration || {
        seatMapId: location.seatMapId,
        blockedSeats: blockedSeats || [],
        blockedSections: blockedSections || [],
        configuredAt: new Date()
      };

      eventData.seatMapConfiguration = seatMapConfig;
    }

    const newEvent = new EventModel(eventData);
    await newEvent.save();
    
    const savedEvent = await EventModel.findById(newEvent._id);
    const eventObj = savedEvent.toObject();
    eventObj.location = location;

    res.status(201).json(eventObj);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Actualizar la ruta para obtener un evento específico
app.get("/events/:eventId", stateService.updateStatesMiddleware.bind(stateService), async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const locationResponse = await axios.get(`${locationServiceUrl}/locations/${event.location}`);
    const location = locationResponse.data;

    const eventObj = event.toObject();
    eventObj.location = location || null;

    // Información del seatmap si usa pricing por secciones
    if (eventObj.usesSectionPricing && location && location.seatMapId) {
      const seatMapInfo = await getSeatMapInfo(location.seatMapId);
      if (seatMapInfo) {
        eventObj.seatMapInfo = seatMapInfo;
      }
    }

    // Información detallada de pricing
    if (eventObj.usesSectionPricing) {
      eventObj.sectionPricingInfo = event.getSectionPricingInfo();
      eventObj.priceRange = {
        min: event.getMinPrice(),
        max: event.getMaxPrice(),
        display: event.getPriceRange()
      };
    } else {
      eventObj.priceRange = {
        min: eventObj.price,
        max: eventObj.price,
        display: `€${eventObj.price}`
      };
    }

    // Estadísticas de bloqueos
    const blockingStats = {
      blockedSeats: (eventObj.seatMapConfiguration?.blockedSeats || []).length,
      blockedSections: (eventObj.seatMapConfiguration?.blockedSections || []).length,
      hasBlocks: (eventObj.seatMapConfiguration?.blockedSeats || []).length > 0 || 
                 (eventObj.seatMapConfiguration?.blockedSections || []).length > 0
    };
    eventObj.blockingStats = blockingStats;

    res.status(200).json(eventObj);
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Nueva ruta para obtener el precio de un asiento específico
app.get("/events/:eventId/seat-price/:sectionId/:row/:seat", async (req, res) => {
  try {
    const { eventId, sectionId, row, seat } = req.params;
    
    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const seatId = `${sectionId}-${row}-${seat}`;
    const price = event.getSeatPrice(sectionId, parseInt(row), parseInt(seat));
    const isBlocked = event.isSeatBlocked(seatId);

    res.status(200).json({
      eventId,
      seatId,
      sectionId,
      row: parseInt(row),
      seat: parseInt(seat),
      price,
      isBlocked,
      available: !isBlocked
    });
  } catch (error) {
    console.error("Error fetching seat price:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Nueva ruta para obtener precios de múltiples asientos
app.post("/events/:eventId/seats-pricing", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { seats } = req.body; // Array de objetos { sectionId, row, seat }
    
    if (!seats || !Array.isArray(seats)) {
      return res.status(400).json({ error: "seats array is required" });
    }

    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const seatsPricing = seats.map(seatInfo => {
      const { sectionId, row, seat } = seatInfo;
      const seatId = `${sectionId}-${row}-${seat}`;
      const price = event.getSeatPrice(sectionId, parseInt(row), parseInt(seat));
      const isBlocked = event.isSeatBlocked(seatId);

      return {
        seatId,
        sectionId,
        row: parseInt(row),
        seat: parseInt(seat),
        price,
        isBlocked,
        available: !isBlocked
      };
    });

    const totalPrice = seatsPricing
      .filter(seat => seat.available)
      .reduce((total, seat) => total + seat.price, 0);

    res.status(200).json({
      eventId,
      seats: seatsPricing,
      totalPrice,
      availableSeats: seatsPricing.filter(seat => seat.available).length,
      blockedSeats: seatsPricing.filter(seat => seat.isBlocked).length
    });
  } catch (error) {
    console.error("Error fetching seats pricing:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});