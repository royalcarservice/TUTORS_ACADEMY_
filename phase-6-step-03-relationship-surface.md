# TUTORS ACADEMY — PHASE 6 · STEP 3: THE RELATIONSHIP'S SURFACE

One student. One subject. The record a tutor may see.

Depends on 6.1 (the model, the visibility ruling), 6.2 (the shell, the identity matrix, the attacks),
5.6 (the arc and the vocabulary), 5.5 (the region contract), 5.7 (the states), and
`docs/TUTOR_VISIBILITY.md`.

**PRECONDITION — 6.2 REPORTED.** Confirmed at `15da5a5`. **Part 0 below is three close-outs, including
the two items you flagged (E-25, E-26) and one ruling (P6-R7) that changes how 6.2's attacks count.**

**THIS IS THE SCREEN WHERE THE BOUNDARY STOPS BEING ARCHITECTURE AND BECOMES A GAZE.** Everything before
it was a model, a policy, a matrix, a shell that stated things. **Here, a person looks at a child's
record.** From this step forward, the design question is not only *what may be seen* — the policy settled
that — but **what looking at it does.**

---

## WHY

**A tutor opening this surface should learn one thing: where this student is.** Not how they are doing
relative to anyone, not how often they show up, not whether they need attention. **Where they are.**

**AND THE SUBTRACTIONS ARE THE DESIGN.** The permitted column of `docs/TUTOR_VISIBILITY.md` is short:
a display name, a subject, the arc, and learning events — **and there are no learning events**, because
`progress_record` does not exist and will not until Phase 7. **So this surface is: one name, one subject,
one position, and an honest statement about an empty record. That is the whole screen, and it is
correct.**

**THE FAILURE MODE THIS STEP EXISTS TO PREVENT** is a surface that *looks* like a student profile:
avatar, name, subject, a few chips, a recency line, a small chart. **Every element of that conventional
design is either a comparison, a metric, or a judgment about a child** — and the most dangerous one is
the quietest: **recency.** *"Last active 9 days ago"* is not a fact a teacher needs about a student.
**It is an at-risk signal with the flag filed off** — and it is how a record becomes surveillance without
anyone deciding it should be.

---

## PART 0 — THREE CLOSE-OUTS

### 0a. P6-R7 — A BOUNDARY PROVEN BY ATTACK SHIPS WITH THE ATTACK AS A PERMANENT FAILING TEST

Your two attacks fail `tsc` (**TS2554, TS2353 ×2**). **That is the strongest form of proof —
structurally impossible, not merely unused.** But a demonstration is not a gate: **if the reader's
signature ever changes, the attack compiles and nobody notices.**

**DO:**
- **THE HARNESS MUST ASSERT THAT THE ATTACK FILES DO NOT COMPILE, and fail loudly if they ever do.**
  Assert the **expected error codes**, not merely "an error" — a file that fails to compile because of an
  unrelated typo proves nothing.
- **A boundary is proven at the layer where it can fail, and each layer needs its own permanent gate:**
  **SIGNATURE** (the compile-time attacks) · **POLICY** (the RLS assertions) · **ROUTE** (the identity
  matrix). **Neither substitutes for another** — the type proof protects the shape, the policy protects
  the data, the matrix protects the route.
- **Name the pattern** so 6.3's own reader and every later read path inherits it, and so a future step
  knows that adding an argument to a reader is a gated act rather than a refactor.

### 0b. E-25 — AN ENTRY NAMES A PHASE (P6-R8). THE REGISTRY IS NOT A WISH LIST.

**First, the finding, which is the best catch in 6.2 and deserves to be stated plainly:** the
`PORTAL_META` blurbs were rendered **to visitors** on `/login` and `/register` at ≥1024px. **A promise
that tutors get paid was on the public front door**, addressed to strangers, describing a commercial
relationship this product has never defined.

**RULING:**
- **THE REGISTRY ANSWERS TWO QUESTIONS: *is this built?* and *what does this surface depend on?* IT IS
  NOT A ROADMAP, AND NOT A WISH LIST.**
