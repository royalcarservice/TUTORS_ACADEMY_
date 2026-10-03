-- ============================================================================
-- RLS BOUNDARY TEST — runs AGAINST A DATABASE, never against a mocked client.
-- Usage (any Postgres with the Supabase roles + auth shim, or a real project):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_test.sql
-- Every assertion raises on failure; a clean run prints "RLS: all N assertions passed".
-- ============================================================================
\set ON_ERROR_STOP on
begin;

-- two students and a tutor, created the way Supabase Auth would create them
-- ── FIXTURE MANIFEST (E-14) ──────────────────────────────────────────────────
-- The set of identities this test creates. Every assertion about "how many
-- profiles exist" is derived from THIS table — never from a literal number —
-- so the test holds on an empty local database AND on the project database,
-- where other test accounts (…@test.tutorsacademy.invalid) already live.
create temp table fixture (id uuid primary key, email text not null, meta jsonb not null);
insert into fixture values
  ('11111111-1111-1111-1111-111111111111', 'student-a@test.local', '{"role":"student","display_name":"Student A (test)"}'),
  ('22222222-2222-2222-2222-222222222222', 'student-b@test.local', '{"role":"student","display_name":"Student B (test)"}'),
  ('33333333-3333-3333-3333-333333333333', 'tutor-t@test.local',   '{"role":"tutor","display_name":"Tutor T (test)"}'),
  ('44444444-4444-4444-4444-444444444444', 'sneaky@test.local',    '{"role":"admin","display_name":"Wants admin"}'),
  ('55555555-5555-5555-5555-555555555555', 'tutor-u@test.local',   '{"role":"tutor","display_name":"Tutor U (test)"}');
-- A "test identity" is: a fixture row, or an account on the project's test domain.
create or replace function pg_temp.is_test_identity(p_email text) returns boolean language sql as $$
  select p_email in (select email from fixture) or p_email like '%@test.tutorsacademy.invalid'
$$;
grant all on fixture to public;

insert into auth.users (id, email, raw_user_meta_data) select id, email, meta from fixture;

create temp table t (n int); insert into t values (0);
create or replace function pg_temp.ok(cond boolean, label text) returns void language plpgsql as $$
begin
  if not cond then raise exception 'RLS ASSERTION FAILED: %', label; end if;
  update t set n = n + 1;
  raise notice 'ok — %', label;
end $$;
grant all on t to public; grant execute on function pg_temp.ok(boolean, text) to public;

-- ── trigger created profiles; admin cannot be self-served ───────────────────
-- E-14: invariants derived from the manifest, not a magic number.
select pg_temp.ok((select count(*) from fixture f join public.profiles p on p.id = f.id) = (select count(*) from fixture),
  'every fixture identity has exactly one profile (manifest-derived)');
select pg_temp.ok(not exists (select 1 from public.profiles p join auth.users u on u.id = p.id where not pg_temp.is_test_identity(u.email)),
  'no profile belongs to a non-test identity');
select pg_temp.ok(not exists (select 1 from public.profiles p where not exists (select 1 from auth.users u where u.id = p.id)),
  'no profile without an auth identity');
select pg_temp.ok((select role from public.profiles where id = '33333333-3333-3333-3333-333333333333') = 'tutor', 'tutor role honoured from metadata');
select pg_temp.ok((select role from public.profiles where id = '44444444-4444-4444-4444-444444444444') = 'student', 'requested admin collapsed to student');
select pg_temp.ok((select bool_and(is_test_account) from public.profiles), 'every account is flagged test (E-07: no real identity exists)');

-- ── as Student A ─────────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

insert into public.enrolments (student_id, subject_id) values (auth.uid(), 'physics');
insert into public.environment_state (student_id, subject_id) values (auth.uid(), 'physics');
select pg_temp.ok((select count(*) from public.enrolments) = 1, 'A sees exactly her own enrolment');
select pg_temp.ok((select count(*) from public.profiles) = 1, 'A sees exactly her own profile');
select pg_temp.ok((select position is null from public.environment_state where subject_id = 'physics'), 'position is NULL by default (nothing to be AT yet)');

-- A cannot enrol someone else
do $$ begin
  insert into public.enrolments (student_id, subject_id) values ('22222222-2222-2222-2222-222222222222', 'physics');
  raise exception 'RLS ASSERTION FAILED: A enrolled B';
