# TUTORS ACADEMY — Phase 4 · Step 7
## Scene 7 — The Promise

> Depends on Steps 4.1–4.6 (including the 4.4 availability amendment) and all of Phase 3.
> **Read the scene contract, the voice document, the honesty treatment, and Scenes 0–6's
> authored forms first.**
>
> **This step authors ONE scene.** It does not touch the spine, Scenes 0–6, Scene 8, the subject
> system, or the primitives.
>
> **This is the emotional turn of the page: the product stops describing itself and addresses
> the visitor.** It is also the scene with the hardest honesty problem in Phase 4, because its
> subject is **progress** — which does not exist yet, and which this product forbids faking.

---

### WHY THIS STEP EXISTS

Seven scenes in, the visitor has been shown a system, offered doors, watched a crossing, and
read an honest account of what's coming. Scene 7 answers the question they have not yet been
asked directly:

> **What happens to me?**

Its job is to make the visitor **want** the thing Scene 8 will ask them to do. It is a peak, not
a pitch.

---

### THE CORE IDEA — THE ONLY HONEST PROGRESS VISUALISATION ON THE PAGE

> **The visitor has already done the first three steps of the journey. Show them that.**

The product's story philosophy is:

```
DISCOVER → CHOOSE → ENTER → LEARN → INTERACT → PROGRESS → MASTER
```

**On this page, the visitor has genuinely completed the first three.**

- **DISCOVER** — Scenes 1–2 showed them the system.
- **CHOOSE** — Scene 3 offered the doors.
- **ENTER** — Scene 4 showed the crossing.

The remaining four are genuinely ahead. **This is the only progress indicator on this page that
is factually true rather than fabricated** — because it represents what the visitor actually did,
`on this page, right now.`

- **It is NOT a mock student's journey.** Not a demo, not an illustration of a hypothetical
  learner. **The visitor's own, from this page.**
- It satisfies the brief's *"the interface should visually communicate progress"* **without a
  single fake bar, ring, or percentage.**
- **It is also the scene's built-in honesty treatment** — the unfinished steps are visibly ahead,
  in the same device, in the product's own language. Nothing needs a disclaimer.

This is the scene's central visual idea. **Make it deliberate and legible.**

---

### THE SIX LOCKED DECISIONS

**1. Scene 7 speaks to the visitor. Nothing before it does.**

- **Second person, direct.** This is the page's turn.
- **It is the only scene whose subject is the visitor's own trajectory.**
- **It must not be sentimental.** Warmth is carried by precision and restraint, not by
  encouragement. **The voice rules still apply in full.**
- **No motivational register.** The scene states what will be true; it does not cheer.

**2. No progress UI of any kind. Mastery is not a certificate.**

**Banned outright in this scene:**
progress bar · progress ring or dial · percentage · completion fraction · streak · XP · points ·
level · tier · badge · trophy · medal · certificate · rank · leaderboard · "you're 60% there" ·
any numeric progress of any kind.

- **Mastery must be defined without asserting an outcome.** No marks, ranks, admissions, or
  results the product does not control (4.1 voice rules).
- **The credible definition is bounded and architectural:** mastery accumulates in a place that
  **remembers where you were.** This is anchored to a real fact — **3.1 made the subject `id`
  immutable precisely to key progress, recordings, classes and tutoring data against it.**
  **Report this anchor and any other place the claim is checkable in the codebase.**
- **The distinction from the industry default is the claim:** progress is legible **inside the
  environment, at the point of work** — not a separate dashboard a student visits to be told how
  they are doing. **State this plainly; it is a design commitment, and must be labelled as one.**

**3. The journey device is honest by construction — so keep it honest.**

- **The three completed steps are marked complete because they are complete.** Do not mark
  anything complete that is not.
- **The four remaining steps are visibly ahead** — not blurred, not hidden, not greyed into
  illegibility, not styled as failures.
- **The device must not become a gamified stepper.** No checkmarks as rewards, no celebration, no
  "Congratulations!", no confetti, no progress sound-equivalent.
- **It is a map of a page, not a measure of a person.** If it reads as an achievement UI, it has
  failed.
- **Do not name the seven steps in the product's internal vocabulary if a visitor would not
  understand it.** Propose the marker labels; report them.

**4. Scene 7 carries no CTA.**

