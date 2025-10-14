# Tests de Sistema con Cypress - TicketApp

## Descripción

Este directorio contiene los tests de sistema (end-to-end) implementados con Cypress para la aplicación TicketApp. Los tests verifican flujos completos de usuario desde la perspectiva del usuario final.

## Estructura

```
frontend/
├── cypress/
│   ├── e2e/                    # Tests end-to-end
│   │   ├── user-flow.cy.js     # Flujo completo de usuario
│   │   ├── admin-flow.cy.js    # Flujo de administración
│   │   └── error-handling.cy.js # Manejo de errores
│   ├── component/              # Tests de componentes
│   │   └── SeatRenderer.cy.jsx # Test del componente SeatRenderer
│   ├── fixtures/               # Datos de prueba
│   │   ├── events.json
│   │   ├── locations.json
│   │   ├── login.json
│   │   ├── register.json
│   │   └── ticket-purchase.json
│   ├── support/                # Configuración y comandos
│   │   ├── e2e.js
│   │   ├── component.js
│   │   └── commands.js
│   └── screenshots/            # Capturas de pantalla (generadas)
│   └── videos/                 # Videos de tests (generados)
├── cypress.config.js           # Configuración de Cypress
└── package.json               # Scripts y dependencias
```

## Casos de Uso Cubiertos

### 1. Flujo Completo de Usuario (`user-flow.cy.js`)
- ✅ **Registro y Login**: Registro de nuevos usuarios y autenticación
- ✅ **Navegación**: Visualización de eventos y navegación entre páginas
- ✅ **Compra de Tickets**: Proceso completo de selección y compra
- ✅ **Gestión de Perfil**: Edición de perfil y historial de compras
- ✅ **Responsive Design**: Funcionalidad en dispositivos móviles

### 2. Flujo de Administración (`admin-flow.cy.js`)
- ✅ **Login de Admin**: Autenticación de administradores
- ✅ **Dashboard**: Estadísticas y métricas generales
- ✅ **Gestión de Eventos**: Creación, edición y cancelación
- ✅ **Gestión de Ubicaciones**: Creación y configuración
- ✅ **Estadísticas**: Reportes y exportación de datos
- ✅ **Gestión de Usuarios**: Lista y búsqueda de usuarios
- ✅ **Seguridad**: Protección de rutas y permisos

### 3. Manejo de Errores (`error-handling.cy.js`)
- ✅ **Errores de Red**: Conexión, timeouts y errores 500
- ✅ **Validaciones**: Formularios y datos inválidos
- ✅ **Permisos**: Acceso denegado y tokens expirados
- ✅ **Datos**: Eventos no encontrados y asientos ocupados
- ✅ **UI/UX**: Páginas 404 y formularios incompletos
- ✅ **Recuperación**: Reintentos y guardado de datos

### 4. Tests de Componentes (`SeatRenderer.cy.jsx`)
- ✅ **Renderizado**: Visualización correcta del componente
- ✅ **Interacciones**: Clics y hover en asientos
- ✅ **Estados**: Disponible, ocupado, seleccionado, bloqueado
- ✅ **Responsive**: Adaptación a dispositivos móviles
- ✅ **Accesibilidad**: Tooltips y navegación por teclado

## Comandos Personalizados

### Comandos de Usuario
```javascript
// Login como usuario
cy.loginAsUser('username', 'password');

// Login como administrador
cy.loginAsAdmin('admin', 'password');

// Registro de usuario
cy.registerUser({ name: 'Juan', email: 'juan@example.com' });
```

### Comandos de Navegación
```javascript
// Visitar evento específico
cy.visitEvent('event-id');

// Seleccionar asientos
cy.selectSeats([{ sectionId: 'vip', row: 1, seat: 1 }]);

// Llenar información del comprador
cy.fillBuyerInfo({ name: 'Juan', email: 'juan@example.com' });
```

### Comandos de Utilidad
```javascript
// Limpiar datos de test
cy.cleanupTestData();

// Interceptar llamadas API
cy.interceptAPI();

// Verificar mensajes de error/éxito
cy.shouldShowError('Mensaje de error');
cy.shouldShowSuccess('Mensaje de éxito');
```

