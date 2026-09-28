# Phase 3 · Step 5 — The Ambient Layer (Atmosphere in Depth)

Highest-risk step, built as a bounded, degradable, honest system with ONE subject (Mathematics) in full depth.
No routing, no homepage, no environment shell (3.6). Raw WebGL — **NO 3D library added** (see §1).

Screenshots: `/home/user/shots12/` (`ambient-active-dark.png`, `ambient-reduced.png`, `ambient-dark.png`,
`ambient-light.png`).

---

## 1. Files created / modified + packages added

Created only:

- `src/lib/ambient/contract.ts` — renderer contract + deterministic 2D→3D mapping + motionChar params.
- `src/lib/ambient/webgl-lattice.ts` — raw-WebGL line renderer (lazy chunk), lifecycle + disposal + context loss.
- `src/lib/ambient/eligibility.ts` — battery/capability signals + decision thresholds.
- `src/components/ambient/ambient-stage.tsx` — one-canvas Stage orchestrator (Room refuses canvas).
- `src/app/dev/ambient/page.tsx` + `preview.tsx` — dev-only specimen.

Modified: none. Brand frame, schema, marks, grammar, switch, primitives, tokens, existing routes untouched.
**Packages added: NONE.** three.js (~600KB) was not installed; the lens is raw WebGL in a **5,116-byte** lazy chunk.
Verified: the only chunk containing WebGL code is `.next/static/chunks/2v14q6-d6hou8.js` (5.1KB); the marker string is
absent from the main/webpack/layout chunks, so it is never in the initial bundle and is absent from any Room bundle.

## 2. The renderer contract

The ambient layer CONSUMES grammar output (`MotifData`) and never re-implements motif logic nor imports a subject
config (3.1 guard green). `toSpatial()` is a PURE function mapping each grammar element to 3D segments (layer → depth;
nodes → cross ticks; the ONE emphasised path → nearest plane). It receives per mount: primitive data, subject accent
(resolved RGB passed in), density, motionChar, and the ambient budget. Determinism carries over (§15).

## 3. motionChar as parameters, not code paths

`MOTION_CHAR_PARAMS` maps all six characters to movement parameters (cycleSeconds / maxCameraMove / maxParallax /
wobble). One renderer reads them; Mathematics (`precise`) = 48s cycle, 0.35 camera, 0.22 parallax, 0 wobble. Character
is data.

## 4. The Mathematics ambient layer

The lattice is expressed spatially: quiet grid lines recede (z −1.6…−0.2), the emphasised path sits nearest (z +0.6),
nodes as ticks — the same structural idea (rational subdivisions + one emphasised path), precision as character
(no wobble, no drift). SLOW (48s cycle), SUBTLE (opacity 0.35/0.8 lines), NON-COMPETING, genuinely spatial (depth =
hierarchy). Derived only from grammar data; nothing invented.

## 5. Per-frame work (justified)

Advance one time scalar · compose one reused 4×4 view-projection · set 3 uniforms · 2 `drawArrays` (field + emphasis).
Allocation-free, no layout reads, no GC churn. Measured: 2 draw calls, 52 vertices, ~16.7ms on software WebGL (60fps
capable), dpr capped at 1.5.

## 6. Lifecycle enforcement points

- Off-screen pause: IntersectionObserver → `pause()` (readout running:false off-screen, true back).
- Blur/background stop: visibilitychange/blur → `pause()` (running:false).
- Frame-budget step-down: EMA >34ms for 90 frames → `suspend()` automatically, no reload.
- Room refusal: `scope !== "stage"` returns before any canvas/gl — observed `room refused: true`.

## 7. Disposal verification (30× mount/unmount)

Module-level lifetime counters: created buffers=60 programs=30 textures=0; disposed buffers=60 programs=30. created ===
disposed → **no leak**. (3 buffers-equivalent per mount: 2 buffers + 1 program.)

## 8. Context loss

