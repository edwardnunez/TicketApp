import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Ticket from './ticket-model.js';

const app = express();
const port = 8002;

app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:8000"] }));

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ticketdb";
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware para validación de ObjectId
const validateObjectId = (req, res, next) => {
  const { id, userId, eventId } = req.params;
  const idToValidate = id || userId || eventId;
  
  if (idToValidate && !mongoose.Types.ObjectId.isValid(idToValidate)) {
    return res.status(400).json({ 
      error: "ID inválido", 
      message: "El ID proporcionado no es válido" 
    });
  }
  next();
};

// Función auxiliar para obtener información de eventos
const getEventDetails = async (eventId) => {
  try {
    const response = await axios.get(`${EVENT_SERVICE_URL}/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.warn(`No se pudo obtener información del evento ${eventId}:`, error.message);
    return {
      _id: eventId,
      name: "Evento no disponible",
      date: null,
      location: "Ubicación no disponible",
      image: null,
      description: null
    };
  }
};

//obtener asientos ocupados por evento
app.get('/tickets/occupied/:eventId', validateObjectId, async (req, res) => {
  try {
    const { eventId } = req.params;

    const occupiedTickets = await Ticket.find({
      eventId: new mongoose.Types.ObjectId(eventId),
      status: { $in: ['paid', 'pending'] } // Incluir tickets pagados y pendientes
    }).select('selectedSeats').lean();

    // Extraer todos los IDs de asientos ocupados
    const occupiedSeats = [];
    occupiedTickets.forEach(ticket => {
      if (ticket.selectedSeats && ticket.selectedSeats.length > 0) {
        ticket.selectedSeats.forEach(seat => {
          occupiedSeats.push(seat.id);
        });
      }
    });

    res.json({
      success: true,
      occupiedSeats: [...new Set(occupiedSeats)],
      count: occupiedSeats.length
    });

  } catch (error) {
    console.error('Error obteniendo asientos ocupados:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudieron obtener los asientos ocupados"
    });
  }
});

app.post('/tickets/purchase', async (req, res) => {
  try {
    const { userId, eventId, ticketType, quantity, price, customerInfo, selectedSeats } = req.body;


    // Validaciones básicas
    if (!userId || !eventId || !quantity || !price) {
      return res.status(400).json({
        error: "Campos requeridos faltantes",
        message: "userId, eventId, quantity y price son requeridos"
      });
    }

    if (quantity < 1 || quantity > 6) {
      return res.status(400).json({
        error: "Cantidad inválida",
        message: "La cantidad debe estar entre 1 y 6 tickets"
      });
    }

    const newTicket = new Ticket({
      userId,
      eventId,
      ticketType: ticketType,
      price,
      quantity,
      selectedSeats,
      status: 'paid',
      customerInfo
    });

    const savedTicket = await newTicket.save();

    res.status(201).json({
      success: true,
      message: "Tickets comprados exitosamente",
      ticket: savedTicket,
      ticketId: `TKT-${savedTicket._id.toString().slice(-8).toUpperCase()}`
    });


  } catch (error) {
    console.error('Error comprando tickets:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudo completar la compra"
    });
  }
});

// GET /tickets/user/:userId - Obtener tickets del usuario (SIN información de eventos)
app.get('/tickets/user/:userId', validateObjectId, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, eventId } = req.query;

    let query = { userId };
    
    if (status && ['pending', 'paid', 'cancelled'].includes(status)) {
      query.status = status;
    }
    
    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
      query.eventId = eventId;
    }

    const tickets = await Ticket.find(query)
      .sort({ purchasedAt: -1 })
      .lean();

    res.json({
      success: true,
      tickets,
      count: tickets.length
    });

  } catch (error) {
    console.error('Error obteniendo tickets del usuario:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudieron obtener los tickets"
    });
  }
});

// GET /tickets/user/:userId/details - Obtener tickets del usuario CON información de eventos
app.get('/tickets/user/:userId/details', validateObjectId, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, eventId, limit = 50 } = req.query;

    let query = { userId };
    
    if (status && ['pending', 'paid', 'cancelled'].includes(status)) {
      query.status = status;
    }
    
    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
      query.eventId = eventId;
    }

    const tickets = await Ticket.find(query)
      .sort({ purchasedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Obtener información de eventos únicos
    const uniqueEventIds = [...new Set(tickets.map(ticket => ticket.eventId.toString()))];
    const eventsInfo = {};

    // Obtener información de todos los eventos en paralelo
    const eventPromises = uniqueEventIds.map(async (eventId) => {
      const eventInfo = await getEventDetails(eventId);
      eventsInfo[eventId] = eventInfo;
    });

    await Promise.all(eventPromises);

    // Agregar información del evento a cada ticket
    const ticketsWithEventInfo = tickets.map(ticket => ({
      ...ticket,
      event: eventsInfo[ticket.eventId.toString()]
    }));

    // Calcular estadísticas
    const stats = {
      totalTickets: tickets.length,
      totalSpent: tickets
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + (t.price * t.quantity), 0),
      activeTickets: tickets.filter(t => t.status === 'paid').length,
      pendingTickets: tickets.filter(t => t.status === 'pending').length,
      cancelledTickets: tickets.filter(t => t.status === 'cancelled').length,
      ticketTypes: [...new Set(tickets.map(t => t.ticketType))],
    };

    res.json({
      success: true,
      tickets: ticketsWithEventInfo,
      count: tickets.length,
      statistics: stats
    });

  } catch (error) {
    console.error('Error obteniendo tickets con detalles:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudieron obtener los tickets con detalles"
    });
  }
});

app.get('/tickets/event/:eventId', validateObjectId, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    let query = { eventId };
    
    if (status && ['pending', 'paid', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const tickets = await Ticket.find(query)
      .sort({ purchasedAt: -1 })
      .lean();

    // Estadísticas del evento
    const stats = await Ticket.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$status',
          totalTickets: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$price', '$quantity'] } },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      tickets,
      count: tickets.length,
      statistics: stats
    });

  } catch (error) {
    console.error('Error obteniendo tickets del evento:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudieron obtener los tickets del evento"
    });
  }
});

app.get('/tickets/:id', validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id).lean();

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket no encontrado",
        message: "El ticket solicitado no existe"
      });
    }

    res.json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Error obteniendo ticket:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudo obtener el ticket"
    });
  }
});

app.delete('/tickets/:id', validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket no encontrado",
        message: "El ticket que intentas cancelar no existe"
      });
    }

    // En lugar de eliminar, cambiar estado a cancelado
    ticket.status = 'cancelled';
    await ticket.save();

    res.json({
      success: true,
      message: "Ticket cancelado exitosamente",
      ticket
    });

  } catch (error) {
    console.error('Error cancelando ticket:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudo cancelar el ticket"
    });
  }
});

// GET /tickets/user/:userId/events - Obtener eventos únicos con tickets del usuario
app.get('/tickets/user/:userId/events', validateObjectId, async (req, res) => {
  try {
    const { userId } = req.params;

    const events = await Ticket.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$eventId',
          totalTickets: { $sum: '$quantity' },
          totalSpent: { $sum: { $multiply: ['$price', '$quantity'] } },
          ticketTypes: { $addToSet: '$ticketType' },
          latestPurchase: { $max: '$purchasedAt' },
          tickets: { $push: '$$ROOT' }
        }
      },
      { $sort: { latestPurchase: -1 } }
    ]);

    res.json({
      success: true,
      events,
      count: events.length
    });

  } catch (error) {
    console.error('Error obteniendo eventos del usuario:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudieron obtener los eventos"
    });
  }
});


// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: "Error interno del servidor",
    message: "Algo salió mal"
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    message: "La ruta solicitada no existe"
  });
});

const server = app.listen(port, () => {
  console.log(`Tickets Service listening at http://localhost:${port}`);
});

server.on("close", () => mongoose.connection.close());

export default server;