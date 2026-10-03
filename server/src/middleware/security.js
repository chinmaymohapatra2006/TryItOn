const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config');

// Configure Helmet for secure HTTP headers
const securityHeaders = helmet({
  contentSecurityPolicy: false, // Allows flexible inline previews during local virtual fitting
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows cross-origin image loads from Cloudinary / uploads
});

const isTest = process.env.NODE_ENV === 'test';

// Rate Limiter for Authentication endpoints (prevent brute-force logins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 1000 : 30, // 30 attempts in production/dev, higher in unit tests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

// Rate Limiter for AI Try-On Generation (prevent computational flooding)
const tryonLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 1000 : 60, // 60 try-on runs per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Try-on generation rate limit reached. Please wait a few minutes before trying again.',
  },
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 2000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many API requests from this IP, please slow down.',
  },
});

// Body parameter sanitizer (prevents XSS injection in titles / notes)
function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Strip null bytes and basic script tags
        req.body[key] = req.body[key]
          .replace(/\0/g, '')
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    }
  }
  next();
}

module.exports = {
  securityHeaders,
  authLimiter,
  tryonLimiter,
  apiLimiter,
  sanitizeInput,
};
