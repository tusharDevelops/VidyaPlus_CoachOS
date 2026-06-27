import { Router } from 'express';
import { authenticate, enforceTenantIsolation, requirePermission } from '../../middleware/auth.middleware';
import { feePlanController } from './fee-plan.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', requirePermission('fees.view'), feePlanController.list);
router.post('/', requirePermission('fees.edit'), feePlanController.create);
router.patch('/:id', requirePermission('fees.edit'), feePlanController.update);
router.delete('/:id', requirePermission('fees.delete'), feePlanController.delete);

export default router;
