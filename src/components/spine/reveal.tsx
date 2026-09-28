"use client";

import { useEffect, useRef } from "react";

/* SPINE — ONE-SHOT REVEAL (Phase 4 · Step 1 · Part 2)

   Progressive enhancement only:
   · WITHOUT JS the element is plain, fully visible server-rendered content —
     the hidden state of `.ta-reveal` is applied ONLY after hydration.
   · WITH reduced motion the class is never applied; content is static.
   · ONE-SHOT: the observer unobserves after the first reveal, so scrolling
     back never re-animates. Reveals are ADDITIVE, never conditional.
   · Vocabulary is 2.3 only (.ta-reveal / .is-in). No new motion.            */

export function Reveal({
  children,
  dir,
}: {
  children: React.ReactNode;
  dir?: "up" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("ta-reveal");
    if (dir) el.setAttribute("data-dir", dir);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.unobserve(el); // one-shot: never re-animate
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [dir]);

  return <div ref={ref}>{children}</div>;
}
