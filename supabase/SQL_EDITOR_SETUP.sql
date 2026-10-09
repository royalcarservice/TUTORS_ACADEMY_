-- ════════════════════════════════════════════════════════════════════
-- TUTORS ACADEMY — ONE-SHOT SQL EDITOR SETUP
-- Concatenation of supabase/migrations/ 0001-0014 in exact order.
-- Paste the ENTIRE file into the Supabase SQL Editor and press Run.
-- Safe on a fresh project. If any statement errors, NOTHING applies
-- (single transaction) — report the error line and stop.
-- ════════════════════════════════════════════════════════════════════

-- ── 20260927000001_identity.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 5 · Step 1 — IDENTITY SUBSTRATE (migration 0001)
-- Provider: Supabase (Auth + Postgres + RLS)  ·  Ruling P5-R1
--
-- WHAT THIS CREATES
--   public.profiles           one row per auth user: role + display name
--   public.enrolments         student ↔ subject relationship (the CHOICE)
--   public.environment_state  what is genuinely known about a student inside
--                             an environment. `position` is NULLABLE ON
--                             PURPOSE: today there is nothing inside an
--                             environment to be AT (3.6 — identity, structure,
--                             atmosphere, labelled regions). No code may
--                             invent a position the row does not hold.
--
-- WHAT THIS DOES NOT CREATE (honesty: module registry says `planned`)
--   classes, recordings, assignments, tests, payments, AI, tutor rosters.
--   Phases 6–9 add tables; they do not restructure these.
--
-- ENFORCEMENT: the permission matrix (docs in PHASE5_STEP1 report §5) is
-- implemented HERE as row-level-security policies. Application checks are a
-- convenience; the policy is the boundary. Tests: supabase/tests/rls_test.sql
-- ============================================================================

-- ── Roles ────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum ('student', 'tutor', 'admin');
exception when duplicate_object then null; end $$;

-- ── Subjects: the six immutable slugs (3.1). Mirrors src/lib/subjects config;
--    scripts/check-subject-sql.mjs asserts the two lists are identical. ──────
create or replace function public.is_subject_id(p text) returns boolean
language sql immutable as $$
  select p in ('mathematics','physics','chemistry','biology','english','history')
$$;

-- ── profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          public.user_role not null default 'student',
  display_name  text not null default '' check (char_length(display_name) <= 80),
  is_test_account boolean not null default true,   -- Phase 5: EVERY account is a test account (P5-R1 Part 7)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table public.profiles is 'One row per auth user. role is set at signup (student|tutor); admin is never self-serve.';
comment on column public.profiles.is_test_account is 'Phase 5: signup is for test accounts only. Real onboarding is out of scope until the legal blockers are resolved by the owner.';

-- ── enrolments ───────────────────────────────────────────────────────────────
create table if not exists public.enrolments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.profiles (id) on delete cascade,
  subject_id   text not null check (public.is_subject_id(subject_id)),
  status       text not null default 'active' check (status in ('active', 'withdrawn')),
  enrolled_at  timestamptz not null default now(),
  unique (student_id, subject_id)
);
comment on table public.enrolments is 'The student''s choice. Enrolment is a stronger relationship than public availability: a student enrolled in a draft subject is never locked out of their own environment (5.3 rule).';

-- ── environment_state ────────────────────────────────────────────────────────
create table if not exists public.environment_state (
  student_id       uuid not null references public.profiles (id) on delete cascade,
  subject_id       text not null check (public.is_subject_id(subject_id)),
  first_entered_at timestamptz not null default now(),
  last_entered_at  timestamptz not null default now(),
  entry_count      integer not null default 1 check (entry_count >= 1),
  position         jsonb,        -- NULL until something inside an environment exists to point at (Phase 7+)
  updated_at       timestamptz not null default now(),
  primary key (student_id, subject_id),
  foreign key (student_id, subject_id) references public.enrolments (student_id, subject_id) on delete cascade
);
comment on column public.environment_state.position is 'NULLABLE BY DESIGN. Populated only when a real in-environment location exists (Phase 7 classes / Phase 8 recordings). The resume surface renders only populated fields.';

-- ── updated_at maintenance ───────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists environment_state_touch on public.environment_state;
create trigger environment_state_touch before update on public.environment_state for each row execute function public.touch_updated_at();

-- ── profile auto-creation on signup ──────────────────────────────────────────
-- role comes from signup metadata; anything other than student|tutor collapses
-- to student. admin is granted only by the service role (never self-serve).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  requested text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  chosen public.user_role := case when requested = 'tutor' then 'tutor'::public.user_role else 'student'::public.user_role end;
begin
  insert into public.profiles (id, role, display_name)
  values (new.id, chosen, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 80))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ── helpers used by policies ─────────────────────────────────────────────────
create or replace function public.current_role_of(uid uuid) returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = uid
$$;

-- ── ROW LEVEL SECURITY — the permission matrix ──────────────────────────────
alter table public.profiles          enable row level security;
alter table public.enrolments        enable row level security;
alter table public.environment_state enable row level security;
-- Force RLS even for the table owner (defence in depth).
alter table public.profiles          force row level security;
alter table public.enrolments        force row level security;
alter table public.environment_state force row level security;

-- profiles: a user reads and updates their own row; cannot change their role.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and role = public.current_role_of(auth.uid()));
-- no insert policy for authenticated: rows are created by the signup trigger (security definer).
-- no delete policy: account deletion cascades from auth.users (service role / dashboard).

-- enrolments: a student reads, creates and withdraws their own; never another student's.
drop policy if exists enrolments_select_own on public.enrolments;
create policy enrolments_select_own on public.enrolments for select to authenticated using (student_id = auth.uid());
drop policy if exists enrolments_insert_own on public.enrolments;
create policy enrolments_insert_own on public.enrolments for insert to authenticated
  with check (student_id = auth.uid() and public.current_role_of(auth.uid()) = 'student');
drop policy if exists enrolments_update_own on public.enrolments;
create policy enrolments_update_own on public.enrolments for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- environment_state: own rows only, and only for a subject the student is enrolled in (FK enforces).
drop policy if exists env_select_own on public.environment_state;
create policy env_select_own on public.environment_state for select to authenticated using (student_id = auth.uid());
drop policy if exists env_insert_own on public.environment_state;
create policy env_insert_own on public.environment_state for insert to authenticated with check (student_id = auth.uid());
drop policy if exists env_update_own on public.environment_state;
create policy env_update_own on public.environment_state for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- anon: NO policies on any table → zero rows visible. Visitors need no account
-- for anything that does not persist (/, /subjects), and nothing here is read
-- by a visitor.
-- tutor: NO policies yet. Phase 6 adds roster-scoped read policies; nothing is
-- pre-granted. A tutor today sees only their own profile row.
-- service_role bypasses RLS by definition; it is server-only (see src/lib/supabase/service.ts).

-- ── grants (Supabase default roles) ─────────────────────────────────────────
grant usage on schema public to anon, authenticated, service_role;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.enrolments to authenticated;
grant select, insert, update on public.environment_state to authenticated;
grant all on public.profiles, public.enrolments, public.environment_state to service_role;
revoke all on public.profiles, public.enrolments, public.environment_state from anon;

