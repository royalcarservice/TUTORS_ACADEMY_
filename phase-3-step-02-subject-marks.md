# TUTORS ACADEMY — Phase 3 · Step 2
## The Six Subject Marks

> Depends on Step 3.1 (subject schema) and Step 2.6 (brand mark). Read both first.
>
> **Symbolic language only.** No motif grammar, no environment art, no ambient layer,
> no animation, no transition choreography. Those are Steps 3.3–3.5.
>
> If the schema from 3.1 does not exist, STOP and report — do not invent a parallel one.

---

### WHY THIS STEP EXISTS

This is the moment a subject stops being a row in a config and becomes something a student
recognises instantly. The chooser screen, the subject shell, the progress view and every
future touchpoint depend on these six marks being genuinely good — and genuinely one family.

**This step produces six marks and the rules that govern them. Nothing else.**

---

### THE DESIGN CONCEPT — "SAME HAND, DIFFERENT IDEA" (locked direction)

The brand mark is **The Unbroken Line** — one continuous stroke, formed in the brand's
stroke weight and terminal treatment.

The subject marks are drawn **in the same stroke language**: same weight class, same
terminal treatment, same single-stroke discipline, same optical sizing. So all seven marks —
brand plus six subjects — read as **one family made by one hand.**

But each mark **figures a different idea.** A family of marks, not six unrelated logos.

**How this differs from the icon set (Step 2.6, Lucide):**
- Subject marks: **single-stroke figures with brand-family terminals**, one per subject.
- UI icons: uniform geometric glyphs, closed forms, generic.
Two different drawing logics. A viewer should never confuse one for the other, and no
subject mark may be swappable for a Lucide glyph.

---

### THE SIX FIGURES (locked conceptual direction — you draw them, do not copy these words literally)

| Subject | The figure | The idea it carries |
|---|---|---|
| **Mathematics** | A line that folds into a lattice and returns along itself | structure discovered, not imposed |
| **Physics** | A line entering as a curve, leaving as a straight vector | force changes a path |
| **Chemistry** | A closed line containing an interior trace | a vessel holding a reaction |
| **Biology** | A line that bifurcates, then rejoins | one origin, many lives |
| **English** | A line that begins fluid (hand) and ends constructed (type) | the stroke becomes language |
| **History** | A line progressively interrupted — segments with deliberate gaps | an archive with missing years |

These are **directions, not specifications.** Draw them properly as marks. If a figure
genuinely does not work in the stroke language, **stop and report** with your reasoning and
an alternative figure — do not silently substitute a different idea.

---

### HARD BANS — DO NOT DRAW ANY OF THESE

helix · atom · flask, beaker, or test tube · ball-and-stick molecule · hourglass · scroll ·
columns or a temple · magnifying glass · stacked books · graduation cap · pencil · owl ·
lightbulb · brain · rocket · globe · infinity loop · gradient orb · play triangle ·
sigma/pi or any mathematical operator as the figure · map pin · compass rose

Also banned: **any mark that reads as a letter in a box, a badge, a shield, or a circular
sticker.** These are strokes, not containers.

---

### BUILD

**1. The mark language specification** — a short, written spec in the repo that the six
marks obey. It must pin down, in measurable terms:

- **Stroke weight class** — expressed as a ratio of the canvas, not a pixel value, so the
  mark scales correctly from 16px to 200px.
- **Terminal treatment** — how strokes end. This is what makes the family read as one hand.
  Consistent across all six and consistent with the brand mark.
- **Corner and join treatment** — radii, mitres, or curve continuity rules.
- **Optical canvas** — the drawing box and how much inset each mark uses, so all six appear
  the same *visual* size regardless of their mathematical bounding box. (Icons and marks
  that are technically the same size but look different sizes is the single most common
  failure in a mark set.)
- **Curve character** — how curved lines are shaped, so the same quality of curve appears
  everywhere.
- **Single-stroke requirement** — each mark must be drawable as one continuous path
  *where the figure allows*. Where a figure genuinely requires a second stroke (History's
  gaps are one such case), the exception must be deliberate and documented.
- **Complexity ceiling** — a cap on total path commands per mark. State the number. If a
  figure cannot be expressed under the cap, **simplify the figure, not the cap.**

**2. The six marks** — as SVG, one per subject.

