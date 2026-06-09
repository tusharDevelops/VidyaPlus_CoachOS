import { Router } from 'express';
import { examController } from './exam.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all exam routes
router.use(authenticate);

// Student Routes
router.get(
  '/my-results',
  examController.getMyResults
);

// Exam Management
router.post(
  '/',
  requirePermission('exams.manage'),
  examController.create
);

router.get(
  '/batch/:batchId',
  requirePermission('exams.view'),
  examController.getByBatch
);

router.delete(
  '/:examId',
  requirePermission('exams.manage'),
  examController.delete
);

// Exam Results
router.post(
  '/:examId/results',
  requirePermission('exams.manage'),
  examController.submitResults
);

export default router;
