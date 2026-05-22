import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================
const markAttendanceSchema = z.object({
  batchId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  records: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.enum(['present', 'absent', 'late']),
    note: z.string().optional(),
  })).min(1),
});

const updateRecordSchema = z.object({
  status: z.enum(['present', 'absent', 'late']),
  note: z.string().optional(),
});

// ============================================
// Helpers
// ============================================
const LOCK_HOURS = 24;

function isLocked(markedAt: Date): boolean {
  const hoursElapsed = (Date.now() - markedAt.getTime()) / (1000 * 60 * 60);
  return hoursElapsed > LOCK_HOURS;
}

// ============================================
// Controllers
// ============================================
export const attendanceController = {

  // ---------- Bulk Mark Attendance ----------
  async mark(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = markAttendanceSchema.parse(req.body);
      const attendanceDate = new Date(body.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isLateSubmission = attendanceDate < today;

      // Verify batch belongs to institute and teacher (if teacher role)
      const batch = await prisma.batch.findFirst({
        where: { 
          id: body.batchId, 
          instituteId,
          ...(req.user!.role === 'teacher' ? { teacherId: req.user!.userId } : {})
        },
      });
      if (!batch) {
        res.status(404).json({ success: false, error: 'Batch not found or not assigned to you', code: 'NOT_FOUND' });
        return;
      }

      // Check for holidays
      const holiday = await prisma.holiday.findFirst({
        where: { instituteId, date: attendanceDate },
      });
      if (holiday) {
        res.status(409).json({
          success: false,
          error: `Cannot mark attendance on holiday: ${holiday.name}`,
          code: 'HOLIDAY',
        });
        return;
      }

      // Check if existing records are locked
      const existingRecords = await prisma.attendanceRecord.findMany({
        where: { batchId: body.batchId, date: attendanceDate, instituteId },
      });

      const lockedRecords = existingRecords.filter(r => r.isLocked);
      if (lockedRecords.length > 0 && req.user!.role !== 'owner') {
        res.status(403).json({
          success: false,
          error: 'Attendance is locked for this date. Only the Owner can override.',
          code: 'LOCKED',
        });
        return;
      }

      // Upsert each record
      const results = await prisma.$transaction(
        body.records.map(record =>
          prisma.attendanceRecord.upsert({
            where: {
              batchId_studentId_date: {
                batchId: body.batchId,
                studentId: record.studentId,
                date: attendanceDate,
              },
            },
            update: {
              status: record.status,
              note: record.note || null,
              markedById: req.user!.userId,
              markedAt: new Date(),
              isLateSubmission,
              isLocked: false, // Reset lock on re-mark
            },
            create: {
              instituteId,
              batchId: body.batchId,
              studentId: record.studentId,
              date: attendanceDate,
              status: record.status,
              note: record.note || null,
              markedById: req.user!.userId,
              isLateSubmission,
            },
          })
        )
      );
      
      // Auto-Mark Teacher Attendance
      if (req.user!.role !== 'owner') {
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         
         await prisma.staffAttendance.upsert({
            where: {
               staffId_date: {
                  staffId: req.user!.userId,
                  date: today,
               }
            },
            update: { status: 'present', markedById: req.user!.userId },
            create: {
               instituteId,
               staffId: req.user!.userId,
               date: today,
               status: 'present',
               markedById: req.user!.userId,
            }
         });
      }

      // Create in-app absence notifications
      const absentRecords = body.records.filter(r => r.status === 'absent');
      if (absentRecords.length > 0) {
        const owners = await prisma.user.findMany({
          where: { instituteId, role: 'owner', status: 'active' }
        });
        if (owners.length > 0) {
          for (const rec of absentRecords) {
            const stu = await prisma.user.findFirst({ where: { id: rec.studentId } });
            if (stu) {
              const content = `Absence Alert: Student ${stu.name} was marked absent for batch "${batch.name}" on ${body.date}.`;
              for (const owner of owners) {
                await prisma.notification.create({
                  data: {
                    instituteId,
                    recipientId: owner.id,
                    channel: 'in_app',
                    content,
                    status: 'unread',
                  }
                });
              }
            }
          }
        }
      }

      // Audit log
      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'attendance.mark',
          entityType: 'attendance',
          entityId: body.batchId,
          afterJson: {
            batchId: body.batchId,
            date: body.date,
            count: results.length,
            present: body.records.filter(r => r.status === 'present').length,
            absent: body.records.filter(r => r.status === 'absent').length,
            late: body.records.filter(r => r.status === 'late').length,
          },
          ipAddress: req.ip,
        },
      });

      logger.info(`Attendance marked: ${batch.name} on ${body.date} (${results.length} records)`);

      res.json({
        success: true,
        data: {
          batchId: body.batchId,
          date: body.date,
          markedCount: results.length,
          summary: {
            present: body.records.filter(r => r.status === 'present').length,
            absent: body.records.filter(r => r.status === 'absent').length,
            late: body.records.filter(r => r.status === 'late').length,
          },
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to mark attendance', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to mark attendance' });
    }
  },

  // ---------- Get Attendance by Batch + Date ----------
  async getByBatch(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { batchId } = req.params;
      const date = req.query.date as string;

      if (!date) {
        res.status(400).json({ success: false, error: 'Date parameter required (YYYY-MM-DD)' });
        return;
      }

      const attendanceDate = new Date(date);
      
      // Verify batch permissions
      const batch = await prisma.batch.findFirst({
        where: { 
          id: batchId, 
          instituteId,
          ...(req.user!.role === 'teacher' ? { teacherId: req.user!.userId } : {})
        },
      });
      if (!batch) {
        res.status(404).json({ success: false, error: 'Batch not found or access denied', code: 'NOT_FOUND' });
        return;
      }

      const records = await prisma.attendanceRecord.findMany({
        where: { batchId, date: attendanceDate, instituteId },
        include: {
          student: { select: { id: true, name: true, phone: true } },
          markedBy: { select: { id: true, name: true } },
        },
        orderBy: { student: { name: 'asc' } },
      });

      // Get all enrolled students for the batch (to identify unmarked)
      const enrollments = await prisma.batchEnrollment.findMany({
        where: { batchId, status: 'active', instituteId },
        include: {
          batch: { select: { name: true } },
        },
      });
      const enrolledStudentIds = enrollments.map(e => e.studentId);

      // Get student profiles for enrolled students
      const profiles = await prisma.studentProfile.findMany({
        where: { id: { in: enrolledStudentIds } },
        include: { user: { select: { id: true, name: true, phone: true } } },
      });

      const markedSet = new Set(records.map(r => r.studentId));
      const allStudents = profiles.map(p => {
        const record = records.find(r => r.studentId === p.user.id);
        return {
          userId: p.user.id,
          studentProfileId: p.id,
          name: p.user.name,
          phone: p.user.phone,
          studentCode: p.studentCode,
          status: record?.status || null,
          note: record?.note || null,
          recordId: record?.id || null,
          isLocked: record ? (record.isLocked || isLocked(record.markedAt)) : false,
          markedBy: record ? { id: record.markedBy.id, name: record.markedBy.name } : null,
        };
      });

      const summary = {
        total: allStudents.length,
        present: allStudents.filter(s => s.status === 'present').length,
        absent: allStudents.filter(s => s.status === 'absent').length,
        late: allStudents.filter(s => s.status === 'late').length,
        unmarked: allStudents.filter(s => !s.status).length,
      };

      res.json({ success: true, data: { students: allStudents, summary, date } });
    } catch (error: any) {
      logger.error('Failed to get batch attendance', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get attendance' });
    }
  },

  // ---------- Student Attendance Summary ----------
  async getByStudent(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const studentId = (req.params.studentId === 'me' || !req.params.studentId) 
        ? req.user!.userId 
        : req.params.studentId;
      const days = parseInt(req.query.days as string) || 30;

      const since = new Date();
      since.setDate(since.getDate() - days);

      const records = await prisma.attendanceRecord.findMany({
        where: { studentId, instituteId, date: { gte: since } },
        include: { batch: { select: { id: true, name: true } } },
        orderBy: { date: 'desc' },
      });

      const summary = {
        total: records.length,
        present: records.filter(r => r.status === 'present').length,
        absent: records.filter(r => r.status === 'absent').length,
        late: records.filter(r => r.status === 'late').length,
        attendanceRate: records.length > 0
          ? Math.round((records.filter(r => r.status === 'present' || r.status === 'late').length / records.length) * 100)
          : 0,
      };

      // Group by batch
      const byBatch: Record<string, { batchName: string; present: number; absent: number; late: number; total: number }> = {};
      records.forEach(r => {
        if (!byBatch[r.batchId]) {
          byBatch[r.batchId] = { batchName: r.batch.name, present: 0, absent: 0, late: 0, total: 0 };
        }
        byBatch[r.batchId][r.status as 'present' | 'absent' | 'late']++;
        byBatch[r.batchId].total++;
      });

      res.json({
        success: true,
        data: {
          summary,
          byBatch: Object.values(byBatch),
          recentRecords: records.slice(0, 20).map(r => ({
            date: r.date,
            status: r.status,
            batchName: r.batch.name,
            note: r.note,
          })),
        },
      });
    } catch (error: any) {
      logger.error('Failed to get student attendance', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get student attendance' });
    }
  },

  // ---------- Calendar Heatmap Data ----------
  async calendar(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { batchId } = req.params;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month

      const records = await prisma.attendanceRecord.findMany({
        where: {
          batchId,
          instituteId,
          date: { gte: startDate, lte: endDate },
        },
      });

      // Group by date
      const calendar: Record<string, { present: number; absent: number; late: number; total: number; isLocked: boolean }> = {};
      records.forEach(r => {
        const dateKey = r.date.toISOString().split('T')[0];
        if (!calendar[dateKey]) {
          calendar[dateKey] = { present: 0, absent: 0, late: 0, total: 0, isLocked: false };
        }
        calendar[dateKey][r.status as 'present' | 'absent' | 'late']++;
        calendar[dateKey].total++;
        if (r.isLocked || isLocked(r.markedAt)) calendar[dateKey].isLocked = true;
      });

      // Get holidays for the month
      const holidays = await prisma.holiday.findMany({
        where: { instituteId, date: { gte: startDate, lte: endDate } },
      });

      res.json({
        success: true,
        data: {
          month, year, calendar,
          holidays: holidays.map(h => ({ date: h.date.toISOString().split('T')[0], name: h.name })),
        },
      });
    } catch (error: any) {
      logger.error('Failed to get calendar', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get calendar data' });
    }
  },

  // ---------- Update Single Record ----------
  async update(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;
      const body = updateRecordSchema.parse(req.body);

      const record = await prisma.attendanceRecord.findFirst({
        where: { id, instituteId },
      });
      if (!record) {
        res.status(404).json({ success: false, error: 'Record not found', code: 'NOT_FOUND' });
        return;
      }

      // Check lock
      if ((record.isLocked || isLocked(record.markedAt)) && req.user!.role !== 'owner') {
        res.status(403).json({ success: false, error: 'Record is locked', code: 'LOCKED' });
        return;
      }

      await prisma.attendanceRecord.update({
        where: { id },
        data: { status: body.status, note: body.note || null },
      });

      res.json({ success: true, message: 'Attendance updated' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to update attendance', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update attendance' });
    }
  },

  // ---------- Lock Attendance for a Date ----------
  async lock(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { batchId, date } = req.body;

      if (!batchId || !date) {
        res.status(400).json({ success: false, error: 'batchId and date required' });
        return;
      }

      const result = await prisma.attendanceRecord.updateMany({
        where: { batchId, date: new Date(date), instituteId },
        data: { isLocked: true },
      });

      res.json({ success: true, data: { lockedCount: result.count } });
    } catch (error: any) {
      logger.error('Failed to lock attendance', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to lock attendance' });
    }
  },
};
