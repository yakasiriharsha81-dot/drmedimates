import { db } from '../config/db.js';
import { responseHelper } from '../utils/responseHelper.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { reportAnalysisService } from '../services/reportAnalysisService.js';

export const reportsController = {
  async getReports(req, res) {
    const userId = req.user?.id;
    const reports = db.memory.reports.filter(r => !userId || r.userId === userId);
    return responseHelper.success(res, reports);
  },

  async createReport(req, res, next) {
    try {
      const file = req.file;
      const fileName = file ? file.originalname : req.body.fileName || 'Uploaded_Medical_Report.pdf';
      const fileSize = file ? file.size : 1887436;
      const storageKey = file ? file.path : `uploads/private/rep_${Date.now()}.pdf`;

      const newReport = {
        id: `rep_${Date.now()}`,
        userId: req.user?.id || 'usr_demo_patient_01',
        filename: fileName,
        storageKey,
        mimeType: file ? file.mimetype : 'application/pdf',
        fileSize,
        category: req.body.category || 'Lab Work',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      };

      db.memory.reports.unshift(newReport);
      return responseHelper.success(res, newReport, 'Report uploaded successfully.', 201);
    } catch (err) {
      next(err);
    }
  },

  async getReportById(req, res, next) {
    try {
      const { id } = req.params;
      const report = db.memory.reports.find(r => r.id === id);
      if (!report) throw new NotFoundError('Medical report not found.');

      if (req.user && report.userId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('Access denied: You do not own this medical report.');
      }

      return responseHelper.success(res, report);
    } catch (err) {
      next(err);
    }
  },

  async deleteReport(req, res, next) {
    try {
      const { id } = req.params;
      const index = db.memory.reports.findIndex(r => r.id === id);
      if (index === -1) throw new NotFoundError('Medical report not found.');

      const report = db.memory.reports[index];
      if (req.user && report.userId !== req.user.id) {
        throw new ForbiddenError('Access denied: You cannot delete reports owned by other patients.');
      }

      db.memory.reports.splice(index, 1);
      return responseHelper.success(res, null, 'Medical report successfully removed.');
    } catch (err) {
      next(err);
    }
  },

  async downloadReport(req, res, next) {
    try {
      const { id } = req.params;
      const report = db.memory.reports.find(r => r.id === id);
      if (!report) throw new NotFoundError('Medical report not found.');

      if (req.user && report.userId !== req.user.id) {
        throw new ForbiddenError('Unauthorized download request.');
      }

      // Stream simulated synthetic file download
      res.setHeader('Content-Type', report.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
      return res.send(`%PDF-1.4 [myHealthMate AI - Synthetic Protected Medical Report Demonstration: ${report.filename}]`);
    } catch (err) {
      next(err);
    }
  },

  async analyzeReport(req, res, next) {
    try {
      const { id } = req.params;
      const report = db.memory.reports.find(r => r.id === id);
      if (!report) throw new NotFoundError('Medical report not found.');

      const analysis = await reportAnalysisService.processReport(report);
      return responseHelper.success(res, analysis, 'Educational report analysis generated.');
    } catch (err) {
      next(err);
    }
  },

  async getAnalysis(req, res, next) {
    try {
      const { id } = req.params;
      const lang = req.query.lang || 'en';
      const report = db.memory.reports.find(r => r.id === id) || db.memory.reports[0];

      if (!report) {
        throw new NotFoundError('Medical report not found.');
      }

      const analysisData = await reportAnalysisService.processReport(report, lang);
      return responseHelper.success(res, analysisData);
    } catch (err) {
      next(err);
    }
  }
};
