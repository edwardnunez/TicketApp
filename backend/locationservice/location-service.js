import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Location from './location-model.js';
import seedLocations from './seed.js';
import seedSeatMaps from './seed-seatmaps.js';
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

const mongoUriSeatMaps = process.env.MONGODB_URI_SEATMAP || "mongodb://localhost:27017/seatmapdb";
const seatMapDbConnection = mongoose.createConnection(mongoUriSeatMaps, { useNewUrlParser: true, useUnifiedTopology: true });

seatMapDbConnection.on('connected', () => {
  console.log('Conectado a la base de datos de SeatMaps');
});

seatMapDbConnection.on('error', (error) => {
  console.error('Error en la conexión de SeatMaps:', error);
});

const LocationModel = locationDbConnection.model('Location', Location.schema);
const SeatMapModel = seatMapDbConnection.model('SeatMap', SeatMap.schema);

const seedDatabases = async () => {
  try {
    console.log('Seeding locations...');
    await seedLocations(locationDbConnection);
    console.log('Locations seeded successfully');
    
    // Seed seatmaps - IMPORTANTE: pasar la conexión correcta
    console.log('Seeding seatmaps...');
    await seedSeatMaps(seatMapDbConnection);
    console.log('SeatMaps seeded successfully');
    
    console.log('Todas las bases de datos han sido inicializadas correctamente');
  } catch (error) {
    console.error('Error seeding databases:', error);
  }
};

seedDatabases();

app.post("/location", async (req, res) => {
  try {
    const { name, category, address, seatMapId, capacity, seatingMap } = req.body;

    if (!name || !category || !address) {
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
        ...(seatMapId && { seatMapId }),
        ...(capacity && { capacity }),
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

// ============= ENDPOINTS SEATMAPS =============

// Obtener todos los SeatMaps (con filtros opcionales)
app.get('/seatmaps', async (req, res) => {
  try {
    const { type, isActive } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const seatMaps = await SeatMapModel.find(filter)
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

// Obtener un SeatMap específico por ID
app.get('/seatmaps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const seatMap = await SeatMapModel.findOne({ id }).select('-__v');
    
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

// Crear un nuevo SeatMap
app.post('/seatmaps', async (req, res) => {
  try {
    const seatMapData = req.body;
    
    // Verificar que no exista un seatmap con el mismo id
    const existingSeatMap = await SeatMapModel.findOne({ id: seatMapData.id });
    if (existingSeatMap) {
      return res.status(400).json({ 
        error: 'SeatMap already exists',
        message: `A seatmap with ID ${seatMapData.id} already exists` 
      });
    }

    const newSeatMap = new SeatMapModel(seatMapData);
    await newSeatMap.save();
    
    res.status(201).json(newSeatMap);
  } catch (error) {
    console.error('Error creating seatmap:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

// Actualizar un SeatMap existente
app.put('/seatmaps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const seatMap = await SeatMapModel.findOneAndUpdate(
      { id }, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!seatMap) {
      return res.status(404).json({ 
        error: 'SeatMap not found',
        message: `No seatmap found with ID: ${id}` 
      });
    }

    res.status(200).json(seatMap);
  } catch (error) {
    console.error('Error updating seatmap:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

// Eliminar un SeatMap
app.delete('/seatmaps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const seatMap = await SeatMapModel.findOneAndDelete({ id });
    
    if (!seatMap) {
      return res.status(404).json({ 
        error: 'SeatMap not found',
        message: `No seatmap found with ID: ${id}` 
      });
    }

    res.status(200).json({ 
      message: 'SeatMap deleted successfully',
      deletedSeatMap: seatMap 
    });
  } catch (error) {
    console.error('Error deleting seatmap:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

// Obtener SeatMaps por tipo
app.get('/seatmaps/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['football', 'cinema', 'theater'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type',
        message: 'Type must be one of: football, cinema, theater' 
      });
    }
    
    const seatMaps = await SeatMapModel.find({ type, isActive: true })
      .sort({ name: 1 })
      .select('-__v');

    res.status(200).json(seatMaps);
  } catch (error) {
    console.error('Error fetching seatmaps by type:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

app.get('/location/:locationId/sections', async (req, res) => {
  try {
    const { locationId } = req.params;
    
    // Buscar la ubicación
    const location = await LocationModel.findById(locationId);
    if (!location) {
      return res.status(404).json({ 
        error: 'Location not found',
        message: `No location found with ID: ${locationId}` 
      });
    }

    // Si la ubicación no tiene seatMapId, retornar array vacío
    if (!location.seatMapId) {
      return res.status(200).json({ 
        sections: [],
        message: 'Location has no seat map configured'
      });
    }

    // Buscar el seatmap correspondiente
    const seatMap = await SeatMapModel.findOne({ id: location.seatMapId });
    if (!seatMap) {
      return res.status(404).json({ 
        error: 'SeatMap not found',
        message: `No seatmap found with ID: ${location.seatMapId}` 
      });
    }

    // Transformar las secciones del seatmap al formato esperado por el frontend
    const sections = seatMap.sections.map(section => ({
      sectionId: section.id,
      sectionName: section.name,
      capacity: section.hasNumberedSeats ? section.rows * section.seatsPerRow : section.totalCapacity,
      rows: section.rows,
      seatsPerRow: section.seatsPerRow,
      defaultPrice: section.defaultPrice, // Precio por defecto para filas no configuradas
      rowPricing: section.rowPricing || [], // Precios específicos por fila
      color: section.color,
      position: section.position,
      hasNumberedSeats: section.hasNumberedSeats,
      totalCapacity: section.totalCapacity,
      order: section.order || 0
    }));

    // Ordenar las secciones
    sections.sort((a, b) => a.order - b.order);

    res.status(200).json({
      locationId: location._id,
      locationName: location.name,
      seatMapId: location.seatMapId,
      seatMapName: seatMap.name,
      seatMapType: seatMap.type,
      sections: sections
    });

  } catch (error) {
    console.error('Error fetching location sections:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    databases: {
      locations: locationDbConnection.readyState === 1 ? 'connected' : 'disconnected',
      seatmaps: seatMapDbConnection.readyState === 1 ? 'connected' : 'disconnected'
    }
  });
});

const server = app.listen(port, () => {
  console.log(`Location Service listening at http://localhost:${port}`);
});

server.on("close", () => {
  locationDbConnection.close();
  seatMapDbConnection.close();
});

export default server;