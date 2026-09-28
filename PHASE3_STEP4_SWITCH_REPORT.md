# Phase 3 · Step 4 — The Subject Switch

The signature moment, built as orchestration (a state machine), not a pile of tweens. No routing; operates on
3.1 subject state; route wiring is 3.5. Depends on 3.1/3.2/3.3 (all read). Screenshots: `/home/user/shots11/`
(`switch-dark.png`, `switch-light.png`, `switch-nojs.png`).

---

## 1. Files created / modified

Created only:

- `src/lib/switch/machine.ts` — phase machine, tier plans, phase/transfer math.
- `src/lib/switch/ceremony.ts` — session ceremony-rationing rule.
- `src/lib/switch/tier.ts` — degradation ladder + exact selection thresholds.
- `src/lib/switch/morph.ts` — per-pair interpolate-vs-crossfade decision.
- `src/components/switch/subject-switch.tsx` — the client orchestrator (progressive enhancement).
- `src/app/dev/switch/page.tsx` — server gate + SSR environment (no-JS correct).
- `src/app/dev/switch/preview.tsx` — the specimen (controls, telemetry, interruption panel).

Modified: **none**. Brand frame, schema, marks, grammar, primitives, tokens, existing routes untouched.
`tsc`/`eslint` 0 errors; 3.1 guard + validator green; `next build` passes.

## 2. THE STATE MACHINE (as implemented)

`IDLE → PREPARE → QUIESCE → TRANSFER → ARRIVE → SETTLE → IDLE` (`machine.ts`, `subject-switch.tsx`).
- **PREPARE**: destination `generateMotif` runs (deterministic, ~2ms) before any movement; capped by `prepareBudget`.
- **QUIESCE**: no movement; outgoing emphasis stops; content readable.
- **TRANSFER**: layered crossfade of two pre-rendered motif layers + accent interpolation on small elements.
- **ARRIVE**: `currentId` set → interactive (`interactiveAt`).
- **SETTLE**: prune to a single layer, announce, focus, → IDLE.
- No phase skipped except by degradation (a tier's plan omits phases). Convergence: rAF clamps to `total`,
  `finish()` idempotent, every interrupt lands on one stable layer (proven, §8/§5).

## 3. Colour techniques, where + why

- **FULL-BLEED** (motif/substrate layers): **LAYERED OPACITY CROSSFADE** — animate `opacity` (compositor property)
  on two pre-rendered layers. Never interpolate accent custom properties across the viewport (full-screen repaint
  = the classic stuttering "cinematic" bug).
- **SMALL elements** (subject mark + name): **TRUE ACCENT INTERPOLATION** via rAF lerp of the accent hex, because the
  painted area is tiny.
Measured: full-bleed frames drive opacity only; worst frame on headless software rendering 37.6ms, **0 long tasks
>50ms**; on GPU-backed desktop this is compositor-only.

## 4. Morph approach PER PAIR + fallbacks

Interpolation is used only where the two sides share ONE rule set (a self morph). **Every distinct subject pair uses
layered crossfade** — their motifs share no single rule set, and per-frame regeneration of two rule sets would exceed
the frame budget (a dense substrate is ~340 path commands). `morphFor()` encodes + reports this. Observed
`approach: crossfade` for all cross-subject transitions. This is the documented, budget-driven fallback the brief
requires.

## 5. morphTarget continuity anchor

The persisting anchor is the **subject identity slot (mark + name)** — it survives every phase and carries the accent
interpolation, matching each subject's declared `morphTarget` (all name a mark/node/origin). The brand frame (brass
mark, wordmark, nav, type, buttons) is OUTSIDE the switch and never moves.

## 6. Ceremony-rationing rule (as implemented)

`ceremony.ts`: first entry into a subject this session → **full**; subsequent switch → **shortened (0.6×)**; ≥2 prior
triggers inside 1500ms → **shortest (instant)**. Tracked per session in code; verified: rapid5 collapses to instant.

## 7. Degradation ladder + EXACT selection logic

`tier.ts#selectTier`, printed on the specimen:
forced? → that · prefers-reduced-motion → instant · ceremony shortest → instant · prep fail → instant · desktop
(hwConcurrency > 4 AND width ≥ 1024 AND fine pointer) → full else reduced · shortened caps full→reduced · avg frame
>24ms → one step down · >33ms → instant.

## 8. Interruption matrix (observed)

| Situation | Result |
|---|---|
| New trigger mid-flight | retargets; last wins; single layer after settle (biology) |
| 5 rapid triggers | converges to english; ceremony→instant; no flicker/accumulating timers |
| Abort | resolves to stable single layer (history) |
| Navigate/abort mid-flight | clean; raf=0 |
| Tab backgrounded mid-flight | completes instantly + announces (documented choice) |
| Reduced motion | instant swap, full function, announcement fires |
| Offline/failing prep | instant honest fallback (prep=fail) |

## 9. Frame timings + total budget per tier (measured)

| tier | trigger→interactive | trigger→settle | ≤700ms |
|---|---|---|---|
| full | 600 | 671.7 | ✓ |
| reduced | 360 | 405.8 | ✓ |
| short | 200 | 241.8 | ✓ |
| instant | 0 | 0 | ✓ |
Worst frame 37.6ms (headless, no GPU), long tasks 0. Shortened/shortest within budget.

## 10. Orphan-resource verification

Instrumented `requestAnimationFrame`/`cancelAnimationFrame` to count active loops. After 20 switches + 5 mid-flight
aborts: `__rafActive = 0`, single visible layer; observers disconnected on unmount; visibility listener removed on
unmount. No accumulating timers/observers.

## 11. Preparation success / slow / failure