exception when insufficient_privilege or check_violation then raise notice 'ok — A cannot enrol B (%)', sqlerrm; end $$;
update t set n = n + 1;

-- A cannot enrol in a subject that is not one of the six
do $$ begin
  insert into public.enrolments (student_id, subject_id) values (auth.uid(), 'astrology');
  raise exception 'RLS ASSERTION FAILED: seventh subject accepted';
exception when check_violation then raise notice 'ok — no seventh subject (%)', sqlerrm; end $$;
update t set n = n + 1;

-- A cannot promote herself (with-check rejects the new row)
do $$ begin
  update public.profiles set role = 'admin' where id = auth.uid();
  raise exception 'RLS ASSERTION FAILED: A changed her own role';
exception when insufficient_privilege or check_violation then raise notice 'ok — A cannot change her own role (%)', sqlerrm; end $$;
update t set n = n + 1;
-- but she CAN edit her display name
update public.profiles set display_name = 'A renamed' where id = auth.uid();
select pg_temp.ok((select display_name from public.profiles where id = auth.uid()) = 'A renamed', 'A can update her own display name');

-- ── as Student B: must see NOTHING of A ──────────────────────────────────────
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select pg_temp.ok((select count(*) from public.enrolments) = 0, 'B sees none of A''s enrolments');
select pg_temp.ok((select count(*) from public.environment_state) = 0, 'B sees none of A''s environment_state');
select pg_temp.ok((select count(*) from public.profiles where id <> auth.uid()) = 0, 'B cannot read A''s profile');
-- B cannot write A's state
do $$ begin
  update public.environment_state set entry_count = 99 where student_id = '11111111-1111-1111-1111-111111111111';
  -- update on invisible rows affects 0 rows; verify nothing changed as A below
end $$;
-- B cannot insert environment_state for a subject B is not enrolled in (FK to enrolments)
do $$ begin
  insert into public.environment_state (student_id, subject_id) values (auth.uid(), 'physics');
  raise exception 'RLS ASSERTION FAILED: state without enrolment';
exception when foreign_key_violation then raise notice 'ok — state requires enrolment (%)', sqlerrm; end $$;
update t set n = n + 1;

-- ═══ PHASE 6 · P6-R1 / P6-R2 — THE RELATIONSHIP ══════════════════════════════
-- Setup facts (as students, through their own policies):
--   A is enrolled in physics (above) AND mathematics; B is enrolled in physics.
--   So A and B SHARE physics. No relationship exists yet.
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
insert into public.enrolments (student_id, subject_id) values (auth.uid(), 'mathematics');
insert into public.environment_state (student_id, subject_id) values (auth.uid(), 'mathematics');
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
insert into public.enrolments (student_id, subject_id) values (auth.uid(), 'physics');
insert into public.environment_state (student_id, subject_id) values (auth.uid(), 'physics');

-- ── as Tutor T, BEFORE any relationship: NO DEFAULT, NO INFERENCE ───────────
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select pg_temp.ok((select count(*) from public.relationships) = 0, 'P6-R1 no relationship exists by default');
select pg_temp.ok((select count(*) from public.enrolments) = 0, 'P6-R1 nothing inferred: tutor with no relationship sees no enrolment');
select pg_temp.ok((select count(*) from public.environment_state) = 0, 'P6-R1 nothing inferred: tutor with no relationship sees no environment_state');
select pg_temp.ok((select count(*) from public.profiles) = 1, 'P6-R1 nothing inferred: tutor with no relationship sees only own profile');
-- browsing creates nothing
select pg_temp.ok((select count(*) from public.relationships) = 0, 'P6-R1 reading created no relationship');

-- a tutor cannot create a relationship (no write path exists for any role)
do $$ begin
  insert into public.relationships (tutor_id, student_id, subject_id) values (auth.uid(), '11111111-1111-1111-1111-111111111111', 'physics');
  raise exception 'RLS ASSERTION FAILED: tutor created a relationship';
exception when insufficient_privilege then raise notice 'ok — tutor cannot create a relationship (%)', sqlerrm; end $$;
update t set n = n + 1;

