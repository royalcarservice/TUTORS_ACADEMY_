# TUTORS ACADEMY — Phase 2 · Step 6
## Navigation Shell + Brand Mark Lockup

> Depends on Steps 2.1–2.5. **Read all five first.**
> This step consumes the design system. It adds no new tokens, no new colours, no new
> motion presets, and no new primitives.
>
> **This is the FINAL step of Phase 2.** It must not begin the homepage.

---

### WHY THIS STEP EXISTS

The nav is the one element present on every single screen for the entire life of the
product. It is where the brand mark lives. If it is wrong, everything beneath it feels
provisional. If it is right, it becomes the frame that makes wildly different subject
environments still read as one place.

This step also settles **icons** — the one visual decision still open from Step 2.5.

---

### PART A — THE BRAND MARK (locked design direction)

**Concept: "The Unbroken Line."**

A monogram in which a **single continuous stroke** forms the letterform path — moving as
one unbroken line through the two letters. The continuity is the meaning:
**DISCOVER → MASTER is one path, not seven disconnected steps.**

**Hard bans — do not draw any of these:**
graduation cap · owl · open book · pencil · lightbulb · brain · rocket · atom ·
infinity loop · gradient orb · generic play-triangle · globe.

**Deliverables:**
1. **Mark** — standalone, works at **16px favicon** and at **200px**. Single-colour capable.
2. **Wordmark** — "TUTORS ACADEMY" set in the Step 2.2 **display family**, with deliberate
   letter-spacing and any optical corrections you make. Type is the brand here — do not
   draw custom letters for the wordmark; set it properly in the real font.
3. **Lockup** — mark + wordmark at a defined optical relationship. Define clear space as a
   ratio of the mark's own height (not a fixed px value), plus a minimum size for the lockup.
4. **Variants** — primary (brass), ink-only, ivory-only/reversed, and monochrome.
   Brass is the default; the others exist for constrained and print contexts.
5. **Favicon set** — SVG favicon plus the raster sizes the framework requires, generated
   from the SVG. Verify the mark is still legible at 16px; if it is not, **simplify the
   mark** rather than shipping a smudge. Report what you changed.
6. Ship as: inline-capable SVG + a reusable component. **No raster logo images in the UI.**

**CRITICAL — the brand-frame rule (from Step 2.2, now enforceable):**
> The mark, wordmark and lockup are **brand frame**. They are **identical in every subject
> environment**. Subjects may recolour the *surrounding* surface via accent tokens, but the
> mark itself never changes shape, spacing or proportion. Phase 3 must not touch it.

**DO NOT:**
- Animate the logo on page load. No draw-on, no fade-up, no shimmer. It is a signature,
  not a mascot.
- Add a gradient, glow, bevel, shadow or 3D treatment to the mark.
- Use the subject accent slots (`--ta-accent-*`) in the mark. It is brass, always.
- Ship a watermark or oversized background logo anywhere.

---

### PART B — ICONS (settles the Step 2.5 deferral)

**Decision: Lucide** — MIT licensed, consistent 24px / 1.5-stroke geometry, tree-shakeable,
and geometrically precise rather than cartoonish. Install it now (this is the one permitted
dependency in this step).

**If you disagree or it conflicts with the existing stack, STOP AND REPORT** with your
reasoning and a named alternative. Do not silently substitute.

**Rules that must be enforced:**
- **One stroke weight.** No mixing weights or filled variants with stroked ones.
- **A fixed size grid:** 16 · 20 · 24 only. Expose semantic wrappers
  (`Icon`, `IconButton` size pairing) rather than raw sizes scattered through markup.
- **Icons are never the only carrier of meaning.** Every icon-only control has an
  accessible name; every icon beside text is `aria-hidden`.
- **Icons do not animate** — no spinners-as-decoration, no hover rotation, no bounce.
  The only permitted animated icon is the button loading spinner from Step 2.5.
- **Decorative icons are rationed.** If removing an icon does not reduce comprehension,
  remove it. Lucide has 1500+ icons; the product should use a small, restrained subset.

**Locked constraint for Phase 3:**
> **Subject identity NEVER uses a Lucide glyph.** Subjects are *environments*, not list
> items. Each subject gets its own custom mark/motif in Phase 3. A generic icon beside
> "Physics" would flatten exactly the thing we are building.

---

### PART C — NAVIGATION SHELL

