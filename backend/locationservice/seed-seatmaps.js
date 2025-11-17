import SeatMap from './seatmap-model.js';

const seedSeatMaps = async (dbConnection) => {
  const SeatMapModel = dbConnection.models.SeatMap || dbConnection.model('SeatMap', SeatMap.schema);

  // Convierte definición antigua (rows: number, seatsPerRow: number) a filas/asientos explícitos
  const buildRows = (rowsCount, seatsPerRow) => {
    const safeRows = Number.isFinite(rowsCount) && rowsCount > 0 ? rowsCount : 0;
    const safeSeats = Number.isFinite(seatsPerRow) && seatsPerRow > 0 ? seatsPerRow : 0;
    return Array.from({ length: safeRows }).map((_, rowIdx) => ({
      index: rowIdx + 1,
      label: String(rowIdx + 1),
      seats: Array.from({ length: safeSeats }).map((_, seatIdx) => ({
        number: seatIdx + 1,
        label: String(seatIdx + 1)
      }))
    }));
  };

  const normalizeSection = (section) => {
    const {
      rows,
      seatsPerRow,
      ...rest
    } = section;

    if (section.hasNumberedSeats === false) {
      // Entrada general: sin filas/asientos
      return {
        ...rest,
        rows: [],
        rowPricing: [],
      };
    }

    return {
      ...rest,
      rows: Array.isArray(section.rows) ? section.rows : buildRows(rows, seatsPerRow),
      rowPricing: Array.isArray(section.rowPricing) ? section.rowPricing : [],
      totalCapacity: undefined
    };
  };

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
        fieldDimensions: { width: 900, height: 660 }
      },
      sections: [
        {
          id: 'tribuna-norte',
          name: 'Tribuna Norte',
          rows: 8,
          seatsPerRow: 15,
          color: '#4CAF50',
          position: 'north',
          order: 1
        },
        {
          id: 'tribuna-este',
          name: 'Tribuna Este',
          rows: 6,
          seatsPerRow: 14,
          color: '#2196F3',
          position: 'east',
          order: 2
        },
        {
          id: 'tribuna-oeste',
          name: 'Tribuna Oeste',
          rows: 6,
          seatsPerRow: 14,
          color: '#2196F3',
          position: 'west',
          order: 3
        },
        {
          id: 'tribuna-sur',
          name: 'Tribuna Sur',
          rows: 8,
          seatsPerRow: 15,
          color: '#4CAF50',
          position: 'south',
          order: 4
        },
        {
          id: 'vip',
          name: 'Palcos VIP',
          rows: 2,
          seatsPerRow: 14,
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
        fieldDimensions: { width: 900, height: 660 }
      },
      sections: [
        {
          id: 'tribuna-norte',
          name: 'Tribuna Norte',
          rows: 10,
          seatsPerRow: 18,
          color: '#4CAF50',
          position: 'north',
          order: 1
        },
        {
          id: 'tribuna-este',
          name: 'Tribuna Este',
          rows: 8,
          seatsPerRow: 17,
          color: '#2196F3',
          position: 'east',
          order: 2
        },
        {
          id: 'tribuna-oeste',
          name: 'Tribuna Oeste',
          rows: 8,
          seatsPerRow: 17,
          color: '#2196F3',
          position: 'west',
          order: 3
        },
        {
          id: 'tribuna-sur',
          name: 'Tribuna Sur',
          rows: 10,
          seatsPerRow: 18,
          color: '#4CAF50',
          position: 'south',
          order: 4
        },
        {
          id: 'vip',
          name: 'Palcos VIP',
          rows: 3,
          seatsPerRow: 14,
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
        fieldDimensions: { width: 900, height: 660 }
      },
      sections: [
        {
          id: 'tribuna-norte',
          name: 'Tribuna Norte',
          rows: 5,
          seatsPerRow: 12,
          color: '#4CAF50',
          position: 'north',
          order: 1
        },
        {
          id: 'tribuna-este',
          name: 'Tribuna Este',
          rows: 4,
          seatsPerRow: 10,
          color: '#2196F3',
          position: 'east',
          order: 2
        },
        {
          id: 'tribuna-oeste',
          name: 'Tribuna Oeste',
          rows: 4,
          seatsPerRow: 10,
          color: '#2196F3',
          position: 'west',
          order: 3
        },
        {
          id: 'tribuna-sur',
          name: 'Tribuna Sur',
          rows: 5,
          seatsPerRow: 12,
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
          rows: 1, // legado, será ignorado
          seatsPerRow: 1, // legado, será ignorado
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
      type: 'arena',
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
        screenWidth: 900
      },
      sections: [
        {
          id: 'front',
          name: 'Delanteras',
          rows: 3,
          seatsPerRow: 16,
          color: '#4CAF50',
          position: 'front',
          order: 1
        },
        {
          id: 'middle',
          name: 'Centrales',
          rows: 5,
          seatsPerRow: 16,
          color: '#2196F3',
          position: 'middle',
          order: 2
        },
        {
          id: 'back',
          name: 'Traseras',
          rows: 4,
          seatsPerRow: 16,
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
        screenWidth: 900
      },
      sections: [
        {
          id: 'front',
          name: 'Delanteras',
          rows: 4,
          seatsPerRow: 18,
          color: '#4CAF50',
          position: 'front',
          order: 1
        },
        {
          id: 'middle',
          name: 'Centrales',
          rows: 6,
          seatsPerRow: 18,
          color: '#2196F3',
          position: 'middle',
          order: 2
        },
        {
          id: 'back',
          name: 'Traseras',
          rows: 5,
          seatsPerRow: 18,
          color: '#FF9800',
          position: 'back',
          order: 3
        },
        {
          id: 'premium',
          name: 'Premium',
          rows: 2,
          seatsPerRow: 18,
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
        screenWidth: 900
      },
      sections: [
        {
          id: 'front',
          name: 'Delanteras',
          rows: 2,
          seatsPerRow: 10,
          color: '#4CAF50',
          position: 'front',
          order: 1
        },
        {
          id: 'middle',
          name: 'Centrales',
          rows: 3,
          seatsPerRow: 11,
          color: '#2196F3',
          position: 'middle',
          order: 2
        },
        {
          id: 'back',
          name: 'Traseras',
          rows: 3,
          seatsPerRow: 11,
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
        stageWidth: 850
      },
      sections: [
        {
          id: 'orchestra',
          name: 'Platea',
          rows: 15,
          seatsPerRow: 20,
          color: '#4CAF50',
          position: 'orchestra',
          order: 1
        },
        {
          id: 'mezzanine',
          name: 'Entresuelo',
          rows: 8,
          seatsPerRow: 18,
          color: '#2196F3',
          position: 'mezzanine',
          order: 2
        },
        {
          id: 'balcony',
          name: 'Balcón',
          rows: 6,
          seatsPerRow: 16,
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
        stageWidth: 800
      },
      sections: [
        {
          id: 'boxes',
          name: 'Palcos VIP',
          rows: 3,
          seatsPerRow: 4,
          color: '#9C27B0',
          position: 'boxes',
          order: 1
        },
        {
          id: 'orchestra',
          name: 'Platea',
          rows: 12,
          seatsPerRow: 16,
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
        stageWidth: 850
      },
      sections: [
        {
          id: 'boxes',
          name: 'Palcos VIP',
          rows: 4,
          seatsPerRow: 8,
          color: '#9C27B0',
          position: 'boxes',
          order: 1
        },
        {
          id: 'orchestra',
          name: 'Platea',
          rows: 20,
          seatsPerRow: 26,
          color: '#4CAF50',
          position: 'orchestra',
          order: 2
        },
        {
          id: 'mezzanine',
          name: 'Entresuelo',
          rows: 12,
          seatsPerRow: 24,
          color: '#2196F3',
          position: 'mezzanine',
          order: 3
        },
        {
          id: 'balcony',
          name: 'Balcón',
          rows: 10,
          seatsPerRow: 22,
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
      const prepared = {
        ...seatMapData,
        compatibleEventTypes: seatMapData.compatibleEventTypes || [seatMapData.type],
        sections: (seatMapData.sections || []).map(normalizeSection)
      };

      await SeatMapModel.findOneAndUpdate(
        { id: prepared.id },
        prepared,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error insertando seatmap ${seatMapData.id}:`, error);
    }
  }
};

export default seedSeatMaps;