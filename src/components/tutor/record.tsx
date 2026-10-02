import { isolateAsync } from "@/lib/state/isolate";
import type { RelationshipView } from "@/lib/tutor/relationship";

/* THE RECORD REGION (6.3 · Part 5) — the 5.5 region contract, tutor's side.
 * Learning events do not exist (progress_record is Phase 7's first task), so
 * the loader has nothing to read and resolves to null: NO DOM. The region is
 * wired through isolateAsync now so that when Phase 7 gives it a read, a
 * failed read is silence + one log line, never a sentence about the student.
 * `load` is injectable ONLY so the dev page can show the failure behaviour;
 * the route passes nothing and gets the production loader. */
export type RecordLoader = (view: RelationshipView) => Promise<React.ReactNode | null>;

export const loadRecord: RecordLoader = async () => null; // no events table → nothing, structurally

export async function resolveRecord(view: RelationshipView, load: RecordLoader = loadRecord): Promise<React.ReactNode | null> {
  const r = await isolateAsync("region:relationship-record", () => load(view), { subject: view.subjectId });
  return r.ok ? (r.value ?? null) : null;
}
