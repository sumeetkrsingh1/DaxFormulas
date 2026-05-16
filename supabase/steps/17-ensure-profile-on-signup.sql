-- STEP 17 — Auto-create profile row when a user signs up
-- Run in Supabase Dashboard → SQL Editor.

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

-- Fallback: call from app after signup when user has a session
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

-- Backfill any auth users missing a profile
insert into public.profiles (id, email, full_name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
