# TUTORS ACADEMY — Phase 3 · Step 7
## The Re-skin Validation Gate

> **This step is primarily verification, not construction.** Its output is proof.
>
> Depends on every step of Phases 2 and 3. Read the whole system before starting.
>
> **This closes Phase 3. After this, the subject system is certified — or it is fixed
> until it is.**
>
> **Boundaries:** fixes are permitted, but **only defect fixes — never redesigns.**
> No new features, no new surfaces, no new tokens, no new visual direction.

---

### WHY THIS STEP EXISTS

By now the subject system touches everything: tokens, typography, motion, layout,
primitives, nav, marks, motifs, the switch, the ambient layer, and the routes.

Six subjects × every primitive × two themes × two densities × four degradation tiers is a
combinatorial surface nobody can hold in their head. So it gets **checked by machine**,
recorded as a **baseline**, and **re-checked** after every future phase.

> **The rule for this step: fix defects now; anything unfixable gets recorded with a reason
> and a destination phase. There is no "known issue" limbo.**

---

### FIRST: INSPECT

1. The **complete** deferred register accumulated since Phase 2 (every "deferred" note in
   every step report). Consolidate it — do not trust memory.
2. The **guard test**, the **subject validator**, and the **draft guard** from 3.1 — all
   three must still be intact after six steps of building on top of them.
3. The `/dev/*` route inventory — which exist, and which are correctly gated.
4. The **snapshot of every public route** that currently exists.
5. Any **existing test, lint or CI setup** — extend it rather than inventing a parallel one.

Report findings before building anything.

---

### DELIVERABLE 1 — THE AUDIT HARNESS (`/dev/audit`, dev-only)

A single dev-only route presenting the full matrix **live**, with pass/fail computed rather
than eyeballed. Gated behind `NODE_ENV !== 'production'`.

**Dimensions the harness must cover:**

| Dimension | Values |
|---|---|
| Subject | all six |
| Theme | dark · light |
| Density | comfortable (Stage) · compact (Room) |
| Layer | Stage · Room |
| Degradation tier | full · reduced · short · instant |
| Viewport | 320 · 768 · 1280 · 1920 |

**What the harness renders per cell:**
- every primitive in its states (Button all variants/states, Card variants, Input states,
  Progress determinate/indeterminate)
- surface, text, border and accent usage
- the relevant motif role
- nav in the correct mode

**What the harness computes and displays:**
- **measured contrast** for every text/surface pairing
- **focus-ring visibility** on every interactive element, including accent-filled surfaces
- **touch-target dimensions** for every interactive element
- **CLS** per cell
- a **pass/fail summary** — failures visible, never summarised away

---

### DELIVERABLE 2 — THE BASELINE FILE (committed)

A machine-readable snapshot committed to the repo so future phases can **diff against it**.

Must contain:
- per-subject validator output (contrast ratios, accent-vs-brass, accent-vs-signal,
  mutual-distinctness matrix)
- per-subject **motif determinism hashes**
- per-subject **motif budgets** (path commands, DOM elements, generation time)
- bundle sizes and **chunk boundaries** (initial payload, ambient/3D chunk, per-route splits)
- per-route **CLS and first-paint metrics**
- per-subject **ambient layer status** (enabled/available/fallback tier)
- **accessibility audit scores** per route
- the **deferred register** (Deliverable 4)

**Plus a documented re-run command** so any future phase can regenerate and compare in one
action. Report the exact command.

---

### DELIVERABLE 3 — THE HONESTY AUDIT

Ten steps of building is where fake conveniences creep in. **Sweep for them and report every
finding.**

Check and report:
1. **Fake functionality** — buttons, links, toggles or controls that appear functional but do
   nothing, or that do something only visually.
2. **Fake data** — any invented tutor, student, class, schedule, progress value, or name that
   could be mistaken for real.
3. **Unlabelled placeholders** — any "coming soon" region not clearly marked as such, or any
   empty state that reads as a broken feature rather than a deliberate state.
4. **Silent failures** — error paths that show nothing, or that show something misleading.
5. **Pretend auth** — anything implying a signed-in state that does not exist.
6. **Dead routes** — navigation destinations that lead nowhere or 404 unintentionally.
7. **Non-functional search or filters** — any search affordance that is not real.
8. **Hardcoded values that should be tokens** — re-check across the whole codebase.
9. **Unused code** — components, tokens, exports, or styles built speculatively and never used.
10. **Half-built features** — anything started and not finished, with its intended phase.

**For every finding:** state what it is, where it is, and either fix it or record it with a
destination phase. **A half-built feature that ships is worse than one never started.**

---

### DELIVERABLE 4 — THE DEFERRED REGISTER (consolidated)

One document listing **everything consciously deferred** across Phases 2 and 3, each with:
- what it is
- why it was deferred
- which phase it belongs to
- what it depends on

This becomes standing reference. Deferred work that is not tracked becomes forgotten work —
and forgotten work is what shows up as a gap in a demo.

---

### THE VERIFICATION MATRIX

Every row must be executed and reported with **evidence**, not assertion.

**Brand integrity**
1. **Brand-frame invariance** — across all six subjects, both themes, both densities: mark,
   wordmark, lockup, type scale, nav shell, button geometry are **pixel-identical**.
   Accents change; nothing else does. Report the verification method and any leak found.
2. **One brand** — no subject reads as a different product. Report any subject that does.

