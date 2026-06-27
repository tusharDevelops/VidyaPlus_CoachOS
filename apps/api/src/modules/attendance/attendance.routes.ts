import { Router } from 'express';
import { authenticate, enforceTenantIsolation, requirePermission } from '../../middleware/auth.middleware';
import { attendanceController } from './attendance.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.post('/mark', requirePermission('attendance.mark'), attendanceController.mark);
router.get('/batch/:batchId', requirePermission('attendance.view'), attendanceController.getByBatch);
router.get('/student/:studentId', requirePermission('attendance.view'), attendanceController.getByStudent);
router.get('/my-summary', attendanceController.getByStudent); // Students can always see their own
router.get('/calendar/:batchId', requirePermission('attendance.view'), attendanceController.calendar);
router.patch('/:id', requirePermission('attendance.edit'), attendanceController.update);
router.post('/lock', requirePermission('attendance.edit'), attendanceController.lock);

export default router;
