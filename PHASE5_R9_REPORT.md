# PHASE 5 · P5-R9 — AN ERROR IS NEVER AN ABSENCE · REPORT

Date 2026-09-30 · follows 5.7 (`bbc77d3`) · decision DEC-011 · harness `audit/states.cjs` **45/45** (38 + 4 P5-R9 + 3 flip-alarm/finding gates).

## 1. The sweep — every hit, with the verdict

Grep over `src` (non-dev) for: `catch … return null/[]`, `.catch(() => …)`, `|| []`, `?? []`, `?? null`, `if (error) return`, `maybeSingle()`, `data ??`, plus every `try {` and every `.from("` in a data path.

| # | File:line | Pattern | Failed read becomes an absence? | Reason |
| --- | --- | --- | --- | --- |
| 1 | `src/lib/auth/session.ts:30` `profiles … .maybeSingle()` (error ignored) | maybeSingle, `profile?.role ?? "student"` | **YES** | a failed profile read became role `student`, empty name — a tutor/admin under a DB failure would have been redirected to `/student` as a student |
| 2 | `src/lib/auth/session.ts:29` `auth.getUser()` → `if (!user) return null` | error ignored | **YES** | Auth server unreachable/5xx returned `user: null` — the same value as "no session"; a signed-in student became a visitor (and `requireIdentity` sent them to `/login`) |
| 3 | `src/lib/supabase/proxy-session.ts:41` `data.user?.id ?? null` | `?? null` on a query result | **YES** | same as 2 at the proxy: an Auth outage redirected to `/login?…&reason=ended` — a CLAIM ("that session ended") about a read that failed |
| 4 | `src/app/subjects/[subject]/enter/route.ts:47` `enrolments … .maybeSingle()` (error ignored) | maybeSingle → `enrolled = existing?.status === "active"` | **YES** | a failed read decided "not enrolled": an enrolled student's own **draft** environment answered **404** from `mayEnrol`; a ready one re-ran the upsert |
| 5 | `src/lib/student/data.ts:77` `environment_state … .maybeSingle()` in `recordEnvironmentEntry` (error ignored) | maybeSingle → INSERT branch | **YES** (write path) | a failed read chose "no row yet" and attempted an INSERT over an existing row; only the primary key stopped it from resetting `first_entered_at` |
| 6 | `src/app/subjects/layout.tsx:33` `getIdentity()` unguarded | (throws after fix 1–2) | **YES → region** | the nav item is supplemental; a throw here would have failed the public `/subjects` tree — now isolated (silence + log), never a fabricated "visitor" without a log |
| 7 | `src/lib/student/data.ts:61,62,100` `(enr ?? [])`, `(env ?? [])`, `(data ?? [])` | `?? []` | NO | each follows `if (error) throw new DataReadError(…)` (5.7); the `??` only types a success with no rows |
| 8 | `src/lib/student/data.ts:117` `data?.first_entered_at ?? null` | `?? null` | NO | after the throw; `null` = no `environment_state` row = MISSING, a named state (5.6) |
| 9 | `src/features/auth/actions.ts:50,63` `if (error) return { error: sentence }` | `if (error) return` | NO | returns a sentence, not an absence; the form renders it beside the control |
| 10 | `src/lib/next-action/index.ts:47` `try … catch → benignAction` | catch in a data path | NO | P5-R4's isolation of the *engine*, inputs already read; the benign action is a real action, and `fellBack`/`failedProviders` name the failure |
| 11 | `src/lib/state/isolate.ts:22,33` | catch → `{ ok:false }` | NO | this *is* the pattern: the failure is typed, logged and distinguishable |
| 12 | `src/lib/supabase/server.ts:22` `try { cookies.set }` | catch | NO | cookie write from a Server Component (the documented @supabase/ssr no-op); no read |
| 13 | `src/lib/ambient/eligibility.ts:34,60`, `:46 deviceMemory ?? null` | try / `?? null` | NO | browser capability probes, not data; `null` = "not reported by this browser" |
| 14 | `src/components/ambient/ambient-stage.tsx:187`, `switch/subject-switch.tsx:161–162`, `student/student-shell.tsx:111`, `next-action/resolver.ts:202` | `?? null` | NO | in-memory values (dev instrumentation, a resolved winner, a config lookup) — no I/O involved |

