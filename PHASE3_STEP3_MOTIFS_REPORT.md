# Phase 3 · Step 3 — Motif Grammar

Static structure only. No animation, ambient layer, 3D or transition choreography (3.4–3.5).
Depends on 3.1 (schema) and 3.2 (marks); both read first. The 3.1 schema exists; nothing parallel was invented.

Core decision, locked: **motifs are a deterministic grammar, not drawn artwork** — a small primitive
vocabulary + per-motif rules producing structure from a seed. Six roles × six subjects × two themes would be
36 hand-maintained artefacts; the grammar replaces them.

Screenshots: `/home/user/shots10/` (`motifs-dark-full.png`, `motifs-light-full.png`,
`motifs-dark-mathematics.png`, `motifs-light-mathematics.png`, `motifs-legibility-biology.png`,
`motifs-320.png`, `motifs-zoom-textspacing.png`, `motifs-nojs.png`).

---

## 1. Files created / modified

Created (nothing else touched):

- `src/lib/motif/types.ts` — renderer-agnostic data types (points + params), closed kind/role/density sets.
- `src/lib/motif/hash.ts` — seed rule, FNV-1a, mulberry32, bounded draws.
- `src/lib/motif/primitives.ts` — LINE/POLYLINE/CURVE/NODE/EDGE/BAND/FIELD producers.
- `src/lib/motif/budgets.ts` — role rules, canonical boxes, density multipliers, hard ceilings.
- `src/lib/motif/path.ts` — pure element→`d`, command counting, layer/width/paint grouping.
- `src/lib/motif/grammar.ts` — the six rule sets, declared rules, motion hooks, caps, `generateMotif`.
- `src/lib/motif/MOTIF_GRAMMAR.md` — the written grammar (so the logic survives without the author).
- `src/components/motif/motif.tsx` — the SSR renderer (`<Motif>`), enforcement point.
- `src/components/motif/stage.tsx` — `Stage` / `Room` with roomMood encoded.
- `src/app/dev/motifs/page.tsx` — dev-only specimen (server component, zero client JS).
- `src/app/dev/motifs/measure.ts` — dev-only measurement harness (contrast, determinism, budgets).

Modified: **none** — brand frame, marks, mark spec, schema, primitives (2.5), tokens, existing `/dev/*`
routes, layouts and copy are all untouched. `tsc`, `eslint` (0 errors), `next build` all pass; 3.1 guard +
validator still green.

## 2. The primitive vocabulary

Each returns **data** (points + animatable params), never markup, never colour, never the viewport.

| Primitive | Data | Animatable params |
|---|---|---|
| `LINE` | 2 pts | length, angle, reveal |
| `POLYLINE` | ordered pts | segments, reveal, phase |
| `CURVE` | control polygon → Catmull-Rom cubic (tension ≤0.55) | tension, curvature, phase, reveal |
| `NODE` | centre + r (only filled primitive) | r, pulse |
| `EDGE` | 2 nodes, angle **snapped** to set | length, angle, reveal |
| `BAND` | origin, end, thickness, subdivisions | thickness, subdivisions, offset, reveal |
| `FIELD` | n streamlines from ONE shared displacement | count, direction, strength, centre, phase |

**Anti-alignment rule:** alignment derives only from the composition `Box`; no primitive reads the window.
**Family link to marks (3.2):** round caps/joins, shallow arcs, weight *derived* not copied — marks 2.5/32 =
0.078; motifs `STROKE_RATIO = 0.007` of the box minor axis, with weight classes hairline ×1 / line ×1.5 /
emphasis ×2.25. So marks read as marks, motifs as structure — same hand, different job.

## 3. The six rule sets (dominant angles/curves, emphasis, size window, never-list, density scaling)

All are pure `(seed stream, box, density) → data`. Feature window 0.045–0.62 of the box minor axis. Emphasis
is **exactly ONE per surface** everywhere (asserted). Declared as data in `MOTIF_RULES`:

