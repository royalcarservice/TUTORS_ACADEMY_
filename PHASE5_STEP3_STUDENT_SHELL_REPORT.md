# Phase 5 · Step 3 — The Student Shell — Report

> **P5-R2 corrections applied (see `PHASE5_R2_CORRECTION_REPORT.md`):** the entry count no longer renders (§5/§6 strings superseded); the "844px tall, nothing below the fold in any state" claim in §4/§5 was measured at one viewport only and is withdrawn — the corrected, multi-viewport measurement is in the R2 report; brand link hit area is now 44×44.

**Status: BUILT and VERIFIED against a real Supabase project. AUTH VERIFIED (Test 1 below).** 42/42 harness gates, 10/10 boundary checks, 0 axe violations, 4.9 harness "no diffs vs baseline". Two deliberate exceptions to "do not change" are declared in §18. Commit hash is in the turn message (committed after this file was written).

---

## 0. Precondition — AUTH VERIFIED BEFORE ANYTHING WAS BUILT

Owner supplied `.env.local` (Tier 1). Sequence, all on the real project `ildmvrlkcecwujgneibz` (PG 17.6, ap-northeast-1 pooler):

1. `supabase/migrations/20260927000001_identity.sql` applied via `psql` → tables `profiles`, `enrolments`, `environment_state`, RLS on all three, 8 policies, triggers `on_auth_user_created` + `profiles_touch`.
2. `scripts/test-rls.sh` against the project: **`RLS: all 20 assertions passed`**, transaction rolled back, `auth.users` count 0 after.
3. Three **test accounts** created through the Auth Admin API (`scripts/test-account.mjs create …`, service role, CLI only) — the signup trigger ran on the real Auth server: 3 `profiles` rows, `role=student`, `is_test_account=true`.
4. Browser verification through the **real login form** (puppeteer, 390×844), pasted verbatim:

```
1 signed-out /student -> http://localhost:3000/login?next=%2Fstudent 200
2 after sign-in -> http://localhost:3000/student
   cookies: sb-ildmvrlkcecwujgneibz-auth-token httpOnly=false sameSite=Lax len=2850
3 new tab /student -> http://localhost:3000/student 200      h1: Student overview   (pre-5.3 page)
4 /tutor as student -> http://localhost:3000/tutor           ← DEFECT, fixed in 5.3 (see §18): now → /student
5 POST /auth/signout -> /login    sb- cookies after: 0
6 /student after sign-out -> http://localhost:3000/login?next=%2Fstudent
7 bad password -> /login | alert: Could not sign in — Invalid login credentials
```
Sign-in ✔ · session persistence (new tab, dev restart, prod build) ✔ · sign-out ✔ · protected-route redirect ✔. Cookie is set by `@supabase/ssr` (its default is `httpOnly=false` so the browser client can read it; server validates with `getUser()` on every request — not a hand-rolled session).

