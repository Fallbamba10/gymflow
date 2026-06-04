-- Run this after supabase/schema.sql to enable staff management.

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

create table if not exists public.gym_staff (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  full_name text not null,
  role public.gym_role not null default 'operator',
  pin_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists gym_staff_gym_id_idx on public.gym_staff(gym_id);

alter table public.gym_staff enable row level security;

drop policy if exists "gym admins can manage staff" on public.gym_staff;
create policy "gym admins can manage staff"
on public.gym_staff for all
using (public.is_gym_admin(gym_id))
with check (public.is_gym_admin(gym_id));

create or replace function public.create_gym_staff_with_pin(
  target_gym_id uuid,
  target_full_name text,
  target_role public.gym_role default 'operator',
  target_pin text default null
)
returns public.gym_staff
language plpgsql
security definer
set search_path = public
as $$
declare
  staff_member public.gym_staff%rowtype;
begin
  if not public.is_gym_admin(target_gym_id) then
    raise exception 'not_allowed';
  end if;

  if length(trim(target_full_name)) < 2 then
    raise exception 'invalid_name';
  end if;

  if target_pin is null or target_pin !~ '^[0-9]{4,8}$' then
    raise exception 'invalid_pin';
  end if;

  insert into public.gym_staff (gym_id, full_name, role, pin_hash, active)
  values (
    target_gym_id,
    trim(target_full_name),
    target_role,
    crypt(target_pin, gen_salt('bf')),
    true
  )
  returning * into staff_member;

  return staff_member;
end;
$$;

grant execute on function public.create_gym_staff_with_pin(uuid, text, public.gym_role, text) to authenticated;
