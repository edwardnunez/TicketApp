/**
 * Tests unitarios para lógica de negocio
 */

const {
  isSeatAvailable,
  calculateSeatPrice,
  calculateTotalPrice,
  formatDate,
  sanitizeInput,
  isValidEventType,
  isValidLocationCategory,
  hasTimeConflict
} = require('../../utils/business-logic');

describe("Lógica de Asientos", () => {
  
  describe("isSeatAvailable", () => {
    it("debería retornar true para asiento disponible", () => {
      const occupiedSeats = ["vip-1-1", "vip-1-2", "general-5-10"];
      const availableSeats = ["vip-1-3", "general-5-11", "vip-2-1"];
      
      availableSeats.forEach(seatId => {
        expect(isSeatAvailable(seatId, occupiedSeats)).toBe(true);
      });
    });

    it("debería retornar false para asiento ocupado", () => {
      const occupiedSeats = ["vip-1-1", "vip-1-2", "general-5-10"];
      const occupiedSeatIds = ["vip-1-1", "general-5-10"];
      
      occupiedSeatIds.forEach(seatId => {
        expect(isSeatAvailable(seatId, occupiedSeats)).toBe(false);
      });
    });

    it("debería manejar lista vacía de asientos ocupados", () => {
      const seatId = "vip-1-1";
      const occupiedSeats = [];
      
      expect(isSeatAvailable(seatId, occupiedSeats)).toBe(true);
    });
  });

  describe("calculateSeatPrice", () => {
    it("debería calcular precio de asiento VIP", () => {
      const seatInfo = {
        sectionId: "vip",
        row: 1,
        seat: 1,
        basePrice: 100,
        sectionMultiplier: 1.5
      };
      
      const price = calculateSeatPrice(seatInfo);
      expect(price).toBe(150);
    });

    it("debería calcular precio de asiento general", () => {
      const seatInfo = {
        sectionId: "general",
        row: 5,
        seat: 10,
        basePrice: 50,
        sectionMultiplier: 1.0
      };
      
      const price = calculateSeatPrice(seatInfo);
      expect(price).toBe(50);
    });

    it("debería usar multiplicador por defecto de 1.0", () => {
      const seatInfo = {
        basePrice: 75
        // Sin sectionMultiplier
      };
      
      const price = calculateSeatPrice(seatInfo);
      expect(price).toBe(75);
    });

    it("debería redondear precios decimales", () => {
      const seatInfo = {
        basePrice: 33.33,
        sectionMultiplier: 1.5
      };
      
      const price = calculateSeatPrice(seatInfo);
      expect(price).toBe(50); // 33.33 * 1.5 = 49.995, redondeado a 50
    });
  });

  describe("calculateTotalPrice", () => {
    it("debería calcular precio total correctamente", () => {
      const seats = [
        { price: 100 },
        { price: 100 },
        { price: 50 }
      ];
      
      const total = calculateTotalPrice(seats);
      expect(total).toBe(250);
    });

    it("debería manejar asientos sin precio", () => {
      const seats = [
        { price: 100 },
        { price: undefined },
        { price: 50 }
      ];
      
      const total = calculateTotalPrice(seats);
      expect(total).toBe(150);
    });

    it("debería retornar 0 para lista vacía", () => {
      const seats = [];
      const total = calculateTotalPrice(seats);
      expect(total).toBe(0);
    });
  });
});

describe("Utilidades de Formato", () => {
  
  describe("formatDate", () => {
    it("debería formatear fecha correctamente", () => {
      const date = new Date("2025-12-31T20:00:00Z");
      const formatted = formatDate(date);
      expect(formatted).toBe("31/12/2025 20:00");
    });

    it("debería formatear string de fecha", () => {
      const dateString = "2025-01-15T14:30:00Z";
      const formatted = formatDate(dateString);
      expect(formatted).toBe("15/01/2025 14:30");
    });

    it("debería manejar fechas con minutos de un dígito", () => {
      const date = new Date("2025-06-01T09:05:00Z");
      const formatted = formatDate(date);
      expect(formatted).toBe("01/06/2025 09:05");
    });
  });

  describe("sanitizeInput", () => {
    it("debería limpiar input malicioso", () => {
      const maliciousInputs = [
        "<script>alert('hack')</script>",
        "Hello <b>World</b>",
        "User's \"quoted\" text",
        "Path/to/file"
      ];
      
      const expectedOutputs = [
        "&lt;script&gt;alert(&#x27;hack&#x27;)&lt;&#x2F;script&gt;",
        "Hello &lt;b&gt;World&lt;&#x2F;b&gt;",
        "User&#x27;s &quot;quoted&quot; text",
        "Path&#x2F;to&#x2F;file"
      ];
      
      maliciousInputs.forEach((input, index) => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).toBe(expectedOutputs[index]);
      });
    });

    it("debería manejar tipos no string", () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
      expect(sanitizeInput({})).toEqual({});
    });
  });
});

describe("Validaciones de Negocio", () => {
  
  describe("isValidEventType", () => {
    it("debería validar tipos de evento correctos", () => {
      const validTypes = ['concert', 'theater', 'sports', 'conference', 'festival'];
      
      validTypes.forEach(type => {
        expect(isValidEventType(type)).toBe(true);
      });
    });

    it("debería rechazar tipos de evento inválidos", () => {
      const invalidTypes = ['invalid', 'party', '', null, undefined];
      
      invalidTypes.forEach(type => {
        expect(isValidEventType(type)).toBe(false);
      });
    });
  });

  describe("isValidLocationCategory", () => {
    it("debería validar categorías de ubicación correctas", () => {
      const validCategories = ['stadium', 'theater', 'conference_center', 'arena', 'outdoor'];
      
      validCategories.forEach(category => {
        expect(isValidLocationCategory(category)).toBe(true);
      });
    });

    it("debería rechazar categorías de ubicación inválidas", () => {
      const invalidCategories = ['invalid', 'restaurant', '', null, undefined];
      
      invalidCategories.forEach(category => {
        expect(isValidLocationCategory(category)).toBe(false);
      });
    });
  });

  describe("hasTimeConflict", () => {
    it("debería detectar conflicto de horarios", () => {
      const event1 = {
        date: "2025-12-31T20:00:00Z"
      };
      
      const event2 = {
        date: "2025-12-31T21:00:00Z" // 1 hora después
      };
      
      expect(hasTimeConflict(event1, event2)).toBe(true);
    });

    it("debería no detectar conflicto en días diferentes", () => {
      const event1 = {
        date: "2025-12-31T20:00:00Z"
      };
      
      const event2 = {
        date: "2026-01-01T20:00:00Z" // Día siguiente
      };
      
      expect(hasTimeConflict(event1, event2)).toBe(false);
    });

    it("debería no detectar conflicto con suficiente separación", () => {
      const event1 = {
        date: "2025-12-31T20:00:00Z"
      };
      
      const event2 = {
        date: "2025-12-31T14:00:00Z" // 6 horas antes
      };
      
      expect(hasTimeConflict(event1, event2)).toBe(false);
    });

    it("debería detectar conflicto en el mismo momento", () => {
      const event1 = {
        date: "2025-12-31T20:00:00Z"
      };
      
      const event2 = {
        date: "2025-12-31T20:00:00Z" // Mismo momento
      };
      
      expect(hasTimeConflict(event1, event2)).toBe(true);
    });
  });
});
