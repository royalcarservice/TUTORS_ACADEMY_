/* THE ARC — seven steps of the story, ONE definition (Phase 5 · Step 6).
 *
 * Hoisted verbatim from Scene 7 (4.7's shipped promise map) so that the
 * student's version of the map, rendered inside an environment (5.6), reads
 * the SAME ids, labels and order — the homepage and the environment cannot
 * disagree about the shape of the journey. Scene 7 re-exports this as
 * `MARKERS`; its rendered HTML is unchanged.
 *
 * "progress" here is a STAGE NAME in the story — the sixth step — not a
 * feature requirement. docs/PROGRESS_LANGUAGE.md says why.
 */
export type ArcStepId = "discover" | "choose" | "enter" | "learn" | "interact" | "progress" | "master";

export interface ArcStep {
  id: ArcStepId;
  /** Visitor-language label, ≤4 words. */
  label: string;
  /** Scene id(s) that PERFORM this step on the homepage; empty = not on that page. (4.7's derivation.) */
  doneBy: readonly string[];
}

export const ARC_STEPS: readonly ArcStep[] = [
  { id: "discover", label: "See the system", doneBy: ["premise", "difference"] },
  { id: "choose", label: "See the doors", doneBy: ["choice"] },
  { id: "enter", label: "Watch the crossing", doneBy: ["enter"] },
  { id: "learn", label: "Learn in the room", doneBy: [] },
  { id: "interact", label: "Work with a tutor", doneBy: [] },
  { id: "progress", label: "Watch your record grow", doneBy: [] },
  { id: "master", label: "Master the subject", doneBy: [] },
] as const;
