import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Event from "./event-model.js";

const app = express();
const port = 8003;

app.use(express.json());

app.use(cors({ origin: "http://localhost:8003" }));

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/eventdb";
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Create a new event
app.post("/event", async (req, res) => {
  try {
    const { name, date, location} = req.body;
    if (!name || !date || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newEvent = new Event({
      name,
      date,
      location
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Get events
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    if (!events) return res.status(404).json({ error: "No events found" });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get event by ID
app.get("/events/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const server = app.listen(port, () => {
  console.log(`Event Service listening at http://localhost:${port}`);
});

server.on("close", () => mongoose.connection.close());
export default server;
