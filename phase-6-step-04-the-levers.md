# TUTORS ACADEMY — PHASE 6 · STEP 4: THE LEVERS

A tutor shapes an environment.

Depends on 6.1 (the levers recommendation, the relationship model, the policies), 6.2 (the shell, the
identity matrix, the attacks), 6.3 (the relationship's surface, the read pattern), **3.1 (the five
levers)**, 3.6 (the environment shell), **3.7 (the validator)**, 5.5 (the write conventions) and 5.7
(the states).

**PRECONDITION — 6.3 REPORTED.** This step extends 6.3's read paths and adds rows to 6.2's identity
matrix. **If 6.3 has not reported, run it first and say so.** Also quote, verbatim, **6.1's levers
recommendation** (Part 6 of that step) — this step builds it, and if the recommendation differs from the
rulings below, **build 6.1's and report the difference.**

**THIS IS THE FIRST SURFACE IN THIS PRODUCT WHERE A PERSON CHANGES SOMETHING FOR OTHER PEOPLE.** Every
tutor surface so far has read. This one writes — into **a space that students, including minors, spend
time in.** That is the whole reason for the rulings below.

---

## WHY

Scene 5 promised it: **a tutor shapes an environment.** Phase 3 defined how — five levers, a token
layer, one brand and many environments. **This step is where the promise becomes a mechanism, and it is
the point where the product's visual system could quietly fork.**

**THE TEMPTATION IS A THEME EDITOR.** Sliders, a colour picker, a live "make it yours" preview. **Every
part of that is wrong here**, and not for taste:
- **A colour picker breaks 2.6's brand frame** — the frame is identical in every environment, and the
  accent is the *subject's* identity, not a tutor's preference.
- **It breaks 3.7's validator** — contrast, ΔE and focus rings are guaranteed at build time. A runtime
  free-text colour has no gate at all.
- **It breaks the brand promise itself** — *choosing a subject changes the environment.* If a tutor can
  make Physics look like History, the choice stops meaning anything.

**AND THE SECOND TEMPTATION IS WORSE: PER-STUDENT.** *"Shape it for this student."* That is how a shared
environment becomes an instrument — **the student who gets the dimmed version knows exactly what that
means**, and it is a judgment about a child rendered in the furniture of the room they are asked to
learn in. **P6-R10 forecloses it structurally.**

---

## FIRST: INSPECT

1. **6.1's report** — the levers recommendation, quoted; the relationship model; the policy matrix.
2. **3.1's five levers as implemented**: accent triad · atmosphere · motif · `motionChar` · density.
   **For each: what it actually controls, its authored values today, and how the environment reads it.**
   **Name any lever that has only one authored value** — that is a declared-but-inert lever (3.7) and it
   is a finding, not a thing to wire up.
3. **3.6 and 3.7** — the environment shell, the Room's rules (no substrate, compact density), and **the
   validator**: exactly what it checks today, and whether it runs on config, on built output, or both.
4. **5.5's write conventions** — the POST that 303s, idempotency, no write on GET, no write on prefetch,
   initialisation, and the request-scoped client. **This step's write is the same shape, not a new one.**
5. **6.3's read pattern** — the argument-free relationship-scoped reader, and **the two attack files**
   (P6-R7): any new read or write path gets its own compile-time attack and its own permanent gate.
6. **6.2's identity matrix** — the routes × reader-classes table and the coverage gate. **This step adds
   a route and a write; both need rows in the same step** (P6-R6.4).
7. **Every standing rule** that constrains design state: the brand frame's invariance · the 16px floor ·
   the motion grammar and its budget · reduced-motion parity · the 44px target rule · 5.7's states.
8. **Where the furniture of the environment is rendered from** — the token layer, the accent triad, and
   **which reading path the environment's pages actually use** (server, and at which point).

Report findings before building.

---

## RULING P6-R10 — A TUTOR SHAPES THE ENVIRONMENT, NEVER THE STUDENT

**THE ENVIRONMENT BELONGS TO THE SUBJECT. NOT TO A STUDENT, NOT TO A RELATIONSHIP, NOT TO A TUTOR.**

