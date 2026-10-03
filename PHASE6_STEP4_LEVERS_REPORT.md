# Phase 6 · Step 4 — THE LEVERS: a tutor shapes an environment

**Precondition:** 6.3 reported and closed at `6918955`. **Status: BUILT and VERIFIED; STOPPED before 6.5.**
Rulings applied: P6-R10 (environment belongs to the subject), P6-R11 (levers chosen, not authored), P6-R12 (one Physics). Decision log: DEC-017.

---

## REPORT BACK

### 1 · 6.1's recommendation (verbatim) and what was built
From `PHASE6_STEP1_TUTOR_ARCHITECTURE_REPORT.md` Part 6:

> | **per tutor per subject** (recommended) | `tutor_environment(tutor_id, subject_id, accent, atmosphere, motif, motion, density)`; closed enums mirrored from 3.1; rendered for a student only through an active relationship | one table in Phase 6.x; the student's environment becomes "shaped by *your* tutor" exactly where P6-R1 says a tutor exists |

**It differs, and the rulings were built instead.** 6.1's model keys levers by *tutor* and renders them *per student through the relationship* — exactly what P6-R10 forbids ("the environment belongs to the subject … no per-student anything"), and it lists `accent`, `atmosphere`, `motif` as columns, which P6-R11 excludes (identity / inert). Built: `environment_settings(subject_id PK, density, motion_char, shaped_by, updated_at)` — one row per subject, same for every reader. The brief's "build 6.1's if it differs" was read as subordinate to the three rulings issued for this step; the difference is this item.

### 2 · Lever inventory — adjustable vs. not
| 3.1 lever | verdict | why |
|---|---|---|
| accent triad | **identity — not a lever** | subject's own; validated 3.7; reasserted per combination |
| atmosphere | **inert — not presented** | six authored names, read by no renderer; a control would change nothing |
| motif | **identity — not presented** | one kind per subject; another kind is another subject's room |
| motion character | **ADJUSTABLE** | precise · energetic · reactive · growing · editorial · sequential (authored sets in `ambient/contract.ts`); honest reach: visible only where the ambient runs; off under reduced motion regardless |
| density | **ADJUSTABLE** | sparse · balanced · dense; every motif renderer reads it; the Room reduces one step |

Mark, brand frame, type, motion grammar, spacing never appear in any list, column or control (grep table in Test 4).

### 3 · Model + policies (pasted)
Migration `supabase/migrations/20261002000003_environment_settings.sql`, APPLIED to the live DB. Constraints as the DB reports them:
```
PRIMARY KEY (subject_id)
CHECK (is_subject_id(subject_id))
CHECK ((density = ANY (ARRAY['sparse','balanced','dense'])))
CHECK ((motion_char = ANY (ARRAY['precise','energetic','reactive','growing','editorial','sequential'])))
FOREIGN KEY (shaped_by) REFERENCES auth.users(id) ON DELETE RESTRICT
columns: subject_id text · density text · motion_char text · shaped_by uuid · updated_at timestamptz
```
**CHECK, not FK** — the authored sets live in `subjects.ts`; there is no subjects table and inventing one would be a second source of truth. `scripts/check-subject-sql.mjs` asserts the CHECK lists equal `DENSITIES`/`MOTION_CHARS` in order, and that no identity value is named in the DDL.
Policies (`pg_policies`):
```
environment_settings_select_all            SELECT  {anon,authenticated}  using (true)
environment_settings_insert_related_tutor  INSERT  {authenticated}       with check (exists active relationship: tutor_id = auth.uid() and subject_id = NEW.subject_id)
environment_settings_update_related_tutor  UPDATE  {authenticated}       using + with check (same predicate)
environment_settings_delete_related_tutor  DELETE  {authenticated}       using (same predicate)
```
`bash scripts/test-rls.sh` → **RLS: all 76 assertions passed** (20 new: student insert/update denied · unrelated tutor denied · visitor (anon) denied · tutor whose relationship ENDED denied · related tutor inserts/updates/deletes · `very-dense` → `check_violation` even for the related tutor · a second row for the same subject impossible · anon SELECT works).

