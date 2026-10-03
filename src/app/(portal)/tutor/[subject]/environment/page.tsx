import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { EnvironmentLeversSurface } from "@/components/tutor/environment-levers";
import { getIdentity } from "@/lib/auth/session";
import { getEnvironmentSettings } from "@/lib/environment/settings";
import { shellSubjectInfo } from "@/lib/student/subject-info";
import type { SubjectId } from "@/lib/student/contract";
import { getSubject } from "@/lib/subjects/subjects";
import { getTutorContext } from "@/lib/tutor/data";

/* /tutor/[subject]/environment — THE SHAPING SURFACE (6.4)
 *
 * Subject-scoped: the URL names a subject and nothing else. Whether THIS
 * tutor may shape it is resolved server-side from the session — the 6.2
 * reader returns the subjects they are placed in (RLS-filtered, active only)
 * and the URL's subject must be one of them. Never from the subject id alone.
 * Anything that does not resolve — unknown subject, a subject the tutor has
 * no placement in — is ONE notFound(): same status, same bytes (P6-R9).
 *
 * The settings themselves are PUBLIC (anon SELECT) and read by the same
 * reader the environment uses; what this page adds is the right to write,
 * and that right is the RLS policy, not this check (defence in depth). */

export const dynamic = "force-dynamic";

type Params = Promise<{ subject: string }>;
type Search = Promise<{ shape?: string }>;

const load = cache(async (params: Params) => {
  const { subject } = await params;
  const s = getSubject(subject);
  if (!s) return null;
  const [identity, ctx] = await Promise.all([getIdentity(), getTutorContext()]);
  if (!identity || !ctx) return null;
  if (!ctx.groups.some((g) => g.subjectId === s.id)) return null;
  const view = await getEnvironmentSettings(s.id as SubjectId);
  return { view, subject: s, viewerId: identity.id };
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const r = await load(params);
  return r ? { title: `The ${r.subject.name} environment` } : {};
}

export default async function EnvironmentLeversPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const r = await load(params);
  if (!r) notFound();
  const info = shellSubjectInfo()[r.view.subjectId];
  if (!info) notFound();
  const { shape } = await searchParams;
  return <EnvironmentLeversSurface view={r.view} subject={info} viewerId={r.viewerId} failed={shape === "failed"} />;
}
