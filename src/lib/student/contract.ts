/**
 * STUDENT SHELL CONTRACT (Phase 5 · Step 1). Pure types + pure derivations.
 * No React, no Supabase — testable in plain Node. 5.3 renders from this and
 * only this; 5.4 (next-action engine) extends `NextAction`, never the states.
 *
 * MOMENTUM PRINCIPLE: the shell answers WHAT NOW with one dominant surface.
 * Everything else is subordinate. The answer is derived from what is TRUE in
 * the data — never from what we wish were true.
 */

export type SubjectId = "mathematics" | "physics" | "chemistry" | "biology" | "english" | "history";

export interface Enrolment {
  subjectId: SubjectId;
  status: "active" | "withdrawn";
  enrolledAt: string; // ISO
}

/** Mirrors public.environment_state. `position` is null until Phase 7+ gives it meaning. */
export interface EnvironmentState {
  subjectId: SubjectId;
  firstEnteredAt: string;
  lastEnteredAt: string;
  entryCount: number;
  position: null | Record<string, unknown>;
}

/** The three null states — all first-class (5.3 Decision 4). */
export type ShellState =
  | { kind: "A-no-enrolment" }
  | { kind: "B-enrolled-never-entered"; subjects: SubjectId[]; first: SubjectId }
  | { kind: "C-enrolled-active"; subjects: SubjectId[]; latest: EnvironmentState };

/**
 * NEXT-ACTION PRIORITY ORDER (5.1). Higher wins. Implemented by the engine in
 * src/lib/next-action (5.4): rungs 1–2 → Tier 1, rung 3 → Tier 2, rungs 4–5 →
 * Tier 3 (entered beats never-entered), rung 6 → Tier 4. `deriveNextAction`
 * below is retained as the BENIGN FALLBACK shape only; the surface renders
 * the engine's Candidate.
 *   1. (Phase 7) a class happening now            — not built
 *   2. (Phase 7) a class starting within the hour — not built
 *   3. (Phase 8) work due                          — not built
 *   4. RESUME: open the environment last entered   — real (state C)
 *   5. BEGIN: first session in a chosen environment — real (state B)
 *   6. CHOOSE: go to the six doors                 — real (state A)
 */
export type NextAction =
  | { rung: 4; kind: "resume"; subjectId: SubjectId; lastEnteredAt: string; position: null | Record<string, unknown> }
  | { rung: 5; kind: "begin"; subjectId: SubjectId }
  | { rung: 6; kind: "choose" };

export function deriveShellState(enrolments: Enrolment[], states: EnvironmentState[]): ShellState {
  const active = enrolments.filter((e) => e.status === "active");
  if (active.length === 0) return { kind: "A-no-enrolment" };
  const subjects = active.map((e) => e.subjectId);
  const entered = states.filter((s) => subjects.includes(s.subjectId));
  if (entered.length === 0) {
    // B: the earliest enrolment is "first" — the choice the student made first.
    const first = [...active].sort((a, b) => a.enrolledAt.localeCompare(b.enrolledAt))[0].subjectId;
    return { kind: "B-enrolled-never-entered", subjects, first };
  }
  const latest = [...entered].sort((a, b) => b.lastEnteredAt.localeCompare(a.lastEnteredAt))[0];
  return { kind: "C-enrolled-active", subjects, latest };
}

export function deriveNextAction(state: ShellState): NextAction {
  switch (state.kind) {
    case "C-enrolled-active":
      return { rung: 4, kind: "resume", subjectId: state.latest.subjectId, lastEnteredAt: state.latest.lastEnteredAt, position: state.latest.position };
    case "B-enrolled-never-entered":
      return { rung: 5, kind: "begin", subjectId: state.first };
    case "A-no-enrolment":
      return { rung: 6, kind: "choose" };
  }
}

/**
 * RESUME HONESTY RULE (5.3 Decision 5), stated once, here:
 * the resume surface renders ONLY populated fields. With position === null it
 * may say WHICH environment and WHEN the student was last there. It may never
 * name a chapter, lesson, page or progress that the row does not hold.
 */
export function resumeFacts(a: Extract<NextAction, { kind: "resume" }>): { subjectId: SubjectId; lastEnteredAt: string; position: Record<string, unknown> | null } {
  return { subjectId: a.subjectId, lastEnteredAt: a.lastEnteredAt, position: a.position };
}