### 4 · Read path
`src/lib/environment/settings.ts` `getEnvironmentSettings(subjectId)` — **one** cookie-less anon round trip (`persistSession: false`), run in `Promise.all` with `getIdentity()` in `src/app/subjects/[subject]/page.tsx`; **no cache layer** (planned `unstable_cache` dropped: a stale layer across instances is a second truth). Absence = authored default, with the read-site comment contrasting P5-R6 (a missing row is a complete value here; a failed read is NOT — it renders the default too but is logged and tagged `source: "authored-after-failed-read"`).
TTFB/LCP (same probe, same machine, before → after, ms):
| route | TTFB before | TTFB after | LCP before | LCP after |
|---|---|---|---|---|
| visitor `/subjects/mathematics` | 15–36 | **135–161** | 260–300 | 232–284 |
| student-c `/subjects/physics` | 500–558 | **475–533** | 620–668 | 588–680 |
The visitor path previously made no DB call at all; it now makes the one settings call (+≈120 ms). The enrolled path is unchanged (the call runs in parallel with the identity read). Both inside 5.6's 600–740 pin.

### 5 · Validator combination pass
`validate.ts` `validateCombinations` — per subject: density × motion character = **18; 108 total**, each re-asserting identity (contrast · ΔE · focus ring unchanged by levers), substrate + edge budgets (`generateMotif`/`groupElements` vs `MAX_COMMANDS`/`MAX_DOM_NODES`), the Room rule, motion caps (cycle ≥ 30 s, camera ≤ 0.5, parallax ≤ 0.3), reduced-motion parity (`decideAmbient` → off). `node scripts/validate-subjects.mjs --json` → `■ 6.4 lever combinations: 108 (18 per subject) PASS` → `audit/lever-combinations.json`.
**Build-failure proof:** `energetic.maxCameraMove` 0.5 → 0.9 temporarily:
```
■ 6.4 lever combinations: 108 (18 per subject) FAIL
  ✗ mathematics · sparse · energetic
      ✗ motion-caps: cycle 30s · camera 0.9 · parallax 0.3 · wobble 0.05
exit=1
```
(18 ✗, one per subject×density; restored; `git diff contract.ts` empty.) The script is the build gate as in 3.7 (run before build; not wired as an npm `prebuild` — build setup is out of 6.4 scope; **USER item**).

