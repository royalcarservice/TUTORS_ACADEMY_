# TUTORS ACADEMY — Phase 4 · Step 9
## The Whole-Page Pass — Phase 4 Gate

> **This step is primarily verification, not construction.** Its output is proof.
>
> Depends on every step of Phase 4 and all of Phase 3. **Read the whole system before starting.**
>
> **This closes Phase 4.** After this, `/` is certified as the front door — or it is fixed until
> it is.
>
> **Boundaries:** defect fixes are permitted. **No redesigns.** No new scenes, no new sections, no
> new tokens, no new visual direction. **And no scene may be cut in this step** — if a scene should
> not exist, that is a *recommendation* with evidence, not a change made here.

---

### WHY THIS STEP EXISTS

Nine scenes were built across eight steps. **Every one was verified in isolation.** Nobody has
checked the seams.

The risks that only exist at the whole-page level:

- **Cross-scene drift** — eight independent judgement calls about accent usage, spacing rhythm,
  heading structure, and the honesty treatment.
- **Cumulative budgets** — six of nine scenes carry subject scopes. Per-scene costs were reported;
  the **total** never was.
- **Two untested failure modes: the second pass and the fast skim.** One-shot reveals are correct
  by design (2.3) — but what does the page do when the visitor scrolls it a **second** time, or
  **flicks through fast**?
- **The arc, read end to end** — pairs were checked; the whole journey never was. Including whether
  **the same claim got made three times** by scenes written weeks apart.
- **CTA hierarchy as a set** — four scenes contain actions. Each verified its own; nobody checked
  whether they compete.
- **Nine scenes on a phone.**

**This step finds exactly those.**

---

### FIRST: INSPECT

1. **The complete deferred register** consolidated in 3.7, **plus every "deferred" note from
   Steps 4.1–4.8**. Consolidate again — do not trust memory.
2. **The committed baseline** from 3.7, and **the audit harness** — both are extended here.
3. **The scene contract for all nine scenes** — actual vs declared `scrollBudget` for each, the
   `sticky-stage` claimant (Scene 4), the `sequence` claimant (Scene 6), and every `status` value.
4. **Every `/dev/*` route** — confirm all are correctly gated.
5. **The `/subjects` scaffold** — its current state and whether it is still coherent now that
   Scene 3 is the real chooser.
6. **Existing test, lint and CI setup** — extend, never invent a parallel one.

Report findings before building anything.

---

### DELIVERABLE 1 — THE HARNESS, EXTENDED TO FULL-PAGE COVERAGE

The 3.7 harness audits primitives and subjects. **It does not yet audit a nine-scene page.**
Extend it — do not build a second harness.

**New coverage required:**

- **A full-page audit mode** that scrolls `/` end to end and captures, per scene: contrast for
  every text/surface pairing, focus visibility, touch targets, CLS contribution, and the scene's
  actual scroll extent.
- **A cross-scene consistency panel** that compares, side by side:
  - heading levels and outline across all nine scenes
  - type-step usage — **is any scene using a step no other scene uses?**
  - spacing rhythm — the actual section spacing rendered per scene
  - the **honesty treatment**: which scenes use it, in what form, with what wording
  - accent usage — where subject accent appears, and where it must not
- **A pass/fail summary for the page as a whole**, not only per section.

---

### DELIVERABLE 2 — THE BASELINE, UPDATED

Extend the committed baseline (do not rewrite it). Add:

- **Per-scene `scrollBudget`: declared vs actual**, and the page total against its ceiling.
- **Total motif budget** for `/` — path commands, DOM elements, generation time — against the
  3.3 ceilings.
- **Total word count and measured reading time.**
- **Full-page metrics:** LCP element and value, CLS across a complete scroll, longest task, and
  full-scroll frame timings.
- **Per-scene accessibility audit scores**, plus the whole-page score.
- **The CTA inventory** across all four scenes that contain actions.
- **The updated deferred register.**

**Re-run command documented and verified to work.** Report it.

---

### DELIVERABLE 3 — THE SECOND-PASS AND SKIM CHECKS

