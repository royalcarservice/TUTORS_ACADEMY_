# TUTORS ACADEMY — Phase 2 · Step 3
## Motion Grammar

> Depends on Steps 2.1 (tokens) and 2.2 (typography). Read both first.
> If the motion duration/easing tokens from 2.1 exist only as placeholders, this step
> formalises them — extend in place, do not create a second source of truth.

---

### WHY THIS STEP EXISTS

Motion is the soul of this product — and its biggest risk. Left to per-component
decisions, it becomes the "flashy for no reason" feeling we explicitly banned.

So motion is defined here as a **vocabulary**: a small set of named, purposeful presets
with documented intent. Components do not invent animation. They select from this
grammar. That is what makes the whole product feel choreographed by one hand instead
of assembled by six.

**The rule this step encodes:**
> Every animation must TRANSITION, ORIENT, CONFIRM, or REVEAL.
> If it does none of those, it is deleted.

---

### FIRST: INSPECT

1. Read the token files from Step 2.1 — existing duration, easing, z-index tokens.
2. Read the type system from Step 2.2 — rhythm and measure tokens, since reveals interact
   with line-height and typographic staggering.
3. Check whether a motion library is installed (Motion / Framer Motion, GSAP, anime.js,
   Lenis, or none). **If none is installed, do NOT install one in this step.**
   Report the absence — the choice of library is a separate decision.
4. Check for any existing animations, transitions or scroll behaviour in the codebase.

Report findings before building.

---

### BUILD

**1. Motion tokens — single source of truth**

Durations and easings must exist as CSS custom properties **and** be exported for the
JS layer, so CSS and JS motion can never drift.

```
Durations   --ta-dur-instant   90ms     input feedback, hover state
            --ta-dur-fast      160ms    small state changes, tooltips
            --ta-dur-base      240ms    DEFAULT — most transitions
            --ta-dur-slow      400ms    panels, section reveals
            --ta-dur-slower    700ms    scene-level transitions
            --ta-dur-cinematic 1000ms   hero / ceremonial moments ONLY

Easings     --ta-ease-enter    decelerate — things ARRIVING (fast out, soft land)
            --ta-ease-exit     accelerate — things LEAVING (never linger)
            --ta-ease-in-out   standard bidirectional movement
            --ta-ease-cinematic long, weighted, for hero moments only
            --ta-ease-linear   progress, continuous motion, loops
```

**Rules that must be stated in the file:**
- **Exits are always faster than entries.** A user waiting for something to leave is
  a user who feels lag. Entry `base`, exit `fast`.
- **`--ta-dur-cinematic` is rationed.** It is permitted only for hero and scene
  transitions. More than one per view means it has become a default and lost its weight.
- **Anything above `--ta-dur-base` must be interruptible.** The user can scroll,
  click or navigate out at any moment. No blocking, no trapped input.

**2. Choreography primitives — the named vocabulary**

Define these once, as reusable variants/presets. Everything later composes from them.

| Preset | Purpose it serves | Behaviour |
|---|---|---|
| `reveal` | REVEAL | Element enters on scroll. Fade + small directional offset (8–16px max). **One-shot — never re-animates on scroll back.** |
| `stagger` | REVEAL | Sequences a *set* of children in reading order. Per-item delay small; TOTAL stagger capped (~300ms) regardless of child count. |
| `enter` / `exit` | TRANSITION | The default mount/unmount pair. Exit faster than enter. |
| `orient` | ORIENT | Spatial movement signalling *where something came from* — a panel entering from the edge it belongs to. Direction must match spatial origin. |
| `confirm` | CONFIRM | Instant micro-feedback on interaction. Fast, tactile, no flourish. |
| `attention` | ORIENT | Brief, subtle emphasis. **Rationed — max one on screen at a time.** Never loops indefinitely. |
| `morph` | TRANSITION | Shared-element continuity, so an object *becomes* another rather than being cut. **Define the pattern now; the subject-environment morph in Phase 3 is its first real user.** |
| `ambient` | — | Continuous background motion (Phase 3 environments). **Strictly constrained — see rule 4.** |

**Every preset must be documented with: what it means, when to use it, when NOT to.**

**3. Performance contract — non-negotiable**

- Animate **`transform` and `opacity` only**. Animating `width`, `height`, `top`, `left`,
  `margin`, `box-shadow` or `filter` in a hot path is a defect.
- Use `will-change` sparingly and **remove it after the animation** — never leave it set.
- Nothing animates on the main thread during scroll. Scroll reveals use compositor-friendly
  transforms.
- **Interaction feedback is never delayed by motion.** Hover/press respond within
  `--ta-dur-instant` regardless of what else is animating.
