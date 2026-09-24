-- ════════════════════════════════════════════════════════════════════════════
--  Sankshep.ai — central database schema
--  Run this whole file once in: Supabase Dashboard → SQL Editor → New query.
--  It is idempotent: safe to re-run after edits.
-- ════════════════════════════════════════════════════════════════════════════

-- The single account that gets the admin role. Change it here if needed.
-- (Also update ADMIN_EMAIL in src/lib/supabase.ts to match.)
create or replace function public.admin_email()
returns text language sql immutable as $$ select 'admin@gmail.com'::text $$;


-- ─── 1. Profiles: one row per verified account ──────────────────────────────

create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  email           text not null,
  role            text not null default 'user' check (role in ('user', 'admin')),
  created_at      timestamptz not null default now(),
  last_sign_in_at timestamptz
);


-- ─── 2. Activity log: every action a user takes ─────────────────────────────

create table if not exists public.activity_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  action          text not null check (action in ('signup', 'login', 'logout', 'generate', 'regenerate')),
  input_type      text check (input_type in ('file', 'url', 'text')),
  source_name     text,                      -- file name or URL
  input_preview   text,                      -- first ~300 chars of the source
  input_chars     integer,
  formats         text[] not null default '{}',
  tone            text,
  target_language text,
  custom_schema   text,
  refinement      text,                      -- instructions used for a regenerate
  outputs         jsonb,                     -- { "<format>": "<generated text>" }
  status          text check (status in ('success', 'partial', 'error')),
  success_count   integer,
  error_count     integer,
  duration_ms     integer,
  error_message   text,
  created_at      timestamptz not null default now()
);

create index if not exists activity_logs_user_created_idx on public.activity_logs (user_id, created_at desc);
create index if not exists activity_logs_created_idx      on public.activity_logs (created_at desc);


-- ─── 3. Admin check (SECURITY DEFINER so it can read profiles past RLS) ─────

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


-- ─── 4. Keep profiles in sync with auth.users ───────────────────────────────
-- There is no email verification: with "Confirm email" off, Supabase marks
-- every new account confirmed at sign-up, which creates its profile here.
-- Profiles are only made for confirmed users, so any leftover unconfirmed
-- sign-ups from before verification was removed stay hidden until section 9
-- activates them.

create or replace function public.create_profile_for_verified_user(u auth.users)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role, created_at, last_sign_in_at)
  values (
    u.id,
    u.email,
    case when lower(u.email) = public.admin_email() then 'admin' else 'user' end,
    coalesce(u.email_confirmed_at, now()),
    u.last_sign_in_at
  )
  on conflict (id) do nothing;

  if found then
    insert into public.activity_logs (user_id, action, created_at)
    values (u.id, 'signup', coalesce(u.email_confirmed_at, now()));
  end if;
end;
$$;

revoke execute on function public.create_profile_for_verified_user(auth.users) from public, anon, authenticated;

-- Users added from the dashboard with "Auto Confirm User" are verified on insert.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null then
    perform public.create_profile_for_verified_user(new);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_updated()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- Account confirmed just now → create its profile.
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    perform public.create_profile_for_verified_user(new);
  end if;

  update public.profiles
     set email = new.email,
         last_sign_in_at = new.last_sign_in_at
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, last_sign_in_at, email_confirmed_at on auth.users
  for each row execute function public.handle_user_updated();

-- Remove profiles an earlier version of this script made for unverified users.
delete from public.profiles p
 using auth.users u
 where p.id = u.id and u.email_confirmed_at is null;

-- Backfill verified accounts that were created before this script ran.
insert into public.profiles as p (id, email, role, created_at, last_sign_in_at)
select u.id,
       u.email,
       case when lower(u.email) = public.admin_email() then 'admin' else 'user' end,
       coalesce(u.created_at, now()),
       u.last_sign_in_at
  from auth.users u
 where u.email_confirmed_at is not null
on conflict (id) do update
   set email = excluded.email,
       last_sign_in_at = excluded.last_sign_in_at,
       role = case when lower(excluded.email) = public.admin_email() then 'admin' else p.role end;


-- ─── 5. Row Level Security ──────────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.activity_logs enable row level security;

