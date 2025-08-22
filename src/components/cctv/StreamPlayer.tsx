import React, { useEffect, useMemo, useRef, useState } from "react";
import HlsPlayer from "@/components/cctv/HlsPlayer";

type Props = {
  src: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
};

const isHls = (url: string) => /\.m3u8(\?.*)?$/i.test(url);
const isMp4 = (url: string) => /\.(mp4|webm)(\?.*)?$/i.test(url);
const isMjpeg = (url: string) => {
  const u = url.toLowerCase();
  return (
    u.includes("mjpeg") ||
    u.includes("mjpg") ||
    u.includes("nphmotionjpeg") ||
    u.includes("action=stream")
  );
};
const isRtsp = (url: string) => url.toLowerCase().startsWith("rtsp://");

/**
 * StreamPlayer auto-selects the best rendering strategy:
 * - HLS (.m3u8) via hls.js or native Safari
 * - MJPEG via <img> (optionally proxied)
 * - MP4/WebM via native <video>
 * - RTSP via optional gateway (expects an HLS endpoint like gateway?src=rtsp...)
 */
export default function StreamPlayer({
  src,
  className,
  autoPlay = true,
  controls = true,
  muted = true,
}: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const gateway = import.meta.env.VITE_STREAM_GATEWAY_URL as string | undefined;
  const mjpegProxy = import.meta.env.VITE_MJPEG_PROXY_URL as string | undefined;

  const strategy = useMemo(() => {
    if (!src) return "none" as const;
    if (isHls(src)) return "hls" as const;
    if (isMp4(src)) return "mp4" as const;
    if (isMjpeg(src)) return "mjpeg" as const;
    if (isRtsp(src)) return "rtsp" as const;
    return "auto" as const;
  }, [src]);

  useEffect(() => {
    setError(null);
  }, [src, strategy]);

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white p-4 ${className || ""}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">📹</div>
          <div className="text-sm">No stream URL configured</div>
        </div>
      </div>
    );
  }

  if (strategy === "hls") {
    return (
      <HlsPlayer
        src={src}
        className={className}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
      />
    );
  }

  if (strategy === "mp4") {
    return (
      <video
        className={className}
        src={src}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
        playsInline
        onError={() => setError("Failed to load MP4 stream")}
      />
    );
  }

  if (strategy === "mjpeg") {
    const proxied = mjpegProxy
      ? `${mjpegProxy}?url=${encodeURIComponent(src)}`
      : src;
    
    if (error) {
      return (
        <div className={`flex items-center justify-center bg-gray-900 text-white p-4 ${className || ""}`}>
          <div className="text-center">
            <div className="text-red-400 mb-2">⚠️</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <div className="text-sm">Loading MJPEG stream...</div>
            </div>
          </div>
        )}
        <img
          ref={imgRef}
          src={proxied}
          className="w-full h-full object-contain"
          alt="MJPEG stream"
          onLoad={() => setImageLoading(false)}
          onLoadStart={() => setImageLoading(true)}
          onError={() => {
            setImageLoading(false);
            setError("Failed to load MJPEG stream - check URL and network connection");
          }}
        />
      </div>
    );
  }

  if (strategy === "rtsp") {
    if (gateway) {
      const hlsFromGateway = `${gateway}?src=${encodeURIComponent(src)}`;
      return (
        <HlsPlayer
          src={hlsFromGateway}
          className={className}
          autoPlay={autoPlay}
          controls={controls}
          muted={muted}
        />
      );
    }
    return (
      <div
        className={`flex items-center justify-center text-sm text-white bg-gray-900 p-4 ${
          className || ""
        }`}
      >
        <div className="text-center">
          <div className="text-yellow-400 mb-2">⚠️</div>
          <div>RTSP streams require a gateway server.</div>
          <div className="text-xs mt-1 opacity-75">Configure VITE_STREAM_GATEWAY_URL</div>
        </div>
      </div>
    );
  }

  // Auto-detection fallback
  if (isHls(src)) {
    return (
      <HlsPlayer
        src={src}
        className={className}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
      />
    );
  }
  
  if (isMp4(src)) {
    return (
      <video
        className={className}
        src={src}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
        playsInline
        onError={() => setError("Failed to load video stream")}
      />
    );
  }
  
  // Try as MJPEG with optional proxy
  const tryProxy = mjpegProxy
    ? `${mjpegProxy}?url=${encodeURIComponent(src)}`
    : src;
    
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-white p-4 ${className || ""}`}>
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <div className="text-sm mb-2">{error}</div>
          <div className="text-xs opacity-75">Stream URL: {src}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-sm">Loading stream...</div>
          </div>
        </div>
      )}
      <img
        ref={imgRef}
        src={tryProxy}
        className="w-full h-full object-contain"
        alt="Stream"
        onLoad={() => setImageLoading(false)}
        onLoadStart={() => setImageLoading(true)}
        onError={() => {
          setImageLoading(false);
          setError("Failed to load stream - check URL format and network connection");
        }}
      />
    </div>
  );
}