# Phase 5 · Step 6 — The progress language · report

Ruling honoured: **P5-R6 — progress is a record, not a score.** Built 2026-09-29 on `main` after `0c3ab05` (5.5). Reference viewport 390×844. **Stopped before 5.7.**

---

## 1. Files, and the order the steps ran in

**Order:** 5.5 was executed, reported (`PHASE5_STEP5_ENVIRONMENT_REPORT.md`) and committed (`0c3ab05`) before 5.6 began. 5.6 then ran INSPECT → findings reported → two owner decisions (below) → build.

| Path | Role |
|---|---|
| `docs/PROGRESS_LANGUAGE.md` | **NEW.** Part 1 — the vocabulary document (pasted in § 2). |
| `src/lib/progress/events.ts` | **NEW.** The event model as a TypeScript type; `EVENT_KIND_MODULE` (kind → owning module); `EnvironmentFacts`. |
| `src/lib/progress/derive.ts`, `index.ts` | **NEW.** Part 3 — the pure computation module (exports in § 4). |
| `src/config/arc.ts` | **NEW.** The seven steps, ONE definition. Scene 7 re-exports it as `MARKERS`. |
| `src/components/spine/scenes/promise.tsx` | `MARKERS`/`Marker` now re-exported from `config/arc.ts`. Rendered HTML unchanged (page harness: no diffs). |
| `src/components/student/arc-region.tsx` | **NEW.** Part 5 — the arc region + `resolveArc`. |
| `src/config/student-slots.ts` | `gate?: "module-live" \| "facts"` on `EnvironmentSlotDef`; new region `record` ("Your record"); `progress` slot → `record`, `facts`-gated. |
| `src/components/student/environment-regions.tsx` | Resolvers receive a `SlotContext` (facts, events, liveModules); `facts` gate honoured; the one resolver is the arc. |
| `src/app/subjects/[subject]/page.tsx` | Passes facts (`getEnvironmentFacts`) and `events: []` to the slot resolver for an enrolled student. |
| `src/lib/student/data.ts` | `getEnvironmentFacts(subjectId, enrolled)` — one RLS-bounded read of `first_entered_at`. |
| `src/app/dev/progress-language/{page,frame,fixtures}` | **NEW.** Part 6 specimen. 404 in prod (verified). |
| `src/app/dev/environment-workspace/frame/page.tsx` | Adapted to the `SlotContext` signature (dev only). |
| `scripts/test-progress.mjs` | **NEW.** 16 pure tests. |
| `audit/environment.cjs` → `environment-baseline.json`, shots | Six arc gates added; baseline re-pinned (declared: enrolled states now carry region `record`). |
| `docs/DECISIONS.md` DEC-008 | Decisions and findings. |

**Owner decisions taken during the step:** (1) `progress_record` absent → build schema-free, report the amendment; (2) the `progress` slot's `student-portal`-live gate would keep the arc invisible forever → gate the arc on the facts it renders.

## 2. The vocabulary document (in full)

> See `docs/PROGRESS_LANGUAGE.md`; reproduced here verbatim.

### What progress is for — one paragraph
Progress here tells a student **where they are**, in one environment, in words the product can stand behind. It is a record of what actually happened — sessions attended, recordings watched, work submitted — each item pointing at a real row the student could open. It is not a score, not a comparison, not a forecast and not a reward. It orients; it never evaluates. The engine (5.4) is the only thing in this product that tells the student what to do; progress only says what has been done, and says nothing where nothing has been recorded.

### "Progress" is a stage name, not a feature
The word appears in the spine as the **sixth step of the story** (`discover → choose → enter → learn → interact → progress → master`, labelled "Watch your record grow"), as a Practice beat ("your record of progress") and in the quiet line "Progress you can see, described only in words the product already keeps." It also appears in 3.6's honest label "Assignments, tests & progress" and the portal blurb. **None of these is a requirement to build a progress UI.**

### Permitted words
record · event · attended / watched / submitted · session / recording / work · count (numeral + noun, ≥1, traceable, never "0") · last / most recent / on {date} / {n} days ago / today / yesterday (from a real timestamp, never finer than a day) · done · ahead · where you are · nothing is recorded here yet · in this environment / here.