### 6 · The surface `/tutor/[subject]/environment`
Room rules, compact, 390-first. Reading order: Room header (mark · Physics · The Field · h1 "The Physics environment" · state line) → form: Density select · Motion character select (each with "Authored: …" hint) · inert note · **blast sentence** · no-notice sentence · **Save for everyone in this subject** (the one primary) → revert form (only when a row exists; secondary) → "Open the Physics room" (the only renderer; **no preview** — two renderers drift) → "Back to the students placed with you". Works JS-off (real `<form method=post>`; proven). Screenshots: `audit/levers-shots/` (dark/light × 390/360/320/1280, gray, reduced motion, no-JS, shaped-by-you, shaped-by-other).
**Blast sentence (verbatim, `LEVERS_COPY.blastRadius`):** *Saving changes the Physics environment for everyone in Physics — every student, including students you do not teach, and any other tutor placed in Physics. There is one Physics room.* — a visible `<p>` inside the form, DOM-before the Save button, referenced by the button's `aria-describedby`; not a footnote, tooltip or checkbox (gate).
**Shared note:** unconditional (the policy to count other tutors doesn't exist; proposal `docs/proposed/environment_shared_note.sql`). Who shaped last: three constants — *This environment is as authored.* / *Last shaped by you.* / *Last shaped by another tutor placed in this subject.* (no name, no date; proven with a re-stamped `shaped_by`).

### 7 · The write `POST /tutor/[subject]/environment/shape`
5.5's shape: form POST → relative-`Location` 303 → the surface; `upsert … onConflict subject_id` (idempotent); `intent=revert` → delete; request-scoped `createClient()` only (grep: no `service` import under `src/lib/environment` or the route); no GET (405); unauthored value → 303 `?shape=failed` (no 400 with advice; the surface shows the values in force). Relationship resolved **server-side** (`getTutorContext()` groups must contain the subject), never from the subject id alone; denied → 404 with the same canonical document as an unknown subject.
Identity-matrix write probes (DB row is the truth; three per class):
```
write                                              visitor  expired  studentA  studentB  tutorT                 tutorU
POST /tutor/physics/environment/shape              303→none 303→none 404→none  404→none  303→dense/energetic    404→none
POST /tutor/mathematics/environment/shape          303→none 303→none 404→none  404→none  404→none               404→none
POST …/physics/…/shape · unauthored value          303→none 303→none 404→none  404→none  303→none               404→none
```
(visitor/expired 303 = the proxy's login redirect.)

### 8 · Five reader classes, one environment (`/subjects/mathematics`, fixture row dense/energetic)
```
visitor   e58e35e9f5106ffd  data-density=dense data-levers-source=shaped data-motion-char=energetic …
studentA  e58e35e9f5106ffd  (identical)
studentB  e58e35e9f5106ffd  (identical)
tutorT    e58e35e9f5106ffd  (identical)
tutorU    e58e35e9f5106ffd  (identical)
```
Fingerprint = shell-root lever attrs + full markup of every motif (2 per page). Whole documents differ only by 5.5's threshold (door/enter state per enrolment) and the viewer's nav name — authorised 5.5/5.3 design, not the environment. Note: the five-class proof uses mathematics (ready) because physics is `draft`: visitors and tutors are 404'd at its door, so no five-class read of physics exists; tutor T can shape physics without being able to open it (a consequence of the draft door, reported).

### 9 · Absence = authored default
No row vs a row holding the authored values (sparse/precise): motif sha `f3070210f3098d2e` both; attrs identical except `data-levers-source` authored/shaped. Revert: 303 → row `none` → surface "as authored", revert form gone.

### 10 · Attacks (permanent gates, `audit/attacks.cjs` 7 files · 0 failures)
`levers-attack-6.ts` — write settings for a student (`studentId` in the address) **TS2353**; an identity value (`accent`) as a lever **TS2353**. `levers-attack-7.ts` — read scoped to a student **TS2345**; a second (student) argument **TS2554**; shell `levers` prop with `studentId` **TS2353**. Shell prop tightened to `motionChar: MotionChar`.

### 11 · Identity matrix / coverage
Re-pinned: **64 routes × 6 classes + 3 write probes**. New rows: `/tutor/{mathematics,physics}/environment` (tutor T physics → `200 environment-levers:authored`; everyone else 307/404), `…/environment/shape` (405 on GET). Only pre-existing cell changed: the `[relationship]` ended-fixture id (two ended physics rows exist; `limit 1` was unordered — now `order by r.id`; PHASE_TRACKER row added). `--check` all gates PASS; `--drop-row=/tutor/physics/environment` → `FAIL coverage: every app route has a pinned row — missing rows: /tutor/physics/environment` (proof).

### 12 · Homepage / student side / payload
Homepage: **141 strings, DOM hash `c4b478181b3dbcdd`** — identical before/after. No Scene edited. Script bytes: tutor shell 587 825 (=), shaping surface **587 825** (= shell, no client JS), student-c environment **616 584** (=), visitor environment 643 858 → **644 092 (+234 B)** — the registry entry's text (`modules.ts` is bundled into client scene chunks; grep confirms); no client code added. No student-facing string about shaping on `/student`, `/subjects`, either room (gate).

### 13 · Docs + registry
`docs/TUTOR_VISIBILITY.md` §6.4 (may change / never change / blast / revert / silence / policies / absence / reach); `docs/STATE_LANGUAGE.md` 6.4 addendum (three constants); `docs/DECISIONS.md` DEC-017; `docs/PHASE_TRACKER.md` +4 rows; `docs/EXCEPTIONS.md` note (no new exception; 22 open). Registry: `tutor-environment` (Environment shaping) **live**, surfaces `["tutor"]` — delivering phase 6.4, surface exists (P6-R8). `tutor-portal` stays `planned` (E-26). `/dev/environment-levers` (+`/frame`): inventory+verdict, 108-combination matrix, three states + failed-save, grayscale/rm/no-JS/light/1280 frames, harness evidence table, five-class shas, the two attacks' tsc output, real-vs-not table; 404 in prod (matrix).

### 14 · Failure behaviour
Settings read failure → authored default + `logFailure` (scope `environment-settings`, `source: authored-after-failed-read`); write failure → `logFailure` (`route:/tutor/[subject]/environment/shape`, content-free `what`) → 303 `?shape=failed` → one sentence in the 5.7 register (*That did not save. The environment is unchanged — the values shown are the ones in force.*). No observation: no beacon/analytics (grep clean); `shaped_by`/`updated_at` describe the tutor's own design action only and are never rendered to a student.

### 15 · Row counts (live DB, non-test): `environment_settings 0 · relationships 0 · profiles 0 · environment_state 0`. Harnesses leave no row behind (gate). `.env.local` untouched (`git status` clean for it).

### 16 · What does not exist / USER items
- **No way in from the shell** — 6.2 composition and 6.3 surface untouched; reached by URL. *Where should the entry live (shell row? subject heading? tutor-nav item)?*
- No preview; no student notice/changelog/history; no per-student anything; no atmosphere/motif/accent/mark/type/frame control; no free input; no second read path; no schema beyond the one table.
- Validator not wired as npm `prebuild` (build setup out of scope).
- Shared-tutor note cannot be conditional without a new grant (`docs/proposed/environment_shared_note.sql`).
- Tutor T shapes physics but cannot open it (draft door) — a tension of the draft status, not redesigned.
- Open from 6.3: access logging ruling, tagline, money/business model, arc "your" label, ended arrangements.

---

## TESTS 1–29 (one line each)
1 precondition + quote ✓ (§1) · 2 inventory ✓ (§2) · 3 108 PASS + failure proof exit 1 ✓ · 4 no identity lever: controls = `density`,`motionChar`; `grep -n "accent\|mark\|frame\|typeface\|grammar\|spacing" migration levers.ts` → prose only (header lists them as NOT levers) ✓ · 5 no per-student: DDL has no student column; TS2353/TS2345/TS2554 ✓ · 6 five hashes identical ✓ · 7 blast verbatim + DOM position + `aria-describedby` ✓ · 8 shared note via re-stamped `shaped_by` ✓ (two placed tutors impossible without new fixture policy — proposal) · 9 write: 303 · idempotent (1 row after 2 saves) · GET/HEAD 405 · request-scoped · no service role ✓ · 10 revert deletes row ✓ · 11 absence = default (motif sha equal) ✓ · 12 76/76 policies ✓ · 13 no placement ≡ nonexistent (canonical doc, 6.3's form) ✓ · 14 matrix rows + drop-row proof ✓ · 15 no student-facing change (string sweep + 6.3/6.2 harnesses `relationship.cjs`, `tutor.cjs` pass unchanged) ✓ · 16 homepage 141/`c4b478181b3dbcdd` ✓ · 17 TTFB/LCP table, one round trip ✓ · 18 390/360/320/1280 both themes, no h-scroll ✓ · 19 a11y: axe clean both themes, no-JS real save, 400% zoom, text spacing, tab order, targets ≥44 ✓ · 20 payload per route (§12) ✓ · 21 no free input (gate: no text/number/color/file/range/textarea/title) ✓ · 22 no observation grep + shaped_by statement ✓ · 23 failure log + default render ✓ · 24 registry + homepage labels unchanged ✓ · 25 row counts zero ✓ · 26 prod build exit 0 · `/dev/*` 404 all classes · `.env` untouched ✓ · 27 student/relationship sides unchanged (harnesses) ✓ · 28 what-does-not-exist (§16) ✓ · 29 `git status --porcelain` empty after commit ✓.

Harness commands: `node scripts/validate-subjects.mjs --json` · `bash scripts/test-rls.sh` · `node audit/attacks.cjs` · `node audit/levers.cjs --check` · `node audit/identity-matrix.cjs --check` · `node /home/user/perf-probe.cjs`.
