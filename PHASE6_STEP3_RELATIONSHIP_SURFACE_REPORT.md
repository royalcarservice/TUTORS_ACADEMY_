# Phase 6 · Step 3 — THE RELATIONSHIP'S SURFACE · report

Date 2026-10-02 · base `15da5a5` (6.2) · production build of this tree on :3100 · all harnesses run on it.

## 1 · What exists now
One relationship → one addressable page: **`/tutor/[subject]/[relationship]`**, reached only from the shell's row, which became ONE link (6.2 Test 18 closed). Reading order as built, top to bottom at 390: **WHO** — the display name, the one h1 · **WHICH** — the subject's mark, name, environment name and "Environment in draft" where the config says so, inside the subject's Room · **WHERE** — the arc, seven steps from `ARC_STEPS` via `arcPosition`, the dominant element (133 433 px² vs h1 9 225 vs statement 21 546) · **THE RECORD** — nothing (no heading, no box, no container) · **STATEMENTS** — the empty-record boundary (`ARC_COPY.boundary`, one constant) and one sentence on what a tutor does here (one constant) · **THE WAY BACK** — one underlined link, 234×48. Controls in `<main>`: 1 link, 0 buttons, 0 forms, 0 inputs, 0 disabled.

Files: `src/lib/tutor/relationship.ts` (reader) · `src/app/(portal)/tutor/[subject]/[relationship]/page.tsx` (route, `force-dynamic`, one `cache()`d load shared by metadata and page, every miss → `notFound()`) · `src/components/tutor/relationship-surface.tsx` · `src/components/tutor/record.tsx` · `src/components/tutor/tutor-shell.tsx` (row → `<Link>`) · `src/lib/tutor/data.ts` (`relationshipId` on the row, select `id, student_id, subject_id`) · `src/components/student/arc-region.tsx` (additive optional `label` prop; student default byte-unchanged) · `audit/relationship.cjs` + `relationship-baseline.json` + `relationship-shots/` · `audit/attacks.cjs` + `attacks/relationship-attack-{3,4,5}.ts` · `src/app/dev/relationship-surface/*` · docs (DEC-016, E-25/E-26 closed, PHASE_TRACKER +4, TUTOR_VISIBILITY §6.3).

## 2 · Part 0 close-outs
**0a · P6-R7 attacks as permanent gates.** `audit/attacks.cjs`: each attack file declares `EXPECT TSxxxx`; the gate runs tsc on all of them and FAILS if a file compiles or fails with a different code. Current: attack-1 TS2554 · attack-2 TS2353×2 · attack-3 TS2353 (`studentId` not in `RelationshipAddress`) · attack-4 TS2345 + TS2322 (missing `subjectId`; `"all"` not a `SubjectId`) · attack-5 TS2353 (`lastEnteredAt` not in `RelationshipView`). `5 attack files · 0 failure(s)`. **Proof it fails loudly** — with `getTutorContext(_studentId?: string)` temporarily added:
```
FAIL attacks with @ts-expect-error in place compile clean
audit/attacks/tutor-shell-attack-1.ts(6,1): error TS2578: Unused '@ts-expect-error' directive.
FAIL tutor-shell-attack-1.ts: expected TS2554 · got COMPILES
5 attack files · 2 failure(s)   exit=1
```
Reverted; `git diff src/lib/tutor/data.ts` is only the `relationshipId` change. **The pattern, named: signature · policy · route** — compile attacks pin what a reader *can be asked*; RLS tests pin what the database *will answer*; the identity matrix pins what each reader class *receives at every URL*. Each layer fails on its own. Every new read path gets all three (this step: attacks 3–5, the 6.1 policies re-run, +5 matrix rows).

**0b · E-25 / P6-R8.** `tests` and `payments` appear in no phase P1–P10 → both entries **deleted** from `src/config/modules.ts` (no consumer referenced either id; `grep '"tests"\|"payments"' src` → 0; homepage rendered strings 141 → 141, byte-equal). Header comment rewritten: the registry answers "is this built?" and "what does this surface depend on?" — not a roadmap. Money sweep over every string class (summary · blurb · description · module names · alt text · page metadata · email templates — none exist · dev never-lists): zero hits outside comments and the dev pages' own refusal lists. **Fixed a real one:** `siteConfig.description` — the `og:description`/`twitter:description`/`<meta description>` on every page — read *"Tutors Academy is a single learning platform for students, tutors and administrators — live classrooms, recorded lessons, assignments, assessments and an AI learning assistant in one place."* (audience: every crawler and share card; none of it exists). Now: *"A tutoring academy built one subject environment at a time: six subjects, each with its own room, and a tutor who has a place in it."* This changed the visitor DOM hash of `/subjects/*` — environment baseline re-pinned with the reason and a proof (substituting the old string back reproduces the old hashes `f54e59aca033900c` / `8c2618771284e56e` exactly). **Left, USER item:** `siteConfig.tagline` "Live tutoring, built for real learning outcomes." (brand frame; on the auth layout). **USER item:** does the academy handle money in-product at all? Until ruled, no money word anywhere; recorded in refusals.

