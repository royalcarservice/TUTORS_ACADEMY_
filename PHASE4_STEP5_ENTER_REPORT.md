# Phase 4 · Step 5 — Scene 4 “Enter · the crossing” (`enter`, sticky-stage claimant)

Status: **built, verified, stopped.** No Scene 5–8 work. Spine order, scroll grammar, contract fields (other than `enter.status`), subject system, brand, nav, shell, primitives, switch state machine and tiers, `/subjects` scaffold, Scenes 0–3: untouched.

---

## 1. Files

| File | Change |
|---|---|
| `src/components/spine/scenes/enter.tsx` | **new** — the scene (no transition code; calls the engine) |
| `src/components/switch/subject-switch.tsx` | **extended, default-preserving**: three optional presentation props `renderIdentity`, `announceFor`, `minHeight`. State machine, tiers, ceremony, morph decision, timings, layers, live region: unchanged. `/dev/switch` DOM unchanged (surface attributes `data-switch-surface,style`; identical render path when props are omitted). |
| `src/components/spine/slots.tsx`, `spine/scene-slot.tsx` | register `enter`; entry type gains optional `accent` |
| `src/app/(public)/page.tsx` | route passes `accent: s.accent1` (engine needs the hex pair for small-element interpolation) |
| `src/lib/spine/scenes.ts` | `enter.status: skeleton → authored`. **No other field, no other scene.** |
| `src/app/dev/scene-enter/page.tsx` + `preview.tsx` | **new** dev specimen (404 in prod) |
| `audit/scene-enter.cjs` | **new** — the Scene 4 audit sweep (the 3.7-style harness, now kept in-repo rather than `/tmp`) |
| `PHASE4_STEP5_ENTER_REPORT.md` | this report |

Guards: subject-import ✓ · validator ✓ · tsc ✓ · eslint (whole `src`) ✓.

## 2. Lead candidates (verbatim)

- **A — SHIPPED:** `You have seen six environments side by side. Now watch one become another. The mark, the wordmark, the type and the controls hold still. Only the environment moves.`
  Emphasis: the move itself, and what stays vs what changes (the central visual proof stated in words). Risk: "watch" promises motion — under reduced motion / no-JS the swap is instant or absent (the no-JS frame still renders the sentence). Recommended: it names exactly what the scene does and nothing more.
- **B:** `This page shows each environment's identity. Its depth is inside. Step between the six here, then go through the door of the one you came for.`
  Emphasis: the two-level product (the reason to cross). Risk: "depth is inside" edges toward promising interior content the visitor has not seen; "go through the door" leans on Scene 3's metaphor and half-reads as an instruction to choose. Not shipped; the depth idea is carried instead by the one true CTA line (§4).

Core principle applied to copy: nothing in Scene 4 describes what is inside a route beyond one demonstrably true sentence about the ambient layer (§4). The Stage shows identity and atmosphere only; depth is deliberately withheld so entering still gives more than the homepage showed.

## 3. Control framing candidates (verbatim, boundary-checked)

| # | Framing | Not-a-chooser check |
|---|---|---|
| **1 — SHIPPED** | Group label `Step between environments`; buttons `Previous environment` / `Next environment` | Passes: verbs are *step/previous/next*; no list of subjects to pick from; position readout is descriptive (`Mathematics · one of six`). |
| 2 | `Cross to the next environment` | Passes the vocabulary check but implies one direction only and reads as an imperative to the visitor rather than a description of the control. |
| 3 | `Move through the six` | Passes; slightly vaguer about what "the six" are at the point of reading. |

Recommendation: 1. Sweep of Scene 4's rendered text for `select|choose|pick|start`: **none**.

## 4. CTA labels and announcement strings

- Ready: primary `Enter {Subject}` → `/subjects/{id}`; beneath it: `Inside, the environment runs its ambient layer. This page never loads it.` (True today: `SubjectShell` mounts `AmbientStage`; `/` requests no ambient/WebGL chunk — §14.)
- Draft: mono `In foundation` (text, not a link, not focusable) + `This environment is built. Its door is not open.` No countdown, no waitlist, no "soon", no apology.
- Announcement (once per step, polite, engine live region): `Now showing {Subject} — {Environment}.` Fired in the walk, in order:
  `Now showing Physics — The Field.` · `Now showing Chemistry — The Vessel.` · `Now showing Biology — The Organism.` · `Now showing English — The Page.` · `Now showing History — The Record.` · `Now showing Mathematics — The Lattice.`

## 5. Stage composition

