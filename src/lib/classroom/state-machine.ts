// ============================================================================
// TUTORS ACADEMY · Phase 7 · MILESTONE 1 — THE CHAMBER STATE MACHINE
//
// Four states, derived — never guessed. This module is PURE: it takes a
// session's facts and an instant, and names the state the chamber is in.
// No fetches, no "now()", no hidden wall-clock. The honest standby sentence
// from Milestone 2 governs what the visitor sees when the state is
// STANDBY; this machine only names states.
//
//   STANDBY   — no session has been opened (or the one scheduled is not
//               live yet). The chamber is staged; nothing connects.
//   ACTIVE    — the tutor has opened the session; the chamber stands.
//   SETTLING  — the session is concluded, but its SETTLING window still
//               holds: the room stays visible long enough for the last
//               stroke to land and the last hand to leave.
//   CONCLUDED — the window has passed. The session's facts remain (they are
//               facts); the chamber no longer holds a door open for it.
//
// The SETTLING window is measured from the instant the session became
// concluded (cohort_sessions.updated_at — maintained by the 0001 touch
// trigger), because an academy that says "the session ended" and then
// quietly extends it by an unknown amount is making things up.
// ============================================================================

/** The lifecycle of a session row, exactly as the DB stores it. */
export type SessionRowState = "scheduled" | "active" | "concluded";

/** The chamber's own vocabulary — four words, no adjectives added. */
export type ChamberState = "STANDBY" | "ACTIVE" | "SETTLING" | "CONCLUDED";

/** The minimal facts the machine needs. More may be attached; these suffice. */
export interface SessionFacts {
  state: SessionRowState;
  /** Instant the row last changed (became active / concluded). ISO string. */
  updatedAt?: string | null;
}

/** How long a concluded session keeps the room visible. */
export const SETTLING_WINDOW_MINUTES = 15;

const WINDOW_MS = SETTLING_WINDOW_MINUTES * 60 * 1000;

function parseInstant(value: string): number | null {
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

/**
 * Names the chamber's state for a session's facts at an instant.
 *
 * Rules, in order:
 *   - no session, or the "now" cannot be read  → STANDBY (never guess);
 *   - scheduled                                → STANDBY;
 *   - active                                   → ACTIVE;
 *   - concluded within the settling window     → SETTLING;
 *   - concluded beyond it                      → CONCLUDED.
 *
 * `nowIso` is passed in (the page composes the instant it renders at) so the
 * machine stays pure and testable; malformed input degrades to STANDBY.
 */
export function chamberState(
  session: SessionFacts | null | undefined,
  nowIso: string
): ChamberState {
  if (!session) return "STANDBY";
  const now = parseInstant(nowIso);
  if (now === null) return "STANDBY";

  switch (session.state) {
    case "scheduled":
      return "STANDBY";
    case "active":
      return "ACTIVE";
    case "concluded": {
      const concludedAt = parseInstant(session.updatedAt ?? "");
      if (concludedAt === null) return "CONCLUDED";
      return now <= concludedAt + WINDOW_MS ? "SETTLING" : "CONCLUDED";
    }
    default:
      // A state the contract does not name is treated as no-session: the
      // machine does not improvise vocabulary for rows it cannot read.
      return "STANDBY";
  }
}

/** The status bar speaks in these words — one per state, nothing else. */
export const CHAMBER_STATE_WORD: Record<ChamberState, string> = {
  STANDBY: "Standby",
  ACTIVE: "In session",
  SETTLING: "Settling",
  CONCLUDED: "Concluded",
};

/**
 * Picks the session the chamber stands for, given what the data layer read.
 * Deterministic order of precedence — the chamber never shows two:
 *   1. the most recently updated ACTIVE session;
 *   2. otherwise the earliest scheduled one coming up;
 *   3. otherwise the most recently updated concluded one (so the SETTLING
 *      window can be honoured — CONCLUDED is then reached by chamberState);
 *   4. otherwise null (true standby).
 */
export function sessionOfRecord<
  T extends SessionFacts & { updatedAt?: string | null; scheduledAt: string }
>(sessions: readonly T[], nowIso: string): T | null {
  const now = parseInstant(nowIso);
  if (now === null) return null;

  const active = sessions.filter((s) => s.state === "active");
  if (active.length > 0) {
    return [...active].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0];
  }

  const scheduled = sessions.filter((s) => s.state === "scheduled");
  if (scheduled.length > 0) {
    // The one coming up soonest stands for the chamber.
    return [...scheduled].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
  }

  const concluded = sessions.filter((s) => s.state === "concluded");
  if (concluded.length > 0) {
    return [...concluded].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0];
  }

  return null;
}
