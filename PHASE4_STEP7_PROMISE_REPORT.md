# Phase 4 · Step 7 — Scene 7: The Promise

Status: **BUILT, AUDITED, STOPPED.** Scene 8 not started. `/` now runs authored Scenes 0–7.

## 0. Inspection findings (pre-build)

- Contract (`src/lib/spine/scenes.ts` `promise`): order 7, reveal-once, **scrollBudget 1.0**, pins false, **subjectMode `neutral`** (the brief says `responsive` — the contract is frozen; the scene is rendered neutral with no subject accent, recorded in §6), accentUse subtle (none rendered), ambient off, **`liveCapability: false` ✓ confirmed**, authoredIn "Step 4.7" ✓, RM "Static statement of what mastery looks like; no charts, no animated counters", mobile "Single column statement", noJS "Server-rendered statement; makes no claim the product does not already demonstrate."
- **Anchor (3.1), exact wording** — `src/lib/subjects/subjects.ts:19–22`:
  > IMMUTABILITY — `id` keys user progress, recordings, classes and tutoring data later. NEVER rename an id after launch. A new enum value is a SCHEMA CHANGE — report it, do not silently extend a closed set.
  and line 49: `id: string; // IMMUTABLE slug`.
- Scenes 2/3/4 authored forms: Scene 2 compares six specimens (`[data-specimen-row]`); Scene 3 offers six doors (`choice.tsx`, "Enter" links); Scene 4 stages the crossing with the switch engine. Scene 7 must reference none as specimens/doors.
- 4.6 vocabulary: `Live today` / `In foundation` / `Next · not built yet`, derived from the module registry; Scene 6 ends with the consolidated statement — Scene 7 must not repeat it (it doesn't; its label is per-element only).
- Motion presets available: `.ta-reveal` (one-shot), `.ta-stagger` (40ms step, 300ms cap; RM overrides). 4.1 ceiling: 8 concurrent elements per scene.
- Motif: none needed; Scene 7 adds 0 motifs.
- Harness family: `audit/scene-enter.cjs`, `audit/scenes-practice.cjs` → extended with `audit/scene-promise.cjs`.

## 1. Files

| File | Change |
|---|---|
| `src/components/spine/scenes/promise.tsx` | NEW — Scene 7 (server component). |
| `src/components/spine/scenes/promise-stagger.tsx` | NEW — entry stagger wrapper (Scene 2's discipline; Scene 2's wrapper is hard-wired to its own ids). |
| `src/components/spine/slots.tsx` | +1 registry entry `promise`. |
| `src/lib/spine/scenes.ts` | `promise.status: skeleton → authored`. **Only field touched; no other scene's config changed.** |
| `src/app/dev/scene-promise/{page,preview}.tsx` | NEW dev specimen, 404 in production (verified 404 on :3100). |
| `audit/scene-promise.cjs` | NEW harness extension. |
| `/home/user/shots21/` | Screenshots (dark/light 1280, no-JS, RM, grayscale, done 0/3/7, widths 320–1920). |

Only Scene 7 was authored. Spine, Scenes 0–6, Scene 8, subject system, primitives, tokens, motion grammar, existing dev routes: untouched. `status.ts` (4.6) is reused, not modified.

## 2. Lead candidates

- **A (shipped):** *"Six scenes have described a system. This one is about you."* — Emphasis: the turn itself; names the page's own structure. Risk: slightly self-referential. 2 sentences, 11 words.
- **B:** *"You have already done three things on this page: seen the system, met its doors, watched a crossing. The rest happens inside."* — Emphasis: sets up the device. Risk: duplicates the marker labels word-for-word, and "three" is a count the device should carry, not the lead.
- Recommendation: **A.** It makes the turn cleanly and leaves the device to do its own job.

## 3. Mastery-statement candidates

| # | verbatim | claims | risks | asserts an outcome? |
|---|---|---|---|---|
| 1 | Mastery here is not a certificate. It is what accumulates in an environment that remembers where you were — every class, recording and piece of work kept against the same place, readable where you work. | negation of certificate; accumulation keyed to place; readable at point of work | opens by naming "certificate" (a banned term category, even negated); long second sentence | no |
| **2 (shipped)** | **Mastery here is a place that remembers where you were. Your classes, recordings and work are kept against the same environment, and your progress is read there — at the point of work, not on a separate dashboard.** | place-that-remembers; keyed to one environment; progress read at point of work vs dashboard (the industry-default distinction, stated plainly) | "progress is read there" describes designed behaviour → carries the `Next · not built yet` label | no |
| 3 | You will not be given a score. You will be given a room that keeps what you did in it, and shows you where you are while you are working. | no score; room keeps work; shows position while working | "where you are" edges toward rank semantics; "will be given" is a promise phrased as certainty | borderline (no) |

Recommendation: **2** — bounded, architectural, every clause anchorable, and it states the design commitment (in-environment vs dashboard) without a banned word. 2 sentences, 38 words.

## 4. Marker labels (visitor language, ≤4 words each)

`See the system` · `See the doors` · `Watch the crossing` · `Learn in the room` · `Work with a tutor` · `Watch your record grow` · `Master the subject` — 3/3/3/4/4/4/3 words. Internal names (discover/choose/enter/learn/interact/progress/master) are never rendered. State words: `done, on this page` / `ahead`. Group label: `Where you are on this page`.

Note on step 2: the internal step is CHOOSE, but the visitor did not necessarily choose — Scene 3 *offered* doors. The label says `See the doors` so that "done" stays literally true.

## 5. Closing narrative line

*"What is left on this page is the door you already saw."* — one sentence, 11 words, not a control, not a link; points at Scene 8's return.

## 6. The journey device

Form: a `<ul aria-label="Where you are on this page">` of seven `<li>`s on one hairline — horizontal row ≥ 48rem (7 equal columns), vertical sequence below (also at 200%/400% zoom). Each marker = a 9px circle (filled = done, hollow = ahead) + label (weight 500 done / 400 ahead) + a mono state word. No numbers, no bar, no fill-to-position, no connector between done and ahead that reads as "progress so far".

**Completion derivation — plainly: authored from page structure, not measured.** `MARKERS[n].doneBy` names the scene(s) that perform the step; `markerStates(scenesAbove)` marks a step done only when every such scene sits above Scene 7 in the frozen order. It is *not* derived from scroll or engagement: a visitor who arrives via `#platform` has the same page above them, unread. Nothing better exists to derive from today, and simulating engagement measurement would be a fabrication in the other direction.

Why it is not an achievement UI: state is a plain past-tense fact ("done, on this page"), never "complete!/✓"; nothing animates on completion (the only motion is entry stagger, one-shot, removed under RM/no-JS); done and ahead have equal size, equal legibility, equal type; no count, no fraction, no reward vocabulary; not focusable, no hover, no tooltip.

Subject mode actually used: **neutral** (contract). The scene names environments generically ("the room", "the same environment"); it renders no specimen, no door, no accent, no motif. Boundary vs Scenes 2/3 held by construction (0 subject entries consumed).

## 7. How the device avoids being a fake progress indicator

It measures the page, not the person. Every "done" is a thing that is literally above the reader in the document; every "ahead" is something the product has not built and says so in the same breath. It cannot inflate: it contains no scale, so there is no "60%"; it cannot flatter: the same three marks are done for everyone; and it degrades honestly — when modules ship, only the code that maps steps to real capabilities changes, and the matrix (§13) shows it reads correctly at 0, 3 and 7.

## 8. Honest-completion mapping

| step | label | done by | what that scene actually did |
|---|---|---|---|
| discover | See the system | Scenes 1–2 (`premise`, `difference`) | premise stated the thesis; difference showed six specimens |
| choose | See the doors | Scene 3 (`choice`) | offered six doors (one open, five in foundation) |
| enter | Watch the crossing | Scene 4 (`enter`) | staged the crossing with the switch engine |
| learn / interact / progress / master | … | — | not on this page; registry modules `planned` |

Nothing is marked done that a scene above does not perform. Harness: `discover=done, choose=done, enter=done, learn/interact/progress/master=ahead`, server HTML.

## 9. Anchoring report (shipped statement)

| clause | anchor |
|---|---|
| "Mastery here is a place that remembers where you were." | design commitment, bounded ("a place", not an outcome); anchored to the immutable `id` (subjects.ts:19–22, 49) and to the environment shell that already keys `/subjects/[id]` |
| "Your classes, recordings and work are kept against the same environment" | `id` IMMUTABILITY note names exactly these: "progress, recordings, classes and tutoring data"; shell regions `live-classes`, `recordings-notes`, `work-progress` (`src/config/shell-regions.ts`) are declared inside the environment shell |
| "and your progress is read there — at the point of work" | design commitment (the shell's `work-progress` region lives in the Room, not a separate route); labelled `Next · not built yet` derived from `student-portal: planned` |
| "not on a separate dashboard" | design commitment; no dashboard route exists in `src/config/routes.ts`/`modules.ts` |

Nothing unanchored remains. The label subject is "the record".

## 10. Every string Scene 7 renders (fabrication audit)

1 `The promise` · 2 `What happens to you.` · 3 `Six scenes have described a system. This one is about you.` · 4 (group label) `Where you are on this page` · 5–11 `See the system` / `See the doors` / `Watch the crossing` / `Learn in the room` / `Work with a tutor` / `Watch your record grow` / `Master the subject` · 12 `done, on this page` ×3 · 13 `ahead` ×4 · 14 `Mastery here is a place that remembers where you were. Your classes, recordings and work are kept against the same environment, and your progress is read there — at the point of work, not on a separate dashboard.` · 15 `Next · not built yet — the record.` · 16 `What is left on this page is the door you already saw.`

No statistic, testimonial, outcome, rank or number. `innerText.match(/\d+/)` on the rendered scene → `null`.

## 11. Sweeps (all against every rendered string + all candidates)

- Progress-UI terms (progress bar, ring, dial, percent/%, fraction, streak, XP, points, level, tier, badge, trophy, medal, certificate, rank, leaderboard, "of 7"): **none in rendered copy.** Candidate 1 (unshipped) contains "certificate" (negated) — one reason it was not chosen.
- Reward semantics (congratulations, well done, you did it, achievement, unlocked, earned, reward): **none.**
- Cliché list (Decision 6's twelve + standing 4.1 list; "what if you could"): **none.**
- Metaphor imagery: 0 `img/svg/canvas/video`; the device is circles on a hairline — abstract marker set, no path-through-landscape, no horizon. The distinction did not blur.
- CTA/capture: 0 `a/button/form/input/textarea/select/[tabindex]/[title]` in the scene.
- Dates/urgency (years, quarters, soon, waitlist, notify, countdown, hurry, limited, sign up, join now): **none.**

## 12. Word counts vs budgets

Lead 2 sentences / 11 words (≤2 ✓) · mastery 2 / 38 (≤2 ✓) · markers max 4 words (≤4 ✓) · closing 1 sentence / 11 words (=1 ✓) · scene total **96 words** in server HTML. No overrun.

## 13. State matrix (dev `?done=`)

- **0 complete:** seven hollow marks, all "ahead". Coherent — reads as "the whole path is ahead", which is what a visitor would see if the page had no Scenes 1–4. Slightly flat, but honest.
- **3 complete (shipped):** three filled + "done, on this page", four hollow + "ahead". Reads correctly.
- **7 complete:** all filled, all "done, on this page". Reads correctly as a map, but the state word is wrong for a shipped product — "Master the subject … done, on this page" would be false. When capabilities ship, `STATE_TEXT.done` must become capability-specific ("open" / "live") rather than "on this page". Recorded as the one place the device will need editing when the product changes.

## 14. No-JS and reduced motion

- No-JS (`shots21/s7-nojs.png`): all 16 strings, seven markers with correct states, 0 `.ta-stagger/.ta-reveal` in SSR, all opacity 1, 0 live regions.
- RM (`shots21/s7-rm.png`): stagger class never added; all visible; states read from text.

## 15. Grayscale, contrast, screen reader, keyboard

- Grayscale (`shots21/s7-gray.png`): done = filled `#f7f5f0` disc, ahead = hollow `#0b0e12`-filled ring, plus the words — distinction survives hue removal (it never used hue).
- Contrast on `--ta-surface-base`: dark primary 17.75 / secondary 16.27 / muted 7.65; light 18.36 / 15.71 / 8.93. Labels primary, state words secondary, eyebrow/closing muted — all ≥ AAA. No fixes needed.
- Screen reader order (axe tree, puppeteer): `section[aria-labelledby=scene-promise]` → h2 "What happens to you." → lead → `list "Where you are on this page", 7 items` → per item: label, state word → mastery paragraph → status "Next · not built yet — the record." → closing. No role of progressbar/meter, no "achievement", no live region. A user learns which are done and which ahead from words alone.
- Keyboard: tab order on `/` → … `enter:Enter Mathematics` → `return:Enter a world`. **0 stops in Scene 7.**
- axe on `/` Scene 7: 0 violations. axe on `/dev/scene-promise`: `skip-link`/`region` on the site chrome's "Skip to content" (dev page has no `#main`) — dev-only, pre-existing pattern.

## 16. Reflow

| width | layout | overflow | scene height |
|---|---|---|---|
| 320 | vertical sequence (7 rows) | none | 972px |
| 390 | vertical | none | 919px |
| 768 | vertical (breakpoint is ≤48rem inclusive) | none | 844px |
| 1280 | horizontal row, 7 columns, 1 row | none | 560px |
| 1920 | horizontal row | none | 560px |

Zoom 200% and 400% (1280 base): reflows to the vertical sequence, no horizontal scroll, nothing clipped. Text-spacing (1.4.12): no overflow, no clipping, no marker overlap. Both themes identical geometry.

## 17. Budgets and performance

- **Scroll budget:** declared 1.0; actual section 1.00 vh at 1280×800 (content 0.62 vh), **1.05 at 390×844 — marginal overrun, defect** (content exceeds the 100vh floor by ~5%; 320 will be similar). Not edited.
- Motion: 7 staggered children, cap 300ms — measured 2–3 elements mid-transition; ≤8 ✓. No sticky, no sequence.
- Motif delta: **0** (no motif rendered). Page totals unchanged.
- `/` prod Lighthouse desktop: **100/100/100/100**, LCP 0.7s (`h1#scene-arrival`), CLS 0, TBT 0, 358 KiB total (4.6: 356), JS 188.8 KB (+46 bytes). The one a11y flag is the pre-existing `label-content-name-mismatch` on Scenes 0/3 (recorded since 4.5). Dev page a11y 98 (`skip-link`, dev chrome only).
- CLS while scrolling into Scene 7: 0.0001; long tasks: none; frames avg 16.6ms, worst 21.8ms, 0 over 50ms.
- WebGL: 0 canvas, 0 matching chunk in 21 requests. Hydration warnings: 0 on `/`, 0 on the dev route.

## 18. Page-length readout — `/` Scenes 0–7

arrival 21 · premise 106 · difference 74 · choice 72 · enter 71 · people 68 · practice 166 · **promise 96** → **674 words ≈ 2.9 min at 230 wpm.**

## 19. Honest assessment

**(a) Does the device work, or is it a gimmick?** It works — narrowly, and for one reason: its claim is small and checkable. "You have seen these three things" is true of anyone reading the sentence, and the filled/hollow marks make a visible shape out of a page the reader has just scrolled. It is *not* moving; the emotional weight is in the mastery statement, and the device's job is to keep that statement honest by standing next to it with four hollow marks. Where it is weak: the 768px vertical layout takes 844px for what is, at heart, seven short lines; and "done, on this page" repeated three times is faintly clerical. I would keep it, but if a later pass tightens Scene 7, the first cut is the state words under the done markers (keep them under the ahead markers — that is where the honesty lives). Do not cut the device itself; without it Scene 7 is a paragraph of promise with nothing to hold it to the page.

**(b) Would the scene convert better with a door at the peak?** Almost certainly yes, in the short term — a "Enter Mathematics" link directly under the mastery statement would catch the reader at the moment of highest intent, and the current closing line ("the door you already saw") makes the reader scroll on to find it. I recommend **not adding one**: the 4.1 hierarchy (open / choose / return) exists so the page makes one ask at the end rather than three along the way, and a door at the peak would turn the promise into a pitch, which is the exact thing this scene is defined against. If the return scene under-performs, the correct fix is to shorten the distance between Scene 7's closing line and Scene 8's door, not to duplicate the door.

## 20. What the harness extension surfaced

- The 768px width falls on the vertical side of the `≤48rem` breakpoint (inclusive), so tablets get the vertical device — acceptable, but it was not an intended choice; recorded.
- The 1.0 budget is marginally overrun at 390 (1.05).
- Nothing new about the rest of the page: LCP element, payload, WebGL absence and the pre-existing label-in-name flag all unchanged.

## 21. Deferred / half-built

Deferred: capability-specific done-state wording for when modules ship (§13). Nothing half-built: no partial interactions, no hidden controls, no placeholders.

## 22. Nothing outside Scene 7 changed

Confirmed: only `slots.tsx` (+1 line) and `scenes.ts` (`promise.status`) touched outside the new files. Guard passes; `git status --porcelain` → `fatal: not a git repository (or any of the parent directories): .git` (exit 128, verbatim).

**STOP.** Step 4.8 (Scene 8 — The Return) not begun.
