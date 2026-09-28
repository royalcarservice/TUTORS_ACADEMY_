# Motif Grammar — structure, not artwork

Phase 3 · Step 3. Static structure only: no animation, no ambient layer, no 3D,
no transition choreography (those are 3.4–3.5).

Six subjects × six roles × two themes would be 36 hand-maintained artefacts.
Instead there is **a small vocabulary of geometric primitives plus per-motif
rules that produce structure from a seed**. Everything downstream — hero,
cards, dividers, recording lists, the subject switch — inherits coherence
instead of becoming a bespoke art task.

---

## 1. The seed rule

```
seed string = `<subject.id>:<purpose>:<compositionIndex>`
hash        = FNV-1a, 32-bit, over the UTF-16 code units of that string
stream      = mulberry32 seeded with that hash
```

- `purpose` is what the motif is doing (`substrate`, `room`, `legibility-probe`…),
  so two placements of the same subject differ while each stays reproducible.
- `index` separates repeated placements inside one composition.
- Rebuilds are byte-identical: same seed → same numbers → same `d` strings.
- Nothing else in the system produces variation. There is no `Math.random`,
  no `Date`, no `performance.now`, no unordered iteration in generation.

The visible proof is `MotifData.hash` — an FNV-1a fingerprint of the emitted
geometry only (points + params), shown per motif on `/dev/motifs`.

## 2. The primitive vocabulary (`primitives.ts`)

Pure geometry producers. They return **data**, never markup, never colour,
and never read the viewport — alignment derives from the composition `Box`
they are handed.

| Primitive | Data | Animatable parameters (driven in 3.5) |
|---|---|---|
| `LINE` | two points | `length`, `angle`, `reveal` |
| `POLYLINE` | ordered vertices | `segments`, `reveal`, `phase` |
| `CURVE` | control polygon → Catmull-Rom cubic | `tension`, `curvature`, `phase`, `reveal` |
| `NODE` | centre + radius (the only filled primitive) | `r`, `pulse` |
| `EDGE` | two nodes, angle **snapped** to a constrained set | `length`, `angle`, `reveal` |
| `BAND` | origin, end, thickness, subdivisions | `thickness`, `subdivisions`, `offset`, `reveal` |
| `FIELD` | n streamlines sharing one displacement function | `count`, `direction`, `strength`, `centre`, `phase` |

**Family link to the marks (3.2).** Motif strokes keep the mark family's
terminals (round caps), joins (round) and curve character (shallow arcs,
control points near the chord, `tension` ≤ 0.55). Weight is *derived*, not
copied: marks use 2.5/32 = 0.078 of their canvas; structural fields use
`STROKE_RATIO = 0.0055` of the box minor axis, so marks read as **marks** and
motifs read as **structure**. Three weight classes: `hairline` ×1, `line` ×1.5,
`emphasis` ×2.25.

## 3. The six rule sets (`grammar.ts`)

Each is a pure function `(seed stream, box, density) → data`. Every rule set
declares its angles/curve character, its single emphasis moment, its feature
size window (`0.045–0.62` of the box minor axis), and what must never appear —
as data in `MOTIF_RULES`, so the specimen and this document cannot drift.

| Motif | Subject | Structure | Emphasis (always exactly 1) | Never |
|---|---|---|---|---|
| `lattice` | Mathematics | rational grid + subdivisions, 0/90 only | one polyline walk threading the grid | curves · filled cells · a second emphasised path · angles outside 0/90 · a node on every intersection |
| `field` | Physics | streamlines from one shared displacement function | one streamline that resists the field and leaves straight | crossing lines · radial bursts · arrowheads · closed loops · orthogonal grids |
| `bonds` | Chemistry | nodes under valence limits, 60° angle set, open reaction sites | one double bond (parallel pair) | 5-fold coordination · curved bonds · filled atoms · letters · off-set angles |
| `living` | Biology | branching growth ×0.62 per level, max depth 3, asymmetric bifurcation | one growth tip | straight lines · right angles · symmetric trees · >3 levels · closed polygons |
| `typographic` | English | baseline bands (leading 1.6), measure, word-space rhythm | one vertical margin rule | glyphs · curves · diagonals · frames · more than 7 rules |
| `strata` | History | stacked bands of varying thickness, every band broken | one stratum edge (the index stratum) | full-width continuity · curves · grids · diagonals · axis marks |

**Lines never cross in `field`** — by construction, not by checking: every
streamline is a vertical offset of the *same* displacement function, so their
order is preserved for all x.

