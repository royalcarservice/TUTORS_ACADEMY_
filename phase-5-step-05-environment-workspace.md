# TUTORS ACADEMY — PHASE 5 · STEP 5: THE ENVIRONMENT WORKSPACE

Depends on 5.1 (architecture), 5.3 (the shell), 5.4 (the next-action engine), P5-R2/R3/R4, and the
certified Phase 3 environment (3.6 + the 3.7 gate).

**PRECONDITION — 5.4 EXECUTED.** This step changes the element semantics of the action 5.4 binds. If
the engine is not built yet, **run 5.4 first** — it is written, it is small, and doing this step on a
hardcoded surface would mean doing it twice. Report which order you are in.

**THIS STEP CLOSES THE LOOP THE STUDENT SPACE HAS BEEN CARRYING SINCE 5.3.**

---

## WHY

The student chose an environment. **This is what happens when they walk into it.**

Everything so far has been about *arriving*: the homepage offers a choice, the shell orients, the
engine picks the next act. **This step is where a student stops arriving and starts being somewhere.**

And it closes a loop that is currently open in production: **State A's action (choose) leads to a
choice that cannot be made.** `/subjects` shows six identities; nothing can enter any of them. **The
enrolment write is the missing half of the product** — without it, the student space is a set of
designed rooms with no doors.

**AND THIS IS THE POINT WHERE THE ENVIRONMENT COULD BECOME A DASHBOARD.** The instinct will arrive
here with force, because for the first time there is a student inside a place with things that will
eventually be theirs: sessions, recordings, resources, assignments, progress. **Almost none of it
exists.** The step's job is to define *where each of those lives* and to prove the place works with
none of them present.

---

## FIRST: INSPECT

1. **3.6 + 3.7** — the environment shell, its region structure, its honest labels, its certified
   chrome, the subjects harness and its committed baseline. **What is actually inside an environment
   today**, per subject status.
2. **`/subjects/[id]` behaviour today**, for every combination that matters: signed-out · signed-in
   non-enrolled · enrolled, on a **ready** subject and on a **draft** one. Report all of them with
   status codes and what renders.
3. **4.4's door logic and its amendment** — the exact source that decides *enterable*. **This step
   reads it; it does not re-derive it** (P5-R4).
4. **4.5's two-level product rule** — the homepage shows IDENTITY, depth only by ENTERING.
5. **5.1** — the enrolment and `environment_state` shape, the policies, the roles, the momentum
   principle, the real-vs-unbuilt map.
6. **5.3** — the shell, its slot map, its three null states, its never-contains list, its harness.
7. **5.4** — the resolver, the providers, the surface binding, the extension contract.
8. **`src/config/modules`** — the registry that gates 5.4's providers and labels the homepage's
   "not built yet" beats.

Report findings before building.

---

## RULING P5-R5 — ONE ENVIRONMENT, ROLE-SCOPED REGIONS

**There is one environment per subject. Not two.**

`/subjects/[id]` is where a subject *is*. The student's workspace is **the same place, with their own
regions live.** **Do not create `/student/[subject]`, or any second environment route.**

Reasons, one line each: the brand promise is that choosing a subject changes the environment, and two
pages wearing the same identity will drift · 4.5 already answered it — the homepage shows IDENTITY and
depth only by ENTERING, and entering has one destination · 5.1's contract is literally
*subject-agnostic chrome, subject-scoped workspace*, and this is that · and a second route doubles
the surface that Phases 7–9 must fill.

**WHAT DIFFERS BY IDENTITY IS REGIONS AND ACTIONS, NOT THE PLACE.** A visitor sees the environment
and what is coming. A student sees the environment and their own. **Region visibility, decided
server-side, is the mechanism.**

**FALLBACK, REPORT-ONLY.** If you find the composition cannot serve both readings without degrading
either — the test: at 390, both the visitor's identity reading and the student's one-answer reading
survive with no competition for first attention — **REPORT IT WITH THE EVIDENCE. Do not build the
split.**

---

## THE ENROLMENT WRITE — THE HEART OF THIS STEP

**CHOOSING IS ENTERING.** Enrolment is not a checkbox or a settings toggle. It is crossing the
threshold. 4.4 made the doors *thresholds, not previews*. **So the write lives at the environment, as
the act of beginning.**

- **The control** — "begin here" (copy: propose 1–3 candidates with reasoning; voice per 4.1) — is the
  environment page's primary action **for a signed-in student who is not yet enrolled in an
  enterable subject.**
