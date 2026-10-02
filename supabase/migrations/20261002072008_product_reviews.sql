-- Customer reviews. A customer can rate (1-5) and review a product once per order, after that
-- order has been delivered. The shop shows visible reviews to everyone; the admin can hide one.
-- The product's rating and rating_count follow its visible reviews once it has any.

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  order_id text not null references public.orders (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Set from the order by a trigger, e.g. "Priya S.", so it can't be made up.
  reviewer_name text not null default '',
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (length(comment) <= 1000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create index product_reviews_product_id_idx
  on public.product_reviews (product_id, created_at desc);
create index product_reviews_user_id_idx on public.product_reviews (user_id);

create trigger product_reviews_set_updated_at before update on public.product_reviews
  for each row execute function private.set_updated_at();

-- "Priya Sharma" becomes "Priya S."; the name comes from the order, not from the customer.
create or replace function private.set_reviewer_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  select coalesce(nullif(trim(o.customer_name), ''), o.address ->> 'fullName', 'Customer')
  into v_name
  from public.orders o
  where o.id = new.order_id;

  v_name := trim(coalesce(v_name, 'Customer'));
  new.reviewer_name := case
    when position(' ' in v_name) > 0 then
      split_part(v_name, ' ', 1) || ' ' || upper(left(split_part(v_name, ' ', 2), 1)) || '.'
    else v_name
  end;
  return new;
end;
$$;

revoke execute on function private.set_reviewer_name() from public, anon, authenticated;

create trigger product_reviews_set_reviewer_name before insert on public.product_reviews
  for each row execute function private.set_reviewer_name();

-- Keep the product's rating in step with its visible reviews.
create or replace function private.refresh_product_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product uuid := coalesce(new.product_id, old.product_id);
  v_count integer;
  v_average numeric;
begin
  select count(*), avg(rating) into v_count, v_average
  from public.product_reviews
  where product_id = v_product and not is_hidden;

  if v_count > 0 then
    update public.products
    set rating = round(v_average, 1), rating_count = v_count
    where id = v_product;
  end if;
  return null;
end;
$$;

revoke execute on function private.refresh_product_rating() from public, anon, authenticated;

create trigger product_reviews_refresh_rating
  after insert or update or delete on public.product_reviews
  for each row execute function private.refresh_product_rating();

alter table public.product_reviews enable row level security;

grant select on public.product_reviews to anon, authenticated;
grant insert (product_id, order_id, rating, comment) on public.product_reviews to authenticated;
grant update (rating, comment) on public.product_reviews to authenticated;

create policy "Anyone reads visible reviews; owners and admins read all" on public.product_reviews
  for select to anon, authenticated
  using (
    not is_hidden
    or (select auth.uid()) = user_id
    or (select private.is_admin())
  );

create policy "Buyers review products from their delivered orders" on public.product_reviews
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.orders o
      join public.order_items i on i.order_id = o.id
      where o.id = product_reviews.order_id
        and o.user_id = (select auth.uid())
        and o.status = 'delivered'
        and i.product_id = product_reviews.product_id
    )
  );

create policy "Buyers edit their own reviews" on public.product_reviews
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Admin: hide or show a review.
create or replace function private.set_review_hidden_impl(p_review_id uuid, p_hidden boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can hide reviews' using errcode = '42501';
  end if;
  update public.product_reviews set is_hidden = p_hidden where id = p_review_id;
end;
$$;

revoke execute on function private.set_review_hidden_impl(uuid, boolean) from public, anon;
grant execute on function private.set_review_hidden_impl(uuid, boolean) to authenticated;

create or replace function public.set_review_hidden(p_review_id uuid, p_hidden boolean)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.set_review_hidden_impl(p_review_id, p_hidden)
$$;

revoke execute on function public.set_review_hidden(uuid, boolean) from public, anon;
grant execute on function public.set_review_hidden(uuid, boolean) to authenticated;
