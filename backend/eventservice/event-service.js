
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Event from './event-model.js';
import axios from 'axios';
import multer from 'multer';
import path from 'path';

const app = express();
const port = 8003;

app.use(express.json());
app.use(cors());

const mongoUriEvents = process.env.MONGODB_URI || "mongodb://localhost:27017/eventdb";
const locationServiceUrl = process.env.LOCATION_SERVICE_URL || "http://localhost:8004";

// Conexión a la base de datos de eventos
const eventDbConnection = mongoose.createConnection(mongoUriEvents, { useNewUrlParser: true, useUnifiedTopology: true });

eventDbConnection.on('connected', () => {
  console.log('Conectado a la base de datos de eventos');
});

eventDbConnection.on('error', (error) => {
  console.error('Error en la conexión de eventos:', error);
});

const EventModel = eventDbConnection.model('Event', Event.schema);

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

// Función auxiliar para obtener información del seatmap
const getSeatMapInfo = async (seatMapId) => {
  try {
    const response = await axios.get(`${locationServiceUrl}/seatmaps/${seatMapId}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo seatmap ${seatMapId}:`, error);
    return null;
  }
};

// Ruta para crear un evento
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

    let eventData = {
      name,
      date: new Date(date),
      location: location._id,
      type,
      description: eventDescription,
      state: state || 'proximo',
      image: '/images/default.jpg'
    };

    // Manejo del pricing por secciones
    if (usesSectionPricing && sectionPricing && sectionPricing.length > 0) {
      // Validar que todas las secciones tengan los campos requeridos
      for (const section of sectionPricing) {
        if (!section.sectionId || !section.sectionName || section.price === undefined || !section.capacity) {
          return res.status(400).json({ 
            error: "Invalid section pricing data. All sections must have sectionId, sectionName, price, and capacity" 
          });
        }
        
        if (section.price < 0) {
          return res.status(400).json({ 
            error: `Price for section ${section.sectionName} cannot be negative` 
          });
        }
      }

      eventData.sectionPricing = sectionPricing;
      eventData.usesSectionPricing = true;
      
      // Calcular capacidad total y precio base (mínimo)
      eventData.capacity = sectionPricing.reduce((total, section) => total + section.capacity, 0);
      eventData.price = Math.min(...sectionPricing.map(section => section.price));
      
    } else {
      // Pricing tradicional
      eventData.capacity = capacity || location.capacity || 100;
      eventData.price = price || 0;
      eventData.usesSectionPricing = false;
      
    }

    // Manejo de configuración de asientos bloqueados
    if (location.seatMapId && (blockedSeats || blockedSections || seatMapConfiguration)) {

      // Usar seatMapConfiguration si está disponible, sino crear una nueva
      const seatMapConfig = seatMapConfiguration || {
        seatMapId: location.seatMapId,
        blockedSeats: blockedSeats || [],
        blockedSections: blockedSections || [],
        configuredAt: new Date()
      };

      eventData.seatMapConfiguration = seatMapConfig;
      eventData.blockedSeats = (seatMapConfig.blockedSeats && Array.isArray(seatMapConfig.blockedSeats)) ? seatMapConfig.blockedSeats : [];
      eventData.blockedSections = (seatMapConfig.blockedSections && Array.isArray(seatMapConfig.blockedSections)) ? seatMapConfig.blockedSections : [];

    } else {
      // Inicializar arrays vacíos si no hay configuración de bloqueos
      eventData.blockedSeats = [];
      eventData.blockedSections = [];
    }

    if (!eventData.blockedSeats) eventData.blockedSeats = [];
    if (!eventData.blockedSections) eventData.blockedSections = [];

    // Crear el nuevo evento
    const newEvent = new EventModel(eventData);

    await newEvent.save();
    
    // Poblar la ubicación antes de devolver
    const savedEvent = await EventModel.findById(newEvent._id);
    const eventObj = savedEvent.toObject();
    eventObj.location = location;

    res.status(201).json(eventObj);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Ruta para obtener todos los eventos