- **The CTA hierarchy stays intact:** Scene 0 opens the door, Scene 3 is the choice, **Scene 8 is
  the return.**
- **No button, no link styled as a button, no email capture, no form.**
- Scene 7 ends with a **narrative line** leading into Scene 8 — **a sentence, not a control.**
- **Report plainly whether the scene would convert better with an immediate door at the peak.**
  **Recommend; do not add one.** The hierarchy is fixed by 4.1.

**5. Scene 7 must not duplicate Scenes 2 or 3.**

- **Not a specimen sheet** (Scene 2) — it does not compare environments.
- **Not a chooser** (Scene 3) — it does not ask the visitor to pick.
- **The subject accent:** `subjectMode: responsive`. The scene may reference environments, but
  **no subject accent dominates**, and it must not re-present the six as specimens or doors.
  **Report the mode actually used and how you kept the boundary.**
- **It must not repeat Scene 6's consolidated honest statement.** Scene 7's own device carries
  its own honesty (Decision 3).

**6. Copy economy, and a scene-specific cliché list.**

| Element | Budget |
|---|---|
| Lead | ≤ 2 sentences |
| The mastery statement | ≤ 2 sentences |
| Marker labels | ≤ 4 words each |
| Closing narrative line | 1 sentence |

**Banned in this scene specifically** — in addition to the standing 4.1 list:
*unlock your potential · you have it in you · every expert was once a beginner · the only limit is
you · imagine what you could become · the future is yours · look how far you've come · this is
just the beginning · the sky's the limit · dream big · believe in yourself ·* **any aspirational
question as a statement** (*"What if you could…?"*) · **any scenic or metaphorical imagery** —
roads into mountains, sunrises, stars, rivers, ladders, winding paths through landscapes,
silhouettes against horizons.

**The journey device is an abstract marker set. It is not scenic metaphor.** Report if the
distinction blurred.

---

### FIRST: INSPECT

1. **Step 4.1** — the scene contract, Scene 7's declared field values, the scroll grammar, the
   voice document, the honesty treatment, the `liveCapability` map. **Confirm Scene 7 is declared
   `liveCapability: false`** and report it.
2. **Step 3.1** — the subject schema, **specifically the `id` immutability rule and its stated
   purpose** (keying progress, recordings, classes, tutoring data). **This is the anchor for
   Decision 2's claim.** Report the exact wording.
3. **Step 4.3 / 4.4 / 4.5** — Scenes 2, 3 and 4's authored forms, so Scene 7 does not duplicate
   any of them, and so the journey device's first three steps **accurately reflect what those
   scenes actually did.**
4. **Step 4.6** — Scenes 5–6's authored forms: the status vocabulary, the treatment's application,
   and Scene 6's consolidated statement, so Scene 7 does not repeat it.
5. **Steps 2.2–2.4** — the type scale and measure; the motion grammar (Scene 7 uses existing
   presets only, most likely `reveal-once` and `stagger`); the Stage/Room layers and the proximity
   principle.
6. **Step 3.3** — motif roles and budgets. Scene 7 is likely motif-light; report if it adds cost.
7. **Step 3.7** — the audit harness and committed baseline. **Scene 7 requires a harness
   extension** (Part 5).
8. **Existing `/`, Scenes 0–6's authored content, Scene 7's skeleton state** — extend, never
   replace.

Report findings before building.

---

### BUILD — PART 1: THE COMPOSITION

**The job:** state what mastery means here, and show the visitor their own position on the path.

**Requirements:**
- **This is the page's emotional peak, so it is allowed to be visually still.** After Scene 6's
  sequence, a composed, quiet scene is the strongest move. **Stillness is the register.**
- **The journey device is the scene's one visual idea.** It carries the completion state, the
  remaining steps, and the honesty — all in one element.
- **No scenic imagery, no illustration, no photography, no metaphor art.**
- **No new visual language.** Compose from type, the proximity principle, and one restrained
  structural element from the brand's language (3.3) if it earns its place.
- **It must work with no motion.** If the scene's effect depends on animation, it is weak —
  **build it so the static version is complete and moving.** Verify by removing all motion.
- **`reveal-once` for scene entry at most**, with `stagger` on the markers. **Respect the 4.1
  motion budget** and report the concurrent element count.

