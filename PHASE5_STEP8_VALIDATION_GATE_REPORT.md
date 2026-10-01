# PHASE 5 · STEP 8 — THE STUDENT GATE

**Verification, not construction.** Date 2026-10-01. Working tree on top of `0682379` (the reduced 5.8 pass); every count
below was re-run on the final tree before the commit that carries this report. Instrument: `audit/gate.cjs` (new, 274
lines) plus the existing harnesses. Toolchain: Node 22.20.0 · Next 16.3.6 · puppeteer 25.12.0 / Chrome 154.0.8037.57 ·
Lighthouse 13.5.0 · production build served by `next start -H 0.0.0.0 -p 3100`; the dev server (`:3000`) only for the
`/dev/*` specimen frames. Test accounts only (`student-a…e@test.tutorsacademy.invalid`); student-e is the one write
account and was reset by SQL before each journey; a/b/c/d were never POSTed as.

The gate found **five defects** (all fixed, all demonstrable, none a feature), **one missing harness gate** (added),
**one gate in the new instrument that could not fail** (fixed before it was trusted), and **two declared exceptions**
that are new to the register. Everything is below, with the failure pasted first and the fix after.

---

## PART 0 — INSPECT (reported before the gate ran)

**0.1 The seven step reports, read adversarially.**
- 5.1 claimed "auth built, doors not opened" — true; `/register` creates test accounts and says so; no real onboarding
  path exists. But its role descriptions over-claimed (*"Learn, submit work and track progress"*, *"Teach, grade and
  manage your sessions"*) — capabilities that do not exist and the banned "track progress" family. **Defect D-3.**
- 5.3 claimed one nav bar, Room mode, identity-aware account entry. True on `/student`; **false on `/subjects/*`**: a
  signed-in student was shown "Sign in · Create account" there (Stage mode ignored `account`). **Defect D-4.**
- 5.4/5.5/5.6/5.7 claims (pure resolver, one write, counts-not-scores, failed read ≠ absence) re-verified by their own
  harnesses at the final tree (counts in TESTS) and by breakages (b), (c), (h) below.
- 5.8-reduced (`0682379`) claimed "two defects fixed, journey measured". True, but it measured a Slow-3G profile, one
  viewport, one theme, and no matrix — it was not the brief. This report supersedes it.
- 4.9 claimed `/subjects` was "recommend-only". Its page copy still said *"the real subject chooser is built in Phase 4
  and will replace it"* — a promise about a past future, now false. **Defect D-2.**

**0.2 Harness pass counts at `0682379` before any change:** states 45/45 · environment 22/22 · permissions 9/9 ·
test-progress 16/16 · test-next-action 34/34 · subject-import guard ✓ · page 8/8 gates (`no diffs vs baseline`) ·
shell 57/57 · RLS 20/20 (`--local`). What each asserts is in TESTS §T3.

**0.3 Declared exceptions since P5-R2** — consolidated into `docs/EXCEPTIONS.md` (PART 5): 10 carried in, 14 opened in
Phase 5, 2 closed, 22 open.

**0.4 4.9's method, same instrument.** 4.9 used `audit/page.cjs` (whole-page mode, 8 gates, pin-and-drift). 5.8 runs it
unchanged (no diffs) and extends the *method* to the student space with `audit/gate.cjs`: the same fold rule
(P5-R3), the same pin-and-drift policy (D-08), the same "declare, never silently re-pin" rule.

**0.5 Homepage after-choosing claims — verbatim, with scene attribution.** Read from the production DOM at 390 (not
from source). The ledger in PART 1 is built from these.

| scene | verbatim string |
|---|---|
| S2 The premise | "Six subjects, six environments." · "The environment steps back when you work." · "Moving between subjects is one motion. Switch from one subject to another and the environment changes in place, in under a second, without the text moving." |
| S3 The difference | "One brand. Six environments." · "The same components, the same type, the same rhythm. Only the environment changes." · "One of these six is the subject you are here for. It is next." |
| S4 The choice | "Each door below is a subject built as a place. Behind it is the environment itself, as it stands today." · "One of the six is open today: Mathematics. The rest are in foundation." · "Enter →" · "In foundation" ×5 · "The door opens onto the environment, and the environment becomes the page." |
| S5 The crossing | "The environment becomes the subject." · "Enter Mathematics" · "Inside, the environment runs its ambient layer. This page never loads it." · "What stays: the mark, the wordmark, the nav, the type. What changes: the environment." |
| S6 The practice | "One session, start to finish." · "Everything below happens inside an environment you have already seen." · 1 of 4 "You attend — The class happens live, in the same room you entered from this page, with the tutor and whoever else is in it. **Next · not built yet**" · 2 of 4 "You revisit — Afterwards the class is still there, as a recording, with the notes beside it. Miss one and it waits for you. **Next · not built yet**" · 3 of 4 "You work — You do the work in the same place: the assignments, the notes from class, and help when you are stuck — from the tutor, or from the assistant. **Next · not built yet**" · 4 of 4 "You see yourself move — Your work leaves a record. You and your tutor read the same one, so you can both see where you have moved. **In foundation**" |
| S7 The people | "A tutor here has a place, not a profile." · "There is no roster on this page." · "The environment is the workspace. You meet your tutor inside it." |
| S8 The promise | "See the system — done, on this page" · "See the doors — done, on this page" · "Watch the crossing — done, on this page" · "Learn in the room — ahead" · "Work with a tutor — ahead" · "Watch your record grow — ahead" · "Master the subject — ahead" · "Mastery here is a place that remembers where you were. Your classes, recordings and work are kept against the same environment, and your progress is read there — at the point of work, not on a separate dashboard." · "What is left on this page is the door you already saw." |
| S9 The return | "You have now seen what that means: the system, the doors, the crossing, and what is not built yet. The choice is where it was." · "One of the six is open today." · "The page ends here. The environment does not." |
| footer | "Built in the open. What is not built yet says so." · links: How it works · Subjects · Sign in |

**0.6 Registry read by both halves — verified.** `src/config/modules.ts` is imported by the homepage scenes
(`practice.tsx`, `promise.tsx`, `people.tsx`) and by the student space (`environment-regions.tsx`, `student-slots.ts`,
`next-action/providers.ts`, `progress/events.ts`). Runtime strings agree: homepage S6 says "Next · not built yet" /
"In foundation"; the environment's rooms say "SYSTEM STATE · NOT BUILT — Live classes will appear here — Phase 7" /
"…when the student portal ships (in progress in the module registry — the student shell exists; assignments, tests and
progress do not yet)" / "…with the recorded-classes module (planned)". One source, two readings, no disagreement.

