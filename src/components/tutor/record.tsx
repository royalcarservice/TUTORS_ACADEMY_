import { MilestoneSynthesis } from "@/components/archive/milestone-synthesis";
import { fetchSubjectMilestonesWithArtifacts } from "@/lib/progress/data";
import { isolateAsync } from "@/lib/state/isolate";
import { getSubject } from "@/lib/subjects/subjects";
import type { RelationshipView } from "@/lib/tutor/relationship";

/* THE RECORD REGION (6.3 · Part 5) — the 5.5 region contract, tutor's side.
 *
 * THE DECLARED FILL POINT, filled (Phase 8 · Step 4, DEC-032): the loader
 * reads the milestone synthesis for the ONE student of the ONE relationship
 * the page stands in — the view carries the relationship's student key as a
 * JOIN KEY, never a displayed fact (P6-R2 still governs what the surface
 * shows). The reads are RLS-bounded twice over: the related-tutor policies
 * on progress_record and session_artifacts admit the subject of an ACTIVE
 * relationship and nothing else — an ended or other-subject relationship
 * resolved to notFound() before this loader could run, and the policies
 * re-decide anyway.
 *
 * Empty means ABSENT: null renders no DOM — no heading, no box, no "0"
 * (the slot contract's rule, carried). A failed read is silence + one log
 * line, never a sentence about the student (5.7), exactly as the region
 * was wired to behave in 6.3.
 *
 * `load` is injectable ONLY so the dev page can show the failure behaviour;
 * the route passes nothing and gets the production loader. */
export type RecordLoader = (view: RelationshipView) => Promise<React.ReactNode | null>;

export const loadRecord: RecordLoader = async (view) => {
  const entries = await fetchSubjectMilestonesWithArtifacts(view.subjectId, view.studentId);
  if (entries.length === 0) return null; // the honest absence — nothing renders
  const subject = getSubject(view.subjectId);
  return (
    <MilestoneSynthesis
      subjectId={view.subjectId}
      subjectName={subject ? subject.name : view.subjectId}
      entries={entries}
      viewer="tutor"
    />
  );
};

export async function resolveRecord(view: RelationshipView, load: RecordLoader = loadRecord): Promise<React.ReactNode | null> {
  const r = await isolateAsync("region:relationship-record", () => load(view), { subject: view.subjectId });
  return r.ok ? (r.value ?? null) : null;
}
