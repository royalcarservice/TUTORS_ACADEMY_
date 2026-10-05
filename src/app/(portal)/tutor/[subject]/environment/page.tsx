import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { STATE_COPY } from "@/components/state/copy";
import { HonestPage } from "@/components/state/honest-page";
import { EnvironmentLeversSurface } from "@/components/tutor/environment-levers";
import { getIdentity } from "@/lib/auth/session";
import { getEnvironmentSettings } from "@/lib/environment/settings";
import { shellSubjectInfo } from "@/lib/student/subject-info";
import type { SubjectId } from "@/lib/student/contract";
import { logFailure } from "@/lib/state/log";
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
 * and that right is the RLS policy, not this check (defence in depth).
 *
 * 6.5 · THE ONE PLACE WHERE "FALL BACK TO THE AUTHORED DEFAULT" IS WRONG.
 * The reader answers a failed read with the authored default and
 * `source: "authored-after-failed-read"` — correct for the ROOM, which is
 * design config and has a value without the database. Here it is not: this
 * page is a FORM, and a form pre-filled with defaults that may not be the
 * values in force would invite an accidental revert (one Save, and another
 * tutor's shaping is gone, with the surface having said "as authored"). So
 * a failed read renders the honest page — one h1, one sentence, one GET —
 * and never the form. P5-R9 in its strictest form: a failed read is not a
 * value, and here not even a safe default. (docs/STATE_LANGUAGE.md, 6.5.) */

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
  if (r.view.source === "authored-after-failed-read") {
    const here = `/tutor/${r.view.subjectId}/environment`;
    logFailure({ scope: "page:/tutor/[subject]/environment", errorClass: "SettingsUnread", what: "settings read failed — the shaping surface refuses to pre-fill the authored default (honest page, no form)", ids: { subject: r.view.subjectId } });
    return <HonestPage state="shaping-unread" bare {...STATE_COPY.shapingUnread} action={{ ...STATE_COPY.shapingUnread.action, href: here }} />;
  }
  const { shape } = await searchParams;
  return <EnvironmentLeversSurface view={r.view} subject={info} viewerId={r.viewerId} failed={shape === "failed"} />;
}
