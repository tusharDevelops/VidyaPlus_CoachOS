
import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { authService } from '../auth/auth.service';
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================
const createInstituteSchema = z.object({
  name: z.string().min(2).max(255),
  subdomain: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Subdomain must be lowercase alphanumeric with hyphens'),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional(),
  address: z.string().optional(),
  planId: z.string().uuid().optional(),
  academicYear: z.string().optional(),
  // Owner details
  ownerName: z.string().min(2).max(255),
  ownerPhone: z.string().min(10).max(15),
  ownerEmail: z.string().email().optional(),
  ownerPassword: z.string().min(8).max(100),
});

const updateInstituteSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  planId: z.string().uuid().nullable().optional(),
  academicYear: z.string().optional(),
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  planId: z.string().uuid().optional(),
});

// ============================================
// Controllers
// ============================================
export const superAdminController = {

  // ---------- Platform KPIs ----------
  async getKpis(_req: Request, res: Response) {
    try {
      const [totalInstitutes, activeInstitutes, totalUsers, totalStudents, expiringPlans, revenueResult] = await Promise.all([
        prisma.institute.count(),
        prisma.institute.count({ where: { status: 'active' } }),
        prisma.user.count(),
        prisma.user.count({ where: { role: 'student' } }),
        prisma.institute.count({
          where: {
            status: 'active',
            // In a real app, filter by plan expiry date
          },
        }),
        prisma.payment.aggregate({
          where: { status: 'completed' },
          _sum: { amount: true }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalInstitutes,
          activeInstitutes,
          suspendedInstitutes: totalInstitutes - activeInstitutes,
          totalUsers,
          totalStudents,
          expiringPlans,
          totalRevenue: Number(revenueResult._sum.amount || 0),
        },
      });
    } catch (error: any) {
      logger.error('Failed to fetch KPIs', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch platform KPIs' });
    }
  },

  // ---------- Impersonate Owner ----------
  async impersonate(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { institute: true }
      });

      if (!targetUser || !targetUser.instituteId) {
        res.status(404).json({ success: false, error: 'Target owner not found' });
        return;
      }

      // Generate tokens for the target user
      const tokens = await authService.generateTokens(targetUser);

      // Audit log the impersonation
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'admin.impersonate',
          entityType: 'user',
          entityId: userId,
          afterJson: { impersonatedUser: targetUser.email, institute: targetUser.institute?.name },
          ipAddress: req.ip,
        },
      });

      logger.warn(`Admin ${req.user!.userId} is impersonating ${targetUser.email}`);

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
            instituteId: targetUser.instituteId,
          }
        }
      });
    } catch (error: any) {
      logger.error('Impersonation failed', { error: error.message });
      res.status(500).json({ success: false, error: 'Impersonation failed' });
    }
  },

  // ---------- List Institutes ----------
  async listInstitutes(req: Request, res: Response) {
    try {
      const query = listQuerySchema.parse(req.query);
      const skip = (query.page - 1) * query.limit;

      const where: any = {};
      if (query.status) where.status = query.status;
      if (query.planId) where.planId = query.planId;
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { subdomain: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search } },
        ];
      }

      const [institutes, total] = await Promise.all([
        prisma.institute.findMany({
          where,
          include: {
            plan: { select: { id: true, name: true, priceMonthly: true } },
            _count: { select: { users: true, batches: true, studentProfiles: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: query.limit,
        }),
        prisma.institute.count({ where }),
      ]);

      // Get owner info for each institute
      const instituteIds = institutes.map(i => i.id);
      const owners = await prisma.user.findMany({
        where: { instituteId: { in: instituteIds }, role: 'owner' },
        select: { id: true, name: true, phone: true, email: true, instituteId: true },
      });
      const ownerMap = new Map(owners.map(o => [o.instituteId!, o]));

      const data = institutes.map(inst => ({
        ...inst,
        owner: ownerMap.get(inst.id) || null,
      }));

      res.json({
        success: true,
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      });
    } catch (error: any) {
      logger.error('Failed to list institutes', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to list institutes' });
    }
  },

  // ---------- Get Single Institute ----------
  async getInstitute(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const institute = await prisma.institute.findUnique({
        where: { id },
        include: {
          plan: true,
          _count: { select: { users: true, batches: true, studentProfiles: true, feePlans: true } },
        },
      });

      if (!institute) {
        res.status(404).json({ success: false, error: 'Institute not found', code: 'NOT_FOUND' });
        return;
      }

      // Get user counts by role
      const roleCounts = await prisma.user.groupBy({
        by: ['role'],
        where: { instituteId: id },
        _count: true,
      });

      // Get owner and staff
      const users = await prisma.user.findMany({
        where: { instituteId: id },
        select: { id: true, name: true, phone: true, email: true, role: true, status: true, lastLoginAt: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      res.json({
        success: true,
        data: {
          ...institute,
          users,
          breakdown: {
            roles: Object.fromEntries(roleCounts.map(r => [r.role, r._count]))
          }
        },
      });
    } catch (error: any) {
      logger.error('Failed to get institute', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get institute' });
    }
  },

  // ---------- Get Institute Audit Logs ----------
  async getInstituteAuditLogs(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: { instituteId: id },
          include: { user: { select: { name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.auditLog.count({ where: { instituteId: id } }),
      ]);

      res.json({
        success: true,
        data: logs,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      logger.error('Failed to get institute audit logs', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get logs' });
    }
  },

  // ---------- Get Institute Payments ----------
  async getInstitutePayments(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const payments = await prisma.payment.findMany({
        where: { instituteId: id },
        include: {
          feeRecord: { include: { feePlan: { select: { name: true } } } },
          recorder: { select: { name: true } },
        },
        orderBy: { paidAt: 'desc' },
      });

      res.json({ success: true, data: payments });
    } catch (error: any) {
      logger.error('Failed to get institute payments', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to get payments' });
    }
  },

  // ---------- Create Institute ----------
  async createInstitute(req: Request, res: Response) {
    try {
      const body = createInstituteSchema.parse(req.body);

      // Check subdomain uniqueness
      const existing = await prisma.institute.findUnique({ where: { subdomain: body.subdomain } });
      if (existing) {
        res.status(409).json({ success: false, error: 'Subdomain already taken', code: 'SUBDOMAIN_TAKEN' });
        return;
      }

      // Create institute + owner in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const institute = await tx.institute.create({
          data: {
            name: body.name,
            subdomain: body.subdomain,
            phone: body.phone,
            email: body.email,
            address: body.address,
            planId: body.planId || null,
            academicYear: body.academicYear || null,
            status: 'active',
            setupCompleted: false,
          },
        });

        const passwordHash = await authService.hashPassword(body.ownerPassword);

        const owner = await tx.user.create({
          data: {
            instituteId: institute.id,
            name: body.ownerName,
            phone: body.ownerPhone,
            email: body.ownerEmail,
            passwordHash,
            role: 'owner',
            permissionsJson: [],
            status: 'active',
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            userId: req.user!.userId,
            action: 'institute.create',
            entityType: 'institute',
            entityId: institute.id,
            afterJson: { instituteName: institute.name, ownerName: owner.name },
            ipAddress: req.ip,
          },
        });

        return { institute, owner };
      });

      logger.info(`Institute created: ${result.institute.name} (${result.institute.subdomain})`);

      res.status(201).json({
        success: true,
        data: {
          institute: result.institute,
          owner: {
            id: result.owner.id,
            name: result.owner.name,
            phone: result.owner.phone,
            email: result.owner.email,
          },
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to create institute', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to create institute' });
    }
  },

  // ---------- Update Institute ----------
  async updateInstitute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const body = updateInstituteSchema.parse(req.body);

      const existing = await prisma.institute.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Institute not found', code: 'NOT_FOUND' });
        return;
      }

      const updated = await prisma.institute.update({
        where: { id },
        data: body,
        include: { plan: { select: { id: true, name: true } } },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'institute.update',
          entityType: 'institute',
          entityId: id,
          beforeJson: { status: existing.status, planId: existing.planId },
          afterJson: body,
          ipAddress: req.ip,
        },
      });

      logger.info(`Institute updated: ${updated.name} (${id})`);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to update institute', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update institute' });
    }
  },

  // ---------- Delete Institute (Hard) ----------
  async deleteInstitute(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.institute.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Institute not found', code: 'NOT_FOUND' });
        return;
      }

      await prisma.$transaction(async (tx) => {
        // 1. Audit log (Before deletion)
        await tx.auditLog.create({
          data: {
            userId: req.user!.userId,
            action: 'institute.delete',
            entityType: 'institute',
            entityId: id,
            beforeJson: { name: existing.name, status: existing.status },
            ipAddress: req.ip,
          },
        });

        // 2. Hard delete the institute (Cascades to Users, Batches, StudentProfiles, etc.)
        await tx.institute.delete({ where: { id } });
      });

      logger.info(`Institute deleted permanently: ${existing.name} (${id})`);
      res.json({ success: true, message: 'Institute and all associated data deleted permanently' });
    } catch (error: any) {
      logger.error('Failed to delete institute', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to delete institute' });
    }
  },

  // ---------- List Plans ----------
  async listPlans(_req: Request, res: Response) {
    try {
      const plans = await prisma.plan.findMany({
        orderBy: { priceMonthly: 'asc' },
        include: { _count: { select: { institutes: true } } },
      });
      res.json({ success: true, data: plans });
    } catch (error: any) {
      logger.error('Failed to list plans', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to list plans' });
    }
  },

  // ---------- Create Plan ----------
  async createPlan(req: Request, res: Response) {
    try {
      const schema = z.object({
        name: z.string().min(2).max(100),
        maxStudents: z.number().int().positive(),
        maxStaff: z.number().int().positive(),
        maxStorageMb: z.number().int().positive(),
        priceMonthly: z.number().nonnegative(),
        featuresJson: z.record(z.any()).optional(),
      });

      const body = schema.parse(req.body);

      const plan = await prisma.plan.create({
        data: {
          ...body,
          featuresJson: body.featuresJson || {},
        },
      });

      logger.info(`Plan created: ${plan.name}`);
      res.status(201).json({ success: true, data: plan });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to create plan', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to create plan' });
    }
  },

  // ---------- Update Plan ----------
  async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schema = z.object({
        name: z.string().min(2).max(100).optional(),
        maxStudents: z.number().int().positive().optional(),
        maxStaff: z.number().int().positive().optional(),
        maxStorageMb: z.number().int().positive().optional(),
        priceMonthly: z.number().nonnegative().optional(),
        featuresJson: z.record(z.any()).optional(),
        status: z.enum(['active', 'inactive']).optional(),
      });

      const body = schema.parse(req.body);

      const plan = await prisma.plan.update({
        where: { id },
        data: body,
      });

      logger.info(`Plan updated: ${plan.name}`);
      res.json({ success: true, data: plan });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to update plan', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update plan' });
    }
  },

  // ---------- Delete Plan ----------
  async deletePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const plan = await prisma.plan.findUnique({
        where: { id },
        include: { _count: { select: { institutes: true } } }
      });

      if (!plan) {
        res.status(404).json({ success: false, error: 'Plan not found', code: 'NOT_FOUND' });
        return;
      }

      // Safety Check: Standard Practice is to block deletion if institutes are using it
      if (plan._count.institutes > 0) {
        res.status(400).json({
          success: false,
          error: `Cannot delete plan "${plan.name}" because it is currently being used by ${plan._count.institutes} institutes.`,
          code: 'PLAN_IN_USE',
          details: { count: plan._count.institutes }
        });
        return;
      }

      // Perform deletion
      await prisma.plan.delete({ where: { id } });

      // Audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'plan.delete',
          entityType: 'plan',
          entityId: id,
          beforeJson: { name: plan.name, priceMonthly: plan.priceMonthly },
          ipAddress: req.ip,
        },
      });

      logger.info(`Plan deleted: ${plan.name} (${id})`);
      res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (error: any) {
      logger.error('Failed to delete plan', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to delete plan' });
    }
  },
};
