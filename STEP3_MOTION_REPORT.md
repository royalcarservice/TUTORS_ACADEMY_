# Phase 2 · Step 3 — Motion Grammar

Design-system audit/build for the Tutors Academy Next.js app. Scope: **motion only.** No new
pages, no hero, no nav, no restyle of existing components, no scroll-jacking, no text parallax.
Screenshots: `/home/user/shots4/motion-normal.png`, `/home/user/shots4/motion-reduced.png`.

---

## 1. Inspection findings

- **Motion library: NONE installed.** `package.json` has no `framer-motion`, `gsap`, `react-spring`,
  or similar. Per instruction I did **not** install one. The grammar below is hand-rolled with CSS
  custom properties + a small framework-agnostic TS layer.
- **Existing motion before this step:** component micro-transitions (hover `transition-colors` /
  `transition-shadow` on button/card/sidebar), and a global `scroll-behavior: smooth`
  (`globals.css`), plus an existing `prefers-reduced-motion` reset block. Nothing else.
- **Token references before this step:** only `/dev/tokens` printed `--ta-dur-1..6`. After the
  in-place rename to named tokens, `/dev/tokens` was updated to the new names (no stale refs remain).

## 2. Motion tokens — single source of truth

All durations/easings/budget live in `src/app/globals.css` as CSS custom properties and are mirrored
to JS in `src/lib/motion.ts` (`MOTION_TOKENS`) **by name only** (the JS reads the CSS value at runtime
via `getComputedStyle`; it never re-declares values, so the two cannot drift).

| Token | Value |
|---|---|
| `--ta-dur-instant` | 90ms |
| `--ta-dur-fast` | 160ms |
| `--ta-dur-base` (default) | 240ms |
| `--ta-dur-slow` | 400ms |
| `--ta-dur-slower` | 700ms |
| `--ta-dur-cinematic` | 1000ms |
| `--ta-ease-enter` | cubic-bezier(.16,1,.3,1) (decel) |
| `--ta-ease-exit` | cubic-bezier(.7,0,.84,0) (accel) |
| `--ta-ease-in-out` | cubic-bezier(.65,0,.35,1) |
| `--ta-ease-cinematic` | cubic-bezier(.83,0,.17,1) |
| `--ta-ease-linear` | linear |
| `--ta-motion-budget` | 8 (max concurrent/section) |
| `--ta-stagger-step` / `--ta-stagger-cap` | 40ms / 300ms |

**Rules encoded:** exits use a faster/easing-accel curve and shorter durations than entries;
`cinematic` is rationed (specimen note: ≤1 per view, hero only); anything `>base` is implemented as a
retargetable CSS **transition** (interruptible), never a locked keyframe.

## 3. Primitives vocabulary (meaning / use / NOT-use)

Implemented as `@layer components` classes in `globals.css`; each is documented in the
`MOTION_PRESETS` table (verb / use / notUse) and rendered as the specimen's "Preset reference".

| Class | Verb | Use | NOT for |
|---|---|---|---|
| `.ta-reveal` | REVEAL | one-shot scroll entrance (fade + 8–16px) | re-animating on scroll-back; hero |
| `.ta-stagger` | REVEAL | homogeneous lists/grids entering together | heterogeneous layouts; long lists |
| `.ta-enter` | TRANSITION | dialogs/drawers/conditional panels appearing | scroll-linked entrances |
| `.ta-exit` | TRANSITION | paired teardown of enter (faster) | standalone attention |
| `.ta-orient[data-from]` | ORIENT | sheet/nav transitions where origin matters | generic fades; direction must match origin |
| `.ta-confirm` | CONFIRM | instant press/save/toggle ack (≤instant) | anything longer than `--ta-dur-instant` |
| `.ta-attention` | ORIENT | at most ONE element drawing the eye to a change | multiples; looping; decoration |
| `.ta-morph` | MORPH | shared-element FLIP (pattern reserved for Phase 3) | — |
| `.ta-ambient` | AMBIENT | subtle background life (see §6) | foreground content |

## 4. JS layer (`src/lib/motion.ts`)

- `MOTION_PRESETS` / `MOTION_TOKENS`: plain data (framework-agnostic preset spec).
- `initReveals()`: one-shot `IntersectionObserver`; adds `[data-dir]` on first intersect then
  `unobserve`s; removes `will-change` after `animationend`. Exposes `window.__taMotion` counters.
