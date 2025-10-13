import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Profile from '../../pages/Profile';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios;

// Mock de useAuth de react-auth-kit
jest.mock('react-auth-kit', () => ({
  useAuth: () => ({
    authToken: 'mock-token',
    isAuthenticated: true,
    authUser: {
      _id: 'user1',
      username: 'testuser',
      email: 'test@example.com'
    }
  })
}));

const mockUserTickets = [
  {
    _id: 'ticket1',
    eventId: 'event1',
    ticketNumber: 'TKT-001',
    status: 'paid',
    quantity: 2,
    price: 50,
    purchasedAt: '2024-01-15T10:00:00Z',
    selectedSeats: [
      { id: 'seat1', sectionId: 'vip', row: 1, seat: 1, price: 50 },
      { id: 'seat2', sectionId: 'vip', row: 1, seat: 2, price: 50 }
    ],
    event: {
      _id: 'event1',
      name: 'Concierto de Rock',
      date: '2024-12-31T20:00:00Z',
      location: {
        name: 'Estadio Principal',
        address: 'Calle Principal 123'
      }
    }
  },
  {
    _id: 'ticket2',
    eventId: 'event2',
    ticketNumber: 'TKT-002',
    status: 'cancelled',
    quantity: 1,
    price: 30,
    purchasedAt: '2024-01-10T15:00:00Z',
    selectedSeats: [
      { id: 'seat3', sectionId: 'general', row: 5, seat: 10, price: 30 }
    ],
    event: {
      _id: 'event2',
      name: 'Obra de Teatro',
      date: '2024-12-25T19:00:00Z',
      location: {
        name: 'Teatro Municipal',
        address: 'Plaza del Teatro 1'
      }
    }
  }
];

describe('Profile Component - Caso de Uso 4: Compra de Entradas y Caso de Uso 5: Cancelar Entradas', () => {
  beforeEach(() => {
    localStorage.setItem("token", "mock-token");
    localStorage.setItem("username", "testuser");
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        tickets: mockUserTickets,
        count: mockUserTickets.length,
        statistics: {
          totalTickets: 2,
          totalSpent: 130,
          activeTickets: 1,
          pendingTickets: 0,
          cancelledTickets: 1
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  test('debería cargar tickets del usuario', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
      expect(screen.getByText('Obra de Teatro')).toBeInTheDocument();
    });
  });

  test('debería mostrar información de tickets comprados', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('TKT-001')).toBeInTheDocument();
      expect(screen.getByText('TKT-002')).toBeInTheDocument();
      expect(screen.getByText(/100.?€/i)).toBeInTheDocument();
      expect(screen.getByText(/30.?€/i)).toBeInTheDocument();

    });
  });

  test('debería mostrar estado de los tickets', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/pagado/i) || screen.getByText(/paid/i)).toBeInTheDocument();
      expect(screen.getByText(/cancelado/i) || screen.getByText(/cancelled/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar información de eventos', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Estadio Principal')).toBeInTheDocument();
      expect(screen.getByText('Teatro Municipal')).toBeInTheDocument();
    });
  });

  test('debería mostrar fechas de compra', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/15/i)).toBeInTheDocument(); // Fecha de compra
      expect(screen.getByText(/10/i)).toBeInTheDocument(); // Fecha de compra
    });
  });

  test('debería mostrar estadísticas del usuario', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/2/i)).toBeInTheDocument(); // Total tickets
      expect(screen.getByText(/€130/i)).toBeInTheDocument(); // Total gastado
      expect(screen.getByText(/1/i)).toBeInTheDocument(); // Tickets activos
    });
  });

  test('debería permitir cancelar ticket válido', async () => {
    mockedAxios.delete.mockResolvedValue({
      data: {
        success: true,
        message: 'Ticket cancelado exitosamente'
      }
    });

    renderWithRouter(<Profile />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancelar/i);
      if (cancelButtons.length > 0) {
        fireEvent.click(cancelButtons[0]);
      }
    });

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/tickets/ticket1')
      );
    });
  });

  test('debería manejar error al cancelar ticket inexistente', async () => {
    mockedAxios.delete.mockRejectedValue({
      response: {
        status: 404,
        data: { error: 'Ticket no encontrado' }
      }
    });

    renderWithRouter(<Profile />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancelar/i);
      if (cancelButtons.length > 0) {
        fireEvent.click(cancelButtons[0]);
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/no encontrado/i) || screen.getByText(/404/i)).toBeInTheDocument();
    });
  });

  test('debería manejar error al cancelar ticket de otro usuario', async () => {
    mockedAxios.delete.mockRejectedValue({
      response: {
        status: 403,
        data: { error: 'Acceso denegado' }
      }
    });

    renderWithRouter(<Profile />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancelar/i);
      if (cancelButtons.length > 0) {
        fireEvent.click(cancelButtons[0]);
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/acceso denegado/i) || screen.getByText(/403/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar confirmación antes de cancelar', async () => {
    renderWithRouter(<Profile />);

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

  test('debería permitir cancelar confirmación de cancelación', async () => {
    renderWithRouter(<Profile />);

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

  test('debería mostrar QR de tickets', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      const qrButtons = screen.getAllByText(/qr/i) || screen.getAllByText(/código/i);
      expect(qrButtons.length).toBeGreaterThan(0);
    });
  });

  test('debería permitir descargar QR', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        qrCode: 'data:image/png;base64,test-qr-code',
        ticketNumber: 'TKT-001'
      }
    });

    renderWithRouter(<Profile />);

    await waitFor(() => {
      const qrButtons = screen.getAllByText(/qr/i) || screen.getAllByText(/código/i);
      if (qrButtons.length > 0) {
        fireEvent.click(qrButtons[0]);
      }
    });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/tickets/ticket1/qr')
      );
    });
  });

  test('debería mostrar información de asientos seleccionados', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/vip/i)).toBeInTheDocument();
      expect(screen.getByText(/general/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar fechas de eventos', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/31/i)).toBeInTheDocument(); // Fecha del evento
      expect(screen.getByText(/25/i)).toBeInTheDocument(); // Fecha del evento
    });
  });

  test('debería manejar error al cargar tickets', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Error de red'));

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/cargar/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar lista vacía cuando no hay tickets', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        tickets: [],
        count: 0,
        statistics: {
          totalTickets: 0,
          totalSpent: 0,
          activeTickets: 0,
          pendingTickets: 0,
          cancelledTickets: 0
        }
      }
    });

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/no hay tickets/i) || screen.getByText(/sin tickets/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar estado de carga', async () => {
    mockedAxios.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { success: true, tickets: [] } }), 100))
    );

    renderWithRouter(<Profile />);

    // Verificar que se muestra algún indicador de carga
    expect(screen.getByText(/cargando/i) || screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('debería mostrar información del usuario', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  test('debería permitir filtrar tickets por estado', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      const filterSelect = screen.getByLabelText(/estado/i) || screen.getByLabelText(/filtro/i);
      if (filterSelect) {
        fireEvent.change(filterSelect, { target: { value: 'paid' } });
        expect(filterSelect.value).toBe('paid');
      }
    });
  });

  test('debería mostrar información de pagos', async () => {
    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/100.?€/i)).toBeInTheDocument();
      expect(screen.getByText(/30.?€/i)).toBeInTheDocument();
    });
  });
});

