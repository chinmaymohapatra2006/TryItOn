import { Router } from 'express';
import healthRoutes from './health.routes.js';
import mediaRoutes from './media.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/media', mediaRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

export default router;