**Valence in `bonds`** — the chemical ceiling is 4, growth stops at degree 3,
so free valence (open reaction sites) always exists; up to two are marked with
a short unfilled tick.

`MOTION_HOOKS` declares which parameters each motif will modulate in 3.5
(e.g. `living` → `curve.reveal`, `curve.curvature`, `node.pulse`). Declared
now so Step 3.5 animates parameters instead of regenerating structure.

## 4. Composition roles (`budgets.ts`)

| Role | Coverage cap | Contrast ceiling | Room? | Behind text? |
|---|---|---|---|---|
| `substrate` | as declared | 1.6:1 | no | no |
| `edge` | 0.22 (one edge only) | 2.0:1 | yes | no |
| `divider` | 0.12 (thin) | 2.0:1 | yes | no |
| `focus` | 0.10 (tiny) | 3.0:1 | yes | no |
| `transition` | as declared | 2.4:1 | no | no |

Each role owns a **canonical composition box** (`ROLE_BOX`: substrate
1000×600, edge 360×600, divider 1000×96, focus 360×360). Geometry is generated
in those fixed units and the SVG scales its viewBox — so the numbers never
depend on a viewport. That is the whole SSR-safety argument.

### Content exclusion (the non-negotiable)

Any motif beneath text is capped at its role's contrast ceiling **and masked
out of text regions**. `Motif` takes `exclude` rects (fractions of the
composition box) and punches them out with an SVG `<mask>`; `Stage` and `Room`
default to `READING_COLUMN` (the reading measure). Edge roles additionally
fade inward with a linear-gradient mask. No filter, no blur.

Motifs are **never** baked into raster: vector only, so they stay theme-aware,
accent-aware, cheap and scalable.

## 5. Density and budgets

`density` (from the 3.1 config) scales **structure — feature counts — never
opacity and never weight**.

| Density | Multiplier |
|---|---|
| `sparse` | 0.6× |
| `balanced` | 1.0× |
| `dense` | 1.4× |

Hard global ceilings density can never exceed (`budgets.ts`):

- `MAX_COMMANDS = 400` path commands per surface
- `MAX_DOM_NODES = 12` SVG child elements per surface — the renderer groups by
  layer × width × paint, so a dense motif is a handful of `<path>` elements
  with many subpaths, never hundreds of `<line>` nodes
- `MAX_GEN_MS = 8` generation time per surface (measured on `/dev/motifs`)

Caps are enforced in `grammar.ts#enforceCaps`: over budget, the **quietest**
features are dropped first (`quiet` → `base` → `mid`); the emphasis moment is
never dropped.

Softness uses **opacity layering** (quiet 0.55 / base 0.8 / mid+emphasis 1.0 of
one role ceiling) and **gradient masks**. No filters, blur, drop-shadows or
blend modes anywhere. Generation is pure and synchronous — no layout reads.

## 6. Renderer (`components/motif/motif.tsx`)

Server component, no `"use client"`. Output format: `MotifData` (points +
params + hash) → grouped `<path>` fragments. Explicit dimensions
(inset for absolute roles, `aspect-ratio` for flow roles) so no layout shift.
`aria-hidden="true"` on the wrapper and the SVG. Colour only from
`var(--ta-accent-1|2|3)`; no subject config import, so the 3.1 guard holds.

A future WebGL renderer imports `generateMotif()` and consumes
`MotifElement.points` / `.params` directly — the design is not redefined, only
the paint step is.

## 7. Stage and Room (`components/motif/stage.tsx`)

- `Stage(subject)` — substrate permitted, full density, text region excluded.
- `Room(subject)` — substrate **impossible**: `RoomMotifRole` excludes
  `substrate`/`transition` at the type level, and `isRoleAllowed("room", role)`
  refuses them at runtime. Density is reduced one step; accent is retained via
  the same `[data-subject]` scope.
- A Room nested in a Stage inherits the accent but has no substrate code path.

## 8. Placement rules

Motifs belong: behind a Stage (substrate) · on one edge of a Room (depth) ·
between scenes in a Stage (divider) · as a small instrument specimen (focus) ·
as the material of the subject switch (transition, 3.5).

Motifs are **never**: behind body text (masked out, always) · a page background
image or raster asset · a replacement for the brand frame or a subject mark ·
a decoration on every card or list row · animated in this step (3.4–3.5) ·
rendered with blur, filters, shadows or blend modes · generated from the
viewport.

## 9. Deferred

Ambient motion (3.4), 3D/WebGL (3.4), the subject switch transition (3.5).
The parameters those steps animate already exist on every element; nothing
here is stubbed or half-built.
