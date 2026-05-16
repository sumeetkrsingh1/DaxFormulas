-- STEP 10 — App settings: UPDATE policy (admin only)
drop policy if exists "settings_update_admin" on public.app_settings;
create policy "settings_update_admin"
  on public.app_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
