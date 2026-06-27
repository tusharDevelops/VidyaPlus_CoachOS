import { Router } from 'express';
import { authenticate, enforceTenantIsolation } from '../../middleware/auth.middleware';
import { settingsController } from './settings.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/profile', settingsController.getProfile);
router.patch('/profile', settingsController.updateProfile);

export default router;
