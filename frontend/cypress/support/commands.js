// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comandos personalizados para TicketApp

/**
 * Login como usuario normal
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 */
Cypress.Commands.add('loginAsUser', (username = 'testuser', password = 'TestPass123') => {
  // Interceptar la verificación de token para que devuelva role: user
  cy.intercept('POST', '**/verifyToken', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        role: 'user',
        userId: '507f1f77bcf86cd799439012'
      }
    });
  }).as('verifyTokenUser');

  cy.visit('/login');
  cy.get('[data-cy="username-input"]').type(username);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('not.include', '/login');
});

/**
 * Login como administrador
 * @param {string} username - Nombre de usuario admin
 * @param {string} password - Contraseña admin
 */
Cypress.Commands.add('loginAsAdmin', (username = 'admin', password = 'AdminPass123') => {
  // Interceptar la llamada de login para devolver respuesta de admin
  cy.intercept('POST', '**/login', (req) => {
    req.reply({
      fixture: 'login-admin.json'
    });
  }).as('loginAdmin');

  // Interceptar la verificación de token para que devuelva role: admin
  cy.intercept('POST', '**/verifyToken', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        role: 'admin',
        userId: '507f1f77bcf86cd799439011'
      }
    });
  }).as('verifyToken');

  cy.visit('/login');
  cy.get('[data-cy="username-input"]').type(username);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="login-button"]').click();

  // Esperar a que se complete la llamada de login
  cy.wait('@loginAdmin');

  // Después del login, debe redirigir al home
  cy.url().should('include', '/');
  cy.url().should('not.include', '/login');

  // Esperar a que la verificación del token se complete y el navbar se actualice
  cy.wait('@verifyToken');

  // Esperar a que el navbar cargue el enlace de admin
  cy.get('[data-cy="admin-link"]', { timeout: 10000 }).should('be.visible');
});

/**
 * Registro de nuevo usuario
 * @param {Object} userData - Datos del usuario
 */
Cypress.Commands.add('registerUser', (userData = {}) => {
  const defaultUser = {
    name: 'Test',
    surname: 'User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPass123',
    confirmPassword: 'TestPass123'
  };
  
  const user = { ...defaultUser, ...userData };
  
  cy.visit('/register');
  cy.get('[data-cy="name-input"]').type(user.name);
  cy.get('[data-cy="surname-input"]').type(user.surname);
  cy.get('[data-cy="username-input"]').type(user.username);
  cy.get('[data-cy="email-input"]').type(user.email);
  cy.get('[data-cy="password-input"]').type(user.password);
  cy.get('[data-cy="confirm-password-input"]').type(user.confirmPassword);
  cy.get('[data-cy="register-button"]').click();
});

/**
 * Navegar a un evento específico
 * @param {string} eventId - ID del evento
 */
Cypress.Commands.add('visitEvent', (eventId) => {
  cy.visit(`/event/${eventId}`);
});

/**
 * Seleccionar asientos en el mapa de asientos
 * @param {Array} seats - Array de asientos a seleccionar
 */
Cypress.Commands.add('selectSeats', (seats) => {
  seats.forEach(seat => {
    cy.get(`[data-cy="seat-${seat.sectionId}-${seat.row}-${seat.seat}"]`).click();
  });
});

/**
 * Completar información del comprador
 * @param {Object} buyerInfo - Información del comprador
 */
Cypress.Commands.add('fillBuyerInfo', (buyerInfo = {}) => {
  const defaultInfo = {
    name: 'Test Buyer',
    email: 'buyer@example.com',
    phone: '123456789'
  };
  
  const info = { ...defaultInfo, ...buyerInfo };
  
  cy.get('[data-cy="buyer-name"]').type(info.name);
  cy.get('[data-cy="buyer-email"]').type(info.email);
  cy.get('[data-cy="buyer-phone"]').type(info.phone);
});

/**
 * Completar método de pago
 * @param {Object} paymentInfo - Información de pago
 */
Cypress.Commands.add('fillPaymentInfo', (paymentInfo = {}) => {
  const defaultPayment = {
    method: 'credit_card',
    cardNumber: '4111111111111111',
    expiryDate: '12/25',
    cvv: '123',
    cardholderName: 'Test User'
  };
  
  const payment = { ...defaultPayment, ...paymentInfo };
  
  cy.get('[data-cy="payment-method"]').select(payment.method);
  cy.get('[data-cy="card-number"]').type(payment.cardNumber);
  cy.get('[data-cy="expiry-date"]').type(payment.expiryDate);
  cy.get('[data-cy="cvv"]').type(payment.cvv);
  cy.get('[data-cy="cardholder-name"]').type(payment.cardholderName);
});

/**
 * Esperar a que la aplicación esté lista
 */
Cypress.Commands.add('waitForAppReady', () => {
  cy.get('[data-cy="app-loading"]', { timeout: 10000 }).should('not.exist');
});

/**
 * Limpiar datos de test
 */
Cypress.Commands.add('cleanupTestData', () => {
  // Limpiar localStorage
  cy.clearLocalStorage();
  
  // Limpiar cookies
  cy.clearCookies();
  
  // Limpiar sessionStorage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

/**
 * Interceptar llamadas a la API
 */
Cypress.Commands.add('interceptAPI', () => {
  // Interceptar llamadas a servicios
  cy.intercept('GET', '**/events/**', { fixture: 'events.json' }).as('getEvents');
  cy.intercept('POST', '**/tickets/purchase', { fixture: 'ticket-purchase.json' }).as('purchaseTicket');
  cy.intercept('GET', '**/locations/**', { fixture: 'locations.json' }).as('getLocations');
  cy.intercept('POST', '**/login', { fixture: 'login.json' }).as('login');
  cy.intercept('POST', '**/adduser', { fixture: 'register.json' }).as('register');
});

/**
 * Verificar que un elemento es visible y clickeable
 * @param {string} selector - Selector del elemento
 */
Cypress.Commands.add('shouldBeVisibleAndClickable', (selector) => {
  cy.get(selector).should('be.visible');
  cy.get(selector).should('not.be.disabled');
});

/**
 * Verificar mensaje de error
 * @param {string} message - Mensaje de error esperado
 */
Cypress.Commands.add('shouldShowError', (message) => {
  cy.get('[data-cy="error-message"]').should('contain', message);
});

/**
 * Verificar mensaje de éxito
 * @param {string} message - Mensaje de éxito esperado
 */
Cypress.Commands.add('shouldShowSuccess', (message) => {
  cy.get('[data-cy="success-message"]').should('contain', message);
});
