# TUTORS ACADEMY — Phase 2 · Step 5
## Core Primitives — Button, Surface/Card, Field/Input, Progress

> Depends on Steps 2.1 (tokens), 2.2 (typography), 2.3 (motion), 2.4 (spatial).
> **Read all four first.** These primitives may consume nothing that does not already
> exist in those layers. No new colours, radii, spacing values, or motion.

---

### WHY THIS STEP EXISTS

These four primitives appear on every surface of the product — marketing, student
command centre, tutor studio, and later admin. If they are built right, every page after
this is assembly instead of invention. If they are built wrong, the wrongness is copied
four hundred times.

**This step builds primitives and their states. It does NOT build pages, sections,
navigation, or the homepage.**

---

### THE ARCHITECTURAL RULE (locked)

**Behavior and skin are separate layers.**

- **Behavior layer** — semantics, ARIA, keyboard handling, state machine, ref forwarding.
- **Skin layer** — visual appearance, driven *entirely* by semantic tokens.

Why: Phase 3 re-skins these components per subject environment **through tokens only**.
If behavior and visuals are fused, subject theming becomes a fork of every component.
Subjects must be able to restyle a Button without touching a Button.

**Corollary:** no component may hardcode a colour, radius, duration or spacing value.
Everything comes from tokens. If a needed token does not exist, **stop and report it**
rather than inventing a value.

---

### FIRST: INSPECT

1. Token files — semantic names available for surfaces, text, borders, brand, signal,
   state colours, focus ring, radius, elevation, motion.
2. Typography — which text steps each primitive uses; tabular numerals.
3. Motion — which choreography presets exist (`confirm`, `enter`/`exit`, `orient`).
4. Spatial — spacing roles, containers, density modes, touch-target rules.
5. Existing components — **there may already be Button/Card/Input components.**
   If so: do not duplicate. Report what exists, and either extend it or state plainly
   why replacing it is necessary. Silent replacement of working code is forbidden.
6. Existing file/naming conventions — folder structure, file naming, export style,
   `components/ui` (or equivalent) location.

Report findings before writing code.

---

### BUILD — FOUR PRIMITIVES

#### 1. Button

**Variants — semantic roles, exactly four. No more.**
```
primary     the ONE main action in a view
secondary   supporting action
ghost       tertiary / low-emphasis / icon-adjacent
danger      destructive — a role, not a colour variant
```
Adding a fifth "colour variant" is forbidden. To change how a role looks, change tokens.

**Sizes:** `sm` · `md` (default) · `lg` · `icon`.
Icon-only buttons are **square** and must always carry an accessible name.

**Rules:**
- **Never a `<div>`.** Navigates → `<a>`. Performs an action → `<button>`.
  Both share one skin; the skin must not be duplicated between them.
- **Loading state:** spinner + `aria-busy`, **width preserved** (no layout shift),
  interaction blocked while loading. Loading must never be faked — if there is no real
  async action, do not render a loading button.
- **Disabled:** prefer `disabled`; where the user needs to understand *why*, use
  `aria-disabled` (still focusable, still announced) — document which is used where.
- **Touch targets:** ≥44×44 at xs (`sm` variants included), ≥48 for primary actions.
- **Emphasis rule:** exactly **one** `primary` per view. Encode this as a comment.
- **Signature micro-interaction:** on press, primary buttons compress 1px scale with a
  brief brass edge-light — `confirm` preset only, `--ta-dur-instant` scale. Under reduced
  motion: state change with **no movement**.
- **No `box-shadow` hover** (motion contract — box-shadow is not compositor-friendly).
  Hover uses token-driven background/border change + at most 1px transform.

#### 2. Surface / Card

One surface primitive. Composition API, not prop soup.

```
Card          Card.Header   Card.Title   Card.Description
              Card.Body     Card.Footer  Card.Media
```

**Variants:** `flat` (default) · `raised` · `inset` · `interactive`.
Elevation maps to `--ta-elev-*`. **No `stage` variant** — Stage is *layout*, not a card.

