// We do not import PrismaClient at the top-level to avoid bundler resolution issues
// where Cloudflare Workers defaults to index-browser.js which doesn't support Driver Adapters.
let prisma: any;

if (process.env.CLOUDFLARE_WORKER === 'true' || typeof globalThis.WebSocket !== 'undefined') {
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { PrismaClient } = require('@prisma/client/edge');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({
    adapter,
    log: ['error'],
  });
} else {
  const { PrismaClient } = require('@prisma/client/index.js');
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export default prisma;
