# TUTORS ACADEMY — Phase 4 · Step 4
## Scene 3 — The Choice

> Depends on Steps 4.1 (spine + contract + voice), 4.2 (Scene 0), 4.3 (Scenes 1–2), and all of
> Phase 3. **Read the scene contract, the voice document, and Scenes 0–2's authored forms first.**
>
> **This step authors ONE scene** — plus **one narrow, authorized change to Scene 0** (below).
> It does not touch the spine, Scenes 1–2, Scenes 4–8, the subject system, or the primitives.
>
> **This is the pivot of the homepage: DISCOVER → CHOOSE.**

---

### WHY THIS STEP EXISTS

Everything before this scene has been *about* the product. This is where the visitor stops
reading and does something.

Scene 3's job:

> **Present six environments as six doors, and make entering one a single, obvious action.**

It is also the homepage's **conversion moment** — which is exactly why the honesty rules below
are strict. A student who enters expecting something that isn't there is lost permanently.

---

### THE FIVE LOCKED DECISIONS

**1. Scene 3 is a threshold, not a preview.**

**No page-level preview. No takeover. No morph-on-hover.**

Each environment's identity is carried **on the item itself** — its own accent, its mark, its
motif fragment, its name. Selecting one **does not transform the page**; it crosses into the
environment (which is Scene 4's job and then the real route).

**Why this is rejected rather than deferred:** page-level preview would duplicate Scene 4,
introduce layout-shift and focus-churn risk, be ambiguous on touch devices, and add motion the
visitor did not ask for.

**Permitted:** a **local, restrained emphasis on the item itself** on hover/focus — accent
intensifies, the item lifts slightly. **The item changes; the page does not.**

**2. Each environment is a real link. The scene works with JavaScript off.**

- Six real `<a>` elements. **No JS required to choose.**
- **Each link's accessible name includes both the subject name and the environment name** —
  e.g. *"Physics — The Field"*. A visitor must know where each door leads before taking it.
- Each resolves to a **real route**. **Verify all six resolve; report any that do not.**
- **Only `ready` or `locked` subjects appear.** The 3.1 draft guard applies: **a draft subject
  must never be offered on the homepage.** Enforce structurally and report the enforcement point.
- `/subjects` (the 3.6 scaffold) **stays functional** as a plain, accessible list and an
  alternative path. **Do not redesign it. Do not remove it.**

**3. No two-step interaction, ever.**

**Forbidden:** tap-to-preview-then-tap-to-enter; "are you sure" confirmations; modals; dialogs;
any control that only appears on hover; any state in which the first action is not the action.
**One action per door.**

**4. Equal weight, explicit order.**

- **All six environments share one visual weight.** Unequal sizing, emphasis or position would
  imply one subject matters more — **the opposite of what this product claims.** Verify
  equal-weight rendering and report it.
- **The order is explicit and justified** — a defined sequence, not incidental DOM order.
  State the ordering rule and why.
- **No subject is featured, recommended, popular, or marked "most chosen."** No badges, no
  "popular" tags, no recommended pill.

**5. The conversion moment promises ENTRY, not outcomes.**

The action is **entering an environment**. Not a course, not a result, not a transformation.

- **CTA language:** "Enter" — *not* "Start learning", not "Begin your journey", not "Enrol",
  not "Get started".
- The scene must **not promise learning features that do not exist** (live classes, recordings,
  AI, progress — Phases 7–9). It also must **not apologise or hedge** at the moment of
  conversion. **Confident, honest, specific.**
- **What the visitor gets is real and already built:** the environment — its identity, its
  structure, its tutor-page shell. That is the offer. State it plainly, and let the environment
  itself (3.6) carry the honest placeholders.

---

### THE AUTHORIZED CHANGE TO SCENE 0 (narrow)

Step 4.2 parked the hero's primary CTA on `/subjects` **because Scene 3 did not exist yet.**

Now it does. So, and only this:

- **Repoint Scene 0's primary CTA to Scene 3's anchor**, keeping the same label intent
  ("enter a world").
- **Change nothing else about Scene 0** — not the statement, not the supporting line, not the
  composition, not the motion, not the secondary CTA.
- **Report the before/after and confirm the CTA lands on the correct anchor** and is keyboard
  reachable.

---

### FIRST: INSPECT

1. **Step 4.1** — the scene contract, this scene's declared field values, the scroll grammar,
   the voice document, the honesty treatment, the `liveCapability` map.
2. **Step 4.2** — Scene 0's authored form, specifically the **primary CTA and its current
   target**, and the anchor pattern already used.
3. **Step 4.3** — Scene 2's authored form. **Scene 3 must not read as a second specimen
   sheet.** Scene 2 is display-only evidence; Scene 3 is actionable. **Report explicitly how the
   two are told apart at a glance** — or report honestly if they are not.
4. **Step 3.1** — the subject schema, the six subjects' **ids, names, environment names and
   taglines**, the `status` field, and the **draft guard**. **Taglines come from the configs —
   do not author new ones.** If a tagline is weak, report it; do not rewrite it here.
5. **Step 3.2 / 3.3** — the six marks, the motif roles and coverage caps, and the motif budgets.
6. **Steps 2.2–2.4** — type scale and measure; motion grammar and the ambient caps; the Stage/
   Room layers, section spacing, and the proximity principle.
7. **Step 2.5** — primitives. Each door's action **must use a real, consistent control pattern**,
   not ad-hoc styling.
8. **Step 2.6** — the nav's Stage mode, so Scene 3's composition does not collide with the nav
   when scrolled.
9. **Step 3.7** — the audit harness and committed baseline. **Scene 3 requires a further harness
   extension** (Part 5).
10. **Existing `/` route, Scenes 0–2's authored content, Scene 3's skeleton state, and the
    `/subjects` scaffold** — extend, never replace.

Report findings before building.

---

### BUILD — PART 1: THE COMPOSITION — SIX DOORS, NOT A CARD GRID

**The job:** compose six environments as a place you approach, not a menu you scan.

**Requirements:**
- **Not a uniform SaaS card grid.** No six identical boxes with a generic icon and a title.
  That is the default this product exists to reject.
- **Not a carousel.** No hidden items, no pagination, no swiping, no auto-advance.
- **Not a dropdown or select.** Ever.
- **Each door carries its own identity:** the subject's mark (3.2), its accent applied to the
  item, a motif fragment in a low-coverage role (`edge` and/or `focus` — **never `substrate`**),
  the subject name, the environment name, and the config tagline.
- **Something constant must remain across all six** — the shared component geometry, the type
  treatment, the layout rhythm. Same principle as Scene 2: **what changes and what does not,
  both legible.**
- **All six visible at once on desktop.** At small widths they resolve to a vertical sequence
  where **every environment is reachable by scrolling the page** — **no horizontal scroll
  container, no hidden items.**
- **Equal visual weight across all six** (Decision 4). Verify and report.

**Copy structure per door:**
- Subject name (real text)
- Environment name (real text)
- Tagline (from the 3.1 config — do not invent)
- One action per door (Decision 5 language)

---

### BUILD — PART 2: THE INTERACTION

**Per door:**
- A single real `<a>` with an accessible name containing subject + environment.
- Target: **the real route** `/subjects/[id]`.
- **Touch:** the full item is the target. **Minimum 44×44, ≥8px gaps**, at 320px. No hover
  dependency of any kind — **verify on touch emulation that each door is enterable in one tap.**
- **Keyboard:** each door is reachable by `Tab`, visible focus, `Enter` activates. **Focus order
  follows reading order.**
- **Focus ring visible on every accent** — all six, both themes. **This is the fourth time this
  case appears in the project and it is the one most often failed.** Report the screenshots.
- **Hover/focus emphasis is local to the item** (Decision 1) and uses **only** the 2.3 grammar
  (`confirm` and at most one subtle `orient`).
- **The emphasis must not shift layout.** Report measured CLS during hover/focus across all six.
- **Under reduced motion:** no emphasis movement; state change only. Doors fully functional.

**Forbidden interaction:**
- Two-step entry, confirmations, modals.
- Hover-only affordances.
- Any control that requires discovering a hidden state.
- Any auto-advancing or auto-focusing behaviour.
- **Any focus movement that is not caused by the user.**

---

### BUILD — PART 3: THE SCENE HERO AND THE HANDOFF

**Scene lead:**
- A short lead — **no more than two sentences** — that frames the choice in the 4.1 voice.
- **It must be structurally distinct from Scene 2's copy** and must not repeat Scene 2's
  constancy claim. **Scene 2 argued; Scene 3 invites.**
- **Mandatory deliverable — two candidates** for the lead, with emphasis, risk and a
  recommendation. Report both verbatim.

**CTA label:**
- **Mandatory deliverable — three candidate labels** for the per-door action (the crossing).
  For each: what it promises and what it risks, checked against Decision 5.
  **Recommend one with reasoning.** Report all three verbatim.

**The handoff to Scene 4:**
- Scene 3 **ends at the threshold.** The crossing is Scene 4's job (Step 4.5) and then the real
  route.
- **Define and document the handoff contract now:** if Scene 4 needs to know which environment
  the visitor was drawn to, **state how that would be shared** (spine state), and **do not
  implement Scene 4**.
- **Do not build a Scene 4 placeholder** beyond what 4.1 already defined.
- The scene should end with a **narrative line** leading into Scene 4 — **a sentence, not a
  control.**

---

### BUILD — PART 4: ACCESSIBILITY OF A DECISION

- **The six doors are a labelled group** — a heading names the set, so a screen-reader user
  understands they are choosing among six options.
- **Subject and environment names are text, never images.**
- **Nothing is conveyed by colour alone.** Each door's identity must survive grayscale — verify
  with a grayscale pass and report it honestly.
- **No `aria-live` churn.** Focus-driven emphasis must produce **no announcements** — verify
  there is no live-region noise as a visitor tabs through all six.
- **Motif fragments are `aria-hidden`.**
- **Heading nesting is correct** and does not skip levels.
- **One `h1` on the page remains Scene 0's statement** — Scene 3's lead is a section heading,
  not an `h1`.
- **Reading order follows the intended order** (Decision 4), not DOM accident.

---

### BUILD — PART 5: CONTRACT UPDATE, BUDGETS AND PERFORMANCE

- Update Scene 3's `status` from `skeleton` to `authored`. **Change no other scene's config.**
- **Do not change** the spine order, the scroll grammar, or the total scroll budget — except to
  record Scene 3's **actual** `scrollBudget` against its declaration. **If the actual exceeds
  the declared, report it as a defect rather than editing the declaration.**
- Confirm Scene 3's `reducedMotion`, `mobileBehaviour` and `noJsBehaviour` are **implemented** as
  declared.
- **Scroll behaviour:** `reveal-once` for scene entry. **Scene 3 does not claim `sticky-stage`**
  (rationed to at most one scene per page) and **does not use `sequence`.**
- **No ambient, no 3D, no canvas.**
- **Motif budget:** Scene 3 adds six more subject scopes to `/`. **Report the combined totals for
  `/`** — path commands, DOM elements, generation time — **against the 3.3 ceilings.** If Scenes
  2 and 3 together approach the ceiling, **reduce coverage** rather than exceed it, and report
  what you chose. **Reuse Scene 2's scope tokens rather than re-declaring them.**
- **Report `/`'s payload, LCP element and value, and CLS** with Scenes 0–3 authored.
- **Confirm the WebGL chunk is still absent** from `/`'s network waterfall.
- **Extend the 3.7 audit harness to cover Scene 3** — all six doors, both themes, contrast for
  every text/accent pairing, focus-ring visibility on all six accents, and touch targets.
  Report the results.

---

### SPECIMEN ROUTE — `/dev/scene-choice` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Required:
- **Scene 3 in isolation**, judged without the surrounding page.
- **All six doors in both themes**, so equal weight and accent differentiation are verifiable.
- **A grayscale toggle**, proving the doors survive without hue.
- **Both themes at 320, 390, 768, 1280, 1920**, showing how six resolve at each width.
- **A focus walkthrough panel** — tab through all six and observe: focus visibility, emphasis,
  CLS, and that **no live region fires**.
- **A reduced-motion preview.**
- **A no-JS preview.**
- **The boundary checklist rendered with pass/fail:** no preview takeover, no two-step entry,
  no featured subject, equal weight, all six reachable, drafts excluded, no colour-only meaning.
- **A copy panel** with all authored copy verbatim, including Scene 3's two lead candidates and
  three CTA candidates.
- **The handoff contract** to Scene 4, documented on the page.
- **The Scene 2 vs Scene 3 comparison** — both rendered side by side so it is verifiable that
  they read differently.
- A visible note stating what is real vs. deferred.

---

### CONSTRAINTS

- **One scene only**, plus the narrow Scene 0 CTA change authorized above.
- **Do not author Scene 4 or any later scene.**
- **No preview takeover. No two-step entry. No modals.**
- **No featured, recommended, or "popular" subject. No badges.**
- **No new taglines** — use the 3.1 configs. Report weak ones; do not rewrite them.
- **No ambient, no 3D, no canvas, no WebGL chunk.**
- **No `sticky-stage`, no `sequence`.**
- **No `substrate` motifs.**
- **No fabricated data** — no student counts, no ratings, no popularity figures, no testimonials.
- **No new tokens, colours, marks, motifs, motion vocabulary, or primitives.**
- **No new dependencies.**
- Do not modify the subject system, brand frame, nav shell, environment shell, primitives,
  switch, or the `/subjects` scaffold.
- Do not build the footer or any later scene.
- Do not touch existing `/dev/*` routes beyond **extending the audit harness** per Part 5.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitive APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (2.6)
- Subject schema, taglines, validator, marks, motif grammar, switch, ambient layer, environment
  shell (3.1–3.6)
- The committed baseline (3.7) — **extend, do not rewrite**
- The scene contract, scene sequence, scroll grammar, voice document (4.1)
- **Scene 0 beyond the authorized CTA repoint** (4.2)
- Scenes 1–2 (4.3)
- Other scenes' content
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **No-JS** — disable JavaScript. **All six doors present, all six links working, all six
   resolving to real routes**, copy present, no interaction broken. **Screenshot it.**
2. **All six destinations resolve** — click each door; confirm `/subjects/[id]` loads its correct
   environment with the right scope. Report all six URLs.
3. **Draft exclusion** — confirm no draft subject appears as a door. **Paste the enforcement
   point** and the list of subjects actually rendered.
4. **Equal weight** — measure the rendered dimensions of all six doors; confirm equal. Report
   the measurements.
5. **Ordering rule** — state the order and its justification. Confirm it is not DOM accident.
6. **One action per door** — verify no two-step path exists anywhere. Paste the sweep for
   confirmations, modals and hover-only affordances.
7. **Touch** — emulate touch; confirm each door is enterable in **one tap**, targets ≥44×44 with
   ≥8px gaps at 320px. Report measurements.
8. **Keyboard walkthrough** — tab through all six; confirm focus visible on each accent, order
   matches reading order, `Enter` activates, **no focus movement without user action**.
9. **Focus ring on all six accents** — screenshot each, both themes.
10. **No live-region churn** — with a screen reader AND with devtools live-region inspection,
    confirm tabbing through all six produces **no announcements**. Report the observation.
11. **CLS during hover/focus** — report measured CLS across all six emphasis interactions. Target 0.
12. **Reduced motion** — emphasis reduced to state change only; all six functional. Screenshot.
13. **Grayscale pass** — doors remain distinguishable without hue. Screenshot; **report honestly
    if two collapse**.
14. **Contrast** — every door's text against its accent and surface, six subjects × two themes.
    Report measured ratios. Failures fixed by **lightness only** and reported.
15. **Both themes** at 320, 390, 768, 1280, 1920 — report how six resolve at each width.
16. **Zoom 400%** (WCAG 1.4.10) and **200%** — nothing clips, no overlap, no horizontal scroll.
17. **Text spacing** (WCAG 1.4.12) — nothing clips on any door.
18. **Screen reader** — report the reading order. Confirm a user learns there are six options,
    what each is, where each leads, and that they are links. Report tool and output.
19. **Scene 2 vs Scene 3 distinction** — report honestly how the two scenes are told apart at a
    glance. **If they read too similarly, say so with a specific recommendation.**
20. **Hero CTA repoint** — verify Scene 0's primary CTA now lands on Scene 3's anchor, is
    keyboard reachable, and that **nothing else in Scene 0 changed**. Report before/after.
21. **Motif budgets** — combined totals for `/` across Scenes 2 and 3 against the 3.3 ceilings.
    Report numbers and any coverage reduced.
22. **Payload, WebGL absence, LCP element and value, CLS** for `/` with Scenes 0–3 authored.
23. **Hydration** — zero warnings on `/` and `/dev/scene-choice`.
24. **Audit harness extended to Scene 3** — report the pass/fail summary.
25. **Audit** — axe/Lighthouse on `/` and `/dev/scene-choice`. Score + every violation.
26. **Guard test** — scene components still do not import scene configs directly.
27. **Production build** succeeds; `/dev/scene-choice` absent or 404.
28. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — confirming **one scene authored + the narrow Scene 0 CTA change**
2. **Scene 3's two lead candidates** — verbatim, with emphasis, risk and recommendation
3. **The three CTA label candidates** — verbatim, with what each promises and risks, and your
   recommendation
4. **All authored copy**, verbatim — doors, lead, narrative line
5. **The composition** — how six doors are arranged, how they avoid the card grid, and what is
   constant across all six
6. **Equal-weight measurement** and the ordering rule with justification
7. **The Scene 2 vs Scene 3 distinction** — honest assessment
8. **The boundary checklist results** — no takeover, no two-step, no featured subject,
   drafts excluded, no colour-only meaning
9. **The handoff contract** to Scene 4, documented
10. **No-JS results** with screenshot, and all six destination URLs
11. **Keyboard walkthrough, focus-ring screenshots, and live-region observation**
12. **CLS, contrast and grayscale results**
13. **Width-by-width resolution of the six doors**
14. **Motif budget totals** for `/` against ceilings, and any coverage reduced
15. **Payload, WebGL absence, LCP element and value, CLS**
16. **Scroll budget** actual vs declared, any overrun flagged as a defect
17. **Hero CTA repoint** before/after, with confirmation nothing else in Scene 0 changed
18. **Whether the audit harness extension surfaced anything previously unknown**
19. Anything deferred, and confirmation nothing was half-built
20. Confirmation nothing outside Scene 3 and the authorized Scene 0 change was touched

---

### STOP

End after the report. Do not begin Step 4.5 (Scene 4 — Enter) or any other scene.
