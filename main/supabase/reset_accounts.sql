-- ════════════════════════════════════════════════════════════════════════════
--  Fresh start: wipe every account and all history, keep only admin and demo.
--
--  THIS CANNOT BE UNDONE. It permanently deletes:
--    • every account except admin@gmail.com and demo@gmail.com
--    • every activity_logs row (History and Analytics) for every account,
--      including admin and demo
--    • saved audience profiles (user metadata) on the admin and demo accounts
--
--  Then it creates (or resets) the two kept accounts:
--    admin@gmail.com / A@dmin12345
--    demo@gmail.com  / Demo@1234
--
--  Run schema.sql first (it defines admin_email() and demo_email()), then
--  paste this file into Supabase Dashboard → SQL Editor and run it.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- 0. Make sure the database knows the current demo email (the old one was demo@sankshep.ai).
create or replace function public.demo_email()
returns text language sql immutable as $$ select 'demo@gmail.com'::text $$;

-- 1. All history and analytics, for everyone.
delete from public.activity_logs;

-- 2. Every account except admin and demo. Cascades to profiles.
delete from auth.users
 where lower(email) not in (public.admin_email(), public.demo_email())
    or email is null;

-- 3. Create or reset the two kept accounts with a clean slate.
do $$
declare
  acct record;
  acct_id uuid;
begin
  for acct in
    select * from (values
      (public.admin_email(), 'A@dmin12345', 'admin'),
      (public.demo_email(),  'Demo@1234',   'user')
    ) as t(email, password, role)
  loop
    select id into acct_id from auth.users where lower(email) = acct.email;

    if acct_id is null then
      acct_id := gen_random_uuid();

      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change, email_change_token_new,
        email_change_token_current, reauthentication_token
      ) values (
        '00000000-0000-0000-0000-000000000000', acct_id, 'authenticated', 'authenticated',
        acct.email, extensions.crypt(acct.password, extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{}', now(), now(),
        '', '', '', '', '', ''
      );

      insert into auth.identities (user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
      values (
        acct_id, acct_id::text, 'email',
        jsonb_build_object('sub', acct_id::text, 'email', acct.email, 'email_verified', true),
        now(), now(), now()
      );
    else
      update auth.users
         set encrypted_password = extensions.crypt(acct.password, extensions.gen_salt('bf')),
             email_confirmed_at = coalesce(email_confirmed_at, now()),
             raw_user_meta_data = '{}',   -- drops saved audience profiles
             last_sign_in_at    = null,
             banned_until       = null,   -- re-enables the account if an admin had disabled it
             updated_at         = now()
       where id = acct_id;

      -- Sign out every existing session on these accounts.
      delete from auth.sessions where user_id = acct_id;
      delete from auth.refresh_tokens where user_id = acct_id::text;
    end if;

    insert into public.profiles (id, email, role, last_sign_in_at, disabled_at)
    values (acct_id, acct.email, acct.role, null, null)
    on conflict (id) do update set role = excluded.role, last_sign_in_at = null, disabled_at = null;
  end loop;
end;
$$;

commit;

-- Check: should return exactly two rows, admin and demo, with 0 activity.
select p.email, p.role,
       (select count(*) from public.activity_logs a where a.user_id = p.id) as activity
  from public.profiles p
 order by p.role;
