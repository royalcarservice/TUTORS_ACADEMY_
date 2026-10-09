/**
 * COHORT DATA ACCESS — Phase 7 · Step 2 (server only).
 *
 * The FIRST READER of public.cohorts. Its scope is granted by migration
 * 0006 and nowhere else:
 *   · a STUDENT reads cohorts of a subject they are ACTIVELY enrolled in;
 *   · a TUTOR reads cohorts they are ASSIGNED to (public.cohort_tutors).
 * One function serves both identities: the query STATES the subject it means
 * (the 6.1 rule — "mine" is spelled, not assumed) and RLS supplies the
 * identity boundary. There is no service-role read here and no write of any
 * kind: cohorts are managed by the service role until a creation flow is
 * ruled (0005), and attendance facts belong to progress_record (0004).
 */

import { DataReadError } from "@/lib/state/read-error";
import { createClient } from "@/lib/supabase/server";

import type { CohortSession, CohortSessionState } from "./session";

const STATES: readonly CohortSessionState[] = ["scheduled", "active", "concluded"];

function toSession(row: { id: string; subject_id: string; name: string; scheduled_at: string; state: string }): CohortSession | null {
  if (!STATES.includes(row.state as CohortSessionState)) return null; // a row the type cannot hold is dropped, not guessed
  return { id: row.id, subjectId: row.subject_id, name: row.name, scheduledAt: row.scheduled_at, state: row.state as CohortSessionState };
}

/**
 * Cohort sessions in ONE subject for the CURRENT identity — enrolled student
 * or assigned tutor, decided by RLS (migration 0006), never by this code.
 * Rows arrive ordered by scheduled instant, id as the tie-break — the same
 * deterministic ordering the interpretation layer (./session.ts) relies on.
 *
 * A failed read THROWS DataReadError (5.7): "no cohorts" and "the read
 * failed" are never the same value. The calling surface isolates the throw
 * (src/lib/state/isolate.ts) and renders what it truthfully has.
 */
export async function getCohortSessions(subjectId: string): Promise<CohortSession[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("cohorts")
    .select("id, subject_id, name, scheduled_at, state")
    .eq("subject_id", subjectId)          // subject isolation spelled in the query
    .order("scheduled_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new DataReadError("cohorts", error);
  return (data ?? []).map(toSession).filter((s): s is CohortSession => s !== null);
}

/**
 * Cohort sessions for the CURRENT STUDENT across their enrolled subjects —
 * what the next-action engine's class provider reads (Phase 7 · Step 2).
 * The enrolment list is passed IN by the caller (it already holds it — no
 * second enrolments query); an empty list means no query at all. RLS
 * (migration 0006) re-checks the boundary row by row. Same failure rule:
 * a failed read throws DataReadError; the caller isolates it.
 */
export async function getStudentCohortSessions(enrolledSubjectIds: readonly string[]): Promise<CohortSession[]> {
  if (enrolledSubjectIds.length === 0) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("cohorts")
    .select("id, subject_id, name, scheduled_at, state")
    .in("subject_id", [...enrolledSubjectIds])
    .neq("state", "concluded")            // history is never an instruction; the provider re-checks anyway
    .order("scheduled_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new DataReadError("cohorts", error);
  return (data ?? []).map(toSession).filter((s): s is CohortSession => s !== null);
}
