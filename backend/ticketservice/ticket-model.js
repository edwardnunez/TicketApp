import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sectionId: { type: String, required: true },
  row: { type: Number, required: false },
  seat: { type: Number, required: false },
  price: { type: Number, required: true },
  isGeneralAdmission: { type: Boolean, default: false }
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedSeats: [seatSchema], // Ahora incluye tanto asientos numerados como de pista
  ticketType: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  
  //QR info
  qrCode: { type: String, required: true, unique: true },
  ticketNumber: { type: String, required: true, unique: true },
  validationCode: { type: String, required: true },

  purchasedAt: { type: Date, default: Date.now }
});

// Índices para mejorar el rendimiento
ticketSchema.index({ eventId: 1, 'selectedSeats.id': 1, status: 1 });
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ ticketNumber: 1 }, { unique: true });
ticketSchema.index({ qrCode: 1 }, { unique: true });


const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
