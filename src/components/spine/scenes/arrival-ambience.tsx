"use client";

import { useLayoutEffect, useRef } from "react";

/* SCENE 0 — ENVIRONMENTAL LAYER (Phase 4 · Step 2)

   ONE structural idea from the brand's stroke language (3.3 vocabulary,
   brand-neutral): a single brass horizon — one hairline, three nodes — the
   surface the statement stands on. No subject motif, no subject accent.

   Motion: AT MOST ONE --ta-dur-cinematic moment, applied to THIS LAYER ONLY.
   The server renders it fully visible (no-JS, first paint, LCP-safe); when JS
   is present and motion is allowed, it settles once around the statement
   (orient: opacity + ≤12px translate). Reduced motion: never touched.
   No listeners, no loop, no pointer response (declined — it would cost a
   frame and add nothing the statement needs).                          */

export function ArrivalAmbience() {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    void el.offsetWidth; // commit the hidden state before the settle
    el.style.transition =
      "opacity var(--ta-dur-cinematic) var(--ta-ease-enter), transform var(--ta-dur-cinematic) var(--ta-ease-enter)";
    el.style.opacity = "1";
    el.style.transform = "none";
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-arrival-env
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {/* the horizon — one line, the surface everything stands on */}
        <line x1="0" y1="580" x2="1440" y2="580" stroke="var(--ta-brand-quiet)" strokeWidth="1" />
        {/* nodes — the brand's node language, quiet */}
        <circle cx="240" cy="580" r="2.5" fill="var(--ta-brand-quiet)" />
        <circle cx="1200" cy="580" r="2.5" fill="var(--ta-brand-quiet)" />
        {/* one brass seal-node — the only saturated accent in the hero */}
        <circle cx="720" cy="580" r="3" fill="var(--ta-brand)" />
        {/* a single tick — structure, not ornament */}
        <line x1="720" y1="580" x2="720" y2="556" stroke="var(--ta-brand-quiet)" strokeWidth="1" />
      </svg>
    </div>
  );
}
