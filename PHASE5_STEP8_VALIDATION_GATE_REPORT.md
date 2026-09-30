# PHASE 5 · STEP 8 — THE STUDENT EXPERIENCE VALIDATION GATE

Date 2026-09-30 · verification, not construction · after P5-R9 (`29b98f6`) · decision DEC-012.
Evidence: `audit/journey.cjs` → `audit/journey-baseline.json` (re-runnable), plus the standing harnesses.

## The question

**Would a real student, on a phone, at 8 pm, on a slow connection, come back tomorrow?**

Answered two ways, because it is two questions:

- **Would anything make them leave and not return?** — measured: **no.** Nothing lies, nothing spins, nothing blanks on the pages they use, nothing is lost mid-journey, and the return visit says something true about yesterday.
- **Is there anything to come back *for*?** — measured: **not yet.** After Begin, the environment says, in its own words, "Nothing here is loading; nothing here is built yet." The arc stops at `enter:done, learn:ahead`. That is honest, and it is the Phase 6 entry point (below).

## Conditions

Production build (`next start`), **390 × 844**, DPR 2, **dark** (prefers-color-scheme: dark, the 8 pm setting), **Slow‑3G** emulation (400 kbps down/up, **400 ms RTT**), **4× CPU throttle**. Two real accounts on the test project: `student-e` (write account, reset first — the first night) and `student-c` (read-only, physics entered yesterday — the next day; never POSTs). Numbers are one run each, unwarmed, variance not gated (D‑08); two earlier runs of the same script agree within ±0.3 s per step.

## The first night (student-e) — after the fixes

| Step | Lands on | Wall | FCP | LCP | load | h1 | Primary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 homepage (cold) | `/` | 7.5 s | 2.4 s | 2.4 s | 7.2 s | Every subject is a place you can enter. | Enter a world |
| 2 subjects | `/subjects` | 1.6 s | 0.50 s | 0.50 s | 1.3 s | Subjects | Mathematics |
| 3 environment as visitor | `/subjects/mathematics` | 1.5 s | 0.48 s | 0.52 s | 1.2 s | Mathematics | (see finding 1) |
| 4 "Sign in" from the environment | `/login?next=%2Fsubjects%2Fmathematics` | 2.0 s | — | — | — | Sign in | "Signing in opens Mathematics." |
| 5 type + submit (in flight: button "Signing in…", disabled) | **`/subjects/mathematics`** | 2.2 s (submit→arrive 1.8 s) | — | — | — | Mathematics | **Begin Mathematics** |
| 6 Begin (native POST; the page unloads, the browser shows its own progress — nothing of ours claims anything) | `/subjects/mathematics` | 2.4 s (click→arrive 2.2 s) | 1.9 s | 1.9 s | 2.0 s | Mathematics | arc `discover:done choose:done enter:done learn:ahead …` |
| 7 back to the shell | `/student` | 1.4 s | 0.53 s | 0.58 s | 1.1 s | Mathematics — The Lattice | Open Mathematics |

Whole first night: **462 KB** encoded over the wire (6 documents, 60 script requests, 15 font requests, 37 RSC fetches); no horizontal scroll on any page; one h1 everywhere.

**Before the fix** the same journey had two more steps: sign-in landed on `/student` ("Choose a subject" → "See the six subjects") → `/subjects` → `/subjects/mathematics` — **+1.9 s and two more decisions** on Slow‑3G before the student could press Begin, and 497 KB instead of 462 KB.

## The next day (student-c, read-only)

| Step | Lands on | Wall | FCP | load | What it says |
| --- | --- | --- | --- | --- | --- |
| 1 sign in (cold context) | `/student` | 1.7 s | 2.2 s | 5.9 s | **"LAST OPENED YESTERDAY · Physics — The Field · You were last here yesterday. · Open Physics"**, then "Your subjects: Physics — last opened yesterday · Mathematics — not opened yet" |
| 2 the environment (GET only) | `/subjects/physics` | 3.1 s | 1.0 s | 2.8 s | draft notice (fixed, finding 2) · "Nothing here is loading; nothing here is built yet." · arc `enter:done learn:ahead` |
| 3 account | `/student/account` | 0.9 s | 0.52 s | 0.57 s | Student C · Sign out |

