# PHASE 5 · STEP 7 — THE STUDENT STATES · REPORT

Date 2026-09-29 · ruling P5-R8 ("an error is a claim") · deps 5.3–5.6, P5-R2–R8 · brief supplied in chat (no `prompts/` directory).
Decision log: `docs/DECISIONS.md` DEC-010. Central deliverable: `docs/STATE_LANGUAGE.md`. Harness: `audit/states.cjs` (38 gates, baseline `audit/states-baseline.json`, shots `audit/states-shots/`).

---

## PART 0 — close-outs

1. **`docs/proposed/progress_record.sql`** confirmed present, unchanged since `3185c1e`. Header: `PROPOSED — NOT APPLIED. docs/proposed/ is NOT supabase/migrations/… THE LOCATION IS THE CONTROL.` Contents: ruled shape · referent question stated and unchosen (a/b/c) · RLS placeholder (owner SELECT only) · analytics-forbidding table comment · "CREATING progress_record IS PHASE 7'S FIRST TASK".
2. **Composition rule** written into the region contract, `src/config/student-slots.ts` → `ENVIRONMENT_REGIONS.record`: the environment's `record` region and the shell's `progress` slot are distinct objects with distinct headings ("Your record" / "Progress"); the arc never merges with a progress figure; a measured progress language (P9) renders as prose in the shell's slot; the arc keeps 4.7's vocabulary and is never re-scaled or summarised into a number.
3. **Fixture-date drift fixed** in `audit/shell.cjs`: `stampFixtures()` runs before the gates and re-stamps student-b (physics = now−1d, mathematics = now−5min) and student-c (physics enrolled now−10d, first entered now−9d, last entered now−1d) — idempotent, relative to `now()`, prints `fixtures re-stamped relative to now(): mathematics:00d00h,physics:01d00h | C.physics last_entered 01d00h`. **Proof:** run 1 → 57 PASS; hand-aged the fixtures (physics enrolled −40 days, last entered −33 days) → run 2 `--check` → 57 PASS, all B/C strings identical ("You chose Physics yesterday", "Last opened yesterday").

## INSPECT (reported before building)

- **Files:** only `src/app/not-found.tsx` existed (Phase-1: "404" numeral, two CTAs, "Available portals" list — a second homepage). No `error.tsx`, `global-error.tsx`, `loading.tsx` anywhere. **Loading states in the codebase: none** (all route pages are server components; client components are the nav shell, theme, motif, spine scenes, subject entry/switch, the two 5.1 auth forms, dev previews).
- **Four form paths:** sign-in/create-account (`useActionState`, 5.1 client JS) — in flight: button disabled, label "Signing in…"/"Creating…" (claims nothing); failure: the raw Supabase `error.message` in an info `Alert` titled "Could not sign in" (a verdict title; any driver message could leak). Begin (threshold POST) and Open (shell POST): plain forms; failure = `text/plain` 500 carrying `error.message`. Sign-out: 303 with an absolute Location built from `request.url` (the 5.5 cookie-loss bug, unfixed here).
- **Auth boundary:** proxy 307 → `/login?next=<path>` on any protected GET without a user; `requireIdentity` the same plus role redirects; POST `/enter` without a session → 303 `/login?next=/subjects/<id>`. `next` survives via the hidden input → `safeNext` (must start with `/`, not `//`). Nothing told the student why they were at `/login`.
- **5.4 isolation:** `collectCandidates` try/catch per provider → `failed[]`; `nextActionFor` → benign action. No logging anywhere in `src/lib`/`src/app`.
- **5.5 region gating:** `resolveSlots` awaited `slot.load(ctx)` with no isolation — a throwing slot took the page down; `resolveEnvironmentSlots` likewise; `getEnvironmentFacts` was awaited in the page body (a failed facts read = page failure for a supplemental region).
- **Honesty defects (in scope — "failure handling required"):** `data.ts` ignored every Supabase `error` (`data ?? []`) → a DB failure rendered state A "no enrolments", offered Begin to an enrolled student, or 404'd a student's own draft environment; `student/page.tsx` `return null` on a missing context (a shell with a hole).
- **404 tension** (reported, not redesigned): `/subjects` lists a draft as plain text "in foundation"; `/subjects/<draft>` is a 404 for anyone not enrolled. Two honest answers to one question. Recorded in `STATE_LANGUAGE.md`.
- **Already banned/absent:** no toasts/modals/banners in the product; the `Button` primitive has a `loading` spinner (Phase 2) — used nowhere on a student route; `ui/progress.tsx` unused (DEC-009 rule).
- **Harnesses at start:** environment 21/21 (visitor hash `47456ef7283919cd`), shell 57, page 8 gates, permissions 9, test-progress 16, test-next-action 34.

