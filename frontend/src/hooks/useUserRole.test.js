import { renderHook, waitFor } from '@testing-library/react';
import useUserRole from './useUserRole';
import axios from 'axios';
import { ensureAuthFreshness } from '../utils/authSession';

// Mock de axios
jest.mock('axios');

// Mock de authSession
jest.mock('../utils/authSession', () => ({
  ensureAuthFreshness: jest.fn()
}));

describe('useUserRole', () => {
  let localStorageMock;

  beforeEach(() => {
    // Mock de localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Resetear mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('debe inicializar en estado de carga', async () => {
    ensureAuthFreshness.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue('some-token');

    // Mock axios para que se quede pendiente
    let resolvePromise;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    axios.post.mockReturnValue(pendingPromise);

    const { result } = renderHook(() => useUserRole());

    // Debe estar en estado de carga mientras espera la respuesta
    expect(result.current.isLoading).toBe(true);

    // Resolver la promesa
    resolvePromise({ data: { role: 'user' } });

    // Esperar a que se actualice
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  test('debe retornar null cuando no hay roleToken', async () => {
    ensureAuthFreshness.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userRole).toBe(null);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('debe retornar null cuando el token ha expirado', async () => {
    ensureAuthFreshness.mockReturnValue(true); // Token expirado
    localStorageMock.getItem.mockReturnValue('some-token');

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userRole).toBe(null);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('debe detectar usuario admin correctamente', async () => {
    ensureAuthFreshness.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue('admin-token');
    axios.post.mockResolvedValue({
      data: { role: 'admin' }
    });

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userRole).toBe('admin');
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('debe detectar usuario normal correctamente', async () => {
    ensureAuthFreshness.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue('user-token');
    axios.post.mockResolvedValue({
      data: { role: 'user' }
    });

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userRole).toBe('user');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('debe manejar errores de verificación de token', async () => {
    ensureAuthFreshness.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue('invalid-token');
    axios.post.mockRejectedValue(new Error('Invalid token'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userRole).toBe(null);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test('debe llamar al endpoint correcto de verificación', async () => {
    const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
    ensureAuthFreshness.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue('test-token');
    axios.post.mockResolvedValue({
      data: { role: 'user' }
    });

    renderHook(() => useUserRole());

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${gatewayUrl}/verifyToken`,
        { token: 'test-token' }
      );
    });
  });

  test('debe escuchar eventos de authChange', async () => {
    ensureAuthFreshness.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue('user-token');
    axios.post.mockResolvedValue({
      data: { role: 'user' }
    });

    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useUserRole());

    expect(addEventListenerSpy).toHaveBeenCalledWith('authChange', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('authChange', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('debe actualizar el rol cuando se dispara authChange', async () => {
    ensureAuthFreshness.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue('user-token');
    axios.post
      .mockResolvedValueOnce({ data: { role: 'user' } })
      .mockResolvedValueOnce({ data: { role: 'admin' } });

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.userRole).toBe('user');
    });

    // Simular cambio de autenticación
    window.dispatchEvent(new Event('authChange'));

    await waitFor(() => {
      expect(result.current.userRole).toBe('admin');
    });

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });
  });

  test('debe usar el endpoint de la variable de entorno si está configurada', async () => {
    const customEndpoint = 'https://custom-api.com';
    process.env.REACT_APP_API_ENDPOINT = customEndpoint;

    ensureAuthFreshness.mockReturnValue(false);
    localStorageMock.getItem.mockReturnValue('test-token');
    axios.post.mockResolvedValue({
      data: { role: 'user' }
    });

    renderHook(() => useUserRole());

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${customEndpoint}/verifyToken`,
        { token: 'test-token' }
      );
    });

    delete process.env.REACT_APP_API_ENDPOINT;
  });
});
