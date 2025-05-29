import LocationModel from './location-model.js';

const seedLocations = async (locationDbConnection) => {
  const locations = [
    { name: "Location A", category: "stadium", address: "123 Main St", seatMapId: "football1", seatingMap: [] },
    { name: "Location B", category: "concert", address: "456 Elm St", seatMapId: "concert1", seatingMap: [] },
    { name: "Location C", category: "cinema", address: "789 Oak St", seatMapId: "cinema1", seatingMap: [] },
    { name: "Location D", category: "stadium", address: "321 Pine St", seatMapId: "football2", seatingMap: [] },
    { name: "Location E", category: "concert", address: "654 Maple St", seatMapId: "concert2", seatingMap: [] },
    { name: "Location F", category: "cinema", address: "987 Cedar St", seatMapId: "cinema2", seatingMap: [] }
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
