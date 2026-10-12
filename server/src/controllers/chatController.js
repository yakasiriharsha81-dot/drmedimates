import { db } from '../config/db.js';
import { aiService } from '../services/aiService.js';
import { responseHelper } from '../utils/responseHelper.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

export const chatController = {
  async getConversations(req, res) {
    const userId = req.user?.id || 'usr_demo_patient_01';
    const convs = db.memory.conversations
      .filter(c => c.userId === userId)
      .map(c => ({
        id: c.id,
        title: c.title,
        messageCount: c.messages ? c.messages.length : 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt || c.createdAt
      }));

    return responseHelper.success(res, convs);
  },

  async createConversation(req, res) {
    const userId = req.user?.id || 'usr_demo_patient_01';
    const { title } = req.body;

    const newConv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title: title || 'New Health Consultation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.memory.conversations.unshift(newConv);
    return responseHelper.success(res, newConv, 'Conversation created successfully.', 201);
  },

  async getMessages(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'usr_demo_patient_01';

      const conv = db.memory.conversations.find(c => c.id === id);
      if (!conv) {
        throw new NotFoundError('Conversation not found.');
      }

      if (conv.userId !== userId && req.user?.role !== 'ADMIN') {
        throw new ForbiddenError('Access denied: You cannot view conversations of other patients.');
      }

      return responseHelper.success(res, {
        conversationId: conv.id,
        title: conv.title,
        messages: conv.messages || []
      });
    } catch (err) {
      next(err);
    }
  },

  async postMessage(req, res, next) {
    try {
      const { message, conversationId, language } = req.body;
      const userId = req.user?.id || 'usr_demo_patient_01';

      if (!message || typeof message !== 'string' || !message.trim()) {
        throw new ValidationError('Message content cannot be empty.');
      }

      const trimmedMessage = message.trim();
      const userLang = language || req.headers['accept-language']?.split(',')[0] || 'en';

      // Find or create conversation
      let conv = null;
      if (conversationId) {
        conv = db.memory.conversations.find(c => c.id === conversationId);
      }

      if (!conv) {
        // Create meaningful title from first 6 words
        const words = trimmedMessage.split(' ').slice(0, 6).join(' ');
        const title = words.length > 35 ? words.substring(0, 32) + '...' : words;

        conv = {
          id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId,
          title: title || 'Health Consultation',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.memory.conversations.unshift(conv);
      }

      // Add User Message
      const userMsgObj = {
        id: `msg_u_${Date.now()}`,
        sender: 'USER',
        content: trimmedMessage,
        createdAt: new Date().toISOString()
      };
      conv.messages.push(userMsgObj);

      // Call AI Service (Real Provider or Multilingual Demo Engine)
      const aiResult = await aiService.generateChatResponse(trimmedMessage, conv.messages, userLang);

      // Add Assistant Message
      const botMsgObj = {
        id: `msg_a_${Date.now()}`,
        sender: 'ASSISTANT',
        content: aiResult.reply,
        isEmergencyAlert: Boolean(aiResult.isEmergencyAlert),
        createdAt: new Date().toISOString()
      };
      conv.messages.push(botMsgObj);

      conv.updatedAt = new Date().toISOString();

      return responseHelper.success(res, {
        conversationId: conv.id,
        conversationTitle: conv.title,
        userMessage: userMsgObj,
        assistantMessage: botMsgObj,
        reply: aiResult.reply,
        isEmergencyAlert: aiResult.isEmergencyAlert,
        isError: aiResult.isError,
        mode: aiResult.mode,
        provider: aiResult.provider
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteConversation(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'usr_demo_patient_01';

      const idx = db.memory.conversations.findIndex(c => c.id === id);
      if (idx === -1) {
        throw new NotFoundError('Conversation not found.');
      }

      const conv = db.memory.conversations[idx];
      if (conv.userId !== userId && req.user?.role !== 'ADMIN') {
        throw new ForbiddenError('Access denied: You cannot delete conversations of other patients.');
      }

      db.memory.conversations.splice(idx, 1);
      return responseHelper.success(res, null, 'Conversation deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
};
