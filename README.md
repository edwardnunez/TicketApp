# TicketApp

A comprehensive ticket management system built with React and Node.js microservices architecture.

## 🚀 Deployment Options

### Option 1: Azure VM with GitHub Actions (Recommended - FREE)

**Fully automated deployment with Azure for Students (FREE for 12 months).**

📖 **See complete guide:** [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)

**Summary:**
1. Create Azure VM (FREE with Azure for Students - $100 credit)
2. Configure GitHub Secrets
3. `git push` → GitHub Actions deploys automatically

**Cost:** $0 for 12 months with Azure for Students

---

### Option 2: Local Development

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (optional, for development without Docker)

## Setup Instructions

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/ticketapp.git
   cd ticketapp
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start application:**
   ```bash
   docker-compose up -d
   ```

4. **Access application:**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8000
   - Health Check: http://localhost:8000/health

5. **View logs:**
   ```bash
   docker-compose logs -f
   ```

6. **Stop application:**
   ```bash
   docker-compose down
   ```

---

## Architecture

- **Frontend**: React 18.2.0 with Ant Design components
- **Backend**: Node.js microservices (User, Event, Ticket, Location, Gateway services)
- **Database**: MongoDB (5 separate databases)
- **Containerization**: Docker and Docker Compose
- **CI/CD**: GitHub Actions with automatic deployment to Azure

## Services and Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React application |
| Gateway | 8000 | Central API Gateway |
| User Service | 8001 | Authentication and user management |
| Ticket Service | 8002 | Ticket management and QR generation |
| Event Service | 8003 | Event management |
| Location Service | 8004 | Venues and seat maps |
| MongoDB | 27017 | Database |

---

## 🧪 Testing

### E2E Tests (Cypress)

```bash
cd frontend

# Interactive mode
npm run cypress:open

# Headless mode
npm run cypress:run
```

### Unit Tests (Backend)

```bash
cd backend/userservice
npm test
```

---

## 🔐 Security

**IMPORTANT:** Never commit sensitive credentials.

- Use `.env` file for local development
- Use GitHub Secrets for production
- The `.env` file is in `.gitignore`

## Project Structure Guide

### Backend Services

#### Gateway Service (`backend/gatewayservice/`)

- **`gateway-service.js`**: API Gateway that routes requests to appropriate microservices
- **`Dockerfile`**: Container configuration for the gateway service
- **`package.json`**: Dependencies and scripts for the gateway service

#### User Service (`backend/userservice/`)

- **`user-service.js`**: Handles user authentication, registration, and profile management
- **`user-model.js`**: MongoDB schema and methods for user data
- **`Dockerfile`**: Container configuration for the user service
- **`package.json`**: Dependencies and scripts for the user service

#### Event Service (`backend/eventservice/`)

- **`event-service.js`**: Manages event creation, updates, state changes, and image uploads
- **`event-model.js`**: MongoDB schema and methods for event data
- **`event-state-service.js`**: Handles automatic event state updates (active, upcoming, finished, cancelled)
- **`Dockerfile`**: Container configuration for the event service
- **`package.json`**: Dependencies and scripts for the event service

#### Ticket Service (`backend/ticketservice/`)

- **`ticket-service.js`**: Handles ticket purchases, QR code generation, and email confirmations
- **`ticket-model.js`**: MongoDB schema and methods for ticket data
- **`Dockerfile`**: Container configuration for the ticket service
- **`package.json`**: Dependencies and scripts for the ticket service

#### Location Service (`backend/locationservice/`)

- **`location-service.js`**: Manages locations and seatmap definitions
- **`location-model.js`**: MongoDB schema and methods for location data
- **`seatmap-model.js`**: MongoDB schema and methods for seatmap data
- **`seed-seatmaps.js`**: Script to populate database with sample seatmaps
- **`seed.js`**: Database seeding script
- **`Dockerfile`**: Container configuration for the location service
- **`package.json`**: Dependencies and scripts for the location service

#### Main Backend Files

- **`server.js`**: Main backend entry point with health check endpoint
- **`package.json`**: Root backend dependencies and scripts
- **`docker-compose.yml`**: Docker Compose configuration for all services

### Frontend Application

#### Main Application Files

- **`App.jsx`**: Main React application component with routing configuration
- **`index.js`**: React application entry point
- **`index.css`**: Global CSS styles
- **`reportWebVitals.js`**: Performance monitoring setup
- **`setupTests.js`**: Test configuration

#### Components (`src/components/`)

- **`AdminRoute.jsx`**: Route protection for admin-only pages
- **`colorscheme.jsx`**: Color palette and utility functions for dynamic theming
- **`Footer.jsx`**: Application footer component
- **`FramedImage.jsx`**: Image display component with frame styling
- **`ImageCropperModal.jsx`**: Modal for image cropping functionality
- **`Navbar.jsx`**: Navigation bar with user authentication and role-based menu
- **`OptimizedSeatNavigation.jsx`**: Optimized seat map navigation component
- **`PersistentViewSwitcher.jsx`**: View mode persistence component
- **`ProtectedRoute.jsx`**: Route protection for authenticated users
- **`SmartSeatFilters.jsx`**: Intelligent seat filtering component
- **`SmartZoomContainer.jsx`**: Smart zoom functionality for seat maps

