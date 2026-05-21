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

    // Cloudflare's Request object has read-only properties that serverless-http tries to mutate.
    // Cloning the request creates a mutable copy we can safely pass to express.
    const mutableRequest = new Request(request);

    let response: Response;
    try {
      response = await (expressHandler as any)(mutableRequest, env);
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
    console.log(`[CORS DEBUG] Origin: "${origin}", isAllowed: ${isAllowed}, method: ${request.method}`);
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
      } catch (e: any) {
        console.error("CORS injection failed. Error:", e.message);
        console.log("Response object looks like:", JSON.stringify({
          status: response.status,
          hasBody: !!response.body,
          headersType: typeof response.headers
        }));
        
        // Attempt fallback by just trying to mutate the existing response headers (if they are not immutable)
        try {
          if (response.headers && typeof response.headers.set === 'function') {
             response.headers.set('Access-Control-Allow-Origin', origin);
             response.headers.set('Access-Control-Allow-Credentials', 'true');
          }
        } catch (mutateErr) {
           console.error("Could not mutate headers directly:", mutateErr);
        }
        
        // If response cloning fails, return it as-is (this is likely causing the CORS error on frontend)
        return response;
      }
    }

    return response;
  },
};
