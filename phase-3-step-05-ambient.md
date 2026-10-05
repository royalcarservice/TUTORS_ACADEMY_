# TUTORS ACADEMY — Phase 3 · Step 5
## The Ambient Layer — Atmosphere in Depth

> Depends on Steps 3.1 (schema), 3.2 (marks), 3.3 (motif grammar), 3.4 (switch).
> Read all four first.
>
> **This is the highest-risk step in the project.** Ambient 3D is where "immersive" most
> often becomes slow, gimmicky, or battery-destroying. Every rule below exists to prevent
> that specific outcome.
>
> **No routing. No homepage. No environment shell.** Those are Step 3.6.

---

### WHY THIS STEP EXISTS

Each subject environment should feel like a place with air in it — depth, atmosphere,
a slow sense of life that is felt rather than watched. That is what separates an
environment from a styled page.

It is also the single easiest way to ruin the product. So it is built as a **bounded,
degradable, honest system** with one subject implemented in full, not as six speculative
art projects.

---

### THE FOUR LOCKED DECISIONS

**1. 3D is a LENS, not a scene.**

No 3D worlds. No objects. No props. No "scenes" with things in them. That road ends in a
game, and this is an education product.

> **The motif grammar from 3.3 IS the geometry. The ambient layer renders that same data
> with depth.**

This is why 3.3 emitted data rather than markup. The ambient layer is not a second art
pipeline — it is a **second renderer** of the same structural language. Same seed, same
primitives, same budgets, expressed spatially.

Consequence: the ambient layer **invents no content.** If a visual cannot be derived from
the motif grammar's output, it does not belong here.

**2. One canvas, one role, Stage only.**

- **A single canvas instance**, used only for the `substrate` role.
- **Never in a Room.** Rooms are for working. This is enforced in code, not by convention.
- **Never duplicated** per section, per card, or per view. Multiple canvases competing for
  GPU contexts is how a page ends up unusable on a mid-range laptop.
- Other roles (`edge`, `divider`, `focus`) stay vector — they are already cheap and correct.

**3. WebGL is never required to understand anything.**

- The **SVG substrate from 3.3 is the fallback, not a blank.** It must be rendered first
  and remain the baseline experience.
- No-JS, no-WebGL, reduced-motion, low-power, low-memory, slow-network, and small-screen
  users all receive a **complete, coherent environment** — the vector version.
- **Nothing in the product may depend on the WebGL layer to be comprehensible or usable.**

**4. The critical path is protected.**

- Three.js is roughly 600KB. It is **lazy-loaded**, **never in the initial bundle**, and
  **never blocking**.
- **If the ambient layer has not loaded by the time the Stage is visible, the user sees the
  SVG substrate. Never a spinner. Never an empty frame. Never a layout shift when it arrives.**
- The canvas must be **absent from the Room bundle entirely.**

---

### FIRST: INSPECT

1. Step 3.3 — the **data output format** of the grammar, the primitives, the seed rule,
   the budgets (path commands, DOM elements, generation time), and the role system.
   **This is the input format the ambient renderer consumes.**
2. Step 3.4 — the state machine, the `ambient` pause/resume hooks it expects, the
   degradation ladder, and the tier selection logic.
3. Step 3.1 — the `ambient` block per subject (`enabled`, `budget`, `pauseOffscreen`,
   `stopsOnBlur`, `fallback`) and `roomMood`.
4. Steps 2.3–2.4 — the **`ambient` motion preset and its hard caps**, the reduced-motion
   contract, spatial roles, container queries.
5. **What 3D tooling actually exists.** Check whether React Three Fiber / drei / raw
   `three` is installed. **Report exactly what is present before adding anything.**
6. Existing bundle configuration — how code-splitting is currently done, and how a lazy
   chunk would be declared.

Report findings before building.

---

### BUILD — PART 1: THE RENDERER CONTRACT

Define the boundary between the grammar and the renderer **as data**, not as shared code.

- The ambient renderer consumes grammar output. It **never re-implements motif logic**
  and **never imports a subject config directly** (the 3.1 guard test applies).
- It receives, per frame or per mount: primitive data, motif weights, subject accent
  tokens, density, `motionChar`, and the current ambient budget.
- **Determinism carries over.** The spatial interpretation of a given seed is identical on
  every load. Randomness is forbidden — including in shaders, unless seeded and stable.
- **`motionChar` drives the character of movement** (precise / energetic / reactive /
  growing / editorial / sequential) — through parameters, not through different code paths.
  One renderer, six characters.

---

### BUILD — PART 2: THE EXEMPLAR — MATHEMATICS, "THE LATTICE"

Build **one subject in full depth**: Mathematics.

A lattice is genuinely spatial, so this is where 3D earns its place. The ambient layer must
express the same structural idea as the 3.3 `lattice` motif:

