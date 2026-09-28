/* DEV-ONLY FIXTURES for /dev/next-action and scripts/test-next-action.mjs.
 * Nothing here is imported by a production route; the dev route 404s in
 * production. Every future-tier candidate below is a FIXTURE for a capability
 * that does not exist — the resolver's verdict on each is the point.        */

import type { Candidate, CandidateProvider, ProviderInput } from "@/lib/next-action";
import type { Enrolment, EnvironmentState, SubjectId } from "@/lib/student/contract";
import { SUBJECTS } from "@/lib/subjects/subjects";

export const NOW = "2026-09-28T09:00:00.000Z";
const D = (daysAgo: number, minutes = 0) => new Date(Date.parse(NOW) - daysAgo * 86_400_000 + minutes * 60_000).toISOString();
const M = (minutesFromNow: number) => new Date(Date.parse(NOW) + minutesFromNow * 60_000).toISOString();

export function input(enrolments: Enrolment[], states: EnvironmentState[], now = NOW): ProviderInput {
  return {
    enrolments,
    environmentStates: states,
    subjects: SUBJECTS.map((s) => ({ id: s.id as SubjectId, name: s.name, environmentName: s.tagline.split(" — ")[0].trim() })),
    now,
    hrefs: { subject: (id) => `/subjects/${id}`, choose: "/subjects" },
  };
}

const enr = (subjectId: SubjectId, daysAgo: number, min = 0): Enrolment => ({ subjectId, status: "active", enrolledAt: D(daysAgo, min) });
const ent = (subjectId: SubjectId, lastDaysAgo: number, count = 1, firstDaysAgo = lastDaysAgo + 3): EnvironmentState =>
  ({ subjectId, firstEnteredAt: D(firstDaysAgo), lastEnteredAt: D(lastDaysAgo), entryCount: count, position: null });

/* ── the state matrix ──────────────────────────────────────────────────── */
export const MATRIX: { id: string; label: string; input: ProviderInput; expect: string }[] = [
  { id: "none", label: "signed-in · no enrolment", input: input([], []), expect: "origin:choose" },
  { id: "one-never", label: "one enrolment · never entered", input: input([enr("physics", 1)], []), expect: "enrolment:physics:begin" },
  { id: "one-entered", label: "one enrolment · entered yesterday", input: input([enr("physics", 9)], [ent("physics", 1, 3)]), expect: "enrolment:physics:resume" },
  {
    id: "four-mixed", label: "four enrolments · two entered, two never (never-entered chemistry enrolled EARLIEST)",
    input: input([enr("chemistry", 30), enr("physics", 20), enr("mathematics", 19), enr("biology", 2)], [ent("physics", 5, 4), ent("mathematics", 2, 1)]),
    expect: "enrolment:mathematics:resume",
  },
  {
    id: "four-entered", label: "four enrolments · all entered (biology most recent)",
    input: input([enr("physics", 20), enr("mathematics", 20, 1), enr("chemistry", 20, 2), enr("biology", 20, 3)], [ent("physics", 6), ent("mathematics", 3), ent("chemistry", 1), ent("biology", 0)]),
    expect: "enrolment:biology:resume",
  },
  { id: "draft", label: "one enrolment whose subject config is draft (history), never entered", input: input([enr("history", 3)], []), expect: "enrolment:history:begin" },
  { id: "tie", label: "two never-entered · identical enrolledAt (tie → config order: mathematics before physics)", input: input([enr("physics", 4), enr("mathematics", 4)], []), expect: "enrolment:mathematics:begin" },
  { id: "null-time", label: "entered row with last_entered_at null (schema forbids; handled)", input: input([enr("physics", 9)], [{ subjectId: "physics", firstEnteredAt: D(8), lastEnteredAt: null as unknown as string, entryCount: 1, position: null }]), expect: "enrolment:physics:resume" },
];

