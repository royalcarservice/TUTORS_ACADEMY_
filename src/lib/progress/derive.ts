import { ARC_STEPS, type ArcStepId } from "@/config/arc";
import { whenPhrase } from "@/lib/next-action/when";
import type { SubjectId } from "@/lib/student/contract";

import { EVENT_KIND_MODULE, EVENT_KINDS, type EnvironmentFacts, type ProgressEvent, type ProgressEventKind } from "./events";

/* THE COMPUTATION MODULE (Phase 5 · Step 6 · Part 3) — built to 5.4's standard.
 *
 * PURE: no clock, no database, no environment. Input: events, an environment,
 * the live module ids, and (where a phrase needs it) a caller-supplied now.
 * Output: COUNTS AND RECENCY ONLY — and a position on the arc.
 *
 * WHAT IS NOT HERE, BY CONSTRUCTION (P5-R6):
 *   · no function returns a ratio, percentage, rate, score, level or streak;
 *   · no function combines kinds into one figure (no composite);
 *   · no function looks forward (no pace, no forecast, no "on track");
 *   · no function compares to anyone;
 *   · no function ever emits a ZERO — a kind with no events is simply absent
 *     from the output. An empty record means "nothing recorded", not "nothing
 *     done", and the surface says nothing where the record says nothing.
 *
 * TRACEABLE: every value carries `sources` — the event ids (or the fact ids)
 * behind it. `count === sources.length` is an invariant, tested. A caller can
 * always name the rows behind any figure it displays.
 *
 * MALFORMED IS NOT MISSING: an unparseable timestamp or an unknown kind is a
 * DEFECT (returned in `defects`, excluded from every derivation), never a
 * state rendered around. A missing optional fact (no environment_state row)
 * is a STATE: the step it would evidence stays "ahead".
 */

export interface Defect {
  eventId: string;
  field: "at" | "kind" | "subjectId" | "refId" | "id";
  reason: string;
}

export interface Validated {
  valid: ProgressEvent[];
  defects: Defect[];
}

const isIso = (v: unknown): v is string => typeof v === "string" && v.length > 0 && !Number.isNaN(Date.parse(v));

/** Separate well-formed events from defects. Nothing is repaired or defaulted. */
export function validateEvents(events: readonly ProgressEvent[]): Validated {
  const valid: ProgressEvent[] = [];
  const defects: Defect[] = [];
  for (const e of events) {
    if (typeof e.id !== "string" || e.id.length === 0) { defects.push({ eventId: String(e.id), field: "id", reason: "missing id" }); continue; }
    if (!(e.kind in EVENT_KIND_MODULE)) { defects.push({ eventId: e.id, field: "kind", reason: `unknown kind ${String(e.kind)}` }); continue; }
    if (typeof e.subjectId !== "string" || e.subjectId.length === 0) { defects.push({ eventId: e.id, field: "subjectId", reason: "missing subject" }); continue; }
    if (typeof e.refId !== "string" || e.refId.length === 0) { defects.push({ eventId: e.id, field: "refId", reason: "event refers to nothing" }); continue; }
    if (!isIso(e.at)) { defects.push({ eventId: e.id, field: "at", reason: `malformed timestamp ${JSON.stringify(e.at)}` }); continue; }
    valid.push(e);
  }
  return { valid, defects };
}

/** Kinds whose referent object exists today — i.e. whose module is live. Empty until Phase 7. */
export function admissibleKinds(liveModules: readonly string[]): ProgressEventKind[] {
  return EVENT_KINDS.filter((k) => liveModules.includes(EVENT_KIND_MODULE[k]));
}

/** A count is a POINTER to rows. Never zero: a kind with no rows is absent from the list. */
export interface Count {
  kind: ProgressEventKind;
  count: number;
  /** The event ids behind the number — count === sources.length, always. */
  sources: string[];
}

function scoped(events: readonly ProgressEvent[], subjectId: SubjectId, liveModules: readonly string[]): ProgressEvent[] {
  const ok = new Set(admissibleKinds(liveModules));
  return validateEvents(events).valid.filter((e) => e.subjectId === subjectId && ok.has(e.kind));
}

/**
 * Counts per kind for ONE environment, admissible kinds only, ≥1 each.
 * Kinds are listed separately and are never added together.
 */
