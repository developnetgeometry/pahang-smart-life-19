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

  console.log(`Proxying stream: ${url}`);

  try {
    // Add User-Agent and other headers to avoid blocking
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/*, application/vnd.apple.mpegurl, */*",
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

    // Check if upstream already has CORS headers
    const upstreamCors = upstream.headers.get("access-control-allow-origin");
    const responseHeaders = new Headers();
    
    // Use upstream CORS headers if they exist, otherwise use our own
    if (upstreamCors) {
      console.log("Using upstream CORS headers");
      responseHeaders.set("Access-Control-Allow-Origin", upstreamCors);
      
      // Copy other CORS headers from upstream if they exist
      const upstreamMethods = upstream.headers.get("access-control-allow-methods");
      const upstreamHeaders = upstream.headers.get("access-control-allow-headers");
      
      if (upstreamMethods) responseHeaders.set("Access-Control-Allow-Methods", upstreamMethods);
      if (upstreamHeaders) responseHeaders.set("Access-Control-Allow-Headers", upstreamHeaders);
    } else {
      console.log("Adding our own CORS headers");
      // Add our CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });
    }

    // Preserve content-type, default based on URL pattern
    const contentType = upstream.headers.get("content-type") ?? 
      (url.includes('.m3u8') ? "application/vnd.apple.mpegurl" : "multipart/x-mixed-replace");
    
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
