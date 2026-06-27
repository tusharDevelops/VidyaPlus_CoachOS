import { Router } from 'express';
import { createCheckoutSession, dodopayWebhook } from './payments.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Webhook endpoint (must receive raw body before express.json parsing in app.ts)
router.post('/webhook', dodopayWebhook);

// Protected routes
router.post('/create-checkout-session', authenticate, createCheckoutSession);

export default router;
