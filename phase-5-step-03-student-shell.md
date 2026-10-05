# TUTORS ACADEMY — Phase 5 · Step 3
## The Student Shell

> Depends on Step 5.1 (architecture, data model, roles, auth boundary) and Phases 2–4 (certified).
>
> **FIRST: confirm real authentication exists and works.** Step 5.1 Part 4 required it. If auth is
> a stub, a mock, or absent, **STOP and report** — this shell has nothing to render without an
> identity, and building it on fake auth would poison every later phase.
>
> **This step builds the shell: chrome, information architecture, and the three states a shell can
> be in.** It does not build the next-action engine (5.4), the environment-scoped workspace (5.5),
> or the progress language (5.6).
>
> **This is the first screen in this product a student opens on purpose.** Everything so far has
> been something they were shown. This is something they return to.

---

### WHY THIS STEP EXISTS

The homepage's job is a **decision**. The environment's job is an **atmosphere**.

The student shell's job is **orientation**: a student opens it, and within three seconds knows what
to do next.

**Every instinct will push this toward a dashboard.** Six cards, a welcome banner, a stat row. That
is the failure state this step exists to prevent — and it is a *default*, not a choice. It takes
deliberate composition to avoid it.

---

### THE FIVE LOCKED DECISIONS

**1. ONE ANSWER FIRST. Everything else is subordinate.**

- **The shell opens with a single dominant surface** that answers *what now*.
- **Not** a welcome header followed by a grid of equal cards. **Not** a stat row. **Not** a banner.
- **One element clearly wins** in size, position and contrast. Every other element is visibly
  quieter. **The hierarchy must be obvious at a glance, at 390px, without scrolling.**
- **Test:** screenshot the shell at 390×844. **If two elements compete for first attention, it has
  failed.**
- **This is the momentum principle's structural expression** — the composition itself says *start
  here*.

**2. MOBILE-FIRST BUDGETS. Desktop is the derived case.**

- **From this step onward, the phone is the primary surface, not the degraded one.** A student
  checking what to do next is on a phone.
- **Design and budget at 390px first.** Desktop is an enhancement of that composition, not the
  other way round.
- **The whole shell must fit without horizontal scroll at 320px**, and the primary answer must be
  reachable **without scrolling** at 390×844.
- **Performance is budgeted on a mid-range Android**, not a desktop. Report payload and timings for
  that profile specifically — not for a fast machine.
- **Touch targets ≥44×44, ≥8px gaps.** No hover dependency anywhere.

**3. THE SHELL IS DESIGNED FOR ITS EVENTUAL CONTENTS, NOT TODAY'S.**

At Phase 9 this shell holds: classes, recordings, resources, progress, AI assistance, assignments.
Today it holds: **enrolments, environment state, and identity.**

- **Define where each future capability lives**, positioned deliberately in the composition — so
  Phase 7 does not force a rebuild.
- **Each slot renders NOTHING until it has real data. It never renders as an empty box.**
- **No skeletons, no shimmer, no "coming soon", no grey placeholder panels.** An unpopulated slot
  is **absent**, not empty-looking. The composition must remain coherent with slots missing —
  verified at zero slots, some slots, and all slots.
- **Report the slot map:** what exists today, what each future phase adds, and where it sits.

**4. THREE NULL STATES, ALL DESIGNED. The middle one is the one people forget.**

| State | What it is | Frequency |
|---|---|---|
| **A — No enrolment** | Chose nothing yet | Most new accounts |
| **B — Enrolled, never entered** | Chose a subject, hasn't opened it | **Most common signed-up state** |
| **C — Enrolled, active** | Has real `environment_state` | The goal state |

- **All three are first-class designed surfaces.** Not fallbacks, not error paths.
- **State B is the highest-risk one** — a student who chose and never started is the student most
  likely to churn, and the state is usually treated as "empty" when it is actually *ready to
  begin*.
- **State A is not a dead end.** It routes to the choice. **It must not read as a broken account.**
- **No skeleton, no shimmer, no "no data" message, no empty table.** These are states with content,
  not absence of content.
- **All three appear in the server-rendered HTML** — they are not client-side branches.

**5. THE RESUME SURFACE TELLS THE TRUTH ABOUT POSITION.**

