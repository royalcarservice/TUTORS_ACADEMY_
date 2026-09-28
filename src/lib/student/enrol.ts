import { isOpen } from "@/lib/subjects/door";
import { getSubject } from "@/lib/subjects/subjects";

/**
 * MAY THIS IDENTITY ENROL IN THIS SUBJECT (Phase 5 · Step 5 · Part 1 — P5-R4).
 * --------------------------------------------------------------------------
 * THE ONLY PLACE that decides. It MIRRORS 4.4's door logic by READING it
 * (`isOpen`), never by re-deriving statuses. Used by BOTH the threshold
 * control's visibility (page) AND the entry write's authority (route). If
 * this and a door ever disagree, that is a defect to report, not to patch.
 *
 * Two operations, two rules (P5-R4):
 *   1. CREATING an enrolment — this predicate: student identity + enterable door.
 *   2. ACCESS while enrolled — unconditional; decided by the route's enrolment
 *      check, never here. A student already enrolled is never locked out.
 *
 * Limitation, recorded: subject status lives in TypeScript config, so RLS
 * cannot enforce enterability — it enforces OWNERSHIP (the security boundary).
 * A caller with their own valid JWT could insert a draft enrolment via REST;
 * the failure mode is benign (an honest environment with a draft label).
 * Revisit when tutor-assigned enrolment arrives (P6/P7).
 */
export function mayEnrol(identity: { role: string } | null | undefined, subjectId: string): boolean {
  if (!identity || identity.role !== "student") return false;
  const s = getSubject(subjectId);
  return !!s && isOpen(s);
}

/** The entry endpoint for a subject — a POST target, never fetched by GET. Both the shell's action and the threshold post here. */
export const entryAction = (subjectId: string) => `/subjects/${subjectId}/enter`;