- **NO PER-STUDENT ANYTHING.** No per-student settings, overrides, variants, profiles, themes, flags or
  exceptions — **in the model, in the policies, in the API, or in the rendered output.**
- **THE MODEL MUST BE UNABLE TO EXPRESS IT:** the settings table has no student column and no path to
  one. **Prove it structurally** (paste the DDL; show there is no student-scoped key) **and by attack**
  (a compile-time attempt to render settings for a student — it must not typecheck; P6-R7).
- **AND PROVE IT AT THE SURFACE:** **for one subject, every reader class renders a byte-identical
  environment.** Student A, student B, a related tutor, an unrelated tutor, a signed-out visitor — **the
  same bytes.** Paste the diff. *This is 6.3's identical-statement proof, applied to the furniture of the
  room.*
- **A tutor's lever choice applies to everyone in that subject, including students they do not teach.**
  That consequence is real and must be **stated in plain words on the surface before the change is
  saved** (P6-R12).
- **NO STUDENT-FACING NOTICE, NO CHANGELOG, NO "YOUR TUTOR CHANGED THIS".** A student is not told their
  room was rearranged — **a changelog would turn pedagogy into customisation and draw attention to the
  mechanism instead of the subject.** Say this in the report so the silence is a decision rather than an
  omission.
- **NOTHING OBSERVES THE STUDENT — and nothing observes the tutor either.** No analytics, no beacons.
  **Recording who shaped the environment is about the tutor's own action on design config, not about any
  student** — that is permitted, and nothing else is.

---

## RULING P6-R11 — THE LEVERS ARE CHOSEN, NOT AUTHORED

**A tutor selects among AUTHORED, VALIDATED VALUES. They never author values.**

- **EVERY LEVER EXPOSES A CLOSED SET OF OPTIONS, authored in the design system** — each with the six
  subjects' identities intact and **every combination passing 3.7's validator** before it can be chosen.
- **THE ACCENT TRIAD IS NOT A LEVER A TUTOR TURNS.** Nor the subject's mark, nor the brand frame, nor
  type, nor the motion grammar, nor the spacing scale as free values. **Identity is not customisable.**
  If any of those currently appear in the lever list, **report it as a finding and do not expose it.**
- **A LEVER WITH ONE AUTHORED VALUE IS NOT ADJUSTABLE AND MUST NOT BE PRESENTED AS SUCH** (3.7's
  declared-but-inert rule). **Report which levers are genuinely adjustable today, and which are not.**
  *A control that changes nothing is a false affordance — the same defect as a nav item that leads
  nowhere.*
- **THE VALIDATOR ENUMERATES COMBINATIONS.** Build-time validation must cover **every reachable
  combination per subject**, not each lever in isolation — contrast, ΔE against the identity, focus ring,
  and reduced-motion parity are properties of a *combination*. Report the combination count and the
  result, and **fail the build on any failing combination.**
- **NO FREE TEXT, NO HEX, NO ARBITRARY NUMBERS, NO UPLOAD.** Every input is a choice from an authored
  set.

---

## RULING P6-R12 — ONE ENVIRONMENT, AND THE SURFACE SAYS SO

**ONE PHYSICS.** Every student in Physics is in the same room.

- **THE SETTINGS BELONG TO THE SUBJECT**, and the surface must state the blast radius **in plain words
  immediately beside the control**, before saving: *this applies to everyone in Physics, including
  students you do not teach.* **Not a footnote, not a tooltip, not a checkmark to dismiss.**
