-- Run this after supabase/schema.sql to enable adding staff by email.

create or replace function public.add_gym_user_by_email(
  target_gym_id uuid,
  target_email text,
  target_role public.gym_role default 'operator'
)
returns public.gym_users
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user auth.users%rowtype;
  team_member public.gym_users%rowtype;
begin
  if not public.is_gym_admin(target_gym_id) then
    raise exception 'not_allowed';
  end if;

  select *
  into target_user
  from auth.users
  where lower(email) = lower(trim(target_email))
  limit 1;

  if not found then
    raise exception 'user_not_found';
  end if;

  insert into public.gym_users (gym_id, user_id, role, full_name, active)
  values (
    target_gym_id,
    target_user.id,
    target_role,
    coalesce(target_user.raw_user_meta_data ->> 'full_name', target_user.email),
    true
  )
  on conflict (gym_id, user_id)
  do update set
    role = excluded.role,
    full_name = coalesce(public.gym_users.full_name, excluded.full_name),
    active = true
  returning * into team_member;

  return team_member;
end;
$$;

grant execute on function public.add_gym_user_by_email(uuid, text, public.gym_role) to authenticated;
