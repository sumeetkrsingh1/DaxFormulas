-- STEP 14 — Admin users and admin-only management functions
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.admin_verify_login(email text, password text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower($1)
      and is_active = true
      and password_hash = crypt($2, password_hash)
  );
$$;

grant execute on function public.admin_verify_login(text, text) to anon, authenticated;

create or replace function public.admin_read_profiles()
returns setof public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles order by created_at desc;
$$;

grant execute on function public.admin_read_profiles() to anon, authenticated;

create or replace function public.admin_set_profile_approval(uid uuid, approved boolean)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  update public.profiles
  set is_approved = approved
  where id = uid;
end;
$$;

grant execute on function public.admin_set_profile_approval(uuid, boolean) to anon, authenticated;

create or replace function public.admin_set_signup_enabled(enabled boolean)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  insert into public.app_settings (key, value)
  values ('signup_enabled', to_jsonb(enabled))
  on conflict (key) do update set value = to_jsonb(enabled);
end;
$$;

grant execute on function public.admin_set_signup_enabled(boolean) to anon, authenticated;
