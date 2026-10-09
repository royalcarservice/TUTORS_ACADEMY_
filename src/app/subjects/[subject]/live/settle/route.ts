import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/config/routes";
import { getIdentity } from "@/lib/auth/session";
import { STEP_EVIDENCE } from "@/lib/progress/derive";
import { isolateAsync } from "@/lib/state/isolate";
import { errorClassOf, logFailure } from "@/lib/state/log";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getSubject } from "@/lib/subjects/subjects";

/* POST /subjects/[subject]/live/settle — THE SESSION SETTLEMENT WRITE
 * (Phase 7 · Step 5, DEC-027)
 *
 * THE WRITER migration 0004 named and waited for: "the recording capability
 * writes through the service role on a real occurrence." The occurrence is
 * the tutor concluding a session; the capability is this route.
 *
 * ONE ENDPOINT, TWO SETTLEMENT ACTS, decided by the session's state — both
 * idempotent, both answered with a 303 to the SETTLING GET (/live re-reads
 * the truth and shows the settlement surface; P6-R15):
 *
 *   · the session is ACTIVE   → conclude it: ONE guarded UPDATE
 *                               (state='concluded' WHERE state='active') —
 *                               the transition is ATOMIC, a second settle
 *                               finds no active row and cannot conclude
 *                               twice. The record is NOT written yet: the
 *                               tutor confirms it next, on the settlement
 *                               surface.
 *   · the session is CONCLUDED → record it: one session-attended fact per
 *                               enrolled student (ref_id = the session row
 *                               — the DEC-026 referent), skipping students
 *                               who already carry the fact, so a repeated
 *                               confirm writes nothing twice.
 *
 * WHO MAY SETTLE — the caller's standing is decided by RLS on the READ:
 * the session row is fetched with the request-scoped client, and
 * migration 0007's policy lets only a tutor with an ACTIVE relationship in
 * the subject see it. No row visible → 404: the same bytes an unknown
 * session gets (P6-R9's posture), because to everyone else this session
 * does not exist. The write itself then runs through the SERVICE client —
 * authenticated roles hold no write policies on either table, by design.
 *
 * WHAT IS RECORDED — the fact, and nothing else (P5-R6). The settled shape
 * of progress_record admits kind/at/ref_id; there is no notes column and
 * there will not be one: `academicNotes` is accepted (the brief's contract)
 * and validated, and then deliberately NOT stored — a student's record
 * holds facts, never summaries (DEC-022 refused metadata; DEC-027 records
 * the refusal). `milestoneKey` is validated against the arc's own
 * STEP_EVIDENCE mapping — the steps a session-attended fact evidences —
 * and likewise stored nowhere: the engine derives the arc's position from
 * facts at read time, so a declared milestone would be a second truth.
 *
 * GET is not exported: a GET to this URL is a 405, never a write.
 */

export const dynamic = "force-dynamic";

type Params = Promise<{ subject: string }>;

/* Relative Location, as the enter/shape routes: the browser resolves it
   against the origin it used, so the session cookie travels with the GET. */
const seeOther = (path: string) => new NextResponse(null, { status: 303, headers: { Location: path } });
const nothing = () => new NextResponse(null, { status: 404 });
const SCOPE = "route:/subjects/[subject]/live/settle";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* The milestone keys the arc admits for a session-attended fact — read from
 * STEP_EVIDENCE itself, never a second copy of the vocabulary. */
const MILESTONE_KEYS = Object.entries(STEP_EVIDENCE)
  .filter(([, kinds]) => kinds.includes("session-attended"))
  .map(([step]) => step);

const NOTES_MAX = 500;

interface SettleBody {
  sessionId: string | null;
  milestoneKey: string | null;
  academicNotes: string | null;
}

