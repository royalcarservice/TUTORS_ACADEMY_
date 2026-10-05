# TUTORS ACADEMY — Phase 4 · Step 1
## The Narrative Spine + Section Contract

> Depends on all of Phase 3 (certified) and Phase 2. **Read the subject schema (3.1) and
> the motion grammar (2.3) first** — this step mirrors both architectures.
>
> **This step builds the story's architecture, not its art.** No hero design, no scene
> visuals, no final copy. It produces: the spine, the scene contract, the copy voice rules,
> and a renderable skeleton.
>
> **This is the first step that touches `/`.**

---

### WHY THIS STEP EXISTS

The homepage is the prologue of the journey. It has exactly one job:

> **Take a visitor from "what is this?" to "I have chosen a subject and entered."**

Everything on the page either serves that movement or gets cut. And because the homepage is
assembled from scenes built across six later steps, the **contract between those scenes must
exist first** — otherwise each step invents its own structure and the story stutters.

---

### THE FIVE LOCKED DECISIONS (each vetoable, none silently assumed)

**1. The homepage ends at ENTER.**

The narrative terminus is the subject chooser → the environment. Not "sign up." Not
"contact us."

- **Primary CTA: enter a world** (choose a subject).
- **Secondary CTA: understand it** (moves within the story).
- Account creation happens **at the point of actual use**, not as a toll gate in front of the
  experience.

This inverts how nearly every education site converts. It is a **business decision as much as
a design one** — flag it explicitly in the report so it can be vetoed.

**2. The honesty problem is solved structurally, not with a disclaimer.**

Live classes, recordings, AI and progress **do not exist yet** (Phases 7–9). The homepage
must not market a product that isn't there.

Resolution:
- **The environments are the hero of the homepage.** They are real, built and certified.
  They are the differentiator no competitor has.
- **Unbuilt capabilities get ONE honest scene** — "what's live / what's next" — presented as
  a roadmap beat. Structured confidence reads as *a product with a plan*, not as an apology.
  **It must not be styled as a disclaimer, a footnote, or a legal notice.**
- **Nothing pretends to work.** No fake video player, no fake AI chat demo, no fake dashboard
  screenshot, no fake class schedule, no invented tutor. If a capability is not built, it is
  described in words, or not shown at all.
- **Report exactly which scenes describe unbuilt capability**, and how each is labelled.

**3. Ten sections become nine scenes.**

The original list had live classes, recordings, AI and progress as four consecutive items.
**Four sequential feature blocks is precisely the generic-SaaS shape this product rejects.**

They consolidate into **one "Practice" scene with beats**, so each capability gets a real
moment without the page decomposing into a feature grid.

| # | Scene | Narrative function |
|---|---|---|
| 0 | **Arrival** | This is a place where learning happens differently |
| 1 | **The Premise** | What Tutors Academy is — concrete, no feature dump |
| 2 | **The Difference** | Demonstrated, not claimed: one brand, many environments |
| 3 | **The Choice** | The pivot — DISCOVER → CHOOSE |
| 4 | **Enter** | The signature moment — CHOOSE → ENTER |
| 5 | **The People** | Tutors as humans, not profile cards |
| 6 | **The Practice** | Live · recorded · resources · AI · progress — four beats, one scene |
| 7 | **The Promise** | What mastery looks like; progress made visible |
| 8 | **The Return** | Final CTA for anyone who scrolled past the chooser |

**4. The spine is data, not a hardcoded page.**

Mirroring the subject architecture:
- Scenes are **config**; order is a **sequence**; the page renders from the sequence.
- Each scene declares its **narrative function**, **scroll behaviour**, **subject behaviour**,
  **degradation behaviour** and **status**.
- **Reordering the story never requires editing a component.**
- The same **guard test** applies: components do not import scene configs directly — they
  consume a context or a passed slice.

**5. The homepage's primary audience is the student.**

The page speaks to the person who will actually use it, because **the experience is the
differentiator** and enthusiasm is what carries a decision.

- Parent-relevant signals (tutor quality, structure, visible progress, rigour) must be
  **present and credible** — but they do not set the voice.
- If you believe the voice should shift toward parents, **report it as a recommendation with
  reasoning** rather than silently changing it.

---

### FIRST: INSPECT

1. **Step 3.1** — how a subject config is shaped, validated, scoped and guarded. The scene
   contract must follow the **same architectural pattern**.
