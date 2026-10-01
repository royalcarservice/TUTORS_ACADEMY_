# Tutor visibility — what a tutor can see, and why

Phase 6 · Step 1 (THE TUTOR ARCHITECTURE). Rulings P6-R1, P6-R2, P6-R3. Enforced by
`supabase/migrations/20261001000002_relationship.sql`; proven by
`supabase/tests/rls_test.sql` (56 assertions, fixture, local + project) and
`scripts/test-tutor-visibility.mjs` (17 assertions, real JWT → PostgREST → RLS, project).

This document is the **policy in prose**. The migration is the policy in SQL. If they
disagree, the SQL is what is true and this document is wrong — fix the one that is wrong.

## 1. The relationship (P6-R1)

One row in `public.relationships` = **one tutor · one student · one subject**.

| property | how it is held |
|---|---|
| scoped | `subject_id` is part of the row; a relationship in physics says nothing about mathematics |
| explicit | a row must be written; **no row exists by default**; nothing is inferred from enrolment, from sharing a subject, from role, or from browsing (reads create nothing — tested) |
| revocable | `state = 'ended'` + `ended_at`; the row is **retained** — ended is not "never existed"; an ended row grants nothing |
| one active at a time | partial unique index on (tutor, student, subject) `WHERE state = 'active'`; a relationship may be ended and later begun again (new row) |
| subject identity | `CHECK (public.is_subject_id(subject_id))` — the six locked ids. **Subject status is never referenced** (E-13 ruling: identity checkable, status stays in TypeScript) |
| who writes it | **nobody through the API.** No INSERT/UPDATE/DELETE policy for any role, and the table privileges are revoked from `anon`/`authenticated`. Only the service role (server/CLI). The creation flow is undecided — see §6 |

## 2. The visibility default (P6-R2) — data type · who · condition · why · what is refused

All rows below are **SELECT only**. No role other than the student themself can write student data; a tutor has no write policy on any table.

| data type | table / columns | who | condition | why | refused |
|---|---|---|---|---|---|
| the relationship itself | `relationships` (tutor, student, subject, state, started/ended) | the tutor named in it; the student named in it | party to the row (active **or** ended) | each side may know who can see what, and that it ended (DPDP transparency; "ended ≠ never existed") | anyone else; anon; aggregates over other tutors' rows (no such policy) |
| arc position | `enrolments` (subject, status, enrolled_at) + `environment_state` (first/last entered, position) | the related tutor | `is_related_tutor(student_id, subject_id)` — an **active** relationship for **that student in that subject** | this is the arc the student is on in that subject; the tutor shapes that environment | the same student's **other subjects**; any **non-related** student; students who merely **share the subject**; everything after the relationship **ended** |
| learning events in that subject | *(none exist yet — Phase 7+ tables)* | the related tutor | same predicate, same scope, when such a table exists | — | nothing is pre-granted; a future table must add its own policy using the same predicate |
| display name | `profiles.display_name` | the related tutor | an active relationship with that student in **any** subject | so the tutor can address the person | the unrelated; after ending |
| contact / auth / account state | `auth.users` (email, confirmation, sessions), passwords, sign-in history | **nobody** | — | not the tutor's business; no policy touches `auth.*` | always |
| behavioural data | `environment_state.entry_count` *(see "what rides along")*, timing patterns, device, session | **nobody by design** | — | P6-R3: not a management console | always as a rendered value; see §4 |
| aggregates / lists / comparisons | counts, pipelines, leaderboards, "needs attention" | **nobody** | — | P6-R3 | always; RLS makes a `count()` return the policy's rows (tested: 1, not the table's) |
| export / bulk / third-party | — | **nobody** | — | no path exists | always |

**Absence of a record renders NOTHING.** No zero, no "no activity", no flag. This is the
student-side rule (P5-R6) carried over; a tutor-facing surface, when one exists, must obey it.

### What rides along (RLS is row-grained)

A SELECT policy admits a **row**; it cannot hide a column. Two consequences, stated so nobody is surprised:

- `environment_state.entry_count` is visible to the related tutor over REST. The student-side code reads it (bookkeeping for the upsert, `src/lib/student/data.ts`), so it cannot be revoked at column level for `authenticated` without changing the student path. **No surface renders it** (P5-R2) and none may. Tightening to column grain costs: a `security_invoker` view with the arc columns only, **plus** revoking tutor access to the base table — which means a different grant shape for tutor and student, which Postgres privileges cannot express per-user; so in practice a separate `arc` table or a definer view with the predicate inside it. Deferred; recorded here.
- `profiles.role`, `is_test_account`, `created_at`, `updated_at` ride along with `display_name`. None is contact or auth state. Same tightening cost as above.

## 3. The policy matrix (what the SQL says)

| table | policy | role | USING |
|---|---|---|---|
| relationships | `relationships_select_tutor` | authenticated | `tutor_id = auth.uid()` |
| relationships | `relationships_select_student` | authenticated | `student_id = auth.uid()` |
| relationships | *(no insert/update/delete)* | — | service role only |
| enrolments | `enrolments_select_related_tutor` | authenticated | `is_related_tutor(student_id, subject_id)` |
| environment_state | `env_select_related_tutor` | authenticated | `is_related_tutor(student_id, subject_id)` |
| profiles | `profiles_select_related_tutor` | authenticated | `EXISTS active relationship WHERE tutor_id = auth.uid() AND student_id = profiles.id` |
| *(all 5.1 policies)* | unchanged | | owner-only remains the student's boundary |

