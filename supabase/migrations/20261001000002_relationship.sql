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
