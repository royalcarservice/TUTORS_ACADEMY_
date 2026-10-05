# TUTORS ACADEMY — PHASE 5 · STEP 6: THE PROGRESS LANGUAGE

Depends on 5.1 (model + `progress_record`), 5.3 (the shell), 5.4 (the engine), **5.5 (the region
contract — this step renders inside it)**, and 4.7's shipped progress map.

**PRECONDITION — 5.5 EXECUTED.** This step's one visible element is a region in 5.5's environment
scope. If 5.5 has not reported, **do not build here** — report the order and wait.

**AND A PRECONDITION OF A DIFFERENT KIND: THERE IS NOTHING TO MEASURE.** No lessons, no exercises, no
assessments, no completion events. **`progress_record` exists and is empty, and it will stay empty
through Phases 6 and 7.** That is not an obstacle to this step. **It is the step's subject.**

---

## WHY

Every learning product has a progress feature. It is almost always the same feature: a percentage, a
bar, a streak, a level. **And almost always it is a lie**, because a percentage requires a
denominator, and the denominator was invented by a product team — "the course", "all content", "the
syllabus" — none of which is a real, bounded, named thing the student can point at.

**This product cannot afford that lie, for a structural reason: there is no curriculum yet.** There
are environments, and honest labels where content will go. **A progress bar here would be a fabricated
claim about a structure that does not exist** — the exact failure 4.1 spent a phase preventing on the
homepage, now arriving where it does the most damage: **a student's own record of themselves.**

**AND THERE IS A SECOND REASON, WHICH IS THE REAL ONE.** 5.1 locked the phase's principle: *momentum,
not accounting* — a statistics dashboard is a failure state. **Progress is where that principle gets
tested**, because progress is the one feature that is accounting by default. So this step decides what
progress *means here* before Phase 7 gives it anything to count — **because whatever is built then
will inherit whatever is decided now.**

**THE THIRD REASON IS THE MOST IMPORTANT, AND IT IS QUIET.** On a platform for school-age students,
a progress display is a **judgment about a young person, rendered by software, often in front of
them.** "You are 40% complete" is a verdict. "You are behind" is a verdict. **This step's job is to
make sure the product never issues one.**

---

## FIRST: INSPECT

1. **4.7's shipped progress map** — the visitor's arc, its exact vocabulary, its seven steps, its
   "genuinely complete" rule, its bans. **This step continues that map; it must not contradict it.**
2. **5.1's `progress_record`** — every field, every constraint, its policies, and **what it can and
   cannot record.**
3. **5.1's momentum principle document**, in full.
4. **5.3's slot map** and **5.5's region contract** — where a progress region lives, and how
   registry-gating and server-side visibility work.
5. **5.4's** `judge` / `explainResolution` / `TREATMENT` map and its purity test — **this step's
   computation module is built to the same standard.**
6. **The registry reconciliation from P5-R4 Addendum 2** — the statuses as they now stand.
7. **Every banned-word list already in force:** 4.1's copy voice and banned list · 4.7's cliché and
   reward lists · 5.1's report-only ban · 5.3's never-contains list · 5.4's honesty rules. **Collect
   them into one place in this step's vocabulary document, with their sources.**
8. **The seven arc steps' names**, and where the word PROGRESS appears in the spine — **it names a
   stage, not a feature. Say so in the document**, so no one later reads the stage name as a
   requirement to build a progress UI.

Report findings before building.

---

## RULING P5-R6 — PROGRESS IS A RECORD, NOT A SCORE

**This is the whole step. Everything below is its consequence.**

**1. PROGRESS IS EVENTS.** The model records *what actually happened*, at a time, referring to a real
object: attended this session · watched this recording · submitted this work. **It never records a
summary of events.** No `percentComplete`. No `masteryLevel`. No `streakDays`. **No stored derived
field, ever, in any table** — including "for performance". If a number can be derived, it is derived
at read time and never persisted.

**2. COUNTS ARE REFERENCES. RATIOS ARE CLAIMS.**
- *"Eight sessions"* refers to eight real rows the student can open. **A count is a pointer.** It is
  permitted, and it is honest.
- *"60% complete"* claims a structure — a curriculum, a bounded set of things to finish. **A ratio is
  an assertion about the shape of the product.** It is banned until the denominator is a **real,
  named, bounded, per-environment structure** that the student could enumerate. Not a "typical"
  course. Not "all content". Not "your syllabus" when no syllabus exists.
