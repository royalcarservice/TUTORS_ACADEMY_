# TUTORS ACADEMY — PHASE 5 · STEP 4: THE NEXT-ACTION ENGINE

Depends on 5.1 (architecture), 5.3 (the shell), and P5-R2 (correction pass).

**PRECONDITION — P5-R2 CLOSED.** Fixes 1–3 reported and Measure 4 returned. Fix 1 (the entry count
leaving the screen) touches exactly the strings this step generates; if it has not been done, do it
first, here, and say so.

**THIS STEP BUILDS A RESOLVER, NOT AN INTERFACE.** No new surface, no new visual language, no new
component. It replaces the CONTENT of one surface that already exists — the shell's dominant
answer — and defines the mechanism by which every future phase adds candidates to it.

---

## WHY

5.3 built a shell whose dominant surface answers *what now*. **Today that answer is hardcoded.**
Tomorrow it must choose between: a class starting in twenty minutes · a recording from a session the
student attended · an environment they were in yesterday · an environment they enrolled in and never
opened · and, for a student with none of those, the choice itself.

If Phase 7 answers that question by editing the shell, the shell is rebuilt once per phase. **The
engine exists so that Phase 7 adds a candidate, not a screen.**

**AND IT IS THE MOST DANGEROUS SURFACE IN THE PRODUCT.** A single dominant element that says *do
this next* is one design decision away from being a nag, a notification feed, or an engagement
machine. The rules below are the whole point of the step; the code is small.

---

## FIRST: INSPECT

1. **5.1's next-action priority order and extension contract.** This step implements them. **If
   what 5.1 specified differs from the tiers below, BUILD 5.1'S VERSION AND REPORT THE DIFFERENCE** —
   it was specified first and with fuller context.
2. **5.3's primary surface as built** — its props, its state matrix, and exactly which strings it
   renders in States A, B and C.
3. **`environment_state` and the enrolment model** — which fields are populated, and which are null.
4. **`src/config/modules`** — the registry that already drives the "Next · not built yet" labels.
5. **P5-R2's report** — the rendered strings after Fix 1, the authorization tests, and Measure 4.
6. The existing `/dev/*` convention and the audit harness, so the new dev route matches.

Report findings before building.

---

## THE MODEL

**The engine is a pure function.** Given a student's state, it returns **exactly one** action. No
database call inside the resolver, no clock read inside the resolver, no randomness. The clock and
the data layer are passed in. This is what makes it testable and auditable — and it is why the
answer cannot change between two requests with the same input.

```
type Candidate = {
  id: string                      // stable, namespaced, e.g. "enrolment:physics:resume"
  source: CandidateSource         // 'enrolment' today; grows per phase
  tier: 1 | 2 | 3                 // DECLARED by the provider, never computed
  kind: 'join' | 'attend' | 'begin' | 'resume' | 'choose'   // grows per phase
  subjectId?: string              // present = the surface may carry subject identity
  title: string                   // the instruction
  detail?: string                 // derived from populated fields ONLY
  href: string                    // MUST resolve for this student TODAY
  expiresAt?: string              // PRESENCE = time-bound. Absence = durable.
}

resolveNextAction(state, candidates, now) -> Candidate | null
```

**The resolver returns null only if there are no enrolment candidates and no origin candidate — which
must never happen.** State A is not a special case in the surface; it is the *origin candidate* the
engine always has available.

---

## THE PRIORITY ORDER — DECLARED, NOT COMPUTED

**The principle: something that stops being available outranks something that doesn't.** Urgency
here means *expiry*, and nothing else. Not importance. Not the student's interest. Not a score.

| Tier | Meaning | Today | Requires |
|---|---|---|---|
| **1 — Now** | available only in a window | *nothing emits this* | `expiresAt` — no expiry, no Tier 1 |
| **2 — Soon** | scheduled, or just finished | *nothing emits this* | a real timestamp |
| **3 — Whenever** | durable — resume or begin | **everything today** | `lastEnteredAt` |
| **4 — Origin** | no enrolment: the choice | State A | nothing |

