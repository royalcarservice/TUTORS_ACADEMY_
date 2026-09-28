/**
 * STUDENT SHELL — SLOT MAP (Phase 5 · Step 3 · Decision 3 / Part 5)
 * --------------------------------------------------------------------------
 * Where every future student capability LIVES in the shell composition, fixed
 * now so Phases 6–9 add content without restructuring. This file is the
 * written map; `src/components/student/slots.tsx` is the FILL POINT.
 *
 * THE RULE: a slot with no data renders NOTHING — not an empty container, not
 * a heading, not a placeholder. The shell iterates the regions; a region whose
 * slots all resolved to null is omitted from the DOM entirely.
 *
 * REGIONS, in reading order (all below the primary surface, which is never a
 * slot — 5.4 changes WHAT the primary says, not WHERE it is):
 *   today     — time-bound things: what is happening or due today
 *   subjects  — the enrolled environments (real today; row slots hang here)
 *   library   — durable material: recordings, resources
 *   reflection— measured, past-tense things: progress
 *   tools     — assistance that is not tied to one moment
 */

export type StudentSlotRegion = "today" | "subjects" | "library" | "reflection" | "tools";
export type StudentSlotPosition = "region" | "row";

export interface StudentSlotDef {
  /** Stable id — the registry keys on this. */
  id: string;
  name: string;
  /** Phase that adds it (owner's roadmap; not a promise on the page). */
  phase: string;
  region: StudentSlotRegion;
  /** `region` = a block inside the region; `row` = hangs on each subject row. */
  position: StudentSlotPosition;
  /** What real data it needs before it may render anything. */
  needs: string;
  /** What renders today. Always the same answer. */
  today: "nothing (absent)";
  /** Composition note: fit, or a restructuring risk reported now. */
  fit: string;
}

export const STUDENT_SLOT_REGIONS: Record<StudentSlotRegion, { title: string; order: number }> = {
  today: { title: "Today", order: 1 },
  subjects: { title: "Your subjects", order: 2 },
  library: { title: "Library", order: 3 },
  reflection: { title: "Progress", order: 4 },
  tools: { title: "Tools", order: 5 },
};

export const STUDENT_SLOTS: readonly StudentSlotDef[] = [
  { id: "todays-sessions", name: "Today's sessions", phase: "Phase 7", region: "today", position: "region",
    needs: "a sessions table with real scheduled rows for this student, in their timezone", today: "nothing (absent)",
    fit: "Fits. Rung 1–2 of the priority order also moves INTO the primary surface when a class is live/imminent (5.4); this slot lists the rest of the day." },
  { id: "upcoming-class", name: "Upcoming class", phase: "Phase 7", region: "today", position: "region",
    needs: "next scheduled session beyond today", today: "nothing (absent)",
    fit: "Fits as one quiet line under Today's sessions." },
  { id: "assignments", name: "Assignments due", phase: "Phase 8", region: "today", position: "region",
    needs: "assignments with due dates and submission state", today: "nothing (absent)",
    fit: "Fits. Rung 3 (work due) can also take the primary surface (5.4)." },
  { id: "tutor-presence", name: "Your tutor", phase: "Phase 6–7", region: "subjects", position: "row",
    needs: "a tutor–student assignment per subject (Phase 6 roster policies)", today: "nothing (absent)",
    fit: "Fits inside each subject row as a second text line; never a card, never an avatar grid." },
  { id: "recordings", name: "Recordings", phase: "Phase 8", region: "library", position: "region",
    needs: "recorded sessions this student attended or was assigned", today: "nothing (absent)",
    fit: "Fits as rows, most recent first, capped; full list lives on its own route when Phase 8 adds the nav item." },
  { id: "resources", name: "Resources", phase: "Phase 8", region: "library", position: "region",
    needs: "tutor-shared files/links scoped to an enrolment", today: "nothing (absent)",
    fit: "Fits as rows beside recordings." },
  { id: "progress", name: "Progress", phase: "5.6 / Phase 9", region: "reflection", position: "region",
    needs: "a measured progress language (5.6) with real observations — never a bar over nothing", today: "nothing (absent)",
    fit: "Fits as PROSE (5.6 decides the language). A metric grid does not fit and will not be admitted." },
  { id: "achievements", name: "Achievements", phase: "Phase 9", region: "reflection", position: "region",
    needs: "an owner decision that milestones exist as text records", today: "nothing (absent)",
    fit: "DOES NOT FIT AS BADGES/POINTS/STREAKS — those are on the never-contains list. If Phase 9 wants milestones, they render as dated sentences in Progress, or the decision is revisited then." },
  { id: "ai-assistance", name: "AI assistance", phase: "Phase 9", region: "tools", position: "region",
    needs: "a real assistant scoped to the student's own material", today: "nothing (absent)",
    fit: "Fits as ONE quiet entry row (a link to its own surface). A floating chat widget over the shell does NOT fit and will not be admitted." },
] as const;

export const slotsForRegion = (region: StudentSlotRegion, position: StudentSlotPosition = "region") =>
  STUDENT_SLOTS.filter((s) => s.region === region && s.position === position);
