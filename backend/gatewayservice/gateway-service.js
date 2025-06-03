import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 8000;

// Microservice URLs
const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:8001";
const ticketServiceUrl = process.env.TICKET_SERVICE_URL || "http://localhost:8002";
const eventServiceUrl = process.env.EVENT_SERVICE_URL || "http://localhost:8003";
const locationServiceUrl = process.env.EVENT_SERVICE_URL || "http://localhost:8004";

app.use(cors());
app.use(express.json());

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

    const usersResponse = await axios.get(`http://userservice:8001/users/search${queryParams}`);

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
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/occupied/${eventId}`, req.body);
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
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/user/${userId}/details`, req.body);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

app.get('/tickets/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/user/${userId}`, req.body);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

app.get('/tickets/event/:eventId', async (req, res) => {
  try {
      const { eventId } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/event//${eventId}`, req.body);
      res.json(ticketResponse.data);
  } catch (error) {
      returnError(res, error);
  }
});

app.get('/tickets/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/${id}`, req.body);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

app.get('/tickets/user/:userId/events', async (req, res) => {
  try {
      const { userId } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/user/${userId}/events`, req.body);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

// **Event Routes**
app.post("/event", async (req, res) => {
  try {
    const eventResponse = await axios.post(`${eventServiceUrl}/event`, req.body);
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

app.post("/location", async (req, res) => {
  try {
    const eventResponse = await axios.post(`${locationServiceUrl}/location`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get("/locations", async (req, res) => {
  try {
    const eventsResponse = await axios.get(`${locationServiceUrl}/locations`);
    res.json(eventsResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

app.get("/locations/:locationId", async (req, res) => {
  try {
    const eventResponse = await axios.get(`${locationServiceUrl}/locations/${req.params.locationId}`);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

export default server;
