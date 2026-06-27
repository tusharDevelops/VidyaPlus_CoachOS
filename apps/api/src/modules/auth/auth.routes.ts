import { Router } from 'express';
import { authController } from './auth.controller';
import { forgotPasswordController } from './forgot-password.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', authController.login);
router.post('/super-admin/login', authController.superAdminLogin);
router.post('/otp/send-login', authController.sendLoginOtp);
router.post('/otp/verify-login', authController.verifyLoginOtp);
router.post('/otp/select-profile', authController.selectProfile);
router.post('/otp/send-verification', authController.sendVerificationOtp);

// Forgot Password flow
router.post('/forgot-password', forgotPasswordController.requestOtp);
router.post('/verify-reset-otp', forgotPasswordController.verifyOtp);
router.post('/reset-password', forgotPasswordController.resetPassword);

router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
