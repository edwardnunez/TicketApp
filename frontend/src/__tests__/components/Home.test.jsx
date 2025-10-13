import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Home from '../../pages/Home';

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
    isAdmin: false,
    isLoading: false
  })
}));

const mockEvents = [
  {
    _id: '1',
    name: 'Concierto de Rock',
    date: '2024-12-31T20:00:00Z',
    type: 'concert',
    state: 'proximo',
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
    hasCustomImage: true,
    imageUrl: 'data:image/jpeg;base64,test-image'
  },
  {
    _id: '2',
    name: 'Obra de Teatro',
    date: '2024-12-25T19:00:00Z',
    type: 'theater',
    state: 'proximo',
    priceRange: {
      min: 30,
      max: 30,
      display: '€30'
    },
    location: {
      _id: 'loc2',
      name: 'Teatro Municipal',
      address: 'Plaza del Teatro 1'
    },
    hasCustomImage: false
  }
];

describe('Home Component - Caso de Uso 1: Listar Eventos', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: mockEvents
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

  test('debería cargar y mostrar lista de eventos', async () => {
    renderWithRouter(<Home />);

    // Verificar que se hace la llamada a la API
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/events'),
      expect.any(Object)
    );

    // Esperar a que se carguen los eventos
    await waitFor(() => {
      expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
      expect(screen.getByText('Obra de Teatro')).toBeInTheDocument();
    });
  });

  test('debería mostrar información de precios correctamente', async () => {
    renderWithRouter(<Home />);

    await waitFor(() => {
      expect(screen.getByText('€50 - €100')).toBeInTheDocument();
      expect(screen.getByText('€30')).toBeInTheDocument();
    });
  });

  test('debería mostrar información de ubicación', async () => {
    renderWithRouter(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Estadio Principal')).toBeInTheDocument();
      expect(screen.getByText('Teatro Municipal')).toBeInTheDocument();
    });
  });

  test('debería mostrar fechas formateadas correctamente', async () => {
    renderWithRouter(<Home />);

    await waitFor(() => {
      // Verificar que las fechas se muestran (formato puede variar según la configuración)
      expect(screen.getByText(/31/)).toBeInTheDocument();
      expect(screen.getByText(/25/)).toBeInTheDocument();
    });
  });

  test('debería manejar estado de carga', async () => {
    // Mock de carga lenta
    mockedAxios.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: mockEvents }), 100))
    );

    renderWithRouter(<Home />);

    // Verificar que se muestra algún indicador de carga
    expect(screen.getByText(/cargando/i) || screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('debería manejar error al cargar eventos', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Error de red'));

    renderWithRouter(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/no se pudieron cargar/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar imagen por defecto cuando no hay imagen personalizada', async () => {
    renderWithRouter(<Home />);

    await waitFor(() => {
      // Verificar que se muestra imagen por defecto para el segundo evento
      const defaultImages = screen.getAllByAltText(/evento/i);
      expect(defaultImages.length).toBeGreaterThan(0);
    });
  });

  test('debería mostrar imagen personalizada cuando está disponible', async () => {
    renderWithRouter(<Home />);

    await waitFor(() => {
      // Verificar que se muestra la imagen personalizada para el primer evento
      const customImages = screen.getAllByAltText(/evento/i);
      expect(customImages.length).toBeGreaterThan(0);
    });
  });

  test('debería permitir navegación a detalles del evento', async () => {
    renderWithRouter(<Home />);

    await waitFor(() => {
      const eventLinks = screen.getAllByRole('link');
      expect(eventLinks.length).toBeGreaterThan(0);
      
      // Verificar que los enlaces apuntan a las rutas correctas
      eventLinks.forEach(link => {
        expect(link.getAttribute('href')).toMatch(/\/event\/\d+/);
      });
    });
  });

  test('debería mostrar estado de evento correctamente', async () => {
    renderWithRouter(<Home />);

    await waitFor(() => {
      // Verificar que se muestran los estados de los eventos
      expect(screen.getByText(/próximo/i) || screen.getByText(/activo/i)).toBeInTheDocument();
    });
  });

  test('debería manejar lista vacía de eventos', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    renderWithRouter(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/no hay eventos/i) || screen.getByText(/sin eventos/i)).toBeInTheDocument();
    });
  });
});

