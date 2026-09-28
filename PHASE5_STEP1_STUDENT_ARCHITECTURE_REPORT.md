# Phase 5 · Step 1 — Student architecture, data model, roles, auth boundary
### Executed under ruling P5-R1 (logged as DEC-002 in `docs/DECISIONS.md`)

> **AUTH STATUS: UNVERIFIED.** Tier 3 — no live Supabase instance in this environment. The SDK is installed, the schema, RLS and code paths are written, and every test that does not need a live instance has run (including the RLS boundary test against a real Postgres 17 with an auth shim). Sign-in, sign-out, session persistence and the confirmation flow have **not** been exercised against Supabase Auth. **5.3 stays blocked.** Supplying `.env.local` (Tier 1) and re-running §11 unblocks it without code changes.

Note on the brief: `prompts/phase-5-step-01-student-architecture.md` is **not available** in this workspace (no `prompts/` directory). 5.1 was executed from the ruling plus the 5.3 brief's stated dependencies on 5.1 (data model, real-vs-unbuilt map, momentum principle, next-action priority order, student-shell contract, auth implementation). Where the missing brief would have specified more, this report says what it assumed.

---

## 0. Version control (Part 3) — done first

```
git init -b main
commit 1b5d6a2c049f5a88f8d428bc74a3f0f3df692108  "Pre-Phase-5 baseline: Phases 2-4 certified state (incl. 4.9 gate, D-08 addendum, audit baseline)"
194 files · includes every PHASE*/STEP* report, audit/baseline.json, audit/page.cjs, docs/, src/, scripts/
excluded by .gitignore (pre-existing, verified): node_modules, .next, .env*, *.tsbuildinfo
git status --porcelain after commit → (empty)
```
The existing `.gitignore` already contained `.env*`; one line was appended (`/.arena`, sandbox scratch). Second commit (this step's work) is at the end of this report.

## 1. Gates (Part 2)

| Gate | Result |
|---|---|
| **A — SDK installable** | **PASS.** `npm install @supabase/supabase-js @supabase/ssr` → `@supabase/supabase-js 2.109.0`, `@supabase/ssr 0.12.7`. No other package added. |
| **B — live instance** | **TIER 3.** No `.env.local`, no `SUPABASE_*` in the environment, no Docker, no `supabase` CLI. Network to supabase.com is open (HTTP 200), so **Tier 1 is available the moment the owner supplies credentials**. |

**Workable path I can see that the ruling did not list:** `postgresql-17` installs from apt in this sandbox. I used it to run the migration and the RLS test against a *real database* with a 40-line auth shim (`supabase/local/auth_shim.sql`: roles `anon/authenticated/service_role`, `auth.users`, `auth.uid()` reading `request.jwt.claims` exactly as PostgREST sets it). This verifies the **policy layer**, not Supabase Auth. It is reported as such and does not upgrade the tier.

Env var names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public), `SUPABASE_SERVICE_ROLE_KEY` (server only). `.env.example` committed with empty values; no secret exists anywhere in the tree.

## 2. Architecture

```
Browser ──cookies──► src/proxy.ts (Next 16 network boundary; was middleware.ts)
                       └─ lib/supabase/proxy-session.ts  refresh session · enforce visitor→student boundary
Server Components / Actions / Route Handlers
                       └─ lib/supabase/server.ts   anon-key client bound to request cookies (RLS applies)
                       └─ lib/auth/session.ts      getIdentity() / requireIdentity(role)
                       └─ lib/student/data.ts      getStudentContext() → contract.ts derivations
Client Components      └─ lib/supabase/client.ts   browser client (anon key; RLS applies) — not used yet
Server-only            └─ lib/supabase/service.ts  service-role client; bypasses RLS; 0 importers
Database (Supabase Postgres)
                       └─ supabase/migrations/20260927000001_identity.sql   tables + triggers + RLS
                       └─ supabase/tests/rls_test.sql                       boundary test (20 assertions)
```
Session model: cookie-based via `@supabase/ssr`, refreshed on every matched request in the proxy; `auth.getUser()` (server-validated) is used everywhere, never `getSession()` for trust decisions. No localStorage, no client-only session state, no fake session.

## 3. Data model (`supabase/migrations/20260927000001_identity.sql`)

