# Phase 3 · Step 6 — The Environment Shell (ENTER)

The environment is now reachable: server-rendered, deep-linkable, accessible without
JavaScript, correctly scoped. Two routes. No features. No fake data. Screenshots in
`/home/user/shots13/`.

---

## 1. Files created / modified

Created:

- `src/app/subjects/layout.tsx` — subjects chrome: NavShell (stage mode), one `<main id="main">`,
  layout-level `SubjectEntry` (entry semantics).
- `src/app/subjects/page.tsx` — `/subjects` scaffold index (temporary, says so on-page).
- `src/app/subjects/[subject]/page.tsx` — the subject environment route: validation, draft guard,
  404, `generateMetadata`.
- `src/components/shell/subject-shell.tsx` — the environment shell (structure + scoping only).
- `src/components/shell/subject-nav.tsx` — navigation position (sibling subject links).
- `src/components/shell/subject-entry.tsx` — entry-semantics controller (announce once, focus,
  Room-containment assertion).
- `src/components/shell/slots.tsx` — the documented region fill point (currently empty).
- `src/config/shell-regions.ts` — named honest content-region registry.

Modified (ONE existing component, extended with reason):

- `src/components/layout/theme.tsx` — `ThemeToggle` only: neutral icon/label until mounted
  (`useSyncExternalStore`). **Reason:** latent 2.6 hydration bug — server default `"dark"` vs the
  client's stored/preferred theme mismatched on every surface mounting `NavShell` (the homepage
  uses `SiteHeader`, which is why it never surfaced before; verified home console clean, subjects
  route errored pre-fix). The fix changes no styling, renders an identical toggle after hydration,
  same box (no layout shift), and removes the mismatch for all consumers. Post-fix:
  `/subjects/mathematics` console `[]`, axe `[]`.

NOT replaced or restyled: NavShell, primitives, layouts, existing routes, not-found, footer.
Guard green (`no component imports a subject config directly`) — the shell receives everything via
props from the app-dir page.

## 2. Route structure as built

- `/subjects/[subject]` — shell for a valid subject. Unknown/invalid → framework 404 (themed, real
  explanation, route back; verified status 404, `has404`, `hasBack`).
- `/subjects` — scaffold index with visible note: “the real subject chooser is built in Phase 4”.
  In production, draft subjects render as plain text (“in foundation — not yet available”), never
  links to a 404.
- **Draft guard at the route:** `src/app/subjects/[subject]/page.tsx`:
  `if (s.status === "draft" && prod) notFound();` — prod `/subjects/physics` → **404**, dev renders
  with `[data-shell-draft]` banner. Belt-and-braces: `SubjectContext.apply` (3.1) still throws for
  draft-in-production.