-- ── 20261001000002_relationship.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 6 · Step 1 — THE RELATIONSHIP (migration 0002)
-- Rulings P6-R1 (the relationship), P6-R2 (visibility default), P6-R3 (not a
-- management console). Provider: Supabase (Postgres + RLS), ruling P5-R1.
--
-- WHAT THIS CREATES
--   public.relationships   one row = one tutor ↔ one student ↔ one subject.
--                          Scoped, explicit, revocable. Nothing exists by
--                          default; nothing is inferred from enrolment, from
--                          browsing, or from sharing a subject. An ENDED row is
--                          kept: ended is not the same as never existed.
--   public.is_related_tutor(student, subject)   the ONE predicate every tutor
--                          read policy uses ("there is an ACTIVE relationship
--                          between auth.uid() and this student in this subject").
--   Four SELECT policies for tutors — relationships (own), enrolments,
--   environment_state, profiles — each gated by that predicate. Two SELECT
--   policies for students on relationships (own): a student may always see who
--   is related to them (DPDP transparency; P6-R1 "the student can see it").
--
-- WHAT THIS DOES NOT CREATE
--   No INSERT / UPDATE / DELETE policy for anyone. The creation flow is not
--   decided (P6-R1 options are reported, not built); until it is, only the
--   service role writes rows, and only between test accounts (E-07).
--   No roster, no counts, no aggregates, no views over other tutors' students.
--   No new table other than the relationship model (6.1 constraint).
--   No reference to subject STATUS anywhere (E-13 ruling: identity is checked
--   in the DB via public.is_subject_id; status lives in TypeScript only).
--
-- ENFORCEMENT: RLS is the boundary (P5-R1 / P6-R2). App code may narrow what it
-- renders; it never widens what the policy allows. Tests:
--   supabase/tests/rls_test.sql  (extended: non-related · other subject ·
--   ended relationship · shared subject without relationship).
--
-- CHANGING THE DEFAULT: edit a policy's USING clause or the predicate function.
-- Never a schema rewrite. docs/TUTOR_VISIBILITY.md states the cost of each
-- tightening / loosening.
-- ============================================================================

-- ── relationships ────────────────────────────────────────────────────────────
create table if not exists public.relationships (
  id          uuid primary key default gen_random_uuid(),
  tutor_id    uuid not null references public.profiles (id) on delete cascade,
  student_id  uuid not null references public.profiles (id) on delete cascade,
  subject_id  text not null check (public.is_subject_id(subject_id)),   -- E-13: identity checked, status never
  state       text not null default 'active' check (state in ('active', 'ended')),
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  check (tutor_id <> student_id),
  constraint relationships_ended_consistent check ((state = 'active' and ended_at is null) or (state = 'ended' and ended_at is not null))
);
comment on table public.relationships is
  'P6-R1: one tutor, one student, one subject. Explicit and revocable; never inferred. Ended rows are retained — ended is not "never existed". No self-serve write path exists (creation flow undecided).';
comment on column public.relationships.state is 'active | ended. Only ACTIVE rows grant any visibility (P6-R2).';

-- One ACTIVE relationship per (tutor, student, subject). Ended rows may repeat
-- (a relationship can be ended, and later a new one begun).
create unique index if not exists relationships_one_active
  on public.relationships (tutor_id, student_id, subject_id) where state = 'active';
-- Lookups the policies make.
create index if not exists relationships_by_student_subject
  on public.relationships (student_id, subject_id) where state = 'active';

-- ── the one predicate ────────────────────────────────────────────────────────
-- SECURITY DEFINER so a policy on enrolments/environment_state/profiles can
-- consult relationships without recursing through relationships' own RLS.
-- It answers exactly one question and takes no role shortcut: a student, an
-- admin or anyone else without an ACTIVE row as tutor gets false.
create or replace function public.is_related_tutor(p_student uuid, p_subject text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.relationships r
    where r.tutor_id = auth.uid()
      and r.student_id = p_student
      and r.subject_id = p_subject
      and r.state = 'active'
  )
$$;
revoke all on function public.is_related_tutor(uuid, text) from public;
grant execute on function public.is_related_tutor(uuid, text) to authenticated, service_role;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.relationships enable row level security;
alter table public.relationships force row level security;

-- relationships: each party reads the rows they are a party to (active AND ended —
-- a student may see that a relationship existed and was ended; so may the tutor).
drop policy if exists relationships_select_tutor on public.relationships;
create policy relationships_select_tutor on public.relationships
  for select to authenticated using (tutor_id = auth.uid());
drop policy if exists relationships_select_student on public.relationships;
create policy relationships_select_student on public.relationships
  for select to authenticated using (student_id = auth.uid());
-- NO insert / update / delete policies: see header. Service role only.

-- enrolments: a related tutor reads the ONE enrolment row the relationship names
-- (that student, that subject). Other subjects of the same student stay invisible.
drop policy if exists enrolments_select_related_tutor on public.enrolments;
create policy enrolments_select_related_tutor on public.enrolments
  for select to authenticated using (public.is_related_tutor(student_id, subject_id));

-- environment_state: the arc facts for that student in that subject
-- (first/last entered, position). Same predicate, same scope.
drop policy if exists env_select_related_tutor on public.environment_state;
create policy env_select_related_tutor on public.environment_state
  for select to authenticated using (public.is_related_tutor(student_id, subject_id));

-- profiles: the related student's row — so the tutor can address them by display
-- name. (RLS is row-grained: the row carries role / is_test_account / timestamps
-- as well. No contact or auth field lives in profiles; email stays in auth.users,
-- which no policy here reaches. See TUTOR_VISIBILITY.md → "what rides along".)
drop policy if exists profiles_select_related_tutor on public.profiles;
create policy profiles_select_related_tutor on public.profiles
  for select to authenticated using (
    exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid() and r.student_id = profiles.id and r.state = 'active'
    )
  );

-- ── grants ───────────────────────────────────────────────────────────────────
-- Supabase's default privileges grant ALL on new tables to anon/authenticated;
-- RLS alone (no write policy) already refuses writes, but the grant is revoked
-- too so a write is refused at BOTH layers (privilege, then policy).
revoke all on public.relationships from anon, authenticated;
grant select on public.relationships to authenticated;     -- rows still gated by RLS
grant all on public.relationships to service_role;

-- ── 20261002000003_environment_settings.sql ─────────────────────────────────────────────
-- ============================================================================
-- Phase 6 · Step 4 — THE LEVERS: environment_settings
-- ONE NEW TABLE AND NOTHING ELSE (no function, no view, no column elsewhere).
--
-- P6-R10  The environment belongs to the SUBJECT. This table is keyed by the
--         subject's immutable id and has NO student column, NO relationship
--         column, NO tutor-scoped key — a per-student (or per-tutor) room is
--         not expressible here, and there is no path to one short of a new
--         migration that this ruling forbids.
-- P6-R11  Levers are CHOSEN, never authored: every lever column is CHECKed
--         against the authored closed set (mirrors src/lib/subjects/subjects.ts
--         DENSITIES / MOTION_CHARS; scripts/check-subject-sql.mjs asserts the
--         two lists agree). A value that is not authored cannot be stored.
--         Identity is NOT here: no accent, no mark, no type, no motion grammar,
--         no atmosphere (declared-but-inert lever, 3.7 — nothing reads it),
--         no motif (each motif kind IS one subject's identity).
-- P6-R12  One Physics. PRIMARY KEY (subject_id) makes two settings rows for
--         one subject impossible. ABSENCE OF A ROW = THE AUTHORED DEFAULT
--         (the one place in this product where a missing row legitimately
--         means a real value — see src/lib/environment/settings.ts).
--         shaped_by / updated_at are the tutor's OWN record of their OWN
--         action on design config. They say nothing about any student.
-- E-13    subject identity is checked via public.is_subject_id; subject STATUS
--         stays in TypeScript and never appears here.
--
-- RLS (the enforcement point — app code never filters for authorization):
--   SELECT  anon + authenticated: the environment is public design config,
--           the same identity a visitor sees (4.5: identity is public, depth
--           is not). Deliberate.
--   INSERT / UPDATE / DELETE  authenticated with AT LEAST ONE ACTIVE
--           RELATIONSHIP IN THAT SUBJECT (public.is_related_tutor is
--           per-student; this predicate is per-subject and is written inline
--           so no new function is introduced), and the row must name
--           themselves as shaped_by. DELETE is the REVERT: removing the row
--           returns the room to the authored default. Students, unrelated
--           tutors, visitors, and a tutor writing for a subject they do not
--           relate in: denied by policy.
-- ============================================================================

create table if not exists public.environment_settings (
  subject_id   text        primary key check (public.is_subject_id(subject_id)),
  density      text        not null check (density in ('sparse', 'balanced', 'dense')),
  motion_char  text        not null check (motion_char in ('precise', 'energetic', 'reactive', 'growing', 'editorial', 'sequential')),
  shaped_by    uuid        not null references auth.users (id) on delete restrict,
  updated_at   timestamptz not null default now()
);

comment on table  public.environment_settings is '6.4: the two adjustable levers of ONE subject environment. No student scope exists or may be added (P6-R10). Absence = authored default (P6-R12).';
comment on column public.environment_settings.shaped_by is 'The tutor who last shaped this environment: their own action on design config, not a fact about any student.';

alter table public.environment_settings enable row level security;
alter table public.environment_settings force row level security;

-- the environment is public design config
drop policy if exists environment_settings_select_all on public.environment_settings;
create policy environment_settings_select_all on public.environment_settings
  for select to anon, authenticated using (true);

-- a tutor with at least one ACTIVE relationship in the subject may shape it
drop policy if exists environment_settings_insert_related_tutor on public.environment_settings;
create policy environment_settings_insert_related_tutor on public.environment_settings
  for insert to authenticated
  with check (
    shaped_by = auth.uid()
    and exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid() and r.subject_id = environment_settings.subject_id and r.state = 'active'
    )
  );

