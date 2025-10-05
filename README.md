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
