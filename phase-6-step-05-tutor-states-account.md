# TUTORS ACADEMY — PHASE 6 · STEP 5: THE TUTOR'S STATES, THE ACCOUNT SURFACE, AND THE HONEST DISTANCE

Depends on 6.1 (model, policies), 6.2 (the shell, the identity matrix), 6.3 (the relationship's surface),
6.4 (the levers and the settings write), 5.3 (the account surface's precedent), 5.7 (the state
inventory, `isolate.ts`, the logger), and every ruling in force (P6-R1 through P6-R20).

**PRECONDITION — 6.3 AND 6.4 REPORTED.** Quote the report state of each. **If either has not reported,
run it first and say so** — this step reads their surfaces as a set and cannot audit what does not
exist. Also **carry forward any close-outs either left open**, as Part 0.

**A NOTE ON THIS STEP'S OWN NAME.** The arc called it *"the tutor's states with real content"* — **that
was stale when it was written, and it is corrected here: there is no content until Phase 7** (no classes,
no recordings, no learning events). **The phase's own plan carried a claim it could not deliver, which is
the P6-R5 class of defect applied to the plan rather than the product.** This step is states, the account
surface, and the honest distance — and nothing pretends otherwise.

**THIS STEP BUILDS ALMOST NOTHING.** It audits a set of surfaces that were each verified alone, closes the
one destination nobody has looked at, applies 5.7's write rules to 6.4's write, and writes the distance
down. **If it turns into a feature step, it has failed.**

---

## WHY

**Three tutor surfaces now exist — the shell, the relationship, and the settings — and no one has read
them together.** Each was verified against its own brief: one dominant element, one primary, 390-first,
the refusals swept. **What none of them has been judged against is the product's own state language.**
What does a tutor see when a read fails? When the session ends mid-save? When the settings row they are
editing is deleted by a co-tutor between load and submit? **5.7 answered those questions for the student
space and the enrolment write. They were never asked of the tutor's.**

**AND ONE NAV DESTINATION HAS BEEN RENDERING SINCE 6.2 WITHOUT ANYONE DECIDING WHAT IT IS.** `Account`
resolves — 6.2 verified every destination returns 200 — **but resolving is not the same as being true.**
That is the P5-R7 defect in its quietest form: not a link that 404s, but a page that exists and says
nothing anybody chose.

**AND THE THIRD REASON IS THE ONE THAT MATTERS MOST.** Phase 6 has now built a shell, a lens on one
student, and a control over a shared room — **and every one of them is mostly empty, because P7 and P8
have not happened.** That emptiness has been named honestly in three separate step reports. **It has
never been named to the tutor, in the place the tutor would look.** A person who has been given access to
something and finds nothing may conclude the product is broken, or that they are — **and neither is
true.** Naming the distance where it is felt is the last thing this phase owes the tutor before its gate.

---

## RULINGS P6-R13 AND P6-R17 TO P6-R20 — CARRIED INTO THIS STEP (from 6.4's close)

**P6-R13 — 6.1's LEVERS RECOMMENDATION IS SUPERSEDED, NOT OVERRULED.** 6.1 recommended
`tutor_environment(tutor_id, subject_id, accent, atmosphere, motif, motion, density)`, *"rendered for a
student only through an active relationship"*. 6.4's precondition caught the conflict with
P6-R10/R11/R12 and **escalated — which was correct: the brief's *"if the recommendation differs, build
6.1's"* was written for TASTE differences, not architectural ones. A conflict between a recommendation
and a standing ruling is a RULING MATTER.**

- **6.1's recommendation is PREMATURE, not wrong.** It cannot answer **"two tutors, one student, one
  subject"** — two active relationships, two candidate rooms, **no rule for choosing**, which is the
  ordinary state of an academy with two Physics tutors — or **the visitor**, who has no relationship and
  therefore no defined room on a route that must render the subject's identity. **Both answers require a
  COHORT, and cohorts arrive in Phase 7.**
- **THE SETTINGS ARE SUBJECT-KEYED** (`environment_settings(subject_id, …)`) — as built. **ACCENT IS
  NEVER A LEVER**: 3.1's triad is the subject's *identity*, guarded by 3.7's ΔE check, and **a closed
  enum still means *Physics has no colour — it has as many colours as tutors.*** **IDENTITY LEVERS**
  (accent triad · the mark · motif-as-identity) are **immutable at every phase without a ruling**;
  **CHARACTER LEVERS** (atmosphere · motionChar · density · motif-as-texture if separable) stay
  adjustable, subject-keyed, from authored validated sets.
- **REOPENING CONDITION, NAMED** — so this is a deferral and not a closure: **when Phase 7 introduces
  classes/cohorts, *which room does this student get* is answered by their class, and cohort-scoped
  character levers reopen WITH A RULING.** Carried in the exceptions register with that condition.
- **CONSEQUENCE A:** a tutor's shaping **persists after their relationship ends** — the values belong to
  the subject, not the tutor; a co-tutor can change them and revert-to-authored always exists. *(Open
  user question: should shaping revert when the shaping tutor leaves? Nothing blocks on it.)*
  **CONSEQUENCE B:** **write eligibility stays relationship-bound** — persistence is subject-scoped,
  permission is not.
- **DO NOT BUILD FOR THE DEFERRED MODEL:** no cohort column, no tutor column, no reserved field, no
  migration path sketched.

**P6-R17 — A LIVE SURFACE WITH NO DOOR IS A DEFECT.** 6.4 shipped the shaping surface reachable **only by
URL**. That is the inverse of a dead nav item (P5-R7): **a capability that effectively does not exist for
its user.** Fix it here, as a bounded change with a declared exception.
- **Primary entry: the subject group in the shell.** The shell is organised by subject (P6-R1); shaping
  belongs to the subject; **the group header carries one quiet link.** Its weight may not exceed a
  relationship row's, and it may not become a second primary.
- **Contextual entry: the environment page itself**, for a reader who holds an active relationship in
  that subject — **a quiet link, never a control that competes with the room's composition.**
- **NOT on the relationship's surface.** *"Shape this environment"* on a student's page invites exactly
  the reading P6-R10 forbids — that the room can be shaped **for that student.**
- Link appears **only where the write permission exists.** Re-run the shell harness: **the composition,
  the ratio and the fold gate must show no diffs** beyond the added link.

**P6-R18 — THE VALIDATOR IS WIRED TO THE BUILD.** A validator that must be remembered is a validator that
will be skipped. 3.7's guarantee is that **the build fails on a bad configuration** — so `npm run build`
must run it. Wire it in this step (a `prebuild` script or the project's equivalent).
- **Prove it by the npm path:** introduce a failing combination, run `npm run build`, **paste the failure.**
- If changing package.json would disturb the release process, **STOP AND REPORT** rather than working
  around it.

**P6-R19 — A TUTOR MAY STAND IN THE ROOM THEY SHAPE.** 6.4's asymmetry is a defect, and so is its
consequence: **the shaping surface links to the room, and for a draft subject that link 404s — a live link
to a 404.**
- **A reader with an active relationship in a subject may view that subject's environment page**, draft
  or not — **rendered as the visitor's rendering: identity, structure and honest labels only. No student
  regions. No student data. No change to P6-R2.**
- The reasoning, in the record: **a draft flag is a readiness flag, not a secrecy flag** (3.7's validator
  already guarantees draft subjects cannot ship broken); **5.3 already ruled that an enrolled identity
  reaches a draft environment**; and **a relationship is a door of its own** (P5-R4's own logic, extended
  from enrolment to relationship). Shaping a room you cannot look at is shaping blind — and the product
  asks tutors to shape.
- **THIS REVISES A RECORDED GATE ROW.** 6.2's row *"tutor T denied student A's draft door"* is
  **rewritten, not deleted**: *tutor T is admitted to the draft environment's identity, and denied every
  student region of it.* Add identity-matrix rows for the tutor × draft-environment cell across every
  draft subject. **A revised row is a declared exception with its reasoning** — never a silent edit.
- **Confirm no new policy is required** and that no student-data path becomes reachable.
- **This is the second rule revised by later evidence in one phase** (P6-R13 the first). The pattern is
  healthy; **what must never happen is a silent revision.** Both live in DECISIONS with their evidence.

**P6-R20 — A DECLARED COST IS RECORDED, NOT HIDDEN.** The visitor environment's TTFB rose ≈120 ms because
it now makes one anon round trip where it previously made none. **That is the price of P6-R10's "the same
environment for everyone", and it is accepted.**
- **Record it in the baseline as a DECLARED COST with its cause** — not as drift, not as an unexplained
  diff.
- **Re-measure with sample counts and a discarded warm-up**, both viewports, and paste it.
- **Report whether the settings read is issued in parallel with the page's other reads or sequentially.**
  If sequential, make it parallel; if already parallel, **the 120 ms is the round trip and it stands.**
- **NO CROSS-REQUEST CACHING** unless a save invalidates it, and do not build that now — a stale room
  after a tutor saves is a worse defect than 120 ms.
- **One line for Phase 10:** this is the first time a public page pays for a write-able setting —
  static/ISR treatment for the visitor environment is a Phase 10 question. **No work now.**

## FIRST: INSPECT

1. **6.3's and 6.4's reports**, and any close-outs they left open.
2. **5.7's `docs/STATE_LANGUAGE.md`** — the 23-row inventory, and **which rows apply to a tutor
   surface.** Some do not: a tutor has no State A/B/C, and no enrolment journey.
3. **5.7's `isolate.ts`, the logger, and the honest page** — the machinery this step reuses rather than
   rebuilds. **Name the shared pattern once.**
4. **5.3's account surface** — what the student's Account destination renders today, so the tutor's
   matches it. **The precedent is the student's, not a new design.**
5. **`/tutor/account` as it currently renders** — what it says, and who decided it. **If it renders a
   placeholder, say so plainly.**
6. **6.4's write** — its POST, its idempotency, its failure paths, **and specifically: what it renders
   when the save fails, when the outcome is unknown, and when the session has ended.** Report what was
   tested and what was not.
7. **6.4's settings read's failure rule** — the environment renders the authored default and logs. Confirm
   it, and check **the shaping surface's own** read failure, which is a different case.
8. **6.2's identity matrix** — the routes × reader-classes table and the coverage gate, as it stands after
   6.3 and 6.4 added their rows.
9. **Every tutor surface's copy**, collected as strings — for the honest-distance pass.
10. **Every standing rule that governs states and copy:** P5-R8's error language and its twelve parts ·
    P5-R9's failure-is-never-absence · the subject rule · 5.6's vocabulary · P6-R3's console bans · the
    visibility document's refusals.

Report findings before building.

---

## RULING P6-R14 — THE ACCOUNT SURFACE SHOWS A READER THEIR OWN IDENTITY AND THEIR WAY OUT

**One page, three things, and nothing else:**
1. **Who they are signed in as** — their own display name, and **their own email**, because it is their
   own data and it is how a person verifies which account they are in.
2. **What they are, stated as fact and not as a setting** — a tutor. **A role is not selectable, not
   editable, not requestable from this page.** There is no "become a tutor" affordance, because the role
   is not self-service (6.1) and **an affordance that cannot succeed is a false one** (P6-R11's rule).
3. **The way out** — sign out, as a real control.

**AND:**
- **No settings. No preferences. No notifications. No profile editing. No avatar.** Nothing this product
  does not have.
- **Match 5.3's student account surface** in structure and restraint. **Report both side by side**; if the
  student's renders differently from this ruling, **say so and follow the student's**, then report the
  divergence — **consistency inside the product outranks a ruling's letter.**
- **A tutor's account page is not a place to tell them about the product.** No roadmap, no changelog, no
  "coming soon".
- **Where the tutor's own arrangements will live** — which relationships exist, and which have ended
  (P6-R9 named this surface and deferred it) — **is documented here as a decision with a named future
  home, and not built.** Relationship management requires the consent ruling; **do not invent it.**

---

## RULING P6-R15 — EVERY WRITE HAS A GET THAT SETTLES IT

**This generalises 5.7's unknown-outcome rule from one write to all of them, because Phase 7 will add
more.**

- **When a write's outcome is unknown, the product renders no verdict.** Not "saved", not "failed",
  not "try again". *(P5-R8.1, unchanged.)*
- **Every write in this product has a reading that settles what actually happened, and that reading is
  where the student or the tutor is sent.** For 5.5's enrolment write, the environment page — a GET that
  shows the true state. **For 6.4's settings write, the shaping surface itself**, which reads the current
  values. **For every future write, the same requirement: name the GET.**
- **A WRITE WITH NO SETTLING GET DOES NOT SHIP.** This is the check to apply in P7's design, and it is
  cheap to apply now.
- **No auto-retry, ever** (P5-R8.12). **Idempotency is what makes retrying safe, not what makes it
  automatic** — a POST that changes something is never retried behind the person's back.
- **Session expiry mid-write** (5.7's `reason=ended`): the person returns to where they were, in one
  plain sentence, **and the settled state is what they see on return** — not a message about what
  happened.

**APPLY IT TO 6.4'S WRITE IN THIS STEP**, and report: what the shaping surface shows after an
unknown-outcome save, after a failed save, after a session-ended save, and what a co-tutor's concurrent
change looks like when the second save lands.

---

## RULING P6-R16 — THE DISTANCE IS NAMED WHERE THE CAPABILITY WOULD BE

**A gap is not a changelog entry. It is a sentence where the person would look for the thing.**

- **Every tutor capability that does not exist yet is named at the place a tutor would reach for it** —
  not collected onto a status page, not listed on the account surface, **not in a single "what's coming"
  block.**
  - The shell already does this (P6-R4). **The relationship's surface does it (6.3's empty-record
    statement). The shaping surface has nothing missing — the levers are real.**
  - **The tutor's own subject page** — what a tutor sees about a subject they shape, beyond the levers —
    **is the likely gap. Report whether it exists and what it says.**
  - **Teaching surfaces** (sessions, assignments, feedback) are where a tutor would *most* expect
    something, and **they must be named at the point of expectation, in the voice, without apology.**
- **The rule's test: a tutor should never be able to say "I thought there would be somewhere to do X and
  I could not find whether that was me or the product."**
- **AND THE INVERSE, WHICH IS EQUALLY BINDING: DO NOT ADD A PLACE FOR A CAPABILITY THAT DOES NOT EXIST.**
  A page that exists only to say it is empty is worse than no page — **it invents a destination to hold a
  disclaimer.** (This is why the honest distance is *placement*, not construction.)
- **PRODUCE `docs/TUTOR_DISTANCE.md`:** one page, every unbuilt capability, **where it is named**, and
  what it will be when a phase delivers it. **It is a design document, not UI.**

---

## THE STATES AS A SET

**Read the tutor's three surfaces against 5.7's inventory as one experience.** For each state below, the
surface, what renders, **what it claims**, and the test that proves the claim:

1. **A read fails on the shell** — 6.2's behaviour; confirm it matches 5.7's rules.
2. **A read fails on the relationship's surface** — 6.3's behaviour.
3. **A read fails on the shaping surface.** *A different case from the environment's failed settings
   read:* there, the default is correct and the room renders. **Here, the tutor cannot see what the
   values are — and the correct answer is an honest failure, not a form pre-filled with defaults, because
   a form showing defaults that are not the current values would invite an accidental revert.** State
   this rule explicitly; **it is the one place in the phase where "fall back to the authored default" is
   wrong.**
4. **A region fails** — silent, logged, the primary answer never silently absent.
5. **The write is in flight** — what the tutor sees, and what is claimed while the outcome is unknown.
6. **The write failed, known** — a sentence beside the control.
7. **The write's outcome is unknown** — P6-R15.
8. **The session ended mid-save** — P6-R15's last clause.
9. **A co-tutor changed the values between load and submit** — **report what happens.** Last-write-wins is
   acceptable *if it is stated*; a silent overwrite of another tutor's change is not. **Report which it
   is, and if the answer is "silent", STOP AND REPORT** — that is a design decision, not an implementation
   detail.
10. **A relationship ends while the tutor has the page open** — the next request refuses (P6-R9's rule,
    applied to the tutor's own side): report what they see, and confirm it is not an error the person
    could have caused.
11. **The tutor's subject has no settings row** — 6.4's absence-equals-default, confirmed at the surface.
12. **500 / 404 on each of the three routes** — 5.7's honest page, in the brand frame.
13. **No-JS and reduced motion across all three** — every state complete, and the form still saves.
14. **The role's failure case** — a student who reaches a tutor route (6.2's matrix row) and a tutor who
    reaches a student route. **Both land somewhere true, in the voice, without alarm** (P5-R8.3).

**A row you cannot test is a row you report with its reason.** Do not fill it with a fixture and call it
verified.

---

## THE CONSOLIDATED SWEEPS

Run across **all tutor surfaces together**, not per surface:

- **The never-contains list** (5.3's, extended by P6-R3) — count · roster-as-list · progress columns ·
  sortable tables · "needs attention" · alerts · triage · engagement metrics · comparison · ranking ·
  export · notification affordance · skeletons · invented activity · second primary · dead nav · student
  count · recency of a student · any per-student anything.
- **The PII floor** — for every tutor surface: only a display name and the subject may appear about a
  student; **no email, no uuid, no contact detail, no auth metadata, no other subject.**
- **No aggregate, no export, no third-party access.**
- **The subject rule** — every sentence on every tutor surface, with its grammatical subject named. **And
  the identical-statement property wherever it applies** (6.3's empty record; 6.4's byte-identical
  environment).
- **The registry and the homepage** — entries, and labels string by string before and after.
- **The identity matrix** — confirm every tutor route has its rows, and **prove the coverage gate fails
  when one is dropped.**

---

## BUILD

**PART 0 — 6.3's and 6.4's open close-outs**, with evidence.
**PART 1 — THE ACCOUNT SURFACE** per P6-R14, with the student's beside it.
**PART 2 — P6-R15 APPLIED** to the settings write: the four cases, tested, with their outputs.
**PART 3 — THE STATES AS A SET**, all fourteen, each verified or reported untestable.
**PART 4 — `docs/TUTOR_DISTANCE.md`**, per P6-R16 — including the placement audit: **for each gap, is it
named where a tutor would look, and nowhere it shouldn't be?**
**PART 5 — THE CONSOLIDATED SWEEPS.**
**PART 6 — THE VISIBILITY DOC AND THE STATE LANGUAGE DOC** — append what this step decided, including the
shaping surface's read-failure rule and where relationship management will live.
**PART 7 — THE REGISTRY**, entries and homepage labels.
**PART 8 — `/dev/tutor-states`** (dev-only): all fourteen states rendered with their claims · the four
write cases · the account surface beside the student's · the consolidated sweep results · the distance
document rendered · grayscale, reduced motion, no-JS, 390 first paint · and a plain statement of **what is
real and what is simulated.**

---

## CONSTRAINTS

- **NO NEW FEATURES, NO NEW ROUTES, NO NEW MODEL.** This step audits, closes one destination, writes a
  document, and applies the four bounded rulings above. If a gap needs a *surface*, **report it — do not
  build it.**
- **NO SCHEMA CHANGE.** STOP AND REPORT if one is needed.
- **NO NEW TOKENS, COMPONENTS, PRIMITIVES, MOTION OR DEPENDENCIES.**
- **NO CLIENT JS ADDED.** Report the payload per route before and after.
- **NO ANALYTICS, BEACONS OR TRACKING.**
- **NO CHANGELOG, NO ROADMAP, NO "COMING SOON" ON ANY SURFACE** (P6-R12/P6-R16).
- **NO NEW PLACE FOR A CAPABILITY THAT DOES NOT EXIST.**
- Do not touch the certified subject system, the brand frame, the scene spine, Scenes 0–8, 5.1's model,
  5.3's student shell or account surface, 5.4's resolver, 5.5's write and region contract, 5.6's module
  and vocabulary, 5.7's machinery, 6.2's shell, 6.3's surface, or 6.4's model, surface and rules beyond
  what P6-R15 requires.
- **DO NOT BEGIN STEP 6.6** (the gate).

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives · brand mark, lockup, nav shell · subject system 3.1–3.6 ·
3.6's chrome and honest labels · the 3.7 baseline and the subject harness · the scene contract, spine,
scroll grammar, voice document · Scenes 0–8 and the footer · 4.9's and 5.8's findings · 5.1's model and
policies · 5.3's IA, ratio, fold gate, account surface · 5.4's tiers, treatments, provider contract ·
5.5's predicate, write semantics, region contract · 5.6's model, documents, arc · 5.7's inventory,
logger, `isolate.ts` · 6.1's relationship model, policy matrix, visibility ruling · 6.2's shell, ordering
rule, reader, attacks, identity matrix · 6.3's surface, route, reader · 6.4's settings model, read,
validator, rules, attacks · `docs/proposed/progress_record.sql` · existing build and deploy setup.

---

## TESTS (all required)

1. **PRECONDITION** — 6.3's and 6.4's report states quoted, and Part 0's close-outs with evidence.
2. **THE ACCOUNT SURFACE** — paste its full DOM and every string it renders; **three things only.**
   Paste the student's account surface beside it and report any divergence.
3. **NO ROLE AFFORDANCE** — grep the account surface and every tutor surface for any way to change,
   request or acquire a role. **Expected: none.** Paste.
4. **THE STUDENT ACCOUNT SURFACE IS UNCHANGED** — DOM hash before and after.
5. **P6-R15, CASE 1 — UNKNOWN OUTCOME** — cut the network during the settings POST: **no verdict, and the
   shaping surface shows the settled true state on return.** Paste the observation.
6. **P6-R15, CASE 2 — FAILED SAVE** — a sentence beside the control, no verdict about elsewhere.
7. **P6-R15, CASE 3 — SESSION ENDED MID-SAVE** — return to the same place, one plain sentence, the
   settled state rendered. Paste the journey with status codes.
8. **P6-R15, CASE 4 — CONCURRENT CO-TUTOR CHANGE** — report last-write-wins or otherwise, and **stop and
   report if it is a silent overwrite.**
9. **THE SHAPING SURFACE'S READ FAILURE** — **honest failure, NOT a form pre-filled with defaults.**
   Paste what renders, and the log line, and confirm the reasoning is stated in the code.
10. **THE FOURTEEN STATES** — each verified or reported untestable with its reason. Paste the table.
11. **THE REGION RULE STILL HOLDS** — a failed supplemental region is silent and logged; the primary
    answer is never silently absent. Paste.
12. **ROLE CROSSING** — a student reaching each tutor route, a tutor reaching each student route: status
    codes and what renders, **no alarm language.** Paste.
13. **NO-JS ACROSS ALL THREE SURFACES** — every state complete, **and the settings form still saves.**
    Screenshot.
14. **REDUCED MOTION ACROSS ALL THREE** — screenshots.
15. **THE DISTANCE, PLACED** — for each unbuilt capability in `docs/TUTOR_DISTANCE.md`, paste the exact
    place it is named in the product, **and confirm no capability is named in a place it does not belong**
    (no roadmap on the account page, no "coming soon", no advertising panel).
16. **NO NEW PLACE FOR A MISSING CAPABILITY** — confirm no route or surface was added by this step beyond
    the account surface being made true. **Report the route count before and after.**
17. **THE CONSOLIDATED NEVER-CONTAINS SWEEP** — paste every hit with its verdict, across all three
    surfaces at once.
18. **THE PII FLOOR** — for every tutor surface, paste the grep: display name and subject only.
19. **NO AGGREGATE, NO EXPORT** — paste both greps across all tutor routes.
20. **THE SUBJECT RULE** — paste every tutor-facing sentence with its grammatical subject named.
21. **THE IDENTICAL-STATEMENT PROPERTY** — wherever it applies (6.3's empty record, 6.4's environment):
    re-verify the bytes are identical across readers.
22. **THE IDENTITY MATRIX** — every tutor route has its rows; **prove the coverage gate fails when one is
    dropped.** Paste.
23. **THE HOMEPAGE AND EVERY CERTIFIED HARNESS** — no diffs, apart from declared exceptions; paste every
    pass count at one commit.
24. **MOBILE-FIRST** — the account surface and every state at 390/360/320 and 1280, both themes; **PRIMARY
    ACTION ABOVE THE FOLD**; one dominant element per view; ≥44px targets.
25. **ACCESSIBILITY** — one h1 per view, heading nesting, keyboard pass, screen-reader order, contrast at
    both themes with measured ratios, grayscale, text-only status, 200%/400% zoom, 1.4.12 text spacing.
26. **PERFORMANCE** — payload per route before and after; **no client JS added**; the account surface's LCP
    on the mid-range profile with a discarded warm-up and sample counts.
27. **REGISTRY + HOMEPAGE LABELS** — before and after, string by string.
28. **ROW COUNTS** — non-test identities in every table, **expected zero.** Paste.
29. **PRODUCTION BUILD** — succeeds; `/dev/tutor-states` absent or 404; no fixture data reachable;
    `.env.local` untouched and nothing secret printed.
30. **WHAT WAS NOT TESTED** — every state reported as untestable, with its reason, so the gaps in the
    evidence are written down rather than implied.
31. `git status --porcelain` — pasted raw.

---

## REPORT BACK

1. Files created / modified, and the two report states quoted
2. **The account surface** — what it rendered before, what it renders now, and the student's beside it
3. **P6-R15's four cases**, with their evidence
4. **The shaping surface's read-failure rule**, and why defaulting would be wrong here specifically
5. **The fourteen states**, each verified or reported untestable
6. **`docs/TUTOR_DISTANCE.md`** — the distance, and where each piece of it is named
7. The consolidated sweeps, with their counts
8. The identity matrix's coverage proof
9. Accessibility, mobile-first, performance, JS payload
10. **Anything this step found that is a design decision rather than an implementation detail** — the
    concurrent-change case above all **if it turned out to be a silent overwrite**
11. What was not tested, and why
12. Anything you could not implement, anything deferred, and confirmation nothing was half-built
13. Confirmation nothing outside the account surface, the write's failure behaviour, the documents and
    the dev route changed

**STOP after the report.** Do not begin Step 6.6 — the tutor experience validation gate.
