import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.PRISMA_DEBUG === 'true' ? ['query', 'error', 'warn'] : ['error', 'warn'],
});

export default prisma;
