import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export const storageService = {
  getFilePath(storageKey) {
    const fullPath = path.resolve(config.storage.localDir, path.basename(storageKey));
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundError('Medical report file not found on private storage.');
    }
    return fullPath;
  },

  deleteFile(storageKey) {
    try {
      const fullPath = path.resolve(config.storage.localDir, path.basename(storageKey));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
};
