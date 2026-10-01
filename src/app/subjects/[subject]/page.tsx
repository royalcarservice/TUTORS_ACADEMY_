import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubjectShell } from "@/components/shell/subject-shell";
import type { ShellNavEntry } from "@/components/shell/subject-nav";
import { EnvironmentRegions, liveModuleIds, resolveEnvironmentSlots } from "@/components/student/environment-regions";
import { Threshold, VisitorDoor } from "@/components/student/threshold";
import { getIdentity } from "@/lib/auth/session";
import { isolateAsync } from "@/lib/state/isolate";
import { getEnrolledSubjectIds, getEnvironmentFacts } from "@/lib/student/data";
import { mayEnrol } from "@/lib/student/enrol";
import type { SubjectId } from "@/lib/student/contract";
import { isOpen } from "@/lib/subjects/door";
import { getSubject, SUBJECTS } from "@/lib/subjects/subjects";

/* /subjects/[subject] — THE SUBJECT ENVIRONMENT (Phase 3 · Step 6 · Part 1)
 *
 * Server-rendered and complete with NO JavaScript: scope, accents, motif,
 * identity, heading and metadata all arrive in the HTML. The 3.4 switch is
 * progressive enhancement over this state (layout-level SubjectEntry).
 *
 * ROUTE-LEVEL DRAFT GUARD: a draft subject 404s in production here, at the
 * route, using the same status the 3.1 validator enforces — not by
 * convention. In development it renders with a visible draft banner.
 *
 * 5.3 AMENDMENT (the one change to this certified route): an identity that
 * is ENROLLED in the draft subject is admitted in production. Enrolment is a
 * stronger relationship than public availability; the draft status stays
 * labelled (banner), never enforced as a lock against the student's own
 * environment. Visitors and non-enrolled students still get the 404.
 *
 * 5.5 (P5-R5 — ONE ENVIRONMENT, ROLE-SCOPED REGIONS): this is the same place
 * for everyone. What differs by identity is decided HERE, server-side:
 *   · signed-in student, not enrolled, door enterable (`mayEnrol`) → the
 *     THRESHOLD control (a form POST to /subjects/[id]/enter);
 *   · signed-in student, enrolled → their own regions (registry- and data-
 *     gated; all absent today) — access is unconditional, draft included;
 *   · signed-out visitor at an open door → the VISITOR DOOR (E-23 fix): the
 *     existing Sign in action, in <main>, back to this environment after;
 *   · anyone else (a signed-in non-student) → exactly the certified 3.6
 *     composition.
 * Rendering this page WRITES NOTHING in any state. Entry is the POST.
 */

interface Params {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ entry?: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subject } = await params;
  const s = getSubject(subject);
  const prod = process.env.NODE_ENV === "production";
  if (!s) return {};
  if (s.status === "draft" && prod && !(await getEnrolledSubjectIds()).has(s.id)) return {};
  return {
    title: s.name,
    description: `${s.name} — ${s.tagline} A quiet subject environment: identity, structure and a room for work. Classes, assignments and progress arrive in later phases.`,
  };
}

export default async function SubjectEnvironmentPage({ params, searchParams }: Params) {
  const { subject } = await params;
  const s = getSubject(subject);

  /* UNKNOWN OR INVALID SUBJECT → the framework 404 (themed, real explanation,
     route back) — never a silent redirect, never a blank page. */
  if (!s) notFound();

  const prod = process.env.NODE_ENV === "production";
  /* Identity + enrolments, read once (RLS-bounded; a null identity is a visitor). */
  const identity = await getIdentity();
  const enrolled = identity ? await getEnrolledSubjectIds() : new Set<string>();
  /* DRAFT GUARD AT THE ROUTE (production) — enrolled students are admitted (5.3). */
  if (s.status === "draft" && prod && !enrolled.has(s.id)) notFound();

  const isEnrolled = enrolled.has(s.id);
  const showThreshold = !!identity && !isEnrolled && mayEnrol(identity, s.id);
  /* E-23: a visitor at an OPEN door gets a way in from <main>. Same door
     predicate as `mayEnrol` (P5-R4: one predicate) — in production a draft
     door has already 404'd for a visitor; in development it renders with the
     banner and no door, exactly as for a signed-in student. */
  const showVisitorDoor = !identity && isOpen(s);
  /* 5.6: the student's own regions read FACTS (enrolment, entry) and EVENTS.
     Events are `[]` today — progress_record does not exist (5.1 amendment
     pending); nothing is inferred in its place. */
  let studentSlots: ReturnType<typeof resolveEnvironmentSlots> = [];
  if (identity?.role === "student" && isEnrolled) {
    /* 5.7: the regions are SUPPLEMENTAL — the environment (the primary answer)
       stands without them. A failed facts read renders no region and one log
       line (src/lib/state/isolate.ts); the page itself never fails for it. */
    const facts = await isolateAsync("region:facts", () => getEnvironmentFacts(s.id as SubjectId, true), { subject: s.id });
    if (facts.ok) studentSlots = resolveEnvironmentSlots({ subjectId: s.id, subjectName: s.name, facts: facts.value, events: [], liveModules: liveModuleIds() });
  }
  /* 5.7 · ACTION scope: the entry POST answered with a KNOWN failure and sent
     the student back here (303 ?entry=failed). The sentence renders only while
     the truth still says "not enrolled" — if the row exists, the environment
     simply opens (failed-after-commit ends on the true state, not a message). */
  const { entry } = await searchParams;
  const entryFailed = showThreshold && entry === "failed";

  const entries: ShellNavEntry[] = SUBJECTS.map((x) => ({
    id: x.id,
    name: x.name,
    href: `/subjects/${x.id}`,
    available: !(x.status === "draft" && prod) || enrolled.has(x.id),
    draft: x.status === "draft",
  }));

  return (
    <SubjectShell
      subject={{
        id: s.id,
        name: s.name,
        tagline: s.tagline,
        motif: s.motif,
        density: s.density,
      }}
      ambient={{
        id: s.id,
        name: s.name,
        motif: s.motif,
        density: s.density,
        motionChar: s.motionChar,
        accent: s.accent1,
      }}
      draft={s.status === "draft"}
      entries={entries}
      threshold={showThreshold ? <Threshold subjectId={s.id} subjectName={s.name} failed={entryFailed} /> : showVisitorDoor ? <VisitorDoor subjectId={s.id} /> : undefined}
      regions={studentSlots.length > 0 ? <EnvironmentRegions slots={studentSlots} /> : undefined}
    />
  );
}
