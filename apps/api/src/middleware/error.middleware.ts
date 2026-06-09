import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

/**
 * Global error handler middleware.
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  
  // Obscure 500-level database and system errors from real users
  let message = err.message;
  if (statusCode === 500 || statusCode >= 500) {
    message = 'An unexpected technical error occurred. Our team has been notified.';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || 'INTERNAL_ERROR',
  });
}

/**
 * 404 handler for unknown routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
}
