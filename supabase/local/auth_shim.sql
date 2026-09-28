-- ============================================================================
-- LOCAL AUTH SHIM — for running migrations + RLS tests on a PLAIN Postgres
-- when no Supabase instance is available (Tier 3, ruling P5-R1 Part 2).
--
-- It recreates ONLY what the migration and policies reference:
--   roles anon / authenticated / service_role, schema auth, table auth.users,
--   and auth.uid() reading request.jwt.claims — the same mechanism Supabase's
--   PostgREST uses. It does NOT provide sign-in, sessions, JWT issuance or
--   email flows. Nothing here makes auth "verified".
-- NEVER apply this to a real Supabase project (auth schema already exists).
-- ============================================================================
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;
grant anon, authenticated, service_role to current_user;

create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create or replace function auth.uid() returns uuid
language sql stable as $$
  select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
$$;
create or replace function auth.role() returns text
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;
