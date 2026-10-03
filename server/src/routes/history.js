const express = require('express');
const historyController = require('../controllers/historyController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All history routes require authentication
router.use(authenticateToken);

// Get all try-on history
router.get('/', historyController.getHistory);

// Get single try-on session
router.get('/:id', historyController.getSessionById);

// Delete try-on session
router.delete('/:id', historyController.deleteSession);

// Clear all history
router.post('/clear-all', historyController.clearAllHistory);

module.exports = router;
