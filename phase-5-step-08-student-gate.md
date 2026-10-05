# TUTORS ACADEMY — PHASE 5 · STEP 8: THE STUDENT GATE

**The pass that closes Phase 5.**

Depends on 5.1–5.7 and every ruling in force (P5-R2 through P5-R9).

**PRECONDITION — P5-R9 CLOSED.** The swallow sweep, the contrast correction, and the flip alarm
reported. **5.7's defects fixed before this step starts**, because a gate that runs on a known-broken
build proves nothing about the build.

**THIS STEP IS VERIFICATION, NOT CONSTRUCTION.**
- **No new features, no new surfaces, no new components, no new copy beyond defect fixes.**
- **Defect fixes only, and only where the defect is demonstrable.**
- **No redesigns — a surface that needs a different design gets a RECOMMENDATION with evidence, not a
  rebuild.**
- **No student surface may be removed or cut inside this gate.** If a surface should go, recommend it
  with evidence and name it for a later step.
- **If you find yourself needing a RULING, STOP AND ASK.** A gate that quietly makes policy is a gate
  that cannot be trusted.

---

## WHY

Phase 4 built a homepage whose job is a **decision**, and its honesty was structural: it claimed what
it could do and named what it could not. Phase 5 built a student space whose job is **momentum**, in
five steps, each with a ruling attached.

**NO ONE HAS YET READ THE TWO HALVES AS ONE EXPERIENCE.** Every step so far was verified in isolation:
the homepage against its scenes, the shell against its states, the environment against its regions.
**This gate reads the seam** — and the seam is where this product is most likely to be dishonest,
because it is the only place where **one team's promise meets another team's delivery.** A homepage
that says *six environments* above a door that opens one. A promise map that names LEARN and INTERACT
above a space that has no lessons. A brand that says *choosing changes the environment* above an
environment that changed its accent.

**Every one of those is defensible in a step report and indefensible in a student's hands.**

**AND ONE QUESTION SITS UNDER ALL OF IT, WHICH IS THE GATE'S REAL SUBJECT:** *would a real student,
on a phone, at 8pm, on a slow connection, come back tomorrow?* Not *is it correct* — correctness was
each step's business. **This step asks whether the whole thing earns a second visit**, and it answers
with evidence rather than opinion, because "it feels good" is not a finding.

---

## FIRST: INSPECT

1. **All seven step reports**, and every ruling's implementation claim. **You are auditing your own
   prior work** — the gate's value depends on reading it adversarially.
2. **All harnesses and baselines as they now stand** — page · shell · environment · permissions ·
   states · progress · next-action · subjects · RLS. **Their pass counts, and what each one actually
   asserts.**
3. **The declared-exceptions register.** Every exception declared since P5-R2. **List them; the gate
   consolidates them.**
4. **4.9's gate method** — how the whole-page pass was run, so this gate is the same instrument
   applied to a different body. **Consistency of method is part of the evidence.**
5. **The promise ledger's raw material:** every claim the homepage makes about what happens after
   choosing — Scenes 2, 3, 4, 5, 6, 7, 8, and the footer — **extracted as strings**, with scene
   attribution.
6. **The registry as corrected**, and which surfaces read it. **It is now the single source of truth
   for both halves; verify that both halves are actually reading it.**
7. **`src/config/arc.ts`** and both consumers — Scene 7 and 5.6's region. **One definition, two
   renders: verify at runtime, not by inspection.**
8. **The legal blockers**, so they are restated and not quietly forgotten: privacy policy · terms ·
   contact route · DPDP Act 2023 including children's data.

Report findings before running the gate.

---

## THE PROMISE LEDGER — THE GATE'S CENTRAL DELIVERABLE

**A table, produced by reading the homepage and the student space in the same sitting:**

| homepage claim (scene, verbatim) | what the student space does | verdict |

**Verdicts, exactly three, and no fourth:**
- **DELIVERED** — the student space does what the homepage said, and the evidence is concrete.
- **DECLARED DISTANCE** — the homepage's own honesty treatment already names the gap (the "what's
  live / what's next" beat, 3.6's labels, the registry), **and the student space does not contradict
  it.** This is the intended state for most rows.
- **CONTRADICTION** — the homepage asserts something the student space denies, or the student space
  asserts something the homepage denies. **A contradiction is a defect and must be fixed in this
  gate**, by correcting the *wrong* half — usually the claim, occasionally the delivery — **and never
  by weakening the honesty treatment.**

**Rules for producing the ledger:**
- **Read the strings verbatim.** A paraphrase is not evidence.
- **Every row names where it was verified** (route, state, screenshot or DOM).
- **A row you cannot verify is a violation**, not a blank.
- **Include the rows you expect to pass.** A ledger that only lists problems is a list of problems.
- **Run it in both directions.** A student-space claim that the homepage contradicts is the same
  defect as its converse.