- One environment at a time inside `[data-enter-stage]` (hairline frame, radius-2), the engine's layer(s) beneath: subject-scoped `data-subject` layer, `background: --ta-surface-base`, substrate motif role at Stage scale with the 3.3 reading column masked out (`READING_COLUMN`, 5–71 % × 10–90 %).
- Identity: subject mark 48 px in accent-1 (interpolated during TRANSFER by the engine), mono `Environment` label, `<h3>` subject name in text-primary, environment name in mono accent-1, tagline remainder, then the eligibility-aware action. Order and geometry identical for every subject; only accent, mark, substrate and words change.
- Brand frame made legible: (a) the site header stays on screen for the whole hold (it is the page's sticky header); (b) the lead says what holds still; (c) the mono caption under the Stage: `What stays: the mark, the wordmark, the nav, the type. What changes: the environment.`
- Not a simulated interface: no table/input/progress/form/tab/dialog/nav inside the scene (boundary check 0); no schedule, names, counts, ratings; no digits anywhere in the scene (counts spelled).
- Default environment: **first `ready` in config order** (`defaultEnvironment()` → Mathematics). Handoff path: the receiving listener for `ta:door` is installed per `CHOICE_HANDOFF`, but Scene 3 is frozen and does not dispatch, so **the default path is the only live path**. No new cross-scene state, nothing persisted.

## 6. The switch is 3.4's engine — tier per step

Verification of reuse: `enter.tsx` imports `SubjectSwitchSurface` and calls `apiRef.current.trigger(id)`; grep of the scene for `requestAnimationFrame|planFor|phaseAt|transferProgress|ceremonyFor|selectTier|opacity` → none. Mid-transition DOM shows the engine's two `[data-switch-layer]` nodes crossfading (e.g. `mathematics:0.83 / physics:0.17` at 150 ms — the FULL plan's early TRANSFER).

Deliberate six-walk on `/` (1.85 s apart, desktop-class emulated: 8 cores, 1280 wide, fine pointer), engine telemetry read from the dev-only `data-enter-tier` attribute:

| step | to | tier / ceremony | approach | trigger→settle | worst frame |
|---|---|---|---|---|---|
| 1 | Physics | full / full | crossfade | 675 ms | 72 ms |
| 2 | Chemistry | full / full | crossfade | 674 ms | 44 ms |
| 3 | Biology | full / full | crossfade | 661 ms | 45 ms |
| 4 | English | full / full | crossfade | 667 ms | 47 ms |
| 5 | History | full / full | crossfade | 674 ms | 66 ms |
| 6 | Mathematics | full / full | crossfade | 666 ms | 59 ms |

Dev specimen tier table (same rule, continued): step 7 back to Physics → **reduced / shortened** (255 ms); two triggers inside 1.5 s → **instant / shortest** (0 ms). All settles ≤ 700 ms.

**Discrepancy vs the brief's summary:** 3.4's ceremony rule is *first entry into a subject this session → full*; a walk that visits six new subjects therefore selects the full ceremony six times (each ≤ 700 ms). "Shortened" applies on return to a subject already seen; "shortest" on rapid stepping. The rationing behaves exactly as 3.4 designed; the brief's "full once, shortened after" is per-subject, not per-session. Recorded, not changed (the switch is frozen). Note also: the initial environment is not counted as "entered", so the first return to Mathematics is a full ceremony.

On this sandbox (2 cores) the un-emulated tier is `reduced` (mid-range rule); reported for honesty.

## 7. Brand-frame invariance

Method: screenshot the 1280×40 header strip before the walk, then again 150 ms into each of the six transitions (mid-TRANSFER); compare base64 byte-for-byte. Result: **identical ×6 (dark) and ×6 (light)**. `s4-mid-transition.png` shows the crossfade under an unchanged header, heading, lead and control. Scene type, control geometry and Stage frame are static by construction (the only animated properties are layer `opacity` and the small-element accent colour).

## 8. One substrate at a time · `/` motif budget

- Idle: `[data-switch-layer]` count = **1** at every settled step; rAF-sampled maximum across the whole walk = **2** (TRANSFER only). After interruption tests: 1, opacity 1.
- Substrate cost when shown (commands / DOM / gen ms): mathematics 50 / ≤6 · physics 39 · chemistry 58 · biology 58 · english 34 · **history 256** — all under 400 / 12 / 8 ms.
- Page live total (Scene 2 six edge specimens + Scene 3 six edge doors + Scene 4 one substrate): from the 4.4 measurement 530 cmd / 84 DOM / 2.14 ms for twelve edge surfaces, plus at most 256 cmd / 5 DOM for the shown substrate → **≤ 786 cmd / ≤ 89 DOM** over 13 surfaces (ceiling 5 200 / 156); mid-transition adds one more substrate (≤ 256 cmd). No coverage reduction needed.
- **Honest visual note:** with the reading column masked and the Stage at 1024×368 (slice-fit of a 1000×600 viewBox), the *chemistry* (bonds) and *english* (typographic) substrates fall largely inside the masked column and read as near-empty at 1280×800 in dark; physics, mathematics, biology and history read clearly. This is the 3.3 legibility rule doing its job against those two rule sets' central geometry; it is not fixable here without touching the grammar or the engine's exclusion. Recorded as a Scene 4 weakness for the motif owner.

