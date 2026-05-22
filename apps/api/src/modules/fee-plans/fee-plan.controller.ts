import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================
const createFeePlanSchema = z.object({
  name: z.string().min(2).max(255),
  amount: z.number().positive(),
  frequency: z.enum(['monthly', 'quarterly', 'course', 'installment']),
  dueDay: z.number().int().min(1).max(31).optional(),
  description: z.string().optional(),
});

const updateFeePlanSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  amount: z.number().positive().optional(),
  frequency: z.enum(['monthly', 'quarterly', 'course', 'installment']).optional(),
  dueDay: z.number().int().min(1).max(31).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// ============================================
// Controllers
// ============================================
export const feePlanController = {

  // ---------- List Fee Plans ----------
  async list(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;

      const feePlans = await prisma.feePlan.findMany({
        where: { instituteId },
        include: {
          _count: { select: { enrollments: { where: { status: 'active' } } } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const data = feePlans.map(fp => ({
        ...fp,
        activeStudents: fp._count.enrollments,
        _count: undefined,
      }));

      res.json({ success: true, data });
    } catch (error: any) {
      logger.error('Failed to list fee plans', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to list fee plans' });
    }
  },

  // ---------- Create Fee Plan ----------
  async create(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = createFeePlanSchema.parse(req.body);

      const feePlan = await prisma.feePlan.create({
        data: {
          instituteId,
          name: body.name,
          amount: body.amount,
          frequency: body.frequency,
          dueDay: body.dueDay || null,
          description: body.description,
        },
      });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'feePlan.create',
          entityType: 'fee_plan',
          entityId: feePlan.id,
          afterJson: { name: feePlan.name, amount: Number(feePlan.amount), frequency: feePlan.frequency },
          ipAddress: req.ip,
        },
      });

      logger.info(`Fee plan created: ${feePlan.name} (₹${feePlan.amount}/${feePlan.frequency})`);
      res.status(201).json({ success: true, data: feePlan });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to create fee plan', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to create fee plan' });
    }
  },

  // ---------- Update Fee Plan ----------
  async update(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;
      const body = updateFeePlanSchema.parse(req.body);

      const existing = await prisma.feePlan.findFirst({ where: { id, instituteId } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Fee plan not found', code: 'NOT_FOUND' });
        return;
      }

      const feePlan = await prisma.feePlan.update({ where: { id }, data: body });

      await prisma.auditLog.create({
        data: {
          instituteId,
          userId: req.user!.userId,
          action: 'feePlan.update',
          entityType: 'fee_plan',
          entityId: id,
          afterJson: body,
          ipAddress: req.ip,
        },
      });

      res.json({ success: true, data: feePlan });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to update fee plan', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update fee plan' });
    }
  },

  // ---------- Delete Fee Plan (Soft) ----------
  async delete(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const { id } = req.params;

      const existing = await prisma.feePlan.findFirst({ where: { id, instituteId } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Fee plan not found', code: 'NOT_FOUND' });
        return;
      }

      // Check if any active enrollments use this plan
      const activeUsage = await prisma.batchEnrollment.count({
        where: { feePlanId: id, status: 'active' },
      });
      if (activeUsage > 0) {
        res.status(409).json({
          success: false,
          error: `Cannot delete: ${activeUsage} active enrollments are currently using this fee plan.`,
          code: 'IN_USE',
        });
        return;
      }

      await prisma.feePlan.delete({ where: { id } });

      res.json({ success: true, message: 'Fee plan deleted permanently' });
    } catch (error: any) {
      logger.error('Failed to delete fee plan', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to delete fee plan' });
    }
  },
};
