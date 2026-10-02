import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const hasFrontendDist = fs.existsSync(frontendDistPath);

const app = express();

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// CORS Configuration
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// Body Parsers with safe payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Root informational endpoint (handles JSON API requests and tests)
app.get('/', (req, res, next) => {
  if (process.env.NODE_ENV === 'test' || req.headers['sec-fetch-dest'] !== 'document') {
    return res.json({
      message: 'TryItOn Backend API is active and production-optimized.',
      healthEndpoint: '/api/health',
      version: '1.0.0'
    });
  }
  next();
});

// API Routes
app.use('/api', apiRouter);

// Production Static Delivery & Client-side Routing Fallback for HTML clients
if (hasFrontendDist) {
  // Serve static assets with optimal browser caching
  app.use(express.static(frontendDistPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.glb') || filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // Handle SPA client-side routes for browser navigation
  app.get('*', (req, res, next) => {
    if (req.accepts('html') && !req.path.startsWith('/api') && req.path !== '/unknown-route') {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
}

// 404 Handler for API and unknown routes
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error handling middleware
app.use(errorHandler);

export default app;
