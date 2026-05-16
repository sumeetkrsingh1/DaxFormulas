-- STEP 12 — Reliable signup flag read/write (run after steps 1–10)
-- Fixes signup staying "disabled" when anon cannot read app_settings via RLS.

create or replace function public.get_signup_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select
        case jsonb_typeof(value)
          when 'boolean' then (value #>> '{}')::boolean
          when 'string' then lower(trim(both '"' from value::text)) in ('true', '1', 'yes')
          else false
        end
      from public.app_settings
      where key = 'signup_enabled'
    ),
    true
  );
$$;

create or replace function public.set_signup_enabled(enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  insert into public.app_settings (key, value)
  values ('signup_enabled', to_jsonb(enabled))
  on conflict (key) do update
    set value = to_jsonb(enabled),
        updated_at = now();
end;
$$;

grant execute on function public.get_signup_enabled() to anon, authenticated;
grant execute on function public.set_signup_enabled(boolean) to authenticated;

-- Normalize existing row to jsonb boolean (fixes bad values)
update public.app_settings
set value = to_jsonb(true)
where key = 'signup_enabled'
  and value is distinct from 'true'::jsonb
  and value is distinct from 'false'::jsonb;
