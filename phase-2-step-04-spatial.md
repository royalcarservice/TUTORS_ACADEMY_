# TUTORS ACADEMY — Phase 2 · Step 4
## Spatial System — Grid, Containers, Breakpoints, Density

> Depends on Steps 2.1 (tokens), 2.2 (typography), 2.3 (motion).
> Read all three first. Extend the token layer in place — never fork it.

---

### WHY THIS STEP EXISTS

Layout is what holds the story together. Sections will change character by phase —
cinematic here, dense and working there. Without a spatial system, every new section
invents its own gutters, widths and rhythm, and the product quietly stops feeling
like one thing.

This step defines the physical architecture: how wide things get, where the grid lives,
how much air sections breathe, and how density changes between a cinematic homepage and
a working dashboard — **without changing the brand.**

---

### THE TWO SPATIAL LAYERS (locked architectural decision)

**THE STAGE** — full-bleed, cinematic. Homepage scenes, subject environments,
hero moments, transitions. Breaks the container intentionally. Owns the edges.

**THE ROOM** — contained, calm, habitable. Reading, working, dashboards, forms, tables.
Never breaks the container. Predictable and quiet.

**Rule:** A view is one or the other. Stage content may contain Rooms.
A Room never contains Stage content. Conflating them is what makes immersive products
feel chaotic the moment the user needs to *do* something.

---

### FIRST: INSPECT

1. Token files from 2.1 — spacing scale, radius, elevation, z-index.
2. Typography from 2.2 — specifically `--ta-measure` and the rhythm table.
3. Motion from 2.3 — ambient constraints (these interact with layout reflow).
4. Framework config — Tailwind `screens` (or equivalent), any existing container/width
   utilities, and existing breakpoint definitions.
5. Existing layouts, pages and components — note their current widths and gutters so you
   can report the delta, **not** refactor them now.

Report findings before building.

---

### BUILD

**1. Breakpoints — single canonical source**

```
xs   0      (320 is the hard floor we design to)
sm   480
md   768
lg   1024
xl   1280
2xl  1536
```

**This is the tricky part — handle it properly:**
CSS custom properties cannot be used inside media queries. So:

- Define breakpoints **once** as data (TS/JS constant), consumed by the framework config.
- CSS media queries must **match those values exactly**.
- Put a warning comment at the top of both files pointing at each other as the pair
  that must stay in sync.
- Add a **verification step** (script or documented grep) that fails loudly if a media
  query in the codebase uses a width not in the canonical list. Report the command.

**Naming rule:** breakpoints get no semantic names. Numbered/lettered bands only.
Named bands ("mobile", "desktop") become lies as soon as a tablet exists.

**2. Containers**

```
--ta-container-prose     reference --ta-measure from 2.2   long-form reading only
--ta-container-content   1120px   DEFAULT working width — Rooms, dashboards, forms
--ta-container-wide      1440px   galleries, subject grids, recording libraries
--ta-container-stage     full-bleed + safe insets   Stage only
```

Rules:
- **One default.** Components use `content` unless there is a stated reason otherwise.
- Container width is never set as a raw px value in a component — always the token.
- Containers are `max-width` + auto margins. **Never** fixed widths.

**3. Gutters**

Drawn from the Step 2.1 spacing scale. **No new values.**

```
xs / sm   → 24
md        → 32
lg / xl   → 48
2xl       → 64
```

Expose as `--ta-gutter`, automatically set per band. Components never declare their own
page gutter.

**4. Grid**

- **4 columns** — xs, sm
- **8 columns** — md
- **12 columns** — lg, xl, 2xl
- Column gap: `24` at xs/sm, `24` at md, `32` at lg+ (all from the scale)
- Mobile-first. Every layout authored mobile-first; media queries are `min-width` only.

**Grid rule for later phases:** content spans in whole columns. A component that spans
"5.5 columns" is a design failure — fix the composition, not the grid.

**5. Vertical rhythm + section spacing**

Fluid section spacing driven by `clamp()`, exposed as role tokens:

```
--ta-space-section    clamp between 64 → 160   between major scenes
--ta-space-block      clamp between 32 → 64    between blocks within a section
--ta-space-stack      clamp between 12 → 24    between related elements
--ta-pad-card         clamp between 16 → 32    internal component padding
```

**The proximity principle — encode it as a comment in the token file:**

> **1 step apart = tightly related. 2 steps = grouped. 4+ steps = separate sections.**
> If two things look equally spaced, users assume they are equally related.

This is how the interface communicates structure *without* borders or dividers.

**6. Density modes**

The homepage and a student's working dashboard need different air, but must not
look like two products.

```
:root                    → comfortable (default: Stage and marketing surfaces)
[data-density="compact"] → working surfaces: dashboards, tables, lists, tutor studio
```

Compact **remaps the role tokens only** (`--ta-space-block`, `--ta-space-stack`,
`--ta-pad-card`, control heights). It does **not** change colour, type scale,
radius or elevation. Report the exact remap table.

**7. Component-level adaptivity — locked decision**

- **Pages and sections** respond to the **viewport** (media queries).
- **Reusable components** respond to their **container** (container queries).

