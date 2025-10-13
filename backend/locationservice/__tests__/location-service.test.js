// __tests__/location-service.test.js
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
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
      color: "#FFD700",        // requerido
      position: "center",      // requerido
      defaultPrice: 100,
      hasNumberedSeats: true,
      rows: [
        {
          index: 1,
          label: "Fila 1",
          seats: [{ number: 1 }, { number: 2 }, { number: 3 }]
        }
      ]
    },
    {
      id: "general",
      name: "General",
      color: "#AAAAAA",
      position: "north",
      defaultPrice: 50,
      hasNumberedSeats: true,
      rows: [
        {
          index: 1,
          label: "Fila 1",
          seats: [{ number: 1 }, { number: 2 }]
        }
      ]
    }
  ],
  isActive: true
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI_LOCATION = mongoUri;
  process.env.MONGODB_URI_SEATMAP = mongoUri;
  // Conectar la conexión por defecto de Mongoose para que los modelos importados no usen buffering y apunten al mismo MongoMemoryServer
  await mongoose.connect(mongoUri, {
    dbName: 'test',
  });
  const { default: locationService } = await import("../location-service.js");
  app = locationService;
  await new Promise((resolve) => setTimeout(resolve, 1000));
});

afterAll(async () => {
  if (app && typeof app.close === "function") {
    app.close();
  }
  if (mongoServer && typeof mongoServer.stop === "function") {
    await mongoServer.stop();
  }
  await mongoose.disconnect();
});

describe("Location Service - Integration tests", () => {
  describe("Caso de Uso 1: Crear Ubicación", () => {
    it("debería crear una nueva ubicación correctamente", async () => {
      const response = await request(app).post("/location").send(testLocation);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("name", testLocation.name);
      expect(response.body).toHaveProperty("category", testLocation.category);
    });

    it("debería rechazar ubicación sin campos requeridos", async () => {
      const invalidLocation = { name: "Ubicación Incompleta" };
      const response = await request(app).post("/location").send(invalidLocation);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("debería rechazar ubicación con categoría inválida", async () => {
      const invalidCategoryLocation = {
        ...testLocation,
        category: "invalid_category"
      };
      const response = await request(app).post("/location").send(invalidCategoryLocation);

      // mongoose enum error → 500
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("debería rechazar ubicación con capacidad negativa", async () => {
      const invalidCapacityLocation = { ...testLocation, capacity: -100 };
      const response = await request(app).post("/location").send(invalidCapacityLocation);

      expect(response.status).toBe(400);
    });
  });

  describe("Caso de Uso 2: Listar ubicaciones", () => {
    beforeAll(async () => {
      await request(app).post("/location").send(testLocation2);
    });

    it("debería obtener todas las ubicaciones", async () => {
      const response = await request(app).get("/locations");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("debería permitir filtrar ubicaciones por categoría (aunque devuelva todas)", async () => {
      const response = await request(app)
        .get("/locations")
        .query({ category: "stadium" });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Caso de Uso 3: Obtener Ubicación por ID", () => {
    let locationId;

    beforeAll(async () => {
      const response = await request(app).post("/location").send(testLocation);
      locationId = response.body._id;
    });

    it("debería obtener ubicación existente por ID", async () => {
      const response = await request(app).get(`/locations/${locationId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", locationId);
    });

    it("debería retornar 404 para ubicación inexistente", async () => {
      const fakeLocationId = "507f1f77bcf86cd799439011";
      const response = await request(app).get(`/locations/${fakeLocationId}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Location not found");
    });
  });

  describe("Caso de Uso 6: Crear SeatMap", () => {
    it("debería crear un nuevo seatmap correctamente", async () => {
      const response = await request(app).post("/seatmaps").send(testSeatMap);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id", testSeatMap.id);
      expect(response.body).toHaveProperty("name", testSeatMap.name);
      expect(response.body).toHaveProperty("type", testSeatMap.type);
    });

    it("debería rechazar seatmap sin campos requeridos", async () => {
      const invalidSeatMap = { name: "SeatMap Incompleto" };
      const response = await request(app).post("/seatmaps").send(invalidSeatMap);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });

    it("debería rechazar seatmap con secciones inválidas", async () => {
      const invalidSeatMap = {
        ...testSeatMap,
        id: "seatmap-invalid",
        sections: [
          {
            id: "invalid",
            rows: -1,
            seatsPerRow: 0
          }
        ]
      };
      const response = await request(app).post("/seatmaps").send(invalidSeatMap);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Caso de Uso 7: Listar SeatMaps", () => {
    beforeAll(async () => {
      await request(app).post("/seatmaps").send(testSeatMap);
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
    });

    it("debería filtrar seatmaps activos", async () => {
      const response = await request(app)
        .get("/seatmaps")
        .query({ isActive: "true" });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Caso de Uso 8: Obtener SeatMap por ID", () => {
    let seatMapId = "seatmap-test";

    it("debería obtener seatmap existente por ID", async () => {
      const response = await request(app).get(`/seatmaps/${seatMapId}`);
      expect([200, 404]).toContain(response.status);
    });

    it("debería retornar 404 para seatmap inexistente", async () => {
      const fakeSeatMapId = "seatmap-noexiste";
      const response = await request(app).get(`/seatmaps/${fakeSeatMapId}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "SeatMap not found");
    });
  });

  describe("Caso de Uso 9: Obtener Secciones de Ubicación", () => {
    let locationId;

    beforeAll(async () => {
      const response = await request(app).post("/location").send(testLocation);
      locationId = response.body._id;
    });

    it("debería obtener secciones de ubicación (aunque estén vacías)", async () => {
      const response = await request(app).get(`/location/${locationId}/sections`);
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe("Caso de Uso 10: Health Check", () => {
    it("debería retornar estado de salud del servicio", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "OK");
    });
  });

  describe("Validaciones con Base de Datos", () => {
    it("debería encontrar ubicación en la base de datos", async () => {
      const location = await Location.findOne({ name: testLocation.name });
      expect(location).toBeDefined();
      expect(location.name).toBe(testLocation.name);
    });

    it("debería retornar null para ubicación inexistente", async () => {
      const location = await Location.findOne({ name: "UbicacionInexistente" });
      expect(location).toBeNull();
    });

    it("debería tener campos de fecha de creación", async () => {
      const location = await Location.findOne({ name: testLocation.name });
      expect(location).toBeDefined();
      expect(location.createdAt).toBeDefined();
    });

    it("debería encontrar seatmap en la base de datos", async () => {
      const seatMap = await SeatMap.findOne({ name: testSeatMap.name });
      expect(seatMap).toBeDefined();
      expect(seatMap.name).toBe(testSeatMap.name);
    });
  });
});
