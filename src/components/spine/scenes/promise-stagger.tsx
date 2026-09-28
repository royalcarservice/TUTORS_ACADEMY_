"use client";

import { useEffect, useRef } from "react";

/* SCENE 7 — STAGGERED ENTRANCE FOR THE MARKER SET (Phase 4 · Step 7).
   Same discipline as Scene 2's DifferenceStagger (2.3 `.ta-stagger` preset,
   applied only after hydration, never under reduced motion, one-shot).
   Seven children · step 40ms · cap 300ms — inside the 4.1 ceiling of 8.
   The stagger is ENTRY only: nothing animates on "completion", because
   completion is a fact of the page, not an event.                          */

export function PromiseStagger({ children, label }: { children: React.ReactNode; label: string }) {
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
    <ul ref={ref} data-markers aria-label={label}>
      {children}
    </ul>
  );
}
