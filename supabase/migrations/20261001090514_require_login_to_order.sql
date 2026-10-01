-- Ordering needs a real account: guests (anonymous users) can fill a cart but must log in
-- or register before placing an order. Also keeps the name given at registration.

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
  if v_user_id is null or coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    raise exception 'Please log in to place an order' using errcode = '42501';
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

-- Copy the name given at registration into the profile. The name is display data only;
-- nothing uses user_metadata for access decisions.
create or replace function private.sync_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;
