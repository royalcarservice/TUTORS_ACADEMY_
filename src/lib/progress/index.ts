/* Progress language (Phase 5 · Step 6). Pure. See docs/PROGRESS_LANGUAGE.md.
 * The complete public surface — there is deliberately no ratio, percentage,
 * composite, comparison or prediction here, and scripts/test-progress.mjs
 * proves the exports below are the only ones. */
export type { EnvironmentFacts, ProgressEvent, ProgressEventKind } from "./events";
export { EVENT_KIND_MODULE, EVENT_KINDS } from "./events";
export type { ArcPosition, ArcPositionStep, ArcState, Count, Defect, Recency, Validated } from "./derive";
export { admissibleKinds, arcPosition, countByKind, latestEvent, STEP_EVIDENCE, validateEvents } from "./derive";
