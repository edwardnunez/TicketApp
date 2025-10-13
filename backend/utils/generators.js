/**
 * Utilidades de generación para pruebas unitarias
 */

const crypto = require('crypto');

/**
 * Generates a unique ticket number
 * @returns {string} Unique ticket number
 */
function generateTicketNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TKT-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generates a validation code for ticket verification
 * @returns {string} Hexadecimal validation code
 */
function generateValidationCode() {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

/**
 * Generates QR data for a ticket
 * @param {Object} ticket - Ticket object
 * @returns {string} JSON string with QR data
 */
function generateQRData(ticket) {
  return JSON.stringify({
    ticketId: ticket._id,
    ticketNumber: ticket.ticketNumber,
    eventId: ticket.eventId,
    userId: ticket.userId,
    validationCode: ticket.validationCode,
    purchaseDate: ticket.purchasedAt,
    status: ticket.status,
    quantity: ticket.quantity,
    seats: ticket.selectedSeats || []
  });
}

/**
 * Generates a random string of specified length
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a purchase ID
 * @param {string} ticketId - Ticket ID
 * @returns {string} Purchase ID
 */
function generatePurchaseId(ticketId) {
  const idString = ticketId.toString();
  const suffix = idString.length >= 8 
    ? idString.slice(-8).toUpperCase()
    : idString.padStart(8, '0').toUpperCase();
  return `TKT-${suffix}`;
}

module.exports = {
  generateTicketNumber,
  generateValidationCode,
  generateQRData,
  generateRandomString,
  generatePurchaseId
};
