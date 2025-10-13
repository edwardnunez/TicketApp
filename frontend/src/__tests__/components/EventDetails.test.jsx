import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import EventDetails from '../../pages/EventDetails';

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
  description: 'Un increíble concierto de rock con las mejores bandas',
  priceRange: {
    min: 50,
    max: 100,
    display: '€50 - €100'
  },
  location: {
    _id: 'loc1',
    name: 'Estadio Principal',
    address: 'Calle Principal 123',
    capacity: 1000
  },
  hasCustomImage: true,
  imageUrl: 'data:image/jpeg;base64,test-image',
  capacity: 1000,
  usesSectionPricing: true,
  sectionPricing: [
    {
      sectionId: 'vip',
      sectionName: 'VIP',
      defaultPrice: 100,
      capacity: 100
    },
    {
      sectionId: 'general',
      sectionName: 'General',
      defaultPrice: 50,
      capacity: 900
    }
  ]
};

const mockCancelledEvent = {
  ...mockEventDetails,
  state: 'cancelado'
};

describe('EventDetails Component - Caso de Uso 2: Ver Detalle de Evento', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: mockEventDetails
    });
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

  test('debería cargar y mostrar detalles de evento válido', async () => {
    renderWithRouter(<EventDetails />);

    // Verificar que se hace la llamada a la API
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/events/test-event-id'),
      expect.any(Object)
    );

    // Esperar a que se carguen los detalles
    await waitFor(() => {
      expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
      expect(screen.getByText('Estadio Principal')).toBeInTheDocument();
      expect(screen.getByText('Un increíble concierto de rock con las mejores bandas')).toBeInTheDocument();
    });
  });

  test('debería mostrar información de precios', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('€50 - €100')).toBeInTheDocument();
    });
  });

  test('debería mostrar información de ubicación', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('Estadio Principal')).toBeInTheDocument();
      expect(screen.getByText('Calle Principal 123')).toBeInTheDocument();
    });
  });

  test('debería mostrar imagen del evento', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      const eventImage = screen.getByAltText(/evento/i);
      expect(eventImage).toBeInTheDocument();
      expect(eventImage.src).toContain('data:image/jpeg;base64,test-image');
    });
  });

  test('debería mostrar imagen por defecto cuando no hay imagen personalizada', async () => {
    const eventWithoutImage = {
      ...mockEventDetails,
      hasCustomImage: false,
      imageUrl: null
    };

    mockedAxios.get.mockResolvedValue({
      data: eventWithoutImage
    });

    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      const defaultImage = screen.getByAltText(/evento/i);
      expect(defaultImage).toBeInTheDocument();
      // Verificar que se usa imagen por defecto
      expect(defaultImage.src).toContain('default.jpg');
    });
  });

  test('debería mostrar banner de cancelación para evento cancelado', async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockCancelledEvent
    });

    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText(/cancelado/i) || screen.getByText(/evento cancelado/i)).toBeInTheDocument();
    });
  });

  test('debería deshabilitar compra para evento cancelado', async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockCancelledEvent
    });

    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      const buyButton = screen.queryByText(/comprar/i) || screen.queryByText(/entradas/i);
      if (buyButton) {
        expect(buyButton).toBeDisabled();
      }
    });
  });

  test('debería manejar error al cargar evento', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Evento no encontrado'));

    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/no encontrado/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar información de secciones cuando usa pricing por secciones', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });

  test('debería mostrar capacidad del evento', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText(/1000/i) || screen.getByText(/capacidad/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar fecha formateada correctamente', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      // Verificar que la fecha se muestra (formato puede variar)
      expect(screen.getByText(/31/)).toBeInTheDocument();
      expect(screen.getByText(/diciembre/i) || screen.getByText(/2024/i)).toBeInTheDocument();
    });
  });

  test('debería permitir navegación a compra de entradas', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      const buyButton = screen.getByText(/comprar/i) || screen.getByText(/entradas/i);
      expect(buyButton).toBeInTheDocument();
      
      // Verificar que el botón es clickeable
      expect(buyButton).not.toBeDisabled();
    });
  });

  test('debería mostrar estado de carga', async () => {
    // Mock de carga lenta
    mockedAxios.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: mockEventDetails }), 100))
    );

    renderWithRouter(<EventDetails />);

    // Verificar que se muestra algún indicador de carga
    expect(screen.getByText(/cargando/i) || screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('debería manejar evento no encontrado', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 404, data: { error: 'Event not found' } }
    });

    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText(/no encontrado/i) || screen.getByText(/404/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar información de tipo de evento', async () => {
    renderWithRouter(<EventDetails />);

    await waitFor(() => {
      expect(screen.getByText(/concierto/i) || screen.getByText(/concert/i)).toBeInTheDocument();
    });
  });
});

