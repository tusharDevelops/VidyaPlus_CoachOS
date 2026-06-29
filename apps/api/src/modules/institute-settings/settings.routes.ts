import { Router } from 'express';
import { authenticate, enforceTenantIsolation, requirePermission } from '../../middleware/auth.middleware';
import { settingsController } from './settings.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/profile', requirePermission('settings.manage'), settingsController.getProfile);
router.patch('/profile', requirePermission('settings.manage'), settingsController.updateProfile);

export default router;
