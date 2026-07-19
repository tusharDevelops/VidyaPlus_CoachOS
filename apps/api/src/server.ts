import app from './app';
import logger from './lib/logger';
import { initCronJobs } from './lib/cron';

const PORT = process.env.PORT || 3001;

// Initialize background tasks
initCronJobs();

app.listen(PORT, () => {
  logger.info(`🚀 MANEZA API server running on port ${PORT}`);
  logger.info(`📍 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`🔑 Auth API: http://localhost:${PORT}/api/v1/auth`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
