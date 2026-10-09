import type { SubjectId } from "@/lib/student/contract";
import { positionFor, type RelationshipView } from "@/lib/tutor/relationship";

/* /dev/relationship-surface fixtures (Phase 6 · Step 3 · Part 9). Nothing here
 * is a person. Three specimens at three DIFFERENT arc positions, so the page can
 * show that the statements do not move while the arc does. Positions come from
 * `positionFor` — the production function — so a fixture cannot take a path
 * production cannot. The relationship id is deliberately not a uuid: nothing
 * on this page is addressable in production. */
export const SPECIMEN_TUTOR = "Specimen Tutor";

export const SPECIMENS = {
  one: { displayName: "Specimen One", subjectId: "physics" as SubjectId, facts: { hasAccount: true, enrolled: false, firstEnteredAt: null } },
  two: { displayName: "Specimen Two", subjectId: "physics" as SubjectId, facts: { hasAccount: true, enrolled: true, firstEnteredAt: null } },
  three: { displayName: "Specimen Three", subjectId: "mathematics" as SubjectId, facts: { hasAccount: true, enrolled: true, firstEnteredAt: "2026-01-01T00:00:00.000Z" } },
} as const;
export type SpecimenKey = keyof typeof SPECIMENS;

export function specimenView(key: SpecimenKey): RelationshipView {
  const s = SPECIMENS[key];
  /* The specimen student key is deliberately unaddressable — a fixture's
     record read can name no real row (DEC-032). */
  return { subjectId: s.subjectId, displayName: s.displayName, studentId: `specimen-student-${key}`, position: positionFor({ subjectId: s.subjectId, ...s.facts }) };
}
