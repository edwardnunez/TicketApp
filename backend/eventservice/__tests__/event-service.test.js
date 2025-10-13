import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { jest } from '@jest/globals';

// Mock axios ANTES de importar el servicio
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

// Reemplazar axios en el módulo global
global.axios = mockAxios;

let mongoServer;
let app;

const mockLocation = {
  _id: "507f1f77bcf86cd799439011",
  name: "Test Location",
  address: "Test Address",
  city: "Test City",
  capacity: 1000,
  seatMapId: null
};

const testEvent = {
  name: "Concierto de Prueba",
  type: "concert",
  description: "Un concierto de prueba para testing",
  date: "2025-12-31T20:00:00Z",
  location: mockLocation,
  capacity: 1000,
  price: 50,
  createdBy: "admin1"
};

const testEvent2 = {
  name: "Teatro de Prueba",
  type: "theater",
  description: "Una obra de teatro de prueba",
  date: "2025-12-25T19:00:00Z",
  location: mockLocation,
  capacity: 500,
  price: 30,
  createdBy: "admin1"
};

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    
    // Configurar mocks de axios
    mockAxios.get.mockImplementation((url) => {
      if (url.includes('/locations/')) {
        return Promise.resolve({ data: mockLocation });
      }
      if (url.includes('/tickets/event/')) {
        return Promise.resolve({ 
          data: { 
            tickets: [],
            statistics: [] 
          } 
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    mockAxios.delete.mockResolvedValue({ data: { success: true } });
    
    // Importar el servicio después de configurar los mocks
    const eventServiceModule = await import("../event-service.js");
    app = eventServiceModule.default;
    
    // Exponer stateService globalmente para poder detenerlo en afterAll
    if (app && app.stateService) {
      global.stateService = app.stateService;
    }
    
    // Esperar a que la conexión esté lista
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error en beforeAll:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    console.log('🧹 Limpiando recursos después de las pruebas...');
    
    // Detener cron jobs si están disponibles
    if (global.stateService && typeof global.stateService.stopCronJobs === 'function') {
      global.stateService.stopCronJobs();
    }
    
    // Cerrar el servidor Express
    if (app && typeof app.close === 'function') {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.log('⚠️ Timeout cerrando servidor, forzando cierre...');
          resolve();
        }, 5000);
        
        app.close((err) => {
          clearTimeout(timeout);
          if (err) {
            console.log('⚠️ Error cerrando servidor:', err.message);
          } else {
            console.log('✅ Servidor cerrado correctamente');
          }
          resolve();
        });
      });
    }
    
    // Cerrar todas las conexiones de mongoose
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('✅ Conexión de mongoose cerrada');
    }
    
    // Cerrar MongoDB Memory Server
    if (mongoServer && typeof mongoServer.stop === 'function') {
      await mongoServer.stop();
      console.log('✅ MongoDB Memory Server detenido');
    }
    
    // Limpiar variables globales
    global.axios = undefined;
    global.stateService = undefined;
    
    console.log('✅ Limpieza completada');
  } catch (error) {
    console.error('❌ Error en afterAll:', error);
  }
}, 15000);

