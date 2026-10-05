# TUTORS ACADEMY — Phase 4 · Step 2
## Scene 0 — Arrival

> Depends on Step 4.1 (spine + contract + voice) and all of Phase 3. **Read the scene
> contract and the copy voice document first.**
>
> **This step authors ONE scene.** It does not touch the spine, the other eight scenes,
> the subject system, or the primitives.
>
> **This is the only place in the product where `--ta-display-xl` and `--ta-dur-cinematic`
> are permitted.** The hero is the one ceremonial moment. Spend it here and nowhere else.

---

### WHY THIS STEP EXISTS

The visitor lands. Before reading anything, before scrolling, they decide whether this is
another online tuition site.

That decision takes about three seconds and is made on the strength of **one statement, one
composition, and how the page behaves**. The hero's entire job:

> **Communicate: this is a place where learning happens differently. And give them a door.**

---

### THE FIVE LOCKED DECISIONS

**1. The words do not animate. The place arrives around them.**

- **The hero statement is fully rendered, at full opacity, in the server-rendered HTML.**
  No entrance animation may leave it invisible at any point, for any user, under any condition.
- **The environment settles around it.** Any entrance choreography applies to the
  environmental layer, never to the statement.
- Rationale: animating a headline from opacity 0 delays the LCP element, risks a blank hero
  under no-JS or a failed hydration, and reads as the product performing for the visitor.
  **The statement is present. The place comes alive around it.** Faster *and* more confident.

**2. The hero loads no 3D.**

- **No WebGL, no canvas, no ambient layer chunk, and no 3D library in the hero's critical path.**
- The ambient layer is a Mathematics exemplar (3.5) and the hero is subject-neutral, so it
  does not belong here regardless.
- 3D belongs **inside** a subject environment, where it means something.
- **Report the hero's JS payload and confirm the WebGL chunk is absent.**
- The hero's Stage is the **brand environment** — ink, brass, vector, server-rendered.

**3. The hero does not preview all six subjects.**

That is Scene 3's reveal. Previewing it here spends the reveal early and turns a moment into
a menu. **The hero makes one statement and creates pull. Choosing is a separate act.**

**4. No rotation, no carousel, no autoplay, no video.**

- **No rotating or cycling headline.** A statement that changes is three weak statements.
- No carousel, no autoplaying media, no animated GIF, no marquee.
- **One statement. It stays.**

**5. The hero fits the viewport it's in.**

- The **statement plus both CTAs must be fully visible without scrolling at 375×667** — a
  common small viewport — and at 1280×800.
- The **scroll cue is optional** and only appears when there is room for it truthfully.
- The hero must not consume the viewport in a way that strands content below at high zoom
  (WCAG 1.4.10).

---

### FIRST: INSPECT

1. **Step 4.1** — the scene contract, this scene's declared field values, the scroll grammar,
   the copy voice document, and the honesty treatment.
2. **Step 2.2** — the display scale, `--ta-display-xl`, the measure rule, and the fallback stack.
3. **Step 2.3** — the motion grammar. The hero may use **one** `--ta-dur-cinematic` moment and
   the `reveal` / `stagger` / `orient` presets only.
4. **Step 2.4** — the Stage layer, gutter behaviour, section spacing, touch-target rules, and
   **the ambient arrival rule** (which the hero now declines).
5. **Step 2.6** — the nav's Stage mode: it floats over hero content, transparent at rest, and
   applies a scrim when needed for legibility. **The hero must be designed for the nav
   overlaying it**, and the scrim behaviour verified against the hero's actual content.
6. **Step 2.5** — the Button primitives and the CTA hierarchy (**exactly one `primary`**).
7. **Step 3.3** — the motif grammar and the brand's own structural language, for the hero's
   environmental layer (brand-neutral, not a subject motif).
8. **Existing `/` route and Scene 0's current skeleton state** — extend, never replace.

Report findings before building.

---

### BUILD — PART 1: THE STATEMENT

**Required:**
- **One sentence.** Maximum **10 words.** It must state the proposition, not describe a feature.
- **One supporting line.** Maximum **two sentences**, concrete. It may name the mechanic
  (subjects as environments) without explaining the whole product.
- Written against the **4.1 voice rules**: confident, plainspoken, concrete, adult, second
  person. **No banned phrase. No rhetorical question. No triple adjective stack.**
- **No claim the product cannot demonstrate.** No outcomes, no marks, no ranks, no "world's
  best," no invented numbers.

**Mandatory deliverable — three candidate statements:**
Propose **three complete candidates** (statement + supporting line). For each, state what it
emphasises and what it risks. Then **recommend one, with reasoning**, and give a second choice.
**Report all three verbatim** so the statement can be swapped without a rebuild.

