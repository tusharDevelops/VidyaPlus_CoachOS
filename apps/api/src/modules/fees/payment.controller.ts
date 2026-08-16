import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

const recordPaymentSchema = z.object({
  feeRecordId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMode: z.enum(['cash', 'upi', 'bank', 'cheque']),
  referenceNo: z.string().optional(),
});

export const paymentController = {
  // ---------- Record Payment ----------
  async recordPayment(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = recordPaymentSchema.parse(req.body);

      // Verify the fee record
      const feeRecord = await prisma.feeRecord.findFirst({
        where: { id: body.feeRecordId, instituteId },
      });

      if (!feeRecord) {
        res.status(404).json({ success: false, error: 'Fee record not found' });
        return;
      }

      if (feeRecord.status === 'paid') {
        res.status(400).json({ success: false, error: 'Fee record is already fully paid' });
        return;
      }

      // We perform payment and receipt generation in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the payment
        const payment = await tx.payment.create({
          data: {
            instituteId,
            feeRecordId: body.feeRecordId,
            amount: body.amount,
            paymentMode: body.paymentMode,
            referenceNo: body.referenceNo,
            recordedBy: req.user!.userId,
            status: 'completed',
          },
        });

        // 2. Update FeeRecord status
        const allPayments = await tx.payment.aggregate({
          where: { feeRecordId: body.feeRecordId, status: 'completed' },
          _sum: { amount: true },
        });
        
        const totalPaid = Number(allPayments._sum.amount || 0);
        const newStatus = totalPaid >= Number(feeRecord.amount) ? 'paid' : 'partial';

        await tx.feeRecord.update({
          where: { id: body.feeRecordId },
          data: { status: newStatus },
        });

        // 3. Generate Receipt Number
        const receiptCount = await tx.receipt.count({ where: { instituteId } });
        const shortInst = instituteId.split('-')[0].toUpperCase();
        const receiptNum = `${shortInst}-REC-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(4, '0')}`;

        // 4. Create the Receipt
        const receipt = await tx.receipt.create({
          data: {
            instituteId,
            paymentId: payment.id,
            receiptNumber: receiptNum,
          },
        });

        return { payment, receipt, newStatus };
      });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'fees.payment.record',
          entityType: 'payment',
          entityId: result.payment.id,
          afterJson: { amount: body.amount, mode: body.paymentMode, newFeeStatus: result.newStatus },
          ipAddress: req.ip,
        },
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to record payment', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to record payment' });
    }
  },

  // ---------- Student Ledger ----------
  async getStudentLedger(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      let studentId = req.params.studentId;

      if (!studentId || studentId === 'me') {
        const profile = await prisma.studentProfile.findUnique({
          where: { userId: req.user!.userId }
        });
        if (!profile) {
          res.status(404).json({ success: false, error: 'Student profile not found' });
          return;
        }
        studentId = profile.id;
      } else {
        const profile = await prisma.studentProfile.findFirst({
          where: { OR: [{ id: studentId }, { userId: studentId }], instituteId }
        });
        if (!profile) {
          res.status(404).json({ success: false, error: 'Student profile not found' });
          return;
        }
        studentId = profile.id;
      }

      const recordsRaw = await prisma.feeRecord.findMany({
        where: { instituteId, studentId },
        include: {
          feePlan: { select: { name: true, frequency: true } },
          payments: {
            where: { status: 'completed' },
            include: { receipt: { select: { receiptNumber: true } } },
            orderBy: { paidAt: 'desc' },
          },
        },
        orderBy: { dueDate: 'desc' },
      });

      let totalDues = 0;
      let totalPaid = 0;

      const records = recordsRaw.map(r => {
        const amount = Number(r.amount);
        const paid = r.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        totalDues += amount;
        totalPaid += paid;

        return {
          id: r.id,
          planName: r.feePlan.name,
          frequency: r.feePlan.frequency,
          periodLabel: r.periodLabel,
          dueDate: r.dueDate.toISOString().split('T')[0],
          amount,
          paid,
          balance: amount - paid,
          status: r.status,
          payments: r.payments.map(p => ({
            id: p.id,
            amount: Number(p.amount),
            date: p.paidAt.toISOString().split('T')[0],
            mode: p.paymentMode,
            receiptNumber: p.receipt?.receiptNumber,
          })),
        };
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalDues,
            totalPaid,
            balance: totalDues - totalPaid,
          },
          records,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get student ledger', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get student ledger' });
    }
  },

  // ---------- Get Receipt ----------
  async getReceipt(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { receiptNumber } = req.params;

      const receipt = await prisma.receipt.findFirst({
        where: { instituteId, receiptNumber },
        include: {
          institute: { select: { name: true, address: true, phone: true, email: true, logoUrl: true } },
          payment: {
            include: {
              feeRecord: {
                include: {
                  student: { include: { user: { select: { id: true, name: true, phone: true } } } },
                  feePlan: { select: { name: true } }
                }
              }
            }
          }
        }
      });

      if (!receipt) {
        res.status(404).json({ success: false, error: 'Receipt not found' });
        return;
      }

      if (req.user!.role === 'student') {
        const studentUserId = receipt.payment?.feeRecord?.student?.user?.id;
        if (studentUserId !== req.user!.userId) {
          res.status(403).json({ success: false, error: 'Forbidden' });
          return;
        }
      } else {
        const isOwner = req.user!.role === 'owner' || req.user!.role === 'super_admin';
        const hasPerm = req.user!.permissions?.includes('fees.view');
        if (!isOwner && !hasPerm) {
          res.status(403).json({ success: false, error: 'Forbidden' });
          return;
        }
      }

      res.json({ success: true, data: receipt });
    } catch (error: any) {
      logger.error('Failed to get receipt', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch receipt' });
    }
  },
};
