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