Six YES. All fixed.

## 2. The fixes (one pattern: the reader can tell the difference)

- **`src/lib/state/read-error.ts`** (new) — `DataReadError` moved here from `data.ts` (re-exported) so auth can throw it too; plus `isIdentityReadFailure(error)`: `AuthRetryableFetchError`, `status 0` or `≥ 500` = a **failed read**; 400/401/403 (missing/expired/invalid token) = **no session**, an absence.
- **`session.ts`** — `getUser` failure → throw; profile read error → throw. `requireIdentity` therefore reaches the segment's `error.tsx` (honest page) instead of redirecting a signed-in person to `/login`.
- **`proxy-session.ts`** — on an identity read failure the proxy **passes the request through** unchanged (logged `proxy:getUser`); the page's own read throws the same failure and the honest page renders. It never redirects, so it never says "That session ended" about an outage.
- **`enter/route.ts`** — identity read wrapped in `isolateAsync`; enrolment read error → log + `303 /subjects/<id>?entry=failed` (no row written, no 404). The GET decides: honest page while the read still fails, the truth once it reads.
- **`data.ts` `recordEnvironmentEntry`** — read error → `{ ok:false, error:"read:<code>" }`: no INSERT is attempted from a failed read.
- **`subjects/layout.tsx`** — nav identity via `isolateAsync("region:subjects-nav")`: visitor chrome + log.
- **`docs/STATE_LANGUAGE.md`** — the rule, one paragraph, before the inventory.

Payload: unchanged — every change is server-side (`/subjects/mathematics` 16 scripts / 628 KB decoded, `/student` 13 / 574, as pinned in 5.7).

## 3. Regression tests (each FORCES the failure — `revoke select on enrolments`; student-e enrolled in mathematics by Begin and in the draft `physics` by SQL for the block)

| Case | Evidence (production build, `audit/states-baseline.json` → `tests.p5r9`) |
| --- | --- |
| an enrolled student is never offered Begin | GET `/subjects/mathematics` → **500**, `[data-state-page=page-failed]`, `[data-threshold]` absent; POST `/enter` → **303** (opaque redirect), rows unchanged `2/1` |
| a student's own draft environment never 404s under failure | GET `/subjects/physics` → **500** honest page, one h1 (not 404); POST `/subjects/physics/enter` → **303** (not 404) |
| a read failure never renders "no enrolments" | GET `/student` → **500** "Your subjects could not be read just now." — no state-A wording (`no subjects / Choose a subject / Begin / not enrolled`) |
| log | `{"scope":"route:/subjects/[subject]/enter","errorClass":"PostgrestError(42501)","what":"enrolment read failed before deciding — no row written","ids":{"subject":"physics","identity":"d83e…"}}` — class + scope + ids, no content |

Grants restored in `finally`; SQL-inserted enrolment deleted after the block.

## 4. Auth chrome contrast — fixed at the token, lightness only

Measured with axe (`color-contrast`) on the production build, 390 px, `/login` + `/register`.

