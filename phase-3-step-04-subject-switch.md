# TUTORS ACADEMY — Phase 3 · Step 4
## The Subject Switch

> Depends on Steps 3.1 (schema), 3.2 (marks), 3.3 (motif grammar). Read all three first.
>
> **This is the signature moment of the product.** It is a transition *system*, not a
> visual effect. Build it as orchestration, not as a pile of concurrent tweens.
>
> **No routing.** This step builds the switch as a system operating on the subject state
> from 3.1, demonstrated on a dev route. Wiring it to routes and navigation is Step 3.5.

---

### WHY THIS STEP EXISTS

> "The student chooses a subject. That subject becomes an environment."

This is the moment the product stops being a website. If it lands, Tutors Academy is
unmistakable. If it is built as a crossfade, the best idea in the product gets spent on
a shrug.

So it is built with the same rigour as the live-class system: explicit states, defined
interrupt behaviour, hard budgets, and an honest degradation ladder.

---

### THE FOUR LOCKED DECISIONS

**1. It is a STATE MACHINE, not a set of concurrent animations.**

Four phases. Every phase has an explicit entry condition, work, exit condition, and
abort behaviour:

```
IDLE
  ↓ trigger (subject selection)
PREPARE   — destination environment generated / verified ready. NO visual movement yet.
  ↓ ready  (or budget exceeded → short-circuit, see below)
QUIESCE   — outgoing: ambience pauses, outgoing emphasis stops. Brief. Content still readable.
  ↓
TRANSFER  — the morph. Accent + motif material move from outgoing to incoming.
  ↓
ARRIVE    — incoming: structure establishes, identity (mark, name) resolves.
  ↓
SETTLE    — ambience resumes, focus + announcement finalise, state machine returns to IDLE.
```

**Rules:**
- **No phase may be skipped except by degradation** (see decision 4).
- **The machine always converges.** There is no state in which the interface can be left
  mid-transition, blank, or unresponsive. Prove this.
- **Total budget: ≤ 700ms** from trigger to SETTLE, and **the content is interactive no
  later than ARRIVE.** The transition decorates arrival; it never gates reading.

**2. The destination exists BEFORE the transition begins.**

You cannot animate into a blank.

- During PREPARE, the incoming environment must be **generated and present** (motif data
  from 3.3 is deterministic and cheap — use that rather than waiting on a network).
- **If preparation exceeds its budget, the transition SHORTENS — it never holds a frozen
  frame and never shows a spinner.** The user gets a fast, unceremonious arrival.
- **If preparation fails entirely** (error, unsupported), fall back to an **instant swap**
  with a visible, honest state. No infinite spinner, no silent dead end.

**3. Two different colour-shift techniques — do not mix them up.**

- **Full-bleed surfaces:** **layered opacity crossfade** between two pre-rendered layers.
  Do NOT interpolate accent custom properties across a full-viewport surface — that
  repaints the entire screen every frame and is the classic cause of a stuttering
  "cinematic" moment.
- **Small elements** (mark, name, accents on controls and borders): **true accent
  interpolation** is permitted, because the painted area is small.

State which technique is used where, and report measured frame timings for both.

**4. Ceremony is rationed across the SESSION, not just per view.**

- **First entry into a subject in a session** → the **full** arrival.
- **Subsequent switches** → a **shortened** variant (a defined fraction of the full budget).
- **Rapid repeat switching** → the shortest form. A student comparing subjects must never
  be made to sit through the ceremony repeatedly.
- Track this per session, and document the rule in code.

Repeating a 700ms ceremony on every switch turns the best moment in the product into
friction. That is the failure this decision exists to prevent.

---

### THE MORPH — what actually transforms

Use the `morph` preset from Step 2.3. **Do not invent new animation vocabulary.**

**The intent:** the environment does not *cut* to another subject, it **becomes** it. The
continuity anchor declared in the 3.1 schema as `morphTarget` is the element that persists
across the switch and visually carries the change.

**Preferred approach — grammar-parameter interpolation (use where it works):**
Because all six motifs (3.3) emit from the same primitive vocabulary, the switch may
interpolate **grammar parameters** — density, angle distribution, curvature, band counts,
node valence weighting — with per-motif weights travelling 1 → 0 and 0 → 1. This produces a
genuine transformation rather than a crossfade. It is the distinctive version of this
interaction; prefer it where the primitives are shared.