`webglcontextlost` preventDefault → stop + `load: fallback` (SVG stands in); `onRestored` re-inits. Forced loss produced
`load: fallback` with **zero console errors**.

## 9. Lazy loading + measured bundle impact

`webgl-lattice` + `contract` are dynamically imported; the SVG substrate renders first (8 substrate paths present
immediately, canvas opacity 0), fades in only when ready — no spinner, no layout shift. Measured CLS across arrival
0.0039 (entirely from the dev readout text reflow; the absolutely-positioned canvas shifts nothing). Lazy chunk 5,116 B,
separate from main/webpack/layout.

## 10. Motion-safety numbers

Mathematics (precise): max camera movement **0.35** world units, max parallax **0.22**, cycle **48s**, wobble **0**. No
flashing/strobing: opacity-only fade-in, constant low alpha, linear slow drift.

## 11. THE FIVE-SUBJECT RECOMMENDATION (required deliverable — approval needed before building)

- **Physics (field): WEBGL worthwhile (moderate).** Streamlines earn depth; params count/strength/centre/direction. Low
  risk; build after Mathematics.
- **Chemistry (bonds): WEBGL worthwhile (moderate).** Bond graph + open sites in space; moderate risk (legibility).
- **Biology (living): BORDERLINE — prefer vector.** Layered SVG membranes + slow CSS drift read better; 3D adds cost/risk.
- **English (typographic): DO NOT USE 3D.** Flat page of rules; token-driven CSS/SVG depth is better and ~free.
- **History (strata): DO NOT USE 3D.** CSS translateZ/opacity stack conveys archival depth at a fraction of the cost.
Rendered as prose on `/dev/ambient`.

## 12. Fallback evidence

- no-JS: raw HTML contains `data-ambient-scope="stage"` + substrate SVG + an inert opacity-0 canvas — complete vector
  environment server-side.
- no-WebGL (kill switch): `load: svg`, substrate baseline.
- reduced motion: `load: off`, substrate (8 paths) remains, environment recognisable. Screenshot.
- low-power / small-screen kill switches: off by default. Mobile 320px: `load: svg`, no overflow.
- load-arrival CLS ≈ 0.004 (canvas contributes none).

## 13. Specimen route (dev-only, deferred labelled)

`/dev/ambient` gated `NODE_ENV !== "production"` (prod → 404). Has: Mathematics Stage with ambient active, live
frame/draw-call readout, load-state demo, kill switches (reduced/off-screen/blur/frame-budget/context-loss/low-power/
small-screen/no-webgl), context-loss button, 30× mount/unmount with resource counts, Room-forbids demo, reduced-motion
side-by-side, the five-subject recommendation, and a real-vs-deferred note (five subjects unbuilt by design; hero
integration Phase 4; shell 3.6).

## 14. Deferred, nothing half-built

Deferred: the other five subjects (await approval), hero integration (Phase 4), environment shell (3.6). The lens is a
complete, disposed, degradable system for Mathematics; nothing stubbed. No post-processing, no textures, no model
loaders, no physics/particle libs.

## 15. Confirmations

Guard PASS; validator ALL VALID; `tsc`/`eslint` 0 errors. Determinism: Mathematics ambient geometry 20 loads → hash
`748c59cc`, identical. Both themes captured. axe 0 violations; canvas `aria-hidden`, `tabindex -1` (out of tab order).
Zoom/text-spacing: nothing breaks (layer is pointer-events none, absolute). `git status --porcelain` →
`fatal: not a git repository` (exit 128).

**Battery/CPU signals used:** prefers-reduced-motion, innerWidth<768, WebGL availability, hardwareConcurrency≤4,
deviceMemory≤4, battery (level<0.25 && !charging) where reportable. Headless reported 2 cores → layer correctly off by
default; the ACTIVE path was demonstrated via the specimen's force-on control.

Stopped before Step 3.6 and before building the other five subjects, as instructed.
