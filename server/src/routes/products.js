const express = require('express');
const multer = require('multer');
const productController = require('../controllers/productController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Error handling wrapper for Multer single file upload
function handleUploadMiddleware(req, res, next) {
  const uploadSingle = upload.single('image');
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File Too Large',
          message: 'The uploaded garment image exceeds the 10MB limit.',
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

// Method A: Upload garment image
router.post('/upload', authenticateToken, handleUploadMiddleware, productController.uploadProductImage);

// Method B: Extract garment from shopping URL
router.post('/extract-url', authenticateToken, productController.extractProductFromUrl);

// List products
router.get('/', authenticateToken, productController.getProducts);

// Get single product
router.get('/:id', authenticateToken, productController.getProductById);

// Delete product
router.delete('/:id', authenticateToken, productController.deleteProduct);

module.exports = router;
