import { Router } from 'express';
import { authenticate, enforceTenantIsolation, requirePermission, requireAnyPermission } from '../../middleware/auth.middleware';
import { staffController } from './staff.controller';
import { payrollController } from './payroll.controller';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

// Staff listing
router.get('/', requireAnyPermission('staff.view', 'settings.manage'), staffController.listStaff);

// Specific routes first to avoid shadowing by /:id
router.get('/payroll', requireAnyPermission('fees.view', 'settings.manage'), payrollController.getPayrollHistory);
router.get('/payroll/suggestion', requireAnyPermission('fees.collect', 'settings.manage'), payrollController.getSalarySuggestion);
router.post('/payroll', requireAnyPermission('fees.collect', 'settings.manage'), payrollController.recordSalaryPayment);

// Attendance management
import { staffAttendanceController } from './staff-attendance.controller';
router.post('/attendance/mark', requireAnyPermission('attendance.mark', 'settings.manage'), staffAttendanceController.markAttendance);
router.get('/attendance/daily', requireAnyPermission('attendance.view', 'settings.manage'), staffAttendanceController.getDailySummary);
router.get('/attendance/summary', requireAnyPermission('attendance.view', 'settings.manage'), staffAttendanceController.getMonthlySummary);

// Parameterized routes last
router.get('/:id', requireAnyPermission('staff.view', 'settings.manage'), staffController.getStaffById);
router.post('/', requirePermission('settings.manage'), staffController.createStaff);
router.patch('/:id', requirePermission('settings.manage'), staffController.updateStaff);
router.delete('/:id', requirePermission('settings.manage'), staffController.deleteStaff);

export default router;