- rational subdivisions, with **one emphasised path** through the structure
- precision as the character — nothing loose, nothing drifting, nothing organic
- depth used to convey **structure and order**, not spectacle

Required characteristics:
- **Slow.** Movement on the order of tens of seconds per cycle, not seconds.
- **Subtle.** It reads as atmosphere, not as animation. A user should notice it only if
  they look, and should never wait for it.
- **Non-competing.** It never draws attention away from text, controls, or the subject mark.
- **Genuinely spatial** — the depth must be doing real work (structure, hierarchy,
  orientation), not decorating a flat plane.

**Do not build the other five subjects in this step.** See Part 5.

---

### BUILD — PART 3: LIFECYCLE AND BUDGETS

The 2.3 ambient rules are now enforced for real:

- **Pauses when off-screen.** The environment does not consume GPU while it is not visible.
- **Stops entirely on tab blur / background.** No exception.
- **Bounded object and draw-call count.** State the numbers and stay under them.
- **Frame-budget aware.** If frame times degrade past a threshold, the layer steps down or
  suspends itself — **automatically, without a page reload.** Report the thresholds.
- **Never blocks input.** Scrolling, focus, typing and pointer interaction are unaffected
  at all times. Prove it under load.
- **No main-thread work per frame** beyond what is unavoidable. State what runs per frame
  and justify each item.
- **No continuous work when the environment is static.** If nothing is moving, nothing
  should be rendering.

**Resource hygiene (leak check required):**
- Geometries, materials, textures and render targets are **disposed on unmount**.
- Listeners, observers and animation loops are released on unmount.
- **Handle WebGL context loss** gracefully: restore, or fall back to the SVG substrate
  without a broken frame or an error in the console.
- Report how you verified disposal — not that you wrote it, that you *verified* it.

---

### BUILD — PART 4: SAFETY AND COMPLIANCE

- **`aria-hidden` throughout.** A canvas is invisible to assistive technology; it must
  never enter the accessibility tree, the reading order, or the tab order.
- **The canvas is not focusable** and contains nothing interactive.
- **Motion-safety:** depth and parallax are **capped**. Report the maximum camera movement
  and any parallax magnitude as numbers. No camera movement that could induce discomfort.
- **Reduced motion:** the ambient layer is **completely off**. Not slowed — off. The SVG
  substrate stands in, and the environment remains recognisably itself.
- **No motion carries information.** Nothing communicated only by movement.
- **No flashing, no strobing, no rapid luminance change** under any circumstance.
- **Battery awareness:** the layer is off by default on small screens, and off on devices
  reporting low power or limited hardware capability. Report the signals used.

---

### BUILD — PART 5: THE OTHER FIVE SUBJECTS — RECOMMENDATION, NOT IMPLEMENTATION

**Do not build them.** Instead, for each of Physics, Chemistry, Biology, English, History,
write a short recommendation covering:

1. **Whether WebGL is worthwhile for this motif at all** — be honest. `field` (Physics) and
   `bonds` (Chemistry) may genuinely earn depth. `typographic` (English) and `strata`
   (History) may be **better served by token-driven CSS/SVG depth** at a fraction of the
   cost, with a better result. **Say so if that is the case.**
2. **If yes:** what the spatial idea would be, and which grammar parameters drive it.
3. **If no:** what the vector-based atmosphere would be instead, and what is lost.
4. **Cost estimate** — bundle impact, per-frame cost class, and any new risk.
5. **A recommendation, with reasoning**, so the decision is made on evidence rather than
   on "3D is in the stack table."

**This recommendation is a required deliverable.** The user will approve it before any of
the five are built. Do not implement them speculatively.

---

### SPECIMEN ROUTE — `/dev/ambient` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Required:

- **Mathematics Stage** rendering with the ambient layer active.
- **A live frame-time and draw-call readout**, so cost is visible rather than assumed.
- **Load-state demonstration:** the SVG substrate visible first, the ambient layer arriving
  after. **Show that there is no spinner and no layout shift.**
- **A kill switch** for each degradation input, so every path is testable without changing
  hardware or OS settings: reduced motion, off-screen, tab blurred, frame-budget exceeded,
  context loss, low-power signal, small screen.
- **Context-loss test button** — force a context loss and confirm the fallback is clean.
- **Mount/unmount stress:** mount and unmount the environment repeatedly (30×) and display
  the WebGL resource counts before and after. **Prove disposal.**
- **A "Room forbids canvas" demonstration** — attempt to render ambient inside a Room and
  show that it is refused.
- **A reduced-motion side-by-side**, with the vector environment shown as the standing
  experience.
- **The five-subject recommendation**, rendered as readable prose on the page.
- A visible note stating **what is real vs. deferred** (five subjects unbuilt by design;
  hero integration is Phase 4; environment shell is Step 3.6).

---

### CONSTRAINTS

