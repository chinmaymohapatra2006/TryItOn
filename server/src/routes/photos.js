const express = require('express');
const multer = require('multer');
const photoController = require('../controllers/photoController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Error-handling wrapper for Multer single file upload
function handleUploadMiddleware(req, res, next) {
  const uploadSingle = upload.single('image');
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File Too Large',
          message: 'The uploaded file exceeds the 10MB limit. Please upload a smaller image.',
        });
      }
      return res.status(400).json({
        error: 'Upload Error',
        message: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        error: 'Validation Error',
        message: err.message,
      });
    }
    next();
  });
}

// All photo endpoints require authentication
router.use(authenticateToken);

// Upload photo endpoint
router.post('/upload', handleUploadMiddleware, photoController.uploadUserPhoto);

// Get all photos for current user
router.get('/', photoController.getUserPhotos);

// Get current active model photo
router.get('/active', photoController.getActivePhoto);

// Set photo as active
router.put('/:id/active', photoController.setActivePhoto);

// Delete photo
router.delete('/:id', photoController.deletePhoto);

module.exports = router;
