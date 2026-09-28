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