**Then the second ledger, which is shorter and more important:**

| what the student space promises | what it delivers today |

**For every promise the student space makes about the future** — the arc's ahead steps, the region
labels, the entity map, the threshold copy — **state what the student will find if they come back in
a week.** If the answer is *the same thing*, the promise is a claim about a future that the product is
not yet making real, and **the gate must say so out loud.** (5.6's *"we'll keep track as you go"* was
banned for exactly this. Sweep for its relatives.)

---

## THE JOURNEY, READ WHOLE

**One sitting. One phone. From the homepage to a real state, timed, screenshotted, and written down.**

1. **Land on `/`** as a stranger who knows nothing. Record: what you understand in 3 seconds, in 10
   seconds, and what you click.
2. **Follow the only honest path a real student has** — choose → door → threshold → begin → shell →
   environment → arc → back. **On the real production build, with the real config.**
3. **Record every dead end you meet.** Not as a defect automatically — **some dead ends are correct**
   — but as an inventory: where the product stops, and whether it says so honestly at the point it
   stops. **One enterable subject out of six is a dead end five times over, and the honest label is
   what makes it acceptable.**
4. **Record the promise-to-delivery gap at the moment it is felt**, not at the moment it is
   documented.
5. **Then read the journey AGAIN as a reader who has been here before** — the returning student, who
   has an enrolment and an entry. **The second visit is the phase's actual subject:** what is different
   from the first, and is it the right difference?
