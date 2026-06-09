import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

const createExamSchema = z.object({
  batchId: z.string().uuid(),
  title: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  maxMarks: z.number().positive(),
  description: z.string().optional(),
});

const submitResultsSchema = z.object({
  results: z.array(z.object({
    studentId: z.string().uuid(),
    marksObtained: z.number().min(0),
    remarks: z.string().optional(),
  })).min(1),
});

export const examController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const instituteId = req.user!.instituteId!;
      const data = createExamSchema.parse(req.body);

      // Verify batch ownership
      const batch = await prisma.batch.findFirst({
        where: { id: data.batchId, instituteId },
      });

      if (!batch) {
        res.status(404).json({ success: false, error: 'Batch not found', code: 'NOT_FOUND' });
        return;
      }

      const exam = await prisma.exam.create({
        data: {
          instituteId,
          batchId: data.batchId,
          title: data.title,
          date: new Date(data.date),
          maxMarks: data.maxMarks,
          description: data.description,
          createdBy: req.user!.userId,
        },
      });

      res.json({ success: true, data: exam });
    } catch (error) {
      next(error);
    }
  },

  async getByBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const instituteId = req.user!.instituteId!;
      const { batchId } = req.params;

      const exams = await prisma.exam.findMany({
        where: { instituteId, batchId },
        include: {
          creator: { select: { name: true } },
          results: {
            include: {
              student: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { date: 'desc' }
      });

      res.json({ success: true, data: exams });
    } catch (error) {
      next(error);
    }
  },

  async submitResults(req: Request, res: Response, next: NextFunction) {
    try {
      const instituteId = req.user!.instituteId!;
      const { examId } = req.params;
      const data = submitResultsSchema.parse(req.body);

      const exam = await prisma.exam.findFirst({
        where: { id: examId, instituteId },
      });

      if (!exam) {
        res.status(404).json({ success: false, error: 'Exam not found', code: 'NOT_FOUND' });
        return;
      }

      // Upsert results
      const results = await prisma.$transaction(
        data.results.map(record => {
          if (record.marksObtained > Number(exam.maxMarks)) {
            throw Object.assign(new Error(`Marks cannot exceed ${exam.maxMarks}`), { statusCode: 400 });
          }
          return prisma.examResult.upsert({
            where: {
              examId_studentId: {
                examId,
                studentId: record.studentId,
              },
            },
            update: {
              marksObtained: record.marksObtained,
              remarks: record.remarks || null,
            },
            create: {
              instituteId,
              examId,
              studentId: record.studentId,
              marksObtained: record.marksObtained,
              remarks: record.remarks || null,
            },
          });
        })
      );

      res.json({ success: true, data: { updatedCount: results.length } });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const instituteId = req.user!.instituteId!;
      const { examId } = req.params;

      await prisma.exam.deleteMany({
        where: { id: examId, instituteId },
      });

      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  },

  async getMyResults(req: Request, res: Response, next: NextFunction) {
    try {
      const instituteId = req.user!.instituteId!;
      const studentId = req.user!.userId;

      const examResults = await prisma.examResult.findMany({
        where: { studentId, instituteId },
        include: { exam: { select: { title: true, maxMarks: true, date: true } } },
        orderBy: { exam: { date: 'desc' } }
      });

      res.json({ success: true, data: examResults });
    } catch (error) {
      next(error);
    }
  }
};
