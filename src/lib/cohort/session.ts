/**
 * COHORT SESSION LOGIC — Phase 7 · Step 2 (pure).
 *
 * The cohorts table (migration 0005) holds one row per class group in one
 * subject: a name, a scheduled instant and a lifecycle state. This module is
 * the interpretation layer: given rows and a clock value, it answers which
 * session a surface may speak about. No I/O, no clock read, no env, no
 * supabase — the data layer (./data.ts) fetches, this file thinks.
 *
 * ZERO SURVEILLANCE BY CONSTRUCTION: nothing here measures presence,
 * dwell-time or participation. A session is a scheduled fact; who attended is
 * a progress_record fact written on a real occurrence (migration 0004), never
 * inferred from a timer.
 */

export type CohortSessionState = "scheduled" | "active" | "concluded";

export interface CohortSession {
  id: string;
  subjectId: string;
  /** 1–80 chars in the DB — an identity string, rendered only as-is. */
  name: string;
  /** ISO 8601. */
  scheduledAt: string;
  state: CohortSessionState;
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/** Valid, parseable scheduled instant — malformed is false, never thrown. */
export function validScheduledAt(iso: string): boolean {
  return ISO.test(iso) && Number.isFinite(Date.parse(iso));
}

/** Concluded sessions are history, never an instruction. */
export function isOpenState(state: CohortSessionState): boolean {
  return state === "active" || state === "scheduled";
}

/**
 * THE ONE SESSION A SURFACE MAY SPEAK ABOUT for one subject: an ACTIVE
 * session if one exists, else the earliest SCHEDULED one. Concluded rows are
 * excluded. Deterministic: scheduled instant ascending, id as the tie-break
 * (the same ordering rule as the progress record, src/lib/progress/derive.ts).
 * Malformed rows (bad state, unparseable instant) are silently excluded —
 * a surface says nothing rather than something wrong.
 */
export function sessionForSubject(sessions: readonly CohortSession[], subjectId: string): CohortSession | null {
  const candidates = sessions.filter(
    (s) => s.subjectId === subjectId && isOpenState(s.state) && validScheduledAt(s.scheduledAt),
  );
  if (candidates.length === 0) return null;
  const active = candidates
    .filter((s) => s.state === "active")
    .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt) || a.id.localeCompare(b.id));
  if (active.length > 0) return active[0];
  const scheduled = candidates
    .filter((s) => s.state === "scheduled")
    .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt) || a.id.localeCompare(b.id));
  return scheduled[0] ?? null;
}
