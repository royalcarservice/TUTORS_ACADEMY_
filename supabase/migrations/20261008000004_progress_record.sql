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