app.get("/events", async (req, res) => {
  try {
    const events = await EventModel.find();

    // Obtener las ubicaciones de los eventos
    const locationIds = events.map(event => event.location);
    const locationResponses = await Promise.all(
      locationIds.map(locationId => axios.get(`${locationServiceUrl}/locations/${locationId}`))
    );

    const locationMap = {};
    locationResponses.forEach(response => {
      const location = response.data;
      locationMap[location._id] = location;
    });

    // Añadir la ubicación a cada evento y calcular información de precios
    const eventsWithLocations = events.map(event => {
      const e = event.toObject();
      e.location = locationMap[e.location.toString()] || null;
      
      // Añadir información de rango de precios
      if (e.usesSectionPricing && e.sectionPricing && e.sectionPricing.length > 0) {
        const prices = e.sectionPricing.map(section => section.price);
        e.priceRange = {
          min: Math.min(...prices),
          max: Math.max(...prices),
          display: Math.min(...prices) === Math.max(...prices) 
            ? `€${Math.min(...prices)}` 
            : `€${Math.min(...prices)} - €${Math.max(...prices)}`
        };
      } else {
        e.priceRange = {
          min: e.price,
          max: e.price,
          display: `€${e.price}`
        };
      }
      
      return e;
    });

    res.status(200).json(eventsWithLocations);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Ruta para obtener un evento específico
app.get("/events/:eventId", async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Obtener la ubicación del evento
    const locationResponse = await axios.get(`${locationServiceUrl}/locations/${event.location}`);
    const location = locationResponse.data;

    const eventObj = event.toObject();
    eventObj.location = location || null;

    // Si usa pricing por secciones, obtener información del seatmap
    if (eventObj.usesSectionPricing && location && location.seatMapId) {
      const seatMapInfo = await getSeatMapInfo(location.seatMapId);
      if (seatMapInfo) {
        eventObj.seatMapInfo = seatMapInfo;
      }
    }

    // Añadir información de rango de precios
    if (eventObj.usesSectionPricing && eventObj.sectionPricing && eventObj.sectionPricing.length > 0) {
      const prices = eventObj.sectionPricing.map(section => section.price);
      eventObj.priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices),
        display: Math.min(...prices) === Math.max(...prices) 
          ? `€${Math.min(...prices)}` 
          : `€${Math.min(...prices)} - €${Math.max(...prices)}`
      };
    } else {
      eventObj.priceRange = {
        min: eventObj.price,
        max: eventObj.price,
        display: `€${eventObj.price}`
      };
    }

    // Añadir estadísticas de bloqueos
    const blockingStats = {
      blockedSeats: eventObj.blockedSeats ? eventObj.blockedSeats.length : 0,
      blockedSections: eventObj.blockedSections ? eventObj.blockedSections.length : 0,
      hasBlocks: (eventObj.blockedSeats && eventObj.blockedSeats.length > 0) || (eventObj.blockedSections && eventObj.blockedSections.length > 0)
    };
    eventObj.blockingStats = blockingStats;

    res.status(200).json(eventObj);
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Ruta para actualizar bloqueos de asientos de un evento existente
app.put("/events/:eventId/seat-blocks", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { blockedSeats, blockedSections } = req.body;

    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Actualizar configuración de bloqueos
    if (event.seatMapConfiguration) {
      event.seatMapConfiguration.blockedSeats = blockedSeats || [];
      event.seatMapConfiguration.blockedSections = blockedSections || [];
      event.seatMapConfiguration.configuredAt = new Date();
    } else {
      // Crear configuración si no existe
      const locationResponse = await axios.get(`${locationServiceUrl}/locations/${event.location}`);
      const location = locationResponse.data;
      
      event.seatMapConfiguration = {
        seatMapId: location.seatMapId,
        blockedSeats: blockedSeats || [],
        blockedSections: blockedSections || [],
        configuredAt: new Date()
      };
    }

    // Actualizar arrays directos
    event.blockedSeats = blockedSeats || [];
    event.blockedSections = blockedSections || [];

    await event.save();

    console.log(`Updated seat blocks for event ${eventId}:`, {
      blockedSeats: event.blockedSeats.length,
      blockedSections: event.blockedSections.length
    });

    res.status(200).json({
      message: "Seat blocks updated successfully",
      blockedSeats: event.blockedSeats.length,
      blockedSections: event.blockedSections.length
    });
  } catch (error) {
    console.error("Error updating seat blocks:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Iniciar el servidor
const server = app.listen(port, () => {
  console.log(`Event Service listening at http://localhost:${port}`);
});

server.on("close", () => {
  eventDbConnection.close();
});

export default server;