-- ── service role (the only writer today) records: T↔A physics ACTIVE, T↔B physics ENDED ──
reset role;
set local role service_role;
insert into public.relationships (tutor_id, student_id, subject_id) values
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'physics');
insert into public.relationships (tutor_id, student_id, subject_id, state, started_at, ended_at) values
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'physics', 'ended', now() - interval '30 days', now() - interval '1 day');
-- model constraints
do $$ begin
  insert into public.relationships (tutor_id, student_id, subject_id) values
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'physics');
  raise exception 'RLS ASSERTION FAILED: second ACTIVE relationship for same tutor·student·subject';
exception when unique_violation then raise notice 'ok — one active relationship per tutor·student·subject (%)', sqlerrm; end $$;
update t set n = n + 1;
do $$ begin
  insert into public.relationships (tutor_id, student_id, subject_id) values
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'astrology');
  raise exception 'RLS ASSERTION FAILED: relationship in a seventh subject';
exception when check_violation then raise notice 'ok — E-13 subject identity checked in DB (%)', sqlerrm; end $$;
update t set n = n + 1;
do $$ begin
  insert into public.relationships (tutor_id, student_id, subject_id, state) values
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'biology', 'ended');
  raise exception 'RLS ASSERTION FAILED: ended without ended_at';
exception when check_violation then raise notice 'ok — ended requires ended_at (%)', sqlerrm; end $$;
update t set n = n + 1;
reset role;
set local role authenticated;

-- ── as Tutor T, WITH the relationship: exactly the scoped view ──────────────
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select pg_temp.ok((select count(*) from public.relationships) = 2, 'tutor sees own relationships, active and ended (ended ≠ never existed)');
select pg_temp.ok((select count(*) from public.enrolments) = 1
  and (select bool_and(student_id = '11111111-1111-1111-1111-111111111111' and subject_id = 'physics') from public.enrolments),
  'P6-R2 tutor sees A''s PHYSICS enrolment and nothing else');
select pg_temp.ok((select count(*) from public.environment_state) = 1
  and (select bool_and(student_id = '11111111-1111-1111-1111-111111111111' and subject_id = 'physics') from public.environment_state),
  'P6-R2 tutor sees A''s PHYSICS environment_state (arc facts) and nothing else');
