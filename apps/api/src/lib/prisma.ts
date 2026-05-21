import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

export const prismaStorage = new AsyncLocalStorage<PrismaClient>();

let prismaInstance: PrismaClient;

export const getPrisma = (): PrismaClient => {
  const store = prismaStorage.getStore();
  if (store) {
    return store;
  }

  if (!prismaInstance) {
    if (process.env.CLOUDFLARE_WORKER === 'true' || typeof globalThis.WebSocket !== 'undefined') {
      if (typeof WebSocket !== 'undefined') {
        neonConfig.webSocketConstructor = WebSocket;
      }
      const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
      const adapter = new PrismaNeon(pool);
      prismaInstance = new PrismaClient({
        adapter,
        log: ['error'],
      });
    } else {
      prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
  }
  return prismaInstance;
};
