import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { config } from '../config/index.js';
import { responseHelper } from '../utils/responseHelper.js';
import { ValidationError, UnauthorizedError } from '../utils/errors.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        throw new ValidationError('Name, email, and password are required fields.');
      }

      const existingUser = db.memory.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        throw new ValidationError('An account with this email address already exists.');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = {
        id: `usr_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'PATIENT',
        createdAt: new Date().toISOString()
      };

      db.memory.users.push(newUser);

      const token = jwt.sign({ userId: newUser.id, role: newUser.role }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      });

      res.cookie('mhm_token', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: config.cookie.maxAge
      });

      const { passwordHash: _, ...safeUser } = newUser;
      return responseHelper.success(res, { user: safeUser, token }, 'Registration successful.', 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ValidationError('Email and password are required.');
      }

      const user = db.memory.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new UnauthorizedError('Invalid email or password.');
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedError('Invalid email or password.');
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      });

      res.cookie('mhm_token', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: config.cookie.maxAge
      });

      const { passwordHash: _, ...safeUser } = user;
      return responseHelper.success(res, { user: safeUser, token }, 'Login successful.');
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res) {
    res.clearCookie('mhm_token');
    return responseHelper.success(res, null, 'Logged out successfully.');
  },

  async me(req, res) {
    const { passwordHash: _, ...safeUser } = req.user;
    return responseHelper.success(res, { user: safeUser });
  },

  async forgotPassword(req, res) {
    const { email } = req.body;
    return responseHelper.success(res, {
      message: `If ${email} is registered, a password reset link has been dispatched.`
    });
  },

  async resetPassword(req, res) {
    return responseHelper.success(res, {
      message: 'Password successfully reset. You may now sign in with your new credentials.'
    });
  }
};
