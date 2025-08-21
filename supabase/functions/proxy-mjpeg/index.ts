// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: proxy-mjpeg
// Proxies an MJPEG stream to avoid CORS and preserves multipart/x-mixed-replace
// Usage: GET /proxy-mjpeg?url=<encoded_mjpeg_url>

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

serve(async (req) => {
  const { searchParams } = new URL(req.url);
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders(req.headers.get("origin")),
    });
  }

  const url = searchParams.get("url");
  if (!url) {
    return new Response("Missing url param", {
      status: 400,
      headers: corsHeaders(req.headers.get("origin")),
    });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return new Response(`Upstream error ${upstream.status}`, {
        status: 502,
        headers: corsHeaders(req.headers.get("origin")),
      });
    }

    // Try to preserve content-type, default to multipart/x-mixed-replace
    const contentType =
      upstream.headers.get("content-type") ?? "multipart/x-mixed-replace";
    const headers = new Headers(corsHeaders(req.headers.get("origin")));
    headers.set("Content-Type", contentType);
    return new Response(upstream.body, { status: 200, headers });
  } catch (e) {
    return new Response(`Proxy error: ${e?.message || e}`, {
      status: 500,
      headers: corsHeaders(req.headers.get("origin")),
    });
  }
});