#### Custom Hooks (`src/hooks/`)

- **`useDeviceDetection.js`**: Device detection and responsive behavior
- **`useSeatMapPerformance.js`**: Seat map rendering performance optimization
- **`useSeatMapViability.js`**: Seat map viability assessment
- **`useUserRole.js`**: User role and authentication state management
- **`useViewportManager.js`**: Viewport and zoom functionality management

#### Pages (`src/pages/`)

- **`Home.jsx`**: Main page with event listings, filtering, and search
- **`Login.jsx`**: User authentication page
- **`Register.jsx`**: User registration page
- **`Profile.jsx`**: User profile page with ticket history
- **`EditProfile.jsx`**: Profile editing page with avatar selection
- **`EventDetails.jsx`**: Detailed event information page
- **`TicketPurchase.jsx`**: Multi-step ticket purchase process
- **`AboutUs.jsx`**: About page with team information
- **`HelpCenter.jsx`**: Help center with FAQ and support
- **`ErrorPage.jsx`**: 404 and error handling page

#### Admin Pages (`src/pages/admin/`)

- **`AdminDashboard.jsx`**: Admin dashboard for event management
- **`AdminStatistics.jsx`**: Detailed sales and revenue analysis
- **`EditableSeatGrid.jsx`**: Editable seat grid for seat map creation
- **`EditableSeatRenderer.jsx`**: Seat renderer for editing mode
- **`EventCreation.jsx`**: Complex event creation form with location, pricing, and image management
- **`EventSeatmapEditor.jsx`**: Seat map editor for events
- **`LocationCreation.jsx`**: Location creation form
- **`ProfessionalAdminSeatMapRenderer.jsx`**: Professional seat map renderer for admin

#### Purchase Steps (`src/pages/steps/`)

- **`BuyerInfo.jsx`**: Buyer information collection step
- **`PaymentMethod.jsx`**: Payment method selection step
- **`PurchaseConfirmation.jsx`**: Purchase confirmation step
- **`TicketSelection.jsx`**: Ticket selection step

#### Seat Map Components (`src/pages/steps/seatmaps/`)

**Containers:**

- **`AdaptiveSeatMapRenderer.jsx`**: Automatically selects best rendering approach
- **`AlternativeViewRenderer.jsx`**: Alternative view rendering for different devices
- **`EnhancedSeatMapContainer.jsx`**: Enhanced container with professional rendering
- **`MobileSeatList.jsx`**: Mobile-optimized seat list view
- **`ProfessionalSeatMapRenderer.jsx`**: Professional renderer with advanced controls

**Renderers:**

- **`EditableSeatRenderer.jsx`**: Seat renderer for creation and editing
- **`GenericSeatRenderer.jsx`**: Generic seat map renderer for standard display
- **`ProfessionalSeatRenderer.jsx`**: Professional seat renderer with advanced features
- **`ResponsiveSeatRenderer.jsx`**: Responsive seat renderer for different screen sizes
- **`SeatRenderer.jsx`**: Individual seat renderer for numbered sections
- **`SectionShapeRenderer.jsx`**: Section shape renderer for different venue types
- **`VenueStageRenderer.jsx`**: Venue stage renderer for different venue types

**UI Components:**

- **`ZoomControls.jsx`**: Zoom controls for seat map navigation
- **`SeatFilters.jsx`**: Seat filtering interface
- **`SeatLegend.jsx`**: Seat map legend component
- **`ViewModeSelector.jsx`**: View mode selection component

**Styles:**

- **`ProfessionalSeatMapLayouts.css`**: Professional seat map styling
- **`ResponsiveSeatMap.css`**: Responsive seat map styling

#### Utilities (`src/utils/`)

- **`authSession.js`**: Authentication session management utilities

#### Public Assets (`public/`)

- **`index.html`**: Main HTML template
- **`manifest.json`**: PWA manifest
- **`robots.txt`**: SEO robots file
- **`site.webmanifest`**: Web app manifest
- **`favicon.ico`**: Site favicon
- **`android-chrome-*.png`**: Android app icons
- **`apple-touch-icon.png`**: Apple touch icon
- **`logo*.png`**: Application logos
- **`avatars/`**: User avatar images
- **`event-images/`**: Default event images

#### Build Files (`build/`)

- **`index.html`**: Built HTML file
- **`static/`**: Compiled CSS and JavaScript assets
- **`asset-manifest.json`**: Asset manifest for the build

### Configuration Files

- **`docker-compose.yml`**: Docker Compose configuration for all services
- **`package.json`**: Root project dependencies and scripts
- **`package-lock.json`**: Dependency lock file
- **`Dockerfile`**: Frontend container configuration

### Documentation

- **`README.md`**: Project documentation and setup guide
- **`docs/`**: Additional documentation directory
- **`fixes.md`**: Bug fixes and improvements log
