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

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

// Original serverless handler — don't modify its response
const expressHandler = serverless(app) as any;

export default {
  async fetch(request: Request, ...args: any[]): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.has(origin);

    // Preflight: respond immediately, never hit Express
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: isAllowed
          ? { ...CORS_HEADERS, 'Access-Control-Allow-Origin': origin }
          : {},
      });
    }

    // Actual request: let serverless-http handle it
    let response: Response;
    try {
      response = await expressHandler(request, ...args);
    } catch (err: any) {
      response = new Response(
        JSON.stringify({ success: false, error: 'Internal Server Error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Inject CORS headers into the final response
    if (isAllowed) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', origin);
      newHeaders.set('Access-Control-Allow-Credentials', 'true');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return response;
  },
};
