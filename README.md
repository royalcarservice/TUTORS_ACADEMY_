# Tutors Academy — Prompt Log

One small, self-contained prompt per step. Each is read top-to-bottom and executed alone.

## Target Stack (default — confirmed/overridden by Phase 1 Step 1)

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind + CSS custom properties (subject token layer) |
| Motion | Motion (Framer Motion) |
| 3D | React Three Fiber + drei |
| Client state | Zustand |
| Server state | TanStack Query |
| Backend | Supabase — Postgres, Auth, Storage, Realtime |
| Live video | LiveKit (Phase 7) |

## Phase Tracker

**Phase 1 — Foundation**
- [ ] Step 1 — Project Reconnaissance *(read-only)*
- [ ] Step 2 — Foundation setup *(stack lock, folder architecture, quality gates)*

**Phase 2 — Visual Identity + Design System**
- [x] Step 1 — Design Token Foundation → `phase-2-step-01-tokens.md`
- [x] Step 2 — Typography system → `phase-2-step-02-typography.md`
- [x] Step 3 — Motion grammar + reduced-motion contract → `phase-2-step-03-motion.md`
- [x] Step 4 — Spatial system (grid, containers, breakpoints, density) → `phase-2-step-04-spatial.md`
- [x] Step 5 — Core primitives (Button, Surface/Card, Field/Input, Progress) → `phase-2-step-05-primitives.md`
- [x] Step 6 — Navigation shell + brand mark lockup → `phase-2-step-06-nav-brand.md`

**Deferred inside Phase 2 (tracked so they are not forgotten):**
- Icons — RESOLVED in Step 2.6: Lucide, one stroke weight, 16/20/24 grid only, restrained subset.
  Subject identity must NEVER use a Lucide glyph — subjects get custom marks in Phase 3.
- Select / Checkbox / Radio / Switch / Combobox / DatePicker / OTP / FileUpload — built when a real surface first needs them, not speculatively.
- Progress ring/dial + streak visualisation — deferred out of Step 2.5.

**Phase 3 — Subject Identity Architecture**
*(moved ahead of the homepage: the subject transition is the homepage's signature moment
and must not be built twice)*

- [x] Step 1 — Subject identity schema + validator + switchboard → `phase-3-step-01-subject-schema.md`
- [x] Step 2 — The six subject marks (symbolic language) → `phase-3-step-02-subject-marks.md`
- [x] Step 3 — Motif grammar (deterministic structure system) → `phase-3-step-03-motif-grammar.md`
- [x] Step 4 — The Subject Switch (state machine + morph) → `phase-3-step-04-subject-switch.md`
- [x] Step 5 — Ambient layer (3D as a lens, one exemplar + recommendation) → `phase-3-step-05-ambient.md`
- [x] Step 6 — Environment shell (ENTER: routing, scoping, Stage → Room) → `phase-3-step-06-environment-shell.md`
- [x] Step 7 — Re-skin validation gate (closes Phase 3) → `phase-3-step-07-reskin-validation.md`

*(Step 2 split from the original "marks + motifs": two kinds of work, 12 artefacts.
Marks are identity objects; motifs are environmental structure. Sequenced, not bundled.)*

## The Six Environments (locked direction, Phase 3.1)

| Subject | Environment | Accent | Atmosphere | Motif | Motion | Density |
|---|---|---|---|---|---|---|
| Mathematics | **The Lattice** | Indigo | graphite-field | lattice | precise | sparse |
| Physics | **The Field** | Ember | deep-space | field | energetic | balanced |
| Chemistry | **The Vessel** | Manganese Violet | glass | bonds | reactive | balanced |
| Biology | **The Organism** | Living Green | organic | living | growing | dense |
| English | **The Page** | Rose | paper | typographic | editorial | sparse |
| History | **The Record** | Slate Cyan | cartographic | strata | sequential | dense |

A subject is **data + assets**, never a forked component. Five bounded levers:
accent triad · atmosphere · motif · motion character · density.

### The mark family — "Same Hand, Different Idea"

Brand mark = *The Unbroken Line* (one continuous stroke). Subject marks are drawn in the
**same stroke language** — same weight class, terminals, single-stroke discipline — so all
seven read as one family made by one hand, while each figures a different idea:

| Subject | Figure | Idea |
|---|---|---|
| Mathematics | line folds into a lattice and returns | structure discovered, not imposed |
| Physics | curve enters, straight vector leaves | force changes a path |
| Chemistry | closed line holding an interior trace | a vessel containing a reaction |
| Biology | line bifurcates, then rejoins | one origin, many lives |
| English | fluid line becomes constructed | the stroke becomes language |
| History | line progressively interrupted | an archive with missing years |

**Subject marks ≠ UI icons.** Marks are brand-family single-stroke figures; Lucide icons are
uniform geometric glyphs. Two drawing logics — never interchangeable.
The **brand mark is the favicon**; subjects never get their own.

### The motif grammar — structure, not artwork

