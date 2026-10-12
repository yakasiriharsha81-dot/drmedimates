import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:5000',

  jwt: {
    secret: process.env.JWT_SECRET || 'mhm_default_jwt_secret_key_123',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  cookie: {
    secret: process.env.COOKIE_SECRET || 'mhm_default_cookie_secret_456',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },

  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    localDir: process.env.STORAGE_LOCAL_DIR || './uploads/private',
    maxFileSize: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10) * 1024 * 1024
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'demo',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'demo-clinical-analyzer',
    enabled: process.env.AI_ENABLED === 'true'
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  }
};
