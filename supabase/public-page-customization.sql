-- Public page customization for each gym storefront.

alter table public.gyms
add column if not exists public_description text,
add column if not exists public_hours text,
add column if not exists whatsapp_phone text,
add column if not exists instagram_url text,
add column if not exists cover_image_url text;

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
      'currency', g.currency,
      'public_description', g.public_description,
      'public_hours', g.public_hours,
      'whatsapp_phone', g.whatsapp_phone,
      'instagram_url', g.instagram_url,
      'cover_image_url', g.cover_image_url
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
