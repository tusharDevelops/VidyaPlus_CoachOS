import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

const updateInstituteProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().min(1).max(15).optional(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  academicYear: z.string().optional().nullable(),
});

export const settingsController = {
  // ---------- Get Institute Profile ----------
  async getProfile(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;

      const institute = await prisma.institute.findFirst({
        where: { id: instituteId },
      });

      if (!institute) {
        res.status(404).json({ success: false, error: 'Institute not found' });
        return;
      }

      res.json({ success: true, data: institute });
    } catch (error: any) {
      logger.error('Failed to get profile', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch institute profile' });
    }
  },

  // ---------- Update Institute Profile ----------
  async updateProfile(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const body = updateInstituteProfileSchema.parse(req.body);

      const institute = await prisma.institute.findFirst({
        where: { id: instituteId },
      });

      if (!institute) {
        res.status(404).json({ success: false, error: 'Institute not found' });
        return;
      }

      const updated = await prisma.institute.update({
        where: { id: instituteId },
        data: {
          name: body.name ?? undefined,
          phone: body.phone ?? undefined,
          email: body.email ?? undefined,
          address: body.address ?? undefined,
          logoUrl: body.logoUrl ?? undefined,
          academicYear: body.academicYear ?? undefined,
        },
      });

      // Also update name of current logged in user's institute if cached (if applicable)
      res.json({ success: true, message: 'Institute profile updated successfully', data: updated });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
        return;
      }
      logger.error('Failed to update institute profile', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update institute profile' });
    }
  }
};