- **AN ENTRY WITH NO PHASE THAT DELIVERS IT IS NOT A CAPABILITY.** `payments` appears in no phase of
  P1–P10. Neither does `tests`. **Neither may render as a planned capability on any surface.**
- **Remove them from what renders** — the portal module lists. Keep or delete the underlying entries as
  you judge least disruptive, **and report which you did and why.** If a later phase claims assessments
  or money, **the phase that delivers it adds the entry.**
- **MONEY LANGUAGE IS BANNED, ABSOLUTELY, UNTIL THE USER RULES:** no earnings, payments, payouts, money,
  fees, billing, subscription, pricing, invoicing — **in any string, on any surface, at any phase.**
  Record it in the refusals beside the existing ban.
- **REPORT THE BUSINESS-MODEL QUESTION AS A USER ITEM, NOT AN AGENT DECISION:** *does the academy handle
  money in-product at all?* A premium tutoring academy may well collect fees offline and pay tutors
  in person — **in which case no payment capability will ever exist and its absence is correct.** Until
  the user answers, **the absence is the product's position.**
- **Sweep for the class again, now including** `summary`, `blurb`, `description`, module names,
  `alt` text, page `metadata`, and **email templates if any exist.** Report each string's audience.

### 0c. E-26 — A LABEL BINDS TO THE FACT ITS SENTENCE ASSERTS. DO NOT FLIP A STATUS TO MOVE A LABEL.

- **`tutor-portal` STAYS `planned`, and that is correct.** The tutor *experience* is not delivered —
  6.3, 6.4 and 6.5 remain — and the portal has no capabilities. **The status reflects what exists. Leave
  it.**
- **THE REAL QUESTION IS WHICH FACT SCENE 5'S LABEL READS.** 4.6 made Scene 5 about **the relationship**,
  not a roster — and `tutor-relationship` is now **live**. **If Scene 5's label reads `tutor-portal`,
  it is reading an AREA instead of the fact its own sentence asserts** — the P5-R7 violation, one layer
  up, on the homepage.
- **DO:** report **Scene 5's sentence verbatim**, and report **which registry entry its label reads.**
  - If the sentence asserts **the relationship**, bind the label to `tutor-relationship` and let it move
    to **"In foundation"** — which is then true.
  - If the sentence asserts **the tutor's capabilities**, **it stays "not built yet"** — also true, and
    nothing changes.
- **CHANGING A HOMEPAGE STRING IS A DECLARED EXCEPTION:** strings before and after, no other string in
  the scene or the page moves, the baseline is updated with the reason, and **it is flagged to the user
  as vetoable.**
- **NEVER flip a status so that a surface renders differently.** Status reflects what exists; labels
  derive from status. *This is the same refusal as P5-R7's Option 3, arriving from the other direction.*

---

## FIRST: INSPECT

1. **`docs/TUTOR_VISIBILITY.md`**, in full — the permitted column is this surface's ceiling.
2. **6.2's `TutorContext` and the relationship-scoped reader** — its shape, its argument-freedom, and
   **the two attack files**, so 0a's gates extend the existing pattern rather than inventing one.
3. **`src/config/arc.ts` and its two existing consumers** — Scene 7 (Stage) and the student's region
   (Room). **This surface is the third consumer, and it must read the same definition at runtime.**
4. **5.6's arc region as built** — vocabulary, states-in-words, no marks, no digits, no CTA, and **the
   empty-record statement.**
5. **5.5's region contract and 5.6's composition rule** — the arc never merges with a progress figure.
6. **5.7's state inventory and `isolate.ts`** — which rows apply here, and how a failed region behaves.
7. **6.1's policy matrix** — including the ended-relationship case, and what a read returns for each.
8. **The identity matrix from 6.2** — the routes × reader-classes table, **and the coverage gate.** This
   step adds routes; **its rows are added in the same step** (P6-R6.4), or the gate fails.
9. **Every standing ban and rule**, collected: the subject rule · never-emit-a-zero · the vocabulary
   document · no comparison · no celebration · no report-only elements · P5-R8's error language · P6-R2's
   refusals.

Report findings before building.

---

## THE SURFACE — WHAT IT IS