**Two failure modes that per-scene verification cannot catch.**

**A. The second pass.**
- Scroll `/` completely, then scroll back to the top and **through it again.**
- **Report what a repeat visitor sees.** One-shot reveals have already fired — so:
  - Is the page still **coherent**, or does it read as a series of dead containers?
  - Does anything look **broken or empty** on the second pass?
  - Does the `sequence` scene (Scene 6) still function when its beats have already been seen?
  - Does the `sticky-stage` scene (Scene 4) behave correctly when re-entered from below?
  - **Does Scene 7's journey device still read correctly** when its reveal has already fired?
- **Report honestly.** A page that is beautiful once and broken on the second scroll is a defect,
  not a style choice.

**B. The fast skim.**
- Flick through `/` at speed — trackpad flings, keyboard `End`, fast scrollbar drag.
- **Report:**
  - Does anything **break, stack, or queue badly**?
  - Do reveals **pile up** into a stuttering mess?
  - Does the sticky scene **release cleanly** when scrolled through fast?
  - Does anything **flash, jump, or shift** under fast scroll?
  - Does the page settle correctly when the skim stops abruptly?
- **Report the frame timings during a fast skim**, and any long task over 50ms.

---

### DELIVERABLE 4 — THE ARC, READ AS A WHOLE

**This is the narrative equivalent of the consistency panel, and it is qualitative.**

Read `/` end to end, as a first-time visitor, and report:

1. **Duplicate claims.** Nine scenes were written weeks apart. **List every claim made more than
   once**, and where. Repetition was forbidden pairwise (Scenes 2/3, 3/4, 7/8) — **this checks
   the whole arc** for the same idea landing three times.
2. **Narrative breaks.** Where does the story **not** flow? Report any seam where the reader is
   dropped rather than handed on.
3. **The pairwise boundaries, re-checked in sequence:**
   - Scene 2 (specimen) vs Scene 3 (choice) — still distinct when read consecutively?
   - Scene 3 (choice) vs Scene 4 (crossing) — still distinct?
   - Scene 7 (peak) vs Scene 8 (exit) — do the two kinds of quiet still read differently?
   - Scene 5 (people) vs Scene 6 (practice) — do they read as two scenes or as one long one?
4. **Attention.** Where does it drop? Give the specific scroll position or scene.
5. **What could be cut.** **Name the scene**, with evidence. **Recommend only — do not cut it.**
6. **Does the ending earn the beginning?** Answer plainly, referencing Scene 0 and Scene 8.
7. **Reading time.** Measured, against a stated reasonable ceiling for a marketing page.
   **Report whether the page is too long**, with a specific recommendation.
8. **The mobile experience of the whole page.** Nine scenes on a 390px screen — is the page
   **exhausting**? Report the total scroll length on mobile in screens, and whether the page's
   structure holds at that length.

---

### DELIVERABLE 5 — THE CTA HIERARCHY, AS A SET

Four scenes contain actions: **0, 3, 4, 8.**

- **Inventory every action** on `/` — its label, its destination, its variant, and its scene.
- **Report the hierarchy as a whole.** Do they form a coherent progression, or do they compete?
- **Confirm exactly one `primary` is visible at any scroll position** across the entire page.
  **Test by scrolling through and recording every element that renders as `primary` at each
  position.**
- **Confirm every destination resolves.** Paste the list with status codes.
- **Confirm the labels are coherent** — the same verb or a deliberate variation, never two verbs
  for the same act.

---

### DELIVERABLE 6 — THE HONESTY AUDIT, ACROSS THE PAGE

Ten steps of building is where fake conveniences creep back in. Sweep `/` end to end:

1. **Fake functionality** — any control that appears functional but does nothing.
2. **Fake data** — any invented name, count, statistic, schedule, date, rating, or progress value.
3. **Unlabelled placeholders** — any "coming soon" region not clearly marked.
4. **Treatment inconsistency** — the honesty treatment applied differently across scenes. **Report
   every variation.**
