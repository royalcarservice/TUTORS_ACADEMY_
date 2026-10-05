# TUTORS ACADEMY — Phase 4 · Step 3
## Scenes 1–2 — The Premise + The Difference

> Depends on Steps 4.1 (spine + contract + voice) and 4.2 (Scene 0), and all of Phase 3.
> **Read the scene contract, the voice document, and Scene 0's authored form first.**
>
> **This step authors exactly two scenes.** It does not touch the spine, Scene 0, Scenes 3–8,
> the subject system, or the primitives.
>
> **No ambient, no 3D, no sticky-stage, no sequence, no CTA in these scenes.**

---

### WHY THIS STEP EXISTS

Scene 0 makes one statement and opens one door. These two scenes answer the two questions
that immediately follow:

- **Scene 1 — The Premise:** *what is this place?* Answered concretely, without a feature dump.
- **Scene 2 — The Difference:** *why is it different?* **Demonstrated, not claimed.**

Together they earn the right to ask the visitor to choose.

---

### THE FIVE LOCKED DECISIONS

**1. These two scenes are a breath, not a blow.**

After the hero's single statement, the page goes quiet and plain.

- **Scene 1 is text-forward and typographically calm** — a **contained Room on the Stage**
  (2.4/3.6). Reading-first, generous measure, no spectacle.
- **Scene 2 is a visual exhibit** — composed, restrained, and doing the work through
  composition rather than motion.
- The cinematic register is **deliberately lowered here** so Scenes 3 and 4 can land.
  Two consecutive maximal scenes read as noise, not as cinema.

**2. Scene 2 is a SPECIMEN SHEET — not a chooser, not a screenshot.**

This is the boundary most likely to blur, so it is explicit:

- Scene 2 **demonstrates that one brand holds many environments.** It does **not** ask the
  visitor to choose.
- **Forbidden in Scene 2:** the words "choose", "start", "enter", "begin", "select";
  per-subject CTAs or buttons; hover-to-select; hover-to-expand; any commitment affordance;
  any implication of progress or enrolment.
- **Scene 2's subject is the system. Scene 3's subject is the visitor's decision.**
- **The demonstration renders real components in real subject scopes** — real tokens, real
  motif grammar — as an exhibit of the actual system. **Not a mockup. Not a picture of a
  product. Not a fake dashboard.**
- **It contains no fabricated data.** No student names, no course titles, no progress values,
  no schedules, no invented statistics. It shows **materials** — mark, type, accent, motif,
  component geometry — the way a type specimen shows type.
- **Report if the boundary was breached anywhere**, including in copy.

**3. The constancy must be visible AND stated.**

The claim is "one brand, many environments." So both halves must be plain:

- **What changes:** accent and motif.
- **What does not:** the brand mark, the type families and scale, the spacing rhythm, the
  component geometry, the motion grammar.
- **The claim is ALSO made in text**, in the 4.1 voice. A purely visual claim excludes
  non-visual visitors — a sighted visitor sees it, a screen-reader user hears it.
- The scene should read as **evidence**, not as a boast. Show, then state — not state, then
  hope the visitor trusts it.

**4. No ambient, no 3D, no sticky, no sequence in either scene.**

- **No WebGL, no canvas, no 3D chunk loading** on these scenes' behalf.
- **Neither scene claims `sticky-stage`.** That is rationed to at most one scene per page and
  is not spent here.
- **Neither scene uses `sequence`.** That is for stepping through beats within a scene
  (Scene 6).
- **Scene 2's six motifs use low-coverage roles only** — `edge` and/or `focus` — **never
  `substrate`.** Six substrates on one page would blow the 3.3 budgets and the legibility rule.

**5. Scene 2 carries no CTA.**

- **No button, no link styled as a button, no action** in Scene 2.
- Scene 2 may end with a **narrative line** that leads into Scene 3 — a sentence, not a control.
- The CTA hierarchy stays intact: Scene 0 opens the door; Scene 3 is the choice; Scene 8 is
  the return.

---

### FIRST: INSPECT

1. **Step 4.1** — the scene contract, these two scenes' declared field values, the scroll
   grammar, the voice document, the honesty treatment, the `liveCapability` map.
2. **Step 4.2** — Scene 0's authored form. **Scene 1 must not repeat the hero's statement**,
   must not compete with its scale, and must feel like a deliberate change of register.
3. **Step 3.1 / 3.2 / 3.3** — subject ids and names, the six marks, the motif grammar's
   low-coverage roles, per-role coverage caps and contrast ceilings, and motif budgets.
