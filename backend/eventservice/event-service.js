import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Event from './event-model.js';
import Location from './location-model.js';
import seedLocations from './seed.js';

const app = express();
const port = 8003;

app.use(express.json());
app.use(cors({ origin: "http://localhost:8003" }));

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
};

seedDatabase().catch(error => {
  console.error('Error seeding database:', error);
});

app.post("/event", async (req, res) => {
  try {
    const { name, date, location, eventType } = req.body;

    if (!name || !date || !location || !eventType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const locationDoc = await LocationModel.findById(location);

    if (!locationDoc) {
      return res.status(400).json({ error: "Location not found" });
    }

    let repeatedEvent = await EventModel.findOne({ name, date, eventType, location });

    let locationNotAvailable = await EventModel.findOne({ date, location });
    if (locationNotAvailable) {
      return res.status(400).json({ error: "Location is not available for the selected date" });
    }
    if (repeatedEvent) {
      return res.status(400).json({ error: "Event already exists" });
    } else {
      const newEvent = new EventModel({
        name: name,
        date: date,
        location: locationDoc._id,
        type: eventType,
      });

      await newEvent.save();
      res.status(201).json(newEvent);
    }

  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/events", async (req, res) => {
  try {
    const events = await EventModel.find().populate('location');
    if (!events || events.length === 0) return res.status(404).json({ error: "No events found" });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/events/:eventId", async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.eventId).populate('location');
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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