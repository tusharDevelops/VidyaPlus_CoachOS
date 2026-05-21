import serverless from "serverless-http";
import app from "./app";

// Inject indicator variable for Edge environment
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

// Original serverless handler — pass through untouched
const expressHandler = serverless(app);

export default {
  async fetch(request: Request, ...args: any[]): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.has(origin);

    // Handle preflight OPTIONS directly — Express cors may not handle it well in Workers
    if (request.method === 'OPTIONS' && isAllowed) {
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

    // All other requests: let Express handle everything (including CORS headers)
    return expressHandler(request, ...args) as Promise<Response>;
  },
};