4. **Steps 2.2–2.4** — the type scale and measure rule; the motion grammar and the ambient
   caps; the Stage/Room layers, section spacing roles and the proximity principle.
5. **Step 2.5** — primitives. **Scene 2 may display primitives as specimens**; it may not turn
   them into controls.
6. **Step 3.7** — the **audit harness and the committed baseline**. Scene 2 puts six subject
   scopes on `/` for the first time, so the harness must be **extended to cover `/`** — this is
   required, not optional.
7. **Existing `/` route, Scenes 0's authored content and Scenes 1–2's current skeleton states** —
   extend, never replace.

Report findings before building.

---

### BUILD — PART 1: SCENE 1 — THE PREMISE

**The job:** answer *what is this place* concretely, and set up the demonstration.

**Requirements:**
- **Text-forward.** A contained Room on the Stage: a reading column at the `prose` container,
  generous vertical rhythm, comfortable measure.
- **Concrete, not abstract.** Name the mechanic. "Subjects are environments, not a list of
  videos" is concrete. "A new era of learning" is not.
- **No feature dump.** Do not enumerate what the product will eventually do. **No roadmap
  content here** — that is the honesty scene's job (Phase 4.6).
- **Short.** Total copy: a short lead of no more than two sentences, plus at most three short
  supporting beats. **If a fourth beat appears, cut one.**
- **Every claim must be demonstrable in the product as it exists today.** If it is not built,
  it does not appear in Scene 1. Cross-check against the codebase and report the check.
- **Written against the 4.1 voice rules.** No banned phrase. No rhetorical question.
- **No visual spectacle.** At most one restrained structural element from the brand's own
  language (3.3), or none at all. **Restraint is the design decision here.**
- **`subjectMode: neutral`, `accentUse: none`** — no subject accent appears in Scene 1.
  Brand brass only.

**Mandatory deliverable — two candidates for the lead:**
Give **two complete candidates** for Scene 1's lead, state what each emphasises and risks, and
**recommend one with reasoning**. Report both verbatim.

---

### BUILD — PART 2: SCENE 2 — THE DIFFERENCE (THE SPECIMEN)

**The job:** prove that one brand holds many environments, using the real system as evidence.

**Composition:**
- A **composed exhibit**, not a swatch grid or a developer table. This is a designed moment in
  a narrative, not a design-system reference page.
- The six subjects are shown **as specimens of one system**, arranged so a visitor can compare
  them in a single glance. **Do not arrange them as destinations.**
- **Something visibly constant must be present across all six** — the mark, a shared component
  outline, the type treatment — so the eye can see what stays while the environment changes.
  This is the scene's central visual idea; **make it deliberate and legible, not incidental.**
- **Each specimen shows real materials:** the subject's mark, accent applied to real
  components, a motif fragment in a low-coverage role, and the subject's name.
- **No `substrate` motifs. No canvas. No ambient.**

**Content rules — the honesty constraint, applied strictly:**
- **No fabricated data of any kind.** No names, no course titles, no progress values, no
  numbers, no schedules, no dates, no statistics, no testimonials.
- **No simulated interface.** A specimen must not read as a screenshot of an app. If a visitor
  could mistake a specimen for a working screen, it has failed.
- **No "choose/start/enter/begin/select" language. No per-subject CTAs. No hover-to-select.**
- Specimens are **display only** — not interactive, not focusable, not tabbable.

**Copy:**
- The scene's text **states the two halves**: what changes and what does not.
- It also **names the mechanic** so a non-visual visitor gets the full claim: the same
  components, the same type, the same rhythm — only the environment changes.
- It ends with a **narrative line** that leads into Scene 3 — **a sentence, not a control**.
- Written against the 4.1 voice rules.

**Motion:**
- `reveal-once` for the scene, with `stagger` across the six specimens.
- **Respect the 4.1 motion budget** — report the count of concurrently animating elements and
  confirm it is inside the ceiling.
- **No looping animation. No ambient drift. No decorative motion.**
- **Reveals are additive, never conditional** — all six specimens are present and readable
  with motion disabled.

---

### BUILD — PART 3: ACCESSIBILITY OF A VISUAL CLAIM

This scene makes a **visual** argument, so the non-visual path must be designed, not assumed.

- **The comparison is structured semantically:** a labelled group, with each specimen carrying
  its subject name as real text. **A screen-reader user must be able to tell that six
  environments are being compared and what distinguishes them.**
