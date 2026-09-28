/* ════════════════════════════════════════════════════════════════════════
   PART 3 + PART 4 — COMPOSITION ROLES, DENSITY, HARD CEILINGS

   A motif is never a background image. It is PLACED in a ROLE, and the role
   carries the caps. Nothing here is a suggestion: `resolvePlacement` in
   motif.tsx reads these numbers and refuses what the role does not allow.

   LEGIBILITY IS THE NON-NEGOTIABLE: every role says `behindText: false`.
   Motifs are masked out of content regions (see `exclude` in motif.tsx) and
   their contrast is capped per role, so no motif can push text below WCAG AA.
   A learning product is mostly reading; decoration that costs legibility is a
   defect, not a style choice.
   ════════════════════════════════════════════════════════════════════════ */

import type { Box, Density, MotifRole } from "./types";

/* ── DENSITY (from the 3.1 config: sparse | balanced | dense) ───────────────
   Density scales STRUCTURE — FEATURE COUNTS — never opacity and never weight.
   A dense motif is not a louder motif; it has more features.                */

export const DENSITY_MULTIPLIER: Record<Density, number> = {
  sparse: 0.6,
  balanced: 1,
  dense: 1.4,
};

export const DENSITIES: Density[] = ["sparse", "balanced", "dense"];

/** One step calmer — used by Room (roomMood: reduce, retain accent). */
export function reduceDensity(d: Density): Density {
  return d === "dense" ? "balanced" : "sparse";
}

/** Scale a feature count by density, clamped to a sane integer. */
export const scaleCount = (n: number, density: Density) => Math.max(1, Math.round(n * DENSITY_MULTIPLIER[density]));

/* ── CANONICAL COMPOSITION BOXES ────────────────────────────────────────────
   Geometry is generated in these FIXED units. The SVG scales its viewBox to
   whatever container it lands in, so the numbers never depend on a viewport.
   That is the whole SSR-safety argument: same box in, same data out.        */

export const ROLE_BOX: Record<MotifRole, Box> = {
  substrate: { w: 1000, h: 600 }, // full-bleed behind a Stage
  edge: { w: 360, h: 600 }, // bleeds off ONE edge
  divider: { w: 1000, h: 96 }, // thin, separates scenes
  focus: { w: 360, h: 360 }, // tiny, high detail
  transition: { w: 1000, h: 600 }, // substrate material for the subject switch
};

/* ── ROLE RULES ────────────────────────────────────────────────────────────
   coverageCap  — fraction of the box the structure may occupy (approximate,
                  enforced by feature counts + the role's own featureScale).
   ceilingRatio — MAX motif-to-surface contrast at full stroke. Measured in
                  the specimen; the specimen fails loudly above this.
   opacity      — the resolved stroke opacity (lightness-only; colour stays
                  token-driven). Softness comes from opacity layering + gradient
                  masks — never blur, filters or blend modes.
   roomAllowed  — the roomMood rule, encoded as data (enforced in code).      */

export interface RoleRule {
  role: MotifRole;
  description: string;
  coverage: string;
  coverageCap: number;
  ceilingRatio: number;
  opacity: number;
  roomAllowed: boolean;
  behindText: false;
  featureScale: number;
}

export const ROLE_RULES: Record<MotifRole, RoleRule> = {
  substrate: {
    role: "substrate",
    description: "Full-bleed structural field behind a Stage.",
    coverage: "as declared by the motif",
    coverageCap: 1,
    ceilingRatio: 1.6,
    opacity: 0.16,
    roomAllowed: false,
    behindText: false,
    featureScale: 1,
  },
  edge: {
    role: "edge",
    description: "Bleeds off ONE edge; gives a Room depth.",
    coverage: "small — one edge only",
    coverageCap: 0.22,
    ceilingRatio: 2,
    opacity: 0.2,
    roomAllowed: true,
    behindText: false,
    featureScale: 0.6,
  },
  divider: {
    role: "divider",
    description: "Separates scenes within a Stage.",
    coverage: "thin",
    coverageCap: 0.12,
    ceilingRatio: 2,
    opacity: 0.2,
    roomAllowed: true,
    behindText: false,
    featureScale: 0.5,
  },
  focus: {
    role: "focus",
    description: "Small high-detail area — an instrument specimen.",
    coverage: "tiny",
    coverageCap: 0.1,
    ceilingRatio: 3,
    opacity: 0.3,
    roomAllowed: true,
    behindText: false,
    featureScale: 1.5,
  },
  transition: {
    role: "transition",
    description: "Substrate material for the subject switch (3.5).",
    coverage: "as declared by the motif",
    coverageCap: 1,
    ceilingRatio: 2.4,
    opacity: 0.24,
    roomAllowed: false,
    behindText: false,
    featureScale: 1,
  },
};

/** Which roles may appear inside a Room. Substrate/transition are IMPOSSIBLE. */
export const ROOM_ROLES: MotifRole[] = ["edge", "divider", "focus"];

/* ── HARD GLOBAL CEILINGS — density can never push past these ────────────────
   MAX_COMMANDS   path commands per surface (all layers, all subpaths)
   MAX_DOM_NODES  SVG child elements per surface — a few <path> with many
                  subpaths beats hundreds of <line>; the renderer groups by
                  layer, so this is a small constant.
   MAX_GEN_MS     generation time per surface, measured in the specimen.     */

export const MAX_COMMANDS = 400;
export const MAX_DOM_NODES = 12;
export const MAX_GEN_MS = 8;

/**
 * The grammar trims to these caps rather than throwing: a motif that would
 * exceed a cap loses its QUIETEST features first (quiet -> base), so the
 * emphasised moment always survives. Caps are enforced in grammar.ts.
 */
export const CAP_ORDER = ["quiet", "base", "mid", "emphasis"] as const;
