import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import Location from "../location-model.js";
import SeatMap from "../seatmap-model.js";

let mongoServer;
let app;

const testLocation = {
  name: "Estadio de Prueba",
  category: "stadium",
  address: "Calle de Prueba 123",
  capacity: 50000
};

const testLocation2 = {
  name: "Teatro de Prueba",
  category: "theater",
  address: "Plaza del Teatro 1",
  capacity: 1000
};

const testSeatMap = {
  id: "seatmap-test",
  name: "SeatMap de Prueba",
  type: "football",
  sections: [
    {
      id: "vip",
      name: "VIP",
      rows: 5,
      seatsPerRow: 20,
      defaultPrice: 100,
      hasNumberedSeats: true
    },
    {
      id: "general",
      name: "General",
      rows: 20,
      seatsPerRow: 50,
      defaultPrice: 50,
      hasNumberedSeats: true
    }
  ],
  isActive: true
};

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI_LOCATION = mongoUri;
    process.env.MONGODB_URI_SEATMAP = mongoUri;
    const { default: locationService } = await import("../location-service.js");
    app = locationService;
  } catch (error) {
    console.error('Error en beforeAll:', error);
    throw error;
  }
});

afterAll(async () => {
  if (app && typeof app.close === 'function') {
    app.close();
  }
  if (mongoServer && typeof mongoServer.stop === 'function') {
    await mongoServer.stop();
  }
});

