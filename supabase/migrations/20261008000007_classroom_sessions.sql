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