export function countByKind(events: readonly ProgressEvent[], subjectId: SubjectId, liveModules: readonly string[]): Count[] {
  const out: Count[] = [];
  for (const kind of admissibleKinds(liveModules)) {
    const sources = scoped(events, subjectId, liveModules).filter((e) => e.kind === kind).map((e) => e.id).sort();
    if (sources.length > 0) out.push({ kind, count: sources.length, sources });
  }
  return out;
}

/** Backward-looking recency: the most recent event in this environment, with the row behind it. */
export interface Recency {
  kind: ProgressEventKind;
  at: string;
  /** whenPhrase of `at` against the caller's now; null when the phrase has nothing to say. */
  when: string | null;
  sources: [string];
}

export function latestEvent(events: readonly ProgressEvent[], subjectId: SubjectId, liveModules: readonly string[], nowIso: string): Recency | null {
  const rows = scoped(events, subjectId, liveModules).slice().sort((a, b) => Date.parse(b.at) - Date.parse(a.at) || a.id.localeCompare(b.id));
  const top = rows[0];
  if (!top) return null;
  return { kind: top.kind, at: top.at, when: whenPhrase(top.at, nowIso), sources: [top.id] };
}

/* ── THE ARC — the one visible thing ─────────────────────────────────────── */

export type ArcState = "done" | "ahead";

export interface ArcPositionStep {
  id: ArcStepId;
  label: string;
  state: ArcState;
  /** What makes it "done": fact ids (`account`, `enrolment:<subject>`, `entry:<subject>`) or event ids. Empty when ahead. */
  sources: string[];
}

export interface ArcPosition {
  subjectId: SubjectId;
  steps: ArcPositionStep[];
  /** True when no admissible event exists for this environment — the surface then states the honest boundary. */
  recordEmpty: boolean;
  defects: Defect[];
}

/**
 * Which evidence may mark a later step done. A step gains texture ONLY from
 * real events of an ADMISSIBLE kind (registry-gated AND event-gated). Steps
 * with no evidence rule stay "ahead" until a later phase defines one — they
 * are not "locked" and not "incomplete"; they are ahead.
 */
export const STEP_EVIDENCE: Readonly<Partial<Record<ArcStepId, readonly ProgressEventKind[]>>> = {
  learn: ["session-attended", "recording-watched"],
  progress: ["session-attended", "recording-watched", "work-submitted"],
  // interact: a tutor–student relationship is not an event kind (P6 decides). Ahead.
  // master: no evidence rule exists and none is invented. Ahead.
};

/**
 * The student's position on the same seven steps the homepage shows.
 * discover ← an account exists · choose ← enrolled · enter ← entered.
 * Later steps ← admissible events only. Absent facts → ahead, never defaulted.
 */
export function arcPosition(facts: EnvironmentFacts, events: readonly ProgressEvent[], liveModules: readonly string[]): ArcPosition {
  const { valid, defects } = validateEvents(events);
  const ok = new Set(admissibleKinds(liveModules));
  const mine = valid.filter((e) => e.subjectId === facts.subjectId && ok.has(e.kind));
  // MISSING (null) → not entered, a state. PRESENT but unparseable → a defect, reported, and not entered.
  const entered = facts.firstEnteredAt !== null && isIso(facts.firstEnteredAt);
  const allDefects = facts.firstEnteredAt !== null && !isIso(facts.firstEnteredAt)
    ? [...defects, { eventId: `entry:${facts.subjectId}`, field: "at" as const, reason: `malformed first_entered_at ${JSON.stringify(facts.firstEnteredAt)}` }]
    : defects;
  const steps: ArcPositionStep[] = ARC_STEPS.map((s) => {
    let sources: string[] = [];
    if (s.id === "discover" && facts.hasAccount) sources = ["account"];
    else if (s.id === "choose" && facts.enrolled) sources = [`enrolment:${facts.subjectId}`];
    else if (s.id === "enter" && entered) sources = [`entry:${facts.subjectId}`];
    else {
      const kinds = STEP_EVIDENCE[s.id];
      if (kinds) sources = mine.filter((e) => kinds.includes(e.kind)).map((e) => e.id).sort();
    }
    return { id: s.id, label: s.label, state: sources.length > 0 ? "done" : "ahead", sources };
  });
  return { subjectId: facts.subjectId, steps, recordEmpty: mine.length === 0, defects: allDefects };
}
