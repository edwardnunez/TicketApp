import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sectionId: { type: String, required: true },
  row: { type: Number, required: true },
  seat: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedSeats: [seatSchema],
  ticketType: { type: String, enum: ['general', 'vip'], default: 'general' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  purchasedAt: { type: Date, default: Date.now }
});

ticketSchema.index({ eventId: 1, 'selectedSeats.id': 1, status: 1 });


const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
