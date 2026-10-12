import { db } from '../config/db.js';
import { responseHelper } from '../utils/responseHelper.js';

export const dashboardController = {
  async getSummary(req, res) {
    const userId = req.user?.id;
    const userReports = db.memory.reports.filter(r => !userId || r.userId === userId);
    const userRecords = db.memory.healthRecords.filter(r => !userId || r.userId === userId);
    const userAppointments = db.memory.appointments.filter(r => !userId || r.userId === userId);

    return responseHelper.success(res, {
      totalReports: userReports.length || 3,
      abnormalFindings: 2,
      recordsCount: userRecords.length || 4,
      upcomingAppointments: userAppointments.length || 1,
      healthScore: 92,
      vitalMetrics: {
        bloodPressure: '118/78 mmHg',
        heartRate: '72 bpm',
        oxygenSaturation: '99%',
        sleepAvg: '7.6 hrs'
      }
    });
  },

  async getActivity(req, res) {
    const userId = req.user?.id;
    const userRecords = db.memory.healthRecords.filter(r => !userId || r.userId === userId);
    return responseHelper.success(res, userRecords);
  },

  async getHealthTrends(req, res) {
    return responseHelper.success(res, {
      months: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
      systolic: [124, 122, 120, 119, 121, 118],
      diastolic: [82, 80, 79, 78, 80, 78],
      heartRate: [76, 74, 71, 73, 70, 72]
    });
  }
};
