/* ════════════════════════════════════════════════════════════════════════
   THE OVERSIGHT'S PURE HALF — grouping and time words (Phase 9 · Step 3,
   DEC-035)

   The tutor's diagnostic mirror reads a student's inquiries grouped by the
   milestone they name. This module is the PURE half of that read: the
   grouping, the ordering and the deterministic time words — provable
   offline, exactly as the resolver's. The DB read lives in
   src/lib/socratic/data.ts; it hands rows over and this module composes.

   THE MIRROR'S DISCIPLINE: nothing here evaluates. A row carries the
   inquiry as asked, the milestone it names and the instant it stood —
   never a rating, a difficulty flag, a comprehension figure or a word
   about the student. Preparation, not judgment.
   ════════════════════════════════════════════════════════════════════════ */

/** How many of the student's own inquiries the oversight reads, newest first. */
export const TUTOR_OVERVIEW_LIMIT = 12;

/** One inquiry as the oversight reads it. */
export interface TutorInquiry {
  id: string;
  milestoneKey: string;
  queryText: string;
  createdAt: string;
}

/** The inquiries of one milestone, newest first (the read's own order). */
export interface InquiryGroup {
  milestoneKey: string;
  /** The concept's path in the subject — the resolver's word, or the key. */
  path: string;
  inquiries: readonly TutorInquiry[];
}

/**
 * Group inquiries by milestone key, preserving the read's ordering:
 * groups stand by their newest inquiry, newest group first; inquiries keep
 * their order within the group. Deterministic — the same rows yield the
 * same groups, byte for byte.
 */
export function groupInquiries(
  rows: readonly TutorInquiry[],
  pathOf: (milestoneKey: string) => string,
): InquiryGroup[] {
  const groups: InquiryGroup[] = [];
  const byKey = new Map<string, InquiryGroup>();
  for (const row of rows) {
    let group = byKey.get(row.milestoneKey);
    if (!group) {
      group = { milestoneKey: row.milestoneKey, path: pathOf(row.milestoneKey), inquiries: [] };
      byKey.set(row.milestoneKey, group);
      groups.push(group);
    }
    (group.inquiries as TutorInquiry[]).push(row);
  }
  return groups;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

/**
 * The reflection's instant in words — date and time, deterministically
 * derived from the stored ISO instant (UTC), no clock read:
 * "24 September 2026 · 12:00 UTC".
 */
export function timeWordOf(iso: string): string {
  const date = iso.slice(0, 10).split("-");
  const time = iso.slice(11, 16);
  if (date.length !== 3 || time.length !== 5) return iso;
  const month = MONTHS[Number(date[1]) - 1];
  if (!month) return iso;
  return `${Number(date[2])} ${month} ${date[0]} · ${time} UTC`;
}
