# Phase 6 · Step 2 — THE TUTOR SHELL · report

Date 2026-10-01 · base `9724a24` · production build, harnesses on `:3100`, dev on `:3000`.
Rulings: P6-R4 (no invented next act), P6-R5 (false strings are defects), P6-R6 (reader
classes are a harness dimension). 6.3 not begun.

## 0. Precondition — quoted from 6.1

- **Provider verdict (6.1 §7):** no P6 next-action provider ships; a tutor has no next act
  until a teaching surface exists. → the dominant surface on `/tutor` is a statement.
- **Creation flow (6.1 §6):** academy-provisioned first (consent out-of-band; no guardian
  identity needed); tutor-invited second; student-requested last; not built.
- **Test relationship:** exists — `tutor-a ↔ student-c · physics · active` (verified in DB
  every harness run: `R.relationships` in `audit/identity-matrix.json`). A second tutor,
  `tutor-u` (related to nobody), was created this step with `scripts/test-account.mjs`
  (service role, `*@test.tutorsacademy.invalid`). So states **A and B are both reachable
  with real accounts; C is not** (no events table, 5.6).

## 1. Inspection findings (before building)

| # | finding | consequence |
|---|---|---|
| 1 | `/tutor` was Phase-1 `PortalShell` (a **client** component: sidebar of planned modules + `NotBuiltYet`), unlike `/student` (NavShell room mode, server) | replaced with the 5.3 composition; no second shell language |
| 2 | `PORTAL_META` blurbs are rendered on **`/login` and `/register`** (brand panel ≥1024 px) — audience is every visitor, not portal users | "get paid" was public; rewritten (P6-R5) |
| 3 | `tutor-portal.summary` / `admin-portal.summary` / `student-portal.summary` were false; `NotBuiltYet` promised "the next build drops it in"; "Scheduled for this surface" | rewritten; see §9 |
| 4 | `/admin` is reachable by nobody (`count(role='admin') = 0`, asserted every run) | admin recorded as an absence (P6-R6) |
| 5 | Login context for `next=/tutor` said *"Signing in opens your subjects."* | now *"your students"* / *"your account"* |
| 6 | `AccountEntry` hard-coded `/student/account` | additive optional `href` prop; student DOM unchanged (shell 57/57, no diffs) |
| 7 | 5.7 error boundary pattern needs a tutor copy | `STATE_COPY.tutorFailed`, `tutor/error.tsx`; STATE_LANGUAGE rows 24–25 |
| 8 | the slot registry (`src/config/student-slots.ts`) holds two scopes | third scope `TUTOR_SLOTS` appended to the same file, same shape |
| 9 | status codes before: `/tutor` visitor 307, student 307→`/student`, tutor 200 (placeholder) | unchanged after, now a shell |

## 2. Route and IA (Part 1)

`TUTOR_NAV_ITEMS`: Overview `/tutor` · Subjects `/subjects` · Account `/tutor/account` — 3
items, every one 200 for a tutor (matrix). Status codes by class — see the matrix (§11).

## 3. Composition and the one-dominant measurement (Part 2)

Reference 390×844, mobile, dark; second viewport 1280×800.

| measure | A | B |
|---|---|---|
| `h1` count | 1 | 1 |
| `h1` size / row text | 35.8 px | 35.8 px · ratio **2.24** over a row |
| controls inside the primary surface / `data-primary-action` / `[disabled]` | 0 / 0 / 0 | 0 / 0 / 0 |
| `a` / `button` / `form` inside the shell | 0 / 0 / 0 | 0 / 0 / 0 |
| primary surface bottom (fold 844) | 358 | 358; first subject heading 452; first row 516 |
| 1280: primary bottom (fold 800) · h1 | 320 · 1 | 320 · 1 |
| numerals anywhere in the shell | none | none |
| slot regions / slots | 0 / 0 | 0 / 0 |
| chrome targets | all ≥44×44 (brand 44, theme 44, menu 44, sheet items 342×53, account 74×48, sign out 80×48) | same |
| axe (2a/2aa/21aa) | 0 | 0 |
| text without JS == with JS | yes | yes |

Three-second test (P6-R4 form): the reader knows there is nothing to do **and why** — the
`h1` + one line are the whole surface above 358 px.

## 4. States (Part 3) — `audit/tutor-shots/`

