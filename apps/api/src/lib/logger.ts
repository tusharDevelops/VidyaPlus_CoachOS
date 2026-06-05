import winston from 'winston';
import * as Sentry from '@sentry/node';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'coachOS-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
    }),
  ],
});

// Intercept manual logger.error calls to send them to Sentry
const originalError = logger.error.bind(logger);
logger.error = (message: any, ...meta: any[]) => {
  if (process.env.SENTRY_DSN) {
    if (message instanceof Error) {
      Sentry.captureException(message, { extra: meta[0] });
    } else {
      Sentry.captureMessage(typeof message === 'string' ? message : JSON.stringify(message), {
        level: 'error',
        extra: meta[0],
      });
    }
  }
  return originalError(message, ...meta);
};

export default logger;
