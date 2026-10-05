import { NextResponse } from "next/server";

import { getIdentity } from "@/lib/auth/session";
import { isDensity, isMotionChar } from "@/lib/environment/levers";
import { revertEnvironment, shapeEnvironment } from "@/lib/environment/shape";
import { isolateAsync } from "@/lib/state/isolate";
import { logFailure } from "@/lib/state/log";
import type { SubjectId } from "@/lib/student/contract";
import { ROUTES } from "@/config/routes";
import { getSubject } from "@/lib/subjects/subjects";
import { createClient } from "@/lib/supabase/server";
import { getTutorContext } from "@/lib/tutor/data";

/* POST /tutor/[subject]/environment/shape — THE WRITE (6.4 · Part 5)
 *
 * 5.5's shape, exactly: a form POST, a 303 back to the surface, idempotent
 * (upsert on subject_id / delete), nothing written on GET or prefetch (there
 * is no GET; Next answers 405), the REQUEST-SCOPED client only — RLS decides
 * whether this tutor may shape this subject; the service role never appears.
 *
 * The URL names a subject. Which tutor is writing comes from the session;
 * whether they may is resolved server-side (placement in the subject) and
 * enforced by the policy. A denied write is a 404 — the same bytes an
 * unknown subject gets (P6-R9) — because to a tutor with no placement the
 * subject's shaping surface does not exist.
 *
 * Values: closed authored sets only (P6-R11). Anything else in the body is
 * not a 400 with advice; it is treated as a failed save: 303 back with
 * ?shape=failed, the surface shows the values in force. */

export const dynamic = "force-dynamic";

type Params = Promise<{ subject: string }>;

/* relative Location, as 5.5: the browser resolves it against the origin it used */
const seeOther = (path: string) => new NextResponse(null, { status: 303, headers: { Location: path } });
const nothing = () => new NextResponse(null, { status: 404 });

export async function POST(req: Request, { params }: { params: Params }) {
  const { subject } = await params;
  const s = getSubject(subject);
  if (!s) return nothing();
  const back = `/tutor/${s.id}/environment`;

  /* 6.5 · P5-R9 + P6-R15. An identity READ FAILURE is not "no session": nothing
     was written, so 303 back to the settling GET; the page decides (the honest
     page, or the values in force). NO SESSION (the proxy normally catches this
     first — defence in depth) → sign in, with the SETTLING GET as the return
     path, never this URL: a GET here is 405. */
  const identityRead = await isolateAsync("route:/tutor/[subject]/environment/shape", () => getIdentity(), { subject: s.id });
  if (!identityRead.ok) return seeOther(`${back}?shape=failed`);
  const identity = identityRead.value;
  if (!identity) return seeOther(`${ROUTES.login}?next=${encodeURIComponent(back)}`);
  if (identity.role !== "tutor") return nothing();
  const ctx = await getTutorContext();
  if (!ctx || !ctx.groups.some((g) => g.subjectId === s.id)) return nothing();

  const supabase = await createClient();
  if (!supabase) return seeOther(`${back}?shape=failed`);

  const form = await req.formData();
  const intent = form.get("intent");

  if (intent === "revert") {
    const r = await revertEnvironment(supabase, { subjectId: s.id as SubjectId });
    if (!r.ok) { logFailure({ scope: "route:/tutor/[subject]/environment/shape", errorClass: "PostgrestError", what: `revert failed (${r.code}) — row untouched`, ids: { subject: s.id } }); return seeOther(`${back}?shape=failed`); }
    return seeOther(back);
  }

  const density = form.get("density");
  const motionChar = form.get("motionChar");
  if (intent !== "save" || !isDensity(density) || !isMotionChar(motionChar)) {
    return seeOther(`${back}?shape=failed`);
  }
  const r = await shapeEnvironment(supabase, { subjectId: s.id as SubjectId }, { density, motionChar }, identity.id);
  if (!r.ok) { logFailure({ scope: "route:/tutor/[subject]/environment/shape", errorClass: "PostgrestError", what: `upsert failed (${r.code}) — no row written`, ids: { subject: s.id } }); return seeOther(`${back}?shape=failed`); }
  return seeOther(back);
}
