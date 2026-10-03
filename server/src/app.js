const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { 
  securityHeaders, 
  authLimiter, 
  tryonLimiter, 
  apiLimiter, 
  sanitizeInput 
} = require('./middleware/security');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');
const productRoutes = require('./routes/products');
const preprocessRoutes = require('./routes/preprocess');
const tryonRoutes = require('./routes/tryon');
const historyRoutes = require('./routes/history');

const app = express();

// 1. Security Headers via Helmet
app.use(securityHeaders);

// 2. CORS policy configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or allowed origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      callback(null, true);
    } else {
      callback(new Error('Cross-Origin Request Blocked by CORS Security Policy'));
    }
  },
  credentials: true,
}));

// 3. Body parsers with payload limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Input Sanitization
app.use(sanitizeInput);

// 5. Global API Rate Limiting
app.use('/api', apiLimiter);

// 6. Serve static uploads for local storage mode
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

// 7. Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 8. API Routes with specialized Rate Limiters
app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/products', productRoutes);
app.use('/api/preprocess', preprocessRoutes);
app.use('/api/tryon', tryonLimiter, tryonRoutes);
app.use('/api/history', historyRoutes);

// Root fallback endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TryItOn API',
    health: '/api/health',
    docs: 'AI-Powered Virtual Trial Room Platform'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
  });
});

// Global Error Handler (sanitized error output)
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  console.error('[Unhandled Error]:', err.message);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: statusCode === 500 && !isDev ? 'Internal Server Error' : (err.name || 'Error'),
    message: statusCode === 500 && !isDev ? 'An unexpected error occurred. Please try again.' : err.message,
  });
});

module.exports = app;
