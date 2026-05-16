-- STEP 16 — Ensure signup_enabled is stored as jsonb boolean, not jsonb string
update public.app_settings
set value = to_jsonb(
  case
    when jsonb_typeof(value) = 'boolean' then (value #>> '{}')::boolean
    when jsonb_typeof(value) = 'string' then lower(trim(both '"' from value::text)) in ('true', '1', 'yes')
    else true
  end
)
where key = 'signup_enabled';
