# TUTORS ACADEMY — PHASE 6 · STEP 2: THE TUTOR SHELL

Depends on 6.1 (the relationship model, the visibility ruling, the portal architecture), **P6-R1/R2/R3**,
5.3 (the composition patterns), 5.5 (the region contract), 5.7 (the states and `isolate.ts`), P5-R3 (the
fold gate) and P5-R7 (the registry's unit).

## RULINGS P6-R5 AND P6-R6 — CARRIED INTO THIS STEP

**P6-R5 — NO CLAIM SURVIVES THE PHASE IT WAS WRITTEN IN.** Three strings on `/tutor` are stale:
`tutor-portal.summary` (*"sessions, rosters, grading and earnings"*), `PORTAL_META.tutor.blurb` (*"Teach,
schedule, assess and get paid."*), and the Phase-1 `NotBuiltYet` sentence (*"the next build drops it into
this exact shell"*). **These are not design decisions. They are false claims — and two of them name
capabilities the roadmap does not contain.** DO-NOT-CHANGE protected the registry's *entries*; **it was
never a shield for copy that has since become untrue.** A false string is a defect of the same class as a
false nav item (P5-R7).

- **SWEEP THE CLASS, NOT THE THREE.** `PORTAL_META.*` for all three portals · `NotBuiltYet`'s sentences ·
  `tutor-portal.summary` · every Phase-1 placeholder string anywhere. **For each: the audience who can
  actually see it today** (a route's guard determines its audience — and if nobody can see it, say so
  plainly rather than implying an exposure), **the claim, true or false today, and the fix.**
- **REWRITE RULES:** true today · nothing named that the registry does not declare built · **no promise
  about a future build** (*"the next build drops it in"* is the same shape as 5.6's banned *"we'll keep
  track as you go"*) · 4.1's voice · **no management-console vocabulary** (P6-R3).
- **A PAYMENT CLAIM IS NOT MERELY UNTRUE COPY.** *"get paid"* implies a commercial relationship with
  tutors that this product has not defined, and possibly a regulated one. **No earnings, payments,
  payouts, or money language in any string, at any phase, until a ruling.** Record it in the refusals.
- **ADMIN IS INCLUDED.** Its blurb almost certainly has the same problem, and admin is architectural
  only — **its copy may not promise an admin product.**
- **STRINGS THAT ARE ALREADY TRUE DO NOT CHANGE.** The sweep reports verdicts; only false strings move.
  Do not reopen honest copy on the student side.
- Rewrites are **correction events** in the baseline (D-08 precedent), not redesigns. **If a rewrite
  would change the homepage, STOP AND REPORT** — the registry feeds Scenes 5-7, and that would be a
  declared exception with strings before and after.

**P6-R6 — THE HARNESS'S IDENTITY AXIS IS STANDING.** A tutor was admitted to a student's draft door and
**no harness saw it, because no harness signs in as a tutor.** The harnesses covered states x viewports x
themes; **the reader class was not a dimension.** It becomes one, permanently:

1. **ONE SHARED IDENTITY SET**, defined once and used by every matrix harness: *visitor (no cookie)* ·
   *expired session* · *student A* · *student B* · ***tutor T — related to A, in one subject only*** ·
   ***tutor U — related to nobody*** · *admin (no account exists — record the absence explicitly, as an
   absence, so a later phase cannot silently inherit the gap).*
2. **ROUTES x READER CLASSES, every cell an expected outcome:** status code, where it lands, what
   renders. **Committed as a table and diffed like a baseline.** The tutor defect becomes a NAMED
   REGRESSION ROW: **tutor T is denied student A's draft door** — a tutor's access is scoped to the
   relationship and the subject, and a draft door is neither.
3. **A COVERAGE GATE:** every route in the app's route table must appear in the matrix, and **a route
   present in the app but absent from the matrix FAILS the harness.** *That is the instrument that
   would have caught this — the defect was not a wrong expectation, it was a reader class nobody
   tested.*
4. **EVERY NEW ROUTE AND EVERY NEW REGION ADDS ITS ROW IN THE SAME STEP.** A step that adds a route
   without a matrix row fails the coverage gate.
5. **RELATED AND UNRELATED ARE BOTH TESTED — testing one tutor is insufficient.** The interesting
   boundary is *related in this subject* against *everything else*.
6. The tutor test account is created by the existing fixture machinery (`*@test.*.invalid`, service
   role). **The production role path still does not exist — say so again in the report.**

**Report:** the identity set · the matrix (or its scope) · the tutor regression row · the coverage gate's
result **proven by deleting one route's row and watching it trip** · and the defect's new status:
**caught by a gate, not by a human.**

**PRECONDITION NOTE — P5-R10 (E-23) SHOULD BE CLOSED.** The environment page's reader-class table is this
step's matrix input. **Confirm it is done; if it was deferred, say so and why before building.**

**PRECONDITION — 6.1 EXECUTED AND REPORTED.** Quote three things from it before building: its P6 provider
verdict · its relationship creation-flow recommendation · and whether a relationship between two test
accounts exists yet (if none can exist, the shell's only reachable production state is the origin state
— say so and design accordingly).

**THIS IS THE FIRST SURFACE IN THIS PRODUCT WHERE ONE PERSON'S LEARNING IS RENDERED FOR ANOTHER PERSON.**
Everything before it was one person looking at themselves. **So P6-R2 is not a guideline for this step;
it is the ceiling — and the shell must be structurally incapable of crossing it, not merely careful.**

---

## WHY

The student shell's job was orientation toward momentum. **The tutor shell's job is the next useful
teaching act** — the same three-second rule, the same refusal of the dashboard, a different subject.

**AND TODAY THERE IS ALMOST NOTHING TO PUT IN IT.** No classes (P7), no recordings (P8), no learning
events (5.6: the table does not exist). **So this step is mostly frame, states and refusals** — built now
so that P7 and P8 *populate* the tutor's space rather than rebuild it. That is exactly what 5.3 did for
the student, and it is why the student's later phases have been additive.

**AND THE INSTINCT HERE IS STRONGER THAN IT WAS FOR THE STUDENT.** A tutor opening their space wants to
know *who needs me*. Every conventional design answers that with a list sorted by need, and every version
of that answer is **software issuing a verdict about a child to an adult with authority over them.**
P6-R3 bans it by name. **This step's job is to make the ban structural: the shell must have no
mechanism — no query, no field, no sort — that could produce it even if someone asked for it later.**

---

## FIRST: INSPECT

1. **6.1's report, in full** — the model, the policy matrix, the visibility document, the portal
   architecture, the creation-flow recommendation, the levers recommendation, and **the P6 provider
   verdict.**
2. **`docs/TUTOR_VISIBILITY.md`** — the permitted/refused table. **This step's shell must render a
   subset of the permitted column and nothing else.**
3. **5.3's shell as built** — its composition, its one-dominant-surface result, its three null states,
   its slot map, its never-contains list, its harness. **Reuse the patterns; do not invent a second
   shell language.**
4. **5.5's region contract** and **5.7's `isolate.ts`** — how regions render nothing and how failures
   stay silent. **The tutor's scope is a third scope of the same registry, never a second registry.**
5. **5.4's resolver and its extension contract**, including 6.1 Part 7's verdict — **does a tutor-side
   answer come from the engine, or directly from the relationship model?** Follow the verdict; if it is
   ambiguous, say so and report the choice.
6. **5.7's state inventory** — which of its 23 rows apply to a tutor surface, and which do not.
7. **P5-R7's registry and the entries 6.1 added** — and what the tutor nav may therefore name.
8. **`/tutor` as it renders today** — the placeholder, the guard, and its status codes for all three
   reader classes.
9. **Every standing ban**, collected: the vocabulary documents · the subject rule · never-emit-a-zero ·
   no comparison · no celebration · no report-only elements · the engine's honesty rules · 5.7's error
   language rules.

Report findings before building.

---

## RULING P6-R4 — WHEN THERE IS NO NEXT ACT, THE SURFACE SAYS SO

**5.1's three-second rule asks what a tutor should do next. Today the honest answer is "nothing yet",
and an answer of "nothing yet" is still an answer.**

- **No invented CTA.** If no action resolves, the dominant surface **states the situation** rather than
  offering a button that leads nowhere (P5-R7) or a disabled control (2.6).
- **It says why, and it is not an apology.** The reason is structural and true: relationships are set up
  by the academy; teaching surfaces arrive in later phases. **Name the fact, in the voice.**
- **The three-second test still applies, and it counts as passed when the reader knows there is nothing
  to do and why.** Report how you verified that, because "the reader is not confused" is the claim.
- **It may not become a dead end with nothing in it.** A statement is not an empty page: the composition
  is complete, the brand frame holds, the page is a place. **The student's State A was the same
  problem and the same answer** (5.3).

---

## THE LOCKED DECISIONS

**1. THE SUBJECT IS THE TOP-LEVEL UNIT; RELATIONSHIPS LIVE WITHIN IT.**
A tutor with three students in Physics and one in History sees **two subjects** — Physics with three
relationships, History with one. **Never a flat list of students.** This is P6-R1's structural
expression: the shell is organised the way the relationship is scoped, so a cross-subject view is not
merely banned, it is unrepresentable. **Report how the composition makes a flat list impossible rather
than discouraged.**

**2. A ROW CARRIES THE RELATIONSHIP, AND NOTHING EVALUATIVE.**
A row is: **the student's display name · the subject · and nothing else.** No progress indicator, no arc
position, no recency, no last-seen, no counts, no status dot, no colour, no icon, **no ordering by
anything a student did.**
- **The arc position is permitted to a tutor (P6-R2) and is NOT permitted on a row.** It belongs on the
  relationship's own surface (6.3), where it is read as a student's journey rather than scanned as a
  column. **A column of arc positions is a leaderboard with the numbers filed off** — report that
  reasoning in the report, and report whether you agree.
- **ORDERING IS FIXED AND NON-EVALUATIVE.** Alphabetical by student display name within a subject, or by
  relationship start — **state which, and state the reason.** Ordering by any activity proxy is a
  defect. **Paste the sort.**

**3. THE SHELL CANNOT REACH WHAT THE POLICY FORBIDS.**
The shell's data access goes through **the relationship-scoped reader only** — the one whose queries the
RLS policy permits. **The shell's query layer must have no path to another subject's events, to a
non-related student, or to any aggregate.**
- **PROVE IT STRUCTURALLY:** paste the shell's imports and its data access, and show there is no other
  table it can name.
- **AND PROVE IT BY ATTACK:** attempt to render a non-related student's name and a related student's
  other subject — through the shell's own code path. **Both must be impossible, not merely unused.**

**4. MOBILE-FIRST, AND THE TUTOR IS ALSO ON A PHONE.** 390 reference, primary answer above the fold
(P5-R3's named gate), ~44px targets, no hover dependency, mid-range Android budget. Report the same
measurements 5.3 reported.

**5. ROOM RULES. COMPACT DENSITY. NO SUBSTRATE. NO ANIMATION BEYOND THE EXISTING GRAMMAR.**

**6. NOTHING RENDERS UNTIL IT HAS REAL DATA** (5.3's rule): no empty boxes, no skeletons, no "coming
soon", no grey panels. **And no slot counts, anywhere.**

**7. THE NAV NAMES ONLY WHAT RESOLVES.** ≤3 destinations, every one returns 200, and **nothing named may
be a capability the registry does not declare built** (P5-R7). Report the nav items and their status
codes.

---

## THE STATES

**A · NO RELATIONSHIPS** — the origin state, and today's only reachable production state. P6-R4 governs
it. **Propose 2–3 copy candidates and report the choice.**

**B · RELATIONSHIPS, NO EVENTS** — a relationship exists and its record is empty. **The row renders; the
region renders nothing** (5.3/5.5). **No "0", no "no activity", no flag, ever** — P6-R2's strongest rule,
held here because the reader is a person whose judgment about a child is part of the harm.

**C · RELATIONSHIPS AND EVENTS** — **not reachable today.** Learning events do not exist. **Build the
composition so it holds when events arrive, and state plainly in the report that it cannot be reached
yet.** If you can render it only with fixtures, do so in `/dev/tutor-shell` and label it.

**ALL STATES:** server-rendered, both themes, **and the failure/partial behaviour inherited from 5.7** —
a failed supplemental region is silent and logged; the primary answer is never silently absent.

---

## BUILD

**PART 1 — THE ROUTE AND IA.** `/tutor` stands (P5-R1's precedent: the route that exists is the route).
Report the IA, the nav items, and the status code of every destination.

**PART 2 — THE SHELL COMPOSITION.** One dominant surface (P6-R4), subject groups with relationship rows
inside them, the ordering rule, compact Room density. **Report the one-dominant-element measurement the
way 5.3 did.**

**PART 3 — THE STATES.** A, B, C as above, all server-rendered, with screenshots at 390 and 1280, both
themes.

**PART 4 — THE THIRD REGION SCOPE.** The tutor scope in the existing registry: what a tutor's regions
will be and which phase populates each. **Nothing renders today.** Report the map.

**PART 5 — THE NEVER-CONTAINS LIST, EXTENDED.** 5.3's list plus P6-R3's bans, written out and swept:
no student count · no roster as a flat list · no progress columns · no sortable table · no "needs
attention" · no alerts, triage or queues · no engagement metrics (sessions, minutes, last seen, logins)
· no comparison or ranking, including inverted ones · no export or bulk download affordance · no
notification affordance · no skeletons or shimmer · no invented activity · no second primary · no dead
nav item. **A written list, then a sweep, then a report.**

**PART 6 — THE VISIBILITY DOC.** Append to `docs/TUTOR_VISIBILITY.md`: **what the tutor's surfaces may
render** — row fields, ordering rule, the arc's placement, region rules, and the refusals as they appear
in the interface. One page, no duplication of 6.1's table.

**PART 7 — THE REGISTRY.** Add what this step genuinely delivers, using P5-R7's unit. **Do not mark
anything live that has no surface**, and report the homepage's labels string by string before and after
(declared exception if any changes).

**PART 8 — `/dev/tutor-shell`** (dev-only, `NODE_ENV !== 'production'`): states A, B and C rendered side
by side · the subject-grouped composition at one/two/four subjects · the ordering rule demonstrated with
a shuffled fixture input · **the two attempted violations from Locked Decision 3, shown as impossible** ·
grayscale, reduced motion, no-JS, 390 first paint · the never-contains list rendered · and a plain
statement of **what is real today and what is a fixture.**

---

## CONSTRAINTS

- **NO SECOND SHELL LANGUAGE.** Reuse 5.3's composition patterns and 5.7's state machinery.
- **NO ENGINE CHANGE.** Follow 6.1's provider verdict; if a tutor-side answer needs a provider, it obeys
  5.4's contract in full — capability-gated, one answer, resolved href.
- **NO SCHEMA CHANGE.** If the shell needs a field that does not exist, **STOP AND REPORT.**
- **NO AGGREGATE QUERY, NO EXPORT PATH, NO THIRD-PARTY ACCESS** — and no code that would make one easy
  to add later. Report the greps.
- **NO NEW TOKENS, COMPONENTS, PRIMITIVES, MOTION OR DEPENDENCIES.**
- **NO CLIENT JS ADDED.** Report the payload before and after.
- **NO SEEDED OR DEMO DATA IN PRODUCTION.** Relationships between test accounts only.
- **NO TUTOR ACTION THAT CHANGES ANYTHING** — no notes, no messages, no flags, no assignment, no
  relationship creation. **This step renders; it does not act.**
- Do not touch the certified subject system, the brand frame, the scene spine, any Phase 3/4 surface,
  5.1's model, 5.3's student shell, 5.4's resolver, 5.5's write and region contract, 5.6's module and
  documents, or 5.7's states.
- **DO NOT BEGIN STEP 6.3.**

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives · brand mark, lockup, nav shell · subject system 3.1–3.6 ·
3.6's chrome and honest labels · the 3.7 baseline · the scene contract, spine, scroll grammar, voice
document · Scenes 0–8 and the footer · 4.9's and 5.8's findings · 5.1's model and policies · 5.3's IA,
ratio, fold gate · 5.4's tiers, treatments, provider contract · 5.5's predicate, write, region contract ·
5.6's model, vocabulary, arc · 5.7's inventory, logger, `isolate.ts` · 6.1's relationship model, policy
matrix and visibility ruling · the registry's existing entries · `docs/proposed/progress_record.sql` ·
existing build and deploy setup.

---

## TESTS (all required)

1. **PRECONDITION** — 6.1's provider verdict, creation-flow recommendation, and whether a test
   relationship exists. Pasted.
2. **ONE DOMINANT SURFACE** — at 390, exactly one element dominates in every state. **Report the
   measurement**, as 5.3 did.
3. **THE THREE-SECOND TEST** — per state, what the reader identifies, and how quickly. For the origin
   state, confirm the reader knows **there is nothing to do and why**. Screenshots.
4. **SUBJECT IS THE UNIT** — with four relationships across two subjects, paste the rendered structure.
   **Confirm no flat student list exists in the DOM.**
5. **ROWS CARRY NOTHING EVALUATIVE** — paste the row's full DOM and every field it renders. **Grep the
   row component for arc, position, progress, count, last, seen, status, activity. Expected: none.**
6. **ORDERING IS FIXED** — paste the sort and demonstrate it with a shuffled input. **Confirm no
   activity-derived key appears in the ORDER BY.**
7. **THE TWO ATTEMPTED VIOLATIONS** — attempt to render a non-related student's name, and a related
   student's other subject, **through the shell's own code path.** Both impossible. **Paste the
   attempts and the failures.**
8. **THE SHELL'S REACH, STRUCTURALLY** — paste its imports and its data-access module. **Show it cannot
   name any table outside the relationship-scoped reader.**
9. **NO AGGREGATE** — grep for count, average, rank, top, most, least, order by in any tutor query.
   **Expected: none.** Paste.
10. **NO EXPORT PATH** — grep for csv, export, download, report-generation. **Expected: none.** Paste.
11. **NEVER A ZERO TO A TUTOR** — with a relationship and no events, paste every string the tutor's
    surface renders. **No "0", no "no activity", no "hasn't started", no flag, no colour.**
12. **NOTHING RENDERS WHEN UNPOPULATED** — DOM evidence at the region level; empty regions produce no
    markup, not empty containers.
13. **NAV RESOLVES** — every item 200. **Paste the list with status codes.**
14. **REGISTRY HONESTY** — the entries added, and the homepage's labels before and after, string by
    string.
15. **STATE C HONESTY** — confirm and report that the populated state **cannot be reached today**, and
    that its composition is verified only with labelled fixtures.
16. **ERROR AND PARTIAL STATES** — a failed region is silent and logged; the primary answer is never
    silently absent. Paste both, with the log line.
17. **MOBILE-FIRST** — 390/360/320 and 1280, both themes, no horizontal scroll; **the PRIMARY ACTION
    ABOVE THE FOLD gate where an action exists**, and for the origin state, the statement's position.
    Screenshots.
18. **ACCESSIBILITY** — one h1, heading nesting, the subject groups as labelled groups, each row's link
    named with student and subject, text-only status, keyboard pass, screen-reader reading order,
    contrast ratios both themes, grayscale, reduced motion, no-JS, 200%/400% zoom, 1.4.12 text spacing,
    ≥44px targets. Paste.
19. **NO-JS** — every state complete and correct, server-rendered. Screenshot.
20. **PERFORMANCE** — payload before/after, LCP on the mid-range profile with a discarded warm-up and
    sample counts, TTFB, round trips. **No canvas or WebGL.** Paste.
21. **NO CLIENT JS ADDED** — per-route payload delta, pasted.
22. **HARNESS EXTENDED** — the tutor route in the shell harness's shape, 390 reference, plus the fold
    gate and the one-dominant-surface check. Baseline pinned actual-vs-actual. **Paste pass/fail.**
23. **DPDP SWEEPS** — no aggregate · no export · no behavioural field · no cross-subject access · no
    non-related access. **All five pasted, each with its evidence.**
24. **ROW COUNTS** — non-test identities in every table, **expected zero**, including relationships.
    Paste.
25. **PRODUCTION BUILD** — succeeds; `/dev/tutor-shell` absent or 404; no fixture data reachable;
    `.env.local` untouched and nothing secret printed.
26. **THE STUDENT SIDE IS UNCHANGED** — shell and environment harnesses show no diffs. Paste.
27. **WHAT DOES NOT EXIST** — a plain list of everything the tutor's space still cannot do, so the
    distance is written down rather than implied. Paste it.
28. **THE STALE-STRING SWEEP (P6-R5)** — every portal-metadata and placeholder string, with its
    audience, its claim, its truth verdict, and its rewrite. **Paste old and new side by side.** Confirm
    the homepage is unaffected, or stop and report. Confirm admin's string was swept too, and confirm no
    string that was already true was changed.
29. **THE IDENTITY MATRIX (P6-R6)** — the shared identity set · the routes x reader-classes table with
    expected outcomes · **the tutor regression row (tutor T denied student A's draft door)** · the
    coverage gate, **proven by deleting one route's row and watching it fail** · related and unrelated
    tutors both exercised. Paste all of it.
30. `git status --porcelain` — pasted raw.

---

## REPORT BACK

1. Files created / modified, and 6.1's three quoted items
2. **The IA and nav**, with status codes
3. **The one-dominant-surface result**, and the three-second test per state
4. **The composition**, and how it makes a flat student list unrepresentable
5. **The origin-state copy candidates and your choice**, with reasoning
6. **The row's exact fields**, and the ordering rule with its reason
7. **The two attempted violations**, and the structural proof the shell cannot reach beyond the policy
8. The arc-on-a-row reasoning, and whether you agree with the ruling
9. The states A/B/C with screenshots, and the honest statement that C is unreachable today
10. The third region scope map, and what renders today (nothing)
11. The never-contains sweep results
12. **What the tutor's space still cannot do** — the distance, listed
13. Registry additions and the homepage's labels before/after
14. Accessibility, mobile-first measurements, performance, JS payload, harness result
15. The DPDP sweeps
16. Anything you could not implement, anything deferred, and confirmation nothing was half-built
17. Confirmation nothing outside the tutor shell, the third region scope and the documents was changed
18. **The stale strings** — every string, its audience, its verdict, and its rewrite, side by side;
    confirmation the homepage is unchanged and that already-true copy was left alone
19. **The identity matrix** — the set, the coverage gate's proof, the tutor regression row, and the
    defect's new status: **caught by a gate, not by a human**

**STOP after the report.** Do not begin Step 6.3.
