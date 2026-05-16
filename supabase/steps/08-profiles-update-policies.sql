-- STEP 8 — Profiles: UPDATE policies
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

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
