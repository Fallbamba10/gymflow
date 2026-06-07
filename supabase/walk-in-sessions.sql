-- Run this after supabase/schema.sql and supabase/team-management.sql.
-- Enables walk-in session payments directly from the check-in screen.

alter table public.checkins
alter column member_id drop not null;

alter table public.checkins
add column if not exists staff_id uuid references public.gym_staff(id) on delete set null;

alter table public.payments
add column if not exists staff_id uuid references public.gym_staff(id) on delete set null;

create or replace function public.perform_walkin_checkin(
  target_gym_id uuid,
  target_amount integer,
  target_method public.payment_method default 'cash',
  target_customer_name text default null,
  target_staff_id uuid default null,
  target_pin text default null,
  target_operator_id uuid default auth.uid()
)
returns public.checkins
language plpgsql
security definer
set search_path = public
as $$
declare
  staff_member public.gym_staff%rowtype;
  new_checkin public.checkins%rowtype;
  customer_label text;
begin
  if not public.is_gym_member(target_gym_id) then
    raise exception 'not_allowed';
  end if;

  if target_amount is null or target_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  if target_staff_id is not null then
    staff_member := public.verify_gym_staff_pin(target_gym_id, target_staff_id, target_pin);
  end if;

  customer_label := nullif(trim(coalesce(target_customer_name, '')), '');

  insert into public.payments (
    gym_id,
    member_id,
    subscription_id,
    kind,
    method,
    amount,
    operator_id,
    staff_id,
    notes
  )
  values (
    target_gym_id,
    null,
    null,
    'manual_adjustment',
    target_method,
    target_amount,
    target_operator_id,
    staff_member.id,
    case
      when customer_label is null then 'Seance simple'
      else 'Seance simple - ' || customer_label
    end
  );

  insert into public.checkins (
    gym_id,
    member_id,
    subscription_id,
    operator_id,
    staff_id,
    notes
  )
  values (
    target_gym_id,
    null,
    null,
    target_operator_id,
    staff_member.id,
    case
      when customer_label is null then 'Seance simple'
      else 'Seance simple - ' || customer_label
    end
  )
  returning * into new_checkin;

  return new_checkin;
end;
$$;

grant execute on function public.perform_walkin_checkin(uuid, integer, public.payment_method, text, uuid, text, uuid) to authenticated;
