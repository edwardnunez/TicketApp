import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 8000;

const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:8001";
const ticketServiceUrl = process.env.TICKET_SERVICE_URL || "http://localhost:8002";
const eventServiceUrl = process.env.EVENT_SERVICE_URL || "http://localhost:8003";
const locationServiceUrl = process.env.LOCATION_SERVICE_URL || "http://localhost:8004";

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const largePayloadMiddleware = express.json({ limit: '50mb' });

app.set("json spaces", 40);

/**
 * Health check endpoint
 * @route GET /health
 * @returns {Object} Service status
 */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/**
 * Generic error handler for microservice communication
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
const returnError = (res, error) => {
  console.log(error);
  if (error.response) {
    res.status(error.response.status).json({ error: error.response.data.error });
  } else {
    res.status(500).json({ error: "Internal Gateway Error" });
  }
};

// **User Routes**

/**
 * User login endpoint
 * @route POST /login
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.username - Username
 * @param {string} req.body.password - Password
 * @returns {Object} Authentication response with token and user data
 */
app.post("/login", async (req, res) => {
  try {
    const authResponse = await axios.post(`${userServiceUrl}/login`, req.body);
    res.json(authResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * User registration endpoint
 * @route POST /adduser
 * @param {Object} req.body - User registration data
 * @param {string} req.body.name - User's first name
 * @param {string} req.body.surname - User's last name
 * @param {string} req.body.username - Username
 * @param {string} req.body.email - Email address
 * @param {string} req.body.password - Password
 * @returns {Object} Registration response with success status
 */
app.post("/adduser", async (req, res) => {
  try {
    const userResponse = await axios.post(`${userServiceUrl}/adduser`, req.body);
    res.json(userResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Get all users endpoint
 * @route GET /users
 * @returns {Array} List of all users
 */
app.get("/users", async (req, res) => {
  try {
    const usersResponse = await axios.get(`${userServiceUrl}/users`);
    res.json(usersResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Search users endpoint
 * @route GET /users/search
 * @param {string} [req.query.username] - Username to search for
 * @param {string} [req.query.userId] - User ID to search for
 * @returns {Object} User data if found
 */
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

/**
 * Update user endpoint
 * @route PUT /edit-user/:userId
 * @param {string} req.params.userId - User ID to update
 * @param {Object} req.body - Updated user data
 * @returns {Object} Updated user data
 */
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

/**
 * Verify token endpoint
 * @route POST /verifyToken
 * @param {Object} req.body - Token verification data
 * @param {string} req.body.token - JWT token to verify
 * @returns {Object} Token verification response
 */
app.post("/verifyToken", async (req, res) => {
  try {
    const userResponse = await axios.post(`${userServiceUrl}/verifyToken`, req.body);
    res.json(userResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// **Ticket Routes**

/**
 * Get occupied seats for an event
 * @route GET /tickets/occupied/:eventId
 * @param {string} req.params.eventId - Event ID
 * @returns {Array} List of occupied seat IDs
 */
app.get('/tickets/occupied/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/occupied/${eventId}`);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

/**
 * Purchase tickets endpoint
 * @route POST /tickets/purchase
 * @param {Object} req.body - Ticket purchase data
 * @param {string} req.body.eventId - Event ID
 * @param {Array} req.body.seats - Selected seats
 * @param {Object} req.body.buyerInfo - Buyer information
 * @param {string} req.body.paymentMethod - Payment method
 * @returns {Object} Purchase confirmation with ticket details
 */
app.post('/tickets/purchase', async (req, res) => {
  try {
    const ticketResponse = await axios.post(`${ticketServiceUrl}/tickets/purchase`, req.body);
    res.json(ticketResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Get detailed tickets for a user
 * @route GET /tickets/user/:userId/details
 * @param {string} req.params.userId - User ID
 * @param {Object} [req.query] - Query parameters for filtering
 * @returns {Array} Detailed ticket information for the user
 */
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

/**
 * Get tickets for a user
 * @route GET /tickets/user/:userId
 * @param {string} req.params.userId - User ID
 * @param {Object} [req.query] - Query parameters for filtering
 * @returns {Array} List of tickets for the user
 */
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

/**
 * Get tickets for an event
 * @route GET /tickets/event/:eventId
 * @param {string} req.params.eventId - Event ID
 * @param {Object} [req.query] - Query parameters for filtering
 * @returns {Object} Ticket statistics and data for the event
 */
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

/**
 * Get specific ticket by ID
 * @route GET /tickets/:id
 * @param {string} req.params.id - Ticket ID
 * @returns {Object} Ticket details
 */
app.get('/tickets/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/${id}`);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

/**
 * Get QR code for a ticket
 * @route GET /tickets/:id/qr
 * @param {string} req.params.id - Ticket ID
 * @returns {Object} QR code data for the ticket
 */
app.get('/tickets/:id/qr', async (req, res) => {
  try {
      const { id } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/${id}/qr`);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

/**
 * Get events for a user's tickets
 * @route GET /tickets/user/:userId/events
 * @param {string} req.params.userId - User ID
 * @returns {Array} Events associated with user's tickets
 */
app.get('/tickets/user/:userId/events', async (req, res) => {
  try {
      const { userId } = req.params;
      const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/user/${userId}/events`);
      res.json(ticketResponse.data);
    } catch (error) {
      returnError(res, error);
    }
});

/**
 * Get administrator ticket statistics
 * @route GET /tickets/admin/statistics
 * @param {Object} [req.query] - Query parameters for filtering statistics
 * @returns {Object} Administrative ticket statistics
 */
app.get('/tickets/admin/statistics', async (req, res) => {
  try {
    const ticketResponse = await axios.get(`${ticketServiceUrl}/tickets/admin/statistics`, {
      params: req.query
    });
    res.json(ticketResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Delete all tickets for an event
 * @route DELETE /tickets/event/:eventId
 * @param {string} req.params.eventId - Event ID
 * @returns {Object} Deletion confirmation
 */
app.delete("/tickets/event/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const ticketResponse = await axios.delete(`${ticketServiceUrl}/tickets/event/${eventId}`);
    res.json(ticketResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Cancel/delete a specific ticket
 * @route DELETE /tickets/:id
 * @param {string} req.params.id - Ticket ID to cancel/delete
 * @returns {Object} Cancellation confirmation
 */
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

/**
 * Create a new event
 * @route POST /events
 * @param {Object} req.body - Event data
 * @param {string} req.body.name - Event name
 * @param {string} req.body.description - Event description
 * @param {string} req.body.date - Event date
 * @param {string} req.body.location - Location ID
 * @param {number} req.body.price - Event price
 * @param {string} req.body.type - Event type
 * @returns {Object} Created event data
 */
app.post("/events", largePayloadMiddleware ,async (req, res) => {
  try {
    const eventResponse = await axios.post(`${eventServiceUrl}/event`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Update an event
 * @route PUT /events/:eventId
 * @param {string} req.params.eventId - Event ID
 * @param {Object} req.body - Updated event data
 * @returns {Object} Updated event data
 */
app.put("/events/:eventId", largePayloadMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.put(`${eventServiceUrl}/events/${eventId}`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Update event image
 * @route PATCH /events/:eventId/image
 * @param {string} req.params.eventId - Event ID
 * @param {Object} req.body - Image data
 * @returns {Object} Updated event with new image
 */
app.patch("/events/:eventId/image", largePayloadMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.patch(`${eventServiceUrl}/events/${eventId}/image`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Get all events
 * @route GET /events
 * @returns {Array} List of all events with location data
 */
app.get("/events", async (req, res) => {
  try {
    const eventsResponse = await axios.get(`${eventServiceUrl}/events`);
    res.json(eventsResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Get specific event by ID
 * @route GET /events/:eventId
 * @param {string} req.params.eventId - Event ID
 * @returns {Object} Event details with location data
 */
app.get("/events/:eventId", async (req, res) => {
  try {
    const eventResponse = await axios.get(`${eventServiceUrl}/events/${req.params.eventId}`);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Manually update event states
 * @route POST /events/update-states
 * @param {Object} req.body - State update data
 * @returns {Object} State update confirmation
 */
app.post("/events/update-states", async (req, res) => {
  try {
    const eventResponse = await axios.post(`${eventServiceUrl}/events/update-states`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Get event statistics by state
 * @route GET /events/stats/states
 * @returns {Object} Event statistics grouped by state
 */
app.get("/events/stats/states", async (req, res) => {
  try {
    const eventResponse = await axios.get(`${eventServiceUrl}/events/stats/states`);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Change event state
 * @route PATCH /events/:eventId/state
 * @param {string} req.params.eventId - Event ID
 * @param {Object} req.body - New state data
 * @returns {Object} Updated event with new state
 */
app.patch("/events/:eventId/state", async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.patch(`${eventServiceUrl}/events/${eventId}/state`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Update seat blocks for an event
 * @route PUT /events/:eventId/seat-blocks
 * @param {string} req.params.eventId - Event ID
 * @param {Object} req.body - Seat block data
 * @returns {Object} Updated seat blocks
 */
app.put("/events/:eventId/seat-blocks", async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.put(`${eventServiceUrl}/events/${eventId}/seat-blocks`, req.body);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Delete an event
 * @route DELETE /events/:eventId
 * @param {string} req.params.eventId - Event ID
 * @returns {Object} Deletion confirmation
 */
app.delete("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventResponse = await axios.delete(`${eventServiceUrl}/events/${eventId}`);
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Cancel an event (only by creator admin)
 * @route DELETE /events/:eventId/cancel
 * @param {string} req.params.eventId - Event ID
 * @param {Object} req.body - Cancellation data
 * @returns {Object} Cancellation confirmation
 */
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

/**
 * Get event statistics with sales data
 * @route GET /events/admin/statistics
 * @param {Object} [req.query] - Query parameters for filtering statistics
 * @returns {Object} Event statistics with sales information
 */
app.get("/events/admin/statistics", async (req, res) => {
  try {
    const eventResponse = await axios.get(`${eventServiceUrl}/events/admin/statistics`, {
      params: req.query
    });
    res.json(eventResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

// **Location Routes**

/**
 * Create a new location
 * @route POST /location
 * @param {Object} req.body - Location data
 * @param {string} req.body.name - Location name
 * @param {string} req.body.category - Location category
 * @param {string} req.body.address - Location address
 * @param {string} [req.body.seatMapId] - Associated seatmap ID
 * @param {number} [req.body.capacity] - Location capacity
 * @returns {Object} Created location data
 */
app.post("/location", async (req, res) => {
  try {
    const locationResponse = await axios.post(`${locationServiceUrl}/location`, req.body);
    res.json(locationResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Get all locations
 * @route GET /locations
 * @returns {Array} List of all locations
 */
app.get("/locations", async (req, res) => {
  try {
    const locationsResponse = await axios.get(`${locationServiceUrl}/locations`);
    res.json(locationsResponse.data);
  } catch (error) {
    returnError(res, error);
  }
});

/**
 * Get specific location by ID
 * @route GET /locations/:locationId
 * @param {string} req.params.locationId - Location ID
 * @returns {Object} Location details
 */
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