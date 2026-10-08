# Declared exceptions — consolidated register (Phase 5 · Step 8)

An exception is a known gap that is **stated, not hidden**: the gate records it, the product copy (where a student
could meet it) says so, and a phase owns its resolution. An exception is never a pass. This register replaces the
scattered notes in `docs/DECISIONS.md` (DEC-004…012), `PHASE4_STEP9_GATE_REPORT.md` §13 and the per-step reports; it
is read by `/dev/student-gate`.

**Count.** Carried into Phase 5 from the 4.9 close: **10** (E-01…E-10). Opened during Phase 5: **14** (E-11…E-24). Opened in 6.2: **2** (E-25, E-26). Closed in 6.3: E-25, E-26.
Closed during Phase 5: **2** (E-01 by Addendum A, E-11 by 5.5). **Open now: 22.** The number went up, not down —
Phase 5 added a database, an auth round-trip and a framework defect to the surface area; none of the additions is
silent.

| # | exception | what | why accepted | cost | owner | resolving phase |
|---|---|---|---|---|---|---|
| E-01 | D-08 scroll budget | Homepage total 11.01 vs declared 11 screens | One-time correction event recorded; policy "declaration precedes geometry" (page.cjs `correctionPolicy`) | none now | page.cjs | **closed** — 4.9 Addendum A |
| E-02 | S1/S2/S6 trims | 4.9 recommended length edits to three scenes | Copy pass, not a defect; no false claim | reading time | homepage owner | Phase 10 copy pass |
| E-03 | S5→S6 merge | Two scenes could be one | Redesign, outside any verification gate | one extra scroll | homepage owner | Phase 10 |
| E-04 | `/subjects` scaffold | The list page says "TEMPORARY SCAFFOLD" and is still the only list route | 4.9 §14 recommended replacement; 5.8 corrected its false "Phase 4 will replace it" sentence. The six doors on `/` are the chooser | a second, poorer chooser exists | homepage owner | Phase 10 (or earlier with a ruling) |
| E-05 | premise quietLine | Wording flagged in 4.3 | Copy pass | none | homepage owner | Phase 10 |
| E-06 | Framework JS weight | ~330–360 KB encoded per route is framework, not product | No app-level fix (Next 16 app router); measured every gate (pin-and-drift, never a ceiling) | 8 pm cold first paint 1.3–1.4 s LCP on the 400 ms / 1.6 Mbps profile | build | Phase 10 (bundle audit) |
| E-07 | Legal / contact / DPDP | No privacy policy, no terms, no DPDP (minors) posture, no contact route | **Blocks real students.** Stated on `/login` and `/register` ("Test accounts only… waits on the privacy, terms and data-protection work") | the doors stay closed | owner (legal) | **CLOSED — Phase 10 · Step 1 (2026-10-08, DEC-037):** the legal framework stands on three public routes — `/legal/terms` (Terms of Academy Practice) · `/legal/privacy` (Privacy & Data Protection Notice) · `/legal/guardian-consent` (Guardian Consent Framework): serif headings, reading measure, zero tracking, linked from the footer (the footer's pre-declared growth point). Migration 0011 creates `legal_consents` — the consent audit (terms_v1 · privacy_v1 · guardian_consent_v1; guardian_email REQUIRED for a guardian consent and FORBIDDEN otherwise; ip_hash a one-way SHA-256 digest, the raw address never stored; RLS enabled AND forced, own-only SELECT/INSERT, tutors/admin/anon denied by absence, no update/delete — rows fall only with the account). The guardian gate (`src/components/legal/guardian-gate.tsx`) is built and proven at `/dev/guardian-rehearsal`: the DPDP sentence verbatim, ONE email field with its purpose stated, zero dark patterns. OWED, declared: the gate's wiring into real onboarding (no date-of-birth question exists yet) and the confirmation-link delivery channel. The contact clause: the privacy notice carries the grievance section; the standing contact route publishes the day real onboarding opens. The `/login` and `/register` notices now state the framework stands (E-22 anticipated this replacement). Gate7 privacy audit re-run PASS over 304 files (rebaselined 296 → 304; the notice's refusal vocabulary allowlisted, declared). |
| E-08 | Ambient for five subjects | Only Mathematics' ambient layer exists | Five subjects are "in foundation" and say so on every surface | the other five rooms are flat | environment owner | after five-subject approval |
| E-09 | Route-boundary full switch | 3.6 switch at the route boundary not completed | Superseded by the environment route; the shell→environment move is a full navigation | one full page load per door | environment owner | ~~Phase 7~~ **carried — 7-gate:** Phase 7 built the live classroom, not the switch; the next environment work owns it |
| E-10 | `ta:door` receiver dormant | Ambient at Stage scale dispatches an event nothing receives | By design until a receiver exists | none visible | environment owner | ~~Phase 7~~ **carried — 7-gate:** same reason as E-09 |
| E-11 | State A no enrolment write | The shell could show "Choose a subject" with no way to write a choice | — | — | 5.5 | **closed** — 5.5 `POST /subjects/[id]/enter` (DEC-004→007) |
| E-12 | `getUser()` per request | ~400–900 ms server round-trip on every `/student` and `/subjects/<id>` request (journey: submit→arrive 914 ms first night, 1 160 ms cold) | Correctness first: the session is verified against the auth server on every read; no device cache of student data (minors) | the slowest step in the journey is the auth round trip, not the page | data | Phase 10 (DEC-005) |
| E-13 | Subject status lives in TS config, not in the DB | RLS cannot refuse a draft enrolment by subject status; a student with a valid JWT could insert a draft enrolment via REST | Failure mode is benign (an honest environment with a draft label); the door predicate `mayEnrol` is one function | a REST client can open a draft door early | data | **Ruled 6.1 (DEC-013): identity is CHECKed in the DB (`is_subject_id`, three tables); status stays TS and no policy may reference it.** The REST hole stays a door-side rule, open at that layer by design — not a policy's job. `docs/TUTOR_VISIBILITY.md` §4/§8 |
| E-14 | RLS test asserts `count(profiles)=4` | True only on an empty database (Tier 3 `--local`, 20/20 pass); against the project with five test accounts that one assertion fails | The local run proves the policies; the project run is not the policy test | the RLS proof is a throwaway Postgres, not Supabase Auth | data | **closed — 6.1 (DEC-013):** fixture manifest table + `is_test_identity()`; invariants "every fixture identity has one profile" / "no profile belongs to a non-test identity". 56/56 on `--local` AND on the project |
| E-15 | `progress_record` does not exist | The arc's evidence rule has no table; `docs/proposed/progress_record.sql` is a proposal | 5.6 ruling: schema-free; nothing can be recorded, so nothing claims to be | "Learn / Work / Watch / Master" can only ever read "ahead" | data | **CLOSED — Phase 7 · Step 1 (2026-10-08, DEC-022):** `supabase/migrations/20261008000004_progress_record.sql` creates the ruled shape (referent interim-neutral; tutor read via is_related_tutor; no authenticated writes; retention untouched). Live apply owed to the credentialed environment. |
| E-16 | Fixture dates are clock-relative | student-b/c/d "yesterday / 2 days ago" drift with the clock | Test data; re-stamped by shell.cjs | harness strings drift (not product) | harness | ~~Phase 7~~ **carried — 7-gate:** Phase 7's real events land in `cohort_sessions`/`progress_record` (live DB); the harness fixtures still drift and need a credentialed re-stamp |
| E-17 | `ui/progress.tsx` exists | A Phase-2 progress-bar primitive, unused, forbidden for learning over time | DEC-009 restricts it; header line names the rule; no gate forbids an import | one wrong import away from a bar | primitives | Phase 10 (lint rule) |
| E-18 | next#99287 — `notFound()` / error boundaries are client-rendered | A 404 reached from a *matched* route and every error boundary are blank without JavaScript (Next 16.3.6; reproduced at canary) | No app-level fix; **flip alarms** in `audit/states.cjs` fail the day the framework changes so the exception is retired, not forgotten (trip proven in 5.8 §6) | 5 matrix cells (no-JS × 404/error/session-ended/entry-failed/region-failing); ~5 s blank window on the 8 pm profile | framework | retire when the upstream fix ships (DEC-010/011) |
| E-19 | `audit/*.cjs` unlinted | The harnesses are outside eslint's project | Verification code; typed by use | a harness bug is found by a harness | harness | Phase 10 |
| E-20 | environment.cjs visitor DOM hash | Includes chunk filenames; re-pinned on every build with a declared reason (two correction events so far) | Informational — not a gate since 5.8 (hash changes print as `note:`) | noise | harness | Phase 10 |
| E-21 | LCP variance | LCP on the 8 pm profile is reported as a distribution (n=5 after a discarded warm-up), never gated | P5-R4 Add.3 / D-08: report-only outliers | none | harness | permanent (policy) |
| E-22 | Sign-in form primary below the fold at 320×568 / 360×640 | "Sign in" bottom lands at 667 px / 644 px; the fields are in the fold, the button is the next thing under them; the test-accounts notice (E-07's copy) takes the room | The fold gate is for one-answer surfaces; a form's submit sits after its fields by necessity. Moving the notice or shrinking the form is the auth surface owner's layout decision, not a gate fix. Declared in `audit/gate.cjs` `FOLD_EXCEPTIONS` and reported, not passed | on the two smallest phones one swipe precedes the button | auth (5.1) | Phase 6 (E-07's notice WAS replaced by real legal copy — Phase 10 · Step 1, DEC-037; the fold declaration stands, the copy premise is gone) |
| E-23 | Visitor environment has no enter action in `<main>` | At 390 the only way in from `/subjects/mathematics` as a stranger is header → menu → "Sign in" (instrumented: `visibleActionsInMainBefore = ["Mathematics→/subjects/mathematics"]`, i.e. only the nav position link). The environment's own body offers nothing | Adding a sentence + link is new copy and a new affordance (forbidden in a gate). The homepage's "Enter Mathematics" lands here; a visitor who arrived with intent has to find the menu | the "enter" verb chain breaks for a signed-out visitor on a phone: 3 taps where 1 was promised | environment owner | **closed — E-23 fix (DEC-014):** the existing Sign in action now stands in `<main>` of an open environment for a visitor (`data-visitor-door`, plain `<a>` → `/login?next=<environment>`), one primary, in the fold at 320/360/390/1280/1920; gate journey step 4 = 1 tap (was 3). No new verb, no "sign in to enter" sentence |
| E-24 | Lighthouse `perf-mid-range` is memory-sensitive | In the 2 GB sandbox with the dev server resident, shell.cjs's simulated Moto-G run produced TBT 13–16 s and LCP 4.8–7.4 s twice in one afternoon; the same build scored 90 / LCP 2.9 s / TBT 250 ms when run after dropping caches. kswapd time confirms swapping | The gate is kept (it is the only mid-range CPU gate); a FAIL must be re-run once with the dev server stopped before it is believed. Recorded here so a future red is not mis-read as a regression | one flaky gate | harness | Phase 10 (dedicated runner) |
| E-25 | Money and analytics language in two planned-module summaries | `payments.summary` ("Plans, checkout, invoices, refunds and tutor payouts.") and `tests.summary` ("…detailed performance analytics") remain in `src/config/modules.ts` | Audience today: nobody (`/admin` is reachable by no account; `/tutor` no longer renders the registry list). P6-R5 forbids adding money language and asks for a ruling before any is kept; a roadmap description is not a copy correction | a future surface that renders registry summaries would print them | **CLOSED 6.3 (P6-R8):** the registry is not a wish list — an entry needs a delivering phase (P1–P10) and neither `tests` nor `payments` has one; both entries DELETED (no consumer referenced the ids; homepage strings unchanged, 141 → 141). Money language is banned absolutely on every surface, string class swept (summary · blurb · description · module names · alt text · metadata · email templates: zero hits outside comments and dev never-lists). `siteConfig.description` (og/twitter/meta on every page) was a false feature list ("live classrooms, recorded lessons, assignments, assessments and an AI learning assistant") and was rewritten to a true sentence; `siteConfig.tagline` ("Live tutoring, built for real learning outcomes.") is the brand frame and is left — reported as a USER item. The business-model question (does the academy handle money in-product?) is the owner's; until ruled, no money word | closed | — |
| E-26 | `tutor-portal` status is `planned` while `/tutor` has a shell | Flipping to `in-progress` changes the homepage (Scene 5 label "Next · not built yet" → "In foundation") — a declared-exception decision, not taken unilaterally in 6.2 | Honest either way: the shell exists; the tutor's side of the *environment* does not | Scene 5 under-states what exists | **CLOSED 6.3 (E-26 ruling applied):** `tutor-portal` STAYS `planned`. The sentence in Scene 5 reads, verbatim, `{STATUS_LABEL[status]} — the tutor's side of the environment.` and its label reads the registry entry `tutor-portal` (`statusFor(modules, ["tutor-portal"])`). "The tutor's side of the environment" asserts the tutor's capabilities inside the room (the five levers), not the relationship; so the label is bound to the fact its sentence asserts and does not move. No homepage string changes; no exception declared; no status flipped | closed | — |

## What is not an exception

- The three verbs **Enter → Begin → Open** are one sequence by state, documented in `docs/STATE_LANGUAGE.md` (5.8 addendum); not a drift.
- "Environment in draft" on student-b/c/d's Physics is a true label (Physics is `draft` in `src/config/subjects/`); the student is admitted because enrolled access is unconditional (P5-R4).
- The homepage's "1 of 4 … 4 of 4" in Scene 6 (The practice) is sequence numbering of four described steps, each labelled "Next · not built yet" or "In foundation" — not a progress figure. The gate's J3 excludes `/` for that reason and says so.

### 6.4 note (no new exception)

The shaping surface `/tutor/[subject]/environment` has no entry point from the 6.2 shell (the shell's composition is not 6.4's to edit); it is reached by URL. This is a reported gap, not a declared exception: nothing a student or tutor can meet says something false, and the owner decides where the way in lives (shell row? subject group heading? a tutor-nav item?). Count unchanged: **22 open.**

### 6.5 note — declared harness exceptions, no new product exception

`audit/tutor-baseline.json` re-pinned: state B gains one link per subject group (P6-R17; composition, ratio, fold unchanged — `repinReasons`). `audit/environment-baseline.json`: visitor-ready DOM hash change declared (6.4's shell-root attributes; proven the only change) and the P6-R20 declared cost recorded. The 6.4 "no way in" gap is CLOSED by P6-R17. Count unchanged: **22 open.**

### 7-gate note — consolidation at the Phase 7 close (2026-10-08)

**No new product exception opened.** The live classroom never meets a student while `live-classroom`
is `in-progress` (the module gate holds the room staged; every surface a visitor or student can
reach is pinned and green), so nothing Phase 7 built can be encountered half-finished. E-15's close
was already recorded in Step 1 (DEC-022). **Three rows carried forward honestly:** E-09, E-10 and
E-16 were assigned to "Phase 7" when the roadmap expected the phase to include switch and harness
work; Phase 7 built the classroom instead, so the rows are struck and re-assigned above rather than
quietly counted as done. **Count correction, declared:** the count line is stale (written at the
Phase 5 close). Recounted from the table at the 7-gate: 26 opened, 7 closed (E-01 · E-11 · E-14 ·
E-15 · E-23 · E-25 · E-26) → **19 open.**

### Phase 8 gate note — no new product exception (2026-10-08)

Phase 8 built the archive's schema, shelf, viewer and milestone synthesis (Steps 1–4,
DEC-029…DEC-032). **No new product exception opened, for one structural reason:** the archive can
never be met half-finished. It speaks only where real rows stand, and the ONLY capability that can
write them — the service-role artifact writer (board snapshot at conclusion, notation, chamber
audio) — is unwired. Every reachable state today is therefore an honest, pinned absence: the empty
shelf sentence · the opener that mounts nothing without a row · the synthesis dormant under the
registry gate (`live-classroom` stays `in-progress`; `recorded-classes` stays `planned`) · the
viewer that states unsigned/unavailable in one calm sentence. Nothing Phase 8 built asserts a fact
the record does not hold, and no surface says something false about the archive's contents. The
W1–W5 gate (PHASE8_GATE_REPORT.md) verified this with committed baselines
(`audit/phase8-archive.json` · `audit/phase8-language.json` · `audit/phase8-performance.json`).
Count unchanged: **19 open.**


### Phase 9 gate note — no new product exception (2026-10-08)

Phase 9 built the Socratic engine and its two surfaces — the student's lens
(Steps 1–2, DEC-033/034) and the tutor's diagnostic mirror (Step 3,
DEC-035). **No new product exception opened, for the same structural reason
as the archive:** nothing Phase 9 built can be met half-finished. The lens
and the panel speak only where real rows stand, and the schema that holds
them (migrations 0009–0010, with 0004–0008) is unapplied in the project DB:
today the exchange read fails and BOTH surfaces render nothing (the isolate
posture — silence, not a box); the composer cannot write without the schema;
the panel's empty overview returns null (no DOM); the `ai-assistant` module
stays `planned` in the registry (the lens renders facts-gated, the DEC-008
precedent, declared — no homepage drift). The one visible surface, the dev
rehearsal, 404s in production and says SPECIMEN where it stands. Two
DECLARED evolutions, both recorded, neither an exception: the environment
slot map's `ai-assistance` entry moved to gate "facts" (DEC-034), and the
relationship surface's statement sentence evolved to name preparation
(DEC-035) — the 6.3 browsered baseline re-pin stands owed with the DEC-030
debt. The W1–W5 gate (PHASE9_GATE_REPORT.md) verified this with committed
baselines (`audit/phase9-pedagogy.json` · `audit/phase9-privacy.json` ·
`audit/phase9-performance.json`; `audit/phase7-privacy.json` rebaselined
284 → 296 files, declared). Count unchanged: **19 open.**


### Phase 10 · Step 1 note — E-07 CLOSED, the register drops to 18 (2026-10-08)

Phase 10 opened on the legal framework: three public routes
(`/legal/terms` · `/legal/privacy` · `/legal/guardian-consent`), the consent
audit (migration 0011) and the guardian gate — the work E-07 has blocked
since the Phase 6 entry. **E-07 is CLOSED** (full record in its row). The
gate's wiring into real onboarding and the confirmation-link delivery
channel stand OWED and declared in the closure record — they belong to the
day real onboarding opens, which stays closed (test accounts only). No new
exception opened by this step. Count: **18 open.**

### Phase 10 · Step 2 note — onboarding stands, count unchanged (2026-10-08)

Step 2 wired the framework into real registration: the age gate, the
pending_guardian dormancy (enforced by a database trigger), the guardian
verification ledger and token handler, and the tutor invitation gate
(DEC-038). **No new exception opened.** What the step OWES is recorded in
DEC-038, not here, because each owed item is a delivery step, not a
silence the product hides: the confirmation-link delivery channel (the
gate says so at the moment of consent) · live apply of 0012 with
0004–0011 · the tutor invitation/credential-review surface · the
credentialed round-trip walks. One premise-shift declared: rls_test.sql's
"every account is flagged test" assertion documents the pre-onboarding
era; against a project DB holding real signups it will fail BY DESIGN —
declared, never weakened. Count unchanged: **18 open.**

### Phase 10 · Step 3 note — hardening stands, count unchanged (2026-10-08)

Step 3 hardened the edge (DEC-039): the six security headers on every
route, the sliding-window limiter on the sensitive routes, and the
zero-leak sweep CLEAN over 532 tracked text files. **No new exception
opened.** The declared costs and owed upgrades live in DEC-039:
frame-ancestors 'none' refuses iframe embedding by design · nonce-based
CSP tightening · the LiveKit connect-src addition · the shared-store
limiter for multi-instance deployments · the timing-parity walk. Count
unchanged: **18 open.**

### Phase 10 gate note — the capstone ran clean, count unchanged (2026-10-08)

The Final Platform Gate (W1–W5, DEC-040) ran to verdict with ZERO
remediation: 308 tests green across all ten phases, both static guards at
their declared baselines, the zero-leak sweep clean (one self-clean fix to
the sweep's own documentation, declared in the window), five windows, five
passes. **No new exception opened.** What the gate OWES is the launch
checklist itself — recorded in `PHASE10_FINAL_GATE_REPORT.md`, not here,
because each item is a credentialed or browsered act, not a silence the
product hides: the live apply of 0001–0012 · the three environment
variables · the email delivery channel · the credentialed walks · the
browsered baseline re-pins · the owner rulings. Count unchanged:
**18 open.**
