import { Router } from 'express';
import { createCheckoutSession, dodopayWebhook, cancelSubscription, reactivateSubscription, getSubscriptionDetails } from './payments.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Webhook health check (GET) - verify the route is reachable
router.get('/webhook', (_req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Webhook endpoint is reachable',
    webhookKeyConfigured: !!process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint — receives JSON-parsed body which the SDK expects
router.post('/webhook', dodopayWebhook);

// Protected routes
router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.post('/cancel-subscription', authenticate, cancelSubscription);
router.post('/reactivate-subscription', authenticate, reactivateSubscription);
router.get('/subscription-details', authenticate, getSubscriptionDetails);

export default router;