Tier 1's window is a **named exported constant** (start: class begins; end: class ends), default 60
minutes before start, marked as P7's to tune. **A Tier 1 candidate without `expiresAt` is a defect
and must fail a test** — that rule is what stops "urgent" from becoming a decoration someone adds
for emphasis.

**DO NOT BUILD TIER 1 OR TIER 2 PROVIDERS.** They have no data. Build the tiers, the ordering and
the tests with fixtures; ship only the Tier 3 and 4 providers.

---

## WITHIN TIER 3 — THE ORDER, LOCKED

A student may have many enrolments and only one answer.

1. **Entered beats never-entered.** A student mid-momentum is continued, not redirected. Momentum is
   the phase's whole thesis; the engine must not break it to advertise something new.
2. **Among entered: most recent `lastEnteredAt` wins.**
3. **Among never-entered: earliest enrolment wins** — the one that has been waiting longest.
4. **Ties break deterministically** — by subject order in the config, never by array order or by
   whatever the database returns.

**A never-entered enrolment is still visible — in the subject rows, as "Not opened yet" (5.3).** It
does not get to compete for the single answer. **The engine surfaces AT MOST ONE thing that asks for
attention; that is the difference between an engine and a nag.**

---

## THE SURFACE BINDING — ONE SURFACE, N CANDIDATES

