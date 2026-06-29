import { Router } from 'express';
import { authenticate, enforceTenantIsolation, requirePermission } from '../../middleware/auth.middleware';
import { notificationController } from './notification.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', requirePermission('notifications.view'), notificationController.listNotifications);
router.patch('/read-all', requirePermission('notifications.view'), notificationController.markAllRead);
router.patch('/:id/read', requirePermission('notifications.view'), notificationController.markAsRead);
router.post('/triggers/reminders', requirePermission('notifications.send'), notificationController.generateFeeReminders);

export default router;
