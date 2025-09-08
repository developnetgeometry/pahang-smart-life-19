// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: proxy-mjpeg
// Proxies an MJPEG stream to avoid CORS and preserves multipart/x-mixed-replace
// Usage: GET /proxy-mjpeg?url=<encoded_mjpeg_url>

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
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

  console.log(`Proxying MJPEG stream: ${url}`);

  try {
    // Add User-Agent and other headers to avoid blocking
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/*, */*",
        "Accept-Encoding": "identity",
        "Connection": "keep-alive",
      },
    });
    
    if (!upstream.ok || !upstream.body) {
      console.error(`Upstream error: ${upstream.status} ${upstream.statusText}`);
      return new Response(`Upstream error ${upstream.status}`, {
        status: 502,
        headers: corsHeaders,
      });
    }

    // Preserve content-type, default to multipart/x-mixed-replace for MJPEG
    const contentType = upstream.headers.get("content-type") ?? "multipart/x-mixed-replace";
    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");
    
    console.log(`Successfully proxying stream with content-type: ${contentType}`);
    return new Response(upstream.body, { status: 200, headers: responseHeaders });
  } catch (e) {
    console.error(`Proxy error: ${e?.message || e}`);
    return new Response(`Proxy error: ${e?.message || e}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
