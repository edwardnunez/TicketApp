/**
 * @file Modelo de datos de Ticket para MongoDB
 * @module models/Ticket
 */

import mongoose from 'mongoose';

/**
 * Schema para información de asiento individual dentro de un ticket
 * @typedef {Object} SeatSchema
 * @property {string} id - Identificador único del asiento
 * @property {string} sectionId - Identificador de la sección
 * @property {number} row - Número de fila (opcional para entrada general)
 * @property {number} seat - Número de asiento (opcional para entrada general)
 * @property {number} price - Precio de este asiento
 * @property {boolean} isGeneralAdmission - Bandera que indica si es un asiento de entrada general
 */
const seatSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sectionId: { type: String, required: true },
  row: { type: Number, required: false },
  seat: { type: Number, required: false },
  price: { type: Number, required: true },
  isGeneralAdmission: { type: Boolean, default: false }
}, { _id: false });

/**
 * Definición del schema de Ticket
 * @typedef {Object} TicketSchema
 * @property {mongoose.Schema.Types.ObjectId} userId - Referencia al usuario que compró el ticket
 * @property {mongoose.Schema.Types.ObjectId} eventId - Referencia al evento
 * @property {SeatSchema[]} selectedSeats - Array de asientos seleccionados (numerados o entrada general)
 * @property {number} price - Precio total del ticket
 * @property {number} quantity - Número de tickets comprados
 * @property {string} status - Estado del ticket (pending, paid, cancelled)
 * @property {string} qrCode - Código QR único para validación del ticket
 * @property {string} ticketNumber - Número de ticket único
 * @property {string} validationCode - Código de validación para verificación manual
 * @property {Date} purchasedAt - Fecha y hora de compra
 */
const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedSeats: [seatSchema],
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },

  qrCode: { type: String, required: true, unique: true },
  ticketNumber: { type: String, required: true, unique: true },
  validationCode: { type: String, required: true },

  purchasedAt: { type: Date, default: Date.now }
});

/**
 * Índices de rendimiento para consultas eficientes
 */
ticketSchema.index({ eventId: 1, 'selectedSeats.id': 1, status: 1 });
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ ticketNumber: 1 }, { unique: true });
ticketSchema.index({ qrCode: 1 }, { unique: true });

/**
 * Modelo de Ticket para operaciones de base de datos
 * @type {mongoose.Model}
 */
const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