/* ── future fixtures: candidates no shipped provider can emit ──────────── */
const base = { capability: "live-classroom", subjectId: "physics", title: "Physics — The Field", cta: "Join the class", href: "/subjects/physics" } as const;
export const FUTURE: { id: string; label: string; candidate: Candidate; expectAccepted: boolean }[] = [
  { id: "t1-live", label: "Tier 1 · class in its window · expiresAt in 40 min (needs live-classroom = live)", expectAccepted: false,
    candidate: { ...base, id: "class:physics:join", source: "class", tier: 1, kind: "join", eyebrow: "Class now", expiresAt: M(40) } },
  { id: "t1-no-expiry", label: "Tier 1 · NO expiresAt → rejected, not demoted", expectAccepted: false,
    candidate: { ...base, id: "class:physics:join-noexp", source: "class", tier: 1, kind: "join", eyebrow: "Class now" } },
  { id: "t1-expired", label: "Tier 1 · EXPIRED (class ended 10 min ago)", expectAccepted: false,
    candidate: { ...base, id: "class:physics:join-expired", source: "class", tier: 1, kind: "join", eyebrow: "Class now", expiresAt: M(-10) } },
  { id: "t2", label: "Tier 2 · recording just finished · at = 30 min ago (needs recorded-classes = live)", expectAccepted: false,
    candidate: { ...base, id: "recording:physics:attend", source: "recording", capability: "recorded-classes", tier: 2, kind: "attend", eyebrow: "Just finished", cta: "Watch the recording", at: M(-30) } },
  { id: "t3", label: "Tier 3 · resume physics (real shape; capability public-website = live)", expectAccepted: true,
    candidate: { ...base, id: "enrolment:physics:resume", source: "enrolment", capability: "public-website", tier: 3, kind: "resume", eyebrow: "Last opened yesterday", detail: "You were last here yesterday.", cta: "Open Physics", lastEnteredAt: D(1) } },
  { id: "dangling", label: "Tier 3 · href /subjects/chemistry — student is NOT enrolled in chemistry", expectAccepted: false,
    candidate: { ...base, id: "enrolment:chemistry:resume", source: "enrolment", capability: "public-website", subjectId: "chemistry", title: "Chemistry — The Bonds", cta: "Open Chemistry", href: "/subjects/chemistry", tier: 3, kind: "resume", eyebrow: "Last opened", lastEnteredAt: D(2) } },
  { id: "not-built", label: "Tier 2 · assignment due tomorrow — capability assignments is planned, not live", expectAccepted: false,
    candidate: { ...base, id: "assignment:physics:attend", source: "assignment", capability: "assignments", tier: 2, kind: "attend", eyebrow: "Due tomorrow", cta: "Open the assignment", at: M(24 * 60) } },
  { id: "bad-date", label: "Tier 1 · malformed expiresAt", expectAccepted: false,
    candidate: { ...base, id: "class:physics:join-baddate", source: "class", tier: 1, kind: "join", eyebrow: "Class now", expiresAt: "tomorrow-ish" } },
];

/** The student the FUTURE fixtures are judged for: enrolled in physics, entered yesterday. */
export const FUTURE_INPUT = input([enr("physics", 9)], [ent("physics", 1, 3)]);

/** Same fixtures with every capability pretended live — proves the tier ORDER itself (Test 8). */
export function pretendLive<T extends object>(state: T): T & { liveCapabilities: readonly string[] } {
  return { ...state, liveCapabilities: ["public-website", "live-classroom", "recorded-classes", "assignments"] };
}

/* ── deliberate breakage (4.9's method) ────────────────────────────────── */
export const throwingProvider: CandidateProvider = { id: "broken-throws", capability: "public-website", phase: "fixture", provide: () => { throw new Error("provider exploded"); } };
export const danglingProvider: CandidateProvider = {
  id: "broken-404", capability: "public-website", phase: "fixture",
  provide: (i) => [{ id: "broken:404", source: "enrolment", tier: 3, kind: "resume", capability: "public-website", subjectId: "physics", eyebrow: "Last opened", title: "Physics — The Field", cta: "Open Physics", href: "/subjects/does-not-exist", lastEnteredAt: i.now }],
};
export const malformedDateProvider: CandidateProvider = {
  id: "broken-date", capability: "public-website", phase: "fixture",
  provide: () => [{ id: "broken:date", source: "enrolment", tier: 3, kind: "resume", capability: "public-website", subjectId: "physics", eyebrow: "Last opened", title: "Physics — The Field", cta: "Open Physics", href: "/subjects/physics", lastEnteredAt: "31/02/2026" }],
};