drop policy if exists environment_settings_update_related_tutor on public.environment_settings;
create policy environment_settings_update_related_tutor on public.environment_settings
  for update to authenticated
  using (
    exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid() and r.subject_id = environment_settings.subject_id and r.state = 'active'
    )
  )
  with check (
    shaped_by = auth.uid()
    and exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid() and r.subject_id = environment_settings.subject_id and r.state = 'active'
    )
  );

-- REVERT: delete the row → the authored default
drop policy if exists environment_settings_delete_related_tutor on public.environment_settings;
create policy environment_settings_delete_related_tutor on public.environment_settings
  for delete to authenticated
  using (
    exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid() and r.subject_id = environment_settings.subject_id and r.state = 'active'
    )
  );

grant select on public.environment_settings to anon, authenticated;
grant insert, update, delete on public.environment_settings to authenticated;

-- ── 20261008000004_progress_record.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 7 · Step 1 — THE PROGRESS RECORD (migration 0004)
-- DEC-008/009 (5.6): "creating progress_record is Phase 7's first task".
-- P5-R6: progress is a record, not a score.
--
-- SHAPE — THE RULED ONE. This is docs/proposed/progress_record.sql moved to
-- supabase/migrations/ with its open questions resolved as declared there and
-- in DEC-022:
--   One row = one fact about a real object: who (student_id) · which
--   environment (subject_id) · what kind (a CLOSED set mirroring
--   src/lib/progress/events.ts EVENT_KIND_MODULE) · when (at — a real
--   timestamp) · what it refers to (ref_id). AND NOTHING ELSE: no score, no
--   duration, no engagement, no inferred value, NO STORED DERIVED VALUE.
--
-- RECONCILIATION WITH THE PHASE 7 BRIEF (recorded in DEC-022). The brief
-- sketched (student_id, subject_id, milestone_key, record_type, metadata,
-- created_at) while citing this proposal as its reference; the proposal and
-- 5.6's code (ProgressEvent, STEP_EVIDENCE, admissibleKinds, arcPosition)
-- are the ruled shape, so the mapping is:
--   record_type   -> kind (the closed set; a kind may exist only once the
--                    object it refers to exists — EVENT_KIND_MODULE)
--   milestone_key -> STEP_EVIDENCE (kind -> arc step = milestone; the arc's
--                    vocabulary, never a second one)
--   metadata      -> REFUSED by P5-R6 ("AND NOTHING ELSE"); nothing inferred,
--                    nothing stored that can be derived at read time
--   created_at    -> at (the real timestamp of the FACT, not of the insert)
--
-- THE REFERENT QUESTION (DEC-009) — resolved NEUTRAL for now: ref_id is a
-- plain uuid NOT NULL with NO foreign key. Phase 7's session table (its key
-- type, deletion semantics, whether a session can be attended twice) does
-- not exist yet, so the typed-column (a) and join-table (c) variants cannot
-- be built honestly; polymorphic-lite (b) is the declared interim with its
-- cost stated: the database cannot guarantee the referent exists — the
-- recording capability must, and the moment P7's session table lands this
-- column gains a real FK (or the table moves to variant (c)) by ruling.
--
-- UNIQUESS — the proposal's placeholder (student_id, kind, at), refined with
-- subject_id: a student may legitimately be in two subjects at one instant,
-- and the subject is part of the fact. Still a placeholder: the final key
-- follows the referent ruling.
--
-- RLS — enabled AND forced. Policies:
--   students read their OWN rows;
--   a RELATED TUTOR reads rows in the subject of an ACTIVE relationship —
--   the one predicate Phase 6 ruled for every tutor read (TUTOR_VISIBILITY
--   §2: "a future table must add its own policy using the same predicate").
--   NO INSERT / UPDATE / DELETE policy for any role: writes belong to the
--   capability that owns the referent (P7 sessions, P8 recordings), on a real
--   occurrence — NEVER by a page render, a prefetch or a client call. The
--   service role bypasses RLS by construction; until a capability exists,
--   only it can write, and only between test accounts (E-07).
-- RETENTION: UNDECIDED (DEC-009). Nothing here encodes a retention
-- assumption — no TTL, no partition, no purge trigger.
-- ============================================================================

create table public.progress_record (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references auth.users(id) on delete cascade,
  subject_id  text not null check (public.is_subject_id(subject_id)),  -- E-13: identity checked, status never
  kind        text not null check (kind in ('session-attended', 'recording-watched', 'work-submitted')),
  at          timestamptz not null,
  ref_id      uuid not null,   -- the real object's id; neutral until the referent ruling (see header)
  unique (student_id, subject_id, kind, at)   -- placeholder uniqueness (see header)
);

comment on table public.progress_record is
  'A RECORD OF LEARNING EVENTS, NOT OF BEHAVIOUR (P5-R6). One row = one fact about a real object at a real time. '
  'FORBIDDEN: page views, clicks, session length, device, IP, location, any engagement metric, any stored summary or derived value. '
  'Personal data about minors: no export, no aggregation, no sharing, no third-party access. '
  'Never used for analytics of any kind.';
comment on column public.progress_record.kind is
  'Closed set mirroring src/lib/progress/events.ts. A kind is ADMISSIBLE only while the module owning its referent is live (EVENT_KIND_MODULE).';
comment on column public.progress_record.ref_id is
  'The referent object''s id (session / recording / submission). NO foreign key yet — the referent ruling (DEC-009) is interim-neutral; gains a real FK when P7''s session table lands.';

create index progress_record_student_subject_at on public.progress_record (student_id, subject_id, at desc);

alter table public.progress_record enable row level security;
alter table public.progress_record force row level security;

-- Students read their OWN events. Correct now; does not pre-solve anything.
create policy progress_record_select_own on public.progress_record
  for select to authenticated using (student_id = auth.uid());

-- A related tutor reads events in the subject of an ACTIVE relationship —
-- the same predicate, the same scope, as every other tutor read (6.1 §2).
-- Ended relationship → nothing. Other subjects → nothing.
create policy progress_record_select_related_tutor on public.progress_record
  for select to authenticated using (public.is_related_tutor(student_id, subject_id));

-- NO insert / update / delete policies: a fact, once recorded, is not edited
-- by the person it is about, and no client path may write. The recording
-- capability (P7+) writes through the service role on a real occurrence.

-- Supabase's default privileges grant ALL on new tables to anon/authenticated;
-- RLS alone already refuses writes, but the grant is revoked for defence in
-- depth (the 6.1 pattern).
revoke all on public.progress_record from anon, authenticated;
grant select on public.progress_record to authenticated;   -- rows still gated by RLS
grant all on public.progress_record to service_role;