A motif is a **deterministic grammar**: geometric primitives + per-motif rules, producing
structure from a seed. Same seed → byte-identical output. No `Math.random`, no `Date`,
no viewport-dependent generation (that is the #1 hydration-mismatch cause here).

Renderer-agnostic: the grammar emits **data**; SVG renders it now, WebGL can consume the
same data later without redefining the design. Every primitive carries animatable
parameters — static now, driven by the ambient layer in 3.5.

| Motif | Subject | Structural idea |
|---|---|---|
| `lattice` | Mathematics | grid with rational subdivisions + one emphasised path |
| `field` | Physics | streamlines sharing direction, spaced by field strength |
| `bonds` | Chemistry | valence-limited nodes, discrete edge angles, open reaction sites |
| `living` | Biology | branching growth at decreasing scale, membrane curves |
| `typographic` | English | the page itself — baseline bands, measures, rules |
| `strata` | History | stacked layers with discontinuities — the gaps are the archive |

**Composition roles:** `substrate` · `edge` · `divider` · `focus` · `transition` —
each with coverage caps, contrast ceilings, and Room permissions.

**Non-negotiable legibility rule:** any motif beneath text is capped at a contrast ceiling
and masked out of text regions. Motifs may never push text below WCAG AA. This product is
mostly reading; decoration that costs legibility is a defect, not a style choice.

### The Subject Switch — the signature moment

A **state machine**, not a set of concurrent tweens:

`IDLE → PREPARE → QUIESCE → TRANSFER → ARRIVE → SETTLE`

- **The destination exists before the transition begins.** Never animate into a blank.
  If preparation is slow, the transition *shortens*; it never holds a frozen frame.
- **Total budget ≤ 700ms**; content interactive no later than ARRIVE. The transition
  decorates arrival — it never gates reading.
- **Two colour techniques, deliberately:** layered opacity crossfade for full-bleed
  surfaces (never interpolate accent vars across a full viewport — that repaints every
  frame), true accent interpolation only on small elements.
- **The morph** prefers grammar-parameter interpolation (all motifs share a primitive
  vocabulary), falling back to layered crossfade where the budget is exceeded.
- **Ceremony is rationed across the SESSION:** full arrival on first entry, shortened on
  subsequent switches, shortest on rapid repeat. Ceremony repeated becomes friction.
- **The brand frame never moves.** Mark, wordmark, nav, type, button geometry are untouched.
- **The change is announced.** Under reduced motion the visuals go away, so text must carry
  it: "Now entering Physics — The Field." Without this the key navigation event is silent.
- **Four tiers:** full → reduced → short → instant, with explicit, measurable selection logic.

### The Ambient Layer — 3D as a lens, not a scene

- **The motif grammar IS the geometry.** The ambient layer is a *second renderer* of the same
  structural language — same seed, same primitives, same budgets, expressed spatially. It
  invents no content. This is why 3.3 emitted data rather than markup.
- **One canvas, one role, `substrate` only, Stage only.** Never in a Room (enforced in code),
  never duplicated per section.
- **WebGL is never required.** The 3.3 SVG substrate is the fallback, not a blank. No-JS,
  no-WebGL, reduced-motion, low-power and small-screen users get the complete environment.
- **The critical path is protected.** Three.js (~600KB) is lazy, never in the initial bundle,
  never blocking. If it has not loaded when the Stage is visible, the user sees the SVG
  substrate — never a spinner, never a layout shift.
- **`motionChar` drives character through parameters, not code paths.** One renderer, six
  characters.
- **Hard safety set:** `aria-hidden` throughout, non-focusable, no motion carrying information,
  camera movement and parallax capped, ambient completely off under reduced motion,
  auto step-down on frame degradation, full resource disposal on unmount, graceful WebGL
  context-loss fallback.
- **Built one subject at a time.** Mathematics ("The Lattice") is the exemplar; each other
  subject requires an evidence-based WebGL-vs-vector recommendation approved before build.

### The Environment Shell — ENTER

- **The route is the source of truth, server-rendered.** A direct load produces the complete
  environment with **no JavaScript**: correct scope, accents, motif, identity, headings and
  metadata. The 3.4 switch is progressive enhancement over that state — never a dependency.
  Direct load never runs a transition; it simply arrives correct.
- **Stage and Room are structural, not stylistic.** Stage = full-bleed, substrate permitted,
  comfortable. Room = contained, compact, **substrate forbidden, vector only**. A Room can
  never contain a Stage — enforced structurally.
- **The shell ships identity, not features.** Environment, identity, headings, metadata,
  honest labelled regions. No fake classes, tutors, progress or schedules. A student arriving
  early finds a real, quiet place that tells the truth — not a mockup pretending to be a
  product.
- **Placeholders are truthful.** Regions state what will live there and in which phase. No
  skeletons — skeleton loaders imply loading, and these regions are not loading, they are
  not built.
- **Route honesty:** `/subjects/[subject]` is real; `/subjects` is an explicitly temporary
  scaffold (the real chooser is Phase 4). Unknown → themed 404. Draft subjects unreachable in
  production, enforced at the route level.

### The Homepage Spine — nine scenes, one job

> The homepage has exactly one job: take a visitor from "what is this?" to
> **"I have chosen a subject and entered."**

| # | Scene | Function |
|---|---|---|
| 0 | Arrival | This is a place where learning happens differently |
| 1 | The Premise | What Tutors Academy is — concrete, no feature dump |
| 2 | The Difference | Demonstrated, not claimed: one brand, many environments |
| 3 | The Choice | The pivot — DISCOVER → CHOOSE |
| 4 | Enter | The signature moment — CHOOSE → ENTER |
| 5 | The People | Tutors as humans, not profile cards |
| 6 | The Practice | Live · recorded · resources · AI · progress — four beats, one scene |
| 7 | The Promise | What mastery looks like; progress made visible |
| 8 | The Return | Final CTA for anyone who scrolled past the chooser |

**The homepage ends at ENTER.** Primary CTA is *enter a world*; account creation happens at
the point of use, not as a toll gate before the experience.

**Honesty is structural, not a disclaimer.** The environments are the hero because they are
real and certified. Unbuilt capability (Phases 7–9) gets one honest "what's live / what's
next" narrative beat. **No fake UI anywhere**: no fake video player, AI chat, dashboard,
schedule or tutor.

**The spine is data, not a hardcoded page** — scenes are config, order is a sequence,
reordering never requires editing a component.

**Scroll grammar:** natural scrolling stays natural (no scroll-jacking, no virtualised
scroll). Exactly four behaviours: `static` · `reveal-once` · `sticky-stage` · `sequence`.
**At most one `sticky-stage` scene per page.** Reduced motion collapses everything to
`static` and the story must still read completely, in order.

**Copy voice:** confident, plainspoken, concrete, adult, second person. Banned outright —
unlock your potential · revolutionize · world-class · cutting-edge · seamless · empower ·
journey · unleash · next-generation · leverage · "in today's fast-paced world" · rhetorical
questions as headlines. **No invented testimonial, statistic or credential — ever.**

### Scene 0 — Arrival (the hero)

- **The words do not animate. The place arrives around them.** The statement is fully rendered,
  at full opacity, in the server-rendered HTML. Entrance choreography applies to the
  *environment*, never to the statement. Faster, and more confident — the product does not
  perform for the visitor, it is already present.
- **The hero loads no 3D.** No canvas, no WebGL chunk in the critical path. 3D belongs *inside*
  a subject environment, where it means something.
- **The hero does not preview all six subjects.** That is Scene 3's reveal; previewing it here
  spends the reveal and turns a moment into a menu.
- **No rotation, no carousel, no autoplay, no video, no images.** One statement. It stays.
- **Fits the viewport it's in:** statement + both CTAs visible without scrolling at 375×667 and
  1280×800.
- **The only place in the product** where `--ta-display-xl` and `--ta-dur-cinematic` are
  permitted — and `--ta-dur-cinematic` may still be declined if it does not earn its place.
- No personalisation: no "welcome back", no remembered name, no fake account state.

### Scenes 1–2 — Premise + Difference

**A breath, not a blow.** After the hero's single statement the page goes quiet: Scene 1 is
text-forward and calm (a contained **Room on the Stage**, `prose` container, no subject accent);
Scene 2 is a composed visual exhibit. The cinematic register is deliberately lowered so Scenes
3 and 4 can land.

**Scene 2 is a SPECIMEN SHEET — not a chooser, not a screenshot.** It demonstrates that one
brand holds many environments using **real components in real subject scopes**. Not an ask.
- **Forbidden in Scene 2:** "choose/start/enter/begin/select", per-subject CTAs, hover-to-select,
  any commitment affordance, any CTA at all, any interactive element.
- **No fabricated data** — no names, course titles, progress values, statistics, dates or
  schedules. **No simulated interface.** A specimen that could be mistaken for a working screen
  has failed.
- It shows *materials* the way a type specimen shows type.
- **Scene 2's subject is the system. Scene 3's subject is the visitor's decision.**

**The constancy is visible AND stated.** What changes: accent, motif. What does not: mark, type
families and scale, spacing rhythm, component geometry, motion grammar. The claim is also made
**in text** — a purely visual claim excludes non-visual visitors.

**Rationing:** no ambient, no 3D, no canvas, no `sticky-stage`, no `sequence` in these scenes.
Scene 2's motifs use **low-coverage roles only** (`edge`/`focus`) — never `substrate`.

*Boundary to watch:* if Scene 2 starts pre-empting Scene 3, the sequence has failed — the
builder is required to report that honestly.

### Scene 3 — The Choice (the pivot)

**DISCOVER → CHOOSE.** The first scene where the visitor acts, and the homepage's conversion
moment.

- **A threshold, not a preview.** No page-level takeover, no morph-on-hover. Each door carries
  its own accent, mark, motif and name. **The door tells you its name; the crossing is Scene 4's
  job.** Rejected rather than deferred: page preview would duplicate Scene 4, risk layout shift
  and focus churn, and be ambiguous on touch.
- **Each environment is a real `<a>`.** The scene works with JS off. Accessible name carries
  **subject + environment** ("Physics — The Field"). All six resolve to real routes.
- **Only `ready`/`locked` subjects appear.** The 3.1 draft guard means **no draft subject is ever
  offered on the homepage.**
- **No two-step interaction, ever.** No tap-preview-then-tap, no confirmations, no modals, no
  hover-only affordances. One action per door.
- **Equal weight, explicit order.** Unequal sizing would imply one subject matters more — the
  opposite of the claim. No featured, no "popular", no badges.
- **The conversion promise is ENTRY, not outcomes.** "Enter" — not "Start learning", not "Enrol".
  No promise of unbuilt features; no apology either. The offer is the environment, which is real
  and already built.

*Integration:* this step repoints Scene 0's primary CTA from `/subjects` to Scene 3's anchor —
the change 4.2 deferred to this moment. `/subjects` remains as a plain, accessible alternative
path; it is not redesigned or removed.

**Availability amendment (4.4):** six environments render with full identity; only
`ready`/`locked` are links. Eligibility is **config-driven, never hardcoded** — flipping a
subject to `ready` makes it a door with zero code change. **Inert ≠ lesser:** drafts render at
the same size and identity; only the action differs. No action label, no focus, no hover
emphasis, not announced as links. The availability copy is **derived from config**, so it
self-corrects. Verified at both extremes (one ready, six ready).

### Scene 4 — Enter (the crossing) · **the two-level product**

> **The homepage shows the environments' IDENTITY. It does not show their DEPTH.
> Depth is what you get by ENTERING.**

This is the structural reason to cross — and a homepage that pre-renders everything inside has
destroyed its own reason to exist.

- **Scene 4's unique value is the crossing itself.** You can only see an environment transform by
  moving *between* environments — never from inside a route. **The homepage is the only place the
  switch is the event.** The transformation *is* the content.
- **Scene 3 = the visitor's decision. Scene 4 = the system's move.** The control **steps between**
  worlds; it never asks the visitor to choose. *Boundary most likely to break.*
- **Claims the page's single `sticky-stage` allocation.** The Stage holds while the visitor steps
  between worlds. Bounded budget, releases cleanly, degrades to `static`, must not trap scroll or
  consume the viewport at 400% zoom.
- **No ambient, no 3D — the homepage never loads the WebGL chunk.** It depends on the unapproved
  3.5 recommendation, would work for one environment and not five, and **keeping depth inside
  preserves the reason to enter.** Alternative recorded in the deferred register, not built.
- **Runs 3.4's switch engine** — same phases, tiers, convergence, interruption. **3.4's ceremony
  rationing is exactly what a six-environment walk needs.** No new transition code.
- **Brand frame does not move** during the transformation — the scene's central visual proof.
- **One environment rendered at a time** — only the current substrate (plus the incoming one
  mid-transition) may be live. Six substrates is a defect.
- No simulated interface. No fabricated data. The Stage shows an environment's *identity and
  atmosphere*, never a mocked-up product screen.

### Scenes 5–6 — People + Practice · **real foundation, honest distance**

> **The environments are real, complete and certified. Everything these two scenes describe will
> run *inside* an environment. So they are anchored to something that already exists, and honest
> about the distance between here and there.**

Everything in both scenes is **unbuilt** (tutors → Phase 6; live/recorded/resources/AI/progress
→ Phases 7–9). The naive responses are both failures: **fabricate** (lose the student on day two)
or **apologise** (reads as a product with nothing to offer).

**Scene 5 — The People.** The subject is **the relationship, not a roster.** No names,
photographs, avatars, bios, credentials or subject lists — not even placeholder-shaped ones. The
claim is one the codebase can verify: **a tutor will own and shape an environment** — accent,
atmosphere, motif, motion character, density — rather than appearing in a listing beside a video
call. Every sentence must be classifiable as **verifiable today**, **design commitment**, or
**forbidden-and-removed**.

**Scene 6 — The Practice.** Four beats sequenced as **the life of one session** — not four
feature blocks:

| Beat | Arc |
|---|---|
| **Live** | you attend |
| **Recorded** | you revisit it |
| **Assisted** | you work, with the resources and the help |
| **Progress** | you see yourself move |

Uses `sequence` (its one legitimate use) with the arc carrying the structure. Each beat is a
short statement, not a section. **The whole scene must be readable in under a minute.**

**Since nothing is live, the honesty treatment *is* the design** — per element, reusing 3.6's
convention, at most three status states, applied page-consistently. **Banned:** dates, quarters,
"coming soon", countdowns, waitlists, email capture, urgency devices. **Sequencing, not
scheduling.** One **consolidated honest statement** closes Scene 6.

**No simulated interface in any beat** — no video player, recording library, AI chat, resource
browser, progress chart, schedule, tutor card, or meeting UI. No people imagery. **Nothing is
converted from these scenes:** no CTA, no capture — a roadmap beat that asks for something is
selling, not telling.

### Scene 7 — The Promise · **the turn**

Everything before this is the product describing itself. **Scene 7 is the only scene whose subject
is the visitor's own trajectory.** It is the emotional peak — *a peak, not a pitch.*

**The core idea — the only honest progress visualisation on the page:**

```
DISCOVER → CHOOSE → ENTER → LEARN → INTERACT → PROGRESS → MASTER
```

**On this page, the visitor has genuinely completed the first three** — DISCOVER (Scenes 1–2),
CHOOSE (Scene 3), ENTER (Scenes 4–5). The remaining four are genuinely ahead. So the journey
device is **factually true rather than fabricated**, and it satisfies *"the interface should
visually communicate progress"* **with no fake bar, ring, or percentage.**

It is the visitor's own journey — **not a mock student's** — and it is the scene's built-in honesty
treatment: the unfinished steps are visibly ahead, in the same device, in the product's own
language.

**Banned outright:** progress bar · ring · percentage · completion fraction · streak · XP · points
· level · tier · badge · trophy · medal · certificate · rank · leaderboard. **No reward semantics**
— no checkmarks-as-trophies, no celebration, no "congratulations". **Mastery is not a certificate:**
defined without asserting an outcome, anchored to a real fact — **3.1 made the subject `id`
immutable precisely to key progress against.**

**Scene 7's cliché list:** unlock your potential · you have it in you · every expert was once a
beginner · the only limit is you · imagine what you could become · the future is yours · look how
far you've come · this is just the beginning · **any aspirational question as a statement** · **any
scenic metaphor** — roads into mountains, sunrises, stars, rivers, ladders, silhouettes against
horizons.

**No CTA** — the peak builds desire; Scene 8 asks. **No interactive elements at all.** The device
is a map, not a control: not clickable, not focusable.

### Scene 8 — The Return, and the Footer

**One audience: the visitor who read all nine scenes and never crossed.** Everyone else is already
inside an environment and never sees this scene.

**A recall, not a repeat.** The page opens with a proposition and a door; it closes with **the same
proposition and the same door, now meaning something different** because the visitor has earned the
context. Circularity, not repetition — *if it reads identically to the hero, it has failed.*

**One action, not six.** Scene 3 already offered six doors and they weren't taken. Re-presenting
six options repeats the decision that failed, at the point of lowest patience. **The singular door
leads back to the choice** — lower friction, not a second wall of doors. No featured subject;
Scene 3's equal-weight rule holds.

**The footer is page chrome, not scene content.** It renders **once, outside the scene sequence**,
exactly like the nav — otherwise reordering the spine moves the footer. It is **brand frame**:
brass mark, no subject accent.

**The footer is structurally honest, so it is sparse — and sparse is correct.**
**Banned:** newsletter/email capture · social icons or handles (no accounts exist) · app-store
badges (no app) · accreditations, awards, partner logos · student counts, ratings, testimonials ·
any address, phone, or office that doesn't exist · a sitemap of unbuilt pages · dead links.
**Permitted:** the mark, a closing line, links to routes that resolve today, copyright using the
brand name, and the honest legal status.

**Legal and contact are a LAUNCH BLOCKER, not Phase 10 polish.** Privacy policy, terms, and a
contact route are prerequisites for collecting a single student's data. **The DPDP Act
(Digital Personal Data Protection Act, 2023) governs personal data of Indian users, including
children's data — directly relevant here. Flag for legal review; never draft or stub policy copy.**
Fake legal text is worse than absent legal text, because it looks like compliance.

**The page must end deliberately.** Scene 8 is a close, not a third peak — and it must read as a
*different kind of quiet* from Scene 7. No trailing whitespace, no orphaned scene, no footer
beginning mid-viewport.

**Required deliverable: a full-page read-through verdict.** Nine scenes assembled one at a time
can be coherent in parts and exhausting whole. The builder must report where attention drops,
what could be cut, and **whether the page is too long** — with a recommendation, unsoftened.

### Phase 5 — Momentum, not accounting

> The student space exists to make a student **return tomorrow**, and to make sure they know what
> to do when they do.

**The next-action test:** every element must help the student take the next action, or get out of
the way. Reports are permitted **only where they create momentum**. A statistics dashboard is a
failure state; progress exists to *orient*, not to audit. **Three-second rule:** the student
answers "what should I do next?" in under three seconds, in every state.

**The empty state is the primary state.** A new student has no classes, no recordings, no
resources, no progress, no streak. **That is most arrivals** — the most common experience of the
product, not an edge case. **Empty and loading are different states** with different treatments
(3.6 rule). No skeletons, no shimmer, no "loading" on something that is simply empty.

**The next-action engine resolves to what exists today.** Classes = Phase 7 · recordings = Phase 8
· AI and progress = Phase 9 · **the environments = certified and real.** So the honest next action
is **"continue in your environment"** — not a placeholder, but the correct action, and the hook the
product is built on. The engine must be **extensible**, so later phases add sources rather than
rebuild it.

**Auth is a boundary and a prerequisite, not a phase.** No student experience exists without
identity — and real auth **resolves the honesty decision deferred in 2.6**.

**The visitor -> student relationship:** the homepage still **ENDS AT ENTER** — a visitor can enter
an environment without an account. **An account is required for anything that persists.** Where the
account is asked for is a defined boundary, not an accident.

**Data model rules:** `subject.id` is the anchor (3.1's immutability rule) · enrolment is the
*relationship*, not a flag · **no entity duplicates a subject config value** — names, taglines and
accents live in config, the database stores the `id` · roles and permissions are **modeled now and
enforced at the data layer**, because retrofitting role boundaries into a live schema is a rewrite.

### The Next-Action Engine (Phase 5.4) — one answer, and the machine that chooses it

**The shell's dominant surface stops being hardcoded.** The engine decides what it says, so that
Phase 7 adds a candidate rather than a screen.

**A PURE FUNCTION.** `resolveNextAction(state, candidates, now) -> Candidate | null`. No I/O, no
clock, no database, no randomness inside the resolver. **The answer cannot differ between two
requests with the same input** — and it is present in the server-rendered HTML.

**THE PRIORITY ORDER IS DECLARED BY THE PROVIDER, NEVER COMPUTED.**
**The principle: something that stops being available outranks something that doesn't.** Urgency
means *expiry* and nothing else — not importance, not interest, not a score.

| Tier | Meaning | Today | Requires |
|---|---|---|---|
| **1 — Now** | available only in a window | nothing emits this | `expiresAt`; **no expiry, no Tier 1** |
| **2 — Soon** | scheduled, or just finished | nothing emits this | a real timestamp |
| **3 — Whenever** | durable — resume or begin | **everything today** | `lastEnteredAt` |
| **4 — Origin** | no enrolment: the choice | State A | nothing |

**WITHIN TIER 3:** entered beats never-entered (momentum is not broken to advertise something new) ·
among entered, most recent wins · among never-entered, earliest enrolment wins · ties break by
subject config order. **A never-entered enrolment stays visible in the subject rows** — it does not
compete for the single answer. **At most one thing asks for attention. That is the difference
between an engine and a nag.**

**A PROVIDER MUST CONSULT `src/config/modules` BEFORE EMITTING.** If the registry does not declare
the capability built, the provider returns nothing — so **Phase 7's provider cannot ship ahead of
Phase 7**, gated by the same source of truth that labels the homepage's "not built yet".

**HONESTY, ENFORCED IN CODE:** a candidate may only exist if its `href` resolves for that student
today · `detail` uses populated fields only, and null produces silence · **no counts, percentages,
scores, streaks, XP, levels or badges** — *a number in the primary answer must correspond to an
action* · time language only when `expiresAt` is real · no guilt, no urgency theatre · no
personalisation and no AI ranking (P9 may add a source; it may not reorder tiers or make the answer
unexplainable). **Every answer is reconstructable from data**, and `/dev/next-action` shows every
candidate considered, its sort key, and the winner.

**ONE SURFACE, N CANDIDATES.** The primary surface branches per *kind*, not per feature, and a new
`kind` may only arrive with a treatment that already exists in 2.5's primitives — **inventing a new
visual treatment in a data layer is forbidden.** The engine may never return a list.

**FAILURE:** a thrown provider is caught and isolated; total failure renders the benign action —
never a blank dominant surface, never an error. Tested by deliberate breakage (4.9's method).
**Resolution must add no client JS**; if the bundle grew, it was implemented in the wrong place.

### The Environment Workspace (Phase 5.5) — a place, not an accounting screen

**RULING P5-R5 — ONE ENVIRONMENT, ROLE-SCOPED REGIONS.** There is one environment per subject, not
two: `/subjects/[id]` is where a subject *is*, and the student's workspace is the same place with
their own regions live. **No `/student/[subject]`, no second route.** Reasons: the brand promise is
that choosing a subject changes the environment, and two pages wearing one identity drift · 4.5
already answered it (IDENTITY on the homepage, depth only by ENTERING, and entering has one
destination) · 5.1's contract is *subject-agnostic chrome, subject-scoped workspace* · and a second
route doubles what Phases 7-9 must fill. **What differs by identity is REGIONS AND ACTIONS, not the
place** — decided server-side.

**CHOOSING IS ENTERING.** 4.4 made the doors thresholds, not previews — **so the enrolment write
lives at the environment, as the act of beginning.** Enterability is read from **4.4's door logic via
one exported predicate**, never re-derived (P5-R4). The write uses **the request-scoped client with
the student's own session — never the service role**, so the INSERT policy is genuinely exercised.
It is idempotent, initialises `environment_state` with **`position` NULL**, and is **a POST that
303s** — a form, so it works with JS off. **No write happens on a page view, in any state.**

**A VISIT IS NOT AN ENTRY.** Recency means *last explicit entry*, stated in one comment where the
value is written. **Therefore the shell's primary action becomes a POST** when it opens an
already-enrolled environment — same element, size, position and hierarchy; different semantics
because the act records something; the harness's "action resolves" gate is *updated, not deleted*.
Tradeoff to report: a POST button cannot be opened in a new tab the way a link can. **The count is
never displayed** — the field may be written and may feed 5.4's ordering, but it appears in no string.

**ONE REGISTRY, TWO SCOPES.** 5.3's slot map extends into the environment rather than being
duplicated: **scope shell** (cross-subject, built) and **scope environment** (the same capabilities,
scoped to one subject). A slot with no data **renders nothing** — never an empty box, never a heading
with nothing under it, never "coming soon". 3.6's honest labels stay as they are for a visitor and
resolve to the same statement for a student; **do not add a second copy of it.** Every student region
is gated by `src/config/modules`.

**WHAT IT MUST NOT BECOME:** nothing derived from counts, durations, streaks, scores, levels, ranks or
badges · no "progress at a glance", cards, equal-weight grids, feeds, notifications or
recommendations. Today a student inside an environment sees the environment, its honest structure,
and a way back. **If that feels thin, it is thin — nothing inside exists yet. The honest label is the
deliverable, not a fabricated surface.**

**ALSO EXPLICITLY OUT OF SCOPE: UNENROL.** What happens to a student's data when they leave is a
**retention decision that has not been made**, and DPDP obligations attach to it. An unenrol button
that silently orphans rows is worse than no button.

### The gate's entry point, and four carried rulings

**The Phase 5 gate recommended: the tutor–student assignment (roster) and its RLS policy** — *the first
fact that puts a person in the room* — filling the registry slot **`tutor-presence`**. **6.1 is that
step; the sequence is unchanged.**

**E-13 — SUBJECT STATUS STAYS IN TYPESCRIPT; SUBJECT IDENTITY MAY BE CHECKED IN THE DATABASE.** The
relationship references the subject's immutable `id` (locked, not config — so a `CHECK` of the six ids
is permitted). **Status (ready/draft/locked) may not be referenced by any policy or constraint, and is
never duplicated into the database — P5-R4 stands. If a policy would need status, the policy is wrong:
say what it was enforcing and report it.** E-13 closes as *identity checkable, status not.*

**E-14 — REPLACE THE MAGIC NUMBER.** An RLS fixture asserting `count(profiles) = 4` **fails on a change
rather than a regression** — the same class as the fixture-date defect. Derive the expectation from the
fixture's own manifest; assert invariants (*every row belongs to a test identity · no row belongs to a
non-test identity*), never cardinalities.

**E-23 — NO READER CLASS DEAD-ENDS.** Ruled now, **implemented as its own bounded fix (P5-R10) after
6.1's report and before 6.2** — 6.1 builds no interface. The environment page needs a truthful action or
an honest statement for every reader class: signed-out visitor · signed-in non-enrolled on an enterable
subject · signed-in non-enrolled on a non-enterable subject · enrolled. **Exactly one primary per view,
ENTRY language never outcomes (4.4), no "sign in to enter", the visitor's action leads to the canonical
choice, and no second primary for a reader who already has one.** Report the table: reader class →
action → destination → status code.

**E-07 — LEGAL, ESCALATED.** Privacy policy · terms · contact route · **DPDP Act 2023 including
children's data**. Phase 6 adds a capability for **an adult to read a minor's record**, so this moves
from *launch blocker* to **blocker on any real onboarding**.

### The Tutor Gate (Phase 6.6) — the pass that closes Phase 6

**Verification, not construction** — defect fixes only, no redesigns, no cuts, and **if the gate needs a
ruling, it stops and asks** (*two rulings already arrived mid-phase because evidence contradicted a
record; a third deserves the same treatment, not a decision made quietly inside a gate*).

**THE GATE'S SUBJECT IS THE ASYMMETRY.** Every product has one that is invisible from inside: **the
builder sees every surface; the user sees three destinations and a door.** Phase 6 built a shell, a lens
on one student, a control over a shared room, and an account page — each verified against its own brief.
**What no step checked is whether the SET is honest:** whether Scene 5's promise is what a tutor finds,
whether what a tutor can do is what the *student* would expect if they knew, and whether both roles'
surfaces tell a consistent story about the same facts. **And the question underneath it: a real tutor is
given access tomorrow — do they find something true, or nothing, and blame themselves?**

**THE PROMISE LEDGER** — Scene 5's claims verbatim against what Phase 6 built, three verdicts, both
directions. **AND THE SECOND LEDGER, which only this gate can produce:** *what the tutor can do, against
what the student would think if they knew.* A tutor can see where I am in my subject · can change how my
environment looks · **can see nothing else — not my other subjects, not my activity outside this one.**
**Any row that reads badly is the most important finding this gate can produce**, because it is the only
one no student can raise on their own and the one a builder is structurally least able to see.

**ALSO:** the tutor's journey read three times (first visit · walk · **second visit, where "nothing
changed" is the correct answer until Phase 7**) · **the identity matrix read as a set** — *a route that
must behave four ways for five reader classes is usually two routes wearing one address* · **the
inside/outside pass**, six questions including what an observer could learn by probing and **what the
product never says out loud** · the honesty audit extended to **30 categories** (adding role claims ·
capability reachability · blast radius · the co-teacher claim · money language · readiness-vs-secrecy ·
permission visibility · cross-role leakage) · **the cold-start pass** — clone, install, build, migrate,
seed, harness; timed, each step pasted, *because the recovery path has never been verified as a sequence* ·
the exceptions register with its count versus the Phase 5 count · **eight-plus deliberate breakages**, any
one of which no gate catches being the most valuable result · the matrix at twelve conditions · and **nine
phase-close questions**, ending with the Phase 7 entry point — **which already knows its first task
(`progress_record`), its reopened question (P6-R13's cohort), its sentence rule (`attend` vs `resume`) and
its write check (P6-R15's settling GET).**

### Four rulings from 6.4's close

**P6-R17 — A LIVE SURFACE WITH NO DOOR IS A DEFECT.** The shaping surface shipped reachable **only by
URL** — the inverse of a dead nav item: **a capability that effectively does not exist for its user.**
**Primary entry: one quiet link on the subject group in the shell** (the shell is organised by subject;
shaping belongs to the subject), whose weight may not exceed a relationship row's and which may not become
a second primary. **Contextual entry: the environment page, for a reader with an active relationship in
that subject** — a quiet link. **NOT on the relationship's surface** (*"shape this environment"* on a
student's page invites the reading P6-R10 forbids — shaping *for that student*).

**P6-R18 — THE VALIDATOR IS WIRED TO THE BUILD.** A validator that must be remembered will be skipped.
3.7's guarantee is that **the build fails on a bad configuration**, so `npm run build` runs it — a
`prebuild` script or equivalent, **proven through the npm path**, not the direct command.

**P6-R19 — A TUTOR MAY STAND IN THE ROOM THEY SHAPE.** 6.4 let a tutor shape a draft subject they could
not open — and **its link to the room 404s for that subject, a live link to a 404.** Ruled: **a reader
with an active relationship in a subject may view that subject's environment page**, draft or not,
**rendered as the visitor's rendering — identity, structure and honest labels only. No student regions, no
student data, no change to P6-R2.** Reasoning, in the record: **a draft flag is a readiness flag, not a
secrecy flag** (3.7's validator guarantees draft subjects cannot ship broken) · **5.3 already ruled that
an enrolled identity reaches a draft environment** · **a relationship is a door of its own** (P5-R4's
logic, extended from enrolment). **This REVISES 6.2's gate row** — *"tutor T denied student A's draft
door"* becomes *"tutor T is admitted to the draft environment's identity, and denied every student region
of it"* — **rewritten, never silently edited**, with matrix rows for every draft subject. **Second rule
revised by evidence in one phase (P6-R13 the first): the pattern is healthy; a silent revision is not.**

**P6-R20 — A DECLARED COST IS RECORDED, NOT HIDDEN.** The visitor environment's TTFB rose ≈120 ms for one
anon round trip where there was none. **Accepted as the price of P6-R10's "the same environment for
everyone."** Recorded in the baseline **as a declared cost with its cause**; re-measured with sample
counts and a discarded warm-up; the read issued **in parallel**, not sequentially. **No cross-request
caching unless a save invalidates it** — a stale room is worse than 120 ms. Phase 10: the first public
page that pays for a write-able setting.

### Ruling P6-R13 — 6.1's levers recommendation is SUPERSEDED, not overruled

**6.1 recommended `tutor_environment(tutor_id, subject_id, accent, atmosphere, motif, motion, density)`,
"rendered for a student only through an active relationship".** 6.4's preconditions caught the conflict
with P6-R10/R11/R12 and escalated instead of deciding. **Escalating was correct** — and the brief's *"if
the recommendation differs, build 6.1's"* was written for **taste** differences, not architectural ones.
**A conflict between a recommendation and a standing ruling is a ruling matter.**

**WHY IT IS PREMATURE RATHER THAN WRONG.** 6.1 answered *where do the settings live?* with *on the
relationship*, reasonable when the question was access. **The model is UNDERDETERMINED in two ways it
cannot resolve:**
1. **Two tutors, one student, one subject** — two active relationships, two candidate rooms, **no rule
   for choosing.** That is the ordinary state of an academy with more than one Physics tutor, not an edge
   case.
2. **The visitor** — a signed-out reader on `/subjects/physics` has no relationship, so **there is no
   defined room for them** on a route that must render the subject's identity (4.5).

**Both answers require a COHORT, and cohorts do not exist until Phase 7.**

**THE RULING:** the settings are **subject-keyed** (`environment_settings(subject_id, …)`) — one Physics,
every reader class byte-identical. **ACCENT IS NEVER A LEVER** (P6-R11 stands independently of scoping:
3.1's accent triad is the subject's *identity*, guarded by 3.7's ΔE check — a tutor choosing from a closed
enum still means *Physics has no colour, it has as many colours as tutors*). **IDENTITY LEVERS** (accent
triad, the mark, motif-as-identity) are immutable at every phase without a ruling; **CHARACTER LEVERS**
(atmosphere, motionChar, density, motif-as-texture if separable) stay adjustable, subject-keyed, from
authored validated sets. **Protected values stay protected:** the brand frame, the 16px floor, the focus
ring, the motion budget, reduced-motion parity.

**THE REOPENING CONDITION IS NAMED, so this is a deferral and not a closure:** when Phase 7 introduces
classes/cohorts, *which room does this student get* becomes answerable by their class, and **cohort-scoped
character levers reopen with a ruling.** Recorded in the exceptions register with that condition.

**TWO CONSEQUENCES, stated not stumbled into:** **(A) a tutor's shaping persists after their relationship
ends** — the values belong to the subject, not the tutor; a co-tutor can change them and revert-to-authored
always exists. *(Open user question: should shaping revert when the shaping tutor leaves? Nothing blocks
on it.)* **(B) write eligibility is still relationship-bound** — persistence is subject-scoped, permission
is not.

### The Levers (Phase 6.4) — a tutor shapes an environment

**The first surface where a person changes something for other people — writing into a space students,
including minors, spend time in.** Scene 5 promised it; Phase 3 defined the five levers; this is the
mechanism. **And it is where the visual system could quietly fork.**

**THE TEMPTATION IS A THEME EDITOR** — sliders, a colour picker, a live "make it yours" preview. **Every
part is wrong, and not for taste:** a colour picker breaks **2.6's brand frame** (identical in every
environment) and **3.7's validator** (contrast, ΔE and focus rings are guaranteed at build time — a
runtime free colour has no gate at all) and **the brand promise itself** (*choosing a subject changes
the environment* — if a tutor can make Physics look like History, the choice stops meaning anything).
**The second temptation is worse: per-student.** *"Shape it for this student"* turns a shared environment
into an instrument — **the student who gets the dimmed version knows exactly what that means.**

**RULING P6-R10 — A TUTOR SHAPES THE ENVIRONMENT, NEVER THE STUDENT.** The environment belongs to the
subject: not to a student, not to a relationship, not to a tutor. **No per-student settings, overrides,
variants, profiles, themes, flags or exceptions — in the model, the policies, the API or the output.**
Proven **structurally** (the DDL has no student-scoped key), **by attack** (a compile-time attempt to
scope settings to a student must not typecheck), and **at the surface: five reader classes render a
byte-identical environment.** A tutor's choice applies to **everyone in that subject, including students
they do not teach** — stated in plain words before saving. **No student-facing notice, no changelog** —
a changelog turns pedagogy into customisation.

**RULING P6-R11 — THE LEVERS ARE CHOSEN, NOT AUTHORED.** A tutor selects among **authored, validated**
values and never authors one. **The accent triad is not a lever a tutor turns** — nor the mark, the brand
frame, type, the motion grammar or the spacing scale. **A lever with one authored value is not adjustable
and must not be presented as such** (3.7's declared-but-inert rule; a control that changes nothing is the
same defect as a nav item that leads nowhere). **The validator enumerates COMBINATIONS per subject** —
contrast, ΔE, focus ring and reduced-motion parity are properties of a combination, not a lever — and
**fails the build on any failing one.**

**RULING P6-R12 — ONE ENVIRONMENT, AND THE SURFACE SAYS SO.** One Physics; every student in it is in the
same room. **The blast radius sits beside the control in plain words**, the surface names a co-teaching
tutor where one exists, and **revert to the authored default is always available** (safe by construction —
the default is authored and validated). **Absence means the authored default, and that is not an
inference**: this is the one place in the product where a missing row legitimately means a real value,
*because the default exists by design* — contrast P5-R6's never-emit-a-zero, where absence meant *we do
not know*. **The write is 5.5's shape** — POST → 303, idempotent, no write on GET or prefetch,
request-scoped client, never the service role. **The environment is the only renderer**; a preview is
permitted only if it renders through the environment's own components with no parallel styling path
*and* a test asserts the two markups are identical.

### Three standing rules from 6.2/6.3

**RULING P6-R7 — A BOUNDARY PROVEN BY ATTACK SHIPS WITH THE ATTACK AS A PERMANENT FAILING TEST.** 6.2's
two attacks fail `tsc` (TS2554, TS2353x2) — structurally impossible, not merely unused. **But a
demonstration is not a gate:** if a reader's signature changes, the attack compiles and nobody notices.
**The harness asserts that the attack files do not compile, with the expected error codes, and fails
loudly if they ever do.** A boundary is proven **at the layer where it can fail**, and each layer needs
its own permanent gate: **SIGNATURE** (the compile-time attacks) · **POLICY** (the RLS assertions) ·
**ROUTE** (the identity matrix). Neither substitutes for another.

**RULING P6-R8 — AN ENTRY NAMES A PHASE. THE REGISTRY IS NOT A WISH LIST.** It answers *is this built?*
and *what does this surface depend on?* **An entry with no phase that delivers it is not a capability.**
`payments` and `tests` appear in no phase of P1–P10, so **neither may render as a planned capability on
any surface** — the phase that delivers one adds the entry that day. **MONEY LANGUAGE IS BANNED
ABSOLUTELY UNTIL THE USER RULES:** no earnings, payments, payouts, money, fees, billing, subscription,
pricing, invoicing, in any string on any surface. **The business-model question — does the academy handle
money in-product at all? — is the user's, not the agent's**, and until they answer, **the absence is the
product's position.** *(From 6.2's finding: the `PORTAL_META` blurbs rendered **to visitors** on `/login`
and `/register` at ≥1024px — a promise that tutors get paid was on the public front door.)*

**RULING P6-R9 — AN ABSENT RELATIONSHIP IS INDISTINGUISHABLE FROM A STUDENT WHO DOES NOT EXIST.** A URL
naming a student the reader has no relationship with returns **exactly** what a URL naming nobody
returns — same status, same page, same words, **byte-identical**. Not 403, not "no relationship", not
"you don't have access": **a distinguishable refusal is a probe.** **An ended relationship renders the
same way**, with the cost named honestly — the tutor's own arrangements belong on **a surface about the
relationship**, not on a page that must not answer existence questions. One code path, three inputs,
identical response.

### Two standing rules from 6.2

**RULING P6-R5 — NO CLAIM SURVIVES THE PHASE IT WAS WRITTEN IN.** Three strings on `/tutor` are stale —
`sessions, rosters, grading and earnings` · `Teach, schedule, assess and get paid.` · *"the next build
drops it into this exact shell"*. **They are false claims, not design decisions**, and two name
capabilities the roadmap does not contain. **DO-NOT-CHANGE protected the registry's entries; it was
never a shield for copy that has since become untrue.** Sweep the class (`PORTAL_META.*` for all three
portals, `NotBuiltYet`, Phase-1 placeholders), report each string's **audience**, claim and verdict, and
rewrite only what is false — **already-true copy does not move.** Rules: true today · nothing named that
the registry does not declare built · **no promise about a future build** (the same shape as 5.6's
banned *"we'll keep track as you go"*) · 4.1's voice · no management-console vocabulary. **A payment
claim is not merely untrue copy** — *"get paid"* implies a commercial relationship with tutors this
product has not defined, and possibly a regulated one: **no earnings, payments, payouts or money
language, at any phase, until a ruling.** Rewrites are correction events in the baseline; **if one would
change the homepage, stop and report.**

**RULING P6-R6 — THE HARNESS'S IDENTITY AXIS IS STANDING.** A tutor was admitted to a student's draft
door and **no harness saw it, because no harness signs in as a tutor.** The harnesses covered
states x viewports x themes; **the reader class was not a dimension.** It becomes one, permanently:
**one shared identity set** (*visitor · expired session · student A · student B · tutor T, related to A
in one subject only · tutor U, related to nobody · admin, no account exists — recorded as an absence*),
**routes x reader classes with expected outcomes committed and diffed like a baseline**, **a coverage
gate that fails when a route exists in the app but is absent from the matrix** (*the defect was not a
wrong expectation — it was a reader class nobody tested*), **every new route and region adding its row
in the same step that adds it**, and **related and unrelated both exercised — testing one tutor is
insufficient.** The tutor defect becomes a named regression row: **tutor T is denied student A's draft
door.** Its status changes from *found by a human* to **caught by a gate.**

### Phase 6 — The tutor, and the boundary

**The tutor is the first role in this product that sees another person's data** — very often a
minor's, rendered to an adult who is not their guardian. **That is a DPDP question before it is a
design question**, and it is why Phase 6 opens with an architecture step rather than a dashboard.
**Boundary first; the screen that lives inside it comes after.**

**RULING P6-R1 — THE RELATIONSHIP IS THE UNIT.** A tutor does not "have students". There is a
relationship between **a tutor, a student, and a subject** — scoped, explicit, revocable. **Not a flag
on a student, not a list on a tutor.** Every access question is answered by *"does a relationship
exist, for this subject"* and by nothing else. **No relationship exists by default; none is inferred;
nothing creates one by browsing.** The relationship has a state and a beginning, and **its end is a
real state — not a delete**. Scene 5 drew a relationship rather than a roster; **the model must make
that true structurally rather than by discipline.**

**RULING P6-R2 — A TUTOR SEES WHAT THE RELATIONSHIP IS FOR, AND NOTHING ELSE.** May see: where the
student is (the arc) · the learning events in that subject · how to address them. **May never see:**
another subject's events · anything about a non-related student (not even an unnamed one) · behavioural
data (absent by design) · **any aggregate across students — no average, ranking, percentile or
distribution** · **any export, bulk download or third-party access** · contact details or account
state. **Absence of a record is not a signal about the student** — never-emit-a-zero holds here more
strongly, **because the reader is a person whose judgment about a child is part of the harm.**
**Enforcement is RLS over the relationship; an application filter is a convenience, the policy is the
boundary.** The default is a recommendation and the user's to change — **what matters is that changing
it is a policy edit, never a schema rewrite** (5.6's deferral, come due).

**RULING P6-R3 — THE TUTOR SPACE IS NOT A MANAGEMENT CONSOLE.** Banned: students as a count, pipeline
or list to work through · progress columns and sortable tables · **"students needing attention" and
anything auto-ordered by software — a tutor's judgment may be assisted, it may not be automated into a
verdict about a child** · alerts, triage queues, at-risk flags · engagement metrics (*sessions,
minutes, "last seen" — they do not exist and must not be added for the tutor's benefit*) · **any
comparison between students, including inverted ones** ("most improved", "needs help"). The tutor's
space is their subjects, their relationships, and the record within each, with the next act obvious and
nothing judged. **Today it is mostly empty — which is correct, and gets the same honest treatment the
student's got.**

**The brass lightness change (P5-R9): KEPT.** Lightness-only tuning for contrast is the one operation
2.1 licenses, and it fixed a live AA failure at the source. But a global token shift is a design change
even at one hex — **so report where brass-700 is used in non-text roles, whether the shift is visible
as a change in the seal's character, and the ΔE against the brand spec.** If the value is doing both
text and ornament duty, **a role split is pre-authorised** (new value must keep the hue and stay inside
the locked ΔE tolerance) in preference to a global shift.

### The Student Gate (Phase 5.8) — the pass that closes Phase 5

**Verification, not construction.** Defect fixes only, no redesigns, no surface cut, no new copy
beyond defects — and **if the gate needs a ruling, it stops and asks**, because a gate that quietly
makes policy cannot be trusted. **A gate that runs on a known-broken build proves nothing about the
build**, so P5-R9 closes first.

**THE GATE'S SUBJECT IS THE SEAM.** Phase 4 built a homepage whose job is a *decision* and whose
honesty is structural; Phase 5 built a student space whose job is *momentum*. **No one has yet read
the two halves as one experience** — and the seam is where this product is most likely to be
dishonest, because it is the only place where one phase's promise meets another phase's delivery.
*A homepage saying six environments above a door that opens one. A promise map naming LEARN above a
space with no lessons. A brand saying choosing changes the environment above an environment that
changed its accent.* **Each is defensible in a step report and indefensible in a student's hands.**

**THE PROMISE LEDGER — the central deliverable.** Every homepage claim about what happens after
choosing, verbatim and scene-attributed, against what the student space actually does. **Exactly three
verdicts: DELIVERED · DECLARED DISTANCE (the homepage's own honesty treatment names the gap, and the
student space does not contradict it) · CONTRADICTION — a defect, fixed here by correcting the wrong
half, never by weakening the honesty treatment.** Run it in **both** directions, and include the rows
that pass. **Then the second ledger: what the student space promises, against what it delivers — and
what a student finds if they come back in a week.** A promise about a future the product is not making
real is a finding.

**THE JOURNEY, READ THREE TIMES.** First visit (stranger, from `/`, timed, with **every dead end
recorded and its honesty judged — one enterable subject is a dead end five times over, and the honest
label is what makes that acceptable**) · second visit (the returning student — **the phase's actual
subject: what differs, and is it the right difference**) · fast skim (**every surface answers "what
now" in under three seconds**, 5.1's rule). Plus **the adversarial read**: every moment a student
would feel *managed* — nudged, counted, judged, or addressed by a product that thinks it knows them.

**ALSO IN THE GATE:** the states read as a set (one primary each, and all three recognisable as one
place) · the CTA chain across homepage → shell → environment → auth (one primary visible, no two
consecutive surfaces asking different things, the engine's vocabulary reconciled with the surfaces')
· **the honesty audit extended to 22 categories** (4.9's eleven plus counts · zeros · ratios ·
celebration · the subject rule · unknown-as-verdict · failure-as-absence · traceability ·
progress-that-instructs · promises about the future · the ordinary-student test), with **the audit's
own limits named** · **the mobile pass** at 390 on the *8pm profile* (400ms, 1.6Mbps, cold cache,
**dark theme as primary** — that is what 8pm looks like), mid-range Android plus a 4× throttle, LCP
with variance and a discarded warm-up, and the mobile page-total pin · **the consolidated
declared-exceptions register** with a count — *a rising count is a finding* · **the harness
trustworthiness pass**: six-plus deliberate breakages, each caught by a named gate, **and any breakage
no gate catches reported as a missing gate and added** · **the matrix** (states × twelve conditions,
every cell filled or its reason stated) · and **the phase-close verdict**, eight questions, ending
with the recommended **Phase 6 entry point** and a written confirmation that **real authentication was
built without opening the doors — zero rows belonging to non-test identities, pasted.**

### The Progress Language (Phase 5.6) — a record, not a score

> **RULING P5-R6.** Everything here is a consequence of it.

**PROGRESS IS EVENTS.** The model records what happened, when, referring to a real object — attended
this session · watched this recording · submitted this work. **It never records a summary of events.**
No `percentComplete`, no `masteryLevel`, no `streakDays`, **no stored derived field in any table**, not
even "for performance".

**COUNTS ARE REFERENCES. RATIOS ARE CLAIMS.** *"Eight sessions"* points at eight real rows the student
can open. *"60% complete"* asserts a structure — and **the denominator would be invented by us.**
Ratios are banned until the denominator is a real, named, bounded, per-environment structure the
student could enumerate; when it exists (P7/P8), **per-environment only, named on screen, derived and
never stored.** A global progress figure is **banned permanently, at every phase.**

**NEVER EMIT A ZERO.** An empty record means *we have nothing recorded* — not *you have done nothing*.
**"0 sessions attended" is a claim about a child in a product that does not yet measure attendance.**
Where the record is empty, say nothing, or say only what the record supports.

**NO COMPOSITES** — combining attendance, recordings and submissions into one figure is a judgment
about what learning is, wrong for someone, unfalsifiable to them. **NO CROSS-SUBJECT FIGURES** — no
global number, no subject ranking, ever, for anyone. **BACKWARD-LOOKING ONLY** — no pace, no "on
track", no "behind", no forecast. **NO COMPARISON** — no peers, cohort, average or percentile; the
student is compared to nothing, not even their own past for judging them. **NOTHING IS EVER
CELEBRATED** — no milestones, no confetti, no "your first session, well done"; **events render
uniformly**, and an event is never emphasised for being a first, a tenth or a comeback. **NO GUILT** —
nothing in a student's own record reads as an accusation. **TRACEABLE, ALWAYS** — if a figure cannot
name the rows behind it, it does not render. **PROGRESS NEVER GIVES AN INSTRUCTION** — the engine
instructs, the record orients, and **no progress surface carries a CTA, ever**.

**THE ONE VISIBLE THING is the arc, continued.** 4.7 shipped the visitor's map with DISCOVER → CHOOSE
→ ENTER genuinely complete; **the student's version is that same map, one step further along**, honest
for the same reason. Same seven steps and names (no drift with the homepage), **reusing 4.7's
vocabulary — not its Stage treatment**: Room rules, compact, no animation. **IT IS NOT A STEPPER** —
no segments, no filled/empty boxes, no "n of 7"; *a seven-segment display is a percentage with extra
steps.* Later steps are **ahead**, never locked or incomplete, gaining texture only when their
capability is registry-gated live and real events exist. No CTA, no link, not interactive, renders
nothing when it has nothing. **If a reader feels praised, it has failed.**

**THE MODEL IS NOT AN ANALYTICS TABLE.** Not a page view, click, session length, device, IP or
location — a record of learning events, not behaviour, stated in a comment on the table. **Absence of
record is not absence of activity**: no backfill, no defaults, no inference, and a student with an
empty record renders identically whether they joined on day one or yesterday. **Malformed is not
missing** (P5-R4 Addendum 1). **DPDP:** personal data about minors — no export, aggregation, sharing
or third-party access; **what a TUTOR may see is a P6 question**, and the model is shaped so it stays
a policy decision rather than a schema rewrite. **PROGRESS is a stage name, not a feature** — say so
in the document, so nobody later reads it as a requirement to build a progress UI.

### The Tutor Shell (Phase 6.2) — the first surface that shows one person another's learning

**P6-R2 is not a guideline here; it is the ceiling — and the shell must be structurally incapable of
crossing it, not merely careful.**

**RULING P6-R4 — WHEN THERE IS NO NEXT ACT, THE SURFACE SAYS SO.** 5.1's three-second rule asks what a
tutor should do next; **today the honest answer is "nothing yet", and that is still an answer.** No
invented CTA, no disabled control, no dead end with nothing in it — **a statement, in the voice, with
the reason named as fact rather than apology.** The three-second test counts as passed when the reader
knows there is nothing to do *and why*. *The student's State A was the same problem and the same
answer.*

**THE SUBJECT IS THE TOP-LEVEL UNIT; RELATIONSHIPS LIVE WITHIN IT.** A tutor with three students in
Physics and one in History sees **two subjects**, never a flat list of students. **P6-R1 expressed
structurally: a cross-subject view is not banned, it is unrepresentable.**

**A ROW CARRIES THE RELATIONSHIP AND NOTHING EVALUATIVE** — display name and subject, and that is all.
No progress indicator, no arc position, no recency, no last-seen, no counts, no status dot, no colour.
**The arc is permitted to a tutor and NOT permitted on a row:** on the row it becomes a column, and *a
column of arc positions is a leaderboard with the numbers filed off.* It belongs on the relationship's
own surface (6.3), read as a journey rather than scanned as a comparison. **Ordering is fixed and
non-evaluative** — alphabetical within subject or by relationship start — and ordering by any activity
proxy is a defect.

**THE SHELL CANNOT REACH WHAT THE POLICY FORBIDS.** Its data access goes through the
relationship-scoped reader only, and it must be **proven twice**: structurally (paste the imports; show
no other table can be named) and **by attack** (attempt to render a non-related student's name and a
related student's other subject *through the shell's own code path* — both impossible).

**Today the origin state is the only reachable production state**, because nothing can create a
relationship yet. **State C — relationships with events — cannot be reached at all**, because learning
events do not exist. Build the composition so it holds, verify it with labelled fixtures, and **write
the distance down rather than implying it.**

### The Student Shell (Phase 5.3) — orientation, not accounting

**The first screen a student opens on purpose.** Everything before it was something they were
shown; this is something they return to.

**ONE ANSWER FIRST.** The shell opens with a single dominant surface answering *what now*. Not a
welcome header plus a grid of equal cards, not a stat row. **One element clearly wins** in size,
position and contrast; everything else is visibly quieter. *Test: at 390×844, if two elements
compete for first attention, it has failed.*

**MOBILE-FIRST BUDGETS — desktop is the derived case.** From Phase 5 on, the phone is the primary
surface. A student checking what's next is on a phone. Design and budget at 390px; performance
budgeted on a **mid-range Android**, not a desktop. The primary answer must be reachable **without
scrolling** at 390×844.

**DESIGNED FOR ITS EVENTUAL CONTENTS, NOT TODAY'S.** At Phase 9 the shell holds classes,
recordings, resources, progress, AI. **Define where each lives now.** Every slot **renders nothing
until it has real data — and never renders as an empty box.** No skeletons, no shimmer, no "coming
soon", no grey placeholder panels. Verified at zero slots, some, and all.

**THREE NULL STATES, ALL DESIGNED — and the middle one is the one people forget:**

| State | What it is | Frequency |
|---|---|---|
| **A — No enrolment** | chose nothing yet | most new accounts |
| **B — Enrolled, never entered** | chose, hasn't opened it | **most common signed-up state** |
| **C — Enrolled, active** | has real `environment_state` | the goal state |

**B is the highest-risk state** — chose and never started is the student most likely to churn, and
it is usually treated as "empty" when it is actually *ready*. **B must be the most inviting of the
three.** A is not a dead end; it routes to the choice.

**THE RESUME SURFACE TELLS THE TRUTH ABOUT POSITION.** `environment_state` may hold a **null
position** — there is genuinely nothing inside an environment to be *at* yet. *"You were last in
Physics — The Field, yesterday"* is true. *"Pick up at Chapter 4"* is fabrication. The action is
**open the environment**, because that is the real action.

**The shell never contains:** stat cards · metric grids · streak, XP, level, badge, leaderboard,
points · notification bell or unread count · "recommended for you" · invented activity or
fabricated momentum · skeletons on empty states · scenic empty-state illustration · more than one
primary CTA · dead nav items. **Today the IA is three destinations** — shell, subject workspace,
account — because nothing else resolves.

### Phase 5 substrate ruling (P5-R1) — `prompts/phase-5-step-01-substrate-ruling.md`

**Attach to 5.1. Wins over the 5.1 brief where they differ.** Locked: **Supabase** — Auth for
identity/sessions, Postgres for data, **RLS as the enforcement point** (an application check is a
convenience; the policy is the boundary). Permitted deps this step: `@supabase/supabase-js`,
`@supabase/ssr`. "No new dependencies" means *nothing outside the locked stack* — it was never a
freeze on the architecture. **`git init` + a pre-Phase-5 baseline commit BEFORE any 5.1 code.**
Credentials in three tiers (hosted / local Supabase / none) — **Tier 3 means auth is UNVERIFIED and
5.3 stays blocked**; mocking auth and calling it verified is forbidden. **Route root: `/student`
stands** (existing route, in `PORTAL_IDS`; no `/learn`). Two audits added: **A** — the installed
dependency set does not match a certified Phases 2–4 (report how motion and the ambient layer were
really implemented) · **B** — what survived the sandbox reset. Legal: build the mechanism, do not
open it — **Phase 5 onboards test accounts only.**

### The credential gate — what only the user can do

**Phase 5 has a hard dependency that is not a design decision and not code.** The Supabase project,
its three env vars, the migration run, and the Auth URL configuration are **user actions**, and no
prompt can substitute for them. Runbook: `phase-5-supabase-setup.md`.

**The agent's refusal to proceed is correct behaviour, not a blocker to argue with.** Twice it has
declined to build the student shell against an identity nobody can sign in as. That is the discipline
that has held across four phases. **Tier 3 is a real state, and the honest response to it is
UNVERIFIED — never a mock, never a stub session, never "complete pending credentials".**

**P5-R1 Part 7 stands: Phase 5 onboards test accounts only.** Real auth means real accounts; the DPDP
Act 2023 obligations (children's data included) begin the moment a real person's data enters that
database. The privacy policy, terms and contact route remain launch blockers, and remain the user's.

### The Whole-Page Pass (Phase 4.9) — the gate that closes Phase 4

Nine scenes built across eight steps, each verified in isolation. **Nobody has checked the seams.**
This gate targets exactly what per-scene verification cannot see.

**1. Cross-scene drift.** Eight independent judgement calls about accent usage, spacing rhythm,
heading structure, and the honesty treatment applied in six different scenes. *This is where
"coherent in parts, incoherent as a whole" lives.*

**2. Cumulative budgets.** Six of nine scenes carry subject scopes. Per-scene costs were reported;
**the total never was.** The page can be fine per-scene and over the ceiling in aggregate.

**3. Two untested failure modes.** One-shot reveals are correct by design — but:
- **The second pass:** scroll it twice. Does the page stay coherent, or is it a series of
  already-fired reveals? A page that is beautiful once and broken on the second scroll is a
  **defect**, not a style choice.
- **The fast skim:** flick through at speed. Do reveals stack up badly? Does the sticky scene
  release cleanly? Cinematic pages are routinely beautiful at reading speed and broken at skim
  speed.

**4. The arc, read end to end.** Pairs were checked; the whole journey never was — including
whether **the same claim landed three times** across scenes written weeks apart.

**5. The CTA hierarchy as a set.** Four scenes contain actions (0, 3, 4, 8). Each verified its own;
nobody checked whether they compete. **Exactly one `primary` must be visible at any scroll
position** across the entire page.

**6. Nine scenes on a phone.** Each scene's mobile behaviour was verified individually; nine in
sequence on a 390px screen is a different experience — measured in **screens of scroll**.

**Gate mechanics:** defect fixes only, **no redesigns** · **no scene may be cut here** (a scene
that shouldn't exist is a recommendation with evidence) · deliberate-failure proof required ·
updated baseline with a verified re-run command · and a plain answer to one question:
**is `/` ready to be the front door?** *A gate that can only return "certified" is not a gate.*

### Standing gate — the re-skin validation (Phase 3.7)

Six subjects × primitives × both themes × both densities × four tiers is a combinatorial
surface nobody holds in their head. So it is checked **by machine** and recorded as a
**committed baseline** with a one-command re-run, re-checked after every future phase.

The gate covers: brand-frame invariance · validator + guard test + draft guard · motif
determinism and budgets · the five levers confirmed **live, not inert** · contrast · focus
rings · reduced motion · keyboard · screen reader · zoom · text spacing · touch targets ·
axe/Lighthouse · route and bundle performance · resource hygiene · no-JS · no-WebGL ·
hydration · plus an honesty audit and a consolidated deferred register.

**Rule: fix defects now. Anything unfixable is recorded with a reason and a destination
phase. There is no "known issue" limbo.**
Accents are validated at build time for contrast, for separation from brass and
signal teal, and for **mutual distinctness** (all six appear together on the switcher).

**Phase 4 — Homepage Storytelling**
*(unlocks once Phase 3 is certified. The homepage's signature moment — the subject
transition — already exists, so Phase 4 assembles rather than invents.)*

- [x] Step 1 — Narrative spine + section contract → `phase-4-step-01-narrative-spine.md`
- [x] Step 2 — Scene 0: Arrival (hero) → `phase-4-step-02-arrival.md`
- [x] Step 3 — Scenes 1–2: Premise + Difference → `phase-4-step-03-premise-difference.md`
- [x] Step 4 — Scene 3: The Choice (the pivot — six doors) → `phase-4-step-04-the-choice.md`
- [x] Step 5 — Scene 4: Enter (the crossing) → `phase-4-step-05-enter.md`
- [x] Step 6 — Scenes 5–6: People + Practice → `phase-4-step-06-people-practice.md`
- [x] Step 7 — Scene 7: The Promise → `phase-4-step-07-promise.md`
- [x] Step 8 — Scene 8: The Return + footer → `phase-4-step-08-return-footer.md`
- [x] Step 9 — The whole-page pass (closes Phase 4) → `phase-4-step-09-whole-page-pass.md`

*(Each step authors one or two scenes. `/` is live from Step 4.1 and improves visibly step by
step — never broken, never half-built.)*

*(Step 6 split: Promise moves to its own step. It is the emotional payoff immediately before the
CTA and carries a different honesty problem from People and Practice.)*

**Phase 5 — Student Experience**
*(The shift from a page people read to a place people return to. The homepage's job is a
**decision**; the student space's job is **momentum** — a different design problem.)*

> **STATUS 2026-09-28 (rev 5): AUTH VERIFIED on the live Supabase project. Step 5.3 is BUILT.**
> P5-R1 executed. `git init` + baseline commit **`1b5d6a2`**; 5.1 executed and reported — commit
> **`a0d82dd`**: data model, roles, permission matrix as RLS policies, visitor->student boundary,
> momentum principle, real-vs-unbuilt map, student-shell contract, `/student` protected.
> **Migration applied via psql; `scripts/test-rls.sh` -> 20/20 assertions against the LIVE database
> (rolled back).** Sign-up, session cookie, cross-tab persistence, sign-out and bad-password
> rejection all verified through the real login form in a browser.
> **Step 5.3 passes:** `/student` per P5-R1, NavShell Room mode, one h1, h1-to-next-text ratio 2.24,
> one primary, 42/42 harness gates at 390px, 10/10 boundary checks, axe 0 violations, contrast floor
> 7.18, Lighthouse 95 on mid-range Android, no WebGL.
> **DECLARED EXCEPTIONS, all accepted:** (1) an ENROLLED identity reaches a DRAFT environment while
> visitors still 404 — the shell brief's own decision, verified both ways; (2) NavShell gained an
> `account` prop; (3) tutor/admin layouts gained the 5.1 role check after a student was found
> reaching `/tutor`; (4) **State A does not close the loop** — `/subjects` cannot enrol anyone yet,
> so following the shell's only action returns the student to State A. **That is 5.5's entry write,
> explicitly forbidden from being faked with an enrol button** (P5-R2).
> **P5-R2 CLOSED — commit `2104175`.** The entry count is off the screen (field stays in the data
> model) · the 2.6 brand link's hit area is 44x44 at 320/390 (246x44 at 1280) via padding plus a
> compensating negative margin, mark still 28x28 at the same pixel position, `page.cjs --check`
> **8/8 with no diffs** · `audit/permissions.cjs` **9/9**, authorization recorded in
> `audit/baseline.json`, checks server-side (`await requireIdentity(role)`) · `test-account.mjs`
> refuses any address that is not `*@test.<name>.invalid` and exits on production.
> **THE FOLD CLAIM IS WITHDRAWN AND REPLACED.** "844px, nothing below the fold in any state" held
> only at 390x844. Corrected statement, now the standard: **the primary action is above the fold at
> every viewport tested** (worst case bottom 493px under WCAG 1.4.12 text spacing); the document may
> scroll. B/C scroll at 320x568 (762/912px), at 360x640, at 200% zoom, and four-subject C reaches
> 844px at 1280x800. The DOM sweep for fixed/max heights, vh/svh, or clipped overflow returned
> **empty in every case — the page grows, nothing is compressed.**
> **Node 22+ is the deploy requirement** (`package.json#engines`, `.nvmrc`). `/student` LCP 2.9s,
> `redirectCount 0`; TTFB ~420ms is a per-request `auth.getUser()` round trip.
> **P5-R3 CLOSED — commit `f813d98`** (report `PHASE5_R3_CORRECTION_REPORT.md`, decision DEC-005).
> **Availability sweep: 16 strings across A/B/C, rows, nav, account and metadata. ONE was false.**
> State A's "Six environments are open" (one `ready`, five `draft`; non-enrolled -> 404) is now
> **"Choosing is where this begins."** The CTA "See the six subjects" stands, because it describes
> what `/subjects` actually gives. Everything else verified true.
> **Middleware measured, not guessed:** the matcher covers `/`, but `/` TTFB median **7 ms** and
> `getUser()` with no session **makes no network call**. Homepage LCP 2.4s vs the 4.9 baseline's 2.3s
> — within noise. **No fast path added; nothing optimised that the baseline cannot see.** The
> ~420ms `getUser()` cost is on SIGNED-IN requests only, logged for Phase 10.
> **The fold gate is replaced, not loosened.** The false assertion is deleted; the named gate is now
> **PRIMARY ACTION ABOVE THE FOLD** at 320x568 / 360x640 / 390x844 / 1280x800 / 200% zoom / WCAG
> 1.4.12 text spacing. Worst measured action bottom: **493px** (State B, text spacing). State C with
> FOUR enrolments reports identical numbers to C — subject rows do not move the action. `--check`
> reproduces Cx4 via a persistent fourth test account (`student-d`).
> **State A still does not close the loop** — 5.5 owns the enrolment write. No button, no note.
>
> **STATUS 2026-09-29 (rev 6): 5.5 and 5.6 are BUILT. 5.6 committed `af00b3b`.**
> 5.5 delivered the entry write (*choosing is entering*), the one-predicate rule (P5-R4), and
> role-scoped regions in one environment (P5-R5). 5.6 delivered `docs/PROGRESS_LANGUAGE.md`, the pure
> computation module (`src/lib/progress`, exports exactly validateEvents, admissibleKinds,
> countByKind, latestEvent, arcPosition, STEP_EVIDENCE, EVENT_KINDS, EVENT_KIND_MODULE — 16 tests
> proving no ratio/composite/prediction is expressible), and the arc region inside the environment,
> **sharing one seven-step definition with Scene 7 (`src/config/arc.ts`) so the homepage and the
> environment cannot drift. Homepage DOM hash unchanged.**
> **`progress_record` DOES NOT EXIST** — 5.1 created only profiles, enrolments, environment_state.
> Ruled correct, not a defect: the table references real objects, and none exist. `ProgressEvent` is
> the type; the DDL is a proposal; every production caller passes `events: []` — **absence, never
> inference.** Creating the table is **Phase 7's first task.**
> **THE SUBJECT RULE** (from 5.6's boundary copy, now standing): in any sentence about a limitation,
> absence or failure, **the grammatical subject is the product or the environment, never the
> student.** *"Nothing in this environment records anything so far"* &#10003; · *"you haven't done
> anything yet"* &#10007;.
> **Also ruled:** the Phase-2 `ui/progress.tsx` primitive is **permitted only where the denominator is
> real and simultaneous** (an operation in flight) and **forbidden for a person's learning over time**
> · **MASTER is a direction, not a state to complete** — it gains no evidence rule at any phase
> without a ruling, and the default answer is that it never gains one · fixture dates that drift with
> the calendar must be stamped at run time, not pinned (**a test that fails on a date rather than a
> regression is not a test**) · **P7 engine note:** `attend` (happening now) and `resume` (last done)
> claim different things and must not share a sentence.
>
> **STATUS 2026-09-29 (rev 7): 5.7 BUILT — commit `bbc77d3`, tree clean.** Harness state: page 8/8 ·
> shell 57/57 · environment 22/22 · permissions 9/9 · **states 38/38 (new)** · progress 16/16 ·
> next-action 34/34. `docs/STATE_LANGUAGE.md` (23-row inventory), DEC-010.
> **THE FINDING OF THE STEP:** `data.ts` **swallowed every DB error into "no rows"** — so a failure
> rendered "no enrolments", offered *Begin* to an enrolled student, and 404'd a student's own draft.
> **A swallowed error becomes a fabricated state.** Ruled as P5-R9 and swept repo-wide.
> Also: only the Phase-1 404 existed (and it was **a second homepage**), **zero loading states exist in
> the codebase** (P5-R8.8's prediction confirmed empirically), forms leaked raw driver messages, and
> Begin returned `text/plain` 500s. All fixed. `src/lib/state/isolate.ts` is now the ONE isolation
> pattern, shared by 5.4's providers and the regions. Payload +18KB/route for two dumb boundaries; a
> nav-shell version costing +43KB was **withdrawn**.
> **FRAMEWORK DEPENDENCY, RECORDED NOT ACCEPTED:** Next 16.3.6 renders `notFound()` pages and error
> boundaries **client-side** (vercel/next.js#99287), so PAGE-level states are blank without JS. **Not
> worked around** — a workaround would change the 404 behaviour. Pinned as a FLIP ALARM.
> **Auth chrome:** the sign-in result line left the 5.1 Alert panel (verdict title, 4.21:1 body) for a
> plain `role="alert"` beside the control. **The remaining 26 contrast hits are a live WCAG failure**
> and are fixed at the token level, lightness only.
> **Recorded, not fixed:** `audit/*.cjs` sits outside `npm run lint`, so harness code is unlinted
> (Phase 10). The harness is the load-bearing evidence for every gate.

**P5-R4 addenda (settled during 5.4, carried into 5.5):**

1. **ABSENCE OF DATA MAY REDUCE WHAT THE ANSWER SAYS; IT MAY NEVER CHANGE WHETHER THE STUDENT HAS AN
   ANSWER.** A null `enrolledAt` must not turn an enrolled student's answer into "choose" — that
   would make missing data look like missing enrolment. Silence in the *detail* line; never silence
   in the *surface*. **Malformed data is different from missing data: malformed is a defect, missing
   is a state.** Treat them differently everywhere.
2. **REGISTRY RECONCILIATION (5.5, small, honesty-critical).** 5.4's providers gate on
   `public-website` because it is the only `live` module — while `student-portal` stays `planned`,
   **though the shell and the engine both exist and are live. The registry is now UNDERSTATING what is
   built.** 4.1's rule cuts both ways: nothing may claim a capability the registry does not declare
   built, **and the registry must not deny a capability that exists.** An understated registry makes
   the honest labels lie in the safe direction, which is still lying.
3. **LCP variance: noted, not chased.** Bimodal 2.1s (x3) / 2.9-3.0s (x6) on the *same* build.
   Recorded in the harness as a noted variance with sample counts, **not as a gate value**; re-measure
   after 5.5 with a discarded warm-up; log for Phase 10 if still bimodal.
4. **No second worktree in this sandbox.** The 2 GB limit locked up while copying `node_modules` for
   an old-commit measurement; recovered with no repo impact. Measure in place (stash + rebuild).

### Ruling P5-R4 — who may be enrolled, and in what

**Two different operations were being conflated, and they have different rules:**

1. **CREATING an enrolment** — the write 5.5 adds. **It mirrors the doors exactly: a subject may be
   enrolled in only if 4.4's door logic treats it as enterable.** Read the door logic and mirror it;
   **do not re-derive the statuses.** Subject status is design configuration, not security.
2. **ACCESS to an environment while enrolled** — **unconditional, and it stays that way.** A student
   already enrolled is never locked out of their own environment, whatever the config says later.
   That was the draft-environment decision and it does not change.

**Limitation, recorded honestly:** subject status lives in TypeScript config, not in the database,
so **RLS cannot enforce enterability** — a caller using their own valid JWT against the REST API
directly could create an enrolment in a draft subject. RLS still enforces **ownership**, which is
the security boundary; this is a product rule with no security consequence, and its failure mode is
benign (the student lands in an honest environment carrying a draft label). **Do not duplicate the
subject config into the database to close a hole that does not leak anything.** Revisit when
tutor-assigned enrolment arrives (P6/P7).

- [x] Step 1 — Student architecture: data model, roles, auth boundary -> `phase-5-step-01-student-architecture.md`
      **EXECUTED at Tier 3, commit `a0d82dd`.** Complete as a design + schema artifact; its Part 4
      auth is **unverified**. Audit A / Audit B findings are in its report.
- [~] Step 2 — Auth — **NOT ABSORBED. It IS Step 1's Part 4, and it is the hard gate on Phase 5.**
      Substrate locked in P5-R1: **Supabase** (Auth + Postgres + RLS), `@supabase/supabase-js` +
      `@supabase/ssr`. **Tier 3 = UNVERIFIED = 5.3 stays blocked**, and the agent is right to keep
      stopping. Mocking auth and calling it verified is forbidden.
- [x] Step 3 — The student shell (Room chrome, IA, three states, slot map) -> `phase-5-step-03-student-shell.md`
      **DONE** at `/student` per P5-R1. Auth VERIFIED first. P5-R2 correction pass outstanding.
- [x] Step 4 — The next-action engine ("what should I do next", priority order, extension contract)
      -> `phase-5-step-04-next-action-engine.md` — **DONE, commit `dae8e73`** (DEC-006,
      `docs/NEXT_ACTION_EXTENSION.md`). Pure resolver + reasoner + judge, two shipped providers,
      composition root with isolated failures and a benign fallback. Surface unchanged (`--check`: no
      diffs, ratio 2.24, JS 183 KB -> 183 KB); resolution 11 us; 34/34 tests.
- [x] Step 5 — The environment-scoped student workspace -> `phase-5-step-05-environment-workspace.md`
      **BUILT.** Owns the enrolment write (P5-R2/R4): *choosing is entering*. Carries P5-R4 Addenda
      1-4 and P5-R5 (one environment, role-scoped regions). Harness 21/21 on the environment route.
- [x] Step 6 — The progress language -> `phase-5-step-06-progress-language.md` — **BUILT, `af00b3b`**
      RULING P5-R6, amended by the no-table finding. Arc region shipped, one definition shared with
      Scene 7. Docs: `docs/PROGRESS_LANGUAGE.md`.
- [x] Step 7 — Loading, error, partial and offline states -> `phase-5-step-07-student-states.md`
      — **BUILT, `bbc77d3`.** RULINGS P5-R8 and P5-R9. `docs/STATE_LANGUAGE.md` +
      `src/lib/state/isolate.ts`.
- [x] Step 8 — Student experience validation gate -> `phase-5-step-08-student-gate.md`
      — **CLOSED, commit `0682379`** (P5-R9 at `29b98f6`). Verification not construction. Produced the
      promise ledgers, the mobile pass, the breakouts, the exceptions register, the matrix and the
      phase-close verdict. **PHASE 5 IS COMPLETE.**

**Phase 6 — Tutor Experience** *(the first role that reads another person's data)*

- [x] Step 1 — The tutor architecture -> `phase-6-step-01-tutor-architecture.md` — **BUILT & REPORTED**
      (`PHASE6_STEP1_TUTOR_ARCHITECTURE_REPORT.md`).
      **BUILDS NO INTERFACE.** Relationship model · the visibility ruling · the portal architecture ·
      the role path · the levers as a model question. Rulings P6-R1, P6-R2, P6-R3.
- [x] Step 2 — The tutor shell -> `phase-6-step-02-tutor-shell.md` — **BUILT, commit `15da5a5`.**
      P6-R4 (no next act → state it) · P6-R5 (stale strings are defects) · P6-R6 (the identity axis is
      standing). Shell 57/57 · environment 23/23 · states 45/45 · gate 11/11 · RLS 56/56 · visibility
      17/17 · tutor 36/36 · identity-matrix 51 routes x 6 classes with the coverage gate proven.
- [x] Step 3 — The relationship's surface -> `phase-6-step-03-relationship-surface.md` — **BUILT &
      REPORTED** (`PHASE6_STEP3_RELATIONSHIP_SURFACE_REPORT.md`, quoted in 6.5 §1).
      THE GAZE. One student, one subject.
      P6-R2 amended (position, never recency) · P6-R9 (an absent relationship is indistinguishable from
      a student who does not exist) · P6-R7 (attacks are gates) · P6-R8 (an entry names a phase).
- [x] Step 4 — The levers -> `phase-6-step-04-the-levers.md` — **BUILT, commit `8b85d58`.**
      `environment_settings` (subject-keyed, CHECK-constrained, **76/76 RLS assertions**) · two adjustable
      levers (density, motion character; accent/motif = identity, atmosphere = inert, none presented) ·
      **validator enumerates 108 combinations, all pass, build-failure proven** · `/tutor/[subject]/environment`
      with the blast-radius sentence, revert, **works with JS off** · POST 303 upsert, 405 on GET, denied =
      the same canonical 404 as an unknown subject · **five reader classes byte-identical
      (`e58e35e9f5106ffd` ×5)** · absence = authored default · attacks 6–7-8 fail with declared TS codes ·
      matrix re-pinned (3 write probes per class) · levers 32/32 · homepage unchanged.
      Rulings P6-R10/11/12 built; **P6-R13: 6.1's per-tutor recommendation superseded, not built.**
- [x] Step 5 — The tutor's states, the account surface, and the honest distance
      -> `phase-6-step-05-tutor-states-account.md` — **REPORTED: `PHASE6_STEP5_REPORT.md` (2026-10-06).**
      **Report written AFTER the workspace re-import** (single squashed commit `a893f5b`), assembled from
      the recorded on-disk evidence — the 2026-10-03 harness run (`audit/tutor-states.json`, 14 gates),
      its baseline, `docs/TUTOR_DISTANCE.md`, DEC-018 and the 6.5 addenda — plus a fresh static
      re-verification pass. Browser/DB-dependent tests are carried from the recorded run, not re-executed
      (no Chrome, no Supabase credentials in the current environment — the report §11 lists every gap).
      **The §10 owner ruling is RESOLVED (2026-10-06): P6-R21 REFUSE_STALE_WRITE** — the silent
      concurrent overwrite is refused by a conditional write; DEC-018 addendum, `docs/TUTOR_DISTANCE.md`
      row 8, STATE_LANGUAGE T9 and the `write-concurrent` gate updated to assert the refusal.
      **Prompt in the workspace since the P6-R17–R20 patch; its chat delivery did NOT arrive — read it
      from disk, not from the message.** Carries **P6-R13** and P6-R17 to P6-R20 in Part 0. **The arc line
      "states with real content" was stale and is CORRECTED — there is no content until P7.** P6-R14 (the
      account surface is identity and exit) · P6-R15 (every write has a GET that settles it) · P6-R16 (the
      distance is named where the capability would be). **Its precondition is 6.3 AND 6.4 reported** — both
      reports exist on disk (`PHASE6_STEP3_RELATIONSHIP_SURFACE_REPORT.md`, `PHASE6_STEP4_LEVERS_REPORT.md`)
      and are quoted in the 6.5 report §1. **Report run order: seven small windows - `phase-6-step-05-report-chunks.md`.**
- [x] Step 6 — The tutor experience validation gate -> `phase-6-step-06-tutor-gate.md`
      — **CLOSED (2026-10-08), full record: `PHASE6_STEP6_REPORT.md` (W1–W11, branch
      `arena/e6e6e569-tutors-academy`).** Verification, not construction — three homepage
      contradictions found and corrected by fixing the CLAIM half (DEC-020) · the second ledger:
      11 rows read well, 1 reads both ways (silent shaping, declared + recommended) · the identity
      matrix proven as a closed set, its coverage gate catching real drift (2 dev rows owed a pin) ·
      honesty audit 30/30 clean · exceptions register 21 → 19 · zero real identities · nine
      phase-close questions answered · verdict: **PHASE 6 IS COMPLETE.** The owed credentialed
      re-runs and two static-guard rulings are declared in the report's debt list.
**Phase 7 — Live Classes** — **CERTIFIED at the Live Classroom Gate (2026-10-08, W1–W5;
`PHASE7_GATE_REPORT.md`).** The classroom stands staged, honest and surveillance-free; the door to
a live room opens the day the wiring (credentials + carrier) lands — never before.
- [x] Step 2 — Cohort surfaces & real-time room integration -> PHASE 7 BRIEF (2026-10-08) — **BUILT.**
      The first reader's policies (migration 0006: enrolment boundary for students, assignment for
      tutors, zero writes, zero surveillance) · `/subjects/[subject]/live` staged surface (server
      component, zero client JS: the subject's graphite/substrate atmosphere, the brief's standby
      sentence verbatim, a reserved tile grid empty by honesty) · the `class` provider registered in
      the next-action engine per the extension doc's P7 row (Tier 2 only — no session end, no Tier 1;
      silent until the module is live) with DEC-022's attend-vs-resume sentence · LiveKit readiness on
      env NAMES only, no dependency, no speculative wiring · `live-classroom` flipped to in-progress.
      Verified: cohort-live 27/27 · next-action 34/34 (one pin refined, reason declared) · progress
      16/16 · progress-record 18/18 · subjects 108/108 · build clean · HTTP smoke (307 login door,
      themed 404, preserved environment). DEC-023 records it all.
- [x] Step 3 — Live stage participant interface & audio discipline -> PHASE 7 BRIEF (2026-10-08) — **BUILT.**
      The participant interface against the one media reality that needs no transport: the participant's
      OWN devices, opt-in — camera, microphone (speaking glow via local WebAudio, never stored, never
      sent), shared surface, and a Leave Chamber that stops every track. Subject-accent framing
      (Mathematics indigo, Physics ember — the tokens do it). STATE_LANGUAGE's 7.3 addendum: the brief's
      denied sentence verbatim + a no-device state, calm, no banner, no exclamation. Island mounts on
      `/live` only when the room is truly open; exercisable now at `/dev/live-stage` (rehearsal,
      production-gated). Zero capture on load · zero timers · zero persistence · zero surveillance.
      Verified: live-participant 23/23 · full battery green · build clean · smoke (307 / 404 / 200).
      DEC-024 records it — including the sandbox honesty note: no browser here, devices proven by
      construction, the manual walk owed to a browsered environment.
- [x] Step 4 — Shared substrate & collaborative academic surface -> PHASE 7 BRIEF (2026-10-08) — **BUILT.**
      The academic drawing/notation surface: a canvas and nothing else (high-DPI, normalized strokes,
      quadratic smoothing, pen-pressure width). The substrate is the subject's OWN motif — lattice for
      Mathematics, field for Physics, bonds for Chemistry — inherited from 3.3, never invented twice.
      Palette strictly Ink (fine/medium) · Line · Eraser · Reset, three colours (ivory · slate · the
      subject accent); no stickers, no emoji — enforced by tests. Sync: one serializable packet
      `{id, tool, points, colour-ID, width}`, a validating idempotent reducer, the in-memory bus (local
      mode is fully functional — not degraded), optimistic non-blocking apply; the session data channel
      is the seam the wiring step plugs into. Composition: desktop split pane, small screens a real
      toggle. Verified: academic-surface 20/20 · battery green · build clean · smoke (307 / 404-draft /
      preserved). DEC-025 records it, with the owed rulings: the session bus, clear-permission,
      keyboard stroke input, late-packet ordering.
- [x] Milestones 1–5 — Autonomous runner: sessions table, chamber machine, live chamber -> PHASE 7 BRIEF (2026-10-08) — **BUILT.**
      Migration 0007 `cohort_sessions` (the session-of-record; students read by enrolment, tutors
      read and open by relationship — as themselves; lifecycle stays service-role) plus the symmetric
      profile read that lets the tile say "Dr. Vance (Tutor)". DEC-009's referent question settled in
      shape: `progress_record.ref_id` names a session row (FK deferred — the column is polymorphic).
      The pure chamber state machine (STANDBY→ACTIVE→SETTLING→CONCLUDED, 15-minute settling window)
      and the SELECT-only classroom data layer. `/live` pivots its session facts to `cohort_sessions`
      and opens on ACTIVE-or-SETTLING; the `live-chamber.tsx` shell carries the status bar (mark ·
      title · state word) around the tested room composition, with the brief's superseded standby
      sentence. `participant-dock.tsx` docks the tiles; `chamber-controls.tsx` and
      `classroom/use-surface-sync.ts` are bridge re-exports — one implementation, two names.
      Verified: classroom 22/22 (new) · cohort-live 27/27 · live-participant 23/23 · academic-surface
      20/20 · next-action 34/34 · progress 16/16 · progress-record 18/18 · subjects 108/108 ·
      check-subject-sql · build clean · smoke (307 / 404 / 200). DEC-026 records it, including the
      declared pin updates (standby wording, gate shape, composition moved into the shell).
- [x] Step 5 — Session settlement & progress capture -> PHASE 7 BRIEF (2026-10-08) — **BUILT.**
      The lifecycle closes: the tutor concludes the session (ONE atomic guarded UPDATE — ACTIVE →
      CONCLUDED, service role, standing decided by RLS on the read), confirms on the settlement
      surface, and the record is written — one session-attended fact per enrolled student, ref_id =
      the session row (the DEC-026 referent), idempotent by the unique. The settlement component is
      dignified: the brief's closing sentence verbatim, one departure action per view, no stars, no
      survey, no evaluative drop-down — notes about a student are not kept and the surface says so
      (P5-R6; milestoneKey validated against STEP_EVIDENCE and stored nowhere: the arc derives its
      position from facts). The open room narrows to ACTIVE; SETTLING and CONCLUDED show the
      settlement; conclusion unmounts the room — nothing of the session lingers on the device. The
      write is registered in the P6-R15 settling table; every outcome 303s to the settling GET.
      Verified: settlement 26/26 (new) · full battery green · build clean · smoke + GET-settle 405.
      DEC-027 records it, with the owed owner ruling on whether notes ever gain an adjudicated home.
- [x] Step 6 — Real-time data channels & acoustic sync engine -> PHASE 7 BRIEF (2026-10-08) — **BUILT.**
      The session channel: one closed vocabulary — `PRESENCE_UPDATE` · `CANVAS_STROKE` · `STAGE_STATE`
      over one envelope; the stroke IS the adjudicated SurfacePacket (DEC-025), never a second opinion;
      the stage words round-trip with the chamber machine. Isolation is STRUCTURAL: every room is named
      `subject:session` and a wrong-room signal is refused at the door before any listener hears it
      (pinned). The 16 KB budget rejects with a named defect, measured in bytes. The memory transport
      delivers synchronously to the whole room including the sender; `chooseTransport` names the LiveKit
      seam per DEC-023 — no carrier dependency. The hook (`use-classroom-session`) seeds presence with
      the local participant alone, reports speaking/video facts upward through the island's OPTIONAL tap,
      gives the tutor alone the lifecycle word, and unsubscribes completely — zero telemetry vocabulary
      (no focus, keys, visibility, idle, gaze; swept). The chamber binds it: the banner word rides the
      channel (server word is the seed — zero hydration drift), a presence line names who the room knows,
      the surface draws on the session's OPTIONAL bus (local default preserved), and a concluded signal
      closes the workspace calmly — Step 5's confidentiality mirrored client-side. `/dev/live-stage`
      rehearses the whole channel: presence, shared strokes, conclude/reopen, no credentials. Verified:
      signaling 26/26 (new) · classroom 22/22 · academic-surface 20/20 (pins updated, declared) ·
      cohort-live · live-participant · settlement · next-action · progress suites green · build clean ·
      smoke (307 / 404 / 200 / GET-settle 405). DEC-028 records it; the carrier wiring stands owed.

- [x] Step 1 — Progress record schema & cohort architecture -> PHASE 7 BRIEF (2026-10-08) — **BUILT.**
      `progress_record` applied (migration 0004, the DEC-009 shape: interim-neutral referent, tutor
      read via `is_related_tutor`, no authenticated writes, retention untouched — DEC-022 records the
      reconciliation with the brief's sketched columns) · cohort model drafted (migration 0005:
      `cohorts` + `cohort_tutors` junction, zero policies, nothing pre-granted) · pure helpers in
      `src/lib/progress/record.ts` (attend-vs-resume sentence rule) with `test-progress-record.mjs`
      18/18. Battery green: validate-subjects 108/108 · check-subject-sql · progress 16/16 ·
      next-action 34/34 · build clean. **Creating the table changes no admissibility — kinds stay
      gated on module liveness.** Live migration apply owed to the credentialed environment.
- [x] Gate — The Phase 7 Live Classroom Gate (W1–W5) -> PHASE 7 GATE SPEC (2026-10-08) — **CERTIFIED.**
      Verification only — five windows: W1 cold start & static health (validators at their declared
      baselines, full logic battery green, build clean) · W2 the privacy & surveillance audit
      (zero-tolerance on the fourteen live surfaces: 0 hits; 31 app-wide hits audited and allowlisted;
      zero facial/gaze/tab/dwell/gamification; zero real identities) · W3 the pedagogical ledger
      (attend-vs-resume from facts, settlement dignity, no rating instrument anywhere — 8/8) ·
      W4 mobile & performance (one plane at a time below the tested 900px split behind a real
      aria-pressed toggle; normalized resize-safe canvas; client payload MEASURED: 5 scripts ·
      165.2 KB gzip) · W5 phase close (exceptions consolidated — 19 open, count corrected and
      declared; nine phase-close questions answered). Baselines committed: `audit/phase7-*.json`.
      Full record: `PHASE7_GATE_REPORT.md`. The debt list stands: wiring, rulings, the manual walk.
**Phase 8 — Recordings**
- [x] Step 1 — Session archive schema & storage policies -> PHASE 8 BRIEF (2026-10-08) — **BUILT.**
      The archive's foundation, schema-first: migration 0008 creates `session_artifacts` — one row
      = one artifact (board snapshot · pedagogical notes · recording, a closed three) belonging
      STRICTLY to one session of one subject, enforced twice (composite foreign key into
      `cohort_sessions(subject_id, id)` + the brief's requested index; storage_path unique, one
      artifact per object key). Reconciled and recorded (DEC-029): numbered 0008, not the brief's
      0005 (cohorts owns it) · the "subject foreign key" is the `is_subject_id` CHECK (E-13 — no
      subjects table) · `is_related_tutor(auth.uid(), …)` cannot stand as written (DEC-026's ruling
      applies verbatim) — the tutor READS by standing relationship and WRITES only into sessions
      they opened · the data layer carries no userId (identity rides the cookie session; RLS is the
      only boundary). One PRIVATE bucket `session-artifacts` with one authenticated SELECT policy
      deferring to the same predicates; uploads and lifecycle stay service-role; anon admitted
      nowhere. The data layer (SELECT-only, classroom posture): concluded sessions newest-first
      with their artifacts; details sign a 60-second bearer URL through the service client only
      after the row proves visible, degrading to `unsigned` without credentials — invisible and
      unknown are the SAME null (zero leakage). Zero engagement metrics by construction (no counter
      column exists; the banned vocabulary is swept). Verified: archive-logic 19/19 (new) · full
      battery green · both gate-7 audits still PASS · tsc clean · build exit 0. Live apply owed to
      the credentialed environment; no surface ships and `recorded-classes` stays `planned`.
- [x] Step 2 — The subject archive surface & artifact shelf -> PHASE 8 BRIEF (2026-10-08) — **BUILT.**
      The archive reads like a library, never a feed. `/subjects/[subject]/archive` carries the
      live chamber's gate unchanged (unknown subject 404 · no identity → login door with `next` ·
      enrolment/relationship decide · everyone else the SAME 404 — no enumeration) and renders
      server-complete with zero client JS; the archive read is PRIMARY — a failed read fails the
      page honestly. `artifact-shelf.tsx`: an ordered shelf, most recent session first (date ·
      title · the tutor only when the boundary allows), the brief's empty sentence verbatim.
      `artifact-card.tsx`: the three kinds in the archive's own words — Board Record · Session
      Notation · Chamber Audio ("VOD" · "Replay File" · "Recording Upload" banned and swept); the
      board's preview is a short signed URL when the service key stands, chamber audio states its
      owed playback calmly — no counts, badges, thumbnails or share icons anywhere. Doors: the
      `recordings-notes` shell region filled through the documented fill point (the slot contract's
      one declared growth — the shell hands a slot its subject) and one quiet `ArchiveLink` per
      tutor subject group in the ShapeLink's grammar; the relationship surface stays untouched
      (P6-R10 distance). No second layout.tsx (DEC-026's ruling carries). Verified: archive-surface
      16/16 (new) · full battery green · both gate-7 audits PASS (273 files scanned) · tsc clean ·
      build exit 0 · smoke: visitor 307 login door · bogus 404 · environment preserved. Declared:
      the recordings-notes region's visitor HTML changes (baseline re-pins owed, P6-R17 precedent);
      `recorded-classes` stays `planned` (E-26). DEC-030 records it; the playback island and the
      artifact writer stand owed.
- [x] Step 3 — Artifact viewer & vector whiteboard replay engine -> PHASE 8 BRIEF (2026-10-08) — **BUILT.**
      The scholarly review mode. Every artifact card carries ONE quiet opener island; it lifts the
      artifact into `artifact-viewer.tsx` — a real dialog (modal, backdrop-blurred graphite drawer)
      whose header names date · kind · session title and wears the subject mark. Escape, the
      backdrop or Close departs; focus enters the drawer on open and returns to the handle on
      close — seamless both ways. Board records replay through `canvas-replay.tsx`: the Phase 7
      StrokePacket vocabulary VERBATIM on the subject's own motif, devicePixelRatio-crisp, two
      modes by pressed buttons — BOARD (whole record at once; pan by arrow keys, zoom by +/− /
      Reset buttons — keyboard first, drag the enhancement) and PLAYBACK (strokes return in
      recorded order along one scrubber; rAF only while playing). The fluid line and token
      palette moved to ONE renderer (`stroke-render.ts`) that live surface and replay both
      consume — no second stroke vocabulary; the record reads back through surface-sync's own
      validatePacket + applyPacket, one bad entry refusing the whole. The opening state is always
      the static board: motion starts only when asked — the reduced-motion contract honored by
      default. Chamber audio plays in `media-player.tsx`: native HTML5, no library — play/pause,
      MM:SS scrubber, the three speeds (1.0 · 1.25 · 1.5, never pitched), volume/mute; no
      autoplay, no up-next, nothing recommended, nothing to share. Bytes arrive ONLY by signed
      URL minted at open time through one `"use server"` action over the standing
      fetchArtifactDetails (RLS first, then the signature); the window follows the kind —
      records 60 s, chamber audio MEDIA_URL_SECONDS = 900. Declared: Step 2's owed-playback
      sentence discharged; the academic-surface quadraticCurveTo pin relocated to the renderer.
      Verified: archive-viewer 22/22 (new) · archive-logic 26/26 · archive-surface 16/16 ·
      academic-surface 20/20 · next-action 34 · progress 16 · validate-subjects ALL VALID ·
      check-subject-sql PASS · tsc clean · build exit 0 (33 pages) · smoke: rehearsal 200 (math +
      physics) · archive visitor 307 · bogus 404 · gate-7 privacy PASS (282 files, zero island
      hits) · ledger 8/8. The engine is proven in `/dev/archive-rehearsal` (404 in production) —
      the sandbox holds no artifacts; the writer that gives the shelf real objects stands owed.
      DEC-031 records it; STATE_LANGUAGE 8.2 speaks it.
- [x] Step 4 — Milestone synthesis & record consolidation -> PHASE 8 BRIEF (2026-10-08) — **BUILT.**
      The chronology that joins what happened to what it left behind. `src/lib/progress/synthesis.ts`
      (pure, node-tested, outside the 5.6 barrel by the record.ts precedent) composes the record:
      a progress fact (`progress_record`, migration 0004) evidences an arc step by STEP_EVIDENCE's
      own rule, and the artifacts preserved from that fact's session substantiate the entry — the
      join is `ref_id = session_id`, both tables' session truth, no new column or table. The reader
      `fetchSubjectMilestonesWithArtifacts(subjectId, studentId)` makes three RLS-bounded reads
      (facts · session titles · artifacts), every one spelling the subject it means and whose record
      is meant; the second argument is the record's subject, never the viewer's identity; RLS decides,
      a mismatch yields the honest empty (zero leakage, zero enumeration). `milestone-synthesis.tsx`
      renders it as a scholarly timeline — subject mark, date, session title, the tutor's notation,
      each artifact a "Substantiated by …" link to its card in the subject archive (the cards gain
      `#artifact-<id>` anchors). THE REGISTER, scoped by ruling (DEC-032): "milestone" is admitted
      in the CHRONOLOGICAL sense only — a named stage, evidenced, pointing at real rows; the reward
      register stays banned and is swept (no badge, XP, level, unlock, streak, points, trophy,
      percent, bar, rank, congratulations). Embeddings: the student shell's written-map
      `achievements` slot — the fill point the map itself demanded — renders "Your Milestone Record
      in {Subject}" per active enrolment; the tutor relationship surface's record region (6.3's
      declared fill point) renders "Milestones co-certified", reading by the relationship's new
      `studentId` join key, declared never-displayed (P6-R2 governs what the surface shows, swept).
      Empty means absent — no box, no heading, no zero. `live-classroom` is in-progress in the
      registry, so both production surfaces stand honestly absent today; the rehearsal proves the
      engine in both registers on specimen facts (`/dev/archive-rehearsal`). Verified:
      milestone-synthesis 21/21 (new) · progress 16 · progress-record 18 · archive-logic 26 ·
      archive-surface 16 · archive-viewer 22 · next-action 34 · validate-subjects ALL VALID ·
      check-subject-sql PASS · tsc clean · build exit 0 · smoke: rehearsal 200 (both registers) ·
      /student 307 (door) · bogus archive 404 · gate-7 privacy PASS (284 files, zero island hits) ·
      ledger 8/8. test-tutor-visibility is the credentialed live-RLS harness (baseline
      audit/tutor-visibility.json) — owed, unchanged. DEC-032 records it; STATE_LANGUAGE 8.3 speaks
      it. The artifact writer and live-classroom's `live` flip stand owed.
**Phase 9 — AI Learning Layer**
**Phase 10 — Polish + Performance**

## Brand direction (locked in Phase 2.1)

**"Ink & Signal"** — ink base for cinematic depth, ivory for reading surfaces,
brass as the sparing institutional accent (a seal, not a paint),
signal teal reserved for *live* and *interactive* states only.

One brand. Many environments. Subjects layer on via three accent slots
(`--ta-accent-1/2/3`) filled in Phase 3 — never by forking pages or components.

## Brand frame rules (enforceable from Phase 2.6)

- The **mark + wordmark + lockup are brand frame** — identical in every subject environment.
  Subjects recolour surrounding surfaces via accent tokens; the mark never changes shape,
  spacing or proportion.
- **Subject identity never uses a generic icon glyph.** Subjects are environments, not list
  items. Each gets its own custom mark/motif in Phase 3.
- The mark is **brass, always** — never the subject accent slots.

## Rules for every step

- Inspect before changing. Reuse before creating.
- Two-tier tokens: components consume **semantic** tokens only, never primitives.
- No fake functionality — real, or honestly labelled with the backend it needs.
- Never rewrite a working section without a stated reason.
- Test after every change. Report what changed, what was deferred, and why.
