# Phase 2 · Step 4 — Spatial System (Grid · Containers · Breakpoints · Density)

Scope: spatial system only. No components, pages, hero or nav built. Existing pages/components were
NOT restyled or refactored — their current widths/gutters are reported as a delta below.
Screenshots: `/home/user/shots5/` (`spatial-dark.png`, `spatial-light.png`, `spatial-torture.png`).

Two locked modes: **THE STAGE** (full-bleed, cinematic; may contain Rooms) and **THE ROOM**
(contained, calm; never holds Stage content). A view is one or the other.

---

## 1. Files created / modified

- **Created** `src/lib/spatial.ts` — canonical breakpoint/container/rhythm data (framework-agnostic).
- **Created** `scripts/check-breakpoints.mjs` — breakpoint drift check (fails loudly).
- **Created** `src/app/dev/spatial/{page,loader,preview}.tsx` — dev-only specimen.
- **Modified** `src/app/globals.css` — appended a `SPATIAL SYSTEM` block (extended in place, not forked).
  No 2.1/2.2/2.3 token values were changed; only new spatial tokens/classes added.

## 2. Canonical breakpoints + CSS/JS sync (incl. check command)

Single source: `src/lib/spatial.ts` `BREAKPOINTS`. CSS media queries in `globals.css` mirror the exact
`min` values (custom properties can't be used inside media queries). Both files carry a `!! SYNC PAIR !!`
warning. Bands are lettered/numbered only (no semantic names).

| band | min | cols | gap | gutter |
|---|---|---|---|---|
| xs | 0 (320 floor) | 4 | 24 | 24 |
| sm | 480 | 4 | 24 | 24 |
| md | 768 | 8 | 24 | 32 |
| lg | 1024 | 12 | 32 | 48 |
| xl | 1280 | 12 | 32 | 48 |
| 2xl | 1536 | 12 | 32 | 64 |

Check command (run it; exit 1 = drift):
```
node scripts/check-breakpoints.mjs
→ ✓ breakpoints in sync — canonical [0, 480, 768, 1024, 1280, 1536]
```

## 3. Container table (max-width + auto margins, never fixed)

| token | max-width | surface |
|---|---|---|
| `--ta-container-prose` | `var(--ta-measure)` (68ch, from 2.2) | long-form reading only |
| `--ta-container-content` | 70rem (1120) | **the ONE default** — Rooms, forms |
| `--ta-container-wide` | 90rem (1440) | galleries, subject grids, libraries |
| `--ta-container-stage` | none (full-bleed + safe insets) | Stage only |

Classes: `.ta-container` (applies `--ta-gutter`, centred) + `--prose/--content/--wide/--stage` modifiers.
Container width is never raw px in a component — always the token.

## 4. Grid spec per band

Columns/gap/gutter as in the table above. `.ta-grid` is mobile-first, **min-width only**
(4→8 at 768→12 at 1024). Gap 24 at xs/sm/md, 32 at lg+. Grid rule for later phases: content spans whole
columns; a "5.5 column" span is a composition failure, not a grid problem.

## 5. Vertical rhythm role tokens (clamp)

| token | clamp | px range |
|---|---|---|
| `--ta-space-section` | clamp(4rem, 3rem+5vw, 10rem) | 64→160 |
| `--ta-space-block` | clamp(2rem, 1.5rem+2.5vw, 4rem) | 32→64 |
| `--ta-space-stack` | clamp(0.75rem, 0.6rem+0.8vw, 1.5rem) | 12→24 |
| `--ta-pad-card` | clamp(1rem, 0.75rem+1.2vw, 2rem) | 16→32 |

PROXIMITY PRINCIPLE is encoded as a comment in the token file (1 step = related, 2 = grouped, 4+ =
separate sections; equal spacing implies equal relatedness).

## 6. THE DENSITY REMAP TABLE

`[data-density="compact"]` remaps ROLE TOKENS ONLY. Observed (identical content, comfortable vs compact):
padding `16px → 12.16px`; background, border-radius and font-size **unchanged** (`rgb(7,9,11)`, `8px`, `16px`).

| token | comfortable | compact |
|---|---|---|
| `--ta-space-block` | 2→4rem | 1.25→2rem |
| `--ta-space-stack` | .75→1.5rem | .5→.75rem |
| `--ta-pad-card` | 1→2rem | .75→1.25rem |
| `--ta-control-h` | 3rem (48) | 2.5rem (40, pointer surfaces) |

Compact must NOT change colour, type scale, radius or elevation (verified unchanged). Touch devices stay
comfortable, so the 44px floor is never violated on touch.

## 7. Container-query pattern + enforcement

`.ta-cq { container-type: inline-size; }` + `@container (min-width:480px)` demo (`.cq-card`). Verified at a
fixed 1280 viewport: container 300px → 1 column; 640px → 2 columns (proves adaptation to container, not
viewport). **MANDATORY for Phase 3+** reusable components; pages/sections keep using viewport media queries.

## 8. Overflow strategy for tables & equations

`.ta-scroll-x` (own scroll container, `overscroll-behavior-x: contain`, max-width 100%) + `.ta-scroll-fade`
(edge fade affordance). Made keyboard-reachable with `tabindex="0"`. Wide table (min-width 900) and a long
nowrap equation both scroll inside; the page never scrolls horizontally (width sweep confirmed).

## 9. Test results

1. **Width sweep** (320–2560): `sw == iw` at every width — no horizontal scrollbar anywhere.
2. **Reflow @320** (400% of 1280): no horizontal overflow; vertical scroll only (WCAG 1.4.10).
3. **Text spacing** (1.5/2/.12/.16): visibly passes — `spatial-torture.png`; no clipping (no fixed heights).
4. **Touch @xs**: all product targets ≥44 (primary 48, gap 8). The only <44 hit is the Next.js dev-tools
   badge (1×1 `<a>`, dev-only, not a product target).
5. **Density swap**: only spacing shifted; colour/type/radius unchanged (table above).
6. **Container isolation**: verified via @container column change at fixed viewport (§7).
7. **Drift check**: `node scripts/check-breakpoints.mjs` → in sync, exit 0.
8. **No fixed text heights**: grep over `src/components` → none.
9. **Both themes** render at `/dev/spatial` (`spatial-dark.png`, `spatial-light.png`).

## 10. Specimen route + dev-only confirmation

`/dev/spatial` (page gates `process.env.NODE_ENV === "production" → notFound()`). Production build:
`/`→200, `/dev/spatial`→**404** (also `/dev/motion|tokens|type`→404).

## 11. Deferred / uncertain

- Legacy components still use Tailwind's **default** responsive utilities (`sm:`×70, `lg:`×33, `md:`×3,
  `xl:`×2) at default screens (sm=640). These were deliberately left untouched to avoid restyling; the
  canonical bands govern all NEW spatial work. Migration is a later phase.
- `src/components/ui/container.tsx` uses gutters 16/24/32 and an undefined `--ta-content-max` (pre-existing).
  Not redefined, so existing layouts are unchanged; flagged for the component phase.
- Backgrounded-tab ambient measurement remains code-verified only (headless can't truly background).

## 12. Nothing existing restyled / broken

Token architecture, type scale/families/`--ta-measure`, motion tokens + reduced-motion contract, colours,
elevation, legacy alias block, existing routes/components/copy and build setup are all unchanged. The only
additions are the new spatial block in `globals.css`, `spatial.ts`, the drift script and the dev specimen.
`tsc`, `lint` and `next build` all pass; `git status --porcelain` → `fatal: not a git repository` (exit 128,
not initialised).