- **One subject only.** Mathematics in depth; the other five get recommendations, not code.
- **No routing, no environment shell, no homepage, no hero.**
- **No new colours, tokens, primitives, or motion vocabulary.**
- **3D libraries may be added ONLY if absent** — and only the minimum necessary
  (`three` plus React bindings if the stack requires them). **Report the exact packages and
  their bundle impact.** If something equivalent is already installed, use it.
  If you believe no 3D library is needed at all, **stop and report** with reasoning.
- **Never ship WebGL in the initial bundle.** Report the chunk boundaries.
- Do not modify the grammar, the schema, the marks, or the switch.
- Do not touch existing `/dev/*` routes.
- No post-processing effects (bloom, depth-of-field, chromatic aberration). None.
- No textures or image assets. Geometry and colour only.
- No physics engines, no particle libraries, no model loaders.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitives and their APIs (2.5)
- Brand mark, wordmark, lockup, nav shell (2.6)
- Subject schema, validator, scoping, guard test (3.1)
- The six marks and the mark language spec (3.2)
- The motif grammar, roles, budgets (3.3)
- The subject switch state machine, tiers, ceremony rationing (3.4)
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **Bundle impact** — report the initial bundle size **before and after**. Confirm the
   three/WebGL chunk is **not** in the initial payload. Paste the build output.
2. **Lazy arrival** — load with a throttled connection. Confirm the SVG substrate appears
   first, the ambient layer arrives later, **no spinner, no layout shift**.
   Report measured CLS across the arrival.
3. **Frame budget** — desktop and a throttled mid-range profile. Report worst frame time,
   average, draw calls, and any long task over 50ms.
4. **Auto-step-down** — force frame degradation and confirm the layer steps down or
   suspends **without a reload**. Paste the observed behaviour and thresholds.
5. **Leak check** — mount/unmount 30×. Report WebGL resource counts (geometries, programs,
   textures, buffers) before and after. **Evidence of disposal is required.**
6. **Context loss** — force it. Confirm clean fallback to the SVG substrate, no broken
   frame, no console error. Paste the console output.
7. **Off-screen + backgrounded** — scroll away and blur the tab for 60s. Confirm rendering
   fully stops. Report the evidence (frame readout flat, no rAF activity).
8. **Interaction never blocked** — scroll, tab, and type while the layer runs. Report any
   input latency introduced.
9. **Reduced motion** — layer completely off, environment still complete and recognisable.
   Screenshot.
10. **Room forbids canvas** — attempt ambient in a Room; confirm refusal. Paste the
    enforcement point.
11. **No-JS and no-WebGL** — disable JS, then disable WebGL. Confirm the environment
    renders correctly in both cases. Report how you verified.
12. **Accessibility** — canvas absent from the accessibility tree and tab order; screen
    reader reads the environment's content in order with no interruption. Report tool and output.
13. **Motion safety** — report maximum camera movement (degrees/units) and parallax
    magnitude as numbers. Confirm no strobing under any parameter.
14. **Guard test still passes** — no direct subject config import in the renderer.
15. **Determinism** — load the Mathematics environment 20 times; the initial spatial
    geometry is identical each time. Paste the hash comparison.
16. **Both themes** — the ambient layer in dark and light.
17. **Mobile** — 320px and a mid-range throttled profile. Confirm off-by-default and correct
    fallback. Report battery/CPU signals used.
18. **Zoom 400% + text-spacing overrides** — nothing breaks with the layer active.
19. **Audit** — axe/Lighthouse on `/dev/ambient`. Score + every violation.
20. **Production build** succeeds; `/dev/ambient` absent or 404 in production.
21. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified, and **exactly which packages were added, if any**
2. **The renderer contract** — what the ambient layer consumes from the grammar, and how it
   avoids re-implementing motif logic
3. How `motionChar` drives character through parameters rather than code paths
4. **The Mathematics ambient layer** — the spatial idea, and how it derives from the
   `lattice` grammar data
5. Per-frame work — what runs each frame, and the justification for each item
6. **Lifecycle enforcement points** — off-screen pause, blur stop, budget step-down, Room refusal
7. **Disposal verification** — the resource counts before and after 30 mounts
8. Context-loss behaviour
9. The lazy-loading arrangement and the measured bundle impact
10. Motion-safety numbers — max camera movement, parallax magnitude
11. **The five-subject recommendation** — for each: WebGL or vector, why, and the cost
    estimate. Include any "this does not need 3D" conclusions.
12. Fallback evidence — no-JS, no-WebGL, reduced motion, load-arrival CLS
13. Specimen route + confirmation it is dev-only and labels what's deferred
14. Anything deferred, and confirmation nothing was half-built
15. Confirmation nothing in the brand frame, schema, marks, grammar, switch, primitives, or
    existing routes was changed

---

### STOP

End after the report. Do not begin Step 3.6 (the environment shell) and do not build the
other five subjects until the recommendation is approved.