### The denominator rule
A ratio asserts a bounded set of things to finish. Permitted only when the denominator is a **real, named, bounded, per-environment structure the student could enumerate on screen**. Not "the course", "all content", "your syllabus" where none exists, never "typical". When such a structure exists (Phase 7/8): per environment only, named on screen, derived at read time, never stored. A global figure across subjects is banned permanently. Today no denominator exists and `src/lib/progress` exposes no function that could form one.

### Counts vs ratios
A count refers (`count === sources.length`, tested). A ratio claims. Counts of different kinds are never added.

### Never emit a zero
An empty record means nothing is recorded, not nothing was done. A kind with no rows is absent from the output; a surface with no rows says the boundary sentence or nothing. Two students with identical empty records render identically whatever their enrolment dates. No backfill, no defaults, no inference.

### Malformed is not missing
Missing fact → state (step stays ahead, silence). Present-but-unparseable timestamp / unknown kind / no referent → defect, excluded and returned in `defects`.

### Traceability
Every value carries `sources`. If a figure cannot name its rows, it does not exist.

### Banned — one reference with sources
| Banned | Source |
|---|---|
| percent, %, fraction, "n of m", bar, ring, dial, meter | 4.7 §11; P5-R6 r2 |
| complete/completion/completed, finished | P5-R6 r2; 4.7 |
| remaining, left, "to go" | P5-R6 r2 |
| streak, XP, points, level, tier, badge, trophy, medal, certificate, rank, leaderboard | 4.7 §11; 5.3 NEVER_CONTAINS; 5.4 NEVER; P5-R6 r7 |
| milestone, achievement, unlocked, earned, reward, well done, great job, you did it, congratulations, confetti | 4.7 §11; 5.3; P5-R6 r7 |
| keep it up, you're doing great, welcome back, fabricated momentum | 5.3; P5-R2; P5-R6 r8 |
| on track, behind, pace, "you'll finish by", forecast, estimate, "will" (about the student) | P5-R6 r5 |
| you haven't, don't fall behind, missed, at risk, days since, decay, streak broken | P5-R6 r8; 5.4 |
| peer, cohort, class average, percentile, rank, students like you | P5-R6 r6 |
| any global / combined / cross-subject figure, subject ranking | P5-R6 r4; 5.3 equal weight; 4.4 |
| mastery level, score, grade, engagement, time spent, minutes, weekly summaries | P5-R6 r1, r3; model rule |
| recommended for you, try this next, next up, any CTA/link on a progress surface | 5.3; 4.7; P5-R6 r10 |
| stat cards, metric grids, your numbers, at a glance, charts | 5.3; brief |
| skeleton loaders, shimmer, loading on empty states | 5.3 |
| clock sentence without a timestamp; count from a null field; assume 0 | 5.4; 5.1 `resumeFacts`; Addendum 1 |
| `entry_count` on any screen | P5-R2 |
| AI ranking / importance / interest scoring | 5.4; P5-R6 r3 |
| 4.1 `BANNED_PHRASES` (18 items, `src/lib/spine/voice.ts`) | 4.1 |
| 4.7 cliché + urgency lists | 4.7 §11 |
| invented testimonial/statistic/credential; claims about marks, ranks, admissions | 4.1 |

Permitted only in the arc's fixed vocabulary: "ahead" (= not yet, never ahead of others), "done".

### What the model may record · DPDP
(§ 3 and § 13 below.) Plus the note: `src/components/ui/progress.tsx` (Phase-2 progress bar, unused by any route) may never be used for a person's record.

## 3. What `progress_record` can and cannot express — and the 5.1 amendment

**It cannot express anything: it does not exist.** `supabase/migrations/20260927000001_identity.sql` creates `profiles`, `enrolments`, `environment_state` only. 5.1 was executed without its brief (5.1 report, line 6). No stored derived column exists anywhere; the nearest thing is `environment_state.entry_count` — bookkeeping about entries, never rendered (P5-R2), not a progress summary — noted, not a defect of this class.

