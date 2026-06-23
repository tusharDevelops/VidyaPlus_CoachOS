import { Router } from 'express';
import { walletController } from './wallet.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Webhook must be public and handle its own signature verification
import { walletWebhookHandler } from './wallet.webhook';
router.post('/webhook', walletWebhookHandler);

// All other wallet routes require authentication
router.use(authenticate);

// Only owners and accountants can view/manage wallet
router.get('/', requireRole('owner', 'accountant'), walletController.getWallet);
router.post('/top-up', requireRole('owner'), walletController.topUp);
router.post('/subscription/pay', requireRole('owner'), walletController.paySubscription);

export default router;
