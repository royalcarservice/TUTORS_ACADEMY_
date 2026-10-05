# TUTORS ACADEMY — Phase 4 · Step 5
## Scene 4 — Enter (The Crossing)

> Depends on Steps 4.1 (spine + contract + voice), 4.2 (Scene 0), 4.3 (Scenes 1–2),
> 4.4 (Scene 3) and its **availability amendment**, and all of Phase 3.
> **Read the scene contract, the 3.4 switch state machine, and Scenes 0–3's authored forms first.**
>
> **This step authors ONE scene.** It does not touch the spine, Scenes 0–3, Scenes 5–8, the
> subject system, or the primitives.
>
> **This is the payoff of the Phase 3 reorder: the signature moment already exists. Scene 4
> spends it. It does not rebuild it.**

---

### WHY THIS STEP EXISTS

The visitor has been shown the system (Scene 2) and offered the doors (Scene 3). Scene 4 is for
the one who is still reading.

Its job:

> **Make the crossing itself the argument. Show the environment transform, at full scale, and
> let the visitor feel the move before they make it.**

---

### THE CORE PRINCIPLE — THE TWO-LEVEL PRODUCT

> **The homepage shows the environments' IDENTITY. It does not show their DEPTH.
> Depth is what you get by ENTERING.**

This is not a limitation. It is the structural reason to cross.

- Scene 4 demonstrates the signature move — the environment transforming — using **exactly what
  exists today**.
- **The ambient layer, the WebGL depth, and the environment's full interior appear only inside a
  subject route.** Crossing the threshold therefore *rewards* the visitor with something the
  homepage never showed.
- **A homepage that pre-renders everything inside has destroyed its own reason to exist.**
- Report this principle explicitly in the copy reasoning where it applies.

---

### THE FIVE LOCKED DECISIONS

**1. Scene 4's unique value is the crossing itself.**

A visitor can only see the environment transform by moving **between** environments. You cannot
experience that from *inside* a route. **The homepage is the only place the switch is the event.**

Therefore Scene 4 is not a preview of the environment's contents, and it is not a second
specimen sheet. **The transformation is the content.**

**Boundary — must be reported on:**
- Scene 3 = **the visitor's decision.** Scene 4 = **the system's move.**
- **Scene 4 must not read as a second chooser.** Its control steps *between* environments; it
  never asks the visitor to decide.

**2. Scene 4 claims the page's single `sticky-stage` allocation.**

- This is the **one** `sticky-stage` scene on `/` (rationed per 4.1). **State the justification.**
- The Stage **holds position** while the visitor steps between environments and while a
  transformation plays.
- **Bounded scroll budget** — declared, and the actual reported against it.
- **The hold must never trap the visitor.** Scrolling past always continues the page; the scene
  releases cleanly. **Verify explicitly.**
- **Degrades to `static`** under reduced motion and without JS.

**3. No ambient, no 3D. The homepage never loads the WebGL chunk.**

- **No canvas, no WebGL, no ambient layer, no 3D chunk in `/`'s network waterfall.**
- Rationale, to be reported: (a) it depends on the 3.5 five-subject recommendation, which is
  **not approved**; (b) it would make the scene's best moment work for **one** environment and
  not five; (c) **keeping depth inside a route preserves the reason to enter** (the core
  principle above).
- Scene 4's Stage uses the **vector substrate** at full Stage scale. **That is the strongest
  thing we have, and it is already built.**
- **Flag the alternative for a future phase:** ambient-at-Stage-scale on the homepage becomes
  possible once the five-subject recommendation is approved. **Record it in the deferred
  register; do not build it.**

**4. The crossing runs the 3.4 switch, at 3.4's tiers. No new transition is invented.**

- Stepping between environments invokes the **existing switch state machine** — the same phases,
  the same tiers, the same convergence guarantees, the same interruption rules.
- **3.4's ceremony rationing applies directly and is the reason it exists:** first entry in a
  session gets the full arrival, subsequent steps get the shortened variant, rapid stepping gets
  the shortest.
- **`morphTarget` is the continuity anchor** — the element that persists across the switch.
- **The brand frame does not move.** Mark, wordmark, nav, type and component geometry are
  **untouched** while the environment transforms. *This is the scene's central visual proof.*