| Table | Columns | Notes |
|---|---|---|
| `profiles` | `id` (= auth.users.id), `role` enum student/tutor/admin, `display_name` ≤80, `is_test_account` **default true**, timestamps | Created by trigger on `auth.users` insert. `role` from signup metadata; anything but `tutor` collapses to `student`. **Admin is never self-serve.** |
| `enrolments` | `id`, `student_id`, `subject_id` (CHECK ∈ six slugs), `status` active/withdrawn, `enrolled_at`; unique (student, subject) | The CHOICE. Enrolment is a stronger relationship than public availability (draft subjects do not lock an enrolled student out — 5.3 rule, enforced nowhere as a lock). |
| `environment_state` | PK (student, subject) → FK to enrolments; `first_entered_at`, `last_entered_at`, `entry_count ≥ 1`, **`position jsonb NULL`**, `updated_at` | `position` is nullable by design: today there is nothing inside an environment to be *at* (3.6). No code writes it. |

Subject ids are the only duplicated enum (SQL ↔ config); `scripts/check-subject-sql.mjs` asserts equality: `subject ids: SQL == config mathematics,physics,chemistry,biology,english,history`.

**Not created (registry says `planned`):** classes, recordings, assignments, tests, payments, AI, tutor rosters. Phases 6–9 add tables; nothing here needs restructuring for them (`environment_state.position` is the extension point for "where inside").

## 4. Roles

`student` (self-serve), `tutor` (self-serve at signup; **no data policies yet** — Phase 6 adds roster-scoped reads), `admin` (service-role/dashboard grant only). Every Phase-5 account is `is_test_account = true`.

## 5. Permission matrix — implemented as RLS, tested against the database

| Actor | profiles | enrolments | environment_state |
|---|---|---|---|
| anon (visitor) | no privilege | no privilege | no privilege |
| student | select/update **own** (role immutable) | select/insert/update **own**; insert only if role=student | select/insert/update **own**; FK requires own enrolment |
| tutor | own profile only | none (Phase 6) | none (Phase 6) |
| admin (service role) | bypass | bypass | bypass |

`scripts/test-rls.sh --local` (Postgres 17.11 + shim) — **20/20 assertions passed**, verbatim tail:
```
ok — signup trigger created 4 profiles · tutor role honoured from metadata · requested admin collapsed to student
ok — every Phase-5 account is flagged test · A sees exactly her own enrolment · A sees exactly her own profile
ok — position is NULL by default (nothing to be AT yet)
ok — A cannot enrol B (new row violates row-level security policy for table "enrolments")
ok — no seventh subject (violates check constraint "enrolments_subject_id_check")
ok — A cannot change her own role (new row violates row-level security policy for table "profiles")
ok — A can update her own display name
ok — B sees none of A's enrolments · B sees none of A's environment_state · B cannot read A's profile
ok — state requires enrolment (violates foreign key constraint)
ok — tutor sees no enrolments (Phase 6 adds roster policies) · tutor sees no environment_state · tutor cannot enrol
ok — anon has no table privilege on enrolments
ok — B's update touched 0 of A's rows
RLS: all 20 assertions passed
```
The same file runs unchanged against a Supabase project: `DATABASE_URL=… scripts/test-rls.sh`.

**Service-role key references:** `src/lib/supabase/service.ts:15` (the only read), `.env.example:6` (empty). `grep -rl SERVICE_ROLE .next/static` → 0 files. Importers of `service.ts` → 0.

## 6. Visitor → student boundary (implemented, not redefined)

*"An account is required the moment something must be remembered."* Implemented in `proxy-session.ts`: `PROTECTED_PREFIXES = [/student, /tutor, /admin]`; everything else is public. Verified on the prod build:

```
/                      200      /login      200        /student           307 → /login?next=%2Fstudent
/subjects              200      /register   200        /tutor             307 → /login?next=%2Ftutor
/subjects/mathematics  200      /dev/page   404        /admin             307 → /login?next=%2Fadmin
                                                       /student/anything  307 → /login?next=%2Fstudent%2Fanything
GET  /auth/signout     405 (no sign-out by link)       POST /auth/signout 303 → /login
```
With auth unconfigured, `/login` renders *"Authentication is not configured in this deployment"* and the submit button is disabled; **no populated frame, no demo identity**. The login page's former "or go directly to Student / Tutor / Admin" shortcut cluster was removed — with the boundary in place those links would have led back to the login page (a dead affordance).

## 7. Momentum principle, next-action priority, student-shell contract (`src/lib/student/contract.ts`)

