import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/summary', authenticate, dashboardController.getSummary);
router.get('/activity', authenticate, dashboardController.getActivity);
router.get('/health-trends', authenticate, dashboardController.getHealthTrends);

export default router;
