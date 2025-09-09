import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Video } from "lucide-react";
import Hls, { HlsConfig, Events, ErrorTypes } from "hls.js";

interface HlsPlayerProps {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  className?: string;
}

export const HlsPlayer: React.FC<HlsPlayerProps> = ({
  src,
  autoPlay = false,
  controls = false,
  muted = true,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    // If native HLS is supported (Safari), just set src
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    // Otherwise use hls.js
    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      // Configure HLS.js with CORS support and ngrok headers
      const hlsConfig: Partial<HlsConfig> = {
        enableWorker: true,
        xhrSetup: (xhr: XMLHttpRequest, url: string) => {
          // Add headers for ngrok and other cross-origin requests
          xhr.setRequestHeader("ngrok-skip-browser-warning", "true");
          xhr.setRequestHeader(
            "User-Agent",
            "Mozilla/5.0 (compatible; HLS-Player)"
          );
          xhr.withCredentials = false; // Ensure no credentials for CORS

          // Set timeout for better error handling
          xhr.timeout = 10000;
        },
      };

      hls = new Hls(hlsConfig);
      hls.loadSource(src);
      hls.attachMedia(video);

      // Handle errors gracefully
      hls.on(Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS.js fatal error:", data);
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
  }, [src, isPlaying]);

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

export default HlsPlayer;
