# Phase 5 — P5-R2 Correction Pass — Report

Four items, no redesign, no new scope. All verified on the production build against the real Supabase project with real sign-ins. 5.4 not begun.

## FIX 1 — entry count off the screen (field stays)

`student-shell.tsx primaryCopy()` no longer reads `entryCount` for copy; `contract.ts`/`data.ts` unchanged (5.4 may rank on it). If `lastEnteredAt` were absent the surface says nothing about time (no filler phrase). No replacement metric.

**Exact rendered strings, primary surface, prod build:**
- **A:** `WHAT NOW · Choose a subject · Six environments are open. Choosing one is where this begins. · See the six subjects`
- **B:** `FIRST SESSION · Physics — The Field · ENVIRONMENT IN DRAFT · You chose Physics yesterday. Your first session begins when you open it. · Open Physics`
- **C:** `LAST OPENED YESTERDAY · Physics — The Field · ENVIRONMENT IN DRAFT · You were last here yesterday. · Open Physics`

Subject rows unchanged (`Last opened yesterday` / `Not opened yet`). Nothing counted anywhere. Shell harness re-pinned; sweeps and fabrication list pass.

## FIX 2 — brand link hit area

`nav-shell.tsx`, one style change on the brand `<Link>`: `minHeight/minWidth: var(--ta-target-min)`, `paddingInline: var(--ta-space-2)`, `marginInline: calc(-1 * var(--ta-space-2))` — padding grows the hit box, the negative margin cancels it in layout, so the mark and lockup do not move.

| viewport | link hit box | mark visual | mark position | header height |
|---|---|---|---|---|
| 320 | **44×44** | 28×28 | x24 y20 (unchanged) | 68 (unchanged) |
| 390 | **44×44** | 28×28 | x24 y20 | 68 |
| 1280 | **246×44** (mark + wordmark) | 28×28 | x48 y22 | 72 |

The frame's spacing was not disturbed (no lockup shrink, header height identical). `audit/page.cjs --check` after the change: **8/8 gates PASS, "no diffs vs baseline"** — brand frame, header links and nav composition unchanged. Shell harness: `inheritedSmall` now `[]` for all states; 42/42 gates.

## FIX 3 — authorization behaviours into the baseline, with tests

New `audit/permissions.cjs` (run `--write`) records `authorization` in `audit/baseline.json` as **expected** behaviour (page.cjs does not compare that key, so it documents; permissions.cjs gates it with 9 checks — **9/9 PASS**). What each actor actually sees (prod, first server response + landed surface):

| actor | route | first response (server) | lands on | surface / h1 |
|---|---|---|---|---|
| visitor (no JS) | /tutor | 307 | /login?next=/tutor | login form · "Sign in" |
| visitor | /admin | 307 | /login?next=/admin | login form |
| visitor | /student | 307 | /login?next=/student | login form |
| visitor | /subjects/physics (draft) | **404** | — | themed 404 |
| visitor | /subjects/mathematics | 200 | — | subject environment · "Mathematics" |
| student A (no enrolment) | /tutor | **3xx from server** (fetch, redirect=manual, no JS) | /student | student shell · "Choose a subject" |
| student A | /admin | 3xx from server | /student | student shell |
| student A | /subjects/physics | **404** | — | 404 page · "We couldn't find that page" |
| student A | /subjects/mathematics | 200 | — | subject environment |
| student C (enrolled physics, maths) | /tutor | 3xx from server | /student | student shell · "Physics — The Field" |
| student C | /admin | 3xx from server | /student | student shell |
| student C | /subjects/physics | **200** | — | subject environment · "Physics" · **draft banner present** |
| student C | /subjects/mathematics | 200 | — | subject environment |

No student ever receives the tutor/admin placeholder or an empty shell — they receive their own shell, server-rendered. **Server-side confirmed:** the role check is `await requireIdentity(role)` in `src/app/(portal)/{tutor,admin,student}/layout.tsx` — async server layouts (no `"use client"`), `redirect()` issued before any HTML; the test reads the raw first response with JavaScript disabled/`redirect: "manual"` and sees the 3xx. The draft admission is `getEnrolledSubjectIds()` in the server page, RLS-bounded.

