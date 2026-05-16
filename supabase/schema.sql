-- ============================================================
-- DAX Formula Library — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1) Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  is_approved boolean not null default false,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_role_idx on public.profiles (role);

-- 2) App settings (signup toggle, etc.)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('signup_enabled', to_jsonb(true))
on conflict (key) do nothing;

-- 3) Admin user management
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

-- 4) Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.ensure_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.profiles (id, email, full_name)
  select
    u.id,
    coalesce(u.email, ''),
    coalesce(u.raw_user_meta_data ->> 'full_name', '')
  from auth.users u
  where u.id = auth.uid()
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);
end;
$$;

grant execute on function public.ensure_profile() to authenticated;

-- 4) Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists app_settings_updated_at on public.app_settings;
create trigger app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- 5) Helper: is current user admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_approved = true
  );
$$;

-- ============================================================
-- Row Level Security (READ / WRITE / UPDATE)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;

-- ---- PROFILES ----

-- READ: users see own row; admins see all
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- INSERT: only via trigger (service role / security definer)
-- No direct client insert policy needed.

-- UPDATE: users may update own display name only
drop policy if exists "profiles_update_own_name" on public.profiles;
create policy "profiles_update_own_name"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and is_approved = (select p.is_approved from public.profiles p where p.id = auth.uid())
  );

-- UPDATE: admins manage approval, role, names for all users
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- APP SETTINGS ----

-- READ signup_enabled: anyone (login page + signup page before auth)
drop policy if exists "settings_select_signup_flag" on public.app_settings;
create policy "settings_select_signup_flag"
  on public.app_settings for select
  to anon, authenticated
  using (key = 'signup_enabled');

-- READ all settings: admins only
drop policy if exists "settings_select_admin" on public.app_settings;
create policy "settings_select_admin"
  on public.app_settings for select
  to authenticated
  using (public.is_admin());

-- UPDATE settings: admins only
drop policy if exists "settings_update_admin" on public.app_settings;
create policy "settings_update_admin"
  on public.app_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- FIRST ADMIN (run after you sign up once)
-- Replace with your email:
-- ============================================================
-- update public.profiles
-- set role = 'admin', is_approved = true
-- where email = 'you@example.com';
