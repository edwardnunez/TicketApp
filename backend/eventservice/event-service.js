import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Event from './event-model.js';
import axios from 'axios';
import multer from 'multer';
import EventStateService from './event-state-service.js';
import nodemailer from 'nodemailer';

const axiosInstance = global.axios || axios;

const app = express();
const port = 8003;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/event', express.json({ limit: '10mb' }));
app.use('/events/*/image', express.json({ limit: '10mb' }));

// Increased limits only for routes with images or large payloads
const largePayloadMiddleware = express.json({ limit: '10mb' });
const largeUrlEncodedMiddleware = express.urlencoded({ limit: '10mb', extended: true });

const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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

/**
 * Nodemailer transporter configuration for sending emails
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'tu_email@gmail.com',
    pass: process.env.SMTP_PASS || 'tu_contraseña',
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Función para enviar email de cancelación
async function enviarEmailCancelacion({ to, subject, html }) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'TicketApp <no-reply@ticketapp.com>',
    to,
    subject,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de cancelación enviado a', to);
  } catch (err) {
    console.error('Error enviando email de cancelación:', err);
  }
}

// Función auxiliar para obtener información del seatmap
const getSeatMapInfo = async (seatMapId) => {
  try {
    const response = await axiosInstance.get(`${locationServiceUrl}/seatmaps/${seatMapId}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo seatmap ${seatMapId}:`, error);
    return null;
  }
};

const createSectionPricing = (seatMapInfo, pricingData) => {
  if (!seatMapInfo || !seatMapInfo.sections || !pricingData) {
    return [];
  }
  
  return seatMapInfo.sections.map(section => {
    const sectionPricing = pricingData.find(p => p.sectionId === section.id);
    
    // Calcular capacidad, filas y asientos por fila
    let capacity, rows, seatsPerRow;
    
    if (section.hasNumberedSeats === false) {
      // Sección de entrada general
      capacity = sectionPricing?.customCapacity || sectionPricing?.capacity || section.totalCapacity || section.capacity || 0;
      rows = 1;
      seatsPerRow = capacity;
    } else {
      // Sección con asientos numerados
      capacity = section.rows * section.seatsPerRow;
      rows = section.rows || 1;
      seatsPerRow = section.seatsPerRow || 1;
    }
    
    if (!sectionPricing) {
      // Sección sin pricing específico
      return {
        sectionId: section.id,
        sectionName: section.name,
        defaultPrice: section.defaultPrice || 0,
        rowPricing: [],
        capacity: capacity,
        rows: rows,
        seatsPerRow: seatsPerRow,
        hasNumberedSeats: section.hasNumberedSeats !== false
      };
    }
    
    return {
      sectionId: section.id,
      sectionName: section.name,
              defaultPrice: sectionPricing.defaultPrice || section.defaultPrice || 0,
      rowPricing: sectionPricing.rowPricing || [],
      capacity: capacity,
      rows: rows,
      seatsPerRow: seatsPerRow,
      hasNumberedSeats: section.hasNumberedSeats !== false,
      frontRowFirst: sectionPricing.frontRowFirst !== false
    };
  });
};

/**
 * Create a new event
 * @route POST /event
 * @param {Object} req.body - Event data
 * @param {string} req.body.name - Event name
 * @param {string} req.body.date - Event date
 * @param {string} req.body.location - Location ID
 * @param {string} req.body.type - Event type
 * @param {string} req.body.description - Event description
 * @param {number} req.body.capacity - Event capacity
 * @param {number} req.body.price - Event price
 * @param {string} req.body.state - Event state
 * @param {Array} [req.body.sectionPricing] - Section pricing configuration
 * @param {boolean} [req.body.usesSectionPricing] - Whether event uses section pricing
 * @param {boolean} [req.body.usesRowPricing] - Whether event uses row pricing
 * @param {Array} [req.body.blockedSeats] - List of blocked seats
 * @param {Array} [req.body.blockedSections] - List of blocked sections
 * @param {Object} [req.body.seatMapConfiguration] - Seat map configuration
 * @param {string} [req.body.imageData] - Base64 encoded image data
 * @returns {Object} Created event data
 */