**Rules:**
- Padding uses `--ta-pad-card` and therefore **responds to density automatically**.
- `Card.Media` enforces a defined aspect ratio (from 2.4) — never on text containers.
- **The interactive-card anti-pattern is banned:** if `interactive`, the whole card is
  exactly one link/button, and it must contain **no nested interactive elements**.
  If the card needs internal actions, it is not `interactive` — it is a plain Card
  with separate buttons.
- No decorative borders *and* raised elevation on the same card — pick one signal.
- Cards are **margin-free**. Parents control layout spacing.

#### 3. Field + Input

**Field wrapper** (shared by all future inputs) provides:
`Label` · `Hint` · `Error` · `Success` · `Required/optional indicator`.

**This step builds the Field wrapper and the text `Input` only.**
`Textarea` shares the Field and may be included if it costs nothing.
**Deferred — do not build now:** Select, Combobox, Checkbox, Radio, Switch, DatePicker,
OTP, FileUpload. They arrive when a real surface needs them.

**States required for Input:** default · hover · focus · filled · disabled · read-only ·
error · success · loading/validating.

**Accessibility wiring (must be exact):**
- Label is **always** bound via `htmlFor`/`id`. **A placeholder is never a label.**
- `aria-describedby` links hint **and** error text.
- `aria-invalid` on error; error text in a live region (politely announced, `role="alert"`
  only for dynamically appearing errors).
- **Required is conveyed in text**, not by a bare asterisk.
- Focus ring uses `--ta-focus-ring` and **must remain visible on every surface** —
  including on top of a brass-filled element. Provide a contrasting halo so the ring
  never disappears into the button or card behind it.
- Error is never signalled by colour alone — icon or text accompanies it.

**Rule:** a Field never renders without a label. If a design appears to need one,
that is a design problem — report it, do not build an unlabeled input.

#### 4. Progress

The product's progress language — used in student, tutor and admin surfaces alike.

**This step builds the linear progress bar only** — determinate and indeterminate.
Ring/dial and streak visualisations are **deferred**.

- `role="progressbar"` with `aria-valuenow`/`min`/`max`, plus an accessible label.
- Indeterminate variant omits `aria-valuenow` (correctly — this is commonly botched).
- Numeric labels use **tabular numerals** (2.2) so values do not jitter.
- Track and fill from tokens; fill uses `brand` by default.
  `signal` is reserved for **live** states only — do not use it here.
- Indeterminate animation obeys the motion contract: compositor-only, and under reduced
  motion it becomes a **static** indicator, not a stall.

---

### GLOBAL RULES FOR ALL PRIMITIVES

- **Margin-free.** Primitives never set their own external margin.
- **Token-only styling.** No hardcoded values. No new tokens invented here.
- **Typed props.** Extend native element props; forward refs; consumers get autocomplete.
- **Forward all native props** (`...rest`) so no primitive becomes a wall.
- **No animations beyond the 2.3 grammar.** No new transitions invented per component.
- **Density-aware** — primitives must be correct in both `:root` and
  `[data-density="compact"]` without any component-level branching.
- **Theme-aware** — correct in dark (default) and light with no conditional logic.
- **One-file-per-primitive** following the existing project convention.

---

### SPECIMEN ROUTE — `/dev/primitives` (dev-only)

Gate behind `NODE_ENV !== 'production'`. This is the **states matrix** — the artefact
the whole team will reference. Required content:

- **Every variant × every state** for Button: default, hover, focus-visible, active/press,
  loading, disabled, and icon-only — in both themes.
- Every Card variant, including one `interactive` card and one containing a nested-action
  footer, to demonstrate the anti-pattern rule correctly handled.
- Every Input state, including error and success **with real, plausible copy** —
  not "lorem ipsum" or "Error text here".
