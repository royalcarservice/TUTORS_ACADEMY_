# Subject Mark Language — "Same Hand, Different Idea"

All six subject marks + the brand mark ("The Unbroken Line") are ONE family drawn by one hand.
Symbolic single-stroke figures. No motif grammar, environment art, ambience or animation here.

## Stroke weight class
Ratio of the canvas, not a pixel value: **stroke = 2.5 / 32 ≈ 0.078 of the optical canvas**.
Because the geometry lives in a 32-unit viewBox and scales via `width/height`, the ratio holds at
every size 16→200px. (The brand mark uses the identical 2.5/32 class.)

## Terminal treatment
**Round caps** on every free end (`stroke-linecap="round"`), identical to the brand mark. This is the
single strongest family cue — all seven marks end the same way.

## Corner / join treatment
**Round joins** (`stroke-linejoin="round"`); no mitres, no bevels. Curves are joined with continuous
tangents where a curve meets a curve; a curve meeting a straight does so tangentially (no kink) except
where a deliberate "fold" is the idea (Mathematics).

## Optical canvas
Drawing box = 32×32 with a live inset of ~5–6 units, so each figure's *visual* mass — not its
mathematical bounding box — matches the others. Tall/thin figures (Physics) run wider; wide/low
figures (History) run taller, to equalise perceived size.

## Curve character
Shallow, confident arcs — control points kept near the chord so curves read as one gestural quality
everywhere (see Biology's lens, Physics's entry). No tight spirals, no S-overload (≤2 curve commands).

## Single-stroke requirement
Each mark is ONE continuous path where the figure allows (Mathematics, Physics, Biology, English).
Documented exceptions (deliberate, not convenience):
- **Chemistry** — a closed vessel PLUS one interior trace = 2 subpaths (a vessel *holds* a reaction).
- **History** — the idea IS interruption: segments with drawn gaps = multiple subpaths.

## Complexity ceiling
**≤ 10 path commands per mark.** If a figure cannot fit, simplify the figure, not the cap.
Actuals: Mathematics 7 · Physics 3 · Chemistry 9 · Biology 3 · English 4 · History 6.

## Colour / form
`currentColor` only; single-colour capable; no gradients, fills, opacity tricks, raster, or
`stroke-dasharray` for the core figure (History's gaps are drawn, not simulated).
