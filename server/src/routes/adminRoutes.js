import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/stats', authenticate, requireRole('ADMIN'), adminController.getOperationalStats);
router.get('/users', authenticate, requireRole('ADMIN'), adminController.getUsersList);

export default router;
