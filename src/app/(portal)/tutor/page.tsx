import { resolveTutorSlots } from "@/components/tutor/slots";
import { TutorShell } from "@/components/tutor/tutor-shell";
import { shellSubjectInfo } from "@/lib/student/subject-info";
import { getTutorContext } from "@/lib/tutor/data";

/* /tutor — THE TUTOR SHELL (Phase 6 · Step 2)
 *
 * Server-rendered, complete without JavaScript, state decided HERE from the
 * current identity's relationship rows (RLS-bounded, 6.1). States A/B are
 * server branches of one contract; C is unreachable until an events table
 * exists. No test or demo data: a tutor with no rows renders state A.      */

export const dynamic = "force-dynamic";

export default async function TutorOverviewPage() {
  const ctx = await getTutorContext();
  // The layout already required an identity; null can only mean auth is
  // unconfigured — a page failure (5.7), never a shell with a hole in it.
  if (!ctx) throw new Error("tutor context unavailable");
  const slots = await resolveTutorSlots(ctx);
  return <TutorShell state={ctx.state} groups={ctx.groups} subjects={shellSubjectInfo()} slots={slots} />;
}
