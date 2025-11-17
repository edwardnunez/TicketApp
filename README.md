# 🎟️ TicketApp

![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)

Una plataforma completa de gestión y venta de tickets desarrollada con arquitectura de microservicios. TicketApp permite crear eventos, gestionar ubicaciones con mapas de asientos interactivos, procesar pagos y generar tickets con códigos QR.

## 📋 Tabla de contenidos

- [Características](#-características)
- [Arquitectura](#️-arquitectura)
- [Instalación](#-instalación)
  - [Desarrollo Local con Docker](#desarrollo-local-con-docker)
  - [Comandos útiles](#comandos-útiles)
  - [Despliegue en Azure](#despliegue-en-azure)
- [Configuración](#️-configuración)
- [Documentación](#-documentación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Autores](#-autores)

## ✨ Características

### Para usuarios
- 🔍 **Búsqueda y filtrado**: Explora eventos por categoría, fecha, ubicación y precio
- 🎫 **Compra de entradas**: Proceso de compra intuitivo con múltiples métodos de pago (PayPal, tarjeta)
- 🪑 **Selección interactiva de asientos**: Mapas de asientos visuales con zoom/pan y diferentes diseños según el tipo de ubicación
- 📱 **Entradas digitales**: Códigos QR únicos enviados por email para cada entrada
- 👤 **Gestión de perfil**: Historial de compras, edición de perfil y personalización de avatar
- 📧 **Notificaciones por email**: Confirmaciones de compra y recordatorios de eventos
- ℹ️ **Información y ayuda**: Páginas de Sobre Nosotros y Centro de Ayuda

### Para administradores
- 📊 **Panel de control**: Vista completa de ventas, ingresos y estadísticas
- 🎭 **Gestión de eventos**: Crear, editar y cancelar eventos con imágenes personalizadas
- 🏟️ **Editor avanzado de seatmaps**: Herramienta visual para diseñar mapas de asientos con múltiples tipos de layouts
- 🎨 **Sistema de bloqueo de asientos**: Bloqueo manual y por vista para gestión flexible
- 📍 **Gestión de ubicaciones**: Crear ubicaciones y mapas de asientos persinalizados
- 💰 **Análisis de ventas**: Reportes detallados de ingresos por evento y categoría
- 📈 **Estadísticas en tiempo real**: Monitoreo de ventas y disponibilidad
- 🔄 **Renderizador especializado**: Vista optimizada de seatmaps para administración

## 🏗️ Arquitectura

TicketApp está construida siguiendo una arquitectura de microservicios, donde cada servicio es independiente y se comunica a través de un API Gateway central.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                    (React + Ant Design)                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   API Gateway   │
                    │    (Port 8000)  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┬────────────┐
         │                   │                   │            │
         ▼                   ▼                   ▼            ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐
│  User Service  │  │ Event Service  │  │ Ticket Service │  │ Location Service │
│  (Port 8001)   │  │  (Port 8003)   │  │  (Port 8002)   │  │   (Port 8004)    │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘  └────────┬─────────┘
        │                   │                   │                    │
        ▼                   ▼                   ▼                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              MongoDB                                         │
│            (userdb, eventdb, ticketdb, locationdb, seatmapdb)               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Servicios

| Servicio | Puerto | Responsabilidad |
|----------|--------|-----------------|
| **Frontend** | 3000 | Interfaz de usuario React |
| **Gateway** | 8000 | Enrutamiento y orquestación de APIs |
| **User Service** | 8001 | Autenticación, registro y gestión de usuarios |
| **Ticket Service** | 8002 | Compra de tickets, generación de QR y emails |
| **Event Service** | 8003 | CRUD de eventos y gestión de estados |
| **Location Service** | 8004 | Gestión de ubicaciones y mapas de asientos |
| **MongoDB** | 27017 | Base de datos (múltiples DBs) |

## 🚀 Instalación

### Prerrequisitos

- **Docker** y **Docker Compose** (recomendado)
- **Node.js 18+** (opcional, para desarrollo sin Docker)
- **Git**

### Desarrollo Local con Docker

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/edwardnunez/TicketApp.git
   cd ticketapp
   ```

2. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto:
   ```bash
   # SMTP Configuration (para envío de emails)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   SMTP_FROM=TicketApp <no-reply@ticketapp.com>

   # PayPal Configuration (REQUERIDO para validación de pagos)
   # Backend - Credenciales de API para verificar pagos
   PAYPAL_CLIENT_ID=tu-paypal-client-id
   PAYPAL_CLIENT_SECRET=tu-paypal-client-secret
   PAYPAL_MODE=sandbox
   # Modo: sandbox (desarrollo) o live (producción)

   # Frontend - Client ID público
   REACT_APP_PAYPAL_CLIENT_ID=tu-paypal-client-id
   REACT_APP_PAYPAL_ENVIRONMENT=sandbox
   ```

   > **⚠️ Importante**: Las credenciales de PayPal son **obligatorias**. El backend valida todos los pagos directamente con la API de PayPal antes de emitir tickets. Sin estas credenciales, las compras no funcionarán.

   **Cómo obtener credenciales de PayPal:**
   1. Visita [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   2. Crea una aplicación en el entorno Sandbox
   3. Copia el **Client ID** y **Secret** de tu aplicación
   4. Usa el mismo Client ID para `PAYPAL_CLIENT_ID` y `REACT_APP_PAYPAL_CLIENT_ID`

3. **Iniciar la aplicación**
   ```bash
   docker-compose up -d
   ```

4. **Acceder a la aplicación**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Gateway: [http://localhost:8000](http://localhost:8000)

5. **Ver logs**
   ```bash
   docker-compose logs -f
   ```

6. **Detener la aplicación**
   ```bash
   docker-compose down
   ```

### Comandos útiles

#### Testing
```bash
# Frontend - Testing E2E con Cypress
cd frontend
npm run cypress:open           # Abrir interfaz de Cypress
npm run test:e2e              # Ejecutar tests E2E

# Backend - Testing unitario con Jest
cd backend/userservice         # O cualquier otro servicio
npm test                       # Ejecutar tests
npm run test:watch            # Modo watch
npm run test:coverage         # Con reporte de cobertura
```

#### Documentación
```bash
# Generar documentación JSDoc
npm run docs

# Modo watch (regenera al detectar cambios)
npm run docs:watch

# Ver documentación generada
# Abrir ./docs/index.html en el navegador
```

#### Linting
```bash
# Backend - Ejecutar ESLint
cd backend/userservice         # O cualquier otro servicio
npm run lint
```

### Desarrollo sin Docker

Para cada servicio:

```bash
# Backend - User Service
cd backend/userservice
npm install
npm start

# Repetir para cada servicio (eventservice, ticketservice, locationservice, gatewayservice)
```

```bash
# Frontend
cd frontend
npm install
npm start
```

### Despliegue en Azure

TicketApp incluye configuración completa para despliegue automatizado en Azure VM usando GitHub Actions.

#### Despliegue de la aplicación

El workflow [deploy.yml](.github/workflows/deploy.yml) se encarga del despliegue automático de la aplicación:

1. **Crear una VM en Azure**
   - Sistema operativo: Ubuntu 20.04 o superior
   - Configurar acceso SSH
   - Instalar Docker y Docker Compose

2. **Configurar GitHub Secrets**
   - `AZURE_VM_HOST`: IP pública de la VM
   - `AZURE_VM_USER`: Usuario SSH
   - `AZURE_VM_SSH_KEY`: Clave privada SSH
   - Variables de entorno (SMTP, PayPal, etc.)

3. **Despliegue automático**
   - Push a `main` → GitHub Actions construye imágenes Docker
   - Las imágenes se publican en GitHub Container Registry
   - Se despliegan automáticamente en la VM usando `docker-compose.prod.yml`

## ⚙️ Configuración

### Variables de entorno

#### Producción (GitHub Secrets)

Para despliegue en producción, configura estos secrets en GitHub:

**Infraestructura:**
- `AZURE_VM_HOST`: IP pública de tu VM
- `AZURE_VM_USER`: Usuario SSH de la VM
- `AZURE_VM_SSH_KEY`: Clave privada SSH

**Email:**
- `SMTP_HOST`: Host del servidor SMTP
- `SMTP_PORT`: Puerto SMTP (587 recomendado)
- `SMTP_USER`: Usuario/email para autenticación SMTP
- `SMTP_PASS`: Contraseña de aplicación SMTP
- `SMTP_FROM`: Dirección de remitente

**PayPal (REQUERIDO):**
- `PAYPAL_CLIENT_ID`: Client ID de PayPal para backend
- `PAYPAL_CLIENT_SECRET`: Client Secret de PayPal para validación de pagos
- `PAYPAL_MODE`: `sandbox` (desarrollo) o `live` (producción)
- `REACT_APP_PAYPAL_CLIENT_ID`: Client ID para frontend (mismo que PAYPAL_CLIENT_ID)
- `REACT_APP_PAYPAL_ENVIRONMENT`: mismo que PAYPAL_MODE

**Aplicación:**
- `REACT_APP_API_ENDPOINT`: URL del API Gateway (ej: `https://tu-dominio.com:8000`)

#### Desarrollo Local

Ver archivo `.env` de ejemplo arriba.

## 📚 Documentación

### Documentación del código (JSDoc)

El proyecto incluye documentación completa del código generada automáticamente con JSDoc.


**Generar documentación localmente:**
```bash
# En la raíz del proyecto
npm run docs

# La documentación se generará en ./docs/
# Abrir ./docs/index.html en el navegador
```

La documentación incluye:
- Descripción detallada de todos los servicios backend
- Modelos de datos (User, Event, Ticket, Location, Seatmap)
- Endpoints de API y sus parámetros
- Componentes React del frontend
- Hooks personalizados
- Utilidades y helpers

## 📁 Estructura del proyecto

```
ticketapp/
├── backend/
│   ├── gatewayservice/              # API Gateway - Enrutamiento central
│   │   ├── __tests__/
│   │   │   └── gateway-service.test.js  # Tests del gateway
│   │   └── gateway-service.js       # Servicio principal
│   ├── userservice/                 # Servicio de usuarios
│   │   ├── __tests__/
│   │   │   └── user-service.test.js     # Tests de autenticación y usuarios
│   │   ├── user-service.js          # Autenticación y gestión de usuarios
│   │   └── user-model.js            # Modelo de datos de usuario
│   ├── eventservice/                # Servicio de eventos
│   │   ├── __tests__/
│   │   │   └── event-service.test.js    # Tests de eventos
│   │   ├── event-service.js         # CRUD de eventos
│   │   ├── event-model.js           # Modelo de datos de evento
│   │   └── event-state-service.js   # Actualización automática de estados
│   ├── ticketservice/               # Servicio de tickets
│   │   ├── __tests__/
│   │   │   └── ticket-service.test.js   # Tests de compra y tickets
│   │   ├── ticket-service.js        # Compra y generación de tickets
│   │   └── ticket-model.js          # Modelo de datos de ticket
│   └── locationservice/             # Servicio de ubicaciones
│       ├── __tests__/
│       │   └── location-service.test.js # Tests de ubicaciones y seatmaps
│       ├── location-service.js      # Gestión de ubicaciones
│       ├── location-model.js        # Modelo de ubicación
│       └── seatmap-model.js         # Modelo de mapa de asientos
├── frontend/
│   ├── src/
│   │   ├── components/              # Componentes reutilizables
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── colorscheme.jsx      # Sistema de temas de color
│   │   │   ├── FramedImage.jsx      # Componente de imagen enmarcada
│   │   │   └── ImageCropperModal.jsx # Modal para recorte de imágenes
│   │   ├── pages/                   # Páginas de la aplicación
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── EditProfile.jsx      # Editar perfil de usuario
│   │   │   ├── EventDetails.jsx
│   │   │   ├── TicketPurchase.jsx
│   │   │   ├── AboutUs.jsx          # Página sobre nosotros
│   │   │   ├── HelpCenter.jsx       # Centro de ayuda
│   │   │   ├── ErrorPage.jsx        # Página de errores
│   │   │   ├── admin/               # Panel de administración
│   │   │   │   ├── components/      # Componentes específicos de admin
│   │   │   │   │   ├── BlockingViewSwitcher.jsx
│   │   │   │   │   └── ManualBlockingSelection.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminSeatMapRenderer.jsx  # Renderizador de seatmaps admin
│   │   │   │   ├── EventCreation.jsx
│   │   │   │   ├── EventSeatmapEditor.jsx    # Editor visual de seatmaps
│   │   │   │   ├── LocationCreation.jsx
│   │   │   │   └── AdminStatistics.jsx
│   │   │   └── steps/               # Pasos del proceso de compra
│   │   │       ├── TicketSelection.jsx
│   │   │       ├── BuyerInfo.jsx
│   │   │       ├── PaymentMethod.jsx
│   │   │       ├── PurchaseConfirmation.jsx
│   │   │       └── seatmaps/        # Sistema de seatmaps
│   │   │           ├── components/  # Componentes de seatmap
│   │   │           ├── containers/  # Contenedores
│   │   │           ├── renderers/   # Renderizadores por tipo
│   │   │           ├── styles/      # Estilos
│   │   │           └── ui/          # Componentes UI
│   │   ├── hooks/                   # Custom React Hooks
│   │   ├── utils/                   # Utilidades
│   │   ├── App.jsx                  # Componente principal
│   ├── public/                      # Archivos estáticos de la interfaz
│   └── cypress/                     # Tests E2E
├── docs/                            # Documentación JSDoc generada
│   └── index.html                   # Punto de entrada de la documentación
├── .github/
│   └── workflows/
│       └── deploy.yml               # CI/CD - Despliegue en Azure
├── .env.example                     # Ejemplo de variables de entorno
├── .gitignore                       # Archivos ignorados por Git
├── jsdoc.json                       # Configuración de JSDoc
├── docker-compose.yml               # Orquestación de servicios (desarrollo)
├── docker-compose.prod.yml          # Configuración de producción
└── README.md                        # Este archivo
```

## 👥 Autores

- **Iyán Fernández** - Desarrollador - [iyanfdezz](https://github.com/iyanfdezz)
- **Edward Núñez** - Tutor - [edwardnunez](https://github.com/edwardnunez)
- **Xiomarah Guzmán** - Tutora - [guzmanxiomarah](https://github.com/guzmanxiomarah)

**⭐ Si este proyecto te resultó útil, considera darle una estrella en GitHub**
