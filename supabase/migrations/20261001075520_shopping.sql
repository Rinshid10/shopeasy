-- Shoppers: profiles, addresses, carts and orders, plus store settings the checkout reads.
-- Shoppers start as anonymous auth users, so every row here belongs to an auth user.

create table public.store_settings (
  id boolean primary key default true check (id),
  store_name text not null default 'ShopEasy',
  contact_email text not null default '',
  support_phone text not null default '',
  whatsapp_number text not null default '',
  delivery_charge integer not null default 0 check (delivery_charge >= 0),
  -- Orders at or above this subtotal deliver free. 0 means the charge always applies.
  free_delivery_above integer not null default 0 check (free_delivery_above >= 0),
  delivery_days_min integer not null default 4 check (delivery_days_min >= 0),
  delivery_days_max integer not null default 7 check (delivery_days_max >= delivery_days_min),
  is_cod_enabled boolean not null default true,
  -- The largest cash-on-delivery order allowed. 0 means no limit.
  cod_limit integer not null default 0 check (cod_limit >= 0),
  return_window_days integer not null default 7 check (return_window_days >= 0),
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (true);

create trigger store_settings_set_updated_at before update on public.store_settings
  for each row execute function private.set_updated_at();

alter table public.store_settings enable row level security;
grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;

create policy "Anyone can read store settings" on public.store_settings
  for select to anon, authenticated using (true);
create policy "Admins can change store settings" on public.store_settings
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- One row per auth user, created by a trigger.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

create or replace function private.sync_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke execute on function private.sync_profile() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.sync_profile();
create trigger on_auth_user_email_changed after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function private.sync_profile();

alter table public.profiles enable row level security;
grant select, update on public.profiles to authenticated;

create policy "Shoppers read their profile, admins read all" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()));
create policy "Shoppers update their profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  house_number text not null,
  area text not null,
  landmark text not null default '',
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  city text not null,
  state text not null,
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);
create unique index addresses_one_default_per_user on public.addresses (user_id) where is_default;

create trigger addresses_set_updated_at before update on public.addresses
  for each row execute function private.set_updated_at();

alter table public.addresses enable row level security;
grant select, insert, update, delete on public.addresses to authenticated;

create policy "Shoppers read their addresses" on public.addresses
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Shoppers add their addresses" on public.addresses
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Shoppers change their addresses" on public.addresses
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Shoppers remove their addresses" on public.addresses
  for delete to authenticated using ((select auth.uid()) = user_id);

create table public.cart_items (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null check (quantity between 1 and 10),
  added_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index cart_items_product_id_idx on public.cart_items (product_id);

alter table public.cart_items enable row level security;
grant select, insert, update, delete on public.cart_items to authenticated;

create policy "Shoppers read their cart" on public.cart_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Shoppers add to their cart" on public.cart_items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Shoppers change their cart" on public.cart_items
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Shoppers remove from their cart" on public.cart_items
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Orders are only created and cancelled through the functions below, which check prices,
-- stock and ownership. Shoppers can read their own; admins can read and update all.
create table public.orders (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete restrict,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned')),
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'collected', 'refunded')),
  -- The address as it was when the order was placed, in the app's Address shape.
  address jsonb not null,
  subtotal integer not null check (subtotal >= 0),
  delivery_charge integer not null check (delivery_charge >= 0),
  total integer not null check (total >= 0),
  placed_at timestamptz not null default now(),
  cancelled_at timestamptz,
  updated_at timestamptz not null default now()
);

create index orders_user_id_placed_at_idx on public.orders (user_id, placed_at desc);
create index orders_placed_at_idx on public.orders (placed_at desc);

create trigger orders_set_updated_at before update on public.orders
  for each row execute function private.set_updated_at();

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  -- Snapshot of the product as ordered, so catalogue changes don't alter past orders.
  product_slug text not null,
  title text not null,
  image_path text,
  price integer not null check (price >= 0),
  quantity integer not null check (quantity between 1 and 10)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders (id) on delete cascade,
  status text not null
    check (status in ('new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned')),
  note text,
  created_at timestamptz not null default now()
);

create index order_events_order_id_idx on public.order_events (order_id, created_at);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;

grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select, insert on public.order_events to authenticated;

create policy "Shoppers read their orders, admins read all" on public.orders
  for select to authenticated
  using ((select auth.uid()) = user_id or (select private.is_admin()));
create policy "Admins update orders" on public.orders
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Shoppers read their order lines, admins read all" on public.order_items
  for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid())
    )
  );

create policy "Shoppers read their order timeline, admins read all" on public.order_events
  for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid())
    )
  );
create policy "Admins add order events" on public.order_events
  for insert to authenticated with check ((select private.is_admin()));

