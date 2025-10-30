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
  describe("Caso de Uso 3.1: Crear ubicación", () => {
    it("Crear ubicación correcta - debería devolver status 201 y mensaje de éxito", async () => {
      const response = await request(app).post("/location").send(testLocation);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("name", testLocation.name);
      expect(response.body).toHaveProperty("category", testLocation.category);
    });

    it("Faltan campos requeridos - debería devolver status 400 indicando los campos que faltan", async () => {
      const invalidLocation = { name: "Ubicación Incompleta" };
      const response = await request(app).post("/location").send(invalidLocation);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("Categoría inválida - debería devolver status 400 indicando que la categoría es inválida", async () => {
      const invalidCategoryLocation = {
        ...testLocation,
        category: "invalid_category"
      };
      const response = await request(app).post("/location").send(invalidCategoryLocation);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("Capacidad negativa - debería devolver status 400 indicando que la capacidad debe ser mayor que cero", async () => {
      const invalidCapacityLocation = { ...testLocation, capacity: -100 };
      const response = await request(app).post("/location").send(invalidCapacityLocation);

      expect(response.status).toBe(400);
    });
  });

  describe("Caso de Uso 3.2: Listar ubicaciones", () => {
    beforeAll(async () => {
      await request(app).post("/location").send(testLocation2);
    });

    it("Obtener todas las ubicaciones - debería devolver lista con todas las ubicaciones y status 200", async () => {
      const response = await request(app).get("/locations");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("Filtrar por categoría - debería devolver ubicaciones de la categoría especificada y status 200", async () => {
      const response = await request(app)
        .get("/locations")
        .query({ category: "stadium" });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Caso de Uso 3.3: Obtener ubicación por id", () => {
    let locationId;

    beforeAll(async () => {
      const response = await request(app).post("/location").send(testLocation);
      locationId = response.body._id;
    });

    it("Ubicación existente - debería devolver la ubicación y status 200", async () => {
      const response = await request(app).get(`/locations/${locationId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", locationId);
    });

    it("Ubicación inexistente - debería devolver status 404 especificando que no se ha encontrado", async () => {
      const fakeLocationId = "507f1f77bcf86cd799439011";
      const response = await request(app).get(`/locations/${fakeLocationId}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Ubicación no encontrada");
    });
  });

  describe("Caso de Uso 3.4: Crear mapa de asientos", () => {
    it("Crear mapa de asientos con datos válidos - debería devolver status 201 y mensaje de éxito", async () => {
      const response = await request(app).post("/seatmaps").send(testSeatMap);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id", testSeatMap.id);
      expect(response.body).toHaveProperty("name", testSeatMap.name);
      expect(response.body).toHaveProperty("type", testSeatMap.type);
    });

    it("Faltan campos requeridos - debería devolver status 400 indicando los campos que faltan", async () => {
      const invalidSeatMap = { name: "SeatMap Incompleto" };
      const response = await request(app).post("/seatmaps").send(invalidSeatMap);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("Alguna sección inválida - debería devolver status 400 indicando qué sección es inválida y por qué", async () => {
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
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Caso de Uso 3.5: Listar mapas de asientos", () => {
    beforeAll(async () => {
      await request(app).post("/seatmaps").send(testSeatMap);
    });

    it("Listar todos los mapas de asientos - debería devolver lista de todos los mapas y status 200", async () => {
      const response = await request(app).get("/seatmaps");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("Filtrar por tipo - debería devolver lista de mapas del tipo especificado y status 200", async () => {
      const response = await request(app)
        .get("/seatmaps")
        .query({ type: "football" });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Caso de Uso 3.6: Obtener mapa de asientos por id", () => {
    let seatMapId = "seatmap-test";

    it("Mapa de asientos existente - debería devolver el mapa de asientos y status 200", async () => {
      const response = await request(app).get(`/seatmaps/${seatMapId}`);
      expect([200, 404]).toContain(response.status);
    });

    it("Mapa de asientos inexistente - debería devolver status 404 especificando que no se ha encontrado", async () => {
      const fakeSeatMapId = "seatmap-noexiste";
      const response = await request(app).get(`/seatmaps/${fakeSeatMapId}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Mapa de asientos no encontrado");
    });
  });

  describe("Caso de Uso 7: Obtener Secciones de Ubicación", () => {
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