select pg_temp.ok((select count(*) from public.profiles where id <> auth.uid()) = 1
  and (select display_name from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 'A renamed',
  'P6-R2 tutor reads the related student''s display name');
-- BREAK 1 · other subject of the SAME related student
select pg_temp.ok((select count(*) from public.enrolments where subject_id = 'mathematics') = 0, 'BREAK other-subject: A''s mathematics enrolment invisible to her physics tutor');
select pg_temp.ok((select count(*) from public.environment_state where subject_id = 'mathematics') = 0, 'BREAK other-subject: A''s mathematics environment_state invisible');
-- BREAK 2 · ended relationship grants nothing
select pg_temp.ok((select count(*) from public.enrolments where student_id = '22222222-2222-2222-2222-222222222222') = 0, 'BREAK ended: B''s enrolment invisible after the relationship ended');
select pg_temp.ok((select count(*) from public.environment_state where student_id = '22222222-2222-2222-2222-222222222222') = 0, 'BREAK ended: B''s environment_state invisible');
select pg_temp.ok((select count(*) from public.profiles where id = '22222222-2222-2222-2222-222222222222') = 0, 'BREAK ended: B''s profile invisible');
-- BREAK 3 · shared subject without a relationship: B shares physics with A; T is NOT related to B in physics (only an ended row)
select pg_temp.ok((select count(*) from public.enrolments where subject_id = 'physics') = 1, 'BREAK shared-subject: physics enrolments visible = the ONE related student, not everyone in physics');
-- tutor cannot write through the relationship
do $$ begin
  update public.relationships set state = 'ended', ended_at = now() where tutor_id = auth.uid();
  if found then raise exception 'RLS ASSERTION FAILED: tutor ended a relationship'; end if;
  raise notice 'ok — tutor cannot end a relationship (0 rows)';
exception when insufficient_privilege then raise notice 'ok — tutor cannot end a relationship (%)', sqlerrm; end $$;
update t set n = n + 1;
do $$ begin
  update public.environment_state set entry_count = 99 where student_id = '11111111-1111-1111-1111-111111111111';
  if found then raise exception 'RLS ASSERTION FAILED: tutor wrote student state'; end if;
  raise notice 'ok — tutor cannot write the related student''s environment_state (0 rows)';
exception when insufficient_privilege then raise notice 'ok — tutor cannot write the related student''s environment_state (%)', sqlerrm; end $$;
update t set n = n + 1;
do $$ begin
  update public.profiles set display_name = 'renamed by tutor' where id = '11111111-1111-1111-1111-111111111111';
  if found then raise exception 'RLS ASSERTION FAILED: tutor renamed student'; end if;
  raise notice 'ok — tutor cannot write the related student''s profile (0 rows)';
exception when insufficient_privilege then raise notice 'ok — tutor cannot write the related student''s profile (%)', sqlerrm; end $$;
update t set n = n + 1;

-- BREAK 4 · NON-RELATED tutor U: a tutor with no relationship sees nothing, even in a subject with students
select set_config('request.jwt.claims', '{"sub":"55555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
select pg_temp.ok((select count(*) from public.relationships) = 0, 'BREAK non-related: U sees no relationships');
select pg_temp.ok((select count(*) from public.enrolments) = 0, 'BREAK non-related: U sees no enrolments');
select pg_temp.ok((select count(*) from public.environment_state) = 0, 'BREAK non-related: U sees no environment_state');
select pg_temp.ok((select count(*) from public.profiles where id <> auth.uid()) = 0, 'BREAK non-related: U sees no other profile');

-- ── students see who is related to them, and cannot create or alter it ─────
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select pg_temp.ok((select count(*) from public.relationships) = 1 and (select tutor_id from public.relationships) = '33333333-3333-3333-3333-333333333333', 'A sees her one active relationship (who can see her)');
select pg_temp.ok((select count(*) from public.profiles) = 1, 'A still sees only her own profile (no reverse grant to the tutor''s row)');
do $$ begin
  insert into public.relationships (tutor_id, student_id, subject_id) values ('55555555-5555-5555-5555-555555555555', auth.uid(), 'physics');
  raise exception 'RLS ASSERTION FAILED: student created a relationship';
exception when insufficient_privilege then raise notice 'ok — student cannot create a relationship (%)', sqlerrm; end $$;
update t set n = n + 1;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select pg_temp.ok((select count(*) from public.relationships) = 1 and (select state from public.relationships) = 'ended', 'B sees the ENDED relationship (ended ≠ never existed; nothing is granted by it)');

-- ── revocation: service role ends T↔A; T immediately loses the view, the record stays ──
reset role;
set local role service_role;
update public.relationships set state = 'ended', ended_at = now() where tutor_id = '33333333-3333-3333-3333-333333333333' and student_id = '11111111-1111-1111-1111-111111111111';
-- scoped to the fixture tutor (E-14 discipline: the project DB holds relationships of its own)
select pg_temp.ok((select count(*) from public.relationships where tutor_id = '33333333-3333-3333-3333-333333333333') = 2, 'revocation retains the row (ended ≠ deleted)');
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select pg_temp.ok((select count(*) from public.enrolments) = 0, 'revoked: tutor sees no enrolments');
select pg_temp.ok((select count(*) from public.environment_state) = 0, 'revoked: tutor sees no environment_state');
select pg_temp.ok((select count(*) from public.profiles where id <> auth.uid()) = 0, 'revoked: tutor sees no student profile');
select pg_temp.ok((select count(*) from public.relationships where state = 'ended') = 2, 'revoked: tutor still sees that the relationships existed');

-- ── as Tutor T: remaining Phase-5 checks (tutor is not a student) ───────────
do $$ begin
  insert into public.enrolments (student_id, subject_id) values (auth.uid(), 'mathematics');
  raise exception 'RLS ASSERTION FAILED: tutor enrolled as student';
exception when insufficient_privilege or check_violation then raise notice 'ok — tutor cannot enrol (%)', sqlerrm; end $$;
update t set n = n + 1;

-- ── as anon: zero rows everywhere ────────────────────────────────────────────
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  perform count(*) from public.enrolments;
  raise exception 'RLS ASSERTION FAILED: anon could select enrolments';
exception when insufficient_privilege then raise notice 'ok — anon has no table privilege on enrolments'; end $$;
update t set n = n + 1;
do $$ begin
  perform count(*) from public.relationships;
  raise exception 'RLS ASSERTION FAILED: anon could select relationships';
exception when insufficient_privilege then raise notice 'ok — anon has no table privilege on relationships'; end $$;
update t set n = n + 1;

-- ── back as A: B's write attempt changed nothing ────────────────────────────
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select pg_temp.ok((select entry_count from public.environment_state where subject_id = 'physics') = 1, 'B''s update touched 0 of A''s rows');


-- ════════════════════════════════════════════════════════════════════════════
-- 6.4 · environment_settings — ONE room per subject; levers chosen, never authored
-- Fixture at this point: T's relationships were ENDED above (revocation test); U relates to nobody.
-- The service role places T with A again (physics, ACTIVE) so the positive case exists.
-- ════════════════════════════════════════════════════════════════════════════
reset role;
set local role service_role;
insert into public.relationships (tutor_id, student_id, subject_id) values
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'physics');
reset role;
-- structural: no student / relationship / tutor-scoped key can exist on the table (P6-R10)
select pg_temp.ok((select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'environment_settings'
  and (column_name like '%student%' or column_name like '%relationship%' or column_name like '%tutor%' or column_name like '%profile%' or column_name like '%status%')) = 0,
  'P6-R10 environment_settings has no student / relationship / tutor / status column');
select pg_temp.ok((select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns where table_schema = 'public' and table_name = 'environment_settings')
  = 'subject_id,density,motion_char,shaped_by,updated_at', 'environment_settings columns are exactly subject_id,density,motion_char,shaped_by,updated_at');
select pg_temp.ok((select count(*) from pg_constraint where conrelid = 'public.environment_settings'::regclass and contype = 'p') = 1
  and (select array_to_string(array(select a.attname from pg_index i join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey) where i.indrelid = 'public.environment_settings'::regclass and i.indisprimary), ','))
  = 'subject_id', 'P6-R12 primary key is subject_id alone: two rows for one subject are impossible');

