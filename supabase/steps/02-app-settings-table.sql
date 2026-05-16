-- STEP 2 — Create app_settings table + default signup flag
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('signup_enabled', to_jsonb(true))
on conflict (key) do nothing;
