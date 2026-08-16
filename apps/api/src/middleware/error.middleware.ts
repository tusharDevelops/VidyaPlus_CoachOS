import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

/**
 * Global error handler middleware.
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  console.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';

  // Handle Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Unique constraint failed on the database';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  } else if (statusCode >= 500) {
    message = process.env.NODE_ENV === 'production' 
      ? 'An unexpected technical error occurred. Our team has been notified.' 
      : message;
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

/**
 * 404 handler for unknown routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`
  });
}
