/**
 * Tests unitarios para funciones de validación
 */

const {
  validateEmailFormat,
  validatePassword,
  validateEventDate,
  validateTicketQuantity,
  validateEventCapacity,
  validateRequiredFields
} = require('../../utils/validation');

describe("Validaciones de Usuario", () => {
  
  describe("validateEmailFormat", () => {
    it("debería validar email correcto", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "admin+tag@company.org"
      ];
      
      validEmails.forEach(email => {
        expect(validateEmailFormat(email)).toBe(true);
      });
    });

    it("debería rechazar emails inválidos", () => {
      const invalidEmails = [
        "invalid-email",
        "@domain.com",
        "user@",
        "user@domain",
        "",
        null,
        undefined
      ];
      
      invalidEmails.forEach(email => {
        expect(validateEmailFormat(email)).toBe(false);
      });
    });
  });

  describe("validatePassword", () => {
    it("debería validar contraseña fuerte", () => {
      const strongPasswords = [
        "Password123",
        "MySecurePass456",
        "AdminPass789"
      ];
      
      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("debería rechazar contraseñas débiles", () => {
      const weakPasswords = [
        { password: "123", expectedError: "Password must be at least 8 characters long" },
        { password: "password", expectedError: "Password must contain at least one uppercase letter" },
        { password: "PASSWORD", expectedError: "Password must contain at least one number" },
        { password: "Pass", expectedError: "Password must be at least 8 characters long" }
      ];
      
      weakPasswords.forEach(({ password, expectedError }) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expectedError);
      });
    });

    it("debería detectar múltiples errores", () => {
      const result = validatePassword("weak");
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain("Password must be at least 8 characters long");
      expect(result.errors).toContain("Password must contain at least one uppercase letter");
      expect(result.errors).toContain("Password must contain at least one number");
    });
  });
});

describe("Validaciones de Evento", () => {
  
  describe("validateEventDate", () => {
    it("debería validar fecha futura", () => {
      const futureDate = "2025-12-31T20:00:00Z";
      const result = validateEventDate(futureDate);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("debería rechazar fecha pasada", () => {
      const pastDate = "2020-01-01T20:00:00Z";
      const result = validateEventDate(pastDate);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Event date must be in the future");
    });

    it("debería rechazar formato de fecha inválido", () => {
      const invalidDates = [
        "invalid-date",
        "2025-13-45T25:70:00Z",
        "",
        null
      ];
      
      invalidDates.forEach(date => {
        const result = validateEventDate(date);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Invalid date format");
      });
    });
  });
});

describe("Validaciones de Tickets", () => {
  
  describe("validateTicketQuantity", () => {
    it("debería validar cantidad válida", () => {
      const validQuantities = [1, 2, 3, 4, 5, 6];
      
      validQuantities.forEach(quantity => {
        const result = validateTicketQuantity(quantity);
        expect(result.isValid).toBe(true);
      });
    });

    it("debería rechazar cantidad inválida", () => {
      const invalidQuantities = [
        { quantity: 0, expectedError: "Quantity must be between 1 and 6" },
        { quantity: 7, expectedError: "Quantity must be between 1 and 6" },
        { quantity: -1, expectedError: "Quantity must be between 1 and 6" },
        { quantity: 1.5, expectedError: "Quantity must be between 1 and 6" }
      ];
      
      invalidQuantities.forEach(({ quantity, expectedError }) => {
        const result = validateTicketQuantity(quantity);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(expectedError);
      });
    });
  });

  describe("validateEventCapacity", () => {
    it("debería validar capacidad dentro del límite", () => {
      const validEvents = [
        { capacity: 1000, soldTickets: 500 },
        { capacity: 100, soldTickets: 0 },
        { capacity: 50, soldTickets: 50 }
      ];
      
      validEvents.forEach(event => {
        const result = validateEventCapacity(event);
        expect(result.isValid).toBe(true);
      });
    });

    it("debería rechazar cuando se excede capacidad", () => {
      const invalidEvents = [
        { capacity: 1000, soldTickets: 1200 },
        { capacity: 50, soldTickets: 100 }
      ];
      
      invalidEvents.forEach(event => {
        const result = validateEventCapacity(event);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Sold tickets exceed event capacity");
      });
    });
  });
});

describe("Validaciones de Campos Requeridos", () => {
  
  describe("validateRequiredFields", () => {
    it("debería validar cuando todos los campos están presentes", () => {
      const data = {
        name: "Test Event",
        date: "2025-12-31T20:00:00Z",
        location: "507f1f77bcf86cd799439011",
        price: 50
      };
      
      const requiredFields = ["name", "date", "location", "price"];
      const result = validateRequiredFields(data, requiredFields);
      
      expect(result.isValid).toBe(true);
    });

    it("debería rechazar cuando faltan campos requeridos", () => {
      const data = {
        name: "Test Event"
        // Faltan date, location, price
      };
      
      const requiredFields = ["name", "date", "location", "price"];
      const result = validateRequiredFields(data, requiredFields);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Missing required fields");
      expect(result.error).toContain("date");
      expect(result.error).toContain("location");
      expect(result.error).toContain("price");
    });

    it("debería rechazar campos vacíos", () => {
      const data = {
        name: "",
        date: null,
        location: undefined,
        price: 0
      };
      
      const requiredFields = ["name", "date", "location", "price"];
      const result = validateRequiredFields(data, requiredFields);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Missing required fields");
    });
  });
});