**Proposed 5.1 amendment (NOT applied — for the owner to rule on):**
```sql
-- A RECORD OF LEARNING EVENTS, NOT OF BEHAVIOUR. One row = one fact about a real object.
-- Never a page view, click, duration, device, IP or location. Never a stored summary.
create table public.progress_record (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references auth.users(id) on delete cascade,
  subject_id  text not null check (subject_id in ('mathematics','physics','chemistry','biology','english','history')),
  kind        text not null,               -- closed set, extended ONLY when the referent exists (see EVENT_KIND_MODULE)
  ref_id      uuid not null,               -- the session / recording / submission row
  at          timestamptz not null,
  unique (student_id, kind, ref_id)        -- a fact is recorded once
);
comment on table public.progress_record is 'Learning events only (P5-R6). No behaviour, no derived values, no aggregation. Personal data about minors.';
alter table public.progress_record enable row level security;
create policy progress_select_own on public.progress_record for select using (student_id = auth.uid());
-- INSERT: by the capability that owns the referent (P7/P8), never by a page render. No UPDATE, no DELETE for students.
```
The type `ProgressEvent` mirrors this row exactly (`id, subjectId, kind, at, refId`). Until it exists every caller passes `[]`.

## 4. The computation module — exports, verbatim, and the proof

```ts
export type { EnvironmentFacts, ProgressEvent, ProgressEventKind } from "./events";
export { EVENT_KIND_MODULE, EVENT_KINDS } from "./events";
export type { ArcPosition, ArcPositionStep, ArcState, Count, Defect, Recency, Validated } from "./derive";
export { admissibleKinds, arcPosition, countByKind, latestEvent, STEP_EVIDENCE, validateEvents } from "./derive";
```
Runtime surface (test 4 asserts it is exactly this): `EVENT_KINDS, EVENT_KIND_MODULE, STEP_EVIDENCE, admissibleKinds, arcPosition, countByKind, latestEvent, validateEvents`.

Signatures: `validateEvents(events) → { valid, defects }` · `admissibleKinds(liveModules) → kind[]` · `countByKind(events, subjectId, liveModules) → Count[]` where `Count = { kind, count, sources }` · `latestEvent(events, subjectId, liveModules, nowIso) → Recency | null` · `arcPosition(facts, events, liveModules) → { subjectId, steps[7]{id,label,state,sources}, recordEmpty, defects }`.

**Proof (scripts/test-progress.mjs, 16/16):** no export name matches `/ratio|percent|rate|score|level|streak|total|overall|combined|composite|predict|forecast|estimate|pace|track|compare|rank|average/`; the source contains no division, `* 100`, `toFixed`, `reduce` or `+=`; across all fixtures × all functions every emitted number is an integer ≥ 1 and no emitted string matches `%|complete|on track|behind|pace|will |streak|level|badge`. **The attempt** (also live on `/dev/progress-language`): `P.percentComplete → undefined · P.completion → undefined · P.ratio → undefined · P.overallProgress → undefined · P.combinedScore → undefined · P.projectedFinish → undefined`; `countByKind(MANY)` returns objects whose keys are exactly `count, kind, sources`; `counts[0].total → undefined (there is nothing to divide by)`.

## 5. Traceability — mechanism and one worked example

Every value carries `sources: string[]` — event ids, or fact ids `account`, `enrolment:<subject>`, `entry:<subject>`. Invariant `count === sources.length` is tested. A caller displaying a figure renders it from `Count`/`Recency`/`ArcPositionStep`, so the ids are in hand; a "which rows?" affordance would list `sources` (none is built — no UI beyond the arc).

Worked example, fixture MANY with the pretend registry: `session-attended · 8 ← evt-0001,0002,0003,0005,0006,0008,0010,0011` · `recording-watched · 2 ← evt-0004, evt-0009` · `work-submitted · 1 ← evt-0007` · `most recent: session-attended, 2 days ago ← evt-0011` · arc: `discover ← account · choose ← enrolment:mathematics · enter ← entry:mathematics · learn ← 10 ids · interact ← — · progress ← 11 ids · master ← —`.

