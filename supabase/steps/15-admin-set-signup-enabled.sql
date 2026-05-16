-- STEP 15 — Admin can toggle signup_enabled without login (bypasses RLS)
-- Run in Supabase Dashboard → SQL Editor, then retry the admin toggle.

create or replace function public.admin_set_signup_enabled(enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_settings (key, value)
  values ('signup_enabled', to_jsonb(enabled))
  on conflict (key) do update
  set value = to_jsonb(enabled),
      updated_at = now();
end;
$$;

grant execute on function public.admin_set_signup_enabled(boolean) to anon, authenticated;

-- Refresh PostgREST schema cache (optional; Supabase usually picks this up within a minute)
notify pgrst, 'reload schema';