**Rules:**
- **The statement is text, not an image.** No text in SVG art, no baked-in type. It must be
  selectable, translatable, and readable by assistive technology.
- **Exactly one `h1`** on the page, and it is this statement.
- The **brand lockup is present** (2.6) — mark and wordmark, in their identity position,
  brass, unchanged. The hero does not restyle the brand frame.

---

### BUILD — PART 2: THE CTA HIERARCHY

Exactly two actions, per the 4.1 decision **"the homepage ends at ENTER."**

- **Primary — enter a world.** Goes to the subject choice (Scene 3, or directly to
  `/subjects` until Scene 3 is authored). **It must be a real destination.**
- **Secondary — understand it.** Moves *within the story* to Scene 2. An anchor, not a route.
- **Exactly one `primary`** (2.5's rule). The secondary is visually quieter.
- **Both are real.** No button that scrolls to a scene that does not exist, no link to a stub.
  **If a destination is not built, report it rather than shipping a dead CTA.**
- **Touch targets ≥44×44, ≥48 for the primary**, with ≥8px gaps, at 320px.
- **Keyboard order follows visual order.** Both reachable immediately after the skip link
  and nav.

---

### BUILD — PART 3: THE COMPOSITION

**The hero's visual is the brand environment — not a picture of one.**

- **No hero image. No stock photograph. No illustration. No gradient blob, no abstract shape
  collage, no fake product screenshot.**
- The Stage is composed from **ink surfaces, typography, the brand mark, and one structural
  element** drawn from the brand's own language (3.3). **Restrained — one idea, not a scene.**
- **Brass is the only accent** and it is used sparingly (a seal, not a paint). **No subject
  accent colour appears in the hero** — subject identity belongs to subject environments.
- **Typography does the heavy lifting.** This is where the display family earns its place:
  the statement set at the largest scale in the system, with correct optical tracking and
  line-height from the 2.2 rhythm table.
- **Composition must hold at every width** — 320 through 2560 — without the statement
  crowding the CTAs or the nav overlaying the type.

**The nav overlay must be verified:** the nav floats over the hero at rest. Confirm the
statement and CTAs remain legible with the nav present, at every width and in both themes.
**If the scrim is needed, it must be triggered by the hero's actual content — not
speculatively applied to everything.**

---

### BUILD — PART 4: MOTION — ONE CEREMONIAL MOMENT

- **Entrance choreography applies to the environment only** (Decision 1). The statement and
  CTAs are visible from first paint and do not move in.
- **At most one `--ta-dur-cinematic` moment** on the page, and it is here — if it earns its
  place. **If it does not, don't use it. Report that you declined it.**
- **The entrance must never delay interaction.** CTAs are clickable immediately, even while
  the environment settles.
- **No scroll-triggered entrance for the hero.** It is Scene 0 — the visitor has not scrolled.
- **Optional and strictly capped:** a subtle pointer response on the environmental layer only,
  via the 2.3 grammar, **never on text**, disabled on touch devices and under reduced motion.
  **If it costs a frame, cut it.** Report whether you included it.
- **No loader, no splash, no percentage, no "preparing your experience."** The hero is instant.
- **Reduced motion:** the environment is static. The statement, supporting line, CTAs and nav
  are all present, correct and complete. **Verify.**

---

### BUILD — PART 5: THE SCROLL CUE AND THE ARRIVAL PROMISE

**Scroll cue:**
- **Optional.** Include it only if it fits truthfully in the viewport (Decision 5).
- If present, it must be **a real anchor link to Scene 1**, keyboard focusable, with an
  accessible name — not a decorative arrow with no function.
- It may use the `attention` preset **once**, subtly. **It must not loop indefinitely.**

**The arrival promise — the hero must set up the journey, not summarise it:**
- The hero does **not** list features, does not preview subjects, and does not explain the
  whole product. It makes one statement and opens one door.
- Read the hero and then read Scene 3's intent: **a visitor who lands and immediately scrolls
  should feel pulled toward choosing, not sold to.**

**Returning visitors:**
- **No personalisation. No "welcome back." No remembered name. No streak, no progress, no
  fake account state.** There is no auth (2.6) and nothing to remember.
- **Report if any personalisation is present.** Expected: none.

---

### CONSTRAINTS

- **One scene only.** Do not author Scene 1–8. Do not touch the spine, the scene sequence, or
  any other scene's content.
- **Do not modify** the scene contract, the scroll grammar, the copy voice document, or the
  honesty treatment — all are fixed by 4.1.
- **No new tokens, colours, marks, motifs, motion vocabulary, or primitives.**
- **No 3D, no WebGL, no canvas, no ambient layer in the hero.**
- **No images of any kind.** SVG from the brand language only, and no new raster assets.
- **No new dependencies.**
- Do not build the subject chooser, the final footer, or any later scene.
- Do not touch existing `/dev/*` routes, the subject routes, or the audit harness.
- Do not restyle the nav shell.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitive APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (2.6)
- Subject schema, validator, marks, motif grammar, switch, ambient layer, environment shell
  (3.1–3.6)
- The audit harness and committed baseline (3.7)
- The scene contract, scene sequence, scroll grammar, voice document (4.1)
- Other scenes' content
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **No-JS** — disable JavaScript. Statement, supporting line, both CTAs, brand lockup and nav
   all present and correct, in order, at full opacity. **Screenshot it.**
2. **First paint** — screenshot the hero at first paint before any JS executes. Confirm the
   statement is **fully visible**, not faded, not offset.
3. **LCP** — identify the LCP element and report it. **It must be the statement text, not an
   image or the environment.** Report measured LCP on a throttled slow-4G / mid-range profile.
4. **CLS** — report measured CLS on the hero, including any settle of the environment. Target 0.
5. **Viewport fit** — statement + both CTAs fully visible without scrolling at: **375×667**,
   320×568, 1280×800, 1920×1080. Report any width where a CTA falls below the fold.
6. **Landscape mobile** — 667×375. Confirm the hero remains usable and the CTAs are reachable.
7. **Zoom 400%** (WCAG 1.4.10) and **200%** — nothing clips, nothing overlaps, no horizontal
   scroll, the CTAs remain reachable.
8. **Text spacing** (WCAG 1.4.12) — forced overrides; the statement does not clip or overlap.
9. **Nav overlay** — verify statement and CTA legibility with the nav floating over the hero,
   at every width, both themes, at rest and scrolled. Report any failure and the fix.
10. **Both themes** — full hero in dark and light.
11. **Reduced motion** — environment static, everything present and complete. Screenshot.
12. **Keyboard** — tab from page start: skip link, nav, then statement, then CTAs in visual
    order. Focus always visible on the ink Stage — **this is the case focus rings most often
    disappear.** Report any invisible focus.
13. **Screen reader** — report the reading order: the `h1` is announced once and sensibly,
    the order matches the visual order, the scroll cue (if present) announces something
    meaningful. Report tool and output.
14. **Touch targets** — audit both CTAs and any cue at 320px. Report any below 44×44 or any
    pair closer than 8px.
15. **No rotation / no autoplay** — confirm no cycling content, no autoplaying media, no
    animated GIF. Report the sweep.
16. **No personalisation** — confirm no "welcome back," no name, no remembered state. Report
    the sweep.
17. **No fake UI** — confirm no simulated interface and no dead CTA. **Verify both CTA
    destinations actually resolve.** Report where each goes.
18. **Copy sweep** — grep the new copy for banned phrases, invented statistics, testimonials
    or credentials. Expected: none. Paste the three candidate statements.
19. **Payload** — report the hero's JS and CSS payload. **Confirm the WebGL chunk is absent**
    from the network waterfall for `/`.
20. **Mobile 320px** — correct composition, no overflow, no crowding.
21. **Hydration** — zero warnings on `/`.
22. **Audit** — axe/Lighthouse on `/` focused on the hero. Score + every violation.
23. **Production build** succeeds.
24. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — and confirmation only Scene 0 was authored
2. **The three candidate statements** — verbatim, with what each emphasises and risks, plus
   your recommendation and second choice
3. **The composition** — what the environmental layer is, drawn from which part of the brand
   language, and why it is restrained
4. **The `--ta-dur-cinematic` decision** — used or declined, and why
5. **Whether the pointer response was included**, and its measured cost
6. **Whether the scroll cue was included**, and where it links
7. **CTA destinations** — the real routes each goes to, and confirmation neither is a stub
8. **LCP element identification and measured value**, plus CLS
9. **Viewport fit results** at all five tested sizes
10. **Nav overlay legibility results** and whether the scrim was needed
11. No-JS and first-paint screenshots
12. Payload report with confirmation the WebGL chunk is absent
13. Reduced motion, keyboard and screen-reader results
14. Sweeps: no rotation, no personalisation, no fake UI, copy
15. Accessibility audit results
16. Anything deferred, and confirmation nothing was half-built
17. Confirmation nothing in the brand frame, subject system, spine, other scenes, primitives,
    or existing routes was changed

---

### STOP

End after the report. Do not begin Step 4.3 (Scenes 1–2) or any other scene.