-- a signed-out visitor READS (public design config) and cannot write
set local role anon;
select pg_temp.ok((select count(*) from public.environment_settings) >= 0, 'anon can SELECT environment_settings (public design config, deliberate)');
do $$ begin
  insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('physics', 'dense', 'precise', '33333333-3333-3333-3333-333333333333');
  raise exception 'RLS ASSERTION FAILED: anon wrote environment_settings';
exception when insufficient_privilege then raise notice 'ok — anon cannot write environment_settings (%)', sqlerrm; end $$;
update t set n = n + 1;

-- a STUDENT (A, enrolled and related) cannot shape the room
reset role; set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
do $$ begin
  insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('physics', 'dense', 'precise', auth.uid());
  raise exception 'RLS ASSERTION FAILED: student wrote environment_settings';
exception when insufficient_privilege then raise notice 'ok — a student cannot shape the environment (%)', sqlerrm; end $$;
update t set n = n + 1;

-- an UNRELATED tutor (U) cannot shape any room
select set_config('request.jwt.claims', '{"sub":"55555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
do $$ begin
  insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('physics', 'dense', 'precise', auth.uid());
  raise exception 'RLS ASSERTION FAILED: unrelated tutor wrote environment_settings';
exception when insufficient_privilege then raise notice 'ok — an unrelated tutor cannot shape the environment (%)', sqlerrm; end $$;
update t set n = n + 1;

-- the RELATED tutor (T): physics yes; a subject they have NO relationship in (chemistry) no; not as someone else
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
do $$ begin
  insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('chemistry', 'dense', 'precise', auth.uid());
  raise exception 'RLS ASSERTION FAILED: tutor shaped a subject they do not relate in';
exception when insufficient_privilege then raise notice 'ok — a tutor cannot shape a subject they have no relationship in (%)', sqlerrm; end $$;
update t set n = n + 1;
do $$ begin
  insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('physics', 'dense', 'precise', '55555555-5555-5555-5555-555555555555');
  raise exception 'RLS ASSERTION FAILED: tutor recorded another tutor as shaped_by';
exception when insufficient_privilege then raise notice 'ok — shaped_by must be the writer (%)', sqlerrm; end $$;
update t set n = n + 1;
-- P6-R11: a value that is not authored is IMPOSSIBLE TO STORE (CHECK), even for a permitted writer
do $$ begin
  insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('physics', 'very-dense', 'precise', auth.uid());
  raise exception 'RLS ASSERTION FAILED: unauthored density stored';
exception when check_violation then raise notice 'ok — unauthored density cannot be stored (%)', sqlerrm; end $$;
update t set n = n + 1;
do $$ begin
  insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('physics', 'dense', '#ff0000', auth.uid());
  raise exception 'RLS ASSERTION FAILED: unauthored motion character stored';
exception when check_violation then raise notice 'ok — unauthored motion character cannot be stored (%)', sqlerrm; end $$;
update t set n = n + 1;
-- the permitted write, idempotent at the model: a second row for physics is impossible; upsert is the one shape
insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('physics', 'dense', 'precise', auth.uid());
select pg_temp.ok((select density from public.environment_settings where subject_id = 'physics') = 'dense', 'related tutor T shaped physics (dense · precise)');
do $$ begin
  insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('physics', 'sparse', 'precise', auth.uid());
  raise exception 'RLS ASSERTION FAILED: second settings row for one subject';
exception when unique_violation then raise notice 'ok — P6-R12 one settings row per subject (%)', sqlerrm; end $$;
update t set n = n + 1;
insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('physics', 'sparse', 'editorial', auth.uid())
  on conflict (subject_id) do update set density = excluded.density, motion_char = excluded.motion_char, shaped_by = excluded.shaped_by, updated_at = now();
select pg_temp.ok((select count(*) from public.environment_settings where subject_id = 'physics') = 1 and (select motion_char from public.environment_settings where subject_id = 'physics') = 'editorial',
  'upsert = one row, updated (the 5.5 shape)');

-- ENDED is not related: T's relationship with B is ended; a tutor whose ONLY relationship in a subject is ended cannot shape it.
-- (T still has A active in physics, so test the predicate on U after service role gives U an ENDED row in chemistry.)
reset role; set local role service_role;
insert into public.relationships (tutor_id, student_id, subject_id, state, started_at, ended_at) values
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'chemistry', 'ended', now() - interval '30 days', now() - interval '1 day');
reset role; set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"55555555-5555-5555-5555-555555555555","role":"authenticated"}', true);
do $$ begin
  insert into public.environment_settings (subject_id, density, motion_char, shaped_by) values ('chemistry', 'dense', 'precise', auth.uid());
  raise exception 'RLS ASSERTION FAILED: tutor with only an ENDED relationship shaped the room';
