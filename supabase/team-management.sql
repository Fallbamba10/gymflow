-- Run this after supabase/schema.sql to enable staff management.

create extension if not exists pgcrypto with schema extensions;

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
set search_path = public, extensions
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

alter table public.checkins
add column if not exists staff_id uuid references public.gym_staff(id) on delete set null;

alter table public.payments
add column if not exists staff_id uuid references public.gym_staff(id) on delete set null;

create index if not exists checkins_staff_id_idx on public.checkins(staff_id);
create index if not exists payments_staff_id_idx on public.payments(staff_id);

create or replace function public.verify_gym_staff_pin(
  target_gym_id uuid,
  target_staff_id uuid,
  target_pin text
)
returns public.gym_staff
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  staff_member public.gym_staff%rowtype;
begin
  if not public.is_gym_member(target_gym_id) then
    raise exception 'not_allowed';
  end if;

  select *
  into staff_member
  from public.gym_staff
  where id = target_staff_id
    and gym_id = target_gym_id
    and active = true
    and pin_hash = crypt(target_pin, pin_hash)
  limit 1;

  if not found then
    raise exception 'invalid_staff_pin';
  end if;

  return staff_member;
end;
$$;

grant execute on function public.verify_gym_staff_pin(uuid, uuid, text) to authenticated;

create or replace function public.perform_checkin_with_staff_pin(
  target_gym_id uuid,
  target_member_id uuid,
  target_staff_id uuid,
  target_pin text,
  target_operator_id uuid default auth.uid()
)
returns public.checkins
language plpgsql
security definer
set search_path = public
as $$
declare
  active_subscription public.subscriptions%rowtype;
  staff_member public.gym_staff%rowtype;
  new_checkin public.checkins%rowtype;
begin
  if not public.is_gym_member(target_gym_id) then
    raise exception 'not_allowed';
  end if;

  staff_member := public.verify_gym_staff_pin(target_gym_id, target_staff_id, target_pin);

  select s.*
  into active_subscription
  from public.subscriptions s
  where s.gym_id = target_gym_id
    and s.member_id = target_member_id
    and s.status = 'active'
    and s.starts_at <= current_date
    and s.expires_at >= current_date
    and (s.sessions_left is null or s.sessions_left > 0)
  order by s.expires_at desc, s.created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'no_active_subscription';
  end if;

  if active_subscription.sessions_left is not null then
    update public.subscriptions
    set sessions_left = sessions_left - 1,
        status = case when sessions_left - 1 = 0 then 'expired'::public.subscription_status else status end
    where id = active_subscription.id;
  end if;

  insert into public.checkins (gym_id, member_id, subscription_id, operator_id, staff_id)
  values (target_gym_id, target_member_id, active_subscription.id, target_operator_id, staff_member.id)
  returning * into new_checkin;

  return new_checkin;
end;
$$;

grant execute on function public.perform_checkin_with_staff_pin(uuid, uuid, uuid, text, uuid) to authenticated;