- **ENTERABLE IS READ FROM 4.4's DOOR LOGIC, VIA ONE EXPORTED PREDICATE, USED BY BOTH the control's
  visibility AND the write's authority.** One source of truth. If the predicate and the door
  disagree anywhere, that is a defect — report it, do not patch it here.
- **Where the door is not enterable, there is no control** and the page behaves exactly as today.
- **THE WRITE USES THE REQUEST-SCOPED CLIENT WITH THE STUDENT'S OWN SESSION — NEVER THE SERVICE
  ROLE.** The INSERT policy must actually be exercised; that is the point of having it. The service
  role is for test accounts only.
- **IDEMPOTENT.** Beginning twice creates one enrolment and no error. Use the schema's uniqueness if
  it exists — report it; if it does not, report what protects against a double submit.
- **IT INITIALISES `environment_state`** for that subject: `last_entered_at` stamped,
  **`position` NULL. Do not invent a position.**
- **IT IS A POST THAT 303s INTO THE ENVIRONMENT.** Not a GET with a side effect. Not a client-side
  fetch that dies without JS. A form POST works with JS off and survives a slow connection.
- **NO WRITE HAPPENS ON A PAGE VIEW.** Fetching the environment writes nothing, in any state.
  Prefetching writes nothing. **Asserted by test, not by intention.**
- **A SESSION IS REQUIRED.** A signed-out visitor has no control, and the endpoint refuses.

---

## ENTRY, RECENCY, AND WHAT THE COUNT IS FOR

- **A VISIT IS NOT AN ENTRY.** Entering is an explicit act: pressing *Open* in the shell, or *Begin
  here* at the threshold. **Recency means last explicit entry** — state that in one comment where the
  value is written, and **never let copy imply the page tracks visits.**
- **THEREFORE THE SHELL'S PRIMARY ACTION BECOMES A POST WHEN IT OPENS AN ENVIRONMENT THE STUDENT IS
  ALREADY ENROLLED IN.** Same element, same size, same position, same hierarchy — different element
  semantics, because the act records something. **Update the harness's "the action resolves" gate
  rather than deleting it:** assert the POST 303s to a page that returns 200.
  - **TRADEOFF TO REPORT:** a POST button cannot be opened in a new tab the way a link can. State
    whether that matters on the target surface (390, the primary action) and what you decided.
- **THE COUNT IS NEVER DISPLAYED.** `entry_count` may be written and may be read by 5.4's provider
  for ordering. It appears in **no string on any surface**. Assert by grep.
- **NO STREAK. NO "3 VISITS". NO "WELCOME BACK" BADGE.** None of the vocabulary of return.

---

## THE REGION CONTRACT — ONE REGISTRY, TWO SCOPES

Extend 5.3's slot map. **Do not invent a second registry.**

- **Scope: shell** — the cross-subject view (5.3, built).
- **Scope: environment** — the same capabilities scoped to one subject: its sessions, recordings,
  resources, assignments, progress, assistance.
- **A SLOT WITH NO DATA RENDERS NOTHING.** Never an empty box, never a heading with nothing beneath
  it, never "coming soon". 3.6's honest labels stay exactly as they are for a visitor; for a student
  they resolve to **the same honest statement — do not add a second copy of it.**
- **REGION VISIBILITY IS DECIDED SERVER-SIDE.** A student's regions are **not in a visitor's HTML.**
  Assert by grepping both server-rendered outputs.
- **EVERY STUDENT REGION IS GATED BY `src/config/modules`** — the registry that already gates 5.4's
  providers and labels the homepage. A region whose capability does not exist does not render.
- **REPORT THE TWO-LEVEL MAP:** for each capability — its shell slot, its environment slot, the phase
  that populates it, and **what renders today.**

---

## WHAT THIS STEP MUST NOT BECOME

The environment is **a place, not an accounting screen.**

**Nothing derived from counts, durations, streaks, scores, levels, ranks or badges. No "your progress
at a glance". No cards. No grids of equal weight. No activity feed. No notifications. No
recommendations.**

Today, a student inside an environment sees: **the environment, its honest structure, and a way back
to their space.** If that feels thin, **it is thin — nothing inside exists yet. The correct response
is the honest label, not a fabricated surface.** That restraint is the deliverable.

---

## BUILD

**PART 1 — THE PREDICATE.** One exported function answering *may this identity enrol in this subject*,
reading 4.4's door logic. Used by the control's visibility and by the write's authority. No second
copy of the rule anywhere.