`A-{dark,light}-{390,1280}.png`, `B-…`, plus `*-390-gray.png`. Real accounts, real rows:
B renders exactly `Student C · Physics`, equal to the DB row set and order (gate "DOM rows
equal the DB relationship rows"). State C: fixture only, labelled, on `/dev/tutor-shell`.

**Copy candidates (A) and the choice**
1. *"Nothing to do here yet."* — "yet" is a soft promise; rejected.
2. **"No student is placed with you."** + *"The academy places a student with a tutor, one
   subject at a time; it is not done from this page. Teaching surfaces are not built."* — the
   situation and the reason, no promise, no apology, no control. **Chosen.**
3. *"There is nothing to teach from here."* — true but reads as a rebuke; rejected.

B: **"Nothing to do here."** + *"The students placed with you are listed below, by subject.
Placing is done by the academy, not from this page. Teaching surfaces are not built."*

## 5. Rows and order (locked decisions 1–2)

Row = `displayName` · subject name; two spans, no link, no icon, no status, no colour, no
recency, no count. Rows are not links because nothing resolves for a relationship until 6.3;
a link named with a student that lands on a generic page would be a dead destination in
disguise (Test 18's "link" is therefore deliberately not met — recorded).

Ordering: **alphabetical by display name within a subject; subjects in the 3.1 config order.**
Reason: a name is nothing the student did; start date is a timeline (newest/oldest is a
proxy for "who's new / who's stale"). The sort, verbatim:

```ts
export function orderRows(rows: readonly RelationshipRow[]): RelationshipRow[] {
  return [...rows].sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }) || (a.studentId < b.studentId ? -1 : a.studentId > b.studentId ? 1 : 0));
}
```
Shuffled 8-row fixture → `mathematics: Anand(spec-08) · Bose · Varma; physics: Anand(spec-01)
· Menon · Rao; chemistry: Nair; english: Iyer` (shown on `/dev/tutor-shell`).

## 6. Data access (locked decision 3) — structural + attack

`src/lib/tutor/data.ts` imports: `read-error`, `contract` (type), `subjects` (config),
`supabase/server`. Tables named: `relationships`, `profiles`. No arguments. Attacks
(`audit/attacks/`, `tsc` with directives stripped — `tsc-output.txt`):
- A1 ask the reader for a non-related student → `TS2554: Expected 0 arguments, but got 1.`
- A2 render a related student's other subject → `TS2353 'enrolments' does not exist in type
  'TutorShellProps'` and `TS2353 'subjectId' does not exist in type 'RelationshipRow'`.
Runtime half: `scripts/test-tutor-visibility.mjs` 17/17; `rls_test.sql` 56/56.

## 7. Third region scope (Part 4)

`TUTOR_SLOTS` (today/relationships/work/library/tools; 6 slots, each `today: nothing
(absent)`), fill point `src/components/tutor/slots.tsx` with an empty registry and the
isolate contract. Shell asserts zero region DOM.

## 8. Never-contains (Part 5)

5.3's list + P6-R3 bans + money + console vocabulary — rendered on `/dev/tutor-shell`, swept
by `audit/tutor.cjs` on both real states (dashboard · skeleton · P6-R3 · money · stale: all
empty).

## 9. P6-R5 — the stale-string class

| string | audience (by guard) | claim | true? | fix |
|---|---|---|---|---|
| `PORTAL_META.student.blurb` "Classes, assignments, tests and progress." | **visitors** (`/login`, `/register` ≥1024) | four features exist | false | "Your subjects, and what to open next." |
| `PORTAL_META.tutor.blurb` "Teach, schedule, assess and get paid." | visitors | teaching + money | false | "The students placed with you, by subject." |
| `PORTAL_META.admin.blurb` "Operations, people, content and billing." | visitors | an admin product | false | "Architecture only. No account can open it." |
| `student-portal.summary` | nobody renders it today | schedule/work/progress | false | "The student's space: the subjects chosen, entered and returned to." |
| `tutor-portal.summary` "…sessions, rosters, grading and earnings" | was `/tutor` sidebar (tutor-a) | roster + money | false | "The tutor's space: the students placed with you, by subject." |
| `admin-portal.summary` "…finance" | nobody | back office | false | "Architecture only: a route and a guard. No admin account exists." |
| `NotBuiltYet` body "foundation task… no service is connected" | `/admin` → nobody | | false | "Nothing behind this route is built. No demo data is shown because none exists." |
| admin note "the next build drops it into this exact shell" | nobody | future promise | forbidden | "No admin account exists: the route and its guard are the whole of this portal today." |
| "Scheduled for this surface" | nobody | promise | forbidden | "Declared for this surface" |
| login context "opens your subjects" for `next=/tutor` | visitors | | false for a tutor | "your students" / "your account" |
| 3.6 `SHELL_REGIONS` notes ("Live classes will appear here — Phase 7") | everyone in an environment | certified honest labels | true | unchanged |
| **Refused:** `payments.summary` ("…tutor payouts"), `tests.summary` ("performance analytics") | nobody today | roadmap descriptions | — | not rewritten; **E-25**, awaits a ruling. No money word added anywhere (sweep: `\bearn`, paid, payout, payment, billing, invoice, rate, fee, salary, income, revenue → 0 on `/`, `/login`, `/register`, `/subjects`, `/tutor`). |

Homepage: 141 strings before and after (pinned in `audit/tutor-baseline.json`; the scenes
read registry `{id,name,status}` only and `tutor-relationship` is read by no scene). **No
homepage change → no stop.**

## 10. Registry (Part 7)

`tutor-relationship`: in-progress → **live** (a resolving surface depends on it). `tutor-portal`
**stays `planned`**: flipping it would change Scene 5 — before *"The tutor's side of the
environment — Next · not built yet"*, after *"… In foundation"*. That is a homepage change;
left as **E-26** for the owner. No other entry touched.

## 11. P6-R6 — identity set, matrix, regression row, coverage gate

Identity set: visitor · expired (student A's cookies, token replaced) · student A = `student-c`
(related) · student B = `student-b` (unrelated) · tutor T = `tutor-a` · tutor U = `tutor-u` ·
admin = **absence** (`profiles.role='admin'` = 0, `auth.users` metadata admin = 0, gated).
Pin: `audit/identity-matrix.json`, 51 routes (derived from `src/app`, `[subject]` ×
mathematics/physics) × 6 classes. Key rows (status · render):

| route | visitor | expired | student A | student B | tutor T | tutor U |
|---|---|---|---|---|---|---|
| `/tutor` | 307 login | 307 login | 307 → student C | 307 → student B | **200 shell B** | **200 shell A** |
| `/tutor/account` | 307 | 307 | 307 → /student | 307 → /student | 200 | 200 |
| `/student` | 307 | 307 | 200 C | 200 B | 307 → /tutor | 307 → /tutor |
| `/admin` | 307 login | 307 login | 307 → /student | 307 → /student | 307 → /tutor | 307 → /tutor |
| `/subjects/physics` (draft) | 404 | 404 | 200 | 200 | **404** | 404 |
| `/subjects/mathematics` | 200 | 200 | 200 | 200 | 200 | 200 |
| `/dev/*` (18 routes) | 404 | 404 | 404 | 404 | 404 | 404 |

Named regression row **"tutor T denied student A's draft door"** = `/subjects/physics` ·
tutorT · 404 · not-found — a gate. Coverage gate proof: `--check --drop-row=/tutor/account`
→ `FAIL coverage: every app route has a pinned row — missing rows: /tutor/account`, exit 1.
Defect status: the E-23 tutor-leak class is now **caught by a gate, not a human**.
Production role path: does not exist (tutor accounts only via `scripts/test-account.mjs`).

## 12. Tests 1–30 → where

Harness `audit/tutor.cjs` 36/36 (`tutor-baseline.json`); `identity-matrix.cjs` 9/9;
shell 57/57 no diffs; environment 23/23 no diffs (visitor hash re-pinned, E-20 — HEAD's own
build in this sandbox hashes `f54e59…`, byte-identical to the 6.2 tree); states 45/45;
gate — see §13; RLS 56/56; tutor-visibility 17/17; `tsc` clean; `next build` clean;
Test 18 deviation (rows not links) recorded in §5; Test 28 in §9; Test 29 in §11; Test 30
`git status --porcelain` empty after commit.

## 13. Payload, perf, drift

Client JS: same-method script bytes `/tutor` 588 003 (13 files) vs `/student` 588 004–005
(13 files) — nothing added. No new dependency, token, primitive or motion.

## 14. Refusals and not-done

No next-act for tutors; no row link; no earnings/schedule/roster anything; no admin account
or surface; no schema change; no write path; `tutor-portal` not flipped; `payments`/`tests`
summaries not rewritten; 6.3 not begun.

## 15. Open for the owner

E-25 (money/analytics words in two planned summaries), E-26 (`tutor-portal` status vs the
homepage label). Both recorded in `docs/EXCEPTIONS.md`.
