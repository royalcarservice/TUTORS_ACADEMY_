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
