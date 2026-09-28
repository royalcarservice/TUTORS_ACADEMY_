import { resolveSlots } from "@/components/student/slots";
import { StudentShell } from "@/components/student/student-shell";
import { getStudentContext } from "@/lib/student/data";
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
  // auth is unconfigured, which the proxy has already turned into a redirect.
  if (!ctx) return null;
  const slots = await resolveSlots(ctx);
  return (
    <StudentShell
      state={ctx.state}
      nextAction={ctx.nextAction}
      enrolments={ctx.enrolments}
      environmentStates={ctx.environmentStates}
      subjects={shellSubjectInfo()}
      slots={slots}
      now={new Date().toISOString()}
    />
  );
}