`public.is_related_tutor(student, subject)` is the **one predicate**: `EXISTS … tutor_id = auth.uid() AND student_id = $1 AND subject_id = $2 AND state = 'active'`. It is `security definer` so the enrolments/environment_state policies can consult `relationships` without recursing through its own RLS. It takes no role shortcut: a student, an admin, or anyone without an active row *as tutor* gets `false`.

## 4. Tighten / loosen — what each costs

Every change below is a **policy edit** (USING clause or the predicate body). None is a schema rewrite.

| change | edit | cost |
|---|---|---|
| **tighten:** hide `environment_state` from tutors entirely (arc from enrolment only) | drop `env_select_related_tutor` | tutor loses first/last-entered and (future) position; "where the student is in the arc" collapses to "enrolled" |
| **tighten:** display name only, nothing riding along | see §2 "what rides along" | new view or table; not a policy edit — the one place the default cannot be tightened by policy alone |
| **tighten:** student must also consent per relationship | add `AND consented_at IS NOT NULL` to the predicate (column to add to `relationships`) | one nullable column on the relationship model (inside the 6.1 schema boundary) + the consent flow that writes it (not built) |
| **tighten:** time-box visibility | add `AND (expires_at IS NULL OR expires_at > now())` | one column; a policy that references `now()` is `stable`, fine |
| **loosen:** tutor sees all subjects of a related student | drop `subject_id = p_subject` from the predicate | breaks "scoped": a physics tutor reads the student's history arc. **Refused by P6-R2**; here only to show it is one line, and that one line is the boundary |
| **loosen:** tutor sees every student in a subject they teach | predicate `EXISTS tutor_subjects WHERE …` | a new table (tutor_subjects) and a roster semantics P6-R1 rejected (implicit relationship). Refused |
| **loosen:** ended relationship keeps read access to the past | `state IN ('active','ended')` | the student can no longer revoke; refused |
| **loosen:** admin reads everything | `OR current_role_of(auth.uid()) = 'admin'` | an admin surface exists nowhere; no admin account can be created; refused until an admin step rules on it |
| **loosen:** learning events table (Phase 7) | add `… for select using (is_related_tutor(student_id, subject_id))` to the new table | intended path: the predicate is reused, the scope does not widen |

A policy that would need **subject status** (e.g. "tutors may only be related in open subjects") is wrong by the E-13 ruling: status is design configuration in `src/config/subjects/`, not data. Enforce it at the door (`mayEnrol`/creation flow), not in RLS. Nothing in 6.1 needed it.

## 5. Students' side

Unchanged. Owner-only SELECT/INSERT/UPDATE policies from 5.1 stand; the only addition is `relationships_select_student` — a student can read who is related to them. The student shell and environment render nothing new (the `tutor-presence` slot is registry-gated on `tutor-portal`, which stays `planned`). Byte-comparable: `audit/shell.cjs` and `audit/environment.cjs` show no diff at this tree.

## 6. Creation flow — options (P6-R1; recommend, don't build)

| option | who starts | consent | minor question | what it needs |
|---|---|---|---|---|
| **tutor-invited** | the tutor names a student (by an identifier the student chooses to share — never by browsing a list) | student accepts → row becomes active | if the student is a minor, the guardian accepts, not the student | an invitation record (pending state on the relationship or a separate table), a student-side accept action, a guardian identity — **none exist**; the last is blocked by E-07 |
| **academy-provisioned** | the academy (service role / an admin step) writes the row after an out-of-band agreement | consent is captured outside the product (enrolment agreement) and asserted by whoever provisions | the agreement is with the guardian; the product does not need to know the age if the agreement does | an admin action (no admin surface exists; no admin account can exist); a record of *who* provisioned (`created_by`) |
| **student-requested** | the student asks for a tutor in a subject | tutor accepts | a minor requesting a relationship with an adult is exactly the case DPDP/child-safety rules scrutinise; needs guardian consent before the request is even visible to a tutor | a request record, tutor-side accept, guardian identity — blocked by E-07 |

**Recommendation: academy-provisioned first.** It is the only option whose consent step
does not require the product to hold a guardian identity or an age, which E-07 forbids
until legal is settled. It is also what the service-role write path already is — the
`relate`/`end` commands in `scripts/test-account.mjs` are that path in CLI form, for test
accounts only. Tutor-invited is the natural second step once a student-side "accept" can
be built and the minor question has a legal answer. Student-requested should not be built
before both.

Whichever is chosen: it must be **the student (or guardian) who can end it**, and the
row must say who created it (`created_by`) — one column, inside the relationship model.

## 7. DPDP note (E-07 — not legal advice; a record of posture)

- No real identity exists; every account is `is_test_account = true`; the test asserts it.
- The model makes **purpose limitation** structural: a tutor's read is bounded to one subject of one student who is party to an explicit, revocable relationship.
- The student can see who is related to them and that a relationship ended (transparency).
- Children's data: the Act requires verifiable parental consent for a minor and forbids tracking/behavioural monitoring of children. The product holds **no age** and **no guardian**; the only behavioural counter (`entry_count`) is never rendered and is flagged above for removal from the tutor's view. **No onboarding of real students may begin** until a privacy notice, consent capture (guardian for minors), and a contact route exist — E-07 is the blocker, unchanged.

## 8. Recorded rulings closed or moved here

- **E-13** → identity is `CHECK`ed in the DB (`is_subject_id`, used by three tables); status stays TS; no policy references it. The "draft enrolment via REST" hole is **not** closed by a policy — a policy for it would need status, which is wrong by ruling. It stays a door-side rule (`mayEnrol`) and remains open at that layer.
- **E-14** → `count(profiles) = 4` replaced by manifest-derived invariants (fixture table + test-domain predicate). The same mistake was caught once more while extending the test (`count(relationships) = 2` on the project DB, which holds its own row) and scoped to the fixture tutor.
