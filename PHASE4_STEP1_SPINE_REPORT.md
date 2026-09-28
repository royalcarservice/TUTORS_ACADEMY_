# Phase 4 · Step 1 — The Narrative Spine + Scene Contract

The story's architecture exists before its art: contract, spine, scroll grammar, copy voice,
honesty treatment, and a live skeleton at `/`. Screenshots in `/home/user/shots15/`.

---

## 1. Files created / modified

Created:
- `src/lib/spine/types.ts` — the scene contract (bounded enums, budgets, validator constants).
- `src/lib/spine/scenes.ts` — THE SPINE (nine scenes) + loud `validateSpine`.
- `src/lib/spine/voice.ts` — committed copy-voice reference (twin of COPY_VOICE.md).
- `COPY_VOICE.md` — the voice document.
- `src/components/spine/reveal.tsx` — one-shot reveal, progressive-enhancement only.
- `src/components/spine/scene-slot.tsx` — generic scene renderer (skeleton quiet states,
  3.6 honesty treatment, authored Practice beat, dev metadata).
- `src/components/spine/home-spine.tsx` — renders the page from the sequence.
- `src/app/dev/spine/page.tsx` + `preview.tsx` — dev-only specimen.

Modified:
- `src/app/(public)/page.tsx` — the existing `/` route, EXTENDED: same file, same (public) group,
  same unchanged SiteHeader/SiteFooter chrome; the foundation marketing body (hero, module grid,
  portal sections, that copy) is RETIRED by this step's mandate and replaced by the spine render.
  The retired page's anchor ids are preserved as scene ids so existing public nav resolves.
- `scripts/check-subject-imports.mjs` — guard extended to scene configs.

Nothing else touched.

## 2. The scene contract (pinned)

Identity: `id` (stable slug) · `order` (sequence) · `name` · `narrativeFn` ∈ {arrive, premise,
differentiate, choose, enter, people, practice, promise, return} · `status` ∈ {skeleton, authored,
locked}. Scroll: `scrollBehaviour` ∈ {static, reveal-once, sticky-stage, sequence} (FOUR, no fifth)
· `scrollBudget` (viewport-heights, bounded) · `pins`. Subject: `subjectMode` ∈ {neutral, preview,
responsive, active} · `accentUse` ∈ {none, subtle, forward} · `ambient` ∈ {off, permitted}.
Degradation (MAY NOT BE BLANK): `reducedMotion`, `mobileBehaviour`, `noJsBehaviour` (never
"nothing"). Honesty: `liveCapability` boolean. Plus `anchorId`, `quietLine` (prod-safe skeleton
line), `authoredIn` (dev-only metadata).
Page-wide: `PAGE_SCROLL_CEILING = 12` viewport-heights; `MAX_CONCURRENT_ANIM = 8` per scene;
`MAX_STICKY_SCENES = 1`. Components consume slices via props; the guard forbids direct config
imports (extended, proven below).

## 3. The nine scenes

| # | id | fn | status | scroll | budget | pins | subject | accent | ambient | live |
|---|----|----|--------|--------|--------|------|---------|--------|---------|------|
| 0 | arrival | arrive | skeleton | reveal-once | 1.2 | f | neutral | none | off | true |
| 1 | premise | premise | skeleton | reveal-once | 1.0 | f | neutral | none | off | true |
| 2 | difference | differentiate | skeleton | reveal-once | 1.2 | f | preview | subtle | off | true |
| 3 | choice | choose | skeleton | static | 1.2 | f | preview | forward | off | true |
| 4 | enter | enter | skeleton | sticky-stage | 1.6 | t | active | forward | permitted | true |
| 5 | people | people | skeleton | reveal-once | 1.2 | f | neutral | subtle | off | false |
| 6 | practice | practice | authored | sequence | 1.6 | f | neutral | subtle | off | false |
| 7 | promise | promise | skeleton | reveal-once | 1.0 | f | neutral | subtle | off | false |
| 8 | return | return | skeleton | static | 0.8 | f | neutral | forward | off | true |

## 4. Scroll grammar as implemented

Four behaviours only. reveal-once: arrival, premise, difference, people, promise (one-shot
`.ta-reveal/.is-in`, unobserve after reveal — never re-animates; classes applied ONLY post-
hydration and never under reduced motion). static: choice, return. sticky-stage: **enter** — the
claimant, because it hosts the 3.4 transformation and a held viewport is what makes that legible;
`validateSpine` fails a second claimant. sequence: **practice** only (four beats inside one scene).
Total declared budget **10.8 / 12** viewport-heights. No scroll-jacking: the spine adds no wheel/
scroll/touch listeners and no `preventDefault` anywhere (grep-verified); native behaviour proven by
input: PageDown→875px, Space→1750, ArrowDown→1790, wheel→2090 (all move natively). Reduced motion:
every behaviour collapses to static and the full story renders in order (screenshot;
`revealApplied: 0`, opacity 1).

## 5. Degradation table

