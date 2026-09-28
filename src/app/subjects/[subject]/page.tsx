import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubjectShell } from "@/components/shell/subject-shell";
import type { ShellNavEntry } from "@/components/shell/subject-nav";
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
 */

interface Params {
  params: Promise<{ subject: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subject } = await params;
  const s = getSubject(subject);
  const prod = process.env.NODE_ENV === "production";
  if (!s || (s.status === "draft" && prod)) return {};
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
  /* DRAFT GUARD AT THE ROUTE (production). */
  if (s.status === "draft" && prod) notFound();

  const entries: ShellNavEntry[] = SUBJECTS.map((x) => ({
    id: x.id,
    name: x.name,
    href: `/subjects/${x.id}`,
    available: !(x.status === "draft" && prod),
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
