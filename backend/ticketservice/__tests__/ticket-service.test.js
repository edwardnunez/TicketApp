import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import Ticket from "../ticket-model.js";

let mongoServer;
let app;

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
    },
    {
      id: "vip-1-2",
      sectionId: "vip",
      row: 1,
      seat: 2,
      price: 100,
      isGeneralAdmission: false
    }
  ],
  price: 200,
  quantity: 2,
  customerInfo: {
    name: "Test Customer",
    email: "test@example.com",
    phone: "123456789"
  }
};

const testTicket2 = {
  userId: "507f1f77bcf86cd799439013",
  eventId: "507f1f77bcf86cd799439014",
  selectedSeats: [
    {
      id: "general-5-10",
      sectionId: "general",
      row: 5,
      seat: 10,
      price: 50,
      isGeneralAdmission: false
    }
  ],
  price: 50,
  quantity: 1,
  customerInfo: {
    name: "Test Customer 2",
    email: "test2@example.com",
    phone: "987654321"
  }
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  const { default: ticketService } = await import("../ticket-service.js");
  app = ticketService;
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

describe("Ticket Service - Integration tests", () => {
  
  describe("Caso de Uso 1: Compra de entradas", () => {
    it("debería comprar tickets correctamente", async () => {
      const response = await request(app)
        .post("/tickets/purchase")
        .send(testTicket);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("ticket");
      expect(response.body.ticket).toHaveProperty("_id");
      expect(response.body.ticket).toHaveProperty("ticketNumber");
      expect(response.body).toHaveProperty("qrCode");
    });

    it("debería rechazar compra sin campos requeridos", async () => {
      const invalidTicket = {
        userId: "507f1f77bcf86cd799439011"
        // Faltan campos requeridos
      };

      const response = await request(app)
        .post("/tickets/purchase")
        .send(invalidTicket);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("debería rechazar compra con cantidad inválida", async () => {
      const invalidQuantityTicket = {
        ...testTicket,
        quantity: 10 // Excede el límite
      };

      const response = await request(app)
        .post("/tickets/purchase")
        .send(invalidQuantityTicket);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("debería rechazar compra con información de cliente incompleta", async () => {
      const invalidCustomerTicket = {
        ...testTicket,
        // Sin customerInfo
      };
      delete invalidCustomerTicket.customerInfo;

      const response = await request(app)
        .post("/tickets/purchase")
        .send(invalidCustomerTicket);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Caso de Uso 2: Obtener asientos ocupados", () => {
    beforeAll(async () => {
      await request(app).post("/tickets/purchase").send(testTicket);
    });

    it("debería obtener asientos ocupados de un evento", async () => {
      const response = await request(app)
        .get(`/tickets/occupied/${testTicket.eventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("occupiedSeats");
      expect(Array.isArray(response.body.occupiedSeats)).toBe(true);
    });

    it("debería retornar lista vacía para evento sin tickets", async () => {
      const emptyEventId = "507f1f77bcf86cd799439999";
      const response = await request(app)
        .get(`/tickets/occupied/${emptyEventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.occupiedSeats).toEqual([]);
    });
  });

  describe("Caso de Uso 3: Obtener tickets de usuario", () => {
    beforeAll(async () => {
      await request(app).post("/tickets/purchase").send(testTicket2);
    });

    it("debería obtener tickets de un usuario", async () => {
      const response = await request(app)
        .get(`/tickets/user/${testTicket.userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("tickets");
      expect(Array.isArray(response.body.tickets)).toBe(true);
    });

    it("debería retornar lista vacía para usuario sin tickets", async () => {
      const emptyUserId = "507f1f77bcf86cd799439999";
      const response = await request(app)
        .get(`/tickets/user/${emptyUserId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.tickets).toEqual([]);
    });
  });

  describe("Caso de Uso 4: Obtener tickets de evento", () => {
    it("debería obtener tickets de un evento", async () => {
      const response = await request(app)
        .get(`/tickets/event/${testTicket.eventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("tickets");
      expect(Array.isArray(response.body.tickets)).toBe(true);
    });

    it("debería incluir estadísticas de tickets", async () => {
      const response = await request(app)
        .get(`/tickets/event/${testTicket.eventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("statistics");
      expect(Array.isArray(response.body.statistics)).toBe(true);
    });
  });

  describe("Caso de Uso 5: Cancelar entradas", () => {
    let ticketId;
    let cancelledTicketId;

    beforeAll(async () => {
      const response = await request(app).post("/tickets/purchase").send(testTicket);
      ticketId = response.body.ticket._id;
    });

    it("debería cancelar ticket existente", async () => {
      const response = await request(app)
        .delete(`/tickets/${ticketId}`)
        .send({ userId: testTicket.userId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Ticket cancelado exitosamente");
      cancelledTicketId = ticketId;
    });

    it("debería rechazar cancelación de ticket inexistente", async () => {
      const fakeTicketId = "507f1f77bcf86cd799439999";
      const response = await request(app)
        .delete(`/tickets/${fakeTicketId}`)
        .send({ userId: testTicket.userId });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Ticket no encontrado");
    });

    it("debería rechazar cancelación de ticket ya cancelado", async () => {
      // Crear un nuevo ticket para cancelar
      const newTicket = { ...testTicket, userId: "507f1f77bcf86cd799439015" };
      const createResponse = await request(app).post("/tickets/purchase").send(newTicket);
      const newTicketId = createResponse.body.ticket._id;
      
      // Cancelar el ticket
      const firstCancel = await request(app)
        .delete(`/tickets/${newTicketId}`)
        .send({ userId: newTicket.userId });

      expect(firstCancel.status).toBe(200);
      expect(firstCancel.body).toHaveProperty("success", true);

      // Intentar cancelar el mismo ticket nuevamente
      const secondCancel = await request(app)
        .delete(`/tickets/${newTicketId}`)
        .send({ userId: newTicket.userId });

      expect(secondCancel.status).toBe(400);
      expect(secondCancel.body).toHaveProperty("error", "Ticket ya cancelado");
    });
  });

  describe("Caso de Uso 6: Obtener QR de ticket", () => {
    let ticketId;

    beforeAll(async () => {
      const response = await request(app).post("/tickets/purchase").send(testTicket2);
      ticketId = response.body.ticket._id;
    });

    it("debería obtener QR de ticket existente", async () => {
      const response = await request(app)
        .get(`/tickets/${ticketId}/qr`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("qrCode");
      expect(response.body).toHaveProperty("ticketNumber");
    });

    it("debería rechazar QR de ticket inexistente", async () => {
      const fakeTicketId = "507f1f77bcf86cd799439999";
      const response = await request(app)
        .get(`/tickets/${fakeTicketId}/qr`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Ticket no encontrado");
    });
  });

  describe("Caso de Uso 7: Eliminar tickets por evento", () => {
    beforeAll(async () => {
      await request(app).post("/tickets/purchase").send(testTicket);
    });

    it("debería eliminar tickets de un evento", async () => {
      const response = await request(app)
        .delete(`/tickets/event/${testTicket.eventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("deletedCount");
      expect(response.body.deletedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Caso de Uso 8: Estadísticas de administrador", () => {
    it("debería obtener estadísticas generales", async () => {
      const response = await request(app)
        .get("/tickets/admin/statistics");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("statistics");
      expect(response.body.statistics).toHaveProperty("byEvent");
      expect(response.body.statistics).toHaveProperty("byType");
      expect(response.body.statistics).toHaveProperty("filters");
      expect(response.body.statistics).toHaveProperty("general");
      expect(Array.isArray(response.body.statistics.byEvent)).toBe(true);
      expect(Array.isArray(response.body.statistics.byType)).toBe(true);
      expect(response.body.statistics.general).toHaveProperty("totalTickets");
      expect(response.body.statistics.general).toHaveProperty("totalRevenue");
      expect(response.body.statistics.general).toHaveProperty("totalTransactions");
      expect(response.body.statistics.general).toHaveProperty("paidTickets");
      expect(response.body.statistics.general).toHaveProperty("pendingTickets");
      expect(response.body.statistics.general).toHaveProperty("cancelledTickets");
    });
  });

  describe("Validaciones con base de datos", () => {
    beforeAll(async () => {
      // Limpiar y crear un ticket fresco para estos tests
      await Ticket.deleteMany({});
      await request(app).post("/tickets/purchase").send(testTicket);
    });

    it("debería encontrar ticket en la base de datos", async () => {
      const ticket = await Ticket.findOne({ userId: testTicket.userId });

      expect(ticket).not.toBeNull();
      expect(ticket).toBeDefined();
      expect(ticket.userId.toString()).toBe(testTicket.userId);
      expect(ticket.eventId.toString()).toBe(testTicket.eventId);
    });

    it("debería retornar null para ticket inexistente", async () => {
      const ticket = await Ticket.findOne({ userId: "507f1f77bcf86cd799439999" });

      expect(ticket).toBeNull();
    });

    it("debería tener campos de fecha de compra", async () => {
      const ticket = await Ticket.findOne({ userId: testTicket.userId });

      expect(ticket).not.toBeNull();
      expect(ticket).toBeDefined();
      expect(ticket.purchasedAt).toBeDefined();
      expect(ticket.purchasedAt).toBeInstanceOf(Date);
    });

    it("debería tener QR code único", async () => {
      const ticket = await Ticket.findOne({ userId: testTicket.userId });

      expect(ticket).not.toBeNull();
      expect(ticket).toBeDefined();
      expect(ticket.qrCode).toBeDefined();
      expect(ticket.ticketNumber).toBeDefined();
      expect(ticket.validationCode).toBeDefined();
    });

    it("debería validar estado por defecto", async () => {
      const ticket = await Ticket.findOne({ userId: testTicket.userId });

      expect(ticket).not.toBeNull();
      expect(ticket.status).toBe("paid");
    });
  });
});
