// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: proxy-mjpeg
// Proxies an MJPEG stream to avoid CORS and preserves multipart/x-mixed-replace
// Usage: GET /proxy-mjpeg?url=<encoded_mjpeg_url>

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createHash } from "https://deno.land/std@0.224.0/hash/md5.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  // include range + referer so HLS segment byte-range requests or players sending referer work
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, cache-control, range, referer",
  "Access-Control-Expose-Headers":
    "content-type, content-length, accept-ranges",
  "Access-Control-Allow-Credentials": "false",
};

serve(async (req) => {
  const { searchParams } = new URL(req.url);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = searchParams.get("url");
  if (!url) {
    return new Response("Missing url param", {
      status: 400,
      headers: corsHeaders,
    });
  }
  console.log(`Proxying stream: ${url}`);

  try {
    // Add User-Agent and other headers to avoid blocking
    const target = new URL(url);

    const baseHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "image/*, application/vnd.apple.mpegurl, */*",
      "Accept-Encoding": "identity",
      Connection: "keep-alive",
      Referer: target.origin,
    };
    if (target.hostname.endsWith(".ngrok-free.app")) {
      baseHeaders["ngrok-skip-browser-warning"] = "true";
    }

    async function doFetch(authHeader?: string): Promise<Response> {
      const h = { ...baseHeaders } as Record<string, string>;
      if (authHeader) h["Authorization"] = authHeader;
      return fetch(target.toString(), { headers: h, redirect: "follow" });
    }

    const hasCreds = !!(target.username || target.password);
    const user = decodeURIComponent(target.username || "");
    const pass = decodeURIComponent(target.password || "");
    let upstream: Response;

    if (!hasCreds) {
      upstream = await doFetch();
    } else {
      // Probe without auth to detect Digest
      let probe = await doFetch();
      if (probe.status === 401) {
        const www = probe.headers.get("www-authenticate") || "";
        if (/digest/i.test(www)) {
          // Parse digest challenge
          const params: Record<string, string> = {};
          www.replace(/([a-z0-9_]+)="?([^",]+)"?/gi, (_m, k, v) => {
            params[k.toLowerCase()] = v;
            return "";
          });
          const realm = params["realm"];
          const nonce = params["nonce"];
          const qopRaw = params["qop"] || "";
          const opaque = params["opaque"];
          const qop = qopRaw.split(",")[0].trim();
          const uri = target.pathname + (target.search || "");
          const nc = "00000001";
          const cnonce = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
          if (!realm || !nonce) {
            const basic = btoa(`${user}:${pass}`);
            upstream = await doFetch(`Basic ${basic}`);
          } else {
            const ha1 = createHash("md5")
              .update(`${user}:${realm}:${pass}`)
              .toString();
            const ha2 = createHash("md5").update(`GET:${uri}`).toString();
            let responseHash: string;
            if (qop === "auth") {
              responseHash = createHash("md5")
                .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
                .toString();
            } else {
              responseHash = createHash("md5")
                .update(`${ha1}:${nonce}:${ha2}`)
                .toString();
            }
            let auth = `Digest username="${user}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${responseHash}"`;
            if (opaque) auth += `, opaque="${opaque}"`;
            if (qop === "auth")
              auth += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
            upstream = await doFetch(auth);
            if (upstream.status === 401) {
              const basic = btoa(`${user}:${pass}`);
              upstream = await doFetch(`Basic ${basic}`);
            }
          }
        } else {
          const basic = btoa(`${user}:${pass}`);
          upstream = await doFetch(`Basic ${basic}`);
        }
      } else {
        upstream = probe; // no auth required
      }
    }

    console.log(`Upstream status: ${upstream.status} ${upstream.statusText}`);
    if (!upstream.body) {
      return new Response(`Upstream empty body status ${upstream.status}`, {
        status: upstream.status,
        headers: corsHeaders,
      });
    }

    // Check if upstream already has CORS headers
    const upstreamCors = upstream.headers.get("access-control-allow-origin");
    const responseHeaders = new Headers();

    // Use upstream CORS headers if they exist, otherwise use our own
    if (upstreamCors) {
      console.log("Using upstream CORS headers");
      responseHeaders.set("Access-Control-Allow-Origin", upstreamCors);

      // Copy other CORS headers from upstream if they exist
      const upstreamMethods = upstream.headers.get(
        "access-control-allow-methods"
      );
      const upstreamHeaders = upstream.headers.get(
        "access-control-allow-headers"
      );

      if (upstreamMethods)
        responseHeaders.set("Access-Control-Allow-Methods", upstreamMethods);
      if (upstreamHeaders)
        responseHeaders.set("Access-Control-Allow-Headers", upstreamHeaders);
    } else {
      console.log("Adding our own CORS headers");
      // Add our CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });
    }

    // Preserve content-type, default based on URL pattern
    const contentType =
      upstream.headers.get("content-type") ??
      (url.includes(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : "multipart/x-mixed-replace");

    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");

    console.log(
      `Successfully proxying stream with content-type: ${contentType}`
    );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (e) {
    console.error(`Proxy error: ${e?.message || e}`);
    return new Response(`Proxy error: ${e?.message || e}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
