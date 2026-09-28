# Phase 5 · Step 5 — Environment workspace · report

Build: 2026-09-28 · branch `main` · previous accepted commit `dae8e73` (5.4). Reference viewport 390×844; every claim reproduced at a second viewport (1280×800) unless stated.
Rulings honoured: P5-R4 + Addenda 1–4, P5-R5. **Stopped before 5.6.**

---

## 1. Files

| Path | Role |
|---|---|
| `src/lib/subjects/door.ts` | **NEW.** `isOpen` — 4.4's door predicate, hoisted verbatim from the Choice scene so server code can READ it. `enter.tsx` re-exports it unchanged. |
| `src/lib/student/enrol.ts` | **NEW.** `mayEnrol(identity, subjectId)` — THE ONE predicate (student role ∧ `isOpen(subject)`); `entryAction(id)`. |
| `src/app/subjects/[subject]/enter/route.ts` | **NEW.** `POST` only — the entry write; 303 with a relative `Location`. |
| `src/components/student/threshold.tsx` | **NEW.** The "Begin {Subject}" form (button primitive, `data-threshold`). |
| `src/components/student/environment-regions.tsx` | **NEW.** Second scope of the slot map: `resolveEnvironmentSlots` (registry gate → resolver → element) + `EnvironmentRegions` (renders nothing when empty). Resolver table EMPTY. |
| `src/config/student-slots.ts` | Scope ENVIRONMENT added to the same registry: `ENVIRONMENT_REGIONS` (threshold · sessions · work · library · assistance) and `ENVIRONMENT_SLOTS` (8 mirrored capabilities). No second registry. |
| `src/app/subjects/[subject]/page.tsx` | Identity read once; decides threshold / regions server-side; still writes nothing. |
| `src/components/shell/subject-shell.tsx` | Two optional slots `threshold` (in the identity header) and `regions` (Room, after 3.6's honest labels). Absent → not rendered. |
| `src/app/subjects/layout.tsx` | Signed-in student gets the existing nav item "Overview" → `/student` (Part 6). Visitor chrome unchanged. |
| `src/components/student/student-shell.tsx`, `src/app/(portal)/student/page.tsx` | Enrolled primary action is now a form POST to `/subjects/[id]/enter` (State A stays a link to `/subjects`). |
| `src/lib/student/data.ts` | `recordEnvironmentEntry` now actually called (by the route only); comment corrected. |
| `src/config/modules.ts` | `student-portal` `planned` → `in-progress` (Addendum 2, § 12). |
| `src/config/shell-regions.ts` | Room note for work/progress follows the registry (declared visitor-DOM change, § 12). |
| `src/app/dev/environment-workspace/{page,frame}/` | **NEW.** Part 7 specimen (404 in prod, verified). |
| `audit/environment.cjs` → `audit/environment-baseline.json`, `audit/environment-shots/` | **NEW** harness: 7 identity×subject states, write journey, 15 gates, DB counts. |
| `audit/shell.cjs` | New gates `action-resolves-{A,B,C}` and `action-post-303-then-200 (C4)`; `notedVariance` (Addendum 3). Baseline re-pinned. |
| `docs/DECISIONS.md` DEC-007 | Rulings + tradeoffs logged. |

Not changed: schema/migrations (none needed — `enrolments` UNIQUE (student_id, subject_id) and `environment_state` PK already exist), RLS policies, tokens, components, dependencies.

## 2. INSPECT findings (before building)

1. 4.4 door logic lived as `isOpen` inside `enter.tsx` (a scene) and as an inline duplicate in `choice.tsx`. Hoisted `isOpen` to `src/lib/subjects/door.ts`; `enter.tsx` re-exports. **`choice.tsx` duplicate left as found** (touching a certified scene for a non-defect is outside the brief) — reported: `scripts/check-subject-imports.mjs` still passes; a future sweep should make Choice read `door.ts`.
2. The route's draft guard is `NODE_ENV === "production"`-dependent; door logic is environment-independent. In dev a draft subject renders for a visitor; the enrolment predicate never differs. Reported, unchanged.
3. 3.6's chrome offered no way back to `/student` (Part 6, § 9).
4. NavShell in stage mode shows "Create account / Sign in" to a signed-in student (pre-existing since 3.6; the portal layout passes `account`, the subjects layout does not). Not fixed here — changing it alters the visitor-adjacent chrome; logged for the next chrome pass.
5. `REGION_SLOTS` for the environment were empty; nothing anywhere supplies a `position`. So `position` stays NULL by design (§ 6).
6. `recordEnvironmentEntry` existed unused; its comment claimed it was not called. Now called from exactly one place.

## 3. The ONE predicate (verbatim)

```ts
export function mayEnrol(identity: { role: string } | null | undefined, subjectId: string): boolean {
  if (!identity || identity.role !== "student") return false;
  const s = getSubject(subjectId);
  return !!s && isOpen(s);          // isOpen = 4.4's door, READ not re-derived
}
```
Callers: `page.tsx` (threshold visibility) and `enter/route.ts` (write authority). Grep: no other file decides enterability. Control and write cannot disagree because they call the same function on the same config; the harness confirms it empirically (threshold absent on draft ↔ POST on draft → 404, no row).

## 4. Entry write — behaviour table

| Request | Session | Enrolled? | Enterable? | Result | Rows |
|---|---|---|---|---|---|
| GET `/subjects/mathematics` | any | any | — | 200 (or 404) | **unchanged** |
| RSC prefetch (`RSC:1`, `Next-Router-Prefetch:1`) | student | no | yes | 200 | unchanged |
| GET `/subjects/mathematics/enter` | any | — | — | **405** | unchanged |
| POST | none | — | — | 303 `/login?next=%2Fsubjects%2Fmathematics` (relative) | unchanged |
| POST | student | no | yes | enrolment upsert + state insert → 303 → 200 | 1/1 |
| POST (second) | student | yes | — | state update (`last_entered_at`) → 303 → 200 | still 1/1 |
| POST `/subjects/physics/enter` (draft) | student | no | no | **404** | unchanged |
| POST | tutor/admin | — | — | 403 (code path; not exercised live — no non-student test account POSTs) | — |
| POST unknown slug | any | — | — | 404 | — |

Client: request-scoped anon client with the student's cookie session — never the service role; `enrolments_insert_own` is exercised on every first entry. Idempotency = DB uniqueness + `ignoreDuplicates`, not application state.

## 5. Recorded journey (write account `student-e`, reset to zero enrolments first; harness-reproducible)

```
rowsStart          enrolments=0 env_state=0
after GET env      enrolments=0 env_state=0
after prefetch     enrolments=0 env_state=0   (rscPrefetch 200, GET /enter 405)
POST /subjects/mathematics/enter → 303 ; GET /subjects/mathematics → 200
row                mathematics | active | enrolled 16:41:07.630 | last_entered 16:41:07.833 | position NULL
second submit      200 after redirect, enrolments=1 env_state=1 (entry_count 2 — data only)
draft POST         404, rows unchanged
shell              A-no-enrolment → C-enrolled-active, primary = BUTTON "Open Mathematics"
signed-out POST    303 → /login?next=…, rows unchanged
```
Screenshots: `audit/environment-shots/write-1-shell-A.png … write-4-shell-C.png` (390×844).

## 6. `environment_state` initialisation
`first_entered_at = last_entered_at = now`, `entry_count = 1`, `position = NULL` — nothing supplies a position; the column is written by no code path (grep: only selected). Malformed vs missing: a NULL `position` is MISSING (a state, handled as "no place to resume"); a present-but-unparseable timestamp would be MALFORMED (5.4 resolver rejects it, named in code). No surface renders `entry_count` (grep § 13).

## 7. Region contract (two-level map)

| Capability | Shell scope (5.3) | Environment scope (5.5) | Gate module · status | Renders today |
|---|---|---|---|---|
| This subject's sessions | today · 1 | sessions (order 1) | live-classroom · planned | nothing |
| Next class here | today · 2 | sessions | live-classroom · planned | nothing |
| Your tutor here | people · 1 | sessions | tutor-portal · planned | nothing |
| Work due here | work · 1 | work (2) | assignments · planned | nothing |
| Progress here | work · 2 | work | student-portal · in-progress | nothing (needs 5.6 language + observations) |
| Recordings here | library · 1 | library (3) | recorded-classes · planned | nothing |
| Resources here | library · 2 | library | recorded-classes · planned | nothing |
| Assistance here | assistance · 1 | assistance (4) | ai-assistant · planned | nothing |

Rule: slot renders only if module `live` AND resolver returns an element. Empty region → no heading, no box. Enrolled HTML today contains no `[data-student-region]` (gate). Fill point: `ENVIRONMENT_SLOT_RESOLVERS`.

## 8. P5-R5 — one environment, readings at 390
Visitor and enrolled student see the same composition; the visitor DOM is byte-pinned (`47456ef7283919cd`, scripts stripped). The non-enrolled student's single addition is the threshold beneath the tagline — bottom 362 px @390 (386 @320×568, 370 @200 % zoom, 388 @1.4.12 spacing), one primary in `main`. Both readings survive at 390; no fallback needed.

## 9. Part 6 — way back to `/student`
3.6 chrome offered none. Now the subjects layout passes `[Overview, Subjects]` to NavShell for a signed-in student (server-decided; visitor gets `[Subjects]` exactly as before). NavShell shows items inline ≥1024 px and inside the menu sheet below that, so at 390 "Overview" is one tap behind the existing trigger. Minimum affordance, no new element; the recorded journey returns via the sheet (`write-4-shell-C.png`).

## 10. Shell primary action: POST vs link
Enrolled states B/C now submit a form (same visual composition, `.ta-btn`). Tradeoff recorded: middle-click / "open in new tab" is not available on a submit button; a student who wants to look without entering can use the "Your subjects" rows (links, unchanged). Harness gate `action-resolves-{state}`: A → link 200; B/C → form POST to `/subjects/[id]/enter`, GET on that endpoint 405, destination 200. `action-post-303-then-200 (C4)` performs the live POST on `student-d` only.

## 11. Client JS on the environment route
No new file carries `"use client"`. Script chunk set referenced by `/subjects/mathematics` HTML is identical before/after (11 script tags, same chunk names, `git stash` comparison). Runtime: 14 script responses for visitor, non-enrolled and enrolled alike (uncompressed bytes 68–88 KB, varying only with prefetch timing, not identity). The form is plain HTML (no-JS gate passes).

## 12. Addendum 2 — registry vs disk vs prod

| Entry | Registry status | On disk / in prod (evidence) | Verdict |
|---|---|---|---|
| public-website | live | `(public)/*`, `/subjects/*` served, homepage baseline | correct |
| student-portal | **in-progress** (was planned) | `(portal)/student` shell + account, next-action engine, enrolment write, environment threshold — LIVE; schedule/work/progress absent | corrected; schema has no "partial" — `in-progress` chosen and said so in the entry comment |
| tutor-portal | planned | `(portal)/tutor/page.tsx` placeholder only | correct |
| admin-portal | planned | `(portal)/admin/page.tsx` placeholder only | correct |
| live-classroom · recorded-classes · assignments · tests · payments · ai-assistant | planned | no routes, no tables | correct |

Consequences of the flip (all declared, baselines re-pinned): homepage Practice/Promise beats → "In foundation" (words 722→716); Room note for work/progress now reads "in progress in the module registry — the student shell exists; assignments, tests and progress do not yet" (the only visible change to the visitor environment; verified by line diff). **Enrolment provider gate** re-examined: real dependency is the environment route, owned by `public-website` (live). Gating on `student-portal` would silence the provider (`isLive` requires `live`) → worse honest behaviour; kept. Proposal for P7: per-capability status on registry entries so "the shell exists, the progress does not" is expressible.

## 13. Sweeps
- `entry_count`/`entryCount` grep: data layer, contract, fixtures, comments only — no JSX renders it.
- No "welcome back", streak, visit count, analytics call anywhere in new code.
- `scripts/check-subject-imports.mjs` ✓; `tsc` ✓; `eslint src` ✓.
- RLS: Tier 3 `--local` 20/20. Against the live project the test's `count(profiles) = 4` assumption fails (five test accounts) — test-design finding, policies unchanged, noted in DEC-007.

## 14. Harness results
- `audit/environment.cjs --check`: **15/15**; visitor DOM hashes pinned; RSC hash informational.
- `audit/shell.cjs --check`: **57 PASS**, no diffs (State C strings had drifted because earlier test POSTs stamped `student-c` "today" — fixture reset to `now()-1 day`; clock-relative fragility logged for Phase 10).
- `audit/page.cjs --check`: only the declared word-count change; re-pinned.
- `audit/permissions.cjs`: all pass (non-enrolled draft 404, enrolled draft 200 + label).
- Addendum 3: LCP re-measured with a discarded warm-up — cold 2.1–2.5 s ×2 / 3.2–3.4 s ×7 (still bimodal); repeat-visit 0.9–1.1 s ×9. TTFB median 460 ms. Recorded as `notedVariance`, Phase 10 item, no optimisation.

## 15. 28 tests

| # | Test | Result |
|---|---|---|
| 1 | Visitor ready env DOM byte-identical to pinned baseline | pass (`47456ef7283919cd`, one declared line) |
| 2 | Visitor draft env 404 | pass |
| 3 | Non-enrolled student ready → threshold present, form POST, one primary | pass |
| 4 | Non-enrolled student draft → 404, no threshold | pass |
| 5 | Enrolled student ready → no threshold, no regions, 200 | pass |
| 6 | Enrolled student draft (no state) → 200 + draft label | pass |
| 7 | Enrolled student draft (entered) → 200 | pass |
| 8 | Visitor HTML contains no `data-threshold`/`data-student-region` | pass |
| 9 | GET env writes nothing (all 7 states, counts before/after) | pass |
| 10 | RSC prefetch writes nothing | pass |
| 11 | GET `/enter` → 405 | pass |
| 12 | POST no session → 303 relative `/login?next` | pass |
| 13 | POST creates enrolment via student session (INSERT policy) | pass |
| 14 | POST initialises environment_state, position NULL | pass |
| 15 | POST → 303 → 200 into the environment | pass |
| 16 | Second POST idempotent (1 row, no error) | pass |
| 17 | POST draft as non-enrolled → 404, no row | pass |
| 18 | Predicate agreement: threshold visibility ↔ write authority | pass (3/4/17) |
| 19 | Shell A → C after the journey | pass |
| 20 | Shell B/C primary is form POST; A is link | pass (`action-resolves-*`) |
| 21 | Live shell POST 303→200 (student-d) | pass |
| 22 | Threshold above fold at 6 conditions | pass |
| 23 | One h1 every 200 state | pass |
| 24 | No-JS: primary is form/link in plain HTML | pass |
| 25 | Way back to `/student` for student; absent for visitor | pass |
| 26 | `/dev/environment-workspace` 200 in dev, 404 in prod | pass |
| 27 | No new client JS; chunk set identical | pass |
| 28 | Signed-out POST after journey refused, rows unchanged | pass |

Known limitations restated: enterability is not DB-enforced (P5-R4); tutor/admin 403 path not exercised live; nav back on mobile is inside the sheet; stage chrome still shows "Create account/Sign in" to signed-in students (pre-existing). **Stopped before 5.6.**
