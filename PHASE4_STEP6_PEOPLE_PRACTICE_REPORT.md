# Phase 4 · Step 6 — Scenes 5 + 6: The People · The Practice

Status: **BUILT, AUDITED, STOPPED.** No Step 4.7 work. `/` now runs authored Scenes 0–6; Scenes 7–8 remain skeleton.

## 1. What was built (files)

| File | Role |
|---|---|
| `src/components/spine/scenes/people.tsx` | Scene 5 — the relationship, not a roster. Server component. |
| `src/components/spine/scenes/practice.tsx` | Scene 6 — one session's arc in four beats; the `sequence` claimant. |
| `src/components/spine/scenes/status.ts` | The honesty treatment: three-state vocabulary, rules, DERIVATION from the module registry. |
| `src/components/spine/slots.tsx` | +2 registry entries (`people`, `practice`). Fill point only. |
| `src/lib/spine/scenes.ts` | `people.status: skeleton → authored`. **Only field touched.** |
| `src/app/dev/scenes-practice/{page,preview}.tsx` | Dev specimen, 404 in production (verified 404 on :3100). |
| `audit/scenes-practice.cjs` | Harness extension (same launcher/probes as `scene-enter.cjs`). |
| `/home/user/shots20/` | Screenshots: both scenes × dark/light × 1280; 390 frames; no-JS; RM. |

Not modified: spine (`home-spine.tsx`, `scene-slot.tsx`), contract shape, scroll grammar, voice, subject system, brand frame, nav/environment shells, primitives, switch, Scenes 0–4, existing dev routes, tokens, deps. Zero new tokens/colours/marks/motifs/motion vocabulary.

**One decision to flag:** to derive status honestly without touching the spine, the two scenes read `PLATFORM_MODULES` from `@/config/modules` (the roadmap-as-data registry that already feeds navigation, `not-built-yet.tsx` and `badge.tsx`). The 3.1 guard bans *subject* and *scene* config imports in components and still passes; the module registry is neither. The `modules` prop exists so the dev specimen can force the state matrix; the shipped page never forces.

## 2. Contract

