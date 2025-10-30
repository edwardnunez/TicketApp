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

/**
 * Creates or updates a location
 * @route POST /location
 * @param {Object} req.body - Location data
 * @param {string} req.body.name - Location name
 * @param {string} req.body.category - Location category
 * @param {string} req.body.address - Location address
 * @param {string} [req.body.seatMapId] - Associated seatmap ID
 * @param {number} [req.body.capacity] - Location capacity
 * @returns {Object} Created or updated location data
 */
app.post("/location", async (req, res) => {
  try {
    const { name, category, address, seatMapId, capacity } = req.body;

    if (!name || !category || !address) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    if (capacity<0) {
      return res.status(400).json({ error: "La capacidad no puede ser menor a 0" });
    }

    // Validar categoría antes de intentar guardar
    const validCategories = ['stadium', 'theater', 'cinema', 'festival', 'arena', 'auditorium'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        error: `Categoría inválida. Las categorías válidas son: ${validCategories.join(', ')}`
      });
    }

    let locationDoc = await LocationModel.findOne({ name });
    const repeatedLocation = await LocationModel.findOne({ name, address, category });

    if (locationDoc) {
      // Actualiza los campos permitidos
      locationDoc.category = category;
      locationDoc.address = address;
      locationDoc.seatMapId = seatMapId;
      locationDoc.capacity = capacity;

      await locationDoc.save();
      return res.status(200).json(locationDoc);
    } else if (repeatedLocation) {
      return res.status(400).json({ error: "La ubicación ya existe" });
    } else {
      locationDoc = new LocationModel({
        name,
        category,
        address,
        ...(seatMapId && { seatMapId }),
        ...(capacity && { capacity })
      });
      await locationDoc.save();
      res.status(201).json(locationDoc);
    }
  } catch (error) {
    console.error("Error creating/updating location:", error);

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
        error: 'Datos inválidos',
        details: error.message
      });
    }

    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

