import LocationModel from './location-model.js';

const seedLocations = async (locationDbConnection) => {
  const locations = [
    { name: "Location A", category: "stadium", address: "123 Main St", capacity: 200, hasSeatingMap: true, seatingMapId: "stadium1" },
    { name: "Location B", category: "concert", address: "456 Elm St", capacity: 500, hasSeatingMap: false, seatingMapId: "concert1" },
    { name: "Location C", category: "cinema", address: "789 Oak St", capacity: 300, hasSeatingMap: true, seatingMapId: "cinema1" },
    { name: "Location D", category: "stadium", address: "321 Pine St", capacity: 1000, hasSeatingMap: true, seatingMapId: "stadium2" },
    { name: "Location E", category: "concert", address: "654 Maple St", capacity: 800, hasSeatingMap: false, seatingMapId: "concert2" },
    { name: "Location F", category: "cinema", address: "987 Cedar St", capacity: 400, hasSeatingMap: true, seatingMapId: "cinema2" }
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