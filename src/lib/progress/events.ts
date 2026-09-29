import type { SubjectId } from "@/lib/student/contract";

/* THE EVENT MODEL (Phase 5 · Step 6 · Part 2 — P5-R6 "progress is a record,
 * not a score").
 *
 * A progress event is A FACT ABOUT A REAL OBJECT and nothing else:
 *   who (the student — bounded by RLS, never carried in this shape),
 *   which environment (the subject's immutable id),
 *   what kind of event (a small CLOSED set),
 *   when it happened (a real timestamp),
 *   what it refers to (the real row's id).
 * No score. No duration. No "engagement". Nothing inferred. NEVER a summary.
 *
 * TODAY THERE IS NO TABLE BEHIND THIS TYPE. 5.1 shipped profiles, enrolments
 * and environment_state only; `progress_record` was never created. That is a
 * 5.1 AMENDMENT, reported in PHASE5_STEP6_PROGRESS_LANGUAGE_REPORT.md with the
 * proposed DDL — NOT applied here (no schema change in 5.6). Until it exists,
 * every production caller passes `[]`: absence of record, never inferred
 * activity (P5-R4 Addendum 1 — "no backfill, no defaults, no assume 0").
 *
 * A KIND MAY ONLY EXIST IF THE OBJECT IT REFERS TO EXISTS. Each kind names
 * the src/config/modules entry that owns its referent; a kind is ADMISSIBLE
 * only while that module is `live`. None is live today, so the admissible set
 * is empty — and that is the correct, complete answer.
 *
 * THIS IS A RECORD OF LEARNING EVENTS, NOT OF BEHAVIOUR. No page view, click,
 * session length, device, IP or location may ever become a kind.
 */

export type ProgressEventKind =
  | "session-attended"   // Phase 7 · live-classroom · refers to a session row
  | "recording-watched"  // Phase 8 · recorded-classes · refers to a recording row
  | "work-submitted";    // Phase 8 · assignments · refers to a submission row

/** kind → the registry module whose referent object must exist. */
export const EVENT_KIND_MODULE: Readonly<Record<ProgressEventKind, string>> = {
  "session-attended": "live-classroom",
  "recording-watched": "recorded-classes",
  "work-submitted": "assignments",
};

export const EVENT_KINDS = Object.keys(EVENT_KIND_MODULE) as ProgressEventKind[];

export interface ProgressEvent {
  /** The event row's own id — what every derived value points back to. */
  id: string;
  subjectId: SubjectId;
  kind: ProgressEventKind;
  /** ISO 8601. A PRESENT but unparseable value is MALFORMED (a defect), not missing. */
  at: string;
  /** The real object's id (session / recording / submission). */
  refId: string;
}

/** Facts the arc reads that are NOT progress events — they already exist (5.1/5.5). */
export interface EnvironmentFacts {
  subjectId: SubjectId;
  /** An identity exists (the student found the product). */
  hasAccount: boolean;
  /** An active enrolment in this subject. */
  enrolled: boolean;
  /** first_entered_at from environment_state, or null when there is no row. MISSING is a state. */
  firstEnteredAt: string | null;
}
