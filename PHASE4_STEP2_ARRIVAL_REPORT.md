# Phase 4 · Step 2 — Scene 0: Arrival

One scene authored. The only place in the product where `--ta-display-xl` and
`--ta-dur-cinematic` are permitted. Screenshots in `/home/user/shots16/`.

---

## 1. Files created / modified — ONLY Scene 0 authored

Created:
- `src/components/spine/scenes/arrival.tsx` — the authored hero (statement, support, CTAs, cue).
- `src/components/spine/scenes/arrival-ambience.tsx` — environmental layer + the one
  cinematic settle (client, JS-only, RM-aware).
- `src/components/spine/slots.tsx` — scene slot registry (the documented fill point, mirroring 3.6).

Modified:
- `src/components/spine/scene-slot.tsx` — generic wiring only: a registered scene renders its
  authored component (own heading, no skeleton reveal wrap). No other scene's content touched.

Not touched: spine contract/sequence/grammar/voice, scenes 1–8, subject system, primitives,
brand frame, nav shell, existing routes, /dev/*.

## 2. THE THREE CANDIDATE STATEMENTS (verbatim)

**A — RECOMMENDED (shipped):**
Statement: "Every subject is a place you can enter."
Supporting: "Each subject is its own environment. Choose one and step inside."
Emphasises: place-ness and the act of entering — the product's actual mechanic.
Risks: quiet pull rather than excitement; understated by design.
Demonstrable: yes — six environments exist and are enterable at /subjects/*.

**B — SECOND CHOICE:**
Statement: "Your subject, built as a world around you."
Supporting: "Structure, colour and calm, shaped around the way it is learned. Choose one and
step inside."
Emphasises: the environment built around the learner.
Risks: "world" can read as hype; second person presumes ownership before a choice is made.

**C:**
Statement: "Not a website. A place to learn."
Supporting: "Six environments, one for each subject — each built around the way it is learned."
Emphasises: differentiation by negation.
Risks: negative framing is a cliché; the supporting line spends Scene 3's reveal (the six).

Recommendation A, second choice B. Swapping is a one-string edit in `arrival.tsx` — no rebuild
of structure needed.

## 3. The composition

The Stage is the brand environment, not a picture of one: ink surface (theme-aware token),
typography doing the heavy lifting at `--ta-display-xl` (leading 0.98, tracking −0.03em from the
2.2 rhythm table), the brand lockup unchanged in the nav overlay, and ONE structural element from
the brand's stroke language (3.3 vocabulary, brand-neutral): a single brass horizon — one hairline,
two quiet nodes, one brass seal-node, one tick. Restrained: one idea, not a scene. Brass is a seal,
not a paint; no subject accent appears anywhere in the hero. No image, no gradient blob, no
illustration, no fake screenshot.

## 4. The --ta-dur-cinematic decision — USED, once, on the environment only

The environmental layer settles once (opacity + 8px translate over `--ta-dur-cinematic`,
`--ta-ease-enter`), applied pre-paint via a layout effect so first paint shows either the settled
or settling layer while the statement is always at full opacity. Reduced motion: the layer is
never touched (transition 1e-05s contract value, screenshot verified). No other use of the token
exists; no scroll-triggered entrance; no loader/splash.

## 5. Pointer response — DECLINED

Not included. It would cost a frame per pointermove for an effect the statement does not need.
Reported as declined, per the brief's instruction.

## 6. Scroll cue — INCLUDED, truthful

A real anchor link to Scene 1 (`#how-it-works`), keyboard focusable, `aria-label="Continue to the
premise"`, `ta-attention` ONCE (the preset animates a single iteration by definition, no loop),
and hidden below 40rem viewport height via component-scoped media query — it only appears when
there is room for it truthfully. 44×44 target.

## 7. CTA destinations — both real

Primary "Enter a world" → `/subjects` (200; the real scaffold until Scene 3 authors the chooser).
Secondary "Understand it" → `#how-it-works` (Scene 1 exists on the page; anchor verified present).
Exactly one primary (2.5). Keyboard order follows visual order: skip → nav → primary → secondary
(tab pass recorded).

## 8. LCP + CLS

LCP element is the STATEMENT (H1) — measured by PerformanceObserver on slow-4G + 4× CPU:
620–748ms; Lighthouse prod desktop: LCP 472ms, CLS 0. Dev hero CLS 0.0001 (environment settle
contributes nothing measurable; the layer is absolutely positioned).

## 9. Viewport fit — all five pass

375×667 ✓ · 320×568 ✓ · 1280×800 ✓ · 1920×1080 ✓ · 667×375 ✓ — statement + both CTAs fully
visible without scrolling at every size (measured bounding boxes). Early failures at 320×568 and
667×375 were fixed with component-scoped small-viewport rhythm (tighter paddings, 18ch measure,
smaller support line) — no token changes. Zoom proxies (360px ≈ 400% of 1440, 720px ≈ 200%): no
horizontal scroll (scrollWidth 360), CTA reachable. WCAG 1.4.12 text-spacing overrides: no overflow.

## 10. Nav overlay legibility

The SiteHeader floats over the hero with its existing 85%-surface + blur scrim (2.6 behaviour,
untouched). Verified at rest and scrolled, 320→1920, both themes: statement and CTAs sit below the
header line (h1 top ≥143px in the tightest case) and remain legible (screenshots). No additional
scrim was needed; none applied speculatively.

## 11. No-JS and first paint

`hero-nojs.png` (JS disabled): statement at opacity 1, support line, both CTAs (48px), cue,
environment vector, lockup and nav — in order. First paint with JS: h1 opacity 1 at
domcontentloaded. ONE h1 on the page.

## 12. Payload — WebGL chunk absent

`/` requests no WebGL: network resource scan shows `webglRequested: false`; the ambient chunk
(`0mf4owqbmymf2.js`, the only chunk containing `webglcontextlost`) is referenced 0 times by the
served HTML of `/` and never fetched. Hero adds one tiny client component (ambience settle); the
statement, CTAs, cue and environment SVG are server-rendered. No 3D, no canvas, no ambient layer.

## 13. Reduced motion / keyboard / screen reader

RM: environment static, statement/support/CTAs/cue/nav present and complete (`hero-reduced.png`).
Keyboard: skip → brand → nav → Sign in → Create account → "Enter a world" → "Understand it" →
cue; focus ring visible on the ink Stage (`hero-focus-cta.png`, global focus token). SR: one h1
announced ("Every subject is a place you can enter."), reading order matches visual order; cue
announces "Continue to the premise". axe on `/`: 0 violations.

## 14. Sweeps

No rotation/carousel/autoplay/video/GIF/marquee (DOM sweep: 0). No personalisation ("welcome
back", names, remembered state): none; nothing reads or writes per-user state beyond the existing
theme preference. No fake UI; both CTAs resolve. Copy sweep over the shipped copy: no banned
phrase, no exclamation marks, no invented statistic/testimonial/credential, no rhetorical question.

## 15. Audits

axe `/`: 0 violations. Lighthouse prod `/` desktop: **100 / 100 / 100 / 100** (perf/a11y/bp/seo),
LCP 472ms, CLS 0. Hydration console on `/`: `[]`.

## 16. Deferred (nothing half-built)

Scene 0 is complete and locked-eligible; scenes 1–8 remain skeletons awaiting their steps; the
chooser design (4.3) will replace the scaffold link cluster in Scene 3, not here. The statement is
swappable without rebuild.

## 17. Nothing protected changed

Tokens/type/motion/spatial/density, primitives, brand frame + nav shell, subject system, marks,
grammar, switch, ambient, shell, spine contract/sequence/voice, other scenes, existing routes,
build/deploy — untouched. `git status --porcelain` → `fatal: not a git repository` (exit 128).

Stopped after the report. Step 4.3 not begun.
