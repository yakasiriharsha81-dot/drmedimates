import { Router } from 'express';
import { responseHelper } from '../utils/responseHelper.js';

const router = Router();

router.get('/health', (req, res) => {
  return responseHelper.success(res, {
    status: 'ONLINE',
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'myHealthMate AI Core API',
    version: '1.0.0',
    mode: 'EDUCATIONAL_DEMO'
  });
});

export default router;
