/**
 * Lógica de negocio para pruebas unitarias
 */

/**
 * Checks if a seat is available
 * @param {string} seatId - Seat identifier
 * @param {string[]} occupiedSeats - Array of occupied seat IDs
 * @returns {boolean} True if seat is available
 */
function isSeatAvailable(seatId, occupiedSeats) {
  return !occupiedSeats.includes(seatId);
}

/**
 * Calculates seat price based on section and pricing rules
 * @param {Object} seatInfo - Seat information
 * @param {string} seatInfo.sectionId - Section ID
 * @param {number} seatInfo.row - Row number
 * @param {number} seatInfo.seat - Seat number
 * @param {number} seatInfo.basePrice - Base price
 * @param {number} seatInfo.sectionMultiplier - Section price multiplier
 * @returns {number} Calculated seat price
 */
function calculateSeatPrice(seatInfo) {
  const { basePrice, sectionMultiplier = 1.0 } = seatInfo;
  return Math.round(basePrice * sectionMultiplier);
}

/**
 * Calculates total price for multiple seats
 * @param {Object[]} seats - Array of seat objects with price property
 * @returns {number} Total price
 */
function calculateTotalPrice(seats) {
  return seats.reduce((total, seat) => total + (seat.price || 0), 0);
}

/**
 * Formats date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const d = new Date(date);
  const day = d.getUTCDate().toString().padStart(2, '0');
  const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = d.getUTCFullYear();
  const hours = d.getUTCHours().toString().padStart(2, '0');
  const minutes = d.getUTCMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Sanitizes input to prevent XSS attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates if event type is valid
 * @param {string} eventType - Event type to validate
 * @returns {boolean} True if event type is valid
 */
function isValidEventType(eventType) {
  const validTypes = ['concert', 'theater', 'sports', 'conference', 'festival'];
  return validTypes.includes(eventType);
}

/**
 * Validates if location category is valid
 * @param {string} category - Location category to validate
 * @returns {boolean} True if category is valid
 */
function isValidLocationCategory(category) {
  const validCategories = ['stadium', 'theater', 'conference_center', 'arena', 'outdoor'];
  return validCategories.includes(category);
}

/**
 * Checks if two events have time conflict
 * @param {Object} event1 - First event
 * @param {Object} event2 - Second event
 * @returns {boolean} True if events conflict
 */
function hasTimeConflict(event1, event2) {
  const date1 = new Date(event1.date);
  const date2 = new Date(event2.date);
  
  // Check if events are on the same day
  const sameDay = date1.toDateString() === date2.toDateString();
  
  if (!sameDay) return false;
  
  // Check if time difference is less than 4 hours (assuming events last 3 hours)
  const timeDiff = Math.abs(date1.getTime() - date2.getTime());
  const fourHours = 4 * 60 * 60 * 1000;
  
  return timeDiff < fourHours;
}

module.exports = {
  isSeatAvailable,
  calculateSeatPrice,
  calculateTotalPrice,
  formatDate,
  sanitizeInput,
  isValidEventType,
  isValidLocationCategory,
  hasTimeConflict
};
