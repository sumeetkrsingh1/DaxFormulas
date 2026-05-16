-- STEP 13 — Backfill missing profiles for existing auth users
-- Run this once in Supabase SQL Editor if users exist in auth.users but not in public.profiles.

insert into public.profiles (id, email, full_name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
