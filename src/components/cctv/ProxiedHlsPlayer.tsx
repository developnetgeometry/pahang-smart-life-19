import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Video } from "lucide-react";
import Hls, { HlsConfig, Events, ErrorTypes } from "hls.js";

interface ProxiedHlsPlayerProps {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  className?: string;
}

export const ProxiedHlsPlayer: React.FC<ProxiedHlsPlayerProps> = ({
  src,
  autoPlay = false,
  controls = true,
  muted = true,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const mjpegProxy = import.meta.env.VITE_MJPEG_PROXY_URL as string;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    // If native HLS is supported (Safari), just set src
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    // Otherwise use hls.js with custom loader for proxy
    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      const hlsConfig: Partial<HlsConfig> = {
        enableWorker: true,
        loader: class extends (Hls.DefaultConfig.loader!) {
          load(context: any, config: any, callbacks: any) {
            // Check if this URL should be proxied
            const shouldProxy = this.shouldUseProxy(context.url);

            if (shouldProxy) {
              // Use fetch with Supabase auth for proxied requests
              this.loadWithProxy(context, config, callbacks);
            } else {
              // Use default loader for direct requests
              super.load(context, config, callbacks);
            }
          }

          shouldUseProxy(url: string): boolean {
            try {
              const urlObj = new URL(url);
              const appOrigin = window.location.origin;
              const isCrossOrigin = urlObj.origin !== appOrigin;
              const isNgrok =
                urlObj.hostname.endsWith(".ngrok-free.app") ||
                urlObj.hostname.endsWith(".ngrok.io");
              return isCrossOrigin || isNgrok;
            } catch {
              return false;
            }
          }

          async loadWithProxy(context: any, config: any, callbacks: any) {
            try {
              const proxyUrl = `${mjpegProxy}?url=${encodeURIComponent(
                context.url
              )}`;
              const response = await fetch(proxyUrl, {
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                },
              });

              if (!response.ok) {
                throw new Error(`Proxy request failed: ${response.status}`);
              }

              const data = await response.arrayBuffer();
              const uint8Array = new Uint8Array(data);

              callbacks.onSuccess(
                {
                  url: context.url,
                  data: uint8Array,
                },
                { url: context.url },
                context
              );
            } catch (error: any) {
              callbacks.onError(
                {
                  code: 0,
                  text: error.message || "Proxy load failed",
                },
                context
              );
            }
          }
        },
      };

      hls = new Hls(hlsConfig);
      hls.loadSource(src);
      hls.attachMedia(video);

      // Handle errors gracefully
      hls.on(Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS.js fatal error:", data);
          setError(`HLS Error: ${data.details}`);
          switch (data.type) {
            case ErrorTypes.NETWORK_ERROR:
              console.log("Network error, attempting to recover...");
              hls?.startLoad();
              break;
            case ErrorTypes.MEDIA_ERROR:
              console.log("Media error, attempting to recover...");
              hls?.recoverMediaError();
              break;
            default:
              console.log("Unrecoverable error, destroying HLS instance");
              hls?.destroy();
              break;
          }
        }
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, supabaseKey, mjpegProxy, isPlaying]);

  // Show play button overlay if not playing
  if (!isPlaying) {
    return (
      <div className={`bg-black relative aspect-video ${className || ""}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-4">Click to start streaming</p>
            <Button
              size="lg"
              onClick={() => setIsPlaying(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Play className="h-6 w-6 mr-2" />
              Play
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center text-sm text-red-500 ${
          className || ""
        }`}
      >
        {error}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay={false}
      controls={controls}
      muted={muted}
      className={className}
      playsInline
    />
  );
};

export default ProxiedHlsPlayer;
