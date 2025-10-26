import axios from 'axios';
import {
  getAdminHeaders,
  getUserHeaders,
  getAuthHeaders,
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedPatch,
  authenticatedDelete,
  userAuthenticatedGet,
  userAuthenticatedPost,
  userAuthenticatedPut
} from './api';

// Mock de axios
jest.mock('axios');

describe('api', () => {
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAdminHeaders', () => {
    test('debe retornar headers con roleToken cuando existe', () => {
      localStorage.setItem('roleToken', 'admin-token-123');

      const headers = getAdminHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer admin-token-123'
      });
    });

    test('debe retornar objeto vacío cuando no hay roleToken', () => {
      const headers = getAdminHeaders();

      expect(headers).toEqual({});
    });

    test('debe ignorar token regular y solo usar roleToken', () => {
      localStorage.setItem('token', 'regular-token');
      localStorage.setItem('roleToken', 'admin-token');

      const headers = getAdminHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer admin-token'
      });
    });
  });

  describe('getUserHeaders', () => {
    test('debe retornar headers con token cuando existe', () => {
      localStorage.setItem('token', 'user-token-456');

      const headers = getUserHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer user-token-456'
      });
    });

    test('debe retornar objeto vacío cuando no hay token', () => {
      const headers = getUserHeaders();

      expect(headers).toEqual({});
    });

    test('debe ignorar roleToken y solo usar token regular', () => {
      localStorage.setItem('token', 'user-token');
      localStorage.setItem('roleToken', 'admin-token');

      const headers = getUserHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer user-token'
      });
    });
  });

  describe('getAuthHeaders', () => {
    test('debe preferir roleToken cuando existe', () => {
      localStorage.setItem('roleToken', 'admin-token');
      localStorage.setItem('token', 'user-token');

      const headers = getAuthHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer admin-token'
      });
    });

    test('debe usar token regular cuando no hay roleToken', () => {
      localStorage.setItem('token', 'user-token');

      const headers = getAuthHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer user-token'
      });
    });

    test('debe retornar objeto vacío cuando no hay ningún token', () => {
      const headers = getAuthHeaders();

      expect(headers).toEqual({});
    });

    test('debe usar solo roleToken cuando ambos existen', () => {
      localStorage.setItem('roleToken', 'priority-token');
      localStorage.setItem('token', 'fallback-token');

      const headers = getAuthHeaders();

      expect(headers.Authorization).toBe('Bearer priority-token');
    });
  });

  describe('authenticatedGet', () => {
    test('debe hacer GET request con admin headers', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      const mockResponse = { data: { success: true } };
      axios.get.mockResolvedValue(mockResponse);

      await authenticatedGet('/api/events');

      expect(axios.get).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events`,
        {
          headers: {
            Authorization: 'Bearer admin-token'
          }
        }
      );
    });

    test('debe hacer GET request sin headers cuando no hay token', async () => {
      const mockResponse = { data: {} };
      axios.get.mockResolvedValue(mockResponse);

      await authenticatedGet('/api/public');

      expect(axios.get).toHaveBeenCalledWith(
        `${gatewayUrl}/api/public`,
        {
          headers: {}
        }
      );
    });

    test('debe combinar headers personalizados con headers de autenticación', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      axios.get.mockResolvedValue({ data: {} });

      await authenticatedGet('/api/events', {
        headers: { 'Content-Type': 'application/json' }
      });

      expect(axios.get).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events`,
        {
          headers: {
            Authorization: 'Bearer admin-token',
            'Content-Type': 'application/json'
          }
        }
      );
    });

    test('debe pasar configuración adicional a axios', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      axios.get.mockResolvedValue({ data: {} });

      await authenticatedGet('/api/events', {
        params: { page: 1 },
        timeout: 5000
      });

      expect(axios.get).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events`,
        expect.objectContaining({
          params: { page: 1 },
          timeout: 5000
        })
      );
    });
  });

  describe('authenticatedPost', () => {
    test('debe hacer POST request con admin headers y data', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      const postData = { name: 'New Event' };
      const mockResponse = { data: { id: 1 } };
      axios.post.mockResolvedValue(mockResponse);

      await authenticatedPost('/api/events', postData);

      expect(axios.post).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events`,
        postData,
        {
          headers: {
            Authorization: 'Bearer admin-token'
          }
        }
      );
    });

    test('debe hacer POST request sin headers cuando no hay token', async () => {
      const postData = { name: 'Event' };
      axios.post.mockResolvedValue({ data: {} });

      await authenticatedPost('/api/events', postData);

      expect(axios.post).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events`,
        postData,
        {
          headers: {}
        }
      );
    });

    test('debe combinar headers personalizados', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      axios.post.mockResolvedValue({ data: {} });

      await authenticatedPost('/api/events', {}, {
        headers: { 'X-Custom': 'value' }
      });

      expect(axios.post).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events`,
        {},
        {
          headers: {
            Authorization: 'Bearer admin-token',
            'X-Custom': 'value'
          }
        }
      );
    });
  });

  describe('authenticatedPut', () => {
    test('debe hacer PUT request con admin headers y data', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      const putData = { name: 'Updated Event' };
      const mockResponse = { data: { success: true } };
      axios.put.mockResolvedValue(mockResponse);

      await authenticatedPut('/api/events/1', putData);

      expect(axios.put).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events/1`,
        putData,
        {
          headers: {
            Authorization: 'Bearer admin-token'
          }
        }
      );
    });

    test('debe hacer PUT request sin headers cuando no hay token', async () => {
      const putData = { name: 'Event' };
      axios.put.mockResolvedValue({ data: {} });

      await authenticatedPut('/api/events/1', putData);

      expect(axios.put).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events/1`,
        putData,
        {
          headers: {}
        }
      );
    });
  });

  describe('authenticatedPatch', () => {
    test('debe hacer PATCH request con admin headers y data', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      const patchData = { status: 'active' };
      const mockResponse = { data: { success: true } };
      axios.patch.mockResolvedValue(mockResponse);

      await authenticatedPatch('/api/events/1', patchData);

      expect(axios.patch).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events/1`,
        patchData,
        {
          headers: {
            Authorization: 'Bearer admin-token'
          }
        }
      );
    });

    test('debe hacer PATCH request sin headers cuando no hay token', async () => {
      const patchData = { status: 'inactive' };
      axios.patch.mockResolvedValue({ data: {} });

      await authenticatedPatch('/api/events/1', patchData);

      expect(axios.patch).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events/1`,
        patchData,
        {
          headers: {}
        }
      );
    });
  });

  describe('authenticatedDelete', () => {
    test('debe hacer DELETE request con admin headers', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      const mockResponse = { data: { success: true } };
      axios.delete.mockResolvedValue(mockResponse);

      await authenticatedDelete('/api/events/1');

      expect(axios.delete).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events/1`,
        {
          headers: {
            Authorization: 'Bearer admin-token'
          }
        }
      );
    });

    test('debe hacer DELETE request sin headers cuando no hay token', async () => {
      axios.delete.mockResolvedValue({ data: {} });

      await authenticatedDelete('/api/events/1');

      expect(axios.delete).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events/1`,
        {
          headers: {}
        }
      );
    });

    test('debe combinar headers personalizados', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      axios.delete.mockResolvedValue({ data: {} });

      await authenticatedDelete('/api/events/1', {
        headers: { 'X-Reason': 'cleanup' }
      });

      expect(axios.delete).toHaveBeenCalledWith(
        `${gatewayUrl}/api/events/1`,
        {
          headers: {
            Authorization: 'Bearer admin-token',
            'X-Reason': 'cleanup'
          }
        }
      );
    });
  });

  describe('userAuthenticatedGet', () => {
    test('debe hacer GET request con user headers', async () => {
      localStorage.setItem('token', 'user-token');
      const mockResponse = { data: { tickets: [] } };
      axios.get.mockResolvedValue(mockResponse);

      await userAuthenticatedGet('/api/user/tickets');

      expect(axios.get).toHaveBeenCalledWith(
        `${gatewayUrl}/api/user/tickets`,
        {
          headers: {
            Authorization: 'Bearer user-token'
          }
        }
      );
    });

    test('debe hacer GET request sin headers cuando no hay token', async () => {
      axios.get.mockResolvedValue({ data: {} });

      await userAuthenticatedGet('/api/user/profile');

      expect(axios.get).toHaveBeenCalledWith(
        `${gatewayUrl}/api/user/profile`,
        {
          headers: {}
        }
      );
    });

    test('debe ignorar roleToken y usar solo token regular', async () => {
      localStorage.setItem('token', 'user-token');
      localStorage.setItem('roleToken', 'admin-token');
      axios.get.mockResolvedValue({ data: {} });

      await userAuthenticatedGet('/api/user/tickets');

      expect(axios.get).toHaveBeenCalledWith(
        `${gatewayUrl}/api/user/tickets`,
        {
          headers: {
            Authorization: 'Bearer user-token'
          }
        }
      );
    });
  });

  describe('userAuthenticatedPost', () => {
    test('debe hacer POST request con user headers y data', async () => {
      localStorage.setItem('token', 'user-token');
      const postData = { eventId: 1, seats: ['A1', 'A2'] };
      const mockResponse = { data: { orderId: 123 } };
      axios.post.mockResolvedValue(mockResponse);

      await userAuthenticatedPost('/api/user/purchase', postData);

      expect(axios.post).toHaveBeenCalledWith(
        `${gatewayUrl}/api/user/purchase`,
        postData,
        {
          headers: {
            Authorization: 'Bearer user-token'
          }
        }
      );
    });

    test('debe hacer POST request sin headers cuando no hay token', async () => {
      const postData = { data: 'test' };
      axios.post.mockResolvedValue({ data: {} });

      await userAuthenticatedPost('/api/user/action', postData);

      expect(axios.post).toHaveBeenCalledWith(
        `${gatewayUrl}/api/user/action`,
        postData,
        {
          headers: {}
        }
      );
    });

    test('debe ignorar roleToken y usar solo token regular', async () => {
      localStorage.setItem('token', 'user-token');
      localStorage.setItem('roleToken', 'admin-token');
      axios.post.mockResolvedValue({ data: {} });

      await userAuthenticatedPost('/api/user/purchase', {});

      expect(axios.post).toHaveBeenCalledWith(
        `${gatewayUrl}/api/user/purchase`,
        {},
        {
          headers: {
            Authorization: 'Bearer user-token'
          }
        }
      );
    });
  });

  describe('userAuthenticatedPut', () => {
    test('debe hacer PUT request con user headers y data', async () => {
      localStorage.setItem('token', 'user-token');
      const putData = { email: 'newemail@example.com' };
      const mockResponse = { data: { success: true } };
      axios.put.mockResolvedValue(mockResponse);

      await userAuthenticatedPut('/api/user/profile', putData);

      expect(axios.put).toHaveBeenCalledWith(
        `${gatewayUrl}/api/user/profile`,
        putData,
        {
          headers: {
            Authorization: 'Bearer user-token'
          }
        }
      );
    });

    test('debe hacer PUT request sin headers cuando no hay token', async () => {
      const putData = { data: 'test' };
      axios.put.mockResolvedValue({ data: {} });

      await userAuthenticatedPut('/api/user/settings', putData);

      expect(axios.put).toHaveBeenCalledWith(
        `${gatewayUrl}/api/user/settings`,
        putData,
        {
          headers: {}
        }
      );
    });

    test('debe ignorar roleToken y usar solo token regular', async () => {
      localStorage.setItem('token', 'user-token');
      localStorage.setItem('roleToken', 'admin-token');
      axios.put.mockResolvedValue({ data: {} });

      await userAuthenticatedPut('/api/user/profile', {});

      expect(axios.put).toHaveBeenCalledWith(
        `${gatewayUrl}/api/user/profile`,
        {},
        {
          headers: {
            Authorization: 'Bearer user-token'
          }
        }
      );
    });
  });

  describe('manejo de errores', () => {
    test('debe propagar errores de axios en GET', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      const errorMessage = 'Network Error';
      axios.get.mockRejectedValue(new Error(errorMessage));

      await expect(authenticatedGet('/api/events')).rejects.toThrow(errorMessage);
    });

    test('debe propagar errores de axios en POST', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      const errorMessage = '401 Unauthorized';
      axios.post.mockRejectedValue(new Error(errorMessage));

      await expect(authenticatedPost('/api/events', {})).rejects.toThrow(errorMessage);
    });

    test('debe propagar errores de axios en DELETE', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      const errorMessage = '404 Not Found';
      axios.delete.mockRejectedValue(new Error(errorMessage));

      await expect(authenticatedDelete('/api/events/999')).rejects.toThrow(errorMessage);
    });

    test('debe propagar errores en user requests', async () => {
      localStorage.setItem('token', 'user-token');
      const errorMessage = '403 Forbidden';
      axios.post.mockRejectedValue(new Error(errorMessage));

      await expect(userAuthenticatedPost('/api/user/purchase', {})).rejects.toThrow(errorMessage);
    });
  });

  describe('construcción de URLs', () => {
    test('debe construir URL correctamente con endpoint que empieza con /', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      axios.get.mockResolvedValue({ data: {} });

      await authenticatedGet('/api/events');

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/events'),
        expect.any(Object)
      );
    });

    test('debe manejar endpoints sin barra inicial', async () => {
      localStorage.setItem('roleToken', 'admin-token');
      axios.get.mockResolvedValue({ data: {} });

      await authenticatedGet('api/events');

      expect(axios.get).toHaveBeenCalledWith(
        `${gatewayUrl}api/events`,
        expect.any(Object)
      );
    });
  });
});
