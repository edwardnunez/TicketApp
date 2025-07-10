import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 8000;

// Microservice URLs
const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:8001";
const ticketServiceUrl = process.env.TICKET_SERVICE_URL || "http://localhost:8002";
const eventServiceUrl = process.env.EVENT_SERVICE_URL || "http://localhost:8003";
const locationServiceUrl = process.env.LOCATION_SERVICE_URL || "http://localhost:8004";

app.use(cors());
app.use(express.json());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Límites aumentados solo para rutas con imágenes
const largePayloadMiddleware = express.json({ limit: '50mb' });

app.set("json spaces", 40);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Generic function to handle errors
const returnError = (res, error) => {
  console.log(error);
  if (error.response) {
    res.status(error.response.status).json({ error: error.response.data.error });
  } else {
    res.status(500).json({ error: "Internal Gateway Error" });
  }
};

// **User Routes**
app.post("/login", async (req, res) => {
  try {
    const authResponse = await axios.post(`${userServiceUrl}/login`, req.body);
    res.json(authResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.post("/adduser", async (req, res) => {
  try {
    const userResponse = await axios.post(`${userServiceUrl}/adduser`, req.body);
    res.json(userResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get("/users", async (req, res) => {
  try {
    const usersResponse = await axios.get(`${userServiceUrl}/users`);
    res.json(usersResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get("/users/search", async (req, res) => {
  try {
    const { username, userId } = req.query;

    const queryParams = username ? `?username=${username}` : userId ? `?userId=${userId}` : '';

    const usersResponse = await axios.get(`${userServiceUrl}/users/search${queryParams}`);

    res.json(usersResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.put("/edit-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedUserData = req.body;
    const response = await axios.put(`${userServiceUrl}/edit-user/${userId}`, updatedUserData);

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error updating user data:", error);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data.error });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

app.post("/verifyToken", async (req, res) => {
  try {
    const userResponse = await axios.post(`${userServiceUrl}/verifyToken`, req.body);
    res.json(userResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// **Ticket Routes**
app.get('/tickets/occupied/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/occupied/${eventId}`);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

app.post('/tickets/purchase', async (req, res) => {
  try {
    const ticketResponse = await axios.post(`${ticketServiceUrl}/tickets/purchase`, req.body);
    res.json(ticketResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get('/tickets/user/:userId/details', async (req, res) => {
    try {
      const { userId } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/user/${userId}/details`, {
        params: req.query
      });
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

app.get('/tickets/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/user/${userId}`, {
        params: req.query
      });
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

app.get('/tickets/event/:eventId', async (req, res) => {
  try {
      const { eventId } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/event/${eventId}`, {
        params: req.query
      });
      res.json(ticketResponse.data);
  } catch (error) {
      returnError(res, error);
  }
});

app.get('/tickets/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/${id}`);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

// Nuevo endpoint para obtener QR de un ticket
app.get('/tickets/:id/qr', async (req, res) => {
  try {
      const { id } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/${id}/qr`);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

app.get('/tickets/user/:userId/events', async (req, res) => {
  try {
      const { userId } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/user/${userId}/events`);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

// Nuevo endpoint para eliminar tickets por evento
app.delete("/tickets/event/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const ticketResponse = await axios.delete(`${ticketServiceUrl}/tickets/event/${eventId}`);
    res.json(ticketResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// Nuevo endpoint para cancelar/eliminar un ticket específico
app.delete('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ticketResponse = await axios.delete(`${ticketServiceUrl}/tickets/${id}`);
    res.json(ticketResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// **Event Routes**
app.post("/events", largePayloadMiddleware ,async (req, res) => {
  try {
    const eventResponse = await axios.post(`${eventServiceUrl}/event`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.put("/events/:eventId", largePayloadMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.put(`${eventServiceUrl}/events/${eventId}`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.patch("/events/:eventId/image", largePayloadMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.patch(`${eventServiceUrl}/events/${eventId}/image`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get("/events", async (req, res) => {
  try {
    const eventsResponse = await axios.get(`${eventServiceUrl}/events`);
    res.json(eventsResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get("/events/:eventId", async (req, res) => {
  try {
    const eventResponse = await axios.get(`${eventServiceUrl}/events/${req.params.eventId}`);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// Nuevo endpoint para actualizar estados de eventos manualmente
app.post("/events/update-states", async (req, res) => {
  try {
    const eventResponse = await axios.post(`${eventServiceUrl}/events/update-states`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// Nuevo endpoint para obtener estadísticas de eventos por estado
app.get("/events/stats/states", async (req, res) => {
  try {
    const eventResponse = await axios.get(`${eventServiceUrl}/events/stats/states`);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// Nuevo endpoint para cambiar el estado de un evento
app.patch("/events/:eventId/state", async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.patch(`${eventServiceUrl}/events/${eventId}/state`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// Nuevo endpoint para actualizar bloqueos de asientos
app.put("/events/:eventId/seat-blocks", async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.put(`${eventServiceUrl}/events/${eventId}/seat-blocks`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// Nuevo endpoint para eliminar un evento
app.delete("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.delete(`${eventServiceUrl}/events/${eventId}`);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// Nuevo endpoint para cancelar un evento (solo el admin creador)
app.delete("/events/:eventId/cancel", async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.delete(`${eventServiceUrl}/events/${eventId}/cancel`, {
      data: req.body
    });
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// **Location Routes**
app.post("/location", async (req, res) => {
  try {
    const locationResponse = await axios.post(`${locationServiceUrl}/location`, req.body);
    res.json(locationResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get("/locations", async (req, res) => {
  try {
    const locationsResponse = await axios.get(`${locationServiceUrl}/locations`);
    res.json(locationsResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get("/locations/:locationId", async (req, res) => {
  try {
    const locationResponse = await axios.get(`${locationServiceUrl}/locations/${req.params.locationId}`);
    res.json(locationResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get("/seatmaps", async (req, res) => {
  try {
    const seatMapsResponse = await axios.get(`${locationServiceUrl}/seatmaps`, {
      params: req.query
    });
    res.json(seatMapsResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.post("/seatmaps", async (req, res) => {
  try {
    const locationResponse = await axios.post(`${locationServiceUrl}/seatmaps`, req.body);
    res.json(locationResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get("/seatmaps/:id", async (req, res) => {
  try {
    const seatMapResponse = await axios.get(`${locationServiceUrl}/seatmaps/${req.params.id}`);
    res.json(seatMapResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get('/location/:locationId/sections', async (req, res) => {
  try {
    const seatMapResponse = await axios.get(`${locationServiceUrl}/location/${req.params.locationId}/sections`);
    res.json(seatMapResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

export default server;