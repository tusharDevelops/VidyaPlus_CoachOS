import serverless from "serverless-http";
import app from "./app";
import { Buffer } from "node:buffer";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { prismaStorage } from "./lib/prisma";

process.env.CLOUDFLARE_WORKER = "true";

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://vidya-plus-coach-os-web.vercel.app',
  'https://vidya-plus-coach-os-admin.vercel.app',
  'https://vidya-plus-coach-os-staff.vercel.app',
  'https://vidya-plus-coach-os-student.vercel.app',
]);

const expressHandler = serverless(app, {
  request(req: any, event: any) {
    if (event && event.url) {
      const parsed = new URL(event.url);
      req.url = parsed.pathname + parsed.search;
      req.path = parsed.pathname;
    }
  }
});

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    // Ensure process.env is defined
    if (typeof process === 'undefined') {
      (globalThis as any).process = { env: {} };
    } else if (!process.env) {
      (process as any).env = {};
    }

    // Populate process.env with env bindings and fallback values
    process.env.DATABASE_URL = env.DATABASE_URL || process.env.DATABASE_URL;
    process.env.JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET || 'coachOS_access_secret_dev_2026_xK9mP2qL5nR8wT4v';
    process.env.JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET || 'coachOS_refresh_secret_dev_2026_aB3cD7eF1gH5iJ9k';
    process.env.JWT_ACCESS_EXPIRES_IN = env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    process.env.OTP_EXPIRY_MINUTES = env.OTP_EXPIRY_MINUTES || process.env.OTP_EXPIRY_MINUTES || '10';
    process.env.SMTP_HOST = env.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
    process.env.SMTP_PORT = env.SMTP_PORT || process.env.SMTP_PORT || '587';
    process.env.SMTP_USER = env.SMTP_USER || process.env.SMTP_USER || 'officialrohitsatre@gmail.com';
    process.env.SMTP_PASS = env.SMTP_PASS || process.env.SMTP_PASS || 'ntsqirkngneuaxgd';
    process.env.NODE_ENV = env.NODE_ENV || process.env.NODE_ENV || 'production';

    // Set up WebSocket constructor for Neon Serverless inside this request context
    if (typeof WebSocket !== 'undefined') {
      neonConfig.webSocketConstructor = WebSocket;
    }
    const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({
      adapter,
      log: ['error'],
    });

    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.has(origin);

    const cleanupPool = () => {
      if (pool) {
        if (ctx && typeof ctx.waitUntil === 'function') {
          ctx.waitUntil(pool.end());
        } else {
          pool.end().catch(() => {});
        }
      }
    };

    // Preflight — handle directly, never touch Express
    if (request.method === 'OPTIONS' && isAllowed) {
      cleanupPool();
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const event = {
      version: '1.0',
      resource: url.pathname,
      path: url.pathname,
      httpMethod: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      queryStringParameters: Object.fromEntries(url.searchParams.entries()),
      body: ['GET', 'HEAD'].includes(request.method) ? null : await request.text(),
      isBase64Encoded: false,
      requestContext: {
        httpMethod: request.method,
        path: url.pathname,
      }
    };

    let result: any;
    try {
      result = await prismaStorage.run(prisma, async () => {
        return await (expressHandler as any)(event, env);
      });
    } catch (err: any) {
      cleanupPool();
      const body = JSON.stringify({ success: false, error: err?.message || 'Internal Server Error' });
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAllowed) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
      }
      return new Response(body, { status: 500, headers });
    }

    cleanupPool();

    // If result is already a Response, just return it or inject CORS
    const isResponse = result instanceof Response;
    let body = isResponse ? result.body : result.body;
    if (!isResponse && result.isBase64Encoded && typeof body === 'string') {
      body = Buffer.from(body, 'base64');
    }
    const status = isResponse ? result.status : (result.statusCode || 200);
    const headers = new Headers(isResponse ? result.headers : (result.headers || {}));

    if (isAllowed) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Credentials', 'true');
    }

    const isNullBodyStatus = status === 204 || status === 304 || (status >= 100 && status < 200);
    const responseBody = isNullBodyStatus ? null : body;

    return new Response(responseBody, {
      status,
      headers
    });
  },
};
