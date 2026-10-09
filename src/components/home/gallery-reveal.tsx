"use client";

/* Gallery entrance (DEC-051): as the valley journey releases into the
   ivory gallery, the heading rises in and the seven cards reveal with a
   gentle staggered movement + depth (y, scale, opacity). Scrub-free
   one-shot triggers; inert under prefers-reduced-motion — cards simply
   stand. Content is server HTML; this is enhancement only. */

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function GalleryReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const header = document.querySelector("#disciplines .g-header");
    const cards = Array.from(document.querySelectorAll("[id^='ta-card-']"));
    const tweens: gsap.core.Animation[] = [];

    if (header) {
      tweens.push(
        gsap.from(header, {
          y: 56,
          opacity: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: { trigger: header, start: "top 86%" },
        })
      );
    }
    if (cards.length) {
      tweens.push(
        gsap.from(cards, {
          y: 72,
          opacity: 0,
          scale: 0.96,
          duration: 0.85,
          ease: "power2.out",
          stagger: 0.09,
          scrollTrigger: { trigger: cards[0], start: "top 88%" },
        })
      );
    }

    return () => {
      tweens.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);
  return null;
}
