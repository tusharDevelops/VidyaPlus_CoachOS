import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';

export const reportController = {
  // ---------- Fee Analytics ----------
  async getFeeReport(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;

      // 1. Total overview
      const allFees = await prisma.feeRecord.findMany({
        where: { instituteId },
      });

      const totalDues = allFees.reduce((acc, f) => acc + Number(f.amount), 0);
      const paidRecords = allFees.filter(f => f.status === 'paid');
      const totalCollected = paidRecords.reduce((acc, f) => acc + Number(f.amount), 0);
      const totalOutstanding = totalDues - totalCollected;

      // 2. Collection breakdown by batch
      const batches = await prisma.batch.findMany({
        where: { instituteId },
        include: {
          feeRecords: true,
        },
      });

      const batchSummary = batches.map(b => {
        const batchFees = b.feeRecords || [];
        const collected = batchFees.filter(f => f.status === 'paid').reduce((acc, f) => acc + Number(f.amount), 0);
        const outstanding = batchFees.reduce((acc, f) => acc + Number(f.amount), 0) - collected;
        return {
          batchId: b.id,
          batchName: b.name,
          collected,
          outstanding,
          total: collected + outstanding,
        };
      });

      // 3. Collection breakdown by month
      const monthSummary: Record<string, { collected: number; outstanding: number }> = {};
      allFees.forEach(f => {
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
          batchSummary,
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

      const records = await prisma.attendanceRecord.findMany({
        where: { instituteId },
      });

      const total = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;

      // Group by batch
      const batches = await prisma.batch.findMany({
        where: { instituteId },
      });

      const batchSummary = batches.map(b => {
        const batchRecords = records.filter(r => r.batchId === b.id);
        const bTotal = batchRecords.length;
        const bPresent = batchRecords.filter(r => r.status === 'present').length;
        const bAbsent = batchRecords.filter(r => r.status === 'absent').length;
        const bLate = batchRecords.filter(r => r.status === 'late').length;

        return {
          batchId: b.id,
          batchName: b.name,
          attendanceRate: bTotal > 0 ? Math.round(((bPresent + bLate) / bTotal) * 100) : 0,
          total: bTotal,
          present: bPresent,
          absent: bAbsent,
          late: bLate,
        };
      });

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
