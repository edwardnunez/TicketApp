# TicketApp

A comprehensive ticket management system built with React and Node.js microservices architecture.

## Prerequisites

To run the application, you need the following:

- Docker
- VSCode (or similar editor)
- MongoDB
- Node.js

## Setup Instructions

1. Run `npm install` in the project root directory
2. Execute `docker-compose up --build` in the project root directory
3. If any errors occur, run `npm install` in the frontend folder and in each service folder respectively
4. After that, run `docker-compose up --build` again in the project root directory
5. The application will be available at [http://localhost:3000](http://localhost:3000)

## Architecture

- **Frontend**: React application with Ant Design components
- **Backend**: Node.js microservices (User, Event, Ticket, Location, Gateway services)
- **Database**: MongoDB
- **Containerization**: Docker and Docker Compose

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
