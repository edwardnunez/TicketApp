import { jest } from '@jest/globals';

const mockAxios = {
  get: jest.fn((url) => {
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
    if (url.includes('/seatmaps/')) {
      return Promise.resolve({
        data: {
          _id: "test-seatmap-id",
          sections: []
        }
      });
    }
    return Promise.reject(new Error('Not found'));
  }),
  
  post: jest.fn(() => Promise.resolve({ data: { success: true } })),
  put: jest.fn(() => Promise.resolve({ data: { success: true } })),
  delete: jest.fn(() => Promise.resolve({ data: { success: true } })),
  patch: jest.fn(() => Promise.resolve({ data: { success: true } })),
  
  create: jest.fn(function() { return this; }),
  
  defaults: {
    headers: {
      common: {}
    }
  },
  
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(),
      eject: jest.fn()
    }
  }
};

export default mockAxios;