**Momentum principle:** the shell answers WHAT NOW with one dominant surface derived from what is *true* in the data. **Priority order** (higher wins; only rungs 4–6 are real today): 1 class now · 2 class within the hour · 3 work due · **4 RESUME** (state C) · **5 BEGIN** (state B) · **6 CHOOSE** (state A). 5.4 inserts rungs 1–3 above resume; it never edits the states.

**Three states, derived, pure, tested in plain Node:**
```
A  []                                   → {kind:"A-no-enrolment"}                    → {rung:6, choose}
B  [physics, mathematics], no state     → {kind:"B", first:"physics"}                → {rung:5, begin physics}
C  physics entered 3× (last 09-26)      → {kind:"C", latest: physics, position:null} → {rung:4, resume physics, lastEnteredAt, position:null}
withdrawn-only                          → A
```
**Resume honesty rule** is stated in code (`resumeFacts`): the resume surface renders only populated fields — environment and when; never a chapter, lesson or progress the row does not hold. `position` is `null` for every row that can exist today.

`getStudentContext()` reads only through the anon-key client, so it *cannot* read another student even if asked. `recordEnvironmentEntry()` exists for 5.5 to call; **nothing calls it yet**, and it never writes `position`.

## 8. Real vs unbuilt map

| Real after 5.1 | Unbuilt (registry `planned`) |
|---|---|
| Schema + RLS for identity, enrolment, environment state | Any UI at `/student` (still the Phase-2 `NotBuiltYet` panel — 5.3) |
| Cookie session plumbing, proxy boundary, sign-in/up/out actions, callback route | Enrolling (no UI writes `enrolments` yet — 5.3/5.5 decision) |
| Test-account-only signup copy | Recording entry into an environment (5.5 wires `recordEnvironmentEntry`) |
| Pure shell contract + derivations | Tutor data policies (Phase 6); classes/recordings/assignments/tests/payments/AI (7–9) |
| RLS test runnable locally and against a project | Password reset (the disabled "Forgot password?" button was removed rather than kept as a dead control) |

## 9. Honesty convention (Part 5)

`src/config/modules` unchanged and remains the single source. Nothing added in 5.1 renders or links to a capability the registry does not declare built. The login/register forms now self-label the true state per deployment (unconfigured vs test-accounts-only) instead of "not wired"; the "I agree to the terms of use and privacy policy" checkbox was replaced by *"I understand this is a test account and may be deleted"* because no such documents exist (Part 7). The disabled "Forgot password?" control was removed.

## 10. Legal line (Part 7)

