import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['stadium', 'cinema', 'concert'],
    required: true
  },
  address: { type: String, required: true },
  capacity: { type: Number, required: false },
  hasSeatingMap: { type: Boolean, default: false }
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

export default Location;
