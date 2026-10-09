# PHASE 6 · STEP 5 — THE TUTOR'S STATES, THE ACCOUNT SURFACE, AND THE HONEST DISTANCE · REPORT

**Written 2026-10-06. Base tree `a893f5b` (single re-import commit, branch
`arena/e6e6e569-tutors-academy`), working tree clean.**

**PROVENANCE — READ THIS FIRST.** This report was written after the workspace was re-imported as a
single squashed commit, in an environment that has **no Chrome/Puppeteer, no Supabase credentials, and
no `.env.local`**. The 6.5 CODE was already built and committed when this environment was created.
This report therefore assembles its evidence from **what is recorded on disk** — the 2026-10-03
harness run (`audit/tutor-states.json`, generated `2026-10-03T18:16:59.506Z` against
`http://localhost:3100`), its pinned baseline (`audit/tutor-states-baseline.json`), the documents
this step produced (`docs/TUTOR_DISTANCE.md`, the 6.5 addenda in `docs/STATE_LANGUAGE.md` /
`docs/TUTOR_VISIBILITY.md` / `docs/EXCEPTIONS.md`, DEC-018 in `docs/DECISIONS.md`), and the fourteen-row
table in `src/app/dev/tutor-states/states.ts` — plus a **fresh static re-verification pass run in this
environment** (§12). Every claim below names which of those two classes it belongs to:
**RECORDED** (carried from the 2026-10-03 run, pre-re-import) or **RE-VERIFIED** (checked fresh here,
2026-10-06, without server, database or browser). A claim in neither class is reported untestable with
its reason (§11). Nothing was re-run against a live server; nothing in `src/`, `audit/`, `supabase/`
or `scripts/` was modified to write this report.

---

## 1. Precondition — the two report states quoted, and Part 0

**6.3's report state — PRESENT:** `PHASE6_STEP3_RELATIONSHIP_SURFACE_REPORT.md` exists on disk in the
committed tree (18,948 bytes), covering the relationship's surface, P6-R9's one canonical 404, the
three indistinguishable cases and the arc's consumers.
**6.4's report state — PRESENT:** `PHASE6_STEP4_LEVERS_REPORT.md` exists on disk (16,105 bytes),
covering `environment_settings`, the 108-combination validator, the five byte-identical reader
classes and attacks 6–8.

**Part 0 — carried close-outs, with evidence:**

- **6.3 left open:** the `[relationship]` fixture ordering hazard (an unordered `limit 1` flipped
  between two ended physics rows). **Closed at 6.4:** the identity matrix reads the fixture
  `order by r.id limit 1` — recorded in `docs/PHASE_TRACKER.md`, row "identity-matrix relationship
  fixture". RE-VERIFIED here as present in the tracker.
- **6.4 left open (declared in DEC-018):** the environment harness had not been re-run; the
  visitor-ready DOM hash moved `4abc8443 → 14865521` on the three shell-root attributes. Proven the
  only change at the time; baseline re-pinned with reason. RECORDED (DEC-018, admitted omission).
- **P6-R17/R18/R19/R20** (the 6.4 acceptance rulings) were applied **at the start of 6.5**, not in
  6.4: the shape link in the shell (`src/components/tutor/shape-link.tsx`), the `prebuild` wiring
  (RE-VERIFIED: `package.json` carries `"prebuild": "node scripts/validate-subjects.mjs"`), the draft
  door via `getTutorSubjectIds()`, and the declared cost in `audit/environment-baseline.json`
  → `declaredCosts`. All four RE-VERIFIED present on disk; their evidence is DEC-018.

---

## 2. The account surface (P6-R14)

**Before 6.5:** `/tutor/account` had resolved since 6.2 with **nobody having decided what it is** —
the brief's opening defect. Inspection found it was already the student's file, role-swapped
(`docs/TUTOR_VISIBILITY.md` §6.5: "It was already this since 6.2"). 6.5's work was to read it against
the ruling and pin it — not to redesign it.

