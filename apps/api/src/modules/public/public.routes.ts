import { Router } from 'express';
import { publicController } from './public.controller';

const router = Router();

// Publicly accessible plans
router.get('/plans', publicController.listPlans);

// Registration flow
router.post('/register/send-otp', publicController.sendRegistrationOtp);
router.post('/register/verify-otp-only', publicController.verifyRegistrationOtpOnly);
router.post('/register/verify', publicController.verifyRegistrationOtp);

export default router;
