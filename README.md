# TryItOn — AI-Powered Virtual Trial Room Platform

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-Native%20WAL-lightblue.svg)](https://sqlite.org)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-AI%20VTON-orange.svg)](https://cloudinary.com)
[![Tests](https://img.shields.io/badge/Tests-70%20Passing-success.svg)](https://nodejs.org/api/test.html)

**TryItOn** is an AI-powered web-based virtual trial room platform. It allows users to upload a personal portrait photograph, select or scrape any garment from shopping URLs, and visualize how the clothing fits on their own body using Cloudinary AI generative replacement transformations with 100% facial identity preservation.

---

## 🌟 Core Features

1. **User Photo Management**: Drag-and-drop portrait uploader, client-side preview, validation (JPG, PNG, WEBP up to 10MB), and active model gallery.
2. **Dual Product Input System**:
   - **Method A (Garment Upload)**: Direct upload of clothing images (shirts, t-shirts, dresses, jackets, kurtas, pants).
   - **Method B (Product URL Scraping)**: Automatic extraction of garment images from shopping URLs using OpenGraph, Twitter Card, and JSON-LD schema with built-in SSRF protection.
3. **Automated Preprocessing**: Pose silhouette validation, stance suitability verification, and garment canvas background isolation.
4. **Cloudinary Generative AI Transformation**: Generative clothing replacement (`gen_replace`) preserving facial features, posture, hands, and background.
5. **Interactive Result System**: Interactive before/after split comparison slider, 3-way triptych view, high-resolution direct downloads, and instantaneous session regeneration.
6. **Wardrobe & History Archive**: Filterable trial history gallery with category filters, keyword search, inspect modal, and session deletion.
7. **Production Hardening**: Helmet HTTP security headers, CORS origin protection, granular rate limiting, input sanitization, React Error Boundaries, and zero external build tool dependencies on Windows.

---

## 🏗️ Architecture

```text
                    TRYITON PLATFORM
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      FRONTEND CLIENT             BACKEND REST API
    (React 19 + Vite 8)          (Express 4.21.2)
             │                           │
             └─────────────┬─────────────┘
                           ▼
                    LOCAL DATABASE
                 (Native SQLite WAL)
                  database/tryiton.db
                           │
                           ▼
                  CLOUDINARY PIPELINE
             ┌─────────────┴─────────────┐
             ▼                           ▼
       Image Storage              AI Transformation
   (Encrypted Buckets)       (Generative Replacement)
             └─────────────┬─────────────┘
                           ▼
                  FINAL TRY-ON RESULT
             ┌─────────────┴─────────────┐
             ▼                           ▼
     Interactive Split           Persistent History
     Before/After Slider         Session Archive
```

---

## 📁 Project Structure

```text
TryItOn/
├── client/                     # Frontend (React 19, Vite 8, Lucide Icons)
│   ├── src/
│   │   ├── api/client.js       # Axios HTTP client with auth interceptors
│   │   ├── components/
│   │   │   ├── auth/           # Login & Register forms
│   │   │   ├── common/         # ErrorBoundary, Toast, Skeleton loaders
│   │   │   ├── history/        # TryOnHistory session gallery
│   │   │   ├── photos/         # PhotoUploader & Model Gallery
│   │   │   ├── products/       # ProductInput (Method A & Method B)
│   │   │   ├── results/        # TryOnResultView (Split Slider, 3-way view)
│   │   │   ├── tryon/          # TryOnStudio (Live multi-stage progress)
│   │   │   ├── Dashboard.jsx   # Interactive Onboarding & Stats
│   │   │   └── HealthStatus.jsx# Real-time backend API monitor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # JWT session management
│   │   │   └── ToastContext.jsx# Floating Toast notifications
│   │   ├── App.jsx             # Main router & responsive navigation
│   │   └── index.css           # Glassmorphism dark theme & animations
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Node.js, Express, SQLite, Cloudinary)
│   ├── src/
│   │   ├── controllers/        # Auth, Photo, Product, Preprocess, TryOn, History
│   │   ├── middleware/         # JWT Auth, Multer Upload, Security & Rate Limits
│   │   ├── routes/             # Express API Routers
│   │   ├── services/           # Cloudinary AI, Scraper (SSRF-safe), Preprocessor
│   │   ├── app.js              # Express app setup & middleware
│   │   ├── config.js           # Environment variable loader
│   │   ├── db.js               # Native SQLite initialization & indexes
│   │   └── index.js            # Server entrypoint (Port 5000)
│   ├── test/                   # Comprehensive 70-test Automated Suite
│   └── package.json
│
├── database/
│   └── tryiton.db              # Local SQLite database file (WAL mode)
├── uploads/                    # Local temporary image staging directory
├── .env                        # Local environment variables
├── .env.example                # Environment configuration template
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18.0.0` or later
- **npm**: `v9.0.0` or later

### 2. Installation
Install all dependencies across root, backend, and frontend with a single command:
```bash
npm run install:all
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Configure your environment variables:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
DATABASE_PATH=../database/tryiton.db

# Cloudinary Credentials (Optional for local development; enables live AI synthesis when set)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Running the Development Servers
Start both backend API (`:5000`) and frontend Vite (`:5173`) concurrently:
```bash
npm run dev
```

Or run them individually:
```bash
npm run dev:server   # Starts Express backend on http://localhost:5000
npm run dev:client   # Starts Vite frontend on http://localhost:5173
```

---

## 📡 REST API Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | `GET` | No | System health check and uptime status |
| `/api/auth/register` | `POST` | No | Register new user account (Bcrypt 10 rounds) |
| `/api/auth/login` | `POST` | No | Authenticate user & return JWT token |
| `/api/auth/me` | `GET` | Yes | Get authenticated user profile |
| `/api/photos` | `GET` | Yes | Get all uploaded user model photos |
| `/api/photos/upload` | `POST` | Yes | Upload user portrait photo (Multipart) |
| `/api/photos/active` | `GET` | Yes | Get currently active model photo |
| `/api/photos/:id/active` | `PUT` | Yes | Set photo as primary active trial model |
| `/api/photos/:id` | `DELETE` | Yes | Delete portrait photo |
| `/api/products` | `GET` | Yes | Get all wardrobe garments |
| `/api/products/upload` | `POST` | Yes | Method A: Upload garment image |
| `/api/products/extract-url` | `POST` | Yes | Method B: Scrape garment from shopping URL |
| `/api/products/:id` | `GET` | Yes | Get garment details by ID |
| `/api/products/:id` | `DELETE` | Yes | Remove garment from wardrobe |
| `/api/preprocess/validate-user-photo` | `POST` | Yes | Verify portrait pose & visibility |
| `/api/preprocess/prepare-garment` | `POST` | Yes | Isolate garment background & map category |
| `/api/preprocess/prepare-pair` | `POST` | Yes | Stage dual try-on pair for transformation |
| `/api/tryon/generate` | `POST` | Yes | Run Cloudinary AI Generative Try-On |
| `/api/tryon/regenerate` | `POST` | Yes | Re-run generative fitting with fresh seed |
| `/api/tryon/session/:id` | `GET` | Yes | Fetch single try-on session result |
| `/api/history` | `GET` | Yes | Fetch user try-on session history |
| `/api/history/:id` | `GET` | Yes | Fetch historical session details |
| `/api/history/:id` | `DELETE` | Yes | Delete session from history |
| `/api/history/clear-all` | `POST` | Yes | Clear entire user session history |

---

## 🧪 Testing & Verification

Run the automated test suite covering all 13 phases:
```bash
npm test
```

### Test Suite Coverage (70 Passing Tests):
- `health.test.js`: Health check API response and database heartbeat.
- `auth.test.js`: Registration, duplicate rejection, login, bcrypt hashing, JWT issuance.
- `photos.test.js`: Upload validation, formats (JPG/PNG/WEBP), active model toggles.
- `products.test.js`: Garment upload (Method A), URL scraper (Method B), OpenGraph parser.
- `preprocess.test.js`: Model pose validation, region mapping, session staging.
- `tryon.test.js`: Cloudinary AI Generative Replacement pipeline, fallback synthesis.
- `results.test.js`: Result rendering, session regeneration, and metadata retrieval.
- `history.test.js`: Session indexing, history retrieval, single deletion, clear-all.
- `security.test.js`: Helmet headers, SSRF firewall, input sanitization, token security.
- `resilience.test.js`: SQL injection resistance, cross-user isolation, error handling.
- `performance.test.js`: Database indexes in `sqlite_master`, sub-millisecond lookups, memory cache.

---

## 🛡️ Security & Privacy Guardrails

- **Zero Plaintext Passwords**: Passwords hashed with Bcrypt (10 salt rounds).
- **SSRF Defense**: URL scraper firewall blocks loopback (`127.0.0.1`, `localhost`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata APIs (`169.254.169.254`).
- **Identity & Facial Preservation**: AI transformation targets only the clothing geometry (`upper_body`, `dresses`, `outerwear`, `lower_body`), preserving the face, hair, posture, and hands.
- **Tenant Isolation**: Strict SQLite user constraints prevent unauthorized access across accounts.
- **Rate Limiting**: Defends authentication and transformation endpoints from brute-force attacks.

---

## 📜 License

This project is licensed under the ISC License.
