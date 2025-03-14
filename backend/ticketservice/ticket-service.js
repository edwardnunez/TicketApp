const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // Fetch event details
const Ticket = require("./ticket-model");

const app = express();
const port = 8002;

app.use(express.json());
const cors = require("cors");
app.use(cors({ origin: "http://localhost:8002" }));

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ticketdb";
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, "your-secret-key", (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.userId = decoded.userId;
    next();
  });
};

// Create a new ticket (purchase process)
app.post("/tickets", authenticateUser, async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    if (!eventId || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch event details from Events Microservice
    const eventResponse = await axios.get(`http://events-service:8003/events/${eventId}`);
    const event = eventResponse.data;

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Store the ticket with the event price at purchase time
    const newTicket = new Ticket({
      userId: req.userId,
      eventId,
      quantity,
      price: event.price, // Store the price from the Events Microservice
    });

    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get tickets for a user
app.get("/tickets/user/:userId", async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.params.userId });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const server = app.listen(port, () => {
  console.log(`Tickets Service listening at http://localhost:${port}`);
});

server.on("close", () => mongoose.connection.close());
module.exports = server;