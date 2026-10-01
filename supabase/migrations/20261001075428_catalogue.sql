-- Catalogue: categories and products, the admin check, and the product-images bucket.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- Admins are users whose app_metadata (not user_metadata, which users can edit) has role "admin".
create or replace function private.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

grant execute on function private.is_admin() to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.categories (
  slug text primary key,
  name text not null,
  description text not null default '',
  image_path text,
  tint text not null default 'sky'
    check (tint in ('sky', 'lavender', 'pink', 'mint', 'peach', 'cream', 'blue')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  brand text not null default '',
  category_slug text not null references public.categories (slug) on update cascade,
  short_description text not null default '',
  description text not null default '',
  price integer not null check (price >= 0),
  mrp integer check (mrp >= 0),
  rating numeric(2, 1) check (rating between 0 and 5),
  rating_count integer check (rating_count >= 0),
  image_path text,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  is_top_pick boolean not null default false,
  sku text not null unique,
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  status text not null default 'active' check (status in ('active', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_slug_idx on public.products (category_slug);

create trigger categories_set_updated_at before update on public.categories
  for each row execute function private.set_updated_at();
create trigger products_set_updated_at before update on public.products
  for each row execute function private.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;

grant select on public.categories, public.products to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;

create policy "Anyone can read categories" on public.categories
  for select to anon, authenticated using (true);
create policy "Admins can add categories" on public.categories
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins can change categories" on public.categories
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can remove categories" on public.categories
  for delete to authenticated using ((select private.is_admin()));

create policy "Anyone can read active products" on public.products
  for select to anon, authenticated
  using (status = 'active' or (select private.is_admin()));
create policy "Admins can add products" on public.products
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins can change products" on public.products
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can remove products" on public.products
  for delete to authenticated using ((select private.is_admin()));

-- Product and category pictures. Public to read; only admins can upload, replace or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "Admins can read product images" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins can replace product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()))
  with check (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins can delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));
