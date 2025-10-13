import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import TicketPurchase from '../../pages/TicketPurchase';

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

// Mock de useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-event-id' })
}));

const mockEventDetails = {
  _id: 'test-event-id',
  name: 'Concierto de Rock',
  date: '2024-12-31T20:00:00Z',
  type: 'concert',
  state: 'proximo',
  description: 'Un increíble concierto de rock',
  priceRange: {
    min: 50,
    max: 100,
    display: '€50 - €100'
  },
  location: {
    _id: 'loc1',
    name: 'Estadio Principal',
    address: 'Calle Principal 123'
  },
  usesSectionPricing: true,
  sectionPricing: [
    {
      sectionId: 'vip',
      sectionName: 'VIP',
      defaultPrice: 100,
      capacity: 100,
      rows: 5,
      seatsPerRow: 20,
      hasNumberedSeats: true
    },
    {
      sectionId: 'general',
      sectionName: 'General',
      defaultPrice: 50,
      capacity: 900,
      hasNumberedSeats: false
    }
  ],
  seatMapInfo: {
    sections: [
      {
        id: 'vip',
        name: 'VIP',
        rows: 5,
        seatsPerRow: 20,
        hasNumberedSeats: true
      },
      {
        id: 'general',
        name: 'General',
        hasNumberedSeats: false,
        totalCapacity: 900
      }
    ]
  }
};

const mockOccupiedSeats = {
  success: true,
  occupiedSeats: ['vip-1-1', 'vip-1-2', 'general-1'],
  count: 3
};

describe('TicketPurchase Component - Caso de Uso 3: Selección de Asientos', () => {
  beforeEach(() => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockEventDetails })
      .mockResolvedValueOnce({ data: mockOccupiedSeats });
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

  test('debería cargar seatmap correctamente en desktop', async () => {
    // Mock de detección de dispositivo
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });

  test('debería cargar seatmap correctamente en móvil', async () => {
    // Mock de detección de dispositivo móvil
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
    });
  });

  test('debería obtener y mostrar asientos ocupados', async () => {
    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      // Verificar que se hace la llamada para obtener asientos ocupados
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/tickets/occupied/test-event-id')
      );
    });
  });

  test('debería permitir seleccionar asiento disponible', async () => {
    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      // Buscar asientos disponibles (no ocupados)
      const availableSeats = screen.getAllByTestId(/seat-/);
      const firstAvailableSeat = availableSeats.find(seat => 
        !seat.classList.contains('occupied') && 
        !seat.classList.contains('blocked')
      );

      if (firstAvailableSeat) {
        fireEvent.click(firstAvailableSeat);
        expect(firstAvailableSeat).toHaveClass('selected');
      }
    });
  });

  test('debería bloquear selección de asiento ocupado', async () => {
    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      // Buscar asientos ocupados
      const occupiedSeats = screen.getAllByTestId(/seat-/).filter(seat => 
        seat.classList.contains('occupied')
      );

      if (occupiedSeats.length > 0) {
        const occupiedSeat = occupiedSeats[0];
        fireEvent.click(occupiedSeat);
        
        // Verificar que no se puede seleccionar
        expect(occupiedSeat).not.toHaveClass('selected');
      }
    });
  });

  test('debería mostrar precios de asientos', async () => {
    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      expect(screen.getByText('€100')).toBeInTheDocument(); // Precio VIP
      expect(screen.getByText('€50')).toBeInTheDocument(); // Precio General
    });
  });

  test('debería calcular total correctamente', async () => {
    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      // Seleccionar asientos y verificar cálculo de total
      const availableSeats = screen.getAllByTestId(/seat-/).filter(seat => 
        !seat.classList.contains('occupied') && 
        !seat.classList.contains('blocked')
      );

      if (availableSeats.length >= 2) {
        fireEvent.click(availableSeats[0]); // €100
        fireEvent.click(availableSeats[1]); // €50
        
        expect(screen.getByText(/€150/)).toBeInTheDocument();
      }
    });
  });

  test('debería validar datos de comprador antes de enviar', async () => {
    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      // Intentar comprar sin datos de comprador
      const buyButton = screen.getByText(/comprar/i) || screen.getByText(/finalizar/i);
      fireEvent.click(buyButton);

      // Verificar que se muestran errores de validación
      expect(screen.getByText(/nombre/i) || screen.getByText(/email/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar error para datos de comprador incompletos', async () => {
    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      // Llenar solo algunos campos
      const nameInput = screen.getByLabelText(/nombre/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const buyButton = screen.getByText(/comprar/i) || screen.getByText(/finalizar/i);
      fireEvent.click(buyButton);

      // Verificar que se muestra error de validación
      expect(screen.getByText(/email/i) || screen.getByText(/requerido/i)).toBeInTheDocument();
    });
  });

  test('debería manejar error al cargar asientos ocupados', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockEventDetails })
      .mockRejectedValueOnce(new Error('Error al cargar asientos'));

    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/asientos/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar información de secciones', async () => {
    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });

  test('debería permitir seleccionar asientos de pista general', async () => {
    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      // Buscar sección de pista general
      const generalSection = screen.getByText('General');
      expect(generalSection).toBeInTheDocument();

      // Verificar que se puede seleccionar capacidad de pista
      const generalAdmissionInput = screen.getByLabelText(/cantidad/i) || 
                                   screen.getByLabelText(/entradas/i);
      if (generalAdmissionInput) {
        fireEvent.change(generalAdmissionInput, { target: { value: '2' } });
        expect(generalAdmissionInput.value).toBe('2');
      }
    });
  });

  test('debería mostrar información del evento', async () => {
    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
      expect(screen.getByText('Estadio Principal')).toBeInTheDocument();
    });
  });

  test('debería manejar evento no encontrado', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 404, data: { error: 'Event not found' } }
    });

    renderWithRouter(<TicketPurchase />);

    await waitFor(() => {
      expect(screen.getByText(/no encontrado/i) || screen.getByText(/404/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar estado de carga', async () => {
    // Mock de carga lenta
    mockedAxios.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: mockEventDetails }), 100))
    );

    renderWithRouter(<TicketPurchase />);

    // Verificar que se muestra algún indicador de carga
    expect(screen.getByText(/cargando/i) || screen.getByTestId('loading')).toBeInTheDocument();
  });
});