Because the same card will sit in a hero, a dashboard grid and a sidebar. A component
that only knows the viewport will be wrong in two of those three places.
Define the container-query pattern now, and note it as mandatory in Phase 3+.

**8. Responsive rules — the contract**

- **No horizontal overflow at any width, ever.** Including 320.
- **Tables, long equations and code overflow *inside* their own scroll container** —
  never the page. A learning product will hit this constantly. Provide a reusable
  overflow affordance (fade or shadow edge indicating more content), and state that it
  must remain keyboard-reachable.
- **Touch targets: minimum 44×44 CSS px**, primary actions 48. Minimum 8px gap between
  adjacent targets. Never set a target smaller to "make the layout work".
- **No hover-only interaction.** Every hover affordance has a focus and touch equivalent.
- **Safe areas:** fixed/sticky/Stage elements respect `env(safe-area-inset-*)`.
- **Reflow:** layout must reflow correctly at 320 CSS px equivalent (WCAG 1.4.10) with
  no two-dimensional scrolling of the page itself.
- **Text-spacing resilience (WCAG 1.4.12):** with line-height 1.5×, paragraph spacing 2×,
  letter spacing 0.12em and word spacing 0.16em forced, nothing clips or overlaps.
  **No fixed heights on text containers. Ever.**
- **Images and media** use defined aspect ratios (`16/9` primary, `4/3`, `1/1`, plus
  `auto` for text-bearing frames) with explicit width/height to prevent CLS. Never set an
  aspect ratio on a text container.

**9. Spatial specimen route — `/dev/spatial` (dev-only, mirrors the other /dev routes)**

Gate behind `NODE_ENV !== 'production'`. Must include:

- a **toggleable grid overlay** showing columns and gutters at the current band
- the **current band name, viewport width, gutter and active container** displayed live
- all four containers rendered with their max-widths visualised side by side
- **comfortable vs compact density, side by side on identical content**
- a **Stage vs Room comparison** showing the same component block in both layers
- an overflow demo: a wide table and a long equation, both contained with the affordance
- a **text-spacing torture test** — forced 1.5× line-height, 2× paragraph spacing,
  0.12em letter-spacing, 0.16em word-spacing, visibly passing
- a touch-target demo with the 44px minimum and 8px gap rendered as visible guides
- a **safe-area simulator** (padding override) for notched devices

---

### CONSTRAINTS

- **Spatial system only — no components, no pages, no hero, no nav.**
- Only **one** motion token may be touched: none. Leave 2.3 alone entirely.
- Do not restyle or refactor existing pages/components. Report their delta instead.
- No new spacing or radius values outside the Step 2.1 scale.
- No CSS framework beyond what already exists. No new dependencies.
- Do not introduce fluid `vh`-based heights for content sections — mobile browser chrome
  makes them unreliable. (`svh`/`dvh` only for Stage, and only where it justifies itself.)
- Do not build the homepage or any subject environment.

---

### DO NOT CHANGE

- Token architecture from 2.1 — extend in place, never fork
- Type scale, families, rhythm, `--ta-measure` from 2.2
- Motion tokens and the reduced-motion contract from 2.3
- Colour values, theme scopes, elevation
- Existing routes, components, layouts, copy
- Any working build or deploy setup
- Framework or dependency versions

---

### TEST (all required)

1. **Width sweep** — render `/dev/spatial` at 320, 375, 414, 768, 1024, 1280, 1440,
   1920, 2560. Report any horizontal scrollbar. Expected: none, at any width.
2. **Reflow (WCAG 1.4.10)** — 400% zoom at 1280 (≈320 CSS px). Page reflows to one
   column; no 2D scrolling of the page.
3. **Text spacing (WCAG 1.4.12)** — apply the four forced overrides. Nothing clips,
   truncates or overlaps. Screenshot it.
4. **Touch targets** — audit every interactive element at xs. Report any below 44×44
   and any adjacent pair closer than 8px.
5. **Density swap** — toggle `data-density="compact"`. Confirm colour, type and radius are
   **unchanged**; only spacing roles shift. Paste the remap table you observed.
6. **Container isolation** — confirm components use container queries, not viewport
   breakpoints. Report how you verified it.
7. **Breakpoint drift check** — run your verification command; confirm every media query
   width in the codebase exists in the canonical list.
8. **No fixed text heights** — grep for fixed heights on text containers. Expected: none.
9. **Both themes** at `/dev/spatial`.
10. **Production build** succeeds; `/dev/spatial` absent or 404 in production.
11. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified
2. Canonical breakpoint source + how CSS and JS are kept in sync (include the check command)
3. Container table with max-widths, and which surfaces use which
4. Grid spec per band — columns, gap, gutter
5. Vertical rhythm role tokens with their clamp ranges
6. **The density remap table** — exactly what compact changes and what it must not
7. Container-query pattern + where it is enforced
8. Overflow strategy for tables and equations
9. Results of the width sweep, reflow test, text-spacing test and touch-target audit
10. Specimen route path + confirmation it is dev-only
11. Anything deferred or uncertain
12. Confirmation nothing existing was restyled or broken

---

### STOP

End after the report. Do not start components, nav, or the homepage.
