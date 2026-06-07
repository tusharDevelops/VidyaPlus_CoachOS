import { Request, Response } from 'express';
import DodoPayments from 'dodopayments';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

const topUpSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().default('upi'),
});

const walletQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const walletController = {
  // ---------- Get Wallet Balance & Transactions ----------
  async getWallet(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const query = walletQuerySchema.parse(req.query);
      const skip = (query.page - 1) * query.limit;

      const institute = await prisma.institute.findUnique({
        where: { id: instituteId },
        select: { walletBalance: true },
      });

      const where = { instituteId };

      const [transactions, total] = await Promise.all([
        prisma.walletTransaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: query.limit,
        }),
        prisma.walletTransaction.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          balance: institute?.walletBalance || 0,
          transactions,
        },
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      });
    } catch (error: any) {
      logger.error('Failed to get wallet info', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch wallet information' });
    }
  },

  // ---------- Dodo Payments Top-up ----------
  async topUp(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { amount } = topUpSchema.parse(req.body);

      logger.info(`Creating Dodo Payments checkout session of ₹${amount} for institute ${instituteId}`);

      const dodoClient = new DodoPayments({
        bearerToken: process.env.DODO_PAYMENTS_API_KEY,
        environment: 'test_mode', 
      });

      const session = await dodoClient.checkoutSessions.create({
        product_cart: [
          {
            product_id: process.env.DODO_WALLET_PRODUCT_ID!,
            quantity: 1,
            amount: amount * 100, // Dodo expects smallest currency unit (paise)
          }
        ],
        metadata: {
          instituteId,
          type: 'wallet_topup'
        },
        return_url: `${req.headers.origin || process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173'}/wallet?status=success`,
      });

      res.json({
        success: true,
        message: 'Checkout session created',
        data: {
          checkout_url: session.checkout_url
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to create Dodo checkout session', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to create checkout session' });
    }
  },
};