5. **Silent failures** — error paths showing nothing or something misleading.
6. **Pretend auth** — anything implying a signed-in state that does not exist.
7. **Dead links and routes** — every link on `/` and from it.
8. **Non-functional affordances** — any search, filter, or control that is not real.
9. **Hardcoded values that should be tokens** — across the whole page.
10. **Unused code** — components, tokens, exports or styles built speculatively and never used.
11. **Half-built features** — anything started and not finished, with its intended phase.

**For every finding:** state what it is, where it is, and either fix it or record it with a
destination phase. **A half-built feature that ships is worse than one never started.**

---

### THE VERIFICATION MATRIX

Every row executed and reported **with evidence**, not assertion.

**Whole-page integrity**
1. **Cross-scene consistency** — heading outline, type-step usage, spacing rhythm, treatment
   application, accent usage. **Report every inconsistency found.**
2. **Scroll budget** — per scene declared vs actual, and the page total against its ceiling.
   **Report any overrun as a defect, not as an edit to a declaration.**
3. **Motif budget** — total for `/` against the 3.3 ceilings.
4. **The `sticky-stage` scene** — still the only one; releases cleanly; no scroll-jacking.
5. **The `sequence` scene** — still the only one; works on the second pass and under reduced
   motion.
6. **Spine reorderability** — reorder scenes on the dev route; confirm the page renders in the new
   order with **no component edits**, and that the **footer does not move**.

**Performance**
7. **LCP** — element and value, on desktop and throttled mid-range.
8. **CLS** — across a complete scroll of `/`. Report every contributing element.
9. **Long tasks** — full scroll, desktop and throttled. Report anything over 50ms.
10. **Fast skim** — frame timings, stacking behaviour, settling.
11. **Bundle** — initial payload, per-route splits, and **confirm the WebGL chunk is absent from
    `/`'s network waterfall**.
12. **Page weight** — total transfer for `/` on first load, uncached.

**Accessibility**
13. **Full-page keyboard pass** — page start to page end, no traps, no dead stops, correct order.
14. **Focus visibility** — every focusable element on `/`, both themes.
15. **Reading order** — the whole page, confirming the visual order and DOM order agree in intent.
16. **Heading outline** — one `h1`, correct nesting, no skips, across all nine scenes.
17. **Landmarks** — `main`, `nav`(s) with distinct labels, `footer`, and the story regions.
18. **Contrast** — every text/surface pairing, both themes.
19. **Reduced motion** — the entire page, complete and ordered, with all motion removed.
20. **Zoom 200% and 400%** (WCAG 1.4.10) — the whole page.
21. **Text spacing** (WCAG 1.4.12) — the whole page.
22. **Touch targets** — every interactive element at 320px.
23. **Grayscale** — the whole page remains readable and states remain distinguishable.
24. **Audit** — axe/Lighthouse on `/`, both themes, plus every `/dev/*` route. **Report every
    violation, including minor.**

**Robustness**
25. **No-JS** — the entire page renders complete and correct, in order, navigable.
26. **No-WebGL** — same.
27. **Hydration** — zero warnings across `/` and every `/dev/*` route.
28. **Second pass** — Deliverable 3A.
29. **Fast skim** — Deliverable 3B.
30. **Slow network** — throttled slow-3G: report what a visitor sees, and whether the page is
    usable while it arrives.
31. **The `/subjects` scaffold** — still resolves, still coherent, still not competing with
    Scene 3. Report its status and whether it should change (recommend, do not change).
32. **Baseline updated and re-run command verified.**

---

### CONSTRAINTS

- **Fixes are permitted — but only defect fixes.** **No redesigns.** No new visual direction, no
  "while I was in there" improvements.
- **Every change made in this step must be listed**, with the defect it resolves.
- **No scene may be cut in this step.** A scene that should not exist is a **recommendation with
  evidence**, not a change.
- **No new scenes, sections, routes or tokens.**
- **Do not modify** the scene contract's enum values, the subject system, the brand frame, the
  motion grammar, or the switch's state machine — unless a **blocker** defect requires it, in
  which case **report before changing**.
