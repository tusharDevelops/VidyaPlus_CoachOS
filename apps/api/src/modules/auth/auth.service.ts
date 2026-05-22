import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { DEFAULT_ROLE_PERMISSIONS, JwtPayload, Permission } from '@coachos/shared';

const BCRYPT_ROUNDS = 12;

/**
 * Generate a 6-digit OTP
 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate JWT access token (short-lived)
 */
function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
  });
}

/**
 * Generate JWT refresh token (long-lived)
 */
function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export const authService = {
  /**
   * Generate tokens for a user (used by login and impersonation)
   */
  async generateTokens(user: any) {
    const permissions = (user.permissionsJson as any[])?.length > 0
      ? (user.permissionsJson as any[])
      : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

    const jwtPayload: JwtPayload = {
      userId: user.id,
      instituteId: user.instituteId,
      role: user.role as any,
      permissions,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken();

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  },

  /**
   * Login with phone + password (for Owner, Staff, Teacher, Accountant)
   */
  async loginWithPassword(email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        email,
        status: 'active',
        role: 'owner',
      },
      include: { institute: true },
    });

    if (!user || !user.passwordHash) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    // Check if institute is active (for non-super-admin)
    if (user.role !== 'super_admin' && user.institute && user.institute.status !== 'active') {
      throw Object.assign(new Error('Your institute account is suspended. Please contact support.'), {
        statusCode: 403,
        code: 'INSTITUTE_SUSPENDED',
      });
    }

    const permissions = (user.permissionsJson as Permission[]).length > 0
      ? (user.permissionsJson as Permission[])
      : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

    const jwtPayload: JwtPayload = {
      userId: user.id,
      instituteId: user.instituteId,
      role: user.role as any,
      permissions,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken();

    // Store refresh token in DB
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`User logged in: ${user.email} (${user.role})`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        instituteName: user.institute?.name || null,
        permissions,
      },
    };
  },

  /**
   * Login with email + password (for Super Admin)
   */
  async loginSuperAdmin(email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: { email, role: 'super_admin', status: 'active' },
    });

    if (!user || !user.passwordHash) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    }

    const jwtPayload: JwtPayload = {
      userId: user.id,
      instituteId: null,
      role: 'super_admin',
      permissions: [],
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken();

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`Super Admin logged in: ${user.email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  /**
   * Send login OTP via email (for Student & Staff)
   */
  async sendLoginOtp(email: string, portal: 'student' | 'staff') {
    // Check for lockout
    const recentAttempts = await prisma.otpStore.count({
      where: {
        email,
        purpose: 'login',
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
        attempts: { gte: 5 },
      },
    });

    if (recentAttempts > 0) {
      throw Object.assign(new Error('Too many OTP attempts. Try again later.'), {
        statusCode: 429,
        code: 'OTP_LOCKOUT',
      });
    }

    // Role filter based on portal
    const roleFilter = portal === 'student' ? 'student' : { in: ['teacher', 'accountant', 'staff', 'admin', 'custom'] };

    // Check if any user exists with this email for the portal
    const users = await prisma.user.findMany({
      where: { 
        email, 
        role: roleFilter, 
        status: 'active',
        emailVerified: true // Only allow verified users to send OTP
      },
    });

    if (users.length === 0) {
      throw Object.assign(new Error(`No verified ${portal} account found with this email. Please contact your administrator.`), {
        statusCode: 403,
        code: 'USER_UNVERIFIED',
      });
    }

    const otp = generateOtp();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Upsert OTP store
    await prisma.otpStore.create({
      data: {
        email,
        hashedOtp,
        purpose: 'login',
        expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      },
    });

    // We will need to update mailer.ts to include sendLoginOtpEmail
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { sendLoginOtpEmail } = require('../../lib/mailer');
    await sendLoginOtpEmail(email, otp);

    logger.info(`[AUTH] Login OTP sent to ${email} for ${portal} portal. [DEV OTP: ${otp}]`);

    return { message: 'OTP sent successfully', expiresInMinutes: expiryMinutes };
  },

  /**
   * Verify login OTP
   */
  async verifyLoginOtp(email: string, otp: string, portal: 'student' | 'staff') {
    const otpRecord = await prisma.otpStore.findFirst({
      where: { email, purpose: 'login', verified: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw Object.assign(new Error('OTP expired or not found'), { statusCode: 400, code: 'OTP_EXPIRED' });
    }

    if (otpRecord.attempts >= 5) {
      throw Object.assign(new Error('Too many failed attempts'), { statusCode: 429, code: 'OTP_MAX_ATTEMPTS' });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.hashedOtp);
    if (!isMatch) {
      await prisma.otpStore.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw Object.assign(new Error('Invalid OTP'), { statusCode: 400, code: 'INVALID_OTP' });
    }

    // OTP is valid
    await prisma.otpStore.update({ where: { id: otpRecord.id }, data: { verified: true } });

    // Fetch users for this portal
    const roleFilter = portal === 'student' ? 'student' : { in: ['teacher', 'accountant', 'staff', 'admin', 'custom'] };
    const users = await prisma.user.findMany({
      where: { email, role: roleFilter, status: 'active' },
      include: { institute: true },
    });

    if (users.length === 0) {
      throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'USER_NOT_FOUND' });
    }

    // Mark email as verified if it wasn't
    // REMOVED: Students/Staff cannot verify themselves via login OTP. 
    // They must be verified by the owner during creation or via admin panel.

    if (users.length === 1) {
      const user = users[0];
      const { accessToken, refreshToken } = await this.generateTokens(user);
      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      
      const permissions = (user.permissionsJson as Permission[]).length > 0
        ? (user.permissionsJson as Permission[])
        : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

      return {
        type: 'authenticated',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          instituteId: user.instituteId,
          instituteName: user.institute?.name || null,
          permissions,
        },
      };
    }

    // Multiple profiles - generate a short-lived session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    await prisma.otpStore.update({
      where: { id: otpRecord.id },
      data: { sessionToken },
    });

    return {
      type: 'select_profile',
      sessionToken,
      profiles: users.map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        instituteName: u.institute?.name || 'Unknown Institute',
        photoUrl: u.photoUrl,
      })),
    };
  },

  /**
   * Select a profile after OTP verification
   */
  async selectProfile(sessionToken: string, userId: string) {
    const otpRecord = await prisma.otpStore.findFirst({
      where: { sessionToken, purpose: 'login', verified: true, expiresAt: { gte: new Date() } },
    });

    if (!otpRecord) {
      throw Object.assign(new Error('Invalid or expired session'), { statusCode: 401, code: 'INVALID_SESSION' });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, email: otpRecord.email, status: 'active' },
      include: { institute: true },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'USER_NOT_FOUND' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    // Invalidate session to prevent reuse
    await prisma.otpStore.delete({ where: { id: otpRecord.id } });

    const permissions = (user.permissionsJson as Permission[]).length > 0
      ? (user.permissionsJson as Permission[])
      : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        instituteName: user.institute?.name || null,
        permissions,
      },
    };
  },

  /**
   * Send email verification OTP (used during student/staff creation)
   */
  async sendVerificationOtp(email: string) {
    const otp = generateOtp();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.otpStore.create({
      data: {
        email,
        hashedOtp,
        purpose: 'email_verify',
        expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { sendOtpEmail } = require('../../lib/mailer');
    await sendOtpEmail(email, otp);

    logger.info(`[AUTH] Verification OTP sent to ${email}. [DEV OTP: ${otp}]`);
    return { message: 'Verification OTP sent successfully', expiresInMinutes: expiryMinutes };
  },

  /**
   * Verify email verification OTP
   */
  async verifyEmailOtp(email: string, otp: string) {
    const otpRecord = await prisma.otpStore.findFirst({
      where: { email, purpose: 'email_verify', verified: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw Object.assign(new Error('OTP expired or not found'), { statusCode: 400, code: 'OTP_EXPIRED' });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.hashedOtp);
    if (!isMatch) {
      await prisma.otpStore.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw Object.assign(new Error('Invalid OTP'), { statusCode: 400, code: 'INVALID_OTP' });
    }

    await prisma.otpStore.update({ where: { id: otpRecord.id }, data: { verified: true } });
    return { verified: true };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    const tokenRecords = await prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
      include: { user: { include: { institute: true } } },
    });

    // Find matching token
    let matchedRecord = null;
    for (const record of tokenRecords) {
      const isMatch = await bcrypt.compare(refreshToken, record.tokenHash);
      if (isMatch) {
        matchedRecord = record;
        break;
      }
    }

    if (!matchedRecord) {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401, code: 'INVALID_REFRESH_TOKEN' });
    }

    const user = matchedRecord.user;
    const permissions = (user.permissionsJson as Permission[]).length > 0
      ? (user.permissionsJson as Permission[])
      : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

    const jwtPayload: JwtPayload = {
      userId: user.id,
      instituteId: user.instituteId,
      role: user.role as any,
      permissions,
    };

    const accessToken = generateAccessToken(jwtPayload);

    return { accessToken };
  },

  /**
   * Logout — revoke refresh token
   */
  async logout(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    logger.info(`User logged out: ${userId}`);
  },

  /**
   * Hash a password (used during user creation)
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  },
};
