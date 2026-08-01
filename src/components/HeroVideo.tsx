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
    video.volume = 0;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("x-webkit-airplay", "deny");
    video.controls = false;
    video.disablePictureInPicture = true;

    const tryPlay = () => {
      if (!video.paused && !video.ended) return;
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          /* Autoplay blocked — retry on first gesture */
        });
      }
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);

    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    const onGesture = () => tryPlay();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("touchstart", onGesture, { passive: true });
    window.addEventListener("touchend", onGesture, { passive: true });
    window.addEventListener("click", onGesture);

    const iv = window.setInterval(() => {
      if (video.paused) tryPlay();
    }, 2000);

    return () => {
      window.clearInterval(iv);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("touchend", onGesture);
      window.removeEventListener("click", onGesture);
    };
  }, []);

  return (
    <div className="hero-video-wrap absolute inset-0 overflow-hidden" aria-hidden>
      <video
        ref={ref}
        className="hero-video absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* Covers iOS center play glyph if autoplay is briefly paused */}
      <div className="hero-video-mask pointer-events-none absolute inset-0" />
    </div>
  );
}
