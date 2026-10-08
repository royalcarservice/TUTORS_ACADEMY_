/* ════════════════════════════════════════════════════════════════════════
   THE SOCRATIC CONTRACT — the pedagogical reflection contract
   (Phase 9 · Step 1, DEC-033)

   The engine this contract serves provides BOUNDED SOCRATIC REFLECTION and
   milestone-aware study guidance: conceptual scaffolding and disciplined
   questions. It is NOT an auto-answer bot — nothing here can emit a
   completed working, and the guidance union makes "answer" unrepresentable:
   a guidance is a hint, a question or a reference, never a solution.

   THE PEDAGOGICAL CONTRACT, stated once:
     · scaffolding over answers — the engine holds the concept's scaffold
       and its questions; the working stays the student's own;
     · brevity over bloat — every inquiry and every guidance is capped at
       five hundred characters; a disciplined question serves reflection
       better than a lengthy essay;
     · the record, referenced — when the student's own archive speaks to the
       milestone (their board records, their tutor's session notation), the
       guidance may POINT at it by id; it never re-states the bytes;
     · zero psychological diagnosis, zero sentiment grading — guidance text
       speaks the concept, never the student's mood, traits or worth.

   PURE: no clock reads, no database, no react, no network. The resolver
   (src/lib/socratic/resolver.ts) consumes this contract; the server seam
   that will persist exchanges (a later step) consumes the same shapes.
   ════════════════════════════════════════════════════════════════════════ */

import type { ArtifactRecord } from "@/lib/archive/artifact";
import type { SubjectId } from "@/lib/student/contract";

/** THE BREVITY DISCIPLINE — the brief's limit, held by both halves. */
export const MAX_INQUIRY_CHARS = 500;
export const MAX_GUIDANCE_CHARS = 500;

/** The exchange's closed four classes — the DB's CHECK mirrors this union
 *  (migration 0009) and the test suite pins the two against each other. */
export const SOCRATIC_PROMPT_TYPES = [
  "conceptual_hint",
  "socratic_question",
  "proof_reference",
  "reflection_summary",
] as const;

export type SocraticPromptType = (typeof SOCRATIC_PROMPT_TYPES)[number];

/** THE INQUIRY — what the student brings to one exchange. */
export interface SocraticPrompt {
  /** The subject the reflection belongs to — isolation rides this field. */
  subjectId: SubjectId;
  /** The milestone the inquiry names: `{subjectId}:{concept-slug}`. */
  currentMilestone: string;
  /** The student's own question, before the brevity check. */
  studentInquiry: string;
  /** The student's preserved archive facts for the subject — the engine
   *  may POINT at them, never re-state them. */
  previousArtifacts: readonly ArtifactRecord[];
}

/** The guidance union — hint, question or reference. There is no "answer". */
export const GUIDANCE_KINDS = ["hint", "question", "reference"] as const;
export type GuidanceKind = (typeof GUIDANCE_KINDS)[number];

/** THE GUIDANCE — what the engine returns for one exchange. */
export interface SocraticGuidance {
  guidanceType: GuidanceKind;
  /** Conceptual text only — never a completed working, never a diagnosis.
   *  Bounded by MAX_GUIDANCE_CHARS. */
  responseText: string;
  /** Set when the guidance points at the student's own archive row. */
  referencedArtifactId?: string;
}

/** Persistence seam: the prompt_type a guidance kind lands as.
 *  `reflection_summary` is deliberately UNMAPPED — it is reserved for the
 *  session's closing summary (a later step); no guidance kind emits it. */
export const PROMPT_TYPE_OF_GUIDANCE: Record<GuidanceKind, SocraticPromptType> = {
  hint: "conceptual_hint",
  question: "socratic_question",
  reference: "proof_reference",
};

/** The inquiry after the brevity check: trimmed, or refused with a reason.
 *  Deterministic — the same text yields the same verdict, always. */
export type InquiryCheck =
  | { ok: true; text: string }
  | { ok: false; reason: "empty" | "overlong" };

export function checkInquiry(raw: string): InquiryCheck {
  const text = raw.trim();
  if (text.length === 0) return { ok: false, reason: "empty" };
  if (text.length > MAX_INQUIRY_CHARS) return { ok: false, reason: "overlong" };
  return { ok: true, text };
}

/** A guidance text fits when it says something and stays within the cap. */
export function fitsGuidanceLimit(text: string): boolean {
  return text.length > 0 && text.length <= MAX_GUIDANCE_CHARS;
}
