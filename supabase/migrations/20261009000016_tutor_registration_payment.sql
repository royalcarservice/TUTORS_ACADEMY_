-- ============================================================================
-- MIGRATION 0016 — TUTOR APPLICATION REGISTRATION PAYMENT (DEC-054)
--
-- Applications are saved as pending_payment before a Stripe Checkout session
-- is created. The public client never reads these tables: application access
-- is through a one-way token hash in an HttpOnly cookie, and all table access
-- is server/service-role only. Only a server-verified INR 699 Checkout session
-- may atomically mark the fee paid and move the application to pending_approval.
-- ============================================================================

-- `pending_payment` is a credentialing state, not a permission to teach.
alter table public.profiles
  drop constraint if exists profiles_approval_status_check;
alter table public.profiles
  add constraint profiles_approval_status_check
  check (approval_status in ('approved', 'pending_payment', 'pending_approval', 'rejected'));

-- A newly-created tutor must not inherit the legacy profile default of
-- approved, even for the short interval before the application save RPC runs.
-- Preserve the existing guardian DOB metadata behavior for student signups.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  requested text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  chosen public.user_role := case when requested = 'tutor' then 'tutor'::public.user_role else 'student'::public.user_role end;
  dob text := nullif(new.raw_user_meta_data ->> 'date_of_birth', '');
begin
  insert into public.profiles (id, role, display_name, date_of_birth, approval_status)
  values (
    new.id,
    chosen,
    left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 80),
    case when dob ~ '^\d{4}-\d{2}-\d{2}$' then dob::date end,
    case when chosen = 'tutor'::public.user_role then 'pending_payment' else 'approved' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

create table if not exists public.tutor_applications (
  id                    uuid primary key references public.profiles (id) on delete cascade,
  applicant_name        text not null check (char_length(applicant_name) between 1 and 80),
  email                 text not null check (char_length(email) between 3 and 254),
  academic_background   text not null check (char_length(academic_background) between 1 and 2000),
  subject_ids           text[] not null check (cardinality(subject_ids) between 1 and 7),
  board                 text not null check (char_length(board) between 1 and 100),
  class_levels          text[] not null check (cardinality(class_levels) between 1 and 12),
  status                text not null default 'pending_payment'
                        check (status in ('pending_payment', 'pending_approval', 'approved', 'rejected')),
  application_token_hash text not null unique check (char_length(application_token_hash) = 64),
  submitted_at          timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (subject_ids <@ array['mathematics','physics','chemistry','biology','english','history','computer-science']::text[]),
  check (class_levels <@ array['1','2','3','4','5','6','7','8','9','10','11','12']::text[])
);

comment on table public.tutor_applications is
  'A tutor''s submitted details. Saved as pending_payment before checkout; becomes pending_approval only after server-verified payment. Access is server/service-role only.';
comment on column public.tutor_applications.application_token_hash is
  'SHA-256 digest of a 256-bit random browser access token. The raw token is stored only in a Secure, HttpOnly, SameSite=Lax cookie.';

create index if not exists tutor_applications_status_submitted
  on public.tutor_applications (status, submitted_at desc);

drop trigger if exists tutor_applications_touch on public.tutor_applications;
create trigger tutor_applications_touch before update on public.tutor_applications
  for each row execute function public.touch_updated_at();

create table if not exists public.tutor_registration_payments (
  id                    uuid primary key default gen_random_uuid(),
  application_id        uuid not null references public.tutor_applications (id) on delete cascade,
  provider              text not null default 'stripe' check (provider = 'stripe'),
  mode                  text not null check (mode in ('test', 'live')),
  amount_paise          integer not null default 69900 check (amount_paise = 69900),
  currency              text not null default 'INR' check (currency = 'INR'),
  status                text not null default 'pending'
                        check (status in ('pending', 'paid', 'failed', 'expired', 'refunded')),
  checkout_session_id   text unique,
  provider_payment_id   text,
  created_at            timestamptz not null default now(),
  paid_at               timestamptz
);

comment on table public.tutor_registration_payments is
  'Stripe hosted Checkout attempts for the fixed ₹699 tutor registration fee. No card data is stored here.';
comment on column public.tutor_registration_payments.provider_payment_id is
  'Stripe PaymentIntent reference, recorded only after server-side amount, currency, metadata and paid-status verification.';

-- Only one open Checkout attempt per application. Retries reuse the same live
-- session until it expires; an expired attempt is closed before a fresh one.
create unique index if not exists tutor_registration_one_pending_payment
  on public.tutor_registration_payments (application_id) where status = 'pending';
create index if not exists tutor_registration_payment_history
  on public.tutor_registration_payments (application_id, created_at desc);

alter table public.tutor_applications enable row level security;
alter table public.tutor_applications force row level security;
alter table public.tutor_registration_payments enable row level security;
alter table public.tutor_registration_payments force row level security;
revoke all on public.tutor_applications, public.tutor_registration_payments from anon, authenticated;
grant all on public.tutor_applications, public.tutor_registration_payments to service_role;
-- No anon/authenticated policies. The service role is the sole data path.

