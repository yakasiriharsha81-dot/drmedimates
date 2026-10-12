import { Router } from 'express';
import { reportsController } from '../controllers/reportsController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/', authenticate, reportsController.getReports);
router.post('/', authenticate, uploadMiddleware.single('file'), reportsController.createReport);
router.get('/:id', authenticate, reportsController.getReportById);
router.delete('/:id', authenticate, reportsController.deleteReport);
router.get('/:id/download', authenticate, reportsController.downloadReport);
router.post('/:id/analyze', authenticate, reportsController.analyzeReport);
router.get('/:id/analysis', authenticate, reportsController.getAnalysis);

export default router;
