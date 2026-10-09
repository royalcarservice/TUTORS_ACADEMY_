"use client";

/* ════════════════════════════════════════════════════════════════════
   HERO VIDEO — CINEMATIC BACKGROUND (DEC-049, Wanderful-aligned pivot)

   Full-viewport cinematic video per the owner brief: autoPlay muted loop
   playsInline, object-cover inside a 1.08-scaled wrapper, playbackRate
   1.25 on loadedmetadata, subtle LOWER gradient only (the scene stays
   bright), GSAP pointer parallax — normalized offsets × 20, interpolated
   at 0.06 per frame. Parallax is disabled on touch devices and under
   prefers-reduced-motion; reduced motion also freezes the video on a
   static frame instead of autoplaying. Black is a loading fallback only;
   the wrapper behind the video is a warm sunrise gradient.

   This is a cinematic video with pointer parallax — not interactive 3D.
   The real rendered 3D objects live in the subject gallery below.
   ════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef } from "react";
import gsap from "gsap";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4";

export function HeroVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;

    /* Reduced motion: no autoplay — hold a lit static frame. */
    if (reduced) {
      video.removeAttribute("autoplay");
      video.preload = "auto";
      const seek = () => {
        try {
          video.currentTime = 1.5;
        } catch {
          /* not seekable yet */
        }
      };
      video.addEventListener("loadeddata", seek, { once: true });
      return () => video.removeEventListener("loadeddata", seek);
    }

    video.playbackRate = 1.25;
    const onMeta = () => {
      video.playbackRate = 1.25;
      void video.play().catch(() => undefined);
    };
    video.addEventListener("loadedmetadata", onMeta);

    /* GSAP pointer parallax: offsets × 20, lerp 0.06 per tick. */
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let active = false;

    const onPointer = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2 * 20;
      ty = (e.clientY / window.innerHeight - 0.5) * 2 * 20;
    };

    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      gsap.set(wrap, { x: cx, y: cy });
    };

    if (!touch) {
      active = true;
      window.addEventListener("pointermove", onPointer, { passive: true });
      gsap.ticker.add(tick);
    }

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      if (active) {
        window.removeEventListener("pointermove", onPointer);
        gsap.ticker.remove(tick);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* warm sunrise fallback while the video loads; black lives only on the video element itself */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #BFE3EC 0%, #EAF4EF 45%, #FFE9CF 100%)" }}
      />
      <div ref={wrapRef} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.08)", transformOrigin: "center center" }}>
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          style={{ background: "#000" }}
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
        />
      </div>
      {/* subtle LOWER gradient only — the scene stays bright */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44"
        style={{ background: "linear-gradient(to top, rgba(8,22,40,0.42), rgba(8,22,40,0.16) 55%, transparent)" }}
      />
    </div>
  );
}
