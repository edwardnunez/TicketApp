import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['stadium', 'cinema', 'concert', 'theater', 'festival'], 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  capacity: { 
    type: Number, 
    required: false 
  },
  seatMapId: { 
    type: String, 
    required: false 
  },
}, {
  timestamps: true
});

const Location = mongoose.model('Location', locationSchema);

export default Location;