**PART 2 — THE ENTRY WRITE.** Server-side, request-scoped client, idempotent, initialising
`environment_state`, 303. Report the exact path, the policy it exercises, and what happens on a
double submit.

**PART 3 — THE THRESHOLD CONTROL.** On the environment page, for the one state that needs it.
Composed from existing primitives. Server-rendered. Works without JS. **One primary per view.**

**PART 4 — THE SHELL'S ACTION.** POST when the destination is an already-enrolled environment; same
composition; gate updated; tradeoff reported; the h1-to-next-text ratio and the fold gate unchanged.

**PART 5 — THE REGION CONTRACT, SECOND SCOPE.** Registry-gated, server-side visibility, nothing when
unpopulated.

**PART 6 — NAVIGATION.** A signed-in student inside an environment must be able to return to their
space without the browser's back button. **Report whether 3.6's chrome already offers it.** If it does
not, add the minimum — **and report whether that changes the environment's certified composition for
visitors. It must not.**

**PART 7 — `/dev/environment-workspace`** (dev-only, `NODE_ENV !== 'production'`):
- the state matrix: signed-out · signed-in non-enrolled (ready) · signed-in non-enrolled (draft) ·
  enrolled (ready) · enrolled (draft) · enrolled with no `environment_state` row
- the region extremes: zero populated, some, all — and the composition at each
- **the visitor/student HTML comparison** side by side, so region visibility is directly visible
- the write's evidence: before/after rows, the double-submit result
- the primary action's three states rendered, grayscale, reduced motion, no-JS, 390 first paint
- a plain statement: **what is real today, and what is a fixture**

---

## CONSTRAINTS

- **NO SECOND ROUTE. NO `/student/[subject]`.** P5-R5.
- **NO SCHEMA CHANGE.** If a field the write needs does not exist, **STOP AND REPORT** — that is a 5.1
  amendment, not a quiet migration.
- **NO UNENROL CONTROL.** State the reason in the report: what happens to a student's data when they
  leave is a **retention decision that has not been made**, and DPDP obligations attach to it. An
  unenrol button that silently orphans rows is worse than no button.
- NO new tokens, components, primitives, motion, or dependencies.
- **NO CLIENT JS ON THE ENVIRONMENT ROUTE.** The threshold control is a form. Report the route's JS
  payload before and after.
- **NO ANALYTICS, NO BEACONS, NO TRACKING OF ANY KIND.** Nothing observes the student.
- **DO NOT CHANGE THE VISITOR EXPERIENCE.** For a signed-out visitor the environment page must be
  byte-comparable to the certified baseline, apart from anything already recorded as an exception.
- Do not touch 5.3's three null states' composition beyond the action's element semantics; 5.4's
  resolver contract; 5.1's model, roles or policies; the certified subject system; the brand frame;
  the scene spine; or any Phase 3/4 surface.
- **DO NOT BEGIN STEP 5.6.**

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives · brand mark, lockup, nav shell · subject system 3.1–3.6,
including the door logic's behaviour · 3.6's chrome, regions and honest labels · the 3.7 baseline and
the subjects harness · the scene contract, spine, scroll grammar, voice document · Scenes 0–8 and the
footer · 4.9's findings · 5.1's model, roles, policies · 5.3's IA, nav items, ratio and fold gate ·
5.4's resolver, providers and extension contract · `/subjects` scaffold · the module registry's
existing entries · existing build and deploy setup.

---

## TESTS (all required)

1. **PRECONDITION** — confirm 5.4 is built. If it is not, say so and run it first.
2. **THE PREDICATE IS THE ONLY SOURCE** — paste the export, and grep proving neither the control nor
   the write re-derives enterability. Report the enterable set as the door logic defines it, and
   **report any disagreement between the door logic and the subject status model** rather than
   patching it.
3. **THE WRITE USES THE STUDENT'S SESSION** — paste the client construction and the code path. Confirm
   the service role appears nowhere in it.
4. **IDEMPOTENCY** — begin twice; one enrolment; no error. Paste the row count and the response codes.
5. **INITIALISATION** — after the write: enrolment exists, `last_entered_at` stamped, `position` NULL.
   Paste the row.
6. **NO WRITE ON GET** — fetch the environment page in all five states and assert **zero writes**.
   Paste the evidence.
