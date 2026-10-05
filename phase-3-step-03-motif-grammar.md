# TUTORS ACADEMY — Phase 3 · Step 3
## Motif Grammar

> Depends on Steps 3.1 (schema) and 3.2 (subject marks). Read both first.
>
> **Static structure only.** No animation, no ambient layer, no 3D, no transition
> choreography. Those are Steps 3.4–3.5.
>
> If the 3.1 schema does not exist, STOP and report — do not invent a parallel one.

---

### WHY THIS STEP EXISTS

Each subject environment is built from a structural language — the geometry that
everything else sits on. Get this right and every future surface (hero, cards, dividers,
recording lists, transitions) inherits visual coherence for free. Get it wrong and each
new surface becomes a bespoke art task.

**This step produces: the grammar, the six rule sets, the renderer, and the placement
rules. It produces no animated or ambient behaviour.**

---

### THE CORE ARCHITECTURAL DECISION (locked)

> **Motifs are a deterministic grammar, not drawn artwork.**

Six subjects × six composition roles × two themes = thirty-six hand-drawn artefacts to
maintain. Instead: a **small vocabulary of geometric primitives** plus **per-motif rules**
that produce structure from a **seed**.

**Consequences, all mandatory:**

1. **Deterministic.** The same seed produces byte-identical output. **No `Math.random()`,
   no `Date.now()`, no `performance.now()`, no unordered iteration** anywhere in generation.
2. **SSR-safe by construction.** Server and client must produce identical geometry.
   Generation is **pure** and **never depends on viewport** — only *scale* may respond to
   measurement. Viewport-dependent generation is the #1 cause of hydration mismatch here.
3. **Renderer-agnostic.** The grammar emits **data** (points, paths, parameters). SVG
   renders it in this step. A future WebGL renderer must be able to consume the same output
   without the design being redefined. Structure your output accordingly.
4. **Animatable by design.** Every primitive carries parameters. They are **static in this
   step**, but Step 3.5 must be able to drive them without regenerating the grammar.
5. **Bounded.** Every rule set has hard caps. Chaos is not a motif.

**Seed rule:** seed = `subject.id` + a purpose string + a composition index, hashed
deterministically. Rebuilds are always identical. State the hashing method.

---

### FIRST: INSPECT

1. Step 3.1 — the `motif`, `atmosphere`, `density`, `motionChar` and `roomMood` fields, the
   validator, the scoping mechanism, and the guard test.
2. Step 3.2 — the mark language spec (stroke class, terminals, curve character,
   complexity ceiling). **Motif strokes must belong to the same visual family** as the
   marks and the brand mark.
3. Steps 2.1–2.4 — accent slots, surface/border/text tokens, theme scopes, density
   pattern, motion grammar, spatial roles.
4. Existing render approach — how SVG is handled in the codebase, any existing shape or
   background components. **Report and extend rather than replace.**
5. Existing component conventions and where a rendering utility would live.

Report findings before building.

---

### BUILD — PART 1: THE PRIMITIVE VOCABULARY

A small set of pure geometry producers. Each takes parameters and returns **data**, not
markup. Each carries animatable parameters.

Minimum viable set:
- **Line / polyline** — points, length, angle constraints, termination rule
- **Curve** — control points, curvature character, continuity
- **Node** — position, optional emphasis weight
- **Edge** — connects two nodes, with an angle drawn from a constrained set
- **Band** — horizontal or vertical region with thickness and internal subdivision
- **Field** — a distribution of points or streamlines over an area, with density and
  direction parameters

**Anti-alignment rule:** no primitive may depend on the viewport. Alignment is derived
from the **composition box** it is given, never from the window.

---

### BUILD — PART 2: THE SIX RULE SETS

Implement each as a pure function: `(seed, box, density) → data`.

| Motif | Subject | Structural idea |
|---|---|---|
| `lattice` | Mathematics | a grid with rational subdivisions, and **one emphasised path through it** |
| `field` | Physics | streamlines sharing a directional tendency, spaced by field strength, **lines never cross** |
| `bonds` | Chemistry | nodes with **valence limits** (1–4), edges at discrete angles, **open reaction sites** — an available bond is deliberately left unfilled |
| `living` | Biology | branching growth at **decreasing scale**, soft membrane curves, no sharp corners, asymmetry preferred |
| `typographic` | English | the page itself: baseline bands from the 2.2 type proportions, vertical measures, a small number of rules, a word-space rhythm |
| `strata` | History | stacked bands of varying thickness with **deliberate discontinuities**, and occasional vertical core samples piercing the layers |

