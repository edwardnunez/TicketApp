import SeatMap from './seatmap-model.js';

const seedSeatMaps = async (dbConnection) => {
  const SeatMapModel = dbConnection.model('SeatMap', SeatMap.schema);

  const seatMaps = [
    // ============= ESTADIOS DE FÚTBOL =============
    // Estadio Santiago Bernabéu - Capacidad: 476
    {
      id: 'football1',
      name: 'Estadio Santiago Bernabéu',
      type: 'football',
      config: {
        stadiumName: 'Estadio Santiago Bernabéu',
        fieldDimensions: { width: 400, height: 260 }
      },
      sections: [
        {
          id: 'tribuna-norte',
          name: 'Tribuna Norte',
          rows: 8,
          seatsPerRow: 15,
          price: 50000,
          color: '#4CAF50',
          position: 'north',
          order: 1
        },
        {
          id: 'tribuna-este',
          name: 'Tribuna Este',
          rows: 6,
          seatsPerRow: 14,
          price: 75000,
          color: '#2196F3',
          position: 'east',
          order: 2
        },
        {
          id: 'tribuna-oeste',
          name: 'Tribuna Oeste',
          rows: 6,
          seatsPerRow: 14,
          price: 75000,
          color: '#2196F3',
          position: 'west',
          order: 3
        },
        {
          id: 'tribuna-sur',
          name: 'Tribuna Sur',
          rows: 8,
          seatsPerRow: 15,
          price: 50000,
          color: '#4CAF50',
          position: 'south',
          order: 4
        },
        {
          id: 'vip',
          name: 'Palcos VIP',
          rows: 2,
          seatsPerRow: 14,
          price: 150000,
          color: '#FF9800',
          position: 'vip',
          order: 5
        }
      ]
    },
    // Estadio Camp Nou - Capacidad: 714
    {
      id: 'football2',
      name: 'Estadio Camp Nou',
      type: 'football',
      config: {
        stadiumName: 'Estadio Camp Nou',
        fieldDimensions: { width: 450, height: 280 }
      },
      sections: [
        {
          id: 'tribuna-norte',
          name: 'Tribuna Norte',
          rows: 10,
          seatsPerRow: 18,
          price: 60000,
          color: '#4CAF50',
          position: 'north',
          order: 1
        },
        {
          id: 'tribuna-este',
          name: 'Tribuna Este',
          rows: 8,
          seatsPerRow: 17,
          price: 85000,
          color: '#2196F3',
          position: 'east',
          order: 2
        },
        {
          id: 'tribuna-oeste',
          name: 'Tribuna Oeste',
          rows: 8,
          seatsPerRow: 17,
          price: 85000,
          color: '#2196F3',
          position: 'west',
          order: 3
        },
        {
          id: 'tribuna-sur',
          name: 'Tribuna Sur',
          rows: 10,
          seatsPerRow: 18,
          price: 60000,
          color: '#4CAF50',
          position: 'south',
          order: 4
        },
        {
          id: 'vip',
          name: 'Palcos VIP',
          rows: 3,
          seatsPerRow: 14,
          price: 180000,
          color: '#FF9800',
          position: 'vip',
          order: 5
        }
      ]
    },
    // Estadio La Rosaleda - Capacidad: 200
    {
      id: 'football3',
      name: 'Estadio La Rosaleda',
      type: 'football',
      config: {
        stadiumName: 'Estadio La Rosaleda',
        fieldDimensions: { width: 350, height: 220 }
      },
      sections: [
        {
          id: 'tribuna-norte',
          name: 'Tribuna Norte',
          rows: 5,
          seatsPerRow: 12,
          price: 30000,
          color: '#4CAF50',
          position: 'north',
          order: 1
        },
        {
          id: 'tribuna-este',
          name: 'Tribuna Este',
          rows: 4,
          seatsPerRow: 10,
          price: 40000,
          color: '#2196F3',
          position: 'east',
          order: 2
        },
        {
          id: 'tribuna-oeste',
          name: 'Tribuna Oeste',
          rows: 4,
          seatsPerRow: 10,
          price: 40000,
          color: '#2196F3',
          position: 'west',
          order: 3
        },
        {
          id: 'tribuna-sur',
          name: 'Tribuna Sur',
          rows: 5,
          seatsPerRow: 12,
          price: 30000,
          color: '#4CAF50',
          position: 'south',
          order: 4
        }
      ]
    },

    // ============= CINES =============
    // Cines Callao - Capacidad: 192
    {
      id: 'cinema1',
      name: 'Cines Callao',
      type: 'cinema',
      config: {
        cinemaName: 'Cines Callao',
        screenWidth: 300
      },
      sections: [
        {
          id: 'front',
          name: 'Delanteras',
          rows: 3,
          seatsPerRow: 16,
          price: 8000,
          color: '#4CAF50',
          position: 'front',
          order: 1
        },
        {
          id: 'middle',
          name: 'Centrales',
          rows: 5,
          seatsPerRow: 16,
          price: 12000,
          color: '#2196F3',
          position: 'middle',
          order: 2
        },
        {
          id: 'back',
          name: 'Traseras',
          rows: 4,
          seatsPerRow: 16,
          price: 10000,
          color: '#FF9800',
          position: 'back',
          order: 3
        }
      ]
    },
    // Cinesa La Maquinista - Capacidad: 324
    {
      id: 'cinema2',
      name: 'Cinesa La Maquinista',
      type: 'cinema',
      config: {
        cinemaName: 'Cinesa La Maquinista',
        screenWidth: 400
      },
      sections: [
        {
          id: 'front',
          name: 'Delanteras',
          rows: 4,
          seatsPerRow: 18,
          price: 10000,
          color: '#4CAF50',
          position: 'front',
          order: 1
        },
        {
          id: 'middle',
          name: 'Centrales',
          rows: 6,
          seatsPerRow: 18,
          price: 15000,
          color: '#2196F3',
          position: 'middle',
          order: 2
        },
        {
          id: 'back',
          name: 'Traseras',
          rows: 5,
          seatsPerRow: 18,
          price: 12000,
          color: '#FF9800',
          position: 'back',
          order: 3
        },
        {
          id: 'premium',
          name: 'Premium',
          rows: 2,
          seatsPerRow: 18,
          price: 25000,
          color: '#9C27B0',
          position: 'premium',
          order: 4
        }
      ]
    },
    // Cines Verdi - Capacidad: 86
    {
      id: 'cinema3',
      name: 'Cines Verdi',
      type: 'cinema',
      config: {
        cinemaName: 'Cines Verdi',
        screenWidth: 200
      },
      sections: [
        {
          id: 'front',
          name: 'Delanteras',
          rows: 2,
          seatsPerRow: 10,
          price: 7000,
          color: '#4CAF50',
          position: 'front',
          order: 1
        },
        {
          id: 'middle',
          name: 'Centrales',
          rows: 3,
          seatsPerRow: 11,
          price: 11000,
          color: '#2196F3',
          position: 'middle',
          order: 2
        },
        {
          id: 'back',
          name: 'Traseras',
          rows: 3,
          seatsPerRow: 11,
          price: 9000,
          color: '#FF9800',
          position: 'back',
          order: 3
        }
      ]
    },

    // ============= TEATROS =============
    // Teatro Real - Capacidad: 540
    {
      id: 'theater1',
      name: 'Teatro Real',
      type: 'theater',
      config: {
        theaterName: 'Teatro Real',
        stageWidth: 250
      },
      sections: [
        {
          id: 'orchestra',
          name: 'Platea',
          rows: 15,
          seatsPerRow: 20,
          price: 45000,
          color: '#4CAF50',
          position: 'orchestra',
          order: 1
        },
        {
          id: 'mezzanine',
          name: 'Entresuelo',
          rows: 8,
          seatsPerRow: 18,
          price: 35000,
          color: '#2196F3',
          position: 'mezzanine',
          order: 2
        },
        {
          id: 'balcony',
          name: 'Balcón',
          rows: 6,
          seatsPerRow: 16,
          price: 25000,
          color: '#FF9800',
          position: 'balcony',
          order: 3
        }
      ]
    },
    // Teatro Español - Capacidad: 204
    {
      id: 'theater2',
      name: 'Teatro Español',
      type: 'theater',
      config: {
        theaterName: 'Teatro Español',
        stageWidth: 280
      },
      sections: [
        {
          id: 'boxes',
          name: 'Palcos VIP',
          rows: 3,
          seatsPerRow: 4,
          price: 95000,
          color: '#9C27B0',
          position: 'boxes',
          order: 1
        },
        {
          id: 'orchestra',
          name: 'Platea',
          rows: 12,
          seatsPerRow: 16,
          price: 55000,
          color: '#4CAF50',
          position: 'orchestra',
          order: 2
        }
      ]
    },
    // Gran Teatre del Liceu - Capacidad: 1044
    {
      id: 'theater3',
      name: 'Gran Teatre del Liceu',
      type: 'theater',
      config: {
        theaterName: 'Gran Teatre del Liceu',
        stageWidth: 400
      },
      sections: [
        {
          id: 'boxes',
          name: 'Palcos VIP',
          rows: 4,
          seatsPerRow: 8,
          price: 120000,
          color: '#9C27B0',
          position: 'boxes',
          order: 1
        },
        {
          id: 'orchestra',
          name: 'Platea',
          rows: 20,
          seatsPerRow: 26,
          price: 65000,
          color: '#4CAF50',
          position: 'orchestra',
          order: 2
        },
        {
          id: 'mezzanine',
          name: 'Entresuelo',
          rows: 12,
          seatsPerRow: 24,
          price: 50000,
          color: '#2196F3',
          position: 'mezzanine',
          order: 3
        },
        {
          id: 'balcony',
          name: 'Balcón',
          rows: 10,
          seatsPerRow: 22,
          price: 35000,
          color: '#FF9800',
          position: 'balcony',
          order: 4
        }
      ]
    }
  ];

  // Insertar o actualizar cada seatmap
  for (const seatMapData of seatMaps) {
    try {
      await SeatMapModel.findOneAndUpdate(
        { id: seatMapData.id },
        seatMapData,
        { upsert: true, new: true }
      );
      console.log(`SeatMap ${seatMapData.id} insertado/actualizado correctamente`);
    } catch (error) {
      console.error(`Error insertando seatmap ${seatMapData.id}:`, error);
    }
  }
};

export default seedSeatMaps;