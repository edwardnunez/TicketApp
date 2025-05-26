import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Event from './event-model.js';
import Location from './location-model.js';
import seedLocations from './seed.js';
import multer from 'multer';
import path from 'path';

const app = express();
const port = 8003;

app.use(express.json());
app.use(cors());

const mongoUriEvents = process.env.MONGODB_URI || "mongodb://localhost:27017/eventdb";
const mongoUriLocations = process.env.MONGODB_URI_LOCATION || "mongodb://localhost:27017/locationdb";

const eventDbConnection = mongoose.createConnection(mongoUriEvents, { useNewUrlParser: true, useUnifiedTopology: true });
const locationDbConnection = mongoose.createConnection(mongoUriLocations, { useNewUrlParser: true, useUnifiedTopology: true });

eventDbConnection.on('connected', () => {
  console.log('Conectado a la base de datos de eventos');
});

locationDbConnection.on('connected', () => {
  console.log('Conectado a la base de datos de localizaciones');
});

eventDbConnection.on('error', (error) => {
  console.error('Error en la conexión de eventos:', error);
});

locationDbConnection.on('error', (error) => {
  console.error('Error en la conexión de localizaciones:', error);
});

const EventModel = eventDbConnection.model('Event', Event.schema);
const LocationModel = locationDbConnection.model('Location', Location.schema);

const seedDatabase = async () => {
  await seedLocations(locationDbConnection);
  
  // Verificar si ya existen eventos
  const eventCount = await EventModel.countDocuments();
  if (eventCount === 0) {
    try {
      // Obtener algunas ubicaciones
      const locations = await LocationModel.find().limit(3);
      
      if (locations.length > 0) {
        // Crear algunos eventos de muestra
        const sampleEvents = [
          {
            name: "Concierto de Rock",
            type: "concert",
            description: "Un increíble concierto de rock con las mejores bandas",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            location: locations[0]._id
          },
          {
            name: "Partido de fútbol",
            type: "football",
            description: "Final de la temporada de fútbol",
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            location: locations[1]._id
          },
          {
            name: "Estreno de película",
            type: "cinema",
            description: "Estreno del último blockbuster",
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            location: locations[2]._id
          }
        ];
        
        await EventModel.insertMany(sampleEvents);
        console.log('Eventos de muestra creados con éxito');
      }
    } catch (error) {
      console.error('Error al crear eventos de muestra:', error);
    }
  }
};

seedDatabase().catch(error => {
  console.error('Error seeding database:', error);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/events');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
  }
});
const upload = multer({ storage });

app.use('/images/events', express.static('images/events'));

app.post("/event", async (req, res) => {
  try {
    console.log('Received req.body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { name, date, location, type, description, capacity, price, state } = req.body;
    
    if (!name || !date || !location || !type) {
      console.log('Missing fields check:', { 
        name: name ? 'present' : 'missing', 
        date: date ? 'present' : 'missing', 
        location: location ? 'present' : 'missing', 
        type: type ? 'present' : 'missing' 
      });
      return res.status(400).json({ 
        error: "Missing required fields: name, date, location, type",
        received: req.body
      });
    }

    const eventDescription = description || `Evento de ${type}`;
    const locationDoc = await LocationModel.findById(location);
    if (!locationDoc) return res.status(400).json({ error: "Location not found" });

    const newEvent = new EventModel({
      name,
      date: new Date(date),
      location: locationDoc._id,
      type: type,
      description: eventDescription,
      capacity: capacity || locationDoc.capacity || 100,
      price: price || 0,
      image: '/images/default.jpg', // Por ahora usar imagen por defecto
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

app.get("/events", async (req, res) => {
  try {
    const events = await EventModel.find();

    const locationIds = events.map(event => event.location);

    const locations = await LocationModel.find({ _id: { $in: locationIds } });

    const locationMap = {};
    locations.forEach(loc => {
      locationMap[loc._id.toString()] = loc;
    });

    const eventsWithLocations = events.map(event => {
      const e = event.toObject();
      e.location = locationMap[event.location.toString()] || null;
      return e;
    });

    res.status(200).json(eventsWithLocations);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.get("/events/:eventId", async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const location = await LocationModel.findById(event.location);

    const eventObj = event.toObject();
    eventObj.location = location || null;

    res.status(200).json(eventObj);
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


app.post("/location", async (req, res) => {
  try {
    const { name, category, address, capacity, hasSeatingMap } = req.body;

    if (!name || !category || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let locationDoc = await LocationModel.findOne({ name });

    let repeatedLocation = await LocationModel.findOne({ name, address, category });

    if (locationDoc) {
      locationDoc.category = category;
      locationDoc.address = address;
      locationDoc.capacity = capacity;
      locationDoc.hasSeatingMap = hasSeatingMap;

      await locationDoc.save();
      return res.status(200).json(locationDoc);
    } else if (repeatedLocation) {
      return res.status(400).json({ error: "Location already exists" });
    } else {
      locationDoc = new LocationModel({
        name,
        category,
        address,
        capacity,
        hasSeatingMap,
      });

      await locationDoc.save();
      res.status(201).json(locationDoc);
    }
  } catch (error) {
    console.error("Error creating/updating location:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.get("/locations", async (req, res) => {
  try {
    const locations = await LocationModel.find();
    res.status(200).json(locations || []); // Devuelve array vacío en lugar de error 404
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.get("/locations/:locationId", async (req, res) => {
  try {
    const location = await LocationModel.findById(req.params.locationId);
    if (!location) return res.status(404).json({ error: "Location not found" });
    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching location details:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
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