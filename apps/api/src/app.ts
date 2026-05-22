import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import superAdminRoutes from './modules/super-admin/super-admin.routes';
import studentRoutes from './modules/students/student.routes';
import batchRoutes from './modules/batches/batch.routes';
import feePlanRoutes from './modules/fee-plans/fee-plan.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import feeRoutes from './modules/fees/fee.routes';
import staffRoutes from './modules/staff/staff.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import reportRoutes from './modules/reports/report.routes';
import settingsRoutes from './modules/institute-settings/settings.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import publicRoutes from './modules/public/public.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim()),
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2000, // 2000 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests', code: 'RATE_LIMITED' },
});
app.use(limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Very lenient for active user/agent pair testing
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts', code: 'AUTH_RATE_LIMITED' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('dev'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'coachOS-api' });
});

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/batches', batchRoutes);
app.use('/api/v1/fee-plans', feePlanRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/wallet', walletRoutes);

// 404 and error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