**The shell's primary surface does not branch per feature.** It renders an `{eyebrow, title, detail,
cta}` shape and, when `subjectId` is present, the subject's identity from 3.3: mark, accent,
environment name.

- **`kind` maps to an allowed treatment from a FINITE, EXISTING set.** Today: `begin`, `resume`,
  `choose` — all use the same treatment, because there is no reason to differ yet.
- **A NEW `kind` MAY ONLY BE ADDED WITH A TREATMENT THAT ALREADY EXISTS IN 2.5'S PRIMITIVES.**
  Inventing a new visual treatment in a data layer is forbidden; that is a design step, not an
  engine step.
- **The engine may not return a list.** No `resolveNextActions`. If a future phase needs to show
  three things, that is a composition decision made deliberately, not a resolver signature changed
  in passing.

**PERMITTED EDIT TO 5.3:** the primary surface's data binding. **NOT PERMITTED:** its size, position,
hierarchy, spacing, or DOM order. The 2.24 ratio and the one-dominant-element result must survive
byte-for-byte; re-run the harness and report.

---

## HONESTY RULES — ENFORCED IN CODE, TESTED

1. **A candidate may only exist if its `href` resolves for that student today.** The engine never
   produces a dangling action. Test every candidate kind your code can emit.
2. **A provider must consult `src/config/modules` before emitting anything.** If the registry does
   not declare the capability built, the provider returns nothing. **This is how Phase 7's provider
   cannot ship ahead of Phase 7** — the same source of truth that labels the homepage's "not built
   yet" beats now gates the student's own instructions.
3. **`detail` uses populated fields only** (5.3's rule, now the engine's). A null field produces
   silence, never a substitute phrase.
4. **NO COUNTS. NO PERCENTAGES. NO SCORES. NO STREAK, XP, LEVEL OR BADGE LANGUAGE.** P5-R2 Fix 1
   generalises: *a number in the primary answer must correspond to an action.* Recency is a phrase
   — "yesterday", "this morning" — not a quantity.
5. **Time language requires a real timestamp.** "Starts in 20 minutes" is only legal when
   `expiresAt` exists. No `expiresAt`, no clock sentence.
6. **No guilt, no urgency theatre, no "don't lose your progress".** The engine instructs; it does
   not motivate.
7. **No personalisation, and no AI ranking.** P9 may add a candidate *source*. It may not reorder
   the tiers, and it may not make the answer unexplainable. **Every answer must be reconstructable
   from data.** The dev route proves it.

---

## FAILURE AND FALLBACK

- **Resolution never throws in production.** A thrown provider is caught, isolated, and the resolver
  continues with the remaining candidates.
- **If resolution fails entirely, the surface renders the benign action** — the student's most recent
  environment, or the choice — never a blank dominant surface and never an error.
- **This path is tested by deliberate breakage**, 4.9's method: a provider that throws, a candidate
  with a 404 `href`, a candidate with a malformed date. Report the surface in all three cases.

---

## BUILD

**PART 1 — THE RESOLVER.** A pure module: the types, the tier constants, the ordering rules, the
filtering (expired, unresolvable, capability-not-built), the deterministic tie-break, the fallback.
No I/O. No clock. No database.

**PART 2 — THE PROVIDER CONTRACT.** A documented interface plus the registry. **Ship TWO providers:**

- **the enrolment provider** — Tier 3, using real `enrolment` + `environment_state`.
- **the origin provider** — Tier 4, always available: the choice, for a student with no enrolment.

The contract must state, in words: *what a future provider must do, what it must never do, and what
it must pass before its candidates are accepted.*

**PART 3 — THE SURFACE BINDING.** Wire the primary surface to the resolver, server-side. **No client
JS added.** Confirm the answer is present in the server-rendered HTML in every state.

**PART 4 — THE EXTENSION CONTRACT.** A written document: for each of P6, P7, P8, P9 — what candidate
it will contribute, which tier, which `kind`, what data it needs, which module-registry entry gates
it, and what it must not do. **Explicitly state what a future phase CANNOT change without a
ruling**: the tier order, the one-answer rule, the surface composition, the allowed treatments.

**PART 5 — `/dev/next-action`** (dev-only, `NODE_ENV !== 'production'`):
- the full state matrix: signed-in no enrolment · one never-entered · one entered · four mixed ·
  four entered · an enrolment whose subject config is draft
- the future fixtures: a Tier 1 candidate with a real expiry, a Tier 2, an expired Tier 1, a Tier 3,
  an unresolvable `href`, a candidate whose capability is not built — **each shown with the resolver's
  verdict: accepted, or rejected and why**
- **a "why this answer" panel**: every candidate considered, its tier, its sort key, and the winner
- the deliberate-breakage cases from Failure and Fallback
- a render of the primary surface for each accepted fixture, grayscale, reduced-motion and no-JS
- a plain statement: what is real today, and what is a fixture for a capability that does not exist

---

## CONSTRAINTS

- **NO NEW INTERFACE.** No SECOND surface, no history, no "up next" list, no queue, no badges.
- **NO new tokens, components, primitives, motion, or dependencies.**
- **NO database schema change.** If the engine needs a field that does not exist, **STOP AND REPORT**
  — that is a 5.1 amendment, not a quiet migration.
- **NO fake candidates anywhere except `/dev/next-action`.** No seeded data in production, ever.
- **DO NOT touch the three null states' composition** — the engine changes what the dominant surface
  *says*, not what it *is*.
- Do not modify 5.1's model, roles or policies; the certified subject system; the brand frame; the
  scene spine; or any Phase 3/4 surface.
- **DO NOT ADD AN ENROL BUTTON.** State A's loop closes in 5.5, not here.
- Do not begin Step 5.5.

**DO NOT CHANGE**
tokens, type, motion, spatial, primitives · brand mark, lockup, nav shell · subject system 3.1–3.6 ·
the 3.7 baseline · the scene contract, spine, scroll grammar, voice document · Scenes 0–8, the footer
· 4.9's findings · 5.1's model, roles, policies, momentum principle, real-vs-unbuilt map · 5.3's
three states, slot map, IA, nav items, and the 2.24 ratio · `/subjects` scaffold · the module
registry's existing entries · existing routes, copy, build and deploy setup.

---

## TESTS (all required)

1. **PURITY** — the resolver does not read the clock, the database, or `process.env`. Paste the
   module's imports. Same input, twice, returns a deep-equal result.
2. **DETERMINISM ACROSS RESTART** — resolve the same state before and after a server restart; the
   action and its `href` are identical. Paste both.
3. **EXACTLY ONE** — the resolver's public API returns a single candidate or the fallback. Grep for
   any plural/list variant. Expected: none.
4. **STATE A RESOLVES** — signed-in with zero enrolments returns the origin candidate, never null,
   never a blank surface. Paste the rendered HTML's primary surface.
5. **STATE B RESOLVES** — never-entered returns `begin`, and the string contains no count and no
   guilt. Paste it.
6. **STATE C RESOLVES** — entered returns `resume` with recency language derived from
   `lastEnteredAt`. With `lastEnteredAt` null, **no time sentence appears**. Paste both.
7. **THE ENTERED-BEATS-NEVER-ENTERED RULE** — four enrolments, mixed: assert the winner is the most
   recently entered, not the never-entered one. Paste the ordering with each candidate's sort key.
8. **TIER ORDERING** — with fixture candidates: a Tier 1 with a live expiry beats a Tier 2 beats a
   Tier 3. **Then remove the expiry and assert the Tier 1 candidate is REJECTED, not demoted.** This
   is the rule that keeps "urgent" from becoming decoration. Paste both.
9. **TIER 1 IN THE PRODUCT** — confirm no shipped provider can emit a Tier 1 or Tier 2 candidate
   today. Paste the grep.
10. **EXPIRY** — an expired candidate is filtered out; a candidate expiring in the future is not.
11. **CAPABILITY GATE** — a fixture whose capability is absent from the module registry is rejected
    with that reason. Paste the verdict line.
12. **HREF RESOLVES** — for every candidate kind the shipped providers can emit, confirm the `href`
    returns 200 for the enrolled student and 404/redirect appropriately otherwise. **A 404 is a
    defect.** Paste status codes.
13. **NULL-SAFETY** — resolve with every optional field null; nothing throws, no placeholder phrase
    appears. Paste the rendered strings.
14. **DELIBERATE BREAKAGE** — (a) a provider that throws · (b) a 404 `href` · (c) a malformed date.
    In all three: the surface renders the benign action, no error, no blank. Paste all three.
15. **SURFACE UNTOUCHED** — re-run the shell harness; report the h1-to-next-text ratio, the
    one-primary check, the fold measurement, and confirm **no diffs** to the surface's box model.
16. **SERVER-RENDERED** — the final answer is in the HTML for all three states, with JS disabled.
    Screenshot.
17. **NO CLIENT JS ADDED** — report the route's JS payload against P5-R2's number. A resolver that
    grew the bundle has been implemented in the wrong place.
18. **REPORT-ONLY SWEEP** — grep the engine's shipped strings for digits, `%`, `count`, `streak`,
    `minute`/`minutes` without `expiresAt`, `times`. Pasted, with each hit justified or removed.
19. **COPY SWEEP** — generated strings against the 4.1 voice document, the 4.1 banned list, and 4.7's
    cliché list. Paste the strings.
20. **ACCESSIBILITY** — the bound surface keeps one accessible name, a logical reading order, correct
    heading nesting, and text-only status. axe on `/student` at 390, all three states.
21. **PERFORMANCE** — resolution cost (report the measurement) and the page's LCP against P5-R2's
    2.8 s, on the mid-range Android profile. **If resolution has moved LCP at all, report why.**
22. **PRODUCTION BUILD** — succeeds; `/dev/next-action` absent or 404 in production; no fixture data
    reachable.
23. `git status --porcelain` — pasted raw.

---

## REPORT BACK

1. Files created / modified
2. **Any difference between this brief and 5.1's priority order** — and which you built
3. The resolver's public API, verbatim
4. The provider contract, verbatim
5. The extension contract for P6–P9 — what each contributes, and what none of them may change
6. The state matrix, with the winner and the sort keys for each row
7. The tier-ordering proof, including the expired-and-rejected case
8. The deliberate-breakage results
9. The surface-untouched result against the 2.24 ratio and the fold measurement
10. Every shipped string the engine can produce, listed
11. Sweeps: report-only, copy, capability, href
12. Accessibility, performance, and the JS payload delta
13. What is real today, and what exists only as a fixture
14. Anything you could not implement, anything deferred, and confirmation nothing was half-built
15. Confirmation nothing outside the engine and the surface's data binding was changed

**STOP after the report.** Do not begin Step 5.5.