exception when insufficient_privilege then raise notice 'ok — an ended relationship confers nothing (%)', sqlerrm; end $$;
update t set n = n + 1;
-- U cannot update or delete T's physics row either (0 rows touched)
update public.environment_settings set density = 'sparse' where subject_id = 'physics';
select pg_temp.ok((select density from public.environment_settings where subject_id = 'physics') = 'sparse' and (select shaped_by from public.environment_settings where subject_id = 'physics') = '33333333-3333-3333-3333-333333333333', 'unrelated tutor''s UPDATE touched 0 rows');
delete from public.environment_settings where subject_id = 'physics';
select pg_temp.ok((select count(*) from public.environment_settings where subject_id = 'physics') = 1, 'unrelated tutor''s DELETE touched 0 rows');
-- student A reads the room (same bytes as anyone) but cannot delete it
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select pg_temp.ok((select density from public.environment_settings where subject_id = 'physics') = 'sparse', 'student reads the subject''s settings (public design config)');
delete from public.environment_settings where subject_id = 'physics';
select pg_temp.ok((select count(*) from public.environment_settings where subject_id = 'physics') = 1, 'student''s DELETE touched 0 rows');
-- REVERT: the related tutor deletes the row → absence = authored default
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
delete from public.environment_settings where subject_id = 'physics';
select pg_temp.ok((select count(*) from public.environment_settings where subject_id = 'physics') = 0, 'P6-R12 revert: related tutor deleted the row (absence = authored default)');

reset role;
do $$ declare c int; begin select n into c from t; raise notice 'RLS: all % assertions passed', c; end $$;
rollback;  -- the test leaves no data behind
