/* ════════════════════════════════════════════════════════════════════════
   THE LENS'S LEXICON — the card's closed words, pure (Phase 9 · Step 2,
   DEC-034)

   The guidance card's TYPE BADGES, the citation's sentence and the
   deterministic date words, kept in the lib so the surface renders them
   and the offline suite proves them — one vocabulary, no drift.
   PURE: no clock reads, no react.
   ════════════════════════════════════════════════════════════════════════ */

import type { GuidanceKind } from "./contract";

/** The badge's closed three, verbatim (the brief's pin). */
export const GUIDANCE_BADGE: Record<GuidanceKind, string> = {
  question: "Guiding Question",
  hint: "Conceptual Hint",
  reference: "Proof Reference",
};

/** The citation's sentence — the archive's own word, the record's own date. */
export function artifactLinkText(word: string, dateWord: string): string {
  return `Review ${word} from session on ${dateWord}`;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

/** An ISO date (YYYY-MM-DD…) in words, deterministically — no clock read. */
export function dateWordOf(iso: string): string {
  const day = iso.slice(0, 10).split("-");
  if (day.length !== 3) return iso.slice(0, 10);
  const month = MONTHS[Number(day[1]) - 1];
  if (!month) return iso.slice(0, 10);
  return `${Number(day[2])} ${month} ${day[0]}`;
}
