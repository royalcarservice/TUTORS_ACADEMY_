import { isolate, isolateAsync } from "@/lib/state/isolate";
import type { ReactElement } from "react";

import { MilestoneSynthesis } from "@/components/archive/milestone-synthesis";
import type { StudentSlotRegion } from "@/config/student-slots";
import type { StudentContext } from "@/lib/student/data";
import { fetchSubjectMilestonesWithArtifacts } from "@/lib/progress/data";
import type { MilestoneEntry } from "@/lib/progress/synthesis";
import { shellSubjectInfo } from "@/lib/student/subject-info";
import { createClient } from "@/lib/supabase/server";

/* STUDENT SHELL — SLOT REGISTRY = THE EXTENSION CONTRACT (Phase 5 · Step 3)
 *
 * A later phase populates a slot by adding ONE entry here. The shell file
 * (`student-shell.tsx`) is never edited for features. The contract:
 *
 *   1. `load(ctx)` runs on the server with the CURRENT student's context and
 *      the RLS-bounded client. It returns real data or NULL.
 *   2. NULL means the slot is ABSENT: nothing renders, no heading, no box. A
 *      region whose slots are all null is omitted from the DOM.
 *   3. `render(data)` returns a server-renderable element. No skeletons, no
 *      shimmer, no "coming soon" — if the data is not there, return null from
 *      `load` instead.
 *   4. The slot's id and region MUST exist in `src/config/student-slots.ts`
 *      (the written map); `resolveSlots` ignores unknown ids and reports them
 *      in development.
 *
 * The registry filled ONCE so far (Phase 8 · Step 4, DEC-032): the
 * `achievements` slot — the owner's ruling that milestones exist as TEXT
 * RECORDS, exactly as the written map's entry demanded. Everything else
 * stays absent; the contract is unchanged.                                */

export interface StudentSlotComponent<T = unknown> {
  region: StudentSlotRegion;
  load: (ctx: StudentContext) => Promise<T | null>;
  render: (data: T) => ReactElement;
}

/** One subject's chronology as the reflection region receives it. */
export interface SubjectMilestoneRecord {
  subjectId: string;
  subjectName: string;
  entries: readonly MilestoneEntry[];
}

/* THE ACHIEVEMENTS SLOT (DEC-032) — the milestone synthesis, per enrolled
 * subject, in the shell's reflection region. The written map's entry named
 * the ruling it waited for ("an owner decision that milestones exist as
 * text records"); the Step 4 brief IS that ruling. The load returns null
 * whenever nothing is recorded — the slot contract's honest absence, never
 * an empty box. The reads are RLS-bounded: the student's own policy admits
 * their own facts and nothing else; a subject with no record contributes
 * nothing and is never named. */
const achievementsSlot: StudentSlotComponent = {
  region: "reflection",
  load: async (ctx): Promise<SubjectMilestoneRecord[] | null> => {
    const supabase = await createClient();
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const active = ctx.enrolments.filter((e) => e.status === "active");
    const names = shellSubjectInfo(); // the shell's own display seam (the 3.1 guard)
    const out: SubjectMilestoneRecord[] = [];
    for (const e of active) {
      const entries = await fetchSubjectMilestonesWithArtifacts(e.subjectId, user.id);
      if (entries.length === 0) continue; // absent, never "0"
      const info = names[e.subjectId];
      out.push({ subjectId: e.subjectId, subjectName: info ? info.name : e.subjectId, entries });
    }
    return out.length > 0 ? out : null;
  },
  render: (data) => {
    const records = data as SubjectMilestoneRecord[];
    return (
    <div data-milestone-record style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-8)" }}>
      {records.map((r) => (
        <MilestoneSynthesis key={r.subjectId} subjectId={r.subjectId} subjectName={r.subjectName} entries={r.entries} viewer="student" />
      ))}
    </div>
    );
  },
};

export const STUDENT_SLOT_COMPONENTS: Record<string, StudentSlotComponent> = {
  achievements: achievementsSlot,
};

/** A slot that resolved to real data. The shell renders ONLY these. */
export interface ResolvedSlot {
  id: string;
  region: StudentSlotRegion;
  element: ReactElement;
}

export async function resolveSlots(ctx: StudentContext): Promise<ResolvedSlot[]> {
  const out: ResolvedSlot[] = [];
  for (const [id, slot] of Object.entries(STUDENT_SLOT_COMPONENTS)) {
    // 5.7: a slot that throws renders nothing and is logged — the same isolation as 5.4's providers.
    const res = await isolateAsync(`slot:${id}`, () => slot.load(ctx));
    const data = res.ok ? res.value : null;
    if (data === null || data === undefined) continue;
    const el = isolate(`slot:${id}:render`, () => slot.render(data));
    if (el.ok) out.push({ id, region: slot.region, element: el.value });
  }
  return out;
}