- `initAmbient()`: desktop-gated; pauses via `[data-ambient-paused]` when off-screen and on
  `visibilitychange`/`blur`.
- `prefersReducedMotion()` / `onReducedMotionChange()`: media-query helpers (CSS media + JS hook).

## 5. Performance contract — results

- **Animated properties:** measured live via `document.getAnimations()` across all demos →
  `{ composite, transform, opacity }` only. **No layout/paint properties animated by the grammar.**
  (`composite` is the composite step, not a layout property.)
- **Long tasks:** during demo interaction (warm page) `>50ms` = **0**, total = **0**. The 2 long
  tasks seen on a cold dev load are Turbopack compile, not animation.
- **Layout shift:** CLS = **0.000** during demos.
- **Nothing main-thread on scroll:** reveals/ambient use observers; scroll handler is a throttled
  rAF FPS readout only.
- **Feedback latency:** `--ta-dur-instant` = 90ms for confirm.
- **Budget:** `--ta-motion-budget` = 8 concurrent/section (documented; enforced by convention).
- **will-change:** removed after reveal (`elementsStillWithWillChange: 0`).

## 6. Ambient behaviour

- `@media (min-width:64rem) html[data-ambient="on"]` only — **off by default on small screens** and
  off unless explicitly enabled.
- Paused off-screen and on `blur`/`visibilitychange` (`[data-ambient-paused]` →
  `animation-play-state: paused`); first thing sacrificed under load.
- Note: a literal 30s backgrounded-tab measurement is not possible in headless CI; the pause wiring
  (`visibilitychange`→`data-ambient-paused`, FPS rAF stop) is code-verified.

## 7. Reduced motion (mandatory)

- Both `@media (prefers-reduced-motion: reduce)` AND `[data-reduced-motion="on"]` collapse all
  movement to short opacity-only and set `animation:none`; `scroll-behavior` restored to auto.
- **Verified:** with reduced on, a `[data-reveal]` element computes `opacity: 1` (nothing invisible)
  and `document.getAnimations().length = 0`. Screenshots: `motion-reduced.png` vs `motion-normal.png`.
- Dev-only override (attribute toggle) present on the specimen for side-by-side testing.

## 8. `/dev/motion` specimen (dev-only)

Sections: all six durations as same-distance side-by-side bars; all five easings drawn as actual SVG
paths with an animating `transform` dot; per-primitive button triggers (target box); live reduced
toggle (OS media + attribute) side-by-side; live FPS readout; preset reference table; reveal/stagger
scroll demo; ambient demo; and the note *"Motion is never the only carrier of information."*

## 9. Test results (1–9) + defect flags

1. **Perf recording:** 0 long tasks >50ms during demos; CLS 0.000. ✔
2. **Animated properties:** transform/opacity only (see §5). ✔
3. **Reduced motion:** OS media + toggle → 0 animations, reveal opacity 1, screenshots both modes. ✔
4. **Interruptibility:** durations/cinematic are transitions; mid-flight retrigger retargets without
   throw (5 transform anims mid-flight → retarget on interrupt). ✔
5. **Leaks:** observer unobserves after fire (`unobserved` increments; 0 elements retain `will-change`). ✔
6. **Backgrounded:** pause wiring code-verified (headless cannot literally background). ◐
7. **320px throttled:** `scrollWidth == innerWidth == 320` (no overflow); ambient off on small. ✔
8. **Prod build + `/dev/motion` 404:** prod `/`→200; `/dev/motion`, `/dev/tokens`, `/dev/type`→404. ✔
9. **Git:** see §10.

**Defect flags (pre-existing, out of scope, not edited):** legacy components animate
`background-color/border-color/color/box-shadow` on hover (micro-feedback from earlier phases). These
predate this step and are intentionally left untouched ("do not restyle"); recommend migrating hover
feedback to transform/opacity in a future component pass. The specimen itself animates only
transform/opacity.

## 10. Repository state

Not a git repository. Raw output:

```
$ git status --porcelain
fatal: not a git repository (or any of the parent directories): .git
(exit code 128)
```

No `git init` performed, per instruction.
