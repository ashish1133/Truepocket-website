/**
 * Truepocket Ã¢â‚¬â€ Cloudflare Security Worker
 * Handles: security headers, HTTPS redirect, rate limiting,
 *          caching, APK protection, bot blocking
 *
 * DEPLOY:
 *  1. dash.cloudflare.com Ã¢â€ â€™ Workers & Pages Ã¢â€ â€™ Create Worker
 *  2. Paste this file Ã¢â€ â€™ Save and Deploy
 *  3. Worker Settings Ã¢â€ â€™ Triggers Ã¢â€ â€™ Add Route: *truepocket.live/*
 */

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};

// Ã¢â€â‚¬Ã¢â€â‚¬ Rate limiting store (in-memory per isolate) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX       = 30;     // max requests per IP per minute for APK

function isRateLimited(ip) {
  const now     = Date.now();
  const entry   = rateLimitMap.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Security headers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options":    "nosniff",
  "X-Frame-Options":           "DENY",
  "Referrer-Policy":           "strict-origin-when-cross-origin",
  "Permissions-Policy":        "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "X-XSS-Protection":          "1; mode=block",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
    "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com",
    "img-src 'self' data: https://ui-avatars.com https://images.unsplash.com https://www.truepocket.live",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join("; ")
};

// Ã¢â€â‚¬Ã¢â€â‚¬ Cache rules Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function getCacheControl(pathname) {
  const p = pathname.toLowerCase();
  if (p.endsWith(".apk"))                                   return "public, max-age=86400";
  if (p.endsWith(".css") || p.endsWith(".js"))              return "public, max-age=31536000, immutable";
  if (p.endsWith(".svg") || p.endsWith(".png"))             return "public, max-age=31536000, immutable";
  if (p.endsWith(".html") || p === "/" || !p.includes(".")) return "no-cache, must-revalidate";
  return "public, max-age=86400";
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Known bad user-agents Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const BAD_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nessus/i, /masscan/i,
  /zgrab/i,  /nmap/i,  /python-requests\/2\.[0-4]/i,
  /scrapy/i, /libwww/i, /curl\//i
];

function isBadBot(userAgent) {
  if (!userAgent) return false;
  return BAD_UA_PATTERNS.some(p => p.test(userAgent));
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Main handler Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
async function handleRequest(request) {
  const url = new URL(request.url);
  const ua  = request.headers.get("user-agent") || "";
  const ip  = request.headers.get("cf-connecting-ip") ||
              request.headers.get("x-forwarded-for") || "unknown";

  // 1. Force HTTPS
  if (url.protocol === "http:") {
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }

  // 2. Block known attack tools
  if (isBadBot(ua)) {
    return new Response("Forbidden", { status: 403 });
  }

  // 3. Rate-limit APK downloads
  if (url.pathname.toLowerCase().endsWith(".apk")) {
    if (isRateLimited(ip)) {
      return new Response("Too Many Requests Ã¢â‚¬â€ please wait a minute.", {
        status: 429,
        headers: { "Retry-After": "60", "Content-Type": "text/plain" }
      });
    }
  }

  // 4. Markdown Negotiation for Agents
  const accept = request.headers.get("accept") || "";
  if ((url.pathname === "/" || url.pathname === "/index.html") && accept.includes("text/markdown")) {
    const mdContent = `# Truepocket — Instant Interest Free Loan
Truepocket is the best instant loan app in Chennai and India. Get an interest-free loan — borrow money for 7 days completely free. No interest. No processing fee. No hidden charges.

## Features
- Fast Loan Disbursement
- 7 Day Free Money — Zero Interest
- No Processing Fee
- No Harassment Guarantee

[Download App](https://www.truepocket.live/TruePocket.apk)`;
    return new Response(mdContent, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Link": '</.well-known/api-catalog>; rel="api-catalog"'
      }
    });
  }

  // 5. Fetch from origin (GitHub Pages)
  let response;
  try {
    response = await fetch(request);
  } catch {
    return new Response("Service Unavailable", { status: 503 });
  }

  // 5. Build new headers
  const newHeaders = new Headers(response.headers);

  // Inject all security headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newHeaders.set(key, value);
  }

  // Remove server fingerprinting headers
  newHeaders.delete("X-Powered-By");
  newHeaders.delete("Server");
  newHeaders.delete("X-AspNet-Version");
  newHeaders.delete("X-AspNetMvc-Version");

  // Set cache
  newHeaders.set("Cache-Control", getCacheControl(url.pathname));

  // APK: force download, correct MIME
  if (url.pathname.toLowerCase().endsWith(".apk")) {
    newHeaders.set("Content-Disposition", 'attachment; filename="TruePocket.apk"');
    newHeaders.set("Content-Type", "application/vnd.android.package-archive");
    newHeaders.set("Cache-Control", "public, max-age=86400");
  }

  // Inject Link header for API discovery on homepage
  if (url.pathname === "/" || url.pathname === "/index.html") {
    newHeaders.set("Link", '</.well-known/api-catalog>; rel="api-catalog"');
  }

  return new Response(response.body, {
    status:     response.status,
    statusText: response.statusText,
    headers:    newHeaders
  });
}