- Prod statuses measured: math 200 · physics 404 · alchemy 404 · /subjects 200 · /dev/* 404 · / 200.

## 3. Shell responsibilities (as implemented)

1 scope: `[data-subject]` on the environment root (subtree-only). 2 layer mode: root
`data-spatial="stage"`; room region `data-spatial="room"` + `data-density="compact"`. 3 identity:
`SubjectMark` (3.2) + exactly one `h1` (subject name, focus target) + tagline. 4 motif: Stage
substrate + Room edge vector, server-rendered per 3.3. 5 ambient: `AmbientStage scope="stage"` —
SVG substrate beneath, lens lazy, Stage-only. 6 context: the 3.1 `[data-subject]` mechanism; nothing
more exposed client-side. 7 entry semantics: heading id/attributes for the layout controller.
The shell contains **no feature logic** — no fetches, no roles, no data.

## 4. Stage→Room composition, enforcement points

- Room substrate/canvas impossibility (3.3/3.5): `RoomMotifRole = Exclude<MotifRole,"substrate"|"transition">`
  + runtime `isRoleAllowed("room", role)` in `motif/stage.tsx`; `AmbientStage` returns before any
  canvas when `scope !== "stage"` (`ambient-stage.tsx`).
- “A Room can never contain a Stage” — structural (the shell composes Room only inside Stage) plus
  runtime assertion in `subject-entry.tsx` (`assertContainment()`): queries
  `[data-spatial="room"] [data-spatial="stage"]` and `[data-spatial="room"] canvas` on every load
  and navigation; measured **0/0** on all runs.
- On screen: Stage full-bleed with substrate + comfortable spacing; Room contained card, compact
  spacing, vector edge only. Measured spacing tokens: Stage `--ta-space-stack: clamp(.75rem,.6rem+.8vw,1.5rem)`
  vs Room `clamp(.5rem,.4rem+.5vw,.75rem)` — spacing-only difference (2.4).

## 5. Content regions

`live-classes` — “Live classes will appear here — Phase 7. Until then this room stays quiet.”
`work-progress` — “Your work and progress will appear here when the student portal ships
(currently planned in the module registry).” `recordings-notes` — “Recordings and lesson notes will
appear here with the recorded-classes module (planned).” Each labelled `SYSTEM STATE · NOT BUILT`.

## 6. Filling a region without editing the shell

`src/config/shell-regions.ts` declares regions; `src/components/shell/slots.tsx` (`REGION_SLOTS`)
is the fill point: a later phase maps a region id to a component and the shell renders it instead
of the placeholder. `subject-shell.tsx` is never edited for features. Registry is empty now —
nothing half-built.

## 7. Entry semantics

- DIRECT LOAD: `SubjectEntry` skips its first render — announce `""`, `activeElement: BODY`.
  No focus theft, no transition (verified).
- CLIENT NAV (Link or back/forward): layout persists; pathname effect runs post-commit → focus
  `H1#subject-heading` and ONE polite announcement, read from server-rendered heading attributes:
  “Now entering Physics — The Field — forces you can feel.” Stable 700ms later (no
  double-announce). Back/forward restore correct scope with one announcement each, no stranded
  state, console clean.
- The route runs the switch at its **instant-tier semantics** (swap + single announcement + focus,
  no motion — 3.4’s defined instant behaviour); the full PREPARE→TRANSFER ceremony stays where the
  switch owns a surface (/dev/switch; Phase 4 chooser). Reduced motion changes nothing to remove.
- Skip link: first Tab = “Skip to content”; Enter moves the sequential-focus start into `#main`
  (next Tab lands inside main). Landmarks: one `main`, one `h1`, order h1→h2→h3.

## 8. No-JS results

JS disabled, per route: correct `data-subject`, `h1`, tagline, 9 substrate paths, inert
`aria-hidden` canvas, six working nav links, three regions, correct `<title>`.
Screenshot `nojs-math.png` is pixel-identical to the JS render (theme toggle shows its neutral
pre-hydration box — the only honest difference).

## 9. Chunk isolation

Prod lazy WebGL chunk `0mf4owqbmymf2.js` (5.1KB class of content): referenced by **0** occurrences
in the initial HTML of `/subjects/mathematics` and `/`; absent from main/webpack/layout chunks.
Runtime: default headless (2 cores → ambient off) loads 13 scripts, canvas opacity 0; with an
8-core override the lens arrives (opacity 1) — the chunk loads only when needed. Room-only
surfaces (portals) never import `AmbientStage`.

## 10. Route-level CLS

Direct load (ambient absent/off): **0.0000534**. Ambient arriving (8-core override): **0.0000188**.
Reduced motion ⇒ ambient off ⇒ same as absent. The absolutely-positioned canvas shifts nothing.

## 11. Metadata per subject (measured)

Titles: “Mathematics · Subjects” … “History · Subjects” (index: “Subjects · Tutors Academy”).
Descriptions, distinct and honest, e.g. Mathematics: “Mathematics — The Lattice — structure you can
stand on. A quiet subject environment: identity, structure and a room for work. Classes,
assignments and progress arrive in later phases.” (same pattern per subject with its tagline).
Favicon unchanged: `app/icon.svg` / `favicon.ico` (brand mark).

## 12. Honest placeholder approach

Regions are TEXT ABOUT THE FUTURE STATE, labelled “SYSTEM STATE · NOT BUILT”, quiet solid borders,
no skeletons, no shimmer, no invented names/schedules/avatars/progress. The index says the chooser
is Phase 4. Draft subjects say “in foundation”. The 404 says the page “hasn’t been built yet”.

## 13. Audit / keyboard / a11y tree

- axe (dev, post-fix): mathematics `[]`, physics `[]`, /subjects `[]`.
- Lighthouse (prod, desktop): `/subjects` **100/100/100/100**, `/subjects/mathematics`
  **100/100/100/100** (perf/a11y/best-practices/seo).
- Keyboard (prod): Skip to content → Tutors Academy (home) → Subjects → theme toggle → Sign in →
  Create account → subject links. Logical; visible focus (2.6 tokens).
- A11y outline: `svg(aria-hidden)` substrate · `canvas(aria-hidden)` · `H1:Mathematics` ·
  `nav[Subjects]` · `H2:Inside this room` · `H3` ×3 regions — motifs/canvas absent from the tree;
  placeholders read as ordinary content.
- Both themes verified (screenshots `math-dark.png`, `math-light.png`); mobile 320px: scrollWidth
  320, ambient off; 320 + text-spacing overrides: still 320 (400%-zoom proxy).

## 14. Confirmations

No fake data anywhere (registry-driven truth statements only). No features built. `/dev/*`
untouched and 404 in prod. Homepage and real chooser NOT started. No new dependencies. No
route-change animation beyond 3.4’s instant semantics.

## 15. Deferred (nothing half-built)

Phase 4 homepage/chooser; region filling via the ready slot registry; full-ceremony switch at the
route boundary (stays with /dev/switch until the chooser owns navigation); Step 3.7 re-skin gate.

## 16. Nothing protected was changed

Tokens/type/motion/spatial/density (2.1–2.4), primitives (2.5), brand mark/wordmark/lockup/
favicon/nav shell design (2.6 — one hydration-correctness extension to `ThemeToggle`, documented
above, identity unchanged), schema/validator/guard (3.1), marks (3.2), grammar/roles (3.3),
switch machine/tiers (3.4), ambient layer (3.5), existing routes/layouts/copy, build/deploy — all
untouched. Guard ✓, validator ✓, tsc ✓, eslint ✓.

`git status --porcelain` (raw):

```
fatal: not a git repository (or any of the parent directories): .git
```
(exit 128)

Stopped before Phase 4 and Step 3.7, as instructed.
