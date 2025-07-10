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

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Límites aumentados solo para rutas con imágenes
const largePayloadMiddleware = express.json({ limit: '50mb' });

const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

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

// Ruta para crear un evento
app.post("/event", largePayloadMiddleware, async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`=== INICIO CREACIÓN DE EVENTO [${requestId}] ===`);
  console.log('Timestamp:', new Date().toISOString());
  console.log('Body recibido:', JSON.stringify(req.body, null, 2));
  
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
            error: "Invalid section pricing data. All sections must have sectionId, sectionName, and defaultPrice" 
          });
        }
        
        if (section.defaultPrice < 0) {
          return res.status(400).json({ 
            error: `Default price for section ${section.sectionName} cannot be negative` 
          });
        }
        
        // Validar rowPricing si existe
        if (section.rowPricing && Array.isArray(section.rowPricing)) {
          for (const rowPrice of section.rowPricing) {
            if (rowPrice.row === undefined || rowPrice.price === undefined) {
              return res.status(400).json({ 
                error: `Invalid row pricing for section ${section.sectionName}. Row and price are required` 
              });
            }
            
            if (rowPrice.price < 0) {
              return res.status(400).json({ 
                error: `Row ${rowPrice.row} price in section ${section.sectionName} cannot be negative` 
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
      eventData.blockedSeats = seatMapConfig.blockedSeats || [];
      eventData.blockedSections = seatMapConfig.blockedSections || [];
    } else {
      eventData.blockedSeats = [];
      eventData.blockedSections = [];
    }

    // Validación: no permitir eventos en la misma ubicación con menos de 24h de diferencia
    const eventDateStart = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 24h antes
    const eventDateEnd = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000); // 24h después
    
    console.log('Validando conflicto de eventos:');
    console.log('Fecha del nuevo evento:', eventDate);
    console.log('Rango de búsqueda:', eventDateStart, 'a', eventDateEnd);
    console.log('Ubicación:', eventData.location);
    console.log('Nombre del nuevo evento:', eventData.name);
    
    const conflictEvent = await EventModel.findOne({
      location: eventData.location,
      date: { $gte: eventDateStart, $lte: eventDateEnd },
      state: { $ne: 'cancelado' } // Excluir eventos cancelados
    });
    
    console.log('Evento conflictivo encontrado:', conflictEvent);
    if (conflictEvent) {
      console.log('Detalles del conflicto:');
      console.log('- Evento existente ID:', conflictEvent._id);
      console.log('- Evento existente nombre:', conflictEvent.name);
      console.log('- Evento existente fecha:', conflictEvent.date);
      console.log('- Evento existente estado:', conflictEvent.state);
      console.log('- Nuevo evento nombre:', eventData.name);
      console.log('- Nuevo evento fecha:', eventDate);
    }
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

    console.log('=== GUARDANDO EVENTO ===');
    console.log('EventData a guardar:', JSON.stringify(eventData, null, 2));
    
    const newEvent = new EventModel(eventData);
    await newEvent.save();
    
    console.log('=== EVENTO GUARDADO ===');
    console.log('ID del evento creado:', newEvent._id);
    console.log('Nombre del evento creado:', newEvent.name);
    console.log('Fecha del evento creado:', newEvent.date);
    
    const savedEvent = await EventModel.findById(newEvent._id);
    const eventObj = savedEvent.toObject();
    eventObj.location = location;

    if (savedEvent.hasImage()) {
      eventObj.imageUrl = savedEvent.getImageDataUrl();
    }

    console.log(`=== FIN CREACIÓN DE EVENTO [${requestId}] ===`);
    res.status(201).json(eventObj);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.patch("/events/:eventId/image", largePayloadMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
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
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ 
      ...updatedEvent.toObject(),
      imageUrl: updatedEvent.getImageDataUrl(),
      hasCustomImage: true
    });
  } catch (error) {
    console.error("Error updating event image:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.get("/events/:eventId/image", async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (!event.hasImage()) {
      return res.status(404).json({ error: "Event has no custom image" });
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
      
      // Log para depuración
      console.log('Event pricing debug:', {
        eventId: eventObj._id,
        usesSectionPricing: eventObj.usesSectionPricing,
        usesRowPricing: eventObj.usesRowPricing,
        sectionPricing: eventObj.sectionPricing,
        priceRange: eventObj.priceRange
      });
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

// Ruta para actualizar un evento completo
app.put("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventData = req.body;

    console.log(`=== ACTUALIZANDO EVENTO ${eventId} ===`);
    console.log('Datos recibidos:', JSON.stringify(eventData, null, 2));

    // Verificar que el evento existe
    const existingEvent = await EventModel.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    // Validar conflicto de eventos (excluyendo el evento actual)
    const eventDate = new Date(eventData.date);
    const startRange = new Date(eventDate.getTime() - 12 * 60 * 60 * 1000); // 12 horas antes
    const endRange = new Date(eventDate.getTime() + 12 * 60 * 60 * 1000); // 12 horas después

    console.log('Validando conflicto de eventos:');
    console.log('Fecha del evento a actualizar:', eventData.date);
    console.log('Rango de búsqueda:', startRange.toISOString(), 'a', endRange.toISOString());
    console.log('Ubicación:', eventData.location);
    console.log('Nombre del evento a actualizar:', eventData.name);

    const conflictEvent = await EventModel.findOne({
      _id: { $ne: eventId }, // Excluir el evento actual
      location: eventData.location,
      date: {
        $gte: startRange,
        $lte: endRange
      }
    });

    console.log('Evento conflictivo encontrado:', conflictEvent ? {
      id: conflictEvent._id,
      name: conflictEvent.name,
      date: conflictEvent.date
    } : null);

    if (conflictEvent) {
      console.log('Detalles del conflicto:');
      console.log('- Evento existente ID:', conflictEvent._id);
      console.log('- Evento existente nombre:', conflictEvent.name);
      console.log('- Evento existente fecha:', conflictEvent.date);
      console.log('- Evento existente estado:', conflictEvent.state);
      console.log('- Nuevo evento nombre:', eventData.name);
      console.log('- Nuevo evento fecha:', eventData.date);

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
      blockedSeats: eventData.blockedSeats || [],
      blockedSections: eventData.blockedSections || [],
      generalAdmissionCapacities: eventData.generalAdmissionCapacities || {},
      seatMapConfiguration: eventData.seatMapConfiguration
    };

    console.log('=== ACTUALIZANDO EVENTO ===');
    console.log('Datos a actualizar:', JSON.stringify(updateData, null, 2));

    // Actualizar el evento
    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('=== EVENTO ACTUALIZADO ===');
    console.log('ID del evento actualizado:', updatedEvent._id);
    console.log('Nombre del evento actualizado:', updatedEvent.name);
    console.log('Fecha del evento actualizado:', updatedEvent.date);

    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Error actualizando evento:', error);
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
    try {
      await axios.delete(`${ticketServiceUrl}/tickets/event/${eventId}`);
      console.log(`Tickets eliminados para el evento ${eventId}`);
    } catch (ticketError) {
      console.warn(`Error eliminando tickets para evento ${eventId}:`, ticketError.message);
    }
    // Cambiar el estado del evento a cancelado
    event.state = 'cancelado';
    await event.save();
    console.log(`Evento ${eventId} cancelado correctamente`);
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
      await axios.delete(`${ticketServiceUrl}/tickets/event/${eventId}`);
      console.log(`Tickets eliminados para el evento ${eventId}`);
    } catch (ticketError) {
      console.warn(`Error eliminando tickets para evento ${eventId}:`, ticketError.message);
    }
    await EventModel.findByIdAndDelete(eventId);
    console.log(`Evento ${eventId} eliminado de la base de datos`);
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