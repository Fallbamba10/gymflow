-- GymFlow initial Supabase schema
-- MVP focus: gyms, roles, members, subscriptions, check-ins, payments.

create extension if not exists pgcrypto;

create type public.gym_role as enum ('admin', 'operator');
create type public.subscription_status as enum ('active', 'expired', 'cancelled');
create type public.payment_method as enum ('cash', 'wave', 'orange_money', 'card', 'other');
create type public.payment_kind as enum ('subscription', 'manual_adjustment');

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  public_description text,
  public_hours text,
  whatsapp_phone text,
  instagram_url text,
  tiktok_url text,
  cover_image_url text,
  currency text not null default 'XOF',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gym_users (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.gym_role not null default 'operator',
  full_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (gym_id, user_id)
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_number bigint generated always as identity,
  full_name text not null,
  phone text,
  photo_url text,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gym_id, member_number)
);

create table public.subscription_types (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,
  duration_days integer not null check (duration_days > 0),
  sessions integer check (sessions is null or sessions > 0),
  price integer not null check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  subscription_type_id uuid not null references public.subscription_types(id),
  starts_at date not null,
  expires_at date not null,
  sessions_left integer check (sessions_left is null or sessions_left >= 0),
  price_paid integer not null check (price_paid >= 0),
  status public.subscription_status not null default 'active',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  check (expires_at >= starts_at)
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id),
  operator_id uuid references auth.users(id),
  checked_in_at timestamptz not null default now(),
  notes text
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  kind public.payment_kind not null default 'subscription',
  method public.payment_method not null default 'cash',
  amount integer not null check (amount >= 0),
  operator_id uuid references auth.users(id),
  paid_at timestamptz not null default now(),
  notes text
);

create index gym_users_user_id_idx on public.gym_users(user_id);
create index members_gym_id_full_name_idx on public.members(gym_id, full_name);
create index members_gym_id_phone_idx on public.members(gym_id, phone);
create index subscription_types_gym_id_idx on public.subscription_types(gym_id);
create index subscriptions_gym_member_idx on public.subscriptions(gym_id, member_id);
create index subscriptions_gym_status_idx on public.subscriptions(gym_id, status);
create index checkins_gym_checked_in_at_idx on public.checkins(gym_id, checked_in_at desc);
create index payments_gym_paid_at_idx on public.payments(gym_id, paid_at desc);

create or replace function public.is_gym_member(target_gym_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gym_users gu
    where gu.gym_id = target_gym_id
      and gu.user_id = auth.uid()
      and gu.active = true
  );
$$;

create or replace function public.is_gym_admin(target_gym_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gym_users gu
    where gu.gym_id = target_gym_id
      and gu.user_id = auth.uid()
      and gu.role = 'admin'
      and gu.active = true
  );
$$;

create or replace function public.create_owner_gym_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.gym_users (gym_id, user_id, role)
  values (new.id, new.owner_id, 'admin');

  return new;
end;
$$;

create trigger create_owner_gym_user_after_gym_insert
after insert on public.gyms
for each row
execute function public.create_owner_gym_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_gyms_updated_at
before update on public.gyms
for each row
execute function public.touch_updated_at();

create trigger touch_members_updated_at
before update on public.members
for each row
execute function public.touch_updated_at();

create or replace function public.perform_checkin(
  target_gym_id uuid,
  target_member_id uuid,
  target_operator_id uuid default auth.uid()
)
returns public.checkins
language plpgsql
security definer
set search_path = public
as $$
declare
  active_subscription public.subscriptions%rowtype;
  new_checkin public.checkins%rowtype;
begin
  if not public.is_gym_member(target_gym_id) then
    raise exception 'not_allowed';
  end if;

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

  insert into public.checkins (gym_id, member_id, subscription_id, operator_id)
  values (target_gym_id, target_member_id, active_subscription.id, target_operator_id)
  returning * into new_checkin;

  return new_checkin;
end;
$$;

alter table public.gyms enable row level security;
alter table public.gym_users enable row level security;
alter table public.members enable row level security;
alter table public.subscription_types enable row level security;
alter table public.subscriptions enable row level security;
alter table public.checkins enable row level security;
alter table public.payments enable row level security;

create policy "gym members can read gyms"
on public.gyms for select
using (public.is_gym_member(id));

create policy "owners can create gyms"
on public.gyms for insert
with check (owner_id = auth.uid());

create policy "admins can update gyms"
on public.gyms for update
using (public.is_gym_admin(id))
with check (public.is_gym_admin(id));

create policy "gym members can read gym users"
on public.gym_users for select
using (public.is_gym_member(gym_id));

create policy "admins can manage gym users"
on public.gym_users for all
using (public.is_gym_admin(gym_id))
with check (public.is_gym_admin(gym_id));

create policy "gym members can read members"
on public.members for select
using (public.is_gym_member(gym_id));

create policy "gym members can create members"
on public.members for insert
with check (public.is_gym_member(gym_id));

create policy "gym members can update members"
on public.members for update
using (public.is_gym_member(gym_id))
with check (public.is_gym_member(gym_id));

create policy "admins can delete members"
on public.members for delete
using (public.is_gym_admin(gym_id));

create policy "gym members can read subscription types"
on public.subscription_types for select
using (public.is_gym_member(gym_id));

create policy "admins can manage subscription types"
on public.subscription_types for all
using (public.is_gym_admin(gym_id))
with check (public.is_gym_admin(gym_id));

create policy "gym members can read subscriptions"
on public.subscriptions for select
using (public.is_gym_member(gym_id));

create policy "gym members can create subscriptions"
on public.subscriptions for insert
with check (public.is_gym_member(gym_id));

create policy "gym members can update subscriptions"
on public.subscriptions for update
using (public.is_gym_member(gym_id))
with check (public.is_gym_member(gym_id));

create policy "gym members can read checkins"
on public.checkins for select
using (public.is_gym_member(gym_id));

create policy "gym members can create checkins"
on public.checkins for insert
with check (public.is_gym_member(gym_id));

create policy "gym members can read payments"
on public.payments for select
using (public.is_gym_member(gym_id));

create policy "gym members can create payments"
on public.payments for insert
with check (public.is_gym_member(gym_id));

create policy "admins can update payments"
on public.payments for update
using (public.is_gym_admin(gym_id))
with check (public.is_gym_admin(gym_id));
