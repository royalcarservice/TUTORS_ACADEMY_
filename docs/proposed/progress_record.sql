-- ============================================================================
-- PROPOSED — NOT APPLIED.  docs/proposed/ is NOT supabase/migrations/.
-- This file must never be run by `psql -f`, `supabase db push`, or any script.
-- It becomes a migration only when PHASE 7 moves it there, after the open
-- question below is decided. THE LOCATION IS THE CONTROL.
--
-- Status : proposal, accepted in shape by the owner (5.6 close-out, 2026-09-29)
-- Origin : Phase 5 · Step 6 (P5-R6 "progress is a record, not a score");
--          5.1 never created this table — a 5.1 amendment.
-- PREREQUISITE: CREATING progress_record IS PHASE 7'S FIRST TASK.
--          Nothing in Phase 7 may record an event before it exists, and
--          nothing before Phase 7 may create it.
-- ============================================================================

-- THE EVENT SHAPE, AS RULED. One row = one fact about a real object:
--   who               (student_id — the student; RLS-bounded)
--   which environment (subject_id — the subject's immutable id, 3.1)
--   what kind         (kind — a small CLOSED set; a kind may exist only once
--                      the object it refers to exists; see
--                      src/lib/progress/events.ts EVENT_KIND_MODULE)
--   when              (at — a real timestamp)
--   what it refers to (the real row — SEE THE OPEN QUESTION)
--   AND NOTHING ELSE. No score, no duration unless the object genuinely has
--   one, no engagement, nothing inferred, NO STORED DERIVED VALUE — ever,
--   including "for performance". If it can be derived, it is derived at
--   read time (src/lib/progress) and never persisted.

create table public.progress_record (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references auth.users(id) on delete cascade,
  subject_id  text not null
              check (subject_id in ('mathematics','physics','chemistry','biology','english','history')),
  kind        text not null,        -- closed set; extended ONLY by the phase that builds the referent
  at          timestamptz not null,
  -- ── OPEN QUESTION — STATED, NOT GUESSED ─────────────────────────────────
  -- How does ONE table reference HETEROGENEOUS real objects (a session row,
  -- a recording row, a submission row) with referential integrity?
  --
  --   (a) TYPED COLUMN PER KIND
  --       session_id uuid references sessions(id), recording_id uuid
  --       references recordings(id), submission_id uuid references
  --       submissions(id), with CHECK (exactly one is not null, and it
  --       matches `kind`).
  --       + real foreign keys, cascades, joins are plain
  --       − a new column (and CHECK rewrite) every time a kind is added;
  --         the table's shape changes with the product
  --
  --   (b) object_kind + object_id (polymorphic reference)
  --       object_id uuid not null; `kind` names the target table.
  --       + shape never changes; one column
  --       − NO foreign key: the database cannot guarantee the referent
  --         exists or cascade its deletion; integrity moves to application
  --         code and periodic checks — the opposite of "a fact about a
  --         real object"
  --
  --   (c) JOIN TABLE PER KIND
  --       progress_record holds only who/where/kind/when; a table per kind
  --       (progress_session, progress_recording, …) holds (record_id →
  --       progress_record.id, session_id → sessions.id) with real FKs.
  --       + real FKs AND a stable core; RLS on the core covers ownership
  --       − reads need a join per kind; the "nothing else" rule must be
  --         re-asserted on each side table
  --
  --   UNCHOSEN. Choosing needs Phase 7's real session table (its key type,
  --   its deletion semantics, whether a session can be attended twice).
  --   The TypeScript type (`refId: string`) is deliberately neutral.
  -- ─────────────────────────────────────────────────────────────────────────
  unique (student_id, kind, at)     -- placeholder uniqueness; the final key
                                    -- depends on the referent decision above
);

comment on table public.progress_record is
  'A RECORD OF LEARNING EVENTS, NOT OF BEHAVIOUR (P5-R6). One row = one fact about a real object at a real time. '
  'FORBIDDEN: page views, clicks, session length, device, IP, location, any engagement metric, any stored summary or derived value. '
  'Personal data about minors: no export, no aggregation, no sharing, no third-party access. '
  'Never used for analytics of any kind.';

-- ── RLS — PLACEHOLDER SHAPE, NAMING ITS DEPENDENCIES ────────────────────────
alter table public.progress_record enable row level security;

-- Students read their OWN events. Correct now; does not pre-solve anything.
create policy progress_record_select_own on public.progress_record
  for select using (student_id = auth.uid());

-- INSERT: by the capability that owns the referent (P7 sessions, P8
-- recordings/assignments), on a real occurrence — NEVER by a page render,
-- a prefetch or a client call. The exact grantee (a definer function vs a
-- role) depends on how P7 records attendance. Not written here.

-- TUTOR VISIBILITY: WHAT A TUTOR MAY SEE IS PHASE 6'S DECISION AND IS NOT
-- PRE-SOLVED HERE. When decided it is ONE additional SELECT policy on this
-- table (e.g. `using (exists (select 1 from tutor_assignments ta where
-- ta.tutor_id = auth.uid() and ta.student_id = progress_record.student_id
-- and ta.subject_id = progress_record.subject_id))`) — a policy, never a
-- schema change. Depends on: a tutor_assignments table (P6), the owner's
-- ruling on scope (per subject? per period?), and DPDP guidance.

-- RETENTION: UNDECIDED. No policy, trigger, TTL or partition here may encode
-- a retention assumption. Depends on: the owner's data-retention decision
-- for minors' records.

-- No UPDATE and no DELETE policy for students: a fact, once recorded, is
-- not edited by the person it is about. (Correction of a wrong record is a
-- P7 operational question — also undecided.)
