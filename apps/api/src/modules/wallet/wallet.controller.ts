import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

const topUpSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().default('upi'),
});

export const walletController = {
  // ---------- Get Wallet Balance & Transactions ----------
  async getWallet(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;

      const institute = await prisma.institute.findUnique({
        where: { id: instituteId },
        select: { walletBalance: true },
      });

      const transactions = await prisma.walletTransaction.findMany({
        where: { instituteId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({
        success: true,
        data: {
          balance: institute?.walletBalance || 0,
          transactions,
        },
      });
    } catch (error: any) {
      logger.error('Failed to get wallet info', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch wallet information' });
    }
  },

  // ---------- Mock Top-up (Payment Gateway Mock) ----------
  async topUp(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { amount, paymentMethod } = topUpSchema.parse(req.body);

      // Simulate payment gateway delay/success
      logger.info(`Processing mock payment of ₹${amount} via ${paymentMethod} for institute ${instituteId}`);

      // In a real scenario, this would be a webhook from Razorpay/Stripe
      const transaction = await prisma.$transaction(async (tx) => {
        // 1. Create wallet transaction
        const walletTx = await tx.walletTransaction.create({
          data: {
            instituteId,
            amount,
            type: 'credit',
            description: `Top-up via ${paymentMethod} (Mock)`,
            referenceNo: `MOCK-TXN-${Date.now()}`,
          },
        });

        // 2. Update institute balance
        await tx.institute.update({
          where: { id: instituteId },
          data: {
            walletBalance: { increment: amount },
          },
        });

        return walletTx;
      });

      res.json({
        success: true,
        message: 'Top-up successful',
        data: transaction,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to process top-up', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to process top-up' });
    }
  },
};
