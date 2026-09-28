-- ============================================================================
-- RLS BOUNDARY TEST — runs AGAINST A DATABASE, never against a mocked client.
-- Usage (any Postgres with the Supabase roles + auth shim, or a real project):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_test.sql
-- Every assertion raises on failure; a clean run prints "RLS: all N assertions passed".
-- ============================================================================
\set ON_ERROR_STOP on
begin;

-- two students and a tutor, created the way Supabase Auth would create them
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'student-a@test.local', '{"role":"student","display_name":"Student A (test)"}'),
  ('22222222-2222-2222-2222-222222222222', 'student-b@test.local', '{"role":"student","display_name":"Student B (test)"}'),
  ('33333333-3333-3333-3333-333333333333', 'tutor-t@test.local',   '{"role":"tutor","display_name":"Tutor T (test)"}'),
  ('44444444-4444-4444-4444-444444444444', 'sneaky@test.local',    '{"role":"admin","display_name":"Wants admin"}');

create temp table t (n int); insert into t values (0);
create or replace function pg_temp.ok(cond boolean, label text) returns void language plpgsql as $$
begin
  if not cond then raise exception 'RLS ASSERTION FAILED: %', label; end if;
  update t set n = n + 1;
  raise notice 'ok — %', label;
end $$;
grant all on t to public; grant execute on function pg_temp.ok(boolean, text) to public;

-- ── trigger created profiles; admin cannot be self-served ───────────────────
select pg_temp.ok((select count(*) from public.profiles) = 4, 'signup trigger created 4 profiles');
select pg_temp.ok((select role from public.profiles where id = '33333333-3333-3333-3333-333333333333') = 'tutor', 'tutor role honoured from metadata');
select pg_temp.ok((select role from public.profiles where id = '44444444-4444-4444-4444-444444444444') = 'student', 'requested admin collapsed to student');
select pg_temp.ok((select bool_and(is_test_account) from public.profiles), 'every Phase-5 account is flagged test');

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

-- ── as Tutor: no roster policies exist yet → sees only own profile ──────────
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select pg_temp.ok((select count(*) from public.enrolments) = 0, 'tutor sees no enrolments (Phase 6 adds roster policies)');
select pg_temp.ok((select count(*) from public.environment_state) = 0, 'tutor sees no environment_state');
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

-- ── back as A: B's write attempt changed nothing ────────────────────────────
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select pg_temp.ok((select entry_count from public.environment_state where subject_id = 'physics') = 1, 'B''s update touched 0 of A''s rows');

reset role;
do $$ declare c int; begin select n into c from t; raise notice 'RLS: all % assertions passed', c; end $$;
rollback;  -- the test leaves no data behind