- **IF ANOTHER TUTOR HOLDS A RELATIONSHIP IN THIS SUBJECT, THE SURFACE SAYS THE ENVIRONMENT IS SHARED**
  with them, and **who shaped it last** (the tutor's own record). **Report what 6.1 recommended here and
  what you built** if the two differ.
- **REVERT TO THE AUTHORED DEFAULT IS ALWAYS AVAILABLE**, as a real action, not a hidden one. **A tutor
  who changes something and regrets it must be able to put it back without asking anyone.** Reverting is
  safe by construction: the default is authored and validated.
- **ABSENCE MEANS THE AUTHORED DEFAULT — AND THAT IS NOT AN INFERENCE.** This is the one place in this
  product where a missing row legitimately means a real value, **because the default exists by design**
  (contrast P5-R6's never-emit-a-zero: there, absence meant *we do not know*; here it means *as
  authored*). **Say which it is in one comment at the read site**, so the two are never confused.
- **THE WRITE IS 5.5'S SHAPE, NOT A NEW ONE:** a **POST that 303s**, idempotent, **no write on a GET,
  no write on a prefetch**, request-scoped client with the tutor's own session, **never the service
  role**. **No write happens by viewing.**
- **THE ENVIRONMENT IS THE ONLY RENDERER.** A preview inside the shaping surface is permitted **only if
  it renders through the environment's own components and tokens with no parallel styling path**, and
  **only if a test asserts the preview's markup and the environment's markup are identical for the same
  settings.** Otherwise: no preview, and the surface links to the environment. **Two renderers drift;
  report which you chose.**

---

## THE MODEL

**One new table, and nothing else.** Report the DDL.

- **`environment_settings`**, keyed by the subject's immutable `id` (3.1, P5-R4/E-13: ids are locked and
  checkable; **status stays in TS config and must not appear here**).
- **The lever values**, constrained to the authored sets — **as a `CHECK` against the authored values, or
  as a foreign key to a values table**, whichever the project's conventions prefer. **Report the choice.**
  A value that is not authored must be **impossible to store**, not merely rejected in the UI.
- **`shaped_by` and `updated_at`** — the tutor's own record of their own action. **Nothing about any
  student.**
- **A uniqueness constraint that makes two settings rows for one subject impossible.**
- **RLS:** SELECT to `anon` and `authenticated` **— the environment is public design config, the same
  identity a visitor sees, and that is deliberate** (4.5's two-level product: identity is public, depth is
  not) · INSERT/UPDATE **only for an authenticated tutor with at least one relationship in that subject** ·
  everything else denied. **Paste all policies and every assertion, including the negative cases:
  a student, an unrelated tutor, a signed-out visitor, and a tutor writing for a subject they have no
  relationship in.**

**If this step needs any schema beyond `environment_settings`, STOP AND REPORT.**

---

## BUILD

**PART 1 — THE MODEL** as above, with the policies and the policy-break assertions.
**PART 2 — THE READ.** The environment reads its settings server-side. **Report where in the request the
read happens, how many round trips it adds, and its effect on TTFB and LCP** (5.6's environment route
already reported 600–740ms; state the delta). **Absence = the authored default, commented as such.**
**PART 3 — THE VALIDATOR'S COMBINATION PASS**, at build time, failing the build on any combination.
Report the count and the matrix.
**PART 4 — THE SHAPING SURFACE.** A tutor surface for a subject they relate in. **Room rules, compact
density, 390-first, one dominant element, one primary.** A **form** — selects, a save, a revert —
**works with JS off.** Show the current values, the blast radius sentence (P6-R12), the shared-tutor note
where it applies, and the way back. **Nothing else on the page.**
**PART 5 — THE ROUTE.** Subject-scoped, resolving the relationship server-side, **never from a subject
id alone** (P6-R1/R9). Propose the shape. **Add its identity-matrix rows in this step** (P6-R6.4), for
every reader class, **including the write.**
**PART 6 — THE ATTACKS** (P6-R7): a compile-time attempt to write with a student id, and one to read
settings scoped to a student. **Each fails to typecheck, with its expected error codes, asserted by the
harness as a permanent gate.**
**PART 7 — THE DOCS.** Append to `docs/TUTOR_VISIBILITY.md`: what a tutor may change here, what they may
never change, the blast radius, and the revert. Append to `docs/STATE_LANGUAGE.md` if this step creates
any new state.
**PART 8 — THE REGISTRY** using P5-R7's unit and P6-R8's rule (an entry names a phase). **Do not mark
anything live that has no surface**, and report the homepage's labels string by string.
**PART 9 — `/dev/environment-levers`** (dev-only): every lever with its authored options and its verdict
(adjustable or inert) · **the combination count and the validator's result rendered** · the absence ⇒
default case · **the byte-identical environment across five reader classes** · the shared-tutor note ·
the two failed attacks · grayscale, reduced motion, no-JS, 390 first paint · and a plain statement of
**what is real today and what cannot be reached.**

