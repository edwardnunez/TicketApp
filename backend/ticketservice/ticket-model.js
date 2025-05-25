import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ticketType: { type: String, enum: ['general', 'vip'], default: 'general' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  seatNumbers: [{ type: String }],
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  purchasedAt: { type: Date, default: Date.now }
});


const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