- **The constancy claim is stated in text**, per Decision 3.
- **Subject names are text, never images.**
- **Headings nest correctly** and do not skip levels.
- **Nothing is conveyed by colour alone.** The difference between specimens must be legible
  without perceiving hue — verify with a grayscale pass and report it.
- **Decorative motif fragments are `aria-hidden`.**
- **Reading order follows the intended narration order**, not the visual grid's DOM accident.

---

### BUILD — PART 4: THE SCENE CONTRACT UPDATE AND THE SCROLL GRAMMAR

- Update these two scenes' `status` from `skeleton` to `authored` in the scene config.
- **Do not change any other scene's config.**
- **Do not change the spine's order, the scroll grammar, or the total scroll budget** except to
  record these scenes' actual `scrollBudget` against their declared values. **If the actual
  exceeds the declared, report it as a defect rather than silently editing the declaration.**
- Confirm both scenes' `reducedMotion`, `mobileBehaviour` and `noJsBehaviour` are **implemented**
  as declared, not merely written.

---

### BUILD — PART 5: PERFORMANCE AND BUDGET RESPECT

Scene 2 places **six subject scopes and six motif fragments on `/`** for the first time. That
is a real cost, so it is measured:

- **Report the motif budget totals for `/`:** combined path commands, combined DOM elements,
  and total motif generation time, **against the 3.3 ceilings**.
- **If the totals approach the ceilings, reduce coverage** (fewer fragments, smaller roles) —
  **never exceed them.** Report what you chose and why.
- **Report `/`'s payload, LCP element and value, and CLS** with Scenes 0–2 authored.
- **Confirm the WebGL chunk is still absent** from `/`'s network waterfall.
- **Extend the 3.7 audit harness to cover `/`**, including the six subject scopes in both
  themes, contrast for every specimen text/surface pairing, and touch targets. Report the
  results.

---

### SPECIMEN ROUTE — `/dev/scenes` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Required:
- **Scenes 1 and 2 in isolation**, each rendered alone so they can be judged without the
  surrounding page.
- **All six specimens in both themes**, side by side, so the constancy is verifiable directly.
- **A grayscale toggle** for the specimens, proving the difference survives without hue.
- **A reduced-motion preview** of both scenes.
- **A no-JS preview** of both scenes.
- **The `scrollBudget` values** shown against declarations.
- **The motif budget readout** for `/` against the ceilings — path commands, DOM count,
  generation time.
- **A copy panel** showing all authored copy verbatim, including Scene 1's two candidates and
  the recommendation.
- **The boundary checklist** rendered: no CTA, no fabricated data, no "choose" language, no
  interactive specimens — each with a pass/fail.
- A visible note stating what is real vs. deferred.

---

### CONSTRAINTS

- **Two scenes only.** Do not author Scene 0 or Scenes 3–8. Do not touch the spine, the scene
  sequence, or other scenes' content.
- **No CTA anywhere in Scene 2.** Scene 0's hierarchy stays intact.
- **No interactive elements in Scene 2.** Specimens are display only.
- **No ambient, no 3D, no canvas, no WebGL chunk.**
- **No sticky-stage, no sequence.**
- **No subject accent in Scene 1.**
- **No `substrate` motifs in Scene 2.**
- **No fabricated data, no simulated interface, no screenshots.**
- **No new tokens, colours, marks, motifs, motion vocabulary, or primitives.**
- **No new dependencies.**
- Do not modify the subject system, brand frame, nav shell, environment shell, primitives, or
  the switch.
- Do not build the chooser, the footer, or any later scene.
- Do not touch existing `/dev/*` routes beyond **extending the audit harness** per Part 5.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitive APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (2.6)
- Subject schema, validator, marks, motif grammar, switch, ambient layer, environment shell
  (3.1–3.6)
- The committed baseline (3.7) — **extend, do not rewrite**
- The scene contract, scene sequence, scroll grammar, voice document (4.1)
- Scene 0 (4.2)
- Other scenes' content
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **No-JS** — disable JavaScript. Both scenes complete, both CTAs unaffected, all six
   specimens present and readable, all copy present. **Screenshot it.**
2. **Reduced motion** — both scenes complete with motion removed; all six specimens present.
   **Screenshot it.**
3. **The boundary sweep** — grep Scene 2 for: "choose", "start", "enter", "begin", "select",
   any button, any CTA, any interactive element. **Expected: none.** Paste the sweep.
4. **Fabrication sweep** — audit every string and number rendered in Scene 2. Confirm **no**
   name, course title, progress value, statistic, date or schedule. Paste the full list of
   rendered strings so it can be reviewed.
