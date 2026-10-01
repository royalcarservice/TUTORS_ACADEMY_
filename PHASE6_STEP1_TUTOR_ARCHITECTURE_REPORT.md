# Phase 6 · Step 1 — THE TUTOR ARCHITECTURE · report

Rulings P6-R1 / P6-R2 / P6-R3 applied; preface rulings E-13 / E-14 / E-23 / E-07 honoured.
**No interface was built.** Base `36b1a2a`. Decision DEC-013.

## PART 0 — INSPECT (findings, before anything was built)

| # | asked | found |
|---|---|---|
| 1 | 5.8 gate report, exceptions, entry recommendation | Gate closed "yes, register open at 22". Entry: *"the tutor–student assignment (roster) and its RLS policy — the first fact that puts a person in the room … it also lets E-13's draft-enrolment hole be closed by policy and E-14's fixture be rewritten."* Inherited: E-07, E-23, E-22, E-12, E-18. **Note:** the recommendation said "roster"; P6-R1 corrects the noun to *relationship*. And it was wrong about E-13: a policy that closes the draft hole would need subject status, which the preface rules out — see §E-13 below. |
| 2 | Scene 5 strings verbatim (`src/components/spine/scenes/people.tsx`) | eyebrow **"The people"** · heading **"A tutor here has a place, not a profile."** · lead **"There is no roster on this page. A tutor does not get a profile page and a video call; a tutor gets an environment, and shapes it."** · body **"Five things are theirs to set: accent, atmosphere, motif, motion character, density."** / **"The environment is the workspace. You meet your tutor inside it."** · statusSubject **"The tutor's side of the environment"** (status derived from `tutor-portal` only). Unchanged. |
| 3 | 3.1 five levers + tutor-shaping rule | `LEVERS = ["accent","atmosphere","motif","motion character","density"]`. The rule: the tutor *shapes the environment*, never a profile. Levers model options in §Part 6. |
| 4 | 5.1 roles / matrix / RLS / break test | `user_role = student|tutor|admin`; 8 policies, all owner-only (`id|student_id = auth.uid()`); migration comment: *"tutor: NO policies yet. Phase 6 adds roster-scoped read policies; nothing is pre-granted."* `rls_test.sql` 20 assertions; tutor section asserted 0 enrolments / 0 environment_state. |
| 5 | `/tutor` today; how an account gets the tutor role | `(portal)/tutor/layout.tsx` → `requireIdentity("tutor")` + `PortalShell`; `page.tsx` → `PageHeader "Tutor overview"` + `NotBuiltYet` listing `getPlannedModules("tutor")`. Sidebar: **one** nav item (Overview) + a non-link "Coming to this portal" list. **Role path:** `/register` has a self-declared role radio (`student|tutor`) → `signUp` metadata → `handle_new_user()` trigger; `admin` collapses to student. **Any visitor can make themselves a tutor** on a test account today. No admin surface exists; no admin account can exist. **No tutor account existed in the project DB before this step** (5 student test accounts). |
| 6 | 5.6 deferral | DEC-009: owner-only SELECT stays; `tutor-presence` slot (`student-slots.ts`) gated on module `tutor-portal`, "needs: a tutor–student assignment for this subject", renders nothing. Still nothing. |
| 7 | P5-R5 regions | `/subjects/[id]` one composition; identity adds THRESHOLD or REGIONS server-side; visitor DOM byte-comparable. A tutor's view, when one exists, is the same mechanism: a third identity-dependent addition to the same route — not a new route. Not built. |
| 8 | P5-R7 registry unit | one entry = one capability with one status; `routePrefix` only when a route resolves; nothing `live` without a surface. |
| 9 | standing bans | all retained; see DO-NOT-CHANGE proof in TESTS. |

## PART 1 — THE RELATIONSHIP MODEL (P6-R1)

`supabase/migrations/20261001000002_relationship.sql` — applied to the project; DDL pasted on `/dev/tutor-architecture`.

```
public.relationships (
  id uuid pk, tutor_id → profiles, student_id → profiles,
  subject_id text CHECK is_subject_id(subject_id),            -- E-13: identity checked; status never
  state text CHECK in ('active','ended') default 'active',
  started_at, ended_at,
  CHECK tutor_id <> student_id,
  CONSTRAINT relationships_ended_consistent CHECK ((active ∧ ended_at null) ∨ (ended ∧ ended_at not null)))
UNIQUE (tutor_id, student_id, subject_id) WHERE state = 'active'   -- one active; ended rows may repeat
```
Scoped (subject in the row) · explicit (no default row; a read creates nothing — tested) · revocable (`ended`, row retained; grants nothing). **No write policy for any role; INSERT/UPDATE/DELETE privileges revoked from `anon`/`authenticated`.** Service role only.