**The mastery statement:**
- **≤ 2 sentences**, in the 4.1 voice, defining mastery **without asserting an outcome.**
- **Must be anchored in something checkable** — the environment accumulates, the `id` persists,
  progress lives where the work happens. **Report the anchor for each clause.**
- **Must not promise features that don't exist.** Progress tracking is Phase 9 — so the statement
  describes **what the product is designed to do**, labelled per the treatment, **not what it does
  today.**

**Mandatory deliverables — copy:**
- **Two candidates** for the lead, with emphasis, risk and a recommendation. Verbatim.
- **Three candidates** for the mastery statement, each with what it claims, what it risks, and
  whether it asserts an outcome. Verbatim, with a recommendation.
- **The marker labels** for all seven steps, in visitor language. Verbatim.
- **The closing narrative line** into Scene 8.

---

### BUILD — PART 2: THE JOURNEY DEVICE

**The rules that keep it honest:**
- **Completion is fact, not decoration.** Three steps are complete because the visitor completed
  them on this page. **Report how the device derives completion state** — if it can be derived
  from real scroll/engagement state, do so; if it is authored, say so plainly.
- **The four ahead are legible and equal in weight** — not dimmed into invisibility, not styled as
  locked content. **They are simply what's next.**
- **No numeric progress.** No "3 of 7". No fraction, no percentage, no bar.
- **No reward semantics.** No checkmarks-as-trophies, no celebration, no animation on completion.
- **Nothing is conveyed by colour or motion alone.** The completed/remaining distinction must
  survive grayscale and reduced motion. **Verify both.**
- **It must be readable by assistive technology as text** — the visitor learns which steps are
  done and which are ahead, in words.
- **If the device cannot be made honest at the current state of the product, say so and propose
  the alternative.** A weak honesty device is worse than no device.

**Interaction:**
- **The device is not interactive.** Not clickable, not focusable, not tabbable. It is a map.
- **No hover states, no tooltips, no expand.**

---

### BUILD — PART 3: THE HONESTY TREATMENT

- **Scene 7 uses the per-element treatment** from 4.6's vocabulary. **Do not invent a new
  treatment, and do not repeat Scene 6's consolidated statement.**
- **The journey device carries honesty by construction** (the four remaining steps are visibly
  ahead). **Confirm this is sufficient, or state where an additional treatment is required.**
- **The mastery statement describes designed behaviour, not shipped behaviour.** Label it
  accordingly using the existing vocabulary.
- **No dates, quarters, "coming soon", countdowns, waitlists, or urgency devices.**
- **No CTA, no capture.** Report the sweep.

---

### BUILD — PART 4: ACCESSIBILITY

- **The seven steps are a labelled group**, announced as such.
- **Each marker's state is text**, not colour or icon alone — the visitor learns **which are
  complete and which are ahead** from the words.
- **Report the reading order** and confirm the device is not announced as an achievement or
  reward UI, and does not produce live-region churn.
- **No focusable elements** in this scene. **Confirm the tab order passes cleanly through.**
- **Heading nesting correct**; no additional `h1`.
- **Copy remains legible over any motif** — the 3.3 legibility rule holds.
- **Reduced motion:** the scene is complete and static. **Screenshot it.**
- **No-JS:** the scene is complete and correct, server-rendered, including the device's state and
  all copy. **Screenshot it.**
- **Zoom 400% and 200%:** the device must remain readable — **if it requires horizontal space it
  does not have, it reflows to a vertical sequence rather than scrolling horizontally.** Report
  how it resolves.

---

### BUILD — PART 5: CONTRACT UPDATE, BUDGETS AND PERFORMANCE

- Update Scene 7 from `skeleton` to `authored`. **Change no other scene's config.**
- **Do not change** the spine order, the scroll grammar, the `sticky-stage` claimant (Scene 4),
  the `sequence` claimant (Scene 6), or the total scroll budget — except to record Scene 7's
  **actual** `scrollBudget` against its declaration. **If the actual exceeds the declared, report
  it as a defect rather than editing the declaration.**
- Confirm Scene 7's `reducedMotion`, `mobileBehaviour` and `noJsBehaviour` are **implemented** as
  declared.
- **Motif budget for `/`:** report combined path commands, DOM elements and generation time
  against the 3.3 ceilings. **Scene 7 should add very little** — report if it adds more than
  expected.