- **Motion budget:** a section may not run more than a small handful of concurrent
  animated elements. Define the number and enforce it.
- Every scroll-triggered animation must **unobserve after firing**. No permanent listeners.

**4. Ambient motion rules (for Phase 3 environments — define now, apply later)**

Continuous motion is where "immersive" becomes "cheap" or "slow". So it is hard-capped:

- Ambient motion is **subtle by default and off by default on small screens**.
- It **pauses when off-screen** and **stops entirely** on tab blur / background.
- It must never exceed a defined budget of animated objects.
- It must never cause measurable long-task jank or continuous main-thread work.
- It is the **first thing sacrificed** when the device is low-power, the connection is
  slow, or the user prefers reduced motion.

**5. Reduced-motion contract — mandatory, not a fallback**

Under `prefers-reduced-motion: reduce`:

- **All movement is removed, meaning is preserved.** Replace translate/scale/rotate with
  a short opacity change. Content still appears, state changes still read clearly.
- **Nothing becomes invisible.** No content may depend on a transform to become visible —
  this is the single most common accessibility defect in animated marketing pages.
- **Instant, not broken.** Reduced motion means *no animation*, not *missing content*.
- **Auto-playing ambient motion stops completely.**
- **Explicit user-triggered motion** (e.g. a deliberate "play" or expand) may still run,
  because the user asked for it.
- Handle both: the CSS media query AND the JS hook, so library-driven and CSS-driven
  motion agree.

Provide a **dev-only override** on the specimen route to toggle reduced-motion behaviour
without touching OS settings — this is how we verify it.

**6. Motion specimen route — `/dev/motion` (dev-only, mirrors `/dev/tokens`, `/dev/type`)**

Gate behind `NODE_ENV !== 'production'`. It must demonstrate:

- every duration rendered as a real object moving across the same distance, side by side,
  so the difference is *felt* not just read
- every easing curve drawn as its actual path, with the curve animating
- each choreography primitive firing on demand (button-triggered, not looping forever)
- a live **reduced-motion toggle** showing the same demos in both modes, side by side
- a visible **frame/FPS readout** while the demos run, so jank is observable
- an explicit note on this page: *"Motion is never the only carrier of information."*

---

### CONSTRAINTS

- **Motion system only — no components, no pages, no hero, no nav.**
- **Do not install a motion library.** If none exists, define tokens as CSS custom
  properties plus a framework-agnostic preset spec (plain data), and report it.
- Do not restyle existing pages or components. Leave them untouched.
- Do not alter colour, type, spacing or elevation tokens from 2.1 / 2.2 — motion only.
- No scroll-jacking. No custom scroll hijacking library. Natural scrolling stays natural.
- No parallax beyond a subtle, capped amount, and never on text.
- Do not build the homepage.
- Do not start Phase 3 subject environments — this step only defines what they will obey.

---

### DO NOT CHANGE

- Token architecture from Step 2.1 — extend, never fork
- Type scale, families, rhythm rules from Step 2.2
- Colour values, theme scopes, spacing, elevation
- Existing routes, components, layouts, copy
- Any working build or deploy setup
- Framework or dependency versions

---

### TEST (all required)

1. **No layout thrash** — run the motion demos with DevTools Performance recording.
   Report: any layout/paint triggered? Any long task over 50ms?
2. **Compositor only** — confirm animations run on `transform`/`opacity`. List every
   animated CSS property used across the system. Anything else is a defect.
3. **Reduced motion** — with the OS setting on AND the dev toggle on: verify nothing
   animates, nothing is invisible, all content is present and readable. Screenshot both modes.
4. **Interruptibility** — start a `slow`/`cinematic` transition and scroll or navigate
   mid-flight. Confirm input is never trapped and state resolves cleanly.
5. **No leaks** — scroll-reveal observers unobserve after firing; `will-change` is removed.
   Report how you verified this.
6. **Backgrounded tab** — switch away for 30s. Confirm ambient motion stops and no rAF
   loop keeps running. Report the evidence.
7. **Mobile** — 320px width and a throttled CPU. Ambient motion is off or reduced;
   no scroll jank.
8. **Production build** succeeds; `/dev/motion` absent or 404 in production.
9. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified
2. Motion token table — every duration and easing, with its intended use
3. The choreography primitive list, each with: meaning, when to use, when NOT to
4. Whether a motion library exists; if not, how presets are specified framework-agnostically
5. Performance findings — animated properties list, long tasks, measured frame timings
6. Reduced-motion behaviour, and how you verified it
7. Ambient motion constraints as actually encoded
8. Specimen route path + confirmation it is dev-only
9. Anything deferred or uncertain
10. Confirmation nothing existing was restyled or broken

---

### STOP

End after the report. Do not start the spatial system, components, or the homepage.