Stated once: privacy policy, terms, contact route and the DPDP Act 2023 position (incl. children's data) are launch blockers owned by the owner; none is drafted or stubbed here. Signup in Phase 5 is for test accounts only, said on the form and stored on the row (`is_test_account`). No seeded, demo or sample student record exists; the RLS test's four users live inside a transaction that rolls back.

## 11. Auth verification — what ran, what did not

| Check | Status | Evidence |
|---|---|---|
| Protected-route redirect | **verified** (prod build) | §6 table |
| Sign-out route | **verified** (clears cookies, 303) | §6 |
| Unconfigured state honest | **verified** | `/login` body: "Authentication is not configured…", `disabled=""` |
| RLS boundary | **verified against Postgres 17 + shim** | §5, 20/20 |
| Sign-in creates session | **UNVERIFIED** — needs Tier 1/2 | — |
| Sign-up + confirmation callback | **UNVERIFIED** | — |
| Session persistence / refresh | **UNVERIFIED** | — |
| Signup trigger under Supabase Auth | schema-verified with shim; **UNVERIFIED** under real Auth | — |

**To verify (owner):** create `.env.local` from `.env.example`; run `supabase/migrations/20260927000001_identity.sql` in the SQL editor; `DATABASE_URL=… scripts/test-rls.sh`; then sign up a test account at `/register`, follow the email link, confirm `/student` no longer redirects, POST `/auth/signout`, confirm it does. Then 5.3 may resume.

## 12. AUDIT A — dependencies vs certified phases

`package.json`, verbatim (after the two permitted installs):
```json
"dependencies": { "@supabase/ssr": "^0.12.7", "@supabase/supabase-js": "^2.109.0", "clsx": "^2.1.1", "lucide-react": "^1.48.0", "next": "16.3.6", "react": "19.2.8", "react-dom": "19.2.8", "tailwind-merge": "^3.7.0" },
"devDependencies": { "@tailwindcss/postcss": "^4", "@types/node": "^20", "@types/react": "^19", "@types/react-dom": "^19", "eslint": "^9", "eslint-config-next": "16.3.6", "tailwindcss": "^4", "typescript": "^5" }
```
**Motion and R3F are absent — and were never used.** `grep` for imports of `framer-motion`, `motion`, `three`, `@react-three/*` in `src/` → **0**. The certified motion was implemented as:
- **CSS transitions on tokens** (`--ta-dur-*`, `--ta-ease-*` in `globals.css`; 7 `@keyframes`), a closed vocabulary (`.ta-reveal/.is-in`, `.ta-stagger`) — STEP3_MOTION_REPORT;
- **IntersectionObserver one-shot reveals** — `src/components/spine/reveal.tsx`, `difference-stagger.tsx`, `promise-stagger.tsx`, `src/lib/motion.ts`;
- the 3.4 switch as a **state machine**, not tweens.
- 3.6's ambient layer / 4.5's substrate: **raw WebGL, no library** — `src/lib/ambient/webgl-lattice.ts` (lazy 5.1 KB chunk), `src/components/ambient/ambient-stage.tsx`, `contract.ts`, `eligibility.ts`. PHASE3_STEP5 §1 recorded "three.js not installed" as a decision at the time.

**Conclusion:** no certified phase's machinery is missing. The phases were certified on what was built (CSS + IO + raw WebGL), and each report said so. Motion/R3F remain "authorised in principle, not installed" per the ruling. **Nothing backfilled.**

## 13. AUDIT B — what survived the sandbox reset

All present, and all committed in `1b5d6a2`: `audit/baseline.json`, `audit/page.cjs`, `audit/lighthouse-page.json`, four scene audits; `src/lib/spine/{scenes,types}.ts`; `home-spine.tsx`, `scene-slot.tsx`; 13 scene component files; `src/lib/subjects/subjects.ts`; `globals.css` token layer; `motif/budgets.ts`; `switch/ceremony.ts`; `ambient/webgl-lattice.ts`; 20 `/dev/*` routes. **No 4.9 regression.** What does *not* survive a reset is `node_modules` and the audit tooling (puppeteer/lighthouse/axe, Chrome libs) — reinstalled each session; documented in 4.9.

**Harness after this step:** `audit/page.cjs --check` — all eight gates PASS; one diff: `payload.js 594,509 → 576,029` (−18.5 KB, 26 → 25 requests on `/`: the shared chunk that carried the login form's `PORTAL_ENTRIES`/`Divider` imports no longer exists). Re-pinned with `--write`; scroll, words, mobile pin, links, CLS unchanged; re-check → `no diffs vs baseline`. One dev-only axe note: `/dev/page` now reports `landmark-unique:1` (its corrections panel) — dev route, recorded.

## 14. Files

**Created:** `supabase/migrations/20260927000001_identity.sql`, `supabase/tests/rls_test.sql`, `supabase/local/auth_shim.sql`, `scripts/test-rls.sh`, `scripts/check-subject-sql.mjs`, `src/proxy.ts`, `src/lib/supabase/{env,client,server,service,proxy-session}.ts`, `src/lib/auth/session.ts`, `src/lib/student/{contract,data}.ts`, `src/features/auth/actions.ts`, `src/app/auth/callback/route.ts`, `src/app/auth/signout/route.ts`, `.env.example`, `docs/DECISIONS.md`, this report.
**Modified:** `package.json`/`package-lock.json` (two permitted packages), `src/features/auth/login-form.tsx`, `register-form.tsx`, `src/app/(auth)/{login,register}/page.tsx`, `audit/baseline.json` (re-pin, §13), `.gitignore` (+1 line).
**Untouched:** tokens, primitives, nav shell, subject system, spine/scenes, footer, `/subjects` scaffold, `src/config/modules`, `/student` page (still `NotBuiltYet`), every `/dev/*` route.

## 15. Build, lint, commit

`tsc --noEmit` clean · `eslint` 0 errors in `src/` · `next build` exit 0 (`ƒ Proxy (Middleware)` present) · `/dev/page` prod 404.

Second commit and `git status --porcelain` are pasted at the end of the turn message.

## 16. Plain statement

**Auth is UNVERIFIED.** The substrate is real (SDK, schema, RLS proven against a database, cookie plumbing, boundary enforced on the prod build), but no session has ever been created because there is no Supabase instance here. 5.3 remains blocked until §11's unverified rows are exercised on Tier 1 or 2.
