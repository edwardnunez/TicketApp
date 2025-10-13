
// jest.setup.js
import { jest } from '@jest/globals';

// Mock de axios para todos los tests
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  create: jest.fn(() => mockAxios)
};

// Configurar respuestas por defecto
mockAxios.get.mockImplementation((url) => {
  if (url.includes('/locations/')) {
    return Promise.resolve({
      data: {
        _id: "507f1f77bcf86cd799439011",
        name: "Test Location",
        address: "Test Address",
        city: "Test City",
        capacity: 1000,
        seatMapId: null
      }
    });
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
mockAxios.post.mockResolvedValue({ data: { success: true } });
mockAxios.put.mockResolvedValue({ data: { success: true } });
mockAxios.patch.mockResolvedValue({ data: { success: true } });