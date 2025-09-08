import React, { useEffect, useRef } from "react";
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
  autoPlay = true,
  controls = true,
  muted = true,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay={autoPlay}
      controls={controls}
      muted={muted}
      className={className}
      playsInline
    />
  );
};

export default HlsPlayer;
