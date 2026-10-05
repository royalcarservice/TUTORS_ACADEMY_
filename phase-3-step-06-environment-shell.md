# TUTORS ACADEMY — Phase 3 · Step 6
## The Environment Shell — ENTER

> Depends on Steps 3.1–3.5. **Read all of Phase 3 and the Phase 2 foundations first.**
>
> **This step makes the environment reachable.** It builds the shell, the routing, and the
> Stage→Room composition. It builds **no features** — no student dashboard, no tutor
> surfaces, no classes, no recordings, no AI.
>
> **A student route exists after this. It contains no learning features, and says so.**

---

### WHY THIS STEP EXISTS

Everything so far has been demonstrated on `/dev/*` routes. This is where a subject becomes
a place you can actually navigate to — server-rendered, deep-linkable, accessible without
JavaScript, and correctly scoped.

It is also where the biggest architectural decision of Phase 2 finally becomes real:
**Stage and Room are different postures of the same brand**, and the route enforces which
one you are in.

---

### THE THREE LOCKED DECISIONS

**1. The route is the source of truth, rendered server-side.**

- A direct load of a subject URL produces the **complete environment with no JavaScript**:
  correct subject scope, correct accents, correct motif, correct identity, correct
  heading and metadata.
- The Step 3.4 switch is **progressive enhancement over that server-rendered state.**
  Client-side navigation between subject routes *may* run the switch (at the tier chosen by
  3.4's logic). A direct load **never** runs a transition — it simply arrives correct.
- **Why this order matters:** had routing been built before the switch, the environment
  would have depended on JS to be comprehensible. It does not.

**2. Stage and Room become structural, not stylistic.**

- **Stage** = the environment's surface. Full-bleed, `substrate` permitted, comfortable
  density, ambience permitted (per 3.5), accent-forward.
- **Room** = any working content nested inside it. Contained, compact density, **substrate
  forbidden**, vector only (no canvas), calm.
- **A Room can never contain a Stage.** Enforce structurally, not by convention.
- The density/dimension switch is applied by the shell, not by each consumer.

**3. The shell ships identity, not features.**

This route carries: environment, identity (mark, name, tagline), heading structure, metadata,
navigation position, honest labelled regions for future content.

It does **not** carry: fake classes, fake tutors, fake students, fake progress, fake
schedules, sample recordings, or any invented data that could be mistaken for real.

> A student arriving early should find a real, quiet place that tells the truth about what
> is coming — not a mockup pretending to be a product.

---

### FIRST: INSPECT

1. **Step 3.1** — the subject schema, the scoping mechanism (`data-subject`), the JS context
   provider, the **draft guard**, and the guard test.
2. **Step 3.3** — the composition roles, the Stage/Room enforcement point, and the motif
   renderer's server-rendering behaviour.
3. **Step 3.4** — the switch state machine, its tiers, the announcement, and the focus rules
   (navigation-triggered vs inline).
4. **Step 3.5** — the fallback path, and confirmation that the canvas is **absent from the
   Room bundle entirely**.
5. **Step 2.4** — the Stage/Room layers, containers, density modes, breakpoints.
6. **Step 2.6** — the nav shell's Stage and Room modes, and how a route declares which it uses.
7. **Existing routing structure** — router type, layout nesting, how routes are declared,
   existing metadata handling, existing 404 behaviour.
8. **Existing route components** — report and extend rather than replace.

Report findings before building.

---

### BUILD — PART 1: THE ROUTE STRUCTURE

Define routes that are honest about what exists:

```
/subjects/[subject]   — the subject environment (this step)
/subjects             — a MINIMAL scaffold index, clearly temporary
```

**Rules:**
- **`/subjects/[subject]` is the real deliverable.** It renders the environment shell for a
  valid, non-draft subject.
- **Unknown or invalid subject → the framework's 404**, correctly themed, with a real
  explanation and a route back. **Never a silent redirect, never a blank page.**
- **Draft subjects are unreachable in production** — enforced at the route level using the
  3.1 draft guard, not by convention. Report the enforcement point. A draft subject in dev
  renders with a visible banner saying it is a draft.
- **`/subjects` is a scaffold, not the chooser.** It is a plain, accessible list of the six
  subjects linking to their environments, with a **visible on-page note that the real subject
  chooser is built in Phase 4.** Do not design it. Do not make it beautiful. It exists so the
  routes are reachable and testable.
- **No fake account, dashboard, class, or tutor routes.** Nothing that leads nowhere.

**Do not invent a large information architecture.** Two routes. That is all.

---

### BUILD — PART 2: THE ENVIRONMENT SHELL

A single shell component that wraps a subject route. Responsibilities, in order:

1. **Apply subject scope** — set `data-subject` on the environment root so accents and
   environment variables resolve. Cleanly applied and removed; no leakage outside the subtree.
2. **Apply layer mode** — declare Stage or Room, applying the correct density and container
   from 2.4.
3. **Render environment identity** — subject mark (3.2), name, tagline, in a proper heading
   structure. **Exactly one `h1` per route**, carrying the subject name.
4. **Render the motif** in the roles permitted for this layer, at the subject's density,
   server-rendered per 3.3.
5. **Mount the ambient layer** only when all 3.5 conditions are met — Stage only, never in a
   Room, never blocking, with the SVG substrate already present beneath it.
6. **Provide the subject context** to descendants (per 3.1) — minimal, no over-exposure.
7. **Handle entry semantics** (Part 4).

**The shell must not contain feature logic.** It positions and scopes. It does not fetch
student data, does not know about classes, and does not assume a role.

---

### BUILD — PART 3: STAGE → ROOM COMPOSITION

Make the two layers **structural** and demonstrate the boundary with real content.

- The route root is **Stage**.
- Beneath the identity, the shell renders a **Room** region — the place where working
  content will live.
- **Prove the boundary in code and on screen:**
  - In the Room: **no substrate**, no canvas, compact density, calm accent usage.
  - In the Stage: substrate permitted, comfortable density, identity-forward.
  - **A Room cannot contain a Stage** — enforce structurally.
- **Named, honest content regions.** Each region states what will live there and in which
  phase, e.g. *"Live classes will appear here — Phase 7."* This is a **truthful placeholder**,
  not a fabricated feature. Style them as quiet, deliberate system states — not as broken
  empty boxes, and not as teased features.
- **No skeletons or shimmer on empty regions.** Skeleton loaders imply loading. These regions
  are not loading — they are not built. Different state, different treatment.
- **Provide a documented way for later phases to fill a region** without editing the shell.

---

### BUILD — PART 4: ENTRY SEMANTICS

Integrate 3.4's accessibility work at the route boundary:

- **Navigation-triggered entry:** focus lands on the environment's identity heading after
  client-side navigation. Verify it does **not** merely reset to the top of the document in a
  way that skips the heading.
- **Direct load:** focus behaves normally (top of document). No focus theft on first paint.
- **Announcement:** the subject identity is conveyed in text — heading and, where a client-side
  navigation occurred, the polite announcement from 3.4. **Do not double-announce** on direct
  load.
- **Skip link target** from the nav shell must resolve correctly inside the environment.
- **Landmark structure:** one `main`, correct heading order, and the environment's identity
  region discoverable by landmark navigation.
- **History behaviour:** back/forward between subject routes restores correct state, with no
  stranded mid-transition state (per 3.4's convergence guarantee).

---

### BUILD — PART 5: PERFORMANCE AND ISOLATION

- **The ambient/3D chunk must not load on a Room-only route or before it is needed.**
  Report the chunk boundaries and prove the isolation.
- **The Stage's initial payload must be small** — the environment must be fast on first paint.
  Report measured first-paint metrics with the ambient layer absent, then present.
- **No layout shift on ambient arrival** (per 3.5). Re-verify **at the route level**, not just
  on the dev route.
- **Route-level code splitting** where the framework supports it. Report what splits where.
- **Metadata:** subject name and a tagline-derived description. Honest, not keyword-stuffed.
  Confirm correct title and description per subject.
- **Favicon remains the brand mark** (2.6) — subjects do not get their own.

---

### CONSTRAINTS

- **No features.** No student dashboard, no tutor surfaces, no classes, no recordings, no
  progress, no AI, no assignments, no search, no auth. Regions are labelled placeholders only.
- **No fake data of any kind** — no invented tutor names, no sample schedules, no demo
  progress, no placeholder avatars. Placeholders must be **text about the future state**.
- **No new tokens, colours, marks, motifs, or motion vocabulary.**
- **Do not modify the schema, validator, grammar, marks, switch, or ambient layer.**
- Do not restyle the nav shell or primitives.
- Do not touch existing `/dev/*` routes.
- **Do not build the homepage or the real subject chooser** — those are Phase 4.
- No new dependencies.
- No route-change animation beyond what 3.4 permits.

---

### DO NOT CHANGE

- Tokens, type, motion grammar, spatial system, density (2.1–2.4)
- Primitives and their APIs (2.5)
- Brand mark, wordmark, lockup, favicon, nav shell (2.6)
- Subject schema, validator, scoping, guard test, `/dev/subjects` (3.1)
- The six marks, mark language spec, `/dev/marks` (3.2)
- The motif grammar, roles, budgets, `/dev/motifs` (3.3)
- The switch state machine, tiers, announcements, `/dev/switch` (3.4)
- The ambient layer, renderer contract, degradation inputs, `/dev/ambient` (3.5)
- Existing routes, components, layouts, copy
- Any working build or deploy setup

---

### TEST (all required)

1. **No-JS correctness** — load each subject route with **JavaScript disabled**. Confirm:
   correct scope, correct accents and motif, correct headings, correct metadata, readable
   content, working navigation. **Screenshot it.** This is the single most important test in
   this step.
2. **Direct-load correctness** — load each route directly (fresh, no client navigation).
   Confirm the environment is correct immediately and **no transition runs**.
3. **Client-side navigation** — navigate between subject routes. Confirm the switch runs at
   the correct tier, the announcement fires once, and focus lands on the heading.
4. **No double-announcement** — verify direct load announces nothing extra, and client
   navigation announces exactly once. Report the transcript for both.
5. **Draft guard at route level** — confirm a draft subject is unreachable in production and
   visibly marked in dev. Paste the enforcement point.
6. **Unknown subject** — confirm a correct, themed 404 with a route back — not a blank page,
   not a redirect loop.
7. **Stage→Room boundary** — confirm substrate and canvas are **impossible** in a Room, and
   that a Room cannot contain a Stage. Paste the enforcement points.
8. **Chunk isolation** — confirm the ambient/3D chunk does **not** load for a Room-only
   render. Paste the network/console evidence.
9. **Layout shift** — measure CLS at the route level, both with ambient arriving and reduced
   motion. Report numbers.
10. **Landmarks and headings** — one `h1` per route, correct order, `main` present, skip link
    resolves. Report the accessibility tree outline.
11. **Keyboard** — tab from page start: skip link, nav, identity, regions, out. Logical order,
    visible focus throughout.
12. **Screen reader** — report the reading order for one subject route, confirming motifs and
    canvas are absent from it and placeholders are read as ordinary content.
13. **Both themes** — every subject route, dark and light, Stage and Room.
14. **Both densities** — Stage comfortable, Room compact, verified as spacing-only differences.
15. **Mobile 320px** — correct rendering, no overflow, correct tier of the ambient layer.
16. **Zoom 400% + text-spacing overrides** — nothing breaks.
17. **Back/forward** — navigate between subjects repeatedly; no stranded state, no duplicated
    announcements, no orphaned resources.
18. **Validation and metadata** — confirm each subject's title and description are correct and
    distinct. Report them.
19. **Audit** — axe/Lighthouse on each subject route and on `/subjects`. Score + every violation.
20. **Production build** succeeds. Confirm `/dev/*` routes are absent or 404, and no draft
    subject is reachable.
21. `git status --porcelain` — paste raw output.

---

### REPORT BACK

1. Files created / modified — including any **existing** route or layout extended rather than
   replaced, with reasons
2. **The route structure as built**, including the draft guard and 404 behaviour
3. **The shell's responsibilities** as implemented, and confirmation it contains no feature
   logic
4. **The Stage→Room composition** — how the boundary is enforced, with the enforcement points
5. **The content regions** — their names, what each says it will hold, and in which phase
6. How a later phase fills a region without editing the shell
7. **Entry semantics** — focus behaviour, announcement behaviour, and how double-announcement
   was prevented
8. **No-JS results** — with the screenshot
9. **Chunk isolation evidence** — the ambient chunk absent from Room-only renders
10. Route-level CLS measurements, ambient arriving and reduced-motion
11. Metadata per subject
12. **The honest placeholder approach** — how regions avoid reading as fabricated features
13. Audit results, keyboard findings, accessibility tree outline
14. Confirmations: no fake data anywhere; no features built; no dev routes touched;
    homepage and chooser not started
15. Anything deferred, and confirmation nothing was half-built
16. Confirmation nothing in the brand frame, schema, marks, grammar, switch, ambient layer,
    primitives, or existing routes was changed

---

### STOP

End after the report. Do not begin Phase 4 (homepage storytelling) or Step 3.7 unless
instructed — the phase closes with the re-skin validation gate.
