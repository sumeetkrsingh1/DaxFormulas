-- STEP 9 — App settings: READ policies
drop policy if exists "settings_select_signup_flag" on public.app_settings;
create policy "settings_select_signup_flag"
  on public.app_settings for select
  to anon, authenticated
  using (key = 'signup_enabled');

drop policy if exists "settings_select_admin" on public.app_settings;
create policy "settings_select_admin"
  on public.app_settings for select
  to authenticated
  using (public.is_admin());
