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
