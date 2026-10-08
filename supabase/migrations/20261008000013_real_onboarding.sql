-- ============================================================================
-- MIGRATION 0013 — REAL ONBOARDING · TRACK 2
--
--   profiles.approval_status   the credentialing state of a tutor account.
--                              DEFAULT 'approved' so every legacy and test
--                              account keeps standing access unchanged; a
--                              tutor APPLICATION lands as 'pending_approval'
--                              (the apply act writes it, service role) and
--                              an administrator's decision moves it.
--
--   RLS PARITY, asserted: the standing policies key on role and ownership
--   (auth.uid(), current_role_of) and NEVER branch on is_test_account. Real
--   accounts (is_test_account = false) therefore hold exactly the same
--   strict row-level isolation as the test personas. This migration adds no
--   divergent policy on purpose: parity is the existing shape, and the
--   approval column is write-gated to the service role by the table's
--   existing forced-RLS update policy (own row only, role-checked), so a
--   pending tutor cannot approve themselves.
-- ============================================================================

alter table public.profiles
  add column if not exists approval_status text not null default 'approved'
  check (approval_status in ('approved', 'pending_approval', 'rejected'));

comment on column public.profiles.approval_status is
  'Track 2 credentialing state. approved = standing or accepted; pending_approval = a tutor application awaiting an administrator; rejected = decided against. Default approved keeps legacy rows unchanged; only the service role moves it for applications.';
