# Phase 4 · Step 9 — Whole-page pass · PHASE 4 GATE

Verification, not construction. Output is proof. Reproduce everything below with:

```
npm ci && npm i --no-save puppeteer lighthouse @axe-core/puppeteer
npm run build && npx next start -p 3100 -H 0.0.0.0 &      # prod under test
npm run dev -- -p 3000 -H 0.0.0.0 &                        # dev (gating + /dev/* axe)
NODE_PATH=./node_modules node audit/page.cjs --check       # exit 1 on any gate FAIL or regression vs audit/baseline.json
NODE_PATH=./node_modules node audit/page.cjs --write       # re-baseline (only after a reviewed change)
```

Baseline: `audit/baseline.json` (generated 2026-09-27T10:09:19Z). Lighthouse: `audit/lighthouse-page.json`. Screenshots: `/home/user/shots23/`. Live read-out: `/dev/page` (dev only).

---

## 1. Inspection findings (before any change)

| Asked | Found |
|---|---|
| 3.7 harness + baseline | **Do not exist.** Phase 3 closed at 3.6; 4.3 §8 already recorded this. Per-scene harnesses exist (`audit/scene-enter.cjs`, `scene-promise.cjs`, `scene-return.cjs`, `scenes-practice.cjs`). So 4.9 *creates* the whole-page mode (`audit/page.cjs`) and the first committed baseline, in the same family and style — nothing rewritten, no parallel harness. |
| Consolidated deferred register | Located in 3.5 §14, 3.6 §15, 4.1 §15, 4.2 §16, 4.3 §18, 4.5 §18–19, 4.6 §10, 4.7 §21, 4.8 §21 (4.4 has no register section). Consolidated in §13 below and on `/dev/page`. |
| Contract for 9 scenes | Declared budgets 1.2/1.0/1.2/1.2/1.6/1.2/1.6/1.0/0.8 = **10.8** (4.8 report said 9.8 — an arithmetic slip in that report; the validator total was always 10.8). Actual at 1280×800: 1.2/1.0/1.21/**1.39**/1.6/1.2/1.6/1.0/0.8 = **11.0**. Ceiling `PAGE_SCROLL_CEILING = 12`. Sticky claimant: `enter` only (pins:true, sticky-stage). Sequence claimant: `practice` only (4 beats). Status: 8 × authored, **`arrival` still `skeleton`** (stale — the authored component has been registered since 4.2). |
| /dev/* gating | 19 routes; `grep -L notFound` empty → all gated. Verified at runtime: all 19 → 404 prod / 200 dev (baseline `devRoutes`). |
| /subjects scaffold vs Scene 3 | Self-declared "TEMPORARY SCAFFOLD", plain list, draft subjects as plain text. Coherent in *data* (same six, same statuses) but not in *treatment* (no doors, no motifs, no honesty labels). Recommend-only (§14). |
| Tests / lint / CI | `package.json` scripts: dev/build/start/lint. No test runner, no CI. `scripts/check-breakpoints.mjs`, `check-subject-imports.mjs`, `validate-subjects.mjs` exist; the spine validator runs at build. Lint: 0 errors in `src/`; the `audit/*.cjs` files fail `no-require-imports` (pre-existing pattern for all four earlier audit scripts; unchanged). |

---

## 2. D1 — Harness extension: `audit/page.cjs` (whole-page mode)

Per scene (both themes): every fg/bg text pairing with ratio + AA threshold by size, focusables + focus ring, touch targets, CLS contribution (layout-shift entries attributed to the scene), actual extent px/vh vs declared, type steps in use, honesty-treatment nodes (text/size/mono/upper), accent element count + subject-scoped count, motif surfaces/commands/DOM, words. Cross-scene: heading outline (levels in order, h1 count), landmarks, type steps → scenes (and single-scene steps), section spacing rhythm, treatment form per scene, accent presence vs contract. Page-level gates:

| Gate | Rule | Result |
|---|---|---|
| G1 contrast | every pairing ≥ 4.5 (≥ 3 large), both themes | **PASS** (first run FAIL → D-01 fixed) |
| G2 primaries | ≤ 1 primary-styled action visible in `<main>` at every 100 px position (90 positions) | PASS, max 1 |
| G3 scroll | actual total ≤ 12 vh; per-scene overrun = WARN | PASS 11.0/12; **WARN choice 1.39/1.2 (D-08, kept)** |
| G4 links | every href on `/` resolves (anchor in DOM or 2xx/3xx) | PASS 11/11 |
| G5 outline | exactly one h1, no skipped levels | PASS |
| G6 axe | no serious/critical, both themes | **PASS** (first run: color-contrast ×4, landmark-unique ×1 → D-01, D-02) |
| G7 motion | no long task > 50 ms during skim; nothing left hidden after second pass or skim | PASS |
| G8 CLS | full-scroll CLS = 0 both themes | PASS (0 / 0) |

`--check` diffs the run against the baseline on gate strings, per-scene extent (±0.02 vh), words (±5), payload JS (±5 KB), link set, primaries max, dev-route gating; exits 1 on any FAIL or regression.

## 3. D2 — Baseline contents (`audit/baseline.json`)

| Item | Value |
|---|---|
| Scroll declared / actual / ceiling | 10.8 / 11.0 / 12 vh (per scene above) |
| Motif budget vs 3.3 ceilings | 13 surfaces (6 difference, 6 choice, 1 enter); max **129/400** commands per surface; ≤ 15 SVG descendants per surface (3.3's grouped ceiling is 12 *elements*; the harness counts every descendant incl. defs/mask/title, so 15 is the stricter measure — recorded, not a breach). Totals 580 commands, 178 descendants. |
| Words / reading time | **722** on `/` incl. footer (21/106/74/72/71/68/166/96/48 + 19) → **3.1 min** @230 wpm. (First run read 746: the harness was counting S4's `<noscript>` fallback text; fixed in the harness.) |
| LCP | `h1#scene-arrival` — harness unthrottled 264 ms dark / 140 ms light; LH desktop 0.6 s; LH mobile (4× CPU, 1.6 Mbps) 2.3 s dark / 2.4 s light |
| CLS full scroll | 0 (both themes, harness); LH 0 |
| Longest task | skim: none > 50 ms (harness); LH mobile simulated: 144 ms dark / 190 ms light (framework hydration on 4× CPU) |
| Skim frame timings | 72 frames, avg 17.1 ms, worst 47 ms, 1 > 33 ms, 0 > 50 ms |
| a11y | axe `/` dark 0 / light 0; LH a11y 100 ×4; per-scene min contrast dark 7.6–7.65, light 4.75 (S3 accent label) – 8.93; /dev/* axe listed on `/dev/page` (dev pages: `region`, `skip-link`, `landmark-one-main` on specimen sheets — dev-only, unchanged) |
| CTA inventory | §6 |
| Payload | 26 requests; 1,064 KB uncompressed total, **JS 581 KB uncompressed** (LH byte weight 359 KB transferred); largest page-specific chunk 33 KB, the two >150 KB chunks are framework; WebGL chunks **0**, canvas **0** |
| Deferred register | §13 |

## 4. D3 — Second pass and fast skim

**Second pass** (fling to bottom, back to top, read each scene): 8 reveal containers, 0 hidden after being seen, 0 empty containers > 40 px, S6 beats visible (4/4) after the beats have been seen once, S7 markers `done,done,done,ahead,ahead,ahead,ahead` — state derived, not animated away. **S4 sticky re-entered from below:** stage `position: sticky`, 1 switch layer, name Mathematics, CTA "Enter Mathematics" — no stacked layers, no stale tier. **S7 journey device after reveal:** seven markers present, `discover,choose,enter,learn,interact,progress,master`, no re-animation.

**Fast skim** (12 × 750 px at 16 ms, then End/Home/End): mid-fling 0–14 elements mid-transition (one-shot reveals in flight, ≤ 700 ms), **settled: 0 hidden**, no queueing, sticky released, at-bottom true, no flash/jump (CLS 0), frames above, long tasks none. Screens: `skim-settled.png`, `second-pass-enter.png`.

## 5. D4 — Arc report

Full prose on `/dev/page` (Arc report). Summary:

- **Duplicate claims:** "Every subject is a place you can enter" S0 h1 / S8 h2 (deliberate echo, keep); "Six environments" ×6 (S1 h3, S2 h2 + h3, S3 h2, S4, S7) — S2 says it twice in 60 words; "environment becomes the page/subject" S3 close / S4 h2 (handoff, keep); "One of the six is open today" S3 / S8 (keep); "Enter a world" S0 / S8 same target (loop, keep); "same room you entered" S6 beats 1 & 3 (redundant); "Next · not built yet" ×6 across S5–S7.
- **Narrative breaks:** none hard. Soft: S4's claim is demonstrated only if the reader presses Next/Previous (4.5 no-autoplay decision stands); S5 opens on a negation.
- **Boundaries:** 2/3 strongest ("It is next." → threshold). 3/4 page→subject word-shift lands on the page's only pin. 7/8 tight (1.8 vh together). **5/6 weakest** — two "ahead" scenes, same label, S6 re-frames what S5 said.
- **Attention drops:** ~5.8–7.6 vh (S5→S6 beats 2–3: 28 % of words in 22 % of scroll, four identical labels); ~8.8 vh (third vertical list in three scenes).
- **Could be cut (recommend only, nothing cut):** merge S5 into S6 as a beat (−1.0 vh, −68 w; contract change → Phase 5 decision); S6 to three beats (−0.4 vh); drop S1's third h3 (claim ahead of its proof). Net ≈ 580 words / ≈ 9.4 vh.
- **Ending earns beginning:** yes, conditionally — the loop back to S3 keeps the promise only for the one open door.
- **Reading time vs ceiling:** 3.1 min; no word ceiling in 4.1; 4.8 recommended ≈ 580 w — page is 25 % over. Scroll inside the 12 vh ceiling.
- **Mobile 390 px:** 9,262 px = **11 screens**; S3 1.73 vh, S4 0.86 vh; no overflow. Verdict: readable, honest, S3 too long.

## 6. D5 — CTA set

| Scene | Label | Destination | Status | Variant |
|---|---|---|---|---|
| S0 | Enter a world | `#for-students` (S3) | anchor present | **primary** |
| S0 | Understand it | `#how-it-works` (S1) | anchor present | outline |
| S0 | ·↓ (aria "Continue to the premise") | `#how-it-works` | anchor present | text cue |
| S3 | Mathematics — The Lattice … Enter → | `/subjects/mathematics` | 200 | door (text) |
| S4 | ← Previous / Next environment → | in-page buttons | — | control |
| S4 | Enter Mathematics | `/subjects/mathematics` | 200 | **primary** |
| S8 | Enter a world | `#for-students` | anchor present | **primary** |
| footer | Tutors Academy home / How it works / Subjects / Sign in | `/`, `/#how-it-works`, `/subjects`, `/login` | 200/304, anchor, 200, 200 | text |
| header (chrome) | How it works / For students / For tutors / Platform / Sign in / Create account | anchors present ×4, `/login` 200, `/register` 200 | | Create account is primary-styled, sticky |

Hierarchy: primary = brass fill, "Enter …" verb, three positions; exactly **one** primary visible in `<main>` at each of the 90 sampled scroll positions (per-position list on `/dev/page`); header "Create account" is visible at every position (Phase-2 chrome; recorded, excluded from the body count). Label coherence: all primaries "Enter …"; one secondary verb; doors noun phrases; footer nouns. One touch-target note: footer "Sign in" 43×44 px (≥ 24 WCAG 2.5.8 AA; 1 px under the 44 AAA guide) — recorded.

## 7. D6 — Honesty sweep (11)

| # | Item | Result |
|---|---|---|
| 1 | Fake functionality | none; S4 is the real switch; inert doors are inert by data |
| 2 | Fake data | none |
| 3 | Placeholders | `supportEmail` "hello@tutorsacademy.example" — **removed (D-06)** |
| 4 | Treatment inconsistency | three sizes of the honesty label (11 mono / 14 mono / body prose); all obey "never smaller than what it describes" — recorded |
| 5 | Silent failures | none; `/dev/page` says so when baseline missing; validator loud |
| 6 | Pretend auth | none on this page |
| 7 | Dead links | 0 on `/`; unused FOOTER_NAV promised `/#platform`-era columns — **removed (D-05)** |
| 8 | Non-functional affordances | `/dev/spine` copy over-claimed "watch the page follow" — **copy corrected (D-09)**, rendered proof added on `/dev/page` |
| 9 | Hardcoded values | `themeColor #2449eb` blue — **fixed to ink/ivory (D-07)** |
| 10 | Unused code | D-05, D-06; nothing else |
| 11 | Half-built | `arrival.status` stale — **fixed (D-04)**; `/subjects` scaffold recommend-only |

## 8. Every change, against its defect

| ID | Defect | Fix | File |
|---|---|---|---|
| D-01 | Primary button white-on-brass 2.62:1 dark (all 4 primaries; axe serious ×4) | variant → `bg-surface-brand text-text-on-brand` (existing tokens; 7.4:1 both themes; same pairing `.ta-btn[data-variant=primary]` already used) | `src/components/ui/button.tsx` |
| D-02 | Two regions with same accessible name (S0/S8 echoed headline; axe landmark-unique) | sections named by contract `name` via `aria-label` | `src/components/spine/scene-slot.tsx` |
| D-03 | S3 door aria-label not containing visible label (LH label-content-name-mismatch) | aria-label removed; name = content | `src/components/spine/scenes/choice.tsx` |
| D-04 | `arrival.status: "skeleton"` stale | → `"authored"` (value only) | `src/lib/spine/scenes.ts` |
| D-05 | `FOOTER_NAV` unused | removed + pointer comment | `src/config/navigation.ts` |
| D-06 | `supportEmail` placeholder | removed | `src/config/site.ts` |
| D-07 | themeColor outside locked hue | ink-900 / ivory-50 by colour-scheme | `src/app/layout.tsx` |
| D-08 | S3 overrun 1.39/1.2 (1.73 mobile) | **not fixed** — six ≥ 6 rem doors + heading block cannot fit 960 px; budget predates the 4.4 grid→colonnade amendment. Left failing as WARN. Phase 5: contract amendment or door compression | — |
| D-09 | `/dev/spine` over-claim | copy corrected | `src/app/dev/spine/preview.tsx` |
| — | harness only | noscript excluded from word count; motif ceilings per-surface; payload measured from response bodies; primary detector follows the token class; per-position primaries recorded | `audit/page.cjs` |
| new | `/dev/page` route (gated) | read-out + players + `?frame=spine&order=swap` proof | `src/app/dev/page/{page,preview}.tsx` |

Not touched: contract enums, subject system, brand frame, motion grammar, switch state machine, any scene copy, any scene layout. No new tokens, deps, scenes, sections or public routes.

## 9. Verification matrix (32)

| # | Check | Evidence |
|---|---|---|
| 1 | Spine validator loud | build fails on `total scrollBudget 12.2 exceeds ceiling 12` (break C first attempt, `/tmp/build-breakC.log`) |
| 2 | Scene order from data | `/dev/page?frame=spine&order=swap` renders `… practice > return > promise` |
| 3 | Footer static, outside spine | footers=1, footer after last scene: true in both orders; `footer.insideSpine=false` |
| 4 | Scene components import no config | `scripts/check-subject-imports.mjs` pattern unchanged; tsc clean |
| 5 | Spine reorder on dev route | proof panel (above) — `/dev/spine`'s own control reorders its readouts (copy corrected, D-09) |
| 6 | Statuses honest | 9 × authored; S3/S5/S6/S7 labels derived from registry/config (second pass) |
| 7 | LH desktop | 100/100/100/100 both themes |
| 8 | LH throttled mobile | 98/97 perf; LCP 2.3/2.4 s; TBT 50/70 ms; a11y/bp/seo 100 |
| 9 | WebGL chunk absent | 0 matching requests, 0 canvas |
| 10 | Uncached weight | 359 KB transferred (LH), 1,064 KB uncompressed, 26 requests |
| 11 | CLS | 0 (harness full scroll ×2, LH ×4) |
| 12 | Long tasks during scroll | none > 50 ms (harness); skim worst frame 47 ms |
| 13–14 | axe `/` dark / light | 0 / 0 violations |
| 15 | Contrast every pairing both themes | G1 PASS; min 4.75 (light S3 accent label) |
| 16 | Heading outline | h1 ×1; levels 1,2,3,3,3,2,3,2,2,3,2,2,3,3,3,3,2,2 |
| 17 | Focus visible | 20 focusables, all `solid 2px` ring |
| 18 | Touch @320 | no overflow; 11/12 ≥ 44×44 (footer Sign in 43 wide) |
| 19 | Zoom 200 % | no overflow |
| 20 | Zoom 400 % | no overflow, nothing clipped |
| 21 | Text spacing (1.4.12) | no overflow, nothing clipped |
| 22 | Grayscale | `gray-choice.png`, `gray-promise.png` — state carried by words/buttons, not colour |
| 23 | Reduced motion | 0 motion classes, 0 hidden, order intact |
| 24 | axe on every /dev/* | 19 routes run; results per route on `/dev/page` (specimen sheets show `region`/`skip-link` — dev-only) |
| 25 | No-JS | 9 scenes render in order with full text; 1 element hidden by motion CSS = S4 controls (declared `noscript` fallback); footer present (`nojs-full.png`) |
| 26 | No-WebGL | page never requests it (9) |
| 27 | Hydration | 0 errors dark, 0 light |
| 28 | Slow-3G | h1 painted by 2.5 s, fonts settled, load 2.55 s (`slow3g-2500ms.png`) |
| 29 | Dev routes gated | 19/19 prod 404, dev 200; `/dev/page` prod 404 |
| 30 | `/subjects` | 200; scaffold text captured; recommendation §14 |
| 31 | Baseline re-run | `no diffs vs baseline`, exit 0 (twice: after write, after breaks reverted) |
| 32 | Second-pass integrity | §4 |

## 10. Deliberate breaks (all caught by `--check`, all reverted, `diff -q` clean)

**(a) accent contrast** — `text-text-on-brand` → `text-white` in button primary:
```
exit:1
"G1_contrast": "FAIL",  "G6_axe": "FAIL"
DIFFS vs baseline: gate  baseline G1_contrast PASS … G6_axe PASS → now G1_contrast FAIL … G6_axe FAIL
```
**(b) duplicate primary** — S0 "Understand it" outline → primary:
```
exit:1
"G2_primaries": "FAIL"   (baseline PASS → now FAIL)
```
**(c) scroll-budget overrun** — first attempt (declaration 1.6 → 3.0) was stopped earlier, by the 4.1 validator at build: `Error: [spine] invalid: total scrollBudget 12.200000000000003 exceeds ceiling 12`. Second attempt, declaration untouched, S6 content forced to 300 vh:
```
exit:1
"G3_scroll": "FAIL",  "scrollActual": 12.4,
"per-scene scroll overrun (defect, declaration untouched): choice 1.39/1.2, practice 3/1.6"
DIFF totals.scrollActual 11 → 12.4
```
**(d) footer dead link** — `/subjects` → `/subjects-old`:
```
exit:1
"G4_links": "FAIL"   dead: "/subjects-old:false"
```

## 11. Prod build, gating, git

Final `npm run build` exit 0 (3 ✓ lines). `/dev/page` prod **404**, dev 200. `/dev/spine`, `/dev/tokens` same. `theme-color` meta now `#0b0e12` (dark) / `#faf9f5` (light).

```
$ git status --porcelain
fatal: not a git repository (or any of the parent directories): .git
exit 128
```

## 12. `/dev/page`

Verdict banner + gates; budget readout (per scene declared/actual desktop+mobile, words, min contrast, focusables, touch, type steps, accent, treatment; LH table); consistency panel (outline, type steps + single-scene steps, spacing rhythm, treatment forms, accent, light-theme delta); CTA table with status codes + per-position primaries; players (second pass, fast skim with in-iframe rAF frame timings and long tasks, spine-is-data proof); arc prose; honesty table; defect table; deferred register; verified-vs-recommended; dev-route gating and `/subjects` note. Screens `dev-page-top.png`, `dev-page-players.png`.

## 13. Consolidated deferred register

| From | Item | Destination |
|---|---|---|
| 3.5 §14 | Ambient for five more subjects; hero integration | Phase 5, after five-subject approval |
| 3.6 §15 | Route-boundary full switch; 3.7 gate | Gate superseded by 4.9; switch → Phase 5 |
| 4.1 §15 | Practice sequence animation | Delivered 4.6 — closed |
| 4.2 §16 | Chooser replaces S3 scaffold links | Delivered 4.4 — closed |
| 4.3 §18 | Harness; arrival status; premise quietLine wording; primary dark contrast | Harness + D-04 + D-01 done; quietLine → Phase 5 copy pass |
| 4.5 §18 | Ambient at Stage scale; `ta:door` dispatch | Phase 5 (receiver dormant by design) |
| 4.6 §10 | Registry-planned modules | Product phases; labels derive |
| 4.7 §21 | Done-state wording per capability | when a registry status flips |
| 4.8 §21 | Legal/contact/DPDP; length edits | Phase 5 entry; edits recommended §5, not applied |
| 4.9 | D-08; S1/S2/S6 trims; S5→S6 merge; `/subjects` replacement; premise quietLine; framework JS weight | Phase 5 entry list |

## 14. `/subjects` recommendation

Replace the scaffold with a route that renders Scene 3's door list from the same data (six doors, one open, honesty labels, motifs), so the footer's "Subjects" link and the page's threshold agree. Until then the footer link leads from the most-designed surface on the site to the least — the largest treatment discontinuity a visitor can reach in one click. Not changed in 4.9.

## 15–19. Phase close

**15. Status: CERTIFIED WITH DEFECTS.** Open: D-08 (S3 overrun, honest WARN), reading length over recommendation, `/subjects` scaffold, footer "Sign in" 43 px, three-size honesty label (recorded).

**16. Top 3 risks into Phase 5.** (1) *The one-door problem*: the whole arc resolves to a threshold five of six visitors cannot cross; every extra week the page is public without a second open subject converts honesty into disappointment. (2) *Launch-blocking absences*: privacy, terms, contact, DPDP (children's data) — the page is clean today only because it collects nothing; the header's "Create account" already points at a form. (3) *Budget drift*: S3 shows how a design amendment (4.4) can silently invalidate a declaration; without `--check` in CI the next amendment will do it again — wire `audit/page.cjs --check` into the pipeline before anything else lands.

**17. Is `/` ready to be the front door? No.** What stands between: a second open door or an explicit decision that Mathematics-only is the launch; the four legal/contact items; `/subjects` replaced; D-08 resolved by decision (amend to 1.4 with the spine owner, or compress the colonnade); the length edits. Everything mechanical is green; what remains is product and legal, not code.

**18. Recommended Phase 5 entry point.** Start with the governance items that unblock everything else: (i) add `audit/page.cjs --check` to CI, (ii) decide D-08 and the S5/S6 merge with the spine owner (one contract amendment, one PR), (iii) legal/contact routes and the DPDP review, then (iv) the second subject's room — which is what turns the ending into a door.

**19. Phase 4 closed.** Do not begin Phase 5 without the decisions in 18(ii).

---

## Addendum A — D-08 settlement (decision recorded after Phase close)

**Decision (owner): Option A, amended.** Scene 3 `scrollBudget` corrected **1.2 → 1.4**, recorded as a CORRECTION EVENT, not a clean value. Grounds: 1.2 was unreachable by construction for the 4.4 colonnade (floor ≈ 982 px vs 960 px); a declaration that cannot be met without degrading touch/reading targets is an error, not a constraint — a stale declaration, not an overrun.

**Condition 1 — recorded as a diff, not a result.** `audit/baseline.json` now carries `corrections: [{ scene: choice, field: scrollBudget, from: 1.2, to: 1.4, step: "4.9 (D-08)", measuredWhenCorrected: { 1280x800: 1.39, 390x844: 1.73 }, reason, oneTimeOnly: true }]`; the `--check` summary prints the corrections list on every run; `/dev/page` shows a "Declaration corrections (the record keeps the red)" table above the budget readout. The source carries the same provenance as a comment beside the value (`src/lib/spine/scenes.ts`). G3 is green; the 1.39/1.73 stay in the record.

**Condition 2 — provenance.** 4.4's own report, §12 "Scroll budget — overrun defect, declaration untouched": *"Contract declares 1.2 vh. Measured scene height / viewport: 320→2.71, 390→1.73, 768→1.43, 1280→1.39, 1920→1.20. Only 1920 meets it. Six equal rows … cannot …"*. **Disclosed at the time, as instructed.** This is a known consequence carried forward, not a discovery by the gate. No process failure to record for 4.4. (Process note against 4.9's own first pass: the 4.8 report's "declared 9.8" was wrong — 10.8 — and the harness's first declaration parser skipped a scene once a comment sat above its value; both caught by cross-checks in this step, both fixed.)

**Condition 3 — one-time only, stated in the baseline.** `correctionPolicy`: *"ONE-TIME. A declaration may be corrected retroactively only where it predates the geometry it describes. Every later scope change updates its declaration when it lands; an overrun found by this harness after 4.9 is a defect in the scene, never in the declaration."* Also in the source comment and on `/dev/page`.

**Condition 4 — regression detection runs on actuals.** Verified three ways:
1. *Code:* `--check` compares, per scene, `scenes.<id>.extentVh (measured)` ±0.02 vh and `mobile.<id>.screens (measured)` ±0.02, plus `totals.scrollActual` ±0.05, the pinned `mobile.pageH` ±17 px and `mobile.screens` ±0.02, and the `corrections` list itself — none of these read the declaration.
2. *Accident:* my first edit landed on the wrong scene (`difference`, first regex match). `--check` failed on `scenes.difference.extentVh (measured) 1.21 → 1.4`, `mobile.difference.screens 1.2 → 1.4`, `mobile.pageH 9262 → 9431`. Corrected; re-run diffs were then exactly the correction event and nothing else.
3. *Deliberate break (e):* declaration left at 1.4, Scene 3 forced to 160 vh → `exit 1`, `scenes.choice.extentVh (measured) 1.4 → 1.6`, `totals.scrollActual 11.01 → 11.21`, WARN `choice 1.6/1.4`. Reverted, `diff -q` clean.

**Mobile gate (owner's spec, ratio gate rejected).**
- *Page total on mobile — pinned, drift-checked.* Measured 390×844: **9,262 px = 10.97 screens**, pinned in the baseline. Drift tolerance ±0.02 screens / ±17 px: measured run-to-run jitter across five runs today was **0 px**, so any diff beyond one line of body text is a real change, not noise. No invented ceiling; whether 11 screens is *too long* is the arc report's job (it says S3 is), not the gate's.
- *Per-scene mobile — outlier vs siblings, report-only.* Ratio to sibling median (1.2): arrival 1.0, premise 0.83, difference 1.0, **choice 1.44**, enter 0.72, people 1.0, practice 1.33, promise 0.88, return 0.67. No threshold is justified by this data (max 1.44; six-door stacking is legitimate at 390), so it ships as a signal: ratios recorded every run, anything ≥ 2× median listed under `mobile.outliersReportOnly` (currently none). Not a WARN, not a gate — an unearned gate is worse than none.
- *Third part:* the owner's message was truncated after part 2 — please resend; nothing has been built for it.

After settlement: declared 11.0 / actual 11.01 / ceiling 12; G3 PASS with no WARN; `--check` → `no diffs vs baseline`, exit 0; prod build 0; `/dev/page` 404 prod / 200 dev; `git status --porcelain` → `fatal: not a git repository`, exit 128. Files touched: `src/lib/spine/scenes.ts` (value + comment), `audit/page.cjs` (corrections record, actuals comparisons, mobile pin + outlier signal, declaration parser tolerant of comments), `src/app/dev/page/preview.tsx` (corrections panel, D-08 row).
