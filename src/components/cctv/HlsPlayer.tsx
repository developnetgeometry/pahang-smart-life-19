import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

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
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleError = (errorMsg: string) => {
    console.error("HLS Player Error:", errorMsg);
    setError(errorMsg);
    setLoading(false);
  };

  const retry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setLoading(true);
      initializePlayer();
    }
  };

  const initializePlayer = () => {
    const video = videoRef.current;
    if (!video || !src) {
      handleError("No video element or source available");
      return;
    }

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setLoading(true);
    setError(null);

    // If native HLS is supported (Safari), just set src
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Using native HLS support");
      video.src = src;
      
      video.addEventListener("loadstart", () => setLoading(true));
      video.addEventListener("canplay", () => setLoading(false));
      video.addEventListener("error", () => {
        handleError("Native HLS playback failed");
      });
      
      return;
    }

    // Otherwise use hls.js
    if (Hls.isSupported()) {
      console.log("Using hls.js for HLS playback");
      const hls = new Hls({
        enableWorker: true,
        debug: false,
        xhrSetup: (xhr, url) => {
          // Add CORS headers if needed
          xhr.withCredentials = false;
        },
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("HLS: Media attached");
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS: Manifest parsed, starting playback");
        setLoading(false);
        if (autoPlay) {
          video.play().catch((err) => {
            console.warn("Autoplay failed:", err);
            // Don't treat autoplay failure as a critical error
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              handleError("Network error - check stream URL and internet connection");
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              handleError("Media error - stream format may be incompatible");
              break;
            default:
              handleError(`HLS fatal error: ${data.details}`);
              break;
          }
        }
      });

      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      handleError("HLS is not supported in this browser");
    }
  };

  useEffect(() => {
    setRetryCount(0);
    initializePlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-900 text-white p-4 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Stream Error</div>
          <div className="text-sm mb-4">{error}</div>
          {retryCount < maxRetries && (
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              Retry ({retryCount + 1}/{maxRetries + 1})
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-sm">Loading stream...</div>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
        className="w-full h-full"
        playsInline
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => handleError("Video playback error")}
      />
    </div>
  );
};

export default HlsPlayer;
