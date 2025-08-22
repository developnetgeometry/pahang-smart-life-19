import React, { useEffect, useRef } from "react";
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
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
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
