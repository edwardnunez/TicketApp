import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  row: String,
  number: Number,
  isReserved: Boolean,
  category: { type: String, enum: ['normal', 'vip', 'disabled'], default: 'normal' }
});

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['stadium', 'cinema', 'concert'],
    required: true
  },
  address: { type: String, required: true },
  capacity: { type: Number, required: false },
  seatMapId: { type: String, required: true },
  seatingMap: [[seatSchema]]
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

export default Location;