**0c · E-26.** Scene 5's sentence, verbatim: **`{STATUS_LABEL[status]} — the tutor's side of the environment.`** Its label reads registry entry **`tutor-portal`** (`statusFor(modules, ["tutor-portal"])`). The sentence asserts the tutor's *capabilities inside the room* (the five levers), not the relationship → **label unchanged, no homepage string moved, no exception declared, no status flipped.** `tutor-portal` stays `planned`.

## 3 · Route and reader (Part 2)
`getRelationshipView({ subjectId, relationshipId })` → `RelationshipView | null`. Non-uuid id → `null` before any query. One query on `relationships` (`id = :relationship AND subject_id = :subject AND state = 'active'`; `tutor_id = auth.uid()` is RLS, not an app filter), then `profiles.display_name`, `enrolments` (active), `environment_state.first_entered_at` ONLY. Driver error → `DataReadError` (P5-R9). Resolved from session + URL; a student id is unrepresentable in the address (attack-3). Cross-subject unrepresentable: the subject is a URL segment and a query filter (matrix row "wrong subject" → 404). No second read path; no schema change; no access-log row (ruling pending — **USER item**).

## 4 · The absence rule (P6-R9) — the byte proof
All of these, as tutor T on the production build, give **status 404** and **one canonical document** (`9323089fc745fa88`):

| case | status | raw bytes | canonical sha | raw sha |
| --- | --- | --- | --- | --- |
| never-related (student B's would-be id slot: another tutor's / nobody's relationship — student B has none, so a fresh uuid in B's place) | 404 | 17291 | `9323089fc745fa88` | `60d2c434a68cacd6` |
| ended (student-d physics, ended) | 404 | 17291 | `9323089fc745fa88` | `cb7e3ca21c6dfeab` |
| nonexistent (random uuid) | 404 | 17291 | `9323089fc745fa88` | `c4179669461804b9` |
| probe: student B's user id in the slot | 404 | 17291 | `9323089fc745fa88` | `8bf9c006d32f4b3c` |
| probe: related student-c's user id in the slot | 404 | 17291 | `9323089fc745fa88` | `da023e4b1985e9dc` |
| probe: garbage | 404 | 17239 | `9323089fc745fa88` | `34077c9a9c5c4c29` |
| cross-subject: student-c's physics relationship under /history | 404 | 17291 | `9323089fc745fa88` | `838cdf9b6490bc7d` |
| cross-subject: student-c's physics relationship under /mathematics | 404 | 17299 | `9323089fc745fa88` | `ebcfb9bf42762ea4` |
| ended other subject (student-c mathematics, ended) | 404 | 17299 | `9323089fc745fa88` | `286c75e1cb7d5912` |
| unknown subject segment | 404 | 17283 | `9323089fc745fa88` | `942df76a99036ff6` |
| tutor U opens tutor T's relationship | 404 | 17291 | `2d0eaf2e3c1e6a57` | `—` |

**Why "canonical" and not raw:** the same URL fetched four times gave raw shas `c4179669461804b9, d7f81bb3a1448444` and canonical sha `9323089fc745fa88`. Two things vary that carry no information about the student: the echoed route params (Next writes segments and params into the flight payload) and the React Flight streaming order/row numbering (layout and page render in parallel; the 404 digest row lands before or after the layout rows at random). `canonical()` tokenises the params, keeps the HTML outside the flight scripts byte-for-byte, and compares flight rows as a sorted multiset with ids renumbered. Everything else is exact. Recorded in PHASE_TRACKER so nobody claims raw byte identity for a streamed 404. One code path: `null` → `notFound()`; there is no second branch. Tutor U at tutor T's URL → the same document (after tokenising the viewer's own nav name).

## 5 · Statements identical across students (Test 11)
| student | boundary sha | tutor-statement sha | arc (d=done a=ahead) |
| --- | --- | --- | --- |
| student-c | `98e5b644d3d2009c` | `b278d1234de58868` | d d d a a a a |
| student-a | `98e5b644d3d2009c` | `b278d1234de58868` | d a a a a a a |
| student-d | `98e5b644d3d2009c` | `b278d1234de58868` | d d d a a a a |

Arc positions differ (student-a never enrolled; c and d entered); both statements are the same bytes. Structural: nothing about the student reaches either string.

**Copy candidates considered → chosen (subject rule: product/environment as subject, never the student):**
- Empty record: (a) "Nothing is recorded here yet. …" (= `ARC_COPY.boundary`, reused — one constant, certified 5.6) ✔ · (b) "The record for this environment is empty." · (c) "No learning event exists in this environment." — (a) chosen: reuse over a second sentence.
- Arc heading / scene line: (a) **"Where the learning is"** ✔ · (b) "Position in {Subject}" · (c) "The arc, as the record has it". List accessible name: "Where the learning is in Physics".
- What a tutor can do: (a) **"This page reads the record and changes nothing. Nothing here is done by a tutor yet: teaching surfaces are not built."** ✔ · (b) "Nothing on this page acts on the student. Teaching surfaces arrive in later phases." · (c) "This page is a reading, not a tool."
- Way back: (a) **"Back to the students placed with you"** ✔ (matches the shell's h2) · (b) "Back to your students" (rejected: possessive) · (c) "The students placed with you".
- **Whose journey?** No possessive word needed: the h1 names the student directly above, and the arc's subject is *the learning*. One caveat, reported not changed: step labels are the shared definition's and one says "Watch **your** record grow" — "your" is the student's in Scene 7 and on the student's region; here a tutor reads it. Changing it would need a second label set (a second arc definition) — refused; flagged for the owner.

## 6 · Row → link (Part 4)
Before (6.2 pin): `<li data-relationship-row><span>Student C</span><span>Physics</span></li>` — `links: 0`, cursor default, no hover/focus style (no false affordance existed). After: `<li data-relationship-row><a aria-label="Student C — Physics" href="/tutor/physics/97b2…"><span>Student C</span><span>Physics</span></a></li>` — one link per row, name "Student — Subject", 16px/500 as before, height 50 (≥44), `text-decoration: none`, cursor pointer, equal weight across rows. The shell's own gate now asserts "the only links inside the shell are the rows themselves".

## 7 · Harness results (production build)
- `audit/relationship.cjs --write` → **32/32**:
- PASS — fixture: ≥3 active relationships in one subject for tutor T, ≥1 ended
- PASS — Test 16: every row is ONE link named with student and subject, ≥44 px, no underline, same type as before (16px/500)
- PASS — shell: the row links are exactly the active relationships (none ended, none of another tutor's)
- PASS — Test 5: the row resolves to the surface for the related tutor (200)
- PASS — Test 17: one h1 = the display name; the arc is the largest element by area; the h1 the largest type
- PASS — Test 18: no action — controls in main = one link back (no button, form, input, disabled)
- PASS — reading order: header(who+which) → arc region → tutor statement → back; record region absent
- PASS — Test 24: record region renders NO DOM and no empty container
- PASS — Test 19: not a profile / dashboard — no img, table, tabs, details, progress, canvas, <time>, numerals; no profile words
- PASS — Test 13: no recency — surface text, title, metadata, aria labels
- PASS — Test 14: no zero / none / not started / never for an empty record
- PASS — Test 20: no export — print/download/export/share/csv/copy in HTML (incl. styles) 
- PASS — Test 22: no observation — analytics/beacon/telemetry in HTML
- PASS — Test 10: PII floor — no email, no uuid, no 'test', no role, no timestamp in the surface HTML (display name only)
- PASS — Test 21: no second student — no other related student's name on the page, no link to another surface
- PASS — subject rule / banned words: no sentence with the student as grammatical subject, no apology
- PASS — fold at 390: h1, subject identity, arc heading and first arc step inside 844; no h-scroll
- PASS — targets ≥44×44
- PASS — Test 11: the empty-record statement and the tutor statement are byte-identical across all students (while their arc positions differ)
- PASS — Test 15: the arc's three consumers read one definition at runtime (seven ids+labels, same order): Scene 7 · student region · tutor surface
- PASS — student-c's own arc states == the tutor's view of student-c (same facts, same function)
- PASS — Test 7/8/9: never-related · ended · nonexistent · probes · cross-subject · unknown subject → ONE status (404) and ONE body (canonical bytes identical: echoed params tokenised, flight stream order-normalised)
- PASS — same url ×4: raw bytes vary (stream race) while the canonical form is one value — the raw variation is not a signal
- PASS — tutor U (unrelated) at tutor T's relationship URL → the same 404 document as tutor T's nonexistent case (viewer's own nav name tokenised)
- PASS — no horizontal scroll at 320/360/390 both themes
- PASS — 1.4.12 text spacing: no h-scroll, nothing clipped
- PASS — 400% zoom equivalent (320 wide): no h-scroll
- PASS — keyboard: the back link is reachable by Tab; nothing in the arc takes focus
- PASS — axe clean both themes, contrast measured
- PASS — no-JS complete: identical main text without JavaScript
- PASS — perf: LCP median < 4 s on the emulated profile (n=5), no canvas/WebGL
- PASS — payload: surface script bytes ≤ the tutor shell + 2 KB (no client JS added)
- `audit/identity-matrix.cjs`: coverage gate **FAILED first** ("missing rows: /tutor/mathematics/97b2…, /tutor/physics/01a2…, …" — 5 instantiations of the new route; P6-R6 proof, log kept) → `--write` → 30 new cells: visitor/expired → 307 login?next=…; studentA/studentB → 307 /student; tutorU → 404 ×5; **tutorT → 200 `relationship-surface` on the active row only**, 404 on ended / nonexistent / wrong-subject / user-id-in-slot. `--check` clean.
- `audit/tutor.cjs --check` → 36/36; baseline re-pinned (B strings grew by two rows — fixture now 3 students; rows are links). `audit/attacks.cjs` 5/5. `scripts/test-rls.sh` 56 ok. `scripts/test-tutor-visibility.mjs` **17/17** after extending the expectations from the 6.1 literal "exactly one" to the truth set (service role, read-only) — the policy assertions are unchanged, the fixture is bigger. `audit/shell.cjs` 57/57 · `audit/states.cjs` 45/45 (one axe crash on first run under load; clean re-run) · `audit/environment.cjs` 23/23 after the declared re-pin · `audit/gate.cjs` **11/11** alone (490 KB vs 493 pinned; a first run concurrent with other harnesses read 535 KB — contention, not payload: no client JS was added).

## 8 · Perception, a11y, performance
Screenshots `audit/relationship-shots/`: dark+light × 390/360/320/1280, grayscale, reduced motion, no-JS, text-spacing. No horizontal scroll at any width/theme; 1.4.12 text spacing: 0 clipped; 320 (400 % equiv.) no h-scroll. axe (wcag2a/aa/21aa) **0 violations both themes**, contrast measured on 11 nodes, worst **16.26:1 dark / 15.7:1 light**. Targets ≥44×44 (skip link is visually hidden 1×1, not a pointer target). Tab order: skip → home → theme → menu → back link; nothing in the arc takes focus. No-JS: identical main text. Fold at 390: h1 148, subject identity 212, arc heading 286, first step 329, last step 584, boundary 684, statement 779, back 859 (viewport 844 — the back link is the only thing below the fold).
Performance (CDP: 4× CPU, 150 ms RTT, 1.6 Mbps; 1 warm-up discarded, n=5): **LCP [832, 852, 856, 864, 880] ms · TTFB [731, 733, 740, 746, 748] ms · 27 requests**; one server round trip to the DB per page load (relationship → profile/enrolment/state in parallel after it). Script bytes, cache disabled, same method: `/student` 587 827 · `/tutor` 587 825 · surface **587 825** (13 files) — no client JS added.

## 9 · Refusals / what does not exist
No learning events, table or event kind · no second read path · no schema change · no aggregate, export, print, share, download · no third-party · no tutor action, no disabled control · no avatar/profile/dashboard/chip/tab/table/progress bar/sparkline · no recency of any kind (grep clean in text, title, meta, aria) · no zero · no second student, no link to another surface · no observation (no analytics, beacon, access log — ruling pending) · no new tokens/components/primitives/motion/deps · no client JS · no prod seed data · no touch on Scenes 0–8, 5.x systems, 6.1 model, 6.2 composition beyond the row link · 6.4 not begun.

## 10 · Fixture note (honest)
Before this session's commands ran, the project DB already held tutor-a↔student-a (physics, active, 12:37 UTC today), tutor-a↔student-d (physics, ended, 12:37) and tutor-a↔student-f (physics, active, 13:36) — created via `scripts/test-account.mjs`, not in this session's action log. All between test accounts. I kept a and the ended d, **ended** f (environment.cjs's write account should not be anyone's student), added d active and c·mathematics created-then-ended. Final: active a/c/d physics; ended d physics, c mathematics, f physics. student-b stays unrelated. Non-test rows: 0.

## 11 · Prod / dev / env
`next build` clean · `/dev/relationship-surface` 200 in dev, **404 in prod** · `.env.local` untouched (never printed). Dev shell rows link to `fixture-<id>` → 404 by design (labelled on the dev page).

## 12 · USER items
1. Access logging for tutor reads — none written; ruling pending.
2. `siteConfig.tagline` "Live tutoring, built for real learning outcomes." — left as brand frame; is it true enough to keep?
3. Business model: does the academy handle money in-product? (Money language stays banned until ruled.)
4. Arc step label "Watch **your** record grow" read by a tutor — accept, or rule on a second label set (refused by default).
5. Where a tutor's ended arrangements live later (TUTOR_VISIBILITY §6.3 proposes a tutor-side "arrangements" view, P7+, needs its own ruling).

## 13 · `git status --porcelain` (raw, at report time)
See `PHASE6_STEP3_GIT_STATUS.txt` (written beside this report before the commit).