async function readBody(request: NextRequest): Promise<SettleBody> {
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      const json = (await request.json()) as Record<string, unknown>;
      return {
        sessionId: typeof json.sessionId === "string" ? json.sessionId : null,
        milestoneKey: typeof json.milestoneKey === "string" ? json.milestoneKey : null,
        academicNotes: typeof json.academicNotes === "string" ? json.academicNotes : null,
      };
    }
    const form = await request.formData();
    const text = (name: string) => {
      const v = form.get(name);
      return typeof v === "string" && v.length > 0 ? v : null;
    };
    return { sessionId: text("sessionId"), milestoneKey: text("milestoneKey"), academicNotes: text("academicNotes") };
  } catch {
    return { sessionId: null, milestoneKey: null, academicNotes: null };
  }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { subject } = await params;
  const s = getSubject(subject);
  if (!s) return nothing();
  const settlingGet = `/subjects/${s.id}/live`;

  /* P5-R9 posture, as the shape route: an identity READ FAILURE is not "no
     session" — nothing was written, so 303 to the settling GET; the page
     decides. No identity → sign in, with the settling GET as the return
     path. Anyone but a tutor → the session does not exist to them. */
  const identityRead = await isolateAsync(SCOPE, () => getIdentity(), { subject: s.id });
  if (!identityRead.ok) return seeOther(`${settlingGet}?settle=failed`);
  const identity = identityRead.value;
  if (!identity) return seeOther(`${ROUTES.login}?next=${encodeURIComponent(settlingGet)}`);
  if (identity.role !== "tutor") return nothing();

  /* VALUES — the closed sets, validated BEFORE any read of the session
     (the shape route's order). An unauthored value is a failed settlement,
     never a partial write. */
  const body = await readBody(request);
  if (!body.sessionId || !UUID.test(body.sessionId)) return seeOther(`${settlingGet}?settle=failed`);
  if (body.milestoneKey !== null && !MILESTONE_KEYS.includes(body.milestoneKey)) {
    return seeOther(`${settlingGet}?settle=failed`);
  }
  if (body.academicNotes !== null && body.academicNotes.length > NOTES_MAX) {
    return seeOther(`${settlingGet}?settle=failed`);
  }
  /* academicNotes is valid and deliberately dropped here: P5-R6. The fact
     is written below; the note is not, and no surface claims it was. */

  /* STANDING — the request-scoped read IS the check: 0007's policy shows
     this row only to a tutor with an active relationship in the subject. */
  const supabase = await createClient();
  if (!supabase) return new NextResponse("Auth not configured", { status: 503 });
  const { data: sessionRow, error: sessionError } = await supabase
    .from("cohort_sessions")
    .select("id, state")
    .eq("id", body.sessionId)
    .eq("subject_id", s.id)          // subject isolation spelled in the query
    .maybeSingle();
  if (sessionError) {
    logFailure({ scope: SCOPE, errorClass: errorClassOf(sessionError), what: "session read failed before settling — nothing written", ids: { subject: s.id } });
    return seeOther(`${settlingGet}?settle=failed`);
  }
  if (!sessionRow) return nothing();   // unknown OR not theirs — same bytes

  const admin = createServiceClient();
  if (!admin) return new NextResponse("Auth not configured", { status: 503 });

  if (sessionRow.state === "scheduled") {
    /* A session that never opened cannot be concluded. Nothing written. */
    return seeOther(`${settlingGet}?settle=failed`);
  }

  let concludedAt: string | null = null;

  if (sessionRow.state === "active") {
    /* CONCLUDE — the atomic transition. Guarded by the state the row still
       holds; a concurrent settle finds zero rows and falls through to the
       recording path, never a second conclusion. */
    const { data: updated, error: updateError } = await admin
      .from("cohort_sessions")
      .update({ state: "concluded" })
      .eq("id", body.sessionId)
      .eq("subject_id", s.id)
      .eq("state", "active")
      .select("updated_at");
    if (updateError) {
      logFailure({ scope: SCOPE, errorClass: errorClassOf(updateError), what: "session conclusion failed — nothing written", ids: { subject: s.id } });
      return seeOther(`${settlingGet}?settle=failed`);
    }
    if (updated.length === 0) {
      /* Moved between the read and the write: treat as already concluded. */
      const { data: reread } = await admin.from("cohort_sessions").select("updated_at").eq("id", body.sessionId).maybeSingle();
      concludedAt = reread?.updated_at ?? null;
    } else {
      concludedAt = updated[0].updated_at;
    }
    /* The tutor confirms the record next, on the settlement surface. */
    return seeOther(settlingGet);
  }

  /* RECORD — the session is concluded; write the attendance facts. */
  const { data: concludedRow, error: concludedError } = await admin
    .from("cohort_sessions")
    .select("updated_at")
    .eq("id", body.sessionId)
    .maybeSingle();
  if (concludedError) {
    logFailure({ scope: SCOPE, errorClass: errorClassOf(concludedError), what: "concluded session read failed — nothing written", ids: { subject: s.id } });
    return seeOther(`${settlingGet}?settle=failed`);
  }
  concludedAt = concludedRow?.updated_at ?? concludedAt ?? new Date().toISOString();

  /* Students enrolled at settlement — the roster the record speaks for.
     Service-role read: the enrolment list is a settlement fact, and no
     authenticated role may write from it. */
  const { data: roster, error: rosterError } = await admin
    .from("enrolments")
    .select("student_id")
    .eq("subject_id", s.id)
    .eq("status", "active");
  if (rosterError) {
    logFailure({ scope: SCOPE, errorClass: errorClassOf(rosterError), what: "enrolment roster read failed — nothing written", ids: { subject: s.id } });
    return seeOther(`${settlingGet}?settle=failed`);
  }

  if ((roster ?? []).length > 0) {
    /* Facts already standing for THIS session — a repeated confirm is a
       no-op for every student who already carries one. */
    const { data: existing, error: existingError } = await admin
      .from("progress_record")
      .select("student_id")
      .eq("subject_id", s.id)
      .eq("kind", "session-attended")
      .eq("ref_id", body.sessionId);
    if (existingError) {
      logFailure({ scope: SCOPE, errorClass: errorClassOf(existingError), what: "attendance read failed — nothing written", ids: { subject: s.id } });
      return seeOther(`${settlingGet}?settle=failed`);
    }
    const done = new Set((existing ?? []).map((r) => r.student_id));
    const rows = (roster ?? [])
      .filter((r) => !done.has(r.student_id))
      .map((r) => ({
        student_id: r.student_id,
        subject_id: s.id,
        kind: "session-attended",
        at: concludedAt,               // the fact's time: when the session concluded
        ref_id: body.sessionId,        // the DEC-026 referent: the session row
      }));
    if (rows.length > 0) {
      /* upsert + ignoreDuplicates: the (student, subject, kind, at) unique
         stands behind the idempotence — a repeated settle writes nothing
         twice. Nothing is ever updated. */
      const { error: insertError } = await admin
        .from("progress_record")
        .upsert(rows, { onConflict: "student_id,subject_id,kind,at", ignoreDuplicates: true });
      if (insertError) {
        logFailure({ scope: SCOPE, errorClass: errorClassOf(insertError), what: "attendance write failed — the conclusion stands, the record does not", ids: { subject: s.id } });
        return seeOther(`${settlingGet}?settle=failed`);
      }
    }
  }

  return seeOther(settlingGet);
}
