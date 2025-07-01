import LocationModel from './location-model.js';

const seedLocations = async (locationDbConnection) => {
  const locations = [
    {
      name: "Estadio Santiago Bernabéu",
      category: "stadium",
      address: "Av. de Concha Espina, 1, 28036 Madrid",
      seatMapId: "football1",
      capacity: 476,
      seatingMap: []
    },
    {
      name: "Estadio Camp Nou",
      category: "stadium",
      address: "C. d'Arístides Maillol, 12, 08028 Barcelona",
      seatMapId: "football2",
      capacity: 714,
      seatingMap: []
    },
    {
      name: "Estadio La Rosaleda",
      category: "stadium",
      address: "Calle Arroyo de los Ángeles, 15, 29007 Málaga",
      seatMapId: "football3",
      capacity: 200,
      seatingMap: []
    },
    {
      name: "WiZink Center",
      category: "concert",
      address: "Av. Felipe II, s/n, 28009 Madrid",
      seatMapId: "concert1", // Mapa específico de concierto con pista
      capacity: 17000,
      seatingMap: []
    },
    {
      name: "Palau Sant Jordi",
      category: "concert",
      address: "Passeig Olímpic, 17, 08038 Barcelona",
      seatMapId: "concert2", // Mapa específico de concierto con pista
      capacity: 24000,
      seatingMap: []
    },
    {
      name: "Teatro Circo Price",
      category: "concert",
      address: "Ronda de Atocha, 35, 28012 Madrid",
      seatMapId: null, // Sin mapa de asientos - entrada general
      capacity: 1800,
      seatingMap: []
    },
    {
      name: "Cines Callao",
      category: "cinema",
      address: "Plaza del Callao, 3, 28013 Madrid",
      seatMapId: "cinema1",
      capacity: 192,
      seatingMap: []
    },
    {
      name: "Cinesa La Maquinista",
      category: "cinema",
      address: "Carrer de Potosí, 2, 08030 Barcelona",
      seatMapId: "cinema2",
      capacity: 324,
      seatingMap: []
    },  
    {
      name: "Cines Verdi",
      category: "cinema",
      address: "Carrer de Verdi, 32, 08012 Barcelona",
      seatMapId: "cinema3",
      capacity: 86,
      seatingMap: []
    },
    {
      name: "Teatro Real",
      category: "theater",
      address: "Plaza de Isabel II, s/n, 28013 Madrid",
      seatMapId: "theater1",
      capacity: 540,
      seatingMap: []
    },
    {
      name: "Teatro Español",
      category: "theater",
      address: "Calle de Príncipe, 25, 28012 Madrid",
      seatMapId: "theater2",
      capacity: 204,
      seatingMap: []
    },
    {
      name: "Gran Teatre del Liceu",
      category: "theater",
      address: "La Rambla, 51-59, 08002 Barcelona",
      seatMapId: "theater3",
      capacity: 1044,
      seatingMap: []
    },
    {
      name: "Aeródromo de La Morgal",
      category: "festival",
      address: "LG La Morgal, s/n, 33690 Llanera, Asturias",
      seatMapId: null,
      seatingMap: []
    },
    {
      name: "Centro Cultural Internacional Oscar Niemeyer",
      category: "festival",
      address: "Avda. del Zinc, s/n, 33490 Avilés, Asturias",
      seatMapId: null,
      seatingMap: []
    },
    {
      name: "Recinto Ferial Luis Adaro",
      category: "festival",
      address: "Paseo Doctor Fleming, 481, 33203 Gijón, Asturias",
      seatMapId: null,
      seatingMap: []
    }
  ];

  const Location = locationDbConnection.model('Location', LocationModel.schema);

  for (const location of locations) {
    const existingLocation = await Location.findOne({ name: location.name });
    if (!existingLocation) {
      await Location.create(location);
    }
  }
};

export default seedLocations;