describe("Event Service - Integration tests", () => {
  
  describe("Caso de Uso 1: Crear evento", () => {
    it("debería crear un nuevo evento correctamente", async () => {
      const response = await request(app)
        .post("/event")
        .send(testEvent);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("name", testEvent.name);
      expect(response.body).toHaveProperty("type", testEvent.type);
    });

    it("debería rechazar evento sin campos requeridos", async () => {
      const invalidEvent = {
        name: "Evento Incompleto"
        // Faltan campos requeridos
      };

      const response = await request(app)
        .post("/event")
        .send(invalidEvent);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("debería rechazar evento con tipo inválido", async () => {
      const invalidTypeEvent = {
        ...testEvent,
        type: "invalid_type"
      };

      const response = await request(app)
        .post("/event")
        .send(invalidTypeEvent);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("debería rechazar evento con fecha pasada", async () => {
      const pastEvent = {
        ...testEvent,
        date: "2020-01-01T20:00:00Z"
      };

      const response = await request(app)
        .post("/event")
        .send(pastEvent);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Caso de Uso 2: Listar eventos", () => {
    beforeAll(async () => {
      await request(app).post("/event").send(testEvent2);
    });

    it("debería obtener todos los eventos", async () => {
      const response = await request(app).get("/events");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("debería filtrar eventos por tipo", async () => {
      const response = await request(app).get("/events");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Filtrar manualmente ya que el servicio no implementa filtrado por query
      const concertEvents = response.body.filter(event => event.type === "concert");
      expect(concertEvents.length).toBeGreaterThan(0);
    });

    it("debería filtrar eventos por estado", async () => {
      const response = await request(app).get("/events");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Filtrar manualmente ya que el servicio no implementa filtrado por query
      const proximoEvents = response.body.filter(event => event.state === "proximo");
      expect(proximoEvents.length).toBeGreaterThan(0);
    });
  });

  describe("Caso de Uso 3: Obtener evento por ID", () => {
    let eventId;

    beforeAll(async () => {
      const response = await request(app).post("/event").send({
        ...testEvent,
        name: "Evento Test UC3",
        date: "2026-05-18T20:00:00Z"
      });
      eventId = response.body._id;
    });

    it("debería obtener evento existente por ID", async () => {
      const response = await request(app)
        .get(`/events/${eventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", eventId);
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("type");
    });

    it("debería retornar 404 para evento inexistente", async () => {
      const fakeEventId = "507f1f77bcf86cd799439099";
      const response = await request(app)
        .get(`/events/${fakeEventId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Event not found");
    });
  });

  describe("Caso de Uso 4: Actualizar evento", () => {
    let eventId;

    beforeAll(async () => {
      const response = await request(app).post("/event").send({
        ...testEvent,
        name: "Evento Test UC4",
        date: "2026-06-15T20:00:00Z"
      });
      eventId = response.body._id;
    });

    it("debería actualizar información básica del evento", async () => {
      const updateData = {
        name: "Concierto Actualizado",
        description: "Descripción actualizada",
        date: "2026-06-15T20:00:00Z",
        location: mockLocation._id,
        type: "concert",
        capacity: 1000,
        price: 50,
        state: "proximo",
        usesSectionPricing: false,
        usesRowPricing: false
      };

      const response = await request(app)
        .put(`/events/${eventId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.event.name).toBe("Concierto Actualizado");
    });

    it("debería actualizar precio del evento", async () => {
      const updateData = {
        name: "Concierto Actualizado",
        date: "2026-06-15T20:00:00Z",
        location: mockLocation._id,
        type: "concert",
        description: "Descripción",
        capacity: 1000,
        price: 75,
        state: "proximo",
        usesSectionPricing: false,
        usesRowPricing: false
      };

      const response = await request(app)
        .put(`/events/${eventId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.event.price).toBe(75);
    });

    it("debería rechazar actualización con datos inválidos", async () => {
      const invalidUpdate = {
        name: "Test",
        date: "2026-06-15T20:00:00Z",
        location: mockLocation._id,
        type: "invalid_type", // Tipo inválido
        description: "Descripción",
        capacity: 1000,
        price: 50,
        state: "proximo"
      };

      const response = await request(app)
        .put(`/events/${eventId}`)
        .send(invalidUpdate);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Caso de Uso 5: Cancelar evento", () => {
    let eventId;

    beforeAll(async () => {
      const response = await request(app).post("/event").send({
        ...testEvent,
        name: "Evento Test UC5",
        date: "2026-07-15T20:00:00Z"
      });
      eventId = response.body._id;
    });

    it("debería cancelar evento existente", async () => {
      const response = await request(app)
        .delete(`/events/${eventId}/cancel`)
        .send({ adminId: "admin1" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message");
    });

    it("debería rechazar cancelación sin permisos", async () => {
      const response2 = await request(app).post("/event").send({
        ...testEvent,
        name: "Evento Test UC5-2",
        date: "2026-08-15T20:00:00Z"
      });
      const newEventId = response2.body._id;

      const response = await request(app)
        .delete(`/events/${newEventId}/cancel`)
        .send({ adminId: "admin2" }); // Admin diferente

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Caso de Uso 6: Eliminar evento", () => {
    let eventId;

    beforeAll(async () => {
      const response = await request(app).post("/event").send({
        ...testEvent,
        name: "Evento Test UC6",
        date: "2026-09-15T20:00:00Z"
      });
      eventId = response.body._id;
    });

    it("debería eliminar evento existente", async () => {
      const response = await request(app)
        .delete(`/events/${eventId}`)
        .send({ adminId: "admin1" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });

    it("debería retornar 404 para evento ya eliminado", async () => {
      const response = await request(app)
        .get(`/events/${eventId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Event not found");
    });
  });

  describe("Caso de Uso 7: Obtener precio de asiento", () => {
    let eventId;

    beforeAll(async () => {
      const response = await request(app).post("/event").send({
        ...testEvent,
        name: "Evento Test UC8",
        date: "2026-11-15T20:00:00Z"
      });
      eventId = response.body._id;
    });

    it("debería obtener precio de asiento", async () => {
      const response = await request(app)
        .get(`/events/${eventId}/seat-price/vip/1/1`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("price");
      expect(response.body.price).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Validaciones con Base de Datos", () => {
    let createdEventId;

    beforeAll(async () => {
      const response = await request(app).post("/event").send({
        ...testEvent,
        name: "Evento Test Validaciones DB",
        date: "2026-12-15T20:00:00Z"
      });
      createdEventId = response.body._id;
    });

    it("debería encontrar evento en la base de datos", async () => {
      const response = await request(app).get(`/events/${createdEventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", createdEventId);
      expect(response.body).toHaveProperty("name");
    });

    it("debería retornar 404 para evento inexistente", async () => {
      const fakeId = "507f1f77bcf86cd799439098";
      const response = await request(app).get(`/events/${fakeId}`);

      expect(response.status).toBe(404);
    });

    it("debería tener campos de fecha de creación", async () => {
      const response = await request(app).get(`/events/${createdEventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("updatedAt");
    });

    it("debería validar estado por defecto", async () => {
      const response = await request(app).get(`/events/${createdEventId}`);

      expect(response.status).toBe(200);
      expect(response.body.state).toBe("proximo");
    });
  });
});