## 9. Focus and announcements

- Focus: `Next environment` focused, Enter ×6 → active element stayed the Next button after every step (dark and light). Rapid and mid-flight retargets: unchanged. Nothing calls `focus()` in the scene; the engine is in `inline` mode.
- Announcements: exactly 6 mutations of the single polite `role="status"` region for 6 steps (no double fire, no churn). Reduced motion: instant swap with the same single announcement. Live regions on `/`: the engine's one.

## 10. Sticky behaviour and scroll

Rule used (`ENTER_STICKY_RULE`, printed on the specimen): the spine pins the section (160vh, sticky 100vh); Scene 4 releases the pin (position static, section height auto) when **no JS** (noscript style), **prefers-reduced-motion / `[data-reduced-motion=on]`**, **width < 48rem**, or **height < 30rem** (mirrors the 2.6 nav rule). 400 % zoom on 1280×800 = 320×200 CSS px → static.

Measured (1280×800, scroll-behaviour forced to auto for probing): sticky top = 0 from section top through +480 px (the 60vh hold), then −220 at +700, −720 at +1200 — **releases cleanly**. 400 % proxy 320×200: static, section 813 px, no horizontal scroll. Short 900×400: static. Reduced motion 1280×800: static, section 642 px. Content fits inside the hold at 768/1280/1920 (`contentFits: true`).

No scroll-jacking: no wheel/touch/key listeners in the scene (`section.onwheel` null; the scene registers only `ta:door` and click); wheel Δ300 → scrollY +300; PageDown → +700; End reaches the document bottom; body overflow visible; overscroll auto. The hold is `position: sticky` only.

## 11. Reduced motion · no-JS · all-draft · all-ready

- Reduced motion (`s4-reduced.png`): static section; step → 1 layer immediately, name and announcement update; control fully functional.
- No-JS (`s4-nojs.png`): one complete environment (Mathematics, The Lattice, tagline, accent mark `rgb(143,160,255)`, substrate 4 paths), real `Enter Mathematics` link, pin released, stepping control withheld (`visibility: hidden` — nothing dead offered; space reserved so nothing shifts). **Lost without JS: stepping only.** Noted: the lead's "Now watch one become another" is unfulfillable without JS.
- All-draft (`s4-force-draft.png`): `In foundation` + line, **0 focusable** in the identity block, full identity otherwise identical.
- All-ready (`s4-force-ready.png`): `Enter Mathematics`, 1 focusable, composition holds.

## 12. Every string Scene 4 renders (dark, config statuses, initial state)

`The crossing` · `The environment becomes the subject.` · `You have seen six environments side by side. Now watch one become another. The mark, the wordmark, the type and the controls hold still. Only the environment moves.` · `Step between environments` (group label) · `Previous environment` · `Next environment` · `Mathematics · one of six` · `Environment` · `Mathematics` · `The Lattice` · `structure you can stand on.` · `Enter Mathematics` · `Inside, the environment runs its ambient layer. This page never loads it.` · `What stays: the mark, the wordmark, the nav, the type. What changes: the environment.` · (live region, empty until a step) · per step: subject name, environment, tagline remainder from config; draft: `In foundation` · `This environment is built. Its door is not open.` No digits; no names, dates, counts, ratings, schedules.

## 13. CTA hierarchy across Scenes 0–4

Scrolled in 200 px increments at 1280×800: exactly one primary visible at any position — Scene 0's `#for-students` primary at y 0–600; Scene 4's `Enter Mathematics` at y 3600–4800 (the hold); the skeleton Return scene's primary at 7800+ (out of scope). Never two simultaneously. Tab order: Scene 3 door → `Previous environment` → `Next environment` → `Enter Mathematics` → Return CTAs.

## 14. Performance

