// Cloudflare Worker that keeps the Gemini key server-side.
// Deploy:  npx wrangler deploy proxy/worker.js --name eventai-proxy
//          npx wrangler secret put GEMINI_API_KEY
// Then set VITE_GEMINI_PROXY_URL to the worker URL and set ALLOWED_ORIGIN below.

const ALLOWED_ORIGIN = "https://nipunkandaricert-beep.github.io";
const ALLOWED_MODELS = new Set(["gemini-2.5-flash"]);
const MAX_BODY_BYTES = 20_000;

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
    if (request.headers.get("Origin") !== ALLOWED_ORIGIN)
      return new Response("Forbidden", { status: 403, headers: cors });

    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return new Response("Payload too large", { status: 413, headers: cors });

    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      return new Response("Bad request", { status: 400, headers: cors });
    }
    if (!ALLOWED_MODELS.has(payload.model) || typeof payload.request !== "object" || payload.request === null) {
      return new Response("Bad request", { status: 400, headers: cors });
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${payload.model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify(payload.request),
      }
    );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};
