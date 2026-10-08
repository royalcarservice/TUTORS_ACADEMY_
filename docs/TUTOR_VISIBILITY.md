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
| the student's Socratic inquiries in that subject | `socratic_exchanges` (milestone · inquiry · structured guidance, migration 0009) | the related tutor | `is_related_tutor(student_id, subject_id)` — the standing predicate, re-decided on every read | preparation for the next live dialogue — a **diagnostic mirror**, never an evaluation (DEC-035) | other subjects; the non-related; everything after the relationship **ended**; **all evaluative data — no rating, difficulty flag or comprehension figure exists anywhere in the schema** |
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
| socratic_exchanges | `socratic_select_own_student` | authenticated | `student_id = auth.uid()` |
| socratic_exchanges | `socratic_select_related_tutor` | authenticated | `is_related_tutor(student_id, subject_id)` |
| socratic_exchanges | `socratic_insert_own_student` | authenticated | `student_id = auth.uid()` (WITH CHECK) |
| socratic_exchanges | *(no update/delete)* | — | an exchange is an occurrence; lifecycle is service-role managed |
| socratic_pins | `pins_select_own_tutor` | authenticated | `tutor_id = auth.uid() AND is_related_tutor(student_id, subject_id)` |
| socratic_pins | `pins_insert_own_tutor` | authenticated | `tutor_id = auth.uid()` AND EXISTS the exchange visible with the mark's own (student, subject) pair (WITH CHECK) |
| socratic_pins | `pins_delete_own_tutor` | authenticated | `tutor_id = auth.uid()` |
| socratic_pins | *(no update)* | — | a mark is binary: it stands or it does not |
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

## 9. The tutor shell (6.2) — what the policy looks like when rendered

One page, appended; nothing above is restated. The shell is `/tutor` (`src/app/(portal)/tutor`),
rendered by `src/components/tutor/tutor-shell.tsx` from `src/lib/tutor/data.ts` — **the only
reader**. The reader names two tables (`relationships` where `tutor_id = me AND state = 'active'`;
`profiles.display_name` for the students those rows name) and takes no argument: there is no
parameter through which a caller could ask for another student, another subject, or an ordering
by anything a student did. Reach is still §2's policies; the reader only states "mine" explicitly,
as every student read does since DEC-014.

**What renders, by state**

| state | who has it today | dominant surface (the one `h1`) | below it |
|---|---|---|---|
| A · no active relationship | `tutor-u` (fixture) | *"No student is placed with you."* + why: placing is the academy's act, not this page's; teaching surfaces are not built | nothing — no groups, no region, no count, no control |
| B · relationships, no events | `tutor-a` (fixture; student-c · physics) | *"Nothing to do here."* + the same why | one section per subject (config order), one row per relationship: **display name · subject · nothing else**; rows are not links (no relationship surface exists until 6.3) |
| C · relationships + events | nobody (no events table, 5.6) | fixture on `/dev/tutor-shell` only, labelled | — |

A tutor has no next act (§7 of the 6.1 report: no P6 provider ships), so in every state the
surface is a **statement**, never a control (P6-R4). The harness asserts: zero `a`/`button`/`form`
inside the shell, zero `[disabled]`, zero numerals, zero slot DOM.

**Order** is fixed and non-evaluative — subjects in the 3.1 config order, rows by display name
(`localeCompare`, base sensitivity), ties by opaque id. Never by start date, never by activity.
The sort is one function (`orderRows`) and is shown with a shuffled fixture on `/dev/tutor-shell`.

**P6-R3 made structural.** `TutorContext` is `{ state, groups: SubjectGroup[] }` — subjects
containing rows. There is no top-level array of students, no per-row field but `studentId`
and `displayName`, and the shell has no `enrolments`/`environmentStates` prop. Two attacks
through the shell's own code path fail to compile (`audit/attacks/*.ts`, errors in
`audit/attacks/tsc-output.txt`): asking the reader for a named student (TS2554), and placing a
related student under a subject the reader did not emit (TS2353 ×2).

**Rides along, unchanged (§4):** the related tutor can still read `profiles.role`,
`is_test_account` and timestamps row-grained; the shell renders none of them.

**Third scope of the one slot registry** (`TUTOR_SLOTS` in `src/config/student-slots.ts`): the
same capabilities seen from the tutor's side, each gated on a `live` module AND real data for
this tutor through the reader. All absent; nothing renders. There is no "attention",
"progress" or "activity" region in this scope and none may be added.

**Reader classes** are now a harness dimension (`audit/identity-matrix.cjs`, pin
`audit/identity-matrix.json`): visitor · expired · student A (related) · student B (unrelated)
· tutor T (related to A in one subject) · tutor U (unrelated) · admin recorded as an absence
(`count(role='admin') = 0`, asserted). Named regression row: **tutor T denied student A's draft
door** → `/subjects/physics` · tutorT · 404. Coverage gate: every `page.tsx`/`route.ts` under
`src/app` must have a pinned row; proven by `--drop-row=/tutor/account` → FAIL.

