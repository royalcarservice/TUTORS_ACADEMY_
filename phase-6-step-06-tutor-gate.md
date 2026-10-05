# TUTORS ACADEMY — PHASE 6 · STEP 6: THE TUTOR GATE

**The pass that closes Phase 6.**

Depends on 6.1–6.5 and every ruling in force (**P6-R1 through P6-R20**).

**PRECONDITION — 6.5 REPORTED.** Its Part 0 carried P6-R17 to P6-R20; confirm all four landed.
**Nothing known-broken is outstanding.** The clause this replaced — *"5.7's defects fixed before this step
starts"* — was carried over from the 5.8 gate and has been stale since P5-R9 closed: **5.7's defects are
long fixed.** The live requirement is 6.5's own: **its Part 0 rulings (P6-R13, P6-R17–P6-R20) landed, and
anything its report lists as outstanding is fixed before this gate runs.**

**THIS STEP IS VERIFICATION, NOT CONSTRUCTION.**
- **No new features, no new surfaces, no new components, no new copy beyond defect fixes.**
- **Defect fixes only, and only where the defect is demonstrable.**
- **No redesigns — a surface that needs a different design gets a RECOMMENDATION with evidence.**
- **No tutor surface and no student surface may be cut inside this gate.** If one should go, recommend it
  with evidence and name it for a later step.
- **If you find yourself needing a RULING, STOP AND ASK.** *Two rulings already arrived mid-phase because
  evidence contradicted a record (P6-R13, P6-R19). A third deserves the same treatment, not a decision
  made quietly inside a gate.*

---

## WHY

**4.9 closed the homepage. 5.8 closed the student space. Both asked the same question of a different
body: does the thing do what it says?** Phase 6 has a third body, and it is the first one that is **not
about the person looking at it.**

**THIS GATE'S SUBJECT IS THE ASYMMETRY.** Every product has an asymmetry that is invisible from inside:
**the builder sees every surface, the user sees three destinations and a door.** Phase 6 built a shell, a
lens on one student, a control over a shared room, and an account page — and **each was verified against
its own brief.** What no step has checked is whether **the set** is honest: whether what the homepage
promised about tutors in Scene 5 is what a tutor actually finds, whether what the tutor can do is what
the *student* would expect if they knew, and whether the two roles' surfaces tell a consistent story
about the same facts.

**AND ONE QUESTION SITS UNDER ALL OF IT, WHICH IS THE GATE'S REAL SUBJECT:** *a real tutor is given access
tomorrow. Do they find something true — or do they find nothing and assume it is their fault?* 6.5 named
the distance in the places a tutor would look. **This gate verifies that, from the tutor's chair, with
the access they would actually have.**

---

## FIRST: INSPECT

1. **All six step reports**, and every ruling's implementation claim. **You are auditing your own prior
   work adversarially** — the gate's value depends on it.
2. **The exceptions register as consolidated by 5.8**, plus everything Phase 6 added: **E-25, E-26, the
   superseded 6.1 recommendation with its Phase 7 reopening condition, P6-R19's revised gate row, P6-R20's
   declared cost, the refused co-teacher grant, the unconditional shared-note rewording, and the
   validator's wiring.**
3. **`docs/TUTOR_VISIBILITY.md`**, **`docs/TUTOR_DISTANCE.md`**, **`docs/STATE_LANGUAGE.md`**,
   **`docs/PROGRESS_LANGUAGE.md`**, and **`docs/proposed/*.sql`** — the documents are part of the
   artifact and are read here as evidence, not as appendices.
4. **All harnesses:** page · shell · environment · permissions · states · progress · next-action ·
   tutor · identity-matrix · levers · visibility · subjects · RLS. **Their pass counts, and what each
   actually asserts.**
5. **`docs/DECISIONS.md`** — read end to end. **A decision log that has become a changelog has stopped
   being useful, and this is where that would show.**
6. **The Phase 5 gate's verdict and the exceptions it handed forward** — so nothing inherited is silently
   dropped.
7. **4.6's Scene 5 strings**, extracted verbatim with their labels, for the promise ledger.
8. **The registry as it now stands**, and which surfaces read it. **Both the homepage and the portals.**
9. **The legal position as it now stands** — and specifically: **Phase 6 added a capability for an adult
   to read a minor's record.** Report what that changed about the blockers.

Report findings before running the gate.

---

## THE PROMISE LEDGER — THE GATE'S CENTRAL DELIVERABLE

**Scene 5's claims, verbatim, against what Phase 6 actually built:**

| Scene 5 claim (verbatim) | what the tutor experience does | verdict |

