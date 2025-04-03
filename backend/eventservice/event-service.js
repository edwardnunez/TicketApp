import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Event from './event-model.js';
import Location from './location-model.js';

const app = express();
const port = 8003;

app.use(express.json());
app.use(cors({ origin: "http://localhost:8003" }));

const mongoUriEvents = process.env.MONGODB_URI || "mongodb://localhost:27017/eventdb";
const mongoUriLocations = process.env.MONGODB_URI_LOCATION || "mongodb://localhost:27017/locationdb";

// Crear conexiones separadas para cada base de datos
const eventDbConnection = mongoose.createConnection(mongoUriEvents, { useNewUrlParser: true, useUnifiedTopology: true });
const locationDbConnection = mongoose.createConnection(mongoUriLocations, { useNewUrlParser: true, useUnifiedTopology: true });

eventDbConnection.on('connected', () => {
  console.log('Conectado a la base de datos de eventos');
});

locationDbConnection.on('connected', () => {
  console.log('Conectado a la base de datos de localizaciones');
});

// Manejo de errores de conexión
eventDbConnection.on('error', (error) => {
  console.error('Error en la conexión de eventos:', error);
});

locationDbConnection.on('error', (error) => {
  console.error('Error en la conexión de localizaciones:', error);
});

// Definir los modelos con las conexiones específicas
const EventModel = eventDbConnection.model('Event', Event.schema);
const LocationModel = locationDbConnection.model('Location', Location.schema);

// Crear un nuevo evento
app.post("/event", async (req, res) => {
  try {
    const { name, date, location } = req.body;

    if (!name || !date || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const locationDoc = await LocationModel.findById(location);
    if (!locationDoc) {
      return res.status(400).json({ error: "Location not found" });
    }

    const newEvent = new EventModel({
      name,
      date,
      location
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/events", async (req, res) => {
  try {
    const events = await EventModel.find().populate('location'); // Poblar los datos de la localización
    if (!events || events.length === 0) return res.status(404).json({ error: "No events found" });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/events/:eventId", async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.eventId).populate('location'); // Poblar la localización
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/locations", async (req, res) => {
  try {
    const locations = await LocationModel.find();
    if (!locations || locations.length === 0) return res.status(404).json({ error: "No locations found" });
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/locations/:locationId", async (req, res) => {
  try {
    const location = await LocationModel.findById(req.params.locationId);
    if (!location) return res.status(404).json({ error: "Location not found" });
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const server = app.listen(port, () => {
  console.log(`Event Service listening at http://localhost:${port}`);
});

server.on("close", () => {
  eventDbConnection.close();
  locationDbConnection.close();
});

export default server;
