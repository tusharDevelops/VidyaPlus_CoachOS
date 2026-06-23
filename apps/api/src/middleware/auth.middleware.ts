import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@coachos/shared';
import logger from '../lib/logger';
import prisma from '../lib/prisma';

// Extend Express Request to include user context
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to verify JWT access token.
 * Attaches decoded user payload to req.user.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Access token required', code: 'AUTH_REQUIRED' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' });
      return;
    }
    logger.warn('Invalid token attempt', { error: error.message });
    res.status(401).json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
}

/**
 * Middleware to check if user has required role(s).
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions', code: 'FORBIDDEN' });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user has specific permission(s).
 * Owner always has all permissions.
 */
export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' });
      return;
    }

    // Owner and Super Admin bypass permission checks
    if (req.user.role === 'owner' || req.user.role === 'super_admin') {
      next();
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.every(p => userPermissions.includes(p as any));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action',
        code: 'PERMISSION_DENIED',
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to ensure tenant isolation.
 * Validates that the user's institute_id matches the request context.
 */
export function enforceTenantIsolation(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }

  // Super admin can access any tenant
  if (req.user.role === 'super_admin') {
    next();
    return;
  }

  // All other users must have an institute_id
  if (!req.user.instituteId) {
    res.status(403).json({ success: false, error: 'No institute context', code: 'NO_TENANT' });
    return;
  }

  next();
}

/**
 * Middleware to check if user has at least one of the required permissions.
 */
export function requireAnyPermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' });
      return;
    }

    if (req.user.role === 'owner' || req.user.role === 'super_admin') {
      next();
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasAny = requiredPermissions.some(p => userPermissions.includes(p as any));

    if (!hasAny) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action',
        code: 'PERMISSION_DENIED',
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if the institute's trial has ended.
 */
export async function enforceTrialStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user || !req.user.instituteId) {
    next();
    return;
  }

  if (req.user.role === 'super_admin') {
    next();
    return;
  }

  try {
    const institute = await prisma.institute.findUnique({
      where: { id: req.user.instituteId },
      select: { trialEndsAt: true },
    });

    if (institute && institute.trialEndsAt) {
      if (new Date() > institute.trialEndsAt) {
        if (req.method !== 'GET') {
          res.status(402).json({
            success: false,
            error: 'Your trial or subscription has ended. Please make a payment to continue using CoachOS.',
            code: 'TRIAL_ENDED',
          });
          return;
        } else {
          res.setHeader('x-trial-ended', 'true');
        }
      }
    }
    next();
  } catch (error: any) {
    logger.error('Failed to check trial status', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error checking trial' });
  }
}