Requirements:
- **`currentColor` only.** No hard-coded colours — the accent supplies colour via tokens.
- **Single-colour capable.** No gradients, no strokes-plus-different-fills, no opacity tricks.
- **No raster.** No bitmaps at any size.
- **Self-contained geometry.** No reliance on stroke-dasharray tricks for the core figure
  (History's gaps are drawn as gaps, not simulated).
- **Path data budget** — declare it and stay under it.
- **Optimised but not distorted.** No auto-tracing, no path simplification that changes
  curve character. If you use an SVGO-style pass, verify visually afterwards.

**3. The reusable component** — `SubjectMark`, following the existing component conventions.

- Props: `subject` (id), `size` (from the 2.6 icon size grid: 16 · 20 · 24 · 32 · 48,
  plus a large display size for the subject shell).
- Consumes **context or tokens only** — it must never import a subject config directly
  (the 3.1 guard test applies here too).
- `aria-hidden` by default, since subject names are always announced as text beside it.
  Provide an explicit opt-in label for the rare case where the mark is the only identifier.
- No animation, no hover state, no transition. It is an object, not a control.

**4. Placement rules — write these down, they prevent drift:**

**Where subject marks belong:**
- the subject chooser
- the subject environment shell (header / identity position)
- subject-scoped progress and achievement contexts
- subject-scoped recordings and class surfaces

**Where they must NEVER appear:**
- beside every link, button, or list item as decoration
- inside the nav shell's brand position (that is brass, always)
- as a favicon (**the brand mark is the favicon** — subjects do not get their own)
- as a watermark or oversized background figure
- at sizes below 16px
- anywhere a Lucide icon belongs

**5. Anti-collision check.** Each mark must remain distinguishable:
- from the **brand mark**
- from **each other**, at 20px, in a single row
- from **Lucide glyphs** at the same size

Report how you verified each.

---

### SPECIMEN ROUTE — `/dev/marks` (dev-only)

Gate behind `NODE_ENV !== 'production'`. Mirrors the other `/dev/*` routes.

Required:
- The **size ladder** for all six: 16, 20, 24, 32, 48, 200px — showing the optical
  sizing actually works (not just that they fit).
- **Optical weight comparison** — all six beside the brand mark, so family resemblance
  is either visible or obviously broken.
- **All six in a single row at 20px** — the distinguishability test.
- **Row beside a strip of Lucide glyphs** — the confusion test.
- **All six in the subject accent colour** via tokens, on base, raised and sunken surfaces,
  in **both themes**.
- **Clear space and minimum size** per mark, mirroring the brand mark's rules.
- A **before/after** if you simplified any figure, with the reason.
- A visible note stating **what is real vs. deferred** (motif grammar, environment art,
  ambience, switch transition: all later steps).

---

### CONSTRAINTS

- **Marks only.** No motif grammar, no environment/atmosphere rendering, no ambient layer,
  no 3D, no animation, no transition choreography.
- **No new colours.** Marks are `currentColor`; colour arrives from tokens.
- Do not modify the brand mark, wordmark, lockup or favicon.
- Do not modify the subject schema from 3.1 — if a mark needs a field that does not exist,
  **stop and report.**
- Do not modify the Lucide icon rules, the nav shell, or any primitive.
- Do not touch the existing `/dev/*` routes.
- No new dependencies. No illustration libraries, no path-generation tools.
- Do not build the homepage or any subject route.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitives and their APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (2.6)
- Subject schema, validator, scoping, `/dev/subjects` (3.1)
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **Size ladder legibility** — all six at 16, 20, 24px. Confirm each is recognisable, not a
   smudge. If a mark needed simplification for small sizes, report before/after.
2. **Optical sizing** — measure the rendered bounding box of each mark at 48px and report.
   Visually-equivalent marks are the goal; report any that still read as a different size.
3. **20px row test** — all six side by side, plus the brand mark. Are they distinguishable?
   Report honestly — this is the test that fails most often.
4. **Lucide confusion test** — the six beside a Lucide strip at the same sizes. Report any
   glyph that could be mistaken for a subject mark.
5. **Contrast** — each mark in its accent on base, raised and sunken surfaces, both themes.
   Report measured ratios. Failures fixed by tuning **lightness only** and reported.
6. **currentColor proof** — grep the SVGs for any hard-coded colour value. Expected: none.
7. **Path budget** — report the actual path data size and command count per mark against the
   declared cap.
8. **Both themes** at `/dev/marks`.
9. **Reduced motion** — confirm marks are entirely static (they should be, trivially). Report it.
10. **No layout shift** — marks have explicit dimensions and cause no CLS. Report measured CLS.
11. **Mobile 320px + zoom 400% + text-spacing overrides** — nothing clips or overflows.
12. **Accessibility** — marks are `aria-hidden` where text accompanies them, correctly
    labelled where they stand alone. Report the verification method.
13. **Audit** — axe/Lighthouse on `/dev/marks`. Score + every violation.
14. **Production build** succeeds; `/dev/marks` absent or 404 in production.
15. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified
2. **The mark language spec** — stroke class, terminals, joins, optical canvas, curve
   character, complexity ceiling. Paste it.
3. **Each of the six marks**, with a one-line statement of the idea it figures
4. Any figure you changed or rejected, and why
5. Path data size + command count per mark against the cap
6. Optical sizing measurements at 48px
7. **The 20px row test and the Lucide confusion test** — honest results
8. Contrast measurements per mark, both themes, all three surfaces
9. Placement rules as written, including the never-here list
10. `SubjectMark` API and how it avoids importing subject configs directly
11. Specimen route + confirmation it is dev-only and labels what's deferred
12. Anything deferred, and confirmation nothing was half-built
13. Confirmation nothing in the brand frame, schema, primitives, or existing routes changed

---

### STOP

End after the report. Do not begin Step 3.3 (motif grammar) or any environment art.