| Pairing | Theme | Before (fg / bg / ratio) | After (fg / bg / ratio) |
| --- | --- | --- | --- |
| info-panel **title** ("Test accounts only") | light | `#7a5a1f` / `#ede7da` / **5.15** (passed) | `#72541d` / `#ede7da` / **5.67** |
| info-panel **body** (brass at the primitive's 0.9 opacity) | light | `#866832` / `#ede7da` / **4.21 ✗** | `#7e6330` / `#ede7da` / **4.58 ✓** |
| brand **link** ("Create an account" / "Sign in") | light | `#9e7a33` / `#faf9f5` / **3.77 ✗** | `#72541d` / `#faf9f5` / **6.64 ✓** |
| info-panel **title** | dark | `#7a5a1f` / `#28241a` / **2.43 ✗** | `#c29a45` / `#28241a` / **5.89 ✓** |
| info-panel **body** | dark | `#72551f` / `#28241a` / **2.23 ✗** | `#b38e41` / `#28241a` / **5.05 ✓** |
| brand **link** | dark | `#9e7a33` / `#0b0e12` / 4.9 (passed) | `#c29a45` / `#0b0e12` / **7.36** |

What changed (three lines, no structure, no new token, no redesign):

1. `--ta-brass-700: #7a5a1f → #72541d` — HSL **38.9° / 59.5 % / 30 % → 38.9° / 59.5 % / 28 %**. Hue and saturation identical; two points of lightness. It is the darkest brass step and the light theme's brand *text* token; it is not a background anywhere.
2. `--color-brand-900: var(--ta-brass-700) → var(--ta-brand)` — the Tailwind alias was **not theme-aware** (dark brass on the dark panel). Now it resolves to the existing themed brand text token: light = brass-700 (same as before), dark = brass-500. This also corrects `portal-sidebar.tsx`'s `text-brand-900` in dark.
3. Auth link class `text-brand-700 → text-brand-600` (= the themed brand text token, one step darker in the same hue); hover `→ text-brand-900` (same token, so the hover state cannot fall below AA).

**Correction event** recorded in `audit/states.cjs` → `CORRECTIONS[]` (persisted in `states-baseline.json` with `from`, `to`, `measuredBefore`, `reason`, `oneTimeOnly`), and the environment baseline carries a `correctionEvents` entry for the visitor DOM hash (CSS chunk filenames only). The 5.7 `PREEXISTING_5_1` exemption regex is now empty — **nothing is exempt**; the audit reports **0 violations across 65 views, both themes** (`contrast preexisting 0 fresh 0`). Every hit reached AA within the hue lock; **nothing needed a new colour**, and no hue was shifted. The one thing to know: fix 1 darkens the light-theme brand text token everywhere it is used (links, the shell's brass headings) by 2 % lightness — measured page.cjs G1/G6 contrast gates still PASS with no diffs.

## 5. Framework dependency — declared exception + flip alarm

- `docs/STATE_LANGUAGE.md` now has a **"Framework-dependent declared exception (not a design choice) — FLIP ALARM"** section: Next **16.3.6**, **vercel/next.js#99287**, observed **2026-09-29**.
- `audit/states.cjs` carries three **FLIP-ALARM** gates that assert today's defective behaviour and say what to do when they fail: `notFound()` 404 without JS → `h1 0`, `__next_error__` · root `error.tsx` without JS (dev throw) → `h1 0` · a root-layout throw without JS → `h1 0`. The real assertion (`h1 === 1`) sits beside each, commented, for the day the alarm trips.
- `docs/PHASE_TRACKER.md` (new — no tracker existed) + one line in `docs/ARCHITECTURE.md §7`: re-test on any Next bump and at Phase 10 start.
- **`global-error.tsx` — reported either way:** it could **not** be reached by test. A throwing second root layout (`src/app/(dev-root)/layout.tsx`, dev-only, 404 in prod) is caught by `app/error.tsx` — the root boundary wraps every segment below `app/`, route groups included — so only the real `app/layout.tsx` failing reaches `global-error.tsx`. By the framework's contract it must be a client component, so its delivery is client-side by construction: same class of exception, stated without a measurement. The dev throw stays as the "layout throws" specimen (with JS: the root boundary's honest page, never the thrown message; without JS: empty).
- Copy inside those pages: unchanged.

## 6. Harnesses after P5-R9

states **45/45** (re-pinned; two robustness fixes in the harness itself: wait for hydration before reading facts on client-rendered boundaries, `about:blank` before `setViewport` so a dev page is not reloaded under memory pressure) · environment **22/22** (visitor-ready DOM hash re-pinned, correction event recorded) · page **8/8 no diffs** · shell **57/57** (script bytes 166 027/177 752 → 153 736 re-pinned; dev-server measure) · permissions 9/9 · test-progress 16/16 · test-next-action 34/34 · tsc + eslint clean · `next build` clean, `/dev/global-throw` 404 in production · env TTFB 600–782 ms (warm-up discarded), LCP 668–772 ms.
