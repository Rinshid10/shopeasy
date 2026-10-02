-- Products a shopper hearted. Guests get an anonymous account on their first heart, like on
-- their first Buy Now, so the list survives reloads and carries over when they log in.
create table public.wishlist_items (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index wishlist_items_product_id_idx on public.wishlist_items (product_id);

alter table public.wishlist_items enable row level security;
grant select, insert, delete on public.wishlist_items to authenticated;

create policy "Shoppers read their wishlist" on public.wishlist_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Shoppers add to their wishlist" on public.wishlist_items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Shoppers remove from their wishlist" on public.wishlist_items
  for delete to authenticated using ((select auth.uid()) = user_id);
