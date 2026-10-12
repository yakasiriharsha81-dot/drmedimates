import { app } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 myHealthMate AI server is active at http://localhost:${PORT}`);
  logger.info(`✨ Mode: ${config.env.toUpperCase()} | AI Provider: ${config.ai.provider}`);
  logger.info(`🩺 Open browser at http://localhost:${PORT}/index.html to explore the client.`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});