-- profiles: users read their own row; admin reads all.
-- No insert/update/delete policies → clients can never change roles.
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- activity_logs: users insert rows only for themselves.
drop policy if exists "activity: insert own" on public.activity_logs;
create policy "activity: insert own" on public.activity_logs
  for insert to authenticated
  with check (user_id = auth.uid());

-- activity_logs: users read their own history; admin reads everyone's.
drop policy if exists "activity: read own or admin" on public.activity_logs;
create policy "activity: read own or admin" on public.activity_logs
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

grant select         on public.profiles      to authenticated;
grant select, insert on public.activity_logs to authenticated;
revoke all on public.profiles, public.activity_logs from anon;


-- ─── 6. Admin RPC: every user with usage totals ─────────────────────────────

create or replace function public.admin_list_users()
returns table (
  id               uuid,
  email            text,
  role             text,
  created_at       timestamptz,
  last_sign_in_at  timestamptz,
  generation_count bigint,
  last_activity_at timestamptz
)
language plpgsql stable security definer set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return query
    select p.id, p.email, p.role, p.created_at, p.last_sign_in_at,
           count(a.id) filter (where a.action in ('generate', 'regenerate')),
           max(a.created_at)
      from public.profiles p
      left join public.activity_logs a on a.user_id = p.id
     group by p.id
     order by p.created_at desc;
end;
$$;

revoke execute on function public.admin_list_users() from public, anon;
grant  execute on function public.admin_list_users() to authenticated;
grant  execute on function public.is_admin()         to authenticated;


-- ─── 7. Shared demo account (demo@sankshep.ai / demo123) ────────────────────
-- Creates the account behind the "Use Demo Credentials" button. If it already
-- exists, its password is reset to demo123 and its email marked confirmed.

create or replace function public.demo_email()
returns text language sql immutable as $$ select 'demo@sankshep.ai'::text $$;

do $$
declare
  demo_id uuid;
begin
  select id into demo_id from auth.users where lower(email) = public.demo_email();

  if demo_id is null then
    demo_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new,
      email_change_token_current, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', demo_id, 'authenticated', 'authenticated',
      public.demo_email(), extensions.crypt('demo123', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(),
      '', '', '', '', '', ''
    );

    insert into auth.identities (user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (
      demo_id, demo_id::text, 'email',
      jsonb_build_object('sub', demo_id::text, 'email', public.demo_email(), 'email_verified', true),
      now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password = extensions.crypt('demo123', extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now())
     where id = demo_id;
  end if;
end;
$$;


-- ─── 8. Account deletion ────────────────────────────────────────────────────
-- Deleting from auth.users cascades to profiles and activity_logs.
-- The demo account and the admin account are protected.

create or replace function public.delete_my_account()
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  me_email text;
begin
  select lower(email) into me_email from auth.users where id = auth.uid();
  if me_email is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  if me_email = public.demo_email() then
    raise exception 'The shared demo account cannot be deleted.' using errcode = '42501';
  end if;
  if me_email = public.admin_email() then
    raise exception 'The admin account cannot be deleted.' using errcode = '42501';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  target_email text;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select lower(email) into target_email from auth.users where id = target_user_id;
  if target_email is null then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  if target_user_id = auth.uid() or target_email = public.admin_email() then
    raise exception 'The admin account cannot be deleted.' using errcode = '42501';
  end if;

  delete from auth.users where id = target_user_id;
end;
$$;

revoke execute on function public.delete_my_account()       from public, anon;
revoke execute on function public.admin_delete_user(uuid)   from public, anon;
grant  execute on function public.delete_my_account()       to authenticated;
grant  execute on function public.admin_delete_user(uuid)   to authenticated;


-- ─── 9. Activate accounts created while email verification was on ─────────
-- Email verification has been removed. Anyone who signed up earlier and never
-- clicked a confirmation link is activated here (the trigger in section 4
-- creates their profile), so they can sign in with their password.

update auth.users
   set email_confirmed_at = now()
 where email_confirmed_at is null;


-- ─── 10. Per-draft detail for History and Analytics ────────────────────────
-- Exact source word count and the model that wrote each draft. Rows logged
-- before this section have both as null; the app estimates their word count
-- from input_chars and shows the provider without a model. Safe to re-run.

alter table public.activity_logs add column if not exists input_words integer;
alter table public.activity_logs add column if not exists models      jsonb;   -- { "<format>": "<model id>" }

-- Make PostgREST see the new columns immediately.
notify pgrst, 'reload schema';
