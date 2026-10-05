# TUTORS ACADEMY — Phase 3 · Step 1
## Subject Identity Schema + Switchboard

> Depends on Phase 2 (Steps 2.1–2.6). **Read the token, motion, spatial and primitives
> layers before writing anything.**
>
> **This step builds the CONTRACT, not the art.** No subject illustrations, no custom
> marks, no ambient/3D layer, no transition choreography. Those are Steps 3.2–3.5.
>
> If the schema is wrong here, every later step inherits the wrongness. So this step is
> deliberately small, strict and testable.

---

### WHY THIS STEP EXISTS

The subject identity system is the single most distinctive thing about this product and
the easiest to build wrong. Built wrong, "subjects feel like different worlds" becomes
seven forked designs that drift apart forever.

Built right, a subject is **data plus assets**, and the environment is produced by the
system. This step defines that data.

**Three rules that govern everything below:**
1. **One brand, many environments.** The brand frame (mark, type families, motion
   grammar, spatial system, primitives) is identical everywhere. Subjects change
   *environment*, never brand.
2. **Subjects are config, not components.** Adding a subject must never require editing
   a component.
3. **The environment must never cost usability.** Every capability a subject declares
   is bounded, budgeted, and degradable.

---

### FIRST: INSPECT (before writing anything)

1. Steps 2.1–2.4 — the token architecture, the **three empty accent slots
   (`--ta-accent-1/2/3`)**, theme scopes, the `data-density` pattern, motion tokens and
   the reduced-motion contract, spatial roles.
2. Step 2.5 — the primitives and their APIs. These must re-skin via tokens with **no
   component changes**. Note anything that would require a code change to re-skin — that
   is a defect worth reporting now.
3. Step 2.6 — the brand-frame rules and the nav shell. The mark is brass in every subject.
4. Existing routing — how routes and layouts are declared, and where a subject scope would
   naturally attach.
5. Any existing subject/theme/course data or types in the codebase.
6. Existing conventions — file naming, folder structure, export style, where types live.

Report findings before building.

---

### BUILD — PART 1: THE SUBJECT SCHEMA

Define a subject as a typed config. **Required fields, with bounded values — no free-form
strings for anything the system consumes.**

```
Identity
  id            slug, stable, never renamed after launch
  name          display name
  tagline       one line, environment-flavoured (used in the chooser)
  status        'draft' | 'ready' | 'locked'   (drafts cannot ship to production)

Accent triad   — the ONLY colour lever a subject may pull
  accent1       primary identity colour (elements, marks, key surfaces)
  accent2       motif companion (secondary structure, energy lines, bonds)
  accent3       structural quiet (hairlines, borders, low-emphasis environment structure)
  Each declares BOTH an on-ink and an on-ivory value, or a single value proven to pass
  against both. No subject may introduce a sixth global hue — accents stay inside the
  subject's own triad.

Environment   — bounded enums. These names are the vocabulary the rest of Phase 3 builds on.
  atmosphere    'graphite-field' | 'deep-space' | 'glass' | 'organic' | 'paper' | 'cartographic'
  motif         'lattice' | 'field' | 'bonds' | 'living' | 'typographic' | 'strata'
  motionChar    'precise' | 'energetic' | 'reactive' | 'growing' | 'editorial' | 'sequential'
  density       'sparse' | 'balanced' | 'dense'

Motion charter  — declared here, IMPLEMENTED in Step 3.3/3.4
  enterChoreo   must name an existing 2.3 preset chain — no new animation vocabulary
  exitChoreo    same constraint
  morphTarget   which element persists across the switch (the continuity anchor)
  ambient       { enabled, budget, pauseOffscreen, stopsOnBlur, fallback }

Room behaviour — the locked composability rule
  roomMood      how the environment calms inside a working Room:
                ambient off, accent retained, atmosphere reduced, structure kept

Degradation ladder — ordered, enforced by step 3.4 but DECLARED here
  full → reduced → static       (what is sacrificed, in what order, and why)
```

**Field-level requirements:**

- `id` is **immutable** — it will key user progress, recordings, classes and tutoring
  data later. Enforce with a comment; never rename after launch.
- Every enum value must be a **closed set**. If a new subject needs a new value, that is a
  schema change and must be reported — not silently extended.
- Every subject config must be **validated at load** (see Part 3).

---

### BUILD — PART 2: THE SIX SUBJECT CONFIGS

Create all six as configs. **Only Mathematics is implemented to full depth in this step.**
The other five are complete, valid, schema-correct configs marked `status: 'draft'`, with
accents, atmosphere, motif, motion character and density declared — but **no motif art,
no ambient layer, no custom mark** (those arrive in 3.2–3.4).

