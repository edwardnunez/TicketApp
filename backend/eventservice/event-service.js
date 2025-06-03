import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Event from './event-model.js';
import axios from 'axios'; // Asegúrate de instalar axios
import multer from 'multer';
import path from 'path';

const app = express();
const port = 8003;

app.use(express.json());
app.use(cors());

const mongoUriEvents = process.env.MONGODB_URI || "mongodb://localhost:27017/eventdb";

const locationServiceUrl = process.env.LOCATION_SERVICE_URL || "http://localhost:8004";

// Conexión a la base de datos de eventos (No es necesario conectar a locationdb)
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

// Ruta para crear un evento
app.post("/event", async (req, res) => {
  try {
    console.log('Received req.body:', req.body);
    
    const { name, date, location, type, description, capacity, price, state } = req.body;

    // Verificar si faltan campos obligatorios
    if (!name || !date || !location || !type) {
      return res.status(400).json({ 
        error: "Missing required fields: name, date, location, type",
        received: req.body
      });
    }

    const eventDescription = description || `Evento de ${type}`;

    // Realizar una solicitud al servicio de localizaciones para obtener los detalles de la ubicación
    const locationResponse = await axios.get(`${locationServiceUrl}/locations/${location}`);
    const locationDoc = locationResponse.data;

    if (!locationDoc) return res.status(400).json({ error: "Location not found" });

    // Crear el nuevo evento
    const newEvent = new EventModel({
      name,
      date: new Date(date),
      location: locationDoc._id,
      type,
      description: eventDescription,
      capacity: capacity || locationDoc.capacity || 100,
      price: price || 0,
      image: '/images/default.jpg',
      state: state || 'proximo'
    });

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

    // Añadir la ubicación a cada evento
    const eventsWithLocations = events.map(event => {
      const e = event.toObject();
      e.location = locationMap[e.location.toString()] || null;
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
