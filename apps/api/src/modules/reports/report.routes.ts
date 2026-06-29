import { Router } from 'express';
import { authenticate, enforceTenantIsolation, requirePermission } from '../../middleware/auth.middleware';
import { reportController } from './report.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/fee-summary', requirePermission('reports.view'), reportController.getFeeReport);
router.get('/attendance-summary', requirePermission('reports.view'), reportController.getAttendanceReport);

export default router;