Locked direction — implement **exactly** this, do not invent your own palette:

| Subject | Environment name | Accent 1 | Atmosphere | Motif | Motion character | Density | Room mood |
|---|---|---|---|---|---|---|---|
| Mathematics | **The Lattice** | Indigo | `graphite-field` | `lattice` | `precise` | sparse | exact, quiet, negative space |
| Physics | **The Field** | Ember | `deep-space` | `field` | `energetic` | balanced | calm field, low energy |
| Chemistry | **The Vessel** | Manganese Violet | `glass` | `bonds` | `reactive` | balanced | still, clear, unreacting |
| Biology | **The Organism** | Living Green | `organic` | `living` | `growing` | dense | slow breathing, backgrounded |
| English | **The Page** | Rose | `paper` | `typographic` | `editorial` | sparse | paper-quiet, reading-first |
| History | **The Record** | Slate Cyan | `cartographic` | `strata` | `sequential` | dense | layered, still, archival |

**The accent triad must be given explicit values for Mathematics** (all three slots, on
both ink and ivory). For the other five, `accent1` is required and explicit; `accent2` and
`accent3` may be **deterministically derived** toward ink/ivory by a documented function —
and that derivation must pass the Part 3 validator. Report the derivation rule.

**Each subject must also declare its environment in words** — one short paragraph in the
config file describing what the environment *is*, so later steps implement against intent
rather than guesswork. Mathematics is the reference; write it properly.

**Anti-collision constraints (state these in the schema file):**
- Accents must stay distinguishable from **brass** (brand) and from **signal teal**
  (reserved for live/interactive states).
- Because all six appear together on the switcher, **mutual distinctness matters more
  than individual beauty.** The validator must check all six against each other, not each
  in isolation.
- Accents are used for **elements and atmosphere**, never as large flat fills behind body
  text, and never as a replacement for brand brass in the brand frame.

---

### BUILD — PART 3: THE VALIDATOR (non-negotiable)

A validation module that runs **at build time** and fails loudly. A subject config that
fails never compiles.

Must check, per subject:
1. **Contrast** — the accent used as text/graphic on both base and raised surfaces, in
   **both themes**, meeting AA (4.5:1 text, 3:1 graphic). Report measured ratios.
2. **Accent vs brass** and **accent vs signal** — minimum separation (use ΔE or a stated
   equivalent). Fail if confusable.
3. **Mutual distinctness** — all six accents checked **against each other**, not in isolation.
4. **Focus ring survival** — `--ta-focus-ring` must remain visible on an
   accent-filled surface. This is the one that gets missed; test it explicitly.
5. **Schema completeness** — every enum value valid, no free-form substitutions.
6. **Draft guard** — a `draft` subject may render in `/dev/*` but must be **impossible to
   ship to a production route.** Enforce mechanically, not by convention.

Report the validator's output for all six.

---

### BUILD — PART 4: SCOPING + THE GUARD TEST

**Scoping mechanism (mirroring the existing `data-density` and theme patterns):**
- CSS-side: `[data-subject="physics"]` scopes the accent triad and environment variables
  to a subtree. Nothing else changes — brand frame tokens are untouched.
- JS-side: a small context provider exposes the active subject identity to components that
  genuinely need it (later: the ambient layer, the 3D scene, analytics). Keep it minimal.
- **Nesting is supported and defined:** a **Room inside a Stage** keeps the subject accent
  identity but reduces atmosphere and disables ambience (see `roomMood`). Write this rule
  down as a comment in the provider.

**The guard test — mechanically enforced:**
> No component outside the subject-scoping layer may import a subject config directly.
> Components consume **tokens and context only.**

Implement this as a real check (lint rule, dependency-cruiser check, or a test that greps
imports and fails). Report how it works and paste a failing example to prove it catches
violations.

---

### BUILD — PART 5: THE DEV SWITCHBOARD — `/dev/subjects`

Dev-only, gated behind `NODE_ENV !== 'production'`. Mirrors the other `/dev/*` routes.

This is where the schema becomes **visible**, and where you approve or veto the direction.

Required:
- All six subjects rendered as cards: environment name, tagline, accent swatches for all
  three triad slots, atmosphere / motif / motion-character / density readouts.
- A **live switcher**: choosing a subject applies `data-subject` to a preview panel
  immediately. No page reload.
