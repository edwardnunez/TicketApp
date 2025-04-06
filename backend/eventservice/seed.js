import LocationModel from './location-model.js';

const seedLocations = async (locationDbConnection) => {
  const locations = [
    { name: "Location A", category: "stadium", address: "123 Main St", capacity: 200, hasSeatingMap: true },
    { name: "Location B", category: "concert", address: "456 Elm St", capacity: 500, hasSeatingMap: false },
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