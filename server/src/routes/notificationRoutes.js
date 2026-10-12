import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/notifications', authenticate, notificationController.getNotifications);
router.patch('/notifications/:id/read', authenticate, notificationController.markAsRead);
router.get('/profile', authenticate, notificationController.getProfile);
router.patch('/profile', authenticate, notificationController.updateProfile);
router.delete('/account', authenticate, notificationController.deleteAccount);

export default router;