**Per-motif rules each config must declare:**
- dominant angles or curve character
- what constitutes an emphasis moment (and how rare it is — **emphasis must be rare**)
- minimum and maximum feature size
- what must **never** appear (state it explicitly per motif)
- how `density` scales the structure (see Part 4)
- how `motionChar` will later modulate parameters (declared now, applied in 3.5)

**Rule:** the structure must be recognisable as *this* subject at a glance when rendered
at low contrast. If it is generically pretty, it has failed.

---

### BUILD — PART 3: THE COMPOSITION GRAMMAR

A motif is not a background image. It is placed in a role, and each role has rules.

| Role | Description | Coverage cap | Contrast ceiling | Allowed in Room? | Allowed behind text? |
|---|---|---|---|---|---|
| `substrate` | full-bleed structural field behind a Stage | as declared | lowest | no | no |
| `edge` | bleeds off **one** edge only, giving a Room depth without overwhelming it | small | low | yes | no |
| `divider` | separates scenes within a Stage | thin | low | yes | no |
| `focus` | small, high-detail area — an instrument specimen | tiny | highest | yes | no |
| `transition` | substrate material used during the subject switch (animated in 3.4) | as declared | medium | n/a | no |

**Non-negotiable legibility rule:**
> **Any motif beneath text is capped at a contrast ceiling and masked out of text regions.**
> Motifs may not reduce text contrast below the WCAG AA threshold. Provide a
> content-exclusion mechanism (mask, fade, or region avoidance) and prove it works with
> real text over the densest motif. A learning product is mostly reading — decoration that
> costs legibility is a defect, not a style choice.

Also required: **motifs are never baked into raster images.** They stay vector so they
remain theme-aware, accent-aware, cheap and scalable.

---

### BUILD — PART 4: DENSITY AND BUDGETS

`density` comes from the 3.1 subject config (`sparse` | `balanced` | `dense`). It scales
structure — **not** visual weight.

- Define the multiplier per density level explicitly (e.g. sparse 0.6×, balanced 1.0×,
  dense 1.4×) and apply it to feature counts, not to opacity.
- **Hard global ceilings that density can never exceed:**
  - maximum total path commands per surface
  - maximum DOM elements per surface (**state a number and stay under it — prefer a small
    number of `<path>` elements with many subpaths over hundreds of `<line>` elements**)
  - maximum generation time per surface (target: negligible; report the measured number)
- **No filters, no blur, no drop-shadows, no expensive blend modes.** Achieve softness with
  opacity layering and gradients. State the technique used.
- Generation must be **pure and synchronous** — no layout reads during generation.

---

### BUILD — PART 5: THE RENDERER

- **Server-rendered.** Motif output is generated on the server and shipped in the HTML.
  No client-side layout pass, no flash of empty structure.
- **`aria-hidden` throughout.** Motifs are decorative and must never enter the
  accessibility tree or reading order.
- **Accent-aware via tokens only.** Colour comes from the subject accent slots — the
  renderer never hardcodes a colour, and **never imports a subject config directly**
  (the 3.1 guard test applies).
- **Theme-aware** with no conditional JS — token-driven only.
- **Explicit dimensions** so motifs cause no layout shift.
- **Zero client JS by default.** If the component requires client JS to render, that is a
  defect — report it.

---

### BUILD — PART 6: STAGE AND ROOM

Encode the 3.1 `roomMood` rule in the renderer:

- **Stage(subject)** — `substrate` permitted, ambient later, full density.
- **Room(subject)** — `substrate` **disabled**; only `edge`, `divider` and `focus` are
  permitted; density reduced; accent identity **retained**.
- A Room nested inside a Stage inherits the accent but not the substrate.

Write this as an enforced rule in the code, not a convention. Report where it is enforced.

---

### SPECIMEN ROUTE — `/dev/motifs` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Mirrors the other `/dev/*` routes. Required:

