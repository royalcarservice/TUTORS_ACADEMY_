# Phase 4 · Step 3 — Scenes 1–2: The Premise + The Difference

Two scenes authored. A breath, not a blow. Screenshots in `/home/user/shots17/`.
Dev specimen: `/dev/scenes` (404 in production — verified).

## 0. Inspection findings (reported before building; all carried into the work)

1. **No Step 3.7 harness or committed baseline exists in the workspace** (no `PHASE3_STEP7*`
   report, no audit script, no baseline file — Phase 3 closed at 3.6). "Extend the harness to
   `/`" therefore could not be an extension. What was done instead: (a) `/dev/scenes` carries a
   persistent, code-level readout for `/` — six-scope contrast table, motif budgets vs ceilings,
   scroll actual-vs-declared, boundary checklist; (b) a puppeteer battery ran the six scopes ×
   two themes on `/` (§10, §17). A real 3.7 remains owed.
2. **`arrival` is still `status: "skeleton"`** in the scene contract although 4.2 authored it.
   Not edited (other scene's config). Flagged for 4.2's owner.
3. **The premise skeleton's quietLine says "One tutor, one plan…"** — not demonstrable (People is
   `liveCapability:false`). The authored scene does not use it; the string remains in config as
   inert skeleton text. Flagged.
4. `authoredIn` for premise/difference read "Step 4.2"/"Step 4.4"; corrected to "Step 4.3" for
   these two scenes only (dev metadata). `choice` still says "Step 4.3" — not touched, flagged.
5. `.ta-stagger > *` is `opacity:0` unconditionally in CSS — the class must be applied only after
   hydration or no-JS visitors get six invisible specimens. Handled (`difference-stagger.tsx`).
6. The slot mechanism passed no props. Scene 2 needs subject id/name/motif/density, so the typed
   `SpineSubjectEntry` gained two optional fields and `SceneSlot` passes `entries` to the slotted
   component. Two-line, typed, generic; no scene config imported by any component (guard green).
7. Demonstrability cross-check for Scene 1's claims (§2): `/subjects/{all six}` → 200 with Stage +
   subject motif/accent; Room refuses substrate in code (`ROLE_RULES.substrate.roomAllowed:false`,
   `isRoleAllowed`); the 3.4 switch is ≤700ms trigger→settle (PHASE3_STEP4 report, table row).

## 1. Files created / modified — ONLY Scenes 1 and 2 authored

