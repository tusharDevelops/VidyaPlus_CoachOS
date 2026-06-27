import { Router } from 'express';
import { authenticate, enforceTenantIsolation, requirePermission } from '../../middleware/auth.middleware';
import { studentController } from './student.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', requirePermission('students.view'), studentController.list);
router.get('/:id', requirePermission('students.view'), studentController.get);
router.post('/', requirePermission('students.add'), studentController.create);
router.patch('/:id', requirePermission('students.edit'), studentController.update);
router.delete('/:id', requirePermission('students.delete'), studentController.delete);
router.post('/:id/send-email', requirePermission('students.edit'), studentController.sendEmail);

export default router;
