-- Public page customization for each gym storefront.

alter table public.gyms
add column if not exists public_description text,
add column if not exists public_hours text,
add column if not exists whatsapp_phone text,
add column if not exists instagram_url text,
add column if not exists tiktok_url text,
add column if not exists cover_image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gym-covers',
  'gym-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read gym cover images" on storage.objects;
create policy "public can read gym cover images"
on storage.objects for select
using (bucket_id = 'gym-covers');

drop policy if exists "gym admins can upload cover images" on storage.objects;
create policy "gym admins can upload cover images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'gym-covers'
  and public.is_gym_admin((storage.foldername(name))[1]::uuid)
);

drop policy if exists "gym admins can update cover images" on storage.objects;
create policy "gym admins can update cover images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'gym-covers'
  and public.is_gym_admin((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'gym-covers'
  and public.is_gym_admin((storage.foldername(name))[1]::uuid)
);

drop policy if exists "gym admins can delete cover images" on storage.objects;
create policy "gym admins can delete cover images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'gym-covers'
  and public.is_gym_admin((storage.foldername(name))[1]::uuid)
);

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
      'tiktok_url', g.tiktok_url,
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
