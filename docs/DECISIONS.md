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
