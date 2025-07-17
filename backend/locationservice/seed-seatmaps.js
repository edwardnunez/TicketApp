import SeatMap from './seatmap-model.js';

const seedSeatMaps = async (dbConnection) => {
  const SeatMapModel = dbConnection.models.SeatMap || dbConnection.model('SeatMap', SeatMap.schema);

  const seatMaps = [
    // ============= ESTADIOS DE FÚTBOL =============
    // Estadio Santiago Bernabéu - Capacidad: 476
    {
      id: 'football1',
      name: 'Estadio Santiago Bernabéu',
      type: 'football',
      compatibleEventTypes: ['football', 'concert'], 
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
          defaultPrice: 0,
          color: '#4CAF50',
          position: 'north',
          order: 1
        },
        {
          id: 'tribuna-este',
          name: 'Tribuna Este',
          rows: 6,
          seatsPerRow: 14,
          defaultPrice: 0,
          color: '#2196F3',
          position: 'east',
          order: 2
        },
        {
          id: 'tribuna-oeste',
          name: 'Tribuna Oeste',
          rows: 6,
          seatsPerRow: 14,
          defaultPrice: 0,
          color: '#2196F3',
          position: 'west',
          order: 3
        },
        {
          id: 'tribuna-sur',
          name: 'Tribuna Sur',
          rows: 8,
          seatsPerRow: 15,
          defaultPrice: 0,
          color: '#4CAF50',
          position: 'south',
          order: 4
        },
        {
          id: 'vip',
          name: 'Palcos VIP',
          rows: 2,
          seatsPerRow: 14,
          defaultPrice: 150,
          rowPricing: [
            { row: 1, price: 200 },
            { row: 2, price: 150 }
          ],
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
      compatibleEventTypes: ['football', 'concert'], 
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
          defaultPrice: 0,
          color: '#4CAF50',
          position: 'north',
          order: 1
        },
        {
          id: 'tribuna-este',
          name: 'Tribuna Este',
          rows: 8,
          seatsPerRow: 17,
          price: 0,
          color: '#2196F3',
          position: 'east',
          order: 2
        },
        {
          id: 'tribuna-oeste',
          name: 'Tribuna Oeste',
          rows: 8,
          seatsPerRow: 17,
          price: 0,
          color: '#2196F3',
          position: 'west',
          order: 3
        },
        {
          id: 'tribuna-sur',
          name: 'Tribuna Sur',
          rows: 10,
          seatsPerRow: 18,
          price: 0,
          color: '#4CAF50',
          position: 'south',
          order: 4
        },
        {
          id: 'vip',
          name: 'Palcos VIP',
          rows: 3,
          seatsPerRow: 14,
          price: 0,
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
      compatibleEventTypes: ['football'], 
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
          price: 0,
          color: '#4CAF50',
          position: 'north',
          order: 1
        },
        {
          id: 'tribuna-este',
          name: 'Tribuna Este',
          rows: 4,
          seatsPerRow: 10,
          price: 0,
          color: '#2196F3',
          position: 'east',
          order: 2
        },
        {
          id: 'tribuna-oeste',
          name: 'Tribuna Oeste',
          rows: 4,
          seatsPerRow: 10,
          price: 0,
          color: '#2196F3',
          position: 'west',
          order: 3
        },
        {
          id: 'tribuna-sur',
          name: 'Tribuna Sur',
          rows: 5,
          seatsPerRow: 12,
          price: 0,
          color: '#4CAF50',
          position: 'south',
          order: 4
        }
      ]
    },

    // ============= VENUES DE CONCIERTOS =============
    // WiZink Center - Capacidad: 17,000 (aproximada)
    {
      id: 'concert1',
      name: 'WiZink Center',
      type: 'concert',
      subtype: 'indoor_arena',
      compatibleEventTypes: ['concert'],
      config: {
        venueName: 'WiZink Center',
        stagePosition: 'center',
        stageDimensions: { width: 80, height: 50 },
        allowsGeneralAdmission: true
      },
      sections: [
        {
          id: 'pista',
          name: 'Pista',
          rows: 1, // No tiene filas definidas
          seatsPerRow: 1, // No tiene asientos por fila
          price: 0,
          color: '#FF5722',
          position: 'center',
          order: 1,
          hasNumberedSeats: false, // Entrada general
          totalCapacity: 300
        },
        {
          id: 'grada-baja',
          name: 'Grada Baja',
          rows: 7,
          seatsPerRow: 10,
          price: 0,
          defaultPrice: 80,
          rowPricing: [
            { row: 1, price: 120 },
            { row: 2, price: 110 },
            { row: 3, price: 100 },
            { row: 4, price: 90 },
            { row: 5, price: 85 },
            { row: 6, price: 82 },
            { row: 7, price: 80 }
          ],
          color: '#4CAF50',
          position: 'lower',
          order: 2,
          hasNumberedSeats: true
        },
        {
          id: 'grada-media',
          name: 'Grada Media',
          rows: 5,
          seatsPerRow: 8,
          price: 0,
          defaultPrice: 60,
          rowPricing: [
            { row: 1, price: 90 },
            { row: 2, price: 80 },
            { row: 3, price: 70 },
            { row: 4, price: 65 },
            { row: 5, price: 60 }
          ],
          color: '#2196F3',
          position: 'middle',
          order: 3,
          hasNumberedSeats: true
        },
        {
          id: 'grada-alta',
          name: 'Grada Alta',
          rows: 6,
          seatsPerRow: 11,
          price: 0,
          color: '#FF9800',
          position: 'upper',
          order: 4,
          hasNumberedSeats: true
        },
        {
          id: 'palcos-vip',
          name: 'Palcos VIP',
          rows: 2,
          seatsPerRow: 5,
          price: 0,
          defaultPrice: 200,
          rowPricing: [
            { row: 1, price: 250 },
            { row: 2, price: 200 }
          ],
          color: '#9C27B0',
          position: 'vip',
          order: 5,
          hasNumberedSeats: true
        }
      ]
    },

    {
      id: 'concert2',
      name: 'Palau Sant Jordi',
      type: 'concert',
      subtype: 'indoor_arena',
      compatibleEventTypes: ['concert'],
      config: {
        venueName: 'Palau Sant Jordi',
        stagePosition: 'center',
        stageDimensions: { width: 100, height: 60 },
        allowsGeneralAdmission: true
      },
      sections: [
        {
          id: 'pista',
          name: 'Pista',
          rows: 1,
          seatsPerRow: 1,
          price: 0,
          color: '#FF5722',
          position: 'center',
          order: 1,
          hasNumberedSeats: false,
          totalCapacity: 300
        },
        {
          id: 'lateral-este',
          name: 'Lateral Este',
          rows: 8,
          seatsPerRow: 13,
          price: 0,
          color: '#4CAF50',
          position: 'east',
          order: 2,
          hasNumberedSeats: true
        },
        {
          id: 'lateral-oeste',
          name: 'Lateral Oeste',
          rows: 8,
          seatsPerRow: 13,
          price: 0,
          color: '#4CAF50',
          position: 'west',
          order: 3,
          hasNumberedSeats: true
        },
        {
          id: 'fondo-norte',
          name: 'Fondo Norte',
          rows: 6,
          seatsPerRow: 10,
          price: 0,
          color: '#2196F3',
          position: 'north',
          order: 4,
          hasNumberedSeats: true
        },
        {
          id: 'fondo-sur',
          name: 'Fondo Sur',
          rows: 6,
          seatsPerRow: 10,
          price: 0,
          color: '#2196F3',
          position: 'south',
          order: 5,
          hasNumberedSeats: true
        },
        {
          id: 'palcos-premium',
          name: 'Palcos Premium',
          rows: 2,
          seatsPerRow: 10,
          price: 0,
          defaultPrice: 180,
          rowPricing: [
            { row: 1, price: 220 },
            { row: 2, price: 180 }
          ],
          color: '#9C27B0',
          position: 'vip',
          order: 6,
          hasNumberedSeats: true
        }
      ]
    },

    // Venue para entrada general solamente
    {
      id: 'concert3',
      name: 'Sala General',
      type: 'concert',
      subtype: 'general_admission',
      compatibleEventTypes: ['concert'],
      config: {
        venueName: 'Sala General',
        stagePosition: 'north',
        stageDimensions: { width: 40, height: 30 },
        allowsGeneralAdmission: true
      },
      sections: [
        {
          id: 'general',
          name: 'Entrada General',
          rows: 0,
          seatsPerRow: 0,
          price: 0,
          color: '#607D8B',
          position: 'general',
          order: 1,
          hasNumberedSeats: false,
          totalCapacity: 200
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
          price: 0,
          defaultPrice: 8,
          rowPricing: [
            { row: 1, price: 6 },
            { row: 2, price: 7 },
            { row: 3, price: 8 }
          ],
          color: '#4CAF50',
          position: 'front',
          order: 1
        },
        {
          id: 'middle',
          name: 'Centrales',
          rows: 5,
          seatsPerRow: 16,
          price: 0,
          color: '#2196F3',
          position: 'middle',
          order: 2
        },
        {
          id: 'back',
          name: 'Traseras',
          rows: 4,
          seatsPerRow: 16,
          price: 0,
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
          price: 0,
          color: '#4CAF50',
          position: 'front',
          order: 1
        },
        {
          id: 'middle',
          name: 'Centrales',
          rows: 6,
          seatsPerRow: 18,
          price: 0,
          color: '#2196F3',
          position: 'middle',
          order: 2
        },
        {
          id: 'back',
          name: 'Traseras',
          rows: 5,
          seatsPerRow: 18,
          price: 0,
          color: '#FF9800',
          position: 'back',
          order: 3
        },
        {
          id: 'premium',
          name: 'Premium',
          rows: 2,
          seatsPerRow: 18,
          price: 0,
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
          price: 0,
          color: '#4CAF50',
          position: 'front',
          order: 1
        },
        {
          id: 'middle',
          name: 'Centrales',
          rows: 3,
          seatsPerRow: 11,
          price: 0,
          color: '#2196F3',
          position: 'middle',
          order: 2
        },
        {
          id: 'back',
          name: 'Traseras',
          rows: 3,
          seatsPerRow: 11,
          price: 0,
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
          price: 0,
          defaultPrice: 120,
          rowPricing: [
            { row: 1, price: 200 },
            { row: 2, price: 180 },
            { row: 3, price: 160 },
            { row: 4, price: 150 },
            { row: 5, price: 140 },
            { row: 6, price: 135 },
            { row: 7, price: 130 },
            { row: 8, price: 125 },
            { row: 9, price: 122 },
            { row: 10, price: 120 }
          ],
          color: '#4CAF50',
          position: 'orchestra',
          order: 1
        },
        {
          id: 'mezzanine',
          name: 'Entresuelo',
          rows: 8,
          seatsPerRow: 18,
          price: 0,
          color: '#2196F3',
          position: 'mezzanine',
          order: 2
        },
        {
          id: 'balcony',
          name: 'Balcón',
          rows: 6,
          seatsPerRow: 16,
          price: 0,
          defaultPrice: 80,
          rowPricing: [], // Solo precio por defecto
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
          price: 0,
          defaultPrice: 300,
          rowPricing: [
            { row: 1, price: 400 },
            { row: 2, price: 350 },
            { row: 3, price: 300 }
          ],
          color: '#9C27B0',
          position: 'boxes',
          order: 1
        },
        {
          id: 'orchestra',
          name: 'Platea',
          rows: 12,
          seatsPerRow: 16,
          price: 0,
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
          price: 0,
          color: '#9C27B0',
          position: 'boxes',
          order: 1
        },
        {
          id: 'orchestra',
          name: 'Platea',
          rows: 20,
          seatsPerRow: 26,
          price: 0,
          color: '#4CAF50',
          position: 'orchestra',
          order: 2
        },
        {
          id: 'mezzanine',
          name: 'Entresuelo',
          rows: 12,
          seatsPerRow: 24,
          price: 0,
          color: '#2196F3',
          position: 'mezzanine',
          order: 3
        },
        {
          id: 'balcony',
          name: 'Balcón',
          rows: 10,
          seatsPerRow: 22,
          price: 0,
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
      if (!seatMapData.compatibleEventTypes) {
        seatMapData.compatibleEventTypes = [seatMapData.type];
      }

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