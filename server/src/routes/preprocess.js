const express = require('express');
const preprocessController = require('../controllers/preprocessController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All preprocessing routes require authentication
router.use(authenticateToken);

// Validate user photo
router.post('/validate-user-photo', preprocessController.validateUserPhoto);

// Prepare garment image
router.post('/prepare-garment', preprocessController.prepareGarment);

// Prepare dual pair for trial session
router.post('/prepare-pair', preprocessController.preparePair);

module.exports = router;