2. **Step 2.3** — the motion grammar and its choreography primitives. Scene scroll behaviour
   may only draw from these.
3. **Step 2.4** — the Stage/Room layers, section spacing roles, and the **proximity principle**.
4. **Step 3.4** — the switch state machine and its tiers, since **Scene 4 is that machine**.
5. **Step 3.6** — the shell, the route structure, and the **honest placeholder treatment** from
   the environment regions. Reuse that treatment rather than inventing a second one.
6. **Step 2.6** — the nav shell's Stage mode, its CTA hierarchy, and where the nav's public
   links currently point.
7. **Existing `/` route** — if one exists, **report and extend, never replace**.
8. **Existing copy, tone, taglines** anywhere in the codebase — the voice must not contradict
   what already ships.

Report findings before building.

---

### BUILD — PART 1: THE SCENE CONTRACT

A typed config per scene. **Required fields, with bounded values** — no free-form strings for
anything the system consumes.

```
Identity
  id              slug, stable, never renamed after launch
  order           integer, defines sequence
  name            display name (internal)
  narrativeFn     'arrive' | 'premise' | 'differentiate' | 'choose'
                  | 'enter' | 'people' | 'practice' | 'promise' | 'return'
  status          'skeleton' | 'authored' | 'locked'

Scroll behaviour
  scrollBehaviour 'static' | 'reveal-once' | 'sticky-stage' | 'sequence'
  scrollBudget    BOUNDED — how much scroll distance the scene may consume
  pins            boolean — declares whether the scene holds position

Subject behaviour
  subjectMode     'neutral' | 'preview' | 'responsive' | 'active'
  accentUse       'none' | 'subtle' | 'forward'
  ambient         'off' | 'permitted'

Degradation
  reducedMotion   what this scene becomes with motion removed — REQUIRED, no blanks
  mobileBehaviour what this scene becomes at small widths — REQUIRED
  noJsBehaviour   what this scene renders without client JS — REQUIRED

Content
  liveCapability  TRUE only if the scene describes something that actually exists
                  today. FALSE is allowed and expected — it drives the Part 4 treatment.
```

**Field rules:**
- **`reducedMotion`, `mobileBehaviour` and `noJsBehaviour` may not be blank.** A scene whose
  degraded form is undesigned is an unfinished scene.
- **`scrollBudget` is bounded as a whole.** Define the page-wide ceiling and report it.
- **`noJsBehaviour` must never be "nothing."** Content is server-rendered; motion is
  enhancement. This was the core property of Phase 3 and the homepage inherits it.

---

### BUILD — PART 2: THE SCROLL GRAMMAR

Cinematic scrolling is where immersive homepages become unpleasant. So it is bounded here,
before any scene is built.

**The rules:**
- **Natural scrolling stays natural. No scroll-jacking. No scroll-hijacking library. No
  virtualised scroll.** The user's scroll input is never intercepted or reinterpreted.
- **Only four scroll behaviours exist** (the enum above). No scene may invent a fifth.
- **`sticky-stage` is rationed.** **At most ONE sticky-stage scene per page.** Report which
  scene claims it, and why it earns it.
