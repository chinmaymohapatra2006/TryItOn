# TryItOn - 3D Virtual Costume Try-On Platform

TryItOn is an interactive web application designed for real-time 3D virtual costume fitting and previewing. This repository contains the complete frontend and backend codebases adhering to a clean, phase-by-phase architecture.

---

## Phase 0: Project Foundation

This phase establishes the production-ready foundation with strict separation of frontend and backend applications, environment configuration, routing, live health monitoring, and 3D graphics dependency setup.

### Technology Stack

- **Frontend:**
  - **Framework:** React 18
  - **Bundler & Dev Server:** Vite 6
  - **3D Graphics Engine:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
  - **Routing:** React Router DOM v6
  - **Styling:** Tailwind CSS with PostCSS & Autoprefixer
  - **Icons:** Lucide React
- **Backend:**
  - **Runtime:** Node.js (v20+)
  - **Framework:** Express 4
  - **Database Driver:** PostgreSQL (`pg` connection pool with safe fallback)
  - **Middleware:** CORS, JSON body parser, URL-encoded body parser, request logger, centralized error handler
  - **Test Runner:** Node.js native test runner (`node:test`)

---

## Directory Architecture

```
TryItOn/
├── .gitignore
├── .env.example
├── package.json
├── README.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── db.js
│       │   └── index.js
│       ├── controllers/
│       │   └── health.controller.js
│       ├── middleware/
│       │   ├── errorHandler.js
│       │   └── requestLogger.js
│       ├── models/
│       │   └── index.js
│       ├── routes/
│       │   ├── health.routes.js
│       │   └── index.js
│       ├── services/
│       │   └── health.service.js
│       └── tests/
│           └── health.test.js
└── frontend/
    ├── .env
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    ├── public/
    │   └── vite.svg
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── assets/
        │   └── index.js
        ├── components/
        │   ├── Footer.jsx
        │   ├── HealthStatusBadge.jsx
        │   └── Navbar.jsx
        ├── hooks/
        │   └── useApiHealth.js
        ├── layouts/
        │   └── RootLayout.jsx
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── HomePage.jsx
        │   └── NotFoundPage.jsx
        ├── services/
        │   └── api.js
        └── utils/
            └── formatters.js
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x (tested on Node v24)
- **npm** >= 9.x
- (Optional) **PostgreSQL** for database connectivity

### Installation from Scratch

You can install all dependencies from the root directory:

```bash
# Install backend and frontend dependencies
npm run install:all
```

Or install individually:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Environment Configuration

1. **Backend Environment:**
   Copy `backend/.env.example` to `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=tryiton_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tryiton_db
   ```

2. **Frontend Environment:**
   Copy `frontend/.env.example` to `frontend/.env`:
   ```env
   VITE_API_URL=/api
   ```

---

## Running the Application

### 1. Start the Backend Server

```bash
# From root
npm run dev:backend

# Or from backend directory
cd backend
npm run dev
```

The backend server runs on `http://localhost:5000`.

### 2. Start the Frontend Development Server

```bash
# From root
npm run dev:frontend

# Or from frontend directory
cd frontend
npm run dev
```

The frontend application runs on `http://localhost:5173`.

Vite is configured with a dev proxy forwarding all `/api/*` calls directly to `http://localhost:5000`.

---

## API Endpoints

### Health Check

- **URL:** `/api/health`
- **Method:** `GET`
- **Description:** Verifies service uptime, server health, and PostgreSQL connection pool status.
- **Success Response (200 OK):**
  ```json
  {
    "status": "ok",
    "message": "TryItOn API is running smoothly",
    "timestamp": "2026-10-02T07:15:00.000Z",
    "uptime": "14.20s",
    "environment": "development",
    "services": {
      "server": "healthy",
      "database": "connected"
    },
    "version": "1.0.0"
  }
  ```

---

## Running Tests

### Backend Unit & Integration Tests

```bash
# Run tests using Node.js native test runner
npm run test:backend

# Or in backend directory
cd backend
npm test
```

### Frontend Production Build Test

```bash
# Verify frontend compiles with zero errors
npm run build:frontend
```

---

## Roadmap

- [x] **Phase 0: Project Foundation** (Separation, routing, health API, 3D libraries installed)
- [ ] **Phase 1: 3D Avatar & Viewport Engine** (Three.js canvas, OrbitControls, Humanoid avatar loader)
- [ ] **Phase 2: Costume Wardrobe Catalog & Asset Delivery** (Cloudinary integration, garment meshes)
- [ ] **Phase 3: Garment Fitting & Real-time Alignment** (Anchor points, multi-size fitting)
- [ ] **Phase 4: User Authentication & Wardrobe Customization** (PostgreSQL schema, user profiles)
- [ ] **Phase 5: Advanced Simulation & Performance Polish** (Cloth shaders, lighting presets, export)