## BUILD

| Part | What | Where |
| --- | --- | --- |
| 1 | Inventory (23 rows), copy candidates + choices, refusals, subject rule, 404 tension | `docs/STATE_LANGUAGE.md`; chosen sentences in `src/components/state/copy.ts` |
| 2 | `HonestPage` (one h1 · one sentence · one action = GET) + `StateFrame` (brand mark, ≥44×44 link) · `app/error.tsx` (root, dumb, ignores `error`, no `reset`) · `app/subjects/error.tsx` · `app/(portal)/student/error.tsx` · `app/not-found.tsx` rewritten · `app/global-error.tsx` (system font, plain) | `src/components/state/*`, `src/app/**` |
| 3 | Sign-in/up: driver message never shown (`signInSentence`/`signUpSentence`; wrong password stays vague by decision); result line is a plain `<p role=alert>` beside the control with `aria-describedby` (the 5.1 info panel around it removed — verdict title, 4.21:1 body). Begin: known failure → 303 `?entry=failed` → sentence beside Begin only while still not enrolled; failed-after-commit → 303 → true state, no message. Sign-out: relative Location. **No client JS added to any form; in-flight labels kept as found.** | `src/features/auth/*`, `src/app/subjects/[subject]/{page,enter/route}.tsx`, `src/components/student/threshold.tsx`, `src/app/auth/signout/route.ts` |
| 4 | `isolate` / `isolateAsync` — the one pattern, named once; used by 5.4 `collectCandidates` (behaviour identical, 34/34), `resolveSlots`, `resolveEnvironmentSlots`, and the arc's facts read in the page. Primary-answer exception: `DataReadError` thrown by the three reads → benign action is not available when the read itself failed → honest page. | `src/lib/state/isolate.ts`, `src/lib/student/data.ts` |
| 5 | `logFailure` — one function, stdout JSON, class/scope/what/ids, content-like keys dropped | `src/lib/state/log.ts` |
| 6 | Proxy appends `reason=ended` only when auth cookies were present and invalid; login page: "That session ended. Signing in again goes back to {Mathematics · your subjects · your account}." / no cookies: "Signing in opens {where}." | `src/lib/supabase/proxy-session.ts`, `src/app/(auth)/login/page.tsx`, `login-form.tsx` (`data-login-context`) |
| 7 | `/dev/student-states` (table read from the document; 12 specimens at 390 with the claim printed beneath; real vs simulation stated) · `/frame?state=…` · `/throw` (real root boundary). All 404 in production. | `src/app/dev/student-states/*` |

## TESTS (30)

