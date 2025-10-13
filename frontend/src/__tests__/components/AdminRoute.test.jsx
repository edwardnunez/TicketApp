import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import AdminRoute from '../../components/AdminRoute';
import AdminDashboard from '../../pages/admin/AdminDashboard';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios;

// Mock de useAuth de react-auth-kit
const mockUseAuth = jest.fn();
jest.mock('react-auth-kit', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock de useUserRole
const mockUseUserRole = jest.fn();
jest.mock('../../hooks/useUserRole', () => ({
  __esModule: true,
  default: () => mockUseUserRole()
}));

describe('AdminRoute Component - Caso de Uso 10: Roles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (component, initialEntries = ['/admin']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    );
  };

  test('debería denegar acceso sin roleToken', async () => {
    mockUseAuth.mockReturnValue({
      authToken: 'mock-token',
      isAuthenticated: true
    });

    mockUseUserRole.mockReturnValue({
      isAdmin: false,
      isLoading: false
    });

    renderWithRouter(
      <AdminRoute element={<AdminDashboard />} />
    );

    await waitFor(() => {
      expect(screen.getByText(/acceso denegado/i) || 
             screen.getByText(/no autorizado/i) ||
             screen.getByText(/redirigiendo/i)).toBeInTheDocument();
    });
  });

  test('debería conceder acceso con token de admin válido', async () => {
    mockUseAuth.mockReturnValue({
      authToken: 'mock-token',
      isAuthenticated: true
    });

    mockUseUserRole.mockReturnValue({
      isAdmin: true,
      isLoading: false
    });

    renderWithRouter(
      <AdminRoute element={<AdminDashboard />} />
    );

    await waitFor(() => {
      // Verificar que se renderiza el componente de admin
      expect(screen.getByText(/admin/i) || 
             screen.getByText(/dashboard/i) ||
             screen.getByText(/panel/i)).toBeInTheDocument();
    });
  });

  test('debería manejar token inválido/expirado', async () => {
    mockUseAuth.mockReturnValue({
      authToken: 'invalid-token',
      isAuthenticated: true
    });

    mockUseUserRole.mockReturnValue({
      isAdmin: false,
      isLoading: false
    });

    // Mock de respuesta de token inválido
    mockedAxios.post.mockRejectedValue({
      response: { status: 401, data: { error: 'Invalid or expired token' } }
    });

    renderWithRouter(
      <AdminRoute element={<AdminDashboard />} />
    );

    await waitFor(() => {
      expect(screen.getByText(/acceso denegado/i) || 
             screen.getByText(/token inválido/i) ||
             screen.getByText(/sesión expirada/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar estado de carga mientras verifica token', async () => {
    mockUseAuth.mockReturnValue({
      authToken: 'mock-token',
      isAuthenticated: true
    });

    mockUseUserRole.mockReturnValue({
      isAdmin: false,
      isLoading: true
    });

    renderWithRouter(
      <AdminRoute element={<AdminDashboard />} />
    );

    await waitFor(() => {
      expect(screen.getByText(/cargando/i) || 
             screen.getByText(/verificando/i) ||
             screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  test('debería redirigir a login cuando no está autenticado', async () => {
    mockUseAuth.mockReturnValue({
      authToken: null,
      isAuthenticated: false
    });

    mockUseUserRole.mockReturnValue({
      isAdmin: false,
      isLoading: false
    });

    renderWithRouter(
      <AdminRoute element={<AdminDashboard />} />
    );

    await waitFor(() => {
      expect(screen.getByText(/iniciar sesión/i) || 
             screen.getByText(/login/i) ||
             screen.getByText(/autenticarse/i)).toBeInTheDocument();
    });
  });

  test('debería manejar error de red al verificar token', async () => {
    mockUseAuth.mockReturnValue({
      authToken: 'mock-token',
      isAuthenticated: true
    });

    mockUseUserRole.mockReturnValue({
      isAdmin: false,
      isLoading: false
    });

    // Mock de error de red
    mockedAxios.post.mockRejectedValue(new Error('Network Error'));

    renderWithRouter(
      <AdminRoute element={<AdminDashboard />} />
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i) || 
             screen.getByText(/conexión/i) ||
             screen.getByText(/red/i)).toBeInTheDocument();
    });
  });

  test('debería limpiar sesión cuando token es inválido', async () => {
    const mockSignOut = jest.fn();
    
    mockUseAuth.mockReturnValue({
      authToken: 'invalid-token',
      isAuthenticated: true,
      signOut: mockSignOut
    });

    mockUseUserRole.mockReturnValue({
      isAdmin: false,
      isLoading: false
    });

    // Mock de respuesta de token inválido
    mockedAxios.post.mockRejectedValue({
      response: { status: 401, data: { error: 'Invalid or expired token' } }
    });

    renderWithRouter(
      <AdminRoute element={<AdminDashboard />} />
    );

    await waitFor(() => {
      // Verificar que se llama a signOut para limpiar la sesión
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  test('debería manejar respuesta 403 (Forbidden)', async () => {
    mockUseAuth.mockReturnValue({
      authToken: 'mock-token',
      isAuthenticated: true
    });

    mockUseUserRole.mockReturnValue({
      isAdmin: false,
      isLoading: false
    });

    // Mock de respuesta 403
    mockedAxios.post.mockRejectedValue({
      response: { status: 403, data: { error: 'Forbidden' } }
    });

    renderWithRouter(
      <AdminRoute element={<AdminDashboard />} />
    );

    await waitFor(() => {
      expect(screen.getByText(/acceso denegado/i) || 
             screen.getByText(/forbidden/i) ||
             screen.getByText(/prohibido/i)).toBeInTheDocument();
    });
  });

  test('debería permitir acceso a usuario admin', async () => {
    mockUseAuth.mockReturnValue({
      authToken: 'valid-admin-token',
      isAuthenticated: true
    });

    mockUseUserRole.mockReturnValue({
      isAdmin: true,
      isLoading: false
    });

    // Mock de verificación exitosa
    mockedAxios.post.mockResolvedValue({
      data: { role: 'admin' }
    });

    renderWithRouter(
      <AdminRoute element={<AdminDashboard />} />
    );

    await waitFor(() => {
      // Verificar que se renderiza el contenido de admin
      expect(screen.getByText(/admin/i) || 
             screen.getByText(/dashboard/i) ||
             screen.getByText(/panel/i)).toBeInTheDocument();
    });
  });

  test('debería manejar timeout en verificación de token', async () => {
    mockUseAuth.mockReturnValue({
      authToken: 'mock-token',
      isAuthenticated: true
    });

    mockUseUserRole.mockReturnValue({
      isAdmin: false,
      isLoading: false
    });

    // Mock de timeout
    mockedAxios.post.mockRejectedValue({
      code: 'ECONNABORTED',
      message: 'timeout of 5000ms exceeded'
    });

    renderWithRouter(
      <AdminRoute element={<AdminDashboard />} />
    );

    await waitFor(() => {
      expect(screen.getByText(/timeout/i) || 
             screen.getByText(/tiempo/i) ||
             screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});

