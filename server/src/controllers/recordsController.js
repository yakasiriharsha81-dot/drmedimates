import { db } from '../config/db.js';
import { responseHelper } from '../utils/responseHelper.js';

export const recordsController = {
  async getHealthRecords(req, res) {
    const userId = req.user?.id;
    const records = db.memory.healthRecords.filter(r => !userId || r.userId === userId);
    return responseHelper.success(res, records);
  },

  async createHealthRecord(req, res) {
    const { title, category, provider, notes } = req.body;
    const newRecord = {
      id: `rec_${Date.now()}`,
      userId: req.user?.id || 'usr_demo_patient_01',
      title: title || 'New Clinical Consultation',
      category: category || 'Consultations',
      recordDate: new Date(),
      provider: provider || 'Metro Health Center',
      notes: notes || 'Routine checkup notes.',
      status: 'Completed',
      createdAt: new Date().toISOString()
    };

    db.memory.healthRecords.unshift(newRecord);
    return responseHelper.success(res, newRecord, 'Health record created.', 201);
  },

  async getHealthHistory(req, res) {
    const userId = req.user?.id;
    const history = db.memory.healthRecords.filter(r => !userId || r.userId === userId);
    return responseHelper.success(res, history);
  },

  async getAppointments(req, res) {
    const userId = req.user?.id;
    const appointments = db.memory.appointments.filter(a => !userId || a.userId === userId);
    return responseHelper.success(res, appointments);
  },

  async createAppointment(req, res) {
    const { providerName, specialty, appointmentAt, location } = req.body;
    const newApt = {
      id: `apt_${Date.now()}`,
      userId: req.user?.id || 'usr_demo_patient_01',
      providerName: providerName || 'Dr. Evelyn Reed',
      specialty: specialty || 'Internal Medicine',
      appointmentAt: appointmentAt || new Date('2026-03-15T10:00:00Z'),
      location: location || 'Metro Health Clinic',
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    db.memory.appointments.push(newApt);
    return responseHelper.success(res, newApt, 'Appointment scheduled.', 201);
  }
};