**What it renders** (RECORDED — full DOM in `audit/tutor-states.json` → `evidence.tutorAccount.dom`;
200):

> `Account` (eyebrow) · **`Tutor A`** (h1) · `This is a test account. It may be deleted while the
> academy is being built.` · a `<dl>` of exactly three `<dt>` facts — **Name · Email · Role** —
> (`Tutor A` · `tutor-a@test.tutorsacademy.invalid` · `tutor`, a `<dd>`, not a control) · one form:
> `POST /auth/signout` with one button, **Sign out**.

Three things only, per the ruling: who they are signed in as (own name and own email), what they are
as fact, the way out. Zero inputs, zero selects, zero links in `<main>` (harness gate
`account-three-things`: PASS).

**Beside the student's** (RECORDED): `/student/account` renders the identical structure for
`Student C` / `student-c@test.tutorsacademy.invalid` / `Role student`. Gate
`account-matches-student`: **structure-identical after identity + role normalisation —
tutor hash `a49699247fabaad8` = student hash `a49699247fabaad8`.** The student's surface is the
precedent; no divergence to report — consistency inside the product and the ruling's letter coincide.

**No role affordance** (test 3): RECORDED gate `account-no-role-affordance` — `roleHits: []` ("the
Role row is a `<dd>` fact: no input, select, link or second form on the account surface").
RE-VERIFIED fresh by grep across `src/app/(portal)/tutor`, `src/components/tutor`, `src/lib/tutor`
for role-change/request/acquire vocabulary (`become a tutor` · `request role` · `change role` ·
`switch role` · `apply to become` · `upgrade account`): **zero hits (grep exit 1 = PASS).**

**Student account unchanged** (test 4): the pinned student-account structure hash is
`a49699247fabaad8` — identical before (5.3's surface) and after (RECORDED gate
`student-account-hash`); the baseline pin records it as "unchanged by 6.5".

---

## 3. P6-R15 applied to the settings write — the four cases

All four RECORDED from the 2026-10-03 run (`audit/tutor-states.json` → `evidence.write`), against
real POSTs with fixture test accounts, rows restored after (`rowRestored: "ABSENT"`).

**CASE 1 — UNKNOWN OUTCOME** (gate `write-unknown-outcome`: PASS). The POST was aborted mid-flight.
After the cut: `nothing of ours (browser error page)` — no verdict, no "saved", no "failed", no
"try again". The settling GET (the shaping surface itself): **200**, `settledGetShowsFailedSentence:
false`, settled state line **`This environment is as authored.`** Row after: `ABSENT`. P6-R15 holds:
the product said nothing it did not know; the GET said what was true.

**CASE 2 — FAILED SAVE, KNOWN** (gate `write-failed-known`: PASS). An unauthored value → 303 →
`/tutor/physics/environment?shape=failed`. One sentence beside the control, wired
`aria-describedby="blast-radius shape-failed"`: **`That did not save. The environment is unchanged —
the values shown are the ones in force.`** Row before = row after = `ABSENT` (nothing changed). No
verdict rendered anywhere else.

**CASE 3 — SESSION ENDED MID-SAVE** (gate `write-session-ended`: PASS). POST with expired cookies →
proxy 307 → **`/login?next=%2Ftutor%2Fphysics%2Fenvironment&reason=ended`** — `next` is the SETTLING
GET, never the write URL (which answers GET with 405 — the dead end 6.5 found and fixed; the table in
`src/lib/state/settle.ts` names it). The login page renders one plain sentence: **`That session ended.
Signing in again goes back to the Physics environment.`** Row after: `ABSENT`. After signing in:
landed `/tutor/physics/environment`, 200, state `This environment is as authored.` — the settled state
is what the tutor sees on return.

**CASE 4 — CONCURRENT CO-TUTOR CHANGE** (gate `write-concurrent`: the gate RECORDS, it does not
pass/fail). Between tutor T's load and submit, the row was changed underneath by SQL as tutor U
(`sparse/precise/3aebe896…`). Tutor T's submit replaced it: `rowAfterSubmit:
dense/editorial/c0c08c6d…`, surface state `Last shaped by you.`, `anySentenceAboutTheOtherWrite:
false`. **Verdict recorded verbatim: `LAST-WRITE-WINS, SILENT — the other tutor's change was
overwritten and nothing on the surface says so.`** **This was stopped and reported as a design
decision, not built around** — see §10.

---

## 4. The shaping surface's read-failure rule (T3)

**The rule, stated once** (from the 6.5 addendum of `docs/STATE_LANGUAGE.md`, RE-VERIFIED on disk):
`getEnvironmentSettings` answers a failed read with the authored default and `source:
"authored-after-failed-read"`. For the ROOM that is right — the design has a value without the
database, and a broken room would punish every student for a transient fault. For the SHAPING SURFACE
it is wrong, because the surface is a form: pre-filled with defaults that may not be the values in
force, one Save would silently replace another tutor's shaping while the state line said "as
authored". So the page checks `source` and renders the honest page — **the only place in the product
where "fall back to the authored default" is refused.**

**What renders** (RECORDED gate `shaping-read-failed`: PASS; `codeGate: true`): status 200,
`hasForm: false`, honest text:

> `Not shown` · `This environment's settings could not be read just now. Nothing was changed. The room
> still looks as it was set; opening this page again only reads — it is safe to do.` · `Open it again`
> → the same GET.

Log line: `{scope:"page:/tutor/[subject]/environment", errorClass:"SettingsUnread"}` in addition to
the reader's own `region:environment-settings` line.

**Honest limit, declared:** the trigger itself (a failing settings read) was **not forced against
production** — the branch is proven by the code gate plus the dev frame
(`/dev/tutor-states/frame?case=read-failed`, which renders no `<form>`). Carried into §11.

---

## 5. The fourteen states, as a set

The canonical table is `src/app/dev/tutor-states/states.ts`, copied verbatim into
`docs/STATE_LANGUAGE.md`'s 6.5 addendum (both RE-VERIFIED on disk and in agreement). Thirteen rows
verify `yes`; one verifies `recorded` (row 9 — the design decision of §10). Rendered for the owner at
`/dev/tutor-states` (dev-only; `notFound()` in production — RE-VERIFIED: guard at
`src/app/dev/tutor-states/page.tsx:41`).

| # | State | Surface | What renders (claim) | Verified |
| --- | --- | --- | --- | --- |
| 1 | read fails on the shell | `/tutor` | the honest page in the tutor layout — never state A from a failed read (nothing was recorded; re-open only reads) | yes — `tutor.cjs` read-path gate |
| 2 | read fails on the relationship's surface | `/tutor/[subject]/[relationship]` | the reader THROWS `DataReadError` → the same boundary, the same honest page; never 404 — a failure is never "nobody here" (P5-R9) | yes — `relationship.cjs` |
| 3 | read fails on the shaping surface | `/tutor/[subject]/environment` | the honest page, **NO FORM** (a form pre-filled with defaults would invite an accidental revert) | yes — code gate + dev frame; trigger not forced in prod (§11) |
| 4 | a region fails | the record region | nothing in that region; one log line; the primary answer is never silently absent | yes — `relationship.cjs` region gate; `isolate.ts` one pattern |
| 5 | the write is in flight | the shaping POST | nothing of ours — a plain form POST; the browser's own pending state (no client JS on the route) | yes — `no-js-saves` (scripts on route = 0 of ours) |
| 6 | the write failed, known | `?shape=failed` | one sentence beside Save; row untouched | yes — §3 case 2 |
| 7 | the write's outcome is unknown | POST cut mid-flight | nothing of ours; the settling GET shows the truth; no auto-retry (P5-R8.12) | yes — §3 case 1 |
| 8 | the session ended mid-save | POST with expired cookies | the settling GET as `next`, one plain sentence, settled state on return | yes — §3 case 3 |
| 9 | a co-tutor changed the values between load and submit | the shaping POST | **last-write-wins, silent — recorded; nothing on the surface says so** | **recorded — STOPPED AND REPORTED** (§10) |
| 10 | a relationship ends while the page is open | the next request | 404 — the same bytes as never-related and nonexistent (P6-R9); nothing the tutor could have caused | yes — identity-matrix ended cell; `relationship.cjs` |
| 11 | no settings row | the shaping surface | the authored values selected; `This environment is as authored.`; no Revert (nothing to put back) | yes — settled state in case 1; `levers.cjs` |
| 12 | 500 / 404 on each route | all three | 500: the tutor boundary's honest page. 404: the global honest 404 — delivered client-side by framework defect #99287, declared | yes — identity matrix; 5.7 flip alarm |
| 13 | no-JS and reduced motion | all three | every state complete without JS (server-rendered; no client JS on any tutor route); **the settings form saves with JS off**; reduced motion changes nothing (no motion on these surfaces) | yes — gate `no-js-saves` (RECORDED: loaded 200, 10 scripts on page none of which gate the save, POST landed, `rowAfter: balanced/energetic/c0c08c6d…`); `tutor.cjs`/`levers.cjs` reduced-motion shots |
| 14 | the role's failure case | student on `/tutor/*`; tutor on `/student/*` | 307 to the person's own portal; no sentence, no alarm | yes — gate `role-crossing`, 6 rows, `alarm=0` on every one (RECORDED, all six chains pasted in `audit/tutor-states.json` → `roleCrossing`) |

---

## 6. `docs/TUTOR_DISTANCE.md` — the honest distance (P6-R16)

**Present on disk** (RE-VERIFIED) — one page, eleven rows: every tutor capability that does not
exist, **where its sentence is**, and what delivers it. Summary of the placements (the document itself
is the source of truth):

| # | capability a tutor would reach for | where it is named | delivers |
| --- | --- | --- | --- |
| 1 | Teach (sessions, work, feedback) | the shell, after the student list: `Nothing to do here. … Teaching surfaces are not built.` | Phase 7 |
| 2 | Teach this student | the relationship's surface, after the arc: `Nothing here is done by a tutor yet: teaching surfaces are not built.` | Phase 7 |
| 3 | See the student's record | the record region renders **nothing** (structurally); the statement beside it says why | Phase 7 writes events; Phase 9 renders under P5-R6 |
| 4 | Be placed / request a student | the empty shell: `No student is placed with you. … it is not done from this page.` No "request" control — an affordance that cannot succeed is false (P6-R11) | the consent ruling (not a numbered phase until ruled) |
| 5 | See their own arrangements (active/ended) | **named future home: the shell** — moved from "account" by this document, because the account page is three things and nothing else; requires the consent ruling; not built | consent ruling |
| 6 | The tutor's own subject page (`/tutor/[subject]`) | **does not exist and was not added** — the inverse rule: a route existing to be empty is worse than no route; today `/tutor/physics` is `404 — There is no page at this address.` | Phase 7, when the route has content |
| 7 | Co-tutor awareness | the state line: `Last shaped by another tutor.` — the fact the row carries; no name, no date | a user ruling with a policy attached (DEC-018 Item 5 refused the grant) |
| 8 | Know a co-tutor changed the room mid-edit | **nothing — the one row that is a defect, not a distance** (silent last-write-wins; §10) | ruling required before 6.6 closes it |
| 9 | Notify students the room changed | nowhere, by decision: the shaping surface states what it does not do (`Nothing announces the change. …`) | not planned |
| 10 | Per-student anything | nothing names it, deliberately — naming it would advertise what the model forbids (attacks 6/7: unrepresentable) | never (P6-R10; cohort levers in Phase 7, not person) |
| 11 | Export/aggregate/roster/notifications/preferences/profile editing | nothing, and no place for them | not planned (`docs/TUTOR_VISIBILITY.md` refusals) |

**Placement audit (test 15):** rows 1, 2, 4 are named at the point of expectation, in the voice,
without apology ("are not built", never "coming soon"); rows 5, 6 apply the inverse rule (no page
created — the future home is written in the document, not in the product); sweep for `coming soon` ·
`roadmap` · `changelog` · `soon` · `planned` · `not yet available` across every tutor surface's
rendered text: **0 hits**.

---

## 7. The consolidated sweeps (across all three surfaces + account, at once)

All RECORDED from the 2026-10-03 run over `/tutor`, `/tutor/account`, `/tutor/physics/environment`,
`/tutor/physics/[relationship]` and `?shape=failed`:

- **Never-contains list** (count · roster-as-list · progress columns · sortable tables · "needs
  attention" · alerts · triage · engagement metrics · comparison · ranking · export · notification
  affordance · skeletons · invented activity · second primary · dead nav · student count · recency of a
  student · any per-student anything): gate `never-contains` — **`hits: []`**.
- **PII floor:** gate `pii-floor` — **`leaks: []`**; note recorded: "the account surface is excluded:
  it shows the tutor THEIR OWN email (P6-R14)." Display name and subject are the only student facts any
  tutor surface carries.
- **No aggregate, no export, no third-party access:** covered by the same sweep (no hits) and by the
  refusals in `docs/TUTOR_VISIBILITY.md`.
- **The identical-statement property:** carried from 6.3 (`audit/relationship-baseline.json`: three
  indistinguishable cases, statements byte-identical across students, 32/32 gates) and 6.4 (five
  reader classes byte-identical, `e58e35e9f5106ffd` ×5). 6.5 changed neither reader; the 2026-10-03
  run re-read the surfaces and found no new divergence.
- **The subject rule:** the tutor surfaces' sentences were swept in the same run; their grammatical
  subjects are the subject (`The Physics environment…`), the academy (`Placing is done by the
  academy…`) and the page itself (`This page reads the record and changes nothing.`) — no sentence
  puts a student in the subject position.

---

## 8. The identity matrix

RECORDED (DEC-018 / `audit/identity-matrix.json`): **80 routes × 6 reader classes + 3 write probes**,
every subject instantiated (P6-R19: the tutor × draft-environment cell per subject). Tutor T ×
physics = `200 environment:shape-link`; tutor T × chemistry/biology/english/history = 404 (no
placement); visitor/expired/tutor U 404 on every draft; no student sees the shape link, no tutor sees
a student region. 6.2's row *"tutor T denied student A's draft door"* was **REWRITTEN, not deleted**:
*"tutor T is admitted to the draft environment's identity, and denied every student region of it."*

**Coverage-gate proof (drop a row → FAIL)** was demonstrated at 6.2 and re-asserted at 6.4
(`docs/PHASE_TRACKER.md`: "a route without a pinned row FAILS; the row is added in the same step with
`--write`"). It was **NOT re-proved in this report run** — the harness requires Puppeteer and a
running server, absent here (§11). The pinned matrix file is on disk and unchanged by 6.5.

---

## 9. Accessibility, mobile-first, performance, payload

- **No client JS added** (constraint): RECORDED per-route script counts — `/tutor` 11, `/tutor/account`
  11, `/tutor/physics/environment` 11, the relationship surface 11 — all framework hydration, none of
  ours; the shaping surface saves with JS off (gate `no-js-saves`). RE-VERIFIED structurally: the
  write is a plain `<form method="post">` → 303; no `"use client"` added to any tutor file in 6.5.
- **Payload:** RECORDED page bytes — shell 36,317 · account 29,467 · shaping 42,305 · failed 42,990 ·
  relationship 48,703. No route gained weight beyond its own sentences.
- **Route count (test 16):** RECORDED pin **58** ("56 + /dev/tutor-states + its frame; 0 production
  routes added"). RE-VERIFIED fresh: 54 `page.tsx` (42 dev) + 4 `route.ts` = **58 route files** —
  matches the pin. The only destination 6.5 made true is `/tutor/account`, which already existed.
- **Mobile-first / fold / targets:** the account surface is one `<dl>` and one button in
  `ta-container--content`; fold and 44px-target gates for the tutor shell were certified at 6.2
  (composition, ratio 2.24, fold 358/218/468/532) and re-checked at P6-R17 with the one declared diff
  (the shape link). 390-first screenshots exist under `audit/tutor-shots/` and `audit/shell-shots/`
  (on disk).
- **Performance, declared cost (P6-R20):** RECORDED in `audit/environment-baseline.json` →
  `declaredCosts` — the visitor environment's +≈120 ms is ONE anon settings round trip, **in parallel**
  with the identity read (`Promise.all`; if it were sequential it would have been fixed — it was not).
  n=8, 1 warm-up discarded, both viewports: 390 TTFB median 151 ms / LCP 316 ms; 1280 TTFB 147 / LCP
  360 (emulated). No cross-request caching (a stale room after a save would be worse than 120 ms).
  Phase 10 line: static/ISR for the visitor environment is a Phase 10 question; no work now.
- **Account-surface LCP on the mid-range profile:** NOT MEASURED in this environment (requires
  Lighthouse in a browser; §11). E-24 stands: a red `perf-mid-range` is re-run once before belief.

---

## 10. Design decisions found — the owner's items

**THE CONCURRENT-CHANGE CASE IS THE ONE 6.5 STOPPED ON.** Test 8 produced a silent overwrite
(§3 case 4): tutor U shaped the Physics room; tutor T, with the page still open from before U's save,
saved their own values — **U's change was replaced and no surface said so** (`Last shaped by you.`,
`anySentenceAboutTheOtherWrite: false`). Per the brief this is *"a design decision, not an
implementation detail"*; nothing was built around it. The options, for the owner:

1. **Accept last-write-wins, silent** — the values belong to the subject (P6-R10); a shaping is a
   design setting, not a document; co-tutors are rare; the state line already says who shaped last.
2. **Accept last-write-wins, NOT silent** — add one sentence when the row changed between load and
   submit ("Another tutor shaped this room while you were deciding. Your save replaced theirs.").
   New copy on a certified surface — needs a ruling.
3. **Refuse the stale write** — carry the row's `updated_at` in the form; a save that meets a newer
   row reloads with the current values. New semantics for the write — needs a ruling.

`docs/TUTOR_DISTANCE.md` row 8 names it: *"ruling required before 6.6 closes it."* **It is unresolved
as of this report.** 6.6's gate must either carry the ruling or close honestly partial.

**Second decision carried (already settled in DEC-018 Item 5, listed for completeness):** co-tutor
awareness was refused — no policy lets a tutor read other tutors' relationships;
`docs/proposed/environment_shared_note.sql` remains a proposal.

---

## 11. What was not tested, and why (the gaps, written down)

| item | reason |
| --- | --- |
| Re-running ANY browser harness (`tutor-states.cjs`, `tutor.cjs`, `relationship.cjs`, `levers.cjs`, `identity-matrix.cjs`, `states.cjs`, `gate.cjs`, …) | this environment has **no Puppeteer and no Chrome binary**; the harnesses `require('puppeteer')` |
| All live-server observations (statuses, journeys, DOM, screenshots) | no dev/prod server was started for this report; carried from the 2026-10-03 recorded run instead |
| Everything database-dependent (RLS suite `test-rls.sh`, `test-tutor-visibility.mjs`, `test-account.mjs`, row counts of test 28, the write cases re-executed) | **no `.env.local`**, no Supabase credentials, no `DATABASE_URL` in this workspace |
| The read-failure TRIGGER forced in production (row 3) | the branch is proven by code gate + dev frame; forcing a failing anon read live was not possible here — declared in `states.ts` itself |
| Account-surface LCP on the mid-range profile; Lighthouse | requires a browser harness |
| Row 9 resolution | not a test gap — a ruling gap (§10) |
| `npm run build` succeeding end-to-end HERE | known environment restriction: `next/font/google` cannot fetch in this sandbox (Node egress resets to fonts.googleapis.com); dev mode renders with fallback fonts. The production build is certified in the recorded environment; see §13 |

**Row counts (test 28) — recorded state:** the project DB held only test fixtures at 6.5 (6 profiles,
1 active relationship, `environment_settings` cleared by every harness at start and end —
`docs/PHASE_TRACKER.md` row "no row left behind"; `docs/EXCEPTIONS.md` E-14 discipline). Cannot be
re-queried here; carried.

---

## 12. Static re-verification run, this environment, 2026-10-06 (RE-VERIFIED, fresh)

| check | command | result |
| --- | --- | --- |
| TypeScript, whole tree | `npx tsc --noEmit` | **PASS (exit 0)** |
| Subject validator (prebuild gate) | `node scripts/validate-subjects.mjs` | **PASS** — `6.4 lever combinations: 108 (18 per subject) PASS` · `ALL SUBJECTS VALID` |
| Subject ⇄ SQL agreement | `node scripts/check-subject-sql.mjs` | **PASS** — subject ids, density and motion_char enums: SQL == config; DDL names no identity value |
| Next-action engine | `node --import ./scripts/ts-loader.mjs scripts/test-next-action.mjs` | **34/34 PASS** |
| Progress language | `node --import ./scripts/ts-loader.mjs scripts/test-progress.mjs` | **16/16 PASS** |
| Role-affordance sweep | grep across all tutor sources | **0 hits** (exit 1 = PASS) |
| Route-file count | `find` | **58** = pinned `route-count: 58` |
| `/dev/tutor-states` prod guard | inspection | `notFound()` when `NODE_ENV === "production"` (line 41) |
| Working tree | `git status --porcelain` | **empty** (before this report file) |

**Findings — two static guards FAIL on the committed tree. Both pre-date this report; neither was
introduced or fixed here. Diagnosed, recorded, and left for a ruling:**

1. **`check-subject-imports.mjs` → exit 1, one violation:**
   `src/components/shell/subject-shell.tsx:5` — `import type { MotionChar } from "@/lib/subjects/subjects"`.
   **Diagnosis: false positive.** The Phase-3 guard's regex cannot distinguish a TYPE-ONLY import
   (erased at compile time; reads no config at runtime) from a value import. The component consumes
   tokens/props otherwise; `tsc` is clean. Fixing the guard is a quality-gate change — **not taken
   without a ruling.**
2. **`check-breakpoints.mjs` → exit 1, two drifts:**
   `src/components/layout/nav-shell.tsx` media width **479px** and
   `src/components/spine/scenes/enter.tsx` media width **47.99rem** (=767.84px), against the canonical
   set `[0, 480, 768, 1024, 1280, 1536]`. **Diagnosis: deliberate max-width off-by-one patterns**
   ("below 480" / "below 768") shipped in Phase 2.6 and Phase 4; the Phase-2 canonical set does not
   model them. Present in the certified baseline era; **declared here for the first time as a guard
   mismatch, awaiting a ruling** (extend the canonical model to `max-width` edges, or rewrite the
   queries).
3. **Runner note:** the bare invocations `node --experimental-strip-types scripts/test-*.mjs` FAIL
   here with `ERR_MODULE_NOT_FOUND` (extensionless TS imports); the project's documented runner
   `node --import ./scripts/ts-loader.mjs …` is required and passes. Recorded so a future window does
   not mis-read the failure as a regression.

---

## 13. Lineage closure and scope confirmation

**LINEAGE (CONTINUE-HERE.md immediate order #1 — now closed):** the remote history was re-imported.
`git rev-list --all` contains exactly ONE commit (`a893f5b "Add files via upload"`). **None of the 19
commit-shaped hashes cited across `README.md`, `CONTINUE-HERE.md`, `docs/DECISIONS.md` and the phase
reports (`80760ff`, `15da5a5`, `8b85d58`, `af00b3b`, …) exist as objects here — they are UNVERIFIABLE,
recorded rather than silently ignored.** The recorded hashes remain the workspace's own account of its
past; nothing in this report depends on them. Tree integrity, however, is internally consistent: all
6.5 code, harnesses, baselines, screenshots and documents are present in the single commit, and the
fresh static pass (§12) agrees with the recorded one where they overlap.

**Scope confirmation (REPORT BACK item 13):** this report run **created one file** —
`PHASE6_STEP5_REPORT.md` — and **modified one tracker line** (README.md Phase 6 Step 5, to stop it
saying "RUN THIS NEXT" once the report existed — a stale string is a P6-R5 defect; no other tracker
line touched). **Nothing else changed:** no application route, component, library, token, migration,
harness, baseline, screenshot or dependency was created, edited or deleted. The 6.5 code itself was
already built before this environment existed; this report is the owed accounting of it.

**Files created / modified by the 6.5 STEP ITSELF (committed state, as found):**
`src/app/(portal)/tutor/account/page.tsx` (made true per P6-R14) ·
`src/app/dev/tutor-states/{page.tsx,states.ts,frame/page.tsx}` (dev inventory) ·
`src/components/tutor/shape-link.tsx` (P6-R17) · `src/lib/state/settle.ts` (P6-R15's table) ·
`src/lib/environment/settings.ts` (read-failure `source`) · `docs/TUTOR_DISTANCE.md` (new) ·
`docs/STATE_LANGUAGE.md` / `docs/TUTOR_VISIBILITY.md` / `docs/EXCEPTIONS.md` (6.5 addenda) ·
`docs/DECISIONS.md` (DEC-018) · `audit/tutor-states.cjs` + `.json` + `-baseline.json` (harness, run,
pin) · `package.json` (`prebuild` wiring, P6-R18) · baseline re-pins in `audit/tutor-baseline.json`
and `audit/environment-baseline.json` with declared reasons.

---

## VERDICT

**6.5 is BUILT and, with this document, REPORTED** — from recorded evidence for everything that needs
a browser or a database, re-verified fresh for everything that can be checked without one. Its one
open item is not a defect of execution but a **ruling owed to the owner**: the silent concurrent
overwrite (§10), which `docs/TUTOR_DISTANCE.md` row 8 names as required before 6.6 closes.

**The precondition for Step 6.6 (the tutor gate) — "6.5 REPORTED" — is now met on disk**, with two
environment cautions for whoever runs it: this workspace cannot execute the browser/DB harnesses until
Puppeteer+Chrome and Supabase credentials are restored, and `npm run build` is blocked here by the
font-fetch restriction (self-hosting the three fonts is the bounded fix, not taken without a ruling).

**STOPPED here, per the brief.** Step 6.6 is not begun by this report.

---

## POSTSCRIPT (2026-10-06) — the §10 ruling arrived

The owner ruled the §10 design decision the same day: **P6-R21 · REFUSE_STALE_WRITE** — last-write-wins
rejected; a save that does not match the state the surface loaded is refused with one 409 document
carrying the single factual sentence *"The room settings were updated in another session. Reload to
review the current state before applying changes."* Implemented 2026-10-06 (conditional write on the
row's `updated_at` carried as the form's hidden `version` token; absent-token insert path; missing
token refused; revert tokenless by construction; route order keeps value validation ahead of the
freshness check). Recorded under DEC-018 as an addendum; `docs/TUTOR_DISTANCE.md` row 8 marked
resolved; the STATE_LANGUAGE T9 row and this inventory's row 9 updated; `audit/tutor-states.cjs`
`write-concurrent` now ASSERTS the refusal, `audit/levers.cjs` idempotence re-saves from a fresh load,
and the identity-matrix write probes carry the absence token (`version=`) so they test authorization,
not staleness. Static re-verification after the change: `tsc` clean · attacks 7/7 · validate-subjects
108/108 · next-action 34/34 · progress 16/16 · `npm run build` exit 0 (fonts self-hosted per DEC-019).
The browser/DB re-run of the write gates remains owed to the next environment that has Chrome and
credentials — the pins will re-settle there, with the DEC-018 addendum as the declared repin reason.
