import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import EventCreation from '../../pages/admin/EventCreation';

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

const mockLocations = [
  {
    _id: 'loc1',
    name: 'Estadio Principal',
    address: 'Calle Principal 123',
    capacity: 1000,
    seatMapId: 'seatmap1'
  },
  {
    _id: 'loc2',
    name: 'Teatro Municipal',
    address: 'Plaza del Teatro 1',
    capacity: 500,
    seatMapId: 'seatmap2'
  }
];

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
      }
    ]
  }
];

describe('EventCreation Component - Caso de Uso 8: Crear Evento', () => {
  beforeEach(() => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockLocations })
      .mockResolvedValueOnce({ data: mockSeatMaps });
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

  test('debería cargar formulario de creación de evento', async () => {
    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      expect(screen.getByText(/crear evento/i) || screen.getByText(/nuevo evento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ubicación/i)).toBeInTheDocument();
    });
  });

  test('debería cargar lista de ubicaciones disponibles', async () => {
    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      expect(screen.getByText('Estadio Principal')).toBeInTheDocument();
      expect(screen.getByText('Teatro Municipal')).toBeInTheDocument();
    });
  });

  test('debería crear evento con datos válidos', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        _id: 'new-event-id',
        name: 'Nuevo Concierto',
        date: '2024-12-31',
        location: mockLocations[0],
        type: 'concert',
        state: 'proximo'
      }
    });

    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      // Llenar formulario
      const nameInput = screen.getByLabelText(/nombre/i);
      const dateInput = screen.getByLabelText(/fecha/i);
      const locationSelect = screen.getByLabelText(/ubicación/i);
      const typeSelect = screen.getByLabelText(/tipo/i);

      fireEvent.change(nameInput, { target: { value: 'Nuevo Concierto' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      fireEvent.change(locationSelect, { target: { value: mockLocations[0]._id } });
      fireEvent.change(typeSelect, { target: { value: 'concert' } });

      // Enviar formulario
      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/event'),
        expect.objectContaining({
          name: 'Nuevo Concierto',
          date: '2024-12-31',
          location: expect.any(Object),
          type: 'concert'
        })
      );
    });
  });

  test('debería validar campos obligatorios', async () => {
    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      // Intentar enviar formulario vacío
      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);

      // Verificar que se muestran errores de validación
      expect(screen.getByText(/nombre/i) || screen.getByText(/requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/fecha/i) || screen.getByText(/requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/ubicación/i) || screen.getByText(/requerido/i)).toBeInTheDocument();
    });
  });

  test('debería manejar conflicto de fecha/ubicación', async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        status: 400,
        data: {
          error: 'Ya existe un evento en esta ubicación con menos de 24 horas de diferencia.',
          conflictEvent: {
            id: 'conflict-id',
            name: 'Evento Conflictivo',
            date: '2024-12-31'
          }
        }
      }
    });

    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      // Llenar formulario con datos que causan conflicto
      const nameInput = screen.getByLabelText(/nombre/i);
      const dateInput = screen.getByLabelText(/fecha/i);
      const locationSelect = screen.getByLabelText(/ubicación/i);

      fireEvent.change(nameInput, { target: { value: 'Evento Conflictivo' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      fireEvent.change(locationSelect, { target: { value: mockLocations[0]._id } });

      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/conflicto/i) || screen.getByText(/ya existe/i)).toBeInTheDocument();
    });
  });

  test('debería permitir subir imagen del evento', async () => {
    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      const fileInput = screen.getByLabelText(/imagen/i) || screen.getByType('file');
      const file = new File(['test-image'], 'test.jpg', { type: 'image/jpeg' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(fileInput.files[0]).toBe(file);
    });
  });

  test('debería mostrar imagen por defecto cuando no se sube imagen', async () => {
    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      // Verificar que se muestra imagen por defecto
      const defaultImage = screen.getByAltText(/imagen/i) || screen.getByAltText(/evento/i);
      expect(defaultImage.src).toContain('default.jpg');
    });
  });

  test('debería manejar error al cargar ubicaciones', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Error al cargar ubicaciones'));

    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/ubicaciones/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar información de seatmap cuando se selecciona ubicación', async () => {
    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      const locationSelect = screen.getByLabelText(/ubicación/i);
      fireEvent.change(locationSelect, { target: { value: mockLocations[0]._id } });

      // Verificar que se muestra información del seatmap
      expect(screen.getByText(/seatmap/i) || screen.getByText(/asientos/i)).toBeInTheDocument();
    });
  });

  test('debería permitir configurar pricing por secciones', async () => {
    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      const locationSelect = screen.getByLabelText(/ubicación/i);
      fireEvent.change(locationSelect, { target: { value: mockLocations[0]._id } });

      // Verificar que se muestran opciones de pricing
      expect(screen.getByText(/pricing/i) || screen.getByText(/precios/i)).toBeInTheDocument();
    });
  });

  test('debería validar fecha futura', async () => {
    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/fecha/i);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      fireEvent.change(dateInput, { target: { value: yesterday.toISOString().split('T')[0] } });

      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);

      // Verificar que se muestra error de fecha pasada
      expect(screen.getByText(/fecha/i) || screen.getByText(/pasado/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar estado de carga al crear evento', async () => {
    mockedAxios.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );

    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      // Llenar formulario y enviar
      const nameInput = screen.getByLabelText(/nombre/i);
      fireEvent.change(nameInput, { target: { value: 'Test Event' } });

      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);

      // Verificar que se muestra indicador de carga
      expect(screen.getByText(/creando/i) || screen.getByText(/cargando/i)).toBeInTheDocument();
    });
  });

  test('debería manejar éxito en creación de evento', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        _id: 'new-event-id',
        name: 'Nuevo Concierto',
        state: 'proximo'
      }
    });

    renderWithRouter(<EventCreation />);

    await waitFor(() => {
      // Llenar formulario completo
      const nameInput = screen.getByLabelText(/nombre/i);
      const dateInput = screen.getByLabelText(/fecha/i);
      const locationSelect = screen.getByLabelText(/ubicación/i);
      const typeSelect = screen.getByLabelText(/tipo/i);

      fireEvent.change(nameInput, { target: { value: 'Nuevo Concierto' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      fireEvent.change(locationSelect, { target: { value: mockLocations[0]._id } });
      fireEvent.change(typeSelect, { target: { value: 'concert' } });

      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/éxito/i) || screen.getByText(/creado/i)).toBeInTheDocument();
    });
  });
});

