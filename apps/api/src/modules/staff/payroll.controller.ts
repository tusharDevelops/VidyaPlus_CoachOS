import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================
const recordPayrollSchema = z.object({
  staffId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMode: z.enum(['cash', 'upi', 'bank']),
  referenceNo: z.string().optional(),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

// ============================================
// Controllers
// ============================================
export const payrollController = {
  // ---------- Record Salary Payment ----------
  async recordSalaryPayment(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = recordPayrollSchema.parse(req.body);

      // Verify the staff user exists in this institute
      const staff = await prisma.user.findFirst({
        where: { id: body.staffId, instituteId, role: { notIn: ['owner', 'student'] } }
      });

      if (!staff) {
        res.status(404).json({ success: false, error: 'Staff member not found' });
        return;
      }

      // Check if duplicate payroll record for the same month and year exists
      const existing = await prisma.payrollRecord.findFirst({
        where: {
          instituteId,
          staffId: body.staffId,
          month: body.month,
          year: body.year,
        },
      });

      if (existing) {
        res.status(409).json({ success: false, error: 'Salary payment has already been recorded for this month and year' });
        return;
      }

      // Record the payroll
      const payroll = await prisma.payrollRecord.create({
        data: {
          instituteId,
          staffId: body.staffId,
          amount: body.amount,
          paymentMode: body.paymentMode,
          referenceNo: body.referenceNo,
          month: body.month,
          year: body.year,
        },
      });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'payroll.record',
          entityType: 'payroll_record',
          entityId: payroll.id,
          afterJson: { amount: body.amount, month: body.month, year: body.year },
          ipAddress: req.ip,
        }
      });

      logger.info(`Recorded salary payment of ₹${body.amount} for ${staff.name} for ${body.month}/${body.year}`);
      res.status(201).json({ success: true, data: payroll });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to record salary payment', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to record salary payment' });
    }
  },

  // ---------- Get Payroll History ----------
  async getPayrollHistory(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { staffId } = req.query;

      const where: any = { instituteId };
      if (staffId && typeof staffId === 'string') {
        where.staffId = staffId;
      }

      const history = await prisma.payrollRecord.findMany({
        where,
        include: {
          staff: { select: { name: true, phone: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalPaid = history.reduce((sum, p) => sum + Number(p.amount), 0);

      res.json({
        success: true,
        data: {
          totalPaid,
          history: history.map(p => ({
            id: p.id,
            staffName: p.staff.name,
            staffPhone: p.staff.phone,
            role: p.staff.role,
            amount: Number(p.amount),
            paymentMode: p.paymentMode,
            referenceNo: p.referenceNo,
            period: `${p.month}/${p.year}`,
            paymentDate: p.paymentDate.toISOString().split('T')[0],
          })),
        }
      });
    } catch (error: any) {
      logger.error('Failed to get payroll history', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch payroll history' });
    }
  },
  // ---------- Get Salary Suggestion based on Attendance ----------
  async getSalarySuggestion(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { staffId, month, year } = req.query;

      if (!staffId || !month || !year) {
        res.status(400).json({ success: false, error: 'staffId, month, and year are required' });
        return;
      }

      const staff = await prisma.user.findFirst({
        where: { id: staffId as string, instituteId },
        select: { baseSalary: true, name: true }
      });

      if (!staff) {
        res.status(404).json({ success: false, error: 'Staff not found' });
        return;
      }

      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
      const totalDaysInMonth = endDate.getDate();

      const attendance = await prisma.staffAttendance.findMany({
        where: {
          staffId: staffId as string,
          date: { gte: startDate, lte: endDate }
        }
      });

      const absentDays = attendance.filter((a: any) => a.status === 'absent').length;
      const halfDays = attendance.filter((a: any) => a.status === 'half_day').length;
      const leaveDays = attendance.filter((a: any) => a.status === 'leave').length; // Leaves might be paid/unpaid, assuming unpaid for "simple" logic

      const totalDeductionDays = absentDays + (halfDays * 0.5) + leaveDays;
      const baseSalary = Number(staff.baseSalary);
      const perDaySalary = baseSalary / 30; // Standardized to 30 days or totalDaysInMonth? User said "simple", usually 30 is used.
      const deductionAmount = totalDeductionDays * perDaySalary;
      const suggestedAmount = Math.max(0, baseSalary - deductionAmount);

      res.json({
        success: true,
        data: {
          baseSalary,
          totalDaysInMonth,
          absentDays,
          halfDays,
          leaveDays,
          totalDeductionDays,
          deductionAmount: Math.round(deductionAmount),
          suggestedAmount: Math.round(suggestedAmount)
        }
      });
    } catch (error: any) {
      logger.error('Failed to get salary suggestion', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to calculate salary suggestion' });
    }
  },
};
