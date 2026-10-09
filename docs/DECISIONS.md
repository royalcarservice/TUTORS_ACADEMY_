# Decision log

| # | Date | Decision | Source |
|---|---|---|---|
| DEC-001 | 2026-09-27 | **D-08 settlement**: Scene 3 `scrollBudget` 1.2 → 1.4 recorded as a one-time correction event; regression detection runs on measured actuals; mobile total pinned; per-scene mobile outlier signal report-only. | PHASE4_STEP9_GATE_REPORT.md, Addendum A |
| DEC-002 | 2026-09-27 | **P5-R1 Phase 5 substrate ruling**: Supabase (Auth + Postgres + RLS) executes the Phase-1 locked stack; only `@supabase/supabase-js` and `@supabase/ssr` may be installed in 5.1; cookie sessions via `@supabase/ssr` refreshed in the proxy; permission matrix enforced as RLS, tested against a database; service-role key server-only; visitors need no account for anything that does not persist; version control initialised with the certified pre-Phase-5 state as first commit; route root for the student shell is the existing `/student` (no `/learn`); module registry is the single source of "not built yet" and nothing may render a capability it does not declare built; signup in Phase 5 is for test accounts only — legal blockers (privacy, terms, contact, DPDP 2023 incl. children's data) are the owner's and are not to be invented in code. | Owner ruling P5-R1, attached to 5.1 |

## DEC-003 — Phase 5 · Step 3 decisions (2026-09-28)

- **Route root stays `/student`** (P5-R1 Part 4). `/learn` was not created.
- **Chrome = 2.6 NavShell in Room mode.** The Phase-1 `PortalShell` (sidebar with "Coming to this portal" rows + a "Sign in" link) is no longer used by the student segment — it advertised planned modules and a sign-in to a signed-in user. Tutor/admin segments keep it until Phase 6.
- **NavShell API extension, not structure:** optional `account` prop replaces the "Sign in" entry when a real identity exists.
- **IA = 3 nav items** (Overview, Subjects, Account), all resolving. Extension: append to `src/config/student-nav.ts` only after the route exists.
- **Draft subjects: labelled, not locked.** `/subjects/[subject]` admits an identity enrolled in a draft subject in production (the one change to a certified route; visitors/non-enrolled still 404).
- **Enrolment write is 5.5's.** State A routes to `/subjects`; choosing there does not yet create an enrolment row. B/C are reachable only via test accounts until 5.5.
- **Module registry untouched:** `student-portal` remains `planned` (its summary is schedule/work/progress, none of which exists). The shell renders only identity, enrolments and environment state.
- **Node ≥ 22 is now a runtime requirement** (`@supabase/supabase-js` 2.117 needs native WebSocket); lockfile moved 2.109.0 → 2.117.2 to satisfy `@supabase/ssr`'s peer range.
- **Test accounts** provisioned via `scripts/test-account.mjs` (service role, CLI only) and SQL fixtures for B/C — flagged `is_test_account`, deletable with the same script.

## DEC-004 — P5-R2 correction pass (2026-09-28)

- FIX 1: `entry_count` is data, never screen. Resume surface renders environment + "You were last here {when}." only; with no `last_entered_at` it says nothing about time. No replacement metric.
- FIX 2: NavShell brand link hit area 44×44 via padding + compensating negative margin; mark 28×28 and its position unchanged; page harness no diffs.
- FIX 3: `audit/permissions.cjs` records the two authorization behaviours as EXPECTED in `audit/baseline.json` (`authorization` key) with 9 checks.
- MEASURE 4: the 5.3 claim "844px tall, nothing below the fold in any state" is **withdrawn** — it held only at 390×844. Corrected claim: the primary action is above the fold at every measured viewport; subject rows scroll below it on 320×568/360×640 and with four subjects. No compression (no fixed heights, clamps, svh or clipped overflow in `main`).
- Deploy requirement Node ≥ 22 recorded in `package.json#engines` and `.nvmrc`.
- State A does not close the loop (no enrolment write) — accepted declared exception, 5.5 owns it. No enrol button, no note.

## DEC-005 — P5-R3 correction pass (owner ruling)
- FIX 1: State A line "Six environments are open…" was FALSE (one subject `ready`, five `draft`; visitor gets 404 on draft) → replaced with "Choosing is where this begins." No explainer added. All other shipped shell strings verified TRUE (table in `PHASE5_R3_CORRECTION_REPORT.md`).
- Draft enrolment: `enrolments` INSERT policy checks only that the slug is one of the six; it does NOT check `status`. A signed-in student MAY enrol in a draft subject once 5.5 ships enrolment. This is intended (enrolment outranks public availability); enrolled students already get 200 + "Environment in draft" on draft routes.
- FIX 2: middleware runs on `/`; measured no cost for signed-out requests (getUser() with no cookie is local). No no-cookie fast path added. Phase 10 item: per-request `getUser()` on signed-in requests (~420 ms TTFB on `/student`) → consider `getClaims()`/JWT verification.
- FIX 3: old "page fits" assertion (documentHeight / belowFold) REMOVED from `audit/shell.cjs`; replaced by named gate "PRIMARY ACTION ABOVE THE FOLD" at six conditions × states A/B/C + State C with four subjects (persistent test account `student-d`, four enrolments — test account only, not prod data). Document height is deliberately not asserted.

## DEC-006 — 5.4 next-action engine
- The engine is a pure module (`src/lib/next-action`): providers → resolver → one Candidate. Tier order declared (1 NOW/expiry · 2 SOON/timestamp · 3 WHENEVER · 4 ORIGIN); 5.1's six rungs map onto it unchanged (rungs 1–2 → T1, 3 → T2, 4–5 → T3, 6 → T4). Built 5.1's order; no conflict found.
- Tier 3 accepts a durable candidate WITHOUT a timestamp (an enrolment with a null `enrolledAt` is still true); it sorts last among never-entered. A PRESENT but malformed timestamp is rejected. Reason: the brief's "Tier 3 requires lastEnteredAt" cannot literally apply to `begin`, and a missing date must not turn an enrolled student's answer into "choose".
- Capability gate for the two shipped providers = `public-website` (the only `live` module; it owns `/subjects/*`). `student-portal` stays `planned` and is NOT flipped. Future providers gate on their own entries (`docs/NEXT_ACTION_EXTENSION.md`).
- `Candidate` carries `eyebrow`, `cta`, `capability`, `at`, `lastEnteredAt`, `enrolledAt` in addition to the brief's shape — additive, so the surface renders verbatim and the resolver can state every rejection reason.
- `deriveNextAction` (5.1 contract) is retained as the benign-fallback shape only. `whenPhrase` moved to `src/lib/next-action/when.ts` (re-exported from the shell for compatibility).
- Tests run with `node --import ./scripts/ts-loader.mjs scripts/test-next-action.mjs` (Node 22 type stripping; no new dependency).

## DEC-007 — P5-R4 ruling + 5.5 environment workspace (2026-09-28)
- **P5-R4:** creating an enrolment mirrors 4.4's door logic by READING it — `src/lib/subjects/door.ts#isOpen` (hoisted from the Choice scene) → `src/lib/student/enrol.ts#mayEnrol`, the ONE predicate answering "may this identity enrol here". Both the threshold's visibility (page) and the write's authority (route) call it; nowhere else decides. Access while enrolled is unconditional (draft included).
- **Limitation recorded:** subject status is TS config; RLS enforces OWNERSHIP only (a student with their own JWT could insert a draft enrolment via REST — benign: an honest, labelled environment). Subject config is NOT duplicated into the DB. Revisit at P6/P7 (tutor-assigned enrolment).
- **Addendum 1 principle:** absence of data may reduce what an answer says, never whether there is one; malformed ≠ missing, named in code where handled.
- **Addendum 2 (registry):** `student-portal` `planned` → `in-progress` (the schema has no "partially built" — `in-progress` is the closest honest value; recorded in the entry's comment). Consequences declared: homepage Practice/Promise beats read "In foundation" (page baseline re-pinned, 722→716 words); 3.6 Room note for work/progress now says "in progress in the module registry — the student shell exists; assignments, tests and progress do not yet" (the visitor DOM hash re-pinned once for exactly this line). The next-action enrolment provider keeps its `public-website` gate (`isLive` requires `live`; flipping the gate to `student-portal` would silence the provider — worse honest behaviour). Proposed for P7: a per-capability status on registry entries.
- **Addendum 3:** LCP bimodality is a NOTED VARIANCE in `audit/shell.cjs` (`notedVariance`), not a gate. Re-measured after a discarded warm-up: still bimodal cold (2.1–2.5 s ×2 / 3.2–3.4 s ×7); repeat-visit unimodal 0.9–1.1 s ×9 → the gap is asset fetch under simulated slow-4G. Logged for Phase 10. TTFB median 460 ms recorded, not optimised.
- **Addendum 4:** no worktrees / second node_modules; old-vs-new comparisons done by `git stash -u` → build in place → measure → pop → rebuild.
- **P5-R5 (one environment):** no `/student/[subject]`. `/subjects/[id]` renders the same composition for everyone; identity decides server-side whether the THRESHOLD (non-enrolled + enterable) or the student's REGIONS (enrolled; all absent today, so nothing renders) are added. Visitor DOM is byte-pinned (scripts stripped; RSC flight payload hashed as informational because chunk ids change per build).
- **Visit ≠ entry:** the only write is `POST /subjects/[id]/enter` (GET → 405; no session → 303 relative `/login?next=…`; non-student → 403; not enterable → 404). Request-scoped student client, `enrolments_insert_own` exercised. Idempotent via UNIQUE (student_id, subject_id) + `ignoreDuplicates`. The shell's primary action for an enrolled subject is a form POST (same composition) — tradeoff: middle-click/new-tab does not open the environment without entering it; accepted, recorded.
- **Redirect Location is RELATIVE** (`seeOther`): an absolute URL built from `request.url` under `next start -H 0.0.0.0` switched the browser origin and dropped the session cookie.
- **Nav back to `/student`:** the subjects layout gives a signed-in student the existing nav item "Overview" (server-decided; visitor chrome unchanged). On <1024px NavShell places all items in the menu sheet, so the way back is one tap away behind the trigger — 3.6's chrome; no new visible element added (would change the visitor composition).
- **Harness:** `audit/environment.cjs` (7 identity×subject states, 6 write gates on the dedicated write account `student-e`, DB row counts before/after every GET). Harness never POSTs as student-a/b/c; live shell POST gate (C4) on student-d only. Known fragility (pre-existing): shell baseline strings for State C depend on `student-c`'s `last_entered_at` being "yesterday" relative to now — earlier test POSTs had moved it to today; reset to `now() - 1 day`. Phase 10: make the fixture clock-relative or pin the string differently.
- **RLS test vs real project:** `supabase/tests/rls_test.sql` asserts `count(profiles) = 4` — true only on an empty database (Tier 3 `--local`, 20/20 pass); against the project with five test accounts it fails on that count. Not changed (test design, not policy); noted.

## DEC-008 — P5-R6 progress is a record, not a score · 5.6 (2026-09-29)
- **Order:** 5.5 reported and committed (`0c3ab05`) before 5.6 began. INSPECT reported first; two questions put to the owner before building (table, gate) — answers: build schema-free; gate the arc on the facts it renders.
- **`progress_record` does not exist.** 5.1 (executed without its brief) created profiles, enrolments, environment_state only. 5.6 applies NO migration. The event shape is expressed as the TypeScript type `ProgressEvent` (`src/lib/progress/events.ts`); the proposed DDL is in the 5.6 report as a **5.1 amendment for the owner to rule on**. Every production caller passes `events: []` — absence, never inference.
- **Pure module `src/lib/progress`:** exports exactly `EVENT_KINDS, EVENT_KIND_MODULE, STEP_EVIDENCE, admissibleKinds, arcPosition, countByKind, latestEvent, validateEvents`. Counts and recency only; every value carries `sources`; `count === sources.length`; a kind with no rows is absent (never 0); no clock/DB/env; malformed → `defects`, missing → state. Tests: `node --import ./scripts/ts-loader.mjs scripts/test-progress.mjs` (16).
- **A kind is admissible only while its module is live** (`EVENT_KIND_MODULE`): none today. Events of an inadmissible kind never count, even if present.
- **The arc:** ONE definition `src/config/arc.ts`; Scene 7 re-exports it as `MARKERS` (homepage HTML unchanged, page baseline no diffs). Environment state words "done"/"ahead" (4.7's, minus "on this page" — the change 4.7 §13 foresaw). discover ← account · choose ← enrolment · enter ← entry; learn/progress ← admissible events only; interact and master have no evidence rule and stay ahead until a later phase defines one.
- **Region contract extension (declared):** `EnvironmentSlotDef.gate?: "module-live" | "facts"`; the `progress` slot is `facts`-gated and moved to a new region `record` ("Your record", order 2; work/library/assistance shift to 3/4/5). Resolvers now receive a `SlotContext` (facts, events, liveModules) instead of a bare subject id — additive; the only resolver is the arc. Visitor DOM hash unchanged (`47456ef7283919cd`).
- **Boundary sentence (shipped):** "Nothing is recorded here yet. Nothing in this environment records anything so far — classes, recordings and work arrive in later phases, and the record starts when they exist."
- **Not changed:** schema, RLS, 5.3 states, 5.4 engine, 5.5 write/predicate, tokens/primitives, Scenes (Scene 7 re-export only), 3.6 chrome/labels.
- **Findings logged:** `src/components/ui/progress.tsx` (Phase-2 progress bar primitive) exists unused — documented as unusable for a person's record. Shell harness State B/C strings are clock-relative (fixture dates drift daily; reset again this step) — Phase 10 harness item, second occurrence. `/subjects/[id]` TTFB as a signed-in student 600–740 ms (getUser + two RLS reads) — Phase 10 with the existing item.
- **Test data:** student-b/c fixture dates reset to relative values; student-e reset and re-enrolled by the environment harness's write journey. No production data.

## DEC-009 — 5.6 close-outs (owner rulings, 2026-09-29)
- **`docs/proposed/progress_record.sql`** — the accepted event shape as a PROPOSAL, deliberately outside `supabase/migrations/` (no script reads `docs/proposed/`; `test-rls.sh` applies only `supabase/migrations/`). Carries: NOT-APPLIED header · the ruled shape · the referent question stated and UNCHOSEN (typed column per kind / object_kind+object_id / join table per kind, with tradeoffs; needs P7's real session table) · RLS placeholder: student reads own (kept — does not pre-solve tutor visibility); tutor visibility is P6's decision; retention undecided, nothing may encode an assumption · the analytics-forbidding table comment. **Creating `progress_record` is Phase 7's first task** — recorded in the file, in `docs/NEXT_ACTION_EXTENSION.md`, and as a comment on the `live-classroom` registry entry.
- **`ui/progress.tsx`:** permitted only where the denominator is real and simultaneous (an operation in flight); forbidden for a person's learning over time, in any form, at any phase. One header line added pointing at `docs/PROGRESS_LANGUAGE.md`.
- **Master is a direction, not a state to complete:** no evidence rule at any phase without a ruling; default is that it never gains one. `interact` ← P7, `progress` ← P9 (must satisfy P5-R6). Recorded in `derive.ts` and the vocabulary document.
- **Note for P7** in the extension contract: "happening now" (scheduled session, source `class`) and "the thing you last did" (recorded event, source `progress_record`) are different kinds with different sources and never share one string.
- **5.7:** the brief `prompts/phase-5-step-07-student-states.md` is not present in the workspace (no `prompts/` directory — the same condition 5.1 recorded). Not started; awaiting the brief. Part 0 of its report will hold these close-outs.

## DEC-010 — P5-R8 an error is a claim · 5.7 THE STUDENT STATES (2026-09-29)
- **Brief** supplied in chat (no `prompts/` directory); Part 0 close-outs done first: `docs/proposed/progress_record.sql` confirmed in place; the `record`-region / `progress`-slot **composition rule** written into the region contract (`src/config/student-slots.ts`, `ENVIRONMENT_REGIONS.record`): distinct objects, distinct headings, the arc never merges with a progress figure and keeps 4.7's vocabulary; shell-harness **fixture drift fixed** — `audit/shell.cjs` re-stamps the three fixture accounts' timestamps relative to `now()` at the start of every run (`stampFixtures`, idempotent; proven with a hand-aged fixture: 40 days → all 57 gates still pass).
- **Central document:** `docs/STATE_LANGUAGE.md` — 23-row inventory (state · where · what renders · what it claims · how verified), copy with 2–3 candidates per line and the choice, refusals, the subject rule. `src/components/state/copy.ts` holds the chosen sentences; `/dev/student-states` renders the table from the document.
- **Three scopes, one shape each.** PAGE: `HonestPage` (brand frame, one h1, one sentence, one action that is a GET) rendered by `app/error.tsx` (root, brand-mark frame), `app/subjects/error.tsx` and `app/(portal)/student/error.tsx` (inside their layouts), `app/not-found.tsx`, `app/global-error.tsx` (plainest). REGION: `src/lib/state/isolate.ts` — the ONE isolation pattern, now used by 5.4's `collectCandidates` (behaviour identical, 34/34) and by `resolveSlots` / `resolveEnvironmentSlots` / the arc's facts read: a failing region renders nothing and writes one log line. ACTION: one sentence beside the control (`Threshold failed`, the auth forms' `data-form-outcome` paragraph — the 5.1 info panel around the error was replaced by a plain `<p role=alert>` in the running type: the panel carried a verdict title and its body sat at 4.21:1).
- **Primary-answer exception (P5-R8.9):** `getStudentContext`, `getEnrolledSubjectIds`, `getEnvironmentFacts` now THROW `DataReadError` on a driver error instead of returning "no rows". A failed read used to render state A ("no enrolments"), offer Begin to an enrolled student, or 404 a student's own draft environment — claims we could not make. `student/page.tsx` no longer `return null`s (a shell with a hole). Proven on the production build by revoking grants on the test project: `/student` and `/subjects/[id]` answer 500 with the honest page; no table name, driver class, SQL, digest message or stack in HTML or RSC payload.
- **Entry route:** a known failure before the row → 303 `?entry=failed` (sentence beside Begin, rendered only while the truth still says not enrolled); failure after the enrolment commit → 303 to the environment, which renders enrolled/never-entered (the true state; no message); both logged. The `text/plain` 500 carrying `error.message` is gone. `signout` uses a relative Location (same defect as 5.5's).
- **Session ended (Part 6):** the proxy appends `reason=ended` ONLY when auth cookies were present and invalid; the login page renders "That session ended. Signing in again goes back to {where}." — a fact, not a guess; with no cookies at all it says only where sign-in goes. `next` is preserved through the hidden input and is always a GET — a write is never replayed.
- **Logger:** `src/lib/state/log.ts` — one function, stdout, JSON: level/at/scope/errorClass/what/ids; keys that could carry content are dropped; never a message body, never a person.
- **Refusals recorded:** no `loading.tsx`, no spinner/skeleton/shimmer/progress bar, no toast/modal/banner/icon/red, no "offline" claim, no service worker, no storage of student data on the device (minors' data-at-rest decision not made), no automatic retry of a write, no "contact support / try again later / sorry". The `Button` primitive's `loading` spinner exists (Phase 2) and is used nowhere on a student route.
- **Framework defect recorded, not accepted:** Next 16.3.6 answers `notFound()` with the `__next_error__` document and renders `not-found.tsx` client-side — blank without JavaScript (vercel/next.js#99287; reproduced at `/subjects/nonsense`; an unmatched URL is server-rendered). Error boundaries are likewise client-rendered. Tracked by dedicated gates in `audit/environment.cjs` and `audit/states.cjs` that flip the day it is fixed.
- **Payload (same method, before → after, decoded JS):** `/subjects/mathematics` 14 scripts/610 KB → 16/628 KB; `/student` 11/556 → 13/574; `/` 12/563 → 13/578. The delta is the two dumb error-boundary chunks (root ≈14 KB incl. a `next/link` copy, subjects ≈3 KB). A first attempt that rendered the nav shell inside the root boundaries cost +43 KB on every route (a second copy of the shell) and was withdrawn: root boundaries use the brand-mark `StateFrame`.
- **Baselines re-pinned with reasons:** environment (visitor DOM hash `47456ef7283919cd` → `196ca45447fcb58f`: only the CSS/JS chunk filenames in `<head>` changed; the 404 states now carry text and one action); shell (script bytes only). New harness `audit/states.cjs` + `audit/states-baseline.json` (38 gates).
- **Not changed:** 5.6 module/vocabulary/arc, 5.5 write semantics/predicate, 5.4 resolver/tiers, 5.3 states, 5.1 model/roles/policies, subject system, tokens/primitives, the 404 behaviour (the /subjects-list vs direct-route tension is reported in `STATE_LANGUAGE.md`, not redesigned). **5.8 not begun.**
| DEC-011 | 2026-09-29 | **P5-R9 — an error is never an absence.** A missing value and a failed read must never be the same value; readers throw `DataReadError`, callers decide (honest page or region silence). Applied repo-wide (sweep in PHASE5_R9_REPORT.md). Auth-chrome contrast fixed at the token as a one-time CORRECTION EVENT (brass-700 L 30→28 %, `brand-900` alias made theme-aware, auth link one step darker) — hue/saturation unchanged. Next #99287 recorded as a framework-dependent declared exception with FLIP-ALARM gates; re-test on any Next bump and at Phase 10 start. | PHASE5_R9_REPORT.md, docs/STATE_LANGUAGE.md |
| DEC-012 | 2026-09-30 → 2026-10-01 | **5.8 THE STUDENT GATE (full brief; supersedes the reduced pass in `0682379`).** Verification only, on the production build at 390/dark under an "8 pm" profile (400 ms RTT · 1.6 Mbps · cold cache · 4× CPU) with `audit/gate.cjs` (journey ×2, LCP as a distribution, fold at 320/360/390/1280/1920, pin-and-drift, 14×12 matrix = 168 cells: 163 pass · 0 fail · 5 declared #99287). Promise ledgers both directions (16 + 11 rows; three verdicts only). **Five defects fixed, no features:** D-1 sign-in page h-scroll at 320 (`min-w-0`, mark-only brand below `sm`); D-2 `/subjects` false "Phase 4 will replace it" sentence; D-3 register role cards' capability over-claims; D-4 a signed-in student shown "Sign in · Create account" on `/subjects/*` (NavShell honours `account` in Stage mode; subjects layout passes the identity it already reads); D-5 the gate instrument itself (J5 was unfalsifiable; a step crash is now gate J0). **Breakages:** 8 injected; (h) a lying arc consumer was NOT caught → environment.cjs gained "arc: states follow the evidence" (23 gates, re-pinned). Flip-alarm trip proven against the server-rendered unmatched 404. Three verbs **Enter → Begin → Open** documented as one sequence by state (STATE_LANGUAGE addendum). **Register consolidated** in `docs/EXCEPTIONS.md`: 10 carried in → 22 open (new: E-22 login fold at 320/360, E-23 visitor environment has no enter action in `<main>`, E-24 Lighthouse memory sensitivity). Non-test rows = 0 by query. Phase 6 entry: tutor–student assignment (roster) + its RLS policy; E-07 legal before any onboarding. `/dev/student-gate` reads the artefacts. | PHASE5_STEP8_VALIDATION_GATE_REPORT.md · docs/EXCEPTIONS.md |
| DEC-013 | 2026-10-01 | **Phase 6 · Step 1 THE TUTOR ARCHITECTURE (P6-R1 / P6-R2 / P6-R3; preface rulings E-13, E-14, E-23, E-07).** No interface. **Model:** `public.relationships` (tutor · student · subject; `active|ended`; ended rows retained; one active per triple; `CHECK is_subject_id`), the single predicate `is_related_tutor(student, subject)` (security definer), four tutor SELECT policies (relationships own · enrolments · environment_state · profiles) and one student SELECT policy on relationships; **no write policy for any role**, write privileges revoked from anon/authenticated — service role only. Applied to the project. **Default (P6-R2):** arc position + learning events in THAT subject + display name; nothing for the unrelated, for other subjects, after ending, or by sharing a subject; absence renders nothing; `docs/TUTOR_VISIBILITY.md` is the policy in prose with tighten/loosen costs and the row-grain "rides along" caveat (`entry_count`, profile metadata). **Test:** `rls_test.sql` 20 → 56 assertions (BREAK: non-related · other-subject · ended · shared-subject; no-default/no-inference; revocation keeps the row), green on `--local` and on the project; `scripts/test-tutor-visibility.mjs` 17/17 through the real JWT → PostgREST path. **E-13:** identity checkable in DB, status never in a policy. **E-14:** manifest-derived invariants replace `=4` (closed). **Creation flow:** academy-provisioned recommended first (consent captured out-of-band; no guardian identity needed, which E-07 forbids); tutor-invited second; student-requested last. Not built. **Fixture:** one test tutor (`tutor-a@test…invalid`) and ONE relationship (tutor-a ↔ student-c · physics) between test accounts; a second row created in error by the fixture tool was hard-deleted within a minute (not a revocation). **Registry:** `tutor-relationship` added as `in-progress`, `routePrefix: null`, surfaces `["tutor"]`; `tutor-portal` stays `planned`; homepage labels unchanged (string diff). `/tutor` placeholder untouched. **Not done, by rule:** no tutor surface, no admin surface, no onboarding, no `/dev` beyond `/dev/tutor-architecture`, no change to 5.1 policies. E-23 is next as its own bounded fix; 6.2 not begun. | supabase/migrations/20261001000002_relationship.sql, supabase/tests/rls_test.sql, docs/TUTOR_VISIBILITY.md, scripts/test-tutor-visibility.mjs, audit/tutor-visibility.json, PHASE6_STEP1_TUTOR_ARCHITECTURE_REPORT.md |
| DEC-014 | 2026-10-01 | **E-23 fix (bounded; after 6.1, before 6.2).** Reader classes on `/subjects/[subject]` and what each gets in `<main>`: **visitor at an open door → "Sign in"** (existing header action, plain `<a>` to `/login?next=<environment>`, lands back at Begin; `data-visitor-door`; one primary; in fold at all five widths; 1 tap where 3 were); visitor at a draft door → 404 as before; signed-in student not enrolled → Begin (unchanged); enrolled student → the room (unchanged; no action is the honest state); tutor → the certified composition, no action (a tutor's view is 6.2's work, not invented here). A `next/link` version was tried and withdrawn: it put +12 KB of chunks on `/student` and the environment route carries no client JS (5.5). **Post-6.1 defect found and fixed by this check:** `getStudentContext`, `getEnrolledSubjectIds`, `getEnvironmentFacts` and the enter route's pre-read relied on RLS to *mean* "mine"; after 6.1 a related tutor's policy admits a student's rows through the same client, so tutor-a got student-c's draft Physics door (200, and Physics in the nav). Each read now states `student_id = user.id`; RLS stays the boundary. Baselines re-pinned with reason: environment (visitor-ready DOM hash/primary/main text — the door), gate (`gate.cjs` step 4 extended to take the main door when present and record `tapsFromEnvironment`; first visit 479 → 493 KB, +2.9 %, inside the ±5 % band — a hard navigation to `/login` instead of the menu's soft navigation; second visit 422 → 437 KB / 97 → 99 requests, prefetch-count variance, not attributed to a product change). Shell 57/57 no diffs; states 45/45 identical; matrix 163/0/5 unchanged. | src/components/student/threshold.tsx, src/app/subjects/[subject]/page.tsx, src/lib/student/data.ts, src/app/subjects/[subject]/enter/route.ts, audit/gate.cjs, audit/environment-baseline.json, audit/gate-baseline.json |
| DEC-015 | 2026-10-01 | **Phase 6 · Step 2 THE TUTOR SHELL (P6-R4; preface P6-R5, P6-R6).** `/tutor` is now the student shell's composition with the tutor's facts: NavShell room mode, three destinations (Overview `/tutor` · Subjects `/subjects` · Account `/tutor/account`, all 200), one dominant surface that is a **statement, never a control** — a tutor has no next act today (6.1 §7: no provider ships), so the surface says so and why ("placing is done by the academy, not from this page; teaching surfaces are not built"). **Copy chosen:** A *"No student is placed with you."*; B *"Nothing to do here."* (candidates and reasons in the 6.2 report). **Locked decisions kept structural:** subject is the unit (`TutorContext = { state, groups: SubjectGroup[] }`, no flat list expressible); a row is display name · subject · nothing else; rows are not links (nothing resolves for a relationship until 6.3); order = config order of subjects, display name within (`orderRows`, tie by id) — never start date, never activity; data only via `src/lib/tutor/data.ts` (two tables, no arguments) — two attacks through the shell's code path fail `tsc` (`audit/attacks/`). Third scope of the one slot registry (`TUTOR_SLOTS`), nothing renders. `tutorFailed` honest page for a failed read (never state A). Client JS unchanged (same-method script bytes: 588 003 vs /student 588 005). **Registry:** `tutor-relationship` → `live` (a resolving surface depends on it; by the registry's own rule); `tutor-portal` stays `planned` — flipping it changes Scene 5's homepage label, which is a declared-exception decision left to the owner (strings before/after in the report). Homepage string set unchanged (141 strings, pinned in `audit/tutor-baseline.json`). **P6-R5 stale-string sweep (correction events — the old values were false):** `PORTAL_META` blurbs (student *"Classes, assignments, tests and progress."* → *"Your subjects, and what to open next."*; tutor *"Teach, schedule, assess and get paid."* → *"The students placed with you, by subject."*; admin *"Operations, people, content and billing."* → *"Architecture only. No account can open it."*) — audience was **visitors** via the `/login` and `/register` brand panel at ≥1024 px, not just portal users; `student-portal.summary`, `tutor-portal.summary`, `admin-portal.summary` rewritten without rosters/earnings/finance; `NotBuiltYet` body and the admin note lost "foundation task" and "the next build drops it in"; "Scheduled for this surface" → "Declared for this surface"; login context for `next=/tutor` says *"your students"*. **Refused (recorded):** `payments.summary` ("…tutor payouts") and `tests.summary` ("performance analytics") are planned-module descriptions visible to nobody today — not rewritten; money language awaits a ruling. **P6-R6:** `audit/identity-matrix.cjs` — 51 routes × 6 reader classes + admin as an asserted absence; named regression row *tutor T denied student A's draft door* (`/subjects/physics` · tutorT · 404); coverage gate fails on a missing route row (proven with `--drop-row=/tutor/account`). **Harness drift, not product:** environment.cjs visitor DOM hash re-pinned (E-20) after proving HEAD's own build in this sandbox hashes identically to the 6.2 tree. One fixture tutor added (`tutor-u`, related to nobody). No schema change, no write path, no production role path. 6.3 not begun. | src/app/(portal)/tutor/*, src/components/tutor/*, src/lib/tutor/data.ts, src/config/tutor-nav.ts, src/config/student-slots.ts, src/config/routes.ts, src/config/modules.ts, audit/tutor.cjs, audit/identity-matrix.cjs, audit/attacks/, docs/TUTOR_VISIBILITY.md §9, PHASE6_STEP2_TUTOR_SHELL_REPORT.md |
| DEC-016 | 2026-10-02 | **Phase 6 · Step 3 THE RELATIONSHIP'S SURFACE (P6-R7 / P6-R8 / P6-R9; E-25, E-26 closed; P6-R2 amendment applied).** One relationship → one page at `/tutor/[subject]/[relationship]`, reached from the shell's row (now ONE link, accessible name "Name — Subject", same type/weight/height). Reader `src/lib/tutor/relationship.ts` (address = `{subjectId, relationshipId}`; cross-subject unrepresentable; resolved from session + URL, never from a student id; attacks 3–5). Surface `src/components/tutor/relationship-surface.tsx`: WHO (display name, the h1) · WHICH (subject identity in its Room) · WHERE (the arc, the dominant element: 133 433 px² vs h1 9 225 at 390) · RECORD (`record.tsx`: `isolateAsync` loader → null → no DOM) · two constant statements · one way back. Absence rule P6-R9: never-related/ended/nonexistent/probes/wrong-subject/unrelated-tutor → one 404 via one `notFound()`; proven canonically (see PHASE_TRACKER). Attacks are permanent gates (`audit/attacks.cjs`, expected TS codes, failure proven). Registry: `tests` and `payments` deleted (P6-R8); money language banned; `siteConfig.description` rewritten (was a false feature list); tagline left (USER item). E-26: label stays on `tutor-portal` — its sentence asserts tutor capabilities. **Refused:** recency of any kind; zeros; profile/dashboard/avatar/chip/tab/table/progress; grading/notes/flags/messages/actions; export/print/share; comparison; a link to any other student; access logging (ruling pending); client JS (script bytes 587 825 = shell); a second read path; schema change; seed data in prod. **Harness:** `audit/relationship.cjs` (32 gates, pin `relationship-baseline.json`); identity matrix +5 instantiated rows (30 cells, one 200: tutor T × active); tutor baseline re-pinned (rows are links; fixture now 3 rows). **Fixture note:** rows tutor-a↔student-a (active) and tutor-a↔student-d (ended) and tutor-a↔student-f (active) existed in the project DB before this session's commands (created 12:37/13:36 UTC via the fixture CLI, not in this session's log); kept a/ended-d, ended f, added active d and created-then-ended c·mathematics. All between test accounts. |

| DEC-017 | 2026-10-03 | **Phase 6 · Step 4 THE LEVERS (P6-R10 / P6-R11 / P6-R12).** A tutor shapes ONE subject's environment, for everyone in it. **Model:** `public.environment_settings` (migration 0003) — `subject_id text primary key` (immutable id; status stays in TS), `density` and `motion_char` CHECK-constrained to the authored lists (CHECK over FK: the authored sets live in `subjects.ts`, there is no subjects table to reference and inventing one would be a second source of truth), `shaped_by uuid references auth.users`, `updated_at`; no student column. Policies: SELECT anon+authenticated; INSERT/UPDATE/DELETE only an authenticated tutor with an ACTIVE relationship in that subject (`rls_test.sql` 6.4 block, 76/76). **Levers:** 3.1's five → two adjustable (density, motion character), three not presented (accent triad = identity; motif = identity; atmosphere = inert, read by no renderer). 6.1 Part 6's per-tutor environment_settings idea is NOT built: it conflicts with P6-R10 (environment belongs to the subject) — the difference is reported, the rulings win. **Validator:** `validate.ts` enumerates every reachable combination (18 per subject, 108) and re-asserts identity (contrast · ΔE · ring), substrate+edge budgets, the Room rule, motion caps and reduced-motion parity; `scripts/validate-subjects.mjs` fails the build on any failing combination (failure proven by raising `energetic.maxCameraMove` to 0.9 → 18 ✗, exit 1). **Read:** one cookie-less anon round trip per environment render, in parallel with the identity read, no cache layer (dropped `unstable_cache`: a stale layer across instances is a second truth); absence = authored default (comment at the read site contrasts P5-R6); failed read = authored default + log + `source: "authored-after-failed-read"`. **Surface:** `/tutor/[subject]/environment` — Room rules, compact, 390-first; two native `<select>`s (authored sets), the blast-radius sentence in the form before the one primary Save, the no-notice sentence, revert (second form, secondary) when a row exists, link to the room (the ONLY renderer — no preview: two renderers drift), one way back. **Write:** `POST /tutor/[subject]/environment/shape`, 5.5's shape — form POST → relative-Location 303, upsert on `subject_id`, request-scoped client, no GET (405), unauthored values → 303 `?shape=failed` (no 400 with advice), denied → 404 same bytes as unknown subject. **Shared note:** unconditional "any other tutor placed in {Subject}" — counting other tutors is unreadable under 6.1's policies; proposal only (`docs/proposed/environment_shared_note.sql`). **Silence toward students** is the decision: no notice/changelog/history anywhere. **Attacks 6–7** (write for a student; read scoped to a student; identity value as a lever; shell levers prop with a student) are permanent gates. **Identity matrix** gains the two routes and THREE WRITE PROBES per class (physics · mathematics · unauthored value) with DB-row truth; `--drop-row` proof unchanged. **Refused:** per-student anything; accent/mark/frame/type/grammar/spacing as levers; free input; a preview; a changelog; client JS; a second read path; a schema beyond the one table; a shell entry point (6.2 composition untouched — reported as open). |
| DEC-018 | 2026-10-03 | **Phase 6 · 6.4 acceptance rulings P6-R17 / P6-R18 / P6-R19 / P6-R20 (applied at the start of 6.5), plus two answers.** **Item 4 — 6.1 Part 6 superseded (P6-R13), premature not wrong.** 6.1 said, verbatim: *"per tutor per subject (recommended) — `tutor_environment(tutor_id, subject_id, accent, atmosphere, motif, motion, density)`; closed enums mirrored from 3.1; rendered for a student only through an active relationship — one table in Phase 6.x; the student's environment becomes 'shaped by your tutor' exactly where P6-R1 says a tutor exists."* UNDERDETERMINATION: that model cannot answer "two tutors, one student, one subject" (whose levers?) nor "the visitor" (nobody's tutor) — both answers need a COHORT, which does not exist before Phase 7. Built instead: subject-keyed `environment_settings` (6.4). **REOPENING CONDITION: cohort-scoped character levers reopen, with a ruling, when Phase 7 introduces classes.** **Item 5 — the grant is refused; the note stays structural.** `docs/proposed/environment_shared_note.sql` remains a proposal; no policy lets a tutor read other tutors' relationships (naming a co-tutor is social, not functional). Wording audit: the blast sentence *"Saving changes the Physics environment for everyone in Physics — every student, including students you do not teach, and any other tutor placed in Physics. There is one Physics room."* is structural ("any", no existence claim) — kept. The state line *"Last shaped by another tutor placed in this subject."* asserted a current placement the row cannot vouch for → REWRITTEN to *"Last shaped by another tutor."* (a fact the row carries: `shaped_by ≠ viewer`). Co-teacher awareness, if ever wanted, is a ruling with a policy attached — open user question, not decided. **P6-R17 — a live surface with no door is a defect.** Entry 1: one quiet link per subject group in the tutor shell (`src/components/tutor/shape-link.tsx`; text-sm/400 vs a row's text-base/500; not a primary; gate added in `audit/tutor.cjs`). Entry 2: the same link on the environment page, header position, ONLY for a reader with an active relationship in that subject (`shaping` prop on `SubjectShell`, absent → byte-identical). NOT on the relationship's surface. Shell harness: composition, ratio (2.24) and fold (358/218/468/532) unchanged; the one diff ("B strings") is the link — declared, baseline re-pinned with reason. **P6-R18 — the validator is wired to the build.** `package.json` gains `"prebuild": "node scripts/validate-subjects.mjs"`; proven through the npm path (`audit/proofs/prebuild-failure-npm-run-build.txt`: `npm run build` → prebuild → `108 … FAIL` → exit 1; `next build` never starts). Release process: the project builds with `npm run build`/`next build` — anyone invoking `next build` directly bypasses npm lifecycle scripts; stated, not worked around. **P6-R19 — a tutor may stand in the room they shape.** `getTutorSubjectIds()` (argument-free, the tutor's own active rows under the 6.1 policy — NO NEW POLICY) admits a related tutor to a draft environment, rendered as the visitor's rendering: identity, structure, honest labels; no student region, no threshold, no student data (those remain gated on role=student + enrolment). Reasoning: a draft flag is readiness, not secrecy (3.7's validator); 5.3 already admits an enrolled identity; a relationship is a door of its own (P5-R4 extended); shaping blind is a defect — and the surface's room link was a live link to a 404. **6.2's gate row "tutor T denied student A's draft door" is REWRITTEN (not deleted): "tutor T is admitted to the draft environment's identity, and denied every student region of it."** Identity matrix: every subject instantiated (80 routes × 6 classes + 3 write probes); tutor T × physics = `200 environment:shape-link`; tutor T × chemistry/biology/english/history = 404 (no placement); visitor/expired/tutor U 404 on every draft; no student sees the link, no tutor sees a region. Second rule revised by later evidence this phase (P6-R13 first): recorded, not silent. **P6-R20 — the declared cost.** Visitor TTFB +≈120 ms is the ONE anon settings round trip, already in `Promise.all` with the identity read (parallel; it stands). Recorded in `audit/environment-baseline.json` → `declaredCosts` with cause, n=8/1 warm-up discarded, both viewports (390: TTFB median 151, LCP 316; 1280: TTFB 147, LCP 360 — ms, emulated). No cross-request cache. Phase 10 line recorded. **Admitted omission:** 6.4 did not re-run `audit/environment.cjs`; its three shell-root attributes changed the visitor-ready DOM hash (4abc8443→14865521). Proven the only change (stripping exactly those attributes restores the pinned hash); declared now, baseline re-pinned. **ADDENDUM 2026-10-06 — RULING P6-R21 · REFUSE_STALE_WRITE (owner ruling; closes the 6.5 §10 design decision and `docs/TUTOR_DISTANCE.md` row 8).** The 6.5 harness recorded the settings write as LAST-WRITE-WINS, SILENT and stopped for a ruling. The ruling: **last-write-wins is REJECTED; a stale write is REFUSED by optimistic concurrency.** Mechanism, all additive: (1) the settings view gains a FRESHNESS TOKEN — `version`: the row's `updated_at` exactly as read, `null` when no row existed (`src/lib/environment/settings.ts`); the shaping form carries it as a hidden input `version` (`src/components/tutor/environment-levers.tsx` — hidden inputs are exempt from the free-input sweep by selector; no visible element, no date on screen). (2) `shapeEnvironment` becomes CONDITIONAL (`src/lib/environment/shape.ts`): token = timestamp → an UPDATE touching only the row whose `updated_at` still equals the token; token = null → insert-unless-exists; token OMITTED → refused (a write that cannot prove its freshness is stale by definition). Zero rows = the room moved between load and submit → CONFLICT. The clock is the database's (`default now()` on insert, the `touch_updated_at` trigger on update) — the client no longer writes `updated_at`. Signature kept attack-safe: the token is a trailing OPTIONAL parameter (`undefined` = refuse), so attack 6's four-argument call and its expected TS2353 are unchanged (`audit/attacks.cjs`: 7 files · 0 failures re-verified 2026-10-06). (3) The refusal is ONE 409 document from the route: eyebrow *Not saved*, the ruling's single factual sentence verbatim — *\"The room settings were updated in another session. Reload to review the current state before applying changes.\"* — and one action back to the settling GET (the reload the sentence asks for). Names the fact, never the person; no alarm words (swept against the NEVER list); no script. (4) REVERT stays tokenless by construction — a DELETE cannot overwrite a value. (5) Route order preserved: subject 404 → identity → session → role → placement → client → **value validation (303 ?shape=failed)** → freshness check (409); an unauthored value is still a failed save, not a conflict. **Harness gates revised with declared reason (the ruling changed the behaviour they observe):** `audit/tutor-states.cjs` `write-concurrent` now ASSERTS the refusal (409 + sentence + co-tutor's row untouched + no redirect); `audit/levers.cjs` idempotence re-saves from a FRESH LOAD (a double-submit without reload is now correctly a refused stale write); `audit/identity-matrix.cjs` write probes carry `version=` — absence is the true loaded state after each probe's clearRow, so the probes test authorization, not staleness. **Baselines:** the shaping surface gains one hidden input; `audit/levers-baseline.json` surface pins and `audit/tutor-states.json` are RE-PINNED on the next harness run (cannot run in the current environment: no Chrome/Puppeteer, no DB) — declared, with this entry as the reason. Verified here: `tsc` clean · attacks 7/7 · `validate-subjects` 108/108 · `check-subject-sql` · next-action 34/34 · progress 16/16 · `npm run build` exit 0 · prod smoke `/` 200, `/dev/tutor-states` 404. |
| DEC-019 | 2026-10-06 | **Typography self-hosted (owner-approved bounded fix; unblocks `npm run build`).** The re-imported workspace's egress resets Node's TLS to `fonts.googleapis.com` during the handshake (curl included), so `next/font/google` could not fetch Fraunces / Instrument Sans / JetBrains Mono at build time; dev mode survived on fallback fonts, the production build did not. Ruling: self-host. `src/app/fonts/` gains three committed latin variable woff2s (Fontsource 5.3.0 latin subsets, fetched via `npm pack` into /tmp — NOT added to package.json: `fraunces-latin.woff2` 121 KB (full axis set), `instrument-sans-latin.woff2` 30 KB (wght), `jetbrains-mono-latin.woff2` 40 KB (wght)). `src/app/layout.tsx` rewired `next/font/google` → `next/font/local`: SAME css-variable names (`--font-instrument-sans` / `--font-fraunces` / `--font-jetbrains-mono`), SAME display modes (`swap` / `optional` / `optional`), metric-matched fallbacks still emitted by next/font — no token, component or surface touched. Verified: `npm run build` exit 0 (prebuild validator ran first); production smoke — `/` 200 with all three woff2s referenced under `/_next/static/media/`, the text face preloaded; `/dev/tutor-states` 404. Consequence: the build no longer depends on egress to Google; the committed files are the typographic source of truth. Phase 10 note: a future font change is a file swap + this register. |
| DEC-020 | 2026-10-06 | **Phase 6 · Step 6 TUTOR GATE, window W4 — THE PROMISE LEDGER (copy-only corrections; the ledger itself is in `docs/PHASE6_STEP6_REPORT.md`).** The gate's job: every promise the homepage makes, checked against what exists. Three contradictions found and corrected by adjusting the CLAIM (half: homepage copy) to the shipped truth — no behaviour, schema or surface changed. **(1) The five-levers claim** (`people.tsx`): the People scene said *"Five things are theirs to set: accent, atmosphere, motif, motion character, density."* — contradicted by P6-R11/P6-R13 (6.4): identity levers are immutable, atmosphere is authored-once and never presented; only **density and motion character** are adjustable. The live module's own registry summary says exactly two. Rewritten to *"Two things are theirs to set: density and motion character. Everything else in the room — accent, atmosphere, motif — is the subject's own: authored, not adjustable."* (both `PEOPLE_COPY.lines[0]` and the render; the `LEVERS` constant is kept, re-commented as the schema's five for the record). **(2) The People scene's status binding** read `statusFor(modules, ["tutor-portal"])` → the page labelled the tutor's side of the environment *"Next · not built yet"* while the registry has carried a LIVE `tutor-environment` entry since 6.4 ("shipped and reachable now"). E-26's own rule — the label binds to the fact its sentence asserts — applied to the post-6.4 registry: re-bound to `["tutor-environment"]` → renders `data-state="live"` / "Live today — the tutor's side of the environment." `tutor-portal` itself stays `planned` (E-26 unchanged; no registry flip). **(3) The consolidated promise named a removed module**: practice scene's `BEAT_PHRASE.assisted` said *"assignments, tests and the assistant"* — `tests` was deleted from the registry in 6.3 (P6-R8: no phase delivers it), so the homepage's "Next, in this order:" promised something nothing will build. Rewritten to *"assignments and the assistant"*. Verified byte-level on the production render (`/` 200): both new sentences present, status label live, zero occurrences of "tests" on the page, NEVER-word sweep clean, `tsc` + `npm run build` exit 0. **Distance named, not fixed:** people scene line *"You meet your tutor inside it"* remains DECLARED DISTANCE — the gap is named by the practice scene's own beat labels (live-classroom/recorded-classes "Next · not built yet"). **Baseline consequence:** the homepage string pins change (the 6.4 pin `141/c4b478181b3dbcdd` is superseded); page/journey/gate/tutor harness baselines re-pin on the next credentialed run, with this entry as the reason. |
| DEC-021 | 2026-10-08 | **Phase 6 · Step 6 THE TUTOR GATE — CLOSED (W1–W11).** The phase-close verdict is written in `PHASE6_STEP6_REPORT.md`: promise ledger 3 delivered · 8 declared distance · 3 contradiction fixed claim-side (DEC-020); second ledger 11 well / 1 both-ways (silent shaping — recommendation, not a fix); journey dignified end-to-end; identity matrix closed as a set with the coverage gate proven and catching real drift (`/dev/tutor-states{,/frame}` owed a `--write` pin); inside/outside six questions answered from SQL and source; honesty audit 30/30 clean; performance measured with sample discipline; eight deliberate breakages each caught by a named gate (no missing gate); exceptions register **21 in → 19 out** (the count fell); Rule 18 verified — zero real identities. Carried to Phase 7: `progress_record` first (DEC-009), the cohort model that reopens P6-R13 (DEC-018 Item 4), the attend-vs-resume sentence rule, P6-R15's settling-GET check on every new write. Owner questions open: the "Live tutoring" tagline (W4) · the co-teacher read grant (DEC-018 Item 5). Deviation declared: the gate doc's `/dev/tutor-gate` surface was NOT built — the W11 brief and the gate's own "no new surfaces" constraint both ruled it out; the report is the permanent artifact. **Phase 7 not begun.** |
| DEC-022 | 2026-10-08 | **Phase 7 · Step 1 — PROGRESS RECORD APPLIED + COHORT MODEL DRAFTED.** (1) `supabase/migrations/20261008000004_progress_record.sql` moves the DEC-009 proposal to a real migration with its open questions resolved as declared: the REFERENT is interim-neutral — `ref_id uuid not null`, NO foreign key (variants (a)/(c) need the session table; (b)-lite's integrity cost is stated in the column comment; gains a real FK by ruling when P7's session table lands); uniqueness placeholder refined to `(student_id, subject_id, kind, at)` (a student may be in two subjects at one instant); RLS enabled AND forced — students read own; related tutors read via `is_related_tutor` (the standing P6 predicate — TUTOR_VISIBILITY §2's rule applied, not pre-solved); NO authenticated INSERT/UPDATE/DELETE (writes belong to the capability that owns the referent, service role until then); retention UNTOUCHED (undecided, nothing encoded); the analytics-forbidding comment carried verbatim. **Reconciliation with the brief's sketched columns** (milestone_key/record_type/metadata/created_at), recorded per INSPECT-first discipline: the brief's own reference was the proposal, and 5.6's code pins the ruled vocabulary — record_type → `kind` (closed set), milestone_key → STEP_EVIDENCE (the arc's vocabulary, never a second one), metadata → REFUSED by P5-R6 ("and nothing else"), created_at → `at` (the fact's time). Table is `progress_record` (singular, as ruled), not the brief's plural. **Creating the table changes NO admissibility:** a kind stays admissible only while its module is live (EVENT_KIND_MODULE); live-classroom is still planned. (2) `20261008000005_cohorts.sql` drafts the cohort model: `cohorts` (subject CHECKed by is_subject_id, scheduled_at, state scheduled/active/concluded) + `cohort_tutors` junction (multi-tutor honest — P6-R13's first underdetermination never re-encoded); RLS enabled+forced with ZERO policies (nothing pre-granted; readers write policies with the standing predicates); service-role managed until a creation flow is ruled. The DEC-018 Item 4 reopening condition (cohorts exist) is now MET — cohort-scoped character levers become arguable but are NOT reopened by schema; still a ruling. (3) `src/lib/progress/record.ts` — pure helpers for the table: `appendEvent` (validated union, immutable), `historyForSubject` (valid + admissible + scoped, oldest first), `attendanceState` (the attend-versus-resume sentence rule: verb chosen by the record; empty sources while live-classroom is not live). NOT in the 5.6 barrel (the pinned export surface holds — test proves it). Verified: validate-subjects 108/108 · check-subject-sql · test-progress 16/16 · test-next-action 34/34 · test-progress-record 18/18 · `npm run build` exit 0. Live apply of both migrations owed to the credentialed environment. |
| DEC-023 | 2026-10-08 | **Phase 7 · Step 2 — COHORT SURFACES & THE FIRST READER.** (1) `supabase/migrations/20261008000006_cohort_readers.sql` is the policy step migration 0005 named as its own successor ("the first reader writes the policies"): students read cohorts of a subject they are ACTIVELY enrolled in (the enrolment boundary — the same relationship that opens the environment); tutors read cohorts they are ASSIGNED to (the junction) plus their own `cohort_tutors` rows. **One refinement of 0005's header, declared:** it sketched "is_related_tutor for tutors", but `is_related_tutor` is the predicate for reading STUDENT ROWS (enrolments, environment_state, progress_record); cohorts are not student rows and the brief's reader is the ASSIGNED tutor — so the junction governs cohort reads and `is_related_tutor` keeps governing student-row reads, unchanged. Students get NO `cohort_tutors` read (tutor presence is a ruled surface, never pre-solved); zero write policies (service role manages, 6.1 §6 posture). Zero surveillance by construction: no presence/dwell/heartbeat column exists. (2) **Next-action engine** gains the `class` provider exactly per `docs/NEXT_ACTION_EXTENSION.md`'s P7 row: source `class` (already in the union), capability `live-classroom`, **Tier 2 only — Tier 1 is impossible, never demoted**: `cohorts` carries a scheduled instant but no END, and Tier 1 demands `expiresAt` ("no expiry, no Tier 1"); Tier 1 returns only when a session end is ruled. The provider is registered but SILENT while the module is not `live` (the contract's registry gate); `ProviderInput` grew three OPTIONAL fields (`cohortSessions`, `progressEvents`, `liveModules`) + `hrefs.live` — backwards-compatible, pinned fixtures unaffected. The attend-vs-resume verb (DEC-022) is chosen from `attendanceState` fed through input data, and admissibility still gates it: a prior `session-attended` fact flips the verb only while `live-classroom` ∈ liveModules. Sentence builder `sessionActionSentence`: "Attend the {Subject} session" / "Resume the {Subject} session"; corporate vocabulary banned and swept. `when.ts` gains `scheduledPhrase` (future-tense phrase; `whenPhrase` stays the past-tense phrase). **Brief reconciliation (Task 3):** the active/scheduled case is the class candidate's title; the no-session case stays the CERTIFIED Tier-3 resume candidate — pinned Phase 5 copy is not rewritten from a brief sketch; the stage surface carries "Resume work in {Subject}" as its return action verbatim. **One pinned test refined with declared reason:** test-next-action #9's static tier-scan now admits declared Tier 2 (the extension doc's P7 row grants it) while Tier 1 stays UNDECLARABLE in providers.ts and the runtime half (emitted candidates ≥ Tier 3 while the module is not live) is unchanged. (3) **Surfaces:** `/subjects/[subject]/live` (server component): access by enrolment (student) or active relationship (tutor, P6-R19's logic), draft guard unchanged, login-door redirect for visitors, themed 404 otherwise; cohort facts and progress reads ISOLATED (a failed read renders the truthful standby, never a wrong answer). `src/components/live/live-stage.tsx` (server component, zero client JS): the subject's own tokens — graphite/substrate darks, subject accent, motif substrate via the 3.3 renderer — instead of a vendor grid; the brief's standby sentence verbatim (one pronoun made true for the tutor viewer); a RESERVED TILE GRID that is empty by honesty (participants are facts; none exist); zero timers, zero polling, zero presence — surveillance impossible by construction. `src/lib/livekit/config.ts`: readiness on env NAMES only (values never rendered/logged); NO livekit-client dependency, no connection island — untestable wiring is speculative and refuses to ship; the seam is documented in `docs/proposed/livekit_recon.md`. `src/lib/cohort/{data,session}.ts` + `src/lib/progress/data.ts`: SELECT-only readers, "mine"/subject spelled in every query, DataReadError on failure (5.7). (4) **Registry:** `live-classroom` flipped planned → **in-progress** (P5-R4 Addendum 2 precedent: scaffolding shipped, contents not; the provider gate still requires "live", so nothing new is emitted). (5) **Verified:** test-cohort-live 27/27 (new) · test-next-action 34/34 (refined pin) · test-progress 16/16 · test-progress-record 18/18 · validate-subjects 108/108 · check-subject-sql · `npm run build` exit 0 (route compiled, dynamic) · HTTP smoke: visitor → 307 login-with-next, bogus subject → themed 404, environment + switchboard 200 byte-preserved · server killed strictly by port. **Owed:** session END (unlocks Tier 1 by ruling) · webhook idempotency key with the session table · live apply of 0006 (credentialed environment) · test 18's digit-allowlist ruling when the class provider may emit date phrases. |
| DEC-024 | 2026-10-08 | **Phase 7 · Step 3 — PARTICIPANT INTERFACE & AUDIO DISCIPLINE.** (1) **The reconciliation, stated first:** the brief asks for a working participant interface; the transport does not exist yet (DEC-023 — no credentials, module not live). A grid with remote participants would be fabrication, and controls that do nothing are the false affordances Phase 6 refused. So the interface is built against the one media reality that exists without a transport: **the participant's OWN local devices** — browser-native, opt-in, nothing invented. Camera On really captures (`getUserMedia`); Unmute really opens the microphone, and audio-level detection (WebAudio RMS + hysteresis, `media-state.ts`) drives the speaking glow — a transient boolean on the participant's own opted-in mic, never rendered as a number, never stored, never transmitted; Share Surface really captures (`getDisplayMedia`, the browser's own stop ends it); Leave Chamber stops every track, closes the AudioContext and returns to the environment. One tile: the participant's own; remote participants are facts the transport will bring, and the grid does not invent them. (2) **Components:** `src/lib/live/media-state.ts` (pure: flags, transitions, constraints-from-flags, error-name → two calm truths, STATE sentences, labels, monogram, hysteresis) · `participant-tile.tsx` (client island: stream or dignified monogram; the speaking glow is the subject's OWN accent at 55% via the `[data-subject]` scope — Mathematics glows its indigo, Physics its ember, without the file knowing either colour; label is the academic display name — no IP, no device badge, no connection bar) · `live-controls.tsx` (exactly four controls over the Phase 2 Button: Mute/Unmute, Camera Off/On, Share Surface/Stop Sharing, Leave Chamber — `danger` role; toggles announce `aria-pressed`; state sentence is `aria-describedby`; calm tooltips; no raise-hand, no reactions, no attention scores, no emoji) · `room-participant.tsx` (the island: privacy as initial state — zero capture on load; denial rolls back only the turned control and states the block calmly; retrying stays open, so nothing is disabled for a missing device; zero timers, zero persistence, zero send path). (3) **Integration:** `/subjects/[subject]/live` mounts the island ONLY when the room is truly open — `module.status === "live" && readiness.configured && session` — otherwise the standby state stands, unchanged. Exercisable today via the rehearsal route `/dev/live-stage` (production-gated `notFound()`; subject-scoped; captioned "what you capture stays on this device"). (4) **State language:** the brief's denied sentence verbatim + a no-device sentence, added to STATE_LANGUAGE.md as the 7.3 addendum — ACTION scope, `aria-live="polite"`, no banner/red/exclamation; error classes to the log only. (5) **Accessibility & motion:** real buttons (Tab/Enter/Space), `aria-pressed`, labelled group; the glow's ONLY transition lives in globals.css under the reduced-motion contract (`prefers-reduced-motion: reduce` and `[data-reduced-motion="on"]` make it a static border — meaning preserved, movement removed). (6) **Verified:** test-live-participant 23/23 (new) · cohort-live 27/27 · next-action 34/34 · progress 16/16 · progress-record 18/18 · validate-subjects 108/108 · check-subject-sql · `npm run build` exit 0 (both routes compiled) · HTTP smoke: `/live` visitor 307 login door · `/dev/live-stage` 404 in production · environment 200 preserved · server killed by port. **Sandbox honesty:** no browser exists here — device capture, permission prompts and the glow are verified by construction + static proof, not by a manual walk; the rehearsal route is where a credentialed, browsered environment proves them. **Owed:** the transport wiring (session table → referent ruling, credentials, `livekit-server-sdk`, webhook writer) that turns the island into a room; a manual media walk-through; the tile-grid composition ruling when remote participants become facts. |
| DEC-025 | 2026-10-08 | **Phase 7 · Step 4 — SHARED SUBSTRATE & THE ACADEMIC SURFACE.** (1) **The surface and its discipline:** `academic-surface.tsx` is a canvas and NOTHING ELSE — no library, no dependency. High-DPI by devicePixelRatio; strokes stored NORMALIZED (0..1 — packets carry no pixel truth, so resizing and displays re-render the same geometry); quadratic-midpoint smoothing; pen pressure (where a device reports it) modulates ink width; speed shapes the sampling. THE SUBSTRATE IS THE SUBJECT'S OWN: the 3.3 motif renderer draws the environment's authored structure faintly beneath the transparent canvas — Mathematics its lattice, Physics its field, Chemistry its bonds, all six inherited, never invented a second time (the brief's three examples are the motif system's own vocabulary; the other three subjects keep their authored motifs by the same rule). Inverted highlighting needs no tool: ivory ink on the dark graphite substrate IS the highlight. (2) **The palette, strictly:** Ink (fine/medium — widths are a quality of the pen, not a fifth tool) · Line/Vector · Eraser (stroke-level, pure segment-distance hit test) · Reset; three colours only — Ivory (`--ta-ivory-200`), Muted Slate (`--ta-slate-300`), the subject's own accent (`--ta-accent-1`). No stickers, stamps, emoji, reactions — the dignity rule is enforced by tests. (3) **Sync — the reconciliation:** no transport exists (DEC-023), so `src/lib/livekit/surface-sync.ts` (the brief's path; the module itself is TRANSPORT-NEUTRAL — the session data channel is the intended carrier per the recon doc, nothing in the file is LiveKit-specific) defines the serializable packet `{id, tool, points, colour-ID, width}`, a validating reducer (malformed = named defect; idempotent by id; removals and clears carry their OWN operation ids so replays are no-ops), encode/decode over plain JSON, and `useSurfaceSync` over a `SurfaceBus` interface with ONE implementation today: the in-memory bus (the brief's "in-memory mock broadcast", named plainly). LOCAL MODE IS NOT DEGRADED — it is the same code path, fully functional; the wiring step supplies a session bus and nothing in the file changes. OPTIMISTIC, NEVER BLOCKING: `act` applies locally first, then sends; the echo lands nothing twice. Colour travels as a TOKEN ID — the same packet glows indigo in Mathematics and ember in Physics because the subject resolves it at draw time. (4) **Composition:** `room-layout.tsx` — desktop split pane (chamber column + surface), small screens one plane at a time by two real aria-pressed buttons, the decision observed live from matchMedia. `/live` composes chamber + surface INSIDE the unchanged roomOpen gate (DEC-024); the rehearsal route renders the same room. (5) **Verified:** test-academic-surface 20/20 (new) · live-participant 23/23 (one pin updated with declared reason: the island is now composed inside RoomLayout; the gate unchanged) · cohort-live 27/27 · next-action 34/34 · progress 16/16 · progress-record 18/18 · validate-subjects 108/108 · check-subject-sql · `npm run build` exit 0 (both routes compiled) · HTTP smoke: `/live` visitor 307 · `/dev/live-stage` 404 in production · physics 404 = the CERTIFIED draft-guard for a visitor (row 13), environment (mathematics) preserved. **Sandbox honesty:** no browser here — drawing feel, high-DPI crispness and substrate legibility are proven by construction; the rehearsal route is where a browsered environment judges them. **Owed:** the session bus (transport) that turns the memory bus into a room · the clear-permission ruling (who may reset a shared surface) · keyboard stroke input (recorded, not faked) · late-packet ordering rule for real networks (arrival order is assumed today; a session transport must preserve it). |
| DEC-026 | 2026-10-08 | **Phase 7 · Milestones 1-4 — AUTONOMOUS RUNNER: THE SESSIONS TABLE, CHAMBER STATE MACHINE, LIVE CHAMBER.** (1) **MILESTONE 1 — schema & data layer:** `supabase/migrations/20261008000007_classroom_sessions.sql` creates `cohort_sessions` (subject CHECKed, named tutor FK, title, scheduled_at, state scheduled/active/concluded, created_at + touch-maintained updated_at) — the session-of-record the chamber stands inside. Numbered 0007, not the brief\'s 0004 (taken by progress_record); the brief\'s sketched `progress_records` table is NOT created — the adjudicated singular `progress_record` stands (DEC-022) and the milestone_key/session_id mapping onto it is already ruled. **The referent question of DEC-009 is settled in shape:** a session-attended fact\'s `ref_id` names a row of `cohort_sessions` (variant (a) — we own the session row); a schema-level FK is deliberately deferred because `progress_record.ref_id` is POLYMORPHIC (sessions now, recordings and submissions later) and one column cannot hold three foreign keys — enforcement lives at the service-role writer, as 0004\'s posture. RLS enabled+forced: students SELECT via active enrolment (the 0006 boundary); tutors SELECT and INSERT via the standing EXISTS on relationships — the brief\'s `is_related_tutor(auth.uid(), subject_id)` cannot stand as written (its first argument is a STUDENT; sessions are not student rows), so the tutor boundary is spelled as the DEC-023 lineage asks it; INSERT is `tutor_id = auth.uid()` AND related — a tutor opens sessions as themselves, making the standby sentence literally true. No student writes; no update/delete policies (lifecycle is service-role managed, the 0005 posture). One symmetric policy added: `profiles_select_related_student` mirrors 0002\'s tutor read so the participant tile can say \"Dr. Vance (Tutor)\" without reaching past its boundary. `src/lib/classroom/state-machine.ts`: pure STANDBY→ACTIVE→SETTLING→CONCLUDED (the clock is passed in, never read); the 15-minute SETTLING window is measured from updated_at; `sessionOfRecord` precedence active > earliest scheduled > most recent concluded > null; `CHAMBER_STATE_WORD` is the status bar\'s only vocabulary. `src/lib/classroom/data.ts`: SELECT-only readers for sessions (with tutor display name through the profiles join) and participants (active enrolments + readable names; unreadable names stay null and tiles render monograms); failures stay failures (DataReadError, 5.7). (2) **MILESTONE 2 — routing & staging:** `/subjects/[subject]/live` pivots its SESSION FACTS from cohorts to `cohort_sessions` through the classroom data layer (the cohorts grouping surface is untouched); the gate becomes module-live AND credentials AND chamber-state ACTIVE-or-SETTLING (settling keeps the door open for its window). `live-chamber.tsx` (client shell): the disciplined status bar — subject mark, session title, the state machine\'s word (aria-live) — wrapping the tested RoomLayout composition; the brief\'s standby sentence supersedes DEC-024\'s verbatim: \"The chamber is staged. Live connection will initiate once your tutor opens the session.\" (tutor form: \"...once you open the session.\") — the pin updated in test-cohort-live and test-live-participant with declared reason. No new layout.tsx: the standing subjects layout + route guards already satisfy the requirement. Responsive threshold stays the TESTED 900px split (RoomLayout, DEC-025) with the aria-pressed pane toggle below it — the brief\'s sub-768 tab intent is met by the same mechanism; changing the constant would break the pinned composition without changing behaviour. (3) **MILESTONE 3 — participant interface:** `participant-tile.tsx` already compliant (DEC-024). NEW `participant-dock.tsx` — the restrained tile strip `room-participant.tsx` docks its tiles in (presentational: no state, no media). NEW `chamber-controls.tsx` — a BRIDGE re-export of the one LiveControls cluster (same four controls, same labels: Mute/Unmute, Camera On/Off, Share Surface, Leave Chamber); one implementation, two names, zero drift. (4) **MILESTONE 4 — academic substrate:** `academic-surface.tsx` and the motif substrate already satisfy the three brief backgrounds (DEC-025 — the motif system\'s own vocabulary covers graphite grid, field vectors and lab ruling for all six subjects). NEW `src/lib/classroom/use-surface-sync.ts` — a BRIDGE re-export of the tested `livekit/surface-sync` protocol (brief\'s canonical classroom address; one implementation, stroke `{id, tool, points, color, width}`, memory-bus fallback fully functional). (5) **MILESTONE 5 — verification:** test-classroom 22/22 (new — state machine, precedence, data-layer posture, migration policies, page pivot, shell composition, dock, bridges, standby copy) · cohort-live 27/27 (one pin updated, declared) · live-participant 23/23 (two pins updated, declared) · academic-surface 20/20 (one pin updated, declared) · next-action 34/34 · progress 16/16 · progress-record 18/18 · validate-subjects ALL VALID · check-subject-sql PASS · check-subject-imports 4 violations = the DECLARED false-positive class, count unchanged by these milestones · check-breakpoints 3 drifts = the three declared pre-existing items (nav-shell 479px, room-layout 900px, enter.tsx 47.99rem) · test-account / test-tutor-visibility / test-rls require live Supabase credentials absent here — baselines stand in `audit/` (tutor-visibility.json, rls-test.log) · `npm run build` exit 0 (both routes compiled) · HTTP smoke on the production build: `/live` visitor 307 login door · `/dev/live-stage` 404 · physics 404 (certified draft-guard) · mathematics 200 · server killed strictly by port. **Owed:** session END ruling (cohort_sessions advances it — Tier 1 needs an end instant) · live apply of 0007 in a credentialed environment · transport wiring (credentials, session bus, webhook writer) · manual media/drawing walk-through in a browsered environment · surface clear-permission and late-packet ordering rulings. |
| DEC-027 | 2026-10-08 | **Phase 7 · Step 5 — SESSION SETTLEMENT & PROGRESS CAPTURE.** (1) **The reconciliations, recorded first.** The brief\'s `progress_records` is the adjudicated `progress_record` (singular — DEC-022; a second table would be a second truth), and its sketched fields map onto the ruled shape exactly as DEC-022 declared: the milestone IS the `session-attended` fact (kind · at · ref_id = the session row, the DEC-026 referent) — there is no milestone column and no notes column. `milestoneKey` is ACCEPTED by the API and validated against STEP_EVIDENCE itself (the arc steps a session-attended fact evidences — never a second copy of the vocabulary), and stored nowhere: the engine derives the arc\'s position from facts at read time, so a declared milestone would be a second truth. `academicNotes` is ACCEPTED (≤500 chars, bounded) and deliberately NOT stored — P5-R6 refused metadata, the table forbids stored summaries, and the settlement surface STATES the refusal (\"Notes about the student are not kept: the record holds facts, never summaries.\") instead of rendering a field that would silently discard what a tutor types. No drop-down can name a student attentive or distracted: the boundary the brief keeps. (2) **The writer** — `src/app/subjects/[subject]/live/settle/route.ts`, POST only (a GET is 405): the capability migration 0004 named (\"the recording capability writes through the service role on a real occurrence\"). TWO SETTLEMENT ACTS, one endpoint, decided by the session\'s state, both idempotent: ACTIVE → conclude by ONE guarded UPDATE (`state=\'concluded\' WHERE state=\'active\'` — the transition is ATOMIC; a concurrent settle finds zero rows and never concludes twice); CONCLUDED → record one session-attended fact per actively-enrolled student (at = the conclusion instant; existing facts skipped; `ignoreDuplicates` behind the unique). Standing is decided by RLS on the READ (0007\'s policy shows the row only to a related tutor); invisible → 404, the same bytes an unknown session gets. Every outcome 303s to the settling GET (`/live` re-reads the truth; P6-R15) — the write is registered in `src/lib/state/settle.ts`, or it would not ship. A refused settlement renders ONE calm sentence on the GET (`?settle=failed`). (3) **The surface** — `session-settlement.tsx` (server component, zero client JS): the student\'s brief sentence verbatim when the record stands, no claim about the record while none is written; the tutor\'s form (facts + the refusal sentences + one confirm action) or confirmation; departure actions to the student workspace and the placements — `/tutor`, not the brief\'s `/tutor/[subject]/[relationship]`, because a subject names MANY relationships and no single one is the placements. (4) **The lifecycle change** — the OPEN room narrows to ACTIVE alone (superseding DEC-026\'s SETTLING admittance): a concluded session shows the SETTLEMENT surface, never the open room — nothing of the session lingers once it is over. The machine gains `retainsRoom` (ACTIVE · SETTLING hold the room\'s working state — the settling window is exactly the time in-flight strokes and audio buffers land and depart calmly; the memory bus is synchronous, so nothing is in flight by construction) and `showsSettlement` (SETTLING · CONCLUDED). CONFIDENTIALITY at conclusion: the room unmounts — canvas state and every media track discarded; the live surfaces hold NO device storage (pinned by test). The tutor\'s conclude action is a plain form, tutor-only, apart from the four-control cluster: lifecycle is not a media control. (5) **Verified:** test-settlement 26/26 (new) · classroom 22/22 · cohort-live 27/27 · live-participant 23/23 (two pins updated with declared reasons: the gate narrows to ACTIVE; the status block stands down while settlement speaks) · academic-surface 20/20 · next-action 34/34 · progress 16/16 · progress-record 18/18 · validate-subjects ALL VALID · check-subject-sql · tsc clean · build exit 0 (the settle route compiled; GET → 405 proven over HTTP) · smoke on the production build: /live 307 · /dev/live-stage 404 · physics 404 (certified draft-guard) · mathematics 200 · server killed by port. The rehearsal route previews all four settlement variants. **Sandbox honesty:** no credentials here — the route answers 503 \"Auth not configured\" without the service key; end-to-end settle (conclude → confirm → recorded) is owed to a credentialed environment, as is the manual walk. **Owed:** the owner ruling on whether `academicNotes` ever gains an adjudicated home (it would be a schema ruling, and today\'s answer is the refusal) · the session END ruling for Tier 1 (the conclusion instant — cohort_sessions.updated_at — is now the candidate end) · live migration apply now includes 0007. |
| DEC-028 | 2026-10-08 | **Phase 7 · Step 6 — REAL-TIME DATA CHANNELS & ACOUSTIC SYNC ENGINE.** (1) **The protocol, one vocabulary** — `src/lib/classroom/types.ts`: a CLOSED set of three signals (`PRESENCE_UPDATE` · `CANVAS_STROKE` · `STAGE_STATE`) riding one envelope `{v:1, kind, room, at, payload}`. The brief's `CANVAS_STROKE {strokeId, tool, points, color, width}` is the ADJUDICATED `SurfacePacket` of DEC-025 (brief's strokeId = packet id; validation DELEGATES to `validatePacket` — a second stroke vocabulary is refused). `STAGE_STATE {state, activeSpeakerId?}` maps onto the chamber machine by `stageStateOf`/`chamberOfStage` (round-trip pinned, all four words). The 16 KB budget is REJECT, not chunk — named defect `payload-too-large`, measured in encoded bytes: strokes are per-gesture and small by construction; chunking would pre-solve a problem the protocol's shape makes impossible. (2) **Subject isolation is structural, not best-effort** — `roomNameFor(subjectId, sessionId)` names every room `subject:session`; `validateSignal(value, expectedRoom)` refuses wrong-room signals AT THE DOOR (named defect `wrong-room`) before any listener can hear them, and `createMemoryTransport(room)` cannot even speak a signal addressed elsewhere — cross-room leakage is unrepresentable, pinned by test. Rooms prune themselves empty on the last unsubscribe. (3) **The transport** — `src/lib/classroom/transport.ts`: module-scoped room registry; the memory carrier delivers synchronously to every room listener INCLUDING the sender (the surface-bus loopback posture — a participant hears their own strokes arrive), malformed or oversized signals never delivered. `chooseTransport` returns the memory carrier today and names the LiveKit seam per DEC-023 — no `livekit-client` dependency; the day a carrier is ruled, readiness is read and the seam is testable. (4) **The hook** — `src/lib/classroom/use-classroom-session.ts` ("use client"): presence seeds SYNCHRONOUSLY with the local participant alone (nobody is invented; participant id = role — deterministic, zero hydration drift); the island reports its own facts upward through the OPTIONAL `onPresence` tap on `room-participant.tsx` (`isSpeaking = speaking && mic`, `hasVideo = camera && stream`) — unchanged signals never travel; tutor-only `setStage` signals `STAGE_STATE`; the hook owns the room's `SurfaceBus` (strokes ride it in local mode; the CANVAS_STROKE wire form is what a real carrier carries — idempotent either way); cleanup returns the unsubscribe (no zombie listeners); no timers, no device storage, and ZERO telemetry vocabulary (focus, keys, visibility, idle, gaze, dwell — none, pinned by sweep). (5) **The integration** — `live-chamber.tsx` gains optional `sessionId`/`stage`/`configured`/`rehearsal` (absent = the tested rehearsal posture, unchanged): the banner word rides the channel (`session.stageWord`; the server-rendered word is the seed, so SSR and client agree), a presence line names who the channel knows ("Tutor present" · "Student present" — announced facts, never scores), and a CONCLUDED signal closes the workspace client-side — the same confidentiality mirror as Step 5's server-side unmount. The page passes `sessionId={session.id}`, `stage={stageStateOf(chamber)}`, `configured={readiness.configured}` inside the unchanged roomOpen gate. `academic-surface.tsx` gains the OPTIONAL `bus` prop (`useSurfaceSync(bus)`; absent = private memory bus, rehearsal unchanged). `/dev/live-stage` gains a signaling rehearsal: the full chamber in a specimen session — presence, shared strokes, and the tutor's local conclude/reopen lifecycle, exercisable with no credentials. (6) **Verified:** test-signaling 26/26 (new — protocol, isolation, budget, transport, hook guards, composition pins, rehearsal) · classroom 22/22 (three pins updated with declared reasons: the banner word rides the channel; onPresence and bus join the composition) · academic-surface 20/20 (two pins updated, declared: the optional bus) · cohort-live 27/27 · live-participant 23/23 · settlement 26/26 · next-action 34/34 · progress 16/16 · progress-record 18/18 · validate-subjects ALL VALID · check-subject-sql PASS · tsc clean · build exit 0 (32 pages) · smoke on the production build: /live 307 · /dev/live-stage 404 · physics 404 (certified draft-guard) · mathematics 200 · GET settle 405 · server killed by port. **Sandbox honesty:** the memory carrier is proven over construction and test; multi-client acoustic sync needs a real carrier and is owed to a credentialed environment (the DEC-023 wiring list stands). **Owed:** the LiveKit carrier wiring when credentials land · late-packet ordering under a real network · keyboard stroke input · surface clear-permission ruling. |
| DEC-029 | 2026-10-08 | **Phase 8 · Step 1 — SESSION ARCHIVE SCHEMA & STORAGE POLICIES.** (1) **The schema** — `supabase/migrations/20261008000008_phase8_archive.sql` creates `session_artifacts`: one row = one artifact belonging STRICTLY to one session of one subject — `canvas_snapshot` · `pedagogical_notes` · `session_recording` (the brief's three, a closed CHECK), a unique `storage_path`, machine-fact `metadata` capped at 16 KB (the DEC-028 budget posture), and the session FK cascading from `cohort_sessions`. **Reconciliations, recorded:** numbered 0008, not the brief's 0005 (cohorts owns 0005; sequential, the DEC-026 precedent) · the brief's "foreign key on subject_id" cannot stand — there is no subjects TABLE; identity is CHECKed via `is_subject_id`, status stays TS (E-13, DEC-013) · the brief's `is_related_tutor(auth.uid(), subject_id)` cannot stand as written — the predicate's first argument is a STUDENT; DEC-026's ruling applies verbatim, so the tutor READ boundary is the standing EXISTS on relationships and the tutor WRITE boundary is STRICTER than the brief, never weaker: an artifact may be written only into a session the tutor OPENED (`cohort_sessions.tutor_id = auth.uid()`) · the data-layer signatures carry NO userId (the classroom posture, P5-R1): identity rides the cookie session and RLS is the only boundary — a second identity argument would be a second truth. **Isolation is structural, twice:** a composite foreign key `(subject_id, session_id) → cohort_sessions(subject_id, id)` (its redundant unique declared before the table that points at it, so the migration applies in one pass) makes cross-subject artifacts unrepresentable; `storage_path` is unique — one artifact per object key. (2) **Storage** — one PRIVATE bucket `session-artifacts`, objects named `{subject_id}/{session_id}/{artifact_id}` (built once by `artifactStoragePath`, so the convention cannot drift); ONE authenticated SELECT policy on `storage.objects` defers to the standing predicates with the subject read from the path's first segment — a belt behind the data layer's RLS-gated read. NO authenticated INSERT/UPDATE/DELETE on objects: uploads and lifecycle belong to the service role (0004/0005 posture), and anon is admitted by no policy at all. (3) **The data layer** — `src/lib/archive/data.ts`, SELECT-only: `fetchSubjectArchive(subjectId)` returns the CONCLUDED sessions of one subject, newest first, each with the artifacts the boundary returns ("concluded" is the archive's own word — nothing of an in-flight session leaks into the library early); `fetchArtifactDetails(artifactId)` reads by id through RLS and signs the object's URL through the service client — the ONLY service-role touch, and only AFTER the row proved visible: a 60-second bearer window; no service key or signing failure degrades to `{mode:"unsigned"}` (the DEC-023 readiness posture — never a fabricated URL, never an alarm). INVISIBLE and UNKNOWN return the SAME null: zero identity leakage on 404/403, exactly as the brief demands; a failed read throws DataReadError (5.7). (4) **The pure seam** — `src/lib/archive/artifact.ts`: classification (three kinds closed; unknown dropped, never guessed), the path convention + parser (malformed refused: wrong arity, empty segments, traversal), the isolation predicate, and the visibility predicates MIRRORED from the policies as functions over plain facts — provable offline. `BANNED_ENGAGEMENT_WORDS` names the zero-engagement rule (no view counters, download counts, popularity, sharing) so gates can sweep schema and layer against it. No surface ships with this step and `recorded-classes` stays `planned` (E-26 posture: a status flip that moves the homepage is a ruling). (5) **Verified:** test-archive-logic 19/19 (new — classification, paths, isolation, visibility mirror, migration parity pins, zero-engagement + zero-telemetry sweeps, signed-seam honesty) · full Phase 7 battery green (classroom 22 · cohort-live 27 · live-participant 23 · academic-surface 20 · settlement 26 · signaling 26 · next-action 34 · progress 16 · progress-record 18) · both gate-7 audits still PASS over the widened src/ · validate-subjects ALL VALID · check-subject-sql PASS · tsc clean · build exit 0 (32 pages). **Sandbox honesty:** no credentials — the migration is drafted and pinned by text, not applied; RLS behaviour against a live database is owed to the credentialed environment with the rest of 0004–0008. **Owed:** live apply of 0008 · the artifact writer (service role: snapshotting the board, capturing the recording, storing the notes — a later wiring step) · the archive surface itself · the signed-window tuning. |
| DEC-030 | 2026-10-08 | **Phase 8 · Step 2 — THE SUBJECT ARCHIVE SURFACE & ARTIFACT SHELF.** (1) **The route** — `/subjects/[subject]/archive` (`page.tsx` only — NO layout.tsx: DEC-026's ruling carries, the standing subjects layout supplies the chrome). The live chamber's gate, unchanged and in the same order: unknown subject → framework 404 · no identity → the login door with `next` back here · draft guard (5.3) · student by ACTIVE enrolment, tutor by ACTIVE relationship, anyone else the SAME 404 an unknown subject gets — the route enumerates nothing. The archive read is PRIMARY (the shelf IS the page's answer — a failed read fails the page honestly, never hides behind "yet"); an unconfigured identity is not a failure and renders the honest empty shelf. Server-rendered complete with zero client JavaScript. (2) **The shelf & the card** — `artifact-shelf.tsx` reads like a library shelf: an ordered list, most recent session first, each naming its date (the when.ts precedent, UTC-deterministic), its title, and the tutor only when the boundary allows; empty, it speaks the brief's sentence verbatim. `artifact-card.tsx` renders the three kinds in the archive's OWN words — `Board Record` · `Session Notation` · `Chamber Audio` (one constant each, exported in the pure seam); "VOD" · "Replay File" · "Recording Upload" are BANNED and swept. The board's preview is a short signed URL when the service key stands (best-effort, accent-framed), a quiet panel otherwise; chamber audio states its debt calmly ("Playback opens with the recordings wiring.") — the playback island is owed to the wiring step and NOT speculatively built (DEC-023 posture). Zero commercial clutter is swept: no recommendations, trending, popularity, share icons, counts or durations. (3) **The doors** — STUDENT: the `recordings-notes` shell region is filled through the DOCUMENTED fill point (`REGION_SLOTS`); the slot contract's one declared growth is that the shell now hands a slot its subject (`subjectId`/`subjectName`/`regionTitle`) — a per-subject door cannot exist without it, and the shell file gains plumbing, not a feature. TUTOR: one quiet `ArchiveLink` per subject group in the tutor shell, ShapeLink's own grammar (text-sm, underlined, never a primary). The RELATIONSHIP SURFACE stays untouched — reviewing past work is a subject act, and P6-R10 keeps a student's page free of it (the brief's "tutor subject view" is the subject group, not the relationship page; the closed W1–W11 record is not reopened). DECLARED visitor-HTML change: the recordings-notes region now renders the door instead of the "not built" placeholder — the environment-baseline re-pin is owed with the Phase 6 debt (P6-R17 precedent). (4) **The data layer grew by what the shelf needs, nothing more** — `fetchSubjectArchive` reads the tutor's display name through the standing profiles join (unreadable stays null → silence, never a guess) and signs a preview only for board records; `artifact.ts` gains `ARTIFACT_WORD` and `wantsPreview`. `recorded-classes` stays `planned` (E-26 posture: no status flip without ruling). (5) **Verified:** archive-surface 16/16 (new — guards, layout ruling, shelf register, required/banned vocabulary, doors, zero-clutter + zero-telemetry sweeps) · archive-logic 19/19 · full battery green (classroom 22 · cohort-live 27 · live-participant 23 · academic-surface 20 · settlement 26 · signaling 26 · next-action 34 · progress 16 · progress-record 18) · both gate-7 audits PASS over the widened src/ (scanned 273 files; zero unexplained; zero live-island hits) · validate-subjects ALL VALID · check-subject-sql PASS · tsc clean · build exit 0 (32 pages; the 5 turbopack warnings are the pre-existing dev-page tracing class) · HTTP smoke on the production build: archive visitor → 307 login door with `next` · physics/archive visitor → 307 (the login door precedes the draft guard, exactly as /live) · bogus subject → 404 · environment 200 · `/dev/live-stage` 404 · server killed by port. **Sandbox honesty:** no credentials — the shelf renders the honest empty state here; a populated shelf, the board previews and the playback island are owed to the credentialed environment and the wiring step. **Owed:** the media playback island (when a recording exists to play) · the artifact writer · environment-baseline + tutor-baseline re-pins (declared) · live apply of 0008. |
| DEC-031 | 2026-10-08 | **Phase 8 · Step 3 — THE ARTIFACT VIEWER & VECTOR WHITEBOARD REPLAY ENGINE.** (1) **One renderer for the whole house** — the fluid quadratic line moved out of the live surface into `src/lib/livekit/stroke-render.ts` (`drawStroke` verbatim, `STROKE_COLOR_TOKEN`, `readStrokePalette`): the live chamber and the archive replay draw from ONE implementation and resolve their colours from the SAME subject tokens, so the record glows exactly as the chamber did. The live surface (`academic-surface.tsx`) imports it; its local copy is gone. DECLARED PIN RELOCATION: test-academic-surface's `quadraticCurveTo` assertion moved from the surface file to stroke-render.ts, with a new pin that the surface imports the renderer (never a second vocabulary). (2) **The replay engine** — `src/lib/archive/replay.ts` is the PURE math (zero DOM, zero timers, node-tested): `replayFrame` (the deterministic scrub model — same strokes + same position = same board; the current stroke truncates, never invents), `formatTime` (MM:SS, honest past 59 minutes, 0:00 for the broken), `PLAYBACK_SPEEDS = [1, 1.25, 1.5]` exactly, `clamp01`. `canvas-replay.tsx` consumes the Phase 7 `StrokePacket` vocabulary VERBATIM — `{id, tool, points, color, width}` — on the subject's OWN motif substrate, devicePixelRatio-aware. TWO modes by real buttons with `aria-pressed`: BOARD (the whole record at once; pan by arrow keys, zoom by + / − / Reset BUTTONS — no mouse-only gesture; drag is the enhancement) and PLAYBACK (strokes return in recorded order; `requestAnimationFrame` ONLY while playing — nothing ticks at rest). The opening state is the static board for every reader — the reduced-motion contract is honored by default, never by special case. Erase packets carry no pixels (the live surface answered them by lifting whole strokes out of the state), so replay never invents a brush they had not. (3) **The board record reader** — `board-record.ts` parses saved JSON through surface-sync's OWN `validatePacket` + `applyPacket` (accepting both a bare stroke array and a full operation log — both are the protocol's shapes): idempotence and removal order reproduce EXACTLY the board as it stood. One malformed entry refuses the WHOLE record — a partial board would be a fabrication; the viewer says so in one calm sentence. (4) **The media player** — `media-player.tsx`: a native HTML5 element and nothing a library would bring — play/pause, one range scrubber with the MM:SS clock at both ends, the three speeds (no chipmunk pitch: the set is capped), volume + mute. No autoplay, no eager preload (`metadata` only), no timers (the clock is the element's own `timeupdate`); BANNED by test: up-next, recommendations, social embeds, share. (5) **The viewer & the seam** — `artifact-viewer.tsx`: a real dialog (`role="dialog"`, `aria-modal`), labelled by artifact-word and session title; the header names date · kind · title and wears the subject mark; Escape departs, the backdrop departs, Close catches focus on arrival, and the OPENER returns focus to the handle on departure — the round-trip is seamless both ways. Bytes are fetched ONLY at open time, through ONE new server action (`openArtifact` in `archive/actions.ts`, `"use server"`, no identity argument — the cookie session is the only truth), which calls the standing `fetchArtifactDetails`: RLS first, then the signature, never before; invisible and unknown stay the SAME `{ok:false}`. The brief's privacy branch is scoping (RLS + short signed URLs scoped to the participants), not watermark machinery. The window follows the KIND (`signedWindowFor`): records keep the 60-second consume-at-once window; chamber audio earns `MEDIA_URL_SECONDS = 900` — the listening takes time, and the window opens only when the reader reaches. DECLARED PIN EVOLUTION: Step 2's debt sentence ("Playback opens with the recordings wiring.") is DISCHARGED — the archive-surface pin moved from the sentence to the opener wiring. (6) **The wiring & rehearsal** — the card keeps its server-rendered HTML and gains ONE quiet opener island (`artifact-opener.tsx` — the only client bridge on the shelf); the shelf hands it the subject's identity and the session's date words. The sandbox holds no artifacts (the writer is still owed), so the engine is proven in `/dev/archive-rehearsal` (404 in production): specimen strokes in the chamber's own vocabulary, a deterministically generated tone for the player, and the full drawer round-trip for all three kinds — the viewer carries an explicit `rehearsal` content prop (the house precedent) and production never sets it. (7) **Verified:** archive-viewer 22/22 (new) · archive-logic 26/26 (replay math + window added) · archive-surface 16/16 (one pin evolved, declared) · academic-surface 20/20 (one pin relocated, declared) · next-action 34 · progress 16 · validate-subjects ALL VALID · check-subject-sql PASS · tsc clean · build exit 0 (33 pages) · smoke: rehearsal 200 (mathematics + physics) · archive visitor 307 · bogus 404 · physics/archive 307 · server killed by port · gate-7 privacy PASS (282 files, zero hits on the new islands) · gate-7 ledger PASS 8/8. **Owed:** the artifact writer (service role) that gives the shelf real objects · a populated-shelf + signed-playback verification in a credentialed environment · environment/tutor baseline re-pins (DEC-030 debt) · live apply of 0008. |
| DEC-032 | 2026-10-08 | **Phase 8 · Step 4 — MILESTONE SYNTHESIS & RECORD CONSOLIDATION.** (1) **The shape** — the chronology that joins WHAT HAPPENED to WHAT IT LEFT BEHIND: a progress fact (`progress_record`, migration 0004 — the brief's "progress_records", reconciled to the ruled singular name) evidences a step of the arc (STEP_EVIDENCE's own rule — `session-attended` → `learn` first evidenced, `work-submitted` → `progress`), and the artifacts preserved from that fact's session (`session_artifacts`, migration 0008; the join is `ref_id = session_id`, BOTH tables' session truth — no new column, no new table) substantiate the entry. `src/lib/progress/synthesis.ts` is the PURE composition (`composeMilestoneRecord` · `milestoneKeyOf`): admissible kinds only (the registry gate, exactly as the arc's), oldest first (the record reads as it happened), one entry per FACT with `sources` naming its row (the 5.6 traceability invariant), a session the boundary withholds still leaves its fact standing (title null, artifacts absent), unknown artifact kinds dropped, malformed events defects, nothing counted or combined — the entry's fields are pinned to carry no figure. Not exported from the progress barrel (the record.ts precedent — test-progress's 5.6 surface pin stands). (2) **The reader** — `fetchSubjectMilestonesWithArtifacts(subjectId, studentId)` in `src/lib/progress/data.ts` (the progress lib's established server seam; the brief named `src/lib/progress/synthesis.ts` — reconciled: pure math there, data access here, one named function, exact signature). Three RLS-bounded reads — progress facts, session titles (0007 policies), artifacts (0008 policies) — EVERY one spelling the subject it means and whose record is meant (6.1): the second argument is the record's SUBJECT, never the viewer's identity, which rides the cookie session alone; RLS decides whether the viewer may read it (own policy for a student; the related-tutor policies for a tutor), and a mismatched argument yields the honest empty — zero enumeration, zero leakage. No identity → empty; a failed read THROWS DataReadError (5.7). (3) **The view** — `src/components/archive/milestone-synthesis.tsx`, server component, zero client JS: a scholarly chronological timeline (ordered list, quiet rail, Phase 2 tokens), the subject's mark beside each dated entry, the session title, the tutor's notation when preserved, and each artifact a LINK — "Substantiated by Board Record · Session Notation · Chamber Audio" — to its card in the subject archive (`#artifact-<id>` anchors added to the cards), where the DEC-031 opener lifts it; the board's signed preview is NOT re-minted here (the shelf signs; the synthesis links — one signing surface, kept). THE REGISTER, scoped by ruling: the brief admits "milestone" in the CHRONOLOGICAL sense — a named arc stage, evidenced, substantiated — and its three phrases stand verbatim ("Conceptual Arc" · "Milestone Reached" · "Substantiated by …"); the REWARD register stays banned everywhere and is swept (no badge, XP, level, unlock, streak, points, trophy, percent, bar, rank, congratulations). This scopes PROGRESS_LANGUAGE's banned "milestone" (reward semantics) without rewriting it: the chronology word is admitted, the reward object remains refused. Empty means ABSENT — no box, no heading, no zero. (4) **The embeddings** — STUDENT: the shell's written-map `achievements` slot (region `reflection`) is the fill point the map itself demanded ("an owner decision that milestones exist as text records") — the Step 4 brief IS that ruling; the slot renders one "Your Milestone Record in {Subject}" chronology per ACTIVE enrolment with entries, and null otherwise; the map entry's `phase`/`today` fields are updated to say so (declared), and the map's `today` type widens from the absence-only literal for exactly this entry. TUTOR: the relationship surface's record region — 6.3's declared fill point (`record.tsx`'s `loadRecord`, isolateAsync'd since 6.3) — now reads the synthesis for the relationship's student ("Milestones co-certified"); for it, `RelationshipView` gains `studentId` as a JOIN KEY, declared never-displayed (P6-R2 governs what the surface SHOWS — the surface renders the key nowhere, swept), and the dev fixtures carry specimen keys. (5) **Dormancy, honestly** — `live-classroom` is `in-progress` in the registry, so `session-attended` is inadmissible and BOTH production surfaces stand absent today, exactly as the next-action engine does: no row exists anywhere, and the day the module is live (credentials) the chronology wakes with zero edits. The rehearsal proves the engine: `/dev/archive-rehearsal` gains a synthesis section composing SPECIMEN facts through the production pure function in both registers, declaring the module live for the rehearsal and saying so. (6) **Verified:** milestone-synthesis 21/21 (new — the relationship linking proven offline: join, chronology, scoping, registry gate, defect refusal, traceability, purity, reader privacy wording, register pins, wiring, sweeps) · progress 16 · progress-record 18 · archive-logic 26 · archive-surface 16 · archive-viewer 22 · next-action 34 · validate-subjects ALL VALID · check-subject-sql PASS · tsc clean · build exit 0 · smoke: rehearsal 200 (both registers render) · /student 307 (door) · bogus archive 404 · server killed by port · gate-7 privacy PASS (284 files, zero island hits) · ledger 8/8. test-tutor-visibility is the credentialed live-RLS harness (baseline `audit/tutor-visibility.json`) — owed, unchanged. **Owed:** the artifact writer (service role) that gives sessions their objects and settle its facts in a credentialed environment · the populated chronology verification there · live-classroom's `live` flip (the carrier wiring, DEC-023/028) · environment/tutor baseline re-pins (DEC-030 debt) · live apply of 0004–0008. |
| DEC-033 | 2026-10-08 | **Phase 9 · Step 1 — SOCRATIC ASSISTANCE ENGINE & PEDAGOGICAL CONTRACT.** (1) **The reconciliations, recorded first.** The brief's migration filename (`20261008000006_phase9_socratic.sql`) cannot stand: cohort_readers owns the 0006 slot and two migrations may not share a sequence number — numbered **0009**, sequential, exactly as DEC-026/DEC-029 reconciled before. The brief's `is_related_tutor` tutor-read boundary STANDS as written (the standing predicate's signature is exactly (student, subject) — DEC-026's recording; Phase 8 needed the narrower session-opening-tutor boundary only for artifact WRITES). The data-layer signatures carry no userId parameter (P5-R1): identity rides the cookie session; RLS is the only boundary. (2) **The schema** — `supabase/migrations/20261008000009_phase9_socratic.sql` creates `socratic_exchanges`: one row = one bounded exchange (inquiry + structured guidance) scoped to `(student_id, subject_id)`; the brief's exact columns, subject CHECKed in the DB (`is_subject_id`, E-13), `prompt_type` the contract's closed four, and the brief's index `(student_id, subject_id, created_at)`. RLS enabled AND forced: students SELECT/INSERT their OWN exchanges (`auth.uid() = student_id`) — the inquiry log belongs to the inquirer, unlike artifacts whose writes belong to the session's opening tutor; related tutors SELECT by the standing predicate; NO update/delete policy (an exchange is an occurrence; the 0004/0008 lifecycle posture); anon admitted nowhere. BREVITY MIRRORED IN THE DB: `query_text` capped at 500 (the contract's limit), `response_payload` at 16 KB (DEC-028 budget posture) — the boundary holds even for a writer that skips the contract. Live apply is owed to the credentialed environment with 0004–0008. (3) **The contract** — `src/lib/socratic/contract.ts`: `SocraticPrompt {subjectId, currentMilestone, studentInquiry, previousArtifacts}` and `SocraticGuidance {guidanceType, responseText, referencedArtifactId?}` exactly as briefed; the guidance union is hint/question/reference — **"answer" is unrepresentable by construction**, so homework completion cannot be emitted; `MAX_INQUIRY_CHARS = MAX_GUIDANCE_CHARS = 500` with `checkInquiry` (trim · empty · overlong verdicts) and `fitsGuidanceLimit`; `PROMPT_TYPE_OF_GUIDANCE` maps kinds to the DB's classes, with `reflection_summary` deliberately unmapped (reserved for the session's closing summary, a later step). Zero diagnosis, zero sentiment grading: the contract states it and the test sweeps the vocabulary. (4) **The resolver** — `src/lib/socratic/resolver.ts`, PURE and deterministic (no clock, no randomness, no network, no react, no database — pinned by test): one curated scaffold map, three bounded texts per milestone (hint · one disciplined question · canonical proof) covering all six subjects, the brief's example standing verbatim (physics:harmonic-motion → "Classical Mechanics → Harmonic Motion"). Milestone keys are `{subjectId}:{concept-slug}`; a key resolves ONLY when its subject segment names the prompt's own subject (isolation in logic, pinned). Order of resolution, all declared: brevity first (empty/overlong → one calm sentence) · scaffolding never answers (completion-demand marker classes → one disciplined redirect; legitimate conceptual questions are pinned NOT flagged) · honest absence (unknown milestone or cross-subject key → one calm sentence naming the subject; nothing invented) · the scaffold (question first — disciplined questions before essays — then hint, then proof reference) · the archive (the student's own preserved artifacts, served by the archive's record shape, are POINTED at by id in the archive's own words — Session Notation with a readable summary preferred over recency, then the newest Board Record, then newest standing; foreign-subject artifacts never seen; nothing re-stated). Integration with `src/lib/archive/data.ts` reconciled: the resolver imports the record shape from the pure seam `@/lib/archive/artifact` (what data.ts serves) — a pure engine cannot call the fetcher; the future server seam will. Not exported from any barrel (the synthesis precedent). No surface ships in this step: schema + pure engine + tests only, so the subject-import guard is untouched and nothing reachable changes. (5) **Verified:** test-socratic-logic 30/30 (new — contract pins, key grammar, isolation, determinism, brevity, completion-demand classes, honest absence, archive reference rule incl. tie-breaks, register sweeps: no exclamation, no emoji, zero diagnosis, reward vocabulary banned with the one geometric 'point' declared (Phase 8 W3 precedent), purity pin, migration↔contract cross-pins) · validate-subjects ALL SUBJECTS VALID · check-subject-sql PASS · next-action 34/34 · progress 16/16 · tsc clean · build exit 0 (33 pages — no route added). **Owed:** the server seam that persists exchanges through the student's own INSERT (RLS first) · the surface where guidance is spoken (a later step; it inherits STATE_LANGUAGE 9.1) · live apply of 0009 with 0004–0008 in the credentialed environment · scaffold-map growth as the owner's curriculum rulings land. |
| DEC-034 | 2026-10-08 | **Phase 9 · Step 2 — THE SOCRATIC LENS & REFLECTION SURFACE.** (1) **The reconciliations, recorded first.** The composer's brief names a 300-character limit while the contract (DEC-033) and the DB mirror 500: reconciled as TWO BOUNDS — `COMPOSER_CHAR_LIMIT = 300` enforced at the point of composition (conciseness is the discipline, exactly as briefed), the contract's 500 remaining the OUTER bound the schema mirrors, so a writer that bypasses the composer still lands inside the DB's check; the seam enforces both. The citation's brief sample ("Review notation from Session on [Date]") stands in the archive's CANONICAL words — `Review {Board Record · Session Notation · Chamber Audio} from session on {date}` (the DEC-030 vocabulary pin governs). (2) **The seam** — DEC-033's owed persistence half, built: `src/lib/socratic/data.ts` reads the student's OWN recent exchanges (RLS is the only boundary — 0009's own-student policy; the reader spells the subject and the order, nothing else; six newest), flattens the subject's preserved artifacts through the archive's own RLS-bounded read (DEC-029; a failed archive read leaves citations absent, never the lens), and assembles the lens's data + the scaffold options from the resolver's map. `src/lib/socratic/actions.ts` is ONE `"use server"` action, `reflectOnInquiry` — no identity argument (the cookie session is the only source, the archive-actions posture): it resolves through the PURE engine, enriches any citation with the record's own word and date (the card renders from the payload alone), and persists ONE row per exchange through the student's OWN INSERT (prompt_type = the first guidance's class, mapped by the contract; payload = the guidance array). Invisible and refused are the SAME honest answer; the closed outcome vocabulary `{ok} | {empty · overlong · refused}` is all the composer may speak. (3) **The surfaces** — `src/lib/socratic/lexicon.ts` (the card's closed words, pure, provable offline) + three components under `src/components/socratic/`: the LENS — an architectural region on the subject's substrate (bordered, `--ta-surface-base`, the subject mark beside "Pedagogical Reflection · {Subject}", the verbatim capabilities statement, the exchange log or the honest empty sentence, then the composer); the COMPOSER — the one client island: a milestone select (the scaffold's paths), one field capped at 300 with a quiet counter, the placeholder `Formulate a question about {concept}...`, ONE primary action ("Reflect"), failures as one calm sentence in a `role="status"` live region; the CARD — type badge (`Guiding Question` · `Conceptual Hint` · `Proof Reference`, verbatim), the body in the reading face, and one compact archive link to `#artifact-<id>` in the subject archive. THE ANTI-WIDGET REGISTER, swept by test: no avatar, no bubble, no typing indicator, no greeting, no filler, no exclamation, no emoji, ZERO animation vocabulary — the lens is architecture, not theatre. (4) **The wiring** — the environment slot map's pre-declared `ai-assistance` entry (the written map anticipated this fill point) moves to `gate: "facts"` — the DEC-008 precedent, declared above the entry: the assistant it names IS the deterministic scaffold engine (built, self-contained, no external provider), so the slot renders from enrolment; the `ai-assistant` registry status STAYS `planned` until a provider-backed capability lands (the summary rewritten honestly: scaffolding, never solutions — no baseline drift, no homepage change). `SlotContext` gains the optional `socratic` field (declared extension); the environment page reads it IN PARALLEL with the facts through its own isolate — a failed read renders no lens (P5-R8.9), never a failed environment. With migrations 0004–0009 unapplied in the project DB, the exchange read fails and the lens stands honestly absent in production today — wired, dormant, waking with the live apply. (5) **The rehearsal** — `/dev/socratic-rehearsal` (404 in production, proven by smoke): the lens with SPECIMEN exchanges and artifacts; the rehearsal composer resolves through the production PURE engine locally with an explicit `rehearsal` prop production never sets (the DEC-031 precedent), demonstrating the citation rule, the badges, the archive link and the calm failure vocabulary with zero network. (6) **Verified:** test-socratic-surface 19/19 (new — verbatim sentences, the 300 cap, badge words, anti-chatbot sweeps, wiring pins, module-honesty pin, rehearsal discipline, action posture, STATE_LANGUAGE 9.2) · test-socratic-logic 31/31 (the composer-cap pin added) · validate-subjects ALL VALID · check-subject-sql PASS · next-action 34 · progress 16 · subject-import guard exactly its 4 declared false-positives (the new components are guard-clean) · tsc clean · build exit 0 (34 pages) · smoke on the production build: rehearsal 404 · mathematics 200 (zero socratic markup in a visitor's HTML — the region never leaks) · archive 200 (login door) · /student 307 · server killed by port. STATE_LANGUAGE 9.2 pins the lens's sentences. **Owed:** live apply of 0009 with 0004–0008 in the credentialed environment · the populated-lens walk there (a real exchange round-trip through the student's own INSERT) · the provider-backed capability ruling (when the registry flips) · scaffold-map growth with the owner's curriculum rulings. |
| DEC-035 | 2026-10-08 | **Phase 9 · Step 3 — TUTOR REFLECTION SURFACE & SOCRATIC OVERSIGHT.** (1) **The reconciliations, recorded first.** The brief's `fetchTutorSocraticOverview(subjectId, studentId, tutorId)` cannot stand with a tutorId argument (P5-R1, the posture DEC-029/033/034 all hold): the marker's identity rides the cookie session, and `is_related_tutor` is enforced where boundaries live — in 0009's tutor-read policy on the exchanges and 0010's policies on the marks, both re-deciding on every read. Shipped as `(subjectId, studentId)`, where studentId is the RELATIONSHIP'S JOIN KEY (the DEC-032 precedent), never a displayed fact. The brief's two header sentences are reconciled by register: the heading stands verbatim from the component spec — "Conceptual Explorations · {Subject}" — and the objective's framing word becomes the list's accessible name, "Conceptual inquiries". The migration is numbered 0010, sequential (DEC-026/029 precedent). (2) **The schema** — `supabase/migrations/20261008000010_phase9_socratic_pins.sql` creates `socratic_pins`: one row = one inquiry a related tutor marked for their next live dialogue. The mark is the tutor's OWN preparation note — binary by shape (INSERT marks, DELETE unmarks, NO update policy), unique per (tutor, exchange), and structurally bound to the subject: the insert policy re-derives the (student, subject) pair from the exchange row itself, and the EXISTS runs under 0009's RLS — a mark can never name an inquiry its marker cannot read. RLS enabled AND forced; anon admitted nowhere; select re-decides relatedness (an ended relationship admits nothing). The table carries NO evaluation by construction — no rating, difficulty, comprehension or timing column exists. (3) **The reader** — `fetchTutorSocraticOverview(subjectId, studentId)` in `src/lib/socratic/data.ts`: recent inquiries (newest first, capped at `TUTOR_OVERVIEW_LIMIT = 12`), grouped by the milestone they name through the PURE half (`src/lib/socratic/oversight.ts` — `groupInquiries` preserves the read's order; `timeWordOf` renders the instant deterministically as "24 September 2026 · 12:00 UTC", no clock read), each row carrying the marker's pin state (0010's select policy admits only the cookie tutor's rows — no identity argument passed). A failed pin read leaves marks absent, never the inquiries; a failed exchange read propagates to the isolate. (4) **The panel** — `src/components/tutor/socratic-reflections.tsx` (the record.ts loader pattern: `loadOversight` injectable for dev failure rehearsal; `resolveOversight` through `isolateAsync`; empty = ABSENT, no DOM, the slot contract carried): heading · purpose sentence ("…nothing on this panel scores, rates or flags them.") · groups by milestone path · each inquiry as asked, with its instant and the ONE act — "Mark for Next Live Session" / "Marked for Next Live Session" (`aria-pressed`, a plain form, `toggleSocraticPin` in `actions.ts`: tutor role re-decided from the cookie, visibility verified under RLS BEFORE any write, toggle idempotent, `revalidatePath("/tutor", "layout")`; a failed toggle is silence — the panel re-renders from the read and the read is truth, so no error theatre is needed). THE MIRROR'S REGISTER, swept by test: zero evaluative vocabulary (no "struggled", no comprehension rating, no difficulty flag, no count, no idle/timing word), no exclamation, no emoji, no animation; the one word "scores" the panel speaks is the refusal of scoring. (5) **The embedding** — `RelationshipSurface` gains the optional `oversight` prop, rendered BENEATH the record region as the second DECLARED fill point (reading order amended 4b; the placement view, the levers and every other surface untouched, exactly as the brief requires). DECLARED PIN EVOLUTION: the 6.3 surface baseline (`audit/relationship.cjs`, browsered) predates both fill points — the tutor-statement sentence evolves ("reads the record and prepares the next dialogue. Nothing else is done here by a tutor yet…"), so the statement's canonical sha moves; the re-pin stands owed with the DEC-030 baseline debt in the credentialed environment. Today the panel renders NOTHING in production (migrations 0004–0010 unapplied; the read fails silent), so the pinned bytes hold until the live apply. (6) **The documents** — TUTOR_VISIBILITY gains the visibility-default row for the inquiries (the diagnostic mirror, never an evaluation; all evaluative data refused — no such column exists) and the §3 policy-matrix rows for 0009 and 0010; TUTOR_DISTANCE gains "The oversight's distance" — the affirmation the brief requires: the engine does NOT grade or score student inquiry history, no observation of behaviour, the one write is preparation, isolation rides the boundary — and row 2's verbatim sentence updates to the evolved statement (declared). (7) **Verified:** test-socratic-oversight 15/15 (new — grouping/time-word purity and determinism, the 12-cap, verbatim copy, the evaluative sweep, migration/action/reader posture pins, wiring, statement evolution, documentation rows) · test-socratic-logic 31/31 · test-socratic-surface 19/19 · next-action 34 · progress 16 · validate-subjects ALL VALID · check-subject-sql PASS · subject-import guard exactly its 4 declared false-positives (the new panel is guard-clean) · tsc clean · build exit 0 (34 pages — no route added) · smoke on the production build: /tutor 307 · relationship URL 307 for a visitor (the surface never leaks unsigned) · mathematics 200 · rehearsal 404 · server killed by port. STATE_LANGUAGE 9.3 pins the panel's sentences. **Owed:** live apply of 0010 with 0004–0009 · the populated-oversight walk in the credentialed environment (a marked inquiry round-trip) · the relationship-baseline re-pin (declared above, with the DEC-030 debt) · the provider-backed capability ruling. |


---

### DEC-036 — The Phase 9 Socratic Engine gate: five windows, five passes; certified 2026-10-08 (the gate record)

**The ruling:** the gate closed on a certifying run in which every window passed — the
strongest gate this lineage has run, with ZERO remediation needed: Phase 9 shipped clean,
and W1's full battery confirmed it. The phase is CERTIFIED; Phase 10 begins only by explicit
brief. The windows and their committed verdicts:

- **W1 — cold start & static health:** both static guards at their DECLARED baselines (the
  subject-import guard's 4 declared false-positives — zero new hits; the 3 declared breakpoint
  drifts — count unchanged); validate-subjects ALL VALID; every logic suite green (next-action
  34 · progress 16 · socratic-logic 31 · progress-record 18 · archive-logic 26 ·
  archive-surface 16 · archive-viewer 22 · academic-surface 20 · milestone-synthesis 21 ·
  socratic-surface 19 · socratic-oversight 15); `npm run build` clean (34 pages). No
  remediation needed — unlike the Phase 8 gate, the components were guard-clean from the first
  commit.
- **W2 — the pedagogical boundary & anti-chatbot audit (NEW BASELINE
  `audit/phase9-pedagogy.json`, 12/12):** zero filler/exclamation/emoji/widget anatomy across
  all twelve Socratic files; the guidance union pinned closed (no answer kind); fourteen
  completion-demand markers → ONE deterministic redirect; question-first for known milestones;
  brevity end-to-end (300 composer < 500 contract = DB); the honest absence pinned; zero
  reward register; the citation sentence kept; the prompt-type union cross-pinned byte-for-byte
  against migration 0009.
- **W3 — privacy, surveillance & grading (NEW BASELINE `audit/phase9-privacy.json`, 14/14):**
  RLS enabled+forced on both tables; no update policies anywhere; anon admitted nowhere;
  payload bounds 500/128/16 KB; zero surveillance and zero grading vocabulary (the one word
  "scores" is the refusal sentence itself); zero clock or timer; subject isolation in SQL AND
  logic (cross-subject keys → null; foreign artifacts invisible; readers spell their
  boundaries; identity rides the cookie alone); honest failure and dormancy pinned. The
  app-wide gate7 re-run PASSED over 296 files (rebaselined 284 → 296, declared).
- **W4 — mobile & performance (NEW BASELINE `audit/phase9-performance.json`, 11/11):** fluid
  regions, native inputs, ≥44px marks by construction; zero timers/effects in the island;
  the oversight ships zero client JS; client payload MEASURED from the committed build — 6
  scripts, 538.6 KB raw, 165.9 KB gzip, all shared with the archive rehearsal (zero
  socratic-only load-time bundle). The 390px visual walk and the relationship-baseline re-pin
  stand owed (declared).
- **W5 — phase close & lineage:** no new product exception (register unchanged, 19 open);
  nine questions answered from evidence; this record.

**The lineage:** DEC-033 the engine (schema · contract · resolver · rehearsal) · DEC-034 the
student's lens (seam · card · integration · the module's honest planned state) · DEC-035 the
tutor's mirror (overview · marks · both visibility documents) · DEC-036 the gate. State 9.1–9.3
record the steps; 9.4 records this close.

**Rule 18:** the gate created zero identities — every window ran offline; the credentialed
harnesses stand owed with their committed baselines.

**Declared findings:** one harness false-positive class resolved in W3 ("amplitude" = the
specimen physics question's vocabulary, not a vendor — declared in the baseline); three
harness defects corrected in W4 on first run, each verified against the build before moving
(path mapping; textTransform typography; relative imports) — zero product drift.

**What opens next:** the live apply of migrations 0004–0010 in the credentialed environment
wakes BOTH surfaces with zero edits — the student's own INSERT writes the exchange, the
related tutor reads it, the mark lands. The capability ruling decides the registry flip;
until then the deterministic engine is honestly named. Phase 10 awaits its brief.


---

### DEC-037 — Phase 10 · Step 1: the legal framework & guardian consent gates — E-07 CLOSED (2026-10-08)

**The ruling:** the legal framework stands and Exception E-07 is CLOSED. Three public routes —
`/legal/terms` (Terms of Academy Practice) · `/legal/privacy` (Privacy & Data Protection
Notice) · `/legal/guardian-consent` (Guardian Consent Framework) — carry dignified legal copy:
serif headings (Fraunces), a reading measure, the platform's public chrome, zero tracking,
zero exclamation marks. Migration 0011 creates the consent audit; the guardian gate is built,
proven in a dev rehearsal, and owed to real onboarding. Verified: test-legal-logic 23/23 (new)
· validate-subjects ALL VALID · check-subject-sql PASS · next-action 34 · progress 16 · full
Phase 5–9 battery green (188 tests) · both static guards at their declared baselines · build
clean, 38 pages · smoke: the three routes 200 with their sentences, the rehearsal 404 in
production, the footer carries the three links, server killed by port.

**The brief's reconciliations (all declared):**
- **Numbered 0011, sequential** — the brief's `20261008000007` slot belongs to
  classroom_sessions; the DEC-029/033 numbering precedent applies.
- **The brief's schema stands complete**, with three declared completions: (1)
  `guardian_email` is CHECKed REQUIRED for `guardian_consent_v1` and FORBIDDEN otherwise —
  the column means one thing; (2) `ip_hash` is CHECKed at 64 characters (the digest's shape);
  (3) the brief is silent on duplicates, and the table is deliberately **append-only WITHOUT
  a (user_id, consent_type) unique constraint** — this is a consent AUDIT, not a state flag,
  and a future withdrawal-and-regrant flow deserves both rows. Idempotency lives in the write
  action instead (it reads the standing consent first and refuses a duplicate calmly).
- **The address is never stored.** The action hashes the connecting address server-side
  (first x-forwarded-for entry, else x-real-ip) with SHA-256 and writes only the digest.
  When no address is visible, the literal sentinel `no-address` is hashed — the audit records
  absence honestly, and the column's shape never reveals which case occurred. DECLARED
  residual risk: unsalted SHA-256 of an IPv4 address is brute-forceable by a reader who holds
  the row; the upgrade path is an HMAC keyed server-side, and it waits on the owner's ruling.
  The brief said "one-way SHA-256 hash for audit, never raw IP" — that stands exactly.
- **The contact clause.** E-07 named four absences; three stand as routes. The fourth —
  "no contact route" — is met by the privacy notice's grievance section: this deployment is
  test-accounts-only and holds no real students' data, so no standing channel is published
  yet; it publishes the day real onboarding opens. Declared, not hidden.

**The gate's owed debts (declared in the closure record):**
1. The gate's wiring into real onboarding — no date-of-birth question exists anywhere yet;
   the gate mounts the day real onboarding opens (which stays closed, test accounts only).
2. The confirmation-link delivery channel — no email provider stands in the codebase; the
   gate's success sentence says so at the moment of consent, honestly.
3. Live apply of migration 0011 joins 0004–0010 in the credentialed environment.

**The lineage's evolutions, declared:**
- The footer gains the three legal links — the footer's own comment documented this exact
  absence ("the legal pages do not exist; drafting them here would look like compliance");
  the routes now resolve, so the footer's own rule admits them. Comment updated.
- The `/login` and `/register` notices no longer say the legal work is awaited — they state
  the framework stands. E-22 anticipated this replacement; its fold declaration stands, its
  copy premise is gone (row updated).
- The gate7 privacy audit allowlist gains ONE entry: the privacy notice's never-collected
  list names surveillance vocabulary in refusal sentences ("idle or dwell timers") — the
  refusal-context precedent (the W3 "scores" ruling). Re-run PASS over 304 files
  (rebaselined 296 → 304); `audit/phase7-privacy.json` updated.

**Verification beyond the brief's four commands (house discipline):** test-legal-logic 23/23 ·
subject-import guard at its 4 declared FPs (zero new) · breakpoint drift count unchanged ·
socratic-logic 31 · socratic-surface 19 · socratic-oversight 15 · archive-logic 26 ·
archive-surface 16 · archive-viewer 22 · progress-record 18 · academic-surface 20 ·
milestone-synthesis 21 · gate7-privacy-audit PASS (304 files) · production smoke.

**Zero tracking, proven:** the legal pages ship no third-party beacons, cookies or pixels —
the platform never had any, and the gate7 re-run re-proves it over the new files. There is no
cookie banner because there is nothing to consent to; the privacy notice says so.

**Rule 18:** no identities created; every verification ran offline. The credentialed
harnesses stand owed with their committed baselines, unchanged.


---

### DEC-038 — Phase 10 · Step 2: production onboarding & age-gated authentication (2026-10-08)

**The ruling:** the legal framework gains its teeth. Registration is age-gated under the DPDP
Act 2023: the server computes the age from the date of birth, an adult consents plainly and is
provisioned real, a minor lands `pending_guardian` and cannot be enrolled until a guardian's
token-verified consent stands — enforced by a database trigger, not by the UI. Tutors meet the
invitation gate. Verified: test-onboarding-logic 33/33 (new) · the brief's full suite green
(validate-subjects · check-subject-sql · next-action 34 · progress 16 · legal-logic 23) · full
Phase 5–9 battery green (188 tests) · guards at declared baselines · gate7 privacy audit PASS
over 310 files (rebaselined 304 → 310) · build clean, 41 pages · smoke: register carries the
DoB gate, the guardian page doors to login, the verify handler answers honestly, server killed
by port.

**The brief's reconciliations (all declared):**
- **Numbered 0012** — the brief's number stands (0011 was Step 1).
- **`date_of_birth` and `guardian_verified`** land on profiles exactly as briefed: DoB
  nullable (legacy and test accounts carry none — `scripts/test-account.mjs` and every
  fixture keep working, and the trigger treats absence as no age condition);
  `guardian_verified` NOT NULL DEFAULT false.
- **The age boundary is structural:** the enrolment trigger refuses a minor's insert while
  `date_of_birth + interval '18 years' > current_date` and the flag is false. The exact 18th
  birthday is the first adult day (equality, not greater); a 29 February birth clamps to
  28 February in common years — the Postgres interval convention, mirrored exactly by the
  pure logic and pinned by test, so form, action and trigger can never disagree.
- **`is_test_account` flips false ONLY through the verified path** — the column's default
  stays true; the service-role write that lands with consent performs the flip (at signup for
  a consenting adult; at guardian verification for a minor). The brief's requirement, met by
  code.
- **`pending_guardian` is a state, not a column:** a profile whose DoB indicates a minor and
  whose `guardian_verified` is false. The minor's account exists but is DORMANT — the
  trigger blocks enrolment, no teaching data is processed; that is the DPDP posture.
- **The confirmation sentence** stands verbatim — "Consent has been confirmed. The
  student's academy access is now active." — with the brief's `{Subject}` placeholder
  omitted: no enrolment exists at verification time; the chambers OPEN with the consent, and
  the copy says exactly that.
- **`src/app/register/`** — the route stands where it has since Phase 5 (`(auth)/register`);
  the brief's path names the page, the lineage keeps the group.

**The tutor invitation gate:** self-service tutor registration is refused with dignity — the
form shows the gate, and the action refuses the role server-side (defence in depth). WHY the
gate refuses rather than collects credentials: no review surface exists for them, and
collecting what the platform cannot look at is a false feature. The invitation and
credential-review flow stand OWED to the environment that hires tutors; the copy says so.
Test tutors keep their path (`ROLE=tutor scripts/test-account.mjs`, service role) — untouched.

**The verification mechanics (migration 0012 + `src/lib/auth/guardian-verification.ts`):**
one pending link per student — issuing again REPLACES the standing one; the ledger stores
only the token's SHA-256 digest (the raw token exists in the link and nowhere else); the
7-day expiry is judged strictly; redemption is guarded by `verified_at IS NULL` so a
double-click cannot double-record, and performs the three service-role writes (ledger marks
verified · legal_consents gains guardian_consent_v1 · profile flips guardian_verified and
is_test_account). The raw token never reaches the browser — the gate's outcome sentence says
the delivery channel is owed rather than showing a link a student could click themselves.

**The service client's first consumers (declared):** `createServiceClient()` — previously
unused ("none exist yet") — now performs the consent writes, the ledger, the flips and the
rollback. Its posture is unchanged: server-only, env-guarded, never student-facing reads.

**No half-open doors:** the adult path checks the service credentials BEFORE creating the
account; a consent-write failure deletes the just-created auth user (rollback) and speaks the
closed failure sentence. A minor's path writes nothing but the account.

**Retired by this step (declared):** the register form's test-era "Test accounts only" alert
and the `test_ack` checkbox — real onboarding stands, so the form no longer claims every
account is a test account. The register-form header comment records the retirement.

**Owed, declared:** the confirmation-link DELIVERY channel (no email provider stands — the
gate says so at the moment of consent, as in Step 1) · live apply of migration 0012 joins
0004–0011 in the credentialed environment · the tutor invitation/credential-review surface ·
the withdrawal mechanism for guardian consent (the framework page describes it as owed since
Step 1) · rls_test.sql's line-50 premise ("every account is flagged test") documents the
pre-onboarding era; against a project DB that holds real signups it will fail BY DESIGN —
declared, not weakened; the `--local` throwaway run stays green.

**Rule 18:** no identities created; every verification ran offline. The sandbox holds no
credentials, so the credentialed walks (a real adult signup round-trip, a minor→guardian
verification round-trip, the trigger's refusal observed live) stand owed with this record.


---

### DEC-039 — Phase 10 · Step 3: security hardening, CSP & credential audit (2026-10-08)

**The ruling:** the platform hardens for launch. Six security headers stand on every route
(CSP · HSTS · nosniff · DENY framing · referrer discipline · Permissions-Policy with
interest-cohort refused); the sensitive routes are limited by an in-memory sliding window
keyed on one-way hashes; and the zero-leak sweep proves the committed tree carries no
secrets, no real identities, no stale env files. Verified: test-security-logic 14/14 (new) ·
audit-secrets clean (532 tracked text files) · the brief's full battery green (validate ·
subject-sql · next-action 34 · progress 16 · legal 23 · onboarding 33) · full Phase 5–9
battery green (188) · guards at declared baselines · gate7 privacy audit PASS over 311 files
(rebaselined 310 → 311) · build clean, 41 pages · smoke: all six headers on every route,
login 5/15min held at the 6th POST (429, the calm sentence verbatim), register 3/hour
(write-only budget — GETs never consume it), verify-guardian 10/hour held at the 11th GET,
server killed by port.

**The CSP, tuned to what loads — nothing looser:** `default-src 'self'` · `script-src 'self'
'unsafe-inline'` (the app's bundles plus Next's streamed bootstrap — nonce-based tightening
stands as the owed upgrade, declared) · `style-src 'self' 'unsafe-inline'` (Tailwind + the
token-driven inline styles) · `font-src 'self' data:` · `img-src 'self' data: blob:` ·
`connect-src 'self' https://*.supabase.co wss://*.supabase.co` · `frame-ancestors 'none'` +
`base-uri 'self'` + `form-action 'self'` + `object-src 'none'`. **`unsafe-eval` stays OUT:**
the WebGL lattice is a bundled module drawing to a canvas (src/lib/ambient/webgl-lattice.ts)
— proven eval-free by test. The brief's requirement holds exactly. LiveKit cloud endpoints
join connect-src the day the live module wires credentials (owed, declared — no loose
wildcard stands in their place today).

**The declared cost of `frame-ancestors 'none'`:** any environment that embeds the app in an
iframe is refused by design (anti-clickjacking is the point); previews are opened at their
own URL. Recorded here so the refusal is never mistaken for a defect.

**The rate limiter (`src/lib/security/rate-limit.ts`, wired in `src/proxy.ts`):** sliding
window, zero dependencies, thresholds pinned — /login 5/15 min · /register 3/hour ·
/auth/verify-guardian 10/hour. Only ATTEMPTS count: POSTs to the auth routes (the
server-action submissions) and GETs to the verification handler; page reads are never
limited (proven in smoke). Keys are SHA-256 digests of `bucket:address-source` — the raw
address never becomes a map key, the consent audit's own address convention reused. Refusals
speak the pinned sentence with an honest Retry-After and never extend the refusal. DECLARED
properties: in-memory per process (the brief's shape; a shared store is the owed upgrade) ·
the store caps at 20 000 keys with blunt eviction · a refused probe cannot enumerate
accounts, because the refusal is identical whether or not the email exists.

**The zero-leak sweep (`scripts/audit-secrets.mjs`):** scans every git-tracked text file for
JWTs, cloud key shapes, private key blocks, credentialed connection strings, secret-looking
literals, real-looking emails, phone shapes, tracked .env files and undeclared NEXT_PUBLIC_
variables. CLEAN over 532 files. The email allowlist is RFC-based, not a waiver: RFC-2606/6761
reserved domains (example.* · *.example · *.invalid · *.test) · the RLS fixture domain
(test.local, rls_test.sql) · validator test cases (a@b.com and its kin) · ONE file-level
allowance with a hand-read reason (the P5-R2 report quotes an address its own guard REFUSED).
One source-fix landed during the sweep: a dev preview's placeholder moved from a real-looking school domain
to the reserved `you@school.example` — the sweep stays strict.

**Anti-enumeration:** sign-in failures stay generic — one vague refusal sentence regardless
of which half was wrong (the 5.7 decision, pinned by test: no "wrong password" / "no such
account" sentence exists). Response-TIME parity rides the auth service's own behaviour and
cannot be equalized from this side of the wire; the message-side guarantee is what this step
pins, and the timing walk stands owed with the credentialed debt (the P6 precedent).

**Zero-leak, client-side:** `SUPABASE_SERVICE_ROLE_KEY` has no NEXT_PUBLIC_ prefix and is
read only in src/lib/supabase/service.ts (browser-guarded); the sweep proves only the three
declared NEXT_PUBLIC_ variables exist anywhere in the tree.

**Owed, declared:** nonce-based CSP tightening · the LiveKit connect-src addition · the
shared-store rate limiter for multi-instance deployments · the timing-parity walk · the
credentialed round-trips (carried from Step 2).

**Rule 18:** the sweep asserts zero real identities in the tree; the gate's fixtures remain
the only named people, on reserved domains. No identities created by this step.


---

### DEC-040 — The Phase 10 Final Platform Gate: five windows, five passes; platform READY FOR PRODUCTION (2026-10-08, the gate record)

**The ruling:** the capstone gate closed on a certifying run with ZERO remediation of product
code — the only fix the windows surfaced was the zero-leak sweep's own documentation quoting
its quarry (rendered self-clean at the source; the sweep stayed strict). The platform is
CERTIFIED and marked READY FOR PRODUCTION, with the lineage's honesty: ready means every
committed claim is proven; the six-item launch checklist (migrations apply · credentials ·
email channel · credentialed walks · browsered re-pins · owner rulings) stands between the
build and real students, and each item is stated in the open. The windows and their committed
verdicts:

- **W1 — master battery:** 308 tests green across all ten phases (next-action 34 · progress
  16 · socratic 31+19+15 · archive 26+16+22 · progress-record 18 · academic-surface 20 ·
  milestone-synthesis 21 · legal 23 · onboarding 33 · security 14); both static guards at
  their declared baselines (subject-import 4 declared FPs; breakpoints 3 declared drifts);
  validate-subjects ALL VALID; the zero-leak sweep clean over 535 tracked text files; build
  clean, 41 pages.
- **W2 — legal & compliance (NEW BASELINE `audit/phase10-compliance.json`, 14/14):** the
  DPDP sentence verbatim in three places; server-side age; the minor halt complete
  (pending_guardian + trigger-blocked enrolment + guardian-deferred consent); the token flow
  whole; the one-way consent audit; the never-collected list complete and public; zero
  cookie banner stated as fact; zero tracker vocabulary in the tree; the terms' clauses
  pinned; E-07 CLOSED, register 18 open. Beside it, gate7-privacy-audit PASS over 311 files.
- **W3 — security, MEASURED LIVE (NEW BASELINE `audit/phase10-security.json`, 8/8):** the
  six headers live on real responses; the CSP exact, no unsafe-eval; /login 5/15min,
  /register 3/hour, verify-guardian 10/hour — each held at limit+1 with the calm sentence;
  the sweep and the static suite re-ran inside the harness; the harness booted its own
  server on port 3126 and killed it strictly by port (`serverKilledByPort: true` recorded).
- **W4 — the persona walk:** all four personas measured live at their honest boundaries —
  visitor (8 routes 200, the visitor door present), student/tutor/admin unsigned (307 to the
  login door with `next` preserved), guardian (honest `unavailable` without credentials; the
  confirmed page 200). The 390px posture pinned by construction (viewport meta measured in
  the live HTML; 44px touch floor; reading measures). The browsered visual walk stands owed
  (declared).
- **W5 — this record:** the whole-platform integrity table, the prompt tracker's closure,
  the launch certificate, the nine questions.

**The prompt tracker, closed:** `prompts/README.md` was never committed — the briefs lived
in the chat workspace. The tracker's substance stands committed in three places:
CONTINUE-HERE's IMMEDIATE ORDER · DEC-001…040 · the four gate reports. The stale
`prompts/README.md` references in CONTINUE-HERE are corrected by this close-out (declared).

**Rule 18:** the gate created zero identities — every window ran offline; the zero-leak
sweep asserts no real identity anywhere in the tree; the credentialed harnesses stand owed
with their committed baselines.

**The lineage:** DEC-037 the legal framework (E-07 closed) · DEC-038 the age gate · DEC-039
the security edge · DEC-040 the certificate. States 10.1–10.3 record the steps; 10.4 records
this close. Phase 11 awaits its brief.


---

## DEC-041 — The Arena Live-Preview Frame Door (2026-10-08)

**The problem:** DEC-039 locked the frame posture — `frame-ancestors 'none'`
plus `X-Frame-Options: DENY`, the anti-clickjacking wall. The Arena
live-preview environment embeds the app in an iframe; the wall refused it
by design, and the preview rendered blank.

**The ruling:** one narrow door, flagged and explicit. `next.config.ts`
reads `TA_PREVIEW_FRAME`; when a build starts with it set to `open`, the
two frame directives stand down and every other header ships byte-for-byte
identical — the CSP keeps `unsafe-eval` OUT, nosniff, referrer policy,
permissions policy and HSTS all hold. Without the flag — the committed
default, every production build — DEC-039's wall stands untouched. The
flag exists in a process environment, never in the tree.

**The cost, declared:** a process started with the flag can be framed. The
flag is used only for the Arena preview server; the production header set
is the one the Phase 10 security audit measured (audit/phase10-security.json),
and a rebuild without the flag restores the wall exactly.

---

## DEC-042 — The Admin Operations Console (Unfinished Work · Track 1, 2026-10-08)

**The problem:** the admin portal was architecture only — a route and a
guard. The manager needed a working back office: placements, credentialing,
subject-room oversight, testable without live credentials.

**The ruling:** the console lives inside the existing `(portal)/admin`
segment — no duplicate architecture. One data layer, `src/lib/admin/data.ts`,
two modes: LIVE (service-role client, its declared purpose; every mutating
action re-verifies role 'admin' before touching a row) and DEMONSTRATION
(credentials absent — the fixture ledger in the specimen register, mutated
in-process only, banner states exactly that). The P5-R1 proxy boundary
carves ONE narrow exception: with NO credentials, the /admin prefix passes
to its layout; with credentials the carve-out is unreachable and the layout's
role check stands as the second gate. Student and tutor boundaries are never
carved.

**Honesty held:** credentialing WRITES are not wired to a live database yet —
the approve action says so plainly instead of pretending (no false
affordance, P6-R11). The subject-room surface exposes exactly the two levers
a room honestly has (density, motion character), with their reach stated.
The sweep's gamification family flags the shared Badge primitive on the
admin chrome; four allowlist entries record why status pills are not
gamification, and the strict pass keeps the live surfaces clean.

---

## DEC-044 — Tuition & the Payment Gateway (Unfinished Work · Track 3, 2026-10-08)

**The problem:** the platform had no financial threshold, and the terms
pinned the opposite ("no checkout, no invoices, no payments anywhere on
this site"). Commerce arriving meant the legal surface had to move WITH
the feature, by its own versioning rule.

**The ruling:** one flat term tuition per chamber — no tiers, no anchors,
no countdown. The threshold lives at /tuition and /checkout/[subject];
chambers stay free of commerce (P6-R8). Settlement (webhook in live mode,
simulated in demonstration mode) flips the invoice to settled, provisions
the enrolment, and places the student only when EXACTLY ONE tutor is
active in the subject — more candidates means the decision belongs to the
admin console. Tutors have no read path on invoices: who paid never
colours the pedagogy (migration 0014, default-deny).

**The legal revision:** terms_v2 + privacy_v2. Clause 4 becomes "commerce
is a threshold, not a leash" while keeping its pinned title and leaving
sentence; the privacy notice names Stripe as processor when configured.
The consent union extends (0011 edited in place — NO production database
has applied these migrations; the launch checklist carries them all as
unapplied owner debt); new signups record v2, v1 rows stay readable
history. A re-consent flow for EXISTING v1 accounts stands owed — named
here, not pretended.

**Stripe posture:** the browser meets Stripe only as a top-level navigation
to its hosted page — the CSP never carries a third-party script. Keys
(STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) are names only; unconfigured
endpoints answer with one calm sentence and change nothing.

---

## DEC-045 — Production Wiring & the Live-Health Harness (Track 4, 2026-10-08)

**The problem:** the bridge to live services existed only as named absences.
The owner needed one template, one probe, one inspection panel — and a
handover the manager can hold.

**The ruling:** `.env.production.example` documents every name (Supabase
core, Stripe, LiveKit, APP_URL) and the migration push, values never in
Git. `scripts/smoke-live-production.mjs` probes pooler TCP, RLS-bounded
REST (anon must see zero profiles rows), Auth health, Stripe balance and
a signed LiveKit ListRooms — absent credentials are calm DEMONSTRATION
rows (exit 0); a CONFIGURED service failing is the only exit 1. The
`/admin/system` panel renders the same posture in the console, names
only. NEXT_PUBLIC_APP_URL becomes canonical; NEXT_PUBLIC_SITE_URL stands
as legacy alias. The Executive Handover Dossier closes the track.

---

## DEC-043 — Real Onboarding & the Tutor Application Door (Unfinished Work · Track 2, 2026-10-08)

**The problem:** student self-serve registration existed but the schema held
no credentialing state, and the tutor door refused outright — credentials
the platform could not review were never collected (the house rule).

**The ruling:** migration 0013 adds `profiles.approval_status`
(approved / pending_approval / rejected, default approved so every legacy
and test row stands unchanged). The application door at /tutor/apply is
public in every deployment (proxy carve-out; an applicant has no account
yet): it signs the applicant up as a tutor and marks the account
pending_approval via the service role; the administrator's Approve at
/admin/tutors moves it to approved. RLS parity is asserted, not added:
the standing policies key on role and ownership and never branch on
is_test_account, so real users hold exactly the test personas' isolation.
The age gate, guardian gate and verification handler from Phase 10 stand
untouched — date of birth still decides server-side, minors still wait on
guardian consent, and the consent writes still roll the account back on
any failure. Demonstration mode records applications in the fixture ledger
under the console's banner; nothing pretends.

## DEC-046 — The Cinematic 3D Homepage (owner brief, 2026-10-09)

The public home was rebuilt as the owner's "Meadow of Minds" cinematic
experience. Every route, subject door, and working feature from the prior
spine stands; only the presentation changed.

- **Spine retired by owner mandate, not deleted.** `HomeSpine`, the
  `src/components/spine/*` scene stack and `SiteHeader` are no longer
  referenced by the home or layout. The files remain in tree because the
  standing instruction is never to delete working components; a future
  owner decision can revive or remove them. The layout now mounts
  `SiteNav` (client, fixed): transparent over the hero, solid midnight
  with the gold rule everywhere else so ivory type stays legible on the
  light legal/tuition/subjects pages.
- **Brand mark.** `src/components/home/brand-mark.tsx` is the new vector
  lockup — TA monogram with a graduation-cap crossbar, the book opened in
  the A's counter, the gold swoosh — replacing raster. Gradient ids are
  namespaced (`ta-gold`, `ta-navy`).
- **Canvas.** `hero-canvas.tsx` is an optimized custom 2D canvas under the
  DOM overlay (the brief's R3F was an authorized either/or). Three Z-layers
  of ~1500 particles desktop / ~400 at 390px: twinkling stars, rising
  embers, drifting petals, plus the meadow floor — students at glowing
  desks among marigolds and book stacks, monitor amber + moonlight rim.
  Pointer parallax is capped at ±3.5° across planes; scroll pushes the
  camera in and drifts the headline. `visibilitychange` pauses the loop
  (battery, allowlisted in the sweep). Under `prefers-reduced-motion` the
  canvas renders one static lit frame: no parallax, no scroll camera, no
  animation loop.
- **The closed subject set stood.** The brief named "Computer Science &
  Logic" and "Humanities & Literature" among example doors; those ids do
  not exist in the immutable schema, and adding enum values is a schema
  change, not a homepage decision. The six REAL doors render instead, each
  with its live room name and subject accent as the door glow. This
  deviation is reported here rather than silently extending the set.
- **Copy is verbatim from the brief:** "Where curiosity rises. And futures
  begin." / "Discover personalised tutoring that builds confidence,
  deepens understanding, and helps every learner move forward." / CTAs
  "Book a Free Demo" + "Explore Our Programs" / "Learn • Grow • Succeed." /
  journey steps Diagnostic Conversation → Atmosphere Placement →
  Collaborative Discovery → Certified Milestone / mentor trio Individual
  Intellectual Arcs, Relational Mentorship, Record of Mastery.
- **Honesty preserved.** Testimonials are labelled specimen voices; the
  "Record of Mastery" panel states the refusals (no leaderboard, no
  attention timers); "Book a Free Demo" routes to the real `/register`
  door; no fake star ratings anywhere. The sweep's two new allowlist
  entries (hero canvas pause, refusal-vocabulary testimonial) are audited
  findings, not waivers.
- **HTML-first.** All copy and doors live in markup; if the canvas fails
  or never mounts, CSS gradients keep the night sky. Mobile serves the
  compact meadow with the reduced particle budget.

### DEC-046-A — CTA vocabulary revision (owner, 2026-10-09)

Owner direction superseded the brief's pinned hero CTAs: "Book a Free
Demo" + "Explore Our Programs" became "Apply as a Student or Parent"
(→ /register, the real onboarding door with the guardian-consent path)
and "Become a Tutor" (→ /tutor/apply, the Track 2 credential-review
door). The invitation section's closing CTA carries the same
student/parent apply label, and the nav CTA reads "Apply Now" for
width. Every CTA on the public surface now opens a real door; no demo
promise remains anywhere in src. The original verbatim CTAs above are
kept as the historical record of the brief as delivered.

## DEC-047 — The Interactive 3D Subject Gallery & the Seventh Subject (owner brief, 2026-10-09)

The owner's gallery brief directed Computer Science as a first-class
door. The identity schema warns that a new subject is a SCHEMA CHANGE to
be reported, never a silent extension — this entry IS that report, and
the owner directive is its authority.

- **Schema**: `computer-science` joins the governed set (status `ready`,
  so the production draft-gate does not 404 it). Migration 0015 converges
  live databases; 0001 was amended for fresh installs; the one-shot SQL
  bundle was regenerated. `scripts/check-subject-sql.mjs` now accepts
  hyphenated ids and asserts seven-way parity. Accent validated by the
  validator: electric blue ink `#00b4ff` / ivory `#0369a1`, mutually
  distinct (ΔE ≥15) and ≥20 from brass and signal teal.
- **Identity vs display**: the schema accent (validated) and the gallery
  display accents from the brief (sapphire/amber/violet/emerald/rose/
  turquoise/cyan+gold) are separate layers by design.
- **Architecture**: ONE shared WebGL context — a fixed `<Canvas>` with
  drei `<View>` portals scissored into the seven tracked DOM slots.
  IntersectionObserver flips the frameloop to "never" offscreen;
  `prefers-reduced-motion` renders lit static angles with tilt and
  rotation disabled; sub-768px steps geometry/particles down. The orbiting
  glyphs (π ∑ ∞, A & Q Ω, { } 01 =>) are 2D-canvas → CanvasTexture
  sprites: zero network font fetches, so the CSP connect-src posture
  stands. Cards are server HTML with static SVG motifs that hold the
  composition until the first GL frame fades them — HTML-first, no
  layout shift.
- **Cards**: six tall doors 3×2 (2-col tablet, 1-col mobile) plus the
  full-width Computer Science split-pane feature (text 45% / scene 55%,
  scene above text on mobile). Copy, accents and links verbatim from the
  brief; every card links to its real route — `/subjects/computer-science`
  now exists.
- **Deployment**: Netlify continuous deployment builds the pushed branch;
  the sandbox preview verifies the same commit. The Next.js runtime on
  Netlify needs no plugin (DEC-046 era fix stands).

## DEC-048 — Morning-light pivot (owner, 2026-10-09)

Owner directive overrides the midnight-navy night meadow: the public
home now lives in warm morning sunlight — ivory substrates (#FDFBF7 /
#F9F6F0 / #F4EFE6), deep academic navy type (#0A192F / #0F172A), slate
secondary text, champagne gold (#D4AF37 / #C5A059). The hero is the
"Morning Study Sanctuary": dawn-peach horizon into crystal sky-blue,
directional sun from the top right with volumetric shafts, sunlit dust /
golden pollen / ivory sparkles drifting upward, students at light-oak
and ivory desks among daisies and marigolds. The gallery, mentor,
journey, voices and invitation sections carry the same materiality
(warm-ivory glassmorphism, thin champagne borders, layered soft
shadows). No pure black, no midnight panels.

CTA NOTE: the pivot brief re-listed "Book a Free Demo" / "Explore Our
Programs", inherited from the original template. The owner's explicit
functional choice (DEC-046-A) — "Apply as a Student or Parent" /
"Become a Tutor", opening the real register and tutor-application
doors — STANDS, restyled in the new language (ivory ground, champagne
border, navy text; slate-navy secondary). If the demo labels are truly
wanted back, that is a one-line revert; say the word.

All contracts stand: 1500/400 particles, ±3.5° hero parallax, reduced-
motion static frames, visibility pause, HTML-first markup, AA-legible
ink accents on ivory (GALLERY_INK), damped ±3° card tilt with hover
lift, single shared WebGL context with View portals.

## DEC-049 — Cinematic Video Hero & Liquid-Glass Navigation (owner brief, 2026-10-09)

The Wanderful-aligned reference overrides the earlier hero concepts:
full-viewport cinematic video (owner-supplied CloudFront mp4, autoplay
muted loop playsInline, object-cover in a 1.08 wrapper, playbackRate
1.25, subtle lower gradient only), GSAP pointer parallax (offsets × 20,
lerp 0.06; disabled on touch and reduced motion — reduced motion also
freezes the video on a lit frame). Headline "Learn without limits. /
Grow beyond expectations." in Inter 400 at clamp(40px,5.4vw,72px);
bottom-centered support copy, white pill "Book a Free Demo" (→ the
existing /register booking door) and LEARN • GROW • SUCCEED. Header:
official lockup left at modest size, centered liquid-glass pill
(HOME · SUBJECTS · WHY US · CONTACT), glass BOOK A FREE DEMO right;
compact accessible mobile menu. Other public pages keep SiteNav via a
pathname switch.

- **DEMO LABELS RETURN.** The owner brief re-mandates "Book a Free Demo";
  this supersedes DEC-046-A's labels on the hero and nav. The application
  doors stand elsewhere: invitation keeps "Apply as a Student or Parent"
  plus a "Become a Tutor" door; /register and /tutor/apply untouched.
- **CSP — two DECLARED exceptions** (next.config.ts): media-src for the
  video CDN host, and style-src/font-src for fonts.googleapis.com /
  fonts.gstatic.com (Instrument Serif, Barlow, Inter per brief). No other
  external source stands; the sweep and this entry are the record.
- **Honesty of technique**: the hero is a cinematic video with pointer
  parallax — never described as interactive 3D. The rendered 3D subject
  gallery below stands unchanged (seven doors, shared canvas).
- **HeroCanvas/HeroDrift** (the morning meadow) retire unreferenced, per
  the standing no-delete rule; a future owner decision may revive them.
- **Deployment**: production CD rides the pushed branch; a pull request
  additionally yields a Netlify deploy PREVIEW so the owner can review
  without production changing underneath them.

## DEC-050 — Two Buttons, Exactly (owner override, 2026-10-09)

Owner override: the homepage carries exactly two buttons — **Apply as
Student** (solid warm-white pill, navy text → /register) and **Become a
Tutor** (liquid-glass pill, fine white border, white text →
/tutor/apply) — side by side beneath the hero support copy, stacked on
small screens, subtle hover, explicit keyboard focus outlines. "Book a
Free Demo", "Explore Our Programs", the header CTA and every other
homepage button are removed; the invitation section keeps its copy and
footer links but no buttons. Both targets are REAL flows (register and
the Track 2 tutor-application door) — nothing invented. Logo and
cinematic video stand. DEC-046-A's application-door intent returns in
this tighter form; DEC-049's demo labels are superseded.

## DEC-051 — The Valley Journey: scroll-driven hero → gallery transition (owner brief, 2026-10-09)

A pinned 380vh sticky scene, scrubbed by GSAP ScrollTrigger, carries the
visitor forward through the valley into the gallery. The cinematic
video is blended into a depth-separated layered valley (sky-matched
far hills, mid meadow, foreground grass + wildflowers). On scroll: the
headline and the two buttons fade and drift, the video dollies in
(scale →1.32) as a camera push, foreground grass sweeps outward past
the frame edges, mid/far layers part at differing rates, and an ivory
veil with golden sun-motes rises — its ivory is exactly the gallery
canvas, so the hand-off has no seam. Scrubbing upward rewinds every
layer; there are no cuts or blanks. Reduced motion collapses the pin
via CSS to a gentle static hero → gallery flow; no timeline is built.

Cards now layer THREE depth planes: a generated warm-light subject
image as backdrop (public/gallery/, fades the SVG motif on load), the
animated 3D object in front via the shared-canvas View portals, and
stable HTML text above. Hover/focus: card tilt, CSS image shift, and an
independent 3D HoverDrift (extra spin + lift) — layered parallax. The
gallery heading and cards reveal with staggered depth via
ScrollTrigger. New support line: "Explore your interests. Build your
understanding. Shape your future." Layout, links and the two-button
contract (DEC-050) stand; no new CTA buttons.

## DEC-052 — Scroll-Driven Horizontal 3D Carousel (owner brief, 2026-10-09)

The subject grid is superseded by a pinned 560vh scene whose scrubbed
scroll progress drives a controlled 3D carousel (0→6): cards glide
right→left in subject order, the centred card faces forward and closest,
neighbours rotate 28°, recede 140px and scale to 0.92 at 28px gaps.
Scroll up reverses; after Computer Science the pin releases into the
next section — no trapped scroll, no second scrollbar. Keyboard ← →,
drag and touch swipe all translate into the SAME scroll position
(ScrollToPlugin/scrollBy), so nothing fights GSAP. A seven-dot
indicator tracks position. Background gradients are extracted live from
the active image, mixed 72% toward ivory, blurred 24px — pale and warm.

- **Carousel component** (`subject-carousel.tsx`) implements the
  owner-supplied prop API verbatim (maxRotationDegrees, maxDepthPx,
  minScale, cardGap, backgroundBlur, gradientSize, gradientIntensity,
  enableKeyboard, cardAspectRatio, initialIndex) and exposes a
  controlled setPosition handle; no wheel/inertia of its own.
- **Data**: `SUBJECT_CARD_DATA` in subject-carousel-data.ts is the ONE
  array for images — current values are TEMPORARY placeholders; the
  owner's supplied collage assets did not persist into the workspace,
  so finals swap in as one-line `image` edits.
- The card width/height adapts to preserve the requested 0.8 aspect ratio
  while fitting the viewport; replacement-image focal points live next
  to each URL in the same data array. Tab focus auto-centres its card;
  ←/→ from the carousel region steps the vertical scroll position.
- Reduced motion collapses the pin (CSS) to a horizontal scroll-snap
  gallery; all seven stay reachable by touch and keyboard.
- The valley journey (DEC-051) now hands off into the carousel; the
  grid components (subject-gallery-cards/layer, gallery-reveal) retire
  unreferenced per the standing no-delete rule.

## DEC-053 — Remove Valley Transition; Dark Cards Only (owner override, 2026-10-09)

The pinned valley journey is removed. Keep the existing cinematic video
as a regular full-screen homepage hero with the same headline, support
copy, logo/nav layer, and exactly two existing buttons; no depth-layered
valley, pin, ScrollTrigger camera move, veil, or hero-to-gallery scrub.
The horizontal subject carousel remains scroll-driven and follows the
hero through normal document scrolling.

Apply the requested dark theme to the seven subject cards only: deep
blue-slate card surface, image tint and lower contrast veil, warm-white
subject copy, champagne border and restrained shadow. The carousel
section, headings, progress indicator, and all other homepage surfaces
remain in the existing light ivory palette. This narrowly overrides
DEC-048's light-surface direction for card interiors only; no other
panels or sections change theme.
