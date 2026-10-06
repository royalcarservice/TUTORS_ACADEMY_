import { NextResponse } from "next/server";

import { getIdentity } from "@/lib/auth/session";
import { isDensity, isMotionChar } from "@/lib/environment/levers";
import { revertEnvironment, SHAPE_CONFLICT_SENTENCE, shapeEnvironment } from "@/lib/environment/shape";
import { isolateAsync } from "@/lib/state/isolate";
import { logFailure } from "@/lib/state/log";
import type { SubjectId } from "@/lib/student/contract";
import { ROUTES } from "@/config/routes";
import { getSubject } from "@/lib/subjects/subjects";
import { createClient } from "@/lib/supabase/server";
import { getTutorContext } from "@/lib/tutor/data";

/* POST /tutor/[subject]/environment/shape — THE WRITE (6.4 · Part 5, amended by P6-R21)
 *
 * 5.5's shape, exactly: a form POST, a 303 back to the surface, nothing
 * written on GET or prefetch (there is no GET; Next answers 405), the
 * REQUEST-SCOPED client only — RLS decides whether this tutor may shape this
 * subject; the service role never appears.
 *
 * The URL names a subject. Which tutor is writing comes from the session;
 * whether they may is resolved server-side (placement in the subject) and
 * enforced by the policy. A denied write is a 404 — the same bytes an
 * unknown subject gets (P6-R9) — because to a tutor with no placement the
 * subject's shaping surface does not exist.
 *
 * Values: closed authored sets only (P6-R11). Anything else in the body is
 * not a 400 with advice; it is treated as a failed save: 303 back with
 * ?shape=failed, the surface shows the values in force. (Validation runs
 * BEFORE the freshness check, so an unauthored value is a failed save, not a
 * conflict.)
 *
 * P6-R21 — REFUSE THE STALE WRITE. The form carries `version`: the row's
 * `updated_at` at load, or the empty string when no row existed. The write is
 * CONDITIONAL on the room still being in that state; a room that moved (or a
 * missing token) is answered with ONE 409 document — the ruling's sentence,
 * nothing else, and nothing written. Last-write-wins was rejected by ruling:
 * the refusal names the fact, never the person. */

export const dynamic = "force-dynamic";

type Params = Promise<{ subject: string }>;

/* relative Location, as 5.5: the browser resolves it against the origin it used */
const seeOther = (path: string) => new NextResponse(null, { status: 303, headers: { Location: path } });
const nothing = () => new NextResponse(null, { status: 404 });

/* P6-R21 — the 409 document. A standalone response (a route handler cannot
 * borrow the app shell), shaped like the honest page: eyebrow, the ruling's
 * single factual sentence, one action back to the SETTLING GET — which is the
 * reload the sentence asks for. Inline styles because the app's tokens are not
 * in scope here; no colour of alarm, no second statement, no script. */
const conflict = (back: string, roomLabel: string) =>
  new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Not saved · Tutors Academy</title>
</head>
<body style="margin:0;background:#faf9f5;color:#14181f;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;">
<main data-state-page="shape-conflict" style="max-width:36rem;margin:0 auto;padding:6rem 1.5rem;">
<p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;color:#6b6f76;">Not saved</p>
<p style="margin:0.75rem 0 0;font-size:1.06rem;line-height:1.55;color:#14181f;">${SHAPE_CONFLICT_SENTENCE}</p>
<p style="margin:1.75rem 0 0;"><a href="${back}" data-primary-action style="display:inline-block;min-width:12rem;padding:0.75rem 1.5rem;border-radius:0.5rem;background:#14181f;color:#faf9f5;font-size:0.95rem;font-weight:500;text-align:center;text-decoration:none;">Open the ${roomLabel} environment</a></p>
</main>
</body>
</html>`,
    { status: 409, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );

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

  /* REVERT stays tokenless (P6-R21): a DELETE cannot overwrite a value, only
     remove one — a stale revert lands on the authored default either way. */
  if (intent === "revert") {
    const r = await revertEnvironment(supabase, { subjectId: s.id as SubjectId });
    if (!r.ok) { logFailure({ scope: "route:/tutor/[subject]/environment/shape", errorClass: "PostgrestError", what: `revert failed (${r.reason === "failed" ? r.code : "?"}) — row untouched`, ids: { subject: s.id } }); return seeOther(`${back}?shape=failed`); }
    return seeOther(back);
  }

  const density = form.get("density");
  const motionChar = form.get("motionChar");
  if (intent !== "save" || !isDensity(density) || !isMotionChar(motionChar)) {
    return seeOther(`${back}?shape=failed`);
  }

  /* P6-R21 — the freshness token: the row's updated_at at load, "" when no row
     existed, and a MISSING field is a write that cannot prove its freshness. */
  const versionField = form.get("version");
  const version = typeof versionField === "string" ? (versionField === "" ? null : versionField) : undefined;

  const r = await shapeEnvironment(supabase, { subjectId: s.id as SubjectId }, { density, motionChar }, identity.id, version);
  if (!r.ok) {
    if (r.reason === "conflict") {
      logFailure({ scope: "route:/tutor/[subject]/environment/shape", errorClass: "ShapeConflict", what: "save refused — the room moved between load and submit (or no freshness token); nothing written", ids: { subject: s.id } });
      return conflict(back, s.name);
    }
    logFailure({ scope: "route:/tutor/[subject]/environment/shape", errorClass: "PostgrestError", what: `upsert failed (${r.code}) — no row written`, ids: { subject: s.id } });
    return seeOther(`${back}?shape=failed`);
  }
  return seeOther(back);
}
