/**
 * ENVIRONMENT SHELL — CONTENT REGION REGISTRY (Phase 3 · Step 6)
 * --------------------------------------------------------------------------
 * The shell renders honest, named regions for future content. This registry
 * is the FILL POINT for later phases:
 *
 *   · To fill a region, register a component for its id in
 *     `src/components/shell/slots.tsx`. The shell picks it up automatically.
 *   · The shell file (`subject-shell.tsx`) is never edited to add features.
 *
 * Every entry here is TEXT ABOUT THE FUTURE STATE — no invented data, no
 * skeletons, no teased features. Regions are system states, not empty boxes.
 */

export interface ShellRegion {
  /** Stable id — slots register against this. */
  id: string;
  /** Region name, rendered as a heading. */
  title: string;
  /** Truthful statement of what will live here and when. */
  note: string;
}

export const SHELL_REGIONS: readonly ShellRegion[] = [
  {
    id: "live-classes",
    title: "Live classes",
    note: "Live classes will appear here — Phase 7. Until then this room stays quiet.",
  },
  {
    id: "work-progress",
    title: "Assignments, tests & progress",
    note: "Your work and progress will appear here when the student portal ships (currently planned in the module registry).",
  },
  {
    id: "recordings-notes",
    title: "Recorded classes & notes",
    note: "Recordings and lesson notes will appear here with the recorded-classes module (planned).",
  },
] as const;