**0.7 `arc.ts` two consumers — verified at runtime.** `promise.tsx` (homepage S8) and `lib/progress/derive.ts` → 
`arc-region.tsx` (environment). Rendered labels identical in both: *See the system · See the doors · Watch the crossing
· Learn in the room · Work with a tutor · Watch your record grow · Master the subject.* The homepage says
"done, on this page" for the first three; the environment says "DONE" for the same three plus **enter** when a row
exists, and "AHEAD" otherwise. Breakage (h) proves a consumer that lies is now caught.

**0.8 Legal blockers, restated.** No privacy policy, no terms, no DPDP (minors) posture, no contact route. Stated on
`/login` and `/register` ("Test accounts only…"). **Real students cannot be onboarded.** Register E-07.

---

## PART 1 — THE PROMISE LEDGER

Verdicts are exactly one of **DELIVERED · DECLARED DISTANCE · CONTRADICTION**. Every row names where it was read.
Contradictions were fixed by correcting the wrong half; no honest sentence was weakened.

### 1.1 Homepage → student space

| # | promise (scene, verbatim) | what the student space does (where read) | verdict |
|---|---|---|---|
| 1 | S4 "The door opens onto the environment, and the environment becomes the page." | `/subjects/mathematics` is the environment: h1 "Mathematics", "The Lattice — structure you can stand on.", the rooms, the nav position. The shell's "Open Physics" POSTs and lands on `/subjects/physics` (journey step 6, return step 2) | DELIVERED |
| 2 | S4 "One of the six is open today: Mathematics. The rest are in foundation." | `/subjects` lists five as "in foundation — not yet available"; direct `/subjects/chemistry` as a non-enrolled student → 404 "There is no page at this address." | DELIVERED (the list/404 tension is recorded in STATE_LANGUAGE "Known tension") |
| 3 | S5 "Enter Mathematics" → S4 "Enter →" | Lands on the visitor environment. **At 390 the environment's `<main>` offers no way in** — the only action is the nav position link to itself; the door is header → menu → "Sign in" (instrumented, journey step 4: `visibleActionsInMainBefore = ["Mathematics→/subjects/mathematics"]`) | DECLARED DISTANCE — **new register row E-23**; not a contradiction (the door does open), a three-tap distance where one was implied |
| 4 | S2 "Moving between subjects is one motion … in under a second, without the text moving." | Shell → environment is a full navigation (POST → 303 → 200); between environments it is a full page load (nav position links). Measured: 1.2–1.5 s wall on the 8 pm profile | DECLARED DISTANCE — E-09 (route-boundary switch, Phase 7). The homepage sentence describes S5's own switcher, which is delivered on `/` |
| 5 | S6 1/4 "You attend — The class happens live … **Next · not built yet**" | Environment room "Live classes — Live classes will appear here — Phase 7. Until then this room stays quiet." | DECLARED DISTANCE (both halves say so) |
| 6 | S6 2/4 "You revisit … **Next · not built yet**" | Room "Recorded classes & notes — … with the recorded-classes module (planned)." | DECLARED DISTANCE |
| 7 | S6 3/4 "You work … **Next · not built yet**" | Room "Assignments, tests & progress — Your work and progress will appear here when the student portal ships (in progress in the module registry — the student shell exists; assignments, tests and progress do not yet)." | DECLARED DISTANCE |
| 8 | S6 4/4 "You see yourself move — Your work leaves a record … **In foundation**" | Environment "Your record": seven steps in words, "Nothing is recorded here yet. Nothing in this environment records anything so far — classes, recordings and work arrive in later phases, and the record starts when they exist." | DECLARED DISTANCE |
| 9 | S7 "A tutor here has a place, not a profile … You meet your tutor inside it." | No tutor appears anywhere in the student space; the `tutor-presence` slot is empty by registry; "Work with a tutor — AHEAD" | DECLARED DISTANCE (Phase 6 entry point) |
| 10 | S8 "Mastery here is a place that remembers where you were." | `/student` as student-c: h1 "Physics — The Field", "LAST OPENED 2 DAYS AGO · You were last here 2 days ago." (fixture-relative); first night as student-e: "Last opened today · You were last here today." | DELIVERED |
| 11 | S8 "…your progress is read there — at the point of work, not on a separate dashboard." | Progress (the arc) is rendered only inside the environment (`record` region); `/student` carries none of it; shell.cjs `no greeting banner / no invented activity / one dominant surface` all pass | DELIVERED |
| 12 | S8 the seven steps and their states | Same seven, same order, same words in the environment; environment adds **enter: DONE** only when the row exists (student-b, enrolled never entered → "AHEAD") | DELIVERED (consumers agree; breakage (h) now guards it) |
| 13 | S9 "The page ends here. The environment does not." | The environment persists: enrolment + `environment_state` row; return visit leads with it | DELIVERED |
| 14 | footer "Built in the open. What is not built yet says so." | Every unbuilt room says so; `/subjects` eyebrow "TEMPORARY SCAFFOLD"; but its body said *"the real subject chooser is built in Phase 4 and will replace it"* — Phase 4 closed without that | **CONTRADICTION → fixed (D-2)**: the sentence now reads "the six doors on the homepage are the chooser, and this list is not." The honest half (scaffold, replace it) stays as a recommendation (E-04) |
| 15 | footer "Sign in" (`/login`) → the student space | `/login` role card: *"Student — Learn, submit work and track progress."* / *"Tutor — Teach, grade and manage your sessions."* Nothing submits, grades, tracks or manages | **CONTRADICTION → fixed (D-3)**: "Learn inside a subject's environment." / "Teach inside a subject's environment." |
| 16 | nav, every page: one identity | `/student` nav: "Student C · Sign out"; one tap later `/subjects/physics` nav: "Sign in · Create account" | **CONTRADICTION → fixed (D-4)**: a real identity now fills the account entry in Stage mode too; visitor chrome byte-identical |