**Creation flow — options and recommendation (not built):** see `docs/TUTOR_VISIBILITY.md` §6. **Academy-provisioned first** (consent captured out-of-band; the product holds no guardian identity or age, which E-07 forbids); tutor-invited second (needs a student-side accept and a legal answer on minors); student-requested last. Whichever: the student/guardian can end it; add `created_by` (one column, inside the model).

## PART 2 — POLICY MATRIX + EXTENDED BREAK TEST (P6-R2)

| table | policy | USING |
|---|---|---|
| relationships | `relationships_select_tutor` | `tutor_id = auth.uid()` |
| relationships | `relationships_select_student` | `student_id = auth.uid()` |
| enrolments | `enrolments_select_related_tutor` | `is_related_tutor(student_id, subject_id)` |
| environment_state | `env_select_related_tutor` | `is_related_tutor(student_id, subject_id)` |
| profiles | `profiles_select_related_tutor` | `EXISTS active relationship (tutor = auth.uid(), student = profiles.id)` |

One predicate: `is_related_tutor(student, subject) := EXISTS … tutor_id = auth.uid() ∧ student ∧ subject ∧ state='active'` (security definer; no role shortcut).

**Every assertion** is in `supabase/tests/rls_test.sql` (20 → **56**) and `audit/rls-test.log` (local **and** project run, both 56/56, rolled back). The four required breaks, verbatim labels:

- BREAK other-subject: A's mathematics enrolment invisible to her physics tutor · …environment_state invisible
- BREAK ended: B's enrolment invisible after the relationship ended · …environment_state · …profile
- BREAK shared-subject: physics enrolments visible = the ONE related student, not everyone in physics
- BREAK non-related: U sees no relationships · no enrolments · no environment_state · no other profile

Plus: P6-R1 no relationship exists by default · nothing inferred (×3) · reading created no relationship · tutor cannot create/end a relationship · tutor cannot write the related student's state/profile · one active per triple · E-13 subject identity checked · ended requires ended_at · A sees who can see her · B sees the ENDED relationship · revocation retains the row · revoked ×4 · anon has no privilege on relationships.

**Through the real path** (`scripts/test-tutor-visibility.mjs`: anon key + test JWT → PostgREST → RLS, against the project): **17/17** → `audit/tutor-visibility.json`. Includes `count()` over enrolments = 1 (the policy's rows, not the table's).

## PART 3 — `docs/TUTOR_VISIBILITY.md`
Data type · who · condition · why · refused (§2); matrix (§3); tighten/loosen with costs (§4); creation flow (§6); DPDP note (§7); E-13/E-14 record (§8). **Honest caveat recorded:** RLS is row-grained — `entry_count` and profile metadata (`role`, `is_test_account`, timestamps) ride along with the admitted row; no surface renders them; tightening to column grain is the one change that is *not* a policy edit (view/table), stated with its cost.

## PART 4 — PORTAL ARCHITECTURE
`/tutor` stands as the Phase-1 placeholder. IA today: **1** nav item (Overview); links in the shell = `/`, `/tutor`, `/login` (sign-out) — all resolve (200/303). The "Coming to this portal" list is text, not links. **Findings for 6.2 (not changed now — registry existing entries and the placeholder are DO-NOT-CHANGE):** (a) `tutor-portal.summary` says *"sessions, **rosters**, grading and earnings"* and `PORTAL_META.tutor.blurb` says *"Teach, schedule, assess and get paid."* — both name capabilities that are not built and "rosters" contradicts P6-R1's noun; (b) `tests.summary` *"detailed performance analytics"* sits next to P6-R3; (c) `NotBuiltYet` copy still says *"This is the foundation task … the next build drops it into this exact shell."* (Phase-1 sentence, now stale). Recommendation: 6.2 rewrites these three strings with existing vocabulary; nothing else on the route moves.

## PART 5 — ROLE PATH (report only)
Self-declared at `/register` (test accounts only, stated on the page). Fix is not an admin surface: when the creation flow is academy-provisioned, *role* can also be academy-provisioned (service-role `createUser` with `role: tutor`, which `scripts/test-account.mjs` now does for test accounts via `ROLE=tutor`), and the radio can go. Deferred to the step that opens real onboarding (blocked by E-07).

## PART 6 — LEVERS MODEL (recommend only)
| option | shape | cost |
|---|---|---|
| per subject / academy | levers live in `src/config/subjects/` as today | tutor shapes nothing; contradicts Scene 5 |
| **per tutor per subject** (recommended) | `tutor_environment(tutor_id, subject_id, accent, atmosphere, motif, motion, density)`; closed enums mirrored from 3.1; rendered for a student only through an active relationship | one table in Phase 6.x; the student's environment becomes "shaped by *your* tutor" exactly where P6-R1 says a tutor exists |
| per relationship | levers on the relationship row | a tutor would set five levers per student; the environment stops being a place |