app.post("/event", largePayloadMiddleware, largeUrlEncodedMiddleware, async (req, res) => {
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
      seatMapConfiguration,
      imageData
    } = req.body;

    // Verificar si faltan campos obligatorios
    if (!name || !date || !location || !type) {
      return res.status(400).json({
        error: "Faltan campos requeridos: nombre, fecha, ubicación, tipo",
        received: req.body
      });
    }

    const eventDescription = description || `Evento de ${type}`;
    const eventDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    if (eventDay < today) {
      return res.status(400).json({ 
        error: "No se pueden crear eventos con fechas pasadas",
        receivedDate: date,
        today: today.toISOString()
      });
    }
    
    let initialState = state || 'proximo';
    if (!state) {
      if (eventDay < today) {
        initialState = 'finalizado';
      } else if (eventDay.getTime() === today.getTime()) {
        initialState = 'activo';
      }
    }

    const eventData = {
      name,
      date: eventDate,
      location: location._id? location._id : location,
      type,
      description: eventDescription,
      state: initialState,
      createdBy: req.body.createdBy // ID del admin creador
    };

    if (imageData) {
      eventData.imageData = imageData;
      eventData.hasCustomImage = true;
      eventData.image = `data:${imageData.contentType};base64,${imageData.data}`;
    }


    // Manejo del pricing por secciones y filas
    if (usesSectionPricing && sectionPricing && sectionPricing.length > 0) {
      for (const section of sectionPricing) {
        if (!section.sectionId || !section.sectionName || section.defaultPrice === undefined) {
          return res.status(400).json({
            error: "Datos de precios de sección inválidos. Todas las secciones deben tener sectionId, sectionName y defaultPrice"
          });
        }

        if (section.defaultPrice < 0) {
          return res.status(400).json({
            error: `El precio predeterminado para la sección ${section.sectionName} no puede ser negativo`
          });
        }

        // Validar rowPricing si existe
        if (section.rowPricing && Array.isArray(section.rowPricing)) {
          for (const rowPrice of section.rowPricing) {
            if (rowPrice.row === undefined || rowPrice.price === undefined) {
              return res.status(400).json({
                error: `Precios de fila inválidos para la sección ${section.sectionName}. Se requiere fila y precio`
              });
            }

            if (rowPrice.price < 0) {
              return res.status(400).json({
                error: `El precio de la fila ${rowPrice.row} en la sección ${section.sectionName} no puede ser negativo`
              });
            }
          }
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
      eventData.price = Math.min(...finalSectionPricing.map(section => section.defaultPrice || 0));
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

    // Validación: no permitir eventos en la misma ubicación con menos de 24h de diferencia
    const eventDateStart = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
    const eventDateEnd = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000);

    const conflictEvent = await EventModel.findOne({
      location: eventData.location,
      date: { $gte: eventDateStart, $lte: eventDateEnd },
      state: { $ne: 'cancelado' }
    });

    if (conflictEvent) {
      return res.status(400).json({
        error: "Ya existe un evento en esta ubicación con menos de 24 horas de diferencia.",
        conflictEvent: {
          id: conflictEvent._id,
          name: conflictEvent.name,
          date: conflictEvent.date
        }
      });
    }

    const newEvent = new EventModel(eventData);
    await newEvent.save();

    const savedEvent = await EventModel.findById(newEvent._id);
    const eventObj = savedEvent.toObject();
    eventObj.location = location;

    if (savedEvent.hasImage()) {
      eventObj.imageUrl = savedEvent.getImageDataUrl();
    }

    res.status(201).json(eventObj);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

/**
 * Update event image
 * @route PATCH /events/:eventId/image
 * @param {string} req.params.eventId - Event ID
 * @param {File} req.file - Image file
 * @returns {Object} Updated event with new image URL
 */
app.patch("/events/:eventId/image", largePayloadMiddleware, largeUrlEncodedMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó archivo de imagen" });
    }

    // Convertir buffer a base64
    const base64Data = req.file.buffer.toString('base64');
    
    // Preparar datos de la imagen
    const imageData = {
      data: base64Data,
      contentType: req.file.mimetype,
      filename: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date()
    };

    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      { 
        imageData: imageData,
        hasCustomImage: true,
        image: `data:${req.file.mimetype};base64,${base64Data}` // Para compatibilidad
      },
      { new: true }
    ).populate('location');

    if (!updatedEvent) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    res.json({
      ...updatedEvent.toObject(),
      imageUrl: updatedEvent.getImageDataUrl(),
      hasCustomImage: true
    });
  } catch (error) {
    console.error("Error updating event image:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

/**
 * Get event image
 * @route GET /events/:eventId/image
 * @param {string} req.params.eventId - Event ID
 * @returns {Object} Event image data including URL and metadata
 */
app.get("/events/:eventId/image", async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    if (!event.hasImage()) {
      return res.status(404).json({ error: "El evento no tiene imagen personalizada" });
    }

    // Devolver la imagen como data URL
    res.json({
      imageUrl: event.getImageDataUrl(),
      filename: event.imageData.filename,
      contentType: event.imageData.contentType,
      size: event.imageData.size,
      uploadedAt: event.imageData.uploadedAt
    });

  } catch (error) {
    console.error("Error fetching event image:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

/**
 * Get all events with location data and pricing information
 * @route GET /events
 * @returns {Array} List of events with location data and price ranges
 */
app.get("/events", stateService.updateStatesMiddleware.bind(stateService), async (req, res) => {
  try {
    const events = await EventModel.find();

    const locationIds = events.map(event => event.location);
    const locationResponses = await Promise.all(
      locationIds.map(locationId => axiosInstance.get(`${locationServiceUrl}/locations/${locationId}`))
    );

    const locationMap = {};
    locationResponses.forEach(response => {
      const location = response.data;
      locationMap[location._id] = location;
    });

    const eventsWithLocations = events.map(event => {
      const e = event.toObject();
      e.location = locationMap[e.location.toString()] || null;

      if (event.hasImage()) {
        e.imageUrl = event.getImageDataUrl();
        e.hasCustomImage = true;
      } else {
        e.hasCustomImage = false;
      }
      
      // Información de rango de precios
      if (e.usesSectionPricing && e.sectionPricing && e.sectionPricing.length > 0) {
        if (e.usesRowPricing) {
          e.priceRange = {
            min: event.getMinPrice(),
            max: event.getMaxPrice(),
            display: event.getPriceRange()
          };
        } else {
          const prices = e.sectionPricing.map(section => section.defaultPrice || 0);
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
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

/**
 * Get specific event by ID with location and seatmap data
 * @route GET /events/:eventId
 * @param {string} req.params.eventId - Event ID
 * @returns {Object} Event details with location and seatmap information
 */
app.get("/events/:eventId", stateService.updateStatesMiddleware.bind(stateService), async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    // Obtener ubicación de forma tolerante a fallos para evitar 500 si el servicio externo falla
    let location = null;
    try {
      const locationResponse = await axiosInstance.get(`${locationServiceUrl}/locations/${event.location}`);
      location = locationResponse.data;
    } catch (err) {
      console.warn(`No se pudo obtener la ubicación ${event.location}:`, err.message);
      location = null;
    }

    const eventObj = event.toObject();
    eventObj.location = location || null;

    if (event.hasImage()) {
      eventObj.imageUrl = event.getImageDataUrl();
      eventObj.hasCustomImage = true;
    } else {
      eventObj.hasCustomImage = false;
    }

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
    const blockedSeats = eventObj.seatMapConfiguration?.blockedSeats || [];
    const blockedSections = eventObj.seatMapConfiguration?.blockedSections || [];
    
    const blockingStats = {
      blockedSeats: blockedSeats.length,
      blockedSections: blockedSections.length,
      hasBlocks: blockedSeats.length > 0 || blockedSections.length > 0
    };
    eventObj.blockingStats = blockingStats;

    res.status(200).json(eventObj);
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

/**
 * Get price for a specific seat
 * @route GET /events/:eventId/seat-price/:sectionId/:row/:seat
 * @param {string} req.params.eventId - Event ID
 * @param {string} req.params.sectionId - Section ID
 * @param {string} req.params.row - Row number
 * @param {string} req.params.seat - Seat number
 * @returns {Object} Seat price and blocking status
 */
app.get("/events/:eventId/seat-price/:sectionId/:row/:seat", async (req, res) => {
  try {
    const { eventId, sectionId, row, seat } = req.params;

    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    const seatId = `${sectionId}-${parseInt(row) + 1}-${parseInt(seat) + 1}`;
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
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

/**
 * Get pricing for multiple seats
 * @route POST /events/:eventId/seats-pricing
 * @param {string} req.params.eventId - Event ID
 * @param {Object} req.body - Request body
 * @param {Array} req.body.seats - Array of seat objects with sectionId, row, seat
 * @returns {Array} Array of seat pricing information
 */
app.post("/events/:eventId/seats-pricing", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { seats } = req.body; // Array de objetos { sectionId, row, seat }
    
    if (!seats || !Array.isArray(seats)) {
      return res.status(400).json({ error: "Se requiere un array de asientos" });
    }

    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    const seatsPricing = seats.map(seatInfo => {
      const { sectionId, row, seat } = seatInfo;
      const seatId = `${sectionId}-${parseInt(row) + 1}-${parseInt(seat) + 1}`;
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
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

/**
 * Manually update event states
 * @route POST /events/update-states
 * @returns {Object} State update results and statistics
 */
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
/**
 * Get event statistics grouped by state
 * @route GET /events/stats/states
 * @returns {Object} Event statistics grouped by state with counts and event lists
 */
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
        date: event.date
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventData = req.body;

    // Verificar que el evento existe
    const existingEvent = await EventModel.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    // Validar tipo de evento
    const validTypes = ['football', 'cinema', 'concert', 'theater', 'festival'];
    if (eventData.type && !validTypes.includes(eventData.type)) {
      return res.status(400).json({
        error: `Tipo de evento inválido. Los tipos válidos son: ${validTypes.join(', ')}`
      });
    }

    // Validar estado de evento
    const validStates = ['activo', 'proximo', 'finalizado', 'cancelado'];
    if (eventData.state && !validStates.includes(eventData.state)) {
      return res.status(400).json({
        error: `Estado de evento inválido. Los estados válidos son: ${validStates.join(', ')}`
      });
    }

    // Validar campos requeridos
    if (!eventData.name || !eventData.date || !eventData.location || !eventData.type) {
      return res.status(400).json({
        error: "Faltan campos requeridos: nombre, fecha, ubicación y tipo son obligatorios"
      });
    }

    // Validar precios (no pueden ser negativos)
    if (eventData.price !== undefined && eventData.price < 0) {
      return res.status(400).json({
        error: "El precio no puede ser negativo"
      });
    }

    // Validar capacidad (debe ser positiva)
    if (eventData.capacity !== undefined && eventData.capacity <= 0) {
      return res.status(400).json({
        error: "La capacidad debe ser mayor que cero"
      });
    }

    // Validar conflicto de eventos (excluyendo el evento actual)
    const eventDate = new Date(eventData.date);
    const startRange = new Date(eventDate.getTime() - 12 * 60 * 60 * 1000);
    const endRange = new Date(eventDate.getTime() + 12 * 60 * 60 * 1000);

    const conflictEvent = await EventModel.findOne({
      _id: { $ne: eventId },
      location: eventData.location,
      date: {
        $gte: startRange,
        $lte: endRange
      }
    });

    if (conflictEvent) {
      return res.status(400).json({
        error: 'Ya existe un evento en esta ubicación con menos de 24 horas de diferencia.',
        conflictEvent: {
          id: conflictEvent._id,
          name: conflictEvent.name,
          date: conflictEvent.date,
          state: conflictEvent.state
        }
      });
    }

    // Preparar datos para actualización
    const updateData = {
      name: eventData.name,
      date: eventData.date,
      location: eventData.location,
      type: eventData.type,
      description: eventData.description,
      state: eventData.state,
      capacity: eventData.capacity,
      price: eventData.price,
      usesSectionPricing: eventData.usesSectionPricing,
      usesRowPricing: eventData.usesRowPricing,
      sectionPricing: eventData.sectionPricing,

      generalAdmissionCapacities: eventData.generalAdmissionCapacities || {},
      seatMapConfiguration: eventData.seatMapConfiguration
    };

    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Error actualizando evento:', error);

    // Si es un error de validación de Mongoose, devolver 400
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.message
      });
    }

    // Si es un error de CastError (ID inválido), devolver 400
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'ID de evento inválido',
        details: error.message
      });
    }

    // Cualquier otro error es 500
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// Ruta para actualizar bloqueos de asientos
app.put("/events/:eventId/seat-blocks", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { blockedSeats, blockedSections } = req.body;

    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    if (event.seatMapConfiguration) {
      event.seatMapConfiguration.blockedSeats = blockedSeats || [];
      event.seatMapConfiguration.blockedSections = blockedSections || [];
      event.seatMapConfiguration.configuredAt = new Date();
    } else {
      const locationResponse = await axiosInstance.get(`${locationServiceUrl}/locations/${event.location}`);
      const location = locationResponse.data;
      
      event.seatMapConfiguration = {
        seatMapId: location.seatMapId,
        blockedSeats: blockedSeats || [],
        blockedSections: blockedSections || [],
        configuredAt: new Date()
      };
    }

    await event.save();

    res.status(200).json({
      message: "Bloqueos de asientos actualizados exitosamente",
      blockedSeats: event.seatMapConfiguration?.blockedSeats?.length || 0,
      blockedSections: event.seatMapConfiguration?.blockedSections?.length || 0
    });
  } catch (error) {
    console.error("Error updating seat blocks:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// Ruta para cancelar un evento (solo el admin creador)
app.delete("/events/:eventId/cancel", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { adminId } = req.body;
    // Verificar que el evento existe
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }
    // Solo el admin creador puede cancelar
    if (!adminId || event.createdBy !== adminId) {
      return res.status(403).json({ error: "No tienes permisos para cancelar este evento" });
    }

    // === ENVÍO DE EMAILS DE CANCELACIÓN ===
    try {
      // Obtener todos los tickets del evento antes de eliminarlos
      const ticketServiceUrl = process.env.TICKET_SERVICE_URL || 'http://localhost:8002';
      const ticketsRes = await axiosInstance.get(`${ticketServiceUrl}/tickets/event/${eventId}`);
      const tickets = ticketsRes.data.tickets || [];
      
      // Usar un Set para evitar emails duplicados
      const emailsEnviados = new Set();
      for (const ticket of tickets) {
        let emailDestino = ticket.customerInfo?.email;
        if (!emailDestino && ticket.userId) {
          // Buscar email del usuario en el servicio de usuarios
          try {
            const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
            const userRes = await axiosInstance.get(`${userServiceUrl}/users/search?userId=${ticket.userId}`);
            emailDestino = userRes.data.email;
          } catch (err) {
            console.warn('No se pudo obtener el email del usuario:', err.message);
          }
        }
        if (emailDestino && !emailsEnviados.has(emailDestino)) {
          // Construir HTML del email
          const html = `
            <h2>Lamentamos informarte que el evento <b>${event.name}</b> ha sido cancelado.</h2>
            <p>Recibirás el reembolso de tus entradas en los próximos días.</p>
            <ul>
              <li><b>Evento:</b> ${event.name}</li>
              <li><b>Fecha:</b> ${event.date ? new Date(event.date).toLocaleString() : 'Sin fecha'}</li>
            </ul>
            <p>Si tienes dudas, responde a este correo o contacta con soporte.</p>
          `;
          await enviarEmailCancelacion({
            to: emailDestino,
            subject: `Cancelación de evento - ${event.name}`,
            html,
          });
          emailsEnviados.add(emailDestino);
        }
      }
    } catch (err) {
      console.error('Error al enviar emails de cancelación:', err);
    }
    try {
      await axiosInstance.delete(`${ticketServiceUrl}/tickets/event/${eventId}`);
    } catch (ticketError) {
      console.warn(`Error eliminando tickets para evento ${eventId}:`, ticketError.message);
    }

    event.state = 'cancelado';
    await event.save();

    res.status(200).json({
      success: true,
      message: "Evento cancelado y tickets asociados eliminados correctamente",
      eventId: eventId,
      eventName: event.name
    });
  } catch (error) {
    console.error("Error cancelando evento:", error);
    res.status(500).json({ 
      error: "Error interno del servidor", 
      details: error.message 
    });
  }
});

// Ruta para obtener estadísticas de eventos con ventas de tickets
app.get("/events/admin/statistics", async (req, res) => {
  try {
    const { eventType, eventState, dateFrom, dateTo, search } = req.query;

    // Construir filtros para eventos
    const eventFilters = {};
    
    if (eventType && eventType !== 'all') {
      eventFilters.type = eventType;
    }
    
    if (eventState && eventState !== 'all') {
      eventFilters.state = eventState;
    }
    
    if (dateFrom || dateTo) {
      eventFilters.date = {};
      if (dateFrom) {
        eventFilters.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        eventFilters.date.$lte = new Date(dateTo);
      }
    }

    if (search && search.trim()) {
      eventFilters.name = { $regex: search.trim(), $options: 'i' };
    }

    // Obtener todos los eventos con filtros
    const events = await EventModel.find(eventFilters)
      .sort({ date: -1 })
      .lean();

    // Obtener estadísticas de tickets para cada evento
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        try {
          // Obtener estadísticas de tickets del evento
          const ticketStatsResponse = await axiosInstance.get(`${ticketServiceUrl}/tickets/event/${event._id}`);
          const ticketStats = ticketStatsResponse.data.statistics || [];

          // Calcular estadísticas consolidadas
          const stats = {
            totalTickets: 0,
            soldTickets: 0,
            pendingTickets: 0,
            cancelledTickets: 0,
            totalRevenue: 0,
            soldRevenue: 0
          };

          ticketStats.forEach(stat => {
            stats.totalTickets += stat.totalTickets || 0;
            stats.totalRevenue += stat.totalRevenue || 0;
            
            if (stat._id === 'paid') {
              stats.soldTickets += stat.totalTickets || 0;
              stats.soldRevenue += stat.totalRevenue || 0;
            } else if (stat._id === 'pending') {
              stats.pendingTickets += stat.totalTickets || 0;
            } else if (stat._id === 'cancelled') {
              stats.cancelledTickets += stat.totalTickets || 0;
            }
          });

          // Calcular porcentaje de ventas
          const salesPercentage = event.capacity > 0 
            ? Math.round((stats.soldTickets / event.capacity) * 100) 
            : 0;

          // Obtener información de ubicación
          let locationInfo = null;
          try {
            const locationResponse = await axiosInstance.get(`${locationServiceUrl}/locations/${event.location}`);
            locationInfo = locationResponse.data;
          } catch (error) {
            console.warn(`No se pudo obtener información de ubicación para evento ${event._id}:`, error.message);
          }

          return {
            ...event,
            location: locationInfo,
            ticketStats: stats,
            salesPercentage,
            availableTickets: event.capacity - stats.soldTickets - stats.pendingTickets
          };
        } catch (error) {
          console.warn(`Error obteniendo estadísticas para evento ${event._id}:`, error.message);
          return {
            ...event,
            location: null,
            ticketStats: {
              totalTickets: 0,
              soldTickets: 0,
              pendingTickets: 0,
              cancelledTickets: 0,
              totalRevenue: 0,
              soldRevenue: 0
            },
            salesPercentage: 0,
            availableTickets: event.capacity
          };
        }
      })
    );

    // Estadísticas generales
    const generalStats = {
      totalEvents: eventsWithStats.length,
      totalCapacity: eventsWithStats.reduce((sum, event) => sum + event.capacity, 0),
      totalSoldTickets: eventsWithStats.reduce((sum, event) => sum + event.ticketStats.soldTickets, 0),
      totalRevenue: eventsWithStats.reduce((sum, event) => sum + event.ticketStats.soldRevenue, 0),
      averageSalesPercentage: eventsWithStats.length > 0 
        ? Math.round(eventsWithStats.reduce((sum, event) => sum + event.salesPercentage, 0) / eventsWithStats.length)
        : 0
    };

    res.json({
      success: true,
      events: eventsWithStats,
      generalStats,
      filters: {
        eventType,
        eventState,
        dateFrom,
        dateTo,
        search
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de eventos:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudieron obtener las estadísticas de eventos"
    });
  }
});

// Ruta para eliminar un evento (cualquier admin)
app.delete("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    // Verificar que el evento existe
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }
    try {
      await axiosInstance.delete(`${ticketServiceUrl}/tickets/event/${eventId}`);
    } catch (ticketError) {
      console.warn(`Error eliminando tickets para evento ${eventId}:`, ticketError.message);
    }

    await EventModel.findByIdAndDelete(eventId);

    res.status(200).json({
      success: true,
      message: "Evento y tickets asociados eliminados de la base de datos",
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

  setTimeout(async () => {
    await stateService.updateEventStates();
  }, 2000);
});

// Exponer stateService en el servidor para las pruebas
server.stateService = stateService;

server.on("close", () => {
  // Detener cron jobs antes de cerrar
  if (stateService && typeof stateService.stopCronJobs === 'function') {
    stateService.stopCronJobs();
  }
  eventDbConnection.close();
});

export default server;