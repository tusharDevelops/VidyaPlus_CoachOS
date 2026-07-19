import cron from 'node-cron';
import prisma from './prisma';
import logger from './logger';

/**
 * Initialize all cron jobs for the application.
 * This should be called once when the server starts.
 */
export function initCronJobs() {
  logger.info('🕒 Initializing background cron jobs...');

  // Run every night at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    logger.info('🏃 Running midnight batch expiration job...');
    
    try {
      const now = new Date();
      // Reset time to start of day for accurate comparison
      now.setHours(0, 0, 0, 0);

      // Find all batches that are active but their end date is before today
      const expiredBatches = await prisma.batch.findMany({
        where: {
          status: 'active',
          endDate: {
            lt: now
          }
        },
        select: { id: true, name: true, instituteId: true }
      });

      if (expiredBatches.length === 0) {
        logger.info('✅ No expired batches found to archive.');
        return;
      }

      logger.info(`Found ${expiredBatches.length} expired batches. Archiving...`);

      // Update in a transaction
      await prisma.$transaction(async (tx) => {
        for (const batch of expiredBatches) {
          // 1. Mark batch as completed
          await tx.batch.update({
            where: { id: batch.id },
            data: { status: 'completed' }
          });

          // 2. Mark all associated enrollments as completed
          await tx.batchEnrollment.updateMany({
            where: { batchId: batch.id, status: 'active' },
            data: { status: 'completed' }
          });
          
          logger.info(`Archived batch ${batch.name} (${batch.id})`);
        }
      });

      logger.info(`🎉 Successfully archived ${expiredBatches.length} expired batches.`);
    } catch (error: any) {
      logger.error('❌ Failed to execute batch expiration cron job', { error: error.message });
    }
  });
}
