-- ════════════════════════════════════════════════════════════════════════════
--  Create (or reset) the admin account: admin@gmail.com
--
--  1. Run schema.sql first.
--  2. Paste this file into Supabase Dashboard → SQL Editor.
--  3. Replace CHANGE_ME below with the admin password you want
--     (do it in the SQL editor only — never commit a real password).
--  4. Run it. Safe to re-run: it resets the password each time.
-- ════════════════════════════════════════════════════════════════════════════

do $$
declare
  admin_password constant text := 'admin123';
  admin_id uuid;
begin
  if admin_password = 'CHANGE_ME' or length(admin_password) < 6 then
    raise exception 'Set admin_password to your own password (6+ characters) before running.';
  end if;

  select id into admin_id from auth.users where lower(email) = public.admin_email();

  if admin_id is null then
    admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new,
      email_change_token_current, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
      public.admin_email(), extensions.crypt(admin_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(),
      '', '', '', '', '', ''
    );

    insert into auth.identities (user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (
      admin_id, admin_id::text, 'email',
      jsonb_build_object('sub', admin_id::text, 'email', public.admin_email(), 'email_verified', true),
      now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password = extensions.crypt(admin_password, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now())
     where id = admin_id;
  end if;

  -- Make sure the profile exists and carries the admin role.
  insert into public.profiles (id, email, role)
  values (admin_id, public.admin_email(), 'admin')
  on conflict (id) do update set role = 'admin';
end;
$$;
