import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/conversations', authenticate, chatController.getConversations);
router.post('/conversations', authenticate, chatController.createConversation);
router.get('/conversations/:id/messages', authenticate, chatController.getMessages);
router.post('/conversations/:id/messages', authenticate, chatController.postMessage);
router.post('/message', authenticate, chatController.postMessage);
router.delete('/conversations/:id', authenticate, chatController.deleteConversation);

export default router;
