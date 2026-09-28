/*
 * MOTION GRAMMAR — framework-agnostic preset spec (Phase 2 · Step 3).
 *
 * Raw durations/easings live ONLY in src/app/globals.css (CSS custom props).
 * This module carries the VOCABULARY as plain data — each preset references
 * token NAMES, never values — so CSS and JS can never drift. No motion
 * library is installed; components select from these presets.
 *
 * THE RULE: every animation must TRANSITION, ORIENT, CONFIRM or REVEAL.
 */

export type MotionVerb = "TRANSITION" | "ORIENT" | "CONFIRM" | "REVEAL";

export interface MotionPreset {
  id: string;
  verb: MotionVerb;
  /** What it means. */
  meaning: string;
  /** When to use. */
  use: string;
  /** When NOT to use. */
  notUse: string;
  /** CSS class implementing it. */
  css: string;
  duration: string; // token name
  easing: string; // token name
}

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: "reveal",
    verb: "REVEAL",
    meaning: "One-shot scroll entrance: fade + ≤16px directional offset.",
    use: "Sections/cards entering the viewport for the first time.",
    notUse: "Anything that should re-animate on scroll-back; above-the-fold hero (use enter).",
    css: "ta-reveal",
    duration: "--ta-dur-slow",
    easing: "--ta-ease-enter",
  },
  {
    id: "stagger",
    verb: "REVEAL",
    meaning: "Sequences children in reading order; total capped ~300ms.",
    use: "Lists/grids of homogeneous items appearing together.",
    notUse: "Heterogeneous layouts; more than a screenful of items.",
    css: "ta-stagger",
    duration: "--ta-dur-base",
    easing: "--ta-ease-enter",
  },
  {
    id: "enter",
    verb: "TRANSITION",
    meaning: "Default mount pair (with exit).",
    use: "Dialogs, drawers, conditional panels appearing.",
    notUse: "Scroll-linked entrances (use reveal).",
    css: "ta-enter",
    duration: "--ta-dur-base",
    easing: "--ta-ease-enter",
  },
  {
    id: "exit",
    verb: "TRANSITION",
    meaning: "Default unmount; always faster than enter.",
    use: "Paired teardown of enter.",
    notUse: "As a standalone attention grabber.",
    css: "ta-exit",
    duration: "--ta-dur-fast",
    easing: "--ta-ease-exit",
  },
  {
    id: "orient",
    verb: "ORIENT",
    meaning: "Spatial movement signalling where something came FROM.",
    use: "Navigation/sheet transitions where origin matters.",
    notUse: "Generic fades; direction must match the spatial origin.",
    css: "ta-orient",
    duration: "--ta-dur-base",
    easing: "--ta-ease-in-out",
  },
  {
    id: "confirm",
    verb: "CONFIRM",
    meaning: "Instant tactile micro-feedback; no flourish.",
    use: "Button press, save, toggle acknowledgement.",
    notUse: "Anything longer than --ta-dur-instant.",
    css: "ta-confirm",
    duration: "--ta-dur-instant",
    easing: "--ta-ease-enter",
  },
  {
    id: "attention",
    verb: "ORIENT",
    meaning: "Brief subtle emphasis; rationed, never loops.",
    use: "At most ONE element drawing the eye to a change.",
    notUse: "Multiple at once; looping; as decoration.",
    css: "ta-attention",
    duration: "--ta-dur-slow",
    easing: "--ta-ease-enter",
  },
  {
    id: "morph",
    verb: "TRANSITION",
    meaning: "Shared-element continuity (FLIP) so an object BECOMES another.",
    use: "Phase 3 subject-environment morph; card→detail expansions.",
    notUse: "Cross-fades where a true shared element exists.",
    css: "ta-morph",
    duration: "--ta-dur-slow",
    easing: "--ta-ease-in-out",
  },
  {
    id: "ambient",
    verb: "ORIENT",
    meaning: "Continuous background motion; strictly constrained.",
    use: "Phase 3 ambient scenes on desktop, on-demand.",
    notUse: "Small screens, reduced motion, low power; never as default.",
    css: "ta-ambient",
    duration: "--ta-dur-slower",
    easing: "--ta-ease-linear",
  },
];

export const MOTION_BUDGET = 8; // max concurrently animated elements per section
export const STAGGER_CAP_MS = 300;

/** Read a motion token's live value from CSS (single source of truth). */
export function getMotionToken(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ── Reduced motion — handle BOTH media query and the dev attribute ── */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.getAttribute("data-reduced-motion") === "on"
  );
}

export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mo = new MutationObserver(() => cb(prefersReducedMotion()));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-reduced-motion"] });
  const handler = () => cb(prefersReducedMotion());
  mq.addEventListener("change", handler);
  return () => {
    mq.removeEventListener("change", handler);
    mo.disconnect();
  };
}

/* ── Reveal — one-shot IntersectionObserver; unobserves after firing ── */
export function initReveals(root: ParentNode = document): () => void {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (nodes.length === 0) return () => {};

  type MotionDebug = { observed: number; unobserved: number };
  const w = window as Window & { __taMotion?: MotionDebug };
  const dbg = (w.__taMotion ??= { observed: 0, unobserved: 0 });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add("is-in");
        // Remove will-change once the transition settles (never left set).
        el.style.willChange = "transform, opacity";
        el.addEventListener(
          "transitionend",
          () => {
            el.style.willChange = "";
          },
          { once: true },
        );
        io.unobserve(el);
        dbg.unobserved += 1;
      }
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
  );

  for (const el of nodes) {
    el.classList.add(el.dataset.reveal === "stagger" ? "ta-stagger" : "ta-reveal");
    if (el.dataset.dir) el.setAttribute("data-dir", el.dataset.dir);
    io.observe(el);
    dbg.observed += 1;
  }

  return () => io.disconnect();
}

/* ── Ambient — off by default; pauses off-screen / on blur; stops on reduce ── */
export function initAmbient(): () => void {
  const html = document.documentElement;
  const enable = () => {
    const desktop = window.matchMedia("(min-width: 64rem)").matches;
    if (desktop && !prefersReducedMotion()) html.setAttribute("data-ambient", "on");
    else html.removeAttribute("data-ambient");
  };
  const onVis = () => {
    html.setAttribute("data-ambient-paused", document.hidden ? "true" : "false");
  };
  enable();
  onVis();
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("blur", onVis);
  window.addEventListener("focus", onVis);
  const offReduce = onReducedMotionChange(enable);
  return () => {
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("blur", onVis);
    window.removeEventListener("focus", onVis);
    offReduce();
    html.removeAttribute("data-ambient");
  };
}
