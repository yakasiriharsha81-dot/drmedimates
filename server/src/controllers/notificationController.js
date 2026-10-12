import { db } from '../config/db.js';
import { responseHelper } from '../utils/responseHelper.js';

export const notificationController = {
  async getNotifications(req, res) {
    const userId = req.user?.id;
    const notifs = db.memory.notifications.filter(n => !userId || n.userId === userId);
    return responseHelper.success(res, notifs);
  },

  async markAsRead(req, res) {
    const { id } = req.params;
    const notif = db.memory.notifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
    return responseHelper.success(res, notif, 'Notification marked as read.');
  },

  async getProfile(req, res) {
    const { passwordHash: _, ...safeUser } = req.user;
    return responseHelper.success(res, safeUser);
  },

  async updateProfile(req, res) {
    const { name, phone } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    const { passwordHash: _, ...safeUser } = req.user;
    return responseHelper.success(res, safeUser, 'Profile updated successfully.');
  },

  async deleteAccount(req, res) {
    const userId = req.user.id;
    const idx = db.memory.users.findIndex(u => u.id === userId);
    if (idx !== -1) db.memory.users.splice(idx, 1);
    res.clearCookie('mhm_token');
    return responseHelper.success(res, null, 'Account and related records permanently deleted.');
  }
};
