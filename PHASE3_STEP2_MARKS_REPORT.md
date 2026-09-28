# Phase 3 · Step 2 — The Six Subject Marks

Marks only. No motif grammar, environment art, ambience or transition choreography (3.3–3.5).
Screenshots: `/home/user/shots9/` (`marks-dark.png`, `marks-light.png`).

## 1. Files created / modified

- `src/components/brand/SUBJECT_MARK_LANGUAGE.md` — the mark language spec.
- `src/components/brand/subject-marks.ts` — pure path geometry (no colour, no config import).
- `src/components/brand/subject-mark.tsx` — `SubjectMark` component.
- `src/app/dev/marks/{page,loader,preview}.tsx` — dev-only specimen.
No brand mark/wordmark/favicon, schema, primitive or existing route was changed.

## 2. THE MARK LANGUAGE SPEC (pinned, measurable)

- **Stroke weight class:** 2.5 / 32 ≈ **0.078 of the optical canvas** (ratio, not px) — identical to the brand mark; holds 16→200px via the 32-unit viewBox.
- **Terminals:** round caps on every free end — the family cue, same as brand.
- **Joins:** round joins; curve-to-curve tangent-continuous; curve-to-strait tangential except Mathematics' deliberate fold.
- **Optical canvas:** 32×32 with ~5–6u live inset; wide/low figures run wider, tall/thin run taller, to equalise *perceived* size.
- **Curve character:** shallow confident arcs, ≤2 curve commands, control points near the chord.
- **Single-stroke:** one continuous path where the figure allows (Math, Physics, Biology, English). Documented exceptions: Chemistry (closed vessel + interior trace = 2 subpaths), History (interruption is the idea = drawn gaps).
- **Complexity ceiling:** **≤10 path commands**. Actuals: Math 7 · Physics 3 · Chemistry 9 · Biology 3 · English 4 · History 8.
- **Colour/form:** currentColor only; single-colour capable; no gradients/fills/opacity/raster/dasharray.

## 3. The six marks + the idea each figures

- **Mathematics** — a line that folds into a lattice and returns along itself → *structure discovered, not imposed.*
- **Physics** — a line entering as a curve, leaving as a straight vector → *force changes a path.*
- **Chemistry** — a closed line containing an interior reaction step → *a vessel holding a reaction.*
- **Biology** — a line that bifurcates, then rejoins → *one origin, many lives.*
- **English** — a line that begins fluid and ends constructed → *the stroke becomes language.*
- **History** — a line progressively interrupted with drawn gaps → *an archive with missing years.*

## 4. Figures changed / rejected

Chemistry's first interior trace (a centred caret) read too close to Lucide's chevron-in-square; replaced with an
off-centre reaction **step** (`M11 18 H15 V12 H20`). No figure was rejected; none needed simplification below the cap.

## 5. Path data + command count vs cap (≤10)

Math 7 · Physics 3 · Chemistry 9 · Biology 3 · English 4 · History 8 — all under the cap.

## 6. Optical sizing at 48px (measured bbox, viewBox units)

brand {20×16} · math {20×16} · physics {22×12} · chemistry {18×18} · biology {20×14} · english {21×12} · history {20×14}.
Widths cluster at 18–22; the lower figures (physics/english/history) are compensated by extra width, so none reads as a
different size class. Chemistry/biology sit taller. Visually equivalent within tolerance.

## 7. 20px row + Lucide confusion tests (honest)

20px row (brand + six): all seven distinguishable — silhouette families differ (bowtie / curve-vector / vessel / lens /
S-bar / strata). Lucide strip at 20px: subject marks are gestural single-stroke figures with round brand terminals;
Lucide glyphs are closed geometric forms — no subject mark is swappable for a Lucide glyph after the Chemistry fix
(biology's pointed lens ≠ Circle; history's gapped strata ≠ AlignLeft).

## 8. Contrast per mark (accent1, graphic ≥3:1) — base/raised/sunken, both themes

math 7.96/7.47/8.21 (ink) · 6.01/5.81/4.64 (ivory); physics 8.70/8.16/8.97 · 4.92/4.75/3.80; chemistry 8.45/7.93/8.71 ·
4.75/4.59/3.67; biology 12.74/11.95/13.14 · 4.76/4.60/3.68; english 8.94/8.39/9.22 · 5.97/5.77/4.61; history
11.68/10.96/12.05 · 5.09/4.92/3.93. All ≥3; no lightness change needed.

## 9. Placement rules (written)

Belong: subject chooser · subject environment shell (identity position) · subject-scoped progress/achievement ·
subject-scoped recordings/class surfaces. NEVER: beside every link/button/list item as decoration · in the nav brand
position (brass, always) · as a favicon (brand mark is the favicon) · as watermark/oversized background · below 16px ·
anywhere a Lucide icon belongs.

## 10. SubjectMark API + config-avoidance

`SubjectMark({ subject, size: 16|20|24|32|48|"display", label?, className? })`. Reads geometry ONLY from
`subject-marks.ts` (no subject-config import), so the 3.1 import guard stays green (verified: guard exit 0). Colour via
currentColor from `[data-subject]` tokens. `aria-hidden` by default; `label` opts into `role="img"`+`<title>`. No
animation/hover/transition.

## 11. Specimen route

`/dev/marks`, dev-only (`notFound()` in prod → 404). Labels real vs deferred (motif 3.3, environment art 3.4,
ambience/transition 3.4/3.5). Shows size ladder, optical comparison, 20px row, Lucide strip, accent on base/raised/sunken
both themes, clear-space/min-size, and the (unneeded) before/after note.

## 12. Deferred / nothing half-built

Motif grammar (3.3), environment art (3.4), ambient + switch transition (3.4/3.5). Marks are complete objects; nothing
stubbed. Reduced motion: marks are entirely static by construction (no animation anywhere). CLS 0 (explicit dimensions).

## 13. Nothing in brand frame / schema / primitives / existing routes changed

Only additions. `tsc`/`lint`(0 errors)/`next build` pass; axe `/dev/marks` = 0 violations; 320px OK; 80 marks render
`aria-hidden` with text beside them; `git status --porcelain` → `fatal: not a git repository` (exit 128).

Stopped before Step 3.3 as instructed.
