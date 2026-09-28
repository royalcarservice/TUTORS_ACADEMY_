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

/* ── SECOND SCOPE (5.5 · Part 5): THE ENVIRONMENT ───────────────────────────
 * ONE registry, two scopes. Every capability below lives in the shell (cross-
 * subject, above) AND in the environment (scoped to one subject). The
 * environment scope names WHERE inside /subjects/[id] a student's own region
 * appears, which src/config/modules entry gates it, and what renders today.
 * The rule is the same: no data → nothing. 3.6's honest labels ("System
 * state · not built") stay exactly as they are and are the ONE honest
 * statement for visitor and student alike — a student region never repeats it.
 * Region visibility is decided server-side; a visitor's HTML never carries a
 * student region.
 */
export type EnvironmentRegion = "threshold" | "sessions" | "work" | "library" | "assistance";

export interface EnvironmentSlotDef {
  /** Same id as the shell slot it mirrors — one capability, two places. */
  id: string;
  name: string;
  phase: string;
  /** Where in the environment it appears (reading order below the identity). */
  region: EnvironmentRegion;
  /** src/config/modules id that must be `live` before this slot may render. */
  module: string;
  needs: string;
  today: "nothing (absent)";
}

export const ENVIRONMENT_REGIONS: Record<EnvironmentRegion, { title: string; order: number }> = {
  threshold: { title: "Begin", order: 0 },
  sessions: { title: "Sessions", order: 1 },
  work: { title: "Work", order: 2 },
  library: { title: "Library", order: 3 },
  assistance: { title: "Assistance", order: 4 },
};

export const ENVIRONMENT_SLOTS: readonly EnvironmentSlotDef[] = [
  { id: "todays-sessions", name: "This subject's sessions", phase: "Phase 7", region: "sessions", module: "live-classroom", needs: "scheduled sessions for this student in this subject", today: "nothing (absent)" },
  { id: "upcoming-class", name: "Next class here", phase: "Phase 7", region: "sessions", module: "live-classroom", needs: "the next scheduled session in this subject", today: "nothing (absent)" },
  { id: "tutor-presence", name: "Your tutor here", phase: "Phase 6–7", region: "sessions", module: "tutor-portal", needs: "a tutor–student assignment for this subject", today: "nothing (absent)" },
  { id: "assignments", name: "Work due here", phase: "Phase 8", region: "work", module: "assignments", needs: "assignments in this subject with due dates", today: "nothing (absent)" },
  { id: "progress", name: "Progress here", phase: "5.6 / Phase 9", region: "work", module: "student-portal", needs: "a measured progress language (5.6) with real observations in this subject", today: "nothing (absent)" },
  { id: "recordings", name: "Recordings here", phase: "Phase 8", region: "library", module: "recorded-classes", needs: "recorded sessions in this subject the student attended", today: "nothing (absent)" },
  { id: "resources", name: "Resources here", phase: "Phase 8", region: "library", module: "recorded-classes", needs: "tutor-shared material scoped to this enrolment", today: "nothing (absent)" },
  { id: "ai-assistance", name: "Assistance here", phase: "Phase 9", region: "assistance", module: "ai-assistant", needs: "a real assistant scoped to this subject's material", today: "nothing (absent)" },
] as const;

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
