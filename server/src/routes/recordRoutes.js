import { Router } from 'express';
import { recordsController } from '../controllers/recordsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/health-records', authenticate, recordsController.getHealthRecords);
router.post('/health-records', authenticate, recordsController.createHealthRecord);
router.get('/health-history', authenticate, recordsController.getHealthHistory);
router.get('/appointments', authenticate, recordsController.getAppointments);
router.post('/appointments', authenticate, recordsController.createAppointment);

export default router;