- Progress in determinate, near-complete, zero and indeterminate states.
- A **density toggle** (comfortable / compact) applied to the whole page, proving
  primitives shift spacing without any visual identity change.
- A **reduced-motion toggle**, repeating the press and progress demos in both modes.
- A **touch-target overlay** showing the 44px guides on every interactive element.
- Realistic microcopy throughout. **No lorem ipsum anywhere.**

---

### CONSTRAINTS

- **Primitives only.** No pages, sections, hero, nav, footer, or homepage.
- **Do not install a component library** (shadcn, Radix, MUI, Chakra, etc.) in this step.
  If you believe one is genuinely required for correct behavior, **stop and report**
  with the reasoning — do not install it.
- **Do not install an icon library.** Icons are decided in Step 2.6. Where an icon is
  needed (loading spinner, error icon), use a minimal inline SVG placeholder and note it.
- Do not create Select, Checkbox, Radio, Switch or any deferred input.
- Do not restyle existing pages or components.
- Do not alter tokens from 2.1–2.4. If a token is missing, stop and report.
- No barrel-file sprawl or abstraction layers built "for later".

---

### DO NOT CHANGE

- Token architecture, type system, motion grammar, spatial system (2.1–2.4)
- Colour values, theme scopes, `--ta-focus-ring`, density remaps
- Existing routes, components, layouts, copy
- Any working build or deploy setup
- Framework or dependency versions
- The existing `/dev/*` routes

---

### TEST (all required)

1. **Keyboard-only pass** — tab through the entire specimen route. Every interactive
   element reachable, in a logical order, **focus always visible**. Report any
   invisible focus state. Expected: none.
2. **Focus-ring visibility** — confirm the ring is visible on: base surface, raised
   surface, brass-filled primary button, and inside an error-state input. Screenshot each.
3. **Screen reader pass** — verify: button names announced, loading announced via
   `aria-busy`, input label + hint + error all announced, progress values announced.
   Report the tool used and the output.
4. **Error announcement** — trigger an input error dynamically; confirm it is announced
   without moving focus.
5. **No layout shift** — toggling a button into loading must not shift surrounding layout.
   Report measured CLS for that interaction.
6. **Density** — toggle compact. Confirm **only spacing and control heights change** —
   colour, type and radius identical. Paste the observed differences.
7. **Both themes** — every primitive, every state, dark and light. No invisible text,
   no lost borders, no vanishing focus ring.
8. **Reduced motion** — press interaction and indeterminate progress both behave
   correctly: state changes preserved, movement removed, **indeterminate renders static
   rather than stalling or disappearing**.
9. **Mobile** — 320px. Touch targets ≥44×44, ≥8px gaps, no horizontal overflow.
10. **Zoom** — 200% and 400% (WCAG 1.4.10 reflow). No clipping or overlap.
11. **Text spacing** — WCAG 1.4.12 forced overrides; nothing clips in any primitive.
12. **Accessibility audit** — run an automated audit (axe or Lighthouse) on the specimen
    route. Report the score and **every** violation, even minor.
13. **Production build** succeeds; `/dev/primitives` absent or 404 in production.
14. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — and whether any **existing** component was extended,
   kept, or replaced (with the reason)
2. Component API for each primitive — variants, props, composition slots
3. The states each primitive covers, as a matrix
4. Any token that was **missing** and how you resolved it (you should have reported,
   not invented)
5. Accessibility wiring notes — label/describedby/invalid/role usage per primitive
6. Focus-ring solution and how it stays visible on brass
7. Signature press micro-interaction — how it degrades under reduced motion
8. Density behaviour — evidence nothing but spacing changed
9. Audit results (score + all violations) and keyboard/screen-reader findings
10. Specimen route path + confirmation it is dev-only
11. Anything deferred (Select/Checkbox/etc., icons, ring-dial progress) — confirm none
    were half-built
12. Confirmation nothing existing was restyled, broken, or silently replaced

---

### STOP

End after the report. Do not start navigation, icons, or the homepage.
