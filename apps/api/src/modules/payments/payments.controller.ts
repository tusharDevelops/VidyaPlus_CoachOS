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
    const { planId, returnUrl } = req.body;

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

    // Create a subscription using Dodopayments SDK
    const subscription = await dodoClient.subscriptions.create({
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
      product_id: plan.dodoProductId as string,
      quantity: 1,
      payment_link: true,
      metadata: { instituteId },
      return_url: returnUrl || `${process.env.FRONTEND_URL || process.env.CORS_ORIGIN?.split(',')[0] || 'https://vidya-plus-coach-os-web.vercel.app'}/dashboard`,
    });

    return res.json({
      success: true,
      data: {
        checkoutUrl: (subscription as any).payment_link,
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
      const instituteId = event.metadata?.instituteId;
      const productId = event.product_cart?.[0]?.product_id;

      if (!productId) return;

      const plan = await prisma.plan.findFirst({
        where: { dodoProductId: productId },
      });

      if (!plan) return;

      // Update by instituteId if available, fallback to email
      if (instituteId) {
        await prisma.institute.update({
          where: { id: instituteId },
          data: {
            planId: plan.id,
            status: 'active',
          },
        });
      } else if (email) {
        await prisma.institute.updateMany({
          where: { email },
          data: {
            planId: plan.id,
            status: 'active',
          },
        });
      }
      console.log(`Plan upgraded for institute ${instituteId || email} to ${plan.name}`);
    } catch (error) {
      console.error('Error in onPaymentSucceeded webhook:', error);
    }
  },
  onSubscriptionActive: async (event: any) => {
    try {
      const email = event.customer?.email;
      const instituteId = event.metadata?.instituteId;
      const productId = event.product_id;

      if (!productId) return;

      const plan = await prisma.plan.findFirst({
        where: { dodoProductId: productId },
      });

      if (!plan) return;

      if (instituteId) {
        await prisma.institute.update({
          where: { id: instituteId },
          data: {
            planId: plan.id,
            status: 'active',
            dodoSubscriptionId: event.subscription_id,
          },
        });
      } else if (email) {
        await prisma.institute.updateMany({
          where: { email },
          data: {
            planId: plan.id,
            status: 'active',
            dodoSubscriptionId: event.subscription_id,
          },
        });
      }
      console.log(`Subscription activated for institute ${instituteId || email} to ${plan.name}`);
    } catch (error) {
      console.error('Error in onSubscriptionActive webhook:', error);
    }
  },
  onSubscriptionCancelled: async (event: any) => {
    try {
      const email = event.customer?.email;
      const instituteId = event.metadata?.instituteId;
      
      if (!email && !instituteId) return;

      // Find Aarambh plan
      const aarambhPlan = await prisma.plan.findFirst({
        where: { name: { contains: 'Aarambh', mode: 'insensitive' } },
      });

      if (!aarambhPlan) return;

      if (instituteId) {
        await prisma.institute.update({
          where: { id: instituteId },
          data: {
            planId: aarambhPlan.id,
            dodoSubscriptionId: null,
          },
        });
      } else if (email) {
        await prisma.institute.updateMany({
          where: { email },
          data: {
            planId: aarambhPlan.id,
            dodoSubscriptionId: null,
          },
        });
      }
      console.log(`Subscription cancelled for institute ${instituteId || email}, downgraded to Aarambh`);
    } catch (error) {
      console.error('Error in onSubscriptionCancelled webhook:', error);
    }
  },
});

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    if (!instituteId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const institute = await prisma.institute.findUnique({ where: { id: instituteId } });
    if (!institute || !institute.dodoSubscriptionId) {
      return res.status(400).json({ success: false, error: 'No active subscription found' });
    }

    await dodoClient.subscriptions.update(institute.dodoSubscriptionId, {
      cancel_at_next_billing_date: true,
      cancel_reason: 'cancelled_by_customer',
    });

    return res.json({ success: true, message: 'Subscription scheduled for cancellation' });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({ success: false, error: 'Failed to cancel subscription' });
  }
};

export const reactivateSubscription = async (req: Request, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    if (!instituteId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const institute = await prisma.institute.findUnique({ where: { id: instituteId } });
    if (!institute || !institute.dodoSubscriptionId) {
      return res.status(400).json({ success: false, error: 'No active subscription found' });
    }

    await dodoClient.subscriptions.update(institute.dodoSubscriptionId, {
      cancel_at_next_billing_date: false,
    });

    return res.json({ success: true, message: 'Subscription reactivated' });
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    return res.status(500).json({ success: false, error: 'Failed to reactivate subscription' });
  }
};

export const getSubscriptionDetails = async (req: Request, res: Response) => {
  try {
    const instituteId = req.user?.instituteId;
    if (!instituteId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const institute = await prisma.institute.findUnique({ 
      where: { id: instituteId },
      include: { plan: true }
    });
    
    if (!institute) return res.status(404).json({ success: false, error: 'Institute not found' });

    if (!institute.dodoSubscriptionId) {
      return res.json({ success: true, data: { plan: institute.plan, subscription: null } });
    }

    const subscription = await dodoClient.subscriptions.retrieve(institute.dodoSubscriptionId);
    return res.json({ success: true, data: { plan: institute.plan, subscription } });
  } catch (error: any) {
    console.error('Error fetching subscription details:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch subscription' });
  }
};
