import { groupBySubject, type TutorContext } from "@/lib/tutor/data";

/* FIXTURES for /dev/tutor-shell ONLY. Every name here is a labelled specimen
 * ("Specimen …"); none is a test account, none is a person. The only way to
 * build a TutorContext is `groupBySubject` — the same pure function the real
 * reader uses — so the fixtures cannot express a shape the shell could not
 * receive from production (no flat list, no extra fields).                */

export const SPECIMEN_TUTOR = "Specimen Tutor";

/* Deliberately SHUFFLED input (not alphabetical, not grouped) so the frame
 * demonstrates the one fixed ordering: subjects in config order, rows by
 * display name. */
const SHUFFLED = [
  { studentId: "spec-07", subjectId: "physics", name: "Specimen Rao" },
  { studentId: "spec-02", subjectId: "mathematics", name: "Specimen Varma" },
  { studentId: "spec-05", subjectId: "chemistry", name: "Specimen Nair" },
  { studentId: "spec-01", subjectId: "physics", name: "Specimen Anand" },
  { studentId: "spec-04", subjectId: "mathematics", name: "Specimen Bose" },
  { studentId: "spec-06", subjectId: "english", name: "Specimen Iyer" },
  { studentId: "spec-03", subjectId: "physics", name: "Specimen Menon" },
  { studentId: "spec-08", subjectId: "mathematics", name: "Specimen Anand" }, // same display name as spec-01: tie-break by id
];

export function fixtureContext(state: "A" | "B" | "C", subjectCount: 1 | 2 | 4 = 2): TutorContext {
  if (state === "A") return groupBySubject([], new Map());
  const keep = (["physics", "mathematics", "chemistry", "english"] as const).slice(0, subjectCount);
  const rels = SHUFFLED.filter((r) => (keep as readonly string[]).includes(r.subjectId)).map((r) => ({ ...r, relationshipId: `fixture-${r.studentId}` })); // fixture ids: the dev frame's row links resolve to nothing on purpose (404), as labelled
  const ctx = groupBySubject(rels, new Map(rels.map((r) => [r.studentId, r.name])));
  if (state === "C") {
    /* C is UNREACHABLE in production today: no events table exists (5.6). The
       fixture flips the discriminant only — there is nothing else to show,
       because the shell has no event-bearing region to render. */
    return { ...ctx, state: { kind: "C-relationships-and-events", subjects: ctx.groups.map((g) => g.subjectId) } };
  }
  return ctx;
}

export const SHUFFLED_INPUT = SHUFFLED.map((r) => `${r.name} · ${r.subjectId} · ${r.studentId}`);