| Motif | Angles / curves | Emphasis (×1) | Never | Density scales |
|---|---|---|---|---|
| lattice (Math) | 0/90 only | one staircase walk + end node | curves · filled cells · 2nd emphasised path · angles outside 0/90 · node on every intersection | cols/rows/subdivisions |
| field (Physics) | shared shallow displacement, tension 0.45 | one streamline that leaves straight + origin node | crossing lines · radial bursts · arrowheads · closed loops · grids | streamline count |
| bonds (Chem) | 60° set, snapped | one double bond | 5-fold · curved bonds · filled atoms · letters · off-set angles | node count |
| living (Bio) | all-curve, asymmetric bifurcation, ×0.62/level, depth ≤3 | one growth tip | straight lines · right angles · symmetric trees · >3 levels · closed polygons | branch budget |
| typographic (Eng) | 0/90 only | one vertical margin rule | glyphs · curves · diagonals · frames · >7 rules | rules + word rows |
| strata (History) | 0/90; horizontal bands + vertical cores | one index-stratum edge | full-width continuity · curves · grids · diagonals · axis marks | band count |

`MOTION_HOOKS` declares per motif which params 3.5 modulates (declared now, applied later).

## 4. Seed + hashing, and determinism evidence

Seed = `subject.id : purpose : index` → **FNV-1a 32-bit** → **mulberry32**. No `Math.random`, `Date`,
`performance.now` or unordered iteration in generation (the single `Object.keys` is in the fingerprint
serialiser and is explicitly `.sort()`ed).

Determinism harness ran the **real compiled grammar**, 100 generations per subject × role (30 combos),
comparing full serialised geometry AND full JSON: **all byte-identical**. Sample hashes (substrate):
mathematics `2fde2636`, physics `60a90b00`, chemistry `35965225`, biology `24812439`, english `69239db3`,
history `8c0b0dbd`. In-browser: geometry hash identical before/after hydration, 300/300 paths stable.

## 5. The composition grammar (roles, caps, ceilings, exclusion)

| Role | Coverage cap | Contrast ceiling | Room? | Behind text? | Canonical box |
|---|---|---|---|---|---|
| substrate | as declared | 1.6 | no | no | 1000×600 |
| edge | 0.22 (one edge) | 2.0 | yes | no | 360×600 |
| divider | 0.12 | 2.0 | yes | no | 1000×96 |
| focus | 0.10 | 3.0 | yes | no | 360×360 |
| transition | as declared | 2.4 | no | no | 1000×600 |

**Content exclusion:** every role is `behindText: false`. `Motif` accepts `exclude` rects (fractions of the
box) and punches them out with an SVG `<mask>`; `Stage`/`Room` default to `READING_COLUMN`. Edge roles add a
linear-gradient fade mask. Motifs are never raster. Proven live (section 9): real paragraphs over each
densest motif with the mask on, measured.

## 6. Density multipliers + global ceilings (measured vs declared)

Multipliers sparse 0.6× / balanced 1.0× / dense 1.4× — applied to **feature counts**, never opacity/weight
(asserted: counts rise 0.6→1.0→1.4 per subject while no opacity field exists in the data).

Hard ceilings (never exceeded by density): `MAX_COMMANDS = 400`, `MAX_DOM_NODES = 12`, `MAX_GEN_MS = 8`.
Measured worst per subject (dense): commands max **340** (history focus), DOM nodes max **8**, generation max
**0.64ms**. Over budget, `enforceCaps` drops quietest layers first; the emphasis moment always survives.

## 7. Renderer architecture (SSR, output, future WebGL)

Server component, no `"use client"`. `generateMotif()` → `MotifData` (points + params + hash) → grouped into a
few `<path>` fragments by layer × width × paint (measured max 5 paths per SVG). Explicit dimensions
(inset for absolute roles, `aspect-ratio` for flow roles) → no CLS. `aria-hidden="true"` on wrapper + SVG.
Colour only from `var(--ta-accent-1|2|3)`; theme via `[data-theme]`, no conditional JS. Softness = opacity
layering (quiet 0.8 / base 0.9 / mid+emphasis 1.0 of one role ceiling) + gradient masks — **no filters, blur,
drop-shadow or blend modes** (grep-confirmed; DOM `filters`/`images` = 0).

A future WebGL renderer imports `generateMotif()` and consumes `MotifElement.points`/`.params` directly; it
never touches `motif.tsx`. The design is not redefined, only the paint step is.

## 8. Stage/Room enforcement point

`src/components/motif/stage.tsx` + `motif.tsx`:
- Type level: `RoomMotifRole = Exclude<MotifRole, "substrate" | "transition">` — a Room substrate is a type error.
- Runtime: `isRoleAllowed(scope, role)` returns `false` for substrate/transition in a room, so `<Motif>` renders
  nothing (printed on the specimen: `isRoleAllowed(room, substrate) === false`).
