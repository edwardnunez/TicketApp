# Tests Unitarios - TicketApp

## Descripción

Este directorio contiene los tests unitarios para las funciones de utilidad más importantes de la aplicación TicketApp.

## Estructura

```
backend/
├── utils/                    # Funciones de utilidad extraíbles
│   ├── validation.js         # Validaciones de datos
│   ├── generators.js         # Generadores de IDs y códigos
│   └── business-logic.js     # Lógica de negocio
├── __tests__/
│   └── unit/                 # Tests unitarios
│       ├── validation.test.js
│       ├── generators.test.js
│       ├── business-logic.test.js
│       └── jest.config.js
└── package.json
```

## Casos de Uso Cubiertos

### 1. Validaciones de Usuario
- ✅ Validación de formato de email
- ✅ Validación de fortaleza de contraseña
- ✅ Validación de campos requeridos

### 2. Validaciones de Evento
- ✅ Validación de fecha futura
- ✅ Validación de capacidad de evento
- ✅ Validación de tipo de evento

### 3. Validaciones de Tickets
- ✅ Validación de cantidad de tickets (1-6)
- ✅ Validación de capacidad vs tickets vendidos

### 4. Generadores
- ✅ Generación de número de ticket único
- ✅ Generación de código de validación
- ✅ Generación de datos QR
- ✅ Generación de ID de compra

### 5. Lógica de Asientos
- ✅ Verificación de disponibilidad de asientos
- ✅ Cálculo de precio de asientos
- ✅ Cálculo de precio total

### 6. Utilidades
- ✅ Formateo de fechas
- ✅ Sanitización de input (XSS)
- ✅ Validación de tipos de evento
- ✅ Validación de categorías de ubicación
- ✅ Detección de conflictos de horarios

## Ejecutar Tests

### Todos los tests unitarios
```bash
npm run test:unit
```

### Con cobertura de código
```bash
npm run test:unit:coverage
```

### Test específico
```bash
npm test -- validation.test.js
```

## Cobertura de Código

Los tests unitarios cubren:
- **Validaciones**: 100% de las funciones de validación
- **Generadores**: 100% de las funciones de generación
- **Lógica de negocio**: 100% de las funciones de utilidad

## Diferencias con Tests de Integración

### Tests Unitarios (estos archivos)
- ✅ Prueban funciones individuales
- ✅ Sin dependencias externas
- ✅ Rápidos de ejecutar
- ✅ Fáciles de mantener
- ✅ Aislados y determinísticos

### Tests de Integración (archivos existentes)
- ✅ Prueban servicios completos
- ✅ Usan base de datos en memoria
- ✅ Prueban endpoints HTTP
- ✅ Verifican flujos completos

## Ejemplos de Uso

### Función de Validación
```javascript
const { validateEmailFormat } = require('./utils/validation');

// Test unitario
expect(validateEmailFormat("test@example.com")).toBe(true);
expect(validateEmailFormat("invalid-email")).toBe(false);
```

### Función de Generación
```javascript
const { generateTicketNumber } = require('./utils/generators');

// Test unitario
const ticketNumber = generateTicketNumber();
expect(ticketNumber).toMatch(/^TKT-[A-Z0-9]+-[A-Z0-9]+$/);
```

## Beneficios

1. **Detección temprana de errores**: Los tests unitarios detectan problemas en funciones individuales
2. **Refactoring seguro**: Permiten cambiar implementación sin romper funcionalidad
3. **Documentación viva**: Los tests documentan el comportamiento esperado
4. **Desarrollo guiado**: TDD (Test-Driven Development) es más fácil con tests unitarios
5. **Debugging**: Aíslan problemas a funciones específicas

## Próximos Pasos

1. **Agregar más funciones**: Extraer más lógica de los servicios
2. **Mocking**: Usar mocks para funciones que dependen de APIs externas
3. **Performance**: Agregar tests de rendimiento para funciones críticas
4. **Edge cases**: Cubrir casos límite y errores inesperados