- **When a real denominator exists** (Phase 7/8, real course structure): **per-environment only,
  named on screen, and derived — never stored.** A global "your progress: 47%" is banned permanently,
  at every phase, with no exception.
- **AND THIS IS THE RULE THAT MATTERS MOST: NEVER EMIT A ZERO.** An empty record means *we have
  nothing recorded*, not *you have done nothing*. "0 sessions attended" is a claim — and it is a
  claim about a child, in a product that does not yet measure attendance. **Where the record is
  empty, the surface says nothing, or says only what the record can support.**

**3. NO COMPOSITES.** Never combine attendance, recordings and submissions into one figure. Which
things count, and how much, is a judgment about what learning is — **and it would be wrong for some
student, unfalsifiable to them, and invisible as a design decision.** (Same class of error as 5.4's
banned AI ranking.)

**4. PER ENVIRONMENT, NEVER CROSS-SUBJECT.** Physics and History are not comparable on one scale.
**There is no global progress number, no combined figure, no subject ranking** — not for the student,
not for a tutor, not for a parent, not in a report, ever. This carries 5.3's equal-weight rule and
4.4's equal-weight doors into the data layer.

**5. BACKWARD-LOOKING ONLY.** *"You attended four sessions"* is a fact. *"You are on track"*, *"you
are behind"*, *"you'll finish by March"*, *"at this pace"* are **predictions the product cannot
honour**, and pace language is judgment wearing a schedule's clothes. **Banned at every phase.**

**6. NO COMPARISON.** No other students, no cohort, no class average, no percentile, no "students
like you". **The student is compared to nothing** — not to peers, not to a schedule, not to their own
past for the purpose of judging them. Orientation, not evaluation.

**7. NOTHING IS EVER CELEBRATED.** No milestones, no "your first session — well done", no confetti,
no badges, no streaks, no level-ups, no achievement surfaces, no reward semantics in any form (4.7).
**Facts are rendered uniformly: an event is not emphasised because it is a first, or a tenth, or a
comeback.** The product does not congratulate. *The student can see a first session in a record
because it is first — not because the software singled it out.*

**8. NO GUILT, NO URGENCY.** No "you haven't visited in 12 days", no "don't fall behind", no "keep it
up", no decay, no at-risk, no streaks shown breaking. **Nothing in a student's own record may be
rendered as an accusation.**

**9. TRACEABLE, ALWAYS.** Every progress element can name the events behind it. **If a number cannot
be traced to rows the student can inspect, it does not render.** This is 5.4's reconstructability rule
applied to a student's record of themselves — and it is the mechanism that makes rule 2 enforceable
rather than aspirational.

