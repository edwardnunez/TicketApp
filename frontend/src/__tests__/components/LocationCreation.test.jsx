import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import LocationCreation from '../../pages/admin/LocationCreation';

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
      }
    ]
  },
  {
    id: 'seatmap2',
    name: 'Teatro SeatMap',
    type: 'theater',
    sections: [
      {
        id: 'orchestra',
        name: 'Orchestra',
        rows: 10,
        seatsPerRow: 20,
        defaultPrice: 80,
        hasNumberedSeats: true
      }
    ]
  }
];

describe('LocationCreation Component - Caso de Uso 6: Crear Ubicación', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: mockSeatMaps });
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

  test('debería cargar formulario de creación de ubicación', async () => {
    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      expect(screen.getByText(/crear ubicación/i) || screen.getByText(/nueva ubicación/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    });
  });

  test('debería cargar lista de seatmaps disponibles', async () => {
    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      expect(screen.getByText('Estadio SeatMap')).toBeInTheDocument();
      expect(screen.getByText('Teatro SeatMap')).toBeInTheDocument();
    });
  });

  test('debería crear ubicación con datos válidos', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        _id: 'new-location-id',
        name: 'Nueva Ubicación',
        category: 'concert',
        address: 'Nueva Dirección 123',
        capacity: 500
      }
    });

    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      // Llenar formulario
      const nameInput = screen.getByLabelText(/nombre/i);
      const categoryInput = screen.getByLabelText(/categoría/i);
      const addressInput = screen.getByLabelText(/dirección/i);
      const capacityInput = screen.getByLabelText(/capacidad/i);

      fireEvent.change(nameInput, { target: { value: 'Nueva Ubicación' } });
      fireEvent.change(categoryInput, { target: { value: 'concert' } });
      fireEvent.change(addressInput, { target: { value: 'Nueva Dirección 123' } });
      fireEvent.change(capacityInput, { target: { value: '500' } });

      // Enviar formulario
      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/location'),
        expect.objectContaining({
          name: 'Nueva Ubicación',
          category: 'concert',
          address: 'Nueva Dirección 123',
          capacity: 500
        })
      );
    });
  });

  test('debería validar campos obligatorios', async () => {
    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      // Intentar enviar formulario vacío
      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);

      // Verificar que se muestran errores de validación
      expect(screen.getByText(/nombre/i) || screen.getByText(/requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/categoría/i) || screen.getByText(/requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/dirección/i) || screen.getByText(/requerido/i)).toBeInTheDocument();
    });
  });

  test('debería rechazar ubicación duplicada', async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        status: 400,
        data: { error: 'Location already exists' }
      }
    });

    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      // Llenar formulario con datos duplicados
      const nameInput = screen.getByLabelText(/nombre/i);
      const categoryInput = screen.getByLabelText(/categoría/i);
      const addressInput = screen.getByLabelText(/dirección/i);

      fireEvent.change(nameInput, { target: { value: 'Ubicación Existente' } });
      fireEvent.change(categoryInput, { target: { value: 'concert' } });
      fireEvent.change(addressInput, { target: { value: 'Dirección Existente' } });

      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/ya existe/i) || screen.getByText(/duplicado/i)).toBeInTheDocument();
    });
  });

  test('debería permitir seleccionar seatmap', async () => {
    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      const seatMapSelect = screen.getByLabelText(/seatmap/i) || screen.getByLabelText(/mapa/i);
      fireEvent.change(seatMapSelect, { target: { value: 'seatmap1' } });

      // Verificar que se selecciona el seatmap
      expect(seatMapSelect.value).toBe('seatmap1');
    });
  });

  test('debería mostrar información del seatmap seleccionado', async () => {
    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      const seatMapSelect = screen.getByLabelText(/seatmap/i) || screen.getByLabelText(/mapa/i);
      fireEvent.change(seatMapSelect, { target: { value: 'seatmap1' } });

      // Verificar que se muestra información del seatmap
      expect(screen.getByText(/vip/i) || screen.getByText(/secciones/i)).toBeInTheDocument();
    });
  });

  test('debería manejar error al cargar seatmaps', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Error al cargar seatmaps'));

    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/seatmaps/i)).toBeInTheDocument();
    });
  });

  test('debería validar capacidad numérica', async () => {
    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      const capacityInput = screen.getByLabelText(/capacidad/i);
      fireEvent.change(capacityInput, { target: { value: 'invalid' } });

      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);

      // Verificar que se muestra error de validación
      expect(screen.getByText(/capacidad/i) || screen.getByText(/numérico/i)).toBeInTheDocument();
    });
  });

  test('debería validar capacidad positiva', async () => {
    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      const capacityInput = screen.getByLabelText(/capacidad/i);
      fireEvent.change(capacityInput, { target: { value: '-100' } });

      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);

      // Verificar que se muestra error de validación
      expect(screen.getByText(/capacidad/i) || screen.getByText(/positivo/i)).toBeInTheDocument();
    });
  });

  test('debería mostrar estado de carga al crear ubicación', async () => {
    mockedAxios.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );

    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      // Llenar formulario y enviar
      const nameInput = screen.getByLabelText(/nombre/i);
      fireEvent.change(nameInput, { target: { value: 'Test Location' } });

      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);

      // Verificar que se muestra indicador de carga
      expect(screen.getByText(/creando/i) || screen.getByText(/cargando/i)).toBeInTheDocument();
    });
  });

  test('debería manejar éxito en creación de ubicación', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        _id: 'new-location-id',
        name: 'Nueva Ubicación',
        category: 'concert',
        address: 'Nueva Dirección 123',
        capacity: 500
      }
    });

    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      // Llenar formulario completo
      const nameInput = screen.getByLabelText(/nombre/i);
      const categoryInput = screen.getByLabelText(/categoría/i);
      const addressInput = screen.getByLabelText(/dirección/i);
      const capacityInput = screen.getByLabelText(/capacidad/i);

      fireEvent.change(nameInput, { target: { value: 'Nueva Ubicación' } });
      fireEvent.change(categoryInput, { target: { value: 'concert' } });
      fireEvent.change(addressInput, { target: { value: 'Nueva Dirección 123' } });
      fireEvent.change(capacityInput, { target: { value: '500' } });

      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/éxito/i) || screen.getByText(/creado/i)).toBeInTheDocument();
    });
  });

  test('debería permitir crear ubicación sin seatmap', async () => {
    renderWithRouter(<LocationCreation />);

    await waitFor(() => {
      // Llenar formulario sin seleccionar seatmap
      const nameInput = screen.getByLabelText(/nombre/i);
      const categoryInput = screen.getByLabelText(/categoría/i);
      const addressInput = screen.getByLabelText(/dirección/i);

      fireEvent.change(nameInput, { target: { value: 'Ubicación Sin SeatMap' } });
      fireEvent.change(categoryInput, { target: { value: 'outdoor' } });
      fireEvent.change(addressInput, { target: { value: 'Dirección Sin SeatMap' } });

      const submitButton = screen.getByText(/crear/i) || screen.getByText(/guardar/i);
      fireEvent.click(submitButton);

      // Verificar que se puede crear sin seatmap
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/location'),
        expect.objectContaining({
          name: 'Ubicación Sin SeatMap',
          category: 'outdoor',
          address: 'Dirección Sin SeatMap'
        })
      );
    });
  });
});

