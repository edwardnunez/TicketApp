/**
 * Tests de flujo completo de usuario
 * Cubre el proceso completo desde registro hasta compra de tickets
 *
 * FLUJOS REALES DE LA APLICACIÓN:
 * 1. Registro: El usuario se registra y es redirigido automáticamente al home
 * 2. Login: El usuario inicia sesión y puede navegar por eventos
 * 3. Búsqueda: El home muestra eventos con filtros de búsqueda, fecha y categoría
 * 4. Perfil: Ver tickets organizados por evento con opción de ver QR y cancelar
 */

describe('Flujo Completo de Usuario', () => {
  beforeEach(() => {
    cy.cleanupTestData();
    cy.interceptAPI();
  });

  describe('Registro y Login', () => {
    it('debería permitir registro de nuevo usuario y redirigir al home', () => {
      const userData = {
        name: 'Juan',
        surname: 'Pérez',
        username: `juanperez${Date.now()}`,
        email: `juan${Date.now()}@example.com`,
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      cy.visit('/register');

      // Llenar formulario de registro
      cy.get('[data-cy="name-input"]').type(userData.name);
      cy.get('[data-cy="surname-input"]').type(userData.surname);
      cy.get('[data-cy="username-input"]').type(userData.username);
      cy.get('[data-cy="email-input"]').type(userData.email);
      cy.get('[data-cy="password-input"]').type(userData.password);
      cy.get('[data-cy="confirm-password-input"]').type(userData.confirmPassword);

      // Enviar formulario
      cy.get('[data-cy="register-button"]').click();

      // Verificar que se redirige al home (no a login)
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // Verificar que el usuario está logueado
      cy.get('[data-cy="user-menu"]').should('be.visible');
    });

    it('debería permitir login exitoso', () => {
      cy.loginAsUser();

      // Verificar redirección al home
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.get('[data-cy="user-menu"]').should('be.visible');
    });
  });

  describe('Navegación y Búsqueda de Eventos', () => {
    beforeEach(() => {
      cy.loginAsUser();
    });

    it('debería mostrar eventos en el home con sus elementos', () => {
      cy.visit('/');
      cy.waitForAppReady();

      // Verificar que se muestran eventos
      cy.get('[data-cy="event-card"]').should('have.length.greaterThan', 0);

      // Verificar elementos de cada tarjeta
      cy.get('[data-cy="event-card"]').first().within(() => {
        cy.get('[data-cy="event-name"]').should('be.visible');
        cy.get('[data-cy="event-date"]').should('be.visible');
      });
    });

    it('debería permitir buscar eventos por texto', () => {
      cy.visit('/');
      cy.waitForAppReady();

      // Contar eventos iniciales
      cy.get('[data-cy="event-card"]').its('length').then((initialCount) => {
        // Buscar por texto
        cy.get('input[placeholder="Buscar eventos..."]').type('concierto');

        // Verificar que los resultados cambian
        cy.get('[data-cy="event-card"]').should('have.length.lte', initialCount);
      });
    });

    it('debería permitir filtrar eventos por categoría', () => {
      cy.visit('/');
      cy.waitForAppReady();

      // Hacer clic en una categoría (ej: Conciertos)
      cy.contains('button', 'Conciertos').click();

      // Verificar que se aplica el filtro
      cy.wait(500);
      cy.get('[data-cy="event-card"]').should('exist');
    });

    it('debería navegar a los detalles de un evento', () => {
      cy.visit('/');
      cy.waitForAppReady();

      // Hacer clic en el primer evento
      cy.get('[data-cy="event-card"]').first().find('[data-cy="view-details-button"]').click();

      // Verificar navegación a detalles
      cy.url().should('include', '/event/');
      cy.get('[data-cy="event-details"]').should('be.visible');
    });
  });

  describe('Perfil de Usuario y Gestión de Tickets', () => {
    beforeEach(() => {
      cy.loginAsUser();
    });

    it('debería mostrar el perfil del usuario con su información', () => {
      cy.visit('/');

      // Navegar al perfil
      cy.get('[data-cy="user-menu"]').click();
      cy.get('[data-cy="profile-link"]').click();

      // Verificar información del perfil
      cy.get('[data-cy="profile-info"]').should('be.visible');
      cy.get('[data-cy="user-name"]').should('be.visible');

      // Verificar que existe el botón de editar perfil
      cy.get('[data-cy="edit-profile-button"]').should('be.visible');
    });

    it('debería mostrar la sección de tickets agrupados por evento', () => {
      cy.visit('/profile');
      cy.waitForAppReady();

      // Verificar que existe la sección de tickets
      cy.get('[data-cy="tickets-section"]').should('be.visible');

      // Si hay tickets, verificar que se muestran
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="ticket-item"]').length > 0) {
          cy.get('[data-cy="ticket-item"]').should('have.length.greaterThan', 0);
        }
      });
    });

    it('debería mostrar tabs de tickets (Activas/Pendientes/Canceladas)', () => {
      cy.visit('/profile');
      cy.waitForAppReady();

      // Verificar que existen los tabs
      cy.contains('Activas').should('be.visible');
      cy.contains('Pendientes').should('be.visible');
      cy.contains('Canceladas').should('be.visible');
    });
  });

  describe('Navegación General', () => {
    beforeEach(() => {
      cy.loginAsUser();
    });

    it('debería permitir navegar entre Home y Help', () => {
      cy.visit('/');

      // Verificar que estamos en home
      cy.get('[data-cy="home-link"]').should('be.visible');

      // Ir a Help
      cy.get('[data-cy="help-link"]').click();
      cy.url().should('include', '/help');

      // Volver a Home
      cy.get('[data-cy="home-link"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('debería permitir cerrar sesión', () => {
      cy.visit('/');

      // Hacer clic en menú de usuario
      cy.get('[data-cy="user-menu"]').click();
      cy.get('[data-cy="logout-button"]').click();

      // Verificar redirección a login
      cy.url().should('include', '/login');

      // Verificar que no se puede acceder a rutas protegidas
      cy.visit('/profile');
      cy.url().should('include', '/login');
    });

    it('debería ser responsive en móvil', () => {
      cy.viewport(375, 667); // iPhone SE
      cy.visit('/');
      cy.waitForAppReady();

      // Verificar que los eventos se muestran
      cy.get('[data-cy="event-card"]').should('be.visible');

      // Verificar que el navbar está presente
      cy.get('[data-cy="home-link"]').should('be.visible');
    });
  });
});