**Bound it:**
- Interpolation must be **deterministic** — no randomness, ever. Time-driven only.
- It must stay under the 3.3 path-command and DOM budgets. **If interpolation would exceed
  budget, use the layered crossfade for that pair instead** — and report which pairs fell
  back and why.
- It must be **compositor-friendly** where possible. Where geometry must be recalculated,
  state the cost and prove it stays inside the frame budget.

**The brand frame does not move.** The mark, wordmark, nav shell, type and button geometry
are **untouched** during the switch. Only the environment changes. This is the brand-frame
rule from 2.6 and it is absolute.

---

### INTERRUPTION — the part that gets skipped

Define and **prove** behaviour for each:

| Situation | Required behaviour |
|---|---|
| **New trigger mid-flight** | **Retarget** from the *current visual state* to the new destination. Do not queue multiple transitions. Do not snap back to the start. |
| **Repeated rapid triggers** | Converge cleanly. The last selection always wins. No flicker, no accumulating timers. |
| **Navigate away mid-flight** | Abort cleanly: stop work, release listeners, cancel pending generation. **No orphaned rAF loops or observers.** |
| **Tab backgrounded mid-flight** | The switch must not "finish" invisibly and dump the user into an unannounced state. Pause and resolve on return, or complete instantly — pick one, document it, and prove it. |
| **Trigger during reduced motion** | Instant state change. No animation. Full function. |
| **Trigger while offline / failing** | Honest fallback state. No spinner, no dead end. |

---

### ACCESSIBILITY — non-negotiable

- **The change is announced.** With reduced motion the visual transition is gone, so the
  change must be conveyed in text: a polite live-region announcement such as
  *"Now entering Physics — The Field."* **Without this, the most important navigation event
  in the product is silent.**
- **Focus is managed deliberately.** If the switch was triggered by navigation, focus lands
  on the new environment's identity (the heading). If triggered *inline* (a preview panel,
  a chooser on the same page), **focus stays where it was** — do not yank it.
- **Fully keyboard operable**, with the trigger carrying an accessible name and state.
- **No motion carries information alone.** Anything the transition communicates must also
  be present as text, focus, or state.
- **The transition never reduces content availability** — text is present and readable
  throughout QUIESCE and TRANSFER.

---

### DEGRADATION LADDER (enforced, in this order)

1. **Full** — grammar morph + atmosphere + ambience. Desktop-class devices only.
2. **Reduced** — layered crossfade + accent interpolation on small elements, ambience off.
   Default for mid-range and mobile.
3. **Short** — a single fast crossfade, well under the budget.
4. **Instant** — state swap plus announcement. For reduced-motion, low-power, failing
   preparation, or rapid repeat switching.

Selection inputs must be explicit and measurable: `prefers-reduced-motion`, device class /
hardware concurrency where available, measured frame health, preparation success, and
session ceremony count. **Report the exact selection logic and the thresholds used.**

---

### SPECIMEN ROUTE — `/dev/switch` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Required:

- A **live subject switcher** triggering the full transition, with all six subjects.
- **Frame timing readout** during the transition — so stutter is visible, not assumed away.
- **A phase indicator** showing which state the machine is in, updating live. This is how
  the orchestration is verified rather than trusted.
- **An interruption panel:** buttons for "switch again mid-flight", "switch 5× rapidly",
  "abort", and "background the tab" — with observed results shown.
- **A degradation control** forcing each tier (full / reduced / short / instant), so all four
  are verifiable without changing OS settings or hardware.
- **A reduced-motion toggle**, showing the transition and the announcement side by side.
- **The announcement transcript** printed live, so it is visible that the change is
  conveyed in text.
- **A side-by-side "brand frame unchanged" panel** — the mark, nav and type visibly
  static while the environment transforms.
- A visible note stating **what is real vs. deferred** (route integration is Step 3.5;
  ambience and 3D are Step 3.5/Phase 4).

---

### CONSTRAINTS

- **No routing integration.** Operate on subject state; Step 3.5 wires routes.
  **Critically: the design must not preclude CSS-only, no-JS correctness.** On a direct
  load of a subject route, the correct environment must render server-side with **no**
  transition. The switch is progressive enhancement over a server-rendered state.