-- ── 20261008000005_cohorts.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 7 · Step 1 — THE COHORT MODEL, DRAFTED (migration 0005)
--
-- WHAT THIS CREATES
--   public.cohorts        one row = one class group in one subject: a named
--                         group with a scheduled time and a lifecycle state
--                         (scheduled -> active -> concluded). The object the
--                         live-classroom module will deliver sessions against.
--   public.cohort_tutors  the assignment of tutors to a cohort. A JUNCTION,
--                         not a single column, on purpose: Phase 6 proved the
--                         academy must survive two tutors in one subject
--                         (P6-R13's first underdetermination), so the model
--                         never encodes "exactly one tutor".
--
-- SUBJECT ISOLATION. subject_id is CHECKed by public.is_subject_id (E-13:
-- identity in the DB, status never). A cohort belongs to exactly one subject;
-- nothing here crosses subjects.
--
-- WHAT THIS DELIBERATELY DOES NOT DO
--   No memberships table (students in a cohort) — that arrives with the
--   live-room surface, which knows what membership means (consent, capacity).
--   No RLS policies — RLS is ENABLED AND FORCED with ZERO grants of access:
--   nothing is pre-granted (TUTOR_VISIBILITY rule); the policies are written
--   by the step that builds the first reader, using the standing predicates
--   (enrolment for students, is_related_tutor for tutors).
--   No reference to subject STATUS anywhere (E-13).
--
-- THE P6-R13 REOPENING CONDITION (DEC-018 Item 4) is MET by this table's
-- existence: cohort-scoped character levers become arguable. They are NOT
-- reopened by this migration — that remains a ruling with a policy attached,
-- not a schema side effect.
-- ============================================================================

create table public.cohorts (
  id           uuid primary key default gen_random_uuid(),
  subject_id   text not null check (public.is_subject_id(subject_id)),   -- one subject, checked in the DB
  name         text not null check (char_length(name) between 1 and 80),
  scheduled_at timestamptz not null,
  state        text not null default 'scheduled'
               check (state in ('scheduled', 'active', 'concluded')),
  created_at   timestamptz not null default now()
);

comment on table public.cohorts is
  'A class group in one subject (Phase 7 draft). No memberships yet; no reader yet — RLS denies all until the live-room surface writes the policies.';

create table public.cohort_tutors (
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  tutor_id  uuid not null,
  primary key (cohort_id, tutor_id)
);

comment on table public.cohort_tutors is
  'Tutor assignment for a cohort. A junction by design: the academy survives two tutors in one subject (P6-R13).';

create index cohorts_subject_state on public.cohorts (subject_id, state);

alter table public.cohorts enable row level security;
alter table public.cohorts force row level security;
alter table public.cohort_tutors enable row level security;
alter table public.cohort_tutors force row level security;

-- ZERO policies: default-deny for anon and authenticated. The first reader
-- (P7 live-room surface) writes the first policy, using the standing
-- predicates. Service role manages cohorts until a creation flow is ruled
-- (the same posture as relationships, 6.1 §6).
revoke all on public.cohorts from anon, authenticated;
revoke all on public.cohort_tutors from anon, authenticated;
grant all on public.cohorts to service_role;
grant all on public.cohort_tutors to service_role;

-- ── 20261008000006_cohort_readers.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 7 · Step 2 — THE FIRST READER'S POLICIES (migration 0006)
--
-- Migration 0005 created public.cohorts / public.cohort_tutors with RLS
-- ENABLED AND FORCED and ZERO policies, and named its own successor: "the
-- policies are written by the step that builds the first reader, using the
-- standing predicates (enrolment for students, is_related_tutor for
-- tutors)." THIS STEP IS THAT READER (the cohort surface under
-- /subjects/[subject]/live and the next-action class provider).
--
-- WHAT THIS GRANTS (SELECT, and nothing else)
--   students  a cohort in a subject the student is ACTIVELY enrolled in.
--             The enrolment boundary is the student's standing predicate —
--             the same relationship that opens the environment (5.3).
--   tutors    a cohort the tutor is ASSIGNED to (public.cohort_tutors).
--             ONE REFINEMENT of 0005's header, recorded here and in DEC-023:
--             is_related_tutor is the predicate for reading STUDENT ROWS
--             (enrolments, environment_state, progress_record). Cohorts are
--             not student rows; the brief's reader is the ASSIGNED tutor,
--             and assignment is the junction. is_related_tutor keeps
--             governing student-row reads, unchanged.
--   tutors also read their OWN assignment rows in public.cohort_tutors.
--
-- WHAT THIS DELIBERATELY DOES NOT GRANT
--   No student read of public.cohort_tutors: which tutor is assigned to a
--   cohort is tutor presence, and tutor presence is a ruled surface (the P6
--   extension doc: a row slot, resolved by its own phase) — never
--   pre-solved here.
--   No INSERT / UPDATE / DELETE for authenticated: service role manages
--   cohorts (the 6.1 §6 posture, carried forward by 0005). The recording of
--   attendance writes progress_record through the service role on a real
--   occurrence (0004); nothing about that changes here.
--   Zero surveillance by construction: no presence, dwell-time or heartbeat
--   column exists anywhere in this model, and no policy can create one.
-- ============================================================================

-- ── cohorts: the student's boundary is active enrolment in the cohort's subject ──
create policy cohorts_select_enrolled_student on public.cohorts
  for select to authenticated using (
    exists (
      select 1 from public.enrolments e
      where e.student_id = auth.uid()
        and e.subject_id = cohorts.subject_id
        and e.status = 'active'
    )
  );

-- ── cohorts: the tutor's boundary is assignment ───────────────────────────────
create policy cohorts_select_assigned_tutor on public.cohorts
  for select to authenticated using (
    exists (
      select 1 from public.cohort_tutors ct
      where ct.cohort_id = cohorts.id
        and ct.tutor_id = auth.uid()
    )
  );

-- ── cohort_tutors: a tutor reads their own assignment rows ────────────────────
create policy cohort_tutors_select_own on public.cohort_tutors
  for select to authenticated using (tutor_id = auth.uid());

-- The 6.1 pattern: RLS already refuses writes; the grant stays minimal.
-- (RLS on both tables was enabled AND forced by 0005; service_role already
-- holds ALL on both — neither is repeated here.)
grant select on public.cohorts to authenticated;        -- rows still gated by RLS
grant select on public.cohort_tutors to authenticated;  -- rows still gated by RLS

