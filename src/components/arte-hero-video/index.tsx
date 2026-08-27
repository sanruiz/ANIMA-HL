"use client";

import { useEffect, useRef } from "react";

interface ArteHeroVideoProps {
  src: string;
  poster: string;
}

export default function ArteHeroVideo({ src, poster }: ArteHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    video.play().catch(() => {});
  }, []);

  return (
    <video
      ref={videoRef}
      className="arte-hero__video"
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
