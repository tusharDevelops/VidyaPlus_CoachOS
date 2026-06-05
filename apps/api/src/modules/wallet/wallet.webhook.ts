import { Request, Response } from 'express';
import { Webhooks } from '@dodopayments/express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';

export const walletWebhookHandler = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
  onPayload: async (payload: any) => {
    try {
      // We only care about payment.succeeded events
      if (payload.type === 'payment.succeeded') {
        const payment = payload.data;
        const metadata = payment.metadata;
        
        // Make sure this is a wallet top-up and has an instituteId
        if (metadata?.type === 'wallet_topup' && metadata?.instituteId) {
          const instituteId = metadata.instituteId;
          const amount = Number(payment.total_amount) / 100; // Convert back from paise/cents
          const referenceNo = payment.payment_id;

          logger.info(`Processing successful Dodo payment ${referenceNo} for institute ${instituteId} amount ₹${amount}`);

          // Check if this transaction was already processed (idempotency)
          const existing = await prisma.walletTransaction.findFirst({
            where: { referenceNo }
          });

          if (existing) {
            logger.info(`Payment ${referenceNo} already processed. Skipping.`);
            return;
          }

          // Atomic transaction
          await prisma.$transaction(async (tx) => {
            // 1. Create wallet transaction
            await tx.walletTransaction.create({
              data: {
                instituteId,
                amount,
                type: 'credit',
                description: `Top-up via Dodo Payments`,
                referenceNo,
              },
            });

            // 2. Update institute balance
            await tx.institute.update({
              where: { id: instituteId },
              data: {
                walletBalance: { increment: amount },
              },
            });
          });

          logger.info(`Successfully credited ₹${amount} to institute ${instituteId}`);
        }
      }
    } catch (error: any) {
      logger.error('Error processing Dodo Payments webhook', { error: error.message });
      throw error; // Let @dodopayments/express handle the 500 response
    }
  },
});
