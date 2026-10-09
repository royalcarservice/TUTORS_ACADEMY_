import type { SubjectId } from "@/lib/student/contract";
import { admissibleKinds, validateEvents } from "./derive";
import type { ProgressEvent, ProgressEventKind } from "./events";

/* PROGRESS RECORD HELPERS (Phase 7 · Step 1) — pure logic for the table
 * migration 0004 creates. Same module, same vocabulary, same rules as 5.6:
 *
 *   · A record is a fact about a real object; malformed is a DEFECT, never a
 *     state (validateEvents decides; nothing here repairs or defaults).
 *   · A kind is admissible ONLY while the module owning its referent is live
 *     (EVENT_KIND_MODULE). `session-attended` is admissible only when
 *     `live-classroom` is live — creating the TABLE does not make the kind
 *     admissible; the registry does, exactly as before.
 *   · Every derived value carries `sources` — the event ids behind it.
 *   · No ratio, no percent, no composite, no prediction (P5-R6). Counts stay
 *     countByKind's job; this file never adds events together.
 *
 * PURE: no clock reads, no database, no environment, no react. The sort
 * compares timestamps exactly as derive.ts does (Date.parse + id tie-break).
 *
 * NOT exported from the module barrel, by design: scripts/test-progress.mjs
 * pins the 5.6 export surface, and this file must not widen it. Import as
 * `@/lib/progress/record`.
 */

/** The attend-versus-resume sentence rule (Phase 6 close-out, Q8). The verb
 * is chosen by the RECORD, so the surface never says "resume" to a student
 * who has never attended and never says "attend" to one who has. */
export type AttendanceVerb = "attend" | "resume";

export interface AttendanceState {
  verb: AttendanceVerb;
  /** The `session-attended` event ids behind the verb — empty for "attend". */
  sources: string[];
}

/** Append one fact to a record, purely. Returns the validated union — the
 * appended event appears in `valid` only if it is well-formed; otherwise it
 * is a defect, named, and the record is unchanged by it. The input array is
 * never mutated; order is preserved. */
export function appendEvent(events: readonly ProgressEvent[], event: ProgressEvent): { valid: ProgressEvent[]; defects: { eventId: string; field: string; reason: string }[] } {
  const { valid, defects } = validateEvents([...events, event]);
  return { valid, defects };
}

/** ONE subject's milestone history: valid, admissible, scoped, OLDEST FIRST
 * (the record reads as it happened; ties settle by id, deterministically). */
export function historyForSubject(events: readonly ProgressEvent[], subjectId: SubjectId, liveModules: readonly string[]): ProgressEvent[] {
  const ok = new Set<string>(admissibleKinds(liveModules));
  return validateEvents(events).valid
    .filter((e) => e.subjectId === subjectId && ok.has(e.kind))
    .slice()
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id));
}

/** The attend-versus-resume state for ONE subject. `attend` = no admissible
 * `session-attended` fact exists (or the module is not live, so none CAN —
 * the honest answer while live-classroom is unbuilt); `resume` = at least
 * one, and `sources` names them. This verb assumes the caller already knows
 * a session EXISTS (the sentence attaches to a real session, never to air). */
export function attendanceState(events: readonly ProgressEvent[], subjectId: SubjectId, liveModules: readonly string[]): AttendanceState {
  const attended: ProgressEventKind = "session-attended";
  const sources = historyForSubject(events, subjectId, liveModules)
    .filter((e) => e.kind === attended)
    .map((e) => e.id);
  return sources.length > 0 ? { verb: "resume", sources } : { verb: "attend", sources: [] };
}