**One relationship. One addressable surface. Reached from the shell's row, which becomes a link here —
closing Test 18's deliberately-unmet item.**

**In reading order:**
1. **Who** — the student's **display name**, and nothing else about the account.
2. **Which** — the subject, with its environment identity: the mark, the accent, the environment name
   (3.3/3.1). **The tutor sees the environment the student is in, because that is what teaching is
   about.**
3. **Where** — **the arc**, the same seven steps, the student's position among them. *This is the
   surface's answer, and it may be the dominant element.*
4. **The record** — the region where learning events will live. **Empty today. It renders nothing.**
5. **A statement** — about the empty record, and about what a tutor can and cannot do here.
6. **A way back** to the shell.

**That is the whole surface.** No profile, no details page, no tabs, no second view.

---

## RULINGS

### P6-R2 AMENDMENT — THE TUTOR SEES POSITION, NEVER RECENCY

**P6-R2 permitted "where the student is — the arc position". Recency is not position, and it is not
permitted.**

- **No "last opened", no "last active", no "days since", no date of any kind about the student's
  behaviour.** Not as a line, not as a tooltip, not as an accessible label, not in metadata.
- **The reason, stated once and written into the visibility document:** *position is a state of the
  learning; recency is a measure of the person.* **A tutor needs to know where a student is in order to
  teach them. They do not need to know how recently a browser opened a page** — and *"last active 9 days
  ago"* is the at-risk flag with the flag filed off.
- **What a tutor does instead, when they want to know how it is going:** they teach. **That is P7's job,
  not a metric's.**
- **Recency would require a ruling**, and the default answer is no. **Say in the report what the arc
  renders instead, so the substitution is visible.**

### P6-R9 — AN ABSENT RELATIONSHIP IS INDISTINGUISHABLE FROM A STUDENT WHO DOES NOT EXIST

**This surface may not confirm or deny that a person exists.**

- **A URL naming a student the tutor has no relationship with returns exactly what a URL naming nobody
  returns: the same status, the same page, the same words, byte-identical.** Not 403. Not "no
  relationship". Not "you do not have access". **A distinguishable refusal is a probe** — it turns a
  tutor's address bar into a way to test whether a given student is on the platform.
- **An ENDED relationship renders the same way.** *The cost is named honestly:* a tutor may wonder where
  a student went. **The tutor's own arrangements — which relationship exists, and which ended — belong on
  a surface about the relationship, not on a page that must not answer existence questions.** Say where
  that will live when relationship management arrives.
- **The test is one code path, not three branches:** never-related · ended · nonexistent → **identical
  response, proven by comparing them byte for byte.**

### THE ROW BECOMES A LINK — AND IT MUST LOOK LIKE ONE

- The shell's row becomes **one real link**, resolving to this surface, **named with the student and the
  subject** for assistive technology.
- **Confirm the row had no interactive affordance before this step** — no cursor, no hover, no focus —
  because **a non-interactive element that looks interactive is a false affordance**, and it would have
  been a defect even though a test passed.