| # | Test | Result |
| --- | --- | --- |
| 1 | Close-outs | DDL confirmed · composition rule in contract · fixture stamping proven twice (incl. hand-aged) — see Part 0 |
| 2 | Inventory completeness | 23 rows rendered from the document on `/dev/student-states`; 12 specimens, 12 claims (`T2` gate) |
| 3 | **Unknown outcome — network cut mid-POST** | (a) request aborted at the network layer: browser shows `chrome-error://` ("ERR_CONNECTION_FAILED"), **nothing of ours in the document**, rows 0/0, GET `/subjects/mathematics` → 200 with the threshold, no sentence. (b) 6 fetches aborted 0–15 ms after dispatch: all `AbortError`, no row landed, GET shows exactly the true state (threshold ⇔ no row). Nothing claimed failure or success; the recovery surface is the environment GET. |
| 4 | Failed after commit | INSERT/UPDATE revoked on `environment_state` → Begin → 303 `/subjects/mathematics`, rows **1/0**, no threshold, no message, arc `enter:ahead`. Log: `{"scope":"route:/subjects/[subject]/enter","errorClass":"EntryWriteFailed","what":"entry stamp failed after enrolment commit","ids":{"subject":"mathematics","identity":"d83e…"}}` |
| 5 | Double submit row count | two concurrent POSTs → `1/1` |
| 6 | No write on retry | third POST → still `1/1` (`entry_count` 2, bookkeeping never rendered) |
| 7 | Region failure DOM + log | arc resolver throws through the real `resolveEnvironmentSlots`: broken region container has **0 children, empty text**, healthy twin renders "Your record". Line: `{"level":"error","at":"2026-09-29T17:31:48.662Z","scope":"region:progress","errorClass":"TypeError","what":"isolated failure — rendered nothing","ids":{"subject":"mathematics"}}` |
| 8 | Primary cannot be silent (both forced) | Provider throw: 5.4 tests (34/34, benign action). Read failure on the **production build** (SELECT on `enrolments` revoked): `/student` → 500, one h1 "Your subjects could not be read just now.", one action → `/student`; `/subjects/mathematics` → 500, "This environment could not be opened just now.", action → same path. Never state A, never the threshold, never a 404. |
| 9 | grep spinner/skeleton/shimmer/setTimeout | 5.7 files: 0. `src` outside `/dev` and motion: `setTimeout` 0; "spinner" only in the frozen `Button`/`Input` primitives (unused on student routes) and comments; no `loading.tsx` |
| 10 | `progress.tsx` importers | none (only its own header comment) |
| 11 | Offline negative evidence | `/student`, `/subjects/mathematics`, `/subjects` offline → `net::ERR_INTERNET_DISCONNECTED`, browser's own page, no document of ours |
| 12 | No service worker | repo grep: 0 (only `ta-theme` localStorage in `theme.tsx`, pre-existing); browser after full journey: `serviceWorker.getRegistrations()` 0, `caches.keys()` [] |
| 13 | Nothing at rest after a full journey (sign-in → subjects → Begin → overview → account) | localStorage [] · sessionStorage [] · IndexedDB [] · CacheStorage [] · cookies: `sb-<ref>-auth-token` only (SameSite=Lax, 2849 B; `httpOnly:false`/`secure:false` = @supabase/ssr defaults on http localhost — 5.1's, noted) |
| 14 | Subject-rule sweep | every state's main text checked against `you/your + verb` in a failure: 0 hits across 65 views |
| 15 | Banned language grep | src (non-dev, non-comment): 0 of oops/uh-oh/whoops/sorry/oopsie/"something went wrong"/"try again later"/contact/support/please ("supporting", "data-arrival-support" are Phase-4 words, not addresses) |
| 16 | Forced 500 no internals | HTML + RSC payload of both production 500s: no table name, no `PostgrestError`, no SQL, no stack, no `.tsx`, no message (`read failed: enrolments` appears in the **server log only**) |
| 17 | Wrong-password copy | "That email and password do not match an account here." — plain `<p role=alert>`, `aria-describedby` from the button, transparent, 0 border |
| 18 | Session expiry journey | cookies present+invalid: GET `/student` → **307** → **200** `/login?next=%2Fstudent&reason=ended` → "That session ended. Signing in again goes back to your subjects." → sign in → `/student`. Dead-session POST `/enter` → opaque redirect (303 → `/login?next=…`), no write. No cookies: `/login?next=%2Fstudent`, **no sentence** (nothing observed, nothing claimed). Sign-out: 303 relative. |
| 19 | 404s + tension | `/subjects/nonsense`, `/subjects/physics` (visitor), `/no/such/route`: 404, one h1, one action, no numeral, no portal list; draft miss byte-identical to no-subject. Tension recorded. **Framework defect:** `notFound()` pages are client-rendered (`__next_error__`, empty body without JS — vercel/next.js#99287, Next 16.3.6); unmatched routes are server-rendered. Tracked by gates that flip when fixed. |
| 20 | Role redirect | permissions.cjs 9/9 (student `/tutor`,`/admin` → `/student`, server-side; no sentence) |
| 21 | Double submit UI, no JS | JS disabled, Begin clicked twice → one row, environment opens; no client guard exists or is needed |
| 22 | JS payload per route (decoded KB, same method, before `3185c1e` → after) | `/` 12 scripts/563 → 13/578 · `/subjects` 13/584 → 15/602 · `/subjects/mathematics` 14/610 → 16/628 · `/login` 13/580 → 14/595 · `/student` 11/556 → 13/574 · `/student/account` 11/556 → 13/574. Delta = the two dumb error boundaries (root ≈14 KB incl. a `next/link` copy, subjects ≈3 KB; ≈8 KB gzipped). A first version with the nav shell inside the root boundaries cost +43 KB/route (second shell copy) and was withdrawn. Shell harness script bytes 152 301 → 154 366 (before the withdrawal) → pinned now. |
| 23 | A11y of every state | 65 views (13 states × light/dark × 390/1280 + live captures): one h1 per page (fragments exempt), heading nesting recorded, reading order = DOM order, first action focusable with visible ring, **0 fresh contrast violations measured by axe in both themes**; 26 hits on the pre-existing 5.1 auth chrome (brand link 3.77:1 light, info-panel body 4.21:1 light, panel title 2.43:1 dark) — listed, not hidden, not 5.7 surfaces; targets ≥44 (actions 192–238 × 48); 200%/400% zoom no h-scroll, action visible; 1.4.12 spacing nothing clipped |
| 24 | Screenshots | 66 PNGs in `audit/states-shots/`: every state 390 + 1280, light + dark, no horizontal scroll anywhere; grayscale `not-found-grayscale-390.png` |
| 25 | Reduced motion / no-JS / grayscale | reduced motion: 0 running animations on the honest page; no-JS: unmatched-route 404 and all 200 states render (env harness no-JS gate PASS); notFound()/error boundaries are client-rendered — the framework defect above; grayscale legible (type-only hierarchy) |
| 26 | Performance | Env route TTFB signed-in, 7 runs, first discarded: **629–690 ms** (was 596–739); LCP unthrottled 712–824 ms; **round-trips on `/subjects/mathematics` unchanged: getUser + enrolments + environment_state (3), plus one more only on a failure path (none added to the happy path)**. Lighthouse mobile `/student` (shell.cjs): score 94, FCP 1.4 s, LCP 2.5 s, TBT 180 ms; one earlier run under sandbox memory pressure (TBT 25 s, kswapd active) discarded and re-run — variance noted, not gated (D-08). |
| 27 | Harness extended + baselines | page 8/8 (baseline re-pinned: `payload.js` 576 356 → 591 695; declared) · shell 57/57 (re-pinned: script bytes) · environment **22/22** (21 + the framework-defect gate; re-pinned: visitor DOM hash `47456ef7283919cd` → `196ca45447fcb58f` — diff is only CSS/JS chunk filenames in `<head>`; 404 states now carry text and one action) · permissions 9/9 · states 38/38 (new) · test-progress 16/16 · test-next-action 34/34 |
| 28 | Production build | `next build` clean; `/dev/student-states`, `/frame`, `/throw` → 404 on `next start`; no `service_role`/`DATABASE_URL`/non-anon JWT in `.next/static` |
| 29 | Logger line (real, from the production log) | `{"level":"error","at":"2026-09-29T18:01:12.175Z","scope":"read:enrolments","errorClass":"PostgrestError(42501)","what":"read failed — the caller decides: page failure (primary) or silence (region)","ids":{}}` |
| 30 | `git status --porcelain` | raw output in the chat report (taken after commit) |

RLS `--local` (needs a local PostgreSQL 17 install each turn) was not re-run: no policy, migration or SQL changed this step; `test-rls.sh` still applies only `supabase/migrations/`.

## What is real vs simulation on `/dev/student-states`

Real: not-found, page/student/environment failed (same component + copy as the boundaries; the boundaries themselves proven live via `/throw` in dev and revoked grants on the production build), entry-failed (real `Threshold`), login-ended/continue (real `LoginForm` with the real sentence), region-failing (real wrapper, throwing resolver), global-error (the same markup). Simulation (static markup of the same primitive): login-refused/unavailable result line (the live one is captured in `login-refused-live-*.png`), in-flight button label.

## Not done / not accepted

- Framework: client-rendered `notFound()` and error boundaries (Next 16.3.6). Recorded with gates; not ours to fix; do not work around with a `[...catchall]` (that would change the 404 behaviour, which 5.7 may not).
- The 5.1 auth chrome's contrast misses (pre-existing) and the `httpOnly:false` session cookie default — for the 5.1 owner, not this step.
- 5.8 not begun.