## 6. Arc candidates and the one shipped

| | Candidate | Verdict |
|---|---|---|
| **A** | The seven labels as a plain list, each followed by its state in words ("done" / "ahead"); the boundary sentence beneath when the record is empty; region heading "Your record" from the contract; no eyebrow | **SHIPPED.** Holds 4.7's vocabulary exactly; text-only; nothing to fill; reads at 390 without wrapping. |
| B | Same list with "behind you" / "ahead" | Rejected — "behind" is judgment vocabulary even in the spatial sense; it is on the sweep list for a reason. |
| C | One prose paragraph ("You have seen the system, chosen this door and crossed it. Learning in the room … are ahead.") | Rejected — harder to prove identical to 4.7; reads as narration edging toward praise; a paragraph invites embellishment later. |

A first draft of A carried a second mono eyebrow ("Where you are · Mathematics") under the region heading; two stacked mono lines read as a dashboard header, so it was removed — the phrase survives as the list's `aria-label` ("Where you are in Mathematics").

## 7. The honest boundary sentence

> **Nothing is recorded here yet. Nothing in this environment records anything so far — classes, recordings and work arrive in later phases, and the record starts when they exist.**

Why it is not an accusation: the grammatical subject of every clause is the environment or the record, never "you"; it names the actual cause (nothing records anything) rather than an absence of effort; and it makes no claim about what the student did or did not do. Candidate B ("There is nothing recorded here yet: this environment does not record anything until classes, recordings and work exist in it.") was kept in code, unshipped — one clause shorter but "until" reads as a schedule.

## 8. Zero / one / many renderings (every string, frame at 390)

**Zero (registry as it stands — production today):** heading "Your record" · list (aria-label "Where you are in Mathematics"): `See the system — done · See the doors — done · Watch the crossing — done · Learn in the room — ahead · Work with a tutor — ahead · Watch your record grow — ahead · Master the subject — ahead` · boundary sentence (§ 7). Digits rendered: **0.**
**One (fixture, pretend live):** same seven labels; `learn — done`, `progress — done`; no boundary sentence. Digits: 0.
**Many (fixture, pretend live):** identical to One. Digits: 0. **The first event and the eleventh produce the same strings.**
**Real production renders:** student-e / mathematics (entered): 3 done, 4 ahead + boundary. student-b / mathematics and / physics (enrolled, never entered): `done, done, ahead ×5` + boundary — a missing `environment_state` row is a state. Visitor / non-enrolled: nothing (`data-arc` absent from the HTML; visitor DOM hash unchanged `47456ef7283919cd`).

## 9. Sweeps
- **Banned words (test 3, shipped strings, comments stripped, `/dev` excluded):** `%` — only CSS/`printf` templates; `complete` — one scene-contract description string ("read in place, complete", 4.1, not rendered as progress); `progress` — 3.6 label, Practice beat, spine quiet line, registry summary, routes blurb, `config/arc.ts` step id (all stage/label uses; none a UI); `left` — CSS `left`, portal placeholder "left out", 4.7 closing line; `level` — motif grammar / battery eligibility; `points` — SVG path; `behind` — Scene 3 "Behind it is the environment" (spatial, 4.4 shipped); `ahead` — 4.7 state word and this step's (brief-mandated); `unlock` — inside the banned list itself; `peer` — Tailwind class; `first session` — 5.4's State B copy "Your first session begins when you open it" (a statement of what opening does, shipped and accepted at 5.4; not emphasis on a record). **No hit removed; none is a progress claim.** `src/components/ui/progress.tsx` exists unused (§ 14).
- **Ratios / composite / prediction:** none expressible (§ 4). **Zeros:** none rendered (harness gate "never a digit" on every enrolled state). **Cross-subject:** no function takes more than one `subjectId`; `/student` has no arc (verified). **Backfill:** day-one ≡ yesterday (deep-equal, test 11 + dev page). **Celebration:** no conditional emphasis — one `<li>` template, no `first`/milestone branch (test 13). **Comparison:** no peer/cohort/average/percentile in module or region. **Guilt / pace:** none (tests 15/16).

