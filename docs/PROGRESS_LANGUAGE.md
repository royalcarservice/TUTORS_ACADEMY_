# The progress language

Phase 5 · Step 6. Ruling **P5-R6 — progress is a record, not a score.** This document is the reference every later phase inherits when it gives the product something to count. Code: `src/lib/progress` (pure), `src/components/student/arc-region.tsx` (the one surface), `src/config/arc.ts` (the seven steps).

## What progress is for — one paragraph

Progress here tells a student **where they are**, in one environment, in words the product can stand behind. It is a record of what actually happened — sessions attended, recordings watched, work submitted — each item pointing at a real row the student could open. It is not a score, not a comparison, not a forecast and not a reward. It orients; it never evaluates. The engine (5.4) is the only thing in this product that tells the student what to do; progress only says what has been done, and says nothing where nothing has been recorded.

## "Progress" is a stage name, not a feature

The word appears in the spine as the **sixth step of the story** (`discover → choose → enter → learn → interact → progress → master`, `src/config/arc.ts`, labelled "Watch your record grow"), as a Practice beat ("your record of progress") and in the quiet line "Progress you can see, described only in words the product already keeps." It also appears in 3.6's honest label "Assignments, tests & progress" and the portal blurb. **None of these is a requirement to build a progress UI.** The stage name means: the point in the story where a record exists and can be read. What that record may say is governed by this document.

## Permitted words

| Word | Definition here |
|---|---|
| **record** | The set of events for one student in one environment. "Your record" = these rows, nothing derived. |
| **event** | One fact about a real object at a real time: attended a session, watched a recording, submitted work. |
| **attended / watched / submitted** | Past-tense verbs naming an event kind. Never "completed". |
| **session / recording / work** | The real objects events refer to. Each event carries the object's id. |
| **count** (rendered as a numeral + noun, e.g. "eight sessions") | A pointer to that many rows. Permitted only when ≥ 1 and traceable. A count is never rendered as "0". |
| **last / most recent / on {date} / {n} days ago / today / yesterday** | Backward-looking recency from a real timestamp (`whenPhrase`). Never finer than a day. Never from a missing timestamp. |
| **done** | A step of the arc that real facts or events evidence. State word, set in the same type as its opposite. |
| **ahead** | A step of the arc not yet evidenced. It is not "locked", "incomplete", "remaining" or "next up". It is ahead. |
| **where you are** | The arc's eyebrow. Position, not evaluation. |
| **nothing is recorded here yet** | The honest boundary for an empty record — a statement about the record and the product, never about the student. |
| **in this environment / here** | Every figure is scoped to one subject. |

## The denominator rule

A ratio ("60 %", "3 of 7", a bar, a ring) asserts a **bounded set of things to finish**. It is permitted only when the denominator is a **real, named, bounded, per-environment structure the student could enumerate on screen** — a specific course with a listed set of sessions, for example. Not "the course" in the abstract, not "all content", not "your syllabus" where none exists, and never "typical". When such a structure exists (Phase 7/8): **per environment only, named on screen, derived at read time, never stored.** A global figure across subjects is banned permanently. Today no denominator exists anywhere in the product, and `src/lib/progress` exposes no function that could form one.

## Counts vs ratios

- A **count** refers: "eight sessions" = eight rows, listed by id in `sources`. Invariant, tested: `count === sources.length`.
- A **ratio** claims: it needs a denominator and therefore a structure. See above.
- Counts of different kinds are **never added** (no composite). Which things count, and how much, is a judgment about what learning is, and it would be wrong for someone and invisible as a decision.

## Never emit a zero

An empty record means **nothing is recorded**, not **nothing was done**. "0 sessions" is a claim about a child in a product that does not yet measure attendance. So: a kind with no rows is **absent** from the module's output, not present with `0`; a surface with no rows says the boundary sentence or says nothing. Two students with identical empty records render identically whatever their enrolment dates. No backfill, no defaults, no inference from other tables.

## Malformed is not missing (P5-R4 Addendum 1)

A missing optional fact (no `environment_state` row → `firstEnteredAt: null`) is a **state**: the step it would evidence stays ahead and nothing is said. A present but unparseable timestamp, an unknown kind, an event with no referent is a **defect**: excluded from every derivation and returned in `defects` for a test or a log to see. Nothing is repaired, defaulted or rendered around.

## Traceability

Every value the module returns carries `sources`: event ids, or fact ids (`account`, `enrolment:<subject>`, `entry:<subject>`). If a figure cannot name its rows, it does not exist. See the worked example in the 5.6 report.

## Banned words and forms — one reference, with sources