- The preview panel must contain, at minimum: a **Room** (surface, text, border, primary
  button, input, progress) showing the subject accent applied, plus a **Stage** strip
  showing atmosphere intent as a placeholder treatment (a labelled stand-in is fine here —
  real environment art is Step 3.4, so say so on the page).
- The **brand-frame invariance check, visualised:** the mark, the wordmark, the type
  scale, the nav shell and the button shapes must be **pixel-identical across all six
  switcher states** — accents change, nothing else. Show two subjects side by side for
  direct comparison, so any leakage is obvious.
- The **validator report** rendered live per subject: contrast ratios, accent-vs-brass,
  accent-vs-signal, mutual distinctness matrix, focus-ring-on-accent result, and status.
- A visible note listing **what is real in this step vs. what is a placeholder**
  (environment art, marks, ambience, transitions: all deferred).
- **Both themes**, and a density toggle, applied to the preview panel.

---

### CONSTRAINTS

- **Contract only.** No subject illustration, no custom marks, no ambient/motif art, no
  3D, no transition choreography. Those are 3.2–3.5.
- **No new colours beyond the six accents and their documented derivations.** Brass stays
  brass, signal stays signal.
- Do not modify the brand frame: mark, wordmark, type families, motion grammar, spatial
  system, primitives' APIs.
- Do not touch `/dev/tokens`, `/dev/type`, `/dev/motion`, `/dev/spatial`,
  `/dev/primitives`, `/dev/brand`, `/dev/nav`.
- Do not build the homepage or any subject route in this step (routing arrives in 3.5).
- Do not add dependencies unless the validator genuinely cannot be written without one —
  prefer a small inline implementation. If you add one, state why.
- No fake data presented as real. Where a value is a placeholder, label it.
- Do not invent a seventh subject.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- The primitives and their APIs (2.5)
- The brand mark, wordmark, lockup, favicon (2.6)
- The nav shell and its behaviour (2.6)
- Colour values for brass, signal, ink, ivory, slate, state colours
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **Validator passes for all six** — paste the full output: every contrast ratio, every
   separation check, the mutual-distinctness matrix, focus-ring results.
2. **Deliberate failure proof** — temporarily break one config (e.g. an accent that fails
   contrast) and confirm the **build fails**. Revert it. Paste the failure output. This
   proves the validator is real and not decorative.
3. **Guard test proof** — add a temporary direct config import inside a component and
   confirm the check **fails**. Revert it. Paste the output.
4. **Draft guard proof** — confirm a `draft` subject cannot be reached on a production
   route. Report the mechanism.
5. **Brand-frame invariance** — switch through all six on `/dev/subjects` and report that
   mark, type, nav and button geometry are unchanged. Describe how you verified it
   (measurement, overlay, or diff).
6. **Both themes** — all six subjects in dark and light. No invisible text, no lost
   borders, no vanished focus ring. Report any accent that needed an ink/ivory variant.
7. **Focus ring on accent** — screenshot the ring on an accent-filled primary button for
   **all six** subjects in both themes.
8. **Keyboard + screen reader** — the switcher is fully operable by keyboard, announces the
   active subject, and moves focus sensibly. Report the tool and output.
9. **Reduced motion** — the switcher applies instantly with no animation. Verified.
10. **No layout shift** — switching subjects must not shift layout. Report measured CLS.
11. **Mobile** — 320px. Switcher usable, touch targets ≥44×44, no horizontal overflow.
12. **Zoom 400%** (WCAG 1.4.10) and text-spacing overrides (WCAG 1.4.12) — nothing breaks.
13. **Audit** — axe/Lighthouse on `/dev/subjects`, all six states. Score + every violation.
14. **Production build** succeeds; `/dev/subjects` absent or 404 in production; **no draft
    subject ships.**
15. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified, and where the subject configs live
2. **The complete schema** — every field, every bounded enum value, pinned and explained
3. Mathematics written as the reference config — paste the config and its environment
   paragraph
4. The five other configs, with the accent-derivation rule and the values it produced
5. The full validator output for all six, including the **mutual-distinctness matrix**
6. The three proofs: validator failure, guard-test failure, draft guard
7. Scoping mechanism — CSS attribute, JS context, and the Stage→Room nesting rule
8. Brand-frame invariance evidence
9. `roomMood` and the degradation ladder as actually declared
10. `/dev/subjects` route + confirmation it is dev-only and clearly labels placeholders
11. Any accent you had to adjust for contrast, and what changed
12. Anything deferred, and confirmation nothing was half-built
13. Confirmation nothing in the brand frame, primitives, or existing routes was changed

---

### STOP

End after the report. Do not begin Step 3.2 (subject marks and motifs) or any
environment art.
