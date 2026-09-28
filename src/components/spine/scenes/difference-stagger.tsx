"use client";

import { useEffect, useRef } from "react";

/* SCENE 2 — STAGGERED ENTRANCE FOR THE SPECIMEN ROW (Phase 4 · Step 3).

   Progressive enhancement, additive, one-shot — the 4.1 Reveal discipline
   applied to the 2.3 `.ta-stagger` preset:
   · The `.ta-stagger` class is applied ONLY after hydration. Without JS the
     six specimens are plain server-rendered content at full opacity
     (`.ta-stagger > *` is opacity:0 in CSS, so it must never be in the SSR
     markup).
   · Reduced motion: the class is never applied. Nothing to undo.
   · One-shot: unobserve after the first intersection; scrolling back never
     re-animates. No loop, no drift, no decorative motion.
   · Concurrency: six children, stagger step 40ms, cap 300ms — inside the
     4.1 ceiling of 8 concurrently animating elements per scene.            */

export function DifferenceStagger({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("ta-stagger");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <ul ref={ref} data-specimen-row aria-labelledby="scene-difference-specimens">
      {children}
    </ul>
  );
}
