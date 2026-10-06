import { authoredLevers, type EnvironmentLevers } from "@/lib/environment/levers";
import type { EnvironmentSettingsView } from "@/lib/environment/settings";

/* Labelled fixtures for the shaping-surface specimen page. Nobody here is a
 * person; the ids are tokens. The real route reads the live row. */
export const SPECIMEN_TUTOR = "Specimen Tutor";
export const VIEWER = "viewer-token";
export const OTHER = "other-tutor-token";

export const SPECIMENS = {
  authored: { label: "as authored (no row)", levers: null, shapedBy: null },
  mine: { label: "shaped by the viewer", levers: { density: "dense", motionChar: "energetic" } as EnvironmentLevers, shapedBy: VIEWER },
  other: { label: "shaped by another tutor", levers: { density: "sparse", motionChar: "precise" } as EnvironmentLevers, shapedBy: OTHER },
} as const;
export type SpecimenKey = keyof typeof SPECIMENS;

export function specimenView(key: SpecimenKey): EnvironmentSettingsView {
  const s = SPECIMENS[key];
  const authored = authoredLevers("physics");
  /* `version` is P6-R21's freshness token: a fixed fixture instant for rows,
     null when the specimen is unshaped. A fixture, like every id here. */
  return { subjectId: "physics", authored, levers: s.levers ?? authored, shaped: s.levers !== null, shapedBy: s.shapedBy, source: s.levers ? "row" : "authored", version: s.levers ? "2026-01-01T00:00:00.000000+00:00" : null };
}
