import { Router } from 'express';
import { authenticate, enforceTenantIsolation, enforceTrialStatus } from '../../middleware/auth.middleware';
import { reportController } from './report.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);
router.use(enforceTrialStatus);

router.get('/fee-summary', reportController.getFeeReport);
router.get('/attendance-summary', reportController.getAttendanceReport);

export default router;
