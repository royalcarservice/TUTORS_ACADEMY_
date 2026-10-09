"use client";

import { useEffect, useRef } from "react";

/**
 * Quiet, full-bleed study-film backdrop for the registration checkout.
 * The ivory wash keeps foreground copy readable; reduced-motion users get a
 * paused frame rather than autoplaying footage.
 */
export function TutorRegistrationBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const freezeFrame = () => {
      try {
        video.currentTime = 1.5;
      } catch {
        // Metadata may not be available yet; loadedmetadata will retry.
      }
    };
    const syncPlayback = () => {
      if (reducedMotion.matches) {
        video.pause();
        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) freezeFrame();
        return;
      }
      void video.play().catch(() => undefined);
    };

    video.addEventListener("loadedmetadata", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    syncPlayback();

    return () => {
      video.removeEventListener("loadedmetadata", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      video.pause();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#FDFBF7]" aria-hidden="true">
      <video
        ref={videoRef}
        className="absolute inset-0 size-full scale-[1.04] object-cover object-center opacity-30 saturate-[0.72] sepia-[0.16] blur-[1px]"
        muted
        loop
        playsInline
        preload="auto"
        tabIndex={-1}
      >
        <source src="/videos/tutor-registration-background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(253,251,247,0.9),rgba(253,251,247,0.64)_52%,rgba(253,251,247,0.9))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_32%,rgba(255,255,255,0.72),transparent_68%)]" />
    </div>
  );
}
