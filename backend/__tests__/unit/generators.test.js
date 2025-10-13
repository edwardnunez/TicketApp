/**
 * Tests unitarios para funciones generadoras
 */

const {
  generateTicketNumber,
  generateValidationCode,
  generateQRData,
  generateRandomString,
  generatePurchaseId
} = require('../../utils/generators');

describe("Generadores de Tickets", () => {
  
  describe("generateTicketNumber", () => {
    it("debería generar número único", () => {
      const ticketNumber1 = generateTicketNumber();
      const ticketNumber2 = generateTicketNumber();
      
      expect(ticketNumber1).toBeDefined();
      expect(ticketNumber2).toBeDefined();
      expect(ticketNumber1).not.toBe(ticketNumber2);
    });

    it("debería tener formato correcto", () => {
      const ticketNumber = generateTicketNumber();
      expect(ticketNumber).toMatch(/^TKT-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    it("debería generar múltiples números únicos", () => {
      const numbers = new Set();
      for (let i = 0; i < 100; i++) {
        numbers.add(generateTicketNumber());
      }
      expect(numbers.size).toBe(100);
    });
  });

  describe("generateValidationCode", () => {
    it("debería generar código único", () => {
      const code1 = generateValidationCode();
      const code2 = generateValidationCode();
      
      expect(code1).toBeDefined();
      expect(code2).toBeDefined();
      expect(code1).not.toBe(code2);
    });

    it("debería tener formato hexadecimal", () => {
      const code = generateValidationCode();
      expect(code).toMatch(/^[A-F0-9]+$/);
    });

    it("debería tener longitud correcta", () => {
      const code = generateValidationCode();
      expect(code).toHaveLength(32); // 16 bytes * 2 (hex)
    });
  });

  describe("generateQRData", () => {
    it("debería generar datos QR con información correcta", () => {
      const ticket = {
        _id: "507f1f77bcf86cd799439011",
        ticketNumber: "TKT-12345678",
        eventId: "507f1f77bcf86cd799439012",
        userId: "507f1f77bcf86cd799439013",
        validationCode: "ABC123DEF456",
        purchasedAt: new Date("2025-01-15T10:00:00Z"),
        status: "paid",
        quantity: 2,
        selectedSeats: [
          { id: "vip-1-1", sectionId: "vip", row: 1, seat: 1, price: 100 }
        ]
      };
      
      const qrData = generateQRData(ticket);
      const parsedData = JSON.parse(qrData);
      
      expect(parsedData.ticketId).toBe(ticket._id);
      expect(parsedData.ticketNumber).toBe(ticket.ticketNumber);
      expect(parsedData.eventId).toBe(ticket.eventId);
      expect(parsedData.userId).toBe(ticket.userId);
      expect(parsedData.validationCode).toBe(ticket.validationCode);
      expect(parsedData.status).toBe(ticket.status);
      expect(parsedData.quantity).toBe(ticket.quantity);
      expect(parsedData.seats).toEqual(ticket.selectedSeats);
    });

    it("debería manejar ticket sin asientos", () => {
      const ticket = {
        _id: "507f1f77bcf86cd799439011",
        ticketNumber: "TKT-12345678",
        eventId: "507f1f77bcf86cd799439012",
        userId: "507f1f77bcf86cd799439013",
        validationCode: "ABC123DEF456",
        purchasedAt: new Date("2025-01-15T10:00:00Z"),
        status: "paid",
        quantity: 1
      };
      
      const qrData = generateQRData(ticket);
      const parsedData = JSON.parse(qrData);
      
      expect(parsedData.seats).toEqual([]);
    });
  });

  describe("generateRandomString", () => {
    it("debería generar string de longitud correcta", () => {
      const lengths = [5, 10, 20, 50];
      
      lengths.forEach(length => {
        const randomString = generateRandomString(length);
        expect(randomString).toHaveLength(length);
      });
    });

    it("debería generar strings únicos", () => {
      const strings = new Set();
      for (let i = 0; i < 100; i++) {
        strings.add(generateRandomString(10));
      }
      expect(strings.size).toBe(100);
    });

    it("debería contener solo caracteres válidos", () => {
      const randomString = generateRandomString(100);
      expect(randomString).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe("generatePurchaseId", () => {
    it("debería generar ID de compra con formato correcto", () => {
      const ticketId = "507f1f77bcf86cd799439011";
      const purchaseId = generatePurchaseId(ticketId);
      
      expect(purchaseId).toMatch(/^TKT-[A-Z0-9]{8}$/);
      expect(purchaseId).toContain("TKT-");
    });

    it("debería usar los últimos 8 caracteres del ID", () => {
      const ticketId = "507f1f77bcf86cd799439011";
      const purchaseId = generatePurchaseId(ticketId);
      const expectedSuffix = ticketId.slice(-8).toUpperCase();
      
      expect(purchaseId).toContain(expectedSuffix);
    });

    it("debería manejar diferentes longitudes de ID", () => {
      const shortId = "123";
      const longId = "507f1f77bcf86cd799439011abcdef";
      
      const shortPurchaseId = generatePurchaseId(shortId);
      const longPurchaseId = generatePurchaseId(longId);
      
      expect(shortPurchaseId).toMatch(/^TKT-[A-Z0-9]{8}$/);
      expect(longPurchaseId).toMatch(/^TKT-[A-Z0-9]{8}$/);
    });
  });
});
