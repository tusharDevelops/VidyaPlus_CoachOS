import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.CLOUDFLARE_WORKER === 'true' || typeof globalThis.WebSocket !== 'undefined') {
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({
    adapter,
    log: ['error'],
  });
} else {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export default prisma;
