-- Public gym pages expose only safe storefront data.

create or replace function public.get_public_gym_page(target_gym_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'gym',
    jsonb_build_object(
      'id', g.id,
      'name', g.name,
      'phone', g.phone,
      'address', g.address,
      'currency', g.currency
    ),
    'plans',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', st.id,
            'name', st.name,
            'duration_days', st.duration_days,
            'sessions', st.sessions,
            'price', st.price
          )
          order by st.price asc, st.duration_days asc
        )
        from public.subscription_types st
        where st.gym_id = g.id
          and st.active = true
      ),
      '[]'::jsonb
    )
  )
  from public.gyms g
  where g.id = target_gym_id;
$$;

grant execute on function public.get_public_gym_page(uuid) to anon;
grant execute on function public.get_public_gym_page(uuid) to authenticated;
