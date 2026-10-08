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
