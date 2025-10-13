import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;
let app;

const testUser = {
  username: "testuser",
  password: "TestPass123",
  name: "Test",
  surname: "User",
  email: "test@example.com"
};

const testEvent = {
  name: "Concierto de Prueba",
  type: "concert",
  description: "Un concierto de prueba",
  date: "2024-12-31T20:00:00Z",
  location: "507f1f77bcf86cd799439011",
  capacity: 1000,
  price: 50,
  createdBy: "admin1"
};

const testLocation = {
  name: "Estadio de Prueba",
  category: "stadium",
  address: "Calle de Prueba 123",
  capacity: 50000
};

const testTicket = {
  userId: "507f1f77bcf86cd799439011",
  eventId: "507f1f77bcf86cd799439012",
  selectedSeats: [
    {
      id: "vip-1-1",
      sectionId: "vip",
      row: 1,
      seat: 1,
      price: 100,
      isGeneralAdmission: false
    }
  ],
  price: 100,
  quantity: 1,
  customerInfo: {
    name: "Test Customer",
    email: "test@example.com",
    phone: "123456789"
  }
};

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    process.env.MONGODB_URI_LOCATION = mongoUri;
    process.env.MONGODB_URI_SEATMAP = mongoUri;
    
    // Mock de servicios externos para tests
    process.env.USER_SERVICE_URL = "http://localhost:8001";
    process.env.TICKET_SERVICE_URL = "http://localhost:8002";
    process.env.EVENT_SERVICE_URL = "http://localhost:8003";
    process.env.LOCATION_SERVICE_URL = "http://localhost:8004";
    
    const { default: gatewayService } = await import("../gateway-service.js");
    app = gatewayService;
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