Rows 1, 2, 10–13 are passing rows and are included on purpose. No row is unverifiable: every one was read from the
rendered DOM of the production build (`/tmp/home-strings.json`, `/tmp/strings.json`, `audit/gate-baseline.json`).

### 1.2 Student space → a week of use (every future promise named aloud)

| # | the student space promises… (where) | after a week, is it true? | verdict |
|---|---|---|---|
| 1 | "Your first session begins when you open it." (`/student`, state B) | Opening records an entry; **no session exists** — the room is "quiet" by its own label. The sentence promises a *session*. On a week's use the student has opened and found no session | DECLARED DISTANCE — the room says "Phase 7" on arrival; the shell's sentence is the furthest-leaning line in the product and is listed here aloud |
| 2 | "You were last here N days ago." / "Last opened …" | True from `environment_state.last_entered_at`; never a count, never a zero (test-progress #6) | DELIVERED |
| 3 | "Live classes will appear here — Phase 7." | A dated promise (phase, not date). Still unbuilt after a week; the label does not change | DECLARED DISTANCE (named: **Phase 7**) |
| 4 | "Your work and progress will appear here when the student portal ships (in progress…)" | Named: **student-portal · in-progress**; the registry is the only place that can flip it | DECLARED DISTANCE |
| 5 | "Recordings and lesson notes will appear here with the recorded-classes module (planned)." | Named: **recorded-classes · planned** | DECLARED DISTANCE |
| 6 | "Nothing is recorded here yet … the record starts when they exist." | True; `progress_record` does not exist (E-15) | DELIVERED (as a boundary sentence) |
| 7 | "Draft subject — still in foundation. Open here ahead of its public listing." (student-c/d Physics) | True in production; the environment is reachable only while enrolled | DELIVERED |
| 8 | "This is a test account. It may be deleted while the academy is being built." (`/student/account`) | True — and the only promise about data | DELIVERED |
| 9 | `/login` "Phase 5 sign-in is for test accounts. Real student onboarding waits on the privacy, terms and data-protection work." | True; E-07 | DELIVERED (a declared blocker, stated to the person it blocks) |
| 10 | 404 "The six subject environments are listed on the subjects page." | True | DELIVERED |
| 11 | Honest pages "Nothing was recorded. Opening the page again only reads — it is safe to do." | True by construction (GET never writes: environment.cjs row counts before/after) | DELIVERED |

Future promises, named aloud, in the student's own space: **Phase 7 (live classes)**, **student-portal in progress
(assignments, tests, progress)**, **recorded-classes planned**, **"your first session begins when you open it"**, and
on the homepage **tutor presence (S7)** and **the four S6 steps**. Nothing else in the student space promises anything.

---

## PART 2 — THE JOURNEY, READ THREE TIMES

Profile for every timed figure: production build, 390 × 844, dark, **400 ms RTT / 1.6 Mbps down / 750 kbps up, cold
cache, 4× CPU** ("8 pm"). Screenshots `audit/gate-shots/journey-01…08.png`, `return-01…04.png`. Full per-step JSON in
`audit/gate-baseline.json → journey`.

### 2.1 First visit (student-e, reset to no rows) — 479 KB over the wire, 8 steps (final pinned run 09:33 Z)

| step | lands on | wall | FCP/LCP | understanding at 3 s | at 10 s | the click |
|---|---|---|---|---|---|---|
| 1 land on `/` | `/` | 2.76 s | 1.42 s | "Every subject is a place you can enter." + "Enter a world" visible | the premise, no doors yet | Enter a world → `#for-students` |
| 2 `/subjects` | `/subjects` | 1.30 s | 0.62 s | "Subjects · TEMPORARY SCAFFOLD" — one link (Mathematics), five greyed | understood: one open | Mathematics |
| 3 environment (visitor) | `/subjects/mathematics` | 1.36 s | 0.56 s | "Mathematics · The Lattice — structure you can stand on." then "Navigation position" | three quiet rooms, each "NOT BUILT" | **no action in main** → menu → Sign in (E-23) |
| 4 sign in | `/login?next=%2Fsubjects%2Fmathematics` | 1.98 s | 0.56 s | "Sign in … Signing in opens Mathematics." | the test-accounts notice | Sign in (submit→arrive **999 ms**) |
| 5 threshold | `/subjects/mathematics` | 1.81 s | 0.56 s | same room + **Begin Mathematics** under the strapline | — | Begin (click→arrive **1 876 ms**, the one write) |
| 6 entered | `/subjects/mathematics` | 2.25 s | 1.79 s | the room; "Your record" appears: *discover/choose/enter DONE, four AHEAD* | "Nothing is recorded here yet" | Overview |
| 7 shell | `/student` | 1.33 s | 0.53 s | "LAST OPENED TODAY · Mathematics — The Lattice · You were last here today. · **Open Mathematics**" | "Your subjects" list (1) | Account |
| 8 account | `/student/account` | 0.90 s | 0.53 s | "Student E · This is a test account…" · Sign out | — | — |

**First night total: ~13.7 s of page time across 8 surfaces; the two slowest things are the auth round trip (1.0 s) and the
entry write (1.9 s), not paint.** First paint on the cold home page is 1.42 s; every later surface paints in ~0.5 s
because the framework chunks are cached.

### 2.2 Second visit (student-c, next day, cold cache, read-only) — 422 KB

| step | lands on | wall | FCP/LCP | what it says in 3 s |
|---|---|---|---|---|
| 1 sign in → shell | `/student` | 4.34 s (submit→arrive 1 228 ms) | 1.26 s | "LAST OPENED YESTERDAY · Physics — The Field · ENVIRONMENT IN DRAFT · You were last here yesterday. · **Open Physics**" |
| 2 the environment (GET, no POST) | `/subjects/physics` | 1.65 s | 0.72 s | "Draft subject — still in foundation…" · Physics · rooms · record (enter DONE) |
| 3 the other subject | `/subjects/mathematics` | 1.25 s | 0.82 s | the room, no threshold (not enrolled → `mayEnrol` true → Begin would show; student-c *is not* enrolled in Mathematics: Begin shows — correct) |
| 4 the shell again | `/student` | 0.92 s | 0.54 s | identical to step 1 (no write happened) |

### 2.3 Fast skim — "what now" in three seconds on every surface (from `foldText`, 390)

| surface | the first words in the fold | what now? | dead end? |
|---|---|---|---|
| `/` | Every subject is a place you can enter. Enter a world | go in | no |
| `/subjects` | TEMPORARY SCAFFOLD · Subjects · Mathematics | Mathematics | no |
| env, visitor | Mathematics · The Lattice · Navigation position | **nothing in main** — find the menu | **soft dead end (E-23)** |
| `/login` | Sign in · Signing in opens Mathematics. | sign in | no |
| env, threshold | Mathematics · Begin Mathematics | begin | no |
| env, entered | Mathematics · rooms NOT BUILT · Your record | read; go back via Overview | no (but nothing to *do*: declared) |
| `/student` A | WHAT NOW · Choose a subject · See the six subjects | choose | no |
| `/student` B | FIRST SESSION · Physics — The Field · Open Physics | open | no |
| `/student` C | LAST OPENED … · Open Physics | open | no |
| `/student/account` | Student C · Sign out | leave | no |
| 404 | NOT HERE · See the subjects | back to doors | no |
| honest pages (specimens) | one sentence · one action back to the same path | retry a read | no |

**Dead-end inventory:** one soft dead end (visitor environment on a phone — the way in exists but not in the body),
zero hard dead ends. Every 200 surface has exactly one h1 and ≤1 primary (gate J1/F1).

### 2.4 Adversarial read — managed / nudged / counted / judged?

- **Managed?** No queue, no checklist, no "next step" imperative except the one primary verb. The shell's eyebrow
  "WHAT NOW" (state A) is the closest thing to management; it is a question, answered by one link.
- **Nudged?** No streak, no "don't lose", no "N days since" (GUILT sweep 0 hits in all states; DASHBOARD sweep 0).
  "You were last here yesterday" is recency as fact, not as pressure — but it *is* the sentence a nudge would start
  with; recorded as the line to watch when events exist.
- **Counted?** Never a digit about the person in the student space (J3 pass; arc `digits === 0`). The only digits are
  dates-as-words and the homepage's "1 of 4" sequence (excluded, declared).
- **Judged?** No score, level, badge, percent, "on track". The arc says "ahead", never "incomplete" or "missed".

### 2.5 States as a set

| state | primary | sentence | SR first announcement |
|---|---|---|---|
| A no enrolment | See the six subjects | "Choosing is where this begins." | "Skip to content" |
| B enrolled, never entered | Open Physics | "You chose Physics 2 days ago. Your first session begins when you open it." | "Skip to content" |
| C active | Open Physics | "You were last here 2 days ago." | "Skip to content" |
| threshold | Begin Mathematics | (strapline) "The Lattice — structure you can stand on." | "Skip to content" |
| 404 | See the subjects | "The six subject environments are listed on the subjects page." | "Skip to content" |
| honest page | Open your subjects again | "Your subjects could not be read just now. Nothing was recorded. Opening the page again only reads — it is safe to do." | "Skip to content" |
| login | Sign in | "Signing in opens Mathematics." | "Skip to content" |

One primary per view: yes (F1 across 8 surfaces × 5 viewports; shell.cjs `hierarchy-*` primaryButtons = 1). Back-to-back
disagreement: **one found and fixed (D-4, nav identity)**; none remain on the path. Composition: same mark, same type
scale, same spacing on every surface (shell.cjs `fontRatio 2.24` on A/B/C; environment chrome 3.6's).

### 2.6 CTA hierarchy as a set — the verbatim chain

**Enter a world → Enter → / Enter Mathematics → (Sign in) → Begin Mathematics → Open Mathematics**, with
**See the six subjects / See the subjects** as the two "back to the doors" links. Documented as a three-verb sequence
by state in `docs/STATE_LANGUAGE.md` (5.8 addendum). No fourth verb exists.

---

## PART 3 — HONESTY AUDIT (22 categories)

Method per row: what was read (DOM of the production build, source greps, harness gates), the finding, the evidence of
absence where the finding is "none", and the limit of the method.

| # | category | method | finding | evidence of absence / limit |
|---|---|---|---|---|
| 1 | fake functionality | every button/link on the path followed (J0, shell `links-*`, `action-resolves-*`) | none — every action is a GET or the one POST | limit: specimen frames are static by design (login-refused, in-flight) |
| 2 | fake data | strings read from DOM for a/b/c/d/e; DB rows counted before/after GETs | none; fixtures are test accounts and say so on `/student/account` | fixture dates are clock-relative (E-16) |
| 3 | placeholders | grep for lorem/TODO/example/placeholder text in rendered strings | none rendered; `/subjects` eyebrow "TEMPORARY SCAFFOLD" is a declaration, not a placeholder | — |
| 4 | treatment inconsistency | nav identity, h1 count, fontRatio across states | **one (nav identity on `/subjects/*`) — fixed D-4** | — |
| 5 | silent failures | states.cjs T8/T16/P5-R9 forced REVOKE; breakage (b) | none; a swallowed read is caught by 4 gates | limit: only the enrolments read was forced in 5.8; environment_state and profiles were forced in P5-R9 |
| 6 | pretend auth | `/register` cards, `/login` notice | **over-claim in role cards — fixed D-3**; notice honest | — |
| 7 | dead links | shell `links-*`, page G4, J0 | 0 | — |
| 8 | non-functional affordances | visitor env `<main>` actions | none false; **one missing** (E-23) | — |
| 9 | hardcoded values | grep digits in student-space strings; `claimsProgress` regex | none about the person | — |
| 10 | unused code | `ui/progress.tsx` | exists, restricted (E-17) | no lint rule yet |
| 11 | half-built | rooms, slots | all labelled NOT BUILT with a phase/module; `/subjects` scaffold declared (E-04) | — |
| 12 | counts / refs | test-progress #65 "counts are references" | every count equals its sources | no events exist today — the rule is proven on fixtures only |
| 13 | zeros | test-progress #6; arc `digits===0`; shell sweeps | never emitted; breakage (a) proves the test trips | — |
| 14 | ratios | test-progress #4/#48 | module has no denominator | — |
| 15 | celebration | GUILT/DASHBOARD sweeps ("congratulations", "well done", "keep it up"…) | 0 hits; breakage (e) proves the sweep trips | — |
| 16 | subject rule | h1 of every student surface names the subject (B/C/env) | holds; account/404/honest pages name the person or the address, by rule | — |
| 17 | unknown outcome | T4/T7b (entry failed before/after commit), in-flight specimen | state, not verdict; "Nothing was recorded" only where true | in-flight is a simulation |
| 18 | failure-as-absence | P5-R9 gates (1)(2), T8 | never; breakage (b) | — |
| 19 | traceability | test-progress #7 "arc steps and recency name their rows" | holds | — |
| 20 | progress-that-instructs | arc `interactive === 0`, no CTA in `record` region | none | — |
| 21 | future promises | Part 1.2 | 5 named in the student space, all with a phase/module | "Your first session begins when you open it" is the furthest-leaning line |
| 22 | ordinary-student test | the 3-second skim (2.3) | understood on every surface; one soft dead end | a reader who is not me was not available; the skim is instrumented, not observed |

---

## PART 4 — THE MOBILE PASS

- **Reference 390 × 844** (every journey figure above). **Floor 320 × 568 and 360 × 640**, **1280 × 800**, **1920 × 1080**:
  fold gate F1 across 8 surfaces × 5 viewports = **40 cells, 38 pass, 2 declared** (E-22, login at 320/360: button
  bottom 667 / 644 px). One real defect found and fixed at 320: **D-1, the sign-in page scrolled horizontally**
  (column 354 px wide: a grid item's `min-width:auto` let the input's intrinsic width through; and the brand lockup
  252 px + "Back" 70 px exceeded the 288 px content width). Fix: `min-w-0` on the column; mark-only brand below `sm`
  (the nav shell's own mobile form). `/register` at 320 verified 320 px wide after the fix.
- **Mid-range tier (provenance):** shell.cjs `perf-mid-range` = Lighthouse 13.5 mobile, simulated Moto G Power class,
  4× CPU, slow-4G 150 ms / 1.6 Mbps. Final: **performance 90 · accessibility 100 · FCP 1.4 s · LCP 2.9 s · CLS 0 ·
  TBT 250 ms · SpeedIndex 1.5 s · TTI 3.3 s** (`audit/lighthouse-shell.json`). Two earlier runs the same afternoon
  scored 46/33 with TBT 13–16 s while the dev server was resident in the 2 GB sandbox (kswapd 9 min CPU) — **E-24**,
  recorded so a red there is re-run before it is believed.
- **Slower tier (provenance):** `audit/gate.cjs` `SLOWER_TIER` = 400 kbps / 400 ms, 4× CPU (the "slow network" matrix
  column, 14 states). All pass (h1, ≤1 primary, no h-scroll).
- **8 pm connection, cold cache (400 ms / 1.6 Mbps, 4× CPU):** first paint `/` **1.42 s**; primary availability — the
  one primary is in the first viewport on every step that has one (J2); unverifiable progress claims — none (J3).
- **Dark primary + light:** matrix columns `dark` and `light` for all 14 states — pass. Page G1/G6 contrast and axe in
  both themes — pass.
- **Page-total pin + drift:** first visit **479 KB**, second visit **422 KB** encoded over the wire — pinned in
  `gate-baseline.json`; `--check` fails on ±5 % drift (D1) and on any pinned gate flipping (D2). The pin was 507/411 on
  the first run of the day; after the four fixes it measured 489/423 and then 479/422 on the final tree (**−5.5 % /
  +2.7 %** against the first pin: the nav fix removed the "Create account" link and its chunk from the student path).
  Re-pinned on the final tree with this sentence as the reason.
- **LCP variance (n=5 used, warm-up discarded):** `/` 1356–1396 ms (median 1360) · visitor environment 1336–1380 (1360)
  · `/student` C 1216–1308 (1264). Spread ≤ 92 ms; no bimodality on this profile. Reported, not gated (E-21).
- **Per-route payload, final build, 390, encoded / decoded (puppeteer `Network.loadingFinished` / `dataReceived`,
  cold context, network idle):** `/` 356 / 1 053 KB · `/subjects` 342 / 909 · `/subjects/mathematics` 355 / 953 ·
  `/login` 263 / 825 · 404 328 / 858 · `/student` 330 / 887 · `/subjects/physics` (C) 359 / 974 · `/student/account`
  325 / 869. (Earlier reports quoted decoded *script* KB from a different instrument — 628/574/578; not comparable.)

---

## PART 5 — EXCEPTIONS REGISTER

Consolidated in **`docs/EXCEPTIONS.md`** (columns: exception · what · why accepted · cost · owner · resolving phase).
**Start of Phase 5: 10. Now: 22 open** (14 opened in Phase 5, 2 closed: E-01 D-08, E-11 State-A write). New in 5.8:
**E-22** (login fold at 320/360), **E-23** (visitor environment has no enter action in `<main>`), **E-24** (Lighthouse
memory sensitivity). The minimum list from the brief is present: #99287 (E-18), the auth round-trip (E-12), the RLS
fixture (E-14), `progress_record` (E-15), framework weight (E-06), legal (E-07).

---

## PART 6 — HARNESS TRUSTWORTHINESS

Eight student-specific breakages, each injected into source, built where the gate reads production, run, pasted,
reverted (`git checkout`), and the harness re-run green afterwards.

**(a) A zero count emitted** — `derive.ts countByKind` pushes `{count: 0}` for kinds with no events.
`scripts/test-progress.mjs` → `13/16 passed`:
```
FAIL  4 no output is a fraction or a percent (all fixtures × all functions)
FAIL  6 never a zero — empty record yields no counts, no recency, recordEmpty=true
FAIL  10 per environment — physics rows never enter mathematics' figures; no shared number
```

**(b) A failed read rendered as "not enrolled"** — `data.ts getEnrolledSubjectIds`: `if (error) return new Set()`.
Prod rebuilt; `audit/states.cjs --check` → `41/45 gates pass`:
```
FAIL  T8 /subjects/[id] read failure → honest page (500, one h1, one action → same path), never the threshold, never a 404  ← {"status":200,"h1":1,"primaries":1,… "Begin Mathematics" …}
FAIL  T16 the honest page reads as decided: no red, no icon, no banned word, product is the subject  ← NOT SHOWN …
FAIL  P5-R9 (1) an enrolled student is never offered Begin under a failed read … ← {"envGet":{"status":200,"threshold":true,…},"rows":["2/1","2/1"]}
FAIL  P5-R9 (2) a student's own DRAFT environment never 404s under a failed read … ← {"draftGet":{"status":404,"statePage":"not-found"…}}
```
(First attempt ran states.cjs without rebuilding prod — T8 reads `:3100` — and passed 45/45. That was my error, not a
harness miss; it is recorded because it is exactly the mistake a future runner will make. The run above is after the
rebuild.)

**(c) Draft guard removed at the route** — `[subject]/page.tsx` line `if (s.status === "draft" && prod && !enrolled.has(s.id)) notFound();` deleted.
`audit/permissions.cjs` (16 s): `FAIL  visitor draft env → 404` · `FAIL  non-enrolled student draft env → 404`.
`audit/environment.cjs`: `FAIL  visitor: ready 200, draft 404` · `FAIL  non-enrolled student: ready 200, draft 404`.
Note: breaking only `mayEnrol` would **not** have been caught by these — the route guard is a second layer; both are
needed and both are tested (environment "write: draft subject refused for non-enrolled (404), no row").

**(d) A second primary on the shell** + **(e) a dashboard greeting** — `student-shell.tsx`: `<p>Welcome back — keep it up!</p>` and a second `data-variant="primary"` link. `audit/shell.cjs --check` → 46/57:
```
FAIL  hierarchy-A  — {…"primaryButtons":2,"h1s":1}      (also hierarchy-B, hierarchy-C, slot-extremes)
FAIL  sweeps-A  — {"dashboard":["keep it up","welcome back"],…,"guilt":["keep it up"]}   (also sweeps-B, sweeps-C)
FAIL  no greeting banner · FAIL  one dominant surface · FAIL  no invented activity
```
(`perf-mid-range` also failed in that run with TBT 13 s — E-24, unrelated to the break.)

**(f) Primary pushed under the fold** — a `60vh` spacer above the shell's action. `audit/gate.cjs --check` (SECTIONS=C):
```
FAIL  F1 fold gate (P5-R3): … ← ["A /student (no enrolment)@320x568: primary below fold (See the six subjects bottom 575)","…@360x640: … 712","…@1280x800: … 806", "B …", …]
FAIL  D2 no gate that passed at the pin fails now  ← ["F1 fold gate …"]
```
and in SECTIONS=A: `FAIL  J2 … ← [["1 return: sign in …",{"text":"Open Physics","inFold":false,"bottom":894}], …]`.

**(g) `?next=` dropped** — `actions.ts safeNext` returns `/student` always. First run: the instrument **crashed**
(`No element found for selector: [data-threshold] button`) instead of naming a gate. **That is an instrument defect**
— fixed: a step that throws is recorded as broken, later steps are skipped, and a new gate **J0** judges it. Re-run:
```
  ✗ 6 Begin Mathematics (the one write) BROKE: No element found for selector: [data-threshold] button
FAIL  J0 journey: every step completed (a step that throws — a missing door, a dead button — is a broken journey, not an instrument error)  ← ["6 Begin Mathematics …", "7 … (skipped)", "8 … (skipped)"]
FAIL  J4 first visit: sign-in from the environment returns to the environment … ← {"afterSignIn":"/student","primary":{"text":"See the six subjects",…},"broke":"6 Begin Mathematics (the one write)"}
```
While fixing J0 I found **J5 was written `… || true`** — a gate that could not fail. Rewritten to assert the h1 names
the last-opened subject, the fold says when, the primary is "Open Physics" and the environment's arc has `enter:done`.

**(h) The arc consumer invents "learn — done"** — `arc-region.tsx` maps `learn → done`. `audit/environment.cjs --check`
→ **22/22 PASS, "no diffs". NOT CAUGHT.** The existing arc gates checked vocabulary (done/ahead words, seven steps,
no digits) but not *which* steps may be done. **Missing gate added** to environment.cjs:
```
FAIL  arc: states follow the evidence — discover/choose done; enter done only with an entry row; learn/interact/progress/master never done today (no live evidence module)  ← [["enrolled-draft-entered","discover:done choose:done enter:done learn:done interact:ahead …"],["enrolled-ready-no-state","… enter:ahead learn:done …"],…]
```
environment.cjs is now 23 gates and re-pinned (`--write`) with this reason. Its `gate()` also now prints the detail on
FAIL (it used to print the name only — the evidence lived only in the baseline).

**Flip alarm (next#99287) — state and trip.** The three FLIP-ALARM gates in states.cjs assert `h1 === 0` without
JavaScript on a `notFound()` 404 / error boundary (framework still broken → alarm silent → PASS). Trip proof, same
predicate, production build, JS disabled:
```
/subjects/nonsense        no-JS h1=0 → predicate holds (alarm silent: framework still broken)
/no-such-route-anywhere   no-JS h1=1 → predicate FALSE → the alarm gate would FAIL = TRIP (framework fixed; retire E-18)
```
The unmatched route is server-rendered today; the day the matched route renders like it, the alarm fails and E-18
must be retired rather than silently kept.

**Harnesses green after, re-pinned with reasons:** environment 23/23 (`--write`: new arc gate; visitor RSC hash
changed → informational only since 5.8); gate.cjs 9/9 (`--write`: J0 added, J5 made falsifiable, `foldText` field,
200 %-zoom cell redefined, no-JS cells read synchronously, pin 479/422); shell 57/57 (no re-pin; `lighthouse-shell.json`
refreshed by its own run); states 45/45; permissions 9/9; page 8/8 no diffs; test-progress 16/16; test-next-action
34/34; RLS 20/20.

**What the harnesses cannot do (limits):** they read one browser (Chromium 154) — no Safari/iOS; the specimens for
refused/unavailable/in-flight are simulations; the forced failure is one table's SELECT, not a network partition or a
slow auth server; no screen reader is driven (SR "first announcement" is the first focusable/live text, read from DOM);
Lighthouse is simulated, not a device; the 8 pm profile is Chrome's throttle, not a cell tower; and the fold gate's
selector set does not include the homepage's "Enter a world" (it is a link, not a `data-primary-action`) — the
homepage's own gate (page.cjs G2) covers it.

---

## PART 7 — THE MATRIX

**14 states × 12 conditions = 168 cells · 163 PASS · 0 FAIL · 5 declared EXCEPTIONS.** Conditions: 320 · 360 · 390 ·
1280 · dark · light · reduced motion (0 running animations asserted) · no-JS (DOM read synchronously; JS never
re-enabled) · 200 % zoom (defined as a 640 × 400 CSS-px viewport at 2× — how Chrome zooms a 1280 desktop; zooming the
390 phone would give 195 px, below the reflow floor and not a device) · 1.4.12 text spacing (line-height 1.5,
letter 0.12 em, word 0.16 em, paragraph 2 em; no visible element clips) · slow network (400 kbps / 400 ms) · 4× CPU.
States: A · B · C · environment visitor · threshold · enrolled (arc) · login (next=environment) · account · 404
(`notFound()`) · error page (specimen `student-failed`) · session ended (specimen `login-ended`) · entry failed
(unknown-outcome recovery, `?entry=failed`) · region failing (specimen) · role redirect (`/tutor` as student → `/student`).

**Unfillable cells, with reasons (all one cause):** no-JS × {404 notFound(), error page, session ended, entry failed,
region failing} — the page state is client-rendered by the framework (E-18, #99287); the cell cannot be filled by the
product and is held open by the flip alarm. Every other cell is filled and pass. The full grid, with per-cell h1 /
primary / h-scroll / clipping, is in `audit/gate-baseline.json → matrix` and rendered on `/dev/student-gate`.

---

## PART 8 — `/dev/student-gate`

`src/app/dev/student-gate/page.tsx` — dev-only (`notFound()` in production), server-rendered, **reads** its tables from
`audit/gate-baseline.json`, `docs/EXCEPTIONS.md` and this report (ledgers 1.1/1.2, the PART 3 audit table, PART 6
breakage text, "What this gate cannot see"). Nothing on it is typed by hand; a missing artefact renders as a sentence
saying so. Not linked from any surface.

---

## PART 9 — PHASE-CLOSE VERDICT

1. **Would a student come back tomorrow?** For the room, not yet — there is nothing in it, and it says so. For the
   *shape*, yes: the second visit (2.2) opens on the exact place they left, in one tap, with the truth about what is
   there. The product keeps its one promise (a place that remembers) and makes no other.
2. **Does it deliver the homepage promise? Where is the gap met?** The door-becomes-page promise is delivered (Ledger
   row 1). The gap is met at **the visitor environment's `<main>`** (row 3, E-23: the way in is in the header, not the
   body) and, deeper, at **the room** (rows 5–9: every room is "NOT BUILT" with a phase). Both gaps are named at the
   point where the student meets them.
3. **Is anything dishonest visible?** Three contradictions were visible this morning (D-2 `/subjects` "Phase 4 will
   replace it"; D-3 register cards "submit work and track progress"; D-4 "Sign in" shown to a signed-in student). All
   three are fixed by correcting the wrong half. None remain on the path at the final tree.
4. **What a dashboard would not do:** it would not show a stranger a door with nothing behind it and say so; it would
   not put the person's record *inside* the subject with no number; it would not refuse to write a zero; and it would
   not answer a failed read with "could not be read" instead of an empty state.
5. **What breaks first at 10 / 100 students?** Not the pages. At 10: nothing — RLS bounds every read, the one write is
   idempotent. At 100 concurrent sign-ins: the **auth round trip** (E-12: ~0.9–1.2 s per `getUser()` on every
   `/student` and `/subjects/<id>` request) multiplies on the auth server, and a **paused Supabase project** turns
   every student surface into the honest 500 page at once (the states harness proves the page; nothing proves the
   recovery time). The **2 GB sandbox** is the build/verification machine, not the product: it already swaps under
   Lighthouse + dev server (E-24) and would not survive 100 real sessions as a host — which it is not.
6. **Ready to close?** **Yes, with the register open at 22.** No contradiction remains; every exception has an owner
   and a phase; every harness is green at the same tree; the matrix has no FAIL.
7. **Phase 6 entry + inheritance.** Entry: **the tutor–student assignment (roster) and its RLS policy** — the first fact
   that puts a person in the room and makes "Work with a tutor" reachable; it also lets E-13's draft-enrolment hole be
   closed by policy and E-14's fixture be rewritten. Inherited open items: E-07 (legal — **before any onboarding**),
   E-23 (visitor door in main — recommendation with evidence), E-22, E-12, E-18 (watch the alarm). Live classroom and
   `progress_record` stay Phase 7.
8. **Legal blockers confirmed.** No privacy policy, terms, DPDP posture or contact route exist (E-07). **Auth is built;
   the doors are not opened**: `/register` creates test accounts only and says so. **No real student data was
   created, imported or inferred** — query in TESTS §T15: every non-test count is 0.

---

## TESTS 1–19 (final tree, before commit)

- **T1 tsc / eslint / build:** clean (`next build` exit 0).
- **T2 all harnesses, same tree:** page **8/8 gates, no diffs** · shell **57/57** · environment **23/23** (re-pinned) ·
  permissions **9/9** · states **45/45** · gate **9/9** (J0 J1 J2 J3 J4 J5 L1 F1 M1; D1/D2 in `--check`) ·
  test-progress **16/16** · test-next-action **34/34** · subject-import guard ✓ · RLS **20/20** (`--local`, Postgres 17).
- **T3 what each asserts:** page — contrast, ≤1 primary, scroll budget, dead links, outline, axe, motion/long tasks,
  CLS on `/`; shell — per state A/B/C: hierarchy, fold, no empty slots, 5 sweeps, links, action resolves, no h-scroll,
  touch, zoom/spacing, keyboard, contrast, no-JS, axe, no WebGL; plus C4, POST 303→200, slot extremes, Lighthouse
  mid-range; environment — 7 identity×subject states, 6 write gates on student-e with DB row counts, arc gates (now 6),
  fold at 6 geometries, no-JS; permissions — role redirects, draft 404s, no placeholder leakage; states — 45 gates over
  the honest pages/regions/actions, forced REVOKE, flip alarms, logger; gate — PART 2/4/7 as above.
- **T4 journey timings, screenshots:** PART 2; `audit/gate-shots/`.
- **T5 fold at 5 viewports:** 38/40 pass + 2 declared (E-22).
- **T6 matrix:** 163 pass / 0 fail / 5 declared.
- **T7 breakages:** 8 injected, 7 caught by named gates on first run, 1 instrument crash converted into gate J0, 1
  uncaught → gate added; all reverted; harnesses green after.
- **T8 LCP distribution:** PART 4.
- **T9 payload per route:** PART 4.
- **T10 `.env.local` untouched:** not in `git status`; no value printed anywhere in this report or the logs.
- **T11 no new deps / client JS / tokens / analytics:** `package.json` unchanged; no `"use client"` added; no token
  edits; the only new source files are `src/app/dev/student-gate/page.tsx` (dev-only server component),
  `audit/gate.cjs`, `audit/gate-baseline.json`, `docs/EXCEPTIONS.md`.
- **T12 certified surfaces touched only for demonstrated defects:** `(auth)/layout.tsx` (D-1, 320 overflow),
  `subjects/page.tsx` (D-2), `register-form.tsx` (D-3), `nav-shell.tsx` + `subjects/layout.tsx` (D-4),
  `environment.cjs` (new gate + FAIL detail). Nothing in tokens, arc.ts, modules.ts, 5.1–5.7 artefacts, SQL.
- **T13 exceptions register:** 22 open, counted.
- **T14 flip alarm trips:** PART 6.
- **T15 non-test-identity rows (query, pasted):**
  ```
  profiles where is_test_account is not true = 0
  enrolments whose student is not a test account = 0
  environment_state whose student is not a test account = 0
  auth.users outside @test.tutorsacademy.invalid = 0
  test accounts (for scale) = 5
  progress_record absent = t
  ```
- **T16 `git status --porcelain` (raw, before commit):** pasted in the chat report (REPORT BACK §15).
- **T17 Phase 6 not begun:** no roster code, no tutor policy, no new route.
- **T18 DEC-012 updated** in `docs/DECISIONS.md` to the full gate.
- **T19 STOP** after the report.

## What this gate cannot see

- A real student. Every "understood in 3 s" is an instrumented read of the fold, not a person.
- Safari / iOS, a real mid-range phone, a real cell tower. All throttles are Chrome's.
- A screen reader's actual announcement order; the SR column is DOM order.
- Time: the second visit is "yesterday" by fixture, not by a day passing.
- Recovery after a paused project; auth-server latency under load; anything beyond one table's forced SELECT failure.
- Whether "Your first session begins when you open it" will be read as a promise or a description. It is the sentence
  most likely to disappoint after a week and it is named in Ledger 1.2 row 1.

## Defects fixed in this gate (all demonstrable, no features)

| # | defect | evidence | fix (smallest) |
|---|---|---|---|
| D-1 | `/login` and `/register` scroll horizontally at 320 (column 354 px) | fold gate: `login@320x568: hscroll`; measured `scrollWidth 354`; brand lockup 252 + Back 70 > 288 | `min-w-0` on the auth grid column; mark-only brand below `sm` |
| D-2 | `/subjects` says the chooser "is built in Phase 4 and will replace it" — false | Ledger 1.1 row 14 | sentence + meta description corrected to what is true |
| D-3 | `/register` role cards claim submit/track/grade/manage | Ledger 1.1 row 15; banned family | "Learn inside a subject's environment." / "Teach inside a subject's environment." |
| D-4 | signed-in student shown "Sign in · Create account" on `/subjects/*` | nav read as student-c: `/student` → "Student C · Sign out"; `/subjects/physics` → "Sign in · Create account" | NavShell: `account ?? (mode…)` in both desktop and sheet; subjects layout passes the identity it already reads |
| D-5 | gate instrument: step crash instead of a gate (g); `J5 … || true` unfalsifiable | PART 6 | J0 added; J5 rewritten; no-JS synchronous read; zoom cell redefined |
| H-1 | environment.cjs could not see a lying arc consumer | breakage (h) 22/22 pass | gate "arc: states follow the evidence" added; FAIL prints detail |