**Verdicts, exactly three, and no fourth:**
- **DELIVERED** — the tutor experience does what the homepage said, with concrete evidence.
- **DECLARED DISTANCE** — the homepage's own honesty treatment names the gap (the registry label, the "not
  built yet" beat) **and the tutor's surfaces do not contradict it.** *This is the intended state for most
  rows — and it is worth saying that Phase 6's ratio of declared-distance to delivered will be low, and
  that is correct: the phase built the frame, not the content.*
- **CONTRADICTION** — a defect, **fixed in this gate by correcting the wrong half**, never by weakening the
  honesty treatment.

**Rules:** verbatim strings only · every row names where it was verified · **a row you cannot verify is a
violation, not a blank** · include the rows you expect to pass · **run it in both directions** — a tutor
surface asserting something Scene 5 denies is the same defect as its converse.

**AND THE SECOND LEDGER, WHICH IS THE ONE ONLY THIS GATE CAN PRODUCE:**

| what the tutor can do | what the student would think if they knew |

**For every tutor capability — reading the relationship's surface, shaping the environment, the account
page — state what a student would reasonably conclude if it were described to them plainly.** *A tutor can
see where I am in my subject. A tutor can change how my environment looks. A tutor can see nothing else —
not my other subjects, not my activity outside this one.*

- **If any row reads badly, that is a FINDING, and it is the most important category of finding this gate
  can produce** — because it is the only one no student can raise on their own, and the one a builder is
  structurally least able to see.
- **Rows that read well go in too.** *"I can see my work in this subject, and nothing else about my life"*
  is a sentence this product should be able to publish.
- **Where a row reads badly, the fix is a recommendation with evidence**, not a unilateral change — **unless
  the fix is a copy change on a tutor surface, which this gate may make.**

---

## THE TUTOR'S JOURNEY — READ WHOLE, THREE TIMES

**One sitting, one phone.** From the tutor's first access to the end of their useful work.

1. **The first visit.** A tutor who has just been given access: what they see, what they understand in 3
   seconds and in 10, and **where they go next.** Time it. Screenshot it.
2. **The walk:** shell → a subject → the spacing between the row and the rest of the surface → the
   relationship's surface → the environment they shape → the room itself → shape something → see it · →
   account → sign out. **Every step, with status codes.**
3. **Record every dead end you meet** — some are correct — and whether the product **says so honestly at
   the point it stops** (P6-R16).
4. **The second visit.** What is different, and **is it the right difference** — remember that "nothing
   changed" is the correct answer for a tutor until Phase 7, and the gate should say so rather than
   inventing novelty.
5. **The fast skim.** Every tutor surface must answer *"what now?"* in under three seconds — **and for
   most of them today the honest answer is "nothing right now, and here is why."** Confirm that reads as
   an answer rather than a dead end. **That is 6.2's P6-R4 doing real work; verify it held across all
   three surfaces.**
6. **The adversarial read.** Deliberately look for the moment a tutor would feel **monitored**, **blamed**,
   or **given a duty they did not agree to**. *"Students needing attention" is the obvious one and P6-R3
   banned it — but look for its relatives: any wording that implies the tutor is responsible for a
   student's diligence, or that the product is watching whether the tutor did their job.* **Report every
   instance and every near-miss.**

**Report the timing. Real numbers, at 390, on the mid-range profile.**

---

## THE IDENTITY MATRIX, READ AS A SET

The instrument Phase 6 built, read here as the artifact it is.

- **Paste the full table**: routes × reader classes, every cell an expected outcome.
- **Now read it as a product.** For each route: **is the set of outcomes for that route sensible, or is
  the route doing too much?** *A route that must behave four different ways for five reader classes is
  usually two routes wearing one address.* **Report any route whose matrix rows look like a fork — that is
  a design finding, not a bug.**
- **Verify the admissions and denials are the right ones**, not merely the expected ones. **The matrix
  encodes policy; this gate asks whether the policy is what the product intends.**
- **Confirm the revised row (P6-R19) and every revised row since** are visible as revisions, with reasons.
- **Prove the coverage gate one more time**, and **report any route in the app absent from the matrix.**

---

## THE INSIDE/OUTSIDE PASS

**The asymmetry check. This gate's unique contribution.** For each of the following, state **what the
builder knows** and **what the tutor or student actually sees**, and whether the gap is honest:

1. **What a tutor can see about a student** — from the tutor's chair (a display name, a subject, an arc
   position) against what the *student* would expect a tutor to see.
2. **What a tutor can change** — two levers, affecting everyone in the subject — against what a *student*
   would expect a tutor could change.
