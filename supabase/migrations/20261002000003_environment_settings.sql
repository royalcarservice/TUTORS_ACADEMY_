-- ============================================================================
-- Phase 6 · Step 4 — THE LEVERS: environment_settings
-- ONE NEW TABLE AND NOTHING ELSE (no function, no view, no column elsewhere).
--
-- P6-R10  The environment belongs to the SUBJECT. This table is keyed by the
--         subject's immutable id and has NO student column, NO relationship
--         column, NO tutor-scoped key — a per-student (or per-tutor) room is
--         not expressible here, and there is no path to one short of a new
--         migration that this ruling forbids.
-- P6-R11  Levers are CHOSEN, never authored: every lever column is CHECKed
--         against the authored closed set (mirrors src/lib/subjects/subjects.ts
--         DENSITIES / MOTION_CHARS; scripts/check-subject-sql.mjs asserts the
--         two lists agree). A value that is not authored cannot be stored.
--         Identity is NOT here: no accent, no mark, no type, no motion grammar,
--         no atmosphere (declared-but-inert lever, 3.7 — nothing reads it),
--         no motif (each motif kind IS one subject's identity).
-- P6-R12  One Physics. PRIMARY KEY (subject_id) makes two settings rows for
--         one subject impossible. ABSENCE OF A ROW = THE AUTHORED DEFAULT
--         (the one place in this product where a missing row legitimately
--         means a real value — see src/lib/environment/settings.ts).
--         shaped_by / updated_at are the tutor's OWN record of their OWN
--         action on design config. They say nothing about any student.
-- E-13    subject identity is checked via public.is_subject_id; subject STATUS
--         stays in TypeScript and never appears here.
--
-- RLS (the enforcement point — app code never filters for authorization):
--   SELECT  anon + authenticated: the environment is public design config,
--           the same identity a visitor sees (4.5: identity is public, depth
--           is not). Deliberate.
--   INSERT / UPDATE / DELETE  authenticated with AT LEAST ONE ACTIVE
--           RELATIONSHIP IN THAT SUBJECT (public.is_related_tutor is
--           per-student; this predicate is per-subject and is written inline
--           so no new function is introduced), and the row must name
--           themselves as shaped_by. DELETE is the REVERT: removing the row
--           returns the room to the authored default. Students, unrelated
--           tutors, visitors, and a tutor writing for a subject they do not
--           relate in: denied by policy.
-- ============================================================================

create table if not exists public.environment_settings (
  subject_id   text        primary key check (public.is_subject_id(subject_id)),
  density      text        not null check (density in ('sparse', 'balanced', 'dense')),
  motion_char  text        not null check (motion_char in ('precise', 'energetic', 'reactive', 'growing', 'editorial', 'sequential')),
  shaped_by    uuid        not null references auth.users (id) on delete restrict,
  updated_at   timestamptz not null default now()
);

comment on table  public.environment_settings is '6.4: the two adjustable levers of ONE subject environment. No student scope exists or may be added (P6-R10). Absence = authored default (P6-R12).';
comment on column public.environment_settings.shaped_by is 'The tutor who last shaped this environment: their own action on design config, not a fact about any student.';

alter table public.environment_settings enable row level security;
alter table public.environment_settings force row level security;

-- the environment is public design config
drop policy if exists environment_settings_select_all on public.environment_settings;
create policy environment_settings_select_all on public.environment_settings
  for select to anon, authenticated using (true);

-- a tutor with at least one ACTIVE relationship in the subject may shape it
drop policy if exists environment_settings_insert_related_tutor on public.environment_settings;
create policy environment_settings_insert_related_tutor on public.environment_settings
  for insert to authenticated
  with check (
    shaped_by = auth.uid()
    and exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid() and r.subject_id = environment_settings.subject_id and r.state = 'active'
    )
  );

drop policy if exists environment_settings_update_related_tutor on public.environment_settings;
create policy environment_settings_update_related_tutor on public.environment_settings
  for update to authenticated
  using (
    exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid() and r.subject_id = environment_settings.subject_id and r.state = 'active'
    )
  )
  with check (
    shaped_by = auth.uid()
    and exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid() and r.subject_id = environment_settings.subject_id and r.state = 'active'
    )
  );

-- REVERT: delete the row → the authored default
drop policy if exists environment_settings_delete_related_tutor on public.environment_settings;
create policy environment_settings_delete_related_tutor on public.environment_settings
  for delete to authenticated
  using (
    exists (
      select 1 from public.relationships r
      where r.tutor_id = auth.uid() and r.subject_id = environment_settings.subject_id and r.state = 'active'
    )
  );

grant select on public.environment_settings to anon, authenticated;
grant insert, update, delete on public.environment_settings to authenticated;
