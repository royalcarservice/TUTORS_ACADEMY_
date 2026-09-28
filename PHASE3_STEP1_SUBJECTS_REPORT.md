# Phase 3 · Step 1 — Subject Identity Schema + Switchboard

Contract only — no illustration, custom marks, ambient/3D or transition choreography (those are 3.2–3.5).
Screenshots: `/home/user/shots8/` (`subjects-dark.png`, `subjects-light.png`, `ring-math-dark.png`).

## 1. Files created / where configs live

- `src/lib/subjects/subjects.ts` — schema types, closed enums, derivation fn, **the six configs**.
- `src/lib/subjects/validate.ts` — pure validator (contrast, ΔE, mutual matrix, ring, schema).
- `src/lib/subjects/SubjectContext.tsx` — minimal provider + `useSubject` + mechanical draft guard.
- `scripts/validate-subjects.mjs` — build-time gate (compiles validator w/ project TS, exits non-zero).
- `scripts/check-subject-imports.mjs` — guard test (components may not import configs).
- `src/app/globals.css` — appended SUBJECT SCOPING block (six `[data-subject]` accent triads, both themes).
- `src/app/dev/subjects/{page,loader,preview}.tsx` — dev-only switchboard.
No brand-frame, primitive or existing-route file was changed.

## 2. Complete schema (pinned)

`id` (immutable slug) · `name` · `tagline` · `status draft|ready|locked` · `environment` (words) ·
`accent1/2/3` each `{ink,ivory}` · `atmosphere graphite-field|deep-space|glass|organic|paper|cartographic` ·
`motif lattice|field|bonds|living|typographic|strata` · `motionChar precise|energetic|reactive|growing|editorial|sequential` ·
`density sparse|balanced|dense` · `motionCharter{enterChoreo,exitChoreo,morphTarget,ambient{enabled,budget,pauseOffscreen,stopsOnBlur,fallback}}` ·
`roomMood` · `degradation{reduced,static}`. All enums CLOSED; a new value = schema change, reported.

## 3. Mathematics (reference) — config + environment

Accent triad explicit: a1 `#8fa0ff/#4353c9`, a2 `#a5b0ff/#5a6be0`, a3 `#4a527c/#9aa1c6`.
Environment: *"A graphite field of quiet, exact structure: a fine indigo lattice beneath generous negative
space… nothing glows, nothing hurries; a proof reads as calm architecture, not decoration."* (full text in config.)
`ready`; atmosphere graphite-field; motif lattice; motion precise; density sparse; enter `reveal→stagger`, exit `exit`;
morphTarget lattice node; ambient budget 4, pause/blur on, fallback static.

## 4. Five draft configs + derivation rule

`accent2 = mix(accent1, neutral, .18)`, `accent3 = mix(accent1, neutral, .55)` toward ink/ivory (documented,
re-checked by validator). Produced (ink/ivory): physics a2 `#d37959/#cc6236` a3 `#794939/#e1a68c`; chemistry
`#a57dd4/#9e60fb`/`#604b7d/#c8a5f8`; biology `#68c08b/#3e965e`/`#3e7054/#93c3a2`; english `#d37889/#c93c5d`/
`#794853/#df91a2`; history `#6ab2c1/#388ca2`/`#3f6872/#90bdc8`. All `status:'draft'`.

## 5. Full validator output (all six PASS)

Per subject: schema ✓; contrast-ink a1 text ≥4.5 (math 7.96/7.47, phys 8.70/8.16, chem 8.45/7.93, bio 12.74/11.95,
eng 8.94/8.39, hist 11.68/10.96); contrast-ivory a1 ≥4.5 (6.01/5.81 … 5.09/4.92); a2 graphic ≥3 both themes;
sep ΔE brass/signal ≥20 (min: bio signal 25.7 ink); ring-on-surface ≥1.15 (12.20 ink / 4.83 ivory) with the 2.5
surface halo isolating the ring (ring-on-accent reported informational). **Mutual-distinctness matrix (ΔE ink/ivory,
≥15): all 15 pairs pass** — smallest are math×chem 21.3/41.3 and phys×eng 31.7/33.0. `✓ ALL SUBJECTS VALID` (exit 0).

## 6. Three proofs

- **Validator failure:** set math a1 to `#0b0e12` → `■ mathematics FAIL · contrast-ink a1 text 1.00/1.07`, exit 1; reverted.
- **Guard failure:** added `import { SUBJECTS } from "@/lib/subjects/subjects"` to `ui/badge.tsx` →
  `✗ GUARD … direct subject-config import`, exit 1; reverted → exit 0.
- **Draft guard:** `SubjectProvider.apply()` throws for a `draft` subject when `NODE_ENV==='production'`;
  `/dev/subjects` is dev-only (prod 404) and no production route consumes subjects, so a draft cannot ship.

## 7. Scoping mechanism

CSS: `[data-subject="<id>"]` re-points `--ta-accent-1/2/3` (raw per-theme values at `:root`/`[data-theme=light]`);
brand tokens untouched. JS: `SubjectProvider`/`useSubject` (minimal). **Nesting rule (commented in provider):** a Room
inside a Stage keeps accent identity, reduces atmosphere, disables ambience via `roomMood` — no second colour source.

## 8. Brand-frame invariance evidence

Side-by-side `InvariancePanel` (math vs physics) renders identical mark (brass, same size), wordmark, type and button
geometry (measured h 48 / radius 8px / font 14px equal); only the accent bar colour differs. Switching all six produced
**CLS 0.0000** (colour-only change).

## 9. roomMood + degradation ladder

Declared per subject (e.g. math: room "exact, quiet, negative space"; degradation reduced "ambient off, lattice static,
motion to opacity" → static "flat graphite + indigo hairline"). Full strings in config.

## 10. /dev/subjects route

Dev-only (`notFound()` in production; prod → 404). Clearly labels placeholders (environment art, marks, ambience,
transitions deferred; "real art in 3.4" on the Stage strip).

## 11. Accents adjusted for contrast

Only the focus-ring check needed re-modelling: the ring renders on the 2px surface halo (2.5), so it is verified
ring-on-surface (passes) with ring-on-accent informational — no accent hue was changed for that. All six accent1 values
passed text/graphic contrast as chosen; none required a lightness change.

## 12. Deferred (nothing half-built)

Environment art, custom subject marks, ambient layer, transition choreography (3.2–3.4), subject routing (3.5). All
absent, none stubbed. No seventh subject.

## 13. Nothing in brand frame / primitives / existing routes changed

Only additions: subjects lib, two scripts, a CSS scoping block, and the dev route. `tsc`/`lint`(0 errors)/`next build`
pass; axe on `/dev/subjects` = 0 violations; keyboard switcher operable (radio group, aria-checked, visible focus);
320px OK with ≥44px targets; `git status --porcelain` → `fatal: not a git repository` (exit 128).

Stopped before Step 3.2 as instructed.
