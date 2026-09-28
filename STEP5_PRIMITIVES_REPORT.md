# Phase 2 · Step 5 — Core Primitives (Button · Surface/Card · Field/Input · Progress)

Behavior and skin are separate layers. Every visual is driven ONLY by the semantic tokens from
2.1–2.4; Phase 3 re-skins per subject by overriding tokens, never these files. No component library
and no icon library were installed (puppeteer + axe-core were added `--no-save` purely as test tooling).
Screenshots: `/home/user/shots6/` (`prim-dark.png`, `prim-light.png`, `focus-brass.png`, `focus-error.png`).

---

## 1. Files created / modified — extended vs kept vs replaced

| File | Action | Reason |
|---|---|---|
| `ui/button.tsx` | **Extended** | `buttonVariants/buttonSizes/buttonClass` kept byte-identical (consumed by ~6 existing pages → no restyle). The previously **unused** `<Button>` was reimplemented with behavior/skin separation, 4 roles, loading, anchor-shared skin. |
| `ui/card.tsx` | **Extended** | Added composition API + variants. Default look kept equal to the old card (border + elev-1 + radius-4 + surface-base) so the single legacy consumer (`not-built-yet` placeholder) renders unchanged. Legacy named exports retained. |
| `ui/input.tsx` | **Replaced** | It was UNUSED anywhere (verified by grep); safe to rebuild token-skinned with states + forwardRef. |
| `ui/field.tsx` | **Created** | Shared Field wrapper with exact a11y wiring. |
| `ui/progress.tsx` | **Created** | Linear progress, determinate + indeterminate. |
| `ui/index.ts` | **Extended** | Exports the new primitives; legacy exports untouched. |
| `globals.css` | **Extended** | New token-only PRIMITIVES skin + reduced-motion handling. |
| `dev/primitives/*` | **Created** | Dev-only states-matrix specimen. |

No existing page/layout JSX was touched. No working component was silently replaced.

## 2. Component API

- **Button** `<Button variant size loading href …rest>` forwardRef. `variant`: `primary|secondary|ghost|danger` (exactly four). `size`: `sm|md|lg|icon` (icon is square, requires `aria-label`). `href` renders an `<a>` sharing ONE skin via `taButtonSkin()`. `loading` → spinner + `aria-busy`, width preserved, input blocked.
- **Card** `<Card variant>` + `Card.Header/Title/Description/Body/Footer/Media`. `variant`: `flat|raised|inset|interactive` (no `stage`). Interactive = whole card is ONE link, no nested controls.
- **Field** `<Field id label hint error success required showOptional>{control}</Field>` — clones the control to inject `id`, `aria-describedby`, `aria-invalid`, `required`. Never renders without a label.
- **Input / Textarea** forwardRef; `validating` (spinner + busy), `state="success"`, `readOnly`, `disabled`.
- **Progress** `<Progress value label showValue>`; omit `value` for indeterminate (omits `aria-valuenow`).

## 3. States matrix

- Button: default · hover · focus-visible · active/press · loading · disabled · aria-disabled · sm/lg/icon — × 4 roles, both themes (specimen).
- Card: flat · raised · inset · interactive · nested-action footer (anti-pattern handled).
- Input: default · hover · focus · filled · disabled · read-only · error · success · loading/validating.
- Progress: determinate · near-complete · zero · indeterminate.

## 4. Missing tokens

Only one gap: an "on-danger" text colour. Resolved **without inventing** a value by reusing the existing
semantic `--ta-text-inverse`, which theme-adapts and holds correct contrast on `--ta-state-danger` in both
themes (dark: light-red + ink; light: deep-red + ivory). No new tokens were created.

## 5. Accessibility wiring

- Field: label via `htmlFor/id`; `aria-describedby` = hint+error/success ids; `aria-invalid` on error;
  error/success in `aria-live="polite"` regions; required as text "(required)", optional "(optional)".
- Button: icon-only carries `aria-label`; loading exposes an `sr-only` name (the visible label is
  `visibility:hidden` + `aria-hidden` only to preserve width).
- Progress: `role="progressbar"` + min/max + `aria-valuenow` (determinate) / omitted (indeterminate) + label.

## 6. Focus ring on brass

Global `:focus-visible` = 2px `--ta-focus-ring` + offset 2; `.ta-btn:focus-visible` adds a 2px
`--ta-surface-base` box-shadow halo so the teal ring never dissolves into the brass fill. Keyboard-only
pass: 44 reachable elements, **0 invisible focus states** on product elements (the only flagged node was
the Next dev portal, not product UI).

## 7. Signature press under reduced motion

`:active` on primary = `translateY(1px) scale(.99)` + brief brass edge-light (`--ta-dur-instant`, confirm).
Under reduced motion the transform is removed (`transform:none`) while the background state change remains —
state preserved, movement gone.

## 8. Density — only spacing changed

Primary button measured comfortable vs compact: `bg rgb(194,154,69)`, `radius 8px`, `font-size 14px` all
IDENTICAL; only spacing role tokens (`--ta-pad-card`, `--ta-space-*`, control-h) shift. Card padding follows
`--ta-pad-card` automatically (no component branching).

## 9. Audit + keyboard / SR findings

- **axe-core**: initial 4 violations fixed (button-name critical ×4 = loading buttons → sr-only name;
  landmark-one-main / region / skip-link = specimen lacked landmarks → added `<main>` + skip link).
  Final run: **0 violations attributable to primitives**; the only 2 moderate findings target Next's
  dev-overlay `.sr-only-focusable` (dev tooling, absent in production).
- **Keyboard**: full tab pass, logical order, focus always visible.
- **Screen reader**: verified via axe + ARIA inspection (no real SR in sandbox): names announced, `aria-busy`
  on loading, label+hint+error announced, progress values announced.
- **Error announcement**: triggering the error announced via live region with `document.activeElement`
  unchanged (focus did not move).
- **CLS on loading toggle: 0.0000** (width preserved).

## 10. Specimen route + dev-only

`/dev/primitives` gates `NODE_ENV === "production" → notFound()`. Production: `/`→200,
`/dev/primitives`→**404** (and `/dev/spatial`→404).

## 11. Deferred (none half-built)

Select · Combobox · Checkbox · Radio · Switch · DatePicker · OTP · FileUpload; icon set (inline SVG
placeholders used for spinner/error/success); ring/dial progress. All simply absent, not stubbed.

## 12. Nothing existing restyled / broken / silently replaced

`buttonClass` output unchanged; `Card` default visually unchanged; layouts/routes/copy untouched;
`tsc`, `lint` (0 errors) and `next build` all pass; 320px & zoom show no overflow; touch targets ≥44;
`git status --porcelain` → `fatal: not a git repository` (exit 128, not initialised).
