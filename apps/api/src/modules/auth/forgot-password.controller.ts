import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '../../lib/mailer';
import logger from '../../lib/logger';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const forgotPasswordController = {
  /**
   * POST /api/v1/auth/forgot-password
   * Request OTP for password reset
   */
  async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      // Check if user exists as owner
      const user = await prisma.user.findFirst({
        where: { email, status: 'active', role: 'owner' },
      });

      if (!user) {
        // We return success even if user doesn't exist for security (avoid enumeration)
        res.json({ success: true, message: 'If an account exists with this email, an OTP has been sent.' });
        return;
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
      const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');

      // Create OTP in store
      await prisma.otpStore.create({
        data: {
          email,
          hashedOtp,
          purpose: 'forgot_password',
          expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
        },
      });

      // Send email
      await sendOtpEmail(email, otp);

      logger.info(`[AUTH] Forgot password OTP sent to ${email}`);
      
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/verify-reset-otp
   * Verify OTP before resetting password
   */
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = verifyOtpSchema.parse(req.body);

      const otpRecord = await prisma.otpStore.findFirst({
        where: { email, purpose: 'forgot_password' },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        res.status(400).json({ success: false, error: 'OTP expired or not found', code: 'OTP_EXPIRED' });
        return;
      }

      if (otpRecord.attempts >= 5) {
        res.status(429).json({ success: false, error: 'Too many attempts', code: 'TOO_MANY_ATTEMPTS' });
        return;
      }

      const isMatch = await bcrypt.compare(otp, otpRecord.hashedOtp);
      if (!isMatch) {
        await prisma.otpStore.update({
          where: { id: otpRecord.id },
          data: { attempts: { increment: 1 } },
        });
        res.status(400).json({ success: false, error: 'Invalid OTP', code: 'INVALID_OTP' });
        return;
      }

      // Mark as verified
      await prisma.otpStore.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/reset-password
   * Set new password using verified OTP
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

      const otpRecord = await prisma.otpStore.findFirst({
        where: { email, purpose: 'forgot_password' },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord || !otpRecord.verified || otpRecord.expiresAt < new Date()) {
        res.status(400).json({ success: false, error: 'Invalid or expired session', code: 'INVALID_SESSION' });
        return;
      }

      // Verify OTP again just to be sure (in case of direct call)
      const isMatch = await bcrypt.compare(otp, otpRecord.hashedOtp);
      if (!isMatch) {
        res.status(400).json({ success: false, error: 'Invalid OTP', code: 'INVALID_OTP' });
        return;
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Update owner with this email
      await prisma.user.updateMany({
        where: { email, status: 'active', role: 'owner' },
        data: { passwordHash },
      });

      // Delete OTP record
      await prisma.otpStore.delete({ where: { id: otpRecord.id } });

      logger.info(`[AUTH] Password reset successful for ${email}`);

      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  },
};
