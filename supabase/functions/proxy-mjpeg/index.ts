// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: proxy-mjpeg-or-hls
// GET /proxy-mjpeg?url=<encoded_upstream_url>

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function corsFor(origin: string | null) {
  // If you want to lock to your domains, replace "*" with the origin allowlist logic.
  const o = origin && origin !== "null" ? origin : "*";
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, cache-control, range, referer",
    "Access-Control-Expose-Headers":
      "content-type, content-length, accept-ranges",
    Vary: "Origin",
  };
}

serve(async (req) => {
  const { searchParams } = new URL(req.url);
  const origin = req.headers.get("origin");
  const baseCors = corsFor(origin);

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: baseCors });
  }

  const url = searchParams.get("url");
  if (!url) {
    return new Response("Missing url param", {
      status: 400,
      headers: baseCors,
    });
  }

  try {
    const target = new URL(url);

    // Headers to reduce upstream blocks
    const upstreamHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "image/*, application/vnd.apple.mpegurl, */*",
      "Accept-Encoding": "identity",
      Connection: "keep-alive",
      Referer: target.origin,
    };
    if (target.hostname.endsWith(".ngrok-free.app")) {
      upstreamHeaders["ngrok-skip-browser-warning"] = "true";
    }

    // Timeout safety
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const upstream = await fetch(target.toString(), {
      headers: upstreamHeaders,
      redirect: "follow",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!upstream.ok || !upstream.body) {
      console.error(
        `Upstream error: ${upstream.status} ${upstream.statusText}`
      );
      return new Response(`Upstream error ${upstream.status}`, {
        status: 502,
        headers: baseCors,
      });
    }

    // We control CORS. Do NOT copy upstream CORS headers to avoid duplicates.
    const resHeaders = new Headers(baseCors);
    const upstreamCT = upstream.headers.get("content-type") || "";
    let contentType = upstreamCT;

    // If content-type missing, guess from URL
    if (!contentType) {
      contentType = url.includes(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : "multipart/x-mixed-replace";
    }

    resHeaders.set("Content-Type", contentType);
    resHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    resHeaders.set("Pragma", "no-cache");
    resHeaders.set("Expires", "0");
    // Helpful for some proxies when streaming
    resHeaders.set("X-Accel-Buffering", "no");

    // If HLS playlist, rewrite segment URIs to go through this proxy as well
    if (contentType.toLowerCase().includes("application/vnd.apple.mpegurl")) {
      const playlist = await upstream.text();
      const base = new URL(url);

      const rewritten = playlist
        .split("\n")
        .map((line) => {
          const t = line.trim();
          if (!t || t.startsWith("#")) return line; // comments and tags stay
          // Resolve relative to upstream playlist URL
          const absolute = new URL(t, base).toString();
          // Point back to this function
          const self = new URL(req.url);
          self.searchParams.set("url", absolute);
          return self.toString();
        })
        .join("\n");

      return new Response(rewritten, { status: 200, headers: resHeaders });
    }

    // MJPEG or anything else: stream through as-is
    // Keep status from upstream for transparency
    return new Response(upstream.body, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (e: any) {
    console.error(`Proxy error: ${e?.message || e}`);
    return new Response(`Proxy error: ${e?.message || e}`, {
      status: 500,
      headers: corsFor(req.headers.get("origin")),
    });
  }
});
