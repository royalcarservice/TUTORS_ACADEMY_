# Phase 2 · Step 6 — Navigation Shell + Brand Mark Lockup  (FINAL STEP OF PHASE 2)

Consumes the design system; adds **no** new tokens, colours, motion presets or primitives.
Screenshots: `/home/user/shots7/` (`brand-dark.png`, `nav-mobile-open.png`).

---

## 1. Files created / modified — extended vs kept vs replaced

| File | Action | Note |
|---|---|---|
| `components/brand/brand.tsx` | **Created** | Mark / wordmark / lockup / variants / clear-space constants. |
| `src/app/icon.svg` | **Created** | Favicon (ink tile + 3px stroke). |
| `components/ui/icon.tsx` | **Created** | `Icon` + `IconButton` wrappers (16/20/24, one stroke, a11y names). |
| `components/layout/theme.tsx` | **Created** | `ThemePrepaint`, `useTheme`, `ThemeToggle` (real, persisted). |
| `components/layout/nav-shell.tsx` | **Created** | `SkipLink`, `NavLinkItem`, `NavActions`, `UserMenu`, `NavShell` (+mobile sheet). |
| `components/shared/logo.tsx` | **Replaced (reported)** | Old glyph was a **graduation cap — on the hard-ban list**. Now a thin delegate onto the brand components; header keeps working, single source of truth. |
| `src/app/layout.tsx` | **Modified (reported)** | Added `<ThemePrepaint/>` + `suppressHydrationWarning` so theme is live app-wide with no flash. |
| `src/app/dev/brand/*`, `src/app/dev/nav/*` | **Created** | Dev-only specimens. |

Existing **SiteHeader / PortalShell / SiteFooter structure was KEPT** (not restyled, not forked). The new NavShell is introduced for Phase-4 adoption; mounting it on live layouts now would restyle existing pages, so adoption is deferred (reported, not silent). Only the brand glyph inside the existing header changed — which is precisely this step's purpose.

## 2. The mark's concept + 16px simplification

"The Unbroken Line": ONE continuous stroke (`MARK_PATH`, single subpath) enters on the crossbar, sweeps it, returns to centre, drops the stem, then walks the right leg up to the apex and down the left leg — discover → master as one path. No banned cliché; no gradient/glow/animation; brass only.
**16px simplification:** the favicon renders the same path at **strokeWidth 3 on an ink tile** (heavier than the 2.5 on-screen weight) so it reads at 16px; the on-screen 16/20px ladder also uses the 3px stroke. No shape change was needed — only stroke weight.

## 3. Deliverables + clear-space / min-size rules

Mark (16→200px), wordmark (set in Fraunces, caps, +0.09em, optical kern), lockup, and variants
(primary brass / ink / ivory-reversed / monochrome). Clear space = `BRAND.clearSpace` = **0.5 × the
mark's own height** (ratio, not px). Minimum lockup height = 24px. Shipped as inline SVG + reusable
components; no raster logo images in the UI. Favicon = `src/app/icon.svg`.

## 4. Icon library + restrained subset

**Lucide** — already a dependency (`lucide-react ^1.48.0`), so no install was required (it is the one
permitted dependency). One 1.5 stroke; fixed 16/20/24 grid; icons never the only carrier; no animation.
Subset used by the new shell: `Menu, X, Sun, Moon`. (Pre-existing chrome uses a few more; unchanged.)

## 5. Components + NavShell configuration surface

`NavShell({ mode: "stage"|"room", items, navLabel, children })` — one component, configuration only.
Stage floats over content (transparent at rest); Room is solid compact. `navLabel` gives each shell a
unique landmark name. Subcomponents exported: `SkipLink`, `NavLinkItem` (aria-current), `NavActions`,
`UserMenu`.

## 6. Scroll-state behaviour + performance

A scrim layer animates **opacity only** (0→1); no height animation, no reflow. Scroll listener is
`passive` + rAF-throttled. Measured: rest opacity 0 → scrolled 1; no layout shift; header height 68px at
320w (17% of a 400px viewport) — it never consumes the viewport. Reduced motion zeroes the transition
(0.01ms) via the global + attribute contract.

## 7. Mobile menu accessibility

Focus moves into the sheet on open; **focus trapped** (15 tabs stayed inside); **Esc closes and returns
focus to the trigger**; `aria-expanded`/`aria-controls` wired; background scroll locked by
`overflow:hidden` **plus scrollbar-width compensation** (`clientWidth` unchanged 375→375, no shift).

## 8. THE HONESTY DECISION

No real signed-in state exists, so the shell renders honest **"Sign in" / "Create account"** entries to the
real `/login` `/register` routes (currently explicit placeholders) — **no fake avatar or account menu**.
Backend required: an auth provider (e.g. NextAuth/Clerk), session handling (HTTP-only cookies), and a user
record from an identity/users store. Those entries are the only auth-dependent placeholders.

## 9. Theme toggle — persistence + pre-paint

`localStorage["ta-theme"]`, default `prefers-color-scheme`. `<ThemePrepaint/>` (inline script, now in the
root layout) applies the attribute **before first paint** — verified `data-theme="light"` present at
`domcontentloaded` after reload (no flash). `suppressHydrationWarning` on `<html>` silences the expected
server/client attribute diff.

## 10. High-zoom / short-viewport sticky rule

`@media (max-height:30rem){ header[data-mode]{position:static !important} }` — on very short viewports /
high zoom the shell becomes static instead of consuming the viewport. At 320px the condensed bar is
mark + trigger only (wordmark hidden <480px), no overflow.

## 11. Contrast (graphic, ≥3:1)

brass-500 on ink = **7.37** ✔ · brass-700 (the light-theme value of `--ta-brand`) on ivory = **6.02** ✔.
(The hypothetical brass-500-on-ivory would be 2.49, but the on-light variant already uses the darker
brass-700 via the theme token — a lightness-only adjustment, no new token.)

## 12. Audit + keyboard + SR

axe on `/dev/nav` = **0 violations** (after adding `<main>`, unique landmark names, skip link). Keyboard:
skip link is the FIRST tab stop; every item reachable; focus always visible; no trap. SR: landmarks unique
(`navLabel`), `aria-current="page"` on active, `aria-expanded` on the trigger. (Tool: axe-core + ARIA
inspection; no real SR in sandbox.)

## 13. Specimen routes (dev-only)

`/dev/brand` and `/dev/nav`, both gated `NODE_ENV==="production" → notFound()`. Production: `/`→200,
`/login`→200, `/dev/brand`→**404**, `/dev/nav`→**404**, `/dev/primitives`→404.

## 14. Deferred (nothing half-built)

Homepage/hero/marketing sections; full footer content (existing footer kept as-is); auth backend; subject
identity (Phase 3); route-change animations (Phase 4); search. All absent, none stubbed.
**RTL sanity:** layout uses logical properties (`padding/margin-inline`) so it mirrors; the skip-link and
touch guides use physical `left` and would switch to `inset-inline-start` in a full RTL pass.

## 15. Nothing existing restyled / broken / silently replaced

Header/footer/portal shells structurally untouched; only the banned-cap glyph was retired (reported).
Primitives and tokens unchanged. `tsc`, `lint` (0 errors) and `next build` all pass. Existing routes return
200. `git status --porcelain` → `fatal: not a git repository` (exit 128, not initialised).

---

**Phase 2 complete.** Stopped before Phase 3 (subject identity) and the homepage, as instructed.