5. **Fake-interface check** — confirm no specimen reads as a screenshot of an application.
   Describe how you verified, and screenshot the specimens at 1280 and 390.
6. **Brand-frame invariance on `/`** — across the six specimens, both themes: mark, type
   families and scale, spacing rhythm, component geometry are **identical**. **Accents and
   motifs differ; nothing else does.** Report the verification method and any leak found.
7. **Constancy in text** — confirm the claim is stated in words, not only shown. **Paste the
   copy that carries it.**
8. **Grayscale pass** — render the specimens in grayscale; confirm the environments remain
   distinguishable without hue. Screenshot and report honestly if two subjects collapse.
9. **Contrast on `/`** — every specimen's text/surface pairing, six subjects × two themes.
   Report measured ratios. Failures fixed by **lightness only** and reported.
10. **Motif budgets** — combined path commands, DOM elements and generation time for `/`
    against the 3.3 ceilings. Report the numbers and what you reduced, if anything.
11. **Payload and WebGL absence** — report `/`'s JS and CSS payload; **confirm the WebGL chunk
    is absent** from the network waterfall.
12. **LCP and CLS** — identify the LCP element and report its value with Scenes 0–2 authored.
    Report CLS, including any settle from Scene 2's reveal.
13. **Scroll budget** — these two scenes' actual `scrollBudget` against their declarations.
    **Report any overrun as a defect, not as an edit to the declaration.**
14. **Mobile 320px** — both scenes correct; **all six specimens visible without the page
    scrolling horizontally**, and no specimen hidden behind a horizontal scroll container.
    Report how the six resolve at 320 and at 390.
15. **Landscape mobile 667×375** — usable.
16. **Zoom 400%** (WCAG 1.4.10) and **200%** — nothing clips, no overlap, no horizontal scroll.
17. **Text spacing** (WCAG 1.4.12) — nothing clips in either scene.
18. **Keyboard** — full tab pass across Scenes 0–2. Confirm **no specimen is focusable** and the
    tab order is clean across the two scenes. Report the order.
19. **Screen reader** — report the reading order for Scenes 1–2. Confirm a user learns that six
    environments are compared, what distinguishes them, and what stays the same. Report tool and
    output.
20. **Both themes** — both scenes, dark and light.
21. **Hydration** — zero warnings on `/` and `/dev/scenes`.
22. **Audit harness extended to `/`** — report the pass/fail summary for `/` across six subjects
    and both themes.
23. **Audit** — axe/Lighthouse on `/` and `/dev/scenes`. Score + every violation.
24. **Guard test** — confirm scene components still do not import scene configs directly.
25. **Narrative redundancy check** — read Scene 1, then Scene 2, then Scene 3's stated intent.
    **Report honestly whether the sequence holds or whether Scene 2 now pre-empts Scene 3.**
    If it does, say so with a specific recommendation.
26. **Production build** succeeds; `/dev/scenes` absent or 404.
27. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — and confirmation that only Scenes 1 and 2 were authored
2. **Scene 1's two lead candidates** — verbatim, with emphasis, risk, recommendation and
   second choice
3. **All authored copy from both scenes**, verbatim, so it can be reviewed and edited
4. **Scene 1's composition** — the Room-on-Stage treatment, the measure used, and what
   restraint was applied
5. **Scene 2's composition** — the central visual idea, how the constant element is made
   legible, and why it reads as an exhibit rather than a grid
6. **The boundary confirmation** — paste the boundary sweep and the full list of rendered
   strings
7. **The constancy copy** — the text that carries the claim for non-visual visitors
8. **Brand-frame invariance evidence** across the six specimens
9. **Grayscale results** — honest report, including any subjects that collapse
10. **Contrast measurements** on `/`, six subjects × two themes
11. **Motif budget totals** for `/` against ceilings, and any coverage reduced
12. **Payload, WebGL absence, LCP element and value, CLS**
13. **Scroll budget** actual vs declared, and any overrun flagged as a defect
14. **Mobile resolution of the six specimens** at 320 and 390
15. **Keyboard and screen-reader results**, including the reading order
16. **Narrative redundancy check** result with recommendation
17. **Whether the audit harness extension to `/` surfaced anything previously unknown**
18. Anything deferred, and confirmation nothing was half-built
19. Confirmation nothing outside Scenes 1–2 was changed

---

### STOP

End after the report. Do not begin Step 4.4 (Scene 3 — The Choice) or any other scene.
