import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import bcrypt from 'bcryptjs';
import { authService } from '../auth/auth.service';
import { sendOtpEmail } from '../../lib/mailer';
import { generateSubdomain } from '../../lib/subdomain';
import { utils } from '../../lib/utils';

const prisma = new PrismaClient();
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export const publicController = {
  // ---------- List Plans for Marketing ----------
  async listPlans(_req: Request, res: Response) {
    try {
      const plans = await prisma.plan.findMany({
        where: { status: 'active' },
        orderBy: { priceMonthly: 'asc' },
        select: {
          id: true,
          name: true,
          maxStudents: true,
          maxStaff: true,
          maxBatches: true,
          maxStorageMb: true,
          priceMonthly: true,
          featuresJson: true,
        },
      });
      res.json({ success: true, data: plans });
    } catch (error: any) {
      logger.error('Failed to list public plans', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch pricing plans' });
    }
  },

  // ---------- List Featured Institutes ----------
  async getFeaturedInstitutes(_req: Request, res: Response) {
    try {
      const institutes = await prisma.institute.findMany({
        where: { isFeatured: true, status: 'active' },
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      });
      res.json({ success: true, data: institutes });
    } catch (error: any) {
      logger.error('Failed to list featured institutes', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch featured institutes' });
    }
  },

  // ---------- Send Registration OTP ----------
  async sendRegistrationOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }

      // Check if this email is already registered as an institute owner
      const existingOwner = await prisma.user.findFirst({
        where: { email, role: 'owner' }
      });
      if (existingOwner) {
        return res.status(400).json({ 
          success: false, 
          error: 'This email is already registered with an institute. Please log in instead.' 
        });
      }

      // Generate 6‑digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
      // Store OTP
      await prisma.otpStore.create({
        data: {
          email,
          hashedOtp,
          purpose: 'email_verify',
          expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || '10') * 60 * 1000),
        },
      });
      // Send email
      await sendOtpEmail(email, otp);
      res.json({ success: true, data: { message: 'OTP sent to email' } });
    } catch (error: any) {
      logger.error('Failed to send registration OTP', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
  },

  // ---------- Verify OTP Only (Step 2) ----------
  async verifyRegistrationOtpOnly(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      const otpRecord = await prisma.otpStore.findFirst({
        where: { email, purpose: 'email_verify', verified: false, expiresAt: { gte: new Date() } },
        orderBy: { createdAt: 'desc' },
      });
      
      if (!otpRecord) {
        return res.status(400).json({ success: false, error: 'OTP expired or not found' });
      }
      
      const isMatch = await bcrypt.compare(otp, otpRecord.hashedOtp);
      if (!isMatch) {
        await prisma.otpStore.update({
          where: { id: otpRecord.id },
          data: { attempts: { increment: 1 } },
        });
        return res.status(400).json({ success: false, error: 'Invalid OTP' });
      }
      
      // Mark as verified
      await prisma.otpStore.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });
      
      res.json({ success: true, data: { message: 'OTP verified successfully' } });
    } catch (error: any) {
      logger.error('Failed to verify OTP', { error: error.message });
      res.status(500).json({ success: false, error: 'Verification failed' });
    }
  },

  // ---------- Verify OTP & Create Account ----------
  async verifyRegistrationOtp(req: Request, res: Response) {
    try {
      const { email, name, instituteName, password, planId, otp } = req.body;
      if (!email || !name || !instituteName || !password || !planId || !otp) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      // Retrieve OTP record
      const otpRecord = await prisma.otpStore.findFirst({
        where: { email, purpose: 'email_verify', verified: false, expiresAt: { gte: new Date() } },
        orderBy: { createdAt: 'desc' },
      });
      if (!otpRecord) {
        return res.status(400).json({ success: false, error: 'OTP expired or not found' });
      }
      const isMatch = await bcrypt.compare(otp, otpRecord.hashedOtp);
      if (!isMatch) {
        await prisma.otpStore.update({
          where: { id: otpRecord.id },
          data: { attempts: { increment: 1 } },
        });
        return res.status(400).json({ success: false, error: 'Invalid OTP' });
      }
      // Mark OTP as verified
      await prisma.otpStore.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      const subdomain = await generateSubdomain(instituteName);

      // Check if institute name or subdomain is already taken
      const existingInstitute = await prisma.institute.findFirst({
        where: { OR: [{ name: instituteName }, { subdomain }] }
      });
      if (existingInstitute) {
        return res.status(400).json({ success: false, error: 'Institute name is already taken' });
      }

      // Default all new registrations to the Aarambh (Free) plan
      const AARAMBH_PLAN_ID = '00000000-0000-0000-0000-000000000001';

      const institute = await prisma.institute.create({
        data: {
          name: instituteName,
          subdomain,
          email,
          status: 'active',
          planId: AARAMBH_PLAN_ID,
        },
      });

      // Create owner user
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          instituteId: institute.id,
          name,
          email,
          passwordHash,
          role: 'owner',
          status: 'active',
        },
      });

      // Auto‑login
      const tokens = await authService.generateTokens(user);
      res.json({ 
        success: true, 
        data: { 
          ...tokens, 
          user: { id: user.id, name: user.name, email: user.email } 
        } 
      });
    } catch (error: any) {
      logger.error('Failed to verify registration OTP', { error: error.message });
      res.status(500).json({ success: false, error: 'Registration failed' });
    }
  },
};