`environment_state` may hold a **null position**, because there is genuinely nothing inside an
environment to be *at* yet — the environments are identity, structure and atmosphere, with labelled
regions for what's coming (3.6).

- **Use only what is genuinely populated.** If the position is null, **the surface says what is
  true** — which environment, and when the student was last there.
- **"You were last in Physics — The Field, yesterday" is true.**
- **"Pick up where you left off at Chapter 4" is fabrication.** There is no Chapter 4.
- **The action is "open the environment"** — because that is the real action.
- **State the rule in the code:** the resume surface renders only populated fields, and its copy
  degrades honestly as fields are absent.
- **Report what is actually populated in `environment_state`** in your environment, and what the
  surface therefore renders.

---

### FIRST: INSPECT

1. **Step 5.1's report, in full** — the data model, the real-vs-unbuilt map, the momentum principle,
   the next-action priority order, the student shell contract, and **the auth implementation**.
   **Confirm auth exists and works before anything else.**
2. **`environment_state` as implemented** — its actual fields, and what is populated.
3. **Step 2.6** — the nav shell's **Room mode**: solid, compact density, working chrome. **The
   student shell uses it. Do not build a second navigation bar.**
4. **Step 3.6** — the environment shell, and **what chrome is shared vs duplicated.** The student
   shell must not duplicate the environment's identity pattern.
5. **Steps 3.2 / 3.3** — subject marks and the motif roles permitted in a Room (`edge`, `divider`,
   `focus`; **never `substrate`**).
6. **Step 4.4 + amendment** — the eligibility model and the derived-copy pattern.
7. **Steps 2.2–2.5** — the type scale and measure, the motion grammar, the spatial system and
   **density modes** (`compact` for Rooms), and the primitive APIs. **Reuse the primitives.**
8. **Step 3.7 / 4.9** — the committed baseline and the audit harness. **The harness must be extended
   to cover the student shell** — and per the mobile-first decision, **with 390px as the reference
   viewport.**
9. **Any existing student route, layout, or component** — report and extend. **If `/learn` or
   equivalent already exists, do not replace it.**

Report findings before building.

---

### BUILD — PART 1: THE ROUTE AND THE INFORMATION ARCHITECTURE

**Propose the route root.** **Recommendation to consider: `/learn`** — it names the *activity*
rather than the *UI pattern*, which matters because "dashboard" is precisely what this must not be.
**Report your choice and reasoning; alternatives welcome.**

**The IA — and it must be small, because almost nothing exists:**

| Destination | Status | Notes |
|---|---|---|
| **The shell (overview)** | **Real** | this step |
| **A subject workspace** | **Real** | the enrolled environments; the subject-scoped surface |
| **Account** | **Real** | profile, sign out |
| *Classes* | Phase 7 | **not a nav item yet** |
| *Recordings* | Phase 8 | **not a nav item yet** |
| *Resources, AI, Progress* | Phase 8–9 | **not a nav item yet** |

**Rules:**
- **No nav item may lead anywhere that does not resolve.** Per 2.6 and 4.1. **A disabled or
  "coming soon" nav item is a lie with a label.**
- **The IA must be shaped so Phases 7–9 add destinations without restructuring.** **Report the
  extension contract.**
- **Report the nav item count.** If it is more than three today, justify each.
- **No search.** There is nothing to search yet.
- **No notification affordance.** Nothing generates notifications.

**Unauthenticated access:**
- **A signed-out visitor hitting the shell must be handled honestly** — per the visitor → student
  boundary defined in 5.1. **Implement the boundary 5.1 defined; do not redefine it here.**
- **No fake signed-in state, ever.** No preview, no demo account, no "sign in to see your
  dashboard" with a populated-looking frame behind it.

---

### BUILD — PART 2: THE SHELL'S COMPOSITION

**Structure, in priority order:**

1. **The primary surface** — the one answer. **It carries subject identity**: the subject's mark,
   its accent, its environment name. **This is the bridge** — the same identity the homepage
   offered, now answering *where you were*.
