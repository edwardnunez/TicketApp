import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Ticket from "./ticket-model.js";
import jwt from 'jsonwebtoken';
import axios from 'axios';

const app = express();
const port = 8002;

app.use(express.json());
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

app.get("/tickets/user/:userId/details", async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.params.userId });

    // Obtener info de cada evento
    const detailedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          const eventRes = await axios.get(`http://event-service:8003/events/${ticket.eventId}`);
          return { ...ticket.toObject(), event: eventRes.data };
        } catch (e) {
          return { ...ticket.toObject(), event: null };
        }
      })
    );

    res.status(200).json(detailedTickets);
  } catch (error) {
    console.error("Error fetching detailed tickets", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

server.on("close", () => mongoose.connection.close());

export default server;