import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { resolveRecord } from "@/components/tutor/record";
import { RelationshipSurface } from "@/components/tutor/relationship-surface";
import { shellSubjectInfo } from "@/lib/student/subject-info";
import type { SubjectId } from "@/lib/student/contract";
import { getSubject } from "@/lib/subjects/subjects";
import { getRelationshipView } from "@/lib/tutor/relationship";

/* /tutor/[subject]/[relationship] — THE RELATIONSHIP'S SURFACE (6.3)
 *
 * Subject-scoped in the URL: the first segment is the subject, the second is
 * the relationship's own id. A URL cannot name a student and cannot span
 * subjects. The relationship is resolved server-side from the session + the
 * URL by the one reader; anything that does not resolve — unknown subject,
 * malformed id, nobody's id, another tutor's, an ended one — is ONE
 * notFound(): the same status, the same bytes (P6-R9). */

export const dynamic = "force-dynamic";

type Params = Promise<{ subject: string; relationship: string }>;

/* cache(): metadata and the page share ONE read per request. */
const load = cache(async (params: Params) => {
  const { subject, relationship } = await params;
  const s = getSubject(subject);
  if (!s) return null;
  const view = await getRelationshipView({ subjectId: s.id as SubjectId, relationshipId: relationship });
  return view ? { view, subject: s } : null;
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const r = await load(params);
  // Not-found metadata is the segment's default; the page itself 404s below.
  return r ? { title: `${r.view.displayName} · ${r.subject.name}` } : {};
}

export default async function RelationshipPage({ params }: { params: Params }) {
  const r = await load(params);
  if (!r) notFound();
  const info = shellSubjectInfo()[r.view.subjectId];
  if (!info) notFound();
  const record = await resolveRecord(r.view);
  return <RelationshipSurface view={r.view} subject={info} record={record} />;
}