All nine scenes × three fields non-blank — full text in `scenes.ts` and rendered on `/dev/spine`
coverage table. Examples: arrival noJs "Server-rendered statement with the h1; motion classes are
never applied without JS."; enter reducedMotion "The 3.4 switch runs at its instant tier: state
swap plus announcement; the scene is static."; practice mobileBehaviour "Beats stack vertically
with the same order and labels." Validator enforces non-blank and rejects "nothing".

## 6. The copy voice

Committed in `COPY_VOICE.md` + `voice.ts`: confident/plainspoken; concrete; adult (no exclamation
marks, urgency, hype); short sentences; second person addressed to the student; every claim
demonstrable or labelled; no outcome claims (marks/ranks/admissions); no invented testimonial,
statistic or credential. Banned list included (see doc).

## 7. liveCapability map (cross-checked against the codebase)

TRUE: arrival/premise/difference (six environments exist at /subjects/*, certified 3.6) · choice
(six real server-rendered links to /subjects/*) · enter (3.4 switch + environments exist) · return
(real links). FALSE: people (no tutors exist; honest quiet state) · practice (the authored roadmap
beat) · promise (progress record unbuilt; described in words only). No scene with liveCapability
true describes anything unbuilt — each claim maps to shipped code.

## 8. The Practice scene (authored roadmap beat)

Live today — "Six subject environments, each with its own structure, and the switch that turns
one into another. That is the product today, and it is real."
Beats: "Live classes — A shared room with a whiteboard and a tutor in it. Phase 7." · "Recorded
classes & notes — Every session leaves a record you can return to. After Phase 7." · "Assignments,
tests & progress — One record of your work, seen the same way by you and your tutor. Student
portal." · "AI learning assistant — Described when it is built, not before. Phase 9."
Confident, specific, no apology; styled with the 3.6 treatment, not as a disclaimer.

## 9. Audience & voice recommendation

Student-first voice retained. Parent-credible signals are present as structure: tutor standards
(people), rigour/structure (premise), visible progress (promise) — described, never hyped.
Recommendation: keep the student voice through 4.8; if research later shows parents decide, add a
parent-addressed beat inside premise rather than shifting the page voice.

## 10. DECISION 1 — FLAG FOR VETO

The homepage ends at ENTER. Primary CTA "Enter a world" → /subjects; secondary "Understand it" →
#premise. Account creation stays at the point of actual use (the existing honest "Sign in / Create
account" entries in the nav), never a toll gate. This inverts conventional education-site
conversion; it is a business decision as much as a design one — veto here if the business
disagrees.

## 11. No-JS + reduced-motion evidence

`home-nojs.png` (JS disabled): all nine `data-scene` sections in order, h1, headings, quiet lines,
choice links, four practice beats, two honest states, CTA pair, nav links resolve, existing footer.
`home-reduced.png`: identical order, zero reveal classes applied, everything visible.

## 12. Reorder + guard proofs

`spine-before.png` / `spine-after.png`: moving Arrival down reorders the rendered sequence
(first rows: The Premise, Arrival) — state-only; NO component edited. Guard: temporary
`src/components/spine/__guard_proof.tsx` importing SPINE → `✗ GUARD …: direct subject/scene-config
import` exit 1; file removed → guard green again.

## 13. Sweeps

Fake-UI sweep over spine files: zero simulated interfaces (only hit: the word "testimonial" inside
the voice rule banning them). Copy sweep: zero banned phrases in page copy (hits only in the
banned-list definitions); zero exclamation marks.

## 14. Performance / hydration / a11y

`/` dev: FCP 228ms, CLS 0; hydration console `[]` on `/` and `/dev/spine`. axe: `/` `[]`;
`/dev/spine` initially `link-in-text-block` (inline links colour-only) → fixed with underlines →
`[]`. Lighthouse desktop: prod `/` **100/100/100/100**; dev `/dev/spine` **99/100/100/100**.
Keyboard: skip link → brand → nav anchors → auth → chooser links. Landmarks: one `main`; headings
H1 (arrival) + eight H2; nine labelled sections. 320px + text-spacing: scrollWidth 320.

## 15. Deferred (nothing half-built)

Scene art/copy (4.2, 4.4, 4.6–4.8), chooser design (4.3), enter staging (4.5), footer (4.8),
sequence-step animation for practice (declared now, animated when authored). Skeleton scenes are
deliberate quiet states, prod shows no build metadata (verified: 0 occurrences), dev shows it.

## 16. Nothing protected changed

Tokens/type/motion/spatial/density, primitives, brand frame + nav shell, subject system, marks,
grammar, switch, ambient, shell, audit baseline, existing /dev/* routes — untouched. `PUBLIC_NAV`
anchors still resolve via preserved ids (how-it-works→premise, for-students→choice,
for-tutors→people, platform→practice).

`git status --porcelain` (raw):

```
fatal: not a git repository (or any of the parent directories): .git
```
(exit 128)

Stopped after the report. Step 4.2 not begun.
