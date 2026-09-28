import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/config/routes";
import { getIdentity } from "@/lib/auth/session";
import type { SubjectId } from "@/lib/student/contract";
import { recordEnvironmentEntry } from "@/lib/student/data";
import { mayEnrol } from "@/lib/student/enrol";
import { createClient } from "@/lib/supabase/server";
import { getSubject } from "@/lib/subjects/subjects";

/* POST /subjects/[subject]/enter — THE ENTRY WRITE (Phase 5 · Step 5 · Part 2)
 *
 * CHOOSING IS ENTERING. One endpoint, one explicit act, two cases:
 *   · not yet enrolled  → create the enrolment (only if `mayEnrol` — the door
 *                         predicate — says so), then record the first entry;
 *   · already enrolled  → record an entry (access is unconditional, P5-R4).
 * Then 303 into the environment. A form POST: works with JS off, survives a
 * slow connection, can never be triggered by a page view or a prefetch.
 *
 * CLIENT: the request-scoped anon client carrying the STUDENT'S OWN cookie
 * session — never the service role. The INSERT policy
 * `enrolments_insert_own` (student_id = auth.uid() AND role = 'student') is
 * therefore exercised on every first entry; that is the point of having it.
 *
 * IDEMPOTENT: `enrolments` has UNIQUE (student_id, subject_id). A second
 * submit upserts with ignoreDuplicates → one row, no error, another 303.
 * environment_state is keyed (student_id, subject_id); the second entry
 * updates last_entered_at. `position` is never written — nothing supplies one.
 *
 * GET is not exported: a GET to this URL is a 405, not a write.
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const s = getSubject(subject);
  if (!s) return new NextResponse("Not found", { status: 404 });

  const identity = await getIdentity();
  // A session is required. No identity → the write is refused; the visitor is
  // sent to sign in with this environment as the return path (works with JS off).
  if (!identity) return seeOther(`${ROUTES.login}?next=${encodeURIComponent(`/subjects/${s.id}`)}`);
  if (identity.role !== "student") return new NextResponse("Forbidden", { status: 403 });

  const supabase = await createClient();
  if (!supabase) return new NextResponse("Auth not configured", { status: 503 });

  const { data: existing } = await supabase.from("enrolments").select("subject_id, status").eq("subject_id", s.id).maybeSingle();
  const enrolled = existing?.status === "active";

  if (!enrolled) {
    // Creating an enrolment MIRRORS THE DOORS — the one predicate, nowhere else.
    if (!mayEnrol(identity, s.id)) return new NextResponse("Not found", { status: 404 });
    const { error } = await supabase
      .from("enrolments")
      .upsert({ student_id: identity.id, subject_id: s.id, status: "active" }, { onConflict: "student_id,subject_id", ignoreDuplicates: true });
    if (error) return new NextResponse(`Could not begin: ${error.message}`, { status: 500 });
  }

  // The explicit act of entering. Recency means THIS, never a page view.
  const entry = await recordEnvironmentEntry(identity.id, s.id as SubjectId);
  if (!entry.ok) return new NextResponse(`Could not record entry: ${entry.error}`, { status: 500 });

  return seeOther(`/subjects/${s.id}`);
}

/** 303 with a RELATIVE Location: the browser resolves it against the origin it used, so the session cookie always travels with the follow-up GET (an absolute URL built from the bind address would not). */
const seeOther = (path: string) => new NextResponse(null, { status: 303, headers: { Location: path } });
