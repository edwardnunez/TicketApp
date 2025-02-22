import axios from "axios";

const API_URL = "http://localhost:5000";

export const getEvents = async () => {
  const response = await axios.get(`${API_URL}/events`);
  return response.data;
};

export const buyTicket = async (eventId) => {
  const response = await axios.post(`${API_URL}/checkout`, { eventId });
  return response.data;
};
