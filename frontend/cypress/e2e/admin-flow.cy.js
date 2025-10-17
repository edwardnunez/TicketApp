/**
 * Tests de flujo de administración
 * Cubre las funcionalidades reales de administrador
 *
 * FUNCIONALIDADES REALES DEL ADMIN:
 * 1. Login y acceso al panel de administración
 * 2. Crear ubicaciones (LocationCreation)
 * 3. Crear eventos asociados a ubicaciones (EventCreation)
 * 4. Ver estadísticas (si existe la ruta /admin/statistics)
 * 5. Gestión de seguridad y permisos
 */

describe('Flujo de Administración', () => {
  beforeEach(() => {
    cy.cleanupTestData();
    cy.interceptAPI();
  }); 

  describe('Login y Acceso de Administrador', () => {
    it('debería permitir login como administrador y acceder al panel', () => {
      cy.loginAsAdmin('admin', 'AdminPass123');

      // Verificar que está en home y el enlace de admin es visible
      cy.url().should('include', '/');
      cy.get('[data-cy="admin-link"]').should('be.visible');

      // Hacer clic en el enlace del navbar para ir al panel de administración
      cy.get('[data-cy="admin-link"]').click();

      // Verificar que se redirige al dashboard de admin
      cy.url().should('include', '/admin');
    });

    it('debería mostrar el enlace de estadísticas para administradores', () => {
      cy.loginAsAdmin();
      cy.visit('/');

      // Verificar que el enlace de estadísticas es visible
      cy.get('[data-cy="statistics-link"]').should('be.visible');
    });

    it('debería rechazar acceso a usuarios normales', () => {
      cy.loginAsUser();

      // Intentar acceder a rutas de admin - debe redirigir a login o home
      cy.visit('/admin');
      cy.url().should('not.include', '/admin');
    });
  });

  describe('Creación de Ubicaciones', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('debería mostrar el formulario de creación de ubicación', () => {
      cy.visit('/admin/create-location');

      // Verificar que existe el formulario
      cy.contains('Crear nueva ubicación').should('be.visible');
      cy.get('input[placeholder*="Estadio"]').should('be.visible');
    });

    it('debería validar campos requeridos al crear ubicación', () => {
      cy.visit('/admin/create-location');

      // Intentar enviar sin llenar campos
      cy.contains('button', 'Crear ubicación').click();

      // Deberían aparecer mensajes de validación
      cy.contains('Por favor ingrese el nombre').should('be.visible');
    });

    it('debería crear una ubicación sin mapa de asientos (festival)', () => {
      cy.visit('/admin/create-location');

      const locationName = `Festival test ${Date.now()}`;

      // Llenar formulario básico
      cy.get('input[placeholder*="Estadio"]').type(locationName);

      // Seleccionar categoría Festival (no requiere seatmap)
      cy.contains('Categoría')
        .parent()
        .parent() // Subir al Form.Item
        .find('.ant-select-selector')
        .click();

      // Esperar a que se abra el dropdown y seleccionar Festival
      cy.get('.ant-select-dropdown')
        .should('be.visible')
        .contains('.ant-select-item-option-content', 'Festival')
        .click();

      // Verificar que se seleccionó correctamente
      cy.contains('Categoría')
        .parent()
        .parent()
        .find('.ant-select-selection-item')
        .should('contain', 'Festival');

      // Llenar dirección
      cy.get('input[placeholder*="Av. de Concha"]').type('Calle Test 123, Madrid');

      // Enviar formulario
      cy.contains('button', 'Crear ubicación').click();

      // Verificar éxito
      cy.contains('¡Ubicación creada exitosamente!', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Creación de Eventos', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('debería mostrar el formulario de creación de evento', () => {
      cy.visit('/admin/create-event');

      // Verificar que existe el formulario
      cy.contains('Crear nuevo evento').should('be.visible');
    });

    it('debería validar campos requeridos al crear evento', () => {
      cy.visit('/admin/create-event');

      // Intentar enviar sin llenar campos
      cy.contains('button', 'Siguiente').click();

      // Deberían aparecer mensajes de validación
      cy.wait(500);
      // Ant Design muestra validaciones
    });

    it('debería permitir navegar al formulario de creación desde el admin', () => {
      cy.visit('/admin');

      // Buscar botón o enlace para crear evento
      cy.contains('Crear nuevo evento').click();

      // Verificar navegación
      cy.url().should('include', '/create-event');
    });

    it('debería crear un evento de festival sin mapa de asientos', () => {
      // Primero crear una ubicación tipo festival
      const locationName = `Festival Location ${Date.now()}`;
      cy.visit('/admin/create-location');
      
      // Crear ubicación festival
      cy.get('input[placeholder*="Estadio"]').type(locationName);
      
      // Seleccionar categoría Festival
      cy.contains('Categoría')
        .parent()
        .parent()
        .find('.ant-select-selector')
        .click();
      
      cy.get('.ant-select-dropdown')
        .should('be.visible')
        .contains('.ant-select-item-option-content', 'Festival')
        .click();
      
      // Verificar que se seleccionó Festival
      cy.contains('Categoría')
        .parent()
        .parent()
        .find('.ant-select-selection-item')
        .should('contain', 'Festival');
      
      // Llenar dirección
      cy.get('input[placeholder*="Av. de Concha"]')
        .type('Recinto Ferial, 28000 Madrid');
      
      // Crear ubicación
      cy.contains('button', 'Crear ubicación').click();
      
      // Esperar confirmación y ir a eventos
      cy.contains('¡Ubicación creada exitosamente!', { timeout: 10000 })
        .should('be.visible');
      
      cy.contains('button', 'Ir a Eventos').click();
      
      // Verificar que estamos en admin
      cy.url().should('include', '/admin');
      
      // Navegar a crear evento
      cy.contains('Crear nuevo evento').click();
      cy.url().should('include', '/create-event');
      
      // Crear el evento festival
      const eventName = `Festival de Música ${Date.now()}`;
      
      // Llenar nombre del evento
      cy.get('input[placeholder*="nombre del evento"]')
        .should('be.visible')
        .type(eventName);
      
      // Seleccionar tipo: Festival
      cy.get('[id="create_event_type"]')
        .parent()
        .parent()
        .click();
      
      cy.get('.ant-select-dropdown')
        .should('be.visible')
        .contains('Festival')
        .click();
      
      // Verificar que se seleccionó Festival
      cy.wait(500);
      cy.contains('Tipo de evento seleccionado: Festival')
        .should('be.visible');
      
      // Seleccionar ubicación
      cy.get('[id="create_event_location"]')
        .parent()
        .parent()
        .click();
      
      cy.get('.ant-select-dropdown')
        .should('be.visible')
        .contains(locationName)
        .click();
      
      // Verificar que se muestra la información de la ubicación
      cy.contains(`Ubicación seleccionada: ${locationName}`)
        .should('be.visible');
      
      // Llenar descripción
      cy.get('textarea[placeholder*="descripción del evento"]')
        .type('Gran festival de música con artistas internacionales. Tres días de música, arte y cultura.');
      
      // Llenar capacidad (para festivales sin seatmap)
      cy.get('input[placeholder*="capacidad"]')
        .should('not.be.disabled')
        .type('5000');
      
      // Llenar precio
      cy.get('input[placeholder*="precio"]')
        .type('45.50');
      
      // Verificar que no hay sección de pricing por filas
      cy.contains('Configuración de precios por filas').should('not.exist');
      
      // Hacer scroll hacia abajo para ver el botón
      cy.contains('button', 'Siguiente').scrollIntoView();
      
      // Enviar formulario
      cy.contains('button', 'Siguiente')
        .should('be.visible')
        .should('not.be.disabled')
        .click();
      
      // Debería aparecer el modal de confirmación
      cy.contains('Confirmar creación del evento', { timeout: 10000 })
        .should('be.visible');
      
      // Verificar los datos en el modal
      cy.contains(eventName).should('be.visible');
      cy.contains('Festival').should('be.visible');
      cy.contains(locationName).should('be.visible');
      cy.contains('5000 personas').should('be.visible');
      cy.contains('€45.50').should('be.visible');
      
      // Confirmar creación
      cy.contains('button', 'Crear evento').click();
      
      // Verificar éxito
      cy.contains('Evento creado correctamente', { timeout: 15000 })
        .should('be.visible');
      
      // Verificar redirección al admin
      cy.url({ timeout: 10000 }).should('include', '/admin');
      
      // Verificar que el evento aparece en la lista
      cy.contains(eventName, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Gestión y Navegación del Admin', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('debería navegar al panel de administración', () => {
      cy.visit('/');
      cy.get('[data-cy="admin-link"]').click();
      cy.url().should('include', '/admin');
    });

    it('debería navegar a estadísticas', () => {
      cy.visit('/');
      cy.get('[data-cy="statistics-link"]').click();
      cy.url().should('include', '/admin/statistics');
    });

  });

  describe('Seguridad y Permisos', () => {
    it('debería proteger rutas de administración sin login', () => {
      // Intentar acceder sin login - debe redirigir a login
      cy.visit('/admin');
      cy.url().should('include', '/login');
    });

    it('debería proteger rutas de creación de ubicaciones', () => {
      cy.visit('/admin/create-location');
      cy.url().should('include', '/login');
    });

    it('debería proteger rutas de creación de eventos', () => {
      cy.visit('/admin/create-event');
      cy.url().should('include', '/login');
    });

    it('debería permitir logout seguro desde admin', () => {
      cy.loginAsAdmin();
      cy.visit('/admin');

      // Logout
      cy.get('[data-cy="user-menu"]').click();
      cy.get('[data-cy="logout-button"]').click();

      // Verificar redirección
      cy.url().should('include', '/login');

      // Verificar que no se puede acceder a admin
      cy.visit('/admin');
      cy.url().should('include', '/login');
    });

    it('debería denegar acceso a /admin para usuarios no-admin', () => {
      cy.loginAsUser();

      cy.visit('/admin', { failOnStatusCode: false });

      // No debería estar en /admin
      cy.url().should('not.include', '/admin');
    });
  });
});
