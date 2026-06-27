import { Router } from 'express';
import { authenticate, enforceTenantIsolation } from '../../middleware/auth.middleware';
import { notificationController } from './notification.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', notificationController.listNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/triggers/reminders', notificationController.generateFeeReminders);

export default router;
