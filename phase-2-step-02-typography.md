# TUTORS ACADEMY — Phase 2 · Step 2
## Typography System

> Depends on Step 2.1 (tokens). If the token layer does not exist yet, STOP and
> report that first — do not invent a parallel system.

---

### WHY THIS STEP EXISTS

Typography carries this brand. A cinematic, premium, intelligent education product is
built on type discipline — not on gradients or effects. This step defines the families,
the scale, the rhythm and the reading rules that every future phase inherits.

**Locked architectural rule:** typefaces are the BRAND FRAME. Subjects may change
typographic *treatment* (tracking, italic, casing, single accent rule) within tight
bounds. Subjects may NEVER change the font families.

---

### FIRST: INSPECT

1. Read the token file(s) from Step 2.1 — naming convention, theme scopes, how
   Tailwind (if present) consumes tokens.
2. Read the global stylesheet and any existing font loading setup.
3. Check for already-installed fonts, `<link>` tags, `next/font` usage, or `@font-face` rules.
4. Note the framework's font pipeline (e.g. `next/font`) and use it — do not hand-roll.

Report what you found before adding anything.

---

### BUILD

**1. Families — exactly two, plus one optional mono. No more.**

Recommended pairing (confirm availability and OFL licence before adopting):

- **Display** — `Instrument Serif` (or `Fraunces` variable if more weight range is needed).
  Editorial, high-contrast, cinematic. Used for headlines and hero statements ONLY.
- **Text / UI** — `Instrument Sans` (variable, weight + width axes).
  Neutral, modern, humanist-geometric. The default for all interface and body copy.
- **Mono (optional, only if genuinely used)** — `Geist Mono` or `JetBrains Mono`.
  For code, equations, IDs and timers where digit width must be stable.

If either family proves unavailable or licence-restricted, choose the closest free
alternative and **state the substitution and reasoning in the report**.
No paid fonts. No more than three families total.

**Adopt as design tokens:**
```
--ta-font-display   --ta-font-text   --ta-font-mono
```

**2. Loading strategy (performance-critical)**

- Self-host via the framework font pipeline. No third-party font CDN in production.
- Variable fonts only, where the family offers them. Do not ship static weight files
  for every weight.
- **Subset** to the character sets actually used (at minimum `latin`; add `latin-ext` only
  if required). State what you subsetted.
- **Preload only the text face.** Do NOT preload the display face — it renders below
  the fold on most routes and preloading it competes for bandwidth.
- `font-display: swap` for text; `optional` for display.
- **Metric-matched fallback stack** with `size-adjust` / `ascent-override` overrides so
  there is no layout shift when the real font lands. This is mandatory, not optional.
- Ship no italic, no extra weight, and no unused axis unless a rule below uses it.

**3. Type scale — fluid, rem-based, rational**

Build with `clamp()` from a modular ratio. Suggested ramp (tune to taste, but keep the
structure and the naming):

```
--ta-text-2xs   ·  --ta-text-xs  ·  --ta-text-sm  ·  --ta-text-base
--ta-text-lg    ·  --ta-text-xl  ·  --ta-text-2xl
--ta-display-sm ·  --ta-display-md  ·  --ta-display-lg  ·  --ta-display-xl
```

- Display steps scale fluidly between mobile and desktop viewports.
- Body sizes must NOT be fluid below 16px at any viewport. **16px is the floor.**
- Everything in `rem`. No `px` for any text size.

**4. Rhythm rules — publish as a table in the token/specimen file**

For each step define: **size · line-height · letter-spacing · weight · max measure · use**

Required rules:
- **Tracking inverts with size.** Large display: negative tracking (tight, optical).
  Small labels and caps: positive tracking. Body: neutral.
- **Line-height inverts with size.** Display: tight (0.95–1.1). Body: 1.5–1.7.
- **Measure:** 45–75 characters for reading text. Enforce a max-width utility
  (e.g. `--ta-measure`) so long-form never runs edge to edge.
