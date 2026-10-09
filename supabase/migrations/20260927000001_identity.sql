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

-- ── Subjects: the governed slugs (3.1). Mirrors src/lib/subjects config;
--    scripts/check-subject-sql.mjs asserts the two lists are identical.
--    DEC-047 (2026-10-09): seven by explicit owner mandate — computer-science
--    joins as a first-class subject (live DBs converge via migration 0015). ──
create or replace function public.is_subject_id(p text) returns boolean
language sql immutable as $$
  select p in ('mathematics','physics','chemistry','biology','english','history','computer-science')
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