2. **The subject list** — the student's enrolled environments, as **quiet rows, not cards.**
   **Equal weight across subjects** (4.4's rule carries forward). **No featured subject.**
3. **Slots** — absent until populated (Decision 3).

**Composition rules:**
- **Rooms only.** Contained container, **compact density**, **no substrate, no canvas, vector
  only.**
- **The shell chrome is subject-agnostic; subject accents appear only on subject-bearing elements.**
  A student enrolled in four subjects must not see the page tinted toward one of them.
- **Brass is the brand frame** and stays brass. Subject accents are for subject surfaces.
- **No hero, no banner, no greeting.** A "Welcome back" header is a dashboards' first move and
  consumes the viewport's most valuable space on a phone.
- **If the student's name appears, it is small and it is not the headline.**
- **Nothing animates on load beyond the existing grammar's `reveal` at most.** No welcome
  animation, no staggered card entrance, no celebration.

**The subject rows must carry:**
- the subject's mark (3.2)
- its name and environment name as **text**
- when the student last visited, if known — **honestly absent if not**
- a single link to `/subjects/[id]`

**Draft subjects:** a student may be enrolled in a subject whose config status is `draft`.
**Decision to report:** an enrolled student is never blocked from **their own** environment —
enrolment is a stronger relationship than public availability. **The draft status is labelled, not
enforced as a lock.** **Report your handling and reasoning.**

---

### BUILD — PART 3: THE THREE STATES

**Each state is fully composed, server-rendered, and designed.**

**State A — No enrolment:**
- **The shell's job here is to route to the choice**, not to explain that nothing exists.
- **It must not read as a broken account.** No error styling, no warning, no apology.
- **One clear path out**, in the 4.1 voice.
- **The composition must still feel complete** — a shell with one real thing in it, not a shell
  with a hole.

**State B — Enrolled, never entered:**
- **This is not "empty." It is "ready."** The student has chosen; nothing has happened yet.
- **The primary surface becomes the beginning**, not a resume. *Your first session in Physics —
  The Field.*
- **It must be the most inviting of the three states**, because it is the one that decides whether
  the student ever starts.
- **No guilt, no "you haven't started yet", no streak-at-risk language.**

**State C — Enrolled, active:**
- **The primary surface is the resume**, per Decision 5.
- **The subject rows may show recency**, honestly.

**All three:**
- **Screenshots required** at 390×844 and 1280×800, both themes.
- **Each must pass the three-second test** — a reader identifies the next action immediately.
  **Report how you verified it.**

---

### BUILD — PART 4: WHAT THE SHELL MUST NEVER CONTAIN

**Enforced as a written list, then verified by sweep.**

- **No statistic cards. No metric grid. No "your numbers".**
- **No streak, no XP, no level, no badge, no leaderboard, no points.**
- **No notification bell, no unread count, no message icon.**
- **No "recommended for you"** unless a real recommendation engine exists. It does not.
- **No tutorials that don't exist, no progress that isn't measured.**
- **No invented activity.** No "keep it up!", no "you're doing great", no fabricated momentum.
- **No skeleton loaders, no shimmer, no "loading" on empty states** (3.6 rule).
- **No empty-state illustration of a person, or a scene, or anything scenic** (4.7's ban carries).
- **No CTAs beyond the single primary.** No secondary "explore" or "browse" that leads nowhere.
- **Report the sweep.**

---

### BUILD — PART 5: THE SLOT MAP AND THE EXTENSION CONTRACT

**Deliverable: a written map** of where every future student capability lives in this composition.

For each: **what it is · which phase adds it · where it sits · what it will need · what renders
today** (nothing, absent).

Cover at minimum: **today's sessions · upcoming class · recordings · resources · AI assistance ·
progress · assignments · achievements · tutor presence.**

**Rules:**
- **A slot with no data renders nothing at all** — not an empty container.
- **The composition is verified at three extremes:** zero slots populated (today), some, all.
  **Report how all three hold up.**
- **Report the extension contract** — the specific mechanism a Phase 7 step uses to populate a slot
  without editing the shell.
- **If a capability does not fit the composition without restructuring it, report that now** — it
  is far cheaper to fix here than in Phase 7.

---

### BUILD — PART 6: ACCESSIBILITY AND PERFORMANCE

**Accessibility:**
- **One `h1`** on the shell, carrying the student's primary context.
- **Correct heading nesting** for the regions.
- **The shell's nav carries a distinct accessible label** from the main nav and the footer nav
  (2.6's rule).
- **The subject rows are a labelled group**; each row's link has an accessible name containing
  subject and environment.
- **Status conveyed as text**, never by colour or position alone.
- **Full keyboard pass** — logical order, visible focus on every accent, no traps, no dead stops.
- **Reading order matches intent**, and the primary surface is the first meaningful element after
  the nav.
- **Reduced motion:** the shell is complete and static. **Screenshot.**
- **No-JS:** the shell renders complete and correct, server-rendered, including the correct state.
  **Screenshot.**
- **Zoom 200% and 400%** (WCAG 1.4.10) and **text spacing** (WCAG 1.4.12) — nothing clips, no
  horizontal scroll, the primary surface still identifiable.

**Performance — mobile-first, per Decision 2:**
- **Report payload and timings on a mid-range Android profile**, not desktop.
- **Target: the primary surface is visible and interactive at 390px on a throttled connection
  without the student waiting on layout.**
- **Report LCP element and value, CLS, and any long task over 50ms on that profile.**
- **No canvas, no substrate, no WebGL chunk.** **Confirm absence from the network waterfall.**
- **Extend the audit harness to cover the shell**, with **390px as the reference viewport** per the
  mobile-first note, and both themes.

---

### SPECIMEN ROUTE — `/dev/student-shell` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Required:

- **All three states rendered side by side**, both themes, at 390 and 1280 — so the composition's
  hierarchy is directly comparable.
- **The four-slot extremes**: zero slots populated, some, all — so the composition is verified with
  and without future content.
- **A 390×844 first-paint view of each state**, so the three-second test is judgeable.
- **A slot map**, rendered as readable reference.
- **A boundary checklist with pass/fail:** no stat cards · no streak/badge/leaderboard · no
  notification affordance · no skeleton or shimmer · no greeting banner · one dominant surface ·
  no invented activity · no dead nav items · draft subjects labelled not locked.
- **A "what the shell never contains" list**, rendered.
- **A grayscale rendering** of all three states.
- **A reduced-motion and a no-JS rendering.**
- **A performance readout** on the mid-range profile.
- A visible note stating what is real vs. deferred.

---

### CONSTRAINTS

- **Auth must exist and work.** If it does not, **stop**.
- **No interface beyond the shell.** No next-action engine (5.4), no environment-scoped workspace
  (5.5), no progress language (5.6), no classes, recordings, resources or AI surfaces.
- **Do not define the visitor → student boundary** — 5.1 defined it. **Implement it.**
- **No second navigation bar.** Use the nav shell's Room mode.
- **No new tokens, colours, marks, motifs, motion vocabulary, components, or primitives.**
- **No new dependencies.**
- **No simulated or seeded data in production.** Test accounts are test accounts.
- **Do not modify** the subject system, brand frame, scene spine, environment shell, primitives, or
  any certified Phase 3/4 surface.
- **Do not touch existing `/dev/*` routes** beyond extending the audit harness.
- **Do not build the tutor experience** — Phase 6.
- **Do not begin Step 5.4.**

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitive APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (**structure** — Room mode is used, not changed)
- The entire subject system (3.1–3.6)
- The committed baseline (3.7) — extend, do not rewrite
- The scene contract, spine, scroll grammar, voice document, honesty treatment (4.1)
- Scenes 0–8, the footer, the homepage's ENDS AT ENTER decision (4.2–4.8)
- The whole-page gate's findings and recorded defects (4.9)
- Step 5.1's data model, roles, permission matrix, auth implementation, momentum principle,
  real-vs-unbuilt map, and student shell contract
- The `/subjects` scaffold
- Existing routes, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **Auth precondition** — confirm sign-in, sign-out, session persistence and protected-route
   redirect all work. **Paste the verification.** If any fail, stop.
2. **Three states render correctly** — A, B and C, server-rendered, both themes, at 390 and 1280.
   **Screenshots of all six.**
3. **Three-second test** — for each state, report what a reader identifies as the next action, and
   how quickly. **If any state fails, fix it and report the change.**
4. **Hierarchy test** — at 390×844, confirm **exactly one** element dominates. **Report the
   measurement or the overlay used to verify.** If two compete, fix it.
5. **No-scroll check** — the primary answer is reachable without scrolling at 390×844. **Report the
   measured fold position.** Report what sits below the fold.
6. **Slot extremes** — render with zero, some and all slots populated. **Report how the composition
   holds at each**, with screenshots.
7. **Empty-slot check** — confirm unpopulated slots render **nothing**, not empty containers.
   **Paste the DOM evidence.**
8. **Dashboard-semantics sweep** — grep for stat cards, metric grids, streak, XP, level, badge,
   leaderboard, points, notification, unread, "recommended for you". **Expected: none.** Paste it.
9. **Skeleton sweep** — grep for skeleton, shimmer, placeholder-card, loading-card. **Expected:
   none on empty states.** Paste it.
10. **Dead-nav sweep** — confirm every nav item and every link resolves. **Paste the list with
    status codes.**
11. **Resume-honesty check** — report what `environment_state` actually contains in your
    environment, and **what the resume surface renders as a result.** **Confirm no position or
    activity is implied that the data does not support.**
12. **Draft-subject handling** — verify an enrolled student is not blocked from a draft subject's
    environment, and that the status is labelled. **Report the implementation and reasoning.**
13. **No fake signed-in state** — confirm a signed-out visitor sees no populated-looking shell.
    **Paste the observation.**
14. **Fabrication audit** — **paste every string the shell renders across all three states**, so it
    can be reviewed for invented data.
15. **Copy sweep** — the standing 4.1 banned list, 4.7's cliché list, and any guilt, urgency, or
    fabricated-momentum language. **Expected: none.**
16. **Keyboard** — full pass across all three states. Logical order, visible focus, no traps, no
    dead stops. **Report the order.**
17. **Screen reader** — report reading order for each state, confirming the next action is announced
    first and the subject rows are a labelled group. **Report tool and output.**
18. **Contrast** — every text/surface pairing, all three states, both themes. **Report measured
    ratios.** Failures fixed by **lightness only**, reported.
19. **Grayscale** — all three states remain readable and states remain distinguishable. Screenshot.
20. **Both themes**, 320, 390, 768, 1280, 1920. **Report layout at each**, no horizontal scroll.
21. **Reduced motion** — all three states complete and static. Screenshot.
22. **No-JS** — all three states complete and correct, server-rendered. Screenshot.
23. **Zoom 400%** and **200%**, **text spacing** — nothing clips, no horizontal scroll, primary
    surface still identifiable.
24. **Touch targets** — every interactive element ≥44×44 with ≥8px gaps at 320px. **Report
    measurements.**
25. **Performance, mid-range Android profile** — payload, LCP element and value, CLS, longest task.
    **Report on that profile specifically.**
26. **WebGL absence** — confirm the chunk is absent from the network waterfall.
27. **Harness extended**, reference viewport **390px** — report the pass/fail summary for the shell.
28. **Audit** — axe/Lighthouse on the shell and `/dev/student-shell`. Score + every violation.
29. **Production build** succeeds; `/dev/student-shell` absent or 404; **no test data reachable.**
30. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — and confirmation **auth was verified before building**
2. **The route root chosen**, with reasoning
3. **The IA** — destinations, nav item count, and the extension contract for Phases 7–9
4. **The shell composition** — how the single dominant surface is achieved, and what makes the
   hierarchy obvious
5. **The three states**, described and screenshotted, with the three-second test result for each
6. **The resume surface's honesty** — what `environment_state` actually holds, and what it therefore
   renders
7. **The slot map** — every future capability, where it lives, and what renders today
8. **The slot-extremes result** — how the composition holds at zero, some and all
9. **The draft-subject decision and reasoning**
10. **The "never contains" sweep results**
11. **All other sweeps** — dashboard semantics, skeletons, dead nav, fabrication, copy
12. **Keyboard, screen reader, contrast and grayscale results**
13. **Performance on the mid-range Android profile**, and WebGL absence
14. **Harness extension result**, at 390px reference
15. **Anything that does not fit the composition without restructuring** — reported now rather than
    in Phase 7
16. **Anything you could not implement**, and why
17. Anything deferred, and confirmation nothing was half-built
18. Confirmation nothing outside the shell was changed

---

### STOP

End after the report. Do not begin Step 5.4 (the next-action engine) or any other work.