- **The link's destination is the relationship's surface, and it must not become a second primary on the
  shell** — the link's weight is the row's weight, unchanged (5.3's equal-weight rule).

### THE ROUTE — REPORT YOUR CHOICE

- **It must be SUBJECT-SCOPED, so that a cross-subject view is unrepresentable in the URL as well as in
  the model.** Propose the exact shape and report the reasoning.
- **It must resolve the relationship server-side**, from the session and the URL — **never from a
  student identifier alone** (P6-R1: access is answered by *does a relationship exist, for this subject*).
- **Confirm the route appears in the identity matrix with its rows for every reader class** (P6-R6.4).

---

## THE COPY — THE HARDEST SENTENCE IN THE STEP

**The empty-record statement is read by a tutor about a child.** Two properties are mandatory:

**1. THE SUBJECT RULE (P5-R8.2).** The grammatical subject is **the product or the environment, never the
student.** *"Sessions, recordings and submissions arrive in later phases — until then there is nothing
recorded here."* ✓ · *"This student has no activity."* ✗

**2. AND THE STRONGER PROPERTY, WHICH IS TESTABLE: THE STATEMENT IS IDENTICAL FOR EVERY STUDENT.**
- **The same words render for a student who entered their environment an hour ago, one who entered last
  month, and one who has never entered it.** Because the reason is the *product's* state — nothing is
  recorded yet — and not the student's. **If the sentence varies at all by what the student did, the
  surface is judging.**
- **PROVE IT:** render at least three students with different real states side by side and **paste the
  statement's bytes from each. Identical.** Report any difference as a defect.
- **The test is the design.** A statement that cannot vary cannot imply.

**PROPOSE 2–3 CANDIDATES FOR EACH OF:** the empty-record statement · the subject/scene line · what a
tutor can do here (today: nothing, stated as fact, P6-R4) · and the instruction back to the shell.
**Report the choices with reasoning.**

---

## THE THREE CONSUMERS OF THE ARC

The arc now renders in three places: **Scene 7** (the homepage, Stage vocabulary), **the student's
environment region** (Room), and **a tutor's view of one student.** One definition, `src/config/arc.ts`.

- **VERIFY AT RUNTIME** — not by inspection — that all three read the same definition: same seven steps,
  same names, same order, **no drift.**
- **The tutor's copy of the arc carries no CTA, no interaction, and does not become the surface's
  secondary primary** (5.6's rules hold).
- **Nothing about the tutor's framing changes what the arc asserts** — it is the student's journey,
  rendered for a reader. **Report whether the framing needs any word at all to say whose journey it is,
  and if so, propose it.**

---

## WHAT IT MUST NOT BECOME

- **Not a student profile.** No avatar, no header card, no contact details, no "about".
- **Not a dashboard.** No stat row, no chips, no sparkline, no weekly summary, no "engagement".
- **Not a grading surface.** No assessments (none exist), no marks, no notes, no flags.
- **Not an action surface.** No notes, no messages, no assignment, no "flag for review". **A tutor
  surface that can act on a record is P7's decision at the earliest.**
- **Not exportable.** No print stylesheet, no download, no copy affordance, no share.
- **Not a second lens on other students.** No "compare", no peer context, no cohort, no class average —
  **and no link from here to any other student's surface.**
- **Nothing that observes the tutor either.** No analytics, no beacons, **and no record of a tutor
  having looked.** Whether tutor *access* should ever be logged is a decision for the user; **do not add
  it silently.**

---

## BUILD

**PART 1 — PART 0's three close-outs**, with their evidence.
**PART 2 — THE ROUTE AND THE READER.** The subject-scoped route, the server-side resolution, the
relationship-scoped read, **and the compile-time attacks for any new read path** (P6-R7).
**PART 3 — THE SURFACE**, in the reading order above: name · subject identity · the arc · the empty
record region · the statement · the way back. Room rules, compact density, mobile-first.
**PART 4 — THE SHELL'S ROW BECOMES A LINK**, with the affordance check from the ruling.
**PART 5 — THE EMPTY-RECORD MECHANISM**, where the identical-statement property is structural rather
than a coincidence of copy — **and a test that proves it.**
**PART 6 — THE IDENTITY MATRIX'S NEW ROWS** for the new route, all reader classes, including
*never-related*, *ended*, and *nonexistent* asserting the same response.
**PART 7 — THE VISIBILITY DOC.** Append: what this surface renders · recency's refusal and its reasoning
· the absence-is-indistinguishable rule · and what a future phase may add here **only with a ruling.**
**PART 8 — THE REGISTRY** using P5-R7's unit and P6-R8's rule (an entry names a phase). **Do not mark
anything live that has no surface**, and report the homepage's labels string by string.
**PART 9 — `/dev/relationship-surface`** (dev-only): three students side by side with **the identical
statement shown as identical** · the ended, never-related and nonexistent cases shown as
indistinguishable · the arc's three consumers compared · the cross-subject attempt, impossible ·
grayscale, reduced motion, no-JS, 390 first paint · the PII grep's output · and a plain statement of
**what is real and what cannot be reached today.**

---

## CONSTRAINTS

- **NO LEARNING EVENTS EXIST.** Do not create the table, do not invent an event kind, do not backfill.
  `progress_record` is Phase 7's first task.
- **NO SECOND READ PATH.** Everything goes through the relationship-scoped reader.
- **NO SCHEMA CHANGE.** If a field is needed, **STOP AND REPORT.**
- **NO AGGREGATE, NO EXPORT, NO THIRD-PARTY ACCESS.**
- **NO TUTOR ACTION THAT CHANGES ANYTHING.** This surface reads.
- **NO NEW TOKENS, COMPONENTS, PRIMITIVES, MOTION OR DEPENDENCIES.**
- **NO CLIENT JS ADDED.** Report the payload before and after.
- **NO SEEDED OR DEMO DATA IN PRODUCTION.** Test relationships only, between test accounts.
- Do not touch the certified subject system, the brand frame, the scene spine, Scenes 0–8 (beyond
  E-26's label binding if the evidence supports it), 5.1's model, 5.3's student shell, 5.4's resolver,
  5.5's write and region contract, 5.6's module and vocabulary, 5.7's states, or 6.2's shell composition
  beyond the row's link.
- **DO NOT BEGIN STEP 6.4.**

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives · brand mark, lockup, nav shell · subject system 3.1–3.6 ·
3.6's chrome and honest labels · the 3.7 baseline · the scene contract, spine, scroll grammar, voice
document · 4.9's and 5.8's findings · 5.1's model and policies · 5.3's IA, ratio, fold gate · 5.4's
tiers, treatments, provider contract · 5.5's predicate, write, region contract · 5.6's model, documents,
arc · 5.7's inventory, logger, `isolate.ts` · 6.1's relationship model, policy matrix and visibility
ruling · 6.2's shell composition, ordering rule, reader and attacks (extend the pattern, do not alter
it) · `docs/proposed/progress_record.sql` · existing build and deploy setup.

---

## TESTS (all required)

1. **PRECONDITION** — 6.2's report state, and confirmation the three close-outs are done.
2. **0a — THE ATTACKS ARE GATES** — paste the harness output asserting the expected `tsc` error codes,
   **and prove it fails loudly if an attack compiles** (temporarily make one compile, paste the failure,
   revert). Then confirm the same pattern covers any new read path added in this step.
3. **0b — E-25 / P6-R8** — paste the registry entries removed or suppressed, the module lists before and
   after, and the class sweep including `metadata` and email templates. **Confirm no money language
   renders anywhere, on any surface, for any reader class.**
4. **0c — E-26** — Scene 5's sentence verbatim · which entry its label reads · the binding you applied ·
   **strings before and after** · confirmation no other string moved · the baseline exception.
5. **THE ROUTE RESOLVES** — from the shell's row, to the surface, for the related tutor. Paste the status
   codes and the rendered page.
6. **THE READER IS ARGUMENT-FREE AND NAMES TWO TABLES** — paste the signature and the imports.
7. **THE THREE INDISTINGUISHABLE CASES** — never-related · ended · nonexistent: **paste all three
   responses and diff them byte for byte.** Identical.
8. **NO PROBE** — attempt to reach a student by editing the URL to a different valid student id, and to a
   random id. **Both return the same thing.** Paste both.
9. **SUBJECT SCOPE** — a tutor related in Physics cannot reach that same student's History. **Paste the
   attempt and the response**, and confirm the URL shape makes the cross-subject view unrepresentable.
10. **PII FLOOR** — grep the rendered HTML for the test student's email, any uuid, any contact field, any
    auth metadata. **Only the display name may appear.** Paste the grep.
11. **THE IDENTICAL STATEMENT** — three students with genuinely different states; **paste the statement's
    bytes from each.** Identical. Report any variance as a defect.
12. **THE SUBJECT RULE** — paste every sentence the surface renders, with its grammatical subject named.
13. **NO RECENCY** — grep the surface, its metadata and its accessible labels for last, active, since,
    days, ago, recently, seen, visited, opened, date. **Expected: none.** Paste.
14. **NO ZERO** — paste every string rendered for a student with no record. No "0", no "none", no
    "not started".
15. **THE ARC'S THREE CONSUMERS** — verify at runtime that Scene 7, the student's region and this surface
    read the same definition: paste the seven steps from each. **No drift.**
16. **THE ROW IS A LINK** — paste the row's DOM before and after (from 6.2's record) and confirm **no
    interactive affordance existed before**, the link's accessible name contains student and subject,
    and **the row's visual weight is unchanged.**
17. **ONE DOMINANT ELEMENT** — measured at 390, as 5.3 and 6.2 did. Report which element dominates.
18. **ONE PRIMARY PER VIEW** — and if there is no action, **confirm no control renders at all** (paste
    the control count, as 6.2 did).
19. **NOT A PROFILE / NOT A DASHBOARD** — the DOM sweep: no avatar, no card grid, no chips, no sparkline,
    no stat row, no tabs, no accordion. Paste.
20. **NO EXPORT** — grep for print stylesheet, download, export, share, csv, copy. **Expected: none.**
    Paste.
21. **NO SECOND STUDENT ON THE PAGE** — grep the DOM for any other student's name; and confirm no link
    from this surface leads to another student. Paste.
22. **NO OBSERVATION** — grep for analytics, beacon, telemetry; **and confirm no access-log row was added
    for a tutor's read** (report the decision explicitly as pending a user ruling).
23. **THE IDENTITY MATRIX COVERAGE GATE** — the new route appears with all reader-class rows; **prove the
    gate fails if a row is dropped.** Paste.
24. **REGION CONTRACT** — the record region renders nothing when empty, server-side visibility, no empty
    container. Paste the DOM evidence.
25. **FAILURE BEHAVIOUR** — a failed region read is silent and logged; the primary answer is never
    silently absent. Paste both, with the log line, confirming no student content is logged.
26. **MOBILE-FIRST** — 390/360/320 and 1280, both themes; **PRIMARY ACTION ABOVE THE FOLD** where an
    action exists, and the statement's position where none does. Screenshots.
27. **ACCESSIBILITY** — one h1, heading nesting, the arc readable as text (state in words, never colour
    or position alone), keyboard pass, screen-reader order, contrast at both themes with measured ratios,
    grayscale, reduced motion, **no-JS complete**, 200%/400% zoom, 1.4.12 text spacing, ≥44px targets.
28. **PERFORMANCE** — payload before/after, LCP on the mid-range profile with a discarded warm-up and
    sample counts, TTFB, round trips. No canvas or WebGL.
29. **THE STUDENT SIDE IS UNCHANGED** — shell, environment and page harnesses show no diffs, **except the
    single declared exception from 0c if the label moved.**
30. **REGISTRY + HOMEPAGE** — entries, and the homepage's labels string by string before and after.
31. **ROW COUNTS** — non-test identities in every table, **expected zero.** Paste.
32. **PRODUCTION BUILD** — succeeds; `/dev/relationship-surface` absent or 404; no fixture data
    reachable; `.env.local` untouched and nothing secret printed.
33. **WHAT DOES NOT EXIST** — everything the tutor still cannot do here, listed, so the distance is
    written rather than implied.
34. `git status --porcelain` — pasted raw.

---

## REPORT BACK

1. Files created / modified, and the three close-outs with their evidence
2. **The route and the reader**, with the subject-scope reasoning
3. **The three indistinguishable cases**, diffed, and the no-probe result
4. **The surface's reading order as built**, and which element dominates at 390
5. **The identical-statement proof** — the bytes from three different students
6. The copy candidates and the choices, with reasoning
7. The arc's three consumers, verified at runtime
8. The row-becomes-a-link change, including **whether it had a false affordance before**
9. The PII grep, and the no-recency grep
10. What the surface refuses, listed: no profile, no dashboard, no action, no export, no comparison, no
    observation
11. The identity matrix's new rows and the coverage gate's proof
12. Accessibility, mobile-first, performance, JS payload
13. **0b's finding restated for the user** — the public payment promise, its audience, and the
    business-model question that only the user can answer
14. **0c's homepage strings**, flagged vetoable
15. Anything you could not implement, anything deferred, and confirmation nothing was half-built
16. Confirmation nothing outside the surface, the row's link, the close-outs and the documents changed

**STOP after the report.** Do not begin Step 6.4.