- **No new animation vocabulary, no new presets, no re-implementation.**
- **Report the tier actually selected for each step**, and whether the rationing behaved as
  designed across a full six-environment walk.

**5. The Stage holds ONE environment at a time, and renders only what it needs.**

- **One environment rendered at full Stage scale.** Not six substrates, not a grid of Stages.
- **Only the current environment's substrate, plus the incoming one during a transition, may be
  rendered.** Pre-rendering all six substrates multiplies the 3.3 motif budget by six and is a
  defect. **Report the motif budget for `/` and prove only one substrate (two mid-transition) is
  live at a time.**
- The environment shown carries its **full identity**: mark, subject name, environment name,
  tagline, accent throughout, substrate motif.

---

### FIRST: INSPECT

1. **Step 4.1** — the scene contract, Scene 4's declared field values (including
   `scrollBehaviour: sticky-stage`, `subjectMode`, `ambient: off`), the scroll grammar, the voice
   document, the honesty treatment, the `liveCapability` map.
2. **Step 3.4** — **the entire switch**: state machine, phases, tiers, ceremony rationing,
   `morphTarget`, interruption matrix, announcement, focus rules, degradation ladder, and the
   `/dev/switch` specimen. **This is the engine Scene 4 drives.**
3. **Step 3.3** — the motif grammar, the `substrate` role, its coverage caps and contrast
   ceilings, and the **budgets** (path commands, DOM elements, generation time).
4. **Step 3.6** — the environment shell and the **honest placeholder treatment**.
5. **Step 4.2** — Scene 0's CTA pattern and the anchor convention.
6. **Step 4.4 + its availability amendment** — the eligibility model (**config-driven, never
   hardcoded**), the **inert ≠ lesser** rule, the 3.6 "in foundation" convention, and the
   derived availability copy. **Scene 4's CTA must follow the same model.**
7. **Step 4.3** — Scene 2's authored form, to ensure Scene 4 does not duplicate the specimen
   sheet.
8. **Step 2.4** — the Stage layer, container behaviour, section spacing, high-zoom and
   short-viewport rules for sticky elements.
9. **Step 2.3** — the motion grammar, the ambient caps, and the reduced-motion contract.
10. **Step 3.7** — the audit harness and committed baseline. **Scene 4 adds the heaviest content
    to `/` so far, and requires a further harness extension** (Part 5).
11. **Existing `/`, Scenes 0–3's authored content, Scene 4's skeleton state** — extend, never
    replace.

Report findings before building.

---

### BUILD — PART 1: THE STAGE

**Composition:**
- **Full-bleed Stage** in the brand's Stage layer, holding one environment at full scale.
- **The environment's identity is complete:** its mark (3.2) at a display-appropriate size, its
  subject and environment names, its tagline from the 3.1 config, its accent applied across the
  Stage, and its `substrate` motif fragment.
- **The brand frame is visibly constant** — mark, wordmark, nav, type — so a visitor sees
  *what stays* while *what changes* transforms. **Make this legible, not incidental.**
- **No simulated interface.** No fake class list, no fake tutor card, no fake progress, no fake
  dashboard. **The Stage shows the environment's identity and atmosphere — not a mocked-up
  product screen.** If it could be mistaken for a working application screen, it has failed.
- **No fabricated data of any kind** — no names, counts, schedules, dates, ratings.

**Default environment:**
- On load, the Stage shows the **first `ready` environment** in the ordering rule established in
  4.4.
- **If Scene 3's handoff state is available, use it to set the initial environment; otherwise
  default.** **Do not implement new cross-scene state** beyond the handoff contract documented in
  4.4 — report which path you took.

---

### BUILD — PART 2: THE CROSSING CONTROL

**The control steps between environments. It does not ask the visitor to choose.**

- **Not a chooser.** No "select", "choose", "pick", "start". Framing is *stepping*, *moving*,
  *crossing between worlds*.
- **A real, keyboard-operable control** — a documented pattern (buttons, or a radio group with
  correct semantics), not a div with a click handler.
- **All six environments are reachable**, consistent with Scenes 2 and 3.
- **Eligibility-aware, config-driven** (per the 4.4 amendment): stepping to a `draft` environment
  shows its Stage normally — **its identity is real and built** — but the CTA becomes the 3.6
  in-foundation treatment. **Drafts are never offered as enterable.**
