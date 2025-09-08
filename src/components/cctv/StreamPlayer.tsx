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
  autoPlay = false,
  controls = true,
  muted = true,
}: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gateway = import.meta.env.VITE_STREAM_GATEWAY_URL as string | undefined;
  const mjpegProxy = import.meta.env.VITE_MJPEG_PROXY_URL as string | undefined;

  const strategy = useMemo(() => {
    if (isHls(src)) return "hls" as const;
    if (isMp4(src)) return "mp4" as const;
    if (isMjpeg(src)) return "mjpeg" as const;
    if (isRtsp(src)) return "rtsp" as const;
    return "auto" as const;
  }, [src]);

  // For external streams, skip proxy for now and let them fail gracefully
  const getProxiedSrc = (originalSrc: string) => {
    // For now, return original src and let CORS errors be handled by the player
    return originalSrc;
  };

  useEffect(() => {
    setError(null);
  }, [src, strategy]);

  if (strategy === "hls") {
    return (
      <HlsPlayer
        src={getProxiedSrc(src)}
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
      />
    );
  }

  if (strategy === "mjpeg") {
    const proxied = mjpegProxy
      ? `${mjpegProxy}?url=${encodeURIComponent(src)}`
      : src;
    return (
      <img
        ref={imgRef}
        src={proxied}
        className={className}
        alt="MJPEG stream"
        onError={() => setError("Failed to load MJPEG stream")}
      />
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
        className={`flex items-center justify-center text-sm text-muted-foreground ${
          className || ""
        }`}
      >
        RTSP isn’t supported in browsers directly. Configure
        VITE_STREAM_GATEWAY_URL to an HLS gateway.
      </div>
    );
  }

  if (isHls(src)) {
    return (
      <HlsPlayer
        src={getProxiedSrc(src)}
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
      />
    );
  }
  const tryProxy = mjpegProxy
    ? `${mjpegProxy}?url=${encodeURIComponent(src)}`
    : src;
  return (
    <img
      ref={imgRef}
      src={tryProxy}
      className={className}
      alt="Stream"
      onError={() => setError("Failed to load stream")}
    />
  );
}