The production role path still does not exist: tutor accounts are created only by
`scripts/test-account.mjs` (service role, `*@test.*.invalid`).

## 6.3 — The relationship's surface (`/tutor/[subject]/[relationship]`)

**What it renders, from the record, and nothing else:** the student's display name (the one h1);
the subject's environment identity (mark · name · environment name · "Environment in draft" when
the config says so); the arc — the same seven steps as Scene 7 and the student's own region,
computed by the same `arcPosition` from the same three facts (account exists · active enrolment ·
`first_entered_at` present) with no events (none exist); the empty-record boundary sentence
(`ARC_COPY.boundary`, one constant); one sentence on what a tutor does here (nothing — a constant);
one link back to the shell. Reader: `getRelationshipView({ subjectId, relationshipId })` — one
query on `relationships` (`tutor_id = auth.uid()` by RLS, `id`, `subject_id`, `state = 'active'`),
then `profiles.display_name`, `enrolments` (active), `environment_state.first_entered_at` ONLY.

**Recency is refused (P6-R2 amendment).** The arc renders a *position*, never a *when*: the tutor
sees that the student has entered the room, not when, not how often, not how long ago. The reason
is the ruling's: position is a state of the learning; recency is a measure of the person, and a
measure invites judgement before any teaching exists. `first_entered_at` is read as present/absent
and the value is never rendered, never put in aria, never in metadata. `entry_count`,
`last_entered_at`, `profiles.role/is_test_account/timestamps` ride along with the row (RLS cannot
hide a column) and are never selected (`relationship-attack-5.ts` pins `lastEnteredAt` out of the
view type). Harness: `Test 13` greps the surface, title, meta description and aria labels for
last/active/since/days/ago/seen/visited/opened/date/week/hours/minutes/yesterday/today.

**The absence rule (P6-R9).** Never-related · ended · nonexistent → one status (404), one document,
one code path: the reader returns `null` for every reason, and `null` has exactly one exit,
`notFound()`. The same holds for a user id in the slot, garbage, the right id under the wrong
subject, an unknown subject, and the same URL opened by an unrelated tutor. Proven per run by
`audit/relationship.cjs` (canonical-document hash; raw bytes differ only by the echoed params and
the React Flight stream order, shown by the same URL fetched four times). A probe therefore learns
nothing: there is no "this exists but not for you".

**Where the tutor's own arrangements (including ended ones) will live later:** nowhere in this
step. The shell lists active relationships only; an ended relationship vanishes from the row list
and its URL becomes indistinguishable from a nonexistent one. When the academy needs a tutor to see
their own history of placements, that is a surface over `relationships` filtered by `tutor_id`
and `state`, on the tutor's side (an "arrangements" view in the shell's scope, P7+ at the earliest),
and it must come with its own ruling — because showing a tutor "you used to teach X" is a fact
about the tutor's arrangements that also names a student who is no longer theirs.

**Observation:** no access-log row is written for a tutor read (owner ruling pending; reported).
The surface sends no beacon and includes no analytics (`Test 22`).


## 6.4 — The levers (`/tutor/[subject]/environment`) — the first writing tutor surface

**What a tutor may change.** Two levers, each a closed authored set, each applying to the whole
subject: **density** (sparse · balanced · dense — every motif renderer reads it; the Room reduces one
step) and **motion character** (precise · energetic · reactive · growing · editorial · sequential —
the ambient lens reads it; it is off under `prefers-reduced-motion` and on small screens regardless
of the choice). The table is `public.environment_settings` (migration 0003): primary key
`subject_id` (so at most one row per subject), `density` and `motion_char` CHECK-constrained to the
authored lists (an unauthored value is a `check_violation`, not a row), `shaped_by`, `updated_at`.

**What a tutor may never change.** The subject's identity: accent triad, mark, brand frame, type,
motion grammar, spacing — none is a column, none is a control, and `validate.ts` re-asserts the
identity checks (contrast · ΔE · focus ring) for every combination so a lever cannot move them.
Atmosphere (declared, read by no renderer) and motif (one kind per subject) have one value each and
are not presented. There is no free text, no hex, no number, no upload.

**Blast radius.** A lever applies to everyone in the subject — every student, including students
the tutor does not teach, and any other tutor placed in the subject. The surface says so in plain
words, in the form, before the save control: *"Saving changes the Physics environment for everyone
in Physics — every student, including students you do not teach, and any other tutor placed in
Physics. There is one Physics room."* (`LEVERS_COPY.blastRadius`). The sentence is unconditional:
the policy that would let the surface *count* the other tutors placed in a subject does not exist
(a tutor may read only their own relationships), and this step adds no policy; see
`docs/proposed/environment_shared_note.sql` for the narrow read a future ruling could grant.

