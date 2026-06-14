-- GymFlow — Cours collectifs
-- Run after schema.sql

-- Définition d'un cours (template récurrent)
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null,                        -- ex: "Zumba", "CrossFit", "Yoga"
  description text,
  instructor text,                           -- nom de l'intervenant
  color text not null default '#1E8A6A',     -- couleur dans le planning
  capacity int not null default 20 check (capacity > 0),
  duration_minutes int not null default 60 check (duration_minutes > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Séance = occurrence d'un cours à une date/heure précise
create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  instructor text,                           -- override de l'intervenant pour cette séance
  capacity int,                              -- override de la capacité pour cette séance
  status text not null default 'scheduled'
    check (status in ('scheduled', 'ongoing', 'done', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- Inscriptions membres à une séance
create table if not exists public.class_bookings (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  booked_at timestamptz not null default now(),
  unique (session_id, member_id)
);

-- Index
create index if not exists classes_gym_id_idx on public.classes(gym_id);
create index if not exists class_sessions_gym_starts_idx on public.class_sessions(gym_id, starts_at desc);
create index if not exists class_sessions_class_id_idx on public.class_sessions(class_id);
create index if not exists class_bookings_session_idx on public.class_bookings(session_id);
create index if not exists class_bookings_member_idx on public.class_bookings(member_id);

-- RLS
alter table public.classes enable row level security;
alter table public.class_sessions enable row level security;
alter table public.class_bookings enable row level security;

create policy "gym_members_can_read_classes"
  on public.classes for select
  using (public.is_gym_member(gym_id));

create policy "gym_admins_manage_classes"
  on public.classes for all
  using (public.is_gym_admin(gym_id));

create policy "gym_members_can_read_sessions"
  on public.class_sessions for select
  using (public.is_gym_member(gym_id));

create policy "gym_admins_manage_sessions"
  on public.class_sessions for all
  using (public.is_gym_admin(gym_id));

create policy "gym_members_can_read_bookings"
  on public.class_bookings for select
  using (public.is_gym_member(gym_id));

create policy "gym_admins_manage_bookings"
  on public.class_bookings for all
  using (public.is_gym_admin(gym_id));