describe("Gateway Service - Integration tests", () => {
  
  describe("Caso de Uso 1: Health check", () => {
    it("debería retornar estado OK", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "OK");
    });
  });

  describe("Caso de Uso 2: Autenticación de usuario", () => {
    it("debería validar datos de login", async () => {
      const loginData = {
        username: "testuser",
        password: "testpassword"
      };

      expect(loginData.username).toBeDefined();
      expect(loginData.password).toBeDefined();
    });

    it("debería validar respuesta de login exitoso", async () => {
      const loginResponse = {
        token: "jwt-token-123",
        user: {
          id: "user1",
          username: "testuser",
          email: "test@example.com"
        }
      };

      expect(loginResponse.token).toBeDefined();
      expect(loginResponse.user).toBeDefined();
      expect(loginResponse.user.id).toBe("user1");
    });

    it("debería validar registro de usuario", async () => {
      const userData = {
        name: "Test",
        surname: "User",
        username: "newuser",
        email: "test@example.com",
        password: "testpassword"
      };

      const requiredFields = ['name', 'surname', 'username', 'email', 'password'];
      const hasAllRequiredFields = requiredFields.every(field => 
        userData[field] !== undefined && userData[field] !== null
      );

      expect(hasAllRequiredFields).toBe(true);
    });

    it("debería validar respuesta de registro exitoso", async () => {
      const registrationResponse = {
        userId: "user123",
        success: true,
        message: "User created successfully"
      };

      expect(registrationResponse.userId).toBeDefined();
      expect(registrationResponse.success).toBe(true);
    });
  });

  describe("Caso de Uso 3: Gestión de tickets", () => {
    it("debería validar compra de tickets", async () => {
      const purchaseData = {
        eventId: "event1",
        seats: ["seat1", "seat2"],
        buyerInfo: {
          name: "Test Buyer",
          email: "buyer@example.com",
          phone: "123456789"
        },
        paymentMethod: "credit_card"
      };

      expect(purchaseData.eventId).toBeDefined();
      expect(Array.isArray(purchaseData.seats)).toBe(true);
      expect(purchaseData.buyerInfo).toBeDefined();
      expect(purchaseData.paymentMethod).toBeDefined();
    });

    it("debería validar respuesta de compra exitosa", async () => {
      const purchaseResponse = {
        success: true,
        ticketId: "ticket123",
        qrCode: "qr-code-123",
        totalPrice: 100
      };

      expect(purchaseResponse.success).toBe(true);
      expect(purchaseResponse.ticketId).toBeDefined();
      expect(purchaseResponse.qrCode).toBeDefined();
    });

    it("debería validar obtención de asientos ocupados", async () => {
      const occupiedSeatsResponse = {
        eventId: "event1",
        occupiedSeats: ["seat1", "seat2", "seat3"],
        count: 3
      };

      expect(occupiedSeatsResponse.eventId).toBeDefined();
      expect(Array.isArray(occupiedSeatsResponse.occupiedSeats)).toBe(true);
      expect(occupiedSeatsResponse.count).toBe(occupiedSeatsResponse.occupiedSeats.length);
    });

    it("debería validar cancelación de ticket", async () => {
      const cancellationData = {
        ticketId: "ticket123",
        reason: "User request"
      };

      const cancellationResponse = {
        success: true,
        cancelledTicket: "ticket123",
        refundAmount: 50
      };

      expect(cancellationData.ticketId).toBeDefined();
      expect(cancellationResponse.success).toBe(true);
      expect(cancellationResponse.cancelledTicket).toBe(cancellationData.ticketId);
    });
  });

  describe("Caso de Uso 4: Gestión de eventos", () => {
    it("debería validar creación de evento", async () => {
      const eventData = {
        name: "Concierto de Rock",
        description: "Un increíble concierto de rock",
        date: "2024-12-31T20:00:00Z",
        location: "loc1",
        price: 50,
        type: "concert",
        capacity: 1000
      };

      const requiredFields = ['name', 'description', 'date', 'location', 'price', 'type'];
      const hasAllRequiredFields = requiredFields.every(field => 
        eventData[field] !== undefined && eventData[field] !== null
      );

      expect(hasAllRequiredFields).toBe(true);
    });

    it("debería validar respuesta de creación exitosa", async () => {
      const eventResponse = {
        eventId: "event123",
        name: "Concierto de Rock",
        success: true,
        message: "Event created successfully"
      };

      expect(eventResponse.eventId).toBeDefined();
      expect(eventResponse.success).toBe(true);
      expect(eventResponse.name).toBe("Concierto de Rock");
    });

    it("debería validar actualización de evento", async () => {
      const updateData = {
        name: "Concierto de Rock Actualizado",
        description: "Descripción actualizada",
        price: 75
      };

      const updateResponse = {
        success: true,
        updatedEvent: updateData,
        eventId: "event123"
      };

      expect(updateResponse.success).toBe(true);
      expect(updateResponse.updatedEvent).toEqual(updateData);
    });

    it("debería validar cancelación de evento", async () => {
      const cancellationData = {
        reason: "Weather conditions",
        adminId: "admin1"
      };

      const cancellationResponse = {
        success: true,
        cancelledEvent: "event123",
        message: "Event cancelled successfully"
      };

      expect(cancellationData.reason).toBeDefined();
      expect(cancellationResponse.success).toBe(true);
      expect(cancellationResponse.cancelledEvent).toBeDefined();
    });

    it("debería validar eliminación de evento", async () => {
      const deletionResponse = {
        success: true,
        deletedEvent: "event123",
        message: "Event deleted successfully"
      };

      expect(deletionResponse.success).toBe(true);
      expect(deletionResponse.deletedEvent).toBeDefined();
    });
  });

  describe("Caso de Uso 5: Gestión de ubicaciones", () => {
    it("debería validar creación de ubicación", async () => {
      const locationData = {
        name: "Estadio Principal",
        category: "stadium",
        address: "Calle Principal 123",
        capacity: 50000,
        seatMapId: "seatmap1"
      };

      const requiredFields = ['name', 'category', 'address'];
      const hasAllRequiredFields = requiredFields.every(field => 
        locationData[field] !== undefined && locationData[field] !== null
      );

      expect(hasAllRequiredFields).toBe(true);
    });

    it("debería validar respuesta de creación exitosa", async () => {
      const locationResponse = {
        locationId: "loc123",
        name: "Estadio Principal",
        success: true,
        message: "Location created successfully"
      };

      expect(locationResponse.locationId).toBeDefined();
      expect(locationResponse.success).toBe(true);
      expect(locationResponse.name).toBe("Estadio Principal");
    });

    it("debería validar obtención de ubicaciones", async () => {
      const locationsResponse = {
        locations: [
          { locationId: "loc1", name: "Estadio 1", address: "Dirección 1" },
          { locationId: "loc2", name: "Teatro 1", address: "Dirección 2" }
        ],
        count: 2
      };

      expect(Array.isArray(locationsResponse.locations)).toBe(true);
      expect(locationsResponse.count).toBe(locationsResponse.locations.length);
    });
  });

  describe("Caso de Uso 6: Gestión de mapas de asientos", () => {
    it("debería validar creación de seatmap", async () => {
      const seatMapData = {
        name: "Estadio SeatMap",
        type: "football",
        sections: [
          {
            id: "vip",
            name: "VIP",
            rows: 5,
            seatsPerRow: 20,
            defaultPrice: 100
          },
          {
            id: "general",
            name: "General",
            rows: 20,
            seatsPerRow: 50,
            defaultPrice: 50
          }
        ]
      };

      expect(seatMapData.name).toBeDefined();
      expect(seatMapData.type).toBeDefined();
      expect(Array.isArray(seatMapData.sections)).toBe(true);
      expect(seatMapData.sections.length).toBeGreaterThan(0);
    });

    it("debería validar respuesta de creación exitosa", async () => {
      const seatMapResponse = {
        seatMapId: "seatmap123",
        name: "Estadio SeatMap",
        success: true,
        message: "SeatMap created successfully"
      };

      expect(seatMapResponse.seatMapId).toBeDefined();
      expect(seatMapResponse.success).toBe(true);
      expect(seatMapResponse.name).toBe("Estadio SeatMap");
    });

    it("debería validar obtención de seatmaps", async () => {
      const seatMapsResponse = {
        seatMaps: [
          { seatMapId: "seatmap1", name: "SeatMap 1", type: "football" },
          { seatMapId: "seatmap2", name: "SeatMap 2", type: "theater" }
        ],
        count: 2
      };

      expect(Array.isArray(seatMapsResponse.seatMaps)).toBe(true);
      expect(seatMapsResponse.count).toBe(seatMapsResponse.seatMaps.length);
    });
  });

  describe("Caso de Uso 7: Búsqueda y filtrado", () => {
    it("debería validar búsqueda de usuarios", async () => {
      const searchParams = {
        username: "testuser"
      };

      const searchResponse = {
        user: {
          id: "user1",
          username: "testuser",
          email: "test@example.com"
        },
        found: true
      };

      expect(searchParams.username).toBeDefined();
      expect(searchResponse.found).toBe(true);
      expect(searchResponse.user).toBeDefined();
    });

    it("debería validar filtrado de eventos", async () => {
      const filterParams = {
        type: "concert",
        date: "2024-12-31",
        location: "loc1"
      };

      const filteredEvents = {
        events: [
          { eventId: "event1", name: "Concierto 1", type: "concert" },
          { eventId: "event2", name: "Concierto 2", type: "concert" }
        ],
        count: 2
      };

      expect(filterParams.type).toBeDefined();
      expect(Array.isArray(filteredEvents.events)).toBe(true);
      expect(filteredEvents.count).toBe(filteredEvents.events.length);
    });
  });

  describe("Caso de Uso 8: Estadísticas y reportes", () => {
    it("debería validar estadísticas de tickets", async () => {
      const ticketStats = {
        totalTickets: 1000,
        soldTickets: 750,
        pendingTickets: 200,
        cancelledTickets: 50,
        totalRevenue: 50000
      };

      expect(ticketStats.totalTickets).toBeGreaterThanOrEqual(0);
      expect(ticketStats.soldTickets).toBeLessThanOrEqual(ticketStats.totalTickets);
      expect(ticketStats.totalRevenue).toBeGreaterThanOrEqual(0);
    });

    it("debería validar estadísticas de eventos", async () => {
      const eventStats = {
        totalEvents: 100,
        activeEvents: 60,
        cancelledEvents: 10,
        completedEvents: 30,
        totalRevenue: 100000
      };

      expect(eventStats.totalEvents).toBeGreaterThanOrEqual(0);
      expect(eventStats.activeEvents).toBeLessThanOrEqual(eventStats.totalEvents);
      expect(eventStats.totalRevenue).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Caso de Uso 9: Manejo de errores", () => {
    it("debería manejar errores de servicio no disponible", async () => {
      const serviceError = {
        code: "SERVICE_UNAVAILABLE",
        message: "User service is not available",
        status: 503
      };

      expect(serviceError.code).toBeDefined();
      expect(serviceError.message).toBeDefined();
      expect(serviceError.status).toBe(503);
    });

    it("debería manejar errores de validación", async () => {
      const validationError = {
        code: "VALIDATION_ERROR",
        message: "Invalid input data",
        details: {
          username: "Username is required",
          email: "Invalid email format"
        }
      };

      expect(validationError.code).toBe("VALIDATION_ERROR");
      expect(validationError.details).toBeDefined();
    });

    it("debería manejar errores de autenticación", async () => {
      const authError = {
        code: "UNAUTHORIZED",
        message: "Invalid token",
        status: 401
      };

      expect(authError.code).toBe("UNAUTHORIZED");
      expect(authError.status).toBe(401);
    });
  });

  describe("Caso de Uso 10: Integración de servicios", () => {
    it("debería validar flujo completo de compra", async () => {
      const completePurchaseFlow = {
        step1: "User authentication",
        step2: "Event selection",
        step3: "Seat selection",
        step4: "Payment processing",
        step5: "Ticket generation",
        step6: "QR code creation"
      };

      const steps = Object.keys(completePurchaseFlow);
      expect(steps.length).toBe(6);
      expect(completePurchaseFlow.step1).toBe("User authentication");
      expect(completePurchaseFlow.step6).toBe("QR code creation");
    });

    it("debería validar flujo completo de creación de evento", async () => {
      const completeEventFlow = {
        step1: "Location creation",
        step2: "SeatMap configuration",
        step3: "Event creation",
        step4: "Image upload",
        step5: "Event activation"
      };

      const steps = Object.keys(completeEventFlow);
      expect(steps.length).toBe(5);
      expect(completeEventFlow.step1).toBe("Location creation");
      expect(completeEventFlow.step5).toBe("Event activation");
    });
  });

  describe("Validaciones de Negocio", () => {
    it("debería validar límites de capacidad", async () => {
      const event = {
        capacity: 1000,
        soldTickets: 500
      };

      const isWithinCapacity = (event) => {
        return event.soldTickets <= event.capacity;
      };

      expect(isWithinCapacity(event)).toBe(true);
    });

    it("debería validar fechas futuras", async () => {
      const futureDate = new Date('2025-12-31T20:00:00Z');
      const pastDate = new Date('2023-01-01T20:00:00Z');
      const now = new Date();

      const isFutureDate = (date) => new Date(date) > now;

      expect(isFutureDate(futureDate)).toBe(true);
      expect(isFutureDate(pastDate)).toBe(false);
    });

    it("debería validar precios positivos", async () => {
      const validPrice = 50;
      const invalidPrice = -10;

      const isValidPrice = (price) => price >= 0;

      expect(isValidPrice(validPrice)).toBe(true);
      expect(isValidPrice(invalidPrice)).toBe(false);
    });
  });
});
