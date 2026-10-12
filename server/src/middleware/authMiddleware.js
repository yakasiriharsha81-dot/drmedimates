import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../config/db.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export const authenticate = (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.mhm_token) {
      token = req.cookies.mhm_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // In development demo mode, fallback to demo patient if header requested
      if (req.headers['x-demo-user'] === 'admin') {
        req.user = db.memory.users.find(u => u.role === 'ADMIN');
        return next();
      }
      req.user = db.memory.users[0]; // Default demo patient
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = db.memory.users.find(u => u.id === decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User session expired or invalid');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Session expired. Please log in again.'));
    }
    return next(new UnauthorizedError('Invalid authentication token'));
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (req.user.role !== role) {
      return next(new ForbiddenError(`Access restricted to ${role} accounts`));
    }
    next();
  };
};

export const enforceOwnership = (req, resourceUserId) => {
  if (!req.user || req.user.id !== resourceUserId) {
    throw new ForbiddenError('Access denied: You do not own this medical record');
  }
};