**Who shaped it last.** The state line reads one of three constants: *This environment is as
authored.* · *Last shaped by you.* · *Last shaped by another tutor.* No
name, no date. `shaped_by`/`updated_at` record the tutor's own action on design configuration and
nothing about any student; the environment never renders them.

**Revert.** Deleting the row is the revert, always a real action when a row exists (the authored
default is validated at build; putting it back is safe by construction). When the room is as
authored there is nothing to put back and no revert control is rendered (a control that changes
nothing is a false affordance, P6-R4).

**Silence toward students (a decision, P6-R10).** No notice, no changelog, no history, no "shaped
by" on any student-facing surface. The subject simply looks as it is set. The shaping surface states
this (`LEVERS_COPY.noNotice`).

**Who may write (the SQL).** `environment_settings_select_all` — `anon, authenticated`: `true` (public,
like the subject). `environment_settings_insert_related_tutor` / `_update_related_tutor` — `authenticated`, `exists (select 1
from relationships r where r.tutor_id = auth.uid() and r.subject_id = environment_settings.subject_id
and r.state = 'active')` (WITH CHECK on insert; USING + WITH CHECK on update). No delete policy was
needed beyond the same predicate: `environment_settings_delete_related_tutor` uses it. Students, unrelated tutors,
tutors whose placement in the subject has ended, and visitors are denied (`rls_test.sql` 6.4 block:
20 assertions, 76 total). The route checks placement server-side as defence in depth; RLS decides.

**Absence (distinct from P5-R6).** No row means *as authored* — a complete value, not a missing one.
A failed read also renders the authored default, but is logged and marked
`source: "authored-after-failed-read"`, never silently equal to "as authored" in the system's own
record (`src/lib/environment/settings.ts`, header comment).

**Reach.** `/tutor/[subject]/environment` resolves only for a tutor with an active placement in that
subject; otherwise one `notFound()`, the same canonical document as an unknown subject. There is no
link to it from the 6.2 shell yet (the shell's composition is not this step's to touch); it is
reached by URL. Reported as an open item.

### 6.5 amendments (P6-R17 · P6-R19 · Item 5)

**The way in.** One quiet link — *Shape the {Subject} environment* — on each subject group in the tutor
shell and, for a reader holding an active relationship in that subject, on the environment page's
header. Never on a relationship's surface (that would read as "shape it for this student"). Weight
below a row; never a primary. Rendered only where the write permission exists.

**The door (P6-R19).** A reader with an active relationship in a subject may view that subject's
environment page, draft or not, rendered as the visitor's rendering: identity, structure, honest
labels. No student region, no threshold, no student data — those stay gated on role=student +
enrolment. The relationships read is the tutor's own rows under the 6.1 policy: NO NEW POLICY. The
6.2 gate row "tutor T denied student A's draft door" now reads "tutor T is admitted to the draft
environment's identity, and denied every student region of it" (DEC-018).

**The note (Item 5).** The blast sentence is structural and unchanged. The state line for a row
another tutor shaped reads *Last shaped by another tutor.* — the fact the row carries, not a claim
that a co-tutor is currently placed. Co-teacher awareness remains an open user question with a
policy attached; `docs/proposed/environment_shared_note.sql` stays a proposal.

## 6.5 — The tutor's states, the account surface, the honest distance (P6-R14 · P6-R15 · P6-R16)

**The account surface (P6-R14).** `/tutor/account` shows the reader their own display name and email, their
role as a fact (`Role · tutor` — a `<dd>`, not a control), and Sign out. Nothing else: no settings, no
preferences, no roadmap. It was already this since 6.2 (the same file as the student's, role swapped); 6.5
read it against the ruling and confirmed it — the student's is the precedent and the two are structure-identical
(harness gate `account-matches-student`). No role is selectable, requestable or acquirable from any tutor
surface. Where a tutor's own arrangements (active · ended relationships) will live: the shell, not this page —
`docs/TUTOR_DISTANCE.md` row 5; requires the consent ruling; not built.

**The write's four cases (P6-R15), observed.** Failed/known: `303 ?shape=failed`, one sentence, row untouched.
Unknown: the browser's own failure, nothing of ours, the GET shows the truth. Session ended mid-save: the proxy
now sends `next=/tutor/[subject]/environment` (the settling GET) with `reason=ended`; signing in lands on the
values in force. **Concurrent co-tutor change: last-write-wins and SILENT** — reported, not built around.

**The shaping surface's read failure.** The honest page, never a form pre-filled with defaults
(`docs/STATE_LANGUAGE.md`, 6.5 addendum, T3).

**The distance (P6-R16).** `docs/TUTOR_DISTANCE.md` — every unbuilt capability, where its sentence is, what
delivers it. No place was added for a missing capability; `/tutor/[subject]` deliberately does not exist.
