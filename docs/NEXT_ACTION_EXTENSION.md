# The next-action engine — extension contract (Phase 5 · Step 4)

The student shell's dominant surface answers WHAT NOW with **exactly one** action. That answer comes from `src/lib/next-action`: providers emit candidates, the pure resolver ranks them by **declared tier**, then by the locked within-tier rules, and returns one. **Phase 7 adds a candidate, not a screen.**

## What a phase contributes

| Phase | Provider (source) | Tier | Kind | Data it needs (real rows) | Gated by `src/config/modules` id | Must not |
|---|---|---|---|---|---|---|
| **P6** (tutors / rosters) | none to the primary answer. Tutor presence is a **row slot** (`tutor-presence`, 5.3 slot map), not a candidate. | — | — | tutor–student assignment per subject | `tutor-portal` | Emit "your tutor is waiting" or any candidate: a tutor's existence is not an action the student takes. |
| **P7** (live classes) | `class` | **1** while inside the window (`TIER_1_WINDOW_BEFORE_START_MINUTES` before start → class end, `expiresAt` = class end); **2** for the next scheduled class beyond the window (`at` = start) | `join` (Tier 1) · `attend` (Tier 2) | a sessions table with scheduled rows this student is on the roster for, in their timezone | `live-classroom` | Emit Tier 1 without `expiresAt` (rejected, not demoted). Widen the window without a ruling. Emit for a class the student is not rostered on. Write "starts in 20 minutes" from anything but `expiresAt`/`at`. |
| **P8** (recordings, resources, assignments) | `recording` — a session the student attended that **just finished** (`at` = end time) · `assignment` — work with a real due date (`at` = due) | **2** | `attend` | recorded sessions attended/assigned; assignments with due dates and submission state | `recorded-classes` · `assignments` | Emit a candidate for overdue work in guilt language; emit "3 assignments due" (a count); emit one candidate per assignment hoping to flood the ranking — one provider, its own best candidate per subject at most. |
| **P9** (progress language, AI assistance) | `assistant` may add a **source** at Tier 3 only when it has a durable, resolvable destination the student owns | **3** | `resume` | a real assistant surface scoped to the student's own material | `ai-assistant` | Reorder tiers. Rank with a model. Make the answer unexplainable — every candidate must carry a sort key the dev route can show. Personalise copy. Progress (5.6) contributes **no candidate**: it is reflection, not instruction. |

Each row's provider signs the contract at the top of `src/lib/next-action/providers.ts` (MUST / NEVER / PASS) and registers in `PROVIDERS`. A provider whose module is not `live` returns nothing — the same registry that labels the homepage "not built yet" gates the student's instructions.

## What a future phase CANNOT change without a ruling

1. **The tier order.** 1 NOW (expiry) · 2 SOON (real timestamp) · 3 WHENEVER (durable) · 4 ORIGIN (the choice). Urgency means expiry and nothing else.
2. **The one-answer rule.** `resolveNextAction` returns one `Candidate` or null. There is no `resolveNextActions`. Showing three things is a composition decision made in a design step, not a signature change.
3. **The within-Tier-3 order.** Entered beats never-entered · most recent `lastEnteredAt` · earliest `enrolledAt` · config order.
4. **The surface composition.** Size, position, hierarchy, spacing, DOM order of the primary surface, the 2.24 h1 ratio, one primary per view, the fold gate. The engine changes what it *says*.
5. **The allowed treatments.** `TREATMENT` maps every kind to a treatment that already exists in 2.5's primitives (today: all → `primary-button`). A new kind with a new look is a design step.
6. **The honesty rules.** No counts, percentages, scores, streaks, XP, levels, badges; time language only from a real timestamp; detail from populated fields only; no guilt or urgency theatre; no personalisation or AI ranking.
7. **Purity.** No clock, database or `process.env` inside the resolver or a provider. The caller passes rows and `now`.
8. **The Tier 1 window constant** (`TIER_1_WINDOW_BEFORE_START_MINUTES = 60`) — P7 may propose a value; it changes by ruling.

## What is real today

Tier 3 (`enrolment` provider: resume / begin) and Tier 4 (`origin` provider: choose), both gated by `public-website` (the only live module — it owns `/subjects/*`). Tier 1 and Tier 2 exist as types, ordering rules and tests with fixtures on `/dev/next-action`. No shipped provider can emit them.
