import { Router } from 'express';
import multer from 'multer';
import { 
  uploadMediaFile, 
  listMediaAssets, 
  getMediaDetails, 
  getCloudinaryStatus 
} from '../controllers/media.controller.js';
import { requireMediaAuth } from '../middleware/auth.js';

const router = Router();

// Multer memory storage configuration for streaming to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, AVIF) are accepted.'), false);
    }
  },
});

// Status check (Public)
router.get('/status', getCloudinaryStatus);

// Public media asset retrieval
router.get('/', listMediaAssets);
router.get('/:id', getMediaDetails);

// Protected upload endpoint (Requires authorization key)
router.post('/upload', requireMediaAuth, upload.single('file'), uploadMediaFile);

export default router;