**Runtime finding surfaced, not hidden:** `npm ci` failed — lock pinned `@supabase/supabase-js 2.109.0` while `@supabase/ssr 0.12.7` peers `^2.114.0`. `npm install` moved the lock to **2.117.2** (within package.json's `^2.109.0`; no new dependency). 2.117 requires **Node ≥ 22** (native WebSocket) and throws on Node 20. The sandbox's Node 20 was supplemented with Node 22.20.0; all builds/tests below ran on Node 22. Deploy target must be Node 22+.

---

## 1. Files created / modified

**Created**
- `src/components/student/student-shell.tsx` — the shell (pure render; resume-honesty rule stated in code)
- `src/components/student/slots.tsx` — slot registry = extension contract (empty)
- `src/components/student/account-entry.tsx` — name (small) + real sign-out for the nav
- `src/config/student-slots.ts` — the written slot map
- `src/config/student-nav.ts` — the IA (3 items) + extension rule
- `src/lib/student/subject-info.ts` — config → display facts (environment name = first clause of tagline)
- `src/app/(portal)/student/account/page.tsx` — Account
- `src/app/dev/student-shell/{page,fixtures,frame/page}.tsx` — specimen (404 in prod)
- `audit/shell.cjs`, `audit/shell-baseline.json`, `audit/lighthouse-shell.json`, `audit/shell-shots/*.png` (34)
- `scripts/test-account.mjs` — test-account provisioning (service role, CLI only)

**Modified**
- `src/app/(portal)/student/{layout,page}.tsx` — NavShell Room mode + role guard; shell replaces `NotBuiltYet`
- `src/components/layout/nav-shell.tsx` — optional `account` prop (API extension; structure/modes/motion unchanged)
- `src/lib/student/data.ts` — `getEnrolledSubjectIds()`
- `src/app/subjects/[subject]/page.tsx` — draft guard admits enrolled identity (§9, §18)
- `src/app/(portal)/{tutor,admin}/layout.tsx` — one line each: `requireIdentity(role)` (§18)
- `package-lock.json` (§0), `docs/DECISIONS.md` (DEC-003)

---

## 2. Route root

**`/student`** — kept, per P5-R1 Part 4 (the ruling overrides the brief's `/learn` suggestion). No parallel root, `/learn` does not exist. The route names the person, the page answers the activity; the composition — not the URL — is what keeps it from being a dashboard.

## 3. IA, nav count, extension contract

| Destination | Route | Real |
|---|---|---|
| Overview (the shell) | `/student` | yes — this step |
| Subjects (the environments) | `/subjects` → `/subjects/[id]` | yes — 3.6 scaffold + environments |
| Account | `/student/account` | yes — this step |

**Nav item count: 3.** Nothing else is listed. No search, no notification affordance, no disabled rows. The Phase-1 `PortalSidebar` ("Coming to this portal" + status badges + "Sign in") is **no longer mounted for students**; it remains for tutor/admin until Phase 6.
**Extension contract:** append `{label, href}` to `STUDENT_NAV_ITEMS` *after* the route exists; the harness's dead-nav gate fetches every header/main link with the session and fails on anything but 200.
**Unauthenticated:** proxy → `307 /login?next=/student` (5.1 boundary, implemented not redefined). `/login` HTML contains no `data-student-shell`/`data-subject-rows` (harness `no-fake-signed-in` PASS).

## 4. Composition — how one surface wins

- **Primary surface** = a 3.3 `Room` scoped to the answering subject (`role="edge"` motif, compact density, vector only) carrying **mark (32px) · eyebrow · h1 "Subject — Environment" · one line · one primary button**. In state A it is a brass-framed room (no subject scope).
- **Measured at 390×844 (prod):** h1 35.8px vs next-largest text 16px → **ratio 2.24**; exactly **1** `data-variant="primary"` button; exactly **1** h1; primary surface area 118,172 px² vs rows 57,242 px² (B/C). Nothing else uses display type, brass, or a filled button.
- Subject rows: quiet rows (hairline-separated list, 16px name, 14px environment, 12px recency), equal weight, no featured subject. Shell chrome is brass/neutral; subject accents appear only on the mark and the Room edge.
- No greeting, no banner, no stat row. The student's name appears once, small, in the nav (`Student C`), never as headline. Nothing animates on load (`.ta-reveal` count 0; reduced-motion snapshot identical).

## 5. The three states (screenshots in `audit/shell-shots/{A,B,C}-{dark,light}-{390,1280}.png`)

| State | Server `data-state` | Eyebrow / h1 / line / action |
|---|---|---|
| **A** | `A-no-enrolment` | *What now* / **Choose a subject** / "Six environments are open. Choosing one is where this begins." / **See the six subjects** → `/subjects` |
| **B** | `B-enrolled-never-entered` | *First session* / **Physics — The Field** / "You chose Physics yesterday. Your first session begins when you open it." / **Open Physics** |
| **C** | `C-enrolled-active` | *Last opened yesterday* / **Physics — The Field** / "You were last here yesterday. You have opened it 3 times." / **Open Physics** |

**Three-second test — how verified:** (a) the accessibility tree's first meaningful items after `main` are eyebrow → h1 → line → link for all three states (§12); (b) at 390×844 the whole document is **844px tall — no scroll exists**, so the button is on screen at first paint (bottom at 318/413/413px); (c) the specimen's side-by-side 390 frames were inspected — in each, the only filled element is the action. Reader's answer: A "see the subjects", B "open Physics", C "open Physics". No state needed a fix after the first hierarchy run except the button skin (legacy `buttonClass` → 2.5 `.ta-btn` primitive, which also made the primary-button count measurable).

State A is not an error: no warning styling, one path out, complete composition (one real thing). State B is the most inviting by construction: same weight as C, "first session" framing, no "haven't started".

## 6. Resume honesty — what `environment_state` actually holds

Real row on the project (student-c): `subject_id=physics · first_entered_at=2026-09-20 · last_entered_at=2026-09-27 · entry_count=3 · position=NULL`.
The surface therefore renders **which** environment and **when** ("yesterday", computed server-side by calendar day; nothing finer than a day is claimed) and **how many times** (entry_count is populated). It renders **nothing about a place inside** — no chapter, lesson, page or percentage — because `position` is NULL. The action is **Open Physics**, the only real action. Rule is stated in `student-shell.tsx` header and `contract.ts resumeFacts()`. Rows say "Not opened yet" when no state row exists — the literal truth, not an apology.

## 7. Slot map (rendered at `/dev/student-shell`; source `src/config/student-slots.ts`)

| Slot | Phase | Region · position | Needs | Today |
|---|---|---|---|---|
| Today's sessions | 7 | Today · region | real scheduled sessions, student TZ | absent |
| Upcoming class | 7 | Today · region | next session beyond today | absent |
| Assignments due | 8 | Today · region | assignments w/ due + submission state | absent |
| Your tutor | 6–7 | Subjects · **row** (2nd line of each subject row) | tutor–student assignment (Phase 6 roster RLS) | absent |
| Recordings | 8 | Library · region | attended/assigned recordings | absent |
| Resources | 8 | Library · region | tutor-shared files scoped to enrolment | absent |
| Progress | 5.6 / 9 | Progress · region, **prose** | measured observations (5.6 language) | absent |
| Achievements | 9 | Progress · region | owner decision — text records only | absent |
| AI assistance | 9 | Tools · region, one entry row | real assistant over own material | absent |

Regions in reading order: primary → Today → Subjects → Library → Progress → Tools. **Extension mechanism:** add one entry to `STUDENT_SLOT_COMPONENTS` (`load(ctx) → data | null`, `render(data)`); `resolveSlots` runs on the server with the RLS-bounded context; the shell file is never edited. Null = absent (no heading, no box); a region with no resolved slots is not in the DOM.

## 8. Slot extremes (dev fixtures, state C, 390; `audit/shell-shots/slots-{none,some,all}-390.png`)

| | regions rendered | slots | primary action bottom | doc height | h1 : next | primary buttons | h-scroll |
|---|---|---|---|---|---|---|---|
| zero | — | 0 | 413px | 844 | 35.8 : 16 | 1 | no |
| some | today, reflection (+2 row slots) | 4+2 | 413px | 1131 | 35.8 : 16 | 1 | no |
| all | today, library, reflection, tools (+2 row) | 10+2 | 413px | 1727 | 35.8 : 16 | 1 | no |

The primary surface is unaffected by any extreme; slots only lengthen the page below it. Fixture content is labelled "specimen … fixture, not data" and never reaches production (route 404s; nothing under `src/app/dev` is imported elsewhere).

## 9. Draft-subject decision

Enrolment is a stronger relationship than public availability. **Labelled, not locked:** rows and the primary surface show `Environment in draft` (text, mono eyebrow); links go to `/subjects/[id]` regardless. On the **production build**: enrolled student C → `/subjects/physics` **200** with the 3.6 draft banner; non-enrolled student A → **404**; signed-out → **404**. `/subjects/mathematics` (ready) → 200 for everyone. Implementation: `getEnrolledSubjectIds()` (anon client, RLS-bounded) consulted only when `prod && status==="draft"`; the environment's own nav marks the enrolled draft as available.

## 10. "Never contains" sweep

Written list: `NEVER_CONTAINS` in `src/app/dev/student-shell/fixtures.tsx` (rendered on the specimen). Harness boundary checklist, all **PASS**: no stat cards/metric grid · no streak/xp/badge/leaderboard/points · no notification affordance · no skeleton/shimmer · no greeting banner · one dominant surface · no invented activity · no dead nav · draft labelled-not-locked · no search. No `<img>`, `<canvas>`, `next/image` or illustration in shell source. One primary CTA per state; the only other interactive elements are nav items, subject rows and sign-out.

## 11. Other sweeps

**Dashboard semantics (source, comments included):** the only hits are the sentences *forbidding* them — `account-entry.tsx:8 "no notification affordance"`, `student-slots.ts:70 "A metric grid does not fit"`, `:73 "DOES NOT FIT AS BADGES/POINTS/STREAKS"`. Rendered strings: 0 hits in A/B/C.
**Skeleton sweep:** hits only in prohibition comments (`slots.tsx:15–16`, `layout.tsx:18`, `student-nav.ts:6`, `student-slots.ts:8`). Rendered: 0.
**Dead nav (with session, prod):** `/` 200 · `/student` 200 · `/subjects` 200 · `/student/account` 200 · `/subjects/physics` 200 · `/subjects/mathematics` 200 · forms: `POST /auth/signout` ×2 (desktop + sheet).
**Fabrication audit — every rendered string, all states:**
A: `What now · Choose a subject · Six environments are open. Choosing one is where this begins. · See the six subjects`
B: `First session · Physics — The Field · Environment in draft · You chose Physics yesterday. Your first session begins when you open it. · Open Physics · Your subjects · Physics · The Field · Not opened yet · Environment in draft · Mathematics · The Lattice · Not opened yet · [aria-label] Open Physics — The Field · [aria-label] Open Mathematics — The Lattice`
C: `Last opened yesterday · Physics — The Field · Environment in draft · You were last here yesterday. You have opened it 3 times. · Open Physics · Your subjects · Physics · The Field · Last opened yesterday · Environment in draft · Mathematics · The Lattice · Not opened yet · (same aria-labels)`
Nav (all): `Tutors Academy home · Overview · Subjects · Account · Switch to dark theme · Student {A|B|C} · Sign out · Open menu`
Every date/count traces to a row (`enrolled_at`, `last_entered_at`, `entry_count`); "Six" traces to `SUBJECTS.length`.
**Copy sweep:** 4.1 banned list, 4.7 cliché twelve, guilt/urgency/praise list → **0 hits** in all states.

## 12. Keyboard, screen reader, contrast, grayscale

**Keyboard (real Tab presses, 390, focus-visible ring on every stop):** Skip to content → Tutors Academy home → Switch to dark theme → Open menu → **Open Physics** (primary) → Open Physics — The Field → Open Mathematics — The Lattice. (A: … → See the six subjects.) Desktop adds Overview/Subjects/Account/Student N/Sign out before the primary. No traps, no dead stops; the menu sheet's trap is 2.6's and Esc-returns focus.
**Screen reader (Chrome accessibility tree via puppeteer, state C):** `main → region "Physics — The Field" → "LAST OPENED YESTERDAY" → heading h1 "Physics — The Field" → "ENVIRONMENT IN DRAFT" → "You were last here yesterday…" → link "Open Physics" → region "YOUR SUBJECTS" → heading h2 → link "Open Physics — The Field" → … → link "Open Mathematics — The Lattice"`. Next action announced first; rows are a labelled region (`aria-labelledby`) whose links name subject + environment. Nav `aria-label="Student"` (distinct from "Primary" and footer). Headings: one h1, h2 per region.
**Contrast (computed fg vs nearest opaque bg, every text element, both themes, all states):** worst pairings — mono eyebrows on raised surface **7.18** (dark) / **8.64** (light); button text on brass **7.60**; nav name **7.65 / 8.93**; body 15.2. All ≥ 4.5. No lightness changes needed. Observation: the Room's edge motif (low-alpha vector, 3.3) crosses the body line at 390; it is not a background under the contrast rule, but noted.
**Grayscale (`{A,B,C}-grayscale-390.png`):** states distinguishable by eyebrow text and h1 (never colour alone); subject identity survives via mark shape + name.

## 13. Performance — mid-range Android profile, WebGL absence

Lighthouse 12, **simulated Moto G Power-class: 4× CPU slowdown, slow-4G (150ms RTT, 1.6 Mbps)**, 390×844 @2×, production build, signed in (state C), full JSON in `audit/lighthouse-shell.json`:

| | |
|---|---|
| Performance / Accessibility | **95 / 100** |
| FCP · Speed Index | 1.4 s · 1.4 s |
| **LCP** | **2.8 s — element `<h1 id="student-primary-heading">`** (the primary answer is the LCP) |
| **CLS** | **0** |
| TBT · TTI | 110 ms · 2.8 s |
| Long tasks > 50 ms | 159 ms (Next shared chunk, hydration) · 78 ms unattributable · 59/59/54 ms document |
| Payload | 338 KB total, 183 KB script, 30 requests (with Lighthouse's cold cache); puppeteer cold load: 22 requests, 152 KB script, 278 KB total |
| WebGL / canvas | **0** requests matching webgl/lattice/ambient; **0** `<canvas>` |

Honest reading: LCP is bounded by the display font arriving after the shared JS on a 1.6 Mbps link; the shell itself adds no client JS (server component) — the 152 KB is the app shell + NavShell/ThemeToggle client code that every route already carries. Reducing it is a Phase-2 chrome matter, not a shell matter; reported, not touched.

## 14. Harness extension, 390 reference

`audit/shell.cjs` (new file; `audit/page.cjs` untouched) — reference viewport 390×844 mobile, real sign-ins, both themes, writes `audit/shell-baseline.json` and 34 screenshots. **42/42 gates PASS**: no-fake-signed-in · per state {hierarchy, fold, no-empty-slots, sweeps, links, no-hscroll, touch, zoom-spacing, keyboard, contrast, nojs, axe, webgl-absent} · slot-extremes · perf-mid-range. `--check` diffs strings, hierarchy ratio and script bytes (±2 KB) against the pinned baseline.
**4.9 harness after this step:** `audit/page.cjs --check` → all 8 gates PASS, **"no diffs vs baseline"** (homepage untouched; NavShell change added no bytes to the homepage chunk).

Other required results (all from the baseline): viewports 320/390/768/1280/1920 — no horizontal scroll, primary width 272/342/704/1024/992 · zoom 200 % (640 css-px) and 400 % (320 css-px) — no overflow, 0 clipped elements, h1 and action visible · text spacing (1.4.12 CSS) — no overflow, 0 clipped, action at 431–493px · touch at 320: `Open Physics 192×48`, rows `272×90 / 272×71`, theme/menu `44×44`, **min gap 8 px** (rows separated by 4+1+4 px) · reduced motion: 0 animated elements, 0 reveals · no-JS: correct `data-state`, h1, action, rows and sign-out form present in server HTML for all three · axe: **0 violations** on `/student` ×3 (35–37 passes each) and on `/dev/student-shell` (iframes excluded).

## 15. Does not fit without restructuring — reported now

1. **Achievements as badges/points/streaks** — banned by Part 4; the slot is reserved only as dated text in Progress. If Phase 9 wants gamification the *decision* must be reopened, not the layout.
2. **A floating AI chat widget** — does not fit; AI gets one entry row in Tools linking to its own surface.
3. **A progress metric grid** — does not fit; Progress is prose (5.6 decides).
4. **Rungs 1–3 (class now / imminent / work due)** fit inside the primary surface by changing its copy and target (5.4) — but if 5.4 wants *two* simultaneous answers (a live class *and* a resume), the "one answer" rule forces a choice, not a second surface. Flagging so 5.4 designs the precedence, not a split.
5. **Homepage chunk weight (152 KB script)** on a mid-range phone is the real LCP ceiling; a shell-only route cannot fix it.

## 16. Could not implement

- **Enrolment from State A.** The "choice" at `/subjects` does not yet write an `enrolments` row — no UI writes enrolments (5.1 §7 left this to 5.3/5.5; it is the environment-scoped workspace's entry write, **5.5**). State A's copy promises only that the environments are open, which is true. Until 5.5, B/C are reachable only via test accounts. Recorded in DEC-003.
- **2.6 nav brand link is 28×28** (< 44) on every route — pre-existing, certified structure; reported, not changed (`touch.inheritedSmall` in the baseline).
- **Real-device measurement.** Lighthouse simulation of a Moto G Power-class device is the best this environment offers; no physical Android was available.

## 17. Deferred, nothing half-built

Deferred whole: 5.4 next-action engine (rungs 1–3), 5.5 workspace + `recordEnvironmentEntry` wiring + enrolment write, 5.6 progress language, every slot (registry empty), tutor/admin experiences. Nothing partially rendered: no slot, region, nav item or control exists for anything unbuilt. `src/config/modules.ts` untouched (`student-portal` remains `planned`; the shell renders none of that module's promised schedule/work/progress).

## 18. What outside the shell changed — declared

1. `src/app/subjects/[subject]/page.tsx` — draft guard admits an enrolled identity (§9). Required by this brief's own decision; 3 lines + 1 import; visitors unchanged.
2. `src/components/layout/nav-shell.tsx` — `account?: ReactNode` prop; structure, modes, motion, sheet, trap untouched. Without it the Room-mode header would say "Sign in" to a signed-in student — a lie.
3. `src/app/(portal)/{tutor,admin}/layout.tsx` — `requireIdentity(role)`; a student hitting `/tutor` landed on the tutor placeholder in Test 1 step 4. Now → `/student` (verified prod: A and C → `/student`). This implements 5.1's matrix; it builds nothing of Phase 6.
4. `package-lock.json` — §0.
Untouched: tokens, type, motion, spatial, density, primitives, brand, subject system, scenes, footer, homepage, 4.9 baseline (re-checked: no diffs), 5.1 data model/roles/RLS/auth code/contract, `/subjects` scaffold, `modules.ts`, all other `/dev/*` routes, `.env.example`.

## 19. Test list cross-reference

1 ✔ §0 · 2 ✔ §5 shots · 3 ✔ §5 · 4 ✔ §4 · 5 ✔ §5 (doc height 844, nothing below fold) · 6 ✔ §8 · 7 ✔ `slotRegions 0 · slots 0 · emptySections 0 · emptyBoxes 0` all states · 8–9 ✔ §11 · 10 ✔ §11 · 11 ✔ §6 · 12 ✔ §9 · 13 ✔ §3 · 14 ✔ §11 · 15 ✔ §11 · 16–19 ✔ §12 · 20–24 ✔ §14 · 25–26 ✔ §13 · 27 ✔ §14 · 28 ✔ §14 · 29 ✔ build exit 0, `/dev/student-shell` and `/frame` **404** in prod, signed-out gets 307/404 everywhere protected, no fixture reachable · 30 → turn message (porcelain after commit).

**STOP.** 5.4 not begun.
