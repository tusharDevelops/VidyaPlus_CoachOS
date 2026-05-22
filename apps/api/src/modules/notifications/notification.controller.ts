import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { z } from 'zod';

// ============================================
// Controllers
// ============================================
export const notificationController = {
  // ---------- List Notifications ----------
  async listNotifications(req: Request, res: Response) {
    try {
      const recipientId = req.user!.userId;
      const instituteId = req.user!.instituteId!;

      const notifications = await prisma.notification.findMany({
        where: {
          instituteId,
          recipientId,
        },
        orderBy: { createdAt: 'desc' },
      });

      const unreadCount = notifications.filter(n => n.status === 'unread' || n.status === 'queued').length;

      res.json({
        success: true,
        data: {
          unreadCount,
          notifications: notifications.map(n => ({
            id: n.id,
            content: n.content,
            channel: n.channel,
            status: n.status,
            createdAt: n.createdAt.toISOString(),
          })),
        },
      });
    } catch (error: any) {
      logger.error('Failed to list notifications', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
  },

  // ---------- Mark Specific As Read ----------
  async markAsRead(req: Request, res: Response) {
    try {
      const recipientId = req.user!.userId;
      const { id } = req.params;

      const existing = await prisma.notification.findFirst({
        where: { id, recipientId },
      });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Notification not found' });
        return;
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { status: 'read' },
      });

      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('Failed to mark notification as read', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update notification' });
    }
  },

  // ---------- Mark All As Read ----------
  async markAllRead(req: Request, res: Response) {
    try {
      const recipientId = req.user!.userId;

      await prisma.notification.updateMany({
        where: { recipientId, status: { not: 'read' } },
        data: { status: 'read' },
      });

      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
      logger.error('Failed to mark all notifications as read', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to update notifications' });
    }
  },

  // ---------- Generate Reminders (Fee due alerts) ----------
  async generateFeeReminders(req: Request, res: Response) {
    try {
      const instituteId = req.user!.instituteId!;
      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);

      // Find fee records that are unpaid and due within the next 3 days
      const upcomingFees = await prisma.feeRecord.findMany({
        where: {
          instituteId,
          status: 'unpaid',
          dueDate: {
            gte: today,
            lte: threeDaysLater,
          }
        },
        include: {
          student: { include: { user: true } },
          feePlan: true,
        },
      });

      if (upcomingFees.length === 0) {
        res.json({ success: true, message: 'No upcoming due fees found for alerts' });
        return;
      }

      // Find the institute owner(s) who should receive this alert
      const owners = await prisma.user.findMany({
        where: { instituteId, role: 'owner', status: 'active' }
      });

      if (owners.length === 0) {
        res.json({ success: true, message: 'No active owners found to send alerts' });
        return;
      }

      let generatedCount = 0;

      for (const fee of upcomingFees) {
        const studentName = fee.student.user.name;
        const amount = Number(fee.amount);
        const planName = fee.feePlan.name;
        const dueDate = fee.dueDate.toISOString().split('T')[0];

        const content = `Reminder: Fee of ₹${amount.toLocaleString()} for student ${studentName} under plan "${planName}" is due on ${dueDate}.`;

        // Check if there's already a recent reminder for this fee record
        const recent = await prisma.notification.findFirst({
          where: {
            instituteId,
            content: { contains: `student ${studentName}` },
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // past 24 hours
          }
        });

        if (recent) continue;

        // Create for every owner
        for (const owner of owners) {
          await prisma.notification.create({
            data: {
              instituteId,
              recipientId: owner.id,
              channel: 'in_app',
              content,
              status: 'unread',
            },
          });
        }
        generatedCount++;
      }

      res.json({ success: true, message: `Successfully generated ${generatedCount} fee reminder notifications` });
    } catch (error: any) {
      logger.error('Failed to generate reminders', { error: error.message });
      res.status(500).json({ success: false, error: 'Failed to generate reminders' });
    }
  },
};