- `Room` reduces density one step (`reduceDensity`) and retains the accent via the same `[data-subject]` scope.
Browser-verified: 3 Stage substrates, **0** substrate/transition inside any of 6 Rooms; room roles observed
edge/divider/focus only.

## 9. Live legibility results (text over each densest motif, both themes)

Real study paragraphs over each subject's dense motif at substrate and edge, reading column excluded. Measured
(text-primary vs the pixel under it). **All ≥ 4.5 (AA), both themes; zero failures.** Representative (dense):

| subject | role | theme | text on excluded surface | text if unmasked (worst) | AA | motif:surface | ceiling |
|---|---|---|---|---|---|---|---|
| biology | substrate | dark | 17.75 | 12.64 | PASS | 1.40 | 1.6 |
| biology | edge | dark | 17.75 | 11.38 | PASS | 1.56 | 2.0 |
| history | focus | dark | 17.75 | 8.69 | PASS | 2.04 | 3.0 |
| mathematics | substrate | light | 18.36 | 14.51 | PASS | 1.27 | 1.6 |

Ceiling breaches across all subjects/roles/themes: **0**. Screenshot `motifs-legibility-biology.png`.

## 10. Budget readout per motif (worst role, dense)

| subject | elements | commands/400 | dom/12 | gen ms/8 |
|---|---|---|---|---|
| mathematics | 87 | 206 | 7 | 0.167 |
| physics | 16 | 79 | 7 | 0.091 |
| chemistry | 36 | 106 | 7 | 0.415 |
| biology | 20 | 65 | 7 | 0.091 |
| english | 75 | 150 | 6 | 0.149 |
| history | 53 | 340 | 8 | 0.639 |

All PASS.

## 11. Hydration / SSR

Zero hydration warnings (console shows only React DevTools info + HMR). Geometry hash identical before/after a
2.5s settle (300/300 paths). With JS **disabled** the page still renders 75 motifs / 300 paths / 3 Stage
substrates / 0 Room substrates — the structure is in the HTML on first paint. `motifs-nojs.png`.

## 12. Specimen route

`/dev/motifs`, gated behind `NODE_ENV !== "production"`. Renders all six motifs × five roles; a density control
(links, sparse/balanced/dense) that changes counts without touching opacity; the live legibility test with
measured ratios; a determinism proof (100× per motif + a re-render nonce deliberately outside the seed); a
budget readout; both themes; Stage vs Room; a written grammar explainer; and a real-vs-deferred note.
Production: `/dev/motifs` → **404** (verified with `next start`).

## 13. Deferred, nothing half-built

Deferred: ambient motion (3.4), 3D/WebGL (3.4), subject-switch transition (3.5). The parameters those steps
animate already exist on every element (see `MOTION_HOOKS`); nothing is stubbed. No homepage, no subject routes,
no raster, no new dependencies.

## 14. Confirmation nothing in the brand frame / marks / schema / primitives / routes changed

Only the files in section 1 were added. 3.1 guard: PASS. 3.1 validator: ALL SUBJECTS VALID. `tsc` / `eslint`
0 errors. Existing `/dev/*` routes unchanged and still 404 in prod. `git status --porcelain` →
`fatal: not a git repository (or any of the parent directories): .git` (exit 128), pasted verbatim.

---

### Note (flagged, not edited)
Step 3.2 is a **closed** deliverable and this step may not modify the marks or their spec, but for accuracy:
`subject-marks.ts` declares `commands: 6` for History while the path `M6 9 H26 M6 16 H14 M18 16 H22 M6 23 H12`
contains 8 commands (M/H ×4). The Step-2 report counted 8. This is an annotation discrepancy in the closed
Step-3.2 file only; it does not affect the motif grammar, and I have **not** edited that file.

**A11y / responsive / audit:** 75/75 motifs `aria-hidden`, 0 in the accessibility tree, 0 `role=img`, no text
inside motifs. CLS 0. axe 0 violations. 320px: no horizontal overflow. 400% zoom + text-spacing overrides: no
overflow, no clipped text. Lighthouse not run (not installed; no new deps) — axe used instead.

Stopped before Step 3.4 as instructed.
