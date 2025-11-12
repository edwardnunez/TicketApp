# 🎟️ TicketApp

![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)

Una plataforma completa de gestión y venta de tickets desarrollada con arquitectura de microservicios. TicketApp permite crear eventos, gestionar ubicaciones con mapas de asientos interactivos, procesar pagos y generar tickets con códigos QR.

## 📋 Tabla de contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
  - [Desarrollo Local](#desarrollo-local-con-docker)
  - [Comandos útiles](#comandos-útiles)
  - [Despliegue en Azure](#despliegue-en-azure)
- [Configuración](#-configuración)
- [Documentación](#-documentación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Autores](#-autores)

## ✨ Características

### Para usuarios
- 🔍 **Búsqueda y filtrado**: Explora eventos por categoría, fecha, ubicación y precio
- 🎫 **Compra de entradas**: Proceso de compra intuitivo con múltiples métodos de pago (PayPal, tarjeta)
- 🪑 **Selección interactiva de asientos**: Mapas de asientos visuales con zoom/pan y diferentes diseños según el tipo de venue
- 📱 **Entradas digitales**: Códigos QR únicos enviados por email para cada entrada
- 👤 **Gestión de perfil**: Historial de compras, edición de perfil y personalización de avatar
- 📧 **Notificaciones por email**: Confirmaciones de compra y recordatorios de eventos
- ℹ️ **Información y ayuda**: Páginas de Sobre Nosotros y Centro de Ayuda

### Para administradores
- 📊 **Panel de control**: Vista completa de ventas, ingresos y estadísticas
- 🎭 **Gestión de eventos**: Crear, editar y cancelar eventos con imágenes personalizadas
- 🏟️ **Editor avanzado de seatmaps**: Herramienta visual para diseñar mapas de asientos con múltiples tipos de layouts
- 🎨 **Sistema de bloqueo de asientos**: Bloqueo manual y por vista para gestión flexible
- 📍 **Gestión de ubicaciones**: Administrar venues con capacidades y tipos de configuración
- 💰 **Análisis de ventas**: Reportes detallados de ingresos por evento y categoría
- 📈 **Estadísticas en tiempo real**: Monitoreo de ventas y disponibilidad
- 🔄 **Renderizador especializado**: Vista optimizada de seatmaps para administración

### Características técnicas
- 🔐 **Autenticación JWT**: Sistema seguro de autenticación y autorización basado en roles
- 💳 **Validación de pagos server-side**: Verificación directa con API de PayPal para prevenir fraudes
- 🎨 **Diseño responsive**: Optimizado para móviles, tablets y escritorio
- ⚡ **Performance optimizado**: Renderizado eficiente de mapas de asientos complejos con zoom y pan
- 🔄 **Actualización de estados**: Sistema automático de actualización de estados de eventos
- 🖼️ **Gestión de imágenes**: Carga y recorte de imágenes para eventos y avatares con modal interactivo
- 📦 **Arquitectura de microservicios**: Servicios independientes y escalables
- 🧪 **Testing completo**: Tests E2E con Cypress y unitarios con Jest
- 📖 **Documentación automática**: JSDoc con despliegue continuo a GitHub Pages
- 🎯 **Sistema de temas**: Soporte para esquemas de color personalizables
- 🔍 **Linting**: Análisis de código con ESLint para mantener calidad

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
| **Location Service** | 8004 | Gestión de venues y mapas de asientos |
| **MongoDB** | 27017 | Base de datos (múltiples DBs) |

## 🛠️ Tecnologías

### Frontend
- **React 18.2.0**: Framework de UI
- **React Router 6**: Navegación SPA
- **Ant Design 5**: Biblioteca de componentes UI
- **Ant Design Icons**: Iconografía
- **Axios**: Cliente HTTP
- **React Easy Crop**: Recorte de imágenes
- **PayPal SDK**: Integración de pagos

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT (jsonwebtoken)**: Autenticación basada en tokens
- **Nodemailer**: Envío de emails
- **QRCode**: Generación de códigos QR
- **Bcrypt**: Hash de contraseñas

### DevOps
- **Docker & Docker Compose**: Contenedorización
- **GitHub Actions**: CI/CD
- **GitHub Container Registry**: Registro de imágenes Docker
- **GitHub Pages**: Hosting de documentación
- **Azure VM**: Hosting en la nube

### Testing & Quality
- **Cypress**: Testing E2E
- **Jest**: Testing unitario (backend y hooks)
- **ESLint**: Linting y análisis de código
- **SuperTest**: Testing de APIs

### Documentación
- **JSDoc**: Generación de documentación de código
- **GitHub Pages**: Publicación automática de docs

## 🚀 Instalación

### Prerrequisitos

- **Docker** y **Docker Compose** (recomendado)
- **Node.js 18+** (opcional, para desarrollo sin Docker)
- **Git**

### Desarrollo Local con Docker

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/iyanfdezz/ticketapp.git
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
   - Health Check: [http://localhost:8000/health](http://localhost:8000/health)

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

**Opción Gratuita**: Azure for Students ofrece $100 de crédito gratis por 12 meses.

**Resumen:**
1. Crear una VM en Azure
2. Configurar GitHub Secrets en tu repositorio
3. Hacer push a la rama `main` → GitHub Actions despliega automáticamente

**Coste**: $0 durante 12 meses con Azure for Students

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
- `REACT_APP_PAYPAL_ENVIRONMENT`: `sandbox` o `production`

**Aplicación:**
- `REACT_APP_API_ENDPOINT`: URL del API Gateway (ej: `https://tu-dominio.com:8000`)

#### Desarrollo Local

Ver archivo `.env` de ejemplo arriba.

## 📚 Documentación

### Documentación del código (JSDoc)

El proyecto incluye documentación completa del código generada automáticamente con JSDoc.

**Ver documentación publicada**: [https://iyanfdezz.github.io/ticketapp/](https://iyanfdezz.github.io/ticketapp/)

La documentación se despliega automáticamente a GitHub Pages cada vez que se hace push a la rama `main` gracias al workflow de GitHub Actions.

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
│   │   ├── __tests__/               # Tests unitarios
│   │   ├── gateway-service.js       # Servicio principal
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── userservice/                 # Servicio de usuarios
│   │   ├── __tests__/               # Tests unitarios
│   │   ├── user-service.js          # Autenticación y gestión de usuarios
│   │   ├── user-model.js            # Modelo de datos de usuario
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── eventservice/                # Servicio de eventos
│   │   ├── __tests__/               # Tests unitarios
│   │   ├── event-service.js         # CRUD de eventos
│   │   ├── event-model.js           # Modelo de datos de evento
│   │   ├── event-state-service.js   # Actualización automática de estados
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── ticketservice/               # Servicio de tickets
│   │   ├── __tests__/               # Tests unitarios
│   │   ├── ticket-service.js        # Compra y generación de tickets
│   │   ├── ticket-model.js          # Modelo de datos de ticket
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── locationservice/             # Servicio de ubicaciones
│   │   ├── __tests__/               # Tests unitarios
│   │   ├── location-service.js      # Gestión de venues
│   │   ├── location-model.js        # Modelo de ubicación
│   │   ├── seatmap-model.js         # Modelo de mapa de asientos
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── server.js                    # Servidor compartido (opcional)
│   └── package.json                 # Dependencias compartidas
├── frontend/
│   ├── src/
│   │   ├── components/              # Componentes reutilizables
│   │   │   ├── __tests__/           # Tests de componentes
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
│   │   │   ├── useUserRole.js
│   │   │   ├── useUserRole.test.js  # Tests del hook
│   │   │   ├── useDeviceDetection.js
│   │   │   ├── useDeviceDetection.test.js
│   │   │   └── useAdvancedZoomPan.js # Hook para zoom/pan en seatmaps
│   │   ├── utils/                   # Utilidades
│   │   │   └── authSession.js
│   │   ├── App.jsx                  # Componente principal
│   │   ├── index.js                 # Punto de entrada
│   │   ├── index.css                # Estilos globales
│   │   └── setupTests.js            # Configuración de tests
│   ├── public/
│   │   ├── avatars/                 # Avatares de usuario
│   │   └── event-images/            # Imágenes de eventos
│   ├── cypress/                     # Tests E2E
│   ├── Dockerfile
│   └── package.json
├── docs/                            # Documentación JSDoc generada
│   └── index.html                   # Punto de entrada de la documentación
├── .github/
│   └── workflows/
│       ├── deploy.yml               # CI/CD - Despliegue en Azure
│       └── deploy-docs.yml          # Despliegue de docs a GitHub Pages
├── nginx/                           # Configuración de Nginx (opcional)
├── scripts/                         # Scripts de utilidad
├── jsdoc.json                       # Configuración de JSDoc
├── docker-compose.yml               # Orquestación de servicios (desarrollo)
├── docker-compose.prod.yml          # Configuración de producción
├── package.json                     # Dependencias raíz y scripts de docs
└── README.md
```

## 👥 Autores

- **Iyán Fernández** - Desarrollador - [iyanfdezz](https://github.com/iyanfdezz)
- **Edward Núñez** - Tutor - [edwardnunez](https://github.com/edwardnunez)
- **Xiomarah Guzmán** - Tutora - [xiomarah](https://github.com/xiomarah)

**⭐ Si este proyecto te resultó útil, considera darle una estrella en GitHub**
