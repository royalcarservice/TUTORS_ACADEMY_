import { resolveSlots } from "@/components/student/slots";
import { StudentShell } from "@/components/student/student-shell";
import { getStudentContext } from "@/lib/student/data";
import { entryAction } from "@/lib/student/enrol";
import { shellSubjectInfo } from "@/lib/student/subject-info";

/* /student — THE STUDENT SHELL (Phase 5 · Step 3)
 *
 * Server-rendered, complete without JavaScript, state decided HERE from the
 * current identity's rows (RLS-bounded). The three states A/B/C are all
 * server branches of one contract — never client-side.
 * No test or demo data: an account with no rows renders state A, honestly.  */

export const dynamic = "force-dynamic";

export default async function StudentOverviewPage() {
  const ctx = await getStudentContext();
  // The layout already required an identity; a null context can only mean
  // auth is unconfigured. 5.7: that is a page failure, never a shell with a
  // hole in it — the root error boundary renders the honest page.
  if (!ctx) throw new Error("student context unavailable");
  const slots = await resolveSlots(ctx);
  return (
    <StudentShell
      state={ctx.state}
      candidate={ctx.candidate}
      enrolments={ctx.enrolments}
      environmentStates={ctx.environmentStates}
      subjects={shellSubjectInfo()}
      slots={slots}
      now={new Date().toISOString()}
      entryAction={entryAction}
    />
  );
}
