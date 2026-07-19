import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { z } from 'zod';
import { DEFAULT_ROLE_PERMISSIONS } from '@coachos/shared';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const superAdminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8),
});

const loginOtpSendSchema = z.object({
  email: z.string().email('Invalid email address'),
  portal: z.enum(['student', 'staff']),
});

const loginOtpVerifySchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  portal: z.enum(['student', 'staff']),
});

const selectProfileSchema = z.object({
  sessionToken: z.string().min(1),
  userId: z.string().uuid('Invalid user ID'),
});

const switchProfileSchema = z.object({
  targetUserId: z.string().uuid('Invalid target user ID'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

export const authController = {
  /**
   * POST /api/v1/auth/login
   * Login with email + password (Owner only)
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.loginWithPassword(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/super-admin/login
   * Login for Super Admin with email + password
   */
  async superAdminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = superAdminLoginSchema.parse(req.body);
      const result = await authService.loginSuperAdmin(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/otp/send-login
   * Send login OTP to student/staff email
   */
  async sendLoginOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, portal } = loginOtpSendSchema.parse(req.body);
      const result = await authService.sendLoginOtp(email, portal);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/otp/send-verification
   * Send email verification OTP (for owner adding student/staff)
   */
  async sendVerificationOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const emailSchema = z.object({ email: z.string().email() });
      const { email } = emailSchema.parse(req.body);
      const result = await authService.sendVerificationOtp(email);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/otp/verify-login
   * Verify login OTP
   */
  async verifyLoginOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, portal } = loginOtpVerifySchema.parse(req.body);
      const result = await authService.verifyLoginOtp(email, otp, portal);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/otp/select-profile
   * Select a profile after OTP verification if multiple accounts exist
   */
  async selectProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionToken, userId } = selectProfileSchema.parse(req.body);
      const result = await authService.selectProfile(sessionToken, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/switch-profile
   * Switch to another profile (same email) without OTP — requires authentication
   */
  async switchProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetUserId } = switchProfileSchema.parse(req.body);
      const result = await authService.switchProfile(req.user!.userId, targetUserId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/auth/switchable-profiles
   * List profiles the current user can switch to
   */
  async listSwitchableProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const profiles = await authService.listSwitchableProfiles(req.user!.userId);
      res.json({ success: true, data: profiles });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const result = await authService.refreshAccessToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/logout
   * Logout and revoke refresh token
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId);
      res.json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const { default: prisma } = await import('../../lib/prisma');
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          instituteId: true,
          photoUrl: true,
          permissionsJson: true,
          dob: true,
          address: true,
          studentProfile: {
            select: {
              id: true,
              studentCode: true,
              parentName: true,
              parentPhone: true,
              enrolledAt: true,
            }
          },
          institute: { select: { id: true, name: true, subdomain: true, status: true, setupCompleted: true } },
        },
      });

      if (!user) {
        res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' });
        return;
      }

      const permissions = (user.permissionsJson as any[])?.length > 0
        ? (user.permissionsJson as any[])
        : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

      res.json({ 
        success: true, 
        data: { 
          user: {
            ...user,
            permissions,
            permissionsJson: undefined // Hide internal field
          } 
        } 
      });
    } catch (error) {
      next(error);
    }
  },
};
