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
    console.log('Received req.body:', req.body);
    
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
      usesSectionPricing 
    } = req.body;

    // Verificar si faltan campos obligatorios
    if (!name || !date || !location || !type) {
      return res.status(400).json({ 
        error: "Missing required fields: name, date, location, type",
        received: req.body
      });
    }

    const eventDescription = description || `Evento de ${type}`;

    // Obtener información de la ubicación
    const locationResponse = await axios.get(`${locationServiceUrl}/locations/${location}`);
    const locationDoc = locationResponse.data;

    if (!locationDoc) return res.status(400).json({ error: "Location not found" });

    let eventData = {
      name,
      date: new Date(date),
      location: locationDoc._id,
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
      
      console.log('Creating event with section pricing:', {
        totalCapacity: eventData.capacity,
        basePrice: eventData.price,
        sections: sectionPricing.length
      });
    } else {
      // Pricing tradicional
      eventData.capacity = capacity || locationDoc.capacity || 100;
      eventData.price = price || 0;
      eventData.usesSectionPricing = false;
      
      console.log('Creating event with traditional pricing:', {
        capacity: eventData.capacity,
        price: eventData.price
      });
    }

    // Crear el nuevo evento
    const newEvent = new EventModel(eventData);

    console.log('Creating event with data:', newEvent.toObject());
    await newEvent.save();
    
    res.status(201).json(newEvent);
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

    res.status(200).json(eventObj);
  } catch (error) {
    console.error("Error fetching event details:", error);
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