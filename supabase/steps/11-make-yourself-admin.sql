-- STEP 11 — Run ONLY after you signed up once in the app
-- Change the email to yours:

update public.profiles
set role = 'admin', is_approved = true
where email = 'you@example.com';
