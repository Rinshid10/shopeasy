-- Customers log in with their mobile number, so keep it on their profile too.

create or replace function private.sync_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, phone, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.phone, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        phone = case when excluded.phone <> '' then excluded.phone else public.profiles.phone end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_contact_changed after update of email, phone on auth.users
  for each row when (old.email is distinct from new.email or old.phone is distinct from new.phone)
  execute function private.sync_profile();
