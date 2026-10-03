import { DENSITIES, MOTION_CHARS, SUBJECTS, type Density, type MotionChar } from "../subjects/subjects";
import type { SubjectId } from "../student/contract";

/* ════════════════════════════════════════════════════════════════════════
   THE LEVERS (Phase 6 · Step 4) — pure, importable by the validator script,
   the surface, the read and the dev page. NOTHING HERE TOUCHES A DATABASE.

   THE INVENTORY (3.1's five levers, as implemented today):
     accent triad     IDENTITY — the subject's, validated at build (3.7).
                      NOT A LEVER A TUTOR TURNS (P6-R11).
     atmosphere       DECLARED BUT INERT (3.7's rule): six authored names,
                      read by no renderer — only the validator's schema check
                      and prose. A control for it would change nothing → a
                      false affordance. NOT EXPOSED. (Finding, not a wiring job.)
     motif            IDENTITY — each motif kind is ONE subject's (lattice is
                      Mathematics; field is Physics…). Per subject it has one
                      authored value; choosing another is choosing another
                      subject's room. NOT EXPOSED.
     motion character six authored parameter sets (src/lib/ambient/contract.ts)
                      read by the ambient lens on the Stage. ADJUSTABLE — and
                      honest about its reach: it is visible only where the
                      ambient runs (desktop-class, WebGL, motion allowed); it
                      is OFF under prefers-reduced-motion and on small screens
                      regardless of choice, which is exactly the parity 3.7
                      requires.
     density          three authored values read by every motif renderer
                      (Stage substrate, Room edge — the Room reduces one step:
                      dense→balanced, else sparse; src/lib/motif/budgets.ts).
                      ADJUSTABLE.

   So TWO levers are genuinely adjustable today; the other three are either
   identity or inert and are not presented as controls (P6-R11).
   ════════════════════════════════════════════════════════════════════════ */

export type LeverId = "density" | "motionChar";

export interface EnvironmentLevers {
  density: Density;
  motionChar: MotionChar;
}

/** The closed option sets, in authored order. The DB CHECKs mirror these lists (scripts/check-subject-sql.mjs asserts it). */
export const LEVER_OPTIONS: { readonly [K in LeverId]: readonly EnvironmentLevers[K][] } = {
  density: DENSITIES,
  motionChar: MOTION_CHARS,
};

/** Plain-language option labels — authored copy, one per option, no values invented at runtime. */
export const LEVER_LABELS: { readonly [K in LeverId]: Readonly<Record<EnvironmentLevers[K], string>> } = {
  density: { sparse: "Sparse", balanced: "Balanced", dense: "Dense" },
  motionChar: { precise: "Precise", energetic: "Energetic", reactive: "Reactive", growing: "Growing", editorial: "Editorial", sequential: "Sequential" },
};

export const LEVER_NAMES: Readonly<Record<LeverId, string>> = { density: "Density", motionChar: "Motion character" };
export const LEVER_IDS: readonly LeverId[] = ["density", "motionChar"];

/** The authored default for a subject — 3.1's config, the value the environment has when no row exists. */
export function authoredLevers(subjectId: SubjectId): EnvironmentLevers {
  const s = SUBJECTS.find((x) => x.id === subjectId);
  if (!s) throw new Error(`authoredLevers: unknown subject ${subjectId}`);
  return { density: s.density, motionChar: s.motionChar };
}

export const isDensity = (v: unknown): v is Density => typeof v === "string" && (DENSITIES as readonly string[]).includes(v);
export const isMotionChar = (v: unknown): v is MotionChar => typeof v === "string" && (MOTION_CHARS as readonly string[]).includes(v);

/** Every reachable combination for one subject: |density| × |motionChar| = 3 × 6 = 18. */
export function combinationsFor(subjectId: SubjectId): EnvironmentLevers[] {
  const out: EnvironmentLevers[] = [];
  for (const density of DENSITIES) for (const motionChar of MOTION_CHARS) out.push({ density, motionChar });
  void subjectId;
  return out;
}