- **Do not paper over failures.** A failing check reported honestly is a **good** outcome here.
  A green summary that hides a failure is a **defect**.
- No new dependencies.
- Do not begin Phase 5.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitive APIs (2.5) — fix defects, do not redesign
- Brand mark, wordmark, lockup, favicon, nav shell structure (2.6)
- The entire subject system (3.1–3.6) — fix defects only
- The committed baseline (3.7) — **extend, do not rewrite**
- The scene contract, scene sequence, scroll grammar, voice document, honesty treatment (4.1)
- Scenes 0–8 and the scene availability amendment (4.2–4.8)
- Existing routes, layouts, copy — beyond defect fixes
- Any working build or deploy setup

---

### SPECIMEN ROUTE — `/dev/page` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Required:

- **The full-page harness view** — per-scene and whole-page pass/fail, live.
- **The cross-scene consistency panel** — outline, type steps, spacing, treatment, accents, shown
  side by side.
- **A second-pass player** — a control that scrolls `/` through once, then again, so the
  second-pass behaviour is observable without manual scrolling.
- **A skim player** — a control that performs a fast scroll-through and reports frame timings.
- **The CTA inventory** — every action on `/`, with variant, label, destination and status code.
- **The page-level budget readout** — scroll budget per scene and total, motif budget, word count,
  reading time, payload, CLS, LCP.
- **The arc report** — Deliverable 4, rendered as readable prose.
- **The honesty audit findings**, fixed or recorded.
- **The updated deferred register.**
- A visible note stating **what this step verified vs. what it recommended**.

---

### TEST (all required)

1. **Run the full verification matrix** — all 32 rows. Report each with evidence.
2. **Deliberately break four things and confirm the harness catches each:**
   (a) an accent that fails contrast in one scene,
   (b) a duplicated `primary` visible at one scroll position,
   (c) a scene whose actual `scrollBudget` blows the page total,
   (d) a dead link in the footer.
   **Revert all four. Paste the failures. This proves the gate is real.**
3. **Re-run the baseline command** — confirm it regenerates and diffs cleanly against the
   committed baseline.
4. **Production build** succeeds, with `/dev/page` absent or 404.
5. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — with **every defect fix listed against the defect it resolves**
2. **The extended harness** — new coverage, and how pass/fail is computed at page level
3. **The updated baseline** — what was added, location, and the verified re-run command
4. **The verification matrix** — all 32 rows, each with evidence
5. **Cross-scene consistency findings** — every inconsistency, fixed or recorded
6. **Scroll budget and motif budget** — per scene, and page totals against ceilings
7. **The second-pass report** — what a repeat visitor sees, honestly
8. **The skim report** — stacking, settling, frame timings
9. **The arc report** — duplicate claims, narrative breaks, attention, what could be cut, whether
   the ending earns the beginning, and **whether the page is too long**
10. **The mobile experience of the whole page** — total scroll length in screens, and the verdict
11. **The CTA inventory and hierarchy** — every action, and whether they compete
12. **The honesty audit** — every finding, fixed or recorded with a destination phase
13. **The four deliberate failures** — pasted output proving the gate catches them
14. **Accessibility results** — full-page keyboard, focus, contrast, screen reader, zoom, spacing
15. **Performance numbers** — LCP, CLS, long tasks, payload, bundle, WebGL absence
16. **Robustness results** — no-JS, no-WebGL, hydration, slow network, second pass, skim
17. **The `/subjects` scaffold** — status and recommendation
18. **Confirmations:** no redesigns; no scenes cut; no fake functionality remaining; production
    build clean; dev routes gated
19. **Anything that could strand a visitor in a broken state** — report it even if out of scope

---

### PHASE CLOSE

End with an explicit statement of:

- **Phase 4 status: certified / certified with recorded defects**
- **The top three risks carried into Phase 5**
- **A plain answer to one question: is `/` ready to be the front door?**
  If the honest answer is no, **say so, and state what stands between it and yes.** A gate that
  can only return "certified" is not a gate.
- **The recommended Phase 5 entry point** — and whether anything from this gate should be
  addressed first.

Do not begin Phase 5.
