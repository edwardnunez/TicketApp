import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import AdminDashboard from '../../pages/admin/AdminDashboard';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios;

// Mock de useAuth de react-auth-kit
jest.mock('react-auth-kit', () => ({
  useAuth: () => ({
    authToken: 'mock-token',
    isAuthenticated: true
  })
}));

// Mock de useUserRole
jest.mock('../../hooks/useUserRole', () => ({
  __esModule: true,
  default: () => ({
    isAdmin: true,
    isLoading: false
  })
}));

const mockEvents = [
  {
    _id: 'event1',
    name: 'Concierto de Rock',
    date: '2024-12-31T20:00:00Z',
    type: 'concert',
    state: 'proximo',
    location: {
      _id: 'loc1',
      name: 'Estadio Principal',
      address: 'Calle Principal 123'
    },
    createdBy: 'admin1',
    ticketStats: {
      totalTickets: 100,
      soldTickets: 50,
      pendingTickets: 10,
      cancelledTickets: 5,
      totalRevenue: 5000,
      soldRevenue: 2500
    }
  },
  {
    _id: 'event2',
    name: 'Obra de Teatro',
    date: '2024-12-25T19:00:00Z',
    type: 'theater',
    state: 'activo',
    location: {
      _id: 'loc2',
      name: 'Teatro Municipal',
      address: 'Plaza del Teatro 1'
    },
    createdBy: 'admin1',
    ticketStats: {
      totalTickets: 200,
      soldTickets: 150,
      pendingTickets: 20,
      cancelledTickets: 10,
      totalRevenue: 12000,
      soldRevenue: 9000
    }
  }
];

describe('AdminDashboard Component - Caso de Uso 9: Cancelar y Eliminar Eventos', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: mockEvents });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  test('debería cargar lista de eventos del administrador', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
      expect(screen.getByText('Obra de Teatro')).toBeInTheDocument();
    });
  });

  test('debería mostrar estadísticas de tickets por evento', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/100/i)).toBeInTheDocument(); // Total tickets
      expect(screen.getByText(/50/i)).toBeInTheDocument(); // Sold tickets
      expect(screen.getByText(/€5000/i)).toBeInTheDocument(); // Revenue
    });
  });

  test('debería cancelar evento futuro', async () => {
    mockedAxios.delete.mockResolvedValue({
      data: {
        success: true,
        message: 'Evento cancelado y tickets asociados eliminados correctamente'
      }
    });

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancelar/i);
      if (cancelButtons.length > 0) {
        fireEvent.click(cancelButtons[0]);
      }
    });

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/events/event1/cancel'),
        expect.objectContaining({
          adminId: expect.any(String)
        })
      );
    });
  });

  test('debería eliminar evento sin dependencias', async () => {
    mockedAxios.delete.mockResolvedValue({
      data: {
        success: true,
        message: 'Evento y tickets asociados eliminados de la base de datos'
      }
    });

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/eliminar/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
    });

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/events/event1')
      );
    });
  });

  test('debería eliminar evento con tickets', async () => {
    mockedAxios.delete.mockResolvedValue({
      data: {
        success: true,
        message: 'Evento y tickets asociados eliminados de la base de datos'
      }
    });

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/eliminar/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
    });

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/events/event1')
      );
    });
  });

  test('debería manejar error al cancelar evento', async () => {
    mockedAxios.delete.mockRejectedValue({
      response: {
        status: 500,
        data: { error: 'Error interno del servidor' }
      }
    });

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancelar/i);
      if (cancelButtons.length > 0) {
        fireEvent.click(cancelButtons[0]);
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/servidor/i)).toBeInTheDocument();
    });
  });

  test('debería manejar error al eliminar evento', async () => {
    mockedAxios.delete.mockRejectedValue({
      response: {
        status: 500,
        data: { error: 'Error interno del servidor' }
      }
    });

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/eliminar/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/servidor/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar confirmación antes de cancelar', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancelar/i);
      if (cancelButtons.length > 0) {
        fireEvent.click(cancelButtons[0]);
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/confirmar/i) || screen.getByText(/seguro/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar confirmación antes de eliminar', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/eliminar/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/confirmar/i) || screen.getByText(/seguro/i)).toBeInTheDocument();
    });
  });

  test('debería permitir cancelar confirmación', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancelar/i);
      if (cancelButtons.length > 0) {
        fireEvent.click(cancelButtons[0]);
      }
    });

    await waitFor(() => {
      const cancelConfirmButton = screen.getByText(/cancelar/i) || screen.getByText(/no/i);
      fireEvent.click(cancelConfirmButton);
    });

    // Verificar que no se hace la llamada de cancelación
    expect(mockedAxios.delete).not.toHaveBeenCalled();
  });

  test('debería mostrar estado de los eventos', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/próximo/i) || screen.getByText(/activo/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar información de ubicación', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Estadio Principal')).toBeInTheDocument();
      expect(screen.getByText('Teatro Municipal')).toBeInTheDocument();
    });
  });

  test('debería mostrar fechas de eventos', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/31/i)).toBeInTheDocument();
      expect(screen.getByText(/25/i)).toBeInTheDocument();
    });
  });

  test('debería manejar lista vacía de eventos', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/no hay eventos/i) || screen.getByText(/sin eventos/i)).toBeInTheDocument();
    });
  });

  test('debería manejar error al cargar eventos', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Error de red'));

    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/cargar/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar estadísticas generales', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/total/i) || screen.getByText(/estadísticas/i)).toBeInTheDocument();
    });
  });

  test('debería permitir filtrar eventos por estado', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const filterSelect = screen.getByLabelText(/estado/i) || screen.getByLabelText(/filtro/i);
      if (filterSelect) {
        fireEvent.change(filterSelect, { target: { value: 'proximo' } });
        expect(filterSelect.value).toBe('proximo');
      }
    });
  });

  test('debería permitir filtrar eventos por tipo', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      const typeFilter = screen.getByLabelText(/tipo/i);
      if (typeFilter) {
        fireEvent.change(typeFilter, { target: { value: 'concert' } });
        expect(typeFilter.value).toBe('concert');
      }
    });
  });

  test('debería mostrar porcentaje de ventas', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/50%/i) || screen.getByText(/75%/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar ingresos por evento', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/€2500/i) || screen.getByText(/€9000/i)).toBeInTheDocument();
    });
  });
});

