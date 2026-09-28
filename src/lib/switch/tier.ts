/* ════════════════════════════════════════════════════════════════════════
   DEGRADATION LADDER + SELECTION LOGIC (Step 4)

     1. FULL    grammar morph + atmosphere + ambience. Desktop-class only.
     2. REDUCED layered crossfade + small-element accent interp, ambience off.
                Default for mid-range and mobile.
     3. SHORT   a single fast crossfade, well under budget.
     4. INSTANT state swap + announcement. Reduced-motion, low-power, failing
                preparation, or rapid repeat switching.

   Selection inputs (explicit + measurable):
     prefers-reduced-motion · device class / hardwareConcurrency · measured
     frame health · preparation success · session ceremony count.

   The EXACT logic + thresholds live in `selectTier` and are printed verbatim on
   the specimen so the ladder is verifiable without changing OS/hardware.
   ════════════════════════════════════════════════════════════════════════ */

import type { Ceremony } from "./ceremony";
import { TIERS, type Tier } from "./machine";

/** Thresholds (reported, not implied). */
export const THRESHOLDS = {
  desktopMinCores: 4, // hardwareConcurrency must EXCEED this for FULL
  desktopMinWidth: 1024, // viewport must be ≥ this for FULL
  frameOkMs: 24, // avg frame above this downgrades one step
  frameBadMs: 33, // avg frame above this downgrades to instant
} as const;

export interface TierInputs {
  prefersReducedMotion: boolean;
  forced: Tier | null; // specimen override
  hardwareConcurrency: number;
  viewportWidth: number;
  coarsePointer: boolean;
  avgFrameMs: number | null; // measured during last transition, if any
  preparationOk: boolean;
  ceremony: Ceremony;
}

export interface TierDecision {
  tier: Tier;
  reasons: string[];
}

const ORDER: Tier[] = [...TIERS]; // full, reduced, short, instant
const down = (t: Tier, steps = 1): Tier => {
  const i = Math.min(ORDER.length - 1, ORDER.indexOf(t) + steps);
  return ORDER[i];
};

export function selectTier(inp: TierInputs): TierDecision {
  const reasons: string[] = [];
  let tier: Tier;

  if (inp.forced) {
    reasons.push(`forced by specimen → ${inp.forced}`);
    return { tier: inp.forced, reasons };
  }
  if (inp.prefersReducedMotion) {
    reasons.push("prefers-reduced-motion → instant");
    return { tier: "instant", reasons };
  }
  if (inp.ceremony === "shortest") {
    reasons.push("rapid repeat switching → shortest (instant)");
    return { tier: "instant", reasons };
  }
  if (!inp.preparationOk) {
    reasons.push("preparation failed → instant fallback");
    return { tier: "instant", reasons };
  }

  const desktop =
    inp.hardwareConcurrency > THRESHOLDS.desktopMinCores &&
    inp.viewportWidth >= THRESHOLDS.desktopMinWidth &&
    !inp.coarsePointer;
  tier = desktop ? "full" : "reduced";
  reasons.push(desktop ? "desktop-class → full" : "mid-range/mobile → reduced");

  if (inp.ceremony === "shortened" && tier === "full") {
    tier = "reduced";
    reasons.push("subsequent switch this session → shortened (reduced)");
  }

  if (inp.avgFrameMs != null) {
    if (inp.avgFrameMs > THRESHOLDS.frameBadMs) {
      tier = "instant";
      reasons.push(`avg frame ${inp.avgFrameMs.toFixed(1)}ms > ${THRESHOLDS.frameBadMs}ms → instant`);
    } else if (inp.avgFrameMs > THRESHOLDS.frameOkMs) {
      tier = down(tier);
      reasons.push(`avg frame ${inp.avgFrameMs.toFixed(1)}ms > ${THRESHOLDS.frameOkMs}ms → downgraded one step`);
    }
  }
  return { tier, reasons };
}