**Subject system integrity**
3. **Validator** — passes for all six. Still fails loudly when deliberately broken. Re-prove it.
4. **Guard test** — still blocks direct subject-config imports. Re-prove it.
5. **Draft guard** — still blocks draft subjects at route level. Re-prove it.
6. **Motif determinism** — regenerate each motif; hashes identical to the 3.3 baseline.
7. **Motif budgets** — all six still within path-command, DOM and generation-time ceilings.
8. **`motionChar` distinctness** — confirm each subject's movement character is genuinely
   distinguishable from the others, drawn only from the 2.3 grammar. Report honestly if two
   subjects feel alike.
9. **Five levers** — for each subject, confirm accent, atmosphere, motif, motion character and
   density all actually take effect. Report any lever that is declared but has no visible
   effect. **A declared-but-inert lever is a defect.**

**Accessibility**
10. **Contrast** — all text/surface pairings, six subjects × two themes. Measured ratios.
11. **Focus ring** — visible on every interactive element across all six subjects and both
    themes, including on accent-filled surfaces. Screenshot evidence.
12. **Reduced motion** — all four degradation collapses to instant/off across all six
    subjects. Nothing invisible, nothing broken, announcements still fire.
13. **Keyboard** — full tab pass on every route and every state.
14. **Screen reader** — reading order, landmarks, headings, announcements. Report the outline
    for one full subject route.
15. **Zoom 200% and 400%** (WCAG 1.4.10) — every route and state.
16. **Text spacing** (WCAG 1.4.12) — every route and state.
17. **Touch targets** — ≥44×44, ≥8px gaps, at 320px across all subjects.
18. **Accessibility audit** — axe/Lighthouse on every route, every subject, both themes.
    Report every violation, including minor.

**Performance**
19. **Route performance** — per subject: first paint with ambient absent, then present.
    CLS across ambient arrival.
20. **Bundle** — initial payload, ambient/3D chunk isolation, per-route splits. Confirm the
    ambient chunk still does not load for Room-only renders.
21. **Subject switching** — all tiers, all subjects. Worst frame time, long tasks over 50ms.
22. **Resource hygiene** — repeat the 30× mount/unmount disposal check. No leaks.
23. **Off-screen and backgrounded** — ambient fully stops. Re-verified at route level.
24. **No-JS** — every subject route renders complete and correct without JavaScript.
25. **No-WebGL** — every subject route renders complete and correct without WebGL.
26. **Hydration** — zero warnings across every subject route and every dev route.

**Regression protection**
27. **Baseline captured** — the Deliverable 2 file is committed, and the re-run command is
    documented and **verified to work**.

---

### CONSTRAINTS

- **Fixes are permitted — but only defect fixes.** **No redesigns.** No new visual direction,
  no "while I was in there" improvements.
- **Every change made in this step must be listed**, with the defect it resolves.
- **No new features, surfaces, routes or tokens.**
- **Do not modify** the schema's closed enum sets, the brand frame, the mark language spec, the
  motif grammar's structure, or the switch's state machine — unless a **blocker** defect
  requires it, in which case **report before changing**.
- **Do not paper over failures.** A failing check that is reported honestly is a **good**
  outcome for this step. A passing summary that hides a failure is a **defect**.
- Do not touch production routes beyond defect fixes.
- No new dependencies.
- Do not begin Phase 4 or the homepage.

---

### DO NOT CHANGE

- Token architecture, type system, motion grammar, spatial system (2.1–2.4)
- Primitive APIs (2.5) — fix defects, do not redesign
- Brand mark, wordmark, lockup, favicon, nav shell structure (2.6)
- Subject schema enum sets, validator rules, scoping, guard test (3.1)
- Mark language spec and mark geometry (3.2)
- Motif grammar primitives, roles, budgets (3.3)
- Switch state machine, tiers, ceremony rationing (3.4)
- Ambient lifecycle rules, safety caps, degradation inputs (3.5)
- Route structure and the honest placeholder approach (3.6)
- Existing routes, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **Run the full verification matrix** — all 27 rows. Report each with evidence.
2. **Deliberately break three things and confirm the harness catches each**: an accent that
   fails contrast, a direct subject-config import, and a draft subject routed in production.
   Revert all three. Paste the failures. **This proves the gate is real.**
3. **Re-run the baseline command** — confirm it regenerates and diffs cleanly against the
   committed baseline.
4. **Production build** succeeds, with `/dev/audit` absent or 404.
5. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — with **every defect fix listed against the defect it resolves**
2. **The audit harness** — what it covers and how pass/fail is computed
3. **The committed baseline** — its contents, location, and the exact re-run command
4. **The verification matrix** — all 27 rows, each with evidence
5. **The honesty audit** — every finding, fixed or recorded with a destination phase
6. **The deferred register** — consolidated, with phase attributions
7. **The three deliberate failures** — pasted output proving the gate catches them
8. **Brand-frame invariance evidence** across all six subjects
9. **Lever effectiveness** — each of the five levers confirmed live per subject, or reported inert
10. **`motionChar` distinctness** — honest assessment of any two subjects that feel alike
11. Blocker defects found and fixed, with the change made
12. Defects recorded but not fixed — with reason and destination phase
13. Audit results across all routes and subjects
14. Performance numbers — route, bundle, switching, hygiene
15. Confirmations: no redesigns; no features built; no fake functionality remaining; production
    build clean; dev routes gated
16. Anything that could **strand a student** in a broken state — report it even if it is out of
    scope, and record it

---

### PHASE CLOSE

This step closes Phase 3. End with an explicit statement of:

- **Phase 3 status: certified / certified with recorded defects**
- the **top three risks** carried into Phase 4
- confirmation that the subject system is **fit for the homepage to be built on top of it**

Do not begin Phase 4.
