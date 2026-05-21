import serverless from "serverless-http";
import app from "./app";

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

const expressHandler = serverless(app);

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.has(origin);

    // Preflight — handle directly, never touch Express
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

    // serverless-http tries to assign to request.body which is read-only in Workers.
    // Fix: shadow the prototype getter with a writable instance property.
    try {
      Object.defineProperty(request, 'body', {
        value: request.body,
        writable: true,
        configurable: true,
      });
    } catch {
      // If defineProperty fails, clone the request into a plain wrapper
    }

    let response: Response;
    try {
      response = await (expressHandler as any)(request, env);
    } catch (err: any) {
      const body = JSON.stringify({ success: false, error: err?.message || 'Internal Server Error' });
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAllowed) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
      }
      return new Response(body, { status: 500, headers });
    }

    // Inject CORS headers into the response
    if (isAllowed && response) {
      try {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', origin);
        newHeaders.set('Access-Control-Allow-Credentials', 'true');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch {
        // If response cloning fails, return it as-is
        return response;
      }
    }

    return response;
  },
};