- **Inert ≠ lesser**: entering a draft's Stage must not make it look like a lesser environment.
  *It is an environment that is not open yet.*

**Mandatory deliverables — copy:**
- **Two candidates** for the scene's lead, with emphasis, risk and a recommendation. Verbatim.
- **Three candidates** for the control's framing/label — each checked against the
  **not-a-chooser** boundary. Verbatim, with a recommendation.
- **The CTA labels**, eligibility-aware, across both states.
- **The announcement string** for each step (per 3.4's live-region pattern), e.g. *"Now showing
  Physics — The Field."* Report the exact strings.

---

### BUILD — PART 3: THE CTA — AND WHAT IT PROMISES

Per the core principle, the CTA **must not promise what only the route delivers** — but it
**should make entering attractive**, because the route gives more than the homepage.

- **Primary: enter the environment currently shown** → its real route `/subjects/[id]`.
  **Must be a real destination. Verify it resolves.**
- **Eligibility-aware:** `ready` → enterable CTA. `draft` → in-foundation treatment, **no entry
  affordance, not focusable as a link.**
- **The CTA may reference that the environment inside is deeper than the demonstration** — but
  **only in words that are true today**, checked against the codebase. **No promise of unbuilt
  features**, no apology either.
- **Exactly one `primary` on `/` at any moment.** Scene 0's CTA is above the fold; Scene 4's is
  the second action. **Verify the hierarchy does not compete** — report how it resolves, and if
  two primaries are visible simultaneously at any scroll position, fix it.

---

### BUILD — PART 4: ACCESSIBILITY OF A TRANSFORMATION

- **The switcher is a labelled group** with proper semantics for the control pattern chosen.
- **Focus stays where it was on switch** — this is an **inline** trigger, per 3.4's rule.
  **Focus must never move as a result of stepping.** Verify.
- **The announcement fires once per step**, politely, and does not double-announce or churn.
- **The Stage content is fully readable by assistive technology** — names are text, motifs are
  `aria-hidden`, the structure is semantic.
- **Nothing is conveyed by motion alone.** Everything the transformation communicates (which
  environment is showing) is also present as text and as state.
- **Nothing is conveyed by colour alone.** Verify with a grayscale pass; report honestly.
- **The sticky Stage must not consume the viewport at 400% zoom or on short viewports**
  (WCAG 1.4.10). **Provide the rule you used so it becomes static at those sizes**, mirroring the
  2.6 nav solution. **This is a classic failure — test it explicitly.**
- **Reduced motion:** the switch is instant; the Stage is static; **all content present, control
  fully functional.** Verify and screenshot.
- **No scroll-jacking.** The sticky hold must not intercept, reinterpret or trap scroll input.
  **Verify the `sticky-stage` implementation uses position-based behaviour, not scroll input
  capture.**

---

### BUILD — PART 5: CONTRACT UPDATE, BUDGETS AND PERFORMANCE

- Update Scene 4's `status` from `skeleton` to `authored`. **Change no other scene's config.**
- **Record Scene 4 as the page's `sticky-stage` claimant.** **Do not change** the spine order or
  the total scroll budget beyond recording Scene 4's actual `scrollBudget` against its
  declaration. **If the actual exceeds the declared, report it as a defect rather than editing
  the declaration.**
- Confirm `reducedMotion`, `mobileBehaviour` and `noJsBehaviour` are **implemented** as declared.
- **Motif budget for `/`:** report combined path commands, DOM elements and generation time
  against the 3.3 ceilings — **and prove only one substrate (two mid-transition) is rendered at a
  time.** If Scenes 2, 3 and 4 together approach the ceiling, **reduce coverage** rather than
  exceed it, and report what you chose.
- **Performance:** report `/`'s payload, LCP element and value, and **CLS across stepping through
  all six environments**. Report frame timings for the full six-environment walk, and any long
  task over 50ms.
- **Confirm the WebGL chunk is still absent** from `/`'s network waterfall.
- **Extend the 3.7 audit harness to cover Scene 4** — the Stage in all six environments, both
  themes, contrast for Stage text against the substrate, focus-ring visibility, touch targets,
  and the sticky behaviour at 400% zoom. Report results.

---

### SPECIMEN ROUTE — `/dev/scene-enter` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Required:
- **Scene 4 in isolation**, judged without the surrounding page.
- **All six environments on the Stage**, both themes, so the transformation is directly
  observable.
- **A tier indicator** showing which 3.4 tier each step selected — **so the ceremony rationing is
  verifiable**, not assumed.
- **A full six-environment walk** with the frame readout and the announcement transcript printed
  live.
- **An all-ready forced state** and an **all-draft forced state** (building on 4.4's control), so
  both CTA extremes are judgeable.
- **A boundary checklist with pass/fail:** not a chooser (no "select/choose/pick"), one
  environment rendered at a time, brand frame static during transformation, no simulated
  interface, no fabricated data, focus never moves on step, no colour-only meaning.
- **A no-JS preview** showing the static Stage state.
- **A reduced-motion preview.**
- **A `sticky-stage` behaviour demo** at 400% zoom, short viewport, and reduced motion.
- **A copy panel** with all authored copy verbatim, including the two lead candidates, three
  framing candidates, CTA labels and announcement strings.
- **A Scene 2 / Scene 3 / Scene 4 comparison** — all three rendered, so it is verifiable that
  they read as three different things.
- A visible note stating what is real vs. deferred, including the **recorded** ambient-at-Stage-
  scale possibility.

---

### CONSTRAINTS

- **One scene only.** Do not author Scene 5–8.
- **Do not rebuild the switch.** Use 3.4's engine. No new transition code.
- **No ambient, no 3D, no canvas, no WebGL chunk.**
- **No new animation vocabulary, tokens, colours, marks, motifs, or primitives.**
- **No second chooser.** The control steps; it does not ask for a decision.
- **One environment rendered at a time.**
- **No simulated interface. No fabricated data.**
- **No scroll-jacking or scroll input interception.**
- **No new dependencies.**
- Do not modify the subject system, brand frame, nav shell, environment shell, primitives, or
  the `/subjects` scaffold.
- Do not build the footer or any later scene.
- Do not touch existing `/dev/*` routes beyond **extending the audit harness** per Part 5.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitive APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (2.6)
- Subject schema, taglines, validator, marks, motif grammar, **switch state machine and tiers**,
  ambient layer, environment shell (3.1–3.6)
- The committed baseline (3.7) — **extend, do not rewrite**
- The scene contract, scene sequence, scroll grammar, voice document (4.1)
- Scenes 0–3 and the 4.4 availability amendment (4.2–4.4)
- Other scenes' content
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **No-JS** — disable JavaScript. **The Stage renders one environment complete and correct**
   (identity, names, tagline, accent, substrate), the scene reads correctly, the CTA is present
   and real if the environment is `ready`. **Screenshot it.** Report exactly what is lost without
   JS (the stepping control) and confirm nothing is broken.
2. **The switch is the 3.4 engine** — confirm no transition code is duplicated. Report how you
   verified reuse rather than re-implementation.
3. **Ceremony rationing across a walk** — step through all six. **Report the tier selected for
   each step** and confirm the sequence matches 3.4's design (full once, shortened after, shortest
   on rapid).
4. **Interruption** — step rapidly; step mid-transition; navigate away mid-transition. Confirm
   3.4's guarantees hold in this scene's context: **convergence, retargeting, no orphans.**
5. **Brand-frame invariance during transformation** — mark, wordmark, nav, type and component
   geometry are **pixel-identical** while the environment transforms. Describe the verification
   method and screenshot it.
6. **One substrate at a time** — prove only one environment's substrate is rendered at any
   moment (two mid-transition). Report the DOM/geometry evidence and the `/` motif budget against
   the ceilings.
7. **Focus never moves on step** — step through all six; focus stays on the control throughout.
   Report the observation.
8. **Announcements** — report the exact strings as they fire, confirm **once per step**, polite,
   no double-announcement, no churn.
9. **Keyboard** — full pass: reach the control, step through all six, reach the CTA. Visible
   focus throughout. Report the order.
10. **Screen reader** — report the reading order for the Stage. Confirm a visitor learns which
    environment is showing, its names and tagline, that a stepping control exists, where the CTA
    leads, and — for drafts — that entry is not available. Report tool and output.
11. **Grayscale pass** — the six environments remain distinguishable without hue. Screenshot;
    **report honestly if two collapse.**
12. **Contrast** — Stage text against the substrate and accent, six environments × two themes.
    Report measured ratios. **Confirm the 3.3 legibility rule holds on the Stage** — motifs
    beneath text capped at the contrast ceiling. Failures fixed by **lightness only** and reported.
13. **Sticky behaviour at 400% zoom and short viewports** — the Stage **must not consume the
    viewport**. Report the rule used and screenshot both cases.
14. **No scroll-jacking** — verify native scrolling is unmodified: momentum, keyboard scrolling,
    scrollbar dragging. Report how you verified a **lack** of interception, and confirm the hold
    releases cleanly when scrolling past.
15. **Reduced motion** — instant swaps, static Stage, all content present, control functional.
    Screenshot.
16. **All-draft forced state** — confirm the CTA becomes the in-foundation treatment, no entry
    affordance, nothing focusable or announced as a link, and the Stage still shows the
    environment's full identity without reading as lesser. Screenshot.
17. **All-ready forced state** — composition holds; CTA real for all six. Screenshot.
18. **CTA hierarchy** — confirm exactly one `primary` is visible at any scroll position across
    Scenes 0–4. Report how it resolves.
19. **CTA destinations** — verify each resolves to the correct `/subjects/[id]` with the right
    scope. Report the URLs.
20. **No simulated interface / no fabricated data** — paste the **full list of strings rendered
    by Scene 4**, so it can be reviewed.
21. **Both themes** at 320, 390, 768, 1280, 1920 — report how the Stage resolves at each width,
    including how the sticky behaviour changes.
22. **Zoom 400%** and **200%**, **text spacing** (WCAG 1.4.12) — nothing clips, no horizontal
    scroll.
23. **Performance** — payload, LCP element and value, **CLS across stepping all six**, frame
    timings for the full walk, any long task over 50ms, on desktop and throttled mid-range.
24. **WebGL absence** — confirm the chunk is absent from `/`'s network waterfall.
25. **Hydration** — zero warnings on `/` and `/dev/scene-enter`.
26. **Audit harness extended to Scene 4** — report the pass/fail summary.
27. **Audit** — axe/Lighthouse on `/` and `/dev/scene-enter`. Score + every violation.
28. **Guard test** — scene components still do not import scene configs directly.
29. **Production build** succeeds; `/dev/scene-enter` absent or 404.
30. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — confirmation that **only Scene 4** was authored
2. **Scene 4's two lead candidates** — verbatim, with emphasis, risk, recommendation
3. **The three framing candidates** for the crossing control — verbatim, each checked against the
   not-a-chooser boundary, with a recommendation
4. **The CTA labels** for both eligibility states, and **the announcement strings**
5. **The Stage composition** — how identity is carried, how the constant brand frame is made
   legible, and how it avoids reading as a simulated interface
6. **Confirmation the switch is 3.4's engine**, and the tier selected per step across a full walk
7. **Brand-frame invariance evidence** during transformation
8. **One-substrate proof** and the `/` motif budget against the 3.3 ceilings
9. **Focus and announcement observations** across the walk
10. **Sticky behaviour** — the rule used, the 400%-zoom and short-viewport results, and the
    no-scroll-jacking verification
11. **Reduced motion, no-JS, all-draft and all-ready results** with screenshots
12. **The full list of strings Scene 4 renders** (fabrication and fake-interface audit)
13. **CTA hierarchy resolution** across Scenes 0–4
14. **Performance** — payload, LCP, CLS across stepping, frame timings, WebGL absence
15. **Width-by-width Stage resolution** and the sticky rule at each
16. **The honest assessment on placement** — Scene 4 sits **after** the conversion moment. Report
    whether it still pulls its weight for a visitor who did not click in Scene 3, and **whether
    the crossing would be stronger placed before Scene 3**. **Recommend, do not reorder** — the
    spine is fixed by 4.1.
17. **Whether the audit harness extension surfaced anything previously unknown**
18. **Confirmation the ambient-at-Stage-scale possibility is recorded in the deferred register**
19. Anything deferred, and confirmation nothing was half-built
20. Confirmation nothing outside Scene 4 was changed

---

### STOP

End after the report. Do not begin Step 4.6 (Scenes 5–7) or any other scene.