## Ejecutar Tests

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Abrir Cypress en modo interactivo
npm run cypress:open

# Ejecutar tests en modo headless
npm run cypress:run

# Ejecutar tests con navegador específico
npm run cypress:run:chrome
npm run cypress:run:firefox
```

### CI/CD
```bash
# Ejecutar tests en CI
npm run test:e2e

# Ejecutar tests con reportes
npm run cypress:run -- --reporter junit --reporter-options "mochaFile=results/test-results.xml"
```

## Configuración

### Variables de Entorno
```javascript
// cypress.config.js
env: {
  API_BASE_URL: 'http://localhost:8000',
  USER_SERVICE_URL: 'http://localhost:8001',
  TICKET_SERVICE_URL: 'http://localhost:8002',
  EVENT_SERVICE_URL: 'http://localhost:8003',
  LOCATION_SERVICE_URL: 'http://localhost:8004'
}
```

### Fixtures (Datos de Prueba)
Los archivos en `cypress/fixtures/` contienen datos mock para los tests:
- `events.json`: Eventos de prueba
- `locations.json`: Ubicaciones de prueba
- `login.json`: Respuesta de login
- `register.json`: Respuesta de registro
- `ticket-purchase.json`: Respuesta de compra

## Selectores de Datos

### Convención de Selectores
Todos los elementos interactivos deben tener atributos `data-cy`:

```jsx
// Ejemplo de componente
<button data-cy="login-button">Login</button>
<input data-cy="username-input" type="text" />
<div data-cy="error-message">Error</div>
```

### Selectores Comunes
- `[data-cy="login-button"]` - Botón de login
- `[data-cy="username-input"]` - Campo de usuario
- `[data-cy="event-card"]` - Tarjeta de evento
- `[data-cy="seat-vip-1-1"]` - Asiento específico
- `[data-cy="error-message"]` - Mensaje de error
- `[data-cy="success-message"]` - Mensaje de éxito

## Reportes y Videos

### Screenshots
- Se capturan automáticamente en caso de fallo
- Ubicación: `cypress/screenshots/`

### Videos
- Se graban todos los tests por defecto
- Ubicación: `cypress/videos/`
- Configuración: `video: true` en `cypress.config.js`

### Reportes HTML
```bash
# Generar reporte HTML
npx cypress run --reporter html
```

## Integración con CI/CD

### GitHub Actions
El archivo `.github/workflows/cypress.yml` configura:
- ✅ Ejecución automática en push/PR
- ✅ Instalación de dependencias
- ✅ Inicio de servicios backend
- ✅ Ejecución de tests
- ✅ Subida de screenshots y videos

### Docker (Opcional)
```dockerfile
# Dockerfile para tests
FROM cypress/included:13.3.0
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "cypress:run"]
```

## Mejores Prácticas

### 1. Selectores Estables
- Usar `data-cy` en lugar de clases CSS
- Evitar selectores que cambien con el contenido

### 2. Datos de Prueba
- Usar fixtures para datos consistentes
- Limpiar datos entre tests

### 3. Timeouts
- Configurar timeouts apropiados
- Usar `cy.wait()` para operaciones asíncronas

### 4. Debugging
- Usar `cy.pause()` para debugging
- Revisar screenshots y videos en caso de fallo

## Troubleshooting

### Tests Fallan
1. Verificar que los servicios backend estén ejecutándose
2. Revisar screenshots en `cypress/screenshots/`
3. Verificar videos en `cypress/videos/`
4. Comprobar selectores `data-cy` en el código

### Performance
1. Usar `cy.intercept()` para mockear APIs lentas
2. Configurar timeouts apropiados
3. Ejecutar tests en paralelo cuando sea posible

### CI/CD
1. Verificar que todas las dependencias estén instaladas
2. Asegurar que los servicios backend se inicien correctamente
3. Revisar logs de GitHub Actions

## Próximos Pasos

1. **Agregar más tests de componentes**: Cubrir más componentes React
2. **Tests de accesibilidad**: Verificar WCAG compliance
3. **Tests de rendimiento**: Medir tiempos de carga
4. **Tests de seguridad**: Verificar vulnerabilidades
5. **Tests de integración**: Verificar comunicación entre servicios