`scripts/test-account.mjs`: reads `SUPABASE_SERVICE_ROLE_KEY` / URL from **`process.env` first**, `.env.local` only as a local fallback; **prints no secret** (only redacted addresses, role, flags); **dev-only guards**: exits 3 if `NODE_ENV=production`, and refuses to create/delete any address not on `*@test.<name>.invalid`. Verified: `NODE_ENV=production … list` → "refusing"; `create someone@gmail.com` → "refusing". The three test accounts, by role: `s***@test.tutorsacademy.invalid` — **student** (A, no enrolment) · `s***@…invalid` — **student** (B, physics + mathematics, never entered) · `s***@…invalid` — **student** (C, physics + mathematics, physics entered). No tutor or admin test account exists.

## MEASURE 4 — the "it fits" claim, closed honestly

**The 5.3 claim is withdrawn.** "844px tall, nothing below the fold in any state" was true only at 390×844. Measured (prod, real accounts; C temporarily enrolled in four subjects — physics, mathematics, chemistry, biology — then restored to two):

| state | viewport | doc height | fits w/o scroll | primary action bottom | above fold | rows | last row bottom |
|---|---|---|---|---|---|---|---|
| A | 320×568 | 568 | yes | 376 | yes | 0 | — |
| A | 360×640 | 640 | yes | 353 | yes | 0 | — |
| A | 200 % zoom (640×400) | 400 | yes | 303 | yes | 0 | — |
| A | text spacing 390×844 | 844 | yes | 431 | yes | 0 | — |
| B | 320×568 | **762** | **no** | 433 | **yes** | 2 | 698 |
| B | 360×640 | **744** | **no** | 436 | yes | 2 | 680 |
| B | 200 % zoom | **654** | no | 361 | yes | 2 | 590 |
| B | text spacing 390×844 | 844 | yes | 493 | yes | 2 | 732 |
| C ×4 subjects | 320×568 | **912** | no | 384 | yes | 4 | 848 |
| C ×4 | 360×640 | **872** | no | 386 | yes | 4 | 808 |
| C ×4 | 390×844 | 844 | yes | 388 | yes | 4 | 768 |
| C ×4 | 1280×800 | **844** | no (by 44px) | 383 | yes | 4 | 780 |
| C ×4 | 200 % zoom | **810** | no | 361 | yes | 4 | 746 |
| C ×4 | text spacing 390×844 | **959** | no | 445 | yes | 4 | 895 |

**Corrected claim:** the primary answer (heading + action) is above the fold at every measured viewport, zoom and spacing, including four subjects; the subject rows scroll below it on small phones and at 200 % — which is the intended subordination, not a defect. **Compression check:** a DOM sweep of `main` for fixed/max heights, `vh`/`svh` heights and clipped overflow returned **empty** in every case — the page grows; nothing is clamped or clipped. No horizontal scroll anywhere.

## Recorded, one line each

- **LCP 2.9 s on the mid-range profile (Phase 10 item).** Round trips before HTML for a signed-in student: `navigation.redirectCount = 0`, redirect time 0 ms, TTFB ≈ 415–436 ms (that is the proxy's `auth.getUser()` round trip to Supabase Auth per request, plus the two RLS reads) — no middleware bounce; the fixable item later is that per-request auth validation, not a redirect.
- **Node ≥ 22** recorded in `package.json#engines` (`"node": ">=22"`) and `.nvmrc`.
- **State A does not close the loop** — `/subjects` cannot enrol; accepted declared exception, 5.5 owns the entry write. No enrol button, no "coming soon" note was added.

## Verification summary
`tsc` clean · `next build` exit 0 · shell harness 42/42 (re-pinned) · page harness 8/8, no diffs · permissions 9/9 · `git status --porcelain` empty after commit (hash in turn message).

**STOP.**