7. **NO WRITE ON PREFETCH** — confirm a link prefetch performs no write. Paste the evidence.
8. **SIGNED-OUT REFUSAL** — the POST with no session is refused, and no control exists in the
   signed-out HTML. Paste the status code and the grep.
9. **STATE A CLOSES** — the full journey with status codes and screenshots: shell State A → choose →
   door → threshold → **shell State C**. This is the loop this step exists to close.
10. **STATE B's action works** — begin → entered → the shell's answer changes accordingly.
11. **RECENCY DEFINITION** — only explicit entry stamps. `last_entered_at` NULL → **no time sentence
    anywhere**. After an entry → the true sentence. Paste both.
12. **THE COUNT IS INVISIBLE** — grep every shipped string for the count, and for `visit`, `times`,
    `streak`, `welcome back`. Expected: none. Paste.
13. **VISITOR UNCHANGED** — `page.cjs --check` and the subjects harness: **no diffs** for a signed-out
    visitor. Paste both results.
14. **REGION VISIBILITY** — a student's regions do not appear in a visitor's server-rendered HTML, and
    vice versa. Paste both greps.
15. **NOTHING RENDERS WHEN UNPOPULATED** — DOM evidence at zero, some and all regions populated, with
    screenshots.
16. **REGISTRY GATE** — a region whose capability is absent from `src/config/modules` does not render.
    Paste the verdict.
17. **NO LEAKAGE** — student B's environment cannot render student A's state. Paste the observation.
    (The RLS test already proves the data layer; this proves the surface.)
18. **NO FABRICATED POSITION** — `position` stays NULL and **nothing on any surface implies a place
    inside the environment**. Paste every string that mentions where the student is.
19. **DASHBOARD SWEEP** — grep and read: no stat cards, no metric grids, no equal-weight card grids,
    no feed, no notification affordance, no recommendation, no progress bar or ring. Paste.
20. **ONE PRIMARY PER VIEW** — in every state, exactly one primary action. Report which element it is
    in each state.
21. **SURFACE UNTOUCHED** — the shell harness: ratio, one-primary, fold gate. The environment harness:
    the subject's certified composition unchanged for visitors. Paste both.
22. **MOBILE-FIRST 390** — every state at 390×844, primary action above the fold, screenshots.
23. **ACCESSIBILITY** — keyboard pass, screen-reader order, one h1, the control's accessible name,
    text-only status, contrast at both themes, grayscale, reduced motion, **no-JS (the control must
    work)**, 200% and 400% zoom, 1.4.12 text spacing, touch targets ≥44px. Paste results.
24. **PERFORMANCE** — the environment route on the mid-range Android profile: LCP element and value,
    CLS, longest task, and **the JS payload before/after**. Report the POST's latency separately.
25. **HARNESS EXTENDED** — the environment route, all five states, 390 reference, plus the named
    **PRIMARY ACTION ABOVE THE FOLD** gate (P5-R3's standard). Baseline updated actual-vs-actual.
    Report pass/fail.
26. **PRODUCTION BUILD** — succeeds; `/dev/environment-workspace` absent or 404; no test data
    reachable; `.env.local` untouched and nothing secret printed.
27. **DECLARED EXCEPTIONS** — anything this step changes on a certified surface is recorded in the
    baseline as expected behaviour, per the P5-R2 precedent.
28. `git status --porcelain` — pasted raw.

---

## REPORT BACK

1. Files created / modified, and which order you ran 5.4 and 5.5 in
2. **The enterable set as the door logic defines it** — and the consequence: how many subjects a real
   student can actually enter today, stated plainly
3. The predicate, verbatim, and the proof that it is the only source
4. The write path — client, policy exercised, idempotency mechanism, 303
5. The threshold control — the copy candidates and your choice, with reasoning
6. The shell action's change, the tradeoff, and the updated gate
7. **The two-level region map** — shell slot, environment slot, phase, what renders today
8. Region-visibility evidence, and the unpopulated-extremes result
9. The State A → C journey, with evidence
10. Every shipped string the environment can now render, listed, with its truth status
11. Sweeps: count, dashboard, fabrication, copy
12. Accessibility, performance, JS payload, and the visitor no-diff result
13. **The P5-R5 fallback verdict** — does one environment serve both readings at 390? Evidence either
    way
14. Anything you could not implement, anything deferred, and confirmation nothing was half-built
15. Confirmation nothing outside the entry write, the region contract and the action's semantics was
    changed

**STOP after the report.** Do not begin Step 5.6.
