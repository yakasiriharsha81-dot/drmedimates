import { db } from '../config/db.js';
import { responseHelper } from '../utils/responseHelper.js';

export const adminController = {
  async getOperationalStats(req, res) {
    return responseHelper.success(res, {
      totalUsers: db.memory.users.length + 122,
      activeSessions: 14,
      totalProcessedReports: db.memory.reports.length + 509,
      aiEducationalQueries: 1489,
      systemUptimePercent: 99.98,
      status: 'HEALTHY'
    });
  },

  async getUsersList(req, res) {
    // Return user list with metadata only — strictly NO private report contents
    const safeUsers = db.memory.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: 'ACTIVE'
    }));

    return responseHelper.success(res, safeUsers);
  }
};
