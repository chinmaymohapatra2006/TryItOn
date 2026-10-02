import { Router } from 'express';
import { 
  getProfile, 
  saveMeasurements, 
  getMeasurements, 
  saveAvatar, 
  getAvatar, 
  saveLook, 
  getSavedLooks, 
  getLookById 
} from '../controllers/user.controller.js';
import { requireUserAuth } from '../middleware/jwtAuth.js';

const router = Router();

// Protect all /user routes with JWT authentication
router.use(requireUserAuth);

// Profile
router.get('/profile', getProfile);

// Measurements persistence
router.post('/measurements', saveMeasurements);
router.get('/measurements', getMeasurements);

// Avatar persistence
router.post('/avatar', saveAvatar);
router.get('/avatar', getAvatar);

// Saved Looks
router.post('/looks', saveLook);
router.get('/looks', getSavedLooks);
router.get('/looks/:id', getLookById);

export default router;
