import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import EventSeatMapEditor from '../../pages/admin/EventSeatMapEditor';

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

const mockSeatMaps = [
  {
    id: 'seatmap1',
    name: 'Estadio SeatMap',
    type: 'football',
    sections: [
      {
        id: 'vip',
        name: 'VIP',
        rows: 5,
        seatsPerRow: 20,
        defaultPrice: 100,
        hasNumberedSeats: true
      },
      {
        id: 'general',
        name: 'General',
        hasNumberedSeats: false,
        totalCapacity: 500,
        defaultPrice: 50
      }
    ]
  }
];

const mockEvents = [
  {
    _id: 'event1',
    name: 'Concierto de Rock',
    date: '2024-12-31T20:00:00Z',
    location: {
      _id: 'loc1',
      name: 'Estadio Principal',
      seatMapId: 'seatmap1'
    },
    usesSectionPricing: true,
    sectionPricing: [
      {
        sectionId: 'vip',
        sectionName: 'VIP',
        defaultPrice: 100,
        capacity: 100
      }
    ]
  }
];

describe('EventSeatMapEditor Component - Caso de Uso 7: Crear Mapa de Asientos', () => {
  beforeEach(() => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockSeatMaps })
      .mockResolvedValueOnce({ data: mockEvents });
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

  test('debería cargar editor de configuración de seatmap', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      expect(screen.getByText(/configurar/i) || screen.getByText(/seatmap/i)).toBeInTheDocument();
      expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
    });
  });

  test('debería mostrar lista de eventos disponibles', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      expect(screen.getByText('Concierto de Rock')).toBeInTheDocument();
    });
  });

  test('debería permitir seleccionar evento para configurar', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });
      expect(eventSelect.value).toBe('event1');
    });
  });

  test('debería mostrar información del seatmap del evento', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      // Verificar que se muestra información del seatmap
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });

  test('debería permitir configurar precios por sección', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      // Verificar que se muestran campos de precio
      const priceInputs = screen.getAllByLabelText(/precio/i);
      expect(priceInputs.length).toBeGreaterThan(0);
    });
  });

  test('debería permitir configurar asientos bloqueados', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      // Verificar que se muestran opciones de bloqueo
      expect(screen.getByText(/bloquear/i) || screen.getByText(/asientos/i)).toBeInTheDocument();
    });
  });

  test('debería permitir configurar secciones bloqueadas', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      // Verificar que se muestran opciones de bloqueo de secciones
      expect(screen.getByText(/sección/i) || screen.getByText(/bloquear/i)).toBeInTheDocument();
    });
  });

  test('debería validar configuración antes de guardar', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      // Intentar guardar sin seleccionar evento
      const saveButton = screen.getByText(/guardar/i) || screen.getByText(/aplicar/i);
      fireEvent.click(saveButton);

      // Verificar que se muestra error de validación
      expect(screen.getByText(/seleccionar/i) || screen.getByText(/evento/i)).toBeInTheDocument();
    });
  });

  test('debería guardar configuración válida', async () => {
    mockedAxios.put.mockResolvedValue({
      data: {
        success: true,
        message: 'Configuración de seatmap guardada exitosamente'
      }
    });

    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      // Configurar precios
      const priceInputs = screen.getAllByLabelText(/precio/i);
      if (priceInputs.length > 0) {
        fireEvent.change(priceInputs[0], { target: { value: '120' } });
      }

      const saveButton = screen.getByText(/guardar/i) || screen.getByText(/aplicar/i);
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/events/event1/seat-blocks'),
        expect.objectContaining({
          blockedSeats: expect.any(Array),
          blockedSections: expect.any(Array)
        })
      );
    });
  });

  test('debería manejar error al guardar configuración', async () => {
    mockedAxios.put.mockRejectedValue({
      response: {
        status: 500,
        data: { error: 'Error interno del servidor' }
      }
    });

    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      const saveButton = screen.getByText(/guardar/i) || screen.getByText(/aplicar/i);
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/servidor/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar estado de carga al guardar', async () => {
    mockedAxios.put.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );

    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      const saveButton = screen.getByText(/guardar/i) || screen.getByText(/aplicar/i);
      fireEvent.click(saveButton);

      // Verificar que se muestra indicador de carga
      expect(screen.getByText(/guardando/i) || screen.getByText(/cargando/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar información de secciones del seatmap', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      // Verificar que se muestra información de secciones
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText(/5/i)).toBeInTheDocument(); // Filas
      expect(screen.getByText(/20/i)).toBeInTheDocument(); // Asientos por fila
    });
  });

  test('debería permitir configurar precios por fila', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      // Verificar que se muestran opciones de pricing por fila
      expect(screen.getByText(/fila/i) || screen.getByText(/row/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar capacidad de secciones', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      // Verificar que se muestra capacidad
      expect(screen.getByText(/100/i)).toBeInTheDocument(); // Capacidad VIP
      expect(screen.getByText(/500/i)).toBeInTheDocument(); // Capacidad General
    });
  });

  test('debería manejar evento sin seatmap', async () => {
    const eventWithoutSeatMap = {
      ...mockEvents[0],
      location: {
        ...mockEvents[0].location,
        seatMapId: null
      }
    };

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockSeatMaps })
      .mockResolvedValueOnce({ data: [eventWithoutSeatMap] });

    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      // Verificar que se muestra mensaje de que no hay seatmap
      expect(screen.getByText(/sin seatmap/i) || screen.getByText(/no configurado/i)).toBeInTheDocument();
    });
  });

  test('debería permitir resetear configuración', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      const resetButton = screen.getByText(/resetear/i) || screen.getByText(/limpiar/i);
      if (resetButton) {
        fireEvent.click(resetButton);
        // Verificar que se resetea la configuración
        expect(screen.getByText(/configuración/i)).toBeInTheDocument();
      }
    });
  });

  test('debería mostrar vista previa de la configuración', async () => {
    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      const eventSelect = screen.getByLabelText(/evento/i);
      fireEvent.change(eventSelect, { target: { value: 'event1' } });

      // Verificar que se muestra vista previa
      expect(screen.getByText(/vista previa/i) || screen.getByText(/preview/i)).toBeInTheDocument();
    });
  });

  test('debería manejar error al cargar eventos', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockSeatMaps })
      .mockRejectedValueOnce(new Error('Error al cargar eventos'));

    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/eventos/i)).toBeInTheDocument();
    });
  });

  test('debería manejar error al cargar seatmaps', async () => {
    mockedAxios.get
      .mockRejectedValueOnce(new Error('Error al cargar seatmaps'))
      .mockResolvedValueOnce({ data: mockEvents });

    renderWithRouter(<EventSeatMapEditor />);

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/seatmaps/i)).toBeInTheDocument();
    });
  });
});

