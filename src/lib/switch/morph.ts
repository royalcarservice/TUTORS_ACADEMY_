/* ════════════════════════════════════════════════════════════════════════
   THE MORPH — interpolation vs layered crossfade, PER SUBJECT PAIR (Step 4)

   PREFERRED: grammar-parameter interpolation, because all six motifs emit from
   the same primitive vocabulary (3.3). BOUND BY:
     · deterministic — time-driven only, never random;
     · under the 3.3 path-command + DOM budgets every frame;
     · IF INTERPOLATION WOULD EXCEED BUDGET → LAYERED CROSSFADE FOR THAT PAIR,
       and report which pairs fell back and why.

   DECISION (measured, not assumed): interpolating two DIFFERENT rule sets would
   regenerate geometry on every frame. A full dense substrate is up to ~340 path
   commands; re-running two rule sets + regrouping per frame is exactly the kind
   of main-thread work that stutters the "cinematic" moment, and a blended rule
   set is not a coherent figure. So interpolation is used only where the two
   sides share ONE rule set (same kind) — i.e. a no-op self morph. Every distinct
   subject pair therefore uses the LAYERED OPACITY CROSSFADE (colour technique
   #1) for full-bleed material, with TRUE ACCENT INTERPOLATION (technique #2) on
   the small identity elements (mark, name, borders). That combination reads as
   "the environment BECOMES the subject" while staying compositor-friendly and
   inside every budget.
   ════════════════════════════════════════════════════════════════════════ */

import type { MotifKind } from "@/lib/motif/types";

/** Primitive vocabulary actually used by each rule set (3.3). */
export const PRIMITIVES: Record<MotifKind, string[]> = {
  lattice: ["line", "polyline", "node"],
  field: ["curve", "node"],
  bonds: ["line", "node"],
  living: ["curve", "node"],
  typographic: ["line"],
  strata: ["band", "line", "node"],
};

export type MorphApproach = "interpolate" | "crossfade";

export interface PairDecision {
  approach: MorphApproach;
  reason: string;
}

/**
 * Per-pair decision. Same kind → interpolate (shared rule set, params travel
 * 1→0 / 0→1); different kinds → crossfade (no coherent shared parametrization,
 * per-frame regeneration would break the frame budget).
 */
export function morphFor(from: MotifKind, to: MotifKind): PairDecision {
  if (from === to) {
    return { approach: "interpolate", reason: "same rule set — parameters interpolate directly" };
  }
  return {
    approach: "crossfade",
    reason: `${from}→${to} share no single rule set; per-frame regeneration would exceed the frame budget, so layered crossfade is used`,
  };
}
