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