-- Places an order from the caller's cart, using catalogue prices and stock from the database.
-- Runs with owner rights (shoppers can't insert orders directly), so it lives in the
-- unexposed private schema and checks auth.uid() itself.
create or replace function private.place_order_impl(p_address_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_address public.addresses;
  v_settings public.store_settings;
  v_order_id text;
  v_subtotal integer;
  v_delivery integer;
  v_line_count integer;
  v_short_title text;
begin
  if v_user_id is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  select * into v_address from public.addresses
  where id = p_address_id and user_id = v_user_id;
  if not found then
    raise exception 'Address not found' using errcode = 'P0002';
  end if;

  select * into v_settings from public.store_settings where id;
  if not v_settings.is_cod_enabled then
    raise exception 'Cash on delivery is not available right now' using errcode = 'P0001';
  end if;

  -- Lock the products in the cart so two orders can't oversell the same stock.
  perform 1 from public.products p
  join public.cart_items c on c.product_id = p.id
  where c.user_id = v_user_id
  order by p.id
  for update of p;

  select count(*), coalesce(sum(p.price * c.quantity), 0)
  into v_line_count, v_subtotal
  from public.cart_items c
  join public.products p on p.id = c.product_id and p.status = 'active'
  where c.user_id = v_user_id;

  if v_line_count = 0 then
    raise exception 'Your cart is empty' using errcode = 'P0001';
  end if;

  select p.title into v_short_title
  from public.cart_items c
  join public.products p on p.id = c.product_id and p.status = 'active'
  where c.user_id = v_user_id and p.stock < c.quantity
  limit 1;
  if v_short_title is not null then
    raise exception 'Not enough stock for %', v_short_title using errcode = 'P0001';
  end if;

  v_delivery := case
    when v_settings.free_delivery_above > 0 and v_subtotal >= v_settings.free_delivery_above then 0
    else v_settings.delivery_charge
  end;

  if v_settings.cod_limit > 0 and v_subtotal + v_delivery > v_settings.cod_limit then
    raise exception 'Cash on delivery is available for orders up to ₹%', v_settings.cod_limit
      using errcode = 'P0001';
  end if;

  v_order_id := 'SE' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.orders (id, user_id, address, subtotal, delivery_charge, total)
  values (
    v_order_id,
    v_user_id,
    jsonb_build_object(
      'fullName', v_address.full_name,
      'phone', v_address.phone,
      'houseNumber', v_address.house_number,
      'area', v_address.area,
      'landmark', v_address.landmark,
      'pincode', v_address.pincode,
      'city', v_address.city,
      'state', v_address.state
    ),
    v_subtotal,
    v_delivery,
    v_subtotal + v_delivery
  );

  insert into public.order_items (order_id, product_id, product_slug, title, image_path, price, quantity)
  select v_order_id, p.id, p.slug, p.title, p.image_path, p.price, c.quantity
  from public.cart_items c
  join public.products p on p.id = c.product_id and p.status = 'active'
  where c.user_id = v_user_id
  order by c.added_at;

  update public.products p
  set stock = p.stock - c.quantity
  from public.cart_items c
  where c.user_id = v_user_id and c.product_id = p.id and p.status = 'active';

  insert into public.order_events (order_id, status) values (v_order_id, 'new');

  delete from public.cart_items where user_id = v_user_id;

  return v_order_id;
end;
$$;

revoke execute on function private.place_order_impl(uuid) from public, anon;
grant execute on function private.place_order_impl(uuid) to authenticated;

create or replace function public.place_order(p_address_id uuid)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.place_order_impl(p_address_id)
$$;

revoke execute on function public.place_order(uuid) from public, anon;
grant execute on function public.place_order(uuid) to authenticated;

-- Puts an order's stock back on the shelf. Used when an order is cancelled or returned.
create or replace function private.restock_order(p_order_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.products p
  set stock = p.stock + i.quantity
  from public.order_items i
  where i.order_id = p_order_id and i.product_id = p.id
$$;

revoke execute on function private.restock_order(text) from public, anon, authenticated;

-- Lets a shopper cancel their own order while it hasn't shipped.
create or replace function private.cancel_order_impl(p_order_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  select status into v_status from public.orders
  where id = p_order_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;
  if v_status not in ('new', 'confirmed') then
    raise exception 'This order can no longer be cancelled' using errcode = 'P0001';
  end if;

  update public.orders set status = 'cancelled', cancelled_at = now() where id = p_order_id;
  insert into public.order_events (order_id, status) values (p_order_id, 'cancelled');
  perform private.restock_order(p_order_id);
end;
$$;

revoke execute on function private.cancel_order_impl(text) from public, anon;
grant execute on function private.cancel_order_impl(text) to authenticated;

create or replace function public.cancel_order(p_order_id text)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.cancel_order_impl(p_order_id)
$$;

revoke execute on function public.cancel_order(text) from public, anon;
grant execute on function public.cancel_order(text) to authenticated;

-- Admin: moves an order to a new status, records it on the timeline, and restocks on
-- cancel or return.
create or replace function private.set_order_status_impl(p_order_id text, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old text;
begin
  if not private.is_admin() then
    raise exception 'Only admins can change order status' using errcode = '42501';
  end if;

  select status into v_old from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;
  if v_old = p_status then
    return;
  end if;
  if v_old in ('cancelled', 'returned') then
    raise exception 'A % order can''t be changed', v_old using errcode = 'P0001';
  end if;

  update public.orders
  set status = p_status,
      cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end,
      payment_status = case
        when p_status = 'delivered' then 'collected'
        when p_status = 'returned' and payment_status = 'collected' then 'refunded'
        else payment_status
      end
  where id = p_order_id;

  insert into public.order_events (order_id, status) values (p_order_id, p_status);

  if p_status in ('cancelled', 'returned') then
    perform private.restock_order(p_order_id);
  end if;
end;
$$;

revoke execute on function private.set_order_status_impl(text, text) from public, anon;
grant execute on function private.set_order_status_impl(text, text) to authenticated;

create or replace function public.set_order_status(p_order_id text, p_status text)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.set_order_status_impl(p_order_id, p_status)
$$;

revoke execute on function public.set_order_status(text, text) from public, anon;
grant execute on function public.set_order_status(text, text) to authenticated;
