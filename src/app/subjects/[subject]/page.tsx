import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubjectShell } from "@/components/shell/subject-shell";
import type { ShellNavEntry } from "@/components/shell/subject-nav";
import { EnvironmentRegions, liveModuleIds, resolveEnvironmentSlots } from "@/components/student/environment-regions";
import { Threshold, VisitorDoor } from "@/components/student/threshold";
import { getIdentity } from "@/lib/auth/session";
import { getEnvironmentSettings } from "@/lib/environment/settings";
import { fetchSocraticLensData } from "@/lib/socratic/data";
import { isolateAsync } from "@/lib/state/isolate";
import { getEnrolledSubjectIds, getEnvironmentFacts } from "@/lib/student/data";
import { mayEnrol } from "@/lib/student/enrol";
import type { SubjectId } from "@/lib/student/contract";
import { isOpen } from "@/lib/subjects/door";
import { getSubject, SUBJECTS } from "@/lib/subjects/subjects";
import { ShapeLink } from "@/components/tutor/shape-link";
import { getTutorSubjectIds } from "@/lib/tutor/data";

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
 *
 * 6.5 (P6-R19 — A TUTOR MAY STAND IN THE ROOM THEY SHAPE): a reader holding
 * an ACTIVE RELATIONSHIP in the subject is admitted to a draft environment
 * too, rendered as the visitor's rendering — identity, structure, honest
 * labels; NO student region, NO threshold, NO student data (those are gated
 * on role=student + enrolment below and are untouched). A draft flag is a
 * readiness flag, not a secrecy flag; the relationship is a door of its own
 * (P5-R4's logic extended from enrolment to relationship). No new policy:
 * the relationships read is the tutor's own rows under 6.1. P6-R17: the same
 * reader decides the one quiet link to the levers (`shaping`), rendered only
 * where the write permission exists.
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
  if (s.status === "draft" && prod && !(await getEnrolledSubjectIds()).has(s.id) && !(await relatedSubjectIds()).has(s.id as SubjectId)) return {};
  return {
    title: s.name,
    description: `${s.name} — ${s.tagline} A quiet subject environment: identity, structure and a room for work. Classes, assignments and progress arrive in later phases.`,
  };
}

/* P6-R19: the tutor's own active subjects, read only when the identity is a tutor (visitors and students: no query). */
async function relatedSubjectIds(identity?: Awaited<ReturnType<typeof getIdentity>>): Promise<Set<SubjectId>> {
  const id = identity === undefined ? await getIdentity() : identity;
  return id?.role === "tutor" ? getTutorSubjectIds() : new Set<SubjectId>();
}

export default async function SubjectEnvironmentPage({ params, searchParams }: Params) {
  const { subject } = await params;
  const s = getSubject(subject);

  /* UNKNOWN OR INVALID SUBJECT → the framework 404 (themed, real explanation,
     route back) — never a silent redirect, never a blank page. */
  if (!s) notFound();

  const prod = process.env.NODE_ENV === "production";
  /* Identity + enrolments, read once (RLS-bounded; a null identity is a visitor).
     6.4: THE ROOM'S LEVERS are read IN PARALLEL with the identity — one anon
     round trip that does not know who is asking (P6-R10: the same bytes for
     every reader class). Absence = the authored default; a failed read =
     the authored default + one log line (src/lib/environment/settings.ts). */
  const [identity, settings] = await Promise.all([getIdentity(), getEnvironmentSettings(s.id as SubjectId)]);
  const [enrolled, related] = await Promise.all([identity ? getEnrolledSubjectIds() : new Set<string>(), relatedSubjectIds(identity)]);
  const isRelated = related.has(s.id as SubjectId);
  /* DRAFT GUARD AT THE ROUTE (production) — enrolled students are admitted (5.3); a tutor with an active relationship in the subject is admitted (6.5, P6-R19). */
  if (s.status === "draft" && prod && !enrolled.has(s.id) && !isRelated) notFound();

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
       line (src/lib/state/isolate.ts); the page itself never fails for it.
       DEC-034: the Socratic lens's data is read IN PARALLEL with the facts —
       one supplemental read for the enrolled student; a failed read leaves
       the lens absent (P5-R8.9), never the environment. */
    const [facts, socratic] = await Promise.all([
      isolateAsync("region:facts", () => getEnvironmentFacts(s.id as SubjectId, true), { subject: s.id }),
      isolateAsync("region:socratic", () => fetchSocraticLensData(s.id), { subject: s.id }),
    ]);
    if (facts.ok) {
      studentSlots = resolveEnvironmentSlots({
        subjectId: s.id,
        subjectName: s.name,
        facts: facts.value,
        events: [],
        liveModules: liveModuleIds(),
        socratic: socratic.ok ? socratic.value : undefined,
      });
    }
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
    available: !(x.status === "draft" && prod) || enrolled.has(x.id) || related.has(x.id as SubjectId),
    draft: x.status === "draft",
  }));

  return (
    <SubjectShell
      subject={{
        id: s.id,
        name: s.name,
        tagline: s.tagline,
        motif: s.motif,
        density: settings.levers.density,
      }}
      ambient={{
        id: s.id,
        name: s.name,
        motif: s.motif,
        density: settings.levers.density,
        motionChar: settings.levers.motionChar,
        accent: s.accent1,
      }}
      levers={{ density: settings.levers.density, motionChar: settings.levers.motionChar, source: settings.source === "row" ? "shaped" : "authored" }}
      draft={s.status === "draft"}
      entries={entries}
      threshold={showThreshold ? <Threshold subjectId={s.id} subjectName={s.name} failed={entryFailed} /> : showVisitorDoor ? <VisitorDoor subjectId={s.id} /> : undefined}
      regions={studentSlots.length > 0 ? <EnvironmentRegions slots={studentSlots} /> : undefined}
      shaping={isRelated ? <p style={{ margin: "var(--ta-space-4) 0 0" }}><ShapeLink subjectId={s.id} subjectName={s.name} /></p> : undefined}
    />
  );
}
