import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubjectShell } from "@/components/shell/subject-shell";
import type { ShellNavEntry } from "@/components/shell/subject-nav";
import { getEnrolledSubjectIds } from "@/lib/student/data";
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
 */

interface Params {
  params: Promise<{ subject: string }>;
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

export default async function SubjectEnvironmentPage({ params }: Params) {
  const { subject } = await params;
  const s = getSubject(subject);

  /* UNKNOWN OR INVALID SUBJECT → the framework 404 (themed, real explanation,
     route back) — never a silent redirect, never a blank page. */
  if (!s) notFound();

  const prod = process.env.NODE_ENV === "production";
  /* DRAFT GUARD AT THE ROUTE (production) — enrolled students are admitted (5.3). */
  const enrolled = prod ? await getEnrolledSubjectIds() : new Set<string>();
  if (s.status === "draft" && prod && !enrolled.has(s.id)) notFound();

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
    />
  );
}
