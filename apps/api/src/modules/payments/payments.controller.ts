import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { DodoPayments } from 'dodopayments';
// @ts-ignore
import { Webhooks } from '@dodopayments/express';

const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
  environment: process.env.DODO_PAYMENTS_ENV === 'production' ? 'live_mode' : 'test_mode',
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    const { planId } = req.body;

    if (!instituteId || !planId) {
      return res.status(400).json({ success: false, error: 'Missing planId or auth' });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.dodoProductId) {
      return res.status(404).json({ success: false, error: 'Invalid plan or missing product ID' });
    }

    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
      include: { users: { where: { role: 'owner' } } },
    });

    if (!institute) {
      return res.status(404).json({ success: false, error: 'Institute not found' });
    }

    const owner = institute.users[0];

    // Create a payment using Dodopayments SDK
    const payment = await dodoClient.payments.create({
      billing: {
        city: 'Mumbai',
        country: 'IN',
        state: 'Maharashtra',
        street: 'Main Street',
        zipcode: '400001',
      },
      customer: {
        email: institute.email || owner?.email || '',
        name: institute.name || 'Admin',
      },
      product_cart: [
        {
          product_id: plan.dodoProductId as string,
          quantity: 1,
        },
      ],
      return_url: `${process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173'}/dashboard`,
    });

    return res.json({
      success: true,
      data: {
        checkoutUrl: (payment as any).paymentLink || (payment as any).url || (payment as any).link,
      },
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ success: false, error: 'Failed to create checkout session' });
  }
};

export const dodopayWebhook = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || '',
  onPaymentSucceeded: async (event: any) => {
    try {
      const email = event.customer?.email;
      const productId = event.productCart?.[0]?.productId;

      if (!email || !productId) return;

      const plan = await prisma.plan.findFirst({
        where: { dodoProductId: productId },
      });

      if (!plan) return;

      await prisma.institute.updateMany({
        where: { email },
        data: {
          planId: plan.id,
          status: 'active',
        },
      });
      console.log(`Plan upgraded for ${email} to ${plan.name}`);
    } catch (error) {
      console.error('Error in onPaymentSucceeded webhook:', error);
    }
  },
  onSubscriptionActive: async (event: any) => {
    try {
      const email = event.customer?.email;
      const productId = event.productCart?.[0]?.productId;

      if (!email || !productId) return;

      const plan = await prisma.plan.findFirst({
        where: { dodoProductId: productId },
      });

      if (!plan) return;

      await prisma.institute.updateMany({
        where: { email },
        data: {
          planId: plan.id,
          status: 'active',
        },
      });
      console.log(`Subscription activated for ${email} to ${plan.name}`);
    } catch (error) {
      console.error('Error in onSubscriptionActive webhook:', error);
    }
  },
});