Created: `src/components/spine/scenes/premise.tsx`, `scenes/difference.tsx`,
`scenes/difference-stagger.tsx` (client, entrance only), `src/app/dev/scenes/page.tsx` +
`preview.tsx`.
Modified: `spine/slots.tsx` (register two scenes; typed slot props), `spine/scene-slot.tsx`
(two optional entry fields; `<Slot entries>`), `app/(public)/page.tsx` (entry mapping adds
`motif`, `density`), `lib/spine/scenes.ts` (premise + difference `status: "authored"`,
`authoredIn: "Step 4.3"` — no other field, no other scene).
Untouched: Scene 0, Scenes 3–8, spine order/grammar/budget, voice, subject system, motif
grammar, primitives, tokens, brand, nav, switch, ambient, shell, existing /dev/* routes.

## 2. Scene 1's two lead candidates (verbatim)

**A — SHIPPED (recommended):**
"Tutors Academy is a set of subject environments. Each subject has its own structure, colour
and calm, and you work inside it rather than scrolling past it."
Emphasises: what the thing IS, positively, and the reader's relationship to it (inside, not
past). Risk: "structure, colour and calm" is a triad — kept because each word is a real
property of the config (motif, accent, roomMood), not stacked adjectives.

**B — second choice:**
"A subject here is not a list of videos. It is an environment you work inside, built around
the way that subject is learned."
Emphasises: difference by contrast; very concrete. Risk: defines by negation and invites
"where are the videos?"; "built around the way it is learned" is a claim about pedagogy the
product does not yet demonstrate.

Recommendation A. Swap is one string in `PREMISE_COPY.lead`.

## 3. All authored copy (verbatim)

**Scene 1** — eyebrow "The premise" · h2 "Built as places, not pages." · lead = A above ·
beats: (1) **Six subjects, six environments.** Mathematics is a lattice on graphite. English
is a page. The structure changes with the subject; the way you read does not. (2) **The
environment steps back when you work.** Inside a room the atmosphere quiets and the reading
measure holds. The subject's accent stays; nothing else competes with the text. (3) **Moving
between subjects is one motion.** Switch from one subject to another and the environment
changes in place, in under a second, without the text moving.
**Scene 2** — eyebrow "The difference" · h2 "One brand. Six environments." · lead "From one
subject to the next, two things change: the accent and the motif. Everything else holds. The
mark, the type and its scale, the spacing, the shape of each component, the way things move."
· h3 "Six environments, side by side" · captions "Mathematics / lattice motif · Physics /
field motif · Chemistry / bonds motif · Biology / living motif · English / typographic motif ·
History / strata motif" · constancy "The same components, the same type, the same rhythm.
Only the environment changes." · narrative line "One of these six is the subject you are here
for. It is next."

## 4. Scene 1 composition

A contained Room on the Stage: `data-spatial="room"`, reading column capped at
`--ta-container-prose` (= `--ta-measure`, 68ch) inside the spine's content container; lead at
`--ta-text-xl`, beats at `--ta-text-lg`/`--ta-text-md`; heading at `--ta-display-sm` — three
steps below the hero's xl, so it does not compete. One structural element only: a hairline in
`--ta-brand-quiet` separating lead from beats. No subject accent anywhere (`[data-subject]`
count in scene: 0). No image, no motif, no spectacle.

## 5. Scene 2 composition

Central idea: **what stays is drawn first.** Six identical plates (`.ta-card` flat, same
radius/border/padding/aspect), each with the brass BrandMark at the same offset (56,56px at
1280), the subject name in the same display type at the same size and baseline, the same
2px rule and mono caption. The eye is handed six identical frames and reads the only things that
differ inside them: the accent (rule + subject mark via `--ta-accent-1`) and the motif fragment
(edge role, bleeding from the right, masked out of the caption region). It reads as an exhibit,
not a grid, because nothing is clickable, nothing has content, and the plate is a frame around
materials — like a type specimen, not a product card. Brass is never scoped: the constant is
visible in every plate.

## 6. Boundary confirmation

Sweep on rendered text of `[data-scene="difference"]` (whole word / substring):
choose 0/0 · start 0/0 · enter 0/0 · begin 0/0 · select 0/0. Interactive elements
(`a,button,input,select,textarea,[role=button],[tabindex]`): **0**. Focusable inside specimens:
**0**. img/video/iframe/canvas: 0. Digits in rendered text: **none**. All motif fragments
`aria-hidden="true"`, role `edge` ×6 (no substrate).
Full list of rendered strings (text nodes, excluding the component `<style>`): "The difference" ·
"One brand. Six environments." · the lead (§3) · "Six environments, side by side" ·
"Mathematics" "lattice" "motif" · "Physics" "field" "motif" · "Chemistry" "bonds" "motif" ·
"Biology" "living" "motif" · "English" "typographic" "motif" · "History" "strata" "motif" ·
the constancy line · the narrative line. No name, course, progress, statistic, date or schedule.
Boundary not breached anywhere, including copy.

## 7. The constancy copy (non-visual claim)

Before the exhibit: "From one subject to the next, two things change: the accent and the motif.
Everything else holds. The mark, the type and its scale, the spacing, the shape of each
component, the way things move." After it: "The same components, the same type, the same
rhythm. Only the environment changes."

## 8. Brand-frame invariance evidence

Computed-style signature per plate (both themes): width/height, border-radius (16px), border
(1px, same colour), background, padding (27.36px), name font (Fraunces 20px 500, same colour),
caption font (JetBrains Mono 11px, same colour), BrandMark colour (brass: rgb(194,154,69) dark /
rgb(122,90,31) light) and size (16), BrandMark offset, name offset, motif role. **Leaks across the
six: none** (every constant key has exactly one distinct value). Varying keys: accent colour 6
distinct, subject-mark colour 6 distinct, motif kind 6 distinct.

## 9. Grayscale results (honest)

`s2-grayscale.png`. **The accent rules collapse**: mathematics/physics/chemistry/english land at
luminance 163–168 of 255 (indistinguishable); biology 203 and history 197 separate. The
environments remain distinguishable without hue through the motif geometry (lattice / curves /
bonds / branching / rules / strata), the subject marks and the name text — which is why the
name and motif word are real text on every plate. Verdict: passes the "nothing by colour alone"
rule; fails if the rule alone were the signal (it is not).

## 10. Contrast on `/` (measured computed styles, surface = flat card)

Dark: name 17.75 · caption 7.65 · brand mark 7.37 — all six; accent graphic: math 7.96 ·
physics 8.70 · chemistry 8.45 · biology 12.74 · english 8.94 · history 11.68.
Light: name 18.36 · caption 8.93 · brand mark 6.02 — all six; accent graphic: math 6.01 ·
physics 4.92 · chemistry 4.75 · biology 4.76 · english 5.97 · history 5.09.
Text ≥ 4.5 and graphics ≥ 3 everywhere; no lightness fixes needed.

## 11. Motif budget totals for `/` vs 3.3 ceilings (400 cmd · 12 DOM · 8ms per surface)

math 36/7/0.14 · physics 24/7/0.12 · chemistry 34/7/0.13 · biology 36/7/0.28 · english 16/6/0.10
· history 109/8/0.19 (commands / DOM / ms). **Combined 255 commands, 42 DOM nodes, 0.96ms** —
every fragment far inside its per-surface ceiling; the page total is ~11% of six ceilings.
Coverage chosen: edge role in room scope (coverage cap 0.22, opacity 0.2) — the lowest-cost role
with a legible silhouette. Nothing had to be reduced; substrate was never considered.

## 12. Payload, WebGL absence, LCP, CLS

Prod `/`: 10 JS files, 605 KiB raw / **177 KiB transferred**; CSS 58 KiB raw. The WebGL/ambient
chunk (`0mf4owqbmymf2.js`, the only chunk containing `webglcontextlost`) is referenced 0 times
by `/`'s HTML and never requested (`webglRequested:false`, ambient chunk fetched: false).
LCP element remains the Scene 0 H1: 547ms (Lighthouse prod desktop), 388ms in the dev run.
CLS **0** through a full scroll including Scene 2's reveal (fragments are absolutely positioned;
plates have fixed aspect). Lighthouse prod `/`: **100 / 100 / 100 / 100**.

## 13. Scroll budget — actual vs declared (DEFECTS, declaration untouched)

Declared premise 1.0 · difference 1.2. Actual (section height ÷ viewport): 1280×800 →
1.00 / 1.21; 390×844 → 1.00 / 1.20; 360×640 → 1.20 / 1.54; **320×568 → 1.48 / 1.77**;
**667×375 → 1.76 / 3.08**. Overruns at 320 and in landscape are content-height overruns of
fixed-height declarations (vh shrinks, text does not) — reported as defects against the
declaration model, not edited. Recommendation: 4.1's owner should declare mobile budgets or
define the budget at a reference viewport; the alternative (hiding specimens at 320) violates
Test 14.

## 14. Mobile resolution of the six

≥48rem: 3×2. 30–48rem: 2×3. ≤30rem: 2×3 with square plates. 320: two columns of 132px plates,
name at 13px with 8px padding (after a fix — "Mathematics" broke mid-word at 14px), scrollWidth
320, 0 clipped, 0 overflow. 390: two columns of 167px, scrollWidth 390, no overflow. All six are
always in normal flow — no horizontal scroll container.

## 15. Keyboard and screen reader

Tab order: Skip → lockup → How it works → For students → For tutors → Platform → Sign in →
Create account → Enter a world → Understand it → Continue to the premise → **Mathematics (Scene
3)**. Nothing in Scenes 1–2 receives focus; no specimen is focusable.
Reading order (DOM/AT order, `aria-hidden` excluded): p The premise → h2 Built as places → lead →
h3/p ×3 beats → p The difference → h2 One brand → lead (what changes / what holds) → h3 Six
environments, side by side → list of six figures, each "Name" + "x motif" → constancy line →
narrative line. A listener learns six environments are compared, what distinguishes each (its
motif, its name) and what stays the same (stated twice). Headings: h2 → h3, no skip. Tool:
puppeteer DOM walk + accessibility snapshot.

## 16. Narrative redundancy check

Scene 1 says what the place is; Scene 2 shows the system holds six environments and names
nothing as a destination; Scene 3's intent is the visitor's decision. The sequence holds: Scene 2
ends with the decision pending ("It is next"), gives no links, no hover, no verbs of action. One
watch-point: Scene 3 will show the same six names — it must show them as doors (links, accent
forward), not as a second specimen row, or the page repeats itself. Recommendation for 4.4: do not
reuse the plate geometry in the chooser.

## 17. Did the audit on `/` surface anything previously unknown?

**Yes.** axe on `/` in the **dark** theme reports `color-contrast` ×3: `buttonClass("primary")`
emits Tailwind `bg-brand-600 text-white`, giving white on brass #c29a45 = **2.62:1** — the header
"Create account", Scene 0's "Enter a world" and Scene 8's CTA. Light theme passes (axe []).
Earlier audits (4.1/4.2) ran headless in the default light scheme, so this was missed. It is a
2.5 primitive defect, outside this step; fix is lightness-only via the existing `--ta-text-on-brand`
(ink) as the `.ta-btn` token path already does. Not touched here.
Also new: the scroll-budget model has no mobile definition (§13).

## 18. Deferred / nothing half-built

Both scenes are complete in every state (no-JS, RM, both themes, 320→1280, landscape). Owed
elsewhere: 3.7 harness proper; arrival status flip; premise quietLine wording; primary button
dark-theme contrast. Nothing in this step was left partially built.

## 19. Nothing outside Scenes 1–2 was changed

Tokens/type/motion/spatial, primitives, brand/nav, subject system/marks/grammar/switch/ambient/
shell, scene order/grammar/ceiling/voice, Scene 0, Scenes 3–8 content, existing routes/dev pages —
untouched (edits limited to the fill-point wiring and these two scenes' `status`/`authoredIn`).
tsc/lint/validators/guard clean; production build succeeds; `/dev/scenes` → 404 in prod.
`git status --porcelain` → `fatal: not a git repository (or any of the parent directories): .git`
(exit 128).

## Tests 1–27 summary
1 no-JS: 1 h1, both scene h2s, 6 specimens at opacity 1, 6 motifs, CTAs intact, no motion classes
(`s1-nojs.png`, `s2-nojs.png`) · 2 RM: 6 specimens, no stagger/reveal applied (`s1/s2-reduced.png`)
· 3 boundary §6 · 4 fabrication §6 · 5 fake-interface: plates carry only mark, name, motif word;
no fields, rows, states, numbers (`s2-dark-1280.png`, `s2-390.png`) · 6 §8 · 7 §7 · 8 §9 · 9 §10 ·
10 §11 · 11–12 §12 · 13 §13 · 14 §14 · 15 667×375 usable, 2 columns, no overflow (`s2-667x375.png`)
· 16 zoom proxies 360/720: scrollWidth = viewport, no clip · 17 text-spacing at 360: no name or
plate overflow, premise no clip · 18–19 §15 · 20 both themes (`s1/s2-dark/light-1280.png`) ·
21 hydration console [] on `/` and `/dev/scenes` · 22 §10/§17 · 23 axe `/` light [], dark
color-contrast×3 (pre-existing primitive, §17); `/dev/scenes` []; Lighthouse 100×4 · 24 guard ✓ ·
25 §16 · 26 build ✓, `/dev/scenes` 404 · 27 fatal 128.
Motion: max concurrent = 1 reveal + 6 staggered = 7 ≤ 8; stagger cap 300ms; one-shot; no loop.

Stopped after the report. Step 4.4 not begun.