| | people | practice |
|---|---|---|
| order / anchor | 5 / `#for-tutors` | 6 / `#platform` |
| status | skeleton → **authored** (this step) | **already `authored`** since 4.1 (pre-existing; not changed) |
| scrollBehaviour | reveal-once | **sequence — the only claimant on the spine** |
| scrollBudget declared | 1.2 | 1.6 |
| actual (section h / vh) | **1.20** at 320/390/768/1280 | **1.60** at 390/768/1280 · **1.80 at 320×800 — OVERRUN, defect** (content 1387px > 160vh floor; the spine's `minHeight` cannot shrink content) |
| content height alone | 0.61 vh @1280 | 1.36 vh @1280 |
| subjectMode / accentUse | neutral / contract says `subtle` — **rendered with no subject accent** per brief; contract frozen, discrepancy recorded | neutral / subtle — no subject accent rendered |
| liveCapability | false ✓ | false ✓ |
| authoredIn (contract) | "Step 4.6" ✓ | **"Step 4.7"** — contract discrepancy, frozen, recorded |
| pins / sticky | false / 0 sticky elements measured | false / 0 |

The Scene 6 320px overrun is the same class of defect 4.4 recorded for Scene 3 (declared 1.2 vs 2.71@320). Fix belongs to a scroll-grammar pass, not a declaration edit.

## 3. Scene 5 — the relationship (full string list, in DOM order)

1. eyebrow `The people`
2. h2 `A tutor here has a place, not a profile.`
3. lead `There is no roster on this page. A tutor does not get a profile page and a video call; a tutor gets an environment, and shapes it.`
4. line `Five things are theirs to set: accent, atmosphere, motif, motion character, density.`
5. line `The environment is the workspace. You meet your tutor inside it.`
6. status `Next · not built yet — the tutor's side of the environment.`

**Budget:** lead = 2 sentences (≤2 ✓); supporting lines = 3 (≤3 ✓, the status line counted as one); **68 words** for the whole scene (server HTML count).

**Lead candidates:** A (shipped) above. B: *"You will not find a list of tutors here, because none has been invented for you. When tutors arrive, each will own an environment and shape it."* — A chosen: it states the product claim (environment vs profile+call) rather than talking about the page.

**Verifiability per sentence** — (a) verifiable today · (b) design commitment · (c) forbidden → removed:
| sentence | class | check |
|---|---|---|
| There is no roster on this page. | a | scene renders 0 img/svg/list/card/focusable (harness §1) |
| A tutor does not get a profile page and a video call; a tutor gets an environment, and shapes it. | b (product commitment) + a (environments exist: `/subjects/*`) | labelled by line 6 |
| Five things are theirs to set: accent, atmosphere, motif, motion character, density. | a — the five levers are the subject schema fields `accent1`, `atmosphere` (graphite-field/deep-space/glass/organic/paper/cartographic), `motif` (lattice/field/bonds/living/typographic/strata), `motionChar` (precise/energetic/reactive/growing/editorial/sequential), `density` (sparse/balanced/dense) | `src/lib/subjects/subjects.ts:25–29` |
| The environment is the workspace. You meet your tutor inside it. | b | labelled by line 6 |
| Next · not built yet — the tutor's side… | a — derived from `tutor-portal: planned` | registry |
| *(removed, c)* "chosen and held to a standard" (contract RM note wording) | c — standards/credentials claim with no mechanism | removed |

**Undistinguishable-from-competitor check:** swap "environment … five levers" for "video call and profile" and the scene stops being true; the levers are named enums a reader can check in the running product. PASS. Structural elements: one hairline rule. No accent. Images: 0. Focusables: 0.

## 4. Scene 6 — one session's arc (full string list, in DOM order)

eyebrow `The practice` · h2 `One session, start to finish.` · lead `Everything below happens inside an environment you have already seen.`

| # | label (h3) | shipped phrasing (A, more specific) | alternate (B) | words / sentences |
|---|---|---|---|---|
| 1 LIVE | You attend | The class happens live, in the same room you entered from this page, with the tutor and whoever else is in it. | Classes happen live, in a shared room inside the environment. | 22 / 1 |
| 2 RECORDED | You revisit | Afterwards the class is still there, as a recording, with the notes beside it. Miss one and it waits for you. | Every session is recorded and kept, so you can go back to it. | 21 / 2 |
| 3 ASSISTED | You work | You do the work in the same place: the assignments, the notes from class, and help when you are stuck — from the tutor, or from the assistant. | Assignments, notes and an assistant, all in one place. | 28 / 1 |
| 4 PROGRESS | You see yourself move | Your work leaves a record. You and your tutor read the same one, so you can both see where you have moved. | Your progress is kept over time, visible to you and your tutor. | 22 / 2 |

Each beat carries its status label (all four currently `Next · not built yet`, derived) and a mono counter `n of 4` (outside the heading, so SR reads "You attend", not "1 of 4You attend" — fixed after the first sweep).

**Consolidated statement (one, at the end):**
- **A (shipped; the list is derived):** `Live today: six environments and the switch between them.` `Next, in this order: live classes, recordings and notes, assignments, tests and the assistant, your record of progress.` — 2 sentences, 28 words.
- B: *"What exists is the ground: six environments, built, open one at a time. What comes next is built on it, in order — the live class first, then its recording, then the work and the help, then the record."*
- A chosen: it names things a reader can find; B is prose about the same facts. Every "next" item drops out of the sentence automatically when its module flips to `live`; if everything is live the second sentence disappears (verified in the forced-`live` matrix).

Outro (narrative, not a CTA, not a link): `What we will hold ourselves to comes next.`

**Lead candidates:** A shipped. B: *"A session here is not a video call with homework attached. It is one thread: you attend, you revisit, you work, you see yourself move."*

**Budget:** 4 beats ✓, each ≤2 sentences ✓, 1 consolidated statement ✓; **166 words** for the whole scene (incl. eyebrow, counters, labels, statuses, outro). Reading time ≈ 43 s at 230 wpm (<1 min ✓). No cards, no grid: one `<ol>` on a single hairline thread, odd beats flush, even beats offset (offset collapses at ≤30rem).

## 5. Honesty treatment — vocabulary, rules, derivation

Three states, extending 3.6 (mono label, hairline underline, never red, never an icon):

| state | label | source (derived) | already used by |
|---|---|---|---|
| live | `Live today` | module `live` | 4.1 skeleton |
| foundation | `In foundation` | module `in-progress`; subject `draft` | 3.6 nav " · in foundation", 4.4 Scene 3, 4.5 Scene 4 |
| next | `Next · not built yet` | module `planned` | 4.1 skeleton; 3.6 shell "System state · not built" |

Rules (`STATUS_RULES`): text, adjacent to what it describes, in DOM order, server-rendered; state is in the words (underline weight is decoration only); sequencing never scheduling; a beat spanning modules takes the least advanced. **Derived, not authored:** Scene 5 ← `tutor-portal`; beats ← `live-classroom` / `recorded-classes` / `assignments`+`ai-assistant` / `student-portal`. Nothing hand-set. Forced matrix (dev route `?state=`) renders all three labels correctly in both themes.

Treatment is not an error state (no signal colour), **not smaller in effect** — after the first sweep it measured 12px vs 18px body; raised to `--ta-text-sm` (14px mono caps, x-height ≈ body). Recorded as a judgement: it is still numerically smaller than the 18px copy. One convention, no second one.

## 6. Boundary checklist (measured on server HTML, no JS)

- People imagery / names / avatars / bios / credentials / subject lists / availability: **none** (0 `img/svg/canvas/video`, 0 lists, 0 cards in Scene 5).
- Roster / grid: none. Scene 6 is one `<ol>`, alternating offsets.
- Simulated interface: none (no player, list-of-recordings, chat, browser, chart, ring, streak, calendar, tutor card, meeting/notification UI, toolbar, panel).
- CTA / button / button-styled link / capture: **0 focusables in Scenes 5–6** (keyboard sweep §8).
- Dates / quarters / "coming soon" / countdown / waitlist / notify / urgency sweep: **0 hits.** Banned-phrase sweep against `BANNED_PHRASES`: **0 hits.** "Phase 7" wording from the 4.1 roadmap beat: gone.
- 4 beats present with JS disabled: **4**, all opacity 1; `.ta-reveal` count in server HTML: **0**.
- Motifs: 0 in both scenes (allowed "or none"); page motif totals unchanged (≤786 cmd / ≤89 DOM).

## 7. Sequence behaviour — state justification and safety

Beats are ordered in time, so revealing them in order as they enter the viewport is the content's own structure — the one legitimate `sequence` on the page. Implemented with the existing one-shot `Reveal` only (no new preset, no `.ta-stagger`, no sticky). Measured progression while scrolling at 160px steps: `0000 → 1000 → 1100 → 1110 → 1111` in both themes; scroll back up: all still revealed (one-shot ✓); nothing traps, no scroll required for completeness; **0 live regions** added (page total still 1, the switch engine); RM: `.ta-reveal` never applied, all visible; no-JS: complete story.

## 8. The 29 tests

1. Guard `check-subject-imports` ✓ · 2. `tsc --noEmit` ✓ · 3. eslint on new files ✓ · 4. `next build` ✓ (route `/dev/scenes-practice` static) · 5. prod `/dev/scenes-practice` → **404** · 6. prod `/` renders Scene 5 + 4 beats ✓ · 7. `git status --porcelain` → `fatal: not a git repository (or any of the parent directories): .git` exit 128 (verbatim; not initialised) · 8. spine validator ✓ · 9. ONE h1 on `/` ✓ · 10. scene order 0–8 intact ✓ · 11. heading nesting: h2 per scene, h3 per beat only ✓ · 12. SR reading order: `section[aria-labelledby=scene-people] → h2 → lead → lines → status`; `section[scene-practice] → h2 → lead → ol[aria-label="One session, in order"] → (counter, h3, text, status)×4 → consolidated → outro` ✓ · 13. keyboard 0–6: stops = chrome(8) → arrival(3) → choice(1) → enter(3) → return; **0 in Scenes 5–6** as expected ✓ · 14. no-JS full render ✓ · 15. RM static complete ✓ · 16. sequence progression + one-shot ✓ · 17. CLS during stepping: 0.0001 both themes ✓ · 18. long tasks: **none** · 19. frames while stepping: n≈107, avg 16.7ms, worst 18–20ms, over-50ms 0 ✓ · 20. widths 320/390/768/1280 × dark/light × 2 scenes: **0 overflow** (16 frames) ✓ · 21. zoom 200%: no overflow ✓ · 22. WCAG 1.4.12 text-spacing: no overflow, no clipping ✓ · 23. contrast on `--ta-surface-base`: dark primary 17.75 / secondary 16.27 / muted 7.65; light 18.36 / 15.71 / 8.93 — all AAA (labels use secondary/primary) ✓ · 24. axe on Scenes 5–6 (prod): **0 violations** ✓ · 25. Lighthouse desktop prod `/`: **100/100/100/100**, LCP 0.6s (`h1#scene-arrival`), CLS 0, TBT 0, 356 KiB total, JS 188.8 KB (4.5: 353 KiB / 188.7 KB — delta ≈ +3 KiB) · 26. Lighthouse mobile: perf 96, LCP 2.6s, TBT 40ms, a11y 100 (4.5: 98 / 2.2s / 70ms — within run noise; no new JS on the path) · 27. payload on `/`: 21 requests, 0 canvas/WebGL, 1 live region (unchanged) ✓ · 28. hydration warnings: none ✓ · 29. scroll budget vs declared: people 1.20 ✓; practice 1.60 @≥390, **1.80 @320 defect** (§2).

## 9. Page-length readout — `/` Scenes 0–6 (server HTML words)

arrival 21 · premise 106 · difference 74 · choice 72 · enter 71 · **people 68 · practice 166** → **578 words ≈ 2.5 min at 230 wpm.** Scene 6 is the longest scene on the page by 60 words.

## 10. Real vs deferred

REAL: six environments + five levers in config and rendering; the switch; status derivation from the registry. DEFERRED (registry `planned`): tutor portal, live classroom, recorded classes, assignments, tests, AI assistant, student portal. Every beat says so in its own words, without a date.

## 11. Defects (unsoftened)

1. Scene 6 scroll overrun at 320px (1.80 vs 1.6).
2. Status label numerically smaller than body copy (14 vs 18px) — convention inherited from 3.6 mono labels; a strict reading of "not smaller" fails.
3. Contract discrepancies frozen, not fixed: `people.accentUse: subtle` (rendered none); `practice.authoredIn: "Step 4.7"`; `practice.status` was already `authored` before this step.
4. Pre-existing, unchanged: primary-button dark contrast 2.62:1; label-in-name on Scenes 0/3; nav-shell 479px.
5. Two fixes made mid-audit and recorded: undefined tokens (`--ta-space-5/10`, `--ta-display-xs`) had silently fallen back → replaced with real tokens; counter moved out of the h3.

## 12. Honest verdict — does Scene 6 earn its place?

**Partly.** The arc is the first place the page says what a *session* is, and the derived consolidated statement is the single most honest sentence on the site: it will rewrite itself as modules ship. Those two things earn a scene. What does not earn its length: four beats that all end in the same `Next · not built yet` label read, by the fourth, as a list of things that do not exist — which is exactly the roster-of-promises the brief warned about, only in prose. With every beat `planned`, the scene is 166 words asking for 1.6 viewports to say "nothing here yet, in this order".

**Recommendation (for a later step, not this one):** compress to **two beats until any module is live** — *You attend / You revisit* merged into one ("the class happens live and stays as a recording"), *You work / You see yourself move* merged into one — and let the consolidated statement carry the full four-item order. That halves the scroll (fixes the 320px overrun by construction), keeps the arc readable in <30 s, and lets the scene *grow back* to four beats as modules flip to `live`, which is the honest shape for a product at this stage. Do not cut Scene 6; do not reorder it before Scene 5 — the relationship (who) before the practice (what happens) is the right order.

## 13–20. Compact closers

13. Copy voice: second person, no exclamation, no outcome claims (no marks/ranks/admissions), no invented numbers/testimonials ✓. 14. One structural element in Scene 5 (hairline); one in Scene 6 (thread line + dots, one element) ✓. 15. No new deps; `lucide` untouched ✓. 16. Ambient stage not imported by `/` ✓. 17. Existing routes/copy untouched; `/dev/scene-choice`, `/dev/scene-enter` untouched ✓. 18. Grayscale: state is in words; both scenes are monochrome by construction ✓. 19. Determinism: no randomness, no time; status is a pure function of registry ✓. 20. **STOP.** Next step (4.7, Scenes 7–8) not started.
