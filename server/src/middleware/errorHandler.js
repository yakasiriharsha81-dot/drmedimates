import { logger } from '../utils/logger.js';
import { responseHelper } from '../utils/responseHelper.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[API Error] ${req.method} ${req.url} - ${statusCode}: ${message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    details: err.details
  });

  responseHelper.error(res, message, statusCode, err.details);
};
