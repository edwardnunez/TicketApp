# 🎟️ TicketApp

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)

Una plataforma completa de gestión y venta de tickets desarrollada con arquitectura de microservicios. TicketApp permite crear eventos, gestionar ubicaciones con mapas de asientos interactivos, procesar pagos y generar tickets con códigos QR.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Demo](#-demo)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
  - [Desarrollo Local](#desarrollo-local-con-docker)
  - [Despliegue en Azure](#despliegue-en-azure)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API](#-api)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

### Para usuarios
- 🔍 **Búsqueda y filtrado**: Explora eventos por categoría, fecha, ubicación y precio
- 🎫 **Compra de entradas**: Proceso de compra intuitivo con múltiples métodos de pago (PayPal, tarjeta)
- 🪑 **Selección interactiva de asientos**: Mapas de asientos visuales con diferentes diseños según el tipo de venue
- 📱 **Entradas digitales**: Códigos QR únicos enviados por email para cada entradas
- 👤 **Gestión de perfil**: Historial de compras y personalización de avatar
- 📧 **Notificaciones por email**: Confirmaciones de compra y recordatorios de eventos

### Para administradores
- 📊 **Panel de control**: Vista completa de ventas, ingresos y estadísticas
- 🎭 **Gestión de eventos**: Crear, editar y cancelar eventos con imágenes personalizadas
- 🏟️ **Editor de seatmaps**: Herramienta visual para diseñar mapas de asientos personalizados
- 📍 **Gestión de ubicaciones**: Administrar venues con capacidades y tipos de configuración
- 💰 **Análisis de ventas**: Reportes detallados de ingresos por evento y categoría
- 📈 **Estadísticas en tiempo real**: Monitoreo de ventas y disponibilidad

### Características técnicas
- 🔐 **Autenticación JWT**: Sistema seguro de autenticación y autorización basado en roles
- 🎨 **Diseño responsive**: Optimizado para móviles, tablets y escritorio
- ⚡ **Performance optimizado**: Renderizado eficiente de mapas de asientos complejos
- 🔄 **Actualización de estados**: Sistema automático de actualización de estados de eventos
- 🖼️ **Gestión de imágenes**: Carga y recorte de imágenes para eventos y avatares
- 📦 **Arquitectura de microservicios**: Servicios independientes y escalables

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
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  User Service  │  │ Event Service  │  │ Ticket Service │
│  (Port 8001)   │  │  (Port 8003)   │  │  (Port 8002)   │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                      MongoDB                            │
│      (userdb, eventdb, ticketdb, locationdb)           │
└─────────────────────────────────────────────────────────┘
         ▲
         │
┌────────┴────────┐
│Location Service │
│  (Port 8004)    │
└─────────────────┘
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
- **Axios**: Cliente HTTP
- **React Easy Crop**: Recorte de imágenes
- **PayPal SDK**: Integración de pagos

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación basada en tokens
- **Nodemailer**: Envío de emails
- **QRCode**: Generación de códigos QR
- **Bcrypt**: Hash de contraseñas

### DevOps
- **Docker & Docker Compose**: Contenedorización
- **GitHub Actions**: CI/CD
- **GitHub Container Registry**: Registro de imágenes Docker
- **Azure VM**: Hosting en la nube

### Testing
- **Cypress**: Testing E2E
- **Jest**: Testing unitario

## 🚀 Instalación

### Prerrequisitos

- **Docker** y **Docker Compose** (recomendado)
- **Node.js 18+** (opcional, para desarrollo sin Docker)
- **Git**

### Desarrollo Local con Docker

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/your-username/ticketapp.git
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

   # PayPal Configuration (opcional)
   REACT_APP_PAYPAL_CLIENT_ID=tu-paypal-client-id
   REACT_APP_PAYPAL_ENVIRONMENT=sandbox
   ```

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

### Variables de Entorno

#### Producción (GitHub Secrets)

Para despliegue en producción, configura estos secrets en GitHub:

- `AZURE_VM_HOST`: IP pública de tu VM
- `AZURE_VM_USER`: Usuario SSH de la VM
- `AZURE_VM_SSH_KEY`: Clave privada SSH
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `REACT_APP_API_ENDPOINT`: URL del API Gateway
- `REACT_APP_PAYPAL_CLIENT_ID`: ID de cliente de PayPal
- `REACT_APP_PAYPAL_ENVIRONMENT`: `sandbox` o `production`

#### Desarrollo Local

Ver archivo `.env` de ejemplo arriba.


## 📁 Estructura del Proyecto

```
ticketapp/
├── backend/
│   ├── gatewayservice/         # API Gateway - Enrutamiento central
│   │   ├── gateway-service.js
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── userservice/            # Servicio de usuarios
│   │   ├── user-service.js     # Autenticación y gestión de usuarios
│   │   ├── user-model.js       # Modelo de datos de usuario
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── eventservice/           # Servicio de eventos
│   │   ├── event-service.js    # CRUD de eventos
│   │   ├── event-model.js      # Modelo de datos de evento
│   │   ├── event-state-service.js  # Actualización automática de estados
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── ticketservice/          # Servicio de tickets
│   │   ├── ticket-service.js   # Compra y generación de tickets
│   │   ├── ticket-model.js     # Modelo de datos de ticket
│   │   ├── Dockerfile
│   │   └── package.json
│   └── locationservice/        # Servicio de ubicaciones
│       ├── location-service.js # Gestión de venues
│       ├── location-model.js   # Modelo de ubicación
│       ├── seatmap-model.js    # Modelo de mapa de asientos
│       ├── Dockerfile
│       └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── pages/              # Páginas de la aplicación
│   │   │   ├── Home.jsx        # Página principal
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── TicketPurchase.jsx
│   │   │   ├── admin/          # Panel de administración
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── EventCreation.jsx
│   │   │   │   ├── LocationCreation.jsx
│   │   │   │   └── AdminStatistics.jsx
│   │   │   └── steps/          # Pasos del proceso de compra
│   │   │       ├── TicketSelection.jsx
│   │   │       ├── BuyerInfo.jsx
│   │   │       ├── PaymentMethod.jsx
│   │   │       └── PurchaseConfirmation.jsx
│   │   ├── hooks/              # Custom React Hooks
│   │   │   ├── useUserRole.js
│   │   │   ├── useDeviceDetection.js
│   │   │   └── useSeatMapPerformance.js
│   │   ├── utils/              # Utilidades
│   │   │   └── authSession.js
│   │   ├── App.jsx             # Componente principal
│   │   └── index.js            # Punto de entrada
│   ├── public/
│   │   ├── avatars/            # Avatares de usuario
│   │   └── event-images/       # Imágenes de eventos
│   ├── Dockerfile
│   └── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
├── docker-compose.yml          # Orquestación de servicios (desarrollo)
├── docker-compose.prod.yml     # Configuración de producción
└── README.md
```


## 👥 Autores

- **Iyán Fernández** - Desarrollador - [iyanfdezz](https://github.com/iyanfdezz)
- **Edward Núñez** - Tutor - [edwardnunez](https://github.com/edwardnunez)
- **Xiomarah Guzmán** - Tutora - [xiomarah](https://github.com/xiomarah)

**¿Tienes preguntas o necesitas ayuda?** Abre un [issue](https://github.com/your-username/ticketapp/issues) o contacta al equipo de desarrollo.

**⭐ Si este proyecto te resultó útil, considera darle una estrella en GitHub**