## PART 7 — P6 PROVIDER VERDICT
Origin-only. A `tutor-presence` provider would need (a) an active relationship, (b) a surface for the student to reach the tutor *inside the environment* — none exists; a Tier-4 mirror of the registry-gated slot is all that can be said. **No provider ships** that cannot resolve a href. `next-action` tests 34/34 unchanged.

## PART 8 — `/dev/tutor-architecture`
Dev-only (404 in production for visitor, student, tutor — measured). Reads only the migration, the doc, `audit/rls-test.log`, `audit/tutor-visibility.json`, and the registry. Renders no student.

## PART 9 — REGISTRY
Added `tutor-relationship` · `in-progress` · surfaces `["tutor"]` · `routePrefix: null`. `tutor-portal` stays `planned`. Visible consequence: one new text row "Tutor relationship — In progress" in the /tutor placeholder list and sidebar. **Homepage: 179/179 strings identical** to base (also /subjects 24/24, /subjects/mathematics 36/36, /login 29/29, /register 36/36). Recommend 6.2 re-points `student-slots.ts` `tutor-presence.module` to `tutor-relationship` (same gate result today).

## E-13 / E-14 / E-23 / E-07
- **E-13:** identity `CHECK`ed (three tables); no policy references status; the "draft enrolment via REST" hole is **not** a policy's job (it would need status) — stays a door rule, open at that layer by design. Register updated.
- **E-14 before:** `count(profiles) = 4` (true only on an empty DB). **After:** fixture manifest table + `is_test_identity()`; invariants "every fixture identity has exactly one profile" / "no profile belongs to a non-test identity" / "no profile without an auth identity". Same mistake caught once more during this step (`count(relationships) = 2` failed on the project because it holds its own row) → scoped to the fixture tutor. **Closed.**
- **E-23:** untouched here; next as its own bounded fix.
- **E-07:** no real identity; one test tutor created (`tutor-a@test.tutorsacademy.invalid`); one relationship between test accounts (tutor-a ↔ student-c · physics). **Disclosure:** my fixture tool also created tutor-a ↔ student-a (physics) by mistake; it was hard-deleted within a minute as a fixture error, not ended as a revocation. Project now: 6 profiles, 1 relationship, 0 non-test rows of any kind.

## TESTS

| # | test | result |
|---|---|---|
| 1 | no default / no inference (tutor with no relationship: 0 relationships, 0 enrolments, 0 env, 1 profile) | PASS (SQL ×4, project) |
| 2 | four break assertions | PASS (SQL 11 labels; REST 3) |
| 3 | student side byte-comparable; harnesses no diff | environment.cjs **no diffs** (RSC hash notes only, informational); shell.cjs **57/57, no diffs**; states.cjs **45/45, gates identical** |
| 4 | no-zero strings | grep over new code: none ("no activity", "0 students", "needs attention", "leaderboard", "at risk", "engagement") |
| 5 | aggregate / export greps | no `count/sum/avg` in any policy; no export/csv/bulk anywhere new |
| 6 | route + guard status (visitor / student-c / tutor-a) | visitor: `/student,/tutor,/admin` → 200 at `/login?next=…`; student: `/tutor,/admin` → `/student`; tutor: `/student,/admin` → `/tutor`; `/tutor/anything` 404 for all signed-in; `/subjects/physics` 404 visitor (draft door), 200 student & tutor |
| 7 | IA all 200 | `/`, `/tutor`, `/login` from the tutor shell — resolve |
| 8 | registry honesty + homepage labels string-by-string | nothing live without a surface; 179/179 identical |
| 9 | file list | model (1 migration) · policies (same file) · tests (`rls_test.sql`, `test-tutor-visibility.mjs`, `test-rls.sh` loop, `test-account.mjs` relate/end) · docs (TUTOR_VISIBILITY, DECISIONS, EXCEPTIONS, PHASE_TRACKER, this report) · dev route · registry entry · audit outputs. **No change under `src/app/(portal)`, `src/components`, tokens, primitives, subjects.** |
| 10 | levers / role path / DPDP | Parts 5–6, doc §7 |
| 11 | prod build; `/dev` 404 | build 0; 404 ×3 identities |
| 12 | non-test row counts | profiles 0 · relationships 0 (totals 6 · 1) |
| 13 | `tsc --noEmit`, `eslint src scripts`, `check-subject-sql` | clean / clean / ids identical |
| 14 | test-progress 16/16 · test-next-action 34/34 | PASS |
| 15 | `git status --porcelain` | clean after commit |

Known noise: `next build` warns "Dynamic filesystem access causes tracing" for the dev page (same class as `/dev/student-gate`); a `region:subjects-nav isolated failure` line during static generation is present at the base tree too (verified by building `36b1a2a`), not introduced here.

**STOP. 6.2 not begun. Next: E-23 as its own bounded fix.**