- **All six motifs × all five composition roles**, rendered.
- A **density control** (sparse / balanced / dense) affecting structure, shown to change
  feature counts **without** changing opacity or weight — demonstrate this explicitly.
- **The legibility test, live:** a real paragraph of plausible study content rendered over
  the densest motif of each subject, with the **measured contrast ratio displayed**. Any
  failure is visible, not hidden.
- **Determinism proof:** a button that regenerates and shows the output hash, unchanged
  across reloads.
- **Budget readout per motif:** path commands, DOM element count, generation time (ms).
- **Both themes**, and both **Stage and Room** contexts.
- A written explanation of **how the grammar works** — the primitives, the seed rule, the
  role system — so the logic survives without the author.
- A visible note stating **what is real vs. deferred** (ambient motion, 3D, switch
  animation: later steps).

---

### CONSTRAINTS

- **Static structure only.** No animation, no transitions, no ambient layer, no 3D, no WebGL.
- Do not modify the brand frame, the subject marks, or the subject schema.
- Do not invent a seventh motif. Six is the closed set from 3.1.
- Do not add colours. Accents come from tokens.
- **No new dependencies** — no generative-art or geometry libraries. Pure functions only.
  If you believe one is genuinely required, **stop and report** with reasoning.
- Do not touch the existing `/dev/*` routes.
- Do not build the homepage or any subject route.
- No raster assets of any kind.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitives and their APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (2.6)
- Subject schema, validator, scoping, `/dev/subjects` (3.1)
- The six subject marks, the mark language spec, `/dev/marks` (3.2)
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **Determinism** — generate each motif 100 times; all outputs byte-identical. Paste the
   hash comparison.
2. **SSR / hydration** — load every motif surface in the browser and confirm **zero**
   hydration warnings and no post-hydration geometry change. Report the console output.
3. **No forbidden sources of variation** — grep the generation code for `Math.random`,
   `Date`, `performance.now`, and non-deterministic iteration. Expected: none.
4. **Legibility** — real text over each subject's densest motif at `substrate` and `edge`
   roles. Report measured text contrast. **Anything under AA is a failure** — fix and
   report what changed.
5. **Budget** — per motif, report: path commands, DOM element count, generation time.
   Compare against declared ceilings.
6. **No expensive effects** — grep for filters, blur, drop-shadow, expensive blend modes.
   Expected: none.
7. **Both themes** — all six motifs in dark and light. No invisible structure, none too loud.
8. **Stage vs Room** — confirm `substrate` is impossible in a Room, enforced in code.
   Paste the enforcement point.
9. **Guard test still passes** — motifs do not import subject configs directly.
10. **Zero client JS** — verify motif surfaces render without client JS. Report how.
11. **Accessibility** — motifs absent from the accessibility tree; screen reader reads content
    in order with no decorative interruption. Report tool and output.
12. **No layout shift** — report measured CLS with motifs present.
13. **Mobile 320px** — structure renders correctly, no overflow, no perf regression.
14. **Zoom 400% + text-spacing overrides** — nothing breaks.
15. **Audit** — axe/Lighthouse on `/dev/motifs` across all six subjects. Score + every violation.
16. **Production build** succeeds; `/dev/motifs` absent or 404 in production.
17. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified
2. **The primitive vocabulary** — each primitive, its parameters, and which are animatable
3. **The six rule sets** — dominant angles/curves, emphasis rule, min/max feature size,
   the per-motif never-list, and how density scales each
4. The seed + hashing method, and the determinism hash evidence
5. **The composition grammar** — roles, coverage caps, contrast ceilings, and the
   content-exclusion mechanism
6. Density multipliers + the global ceilings, with measured values against them
7. The renderer architecture — SSR, output format, and how a future WebGL renderer could
   consume the same data
8. Stage/Room enforcement point
9. **The live legibility test results** — measured contrast for text over each densest motif,
   in both themes
10. Budget readout: path commands, DOM count, generation time per motif
11. Hydration result (warnings + geometry stability)
12. Specimen route + confirmation it is dev-only and labels what's deferred
13. Anything deferred, and confirmation nothing was half-built
14. Confirmation nothing in the brand frame, marks, schema, primitives, or existing routes
    was changed

---

### STOP

End after the report. Do not begin Step 3.4 (the Subject Switch) or any animated behaviour.
