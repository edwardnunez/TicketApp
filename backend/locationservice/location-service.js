import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Location from './location-model.js';
import seedLocations from './seed.js';
import SeatMap from './seatmap-model.js';

const app = express();
const port = 8004;

app.use(express.json());
app.use(cors());

const mongoUriLocations = process.env.MONGODB_URI_LOCATION || "mongodb://localhost:27017/locationdb";

const locationDbConnection = mongoose.createConnection(mongoUriLocations, { useNewUrlParser: true, useUnifiedTopology: true });

locationDbConnection.on('connected', () => {
  console.log('Conectado a la base de datos de localizaciones');
});

locationDbConnection.on('error', (error) => {
  console.error('Error en la conexión de localizaciones:', error);
});

const LocationModel = locationDbConnection.model('Location', Location.schema);

// Seed database with initial locations if needed
const seedDatabase = async () => {
  await seedLocations(locationDbConnection);
};

seedDatabase().catch(error => {
  console.error('Error seeding database:', error);
});

// Endpoints Locations

app.post("/location", async (req, res) => {
  try {
    const { name, category, address, seatMapId, capacity, seatingMap } = req.body;

    if (!name || !category || !address || !seatMapId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let locationDoc = await LocationModel.findOne({ name });

    let repeatedLocation = await LocationModel.findOne({ name, address, category });

    if (locationDoc) {
      // Actualiza los campos permitidos
      locationDoc.category = category;
      locationDoc.address = address;
      locationDoc.seatMapId = seatMapId;
      locationDoc.capacity = capacity;
      if (seatingMap) locationDoc.seatingMap = seatingMap;

      await locationDoc.save();
      return res.status(200).json(locationDoc);
    } else if (repeatedLocation) {
      return res.status(400).json({ error: "Location already exists" });
    } else {
      locationDoc = new LocationModel({
        name,
        category,
        address,
        seatMapId,
        capacity,
        seatingMap: seatingMap || []
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
    res.status(200).json(locations || []);
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

// Ruta para obtener todos los SeatMaps (o filtrar)
app.get('/seatmaps', async (req, res) => {
  try {
    const { type, isActive } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const seatMaps = await SeatMap.find(filter)
      .sort({ type: 1, name: 1 })
      .select('-__v');

    res.status(200).json(seatMaps);
  } catch (error) {
    console.error('Error fetching seatmaps:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

// Ruta para obtener un SeatMap específico por ID
app.get('/seatmaps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const seatMap = await SeatMap.findOne({ id }).select('-__v');
    
    if (!seatMap) {
      return res.status(404).json({ 
        error: 'SeatMap not found',
        message: `No seatmap found with ID: ${id}` 
      });
    }

    res.status(200).json(seatMap);
  } catch (error) {
    console.error('Error fetching seatmap:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

// Iniciar el servidor de Location Service
const server = app.listen(port, () => {
  console.log(`Location Service listening at http://localhost:${port}`);
});

server.on("close", () => {
  locationDbConnection.close();
});

export default server;