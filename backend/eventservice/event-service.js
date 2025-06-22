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

// Función auxiliar para crear sectionPricing con información de filas del seatmap
const createSectionPricing = (seatMapInfo, pricingData) => {
  if (!seatMapInfo || !seatMapInfo.sections || !pricingData) {
    return [];
  }
  
  return seatMapInfo.sections.map(section => {
    const sectionPricing = pricingData.find(p => p.sectionId === section.id);
    
    // Calcular capacidad, filas y asientos por fila
    let capacity, rows, seatsPerRow;
    
    if (section.hasNumberedSeats === false) {
      // Sección de entrada general (como "Pista")
      capacity = section.totalCapacity || section.capacity || 0;
      rows = 1;
      seatsPerRow = capacity || 1; // Asegurar que seatsPerRow nunca sea 0
    } else {
      // Sección con asientos numerados
      capacity = section.rows * section.seatsPerRow;
      rows = section.rows || 1;
      seatsPerRow = section.seatsPerRow || 1;
    }
    
    if (!sectionPricing) {
      // Sección sin pricing específico, usar valores por defecto
      return {
        sectionId: section.id,
        sectionName: section.name,
        basePrice: section.price || 0,
        variablePrice: 0,
        capacity: capacity,
        rows: rows,
        seatsPerRow: seatsPerRow,
        frontRowFirst: true
      };
    }
    
    return {
      sectionId: section.id,
      sectionName: section.name,
      basePrice: sectionPricing.basePrice || sectionPricing.price || section.price || 0,
      variablePrice: sectionPricing.variablePrice || 0,
      capacity: capacity,
      rows: rows,
      seatsPerRow: seatsPerRow,
      frontRowFirst: sectionPricing.frontRowFirst !== undefined ? sectionPricing.frontRowFirst : true
    };
  });
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
      usesRowPricing,
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
      eventData.blockedSeats = seatMapConfig.blockedSeats || [];
      eventData.blockedSections = seatMapConfig.blockedSections || [];
    } else {
      eventData.blockedSeats = [];
      eventData.blockedSections = [];
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

// Ruta para obtener todos los eventos
app.get("/events", stateService.updateStatesMiddleware.bind(stateService), async (req, res) => {
  try {
    const events = await EventModel.find();

    const locationIds = events.map(event => event.location);
    const locationResponses = await Promise.all(
      locationIds.map(locationId => axios.get(`${locationServiceUrl}/locations/${locationId}`))
    );

    const locationMap = {};
    locationResponses.forEach(response => {
      const location = response.data;
      locationMap[location._id] = location;
    });

    const eventsWithLocations = events.map(event => {
      const e = event.toObject();
      e.location = locationMap[e.location.toString()] || null;
      
      // Información de rango de precios
      if (e.usesSectionPricing && e.sectionPricing && e.sectionPricing.length > 0) {
        if (e.usesRowPricing) {
          e.priceRange = {
            min: event.getMinPrice(),
            max: event.getMaxPrice(),
            display: event.getPriceRange()
          };
        } else {
          const prices = e.sectionPricing.map(section => section.price || section.basePrice);
          e.priceRange = {
            min: Math.min(...prices),
            max: Math.max(...prices),
            display: Math.min(...prices) === Math.max(...prices) 
              ? `€${Math.min(...prices)}` 
              : `€${Math.min(...prices)} - €${Math.max(...prices)}`
          };
        }
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
    const blockedSeats = eventObj.seatMapConfiguration?.blockedSeats || eventObj.blockedSeats || [];
    const blockedSections = eventObj.seatMapConfiguration?.blockedSections || eventObj.blockedSections || [];
    
    const blockingStats = {
      blockedSeats: blockedSeats.length,
      blockedSections: blockedSections.length,
      hasBlocks: blockedSeats.length > 0 || blockedSections.length > 0
    };
    eventObj.blockingStats = blockingStats;

    res.status(200).json(eventObj);
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Ruta para obtener el precio de un asiento específico
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

// Ruta para obtener precios de múltiples asientos
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

// Ruta manual para actualizar estados
app.post("/events/update-states", async (req, res) => {
  try {
    const result = await stateService.updateEventStates();
    res.json({
      success: true,
      message: "Estados actualizados correctamente",
      ...result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Ruta para obtener estadísticas de eventos por estado
app.get("/events/stats/states", async (req, res) => {
  try {
    const stats = await EventModel.aggregate([
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
          events: {
            $push: {
              id: '$_id',
              name: '$name',
              date: '$date'
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        events: stat.events
      };
      return acc;
    }, {});

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para cambiar manualmente el estado de un evento
app.patch("/events/:eventId/state", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { state } = req.body;

    const validStates = ['activo', 'proximo', 'finalizado', 'cancelado'];
    if (!validStates.includes(state)) {
      return res.status(400).json({ 
        error: `Estado inválido. Estados válidos: ${validStates.join(', ')}` 
      });
    }

    const event = await EventModel.findByIdAndUpdate(
      eventId, 
      { state }, 
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    res.json({
      success: true,
      message: `Estado del evento actualizado a '${state}'`,
      event: {
        id: event._id,
        name: event.name,
        state: event.state,
        date: event.date
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar bloqueos de asientos
app.put("/events/:eventId/seat-blocks", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { blockedSeats, blockedSections } = req.body;

    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.seatMapConfiguration) {
      event.seatMapConfiguration.blockedSeats = blockedSeats || [];
      event.seatMapConfiguration.blockedSections = blockedSections || [];
      event.seatMapConfiguration.configuredAt = new Date();
    } else {
      const locationResponse = await axios.get(`${locationServiceUrl}/locations/${event.location}`);
      const location = locationResponse.data;
      
      event.seatMapConfiguration = {
        seatMapId: location.seatMapId,
        blockedSeats: blockedSeats || [],
        blockedSections: blockedSections || [],
        configuredAt: new Date()
      };
    }

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

// Ruta para eliminar un evento
app.delete("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verificar que el evento existe
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    try {
      await axios.delete(`${ticketServiceUrl}/tickets/event/${eventId}`);
      console.log(`Tickets eliminados para el evento ${eventId}`);
    } catch (ticketError) {
      console.warn(`Error eliminando tickets para evento ${eventId}:`, ticketError.message);
      // Continuamos con la eliminación del evento aunque falle la eliminación de tickets
    }

    // Eliminar el evento
    await EventModel.findByIdAndDelete(eventId);

    console.log(`Evento ${eventId} eliminado correctamente`);

    res.status(200).json({
      success: true,
      message: "Evento y tickets asociados eliminados correctamente",
      eventId: eventId,
      eventName: event.name
    });

  } catch (error) {
    console.error("Error eliminando evento:", error);
    res.status(500).json({ 
      error: "Error interno del servidor", 
      details: error.message 
    });
  }
});

const server = app.listen(port, async () => {
  console.log(`🚀 Event Service listening at http://localhost:${port}`);
  
  stateService.startCronJobs();
  
  // Ejecutar actualización inicial después de 2 segundos
  setTimeout(async () => {
    console.log('🔄 Ejecutando actualización inicial de estados...');
    const result = await stateService.updateEventStates();
    if (result.finalizados > 0 || result.activados > 0) {
      console.log('✅ Actualización inicial completada:', result);
    } else {
      console.log('✅ Estados ya actualizados');
    }
  }, 2000);
});

server.on("close", () => {
  eventDbConnection.close();
});

export default server;