**Two modes, one shell.** Same component, different configuration — never two code paths.

- **Stage nav** — public/marketing surfaces. Floats **over** full-bleed Stage content.
  Transparent at rest, materialises on scroll.
- **Room nav** — student and tutor surfaces. Solid, compact density, working chrome.

Define both as configuration of one `NavShell`. Do not fork.

**Structure to build:**
- `SkipLink` — "Skip to content", visible on focus, first in tab order
- `BrandMark` / lockup component
- `NavShell` — the layout container, handles Stage/Room mode + scroll state
- `NavLink` — with `aria-current="page"` for active route
- `NavActions` — the CTA cluster (public mode only)
- `MobileNav` — the small-screen pattern (see below)
- `ThemeToggle` — dark/light switch, **real** functionality (data-attribute + persisted
  preference, defaulting to `prefers-color-scheme`). No fake toggle.
- `UserMenu` — **see the honesty rule below**

**Scroll behaviour (the signature moment — and its budget):**
- At rest on Stage: transparent, sits over hero content, converts to a scrim when needed
  for legibility over busy imagery.
- On scroll: condenses to a solid, compact bar.
- **Transform and opacity only.** No height animation, no reflow, no layout thrash.
- The transition is **one** `enter`/`exit` pair from the 2.3 grammar. Do not invent a
  new one.
- Under reduced motion: **instant state change, no animation.** Fully functional.
- Must not jank on mobile. If it janks, cut the effect — the nav is not the place to
  spend the motion budget.

**Mobile pattern:**
- Condensed bar: mark + a single trigger. No icon soup.
- Full-screen or sheet menu with generous touch targets.
- **Correct behaviour is required, not optional:** focus moves into the menu, **focus is
  trapped** while open, `Esc` closes, focus **returns to the trigger**, `aria-expanded`
  and `aria-controls` are wired, page scroll is locked **without layout shift**
  (compensate for scrollbar width).
- Under reduced motion the menu appears instantly rather than sliding.

**THE HONESTY RULE (critical):**
Authentication does not exist yet. Therefore:
- If there is no real signed-in state, **do not render a fake avatar, fake name, or a
  dropdown that pretends to be an account menu.**
- Either render an honest "Sign in" entry that routes to a real route (which may itself be
  an explicit "not built yet" placeholder page), or omit the element entirely.
- **Report clearly which you chose and what backend is required:** auth provider,
  session handling, and where the user record will come from.

**Navigation content — keep it minimal.** Do **not** invent a large IA now:
- Public: brand mark · a small number of real destinations · one or two CTAs
  (consistent with the homepage CTA hierarchy we will define in Phase 4)
- Room: brand mark · role-appropriate destinations · **one** primary action
- **No search field in this step.** A non-functional search box is a lie. If a search
  affordance is shown, it must be real or absent.
- Do not create routes that lead nowhere. If a destination is not built, either omit it
  or point to an explicit placeholder that says so.

---

### FIRST: INSPECT (before writing anything)

1. Steps 2.1–2.5 outputs — token names, text steps, motion presets, spatial roles,
   the primitives' APIs and conventions
2. Router type and existing routing structure — where a nav shell belongs, how routes
   are declared
3. Existing layout files (root layout, any nested layouts) and where the nav must mount
4. Existing nav/footer/header components — **if any exist, report them and extend rather
   than replace.** Silent replacement of working code is forbidden.
5. Existing public assets folder and favicon setup
6. Existing theme handling, if any

Report findings before building.

---

### CONSTRAINTS

- **Lucide is the only new dependency permitted.** Justify it in the report.
- Do not add tokens, colours, motion presets, or new primitives.
- Do **not** build the footer's full content — a minimal footer stub is acceptable only
  if a layout requires it; the real footer belongs to Phase 4. State what you did.
- Do not build the homepage, hero, or any marketing section.
- Do not build auth, routes for auth providers, or any backend.
- Do not build search.
- Do not add page transitions or route-change animations — those are Phase 4 concerns.
- Do not restyle existing pages or components.
- No animation beyond what is specified above.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- The primitives and their APIs (2.5) — extend only if genuinely required, and report why
- Colour values, theme scopes, focus ring
- The `/dev/tokens`, `/dev/type`, `/dev/motion`, `/dev/spatial`, `/dev/primitives` routes
- Existing routes, copy, components
- Any working build or deploy setup
- Framework or dependency versions (other than adding Lucide)