3. **What is missing** — against what a tutor might assume is broken. **The distance document is the
   claim; verify it against the surfaces.**
4. **The four roles' visibility of each other**: a student cannot see tutors' surfaces; a tutor cannot see
   other tutors' relationships or another tutor's shaping; **the co-teacher question the user has not
   ruled on.** Report what the product refuses by default, so the refusal is visible as a decision.
5. **What an observer could learn by probing** — the 6.3 rule extended: address bars, error pages, and
   timing **must not reveal another person's existence or state.** *The tutor case is done; check the
   student's surfaces for the same class and report.*
6. **What the product never says out loud** — anything true that a person should be told and is not.
   *The blast radius is said (P6-R12). The identical-statement rule means nothing is implied. **Look for
   the case where silence and honesty diverge:** is there anything a tutor or student would be surprised
   to learn, that the product has decided not to mention?* **Report it with a recommendation.**

---

## THE HONESTY AUDIT, EXTENDED

Every category from 5.8's 22, **re-run across the tutor's surfaces**, plus Phase 6's new ones:

**23. role claims** (the account surface states a role as fact, never as a setting) · **24. capability
reachability** (a surface that exists but has no door — P6-R17's class — swept for the *whole* product,
not just the shaping surface) · **25. blast radius stated** · **26. the co-teacher claim** (nothing about
another tutor renders) · **27. money language** (absolute, per P6-R8) · **28. the readiness/secrecy
distinction** (a draft subject is never presented as withheld or secret) · **29. permission visibility**
(a control is absent where the permission is absent, and its absence is not explained as a limitation of
the person) · **30. cross-role leakage** (no surface about one role renders another role's data).

**For each: the method, the findings, and — where there are none — the evidence of absence. State the
audit's limits.**

---

## THE MOBILE, PERFORMANCE AND EVIDENCE PASS

- **Mobile-first at 390**, the floor at 320/360, the derived case at 1280/1920 — **on every tutor surface
  and the account page.**
- **Mid-range Android plus a slower tier, one 4× CPU-throttled run**, and **the 8pm connection** (400ms,
  1.6Mbps, cold cache, **dark theme as the primary condition**).
- **The fold gate** on every surface, and **the mobile page-total pin with its drift result.**
- **LCP with a discarded warm-up, sample counts, variance reported — not a single figure.**
- **The visitor environment's declared cost (P6-R20)** — re-measured, restated, and confirmed recorded as
  a cost rather than drift. **And the round-trip count stated in one line.**
- **Payload per route**, confirming **no client JS was added in any Phase 6 step.**
- **A cold-start pass:** the sandbox resets between sessions, so **what does a fresh environment do** —
  clone, install, build, migrate, seed test accounts, run every harness. **Time it and paste each step.**
  *This is the recovery path, and it has never been verified end to end as a sequence.* **If it fails or
  takes longer than it should, that is a finding about the project, not about the sandbox.**
  **MEASURED IN CHUNKS, AND HONESTLY PARTIAL IF IT MUST BE.** One chunk per shell window; every step
  wrapped in a timeout; server-starting steps paired with their kill-by-port cleanup in the same
  invocation. **A chunk that still stalls is reported with what was measured and where it stalled — an
  honestly partial measurement closes this row.** A single 24-step pipeline on a 2 GB box is what
  wedged the environment once; the point is the recovery path's real cost, not a continuous take.

---

## THE DECLARED-EXCEPTIONS REGISTER — CONSOLIDATED

**One table, inherited by Phase 7.** Include at minimum: **E-07 (legal, escalated)** · E-13 (status in TS
config) · E-14 (replaced the magic number) · E-20 · E-23/P5-R10 · E-25 (money words removed from the
portals) · **E-26 and the Scene 5 label binding** · the framework's client-side error/404 rendering (Next
16.3.6, with the flip alarm) · `/student` LCP and the auth round trip · the `audit/*.cjs` lint gap ·
`progress_record` not existing (**Phase 7's first task**) · the fixture-date stamping · **6.1's superseded
levers recommendation with its Phase 7 reopening condition** · **P6-R19's revised gate row** · **P6-R20's
declared cost** · the refused co-teacher grant · the validator's wiring · anything else.

**State the count: how many known exceptions does this product carry into Phase 7 — and how does it
compare with the count carried into Phase 6?** **A rising count is a finding.**

---

## THE HARNESS TRUSTWORTHINESS PASS

- **Deliberate breakages — at least EIGHT, tutor-specific.** Each must be caught by a **named** gate.
  Suggested, add your own: (a) a per-student setting written to the database · (b) an identity lever
  exposed · (c) a settings write with the service role · (d) a tutor reading a non-related student ·
  (e) a relationship row read by a student · (f) an authored-but-invalid combination shipped ·
  (g) a nav item on a capability that is not built · (h) a route missing from the identity matrix ·
  (i) a draft subject presented as secret · (j) a money string rendered anywhere.
- **For each: name the gate that caught it, and paste the failure.**
- **A breakage that NO gate catches is the most valuable result in this step** — report it as a missing
  gate and add it.
- **Report the flip alarm's state**, and re-test the framework behaviour on any version bump.
- **Report the harness's own limits** — the lit gap, what it does not measure, what it measures
  imperfectly, and **whether any harness has become a ritual** (passing because nobody changed what it
  checks).

---

## THE MATRIX

**Every tutor surface and state ×** 320 · 360 · 390 · 1280 · dark · light · reduced motion · no-JS ·
200% zoom · 1.4.12 text spacing · slow network · 4× CPU. **Every cell filled or its reason stated.**
**A cell you did not test is a cell that fails the gate.**

---

## THE PHASE-CLOSE VERDICT

**Answer these, in order, with evidence:**

1. **A real tutor is given access tomorrow. Do they find something true — or nothing, and blame
   themselves?** The evidence: the journey, the three-second answers, what the distance document claims
   and what the surface actually says.
2. **Does the tutor experience deliver what Scene 5 promised — and where it does not, is the gap named
   honestly at the point the tutor meets it?**
3. **Would a student, reading a plain description of what their tutor can see and do, be at ease?**
   Answer it with the second ledger, not with an assertion.
4. **What did Phase 6 build that a management console would not?** *The answer is the phase's claim on
   being correct* — and the concrete version is worth stating: no roster, no progress columns, no
   "needs attention", no engagement metrics, no per-student anything, and a tutor who cannot see a child's
   activity outside their own subject.
5. **What does the tutor experience still not have, and what does that cost?** — the distance, in
   engineering terms: classes, recordings, events, teaching surfaces.
6. **What would break first at ten tutors? At a hundred? At a thousand students?** The honest engineering
   answer, including the identity-matrix's size, the RLS policy count, the auth round trip, and the
   settings read's cost.
7. **Is Phase 6 ready to close?** If any part is not, name what is missing and what it costs to leave.
8. **RECOMMEND THE PHASE 7 ENTRY POINT** — with the specific first step, and **the prerequisite that is
   already known: creating `progress_record` is Phase 7's first task**, along with the cohort model that
   reopens P6-R13, the `attend`-versus-`resume` sentence rule, and the settling-GET check (P6-R15) applied
   to every new write.
9. **RESTATE THE LEGAL BLOCKERS**, and state plainly what Phase 6 changed about them: **this phase built
   the capability for an adult to read a minor's record, gated by policy — and it did not create a single
   real identity.** Confirm by query.

---

## BUILD

**PART 1 — The promise ledger, both directions, plus the second ledger.**
**PART 2 — The tutor's journey, three readings, timed.**
**PART 3 — The identity matrix read as a set.**
**PART 4 — The inside/outside pass, six questions.**
**PART 5 — The honesty audit, 30 categories, with methods and limits.**
**PART 6 — The mobile, performance, evidence and cold-start passes.**
**PART 7 — The exceptions register, consolidated and counted.**
**PART 8 — The harness trustworthiness pass, with the breakage evidence.**
**PART 9 — The matrix, every cell.**
**PART 10 — `/dev/tutor-gate`** (dev-only): the ledgers · the journey with timing · the matrix with
verdicts · the audit results · the breakages · the exceptions register · the cold-start timings · and a
plain statement of **what this gate cannot see.**
**PART 11 — THE PHASE-CLOSE VERDICT**, in writing, with the Phase 7 entry point recommended.

---

## CONSTRAINTS

- **NO NEW FEATURES. NO NEW SURFACES. NO REDESIGNS. NO CUTS.**
- **Defect fixes only**, each reported with what it was, why it was wrong, and what it cost.
- **No new dependencies, tokens, or **no new copy beyond defect fixes.**
- **No client JS added.** Report the final payload per route.
- **No analytics, beacons or tracking** — including for the gate's own measurements.
- **No seeded or fixture data in production.** Test accounts only — and **no real identity anywhere.**
- **The relationship model, the policies, the settings model and the read paths are reviewed, not
  reworked.**
- Do not touch the certified Phase 3/4 surfaces beyond defect fixes the gate demonstrates.
- **DO NOT BEGIN PHASE 7.**

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives · brand mark, lockup, nav shell · subject system 3.1–3.6 and
the door logic · 3.6's chrome and honest labels · the 3.7 baseline, the validator and the subjects
harness · the scene contract, spine, scroll grammar, voice document · Scenes 0–8 and the footer ·
`src/config/arc.ts` · 4.9's and 5.8's findings · 5.1's model, roles, policies and documents · 5.3's three
states, IA, ratio, fold gate · 5.4's resolver, tiers, treatments, provider contract · 5.5's write, region
contract · 5.6's module, vocabulary, arc region · 5.7's inventory, logger, `isolate.ts` · 6.1's
relationship model, policy matrix, visibility ruling · 6.2's shell, ordering rule, reader, attacks,
identity matrix · 6.3's surface and reader · 6.4's settings model, read, validator, rules · 6.5's account
surface and distance document · the module registry's entries · `docs/proposed/*.sql` · existing build
and deploy setup.

---

## TESTS

1. **ALL HARNESSES GREEN AT ONE COMMIT** — page · shell · environment · permissions · states · progress ·
   next-action · tutor · identity-matrix · levers · visibility · subjects · RLS. **Paste every pass
   count.**
2. **THE PROMISE LEDGER**, complete, both directions, with verdicts and evidence per row.
3. **THE SECOND LEDGER** — what a tutor can do, and what a student would think if they knew. **Every
   row that reads badly, reported as a finding.**
4. **EVERY CONTRADICTION FIXED** — with which half was wrong and the evidence.
5. **THE TUTOR'S JOURNEY**, timed, with the dead-end inventory and the second-visit difference.
6. **THE THREE-SECOND TEST** on every tutor surface — measured, with failures fixed or reported.
7. **THE ADVERSARIAL READ** — every instance and near-miss of a tutor feeling monitored, blamed, or given
   a duty they did not agree to.
8. **THE IDENTITY MATRIX AS A SET** — the full table pasted; every route whose rows read as a fork;
   the revised rows visible as revisions; the coverage gate proven.
9. **THE INSIDE/OUTSIDE PASS**, all six questions answered with evidence.
10. **THE HONESTY AUDIT**, 30 categories, with the audit's stated limits.
11. **THE MOBILE AND PERFORMANCE PASS**, including the 8pm profile, the fold gate, the pin, LCP variance,
    and **P6-R20's re-measurement**.
12. **THE COLD-START PASS** — the full recovery sequence, timed, each step pasted.
13. **THE EXCEPTIONS REGISTER**, counted, with the Phase 5 comparison.
14. **THE EIGHT-PLUS DELIBERATE BREAKAGES**, each with the gate that caught it — **and any breakage no
    gate caught, reported and gated.**
15. **THE FLIP ALARM** — its state, and that it trips.
16. **THE MATRIX**, every cell, with unfillable cells and their reasons.
17. **THE REGISTRY AND THE PORTALS** — entries against what exists, and every rendered label checked.
18. **NO REAL IDENTITY ANYWHERE** — count the rows in every table belonging to non-test identities:
    **expected zero.** Paste it, **and state plainly that Phase 6 added an adult's read access to a
    minor's record without creating a single real account.**
19. **THE PRODUCTION BUILD**, the final payload per route, and `.env.local` untouched with nothing secret
    printed.
20. `git status --porcelain` — pasted raw, at the final commit.

---

## REPORT BACK

1. What the gate inspected, and the harness state at the starting commit
2. **The promise ledger** — with a count: DELIVERED · DECLARED DISTANCE · CONTRADICTION
3. **The second ledger** — what a student would think, and every row that reads badly
4. Every contradiction found and fixed, with which half was wrong
5. The tutor's journey, timed, with the dead-end inventory and the second-visit difference
6. The three-second results, and the adversarial read
7. **The identity matrix as a set** — the fork findings and the policy verdict
8. **The inside/outside pass**, six questions
9. **The honesty audit**, with its stated limits
10. The mobile and performance pass, the cold start, and P6-R20's re-measurement
11. **The exceptions register**, and the count carried into Phase 7 versus into Phase 6
12. The breakage results, including gates that caught nothing
13. The matrix, with unfillable cells
14. **The phase-close verdict**, all nine questions answered
15. **The recommended Phase 7 entry point**, and what Phase 7 inherits
16. Anything this gate could not see, anything deferred, and confirmation nothing was half-built
17. Confirmation nothing outside defect fixes and the gate's own documents changed

**STOP after the report.** Do not begin Phase 7.
