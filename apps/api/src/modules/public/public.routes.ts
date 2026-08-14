import { Router } from 'express';
import { publicController } from './public.controller';

const router = Router();

// Publicly accessible plans
router.get('/plans', publicController.listPlans);
router.get('/featured-institutes', publicController.getFeaturedInstitutes);

// Registration flow
router.post('/register/send-otp', publicController.sendRegistrationOtp);
router.post('/register/verify-otp-only', publicController.verifyRegistrationOtpOnly);
router.post('/register/verify', publicController.verifyRegistrationOtp);

// Platform settings
router.get('/system-settings/banner', publicController.getPlatformBanner);

export default router;