6. **Then the fast skim.** A student glancing for three seconds, on each surface. **Every one must
   answer "what now" in under three seconds** (5.1's rule), and the gate reports the ones that do not.
7. **Then the adversarial read.** Deliberately look for the moment a student would feel *managed*:
   nudged, counted, judged, or addressed by a product that thinks it knows them. **Report every
   instance, and every near-miss.**

**Report the timing.** Real numbers for a real connection, at 390, on the mid-range profile.

---

## THE STATES AS A SET

Each state was designed and verified alone. **Read them together:**

- **A · no enrolment · B · enrolled never entered · C · active · error page · partial failure ·
  session ended · unknown outcome · 404s · role redirect.**
- **For each: the one primary, the one sentence, and the first thing a screen reader announces.**
- **The rule to verify: exactly one primary per view, and no two surfaces in the journey asking for
  different things back to back.**
- **And the composition test: do all states look like the same product?** A student who sees State A
  and then State C and then an error page should recognise all three as one place. **Report any state
  that looks borrowed from another product.**

---

## THE CTA HIERARCHY AS A SET

Across the whole experience — homepage (Scenes 0, 3, 4, 8), the shell, the environment, the auth
surfaces:

- **At any scroll position or state: exactly one primary is visible.**
- **The action names the destination and the act** (4.4's ENTRY-not-outcomes rule, carrying into the
  student space).
- **No two consecutive surfaces ask different things.** Choose → begin → open → resume is a coherent
  chain; any pair that disagrees is a defect.
- **The engine's answers and the surfaces' actions agree.** If the shell says *Open Physics*, the
  environment says *begin here*, and the door says *enter*, **report the vocabulary as a set** and
  reconcile it.
- **Report the full chain verbatim**, surface by surface.

---

## THE HONESTY AUDIT, EXTENDED

Every category from 4.9's page-wide audit, **re-run across the student space**, plus the categories
Phase 5 created:

1. invented data · 2. unavailable capabilities · 3. fabricated progress · 4. fake social proof ·
5. implied scale · 6. claimed integrations · 7. simulated interfaces · 8. test-only affordances ·
9. dead links · 10. placeholder copy · 11. unearned tone.
**Plus:** 12. counts and references · 13. zeros and absences (P5-R6) · 14. ratios and denominators ·
15. celebration and reward semantics · 16. the subject rule (P5-R8.2) · 17. unknown outcome rendered
as verdict (P5-R8.1) · 18. failure rendered as absence (P5-R9) · 19. traceability (every figure names
its rows) · 20. progress that instructs (5.6's no-CTA rule) · 21. promises about the future · 22. the
ordinary student test (does any string assume a student who has everything set up?).

**For each category: the method, the findings, and — where there are none — the evidence of absence.**
**And name what the audit cannot see**, so its limits are recorded rather than implied.

---

## THE MOBILE PASS — MOBILE-FIRST, MEASURED

From Phase 5 onward the phone is the primary surface (P5-R2's standing note).

- **390 as the reference**; 320 and 360 as the floor; 1280 and 1920 as the derived case.
- **Mid-range Android, and a slower tier** — report what you used and its provenance. Include one
  **4× CPU-throttled** run.
- **The 8pm connection:** ~400ms latency, ~1.6Mbps, and a **cold cache**. **Report first paint, the
  primary action's availability, and whether anything claims progress the student cannot verify.**
- **Dark theme as the primary condition** — that is what 8pm looks like. Light theme verified too.
- **The fold gate** (P5-R3's standard) on every surface the journey touches, at every viewport.
- **Page-total pin-and-drift** for the mobile experience (the standing mobile-budget gate): measure the
  current total, pin it, and **gate drift rather than assert a ceiling.**
- **LCP variance** is reported with sample counts and a discarded warm-up (P5-R4 Addendum 3), **not as
  a single figure.**

---

## THE DECLARED-EXCEPTIONS REGISTER — CONSOLIDATED

**One table, one place, inherited by Phase 6.** Every exception declared during Phase 5, with:

| exception | what it is | why it was accepted | what it costs | owner | phase that resolves it |

**Must include at minimum:** the draft-environment access rule (P5-R4) · the registry's corrected unit
and the split (P5-R7) · the framework's client-side error/404 rendering (Next 16.3.6, with the issue
link and the flip alarm) · `/student` LCP and the signed-in `auth.getUser()` round trip · the
`audit/*.cjs` lint gap · `progress_record` not existing (Phase 7's first task) · the fixture-date
stamping fix · the status model living in TypeScript config rather than the database · the contrast
correction event · anything else declared since P5-R2.

**And a count, plainly stated: how many known exceptions does this product carry into Phase 6?**
**A rising count is a finding.** Say what it was at the start of Phase 5 and what it is now.

---

## THE HARNESS TRUSTWORTHINESS PASS

**A gate is only as good as the instruments it trusts.** Verify the instruments.

- **Deliberate breakages — at least SIX, student-specific.** Each must be caught by a NAMED gate.
  Suggested, add your own: (a) a count rendered on the primary surface · (b) a zero emitted for an
  empty record · (c) a region rendered for a visitor · (d) an engine answer that 404s · (e) a write
  performed on a GET · (f) a stored derived value · (g) a swallowed error rendered as absence ·
  (h) a contradictory arc step between Scene 7 and the region.
- **For each: name the gate that caught it, and paste the failure.**
- **A breakage that NO gate catches is the most valuable result in this step** — report it as a
  missing gate and add it.
- **Confirm the harnesses still pass afterwards** and the baseline is re-pinned with declared reasons.
- **Report the flip alarm's state** (the framework behaviour assertion) and confirm it trips correctly
  if the framework changes.
- **Report the harness's own limits**: unlinted (Phase 10) · what it does not measure · what it
  measures imperfectly.

---

## THE MATRIX

**The inventory × the conditions, one row per cell, with a verdict.** States down the side;
conditions across: 320 · 360 · 390 · 1280 · dark · light · reduced motion · no-JS · 200% zoom ·
1.4.12 text spacing · slow network · 4× CPU.

**Every cell filled.** A cell you did not test is a cell that fails the gate. **Report the unfillable
cells with their reason** — a no-JS cell on a framework-defective surface is a known exception, not a
gap.

---

## THE PHASE-CLOSE VERDICT

**Answer these, in order, with evidence:**

1. **Would a real student, on a phone, at 8pm, on a slow connection, come back tomorrow?** The
   evidence, not the impression: the journey's timing, the three-second answers, what the second visit
   actually offers.
2. **Does the student space deliver what the homepage promised — and where it does not, is the gap
   named honestly at the point the student meets it?**
3. **Is anything in Phase 5 dishonest in a way this gate can see?** — with the audit's limits stated.
4. **What does the student space do that a dashboard would not?** — because the whole phase was built
   against that default, and the answer is the phase's claim on being correct.
5. **What would break first at ten students? At a hundred?** — the honest engineering answer,
   including the auth round trip, the paused project, and the 2GB sandbox's self-respect.
6. **Is Phase 5 ready to close?** — and if any part is not, name what is missing and what it costs to
   leave.
7. **RECOMMEND THE PHASE 6 ENTRY POINT** — with the specific first step, and what Phase 6 must inherit
   (the exceptions register, the registry, the region contract, the engine's provider contract, the
   vocabulary documents).
8. **RESTATE THE LEGAL BLOCKERS** — privacy policy, terms, contact route, DPDP Act 2023 including
   children's data. **Phase 5 built real authentication; it did not open the doors. Confirm that in
   writing**, including that no real student data has been created, imported or inferred anywhere.

---

## BUILD

**PART 1 — The promise ledgers, both directions.**
**PART 2 — The journey read, three times (first visit, second visit, fast skim), timed.**
**PART 3 — The honesty audit, 22 categories, with methods and limits.**
**PART 4 — The mobile pass at 390, on the 8pm connection, dark primary.**
**PART 5 — The exceptions register, consolidated and counted.**
**PART 6 — The harness trustworthiness pass, with the breakage evidence.**
**PART 7 — The matrix, every cell.**
**PART 8 — `/dev/student-gate`** (dev-only, `NODE_ENV !== 'production'`): the ledgers rendered · the
journey with its timing · the audit results · the matrix with verdicts · the breakage evidence · the
exceptions register · and a plain statement of **what this gate cannot see.**
**PART 9 — The phase-close verdict**, in writing, with the Phase 6 entry point recommended.

---

## CONSTRAINTS

- **NO NEW FEATURES. NO NEW SURFACES. NO REDESIGNS. NO CUTS.**
- **Defect fixes only**, and each one reported with what it was, why it was wrong, and what it cost.
- **No new dependencies. No new tokens. No new copy beyond defect fixes.**
- **No client JS added** to any route. Report the final payload per route.
- **No analytics, beacons, or tracking of any kind** — including for the gate's own measurements.
- **No seeded or fixture data in production.** If the gate needs a student state, it uses the test
  accounts.
- **The primary surface, the engine, the write, the arc and the region contract are reviewed, not
  reworked.**
- Do not touch the certified Phase 3/4 surfaces beyond defect fixes the gate demonstrates.
- **DO NOT BEGIN PHASE 6.**

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives · brand mark, lockup, nav shell · subject system 3.1–3.6,
the door logic, the 404 behaviour · 3.6's chrome and honest labels · the 3.7 baseline and the subject
harness · the scene contract, spine, scroll grammar, voice document · Scenes 0–8 and the footer ·
`src/config/arc.ts` · 4.9's findings and recorded defects · 5.1's model, roles, policies · 5.3's three
states, IA, ratio, fold gate · 5.4's resolver, tiers, treatments, provider contract · 5.5's write,
predicate, region contract · 5.6's module, vocabulary document, arc region · 5.7's inventory, logger,
isolation pattern · the module registry's entries · `docs/proposed/progress_record.sql` · existing
build and deploy setup.

---

## TESTS

1. **All existing harnesses green** — page · shell · environment · permissions · states · progress ·
   next-action · subjects · RLS. **Paste every pass count at the same commit.**
2. **The promise ledger**, complete, both directions, with verdicts and evidence per row.
3. **Every CONTRADICTION fixed** — with the correction named (which half was wrong, and the evidence
   that it was the wrong one).
4. **The journey**, timed, with screenshots at 390 and the dead-end inventory.
5. **The second visit** — what differs from the first, and whether it is the right difference.
6. **The three-second test on every surface** — measured, with the failures fixed or reported.
7. **The adversarial read** — every instance and near-miss of feeling managed.
8. **The CTA chain**, verbatim, surface by surface, with the one-primary result per view.
9. **The honesty audit**, 22 categories, with methods, findings, and the evidence of absence.
10. **The mobile pass** at 390/360/320 on the 8pm profile, dark primary, with first paint, the primary
    action's availability, LCP with variance, and the fold gate on every surface.
11. **The mobile page-total pin**, with the pinned value and the drift result.
12. **The exceptions register**, counted, with the before/after Phase 5 totals.
13. **The six-plus deliberate breakages**, each with the gate that caught it — **and any breakage no
    gate caught, reported as a missing gate and added.**
14. **The flip alarm** — confirm it trips when the framework behaviour changes, and its current state.
15. **The matrix**, every cell, with the unfillable cells and their reasons.
16. **Fonts, images and the brand frame** across the whole journey — nothing regressed on any surface.
17. **The production build**, the final payload per route, and `.env.local` untouched with nothing
    secret printed.
18. **No real student data anywhere** — confirm by query: count the rows in every table belonging to
    non-test identities, **expected zero**, and paste it.
19. `git status --porcelain` — pasted raw, at the final commit.

---

## REPORT BACK

1. What the gate inspected, and the harness state at the starting commit
2. **The promise ledger**, complete — and a count: DELIVERED · DECLARED DISTANCE · CONTRADICTION
3. Every contradiction found and fixed, with which half was wrong
4. **The student-space ledger** — what it promises vs what it delivers, and every future-promise found
5. The journey, timed, with the dead-end inventory and the second-visit difference
6. The three-second results, and the adversarial read
7. The CTA chain as a set, with the one-primary verdict
8. **The honesty audit**, 22 categories, with the audit's stated limits
9. The mobile pass, including the 8pm profile and the pin
10. **The exceptions register**, and the count this product carries into Phase 6
11. The breakage results, including gates that caught nothing
12. The matrix, with unfillable cells
13. **The phase-close verdict**, all eight questions answered
14. **The recommended Phase 6 entry point**, and what Phase 6 inherits
15. Anything this gate could not see, anything deferred, and confirmation nothing was half-built
16. Confirmation nothing outside defect fixes and the gate's own documents changed

**STOP after the report.** Do not begin Phase 6.
