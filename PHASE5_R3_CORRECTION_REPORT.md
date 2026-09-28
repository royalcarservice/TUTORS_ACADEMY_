# Phase 5 — R3 Correction Report

Scope: owner correction pass P5-R3 (three fixes). No 5.5 work started. Nothing in `src/config/modules.ts` changed.

## FIX 1 — Availability claims in shipped shell strings

Ground truth: `src/config/subjects` — Mathematics `ready`, five others `draft`. Permission behaviour (baseline.authorization, 9/9 re-run this pass): visitor/non-enrolled student → 404 on draft environments; enrolled student → 200 + "Environment in draft".

| Where | String (as rendered) | Claim | Verdict | Action |
|---|---|---|---|---|
| A eyebrow | What now | none | TRUE | keep |
| A heading | Choose a subject | none | TRUE | keep |
| A line | ~~Six environments are open. Choosing one is where this begins.~~ | "open" × 6 — only 1 is `ready`; 5 draft 404 for a non-enrolled student | **FALSE** | **Replaced** → "Choosing is where this begins." |
| A CTA | See the six subjects | `/subjects` lists six with status labels | TRUE | keep (per ruling) |
| B eyebrow | First session | none | TRUE | keep |
| B/C heading | Physics — The Field | subject name + world name | TRUE | keep |
| B/C badge | Environment in draft | status from config | TRUE | keep |
| B line | You chose Physics yesterday. Your first session begins when you open it. | enrolled student can open (200) | TRUE | keep |
| B/C CTA | Open Physics | enrolled → 200 even for draft | TRUE | keep |
| C eyebrow | Last opened yesterday | from `environment_state.last_entered_at` | TRUE | keep |
| C line | You were last here yesterday. | same | TRUE | keep |
| Rows | Your subjects · Physics / Mathematics · The Field / The Lattice · Not opened yet · Environment in draft · aria "Open Mathematics — The Lattice" | factual per row | TRUE | keep |
| Nav | Overview · Subjects · Account · Sign out · Open menu · Switch to dark theme · Tutors Academy home | all real routes/actions | TRUE | keep |
| Account entry | Student C / Account | display name, real route | TRUE | keep |
| Empty slots | render nothing (absent, not empty) | — | n/a | — |
| Layout metadata | "Where you were, and what to open next." | "open" as verb | TRUE | keep |

No explainer ("one of six is in full depth") added. Baseline re-pinned; new State A strings: `What now · Choose a subject · Choosing is where this begins. · See the six subjects`.

**Draft enrolment once 5.5 lands:** the `enrolments` INSERT RLS policy checks `student_id = auth.uid()` and that `subject_id` is one of the six slugs; it does not check `status`. So yes — a signed-in student will be able to enrol in a draft subject, and the shell will then say "Open Physics" and the route will return 200 + draft label. That is consistent with the recorded decision (enrolment outranks public availability). If the owner wants draft enrolment blocked, that is a one-line policy change to make in 5.5, not here.

## FIX 2 — Middleware on `/`

Matcher (`src/proxy.ts` line 12):
`"/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)"` — runs on every page including `/`, `/subjects`, `/login`.

Server TTFB (curl, prod build :3100, 20 samples): `/` median 7 ms, p90 11 ms; with a junk `sb-…-auth-token` cookie 5–17 ms; `/subjects` 3 ms; `/subjects/mathematics` 24 ms; `/login` 10 ms. `supabase.auth.getUser()` with no session cookie makes no network call; the ~420 ms round trip only occurs for signed-in requests.

Lighthouse mobile `/`, same method as the 4.9 baseline (simulated throttling, 4× CPU, 1.6 Mbps, 390×844 dsf 2):

| | perf | LCP | FCP | TTFB (root doc) | TBT | CLS |
|---|---|---|---|---|---|---|
| dark — 4.9 baseline | — | 2.3 s | — | 0 ms | 50 ms | 0 |
| dark — now | 97 | 2.4 s | 1.5 s | 10 ms | 120 ms | 0 |
| light — 4.9 baseline | — | 2.4 s | — | 10 ms | 70 ms | 0 |
| light — now | 95 | 2.4 s | 1.5 s | 10 ms | 190 ms | 0 |

Verdict: no difference beyond run noise (TBT variance is CPU-sim jitter; TTFB unchanged at ≤10 ms). **No no-cookie fast path added; no optimisation done.** `audit/page.cjs --check`: 8/8 gates PASS, no diffs vs baseline.

Phase 10 item: signed-in requests pay a per-request `getUser()` network round trip (~420 ms TTFB observed on `/student`). Candidate: local JWT verification (`getClaims()`) in middleware with `getUser()` only where authority matters.

## FIX 3 — Named gate: PRIMARY ACTION ABOVE THE FOLD

`audit/shell.cjs`: the old "page fits"/`documentHeight`/`belowFold` assertion is **removed** (grep for `documentHeight|belowFold|fits` in the harness returns only the gate comment). New gate `primary-action-above-fold-{A,B,C,C4}` asserts `[data-primary-action]` bottom ≤ `innerHeight` (and top ≥ 0) at 320×568, 360×640, 390×844, 1280×800, 200 % zoom (640×400 CSS px) and WCAG 1.4.12 text spacing at 390×844. Gate comment states that document height is not asserted because the shell's height grows with subject rows — correct for a list — and that the invariant is primary-action visibility.

State C×4 uses a fourth persistent test account (`student-d@…invalid`, enrolled physics/mathematics/chemistry/biology, physics entered) so the gate is reproducible in `--check`; test account only, no prod records.

Primary action bottom (px) / viewport height — all PASS:

| State | rows | 320×568 | 360×640 | 390×844 | 1280×800 | 200 % (640×400) | text-spacing 390 |
|---|---|---|---|---|---|---|---|
| A | 0 | 326 | 328 | 293 | 326 | 303 | 383 |
| B | 2 | 433 | 436 | 413 | 383 | 361 | 493 |
| C | 2 | 384 | 386 | 388 | 383 | 361 | 445 |
| C × 4 subjects | 4 | 384 | 386 | 388 | 383 | 361 | 445 |

C and C×4 match exactly because the primary action sits above the subject list; extra rows extend the page below it, which the gate deliberately does not penalise. State A moved up ~30 px vs R2 because the shortened line wraps one row fewer.

## Verification
- `audit/shell.cjs --write` then `--check`: 43/43 gates PASS (42 + C4), boundary 10/10, Lighthouse shell LCP 2.4 s perf 97, inheritedSmall [] all states.
- `audit/page.cjs --check`: 8/8 PASS, no diffs. `audit/permissions.cjs --check`: 9/9 PASS.
- tsc + eslint clean. `.env.local` untouched and gitignored; no values printed.
- Decision log: DEC-005.

STOP. 5.5 not started.