## 10. Arc integrity and not-a-stepper
Homepage `MARKERS` and the region's steps are the same array (`ARC_STEPS`): `discover · See the system / choose · See the doors / enter · Watch the crossing / learn · Learn in the room / interact · Work with a tutor / progress · Watch your record grow / master · Master the subject` — identical names, identical order, by construction (test 19; harness gate). State words: homepage "done, on this page"/"ahead"; environment "done"/"ahead" (4.7 §13's foreseen edit; the homepage is untouched).
Not a stepper — DOM: `<ul data-arc-steps>` of seven `<li>` each with two `<span>`s of text; no `::before` marks, no segments, no fill, no `aria-valuenow`, no `role=progressbar`, no numeral anywhere (harness: digits 0).

## 11. Accessibility, performance, payload, harness
- **A11y:** one h1 (Mathematics); nesting h1 → h2 "Inside this room" → h3 "Your record"; status is text ("done"/"ahead"), same type for both; axe on `[data-arc]`: 0 violations dark and light; contrast label 16.66:1 dark / 17.75:1 light, state and boundary 15.26 / 15.19; Tab never lands inside the arc (nothing focusable); no-JS renders all 7 steps; 200 % (640 px) and 400 % (320 px) equivalents: no horizontal overflow; 1.4.12 text spacing: no clipping; touch targets n/a (nothing interactive); grayscale and reduced-motion frames on the dev page (no animation exists — harness gate).
- **Primary action:** the region adds no primary (`main [data-primary-action]` count 0 on an enrolled environment; ≤1 in every state — gate). Fold gate still passes on every route (environment: non-enrolled threshold bottom 362 @390; shell 57 PASS).
- **JS payload (`/subjects/mathematics`, same method before/after via stash rebuild):** visitor 15 script tags / 9 responses / 522 KB → **15 / 9 / 522 KB**; enrolled student identical; `/student` 12 / 9 / 531 KB → unchanged. No `"use client"` added.
- **LCP, `/subjects/mathematics` as an enrolled student, mid-range profile, 1 warm-up discarded, 7 kept:** `3.16, 3.10, 2.24, 3.11, 3.05, 3.12, 3.12` s → **2.2 s ×1 / 3.05–3.16 s ×6** (bimodal, as `/student`); TTFB 596–739 ms (getUser + two RLS reads) — recorded, not optimised (Phase 10, with the existing item).
- **Harness:** `environment.cjs` **21/21** (6 new arc gates), baseline re-pinned for the declared `record` region; `shell.cjs` 57 PASS, no diffs (after resetting the clock-relative fixture dates — second occurrence, Phase 10); `page.cjs` no diffs (homepage unchanged); `permissions.cjs` 9/9; RLS Tier 3 20/20; `test-next-action` 34/34; `test-progress` 16/16; `tsc`, `eslint src`, production build OK; `/dev/progress-language` and its frame → 404 in prod.

## 12. What is real today, and what exists only as a fixture
**Real:** the vocabulary; the pure module; the arc region rendered for an enrolled student from a real account, enrolment and `environment_state` row; "done" ×3 (or ×2 when never entered) and "ahead" for the rest; the boundary sentence; the gating (`facts` + registry + events). **Fixture only:** every event (`ONE`, `MANY`, `MALFORMED`, `OTHER_SUBJECT`), the pretend-live registry, and therefore every count and recency on `/dev/progress-language`. There is no event table in the product.

## 13. DPDP note and tutor-visibility shape
No export, aggregation, sharing, third-party access or retention behaviour was added; nothing observes the student (no instrumentation, no beacon, no event write — production events are `[]` by construction). Tutor visibility (P6) is a **policy** decision because the proposed row is keyed on `student_id` + `subject_id` and nothing else identifies scope: a tutor policy is one `create policy … using (exists (select 1 from tutor_assignments …))` on the same table, reading the same columns; no column, no view, no summary table is needed. The pure module is indifferent to who is reading — it receives rows already bounded by RLS.