-- Atomic save: pending-payment status + application details move together.
create or replace function public.save_tutor_application(
  p_id uuid,
  p_name text,
  p_email text,
  p_background text,
  p_subject_ids text[],
  p_board text,
  p_class_levels text[],
  p_token_hash text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  saved_id uuid;
begin
  if p_name is null or char_length(trim(p_name)) not between 1 and 80
     or p_email is null or char_length(trim(p_email)) not between 3 and 254
     or p_background is null or char_length(trim(p_background)) not between 1 and 2000
     or p_board is null or char_length(trim(p_board)) not between 1 and 100
     or coalesce(cardinality(p_subject_ids), 0) not between 1 and 7
     or coalesce(cardinality(p_class_levels), 0) not between 1 and 12
     or p_token_hash is null or char_length(p_token_hash) <> 64 then
    raise exception 'Tutor application fields are invalid';
  end if;
  if not (p_subject_ids <@ array['mathematics','physics','chemistry','biology','english','history','computer-science']::text[])
     or not (p_class_levels <@ array['1','2','3','4','5','6','7','8','9','10','11','12']::text[]) then
    raise exception 'Tutor application contains an unsupported selection';
  end if;

  update public.profiles
    set display_name = trim(p_name), approval_status = 'pending_payment', is_test_account = false
    where id = p_id and role = 'tutor';
  if not found then raise exception 'Tutor account is unavailable'; end if;

  insert into public.tutor_applications (
    id, applicant_name, email, academic_background, subject_ids, board,
    class_levels, status, application_token_hash
  ) values (
    p_id, trim(p_name), lower(trim(p_email)), trim(p_background), p_subject_ids,
    trim(p_board), p_class_levels, 'pending_payment', p_token_hash
  )
  on conflict (id) do update set
    applicant_name = excluded.applicant_name,
    email = excluded.email,
    academic_background = excluded.academic_background,
    subject_ids = excluded.subject_ids,
    board = excluded.board,
    class_levels = excluded.class_levels,
    updated_at = now()
  where tutor_applications.status = 'pending_payment'
    and tutor_applications.application_token_hash = excluded.application_token_hash
  returning id into saved_id;

  if saved_id is null then raise exception 'Tutor application is no longer editable'; end if;
end $$;

-- Idempotent settlement. The caller must first retrieve and verify the Stripe
-- session server-side; this function performs the atomic ledger transition.
create or replace function public.settle_tutor_registration_payment(
  p_payment_id uuid,
  p_session_id text,
  p_payment_intent_id text,
  p_amount_paise integer,
  p_currency text
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  app_id uuid;
  current_status text;
  current_session text;
begin
  if p_amount_paise <> 69900 or upper(coalesce(p_currency, '')) <> 'INR' then
    raise exception 'Tutor registration payment amount or currency mismatch';
  end if;

  select application_id, status, checkout_session_id
    into app_id, current_status, current_session
    from public.tutor_registration_payments
    where id = p_payment_id for update;
  if not found or current_session is distinct from p_session_id then return false; end if;
  if current_status = 'paid' then return true; end if;
  if current_status <> 'pending' then return false; end if;

  update public.tutor_registration_payments
    set status = 'paid', provider_payment_id = p_payment_intent_id, paid_at = now()
    where id = p_payment_id and status = 'pending';
  if not found then return false; end if;

  update public.tutor_applications
    set status = 'pending_approval', updated_at = now()
    where id = app_id and status = 'pending_payment';
  if not found then raise exception 'Tutor application is not awaiting payment'; end if;

  update public.profiles
    set approval_status = 'pending_approval'
    where id = app_id and role = 'tutor';
  if not found then raise exception 'Tutor profile is unavailable'; end if;
  return true;
end $$;

create or replace function public.decide_tutor_application(
  p_id uuid,
  p_decision text
) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if p_decision not in ('approved', 'rejected') then return false; end if;
  update public.tutor_applications
    set status = p_decision, updated_at = now()
    where id = p_id and status = 'pending_approval';
  if not found then return false; end if;
  update public.profiles set approval_status = p_decision where id = p_id and role = 'tutor';
  if not found then raise exception 'Tutor profile is unavailable'; end if;
  return true;
end $$;

revoke all on function public.save_tutor_application(uuid, text, text, text, text[], text, text[], text) from public, anon, authenticated;
revoke all on function public.settle_tutor_registration_payment(uuid, text, text, integer, text) from public, anon, authenticated;
revoke all on function public.decide_tutor_application(uuid, text) from public, anon, authenticated;
grant execute on function public.save_tutor_application(uuid, text, text, text, text[], text, text[], text) to service_role;
grant execute on function public.settle_tutor_registration_payment(uuid, text, text, integer, text) to service_role;
grant execute on function public.decide_tutor_application(uuid, text) to service_role;
