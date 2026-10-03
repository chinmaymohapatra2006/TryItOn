const express = require('express');
const db = require('../db');
const config = require('../config');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    // Perform a fast DB ping query
    const dbCheck = db.prepare('SELECT 1 as alive').get();
    
    // Check Cloudinary configuration presence (do not expose secrets)
    const cloudinaryConfigured = Boolean(
      config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret
    );

    res.status(200).json({
      status: 'ok',
      service: 'TryItOn Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: dbCheck && (dbCheck.alive === 1 || dbCheck.alive === 1n) ? 'connected' : 'unknown',
      cloudinaryConfigured
    });
  } catch (error) {
    console.error('[Health Check Error]:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database health check failed',
      error: error.message
    });
  }
});

module.exports = router;
