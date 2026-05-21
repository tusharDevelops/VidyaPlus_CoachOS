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
    // We use a Proxy to intercept these mutations and store them safely in a custom state object.
    const customState: Record<string, any> = {};
    const mutableRequest = new Proxy(request, {
      get(target, prop, receiver) {
        if (prop in customState) return customState[prop as string];
        const value = Reflect.get(target, prop, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set(target, prop, value) {
        customState[prop as string] = value;
        return true;
      },
      defineProperty(target, prop, descriptor) {
        customState[prop as string] = descriptor.value;
        return true;
      },
      deleteProperty(target, prop) {
        delete customState[prop as string];
        return true;
      }
    });

    let result: any;
    try {
      result = await (expressHandler as any)(mutableRequest, env);
    } catch (err: any) {
      const body = JSON.stringify({ success: false, error: err?.message || 'Internal Server Error' });
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAllowed) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
      }
      return new Response(body, { status: 500, headers });
    }

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

    return new Response(body, {
      status,
      headers
    });
  },
};
