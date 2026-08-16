import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================
const generateDuesSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

// ============================================
// Helpers
// ============================================
export const getMonthName = (month: number) => {
  const d = new Date();
  d.setMonth(month - 1);
  return d.toLocaleString('en-US', { month: 'long' });
};

export async function createFeeRecord(
  tx: any,
  instituteId: string,
  studentId: string,
  batchId: string,
  feePlanId: string,
  amount: number,
  periodLabel: string,
  dueDate: Date
) {
  // Check if duplicate record exists for this period
  const existing = await tx.feeRecord.findFirst({
    where: {
      instituteId,
      studentId,
      batchId,
      feePlanId,
      periodLabel,
    },
  });

  if (existing) return false;

  await tx.feeRecord.create({
    data: {
      instituteId,
      studentId,
      batchId,
      feePlanId,
      amount,
      dueDate,
      periodLabel,
      status: 'pending',
    },
  });

  return true;
}

// ============================================
// Controllers
// ============================================
export const feeController = {
  // ---------- Generate Dues ----------
  async generateDues(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = generateDuesSchema.parse(req.body);
      const periodLabel = `${getMonthName(body.month)} ${body.year}`;
      
      // Calculate due date (e.g., 5th of the month)
      const defaultDueDay = 5; 
      const dueDate = new Date(body.year, body.month - 1, defaultDueDay);

      // Find all active enrollments with a fee plan
      const enrollments = await prisma.batchEnrollment.findMany({
        where: { instituteId, status: 'active', feePlanId: { not: null } },
        include: { feePlan: true },
      });

      let createdCount = 0;
      let skippedCount = 0;

      // For simplicity, we process one by one to avoid duplicate generation
      for (const enrollment of enrollments) {
        if (!enrollment.feePlan) continue;
        
        const created = await createFeeRecord(
          prisma,
          instituteId,
          enrollment.studentId,
          enrollment.batchId,
          enrollment.feePlanId!,
          Number(enrollment.feePlan.amount),
          periodLabel,
          dueDate
        );
        if (created) createdCount++;
        else skippedCount++;
      }

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'fees.dues.generate',
          entityType: 'fee_records',
          afterJson: { periodLabel, createdCount, skippedCount },
          ipAddress: req.ip,
        },
      });

      logger.info(`Generated dues for ${periodLabel}: ${createdCount} created, ${skippedCount} skipped`);

      res.json({
        success: true,
        data: { periodLabel, createdCount, skippedCount },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to generate dues', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to generate dues' });
    }
  },

  // ---------- Generate Individual Student Due ----------
  async generateStudentDue(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      let { studentId } = req.params;

      // Resolve profile if user ID provided
      const profile = await prisma.studentProfile.findFirst({
        where: { OR: [{ id: studentId }, { userId: studentId }], instituteId }
      });

      if (!profile) {
        res.status(404).json({ success: false, error: 'Student profile not found' });
        return;
      }
      studentId = profile.id;

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const periodLabel = `${getMonthName(month)} ${year}`;
      
      const defaultDueDay = 5; 
      const dueDate = new Date(year, month - 1, defaultDueDay);

      // Find active enrollments for this student
      const enrollments = await prisma.batchEnrollment.findMany({
        where: { instituteId, studentId, status: 'active', feePlanId: { not: null } },
        include: { feePlan: true },
      });

      if (enrollments.length === 0) {
        res.status(400).json({ success: false, error: 'No active enrollments with fee plans found for this student.' });
        return;
      }

      let createdCount = 0;
      for (const enrollment of enrollments) {
        const created = await createFeeRecord(
          prisma,
          instituteId,
          enrollment.studentId,
          enrollment.batchId,
          enrollment.feePlanId!,
          Number(enrollment.feePlan!.amount),
          periodLabel,
          dueDate
        );
        if (created) createdCount++;
      }

      if (createdCount === 0) {
        res.status(400).json({ success: false, error: 'Dues already generated for this period.' });
        return;
      }

      res.json({ success: true, message: `Generated ${createdCount} due records for ${periodLabel}` });
    } catch (error: any) {
      logger.error('Failed to generate student due', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to generate student due' });
    }
  },

  // ---------- Dashboard Summary ----------
  async getDashboardSummary(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const today = new Date();

      // Use Prisma aggregations instead of loading all records into memory
      const [totalDuesAgg, allPayments, overdueAgg, overdueCountAgg] = await Promise.all([
        // Sum of ALL fee record amounts
        prisma.feeRecord.aggregate({ where: { instituteId }, _sum: { amount: true } }),
        // Sum of ALL completed payments
        prisma.payment.aggregate({ where: { instituteId, status: 'completed' }, _sum: { amount: true } }),
        // Sum of overdue (unpaid + past due date) fee amounts
        prisma.feeRecord.aggregate({
          where: { instituteId, status: { not: 'paid' }, dueDate: { lt: today } },
          _sum: { amount: true },
        }),
        // Count of overdue records
        prisma.feeRecord.count({
          where: { instituteId, status: { not: 'paid' }, dueDate: { lt: today } },
        }),
      ]);

      const totalDues = Number(totalDuesAgg._sum.amount || 0);
      const totalCollected = Number(allPayments._sum.amount || 0);
      const totalOverdueAmount = Number(overdueAgg._sum.amount || 0);
      const overdueRecordsCount = overdueCountAgg;

      // Overdue List (only top 10 for display)
      const overdueListRaw = await prisma.feeRecord.findMany({
        where: { instituteId, status: { not: 'paid' }, dueDate: { lt: today } },
        include: {
          student: { include: { user: { select: { name: true, phone: true } } } },
          feePlan: { select: { name: true } },
          payments: { where: { status: 'completed' }, select: { amount: true } }
        },
        take: 10,
        orderBy: { dueDate: 'asc' },
      });

      const overdueList = overdueListRaw.map(r => {
        const paid = r.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
          id: r.id,
          studentId: r.student.id,
          studentName: r.student.user.name,
          planName: r.feePlan.name,
          dueDate: r.dueDate.toISOString().split('T')[0],
          periodLabel: r.periodLabel,
          amount: Number(r.amount),
          balance: Number(r.amount) - paid,
        };
      });

      res.json({
        success: true,
        data: {
          kpis: {
            totalDues,
            totalCollected,
            totalOutstanding: totalDues - totalCollected,
            totalOverdueAmount,
            overdueRecordsCount,
          },
          overdueList,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get dashboard summary', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get dashboard summary' });
    }
  },

};
