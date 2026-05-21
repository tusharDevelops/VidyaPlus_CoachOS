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

function addCorsHeaders(response: Response, origin: string): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
  // Must create new response since headers may be immutable
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const expressHandler = serverless(app);

export default {
  async fetch(request: Request, ...args: any[]): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.has(origin);

    // Preflight
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

    // Regular requests
    try {
      const response: any = await expressHandler(request, ...args);

      if (!isAllowed) return response;

      // Try standard Response cloning first
      try {
        return addCorsHeaders(response, origin);
      } catch {
        // Fallback: read body as text and rebuild
        let bodyText = '';
        let status = 200;
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');

        try { bodyText = await response.text(); } catch { bodyText = ''; }
        try { status = response.status || 200; } catch { /* keep 200 */ }
        try {
          if (response.headers && typeof response.headers.forEach === 'function') {
            response.headers.forEach((v: string, k: string) => headers.set(k, v));
          }
        } catch { /* keep defaults */ }

        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Credentials', 'true');

        return new Response(bodyText, { status, headers });
      }
    } catch (err: any) {
      const errorBody = JSON.stringify({ success: false, error: err?.message || 'Internal Server Error' });
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAllowed) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
      }
      return new Response(errorBody, { status: 500, headers });
    }
  },
};