| Banned | Source |
|---|---|
| percent, %, fraction, "n of m", progress bar, ring, dial, meter | 4.7 §11 (progress-UI terms); P5-R6 rule 2 |
| complete, completion, completed, "100 %", finished | P5-R6 rule 2 (claims a structure); 4.7 "never 'complete!/✓'" |
| remaining, left, "to go" | P5-R6 rule 2 (implies a denominator) |
| streak, XP, points, level, tier, badge, trophy, medal, certificate, rank, leaderboard | 4.7 §11; 5.3 `NEVER_CONTAINS`; 5.4 NEVER list; P5-R6 rule 7 |
| milestone, achievement, unlocked, earned, reward, "well done", "great job", "you did it", congratulations, confetti | 4.7 §11 reward semantics; 5.3 (invented activity); P5-R6 rule 7 |
| "keep it up", "you're doing great", "welcome back", fabricated momentum | 5.3 `NEVER_CONTAINS`; P5-R2 (no welcome back); P5-R6 rule 8 |
| on track, behind, pace, "at this pace", "you'll finish by", forecast, estimate, "will" (about the student) | P5-R6 rule 5 (predictions the product cannot honour) |
| "you haven't", "don't fall behind", missed, at risk, "days since", decay, "streak broken" | P5-R6 rule 8 (guilt, urgency); 5.4 NEVER (guilt) |
| peer, cohort, class average, percentile, rank, "students like you", "top n %" | P5-R6 rule 6 (comparison) |
| a global / combined / cross-subject figure of any kind, subject ranking | P5-R6 rule 4; 5.3 equal-weight rule; 4.4 equal-weight doors |
| mastery level, score, grade, engagement, "time spent", minutes, sessions "this week" as a summary | P5-R6 rules 1 & 3; model rule "no behavioural record" |
| "recommended for you", "try this next", "next up", any CTA or link on a progress surface | 5.3 `NEVER_CONTAINS`; 4.7 (no CTA); P5-R6 rule 10 |
| statistic cards, metric grids, "your numbers", "at a glance", weekly summary, charts | 5.3 `NEVER_CONTAINS`; brief "not a dashboard" |
| skeleton loaders, shimmer, "loading" on empty states | 5.3 `NEVER_CONTAINS` |
| a clock sentence without a timestamp; any count from a null field; "assume 0" | 5.4 NEVER; 5.1 `resumeFacts` rule; P5-R4 Addendum 1 |
| `entry_count` on any screen | P5-R2 |
| AI ranking / importance / interest scoring | 5.4 NEVER; P5-R6 rule 3 (same class of error) |
| 4.1 `BANNED_PHRASES` (`src/lib/spine/voice.ts`): unlock your potential, revolutionize, transform your future, game-changing, world-class, cutting-edge, seamless, empower, journey (as a marketing noun), next-generation, leverage, elevate, discover the magic, unleash, in today's fast-paced world, rhetorical-question headlines, triple adjective stacks, em-dash listicles | 4.1 copy voice |
| 4.7 cliché and urgency lists: "what if you could", years/quarters, soon, waitlist, notify, countdown, hurry, limited, sign up, join now | 4.7 §11, Decision 6 |
| invented testimonial, statistic or credential; claims about marks, ranks, admissions | 4.1 voice rules |

**Words permitted only in the arc's fixed vocabulary:** "ahead" (4.7's state word; means *not yet*, never *ahead of others*); "done" (4.7's state word minus "on this page"). Both are set uniformly, in the same type as each other.

## What the model may record (Part 2, restated)

who · which environment (immutable subject id) · which kind (closed set, one per built capability) · when (real timestamp) · what it refers to (the real row's id) · **and nothing else.** No score, no duration unless the object has one, no engagement, no page views, clicks, session lengths, devices, IPs or locations. **A record of learning events, not of behaviour.** No stored derived value in any table, ever, including "for performance".

## DPDP, stated once

This is personal data about minors. No export, no aggregation, no sharing, no third-party access, and no retention behaviour beyond the (undecided) policy. What a tutor may see is a Phase 6 decision, made in RLS policy — the row shape (student id · subject id · kind · at · ref) is what makes that a policy decision rather than a schema rewrite.

## A note on the `Progress` primitive

`src/components/ui/progress.tsx` (Phase 2) is a linear progress bar with `role="progressbar"`. It is imported by **no route** today. Under P5-R6 it may never be used for a student's record: a bar is a ratio, and a ratio needs a denominator this product does not have. It remains available for genuinely determinate, non-evaluative operations (an upload, a file being processed) and for nothing about a person.