## 14. Not implemented, deferred, nothing half-built
- `progress_record` — not created (owner decision; DDL in § 3). The module, region and tests are complete without it; nothing waits on it to render correctly.
- `interact` and `master` have no evidence rule and none was invented; they stay ahead until P6/P7 define one.
- No counts or recency are rendered anywhere (no UI beyond the arc) — `countByKind`/`latestEvent` exist for later phases and are exercised only by tests and the dev route.
- Findings, not fixed: Phase-2 `ui/progress.tsx` primitive exists unused (documented as off-limits for a person's record; primitives are DO NOT CHANGE); shell-harness fixture dates drift daily.

## 15. Scope confirmation
Changed: the model report (this document + DEC-008), the pure module, the arc region and its slot wiring (a declared, additive extension of 5.5's contract: `gate`, `SlotContext`, region `record`), the vocabulary document, the dev specimen, tests and harness gates. **Not changed:** schema/RLS; 5.3's three states or shell; 5.4's resolver/providers/tiers/treatments; 5.5's write, predicate or region mechanics; tokens/type/motion/primitives; brand/nav; subject system and door logic; 3.6 chrome and labels; Scenes 0–8 (Scene 7 re-exports its markers from `config/arc.ts`; HTML identical); 4.7's vocabulary; the module registry. **Step 5.7 not begun.**

## Test index (32)
1 precondition ✓ (5.5 at `0c3ab05`) · 2 vocabulary ✓ (§2) · 3 banned sweep ✓ (§9) · 4 no ratios ✓ (§4) · 5 no stored derived values ✓ — no table; `entry_count` noted · 6 never a zero ✓ (§8) · 7 traceability ✓ (§5) · 8 no composite ✓ · 9 no cross-subject ✓ · 10 per-environment ✓ (student-b maths + physics: separate arcs, no digits) · 11 no backfill ✓ · 12 malformed vs missing ✓ · 13 no celebration ✓ · 14 no comparison ✓ · 15 no prediction ✓ · 16 no guilt ✓ · 17 no CTA ✓ (interactive 0) · 18 one primary ✓ · 19 arc integrity ✓ · 20 not a stepper ✓ · 21 gating ✓ (live+no events → ahead; events+not live → ahead, recordEmpty) · 22 region contract ✓ (visitor/non-enrolled: no `data-arc`; server-side; registry-gated later steps) · 23 empty/some/many shots ✓ (dev page, both themes) · 24 no leakage ✓ (RLS 20/20; student-b's arc reads only its own rows; no rows exist to leak) · 25 purity ✓ · 26 a11y ✓ (§11) · 27 mobile-first ✓ · 28 performance ✓ (§11) · 29 harness ✓ · 30 prod build ✓, dev route 404, `.env.local` untouched, nothing printed · 31 DPDP ✓ (§13) · 32 `git status --porcelain` (below, pre-commit):

```
 M audit/environment-baseline.json
 M audit/environment-shots/enrolled-draft-entered-390.png
 M audit/environment-shots/enrolled-draft-no-state-390.png
 M audit/environment-shots/enrolled-ready-no-state-390.png
 M audit/environment-shots/enrolled-ready-no-state.html
 M audit/environment-shots/visitor-draft-390.png
 M audit/environment-shots/visitor-ready-390.png
 M audit/environment-shots/write-1-shell-A.png
 M audit/environment-shots/write-3-entered.png
 M audit/environment.cjs
 M docs/DECISIONS.md
 M src/app/dev/environment-workspace/frame/page.tsx
 M src/app/subjects/[subject]/page.tsx
 M src/components/spine/scenes/promise.tsx
 M src/components/student/environment-regions.tsx
 M src/config/student-slots.ts
 M src/lib/student/data.ts
?? PHASE5_STEP6_PROGRESS_LANGUAGE_REPORT.md
?? docs/PROGRESS_LANGUAGE.md
?? scripts/test-progress.mjs
?? src/app/dev/progress-language/
?? src/components/student/arc-region.tsx
?? src/config/arc.ts
?? src/lib/progress/
```
