# Phase 5 · Step 4 — The Next-Action Engine

**Order:** 5.4 executed FIRST, on its own, per the 5.5 precondition. 5.5 not begun. P5-R2 Fix 1 (count off-screen) was already closed at `2104175`.

## 1. Files
**Created:** `src/lib/next-action/{resolver,providers,when,index}.ts` · `src/app/dev/next-action/{page,fixtures}.tsx|ts` + `frame/page.tsx` · `docs/NEXT_ACTION_EXTENSION.md` · `scripts/test-next-action.mjs` · `scripts/ts-loader.mjs` (resolve hook so Node 22 runs the pure TS modules — no dependency added).
**Modified:** `src/components/student/student-shell.tsx` (data binding only: renders a `Candidate`; date helpers moved out, `whenPhrase` re-exported) · `src/lib/student/data.ts` (runs the engine once per request; `providerInputFor`) · `src/lib/student/contract.ts` (comment; `deriveNextAction` kept as the benign-fallback shape) · `src/app/(portal)/student/page.tsx` (`candidate=` prop) · `src/app/dev/student-shell/fixtures.tsx` (uses the engine) · `docs/DECISIONS.md` (DEC-006) · `audit/shell-baseline.json`, `audit/lighthouse-shell.json` (re-pinned, actual-vs-actual).
**Untouched:** `src/config/modules.ts`, schema, policies, tokens, primitives, nav, subject system, scenes, harness gates.

## 2. Brief vs 5.1's priority order
5.1: six rungs (1 class now · 2 class within the hour · 3 work due · 4 resume · 5 begin · 6 choose). Brief: four tiers. They are the same order at different grain: rungs 1–2 → Tier 1 (the 60-min window covers "within the hour"), rung 3 → Tier 2, rungs 4–5 → Tier 3 with entered-beats-never-entered, rung 6 → Tier 4. **Built 5.1's order** expressed as the brief's tiers; the mapping is in the resolver header. One interpretation recorded (DEC-006): "Tier 3 requires lastEnteredAt" cannot apply literally to `begin`; Tier 3 requires a durable, resolvable destination and uses `lastEnteredAt`/`enrolledAt` as sort keys, absent → sorts last, malformed → rejected.

## 3. Resolver public API (verbatim)
```ts
export function resolveNextAction(state: ResolverState, candidates: readonly Candidate[], nowIso: string): Candidate | null
export function explainResolution(state: ResolverState, candidates: readonly Candidate[], nowIso: string): Resolution  // { winner, considered: {candidate, verdict}[] }
export function judge(c: Candidate, state: ResolverState, nowIso: string): Verdict  // {accepted:true,sortKey} | {accepted:false,reason}
export const TIER_1_WINDOW_BEFORE_START_MINUTES = 60;   // P7's to tune, by ruling
export const TREATMENT: Record<CandidateKind, Treatment>; // all kinds → "primary-button"
type Candidate = { id; source; tier: 1|2|3|4; kind: 'join'|'attend'|'begin'|'resume'|'choose'; capability; subjectId?; eyebrow; title; detail?; cta; href; expiresAt?; at?; lastEnteredAt?; enrolledAt? }
type ResolverState = { subjectOrder: string[]; liveCapabilities: string[]; resolvesToday: (href) => boolean }
```
Composition root: `nextActionFor(input, providers = PROVIDERS): { action, resolution, failedProviders, fellBack }` — never throws; falls back to `benignAction(input)` (most recent environment, else the choice).

## 4. Provider contract (verbatim — header of `providers.ts`)
MUST: consult `src/config/modules` via `isLive()` first and return `[]` unless live · emit only hrefs that resolve for THIS student TODAY · declare its tier (T1 needs `expiresAt`, T2 `at`, T3 `lastEnteredAt`/`enrolledAt`) · derive `detail` from populated fields only · use a `kind` with an existing treatment · be deterministic.
NEVER: read clock/db/cookies/env · compute a tier from importance, interest, score or model · render counts/percentages/scores/streaks/levels/XP/badges, clock sentences without a timestamp, guilt, personalisation or AI ranking · emit more than the resolver can rank or pre-pick with a fake tier · throw for missing data.
PASS: `judge()` for every kind it emits (tests) · href 200 for its student, 404/redirect otherwise · report-only + 4.1/4.7 copy sweeps · shell harness unchanged (ratio, one primary, fold).

