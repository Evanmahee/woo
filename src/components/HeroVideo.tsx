"use client";

import { useEffect, useRef } from "react";

/**
 * Background hero video that reliably autoplays on iOS Safari.
 * Requires a muted (preferably audio-free) mp4 + playsInline + programmatic play().
 */
export function HeroVideo({ src = "/hero.mp4" }: { src?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
    video.controls = false;

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          /* Autoplay blocked — retry on first gesture */
        });
      }
    };

    tryPlay();

    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    const onGesture = () => tryPlay();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("touchstart", onGesture, { once: true, passive: true });
    window.addEventListener("click", onGesture, { once: true });

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("click", onGesture);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="hero-video absolute inset-0 h-full w-full object-cover object-center"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
