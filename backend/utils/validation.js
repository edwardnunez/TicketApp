/**
 * Utilidades de validación para pruebas unitarias
 */

/**
 * Validates email format using regex pattern
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates event date is in the future
 * @param {string} dateString - Date string to validate
 * @returns {Object} Validation result
 */
function validateEventDate(dateString) {
  // Check for invalid date string first
  if (!dateString || dateString === '' || dateString === null || dateString === undefined) {
    return {
      isValid: false,
      error: "Invalid date format"
    };
  }
  
  const eventDate = new Date(dateString);
  const now = new Date();
  
  if (isNaN(eventDate.getTime())) {
    return {
      isValid: false,
      error: "Invalid date format"
    };
  }
  
  if (eventDate <= now) {
    return {
      isValid: false,
      error: "Event date must be in the future"
    };
  }
  
  return {
    isValid: true
  };
}

/**
 * Validates ticket quantity
 * @param {number} quantity - Quantity to validate
 * @returns {Object} Validation result
 */
function validateTicketQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 6) {
    return {
      isValid: false,
      error: "Quantity must be between 1 and 6"
    };
  }
  
  return {
    isValid: true
  };
}

/**
 * Validates event capacity
 * @param {Object} event - Event object with capacity and soldTickets
 * @returns {Object} Validation result
 */
function validateEventCapacity(event) {
  const { capacity, soldTickets } = event;
  
  if (soldTickets > capacity) {
    return {
      isValid: false,
      error: "Sold tickets exceed event capacity"
    };
  }
  
  return {
    isValid: true
  };
}

/**
 * Validates required fields in an object
 * @param {Object} data - Object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
function validateRequiredFields(data, requiredFields) {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!(field in data) || data[field] === null || data[field] === undefined || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return {
    isValid: true
  };
}

module.exports = {
  validateEmailFormat,
  validatePassword,
  validateEventDate,
  validateTicketQuantity,
  validateEventCapacity,
  validateRequiredFields
};
