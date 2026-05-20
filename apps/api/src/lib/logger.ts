import winston from 'winston';

let logger: any;

if (process.env.CLOUDFLARE_WORKER === 'true') {
  logger = {
    info: (msg: string, ...meta: any[]) => console.log(`[INFO] ${msg}`, ...meta),
    error: (msg: string, ...meta: any[]) => console.error(`[ERROR] ${msg}`, ...meta),
    warn: (msg: string, ...meta: any[]) => console.warn(`[WARN] ${msg}`, ...meta),
    debug: (msg: string, ...meta: any[]) => console.debug(`[DEBUG] ${msg}`, ...meta),
  };
} else {
  logger = winston.createLogger({
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
}

export default logger;