396 KB encoded for the day. The return visit is truthful and specific (yesterday is yesterday, not "recently"), and the primary action is the one thing they did last time. That is the part of "come back tomorrow" the product can already keep.

## What the slow connection actually costs

- **The first page of any visit is the expensive one: 5.9–7.2 s to `load`, 2.2–2.4 s to first paint** (≈180 KB gzipped JS + 5 fonts on a 400 kbps line). Every page after it paints in **≈0.5 s** (cache + RSC). This is the shell/nav/theme/spine JavaScript, not Phase 5's: Phase 5 added ≈8 KB gz per route in total (5.7 report) and nothing in 5.8.
- **Writes are the fastest thing in the journey** (Begin: click → true state 2.2 s including the 303 + re-read), because they are native forms with no client round trip.
- **The framework exception is now sized:** a `notFound()` 404 is **blank for 5.2 s after its document arrives** on this connection (h1 at 5.7 s); the server-rendered unmatched-route 404 shows its h1 **52 ms** after the document. The flip alarms (P5-R9) are where this is tracked; the number is now in `docs/STATE_LANGUAGE.md`.

## Defects found and fixed (no features)

1. **Signing in from an environment lost the environment.** The nav shell's "Sign in" linked to bare `/login`; the student came back to `/student` and had to re-find Mathematics (measured above). Fix: `loginHref(pathname)` in `nav-shell.tsx` — on `/subjects/<id>` only, the link carries `?next=<that path>`; everywhere else it is unchanged. The login page already knew what to do with it (5.7: "Signing in opens Mathematics."). No new JS, no new dep, no restyle. *Finding 1 (reported, not built):* on a phone the visitor's environment has no way in inside `<main>` — the only visible controls are the subject links; "Sign in" lives in the header. It works (measured), but it is the one moment the primary action is not on the page. Recorded for the owner; adding a door there is 4.x/5.5 territory, not a gate fix.
2. **The draft notice lied to the only person who sees it in production.** `subject-shell.tsx` said "Draft subject — visible in development only. In production this route returns the framework 404." An enrolled student *does* see this route in production (5.3 door logic) and was told they were somewhere that returns a 404. Now: "Draft subject — still in foundation. Open here ahead of its public listing." — true in dev and in prod, product is the subject.

Both are correction events in `audit/environment-baseline.json` (`correctionEvents`, with reasons); visitor DOM hash re-pinned; `enrolled-draft-*` main text re-pinned.

## What was verified and left alone

- **In-flight honesty:** sign-in shows "Signing in…" (disabled button, the student's own action); Begin shows nothing of ours — the browser's own navigation is the only indicator. No spinner anywhere on the path.
- **Return copy** is 5.6's ("yesterday", "not opened yet"), fixture-stamped relative to now, so it is true on the day it is read.
- **Dark theme at 8 pm:** 0 contrast violations across the journey pages after P5-R9's token correction.
- **Harnesses after 5.8:** states 45/45 (`--check`, no diffs) · environment 22/22 (3 declared diffs → re-pinned as correction events) · permissions 9/9 · page 8/8 (untouched routes) · shell 57/57 (untouched) · test-progress 16/16 · test-next-action 34/34 · tsc/eslint clean · `next build` clean.

## The Phase 6 entry point

The environment after Begin holds nothing to return *to*. The arc's next step, `learn`, is admissible only on `session-attended | recording-watched` (5.6), and both need a person and a session that do not exist in the model. The registry already names the first missing fact: the `tutor-presence` slot (`src/config/student-slots.ts`, "Your tutor here — Phase 6–7 — needs a tutor–student assignment for this subject — today: nothing (absent)").

**Phase 6 begins with the tutor–student assignment (the roster) and its RLS policy** — what a tutor may see of a student, decided in policy, not schema (docs/PROGRESS_LANGUAGE.md already frames it this way). That is the smallest true fact that puts a named person in the room, fills the one empty region that a returning student looks at, and makes "come back tomorrow" a sentence the product can honestly finish: *your tutor, this subject, this next session.* Everything downstream (live classroom, `progress_record`) is Phase 7 and stays there.

## Phase 5 closes

Steps 5.1–5.8 and rulings P5‑R1–R9 landed. Standing rules carried forward: RLS is the boundary · no stored derived values, never a zero · an error is a claim · an error is never an absence · one predicate from door logic · no client JS for writes · no device storage of student data · flip alarms re-tested on any Next bump.