describe("Location Service - Integration tests", () => {
  
  describe("Caso de Uso 1: Crear Ubicación", () => {
    it("debería crear una nueva ubicación correctamente", async () => {
      const response = await request(app)
        .post("/location")
        .send(testLocation);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("locationId");
      expect(response.body).toHaveProperty("name", testLocation.name);
      expect(response.body).toHaveProperty("category", testLocation.category);
    });

    it("debería rechazar ubicación sin campos requeridos", async () => {
      const invalidLocation = {
        name: "Ubicación Incompleta"
        // Faltan campos requeridos
      };

      const response = await request(app)
        .post("/location")
        .send(invalidLocation);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("debería rechazar ubicación con categoría inválida", async () => {
      const invalidCategoryLocation = {
        ...testLocation,
        category: "invalid_category"
      };

      const response = await request(app)
        .post("/location")
        .send(invalidCategoryLocation);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("debería rechazar ubicación con capacidad negativa", async () => {
      const invalidCapacityLocation = {
        ...testLocation,
        capacity: -100
      };

      const response = await request(app)
        .post("/location")
        .send(invalidCapacityLocation);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Caso de Uso 2: Listar Ubicaciones", () => {
    beforeAll(async () => {
      await request(app).post("/location").send(testLocation2);
    });

    it("debería obtener todas las ubicaciones", async () => {
      const response = await request(app).get("/locations");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("debería filtrar ubicaciones por categoría", async () => {
      const response = await request(app)
        .get("/locations")
        .query({ category: "stadium" });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(location => {
        expect(location.category).toBe("stadium");
      });
    });
  });

  describe("Caso de Uso 3: Obtener Ubicación por ID", () => {
    let locationId;

    beforeAll(async () => {
      const response = await request(app).post("/location").send(testLocation);
      locationId = response.body.locationId;
    });

    it("debería obtener ubicación existente por ID", async () => {
      const response = await request(app)
        .get(`/location/${locationId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", locationId);
      expect(response.body).toHaveProperty("name", testLocation.name);
      expect(response.body).toHaveProperty("category", testLocation.category);
    });

    it("debería retornar 404 para ubicación inexistente", async () => {
      const fakeLocationId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/location/${fakeLocationId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Location not found");
    });
  });

  describe("Caso de Uso 4: Actualizar Ubicación", () => {
    let locationId;

    beforeAll(async () => {
      const response = await request(app).post("/location").send(testLocation);
      locationId = response.body.locationId;
    });

    it("debería actualizar información básica de la ubicación", async () => {
      const updateData = {
        name: "Estadio Actualizado",
        address: "Nueva Dirección 456"
      };

      const response = await request(app)
        .put(`/location/${locationId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Location updated successfully");
      expect(response.body.location.name).toBe("Estadio Actualizado");
    });

    it("debería actualizar capacidad de la ubicación", async () => {
      const updateData = {
        capacity: 60000
      };

      const response = await request(app)
        .put(`/location/${locationId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.location.capacity).toBe(60000);
    });

    it("debería rechazar actualización con datos inválidos", async () => {
      const invalidUpdate = {
        category: "invalid_category"
      };

      const response = await request(app)
        .put(`/location/${locationId}`)
        .send(invalidUpdate);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Caso de Uso 5: Eliminar Ubicación", () => {
    let locationId;

    beforeAll(async () => {
      const response = await request(app).post("/location").send(testLocation);
      locationId = response.body.locationId;
    });

    it("debería eliminar ubicación existente", async () => {
      const response = await request(app)
        .delete(`/location/${locationId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Location deleted successfully");
    });

    it("debería retornar 404 para ubicación ya eliminada", async () => {
      const response = await request(app)
        .get(`/location/${locationId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Location not found");
    });
  });

  describe("Caso de Uso 6: Crear SeatMap", () => {
    it("debería crear un nuevo seatmap correctamente", async () => {
      const response = await request(app)
        .post("/seatmap")
        .send(testSeatMap);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("seatMapId");
      expect(response.body).toHaveProperty("name", testSeatMap.name);
      expect(response.body).toHaveProperty("type", testSeatMap.type);
    });

    it("debería rechazar seatmap sin campos requeridos", async () => {
      const invalidSeatMap = {
        name: "SeatMap Incompleto"
        // Faltan campos requeridos
      };

      const response = await request(app)
        .post("/seatmap")
        .send(invalidSeatMap);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("debería rechazar seatmap con secciones inválidas", async () => {
      const invalidSeatMap = {
        ...testSeatMap,
        sections: [
          {
            id: "invalid",
            rows: -1, // Fila negativa
            seatsPerRow: 0 // Asientos por fila cero
          }
        ]
      };

      const response = await request(app)
        .post("/seatmap")
        .send(invalidSeatMap);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Caso de Uso 7: Listar SeatMaps", () => {
    beforeAll(async () => {
      await request(app).post("/seatmap").send(testSeatMap);
    });

    it("debería obtener todos los seatmaps", async () => {
      const response = await request(app).get("/seatmaps");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("debería filtrar seatmaps por tipo", async () => {
      const response = await request(app)
        .get("/seatmaps")
        .query({ type: "football" });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(seatMap => {
        expect(seatMap.type).toBe("football");
      });
    });

    it("debería filtrar seatmaps activos", async () => {
      const response = await request(app)
        .get("/seatmaps")
        .query({ isActive: "true" });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(seatMap => {
        expect(seatMap.isActive).toBe(true);
      });
    });
  });

  describe("Caso de Uso 8: Obtener SeatMap por ID", () => {
    let seatMapId;

    beforeAll(async () => {
      const response = await request(app).post("/seatmap").send(testSeatMap);
      seatMapId = response.body.seatMapId;
    });

    it("debería obtener seatmap existente por ID", async () => {
      const response = await request(app)
        .get(`/seatmap/${seatMapId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", seatMapId);
      expect(response.body).toHaveProperty("name", testSeatMap.name);
      expect(response.body).toHaveProperty("type", testSeatMap.type);
    });

    it("debería retornar 404 para seatmap inexistente", async () => {
      const fakeSeatMapId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/seatmap/${fakeSeatMapId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "SeatMap not found");
    });
  });

  describe("Caso de Uso 9: Obtener Secciones de Ubicación", () => {
    let locationId;

    beforeAll(async () => {
      const response = await request(app).post("/location").send(testLocation);
      locationId = response.body.locationId;
    });

    it("debería obtener secciones de ubicación", async () => {
      const response = await request(app)
        .get(`/location/${locationId}/sections`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("locationId", locationId);
      expect(response.body).toHaveProperty("sections");
      expect(Array.isArray(response.body.sections)).toBe(true);
    });
  });

  describe("Caso de Uso 10: Health Check", () => {
    it("debería retornar estado de salud del servicio", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("databases");
    });
  });

  describe("Validaciones con Base de Datos", () => {
    it("debería encontrar ubicación en la base de datos", async () => {
      const location = await Location.findOne({ name: testLocation.name });

      expect(location).toBeDefined();
      expect(location.name).toBe(testLocation.name);
      expect(location.category).toBe(testLocation.category);
    });

    it("debería retornar null para ubicación inexistente", async () => {
      const location = await Location.findOne({ name: "UbicacionInexistente" });

      expect(location).toBeNull();
    });

    it("debería tener campos de fecha de creación", async () => {
      const location = await Location.findOne({ name: testLocation.name });

      expect(location).toBeDefined();
      expect(location.createdAt).toBeDefined();
      expect(location.createdAt).toBeInstanceOf(Date);
    });

    it("debería encontrar seatmap en la base de datos", async () => {
      const seatMap = await SeatMap.findOne({ name: testSeatMap.name });

      expect(seatMap).toBeDefined();
      expect(seatMap.name).toBe(testSeatMap.name);
      expect(seatMap.type).toBe(testSeatMap.type);
    });
  });
});
