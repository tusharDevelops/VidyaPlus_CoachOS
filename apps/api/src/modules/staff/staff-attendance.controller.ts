import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

const markAttendanceSchema = z.object({
  date: z.string(), // ISO date string
  records: z.array(z.object({
    staffId: z.string(),
    status: z.enum(['present', 'absent', 'leave', 'half_day']),
    note: z.string().optional(),
  }))
});

export const staffAttendanceController = {
  // ---------- Mark/Update Attendance ----------
  async markAttendance(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const markedById = req.user!.userId;
      const { date, records } = markAttendanceSchema.parse(req.body);
      
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isLateSubmission = attendanceDate < today;

      // Check for locks
      const existing = await prisma.staffAttendance.findMany({
        where: { instituteId, date: attendanceDate }
      });

      const locked = existing.filter(r => r.isLocked);
      if (locked.length > 0 && req.user!.role !== 'owner') {
        res.status(403).json({ success: false, error: 'Attendance is locked for this date.', code: 'LOCKED' });
        return;
      }

      // Perform upsert for each record
      const operations = records.map(record => 
        prisma.staffAttendance.upsert({
          where: {
            staffId_date: {
              staffId: record.staffId,
              date: attendanceDate,
            }
          },
          update: {
            status: record.status,
            note: record.note,
            markedById,
            markedAt: new Date(),
            isLateSubmission,
            isLocked: false,
          },
          create: {
            instituteId,
            staffId: record.staffId,
            date: attendanceDate,
            status: record.status,
            note: record.note,
            markedById,
            isLateSubmission,
          }
        })
      );

      await Promise.all(operations);

      // Absence Alerts
      const absents = records.filter(r => r.status === 'absent');
      if (absents.length > 0) {
        const owners = await prisma.user.findMany({ where: { instituteId, role: 'owner' } });
        for (const owner of owners) {
          for (const abs of absents) {
            const staffUser = await prisma.user.findFirst({ where: { id: abs.staffId } });
            await prisma.notification.create({
              data: {
                instituteId,
                recipientId: owner.id,
                channel: 'in_app',
                content: `Staff Alert: ${staffUser?.name} (${staffUser?.role}) is marked ABSENT for ${date}.`,
                status: 'unread'
              }
            });
          }
        }
      }

      res.json({ success: true, message: 'Staff attendance updated successfully' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to mark staff attendance', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to mark attendance' });
    }
  },

  // ---------- Get Daily Summary ----------
  async getDailySummary(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { date } = req.query;
      
      const queryDate = date ? new Date(date as string) : new Date();
      queryDate.setHours(0, 0, 0, 0);

      const attendance = await prisma.staffAttendance.findMany({
        where: { instituteId, date: queryDate }
      });

      res.json({ success: true, data: attendance });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch daily summary' });
    }
  },

  // ---------- Get Monthly Summary for All Staff ----------
  async getMonthlySummary(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const attendance = await prisma.staffAttendance.findMany({
        where: {
          instituteId,
          date: { gte: startDate, lte: endDate }
        }
      });

      // Group by staffId
      const summary: Record<string, any> = {};
      attendance.forEach((rec: any) => {
        if (!summary[rec.staffId]) {
          summary[rec.staffId] = { present: 0, absent: 0, leave: 0, half_day: 0 };
        }
        summary[rec.staffId][rec.status]++;
      });

      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch monthly summary' });
    }
  }
};
