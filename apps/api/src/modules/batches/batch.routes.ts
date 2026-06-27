import { Router } from 'express';
import { authenticate, enforceTenantIsolation, requirePermission } from '../../middleware/auth.middleware';
import { batchController } from './batch.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', requirePermission('students.view'), batchController.list);
router.get('/:id', requirePermission('students.view'), batchController.get);
router.post('/', requirePermission('students.add'), batchController.create);
router.patch('/:id', requirePermission('students.edit'), batchController.update);
router.delete('/:id', requirePermission('students.delete'), batchController.delete);
router.post('/:id/enroll', requirePermission('students.add'), batchController.enroll);
router.delete('/:id/students/:studentId', requirePermission('students.edit'), batchController.unenroll);

export default router;