- **Performance:** report `/`'s payload, LCP element and value, and CLS with Scenes 0–7 authored.
  Report any long task over 50ms.
- **Confirm the WebGL chunk is still absent** from `/`'s network waterfall.
- **Extend the 3.7 audit harness to cover Scene 7** — both themes, contrast, the journey device's
  state distinction in grayscale, the treatment's legibility, and reflow at 400% zoom. Report
  results.

---

### SPECIMEN ROUTE — `/dev/scene-promise` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Required:
- **Scene 7 in isolation**, judged without the surrounding page.
- **The journey device in both themes**, at 320, 390, 768, 1280, 1920 — showing exactly how it
  reflows.
- **A grayscale rendering** and a **reduced-motion rendering**, proving the completed/ahead
  distinction survives without colour and without motion.
- **A no-JS rendering.**
- **A state matrix** — the device with zero, three, and all seven steps complete, so the device is
  proven to work when the product actually ships those capabilities. **Report honestly whether it
  reads correctly at all three.**
- **A boundary checklist with pass/fail:** no progress bar/ring/percentage/streak/XP/level/badge ·
  no certificate or rank language · no reward semantics · no scenic metaphor · no CTA or capture ·
  no dates or urgency · device not interactive · completion state honest · word counts inside
  budget.
- **A copy panel** with all authored copy verbatim, including every candidate and recommendation.
- **A page-length readout** — total authored word count and reading time for `/` with Scenes 0–7
  authored.
- A visible note stating what is real vs. deferred.

---

### CONSTRAINTS

