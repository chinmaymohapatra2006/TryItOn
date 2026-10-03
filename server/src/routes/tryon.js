const express = require('express');
const tryonController = require('../controllers/tryonController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(authenticateToken);

// Generate virtual try-on
router.post('/generate', tryonController.generateTryOn);

// Regenerate virtual try-on
router.post('/regenerate', tryonController.regenerateTryOn);

// Get session by ID
router.get('/session/:id', tryonController.getSession);

module.exports = router;
