"use client";

/* Hero entrance choreography (DEC-049): elements tagged [data-hero-enter]
   fade in and rise gently over one second, staggered. Inert under
   prefers-reduced-motion — the copy simply stands. */

import { useEffect } from "react";
import gsap from "gsap";

export function HeroEnter() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = document.querySelectorAll("[data-hero-enter]");
    if (!els.length) return;
    const tween = gsap.fromTo(
      els,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out", stagger: 0.12 }
    );
    return () => {
      tween.kill();
    };
  }, []);
  return null;
}
