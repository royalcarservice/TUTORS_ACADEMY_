import type { ResolvedSlot } from "@/components/student/slots";
import type { StudentShellProps } from "@/components/student/student-shell";
import { STUDENT_SLOTS } from "@/config/student-slots";
import { nextActionFor } from "@/lib/next-action";
import { deriveShellState, type Enrolment, type EnvironmentState } from "@/lib/student/contract";
import { providerInputFor } from "@/lib/student/data";
import { shellSubjectInfo } from "@/lib/student/subject-info";

/* DEV-ONLY FIXTURES for /dev/student-shell. These never reach production:
 * the route 404s there and nothing under src/app/dev is imported elsewhere.
 * Slot fixtures exist ONLY to prove the composition holds with content; each
 * is labelled "specimen" in its own text.                                   */

export const NOW = "2026-09-28T09:00:00.000Z";
export const SPECIMEN_NAME = "Specimen student";

const D = (daysAgo: number, minutes = 0) => new Date(Date.parse(NOW) - daysAgo * 86_400_000 + minutes * 60_000).toISOString();

const FIX: Record<"A" | "B" | "C", { enrolments: Enrolment[]; states: EnvironmentState[] }> = {
  A: { enrolments: [], states: [] },
  B: { enrolments: [{ subjectId: "physics", status: "active", enrolledAt: D(1) }, { subjectId: "mathematics", status: "active", enrolledAt: D(1, 1) }], states: [] },
  C: {
    enrolments: [{ subjectId: "physics", status: "active", enrolledAt: D(9) }, { subjectId: "mathematics", status: "active", enrolledAt: D(9, 1) }],
    states: [{ subjectId: "physics", firstEnteredAt: D(8), lastEnteredAt: D(1), entryCount: 3, position: null }],
  },
};

export type SlotExtreme = "none" | "some" | "all";
const SOME = new Set(["todays-sessions", "tutor-presence", "progress"]);

const LINE: React.CSSProperties = { margin: 0, fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", padding: "var(--ta-space-3)", border: "1px dashed var(--ta-border-strong)", borderRadius: "var(--ta-radius-2)" };

export function fixtureSlots(extreme: SlotExtreme): ResolvedSlot[] {
  if (extreme === "none") return [];
  return STUDENT_SLOTS.filter((s) => extreme === "all" || SOME.has(s.id)).map((s) => ({
    id: s.id,
    region: s.region,
    element: <p style={LINE}>Specimen content for “{s.name}” ({s.phase}) — fixture, not data.</p>,
  }));
}

export function fixtureProps(state: "A" | "B" | "C", extreme: SlotExtreme = "none"): StudentShellProps {
  const f = FIX[state];
  const shell = deriveShellState(f.enrolments, f.states);
  return {
    state: shell,
    candidate: nextActionFor(providerInputFor(f.enrolments, f.states, NOW)).action,
    enrolments: f.enrolments,
    environmentStates: f.states,
    subjects: shellSubjectInfo(),
    slots: fixtureSlots(extreme),
    now: NOW,
  };
}

/* Part 4 — the written list; the sweep in audit/shell.cjs verifies it. */
export const NEVER_CONTAINS = [
  "Statistic cards, metric grids, “your numbers”",
  "Streaks, XP, levels, badges, leaderboards, points",
  "Notification bell, unread count, message icon",
  "“Recommended for you” (no recommendation engine exists)",
  "Tutorials that don’t exist, progress that isn’t measured",
  "Invented activity: “keep it up”, “you’re doing great”, fabricated momentum",
  "Skeleton loaders, shimmer, “loading” on empty states",
  "Empty-state illustrations of people or scenes",
  "CTAs beyond the single primary (no “explore”/“browse” that leads nowhere)",
  "A welcome header, greeting banner or hero",
  "Search, and any disabled or “coming soon” nav item",
];