- **No new animation vocabulary.** Only the 2.3 grammar, composed.
- **No new colours, tokens, or primitives.**
- **No new dependencies** — no animation libraries beyond what already exists, no
  spring/tween packages. If the existing motion tooling cannot express this, **stop and
  report** rather than adding a dependency.
- Do not modify the schema, validator, marks, or motif grammar.
- Do not touch the existing `/dev/*` routes.
- Do not build the homepage or any subject route.
- No scroll-jacking. No page-level transitions. No route-change animation.
- Do not fake ambience or 3D — those are later steps.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitives and their APIs (2.5)
- Brand mark, wordmark, lockup, nav shell (2.6)
- Subject schema, validator, scoping, guard test, `/dev/subjects` (3.1)
- The six marks, mark language spec, `/dev/marks` (3.2)
- The motif grammar, roles, budgets, `/dev/motifs` (3.3)
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **Frame timing** — run each transition tier with a live frame readout. Report worst
   frame time and any long task over 50ms, on desktop **and** a throttled mid-range profile.
2. **Total budget** — measure trigger → interactive, and trigger → SETTLE, per tier. Report
   against the ≤700ms budget. Report the shortened and shortest variants too.
3. **Interruption matrix** — execute every row of the interruption table and report observed
   results. Include: 5 rapid switches; abort; navigation away mid-flight; tab backgrounded
   mid-flight.
4. **No orphans** — after 20 switches and 5 mid-flight aborts, confirm no accumulating
   listeners, rAF loops, timers, or observers. Report how you measured it.
5. **Convergence proof** — attempt to leave the interface mid-transition in every phase.
   Confirm it always resolves. Report any state that could strand the user.
6. **Preparation failure** — force preparation to fail and to be slow. Confirm the honest
   fallback and the shortened path both behave. Paste the observed behaviour.
7. **Reduced motion** — with OS reduced motion: instant swap, full function, **and the
   announcement fires**. Screenshot and paste the announcement.
8. **Announcement** — verify the live region is polite, not interrupting, and does not
   double-announce. Report tool and output.
9. **Focus** — verify the two focus rules (navigation-triggered vs inline-triggered). Report
   observed focus target for both.
10. **Brand-frame invariance** — during a transition, confirm mark, nav, type and button
    geometry are pixel-identical. Describe the verification method.
11. **Determinism** — run each transition 50 times; the *destination* geometry is identical
    every time. Paste the hash comparison.
12. **Hydration** — direct load of a subject state renders correctly with **no** transition
    and **no** hydration warnings. Report the console output.
13. **No-JS correctness** — confirm the environment renders correctly server-side without
    client JS. Report how you verified.
14. **Both themes** — transitions in dark and light.
15. **Mobile 320px** — transition runs in an appropriate tier, no jank, no overflow.
16. **Zoom 400% + text-spacing overrides** — nothing breaks during or after a switch.
17. **Audit** — axe/Lighthouse on `/dev/switch` across all six subjects and all four tiers.
    Score + every violation.
18. **Production build** succeeds; `/dev/switch` absent or 404 in production.
19. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified
2. **The state machine** — phases, entry/exit conditions, abort behaviour, as implemented
3. Which colour technique is used where, and why
4. The morph approach — grammar-parameter interpolation or layered crossfade — **per subject
   pair**, and any pairs that fell back, with reasons
5. The `morphTarget` continuity anchor used
6. **The ceremony-rationing rule** as implemented (first entry vs subsequent vs rapid)
7. The degradation ladder and the **exact selection logic + thresholds**
8. The full interruption matrix results
9. Frame timings and total budget per tier — measured numbers
10. Orphan-resource verification method and result
11. Preparation success / slow / failure behaviours
12. The announcement implementation and the observed transcript
13. Focus behaviour for both trigger types
14. Brand-frame invariance evidence
15. Hydration + no-JS results
16. Specimen route + confirmation it is dev-only and labels what's deferred
17. Anything deferred, and confirmation nothing was half-built
18. Confirmation nothing in the brand frame, schema, marks, grammar, primitives, or existing
    routes was changed

---

### STOP

End after the report. Do not begin Step 3.5 (environment/ambient layer) or any routing work.
