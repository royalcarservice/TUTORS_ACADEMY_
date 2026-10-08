// ============================================================================
// TUTORS ACADEMY · Phase 7 · MILESTONE 1 — THE CLASSROOM DATA LAYER
//
// Server-only readers for public.cohort_sessions (migration 0007) — the
// session-of-record the chamber stands inside. Its scope is granted by 0007
// and nowhere else:
//   · a STUDENT reads sessions of a subject they are ACTIVELY enrolled in;
//   · a TUTOR reads sessions of a subject where they hold an ACTIVE
//     relationship — and opens sessions there as themselves.
//
// One function serves both identities: the query STATES the subject it means
// (the 6.1 rule — "mine" is spelled, not assumed) and RLS supplies the
// identity boundary. No service-role read here, no write of any kind:
// lifecycle transitions (scheduled -> active -> concluded) belong to the
// service role, exactly as cohort lifecycle does (0005).
//
// The participants reader follows the same posture: it reads enrolments for
// the subject and RLS decides how deep the roster goes — a student sees
// their own enrolment row (the chamber may then show one tile besides the
// tutor), a tutor sees the enrolled roster they hold a relationship to. The
// code never reaches past what the boundary returns.
// ============================================================================

import { DataReadError } from "@/lib/state/read-error";
import { createClient } from "@/lib/supabase/server";

import type { SessionRowState } from "./state-machine";

/** A session row as the chamber consumes it. */
export interface ClassroomSession {
  id: string;
  subjectId: string;
  /** The tutor who opened (or will open) the session. */
  tutorId: string;
  /** The tutor's display name, when the boundary allows reading it. */
  tutorName: string | null;
  title: string;
  scheduledAt: string;
  state: SessionRowState;
  /** Instant the row last changed — the settling window is measured from it. */
  updatedAt: string;
}

/** One participant the boundary lets the chamber see. */
export interface SessionParticipant {
  studentId: string;
  /** Display name when readable; the tile falls back to a monogram. */
  displayName: string | null;
  enrolledAt: string;
}

const ROW_STATES: readonly SessionRowState[] = ["scheduled", "active", "concluded"];

function toSession(row: {
  id: string;
  subject_id: string;
  tutor_id: string;
  tutor_name: string | null;
  title: string;
  scheduled_at: string;
  state: string;
  updated_at: string;
}): ClassroomSession | null {
  if (!ROW_STATES.includes(row.state as SessionRowState)) return null; // unknown row-state: dropped, never guessed
  return {
    id: row.id,
    subjectId: row.subject_id,
    tutorId: row.tutor_id,
    tutorName: row.tutor_name,
    title: row.title,
    scheduledAt: row.scheduled_at,
    state: row.state as SessionRowState,
    updatedAt: row.updated_at,
  };
}

/**
 * Sessions of ONE subject for the CURRENT identity — enrolled student or
 * related tutor, decided by RLS (migration 0007), never by this code.
 * The tutor's display name is read through profiles in the same query;
 * rows where the name is unreadable keep the session and null the name.
 * Rows arrive ordered by scheduled instant, id as the tie-break — the
 * deterministic ordering sessionOfRecord (state-machine) relies on.
 *
 * A failed read THROWS DataReadError (5.7): "no sessions" and "the read
 * failed" are never the same value. The calling surface isolates the throw
 * (src/lib/state/isolate.ts) and renders what it truthfully has.
 */
export async function getSessions(subjectId: string): Promise<ClassroomSession[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("cohort_sessions")
    .select("id, subject_id, tutor_id, title, scheduled_at, state, updated_at, tutor:profiles!cohort_sessions_tutor_id_fkey(display_name)")
    .eq("subject_id", subjectId)          // subject isolation spelled in the query
    .order("scheduled_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new DataReadError("cohort_sessions", error);
  return (data ?? [])
    .map((row) => {
      const tutor = Array.isArray(row.tutor) ? row.tutor[0] : row.tutor;
      return toSession({
        id: row.id,
        subject_id: row.subject_id,
        tutor_id: row.tutor_id,
        tutor_name: (tutor?.display_name as string | undefined) ?? null,
        title: row.title,
        scheduled_at: row.scheduled_at,
        state: row.state,
        updated_at: row.updated_at,
      });
    })
    .filter((s): s is ClassroomSession => s !== null);
}

/**
 * The participants the boundary lets the chamber see in ONE subject.
 * Reads active enrolments, then attaches display names from profiles where
 * the boundary allows (a student sees their own name; a tutor sees the
 * names of students they hold an active relationship to). Names that cannot
 * be read stay null — the participant tile renders a monogram, honestly,
 * rather than a guessed label.
 */
export async function getSessionParticipants(subjectId: string): Promise<SessionParticipant[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: rows, error } = await supabase
    .from("enrolments")
    .select("student_id, enrolled_at")
    .eq("subject_id", subjectId)
    .eq("status", "active")
    .order("enrolled_at", { ascending: true });
  if (error) throw new DataReadError("enrolments", error);
  if (!rows || rows.length === 0) return [];

  const names = new Map<string, string>();
  const ids = rows.map((r) => r.student_id);
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", ids);
  // An unreadable roster of names is not a failed participant read — RLS
  // simply withheld the names; the tiles stand with monograms instead.
  if (!profileError) {
    for (const p of profiles ?? []) {
      if (typeof p.display_name === "string" && p.display_name.length > 0) names.set(p.id, p.display_name);
    }
  }

  return rows.map((r) => ({
    studentId: r.student_id,
    displayName: names.get(r.student_id) ?? null,
    enrolledAt: r.enrolled_at,
  }));
}