- **One scene only.** Do not author Scene 8.
- **No CTA, no capture, no form.**
- **No progress UI of any kind** (see Decision 2's ban list).
- **No reward semantics. No gamification. No celebration.**
- **No scenic, metaphorical, or aspirational imagery of any kind.**
- **No testimonials, statistics, outcomes, ranks, or invented numbers.**
- **No simulated interface.**
- **No dates, quarters, countdowns, or urgency devices.**
- **No ambient, no 3D, no canvas, no WebGL chunk.**
- **No `sticky-stage`, no `sequence`.**
- **No interactive elements at all in this scene.**
- **No new tokens, colours, marks, motifs, motion vocabulary, or primitives.**
- **No new dependencies.**
- Do not modify the subject system, brand frame, nav shell, environment shell, primitives, the
  switch, or the `/subjects` scaffold.
- Do not build the footer or Scene 8.
- Do not touch existing `/dev/*` routes beyond **extending the audit harness** per Part 5.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitive APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (2.6)
- Subject schema, `id` immutability rule, taglines, five levers, validator, marks, motif grammar,
  switch, ambient layer, environment shell (3.1–3.6)
- The committed baseline (3.7) — **extend, do not rewrite**
- The scene contract, scene sequence, scroll grammar, voice document, honesty treatment (4.1)
- Scenes 0–6 and the availability amendment (4.2–4.6)
- Other scenes' content
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **No-JS** — disable JavaScript. **The scene is complete: lead, mastery statement, the device
   with its correct state, marker labels, closing line.** Screenshot it.
2. **Reduced motion** — the scene is complete and static; the completed/ahead distinction is
   fully legible. Screenshot it.
3. **Progress-UI sweep** — grep for: progress bar, ring, dial, percentage, fraction, streak, XP,
   points, level, tier, badge, trophy, medal, certificate, rank, leaderboard, "of 7". **Expected:
   none.** Paste the sweep.
4. **Reward-semantics sweep** — grep for: congratulations, well done, you did it, achievement,
   unlocked, earned, reward. **Expected: none.** Paste the sweep.
5. **Cliché sweep** — grep this scene's copy for every phrase in Decision 6's ban list plus the
   standing 4.1 list. **Expected: none.** Paste the sweep.
6. **Metaphor-imagery sweep** — confirm no scenic or metaphorical imagery; confirm the journey
   device is an **abstract marker set** and not a scenic path. Describe the device and screenshot
   it.
7. **Honest-completion check** — confirm the three marked-complete steps **accurately reflect what
   Scenes 1–4 actually did on this page.** Report the mapping — which scene corresponds to which
   step — and confirm nothing is marked complete that is not.
8. **Anchoring report** — for each clause of the mastery statement, state **where it is checkable
   in the codebase or which design commitment it represents.** Remove anything unanchored.
9. **Fabrication audit** — **paste the full list of every string Scene 7 renders**, so it can be
   reviewed. Confirm no invented statistic, testimonial, outcome, rank or number.
10. **No CTA or capture** — paste the sweep for buttons, CTAs, forms, email inputs. **Expected:
    none.**
11. **No dates or urgency** — paste the sweep. **Expected: none.**
12. **Not interactive** — confirm nothing in the scene is focusable or tabbable. Report the tab
    order passing cleanly through the scene.
13. **Word counts** — actual counts against the Decision 6 budgets. **Report any overrun as a
    defect.**
14. **Boundary check vs Scenes 2 and 3** — report how Scene 7 avoids reading as a specimen sheet or
    a chooser.
15. **State matrix** — render the device with zero, three, and all seven steps complete. Report
    honestly whether it reads correctly in all three cases, and whether the zero-complete state is
    coherent.
16. **Grayscale pass** — the completed/ahead distinction survives without hue. Screenshot; report
    honestly.
17. **Contrast** — every text/surface pairing, both themes. Report measured ratios. Failures fixed
    by **lightness only** and reported.
18. **Screen reader** — report the reading order. Confirm a user learns which steps are complete
    and which are ahead, from text alone, and that the device is not announced as an achievement
    UI. Report tool and output.
19. **Both themes** at 320, 390, 768, 1280, 1920 — report how the device reflows at each width,
    with no horizontal scroll.
20. **Zoom 400%** (WCAG 1.4.10) and **200%**, **text spacing** (WCAG 1.4.12) — nothing clips or
    overlaps.
21. **Motif budget for `/`** — the delta Scene 7 adds against the 3.3 ceilings.
22. **Performance** — payload, LCP element and value, CLS with Scenes 0–7 authored. Any long task
    over 50ms.
23. **WebGL absence** — confirm the chunk is absent from `/`'s network waterfall.
24. **Hydration** — zero warnings on `/` and `/dev/scene-promise`.
25. **Audit harness extended to Scene 7** — report the pass/fail summary.
26. **Audit** — axe/Lighthouse on `/` and `/dev/scene-promise`. Score + every violation.
27. **Guard test** — scene components still do not import scene configs directly.
28. **Production build** succeeds; `/dev/scene-promise` absent or 404.
29. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — confirmation **only Scene 7** was authored
2. **Scene 7's two lead candidates** — verbatim, with emphasis, risk, recommendation
3. **The three mastery-statement candidates** — verbatim, what each claims and risks, whether each
   asserts an outcome, and your recommendation
4. **The marker labels** for all seven steps — verbatim
5. **The closing narrative line** into Scene 8
6. **The journey device** — its form, how completion state is derived, and why it does not read as
   an achievement UI
7. **How the device avoids being a fake progress indicator** — in your own words
8. **The honest-completion mapping** — which scene corresponds to which step
9. **The anchoring report** for every clause of the mastery statement
10. **The full list of strings Scene 7 renders** (fabrication audit)
11. **All sweeps** — progress UI, reward semantics, clichés, metaphor imagery, CTA/capture,
    dates/urgency
12. **Word counts** against budgets
13. **State matrix results** — zero, three and seven complete
14. **No-JS and reduced-motion screenshots**
15. **Grayscale, contrast, screen reader and keyboard results**
16. **Device reflow** at each width and at 400% zoom
17. **Motif budget delta, payload, LCP, CLS, WebGL absence**
18. **Page-length readout** — total authored word count and reading time for `/`
19. **THE HONEST ASSESSMENT ON TWO QUESTIONS, ANSWERED PLAINLY:**
    (a) **Does the journey device actually work, or does it feel like a gimmick?** If it feels
    like one, say so and recommend cutting it.
    (b) **Would the scene convert better with a door at the peak?** Recommend; do not add one.
    **Do not soften either answer.**
20. **Whether the audit harness extension surfaced anything previously unknown**
21. Anything deferred, and confirmation nothing was half-built
22. Confirmation nothing outside Scene 7 was changed

---

### STOP

End after the report. Do not begin Step 4.8 (Scene 8 — The Return) or any other scene.