## 5. Extension contract — `docs/NEXT_ACTION_EXTENSION.md`
P6 contributes **no candidate** (tutor presence is a row slot). P7 `class`: Tier 1 `join` inside the window (`expiresAt` = class end), Tier 2 `attend` for the next class; gated `live-classroom`. P8 `recording` (just finished, `at`) and `assignment` (due, `at`): Tier 2 `attend`; gated `recorded-classes` / `assignments`. P9 `assistant`: Tier 3 `resume` only, gated `ai-assistant`; progress (5.6) contributes nothing. **None may change without a ruling:** tier order · one-answer rule · within-Tier-3 order · surface composition/ratio/fold · allowed treatments · honesty rules · purity · the window constant.

## 6. State matrix (fixtures, clock 2026-09-28T09:00Z; `/dev/next-action` shows every verdict)
| row | winner | accepted, in order (sort key) |
|---|---|---|
| no enrolment | `origin:choose` | `4:99` |
| one never-entered (physics) | `enrolment:physics:begin` | `3:never-entered:001790499600000:01` · origin |
| one entered yesterday | `enrolment:physics:resume` | `3:entered:008209845999999:01` · origin |
| four mixed (chemistry enrolled earliest, never entered; mathematics entered 2 d, physics 5 d) | **`enrolment:mathematics:resume`** | `mathematics:resume 3:entered:008209586799999:00` · `physics:resume 3:entered:008209845999999:01` · `chemistry:begin 3:never-entered:001787994000000:02` · `biology:begin 3:never-entered:001790413200000:03` · `origin 4:99` |
| four entered (biology today) | `enrolment:biology:resume` | biology · chemistry · mathematics · physics · origin |
| draft subject (history), never entered | `enrolment:history:begin` | history · origin |
| tie (identical enrolledAt) | `enrolment:mathematics:begin` | config order: mathematics(00) before physics(01) |
| entered row, last_entered_at null | `enrolment:physics:resume` — eyebrow "Last opened", **no detail** | `3:never-entered:…MAX:01` |

## 7. Tier-ordering proof (capabilities pretended live, Test 8)
`class:physics:join 1:001790588400000:01` (expiresAt +40 min) **wins** over `recording:physics:attend 2:001790584200000:01` over `enrolment:physics:resume 3:entered:…`. Remove the expiry: `{"accepted":false,"reason":"Tier 1 requires expiresAt (no expiry, no Tier 1) — rejected, not demoted"}` → winner `enrolment:physics:resume`. Expired T1 (−10 min): rejected `expired at …`; +40 min: accepted.
**Capability gate (Test 11, real registry):** `{"accepted":false,"reason":"capability \"assignments\" is not live in src/config/modules"}`; the live-window T1 fixture is likewise rejected (`live-classroom` planned).
**Test 9:** `grep tier: providers.ts` → `3, 3, 4`. No shipped provider can emit Tier 1 or 2.

## 8. Deliberate breakage (all on the one-entered row)
(a) provider throws → `failedProviders=[broken-throws]`, surface `enrolment:physics:resume` · (b) 404 href → `href /subjects/does-not-exist does not resolve for this student today`, surface resume · (c) malformed date → `lastEnteredAt "31/02/2026" is not a valid ISO timestamp`, surface resume · (d) only a throwing provider → `fellBack=true`, `fallback:physics:resume` «Last opened · Physics — The Field · Open Physics»; with no enrolment → `fallback:choose`. No blank, no error in any case.

## 9. Surface untouched
`audit/shell.cjs --check` against the P5-R3 baseline: **no diffs** (strings, box model, hierarchy, fold). Re-pinned: 43/43 gates; h1/runner-up ratio **2.24** in A/B/C; 1 primary button, 1 h1 each; fold (action bottom px, 320/360/390/1280/200 %/text-spacing): A 326/328/293/326/303/383 · B 433/436/413/383/361/493 · C 384/386/388/383/361/445 — identical to P5-R3.

