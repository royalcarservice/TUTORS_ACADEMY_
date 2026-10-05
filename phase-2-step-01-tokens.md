# TUTORS ACADEMY — Phase 2 · Step 1
## Design Token Foundation

> Build the token layer only. No components. No pages. No homepage.
> This is the file every future step consumes. Get the architecture right here
> and every later phase inherits it for free.

---

### WHY THIS STEP EXISTS

Colour, surface, spacing, depth and timing decisions must exist as **named variables**
before a single component is written. If they live inside components, subject theming
in Phase 3 becomes a rewrite instead of a variable swap.

---

### FIRST: INSPECT

Before writing anything:
1. Read the root config — framework, styling approach, existing token/theme files.
2. Read the global CSS / entry stylesheet.
3. Check for any existing colour, spacing or shadow definitions.
4. Check the router type and the `app/` (or `src/`) structure so the preview route
   is placed correctly.

If a token layer already exists, **extend and rename in place** — do not create a second
source of truth. Report what you found before changing it.

---

### BUILD

**1. Two-tier token architecture (mandatory)**

- **Primitive tier** — raw values. `--ta-ink-900`, `--ta-ivory-100`, `--ta-brass-500`.
  Never referenced by components.
- **Semantic tier** — meaning. `--ta-surface-raised`, `--ta-text-primary`, `--ta-brand`.
  This is the ONLY tier components may consume.

Components that reference primitive tokens are a bug. State this rule in a comment
at the top of the file.

**2. Colour direction — "Ink & Signal"**

Base values below are the starting palette. **Hue is locked. Lightness may be tuned**
only where required to pass contrast checks. Do not introduce new hues.

```
Ink (base, dark environments)      #07090B  #0B0E12  #12161C  #1A1F27
Slate (structure, borders)         #2A313B  #3E4753  #6B7683  #9AA4B0
Ivory (light, reading surfaces)    #E2DCD1  #EFEBE3  #F7F5F0
Brass (brand accent — sparing)     #9E7A33  #C29A45  #D9B563
Signal (interactive / live)        #21A896  #35C9B4  #6FE0D0
```

Rationale: ink base gives cinematic depth, ivory gives readable light surfaces,
brass reads as institutional prestige without becoming gold cliché, signal is reserved
for *live* and *interactive* states so it never decorates. Brass must be used sparingly —
it is a seal, not a paint.

**3. Semantic tokens — required set**

```
Surfaces   --ta-surface-base  --ta-surface-raised  --ta-surface-sunken
           --ta-surface-overlay  --ta-surface-brand

Text       --ta-text-primary  --ta-text-secondary  --ta-text-muted
           --ta-text-inverse  --ta-text-on-brand

Brand      --ta-brand  --ta-brand-strong  --ta-brand-quiet

Signal     --ta-signal  --ta-signal-quiet

Borders    --ta-border-subtle  --ta-border-strong  --ta-border-focus

Subject slots  --ta-accent-1  --ta-accent-2  --ta-accent-3
               (SLOTS ONLY — Phase 3 fills these per subject.
                Default them to brand / signal / slate.)

State      --ta-state-success  --ta-state-warning  --ta-state-danger  --ta-state-info
Focus      --ta-focus-ring        (visible, high contrast, 2px + offset — non-negotiable)
```

**4. Theme scopes**

Define light and dark semantic values from day one, scoped as:

```
:root                → default (dark, cinematic — the brand default)
[data-theme="light"] → light reading surfaces
```

Same semantic names in both. Never fork the names. This is cheap now, expensive later.

**5. Non-colour tokens**

```
Spacing   4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160
Radius    4 · 8 · 12 · 16 · 24 · full
Elevation --ta-elev-0 … --ta-elev-4    (layered shadows tinted with ink,
                                        never flat grey blur)
Motion    durations: 90 · 160 · 240 · 400 · 700 · 1000ms
          easings: enter, exit, in-out, cinematic
          (name them — Phase 2.3 formalises choreography)
Z-index   base · sticky · overlay · modal · toast
```

**6. Framework mapping**

- If Tailwind is present: map every semantic token into the theme config so
  `bg-surface-raised`, `text-text-muted`, `p-brand` exist. No hardcoded colours anywhere.
- If Tailwind is absent: expose tokens as CSS custom properties only and say so in the report.

**7. Token preview route (dev-only)**

A single route, e.g. `/dev/tokens`, rendering:
- every palette swatch with its token name and computed hex
- every semantic token shown as the role it plays, on the surface it belongs to
- **the actual contrast ratio printed next to each text/background pairing**
- spacing, radius, elevation and motion-duration samples

Gate it behind `NODE_ENV !== 'production'` (or equivalent) so it cannot ship.
It must still render correctly in both themes.

---

### CONSTRAINTS

- Token layer only. **No components, no buttons, no cards, no pages, no nav.**
- No new dependencies unless a contrast-calculation library is genuinely required —
  prefer writing the small helper inline.
- No hardcoded hex values outside the primitive tier.
- No subject theming yet — only the three empty accent slots.
- Do not touch or restyle any existing page or component.
- Do not build the homepage.

---

### DO NOT CHANGE

- Existing routes, pages, components, layouts, or copy
- Existing config values unrelated to tokens
- Any working build or deploy setup
- Do not upgrade the framework or its dependencies

---

### TEST (all required)

1. **Contrast** — every text/background semantic pairing meets **WCAG AA**
   (4.5:1 body, 3:1 large/graphic). Report the measured ratios in a table.
   If a pairing fails, fix it by tuning **lightness only** and report what changed.
2. **Both themes** — preview route verified in dark and light. No invisible text,
   no low-contrast borders.
3. **No leakage** — run a production build. Confirm the preview route is absent or
   returns 404 in production.
4. **No stray values** — grep the codebase for hex codes outside the primitive tier.
   Expected: none.
5. **Runs clean** — dev server and build both succeed. Paste any warning verbatim.
6. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified (paths)
2. Token architecture summary — primitive vs semantic split
3. Full palette table with the **measured contrast ratios**
4. Any lightness deviations from the starting values, and which check forced them
5. Framework mapping — how tokens are consumed in markup
6. Preview route path + confirmation it is dev-only
7. Production build result
8. Anything deferred or uncertain
9. Confirmation nothing existing was broken or restyled

---

### STOP

End after the report. Do not start typography, components, or the homepage.