-- ── 20261008000007_classroom_sessions.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 7 · Autonomous runner · MILESTONE 1 (DEC-026)
-- THE SESSIONS TABLE — cohort_sessions
--
-- WHAT THIS CREATES
--   public.cohort_sessions — one row = one live session in one subject,
--   opened by a named tutor: a title, a scheduled instant, and the lifecycle
--   state (scheduled -> active -> concluded). This is the session-of-record
--   the whole chamber has been waiting for: the progress_record's
--   session-attended referent (DEC-009, DEC-022), the next-action engine's
--   Tier 1 ruling input (a session END, when it gains one, unlocks Tier 1 —
--   DEC-023), and the object the participant interface stands inside.
--
-- WHAT THIS DELIBERATELY DOES NOT CREATE
--   No `progress_records` (plural) table: the ruled table is
--   public.progress_record (migration 0004, singular, DEC-009/DEC-022) and
--   its shape is adjudicated — the brief's sketched columns map onto it
--   (milestone_key -> STEP_EVIDENCE, notes -> REFUSED by P5-R6, session_id
--   -> ref_id). A second table would be a second truth; DEC-022 recorded the
--   reconciliation and it stands.
--   No memberships: who stands in a session is enrolment + relationship,
--   decided by RLS at read time (the 0006 posture), never a roster table
--   pre-solving consent and capacity (0005).
--   No reference to subject STATUS anywhere (E-13).
--
-- THE REFERENT RULING (DEC-009's open question, settled in shape)
--   A session-attended fact's ref_id names a row of THIS table (variant (a):
--   we own the session row). A schema-level foreign key is NOT added in this
--   migration, and the reason is recorded rather than silently skipped:
--   progress_record.ref_id is POLYMORPHIC by design — it will refer to
--   sessions now, recordings later, submissions later (events.ts names the
--   three kinds). One column cannot hold three foreign keys; a single FK
--   would pre-solve the other two referents OUT of existence. Enforcement
--   therefore lives at the writer — the service role, on a real occurrence
--   (0004's posture) — until the referent type is partitioned by ruling.
--
-- UPDATED_AT (one column beyond the brief's list, house convention)
--   The 0001 touch trigger maintains it. The chamber state machine
--   (src/lib/classroom/state-machine.ts) needs the instant a session became
--   concluded to honour its SETTLING window; without the column the machine
--   would have to guess, and this academy does not guess.
--
-- WHO MAY WRITE
--   A tutor with an ACTIVE relationship in the subject INSERTS a session, as
--   themselves — the standby sentence ("once your tutor opens the session")
--   becomes literally true. Lifecycle transitions (active -> concluded) and
--   everything else belong to the service role, as in 0005. The brief's
--   `is_related_tutor(auth.uid(), subject_id)` cannot stand as written —
--   that predicate's first argument is a STUDENT and sessions are not
--   student rows — so the tutor boundary is spelled as the standing EXISTS
--   on relationships (the DEC-023 lineage), which asks exactly the question
--   the brief means: an active relationship, this tutor, this subject.
--   (Also: the symmetric profile read — a student reads the displayed name
--   of a tutor they hold an active relationship to — so the participant
--   tile can say "Dr. Vance (Tutor)" without reaching past its boundary.)
-- ============================================================================

create table public.cohort_sessions (
  id           uuid primary key default gen_random_uuid(),
  subject_id   text not null check (public.is_subject_id(subject_id)),   -- one subject, checked in the DB
  tutor_id     uuid not null references public.profiles (id) on delete cascade,  -- the tutor who opens it
  title        text not null check (char_length(title) between 1 and 120),
  scheduled_at timestamptz not null,
  state        text not null default 'scheduled'
               check (state in ('scheduled', 'active', 'concluded')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.cohort_sessions is
  'A live session in one subject, opened by a named tutor (Phase 7). The progress_record session-attended referent (DEC-009 settled in shape, DEC-026); the chamber state machine reads it; lifecycle transitions belong to the service role.';
comment on column public.cohort_sessions.updated_at is
  'Touch-maintained (0001). The state machine''s SETTLING window is measured from the instant the session became concluded — a guess is never a substitute.';

create index cohort_sessions_subject_state on public.cohort_sessions (subject_id, state);

create trigger cohort_sessions_touch
  before update on public.cohort_sessions
  for each row execute function public.touch_updated_at();

-- ── RLS: enabled AND forced; the boundary predicates are the standing ones ──
alter table public.cohort_sessions enable row level security;
alter table public.cohort_sessions force row level security;

-- A student reads the sessions of a subject they are ACTIVELY enrolled in —
-- the same boundary that opens the environment (5.3) and reads cohorts (0006).
create policy sessions_select_enrolled_student on public.cohort_sessions
  for select to authenticated using (
    exists (
      select 1 from public.enrolments e
      where e.student_id = auth.uid()
        and e.subject_id = cohort_sessions.subject_id
        and e.status = 'active'
    )
  );

-- A tutor reads the sessions of a subject where they hold an ACTIVE
-- relationship — P6-R19's logic: a tutor may stand in the room they shape.
create policy sessions_select_related_tutor on public.cohort_sessions
  for select to authenticated using (
    exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid()
        and r.subject_id = cohort_sessions.subject_id
        and r.state = 'active'
    )
  );

-- A tutor OPENS a session as themselves, in a subject where they hold an
-- active relationship. Never as another tutor; never in an unrelated subject.
create policy sessions_insert_related_tutor on public.cohort_sessions
  for insert to authenticated with check (
    tutor_id = auth.uid()
    and exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid()
        and r.subject_id = cohort_sessions.subject_id
        and r.state = 'active'
    )
  );

-- NO update / delete policies: the lifecycle is service-role managed (the
-- 0005 posture). A fact's state changes by occurrence, not by edit.

-- ── the symmetric profile read (DEC-026) ────────────────────────────────────
-- profiles_select_related_tutor (0002) lets a tutor read the profiles of
-- students they hold an active relationship to. The chamber's participant
-- tile needs the OTHER direction — the student must see their tutor's
-- displayed name ("Dr. Vance (Tutor)"). This policy is the exact mirror of
-- the 0002 one, relationship-bounded, SELECT only, name-bearing columns
-- only: a student reads the profile of a tutor they hold an active
-- relationship with, and nothing else.
drop policy if exists profiles_select_related_student on public.profiles;
create policy profiles_select_related_student on public.profiles
  for select to authenticated using (
    exists (
      select 1 from public.relationships r
      where r.student_id = auth.uid() and r.tutor_id = profiles.id and r.state = 'active'
    )
  );

revoke all on public.cohort_sessions from anon, authenticated;
grant select, insert on public.cohort_sessions to authenticated;  -- rows still gated by RLS
grant all on public.cohort_sessions to service_role;

-- ── 20261008000008_phase8_archive.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 8 · Step 1 — SESSION ARCHIVE SCHEMA & STORAGE
-- THE ARCHIVE TABLE — session_artifacts (DEC-029)
--
-- WHAT THIS CREATES
--   public.session_artifacts — one row = one artifact belonging strictly to
--   ONE session in ONE subject: a board vector snapshot (canvas_snapshot),
--   the tutor's pedagogical notes (pedagogical_notes), or a session
--   recording (session_recording). The row names the object's storage path;
--   the bytes live in the private `session-artifacts` bucket below. This is
--   the asynchronous academic archive the recorded-classes module will read:
--   facts about a session that outlive the session, never engagement of any
--   kind — no view counters, no download counts, no popularity, no sharing.
--
-- THE BRIEF'S RECONCILIATIONS (recorded, DEC-029)
--   · Numbered 0008, not the brief's 0005: cohorts owns 0005; migrations are
--     sequential (the DEC-026 precedent).
--   · The brief's "foreign key on subject_id" cannot stand: there is no
--     subjects TABLE — subject identity is CHECKed in the DB via
--     public.is_subject_id and status stays in TS (E-13, DEC-013). So:
--     CHECK, exactly as cohort_sessions spells it.
--   · The brief's `is_related_tutor(auth.uid(), subject_id)` cannot stand as
--     written — that predicate's first argument is a STUDENT (DEC-026
--     recorded this for cohort_sessions; the ruling applies verbatim). The
--     tutor READ boundary is the standing EXISTS on relationships; the tutor
--     WRITE boundary is STRICTER than subject relatedness and never weaker:
--     an artifact may only be written into a session the tutor OPENED
--     (cohort_sessions.tutor_id = auth.uid()) — "the assigned tutor" made
--     exact.
--   · The data-layer signatures carry no userId parameter (P5-R1, the
--     classroom-data posture): identity rides the cookie session and RLS is
--     the ONLY boundary; a second identity argument would be a second truth.
--
-- SUBJECT ISOLATION, STRUCTURAL
--   The pair (subject_id, session_id) is enforced twice: a composite foreign
--   key into cohort_sessions(subject_id, id) makes it IMPOSSIBLE for an
--   artifact to name a session from another subject, and the brief's
--   requested index serves the archive's read shape. storage_path is unique
--   — one artifact per object key, so a path can never point at another
--   artifact's bytes.
--
-- ZERO ENGAGEMENT METRICS
--   The table carries no view/download/popularity/sharing column and its
--   metadata jsonb is capped (16 KB, the DEC-028 budget posture) so a writer
--   cannot smuggle an unbounded payload through it. The archive answers
--   "what happened in this session", never "how popular was it".
--
-- WHO MAY WRITE
--   The tutor who opened the session INSERTS its artifacts (policy below).
--   No UPDATE, no DELETE — the lifecycle is service-role managed (the 0005
--   posture): an artifact's state changes by occurrence, not by edit.
--
-- STORAGE
--   One PRIVATE bucket, `session-artifacts`, objects named
--   {subject_id}/{session_id}/{artifact_id}. The one authenticated policy is
--   a SELECT that defers to the same standing predicates with the subject
--   read from the path — a belt behind the data layer's RLS-gated read, the
--   place a signed URL is issued from (src/lib/archive/data.ts). There is NO
--   authenticated INSERT/UPDATE/DELETE on objects: uploads belong to the
--   service role exactly as lifecycle does (0004's posture), and anon sees
--   nothing because no policy admits it and the bucket is private.
-- ============================================================================

-- The archive's isolation reference (below) needs the pair (subject_id, id)
-- on cohort_sessions to be unique. id is already the primary key, so this
-- constrains nothing new — it only lets the reference stand. Declared BEFORE
-- the table that points at it, so the migration applies in one pass.
alter table public.cohort_sessions
  add constraint cohort_sessions_subject_id_uniq unique (subject_id, id);

create table public.session_artifacts (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.cohort_sessions (id) on delete cascade,
  subject_id    text not null check (public.is_subject_id(subject_id)),   -- one subject, checked in the DB (E-13)
  artifact_type text not null check (artifact_type in ('canvas_snapshot', 'pedagogical_notes', 'session_recording')),
  storage_path  text not null unique check (char_length(storage_path) between 5 and 512 and storage_path not like '/%'),
  metadata      jsonb not null default '{}'::jsonb check (octet_length(metadata::text) <= 16384),
  created_at    timestamptz not null default now(),
  -- Subject isolation, structural: the pair must name ONE real session of
  -- ONE matching subject — an artifact can never sit across the boundary.
  foreign key (subject_id, session_id) references public.cohort_sessions (subject_id, id)
);

comment on table public.session_artifacts is
  'The asynchronous academic archive (Phase 8): one artifact — board snapshot, pedagogical notes or recording — belonging strictly to one session of one subject. Facts, never engagement; lifecycle is service-role managed.';
comment on column public.session_artifacts.storage_path is
  'The object key inside the private session-artifacts bucket: {subject_id}/{session_id}/{artifact_id}. One artifact per key (unique).';
comment on column public.session_artifacts.metadata is
  'Machine facts about the artifact (duration, dimensions, page count). Capped at 16 KB (DEC-028 budget posture); holds no engagement figure by design.';

-- The archive's read shape: one subject's sessions, then their artifacts.
create index session_artifacts_subject_session on public.session_artifacts (subject_id, session_id);

-- ── RLS: enabled AND forced; the boundary predicates are the standing ones ──
alter table public.session_artifacts enable row level security;
alter table public.session_artifacts force row level security;

-- A student reads the archive of a subject they are ACTIVELY enrolled in —
-- the same boundary that opens the environment (5.3) and reads sessions
-- (0007). What counts as the archive (concluded sessions) is the data
-- layer's read shape; the boundary stays subject-scoped, exactly as briefed.
create policy artifacts_select_enrolled_student on public.session_artifacts
  for select to authenticated using (
    exists (
      select 1 from public.enrolments e
      where e.student_id = auth.uid()
        and e.subject_id = session_artifacts.subject_id
        and e.status = 'active'
    )
  );

-- A tutor reads the archive of a subject where they hold an ACTIVE
-- relationship — the 0007 tutor-read boundary, unchanged.
create policy artifacts_select_related_tutor on public.session_artifacts
  for select to authenticated using (
    exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid()
        and r.subject_id = session_artifacts.subject_id
        and r.state = 'active'
    )
  );

-- A tutor WRITES an artifact only into a session they OPENED: the referenced
-- session exists, its subject matches the artifact's subject (belt to the
-- composite foreign key's braces), and its tutor is the writer. Strictly
-- narrower than the brief's subject-level relatedness, never wider.
create policy artifacts_insert_session_tutor on public.session_artifacts
  for insert to authenticated with check (
    exists (
      select 1 from public.cohort_sessions s
      where s.id = session_artifacts.session_id
        and s.subject_id = session_artifacts.subject_id
        and s.tutor_id = auth.uid()
    )
  );

-- NO update / delete policies: the lifecycle is service-role managed (the
-- 0005 posture). An archive fact changes by occurrence, not by edit.

-- ── the private bucket and its one policy ──────────────────────────────────
-- `session-artifacts` is PRIVATE: artifacts are reached only through the data
-- layer's RLS-gated read and the short signed URL it issues — never by a
-- public link. (Noted here, not as a COMMENT ON, because the bucket is a
-- platform table this migration does not own.)
insert into storage.buckets (id, name, public)
values ('session-artifacts', 'session-artifacts', false)
on conflict (id) do nothing;

-- The object's subject is its first path segment; the standing predicates
-- apply to it. SELECT only: uploads belong to the service role, and anon is
-- admitted by no policy at all.
create policy objects_select_session_artifacts on storage.objects
  for select to authenticated using (
    bucket_id = 'session-artifacts'
    and (
      exists (
        select 1 from public.enrolments e
        where e.student_id = auth.uid()
          and e.subject_id = (storage.foldername(name))[1]
          and e.status = 'active'
      )
      or exists (
        select 1 from public.relationships r
        where r.tutor_id = auth.uid()
          and r.subject_id = (storage.foldername(name))[1]
          and r.state = 'active'
      )
    )
  );

revoke all on public.session_artifacts from anon, authenticated;
grant select, insert on public.session_artifacts to authenticated;  -- rows still gated by RLS
grant all on public.session_artifacts to service_role;

-- ── 20261008000009_phase9_socratic.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 9 · Step 1 — SOCRATIC ASSISTANCE ENGINE SCHEMA
-- THE EXCHANGE TABLE — socratic_exchanges (DEC-033)
--
-- WHAT THIS CREATES
--   public.socratic_exchanges — one row = one bounded Socratic exchange:
--   a student's inquiry at a named milestone of a subject, and the
--   structured guidance the engine returned (conceptual hint, Socratic
--   question, proof reference, or — later — a reflection summary). The
--   engine provides conceptual scaffolding and disciplined questions; it
--   NEVER completes homework and it NEVER diagnoses. The payload carries
--   guidance structure, nothing about the student's state of mind: zero
--   psychological diagnosis, zero sentiment grading, by construction.
--
-- THE BRIEF'S RECONCILIATIONS (recorded, DEC-033)
--   · Numbered 0009, not the brief's 0006: cohort_readers owns 0006 (two
--     migrations may not share a sequence number); migrations are
--     sequential (the DEC-026/DEC-029 precedent).
--   · The brief's `is_related_tutor` tutor-read boundary STANDS as written:
--     the standing predicate's signature is exactly (student, subject)
--     (DEC-026's recording), the same boundary the relationships table
--     itself reads through (0002). Phase 8's archive needed the narrower
--     session-opening-tutor boundary for WRITES; the exchange's tutor read
--     is subject-relatedness, exactly as briefed.
--   · Students INSERT their own exchanges: the inquiry log belongs to the
--     inquirer (auth.uid() = student_id), unlike session_artifacts whose
--     writes belong to the session's opening tutor. No UPDATE, no DELETE —
--     an exchange is a record of an occurrence; its state changes by
--     occurrence, not by edit (the 0004/0008 lifecycle posture).
--   · The data-layer signatures carry no userId parameter (P5-R1, the
--     classroom-data posture): identity rides the cookie session and RLS is
--     the ONLY boundary; a second identity argument would be a second truth.
--
-- SUBJECT ISOLATION, STRUCTURAL
--   Every exchange is scoped to the pair (student_id, subject_id): the
--   subject is CHECKed in the DB via public.is_subject_id (E-13), the
--   milestone key names its subject as its first segment (the resolver
--     refuses a key that names another subject — src/lib/socratic), and the
--     brief's index serves the exchange's read shape: one student's
--     exchanges in one subject, ordered by occurrence.
--
-- BOUNDED BY CONSTRUCTION
--   query_text is capped at 500 characters — the contract's limit
--   (src/lib/socratic/contract.ts) mirrored in the DB so the boundary holds
--   even for a writer that skips the contract. response_payload is capped at
--   16 KB (the DEC-028 budget posture): structured guidance, never an
--   unbounded essay. prompt_type is the contract's closed four.
--
-- ANON ADMITTED NOWHERE
--   No policy names anon, grants are revoked from it, and the tutor read
--   defers to the standing related-tutor predicate — a stranger, signed out
--   or signed in without standing, sees zero rows.
-- ============================================================================

create table public.socratic_exchanges (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.profiles (id) on delete cascade,
  subject_id       text not null check (public.is_subject_id(subject_id)),   -- one subject, checked in the DB (E-13)
  milestone_key    text not null check (char_length(milestone_key) between 1 and 128),
  prompt_type      text not null check (prompt_type in ('conceptual_hint', 'socratic_question', 'proof_reference', 'reflection_summary')),
  query_text       text not null check (char_length(query_text) between 1 and 500),
  response_payload jsonb not null default '{}'::jsonb check (octet_length(response_payload::text) <= 16384),
  created_at       timestamptz not null default now()
);

comment on table public.socratic_exchanges is
  'The Socratic assistance engine''s exchange log (Phase 9): one bounded inquiry and its structured guidance, scoped to one student in one subject. Scaffolding, never answers; guidance, never diagnosis.';
comment on column public.socratic_exchanges.milestone_key is
  'The milestone the inquiry names: {subject_id}:{concept-slug}. The resolver refuses a key whose subject segment is not the row''s subject.';
comment on column public.socratic_exchanges.prompt_type is
  'The exchange''s class, the contract''s closed four (src/lib/socratic/contract.ts): conceptual_hint, socratic_question, proof_reference, reflection_summary.';
comment on column public.socratic_exchanges.query_text is
  'The student''s own inquiry, capped at 500 characters — the contract''s limit mirrored in the DB. Brevity is the discipline; bloat is refused.';
comment on column public.socratic_exchanges.response_payload is
  'Machine-readable guidance structure (kind, text, optional artifact reference). Capped at 16 KB (DEC-028 budget posture); holds no diagnosis and no sentiment by design.';

-- The exchange's read shape: one student's exchanges in one subject, in
-- order of occurrence — exactly the brief's index.
create index socratic_exchanges_student_subject_created
  on public.socratic_exchanges (student_id, subject_id, created_at);

-- ── RLS: enabled AND forced; the boundary predicates are the standing ones ──
alter table public.socratic_exchanges enable row level security;
alter table public.socratic_exchanges force row level security;

-- A student reads their own exchanges — the inquirer's own log, no wider.
create policy socratic_select_own_student on public.socratic_exchanges
  for select to authenticated using (student_id = auth.uid());

-- A tutor reads the exchanges of a student they hold an ACTIVE relationship
-- with, in the exchange's subject — the standing predicate, exactly as the
-- relationships table reads through it (0002).
create policy socratic_select_related_tutor on public.socratic_exchanges
  for select to authenticated using (public.is_related_tutor(student_id, subject_id));

-- A student writes their own exchanges only: the row's student is the
-- writer. No other INSERT boundary exists; no UPDATE or DELETE policy
-- exists at all — the lifecycle is service-role managed (0004/0008).
create policy socratic_insert_own_student on public.socratic_exchanges
  for insert to authenticated with check (student_id = auth.uid());

revoke all on public.socratic_exchanges from anon, authenticated;
grant select, insert on public.socratic_exchanges to authenticated;  -- rows still gated by RLS
grant all on public.socratic_exchanges to service_role;

-- ── 20261008000010_phase9_socratic_pins.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 9 · Step 3 — SOCRATIC OVERSIGHT SCHEMA
-- THE PREPARATION MARKS — socratic_pins (DEC-035)
--
-- WHAT THIS CREATES
--   public.socratic_pins — one row = one inquiry a related tutor has marked
--   for their next live dialogue with that student in that subject. This is
--   a DIAGNOSTIC MIRROR, not a surveillance wiretap: the mark is the
--   tutor's own preparation note. It carries no evaluation of the student —
--   no rating, no difficulty flag, no comprehension figure — and nothing
--   about the student's timing or presence. An inquiry stands as asked; the
--   mark only says the tutor intends to return to it.
--
-- THE BRIEF'S RECONCILIATIONS (recorded, DEC-035)
--   · Numbered 0010, sequential (the DEC-026/029/033 precedent).
--   · The data-layer signatures carry no tutorId parameter (P5-R1, the
--     classroom-data posture): the pin's owner rides the cookie session;
--     RLS is the ONLY boundary. The brief's `is_related_tutor` requirement
--     stands — enforced here twice: the standing predicate gates every
--     policy below, and the exchange the mark names must itself be visible
--     to the marker through 0009's tutor-read policy.
--   · A mark is an OCCURRENCE, binary by shape: INSERT marks, DELETE
--     unmarks. No UPDATE policy exists (the 0004/0008/0009 lifecycle
--     posture). One tutor marks one exchange once — the unique pair.
--
-- SUBJECT ISOLATION, STRUCTURAL
--   The mark carries the exchange's (student, subject) pair, CHECKed in the
--   DB, and the insert policy re-derives the pair from the exchange row
--   itself — a mark can never sit across the subject boundary, and a mark
--   can never name an exchange the marker cannot read.
-- ============================================================================

create table public.socratic_pins (
  id         uuid primary key default gen_random_uuid(),
  tutor_id   uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  subject_id text not null check (public.is_subject_id(subject_id)),   -- one subject, checked in the DB (E-13)
  exchange_id uuid not null references public.socratic_exchanges (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- One tutor marks one exchange once; marking again is the same mark.
  unique (tutor_id, exchange_id)
);

comment on table public.socratic_pins is
  'The Socratic oversight''s preparation marks (Phase 9): one inquiry a related tutor marked for their next live dialogue, in the subject of their relationship. A diagnostic mirror — the mark carries no evaluation of the student.';
comment on column public.socratic_pins.exchange_id is
  'The inquiry marked. The insert policy re-derives the (student, subject) pair from the exchange itself; a mark can never name a row its marker cannot read.';

-- The oversight's read shape: one tutor's marks in one subject.
create index socratic_pins_tutor_subject on public.socratic_pins (tutor_id, subject_id);

-- ── RLS: enabled AND forced; the boundary predicates are the standing ones ──
alter table public.socratic_pins enable row level security;
alter table public.socratic_pins force row level security;

-- A tutor reads their own marks, and only while the relationship stands:
-- the standing predicate re-decides on every read (an ended relationship
-- admits nothing, exactly as 0009's tutor read).
create policy pins_select_own_tutor on public.socratic_pins
  for select to authenticated using (
    tutor_id = auth.uid()
    and public.is_related_tutor(student_id, subject_id)
  );

-- A tutor marks an inquiry only when they may READ it: the exchange exists
-- with the mark's own (student, subject) pair, and 0009's tutor-read policy
-- admits it to the marker (the EXISTS runs under that table's RLS).
create policy pins_insert_own_tutor on public.socratic_pins
  for insert to authenticated with check (
    tutor_id = auth.uid()
    and exists (
      select 1 from public.socratic_exchanges e
      where e.id = socratic_pins.exchange_id
        and e.student_id = socratic_pins.student_id
        and e.subject_id = socratic_pins.subject_id
    )
  );

-- Unmarking is the mark's own undoing: the tutor's rows alone, no
-- relatedness re-check needed to let go of one's own preparation note.
create policy pins_delete_own_tutor on public.socratic_pins
  for delete to authenticated using (tutor_id = auth.uid());

-- NO update policy: a mark is binary — it stands or it does not.

revoke all on public.socratic_pins from anon, authenticated;
grant select, insert, delete on public.socratic_pins to authenticated;  -- rows still gated by RLS
grant all on public.socratic_pins to service_role;

-- ── 20261008000011_phase10_legal.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 10 · Step 1 — LEGAL FRAMEWORK SCHEMA
-- THE CONSENT AUDIT — legal_consents (DEC-037, resolves E-07)
--
-- WHAT THIS CREATES
--   public.legal_consents — one row = one consent a person gave: the terms
--   of academy practice, the privacy notice, or a guardian's consent for a
--   minor student (DPDP Act 2023). This is an AUDIT of grants: rows are
--   INSERTED and READ, never updated — a consent is an occurrence, recorded
--   once, exactly as given.
--
-- THE BRIEF'S RECONCILIATIONS (recorded, DEC-037)
--   · Numbered 0011, sequential — the brief's `20261008000007` slot belongs
--     to classroom_sessions (the DEC-029/033 numbering precedent).
--   · The brief's shape stands complete: id · user_id · consent_type ·
--     guardian_email · consented_at · ip_hash. Two declared completions:
--     (1) guardian_email is CHECKed REQUIRED when the consent is a guardian
--     consent and FORBIDDEN otherwise — the column means one thing;
--     (2) ip_hash is CHECKed at 64 characters (a SHA-256 hex digest). The
--     raw address is hashed server-side at the instant of consent and never
--     stored, never returned; when no address is visible to the app, the
--     literal sentinel 'no-address' is hashed instead — the audit says so
--     honestly rather than inventing an address.
--   · APPEND-ONLY, deliberately WITHOUT a (user_id, consent_type) unique
--     constraint: this table is a consent AUDIT, not a state flag — if a
--     future withdrawal-and-regrant flow lands, both events deserve rows.
--     Idempotency is enforced by the write action (it reads the standing
--     consent first and refuses a duplicate calmly) instead of by the DB.
--   · RLS posture is the standing one (0004/0008/0009/0010): enabled AND
--     forced. Users read and write ONLY their own consents. Tutors, admins
--     and anon are admitted NOWHERE — there is no policy that names anyone
--     but the consent's own user, so everyone else is strictly denied by
--     absence (the brief's requirement, enforced the lineage's way).
-- ============================================================================

create table public.legal_consents (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  consent_type   text not null check (consent_type in ('terms_v1', 'privacy_v1', 'guardian_consent_v1', 'terms_v2', 'privacy_v2')),
  guardian_email text check (char_length(guardian_email) <= 254),
  consented_at   timestamptz not null default now(),
  ip_hash        text not null check (char_length(ip_hash) = 64),
  -- guardian_email is REQUIRED for a guardian consent and FORBIDDEN otherwise:
  check (
    (consent_type = 'guardian_consent_v1' and guardian_email is not null)
    or (consent_type <> 'guardian_consent_v1' and guardian_email is null)
  )
);

comment on table public.legal_consents is
  'The legal consent audit (Phase 10): one row per consent granted — terms, privacy, or guardian consent for a minor (DPDP Act 2023). Append-only: rows are inserted and read, never updated.';
comment on column public.legal_consents.guardian_email is
  'The guardian''s email address for a guardian_consent_v1 row; null for every other consent type. Used only for consent verification — never for marketing.';
comment on column public.legal_consents.ip_hash is
  'One-way SHA-256 hex digest of the connecting address at the instant of consent, computed server-side. The raw address is never stored and never returned. If no address is visible to the app, the literal sentinel ''no-address'' is hashed — the audit records absence honestly.';

-- One person's consent history, newest first.
create index legal_consents_user on public.legal_consents (user_id, consented_at desc);

-- ── RLS: enabled AND forced; the consent's own user is the ONLY identity ────
alter table public.legal_consents enable row level security;
alter table public.legal_consents force row level security;

-- A person reads their own consents, and nothing else exists at this
-- boundary: tutors, admins and anon have no policy that admits them.
create policy consents_select_own on public.legal_consents
  for select to authenticated using (user_id = auth.uid());

-- A person records a consent only as themselves: the row's user_id must be
-- the writer's own identity.
create policy consents_insert_own on public.legal_consents
  for insert to authenticated with check (user_id = auth.uid());

-- NO update policy: a consent stands exactly as given.
-- NO delete policy: the audit keeps its rows; they fall only with the
-- profile they belong to (on delete cascade).

revoke all on public.legal_consents from anon, authenticated;
grant select, insert on public.legal_consents to authenticated;  -- rows still gated by RLS
grant all on public.legal_consents to service_role;

-- ── 20261008000012_phase10_onboarding.sql ─────────────────────────────────────────────
-- ============================================================================
-- TUTORS ACADEMY · Phase 10 · Step 2 — PRODUCTION ONBOARDING SCHEMA
-- AGE-GATED AUTHENTICATION (DEC-038)
--
-- WHAT THIS CREATES
--   profiles.date_of_birth       the student's date of birth, NULLABLE —
--                                legacy and test accounts carry none, and
--                                the enrolment gate below treats absence as
--                                "no age condition" (fixtures keep working).
--   profiles.guardian_verified   the DPDP flag: false until a guardian's
--                                consent is verified through the token
--                                handler (/auth/verify-guardian).
--   public.guardian_verifications  one row per verification link issued —
--                                the guardian's email, a ONE-WAY hash of
--                                the token, an expiry, and the instant it
--                                was used. Service-role only: no policy
--                                admits anyone else.
--   the enrolment guardian gate  a BEFORE INSERT trigger on enrolments: a
--                                student whose recorded birth date makes
--                                them a minor cannot be enrolled until
--                                guardian_verified stands true. The DB
--                                enforces the dormancy, not the UI.
--   handle_new_user, extended    now carries date_of_birth from signup
--                                metadata into the profile (a well-formed
--                                date, or nothing — a malformed value is
--                                dropped, never fatal).
--
-- THE BRIEF'S RECONCILIATIONS (recorded, DEC-038)
--   · Numbered 0012, sequential — the brief's number stands (0011 was
--     Phase 10 · Step 1).
--   · THE AGE BOUNDARY, structural: a student is a minor while
--     `date_of_birth + interval '18 years' > current_date`. On the exact
--     18th birthday the comparison is equal, not greater — the student is
--     an adult that day. A 29 February birth clamps to 28 February in
--     common years, exactly as Postgres interval arithmetic does; the
--     platform's pure logic mirrors this convention and pins it by test.
--   · is_test_account stays DEFAULT true. It flips to false ONLY through
--     the service-role write that lands when the verified onboarding path
--     completes with consent (immediately for a consenting adult; at
--     guardian verification for a minor) — the brief's requirement, met by
--     code, not by changing the column's default.
--   · guardian_verifications carries NO policy: RLS is enabled AND forced,
--     and only the service role (which bypasses RLS) reaches it — the
--     strictest posture. The token itself never lands anywhere: only its
--     SHA-256 digest.
-- ============================================================================

-- ── profiles: the onboarding columns ────────────────────────────────────────
alter table public.profiles
  add column if not exists date_of_birth date check (date_of_birth <= current_date);
alter table public.profiles
  add column if not exists guardian_verified boolean not null default false;

comment on column public.profiles.date_of_birth is
  'The student''s date of birth. Nullable: legacy and test accounts carry none, and the enrolment guardian gate treats absence as no age condition. Real student signups supply it; the platform never asks a tutor for it.';
comment on column public.profiles.guardian_verified is
  'DPDP Act 2023: false until a guardian''s consent is verified through the token handler. A minor cannot be enrolled in a subject while this is false — the enrolment trigger enforces it.';

-- ── signup trigger: carry the date of birth from metadata ───────────────────
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  requested text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  chosen public.user_role := case when requested = 'tutor' then 'tutor'::public.user_role else 'student'::public.user_role end;
  dob text := nullif(new.raw_user_meta_data ->> 'date_of_birth', '');
begin
  insert into public.profiles (id, role, display_name, date_of_birth)
  values (
    new.id,
    chosen,
    left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 80),
    case when dob ~ '^\d{4}-\d{2}-\d{2}$' then dob::date end   -- malformed drops to NULL, never fatal
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- ── the enrolment guardian gate ─────────────────────────────────────────────
create or replace function public.enrolment_guardian_gate() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  dob date;
  verified boolean;
begin
  select date_of_birth, guardian_verified into dob, verified
  from public.profiles where id = new.student_id;
  if dob is not null
     and dob + interval '18 years' > current_date
     and not verified then
    raise exception 'guardian consent not verified for this student'
      using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists enrolments_guardian_gate on public.enrolments;
create trigger enrolments_guardian_gate
  before insert on public.enrolments
  for each row execute function public.enrolment_guardian_gate();

-- ── guardian_verifications: the verification link ledger ────────────────────
create table public.guardian_verifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  guardian_email text check (char_length(guardian_email) <= 254),
  token_hash     text not null unique check (char_length(token_hash) = 64),
  created_at     timestamptz not null default now(),
  expires_at     timestamptz not null,
  verified_at    timestamptz
);

comment on table public.guardian_verifications is
  'The guardian consent verification ledger (Phase 10 · Step 2): one row per link issued to a guardian. Service-role only — RLS is enabled and forced with NO policy admitting anyone else. Only the token''s SHA-256 digest is stored; the token itself exists in the link and nowhere else.';
comment on column public.guardian_verifications.token_hash is
  'SHA-256 hex digest of the verification token. The raw token is never stored and never returned.';

create index guardian_verifications_user on public.guardian_verifications (user_id);

alter table public.guardian_verifications enable row level security;
alter table public.guardian_verifications force row level security;
-- NO policies, deliberately: only the service role (which bypasses RLS)
-- reads or writes this table. anon and authenticated are admitted nowhere.

revoke all on public.guardian_verifications from anon, authenticated;
grant all on public.guardian_verifications to service_role;

-- ── 20261008000013_real_onboarding.sql ─────────────────────────────────────────────
-- ============================================================================
-- MIGRATION 0013 — REAL ONBOARDING · TRACK 2
--
--   profiles.approval_status   the credentialing state of a tutor account.
--                              DEFAULT 'approved' so every legacy and test
--                              account keeps standing access unchanged; a
--                              tutor APPLICATION lands as 'pending_approval'
--                              (the apply act writes it, service role) and
--                              an administrator's decision moves it.
--
--   RLS PARITY, asserted: the standing policies key on role and ownership
--   (auth.uid(), current_role_of) and NEVER branch on is_test_account. Real
--   accounts (is_test_account = false) therefore hold exactly the same
--   strict row-level isolation as the test personas. This migration adds no
--   divergent policy on purpose: parity is the existing shape, and the
--   approval column is write-gated to the service role by the table's
--   existing forced-RLS update policy (own row only, role-checked), so a
--   pending tutor cannot approve themselves.
-- ============================================================================

alter table public.profiles
  add column if not exists approval_status text not null default 'approved'
  check (approval_status in ('approved', 'pending_approval', 'rejected'));

comment on column public.profiles.approval_status is
  'Track 2 credentialing state. approved = standing or accepted; pending_approval = a tutor application awaiting an administrator; rejected = decided against. Default approved keeps legacy rows unchanged; only the service role moves it for applications.';

-- ── 20261008000014_payments.sql ─────────────────────────────────────────────
-- ============================================================================
-- 20261008000014_payments.sql — Unfinished Work · Track 3 (DEC-044)
--
-- The financial threshold. Tuition is paid ONCE per term per subject at the
-- checkout door; nothing inside a chamber ever asks for payment again
-- (P6-R8 stands). This table records the threshold, never the pedagogy:
--
--   · students read ONLY their own invoices (receipts, refund states),
--   · admins read all invoices for platform audit,
--   · tutors are STRICTLY DENIED — a tutor's view of a student must never
--     be coloured by who paid (the pedagogical boundary, made structural).
--
-- Settlement (src/lib/payments/settle.ts) is the only writer besides the
-- provider webhook: it flips status to 'settled' and then provisions the
-- enrolment (and, when exactly one tutor is active in the subject, the
-- placement) — the student never waits on a human for the threshold.
-- ============================================================================

create table if not exists public.tuition_invoices (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles (id) on delete cascade,
  subject_id          text not null check (public.is_subject_id(subject_id)),
  amount_cents        integer not null check (amount_cents > 0),
  currency            text not null default 'USD',
  status              text not null check (status in ('pending', 'settled', 'failed', 'refunded')),
  provider            text not null default 'stripe',
  provider_payment_id text,
  created_at          timestamptz not null default now(),
  settled_at          timestamptz
);

comment on table public.tuition_invoices is 'Track 3: the financial threshold. One row per term-subject purchase; settlement provisions enrolment. Tutors have no read path, by policy.';
comment on column public.tuition_invoices.provider_payment_id is 'The provider''s reference for the settled payment; shown on receipts in truncated form only.';

alter table public.tuition_invoices enable row level security;
alter table public.tuition_invoices force row level security;

-- students: their own invoices, and nothing else
drop policy if exists tuition_invoices_select_own on public.tuition_invoices;
create policy tuition_invoices_select_own on public.tuition_invoices
  for select to authenticated
  using (student_id = auth.uid());

-- admins: the whole ledger for platform audit
drop policy if exists tuition_invoices_select_admin on public.tuition_invoices;
create policy tuition_invoices_select_admin on public.tuition_invoices
  for select to authenticated
  using (public.current_role_of(auth.uid()) = 'admin');

-- no insert/update policy for authenticated clients: writes arrive only
-- through the service role (webhook settlement) or the admin console.
-- Tutors: no policy names them — default deny is the pedagogical boundary.