---

## CONSTRAINTS

- **NO SCHEMA CHANGE BEYOND `environment_settings`.** STOP AND REPORT if anything else is needed.
- **NO ACCENT, MARK, TYPE, MOTION-GRAMMAR OR BRAND-FRAME VALUE IS SELECTABLE.**
- **NO PER-STUDENT ANYTHING**, anywhere, in any form.
- **NO FREE-TEXT OR ARBITRARY VALUES.** Authored sets only.
- **NO NEW TOKENS, COMPONENTS, PRIMITIVES, MOTION OR DEPENDENCIES.**
- **NO CLIENT JS ADDED.** The surface is a form. Report the payload before and after.
- **NO ANALYTICS, BEACONS OR TRACKING.**
- **NO STUDENT-FACING NOTICE, CHANGELOG OR HISTORY.**
- **NO EDITING OF THE STAGE SCENES.** The levers shape a **Room**; the homepage is unaffected. Report
  the homepage's strings and DOM hashes before and after.
- **NO CHANGE TO 3.7's EXISTING VALIDATOR RULES** — extend it, do not loosen it.
- Do not touch the certified subject system's identities, the brand frame, the scene spine, Scenes 0–8,
  5.1's model, 5.3's student shell, 5.4's resolver, 5.5's write conventions or region contract, 5.6's
  module and vocabulary, 5.7's states, 6.2's shell composition, or 6.3's surface.
- **DO NOT BEGIN STEP 6.5.**

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives · brand mark, lockup, nav shell · subject system 3.1–3.6 and
each subject's accent triad and mark · 3.6's chrome and honest labels · the 3.7 baseline and the subject
harness · the scene contract, spine, scroll grammar, voice document · Scenes 0–8 and the footer · 4.9's
and 5.8's findings · 5.1's model and policies · 5.3's IA, ratio, fold gate · 5.4's tiers, treatments,
provider contract · 5.5's predicate, write semantics, region contract · 5.6's model, documents, arc ·
5.7's inventory, logger, `isolate.ts` · 6.1's relationship model, policy matrix, visibility ruling ·
6.2's shell, ordering rule, reader, attacks, identity matrix · 6.3's surface, route and reader ·
`docs/proposed/progress_record.sql` · existing build and deploy setup.

---

## TESTS (all required)

1. **PRECONDITION** — 6.3's report state, and **6.1's levers recommendation quoted verbatim**, with any
   difference from this brief and which you built.
2. **THE LEVER INVENTORY** — all five levers: what each controls, its authored values, **and whether it
   is genuinely adjustable or inert.** Paste it.
3. **THE COMBINATION VALIDATOR** — the count of reachable combinations per subject, the total, and the
   result. **Prove it fails the build on a failing combination** (introduce one, paste the failure,
   revert).
4. **NO IDENTITY LEVER** — paste the surface's full control list and confirm no accent, mark, type,
   motion-grammar or frame value is selectable. **Grep the settings table for identity values.**
5. **NO PER-STUDENT ANYTHING** — paste the DDL and show there is no student-scoped key; then **the
   compile-time attack** (P6-R7) and its expected error codes.
6. **BYTE-IDENTICAL ENVIRONMENT** — five reader classes, one subject: **paste the five render hashes.**
   Identical. This is P6-R10's proof at the surface.
7. **THE BLAST-RADIUS SENTENCE** — paste it verbatim and where it sits relative to the save control.
8. **THE SHARED-TUTOR NOTE** — with two tutors related in one subject, paste what the surface says.
9. **THE WRITE** — POST → 303, idempotent (save twice = one row, no error), **no write on GET, no write
   on prefetch**, request-scoped client, **service role absent from the path.** Paste all of it.
10. **REVERT** — revert to the authored default, pasted, with the resulting row.
11. **ABSENCE = DEFAULT** — delete the settings row; the environment renders the authored default.
    **Paste the render hash beside the explicit-default render hash.** Identical.
