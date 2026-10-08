import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp, smoothstep } from "./math";

gsap.registerPlugin(ScrollTrigger);

/* ════════════════════════════════════════════════════════════════════════
   THE SCROLL CONTRACT

   One plain mutable object is the only channel between GSAP (which owns the
   scroll position) and the 3D rig (which reads it once per frame). No React
   state, so scrolling never triggers a re-render of the page.

   `progress` is the single source of truth for the sculpture's
   rotation / position / transformation. It is *scrubbed*, not triggered:
   the sculpture is a continuous function of scroll position.
   ════════════════════════════════════════════════════════════════════════ */

export const scrollState = {
  /** 0 at the top of the document, 1 at the bottom. Scrubbed by GSAP. */
  progress: 0,
  /** Index of the subject the visitor has selected, or -1. */
  focusSubject: -1,
  /** 0 → Explore, 1 → Practise, 2 → Reflect. */
  stage: 0,
  /** Screen-space centre of the feature-card 3D window, in NDC. */
  anchorX: 0.35,
  anchorY: 0.0,
  /** 0 when the window is off-screen, 1 when it owns the viewport. */
  anchorActive: 0,
  /** Uniform scale that makes the whole structure fit inside that window. */
  anchorFit: 1,
  /** Pointer parallax, normalised −1..1. */
  pointerX: 0,
  pointerY: 0,
  /** Set by <App/>; the rig reads it to drop all scrubbed travel. */
  reduced: false,
};

/* ── Anchor reader ─────────────────────────────────────────────────────────
   Maps a transparent 3D window into normalised device coordinates so the
   sculpture can sit exactly inside it. Several windows can exist (the hero
   stage on small screens, the feature card on large ones); whichever is most
   present wins. Read on scroll and resize — never inside the render loop, to
   avoid layout thrash.                                                   */

/** Uniform scale that fits the open six-element arrangement inside `r`. */
function anchorFit(r: DOMRect, vw: number, vh: number): number {
  const fit = Math.min(r.width / vw / 0.78, r.height / vh / 0.72);
  return clamp(fit, 0.32, 1);
}

function anchorActivity(r: DOMRect, vh: number): number {
  if (r.bottom < 0 || r.top > vh || r.width < 1 || r.height < 1) return 0;
  const cy = r.top + r.height / 2;
  // Peaks when the window is vertically centred, fades towards the edges.
  const centred = 1 - Math.abs(cy / vh - 0.5) * 2;
  const onScreen =
    smoothstep(0, 0.35, r.bottom / vh) * smoothstep(0, 0.35, (vh - r.top) / vh);
  return clamp(Math.min(onScreen, 0.35 + centred * 0.9));
}

/** Any element carrying this attribute is a window the sculpture can sit in. */
export const WINDOW_SELECTOR = "[data-sculpture-window]";

export function readAnchors(): void {
  const vh = window.innerHeight || 1;
  const vw = window.innerWidth || 1;
  let best = 0;
  let bestX = scrollState.anchorX;
  let bestY = scrollState.anchorY;
  let bestFit = scrollState.anchorFit;

  const elements = document.querySelectorAll<HTMLElement>(WINDOW_SELECTOR);
  for (const el of elements) {
    if (el.offsetParent === null) continue;
    const r = el.getBoundingClientRect();
    const a = anchorActivity(r, vh);
    if (a > best) {
      best = a;
      bestX = ((r.left + r.width / 2) / vw) * 2 - 1;
      bestY = -(((r.top + r.height / 2) / vh) * 2 - 1);
      bestFit = anchorFit(r, vw, vh);
    }
  }

  scrollState.anchorActive = best;
  if (best > 0) {
    scrollState.anchorX = bestX;
    scrollState.anchorY = bestY;
    scrollState.anchorFit = bestFit;
  }
}

/* ── Choreography ────────────────────────────────────────────────────────── */

export interface ChoreographyRefs {
  page: RefObject<HTMLDivElement | null>;
  /** The visual panel in the learning-experience section (restrained pin). */
  experiencePanel: RefObject<HTMLDivElement | null>;
}

/**
 * Wires GSAP ScrollTrigger to `scrollState`.
 *
 * With `reduced` the whole choreography is skipped: no scrub, no pinning, no
 * reveals. `scrollState.progress` is left at 0 so the sculpture holds its
 * stable assembled form and every section stays reachable by normal scrolling.
 */
export function useScrollChoreography(
  refs: ChoreographyRefs,
  reduced: boolean,
): void {
  useEffect(() => {
    if (reduced) {
      scrollState.reduced = true;
      scrollState.progress = 0;
      scrollState.anchorActive = 0;
      return;
    }
    scrollState.reduced = false;

    const ctx = gsap.context(() => {
      // 1 — MASTER SCRUB. Drives rotation, position and transformation.
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "max",
        scrub: 0.7,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
          readAnchors();
        },
      });

      // 2 — RESTRAINED PIN. Under half a viewport, on the experience panel
      //     only, so the three stages can be compared without holding the page.
      if (refs.experiencePanel.current) {
        ScrollTrigger.create({
          trigger: refs.experiencePanel.current,
          start: "center center",
          end: "+=45%",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        });
      }

      // 3 — ENTRANCE REVEALS. Short, unobtrusive, and never in the way of
      //     reaching content: capped duration, nothing masked, `once: true`.
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal]"),
      );
      if (nodes.length) {
        gsap.set(nodes, { y: 26, opacity: 0 });
        nodes.forEach((node) => {
          gsap.to(node, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: node,
              start: "top 88%",
              once: true,
            },
          });
        });
      }

      readAnchors();
    }, refs.page);

    const onResize = () => readAnchors();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
      scrollState.anchorActive = 0;
    };
  }, [reduced, refs]);
}

/** Pointer parallax — skipped for reduced motion and for touch-only devices. */
export function usePointerParallax(reduced: boolean): void {
  useEffect(() => {
    if (reduced) {
      scrollState.pointerX = 0;
      scrollState.pointerY = 0;
      return;
    }
    if (!window.matchMedia("(hover: hover)").matches) return;

    let frame = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scrollState.pointerX = tx;
        scrollState.pointerY = ty;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);
}

const prefersReduced = () =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
}

/** Smooth anchor navigation that degrades to a jump for reduced motion. */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = prefersReduced();
  const top = el.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  // Move focus into the section so keyboard users land where the eye does.
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
