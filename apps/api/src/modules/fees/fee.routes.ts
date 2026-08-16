import { Router } from 'express';
import { authenticate, enforceTenantIsolation, requirePermission } from '../../middleware/auth.middleware';
import { feeController } from './fee.controller';
import { paymentController } from './payment.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.post('/dues/generate', requirePermission('fees.edit'), feeController.generateDues);
router.post('/student/:studentId/generate-due', requirePermission('fees.edit'), feeController.generateStudentDue);
router.post('/payments', requirePermission('fees.collect'), paymentController.recordPayment);
router.get('/dashboard', requirePermission('fees.view'), feeController.getDashboardSummary);
router.get('/student/:studentId/ledger', requirePermission('fees.view'), paymentController.getStudentLedger);
router.get('/my-ledger', paymentController.getStudentLedger); // Students can see their own ledger
router.get('/receipt/:receiptNumber', paymentController.getReceipt);

export default router;