- **`sequence` is rationed** — it is for stepping through beats within a single scene (e.g.
  the Practice scene's four beats), not for sequencing the whole page.
- **Every scroll-driven effect uses the 2.3 grammar** — `reveal`, `stagger`, `orient`,
  `morph`. **One-shot reveals never re-animate on scroll back.**
- **Motion budget:** define a maximum number of concurrently animating elements per scene.
- **Reduced motion:** scroll behaviour collapses to `static` everywhere. **The story must
  still read in order, completely, with no motion at all.** This is the single most important
  property of the scroll grammar — verify it explicitly.
- **Scroll position is never required to understand content.** Nothing is hidden until scrolled
  into; reveals are additive, not conditional.

---

### BUILD — PART 3: THE COPY VOICE

Copy is the hardest thing to retrofit, so it is defined before any is written.

**The voice:**
- **Confident and plainspoken.** Speaks to an intelligent person, not a customer.
- **Concrete over abstract.** Name the thing. Show the detail.
- **Adult.** No exclamation marks, no urgency, no hype.
- **Short sentences carry the page.** Long sentences earn their length or get cut.
- **Second person, addressed to the student.** "You" means the learner.

**Banned outright — flag any existing occurrence:**
unlock your potential · revolutionize · transform your future · game-changing · world-class ·
cutting-edge · seamless · empower · journey (as a marketing noun) · next-generation ·
leverage · elevate · discover the magic · unleash · "in today's fast-paced world" ·
rhetorical questions as headlines · triple stacks of adjectives · em-dash-heavy listicles

**Required:**
- Every claim **must be demonstrable in the product**. If the page claims it, the product does
  it — or the scene is labelled per Part 4.
- No claim about outcomes the product does not control (marks, ranks, admissions).
- **No testimonial, statistic, or credential may be invented.** Not even a plausible-sounding
  one as a placeholder. If a scene needs one, it renders as an honest empty state until real
  material exists.

**Deliverable:** the voice rules committed as a short document, so later scene steps write
against it rather than re-deciding tone.

---

### BUILD — PART 4: THE HONESTY TREATMENT FOR UNBUILT CAPABILITY

Reuse the **3.6 honest placeholder treatment** — do not invent a second one.

- Scenes describing unbuilt capability (`liveCapability: false`) render with a **deliberate,
  designed status treatment** — quiet, confident, clearly readable as *"this is what's
  coming"* — **not** as a disclaimer, footnote, legal notice, or grey-box apology.
- **The treatment is part of the design language, not an add-on.** It should look like a
  product that knows exactly where it is.
- **No fake UI of any kind** anywhere on the homepage: no fake video player, no fake AI chat,
  no fake progress dashboard, no fake schedule, no fake tutor.
- **The "what's live / what's next" scene** is authored here as a **narrative beat**, in the
  voice rules from Part 3 — confident, specific, no apology.
- Report **every scene's `liveCapability` value** and the treatment applied.

---

### BUILD — PART 5: THE SKELETON ROUTE

The homepage must never be broken during Phase 4. So `/` is created **now**, rendering the
spine from the scene sequence.

**The rule:** each later Phase 4 step **replaces one scene's content** with the authored
version. The page is **always live**, always coherent, and **improves visibly** step by step.

- `/` renders the scenes in order from the sequence.
- **`status: 'skeleton'` scenes** render as **deliberate quiet states**, coherent with the
  surrounding page — never as broken blocks, empty boxes, or skeletons/shimmer (skeletons
  imply *loading*, and these are not loading).
- **In dev only**, skeleton scenes display their scene name, narrative function and intended
  phase, so the structure is legible during the build.
- **In production, skeleton scenes render with no build metadata** — just the quiet state.
- The page must be **correct with no JavaScript** from the moment it exists: every scene's
  content server-rendered, in order.

---

### SPECIMEN ROUTE — `/dev/spine` (dev-only)

Gate behind `NODE_ENV !== 'production'`. This is the structure you judge **before** any art is
made.

Required:
- The **nine scenes in order**, rendered as structure — scene name, narrative function,
  status, and the contract's declared values.
- **A scroll-behaviour visualiser:** each scene's `scrollBehaviour` and `scrollBudget`
  displayed, with the **page-wide scroll budget** shown as a total against its ceiling.
- **A reduced-motion preview** of the whole spine, showing that the story reads completely
  and in order with all motion removed.
- **A no-JS preview**, showing the same.
- **The `liveCapability` map** — which scenes describe real capability today and which
  describe what's next, with the treatment applied.
- **A reorder control** — drag or move scenes up/down and see the render update, **proving
  the spine is data**. Reset to default.
- **The copy voice rules** rendered as readable reference.
- **A scene-coverage table:** for each scene, all contract fields including the three
  degradation fields — **so no scene has a blank degradation plan.**
- A visible note stating **what this step produced** (contract, spine, voice, skeleton) and
  **what is deferred** (hero design, scene art, real copy — Steps 4.2 onward).

---

### CONSTRAINTS

- **Structure, voice and contract only.** No scene visual design, no hero art, no final
  scene copy, no 3D, no new motion presets.
- **No new tokens, colours, marks, motifs, or motion vocabulary.**
- **Do not modify** the subject system, the brand frame, the ambient layer, the switch, the
  environment shell, or any primitive.
- **Do not build the subject chooser's design** in this step — Scene 3's authored form is
  Step 4.3. The skeleton must not pre-empt it.
- **Do not build a footer** — it belongs with the final scene in Step 4.8.
- **Do not touch the nav shell's structure** — it is Stage mode and already correct. If its
  public links currently point at route stubs, **report that**, do not fix it here.
- Do not touch existing `/dev/*` routes.
- **No new dependencies** — including no drag-and-drop library for the reorder control;
  implement it with plain controls.
- No scroll-hijacking, no virtualised scroll, no parallax library.
- Do not begin any later Phase 4 step.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitive APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (2.6)
- Subject schema, validator, scoping, guard test (3.1)
- Marks, mark language spec (3.2)
- Motif grammar, roles, budgets (3.3)
- Switch state machine, tiers, ceremony rationing (3.4)
- Ambient layer, lifecycle rules, safety caps (3.5)
- Environment shell, route structure (`/subjects/*`), honest placeholder treatment (3.6)
- The audit harness and the committed baseline (3.7)
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **No-JS** — load `/` with JavaScript disabled. All nine scenes present, in order, readable,
   navigation working. **Screenshot it.**
2. **Reduced motion** — with OS reduced motion and all scroll behaviour collapsed to `static`:
   the story reads completely and in order. **Screenshot it.**
3. **Scroll budget** — report the total declared `scrollBudget` across all nine scenes against
   the page-wide ceiling. Report which scene claims `sticky-stage` and why.
4. **No scroll interception** — verify native scrolling is completely unmodified: scroll
   events, momentum, keyboard scrolling (`Space`, `PageDown`, arrows), and scrollbar dragging
   all behave natively. Report how you verified a **lack** of interception.
5. **Scroll reveal one-shot** — scroll down past a reveal, then back up. Confirm it **does not
   re-animate**. Report the observation.
6. **Reorder proof** — reorder scenes on `/dev/spine`; the render updates and **no component
   was edited**. Screenshot before/after.
7. **Guard test** — extend it to scene configs and prove it fails on a direct import. Paste
   the failure, then revert.
8. **Degradation completeness** — every scene has non-blank `reducedMotion`, `mobileBehaviour`
   and `noJsBehaviour`. Report the table.
9. **`liveCapability` audit** — list every scene's value and confirm no scene with
   `liveCapability: true` describes something unbuilt. **Cross-check each claim against what
   actually exists in the codebase.** Report any mismatch.
10. **No fake UI sweep** — grep the homepage for any simulated interface: video players,
    chat surfaces, dashboards, schedules. Expected: none.
11. **Copy sweep** — grep the new copy for any banned phrase from Part 3, and for any invented
    statistic, testimonial or credential. Expected: none.
12. **Both themes** — `/` and `/dev/spine` in dark and light.
13. **Mobile 320px** — every scene renders correctly in its declared mobile form. No overflow.
14. **Zoom 400% + text-spacing overrides** — nothing breaks on `/`.
15. **Keyboard + screen reader** — full tab pass on `/`; report the heading outline and
    landmark structure for the whole page.
16. **Performance** — first paint and CLS for `/` with nine skeleton scenes.
17. **Hydration** — zero warnings on `/` and `/dev/spine`.
18. **Audit** — axe/Lighthouse on `/` and `/dev/spine`. Score + every violation.
19. **Production build** succeeds; `/dev/spine` absent or 404; skeleton scenes show **no build
    metadata** in production.
20. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — including whether an existing `/` route was extended or created
2. **The scene contract** — every field, every bounded enum value, pinned and explained
3. **The nine scenes** — id, order, narrative function, status, and the full contract per scene
4. **The scroll grammar as implemented** — the four behaviours, which scene uses which, the
   `sticky-stage` claimant and justification, and the total scroll budget
5. **The degradation table** — all nine scenes × three degradation fields, all non-blank
6. **The copy voice document**, including the banned list
7. **The `liveCapability` map** — which scenes describe real capability, and the treatment
   applied to the rest
8. **The "what's live / what's next" scene** as authored — paste the copy
9. **The recommendation you were asked for** on audience and voice, with reasoning
10. **Explicit flag on Decision 1** (the homepage ends at ENTER, conversion deferred to point
    of use) so it can be vetoed
11. No-JS and reduced-motion screenshots
12. Reorder proof + guard-test proof
13. No-fake-UI and copy sweeps
14. Performance, hydration, accessibility results
15. Anything deferred, and confirmation nothing was half-built
16. Confirmation nothing in the brand frame, subject system, primitives, environment shell, or
    existing routes was changed

---

### STOP

End after the report. Do not begin Step 4.2 (Arrival) — each subsequent step authors exactly
one scene.