app.get("/locations", async (req, res) => {
  try {
    const locations = await LocationModel.find();
    res.status(200).json(locations || []);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

app.get("/locations/:locationId", async (req, res) => {
  try {
    const location = await LocationModel.findById(req.params.locationId);
    if (!location) return res.status(404).json({ error: "Ubicación no encontrada" });
    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching location details:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// ============= ENDPOINTS SEATMAPS =============

// Obtener todos los SeatMaps (con filtros opcionales)
// Helpers de transformación para compatibilidad API
const deriveRowsCount = (section) => Array.isArray(section.rows) ? section.rows.length : (section.rows || 0);
const deriveSeatsPerRow = (section) => {
  if (Array.isArray(section.rows) && section.rows.length > 0) {
    return Math.max(...section.rows.map(r => (r.seats?.length || 0)));
  }
  return section.seatsPerRow || 0;
};
const computeSectionCapacity = (section) => {
  if (section.hasNumberedSeats === false) return section.totalCapacity || 0;
  if (Array.isArray(section.rows)) {
    return section.rows.reduce((sum, r) => sum + (r.seats?.length || 0), 0);
  }
  const rows = section.rows || 0;
  const seatsPerRow = section.seatsPerRow || 0;
  return rows * seatsPerRow;
};
const mapSeatMapForApi = (seatMap) => {
  const obj = seatMap.toObject ? seatMap.toObject() : seatMap;
  const sections = (obj.sections || []).map(s => ({
    id: s.id,
    name: s.name,
    rows: deriveRowsCount(s),
    seatsPerRow: deriveSeatsPerRow(s),
    defaultPrice: s.defaultPrice ?? 0,
    price: s.defaultPrice ?? 0,
    rowPricing: s.rowPricing || [],
    color: s.color,
    position: s.position,
    order: s.order || 0,
    hasNumberedSeats: s.hasNumberedSeats !== false,
    totalCapacity: s.hasNumberedSeats === false ? (s.totalCapacity || 0) : computeSectionCapacity(s)
  }));
  return {
    id: obj.id,
    name: obj.name,
    type: obj.type,
    subtype: obj.subtype,
    sections,
    config: obj.config,
    isActive: obj.isActive,
    compatibleEventTypes: obj.compatibleEventTypes,
    description: obj.description
  };
};

// ===== Normalización de entrada (aceptar formato legado y nuevo) =====
const buildRows = (rowsCount, seatsPerRow) => {
  const safeRows = Number.isFinite(rowsCount) && rowsCount > 0 ? rowsCount : 0;
  const safeSeats = Number.isFinite(seatsPerRow) && seatsPerRow > 0 ? seatsPerRow : 0;
  return Array.from({ length: safeRows }).map((_, rowIdx) => ({
    index: rowIdx + 1,
    label: String(rowIdx + 1),
    seats: Array.from({ length: safeSeats }).map((_, seatIdx) => ({
      number: seatIdx + 1,
      label: String(seatIdx + 1)
    }))
  }));
};

const normalizeSection = (section) => {
  const { rows, seatsPerRow, ...rest } = section || {};
  const defaultPrice = section && section.defaultPrice !== undefined ? section.defaultPrice : 0;

  if (section && section.hasNumberedSeats === false) {
    return {
      ...rest,
      defaultPrice,
      rows: [],
      rowPricing: Array.isArray(section.rowPricing) ? section.rowPricing : [],
      totalCapacity: section.totalCapacity || 0
    };
  }

  // si ya viene como array de filas, respetarlo
  const normalizedRows = Array.isArray(rows) ? rows : buildRows(rows, seatsPerRow);
  return {
    ...rest,
    defaultPrice,
    rows: normalizedRows,
    rowPricing: Array.isArray(section?.rowPricing) ? section.rowPricing : [],
    totalCapacity: undefined
  };
};

app.get('/seatmaps', async (req, res) => {
  try {
    const { type, isActive } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const seatMaps = await SeatMapModel.find(filter)
      .sort({ type: 1, name: 1 })
      .select('-__v');

    const transformed = seatMaps.map(mapSeatMapForApi);
    res.status(200).json(transformed);
  } catch (error) {
    console.error('Error fetching seatmaps:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
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
        error: 'Mapa de asientos no encontrado',
        message: `No se encontró ningún mapa de asientos con ID: ${id}`
      });
    }

    res.status(200).json(mapSeatMapForApi(seatMap));
  } catch (error) {
    console.error('Error fetching seatmap:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Crear un nuevo SeatMap
app.post('/seatmaps', async (req, res) => {
  try {
    const seatMapData = req.body;

    // Validar campos requeridos
    if (!seatMapData.id || !seatMapData.name || !seatMapData.type) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        message: 'Se requieren los campos: id, name, type'
      });
    }

    // Validar secciones
    if (seatMapData.sections && Array.isArray(seatMapData.sections)) {
      for (const section of seatMapData.sections) {
        // Validar campos requeridos de la sección
        if (!section.id || !section.name || !section.color || !section.position) {
          return res.status(400).json({
            error: 'Sección inválida',
            message: `La sección "${section.name || 'sin nombre'}" no tiene todos los campos requeridos (id, name, color, position)`
          });
        }

        // Validar valores negativos
        if (section.rows < 0 || section.seatsPerRow < 0) {
          return res.status(400).json({
            error: 'Sección inválida',
            message: `La sección "${section.name}" tiene valores negativos en rows o seatsPerRow`
          });
        }

        // Validar valores de cero para seatsPerRow
        if (section.hasNumberedSeats !== false && section.seatsPerRow === 0) {
          return res.status(400).json({
            error: 'Sección inválida',
            message: `La sección "${section.name}" debe tener seatsPerRow mayor que 0`
          });
        }
      }
    }

    // Verificar que no exista un seatmap con el mismo id
    const existingSeatMap = await SeatMapModel.findOne({ id: seatMapData.id });
    if (existingSeatMap) {
      return res.status(400).json({
        error: 'El mapa de asientos ya existe',
        message: `Ya existe un mapa de asientos con ID ${seatMapData.id}`
      });
    }

    // Normalizar secciones para compatibilidad con esquema (rows como array de objetos)
    const prepared = {
      ...seatMapData,
      sections: (seatMapData.sections || []).map(normalizeSection),
      compatibleEventTypes: seatMapData.compatibleEventTypes || [seatMapData.type]
    };

    const newSeatMap = new SeatMapModel(prepared);
    await newSeatMap.save();

    res.status(201).json(mapSeatMapForApi(newSeatMap));
  } catch (error) {
    console.error('Error creating seatmap:', error);

    // Si es un error de validación de Mongoose, devolver 400
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: error.message
      });
    }

    // Si es un error de CastError (ID inválido), devolver 400
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Actualizar un SeatMap existente
app.put('/seatmaps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const preparedUpdate = {
      ...updateData,
      ...(updateData.sections ? { sections: updateData.sections.map(normalizeSection) } : {})
    };

    const seatMap = await SeatMapModel.findOneAndUpdate(
      { id }, 
      preparedUpdate, 
      { new: true, runValidators: true }
    );
    
    if (!seatMap) {
      return res.status(404).json({
        error: 'Mapa de asientos no encontrado',
        message: `No se encontró ningún mapa de asientos con ID: ${id}`
      });
    }

    res.status(200).json(mapSeatMapForApi(seatMap));
  } catch (error) {
    console.error('Error updating seatmap:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
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
        error: 'Mapa de asientos no encontrado',
        message: `No se encontró ningún mapa de asientos con ID: ${id}`
      });
    }

    res.status(200).json({
      message: 'Mapa de asientos eliminado exitosamente',
      deletedSeatMap: seatMap
    });
  } catch (error) {
    console.error('Error deleting seatmap:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

// Obtener SeatMaps por tipo
app.get('/seatmaps/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['football', 'cinema', 'theater', 'concert'].includes(type)) {
      return res.status(400).json({
        error: 'Tipo inválido',
        message: 'El tipo debe ser uno de: football, cinema, theater, concert'
      });
    }
    
    const seatMaps = await SeatMapModel.find({ type, isActive: true })
      .sort({ name: 1 })
      .select('-__v');

    const transformed = seatMaps.map(mapSeatMapForApi);
    res.status(200).json(transformed);
  } catch (error) {
    console.error('Error fetching seatmaps by type:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
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
        error: 'Ubicación no encontrada',
        message: `No se encontró ninguna ubicación con ID: ${locationId}`
      });
    }

    // Si la ubicación no tiene seatMapId, retornar array vacío
    if (!location.seatMapId) {
      return res.status(200).json({
        sections: [],
        message: 'La ubicación no tiene un mapa de asientos configurado'
      });
    }

    // Buscar el seatmap correspondiente
    const seatMap = await SeatMapModel.findOne({ id: location.seatMapId });
    if (!seatMap) {
      return res.status(404).json({
        error: 'Mapa de asientos no encontrado',
        message: `No se encontró ningún mapa de asientos con ID: ${location.seatMapId}`
      });
    }

    // Transformar las secciones del seatmap al formato esperado por el frontend (compat)
    const sections = seatMap.sections.map(section => ({
      sectionId: section.id,
      sectionName: section.name,
      capacity: computeSectionCapacity(section),
      rows: deriveRowsCount(section),
      seatsPerRow: deriveSeatsPerRow(section),
      defaultPrice: section.defaultPrice,
      price: section.defaultPrice ?? 0,
      rowPricing: section.rowPricing || [],
      color: section.color,
      position: section.position,
      hasNumberedSeats: section.hasNumberedSeats !== false,
      totalCapacity: section.hasNumberedSeats === false ? (section.totalCapacity || 0) : computeSectionCapacity(section),
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
      error: 'Error interno del servidor',
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