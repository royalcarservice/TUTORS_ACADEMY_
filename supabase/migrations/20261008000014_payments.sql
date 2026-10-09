-- ============================================================================
-- 20261008000014_payments.sql — Unfinished Work · Track 3 (DEC-044)
--
-- The financial threshold. Tuition is paid ONCE per term per subject at the
-- checkout door; nothing inside a chamber ever asks for payment again
-- (P6-R8 stands). This table records the threshold, never the pedagogy:
--
--   · students read ONLY their own invoices (receipts, refund states),
--   · admins read all invoices for platform audit,
--   · tutors are STRICTLY DENIED — a tutor's view of a student must never
--     be coloured by who paid (the pedagogical boundary, made structural).
--
-- Settlement (src/lib/payments/settle.ts) is the only writer besides the
-- provider webhook: it flips status to 'settled' and then provisions the
-- enrolment (and, when exactly one tutor is active in the subject, the
-- placement) — the student never waits on a human for the threshold.
-- ============================================================================

create table if not exists public.tuition_invoices (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles (id) on delete cascade,
  subject_id          text not null check (public.is_subject_id(subject_id)),
  amount_cents        integer not null check (amount_cents > 0),
  currency            text not null default 'USD',
  status              text not null check (status in ('pending', 'settled', 'failed', 'refunded')),
  provider            text not null default 'stripe',
  provider_payment_id text,
  created_at          timestamptz not null default now(),
  settled_at          timestamptz
);

comment on table public.tuition_invoices is 'Track 3: the financial threshold. One row per term-subject purchase; settlement provisions enrolment. Tutors have no read path, by policy.';
comment on column public.tuition_invoices.provider_payment_id is 'The provider''s reference for the settled payment; shown on receipts in truncated form only.';

alter table public.tuition_invoices enable row level security;
alter table public.tuition_invoices force row level security;

-- students: their own invoices, and nothing else
drop policy if exists tuition_invoices_select_own on public.tuition_invoices;
create policy tuition_invoices_select_own on public.tuition_invoices
  for select to authenticated
  using (student_id = auth.uid());

-- admins: the whole ledger for platform audit
drop policy if exists tuition_invoices_select_admin on public.tuition_invoices;
create policy tuition_invoices_select_admin on public.tuition_invoices
  for select to authenticated
  using (public.current_role_of(auth.uid()) = 'admin');

-- no insert/update policy for authenticated clients: writes arrive only
-- through the service role (webhook settlement) or the admin console.
-- Tutors: no policy names them — default deny is the pedagogical boundary.
