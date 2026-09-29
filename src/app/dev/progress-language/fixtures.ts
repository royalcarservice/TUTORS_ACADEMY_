import type { EnvironmentFacts, ProgressEvent } from "@/lib/progress";

/* FIXTURES for /dev/progress-language and scripts/test-progress.mjs ONLY.
 * Nothing here is imported by a production route. Every event below is
 * INVENTED — no such rows exist anywhere; there is not even a table for them. */

export const NOW = "2026-09-28T09:00:00Z";

/** The registry as it stands: only public-website is live → no admissible kind. */
export const LIVE_TODAY = ["public-website"] as const;
/** A pretend future registry, used ONLY to show how texture would arrive. */
export const LIVE_PRETEND = ["public-website", "live-classroom", "recorded-classes", "assignments"] as const;

const ev = (id: string, kind: ProgressEvent["kind"], daysAgo: number, refId: string, subjectId: ProgressEvent["subjectId"] = "mathematics"): ProgressEvent =>
  ({ id, subjectId, kind, at: new Date(Date.parse(NOW) - daysAgo * 86_400_000).toISOString(), refId });

export const ZERO: ProgressEvent[] = [];
export const ONE: ProgressEvent[] = [ev("evt-0001", "session-attended", 3, "session-0417")];
export const MANY: ProgressEvent[] = [
  ev("evt-0001", "session-attended", 30, "session-0301"), ev("evt-0002", "session-attended", 27, "session-0305"),
  ev("evt-0003", "session-attended", 23, "session-0312"), ev("evt-0004", "recording-watched", 22, "recording-0090"),
  ev("evt-0005", "session-attended", 20, "session-0318"), ev("evt-0006", "session-attended", 16, "session-0324"),
  ev("evt-0007", "work-submitted", 15, "submission-0011"), ev("evt-0008", "session-attended", 13, "session-0330"),
  ev("evt-0009", "recording-watched", 9, "recording-0102"), ev("evt-0010", "session-attended", 6, "session-0341"),
  ev("evt-0011", "session-attended", 2, "session-0349"),
];
/** Events in ANOTHER environment — must never leak into mathematics' figures. */
export const OTHER_SUBJECT: ProgressEvent[] = [ev("evt-p001", "session-attended", 4, "session-0500", "physics"), ev("evt-p002", "session-attended", 1, "session-0511", "physics")];
/** A PRESENT but unparseable timestamp — a DEFECT, not a state. */
export const MALFORMED: ProgressEvent[] = [{ id: "evt-bad1", subjectId: "mathematics", kind: "session-attended", at: "last tuesday", refId: "session-0001" }];

export const FACTS_ENTERED: EnvironmentFacts = { subjectId: "mathematics", hasAccount: true, enrolled: true, firstEnteredAt: "2026-09-27T16:41:07.833Z" };
/** Enrolled since day one vs enrolled yesterday: with no records, both must render IDENTICALLY. */
export const FACTS_DAY_ONE: EnvironmentFacts = { subjectId: "mathematics", hasAccount: true, enrolled: true, firstEnteredAt: "2026-01-05T08:00:00Z" };
export const FACTS_YESTERDAY: EnvironmentFacts = { subjectId: "mathematics", hasAccount: true, enrolled: true, firstEnteredAt: "2026-09-27T08:00:00Z" };
/** Enrolled, never entered: environment_state row MISSING — a state, the enter step stays ahead. */
export const FACTS_NEVER_ENTERED: EnvironmentFacts = { subjectId: "physics", hasAccount: true, enrolled: true, firstEnteredAt: null };
export const FACTS_PHYSICS: EnvironmentFacts = { subjectId: "physics", hasAccount: true, enrolled: true, firstEnteredAt: "2026-09-20T08:00:00Z" };
/** Not enrolled: the resolver returns null — nothing renders. */
export const FACTS_VISITOR: EnvironmentFacts = { subjectId: "mathematics", hasAccount: false, enrolled: false, firstEnteredAt: null };
