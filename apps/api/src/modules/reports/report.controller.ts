import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';

export const reportController = {
  // ---------- Fee Analytics ----------
  async getFeeReport(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;

      // 1. Total overview
      const allFeesAgg = await prisma.feeRecord.aggregate({
        where: { instituteId },
        _sum: { amount: true }
      });
      const totalDues = Number(allFeesAgg._sum.amount || 0);

      const paidFeesAgg = await prisma.feeRecord.aggregate({
        where: { instituteId, status: 'paid' },
        _sum: { amount: true }
      });
      const totalCollected = Number(paidFeesAgg._sum.amount || 0);
      const totalOutstanding = totalDues - totalCollected;

      // 2. Collection breakdown by batch
      const batches = await prisma.batch.findMany({
        where: { instituteId },
      });

      const batchSummaryList = await Promise.all(batches.map(async (b) => {
        const batchAgg = await prisma.feeRecord.aggregate({
          where: { instituteId, batchId: b.id },
          _sum: { amount: true }
        });
        const batchPaidAgg = await prisma.feeRecord.aggregate({
          where: { instituteId, batchId: b.id, status: 'paid' },
          _sum: { amount: true }
        });
        
        const total = Number(batchAgg._sum.amount || 0);
        const collected = Number(batchPaidAgg._sum.amount || 0);
        const outstanding = total - collected;
        
        return {
          batchId: b.id,
          batchName: b.name,
          collected,
          outstanding,
          total,
        };
      }));

      // 3. Collection breakdown by month (We can't easily group by ISO string month in prisma cleanly without raw query, so we'll fetch only amount, status, dueDate to minimize memory)
      const feeDates = await prisma.feeRecord.findMany({
        where: { instituteId },
        select: { amount: true, status: true, dueDate: true }
      });

      const monthSummary: Record<string, { collected: number; outstanding: number }> = {};
      feeDates.forEach(f => {
        const monthYear = f.dueDate.toISOString().slice(0, 7); // YYYY-MM
        if (!monthSummary[monthYear]) {
          monthSummary[monthYear] = { collected: 0, outstanding: 0 };
        }
        if (f.status === 'paid') {
          monthSummary[monthYear].collected += Number(f.amount);
        } else {
          monthSummary[monthYear].outstanding += Number(f.amount);
        }
      });

      const parsedMonthSummary = Object.entries(monthSummary).map(([month, data]) => ({
        month,
        ...data,
      })).sort((a, b) => a.month.localeCompare(b.month));

      res.json({
        success: true,
        data: {
          totalDues,
          totalCollected,
          totalOutstanding,
          batchSummary: batchSummaryList,
          monthSummary: parsedMonthSummary,
        }
      });
    } catch (error: any) {
      logger.error('Failed to generate fee report', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch fee report' });
    }
  },

  // ---------- Attendance Analytics ----------
  async getAttendanceReport(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;

      const total = await prisma.attendanceRecord.count({ where: { instituteId } });
      const present = await prisma.attendanceRecord.count({ where: { instituteId, status: 'present' } });
      const absent = await prisma.attendanceRecord.count({ where: { instituteId, status: 'absent' } });
      const late = await prisma.attendanceRecord.count({ where: { instituteId, status: 'late' } });

      // Group by batch
      const batches = await prisma.batch.findMany({
        where: { instituteId },
      });

      const batchSummary = await Promise.all(batches.map(async (b) => {
        const bTotal = await prisma.attendanceRecord.count({ where: { instituteId, batchId: b.id } });
        const bPresent = await prisma.attendanceRecord.count({ where: { instituteId, batchId: b.id, status: 'present' } });
        const bAbsent = await prisma.attendanceRecord.count({ where: { instituteId, batchId: b.id, status: 'absent' } });
        const bLate = await prisma.attendanceRecord.count({ where: { instituteId, batchId: b.id, status: 'late' } });

        return {
          batchId: b.id,
          batchName: b.name,
          attendanceRate: bTotal > 0 ? Math.round(((bPresent + bLate) / bTotal) * 100) : 0,
          total: bTotal,
          present: bPresent,
          absent: bAbsent,
          late: bLate,
        };
      }));

      res.json({
        success: true,
        data: {
          total,
          present,
          absent,
          late,
          attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
          batchSummary,
        }
      });
    } catch (error: any) {
      logger.error('Failed to generate attendance report', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch attendance report' });
    }
  },
};
