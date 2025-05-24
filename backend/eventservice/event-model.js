import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['football', 'cinema', 'concert'],
    required: true
  },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true 
  },
  state: { type: String, 
    enum: ['activo', 'proximo', 'finalizado','cancelado'],
    required: true
  },
  image: { type: String, default: "/images/default.jpg" }
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

export default Event;

