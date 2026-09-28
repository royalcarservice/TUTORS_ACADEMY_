/**
 * SPATIAL SYSTEM — canonical breakpoints (Phase 2 · Step 4).
 *
 * !! SYNC PAIR !!  This file and the `SPATIAL SYSTEM` block in
 * `src/app/globals.css` are a PAIR. The media queries in the CSS must use
 * EXACTLY the `min` values below. CSS custom properties cannot be used inside
 * media queries, so the numbers live here (as data, consumed by JS and by the
 * framework mapping) and are mirrored as literal `min-width` values in CSS.
 * Run `node scripts/check-breakpoints.mjs` to fail loudly on drift.
 *
 * Bands are NUMBERED/LETTERED only — never semantic ("mobile"/"desktop" become
 * lies the moment a tablet exists).
 */

export interface Band {
  id: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** min-width in CSS px. `xs` is the 0 floor; 320 is the hard minimum. */
  min: number;
  /** grid columns at this band */
  cols: number;
  /** grid gap in px (from the 2.1 spacing scale) */
  gap: number;
  /** page gutter in px (from the 2.1 spacing scale) */
  gutter: number;
}

/** Single canonical source. Order matters (ascending). */
export const BREAKPOINTS: Band[] = [
  { id: "xs", min: 0, cols: 4, gap: 24, gutter: 24 },
  { id: "sm", min: 480, cols: 4, gap: 24, gutter: 24 },
  { id: "md", min: 768, cols: 8, gap: 24, gutter: 32 },
  { id: "lg", min: 1024, cols: 12, gap: 32, gutter: 48 },
  { id: "xl", min: 1280, cols: 12, gap: 32, gutter: 48 },
  { id: "2xl", min: 1536, cols: 12, gap: 32, gutter: 64 },
];

export const HARD_FLOOR = 320;

/** Containers (max-width, rem). `content` is the ONE default. */
export const CONTAINERS = {
  prose: "var(--ta-measure)", // long-form reading only (from 2.2)
  content: "70rem", // 1120px — default working width (Rooms, forms)
  wide: "90rem", // 1440px — galleries, subject grids, libraries
  stage: "none", // full-bleed + safe insets — Stage only
} as const;

/** Vertical rhythm role tokens (clamp ranges, rem). */
export const RHYTHM = {
  section: "clamp(4rem, 3rem + 5vw, 10rem)", // 64 → 160
  block: "clamp(2rem, 1.5rem + 2.5vw, 4rem)", // 32 → 64
  stack: "clamp(0.75rem, 0.6rem + 0.8vw, 1.5rem)", // 12 → 24
  padCard: "clamp(1rem, 0.75rem + 1.2vw, 2rem)", // 16 → 32
} as const;

/** Resolve the active band for a viewport width. */
export function bandFor(width: number): Band {
  let active = BREAKPOINTS[0];
  for (const b of BREAKPOINTS) if (width >= b.min) active = b;
  return active;
}

/** min-width media string for a band (matches the CSS pair). */
export const mediaUp = (min: number) => `(min-width: ${min}px)`;
