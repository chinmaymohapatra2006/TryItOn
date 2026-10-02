import { Router } from 'express';
import healthRoutes from './health.routes.js';
import mediaRoutes from './media.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/media', mediaRoutes);

export default router;