## 10. Every shipped string the engine can produce
Eyebrow: `What now` · `First session` · `Last opened` · `Last opened {today|yesterday|N days ago|on D Mon YYYY}`. Title: `Choose a subject` · `{Subject} — {Environment}` (six config pairs). Detail: `Choosing is where this begins.` · `Your first session begins when you open it.` · `You chose {Subject} {when}. Your first session begins when you open it.` · `You were last here {when}.` · (absent when no timestamp). CTA: `See the six subjects` · `Open {Subject}`. Production today (no-JS fetch, prod): A «What now · Choose a subject · Choosing is where this begins. · See the six subjects → /subjects»; B «First session · Physics — The Field · Environment in draft · You chose Physics yesterday. Your first session begins when you open it. · Open Physics → /subjects/physics»; C «Last opened yesterday · Physics — The Field · Environment in draft · You were last here yesterday. · Open Physics». ("Environment in draft" is the shell's label from subject status, not an engine string.)

## 11. Sweeps
**Report-only (Test 18):** the only digits are inside recency phrases from a real timestamp (`N days ago`, `on 29 Aug 2026`) — justified: a date, not a count; `%`, `count`, `streak`, `minute`, `times`, `visit`: none. **Copy (Test 19):** no 4.1 banned / 4.7 cliché hits in engine strings (grep of unlock/journey/seamless/empower/hurry/don't miss/welcome back/streak/level up/… → only contract comments). **Exactly-one (Test 3):** grep `resolveNextActions|nextActions` in `src` → only the comment forbidding it. **Href (Test 12, prod):** A → `/subjects` 200 (304 on revisit), `/subjects/physics` 404, `/subjects/mathematics` 200; B/C → `/subjects/physics` 200 (draft, enrolled), `/subjects/chemistry` 404 (not enrolled); D (4 enrolments) → chemistry 200. Every emitted href returned 200 for its student; no 404 emitted.

## 12. Determinism, accessibility, performance, JS
**Purity (Test 1):** modules import only each other and `config/modules`/`contract` types; no `Date.now`, `new Date()`, `process.env`, supabase — asserted with comments stripped. **Restart (Test 2):** A/B/C/D strings + hrefs captured, prod restarted, recaptured → `IDENTICAL-ACROSS-RESTART`. **Null-safety (Test 13):** all optionals null → «Last opened · Physics — The Field · (no detail) · Open Physics»; no placeholder. **Server-rendered (Test 16):** strings above were read with JavaScript disabled; harness no-JS shots `audit/shell-shots/{A,B,C}-nojs-390.png`. **axe (Test 20):** axe-A/B/C PASS at 390; contrast gates PASS both themes; one h1, one accessible name on the action. **Resolution cost (Test 21):** 11.1 µs per resolve (five candidates, 20 000 runs). **Signed-in TTFB `/student`:** before (f813d98 build) median 428 ms, after 404 ms — unchanged; it is the auth round trip (Phase 10 item). **Lighthouse LCP (mid-range profile, /student as C):** bimodal on the SAME build — 2.1/2.2 s in 3 of 9 runs, 2.9/3.0 s in 6; old build measured 2.1 s in its one run this session; P5-R2 brief figure 2.8 s. FCP 1.4–1.5 s, CLS 0 throughout. The engine cannot be the cause (11 µs, TTFB equal, HTML strings identical, `scriptKB` 183 → 183); the bimodality is Lighthouse's simulated LCP choosing between two candidate paints. Reported, not tuned. **JS payload (Test 17):** 183 KB before, 183 KB after — nothing client-side was added (`"use client"` absent from the engine and the shell).

## 13. Real vs fixture
Real: resolver, contract, enrolment provider (Tier 3 resume/begin from real rows), origin provider (Tier 4), the binding, `/student` in production for four test accounts. Fixture only (`/dev/next-action`, 404 in prod — verified): every Tier 1/2 candidate, the breakage providers, the "pretend live" registry.

## 14. Not implemented / deferred
Tier 1/2 providers (no data; by design). No enrol button; State A still ends at `/subjects` (5.5). Nothing half-built: no provider, slot, control or string exists for a capability the registry calls planned.

## 15. Scope confirmation
Changed: the engine (new), the primary surface's data binding, the dev route, docs, tests, re-pinned baseline. Not changed: 5.3's three states' composition, slot map, IA, nav, ratio; 5.1's model/roles/policies; module registry entries; subject system; brand frame; scenes; build/deploy.

**Production build:** succeeds; `/dev/next-action` → 404 in prod, 200 in dev; `.env.local` untouched, nothing secret printed.

STOP. 5.5 not begun (awaiting P5-R4 text).
