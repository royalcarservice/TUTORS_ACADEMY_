-- ============================================================================
-- TUTORS ACADEMY · Phase 10 · Step 1 — LEGAL FRAMEWORK SCHEMA
-- THE CONSENT AUDIT — legal_consents (DEC-037, resolves E-07)
--
-- WHAT THIS CREATES
--   public.legal_consents — one row = one consent a person gave: the terms
--   of academy practice, the privacy notice, or a guardian's consent for a
--   minor student (DPDP Act 2023). This is an AUDIT of grants: rows are
--   INSERTED and READ, never updated — a consent is an occurrence, recorded
--   once, exactly as given.
--
-- THE BRIEF'S RECONCILIATIONS (recorded, DEC-037)
--   · Numbered 0011, sequential — the brief's `20261008000007` slot belongs
--     to classroom_sessions (the DEC-029/033 numbering precedent).
--   · The brief's shape stands complete: id · user_id · consent_type ·
--     guardian_email · consented_at · ip_hash. Two declared completions:
--     (1) guardian_email is CHECKed REQUIRED when the consent is a guardian
--     consent and FORBIDDEN otherwise — the column means one thing;
--     (2) ip_hash is CHECKed at 64 characters (a SHA-256 hex digest). The
--     raw address is hashed server-side at the instant of consent and never
--     stored, never returned; when no address is visible to the app, the
--     literal sentinel 'no-address' is hashed instead — the audit says so
--     honestly rather than inventing an address.
--   · APPEND-ONLY, deliberately WITHOUT a (user_id, consent_type) unique
--     constraint: this table is a consent AUDIT, not a state flag — if a
--     future withdrawal-and-regrant flow lands, both events deserve rows.
--     Idempotency is enforced by the write action (it reads the standing
--     consent first and refuses a duplicate calmly) instead of by the DB.
--   · RLS posture is the standing one (0004/0008/0009/0010): enabled AND
--     forced. Users read and write ONLY their own consents. Tutors, admins
--     and anon are admitted NOWHERE — there is no policy that names anyone
--     but the consent's own user, so everyone else is strictly denied by
--     absence (the brief's requirement, enforced the lineage's way).
-- ============================================================================

create table public.legal_consents (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  consent_type   text not null check (consent_type in ('terms_v1', 'privacy_v1', 'guardian_consent_v1')),
  guardian_email text check (char_length(guardian_email) <= 254),
  consented_at   timestamptz not null default now(),
  ip_hash        text not null check (char_length(ip_hash) = 64),
  -- guardian_email is REQUIRED for a guardian consent and FORBIDDEN otherwise:
  check (
    (consent_type = 'guardian_consent_v1' and guardian_email is not null)
    or (consent_type <> 'guardian_consent_v1' and guardian_email is null)
  )
);

comment on table public.legal_consents is
  'The legal consent audit (Phase 10): one row per consent granted — terms, privacy, or guardian consent for a minor (DPDP Act 2023). Append-only: rows are inserted and read, never updated.';
comment on column public.legal_consents.guardian_email is
  'The guardian''s email address for a guardian_consent_v1 row; null for every other consent type. Used only for consent verification — never for marketing.';
comment on column public.legal_consents.ip_hash is
  'One-way SHA-256 hex digest of the connecting address at the instant of consent, computed server-side. The raw address is never stored and never returned. If no address is visible to the app, the literal sentinel ''no-address'' is hashed — the audit records absence honestly.';

-- One person's consent history, newest first.
create index legal_consents_user on public.legal_consents (user_id, consented_at desc);

-- ── RLS: enabled AND forced; the consent's own user is the ONLY identity ────
alter table public.legal_consents enable row level security;
alter table public.legal_consents force row level security;

-- A person reads their own consents, and nothing else exists at this
-- boundary: tutors, admins and anon have no policy that admits them.
create policy consents_select_own on public.legal_consents
  for select to authenticated using (user_id = auth.uid());

-- A person records a consent only as themselves: the row's user_id must be
-- the writer's own identity.
create policy consents_insert_own on public.legal_consents
  for insert to authenticated with check (user_id = auth.uid());

-- NO update policy: a consent stands exactly as given.
-- NO delete policy: the audit keeps its rows; they fall only with the
-- profile they belong to (on delete cascade).

revoke all on public.legal_consents from anon, authenticated;
grant select, insert on public.legal_consents to authenticated;  -- rows still gated by RLS
grant all on public.legal_consents to service_role;