ok: ~2ms, full plan. slow (140ms busy-wait > budget): transition shortens one step (reason logged). fail: instant
honest fallback + announcement, no spinner/dead end.

## 12. Announcement implementation + transcript

A visually-hidden `aria-live="polite" role="status"` region; set once per transition on ARRIVE. Observed:
"Now entering Physics — The Field — forces you can feel." Transcript printed live on the specimen. Polite, single
announce per trigger (no double).

## 13. Focus, both trigger types

inline (specimen chooser): activeElement stays on the trigger (`BUTTON:physics`). navigation mode: focus lands on the
identity heading (`data-switch-identity`). Both verified.

## 14. Brand-frame invariance

`getBoundingClientRect` of `[data-brand-frame]`, `[data-brand-type]`, `[data-brand-button]` captured before / during /
after each tier's transition — **identical** for all tiers (brandIdentical: true). The switch never touches them.

## 15. Hydration + no-JS

Direct load: **0 hydration warnings** (console = React DevTools info + HMR only). No-JS (JS disabled): SSR renders 1
layer / 4 motif paths / identity "Mathematics" / phase IDLE — correct environment with no transition. `switch-nojs.png`.

## 16. Specimen route

`/dev/switch`, gated `NODE_ENV !== "production"` (prod → 404). Has: live switcher (6), frame-timing readout, live phase
indicator, interruption panel (mid-flight / 5× rapid / abort / background), degradation control (force tier), reduced-
motion toggle, announcement transcript, brand-frame-unchanged panel, and a real-vs-deferred note (routes 3.5; ambience/3D
3.5/Phase 4).

## 17. Deferred, nothing half-built

Deferred: route integration (3.5), ambience + 3D (3.5 / Phase 4). The switch drives existing 3.3 motif layers; nothing
stubbed. No homepage/subject routes; no new deps; no scroll-jacking; no route-change animation.

## 18. Nothing in brand frame / schema / marks / grammar / primitives / routes changed

Only the files in §1 added. 3.1 guard PASS; validator ALL VALID. Determinism (test 11): each destination generated 50×,
geometry identical — hashes: mathematics ab0e97e4, physics 78728791, chemistry 9d2ca78f, biology a8fecfbb, english
fbd408d9, history 54f5c62e. axe 0 violations; CLS not applicable (fixed layers); 320px + 400%-zoom no overflow.
`git status --porcelain` → `fatal: not a git repository` (exit 128).

**Audit note:** Lighthouse not installed (no new deps) — axe used (0 violations across the route).

Stopped before Step 3.5 as instructed.

---

## ADDENDUM — FRESH RE-VERIFICATION (after Step 3.6, same code + ThemeToggle hydration fix)

Re-ran the full battery against the current tree. All prior claims hold; numbers below replace any
older ones where they differ.

- Frame timing (headless swiftshader): full tier warm worst frames **17.8 / 31.6 / 20.5ms** (the
  single 55.5ms observation was a cold-start artifact); long tasks >50ms: **0** in every run.
  CPU×4 throttled: auto→reduced worst 35.4ms settle 246.7ms; forced full worst 45.5ms settle 413ms.
- Budgets per tier (trigger→interactive / trigger→settle): full 600 / 676.9ms; reduced 360 / 410.6;
  short 200 / 257.8; instant 0 / 0. All ≤700ms; interactive no later than ARRIVE.
- Phase sequences observed live: full [TRANSFER,ARRIVE,SETTLE,IDLE], reduced
  [QUIESCE,TRANSFER,ARRIVE,SETTLE,IDLE], short [TRANSFER,ARRIVE,IDLE], instant [IDLE] — degradation
  omits phases, never leaves one mid-state.
- Prep slow (140ms over budget) → tier short, "transition shortened", settle 244.6ms. Prep fail →
  instant + honest announcement ("Now entering History — The Record — layered, archival.").
- Reduced motion → instant + announcement ("Now entering Mathematics — The Lattice — structure you
  can stand on."), transcript single-entries only (no double-announce).
- Focus: navigation-triggered → `H2[data-switch-identity]`; inline-triggered → focus stays on the
  triggering BUTTON.
- Brand frame: geometry of lockup/type/button pixel-rect-identical before vs mid-TRANSFER.
- Interruption matrix: mid-flight retarget (last wins, English, 1 layer), 5× rapid (converges, 1
  layer), abort (IDLE, 1 layer), backgrounded mid-flight → completed instantly (documented choice),
  aborts at 30/120/300/520ms all converge. Orphans: instrumented rAF/cAF wrappers show **0 active
  rAF** after 20 switches + 5 aborts; phase IDLE; 1 layer.
- Determinism: destination geometry 50× identical per subject (serialised hashes compared in a
  node harness; all six `true`).
- Hydration/no-JS: console `[]` on load; curl of /dev/switch returns the server-rendered surface
  with identity ("Mathematics") and no transition.
- Themes: transitions captured mid-TRANSFER in dark and light (`shots14/`).
- 320px: ladder selects reduced; scrollWidth 320; text-spacing overrides cause no overflow.
- axe: **0 violations** across all six subjects AND all four tiers on /dev/switch.
- Production: build succeeds; /dev/switch → **404**. `git status --porcelain` →
  `fatal: not a git repository` (exit 128).

### Wording correction (Step 3.6 report)
The 3.6 report said route navigation "runs the switch at its instant-tier semantics". Precisely:
the route-level controller does NOT run this machine; it performs the switch's SETTLE duties —
one polite announcement plus heading focus — after a client navigation, with no motion (which is
what the instant tier produces). The machine, its ladder and its ceremony run only on surfaces the
switch owns (/dev/switch; later the Phase 4 chooser), exactly as this brief's "NO ROUTING" rule and
3.6's "MAY run the switch" permit. Nothing in this step was wired to routes.