---

### TEST (all required)

1. **Mark legibility** — render the mark at 16, 20, 24, 32, 64, 200px. Confirm it reads
   at 16px. If you simplified it, show before/after.
2. **Contrast** — the brass mark on ink and on ivory must both pass **3:1** (graphic
   element). Report the measured ratios. If brass fails on ivory, adjust **lightness only**
   for that variant and report it.
3. **Stage nav over content** — nav must remain legible over the busiest hero content we
   will realistically have (test against a deliberately busy image and a bright panel).
   Report any case where it fails and how you solved it.
4. **Scroll behaviour** — no layout shift, no thrash. Record performance during rapid
   scroll. Report any long task over 50ms.
5. **Keyboard-only** — full tab pass: skip link first, every nav item reachable, active
   item announced via `aria-current`, focus always visible, no keyboard trap.
6. **Mobile menu** — open with keyboard, `Esc` closes, focus returns to trigger, focus is
   trapped while open, background scroll locked **with no layout shift**. Report how you
   verified the trap.
7. **Zoom** — 400% (WCAG 1.4.10) and 200%. **The sticky nav must not consume the viewport**
   at high zoom or on very short viewports. Provide the rule you used so it becomes static
   or condensed. This is a classic failure — test it explicitly.
8. **Text spacing** — WCAG 1.4.12 overrides applied; nav labels do not clip or overlap.
9. **Both themes** — nav in dark and light, Stage and Room, at rest and scrolled.
   Theme toggle works and **persists across reload**; verify the pre-paint state on reload
   (no flash of the wrong theme) and report how you prevented it.
10. **Reduced motion** — scroll transition and mobile menu both become instant and remain
    fully functional. Screenshot both modes.
11. **Screen reader** — landmarks announced correctly, multiple navs have distinct labels,
    `aria-expanded` announced on the mobile trigger. Report tool and output.
12. **RTL sanity** — mirror the nav with `dir="rtl"` and confirm the layout does not break.
    Report any positioning that would fail. (Full RTL is not required yet — capacity only.)
13. **Mobile widths** — 320, 375, 414. No horizontal overflow; touch targets ≥44×44 with
    ≥8px gaps.
14. **Audit** — axe/Lighthouse on the nav in both states. Report score and every violation.
15. **Production build** succeeds; `/dev/brand` and `/dev/nav` are absent or 404 in
    production.
16. `git status --porcelain` — paste raw output.

---

### SPECIMEN ROUTES (dev-only, both)

**`/dev/brand`** — mark at the full size ladder with clear-space guides; wordmark and lockup
specs; all four colour variants; monochrome; favicon rendered at real size; a "does it read
at 16px?" row; the banned-cliché list shown as a comment, not rendered.

**`/dev/nav`** — Stage and Room modes side by side; at rest and scrolled; both themes;
mobile open and closed; `aria-current` on an item; the theme toggle; reduced-motion mode
side by side. Include a live note stating **what is real vs. what is a placeholder**
(specifically the auth-dependent entries).

---

### REPORT BACK

1. Files created / modified — and whether any existing nav/header was extended, kept,
   or replaced (with the reason)
2. **The mark's concept in your own words**, and any simplification made for 16px legibility
3. Deliverables shipped: mark, wordmark, lockup, variants, favicon set — with the clear-space
   and minimum-size rules
4. Icon library confirmation + the restrained subset actually used, listed by name
5. Component list and the `NavShell` configuration surface (Stage vs Room)
6. Scroll-state behaviour — properties animated, measured performance
7. Mobile menu accessibility implementation — focus trap, Esc, focus return, scroll lock
8. **The honesty decision** — what was rendered for auth, what backend it will need, and
   exactly which entries are placeholders
9. Theme toggle — persistence, pre-paint handling, flash-of-wrong-theme prevention
10. High-zoom and short-viewport behaviour of the sticky nav
11. Contrast measurements for the mark on both themes
12. Audit results, keyboard findings, screen-reader findings
13. Specimen routes + confirmation they are dev-only
14. Anything deferred, and confirmation nothing was half-built
15. Confirmation nothing existing was restyled, broken, or silently replaced

---

### STOP

This completes Phase 2. End after the report.
Do not begin Phase 3 (subject identity) or the homepage.