**10. PROGRESS NEVER GIVES AN INSTRUCTION.** **The engine (5.4) is the only thing in this product that
tells the student what to do.** Progress states position. **No CTA on any progress surface, ever**
(4.7's rule, carrying forward) — because two surfaces pointing at "what next" is two primaries, and
because a progress display with a button is a nudge, and nudges become engagement machinery.

---

## THE MODEL — WHAT AN EVENT IS

A `progress_record` row is a **fact about a real object**, and nothing else:

- **who** — the student
- **which environment** — the subject, by its immutable `id` (3.1)
- **what kind of event** — a small, closed set, extended by the phase that creates the capability
- **when it happened** — a real timestamp
- **what it refers to** — the real row's identifier: the session, the recording, the resource
- **and nothing else.** No score. No duration, unless the object genuinely has one. No measured
  "engagement". No inferred anything.

**RULES FOR THE SHAPE, NOT JUST THE USE:**
- **A kind of event may only exist if the object it refers to exists.** No event type for a
  capability that is not built — the same gate as 5.4's providers and 5.5's regions.
- **`progress_record` must never become a general analytics table.** Not a page view, not a click, not
  a session length, not a device, not an IP, not a location. **This is a record of learning events,
  not of behaviour.** State it in a comment on the table itself.
- **ABSENCE OF RECORD IS NOT ABSENCE OF ACTIVITY** (P5-R4 Addendum 1). Records begin when recording
  begins. **No backfill. No defaults. No "assume 0". No inference from anything else in the system.**
  Two students with identical empty records render identically, and that is correct.
- **DPDP, STATED ONCE:** this is personal data about minors; **no export, no aggregation, no sharing,
  no third-party access, and no retention beyond the undecided policy.** What a TUTOR may see is a
  **P6 question and is not decided here** — but the model must be shaped so that tutor visibility is a
  *policy* decision (RLS), never a schema rewrite. Report how the shape supports that.
- **MALFORMED IS NOT MISSING** (P5-R4 Addendum 1) — a malformed timestamp is a defect to report, not a
  state to render around.

---

## THE ONE VISIBLE THING — THE ARC, CONTINUED

**There is exactly one honest progress surface this product can render with an empty record, and it
already exists on the homepage.**

4.7 shipped the visitor's map: **DISCOVER → CHOOSE → ENTER** genuinely complete, **LEARN → INTERACT
→ PROGRESS → MASTER** ahead, drawn from the same vocabulary, no CTA, not interactive, not achievement
UI. **The student's version is that same map, one step further along** — and it is honest for exactly
the reason the visitor's was: **the first three steps really did happen to this student, and the rest
really have not.**

**BUILD IT AS A REGION IN 5.5's ENVIRONMENT SCOPE, WITH THESE RULES:**

- **Same seven steps, same names, same order as 4.7's shipped map.** Paste both and confirm no drift —
  **the homepage and the environment must not disagree about the shape of the journey.**
- **It reuses 4.7's VOCABULARY, not its Stage treatment.** This is a Room (2.4): compact density,
  **no substrate, no canvas, no animation beyond what already exists, and it does not become a second
  primary.**
- **IT IS NOT A STEPPER.** No segments, no filled/empty boxes, no "3 of 7", no progress bar wearing an
  arc's clothes. **A seven-segment display is a percentage with extra steps.**
- **NOTHING IS COMPLETE-ABLE.** Later steps are not "locked", not greyed with a padlock, not
  "in progress". They are ahead. **A step may only gain texture from real events when its capability
  exists — registry-gated (P5-R4 Addendum 2) and event-gated. Until then, ahead means ahead.**
- **NO CTA. NO LINK. NOT INTERACTIVE.** The engine instructs; the map orients.
- **IT RENDERS NOTHING WHEN IT HAS NOTHING** — for a visitor, and for a signed-out reader, per 5.5's
  region contract. It is a student's surface.
- **AND IT MUST NOT READ AS A REWARD SCREEN.** No "you've unlocked", no "next up: LEARN", no
  encouragement. Position, stated plainly. **If a reader feels praised, it has failed.**
- **PROPOSE 2–3 COPY/STRUCTURE CANDIDATES AND REPORT THE CHOICE**, as with 4.2 and 5.5's threshold.

**AND THE HONEST BOUNDARY, WHICH BELONGS ON THE SCREEN OR IMMEDIATELY BESIDE IT:** the record is
empty, and the product says so **without saying "you have done nothing."** *There is nothing recorded
here yet* is true. Find the sentence that says it — in 4.1's voice, adult, plainspoken, second person
— and paste it in the report.

---

## WHAT THIS STEP MUST NOT BECOME

- **Not a dashboard.** No stat row, no cards, no grids, no charts, no "at a glance", no weekly summary.
- **Not a report card.** Nothing addressed to anyone but the student. Nothing phrased as evaluation.
- **Not a second engine.** No CTA, no nudge, no "try this next".
- **Not a reward system.** Not with points, not with badges, and **not with words either** — praise is
  reward semantics rendered in prose.
- **Not a behavioural record.** No clicks, no time, no device, no location, no engagement metrics
  dressed as learning.
- **If it feels thin, it is thin.** An empty record on a product that measures nothing yet **is the
  correct and complete answer**, and shipping it honestly is worth more than shipping a fabricated bar.

---

## BUILD

**PART 1 — THE VOCABULARY DOCUMENT** (`docs/PROGRESS_LANGUAGE.md`): permitted words with definitions ·
banned words with sources (collecting 4.1, 4.7, 5.1, 5.3, 5.4's lists into one reference) · the
denominator rule · the never-emit-a-zero rule · counts-vs-ratios · what progress is for, in one
paragraph · and the note that **PROGRESS is a stage name, not a feature.**

**PART 2 — THE EVENT MODEL.** Report against 5.1's `progress_record` as built: does it express the
shape above? **If it needs a field it does not have, STOP AND REPORT** — that is a 5.1 amendment, not
a quiet migration. If it has a field it should not (a derived or summary column), **report that as a
defect of the same class.**

**PART 3 — THE COMPUTATION MODULE.** Pure, like 5.4's resolver: **no clock, no database, no env.**
Input: events, an environment, and a caller-supplied `now`. Output: honest derivations — **counts and
recency only.** **It must have no function that returns a ratio, a percentage, a composite or a
prediction, and a test must prove that.** Paste the exports.

**PART 4 — THE TRACEABILITY MECHANISM.** Every value the module can produce carries its source event
ids. Report the mechanism and how a caller could name the rows behind any displayed figure.

**PART 5 — THE ARC REGION.** Per the section above, inside 5.5's region contract. Registry-gated,
server-side, nothing when empty, no CTA, no animation, mobile-first at 390.

**PART 6 — `/dev/progress-language`** (dev-only, `NODE_ENV !== 'production'`):
- the vocabulary list, permitted and banned, rendered as reference
- the arc region at **zero / one / many events** (fixtures), and with the registry as it stands
- **a live demonstration that the module cannot produce a ratio, a composite or a prediction** — show
  the exports and the failing attempt
- the never-emit-a-zero case, shown side by side with the wrong version, so the difference is visible
- grayscale, reduced motion, no-JS, 390 first paint
- a plain statement: **what is real today, and what is a fixture**

---

## CONSTRAINTS

- **NO UI BEYOND THE ARC REGION.** No progress page, no records page, no history, no charts, no
  summaries anywhere.
- **NO SCHEMA CHANGE.** STOP AND REPORT if the model needs one.
- **NO STORED DERIVED VALUES.** Not now, not "for performance".
- **NO CLIENT JS ADDED** to the routes the region appears on. Report the payload before and after.
- **NO ANALYTICS, EVENTS, BEACONS OR TRACKING OF ANY KIND** — and no instrumentation added "to gather
  the data later". Nothing observes the student.
- **NO SEEDED OR FIXTURE DATA IN PRODUCTION.** Fixtures live in `/dev/progress-language` and in tests.
- **NO CTA. NO LINK. NO INTERACTION. NO ANIMATION.**
- Do not touch 5.3's three null states' composition; 5.4's resolver, providers, tiers or treatments;
  5.5's entry write, predicate or region contract's mechanics; 5.1's model, roles or policies; the
  certified subject system; the brand frame; the scene spine; or any Phase 3/4 surface.
- **DO NOT BEGIN STEP 5.7.**

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives · brand mark, lockup, nav shell · subject system 3.1–3.6 and
the door logic · 3.6's chrome, regions and honest labels · the 3.7 baseline and the harnesses · the
scene contract, spine, scroll grammar, voice document · Scenes 0–8, the footer, **and 4.7's shipped
promise map's vocabulary** · 4.9's findings · 5.1's model, roles, policies · 5.3's IA, ratio, fold gate
· 5.4's resolver, providers, extension contract · 5.5's write, predicate, region contract ·
`/subjects` scaffold · the module registry's corrected entries · existing build and deploy setup.

---

## TESTS (all required)

1. **PRECONDITION** — confirm 5.5 has reported. If it has not, say so and stop.
2. **VOCABULARY DOCUMENT** — paste it in full: permitted, banned, sources.
3. **BANNED-WORD SWEEP** — grep every shipped string (all states, all routes, all regions, metadata)
   for: percent, %, complete, completion, progress, remaining, left, streak, level, badge, XP, points,
   rank, leaderboard, milestone, achievement, "well done", "keep it up", "great job", "on track",
   behind, ahead, pace, "days since", "unlock". **Expected: NONE shipped.** Paste every hit with its
   justification or its removal.
4. **NO RATIOS EXIST** — paste the module's exports and prove no function returns a ratio, percentage,
   composite or prediction. **Then attempt one in the dev route and paste the failure.**
5. **NO STORED DERIVED VALUES** — paste the schema's `progress_record` definition and confirm no
   summary column exists. If 5.1 shipped one, report it as a defect of this class.
6. **NEVER EMIT A ZERO** — with zero events, paste **every** rendered string from the region and its
   surrounding surface. **No "0", no "none yet" as a claim, no "you haven't".** Then the same with
   events, confirming real counts are references with traceable ids.
7. **COUNT TRACEABILITY** — for every displayed figure, paste the event ids behind it.
8. **NO COMPOSITE API** — grep for any function combining kinds. Expected: none.
9. **NO CROSS-SUBJECT FIGURE** — grep for any global or combined progress value on any surface,
   including the dev route's production paths. Expected: none.
10. **PER-ENVIRONMENT ONLY** — render two enrolled subjects; assert no shared number exists.
11. **NO BACKFILL, NO DEFAULTS** — assert a student enrolled since day one with no records renders
    **identically** to one enrolled yesterday. Paste both renderings.
12. **MALFORMED VS MISSING** — a fixture with a malformed timestamp is reported as a defect by a test;
    a fixture with a missing optional field renders with silence, not a substitute phrase.
13. **NO CELEBRATION** — grep for milestone/achievement/confetti/"first session"/conditional emphasis.
    **Assert the record region applies no conditional emphasis to any single event** — the first event
    is rendered like the ninth. Paste.
14. **NO COMPARISON** — grep for peer, cohort, average, percentile, rank, "students like". Expected:
    none.
15. **NO PREDICTION OR PACE** — grep for will, by, pace, ahead, behind, on track, forecast, estimate.
    Paste every hit with justification or removal.
16. **NO GUILT LANGUAGE** — grep for "haven't", "don't fall", "missed", "at risk", "days since".
    Expected: none.
17. **NO CTA ON THE REGION** — paste the region's DOM; no link, no button, no interactive element.
18. **ONE PRIMARY PER VIEW** — the region does not become a second primary in any state. Paste the
    measurement at 390.
19. **ARC INTEGRITY** — paste 4.7's shipped steps and the new region's steps side by side. **Identical
    names, identical order, no drift.** Report any difference.
20. **NOT A STEPPER** — DOM evidence: no segments, no filled/empty affordances, no "n of 7".
21. **REGISTRY + EVENT GATING** — with the registry as corrected, later steps are presented as ahead,
    never as incomplete or locked; a step with a live capability but no events gains no texture.
    Paste both.
22. **REGION CONTRACT COMPLIANCE** — renders nothing for a visitor and for a signed-out reader;
    server-side visibility; registry-gated. Paste the greps.
23. **EMPTY/SOME/MANY** — screenshots at 390 in all three, both themes; composition holds.
24. **NO LEAKAGE** — student B cannot see student A's records; RLS evidence plus the surface
    observation.
25. **PURITY AND DETERMINISM** — the module reads no clock, no DB, no env (paste its imports); same
    input twice returns a deep-equal result.
26. **ACCESSIBILITY** — one h1 per view, heading nesting, text-only status (never colour or position
    alone), keyboard, screen-reader order, contrast at both themes with measured ratios, grayscale
    screenshot, reduced motion, no-JS, 200% and 400% zoom, WCAG 1.4.12 text spacing, touch targets.
27. **MOBILE-FIRST** — 390 first paint screenshots; the **PRIMARY ACTION ABOVE THE FOLD** gate
    (P5-R3's standard) still passes on every route the region appears on.
28. **PERFORMANCE** — JS payload before/after; route LCP on the mid-range profile **with a discarded
    warm-up, per P5-R4 Addendum 3**; report the variance with sample counts, not a single figure.
29. **HARNESS EXTENDED + BASELINE UPDATED** — actual-vs-actual; paste pass/fail.
30. **PRODUCTION BUILD** — succeeds; `/dev/progress-language` absent or 404; no fixture data
    reachable; `.env.local` untouched and nothing secret printed.
31. **DPDP NOTE** — confirm in writing: no export, no aggregation, no third-party access, no retention
    behaviour added, and **report how the model's shape makes tutor visibility (P6) a policy decision
    rather than a schema rewrite.**
32. `git status --porcelain` — pasted raw.

---

## REPORT BACK

1. Files created / modified, and which order 5.5 and 5.6 ran in
2. **The vocabulary document**, in full
3. **What `progress_record` can and cannot express**, and whether it needs a 5.1 amendment
4. The computation module's exports, verbatim, and the proof that no ratio, composite or prediction is
   expressible
5. The traceability mechanism, with one worked example
6. **The arc candidates you considered and the one you shipped**, with reasoning
7. **The honest boundary sentence** for an empty record, and why it does not read as an accusation
8. The zero/one/many renderings, pasted
9. Every sweep result: banned words, ratios, zeros, composites, cross-subject, backfill, celebration,
   comparison, prediction, guilt
10. Arc integrity against 4.7, and the not-a-stepper evidence
11. Accessibility, performance with the warm-up discarded, JS payload, harness and baseline result
12. **What is real today, and what exists only as a fixture**
13. The DPDP note and the tutor-visibility shape report
14. Anything you could not implement, anything deferred, and confirmation nothing was half-built
15. Confirmation nothing outside the model report, the computation module, the arc region and the
    vocabulary document was changed

**STOP after the report.** Do not begin Step 5.7.
