/* ════════════════════════════════════════════════════════════════════════
   THE SUBJECT SWITCH — STATE MACHINE (Phase 3 · Step 4)

   IT IS A STATE MACHINE, NOT A SET OF CONCURRENT ANIMATIONS.

     IDLE → PREPARE → QUIESCE → TRANSFER → ARRIVE → SETTLE → IDLE

   · IDLE      nothing moving.
   · PREPARE   destination environment generated/verified. NO visual movement.
   · QUIESCE   outgoing ambience pauses, outgoing emphasis stops. Content readable.
   · TRANSFER  the morph. Accent + motif material move outgoing → incoming.
   · ARRIVE    structure establishes, identity (mark, name) resolves. INTERACTIVE HERE.
   · SETTLE    ambience resumes, focus + announcement finalise, → IDLE.

   HARD RULES ENCODED:
   · No phase may be skipped EXCEPT by degradation (a tier's plan omits phases).
   · THE MACHINE ALWAYS CONVERGES: every plan has a finite `total`; the engine
     clamps elapsed to `total`, and `settle()` is idempotent, so no run can leave
     the interface mid-transition, blank or unresponsive.
   · TOTAL BUDGET ≤ 700ms trigger → SETTLE; content interactive no later than
     ARRIVE (`interactiveAt`). The transition decorates arrival; it never gates
     reading.
   ════════════════════════════════════════════════════════════════════════ */

export const PHASES = ["IDLE", "PREPARE", "QUIESCE", "TRANSFER", "ARRIVE", "SETTLE"] as const;
export type Phase = (typeof PHASES)[number];

export const TIERS = ["full", "reduced", "short", "instant"] as const;
export type Tier = (typeof TIERS)[number];

export interface PhaseSpan {
  phase: Phase;
  start: number; // ms from transition start (post-prepare)
  end: number;
}

export interface TierPlan {
  tier: Tier;
  /** Post-prepare timeline length (ms). */
  total: number;
  /** Prep budget before the transition shortens (ms). */
  prepareBudget: number;
  spans: PhaseSpan[];
  /** When content is interactive (ms from transition start). */
  interactiveAt: number;
}

/* Phase durations per tier. FULL is the ceremony; the rest are degradation.
   FULL: QUIESCE 80 + TRANSFER 400 (--ta-dur-slow) + ARRIVE 120 + SETTLE 60 = 660,
   leaving headroom under 700 once a cheap PREPARE (<40ms) is included.        */
export function planFor(tier: Tier): TierPlan {
  switch (tier) {
    case "full":
      return {
        tier,
        total: 660,
        prepareBudget: 120,
        spans: [
          { phase: "QUIESCE", start: 0, end: 80 },
          { phase: "TRANSFER", start: 80, end: 480 },
          { phase: "ARRIVE", start: 480, end: 600 },
          { phase: "SETTLE", start: 600, end: 660 },
        ],
        interactiveAt: 600,
      };
    case "reduced":
      return {
        tier,
        total: 400,
        prepareBudget: 80,
        spans: [
          { phase: "QUIESCE", start: 0, end: 40 },
          { phase: "TRANSFER", start: 40, end: 280 },
          { phase: "ARRIVE", start: 280, end: 360 },
          { phase: "SETTLE", start: 360, end: 400 },
        ],
        interactiveAt: 360,
      };
    case "short":
      return {
        tier,
        total: 240,
        prepareBudget: 60,
        spans: [
          { phase: "TRANSFER", start: 0, end: 200 },
          { phase: "ARRIVE", start: 200, end: 240 },
        ],
        interactiveAt: 200,
      };
    case "instant":
      return { tier, total: 0, prepareBudget: 0, spans: [], interactiveAt: 0 };
  }
}

/** Which phase the timeline is in at `t` ms. Always defined (clamped). */
export function phaseAt(plan: TierPlan, t: number): Phase {
  if (plan.total === 0) return "SETTLE";
  const time = Math.min(Math.max(t, 0), plan.total);
  for (let i = 0; i < plan.spans.length; i++) {
    if (time < plan.spans[i].end) return plan.spans[i].phase;
  }
  return "SETTLE";
}

/** 0..1 eased progress through TRANSFER at `t`, using the 2.3 in-out easing shape. */
export function transferProgress(plan: TierPlan, t: number): number {
  const span = plan.spans.find((s) => s.phase === "TRANSFER");
  if (!span || span.end === span.start) return plan.total === 0 ? 1 : t >= plan.total ? 1 : 0;
  const x = Math.min(1, Math.max(0, (t - span.start) / (span.end - span.start)));
  // cubic-bezier(0.65,0,0.35,1) approximated by a symmetric ease-in-out curve.
  return x * x * (3 - 2 * x) * 0.5 + x * 0.5;
}
