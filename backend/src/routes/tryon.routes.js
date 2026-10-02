import { Router } from 'express';

import {
  getCostumes,
  getCostumeById,
  getMyTryOns,
  getTryOnById,
  getMySessions
} from '../controllers/tryon.controller.js';

import { requireUserAuth } from '../middleware/jwtAuth.js';

const router = Router();

// Public costume catalog
router.get('/costumes', getCostumes);
router.get('/costumes/:id', getCostumeById);

// Protected user try-on data
router.get('/my-tryons', requireUserAuth, getMyTryOns);
router.get('/tryons/:id', requireUserAuth, getTryOnById);
router.get('/sessions', requireUserAuth, getMySessions);

export default router;