- Production Lighthouse desktop: **100 / 100 / 100**, LCP 0.7 s (`h1#scene-arrival`), CLS 0, TBT 0 ms, total 353 KiB, JS transfer ≈ 189 KB. Mobile-throttled: perf 98, LCP 2.2 s, CLS 0, TBT 70 ms.
- Walk CLS: 0.0001 (dark and light) — the position readout's width change; nothing else moves.
- Frames across the full six-walk (≈ 12 s sampled): avg 16.8 ms, worst 72–76 ms, 3 frames > 50 ms per walk (the incoming layer's first paint), **long tasks: none** on `/`. The `reasons` chain never downgraded on `/`.
- WebGL/ambient: 21 requests on `/` incl. a step; none match `three|webgl|ambient|canvas`; `<canvas>` count 0.
- Hydration warnings: 0 on `/`, 0 on `/dev/scene-enter`.

## 15. Widths (dark = light)

| width | pin | section | Stage box | targets |
|---|---|---|---|---|
| 320 | static (rule) | 813 px (0.96 vh) | 272×267 | 191×48, 206×44, 181×44 |
| 390 | static | 727 px | 342×267 | same |
| 768 | sticky | 1638 px (1.6 vh) | 704×284 | same |
| 1280 | sticky | 1280 px (1.6 vh) | 1024×370 | same |
| 1920 | sticky | 1728 px (1.6 vh) | 992×418 | same |

No horizontal scroll at any width; text-spacing override: 0 clipped elements; 200 %/400 % proxies OK. Scroll budget: declared 1.6, section = 1.6 vh where pinned; ≤ 0.96 vh when released — **within declaration** (first Phase 4 scene that is).

## 16. Placement — honest assessment

For a visitor who did not click in Scene 3, Scene 4 still earns its place: it is the only place on the site where the switch is the event, and it is the strongest demonstration of the claim Scenes 1–2 made in words. But the order is inverted for persuasion: the visitor is asked to decide (Scene 3) *before* being shown the thing that would make the decision easy (Scene 4). **Recommendation: the crossing would be stronger before the doors** (Scene 2 → crossing → doors), with the crossing's CTA removed so Scene 3 remains the single conversion point. Not reordered — the spine is fixed by 4.1.

## 17. What the harness extension surfaced

- Lighthouse `label-content-name-mismatch` on **Scene 0's cue** (`aria-label="Continue to the premise"`) and **Scene 3's doors** (visible "Enter" vs `aria-label="Mathematics — The Lattice"`) — WCAG 2.5.3 label-in-name, previously unreported. Not Scene 4; owners of 4.2/4.4.
- The dev specimen with 24 live iframes drives the engine's frame-health rule to `instant` (avg frame > 33 ms) — a true positive of 3.4's degradation, which is why the frames are now withheld behind "load frames" so the isolation walk measures the engine, not the specimen.
- The chemistry/english substrate visibility note (§8).

## 18. Deferred register

- **Ambient-at-Stage-scale on the homepage** — possible only once the 3.5 five-subject recommendation is approved; today depth (ambient lens, environment shell, any future WebGL) stays inside `/subjects/[id]`, which is the reason to cross. Recorded here and on the specimen's "Real vs deferred" panel. **Not built.**
- Scene 3 → Scene 4 handoff dispatch (`ta:door`) — receiver installed; dispatch requires a Scene 3 edit (frozen).

## 19. Deferred / nothing half-built

Nothing half-built. Open items for owners: substrate visibility for bonds/typographic in a wide Stage (§8); label-in-name on Scenes 0/3 (§17); primary-button dark contrast 2.62:1 (pre-existing, now also visible on Scene 4's CTA — axe `color-contrast` ×1 in Scene 4 dark, 0 in light); pre-existing `nav-shell` 479 px breakpoint drift; `arrival.status` still `skeleton` in the contract (pre-existing).

## 20. Nothing outside Scene 4 changed

Confirmed by file list (§1). Production: `next build` clean; `/dev/scene-enter` **404**; `/dev/switch` 404 (prod, as before); `/subjects/mathematics` 200, drafts 404.
`git status --porcelain` →
```
fatal: not a git repository (or any of the parent directories): .git
```
(exit 128; no repo, not initialised.)

Artifacts: `shots19/` — `s4-dark-1280`, `s4-light-1280`, `s4-mid-transition`, `s4-walk-1..6-*`, `s4-nojs`, `s4-reduced`, `s4-grayscale`, `s4-force-ready/draft`, `s4-sticky-zoom400/short/rm`, `s4-320/390/768/1280/1920`, `s4-focus-next`. Harness: `audit/scene-enter.cjs`. Specimen: `/dev/scene-enter` (`?frame=1&theme=&subject=&force=ready|draft&rm=1`).