- **Weight discipline:** no weight below 400 for body copy. No faux-bold.
  Display weights ≤ 2 distinct values across the whole product.
- **Case discipline:** small caps only if real small-caps or a true caps weight exists.
  Never fake them. Rare all-caps — labels and eyebrows only, always with positive tracking.

**5. Numerals + data typography**

A learning product is full of numbers — scores, timers, progress, equations.

- Define `.ta-num` (or equivalent) using `tabular-nums` with aligned columns.
- Timers, progress figures, tables and counters MUST use tabular figures.
- Define how equations and code are set (mono, and a future note that maths rendering
  will need a dedicated typesetting step — **do not build that now, just note it**).

**6. Accessibility (non-negotiable)**

- All sizes in `rem`; product must remain fully legible at **200% browser zoom**
  and with the OS/base font size raised.
- Respect a minimum comfortable line-height; never compress reading text to fit a box.
- Text contrast inherits from Step 2.1 semantic tokens. Do not introduce new colours here.
- No text baked into images. No `text-shadow` or `outline` used as a legibility crutch.
- Long-form reading text must remain readable in **both** themes.

**7. Type specimen route — `/dev/type` (dev-only, mirrors `/dev/tokens`)**

Gate behind `NODE_ENV !== 'production'`. It must show, in real product context:

- every scale step with its token name, computed size, line-height and tracking
- the full rhythm table rendered as a readable reference
- a genuine long-form paragraph — **real sentences about Tutors Academy, not lorem ipsum**
- numerals: a timer, a score, a progress percentage, a small data table
- one Maths / Physics / Chemistry expression set in mono
- the fallback stack shown next to the loaded face, so metric match is visible
- **both themes side by side**

---

### CONSTRAINTS

- Typography only — **no components, no cards, no pages, no nav, no hero.**
- Do not restyle existing pages. If a page exists, leave it exactly as it is;
  the new scale is adopted in later phases.
- No new dependencies beyond the font sources themselves and the framework's font tooling.
- Do not add a third text family "for variety". Restraint is the brand.
- Do not remove the subject accent slots or alter any colour token from Step 2.1.
- Do not build the homepage.

---

### DO NOT CHANGE

- The token architecture from Step 2.1 — **extend it, never fork it**
- Colour values, theme scopes, spacing scale, elevation, motion tokens
- Existing routes, components, layouts or copy
- Any working build or deploy setup
- Framework or dependency versions

---

### TEST (all required)

1. **No layout shift** — load the specimen route with network throttling and the font
   cached/uncached. Report the measured CLS. Target: **0** for the specimen route.
2. **No FOUT flash of wrong size** — verify the fallback metric overrides actually apply;
   paste the computed fallback `size-adjust` values.
3. **Only what is needed loads** — list every font file actually requested, with size.
   Confirm no unused weights, italics or axes are downloaded.
4. **Zoom** — 200% browser zoom, and OS font size increased. No clipping, no overlap,
   no horizontal scroll.
5. **Mobile** — 320px width. Display text does not overflow; body stays legible.
6. **Both themes** — specimen verified dark and light.
7. **Contrast** — body and display text pass AA against their surfaces (inherited tokens).
8. **No stray units** — grep for `px` in text-size declarations. Expected: none.
9. **Production build** — succeeds; `/dev/type` absent or 404 in production.
10. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified
2. Families chosen + licence + source, and any substitution made with reasoning
3. Subsets and every font file shipped, with sizes
4. Full type scale + rhythm table (size / line-height / tracking / weight / measure / use)
5. Fallback stack and the metric-override values used
6. Measured CLS before and after metric matching
7. `--ta-measure` (or equivalent) implementation
8. How tabular numerals are exposed for reuse
9. Specimen route path + confirmation it is dev-only
10. Anything deferred or uncertain
11. Confirmation nothing existing was restyled or broken

---

### STOP

End after the report. Do not start motion, components, or the homepage.