12. **THE POLICIES** — every assertion pasted: a related tutor may write · a student may not · an
    unrelated tutor may not · a signed-out visitor may not · **a tutor writing for a subject they have no
    relationship in fails against the live database.** RLS is the enforcement point.
13. **THE ROUTE** — resolved server-side from the session and the URL; **a URL naming a subject the tutor
    does not relate in is indistinguishable from a subject that does not exist** (P6-R9's rule, applied
    here). Paste both, byte-identical.
14. **IDENTITY MATRIX ROWS** — the new route and the write, all reader classes; **prove the coverage gate
    fails if a row is dropped.** Paste.
15. **NO STUDENT-FACING CHANGE** — grep every student surface and the environment for any notice,
    changelog, history or "changed" string. **Expected: none.** Paste.
16. **THE HOMEPAGE IS UNTOUCHED** — strings and DOM hashes before and after; **no diffs.**
17. **THE ENVIRONMENT'S NUMBERS** — TTFB and LCP before and after, mid-range profile, warm-up discarded,
    sample counts; **the added read's round trips, stated in one line.** Report the delta and whether it
    is within the pin.
18. **MOBILE-FIRST** — the shaping surface at 390/360/320 and 1280, both themes, no horizontal scroll;
    **PRIMARY ACTION ABOVE THE FOLD**; one dominant element; ≥44px targets; no hover dependency.
    Screenshots.
19. **ACCESSIBILITY** — one h1, heading nesting, every select labelled, the blast-radius sentence in the
    reading order **before** the save control, keyboard pass, screen-reader order, contrast at both
    themes, grayscale, reduced motion, **no-JS: the form completes a real save**, 200%/400% zoom,
    1.4.12 text spacing. Paste.
20. **NO CLIENT JS ADDED** — payload before and after, per route.
21. **NO FREE INPUT** — grep the surface for `type="color"`, `type="text"` on a lever, sliders, upload,
    hex. **Expected: none.** Paste.
22. **NO OBSERVATION** — grep for analytics, beacon, telemetry; confirm nothing about a student is
    recorded, and state plainly what `shaped_by`/`updated_at` are and are not.
23. **FAILURE BEHAVIOUR** — a failed settings read on the environment: silent region + log, **and the
    environment still renders the authored default rather than a broken room** (state this rule
    explicitly — a failed settings read is not "no environment"). Paste the log line and the render.
24. **REGISTRY + HOMEPAGE** — entries added; homepage labels before and after, string by string.
25. **ROW COUNTS** — non-test identities in every table, **expected zero**, including
    `environment_settings`. Paste.
26. **PRODUCTION BUILD** — succeeds; `/dev/environment-levers` absent or 404; no fixture data reachable;
    `.env.local` untouched and nothing secret printed.
27. **THE STUDENT AND RELATIONSHIP SIDES ARE UNCHANGED** — shell, environment, states and tutor harnesses
    show no diffs, apart from declared exceptions.
28. **WHAT DOES NOT EXIST** — every lever that is inert, every option that is authored but not yet
    configurable, and everything a tutor still cannot do here. Listed, so the distance is written rather
    than implied.
29. `git status --porcelain` — pasted raw.

---

## REPORT BACK

1. Files created / modified, and 6.1's levers recommendation quoted
2. **The lever inventory** — what each does, its authored values, and which are adjustable today
3. **The combination validator's result** and how it fails a build
4. **The model** — DDL, constraints, policies, and the four negative assertions
5. **The byte-identical proof** across five reader classes
6. **The shaping surface as built** — layout, the blast-radius sentence, the shared-tutor note, revert
7. **The write**, with idempotency, the no-write-on-GET proof, and the service role's absence
8. **Absence = default**, with both render hashes
9. **The route**, and the indistinguishable case
10. The identity matrix's new rows and the coverage gate's proof
11. The two failed attacks, with their error codes, asserted by the harness
12. The environment's performance delta and round trips
13. Accessibility, mobile-first, JS payload
14. **What is inert or not yet configurable** — the honest distance
15. Anything you could not implement, anything deferred, and confirmation nothing was half-built
16. Confirmation nothing outside the settings model, the read, the shaping surface, the validator's
    extension and the documents changed

**STOP after the report.** Do not begin Step 6.5.
